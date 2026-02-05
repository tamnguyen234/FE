import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Button } from './Button';

interface GameProps {
  onGameOver: (score: number) => void;
  userSkin: string;
}

export const Game: React.FC<GameProps> = ({ onGameOver, userSkin }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [isDead, setIsDead] = useState(false);

  // --- THÔNG SỐ VẬT LÝ & SPRITE ---
  const INITIAL_SPEED = 2.5;
  const GRAVITY = 0.8;      // Trọng lực mạnh giúp rơi nhanh
  const JUMP_FORCE = 13.5;  // Lực nhảy mạnh để bật lên dứt khoát
  
  // Tọa độ Cactus trong file sprite của bạn (Cần điều chỉnh cho khớp chính xác pixel)
  const CACTUS_SPRITE = {
    x: 228,   // Vị trí X bắt đầu của cụm xương rồng trong ảnh
    y: 2,     // Vị trí Y
    w: 17,    // Chiều rộng một cây đơn (ước tính)
    h: 35     // Chiều cao
  };

  const spriteImg = useMemo(() => {
    const img = new Image();
    img.src = '/assets/offline-sprite-1x.png'; // Đường dẫn file bạn vừa gửi
    return img;
  }, []);

  const gameState = useRef({
    dinoY: 0,
    dinoVelocity: 0,
    isJumping: false,
    obstacles: [] as { x: number; width: number; height: number }[],
    gameSpeed: INITIAL_SPEED,
    score: 0,
    nextSpawnGap: 0,
  });

  const requestRef = useRef<number>(0);

  const resetGame = useCallback(() => {
    gameState.current = {
      dinoY: 0,
      dinoVelocity: 0,
      isJumping: false,
      obstacles: [],
      gameSpeed: INITIAL_SPEED,
      score: 0,
      nextSpawnGap: 400,
    };
    setScore(0);
    setIsDead(false);
    setIsPlaying(true);
  }, [INITIAL_SPEED]);

  const jump = useCallback(() => {
    if (!gameState.current.isJumping && isPlaying) {
      gameState.current.dinoVelocity = -JUMP_FORCE;
      gameState.current.isJumping = true;
    } else if (isDead || (!isPlaying && !isDead)) {
      resetGame();
    }
  }, [isPlaying, isDead, resetGame, JUMP_FORCE]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump]);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const state = gameState.current;
    const groundY = canvas.height - 50;

    // --- 1. Cập nhật vật lý (Rơi nhanh) ---
    state.dinoVelocity += GRAVITY;
    state.dinoY += state.dinoVelocity;

    if (state.dinoY > groundY - 40) {
      state.dinoY = groundY - 40;
      state.dinoVelocity = 0;
      state.isJumping = false;
    }

    // --- 2. Tạo vật cản ---
    let gapToLastObstacle = canvas.width;
    if (state.obstacles.length > 0) {
      const lastObs = state.obstacles[state.obstacles.length - 1];
      gapToLastObstacle = canvas.width - (lastObs.x + lastObs.width);
    }

    if (gapToLastObstacle > state.nextSpawnGap) {
      state.obstacles.push({
        x: canvas.width,
        width: 25,
        height: 40,
      });
      state.nextSpawnGap = 200 + (state.gameSpeed * 10) + Math.random() * 300;
    }

    // --- 3. Cập nhật vị trí ---
    state.obstacles.forEach((obs) => { obs.x -= state.gameSpeed; });
    state.obstacles = state.obstacles.filter(obs => obs.x + obs.width > -50);
    state.score += 0.05 * state.gameSpeed;
    setScore(Math.floor(state.score));
    state.gameSpeed = Math.min(INITIAL_SPEED + (state.score / 1500), 12);

    // --- 4. Kiểm tra va chạm (GIẢM HITBOX) ---
    const dinoHitbox = { x: 58, y: state.dinoY + 8, w: 22, h: 25 };
    let collision = false;

    state.obstacles.forEach(obs => {
      // Hitbox của xương rồng thu nhỏ đáng kể (chỉ lấy phần lõi)
      const obsHitbox = {
        x: obs.x + 8,
        y: groundY - obs.height + 5,
        w: obs.width - 16,
        h: obs.height - 5
      };

      if (
        dinoHitbox.x < obsHitbox.x + obsHitbox.w &&
        dinoHitbox.x + dinoHitbox.w > obsHitbox.x &&
        dinoHitbox.y < obsHitbox.y + obsHitbox.h &&
        dinoHitbox.y + dinoHitbox.h > obsHitbox.y
      ) {
        collision = true;
      }
    });

    // --- 5. Vẽ (Sử dụng kỹ thuật cắt Sprite) ---
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Vẽ mặt đất
    ctx.strokeStyle = '#555';
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(canvas.width, groundY);
    ctx.stroke();

    // Vẽ Dino (Cũng cắt từ Sprite - ví dụ tọa độ x:76, y:2, w:44, h:47)
    if (spriteImg.complete) {
      ctx.drawImage(spriteImg, 76, 2, 44, 47, 50, state.dinoY, 40, 40);
    }

    // Vẽ Xương rồng (Cắt từ Sprite)
    state.obstacles.forEach(obs => {
      if (spriteImg.complete) {
        // Cú pháp: drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
        // s = source (ảnh gốc), d = destination (trên canvas)
        ctx.drawImage(
          spriteImg, 
          CACTUS_SPRITE.x, CACTUS_SPRITE.y, CACTUS_SPRITE.w, CACTUS_SPRITE.h, 
          obs.x, groundY - obs.height, obs.width, obs.height
        );
      }
    });

    if (collision) {
      setIsPlaying(false);
      setIsDead(true);
      onGameOver(Math.floor(state.score));
    } else {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
  }, [onGameOver, spriteImg, INITIAL_SPEED, GRAVITY, JUMP_FORCE]);

  useEffect(() => {
    if (isPlaying && !isDead) requestRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [isPlaying, isDead, gameLoop]);

  useEffect(() => {
    if (containerRef.current && canvasRef.current) {
      canvasRef.current.width = containerRef.current.clientWidth;
      canvasRef.current.height = 300;
    }
  }, []);

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="font-mono text-slate-500">HI SCORE: {score.toString().padStart(5, '0')}</div>
      <div 
        ref={containerRef} 
        className="w-full max-w-4xl h-[300px] bg-white border-b-2 border-slate-300 relative overflow-hidden cursor-pointer" 
        onClick={jump}
      >
        <canvas ref={canvasRef} className="block w-full h-full" />
        {isDead && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50">
            <div className="text-2xl font-pixel text-slate-700 mb-4">G A M E  O V E R</div>
            <Button variant="pixel" onClick={(e) => { e.stopPropagation(); resetGame(); }}>RETRY</Button>
          </div>
        )}
      </div>
    </div>
  );
};