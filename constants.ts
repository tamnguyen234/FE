import { ShopItem, User } from './types';

export const MOCK_USER: User = {
  id: 'u_123',
  username: 'SuiRunner99',
  email: 'runner@sui.io',
  balanceSUI: 145.5,
  balanceDinoCoin: 2500,
  highScore: 1250,
  equippedSkin: 'default',
  inventory: ['default'],
  walletAddress: undefined, // Simulates not connected
};

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'skin_cyber',
    name: 'Cyber Dino',
    type: 'SKIN',
    price: 500,
    currency: 'DINO',
    image: 'https://picsum.photos/200/200?random=1',
    description: 'A futuristic cybernetic look for your runner.',
    owned: false,
  },
  {
    id: 'skin_gold',
    name: 'Golden Rex',
    type: 'SKIN',
    price: 10,
    currency: 'SUI',
    image: 'https://picsum.photos/200/200?random=2',
    description: 'Show off your wealth with this solid gold skin.',
    owned: false,
  },
  {
    id: 'coins_pack_small',
    name: '100 DinoCoins',
    type: 'CURRENCY',
    price: 0.5,
    currency: 'SUI',
    image: 'https://picsum.photos/200/200?random=3',
    description: 'A small pouch of coins to get you started.',
    owned: false,
  },
  {
    id: 'coins_pack_large',
    name: '1000 DinoCoins',
    type: 'CURRENCY',
    price: 4,
    currency: 'SUI',
    image: 'https://picsum.photos/200/200?random=4',
    description: 'A large chest of coins for the serious spender.',
    owned: false,
  }
];

export const GAME_SPEED_START = 5;
export const JUMP_FORCE = 12;
export const GRAVITY = 0.6;