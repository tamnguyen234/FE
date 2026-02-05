import React from 'react';
import { ShopItem, User } from '../types';
import { SHOP_ITEMS } from '../constants';
import { Button } from './Button';
import { ShoppingBag, Coins, Zap } from 'lucide-react';

interface ShopProps {
  user: User;
  onBuy: (item: ShopItem) => void;
}

export const Shop: React.FC<ShopProps> = ({ user, onBuy }) => {
  return (
    <div className="w-full max-w-6xl mx-auto p-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
           <h2 className="text-3xl font-pixel text-white mb-2">MARKETPLACE</h2>
           <p className="text-slate-400">Upgrade your runner or top up your wallet.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-sui-500"></div>
            <span className="font-mono text-sui-400">{user.balanceSUI} SUI</span>
          </div>
          <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-2">
             <Coins className="w-4 h-4 text-yellow-500" />
            <span className="font-mono text-yellow-500">{user.balanceDinoCoin} DC</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {SHOP_ITEMS.map((item) => (
          <div 
            key={item.id} 
            className="group bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:border-sui-500 transition-all hover:shadow-lg hover:shadow-sui-500/10 flex flex-col"
          >
            <div className="relative h-48 overflow-hidden bg-slate-900">
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100"
              />
              <div className="absolute top-2 right-2 bg-slate-900/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-white uppercase border border-slate-700">
                {item.type}
              </div>
            </div>
            
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-white mb-1">{item.name}</h3>
              <p className="text-sm text-slate-400 mb-4 flex-1">{item.description}</p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-700">
                <div className="flex items-center gap-1 font-mono font-bold">
                  {item.currency === 'SUI' ? (
                    <span className="text-sui-400">SUI</span>
                  ) : (
                    <Coins className="w-4 h-4 text-yellow-500" />
                  )}
                  <span className={item.currency === 'SUI' ? 'text-sui-400' : 'text-yellow-500'}>
                    {item.price}
                  </span>
                </div>
                
                <Button size="sm" variant={item.owned ? 'secondary' : 'primary'} disabled={item.owned} onClick={() => onBuy(item)}>
                  {item.owned ? 'OWNED' : 'BUY'}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};