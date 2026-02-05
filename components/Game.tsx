import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from './Button';
import { GAME_SPEED_START, JUMP_FORCE, GRAVITY } from '../constants';

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

  // Game state refs (to avoid stale closures in requestAnimationFrame)
  const gameState = useRef({
    dinoY: 0,
    dinoVelocity: 0,
    isJumping: false,
    obstacles: [] as { x: number; width: number; height: number }[],
    gameSpeed: GAME_SPEED_START,
    score: 0,
    nextSpawnGap: 0, // Distance to wait before spawning next group
    lastSpeedUpdateScore: 0, // Track when we last increased speed
  });

  const requestRef = useRef<number>(0);

  const resetGame = useCallback(() => {
    gameState.current = {
      dinoY: 0,
      dinoVelocity: 0,
      isJumping: false,
      obstacles: [],
      gameSpeed: GAME_SPEED_START,
      score: 0,
      nextSpawnGap: Math.random() * 200 + 400, // Initial gap
      lastSpeedUpdateScore: 0,
    };
    setScore(0);
    setIsDead(false);
    setIsPlaying(true);
    requestRef.current = requestAnimationFrame(gameLoop);
  }, []);

  const jump = useCallback(() => {
    if (!gameState.current.isJumping && isPlaying) {
      gameState.current.dinoVelocity = -JUMP_FORCE;
      gameState.current.isJumping = true;
    } else if (isDead) {
      resetGame();
    }
  }, [isPlaying, isDead, resetGame]);

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

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const state = gameState.current;
    
    // --- 1. Physics Update ---
    state.dinoVelocity += GRAVITY;
    state.dinoY += state.dinoVelocity;

    const groundY = canvas.height - 50;
    if (state.dinoY > groundY - 40) { // 40 is dino height
      state.dinoY = groundY - 40;
      state.dinoVelocity = 0;
      state.isJumping = false;
    }

    // --- 2. Spawning Logic (Groups & Gaps) ---
    // Calculate distance from the right edge to the last obstacle
    let gapToLastObstacle = canvas.width;
    if (state.obstacles.length > 0) {
      const lastObs = state.obstacles[state.obstacles.length - 1];
      gapToLastObstacle = canvas.width - (lastObs.x + lastObs.width);
    }

    // Spawn if the gap is large enough
    if (gapToLastObstacle > state.nextSpawnGap) {
      // Determine group size based on score difficulty
      let groupSize = 1;
      if (state.score > 500 && Math.random() > 0.5) groupSize = 2;
      if (state.score > 1000 && Math.random() > 0.7) groupSize = 3;

      const obsWidth = 30 + Math.random() * 10;
      const obsHeight = 30 + Math.random() * 20;

      for (let i = 0; i < groupSize; i++) {
        state.obstacles.push({
          x: canvas.width + (i * (obsWidth + 5)), // 5px gap between members of a group
          width: obsWidth,
          height: obsHeight,
        });
      }

      // Calculate next gap
      // Minimum gap must increase with speed to remain jumpable
      // (Speed * 20) ensures roughly 20 frames of clearance at current speed
      const minGap = 250 + (state.gameSpeed * 15); 
      const maxGap = 500 + (state.gameSpeed * 25);
      state.nextSpawnGap = minGap + Math.random() * (maxGap - minGap);
    }

    // --- 3. Update Obstacles ---
    state.obstacles.forEach((obs) => {
      obs.x -= state.gameSpeed;
    });

    // Remove off-screen obstacles
    state.obstacles = state.obstacles.filter(obs => obs.x + obs.width > -100);

    // --- 4. Score & Speed Progression ---
    // Score increases based on distance traveled (speed)
    state.score += 0.05 * state.gameSpeed;
    setScore(Math.floor(state.score));

    // Increase speed every 100 points
    if (Math.floor(state.score) > state.lastSpeedUpdateScore + 100) {
      state.gameSpeed += 0.5;
      state.lastSpeedUpdateScore = Math.floor(state.score);
      // Cap max speed
      if (state.gameSpeed > 15) state.gameSpeed = 15;
    }

    // --- 5. Collision Detection ---
    const dinoHitbox = { 
      x: 50 + 5, // padding
      y: state.dinoY + 5, 
      w: 40 - 10, 
      h: 40 - 10 
    };
    
    let collision = false;
    state.obstacles.forEach(obs => {
      if (
        dinoHitbox.x < obs.x + obs.width &&
        dinoHitbox.x + dinoHitbox.w > obs.x &&
        dinoHitbox.y < groundY && 
        dinoHitbox.y + dinoHitbox.h > groundY - obs.height
      ) {
        collision = true;
      }
    });

    // --- 6. Drawing ---
    
    // Draw Ground
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(canvas.width, groundY);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw Dino
    ctx.fillStyle = '#3898EC'; // SUI Blue
    ctx.fillRect(50, state.dinoY, 40, 40);
    // Eye
    ctx.fillStyle = '#fff';
    ctx.fillRect(75, state.dinoY + 5, 8, 8);

    // Draw Obstacles
    ctx.fillStyle = '#22c55e'; // Green
    state.obstacles.forEach(obs => {
      ctx.fillRect(obs.x, groundY - obs.height, obs.width, obs.height);
    });

    if (collision) {
      setIsPlaying(false);
      setIsDead(true);
      onGameOver(Math.floor(state.score));
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    } else {
      requestRef.current = requestAnimationFrame(gameLoop);
    }

  }, [onGameOver]);

  useEffect(() => {
    // Initial draw for instructions
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx && !isPlaying && !isDead) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = '20px "Press Start 2P"';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.fillText('PRESS SPACE TO START', canvas.width / 2, canvas.height / 2);
    }
  }, [isPlaying, isDead]);

  // Responsive Canvas
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = 300;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="flex justify-between w-full max-w-4xl px-4 items-end">
        <h2 className="text-xl font-pixel text-sui-400">SCORE: {score.toString().padStart(5, '0')}</h2>
      </div>
      
      <div 
        ref={containerRef}
        className="w-full max-w-4xl h-[300px] bg-slate-800 rounded-xl border-4 border-slate-700 shadow-2xl relative overflow-hidden"
        onClick={jump}
      >
        <canvas ref={canvasRef} className="block w-full h-full" />
        
        {isDead && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in">
            <h3 className="text-3xl font-pixel text-red-500 mb-4">GAME OVER</h3>
            <p className="text-slate-300 mb-6">You ran {Math.floor(score)}m</p>
            <Button variant="pixel" onClick={resetGame}>TRY AGAIN</Button>
          </div>
        )}

        {!isPlaying && !isDead && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-transparent transition-colors cursor-pointer" onClick={resetGame}>
               {/* Overlay is handled by canvas text mostly, but this catches clicks */}
            </div>
        )}
      </div>
      
      <p className="text-slate-500 text-sm font-mono mt-2">Spacebar or Tap to Jump</p>
    </div>
  );
};