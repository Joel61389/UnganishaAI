import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  Inbox, 
  User, 
  BarChart3, 
  LogOut,
  Infinity,
  Wallet,
  Coins
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, walletAddress, usdcBalance, connectWallet } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Chat Onboarding', path: '/chat', icon: MessageSquare },
    { name: 'Matches', path: '/matches', icon: Users },
    { name: 'Introductions', path: '/introductions', icon: Inbox },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex flex-col w-64 glass-panel border-r border-slate-800 animate-fade-in">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 h-20 border-b border-slate-800">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-accent-500 shadow-lg shadow-brand-500/20">
          <Infinity className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white leading-none">Unganisha AI</h1>
          <span className="text-[10px] text-brand-400 font-semibold tracking-wider uppercase">Kenyan Matchmaker</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30' 
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-brand-400' : 'text-slate-400'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Web3 Wallet Metrics Panel */}
      <div className="px-4 py-3.5 mx-4 my-2 rounded-xl bg-slate-900/30 border border-slate-800/80 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Network</span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Fuji Testnet
          </span>
        </div>
        
        {walletAddress ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1 font-medium">
                <Wallet className="w-3.5 h-3.5 text-brand-400" />
                Wallet
              </span>
              <span className="font-mono text-slate-300 text-[11px] select-all" title={walletAddress}>
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1 font-medium">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                USDC Balance
              </span>
              <span className="font-bold text-white">
                {usdcBalance}
              </span>
            </div>
          </div>
        ) : (
          <button
            onClick={() => connectWallet()}
            className="w-full py-2 text-center text-xs font-semibold text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 hover:border-brand-500/30 rounded-lg transition-all cursor-pointer"
          >
            Connect Fuji Wallet
          </button>
        )}
      </div>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 p-3 mb-3 rounded-xl bg-slate-900/60 border border-slate-800/40">
          <div className="flex items-center justify-center w-10 h-10 font-bold text-white rounded-lg bg-gradient-to-tr from-brand-600 to-accent-600">
            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
            <p className="text-xs text-brand-400 font-medium truncate capitalize">{user.role}</p>
          </div>
        </div>
        
        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all duration-200 border border-transparent hover:border-rose-500/20"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
