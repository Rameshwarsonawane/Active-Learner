'use client';
import React from 'react';
import { User, ViewPath } from '../lib/types';
import "./globals.css";
export const Navbar: React.FC<{ 
  user: User | null; 
  onLogout: () => void; 
  onNavigate: (path: ViewPath) => void 
}> = ({ user, onLogout, onNavigate }) => {
  const handleLogoutWithConfirm = () => {
    if (window.confirm("Sign out of your account?")) {
      onLogout();
    }
  };

  return (
    <nav className="h-16 border-b border-[#586e75]/30 bg-[#073642]/80 backdrop-blur sticky top-0 z-50 px-6 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => onNavigate('dashboard')}
        >
          <div className="bg-[#268bd2] w-8 h-8 rounded-lg flex items-center justify-center text-[#eee8d5] shadow-lg shadow-[#268bd2]/20">
            <i className="fa-solid fa-graduation-cap text-sm"></i>
          </div>
          <span className="font-bold text-[#eee8d5] tracking-tight">Active Learner</span>
        </div>
        
        {user && (
          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => onNavigate('dashboard')} 
              className="text-[10px] font-black uppercase tracking-widest text-[#586e75] hover:text-[#eee8d5] transition-colors"
            >
              Dashboard
            </button>
            <button 
              onClick={() => onNavigate('courses-list')} 
              className="text-[10px] font-black uppercase tracking-widest text-[#586e75] hover:text-[#eee8d5] transition-colors"
            >
              Coutrse
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        {user ? (
          <>
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] font-black text-[#eee8d5] uppercase tracking-widest leading-none mb-1">{user.name}</span>
              <span className="text-[8px] font-bold text-[#586e75] uppercase tracking-tighter">Verified Learner</span>
            </div>
            <button 
              onClick={handleLogoutWithConfirm} 
              className="w-10 h-10 rounded-full bg-[#002b36] border border-[#586e75]/30 flex items-center justify-center text-[#586e75] hover:text-[#dc322f] hover:border-[#dc322f]/50 transition-all"
              title="Logout"
            >
              <i className="fa-solid fa-right-from-bracket text-xs"></i>
            </button>
          </>
        ) : (
          <button 
            onClick={() => onNavigate('login')} 
            className="text-sm font-black uppercase tracking-widest text-[#eee8d5] hover:text-[#268bd2] transition-colors"
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
};
