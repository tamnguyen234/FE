import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Auth } from './components/Auth';
import { Game } from './components/Game';
import { Shop } from './components/Shop';
import { Profile } from './components/Profile';
import { View, User, ShopItem } from './types';

function App() {
  const [currentView, setCurrentView] = useState<View>(View.AUTH);
  const [user, setUser] = useState<User | null>(null);

  // Helper to change view
  const handleViewChange = (view: View) => {
    setCurrentView(view);
  };

  // Auth Handler
  const handleLogin = (userData: User) => {
    setUser(userData);
    setCurrentView(View.HOME);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView(View.AUTH);
  };

  const handleConnectWallet = () => {
    // Mock wallet connection
    if (user) {
      const updatedUser = { ...user, walletAddress: '0x123...abc' };
      setUser(updatedUser);
      alert('Wallet Connected Successfully!');
    }
  };

  const handleBuyItem = (item: ShopItem) => {
    if (!user) return;
    
    // Simple mock logic for purchase
    if (item.currency === 'SUI' && user.balanceSUI >= item.price) {
      setUser({
        ...user,
        balanceSUI: user.balanceSUI - item.price,
        inventory: [...user.inventory, item.id]
      });
      alert(`Bought ${item.name}!`);
    } else if (item.currency === 'DINO' && user.balanceDinoCoin >= item.price) {
      setUser({
        ...user,
        balanceDinoCoin: user.balanceDinoCoin - item.price,
        inventory: [...user.inventory, item.id]
      });
      alert(`Bought ${item.name}!`);
    } else {
      alert('Insufficient funds!');
    }
  };

  const handleGameOver = (score: number) => {
    if (user && score > user.highScore) {
      setUser({ ...user, highScore: score });
    }
  };

  // Render content based on view
  const renderContent = () => {
    if (!user) return <Auth onLogin={handleLogin} />;

    switch (currentView) {
      case View.HOME:
        return (
          <div className="flex-1 flex items-center justify-center p-4 bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 to-slate-900">
            <Game onGameOver={handleGameOver} userSkin={user.equippedSkin} />
          </div>
        );
      case View.SHOP:
        return <Shop user={user} onBuy={handleBuyItem} />;
      case View.PROFILE:
        return <Profile user={user} onLogout={handleLogout} onConnectWallet={handleConnectWallet} onChangeView={handleViewChange} />;
      default:
        return <div className="p-10 text-center">Page Not Found</div>;
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      onChangeView={handleViewChange} 
      user={user || undefined}
    >
      {renderContent()}
    </Layout>
  );
}

export default App;