import React, { useState } from 'react';
import { User, View } from '../types';
import { Button } from './Button';
import { User as UserIcon, Wallet, Settings, LogOut, Shield, ChevronRight } from 'lucide-react';

interface ProfileProps {
  user: User;
  onLogout: () => void;
  onConnectWallet: () => void;
  onChangeView: (view: View) => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onLogout, onConnectWallet, onChangeView }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SETTINGS'>('OVERVIEW');

  return (
    <div className="w-full max-w-4xl mx-auto p-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Sidebar */}
        <div className="md:col-span-4 space-y-4">
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 text-center">
            <div className="w-24 h-24 bg-slate-700 rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-sui-500">
              <UserIcon className="w-12 h-12 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-white">{user.username}</h2>
            <p className="text-sm text-slate-400 mb-6">{user.email}</p>
            
            {user.walletAddress ? (
              <div className="bg-sui-500/10 border border-sui-500/50 rounded-lg p-2 text-xs font-mono text-sui-300 break-all">
                {user.walletAddress}
              </div>
            ) : (
              <Button variant="primary" fullWidth onClick={onConnectWallet} className="mb-2">
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            )}
          </div>

          <div className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700">
            <button 
              onClick={() => setActiveTab('OVERVIEW')}
              className={`w-full text-left px-6 py-4 flex items-center justify-between transition-colors ${activeTab === 'OVERVIEW' ? 'bg-slate-700/50 text-sui-400 border-l-4 border-sui-500' : 'text-slate-400 hover:bg-slate-700/30'}`}
            >
              <div className="flex items-center gap-3">
                <UserIcon className="w-5 h-5" />
                <span className="font-semibold">Full Profile</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>
            
            <button 
              onClick={() => setActiveTab('SETTINGS')}
              className={`w-full text-left px-6 py-4 flex items-center justify-between transition-colors ${activeTab === 'SETTINGS' ? 'bg-slate-700/50 text-sui-400 border-l-4 border-sui-500' : 'text-slate-400 hover:bg-slate-700/30'}`}
            >
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5" />
                <span className="font-semibold">Settings</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>
            
            <button 
              onClick={onLogout}
              className="w-full text-left px-6 py-4 flex items-center justify-between text-red-400 hover:bg-red-500/10 transition-colors border-t border-slate-700"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5" />
                <span className="font-semibold">Log Out</span>
              </div>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="md:col-span-8">
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                  <p className="text-slate-400 text-sm mb-1">High Score</p>
                  <p className="text-3xl font-pixel text-white">{user.highScore}</p>
                </div>
                 <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                  <p className="text-slate-400 text-sm mb-1">Total Runs</p>
                  <p className="text-3xl font-pixel text-white">42</p>
                </div>
              </div>

              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <h3 className="text-lg font-bold text-white mb-6">Inventory</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="aspect-square bg-slate-900 rounded-lg border-2 border-sui-500 flex items-center justify-center relative">
                     <span className="text-xs text-sui-400 font-pixel">DEFAULT</span>
                     <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  {[1, 2, 3].map(i => (
                    <div key={i} className="aspect-square bg-slate-900 rounded-lg border border-slate-700 flex items-center justify-center opacity-50">
                      <Shield className="w-8 h-8 text-slate-600" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'SETTINGS' && (
             <div className="bg-slate-800 rounded-xl border border-slate-700 p-8">
               <h3 className="text-xl font-bold text-white mb-6">Game Settings</h3>
               
               <div className="space-y-6">
                 <div className="flex items-center justify-between pb-6 border-b border-slate-700">
                   <div>
                     <p className="font-semibold text-white">Music & SFX</p>
                     <p className="text-sm text-slate-400">Enable in-game sound effects</p>
                   </div>
                   <div className="w-12 h-6 bg-sui-500 rounded-full relative cursor-pointer">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                   </div>
                 </div>

                 <div className="flex items-center justify-between pb-6 border-b border-slate-700">
                   <div>
                     <p className="font-semibold text-white">High Contrast Mode</p>
                     <p className="text-sm text-slate-400">Better visibility for obstacles</p>
                   </div>
                   <div className="w-12 h-6 bg-slate-600 rounded-full relative cursor-pointer">
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                   </div>
                 </div>
                 
                 <div className="pt-2">
                    <p className="font-semibold text-white mb-2">Delete Account</p>
                    <p className="text-sm text-slate-400 mb-4">Permanently remove all your data and game progress.</p>
                    <Button variant="danger" size="sm">Delete Account</Button>
                 </div>
               </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};