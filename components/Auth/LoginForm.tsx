
"use client";

import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient.ts';

type AuthMode = 'login' | 'register';

export const LoginForm: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'register') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name: name || email.split('@')[0] }
          }
        });
        if (signUpError) throw signUpError;
        // Supabase usually triggers a success message even if email confirmation is required
        alert("Verify your email");
        setMode('login');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (signInError) throw signInError;
      }
    } catch (err: any) {
      setError(err.message || "An authentication error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#268bd2] rounded-2xl text-[#eee8d5] mb-6 shadow-xl shadow-[#268bd2]/20">
            <i className="fa-solid fa-graduation-cap text-2xl"></i>
          </div>
          <h1 className="text-3xl font-black text-[#eee8d5] tracking-tight">
            {mode === 'login' ? 'Welcome Back' : 'Login to Learn'}
          </h1>
          <p className="text-sm text-[#586e75] mt-2 font-medium">
            {mode === 'login' 
              ? 'Sign in to access your dashboard' 
              : 'Create your profile'
            }
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#dc322f]/10 border border-[#dc322f]/30 rounded-xl text-[#dc322f] text-xs font-bold animate-in fade-in zoom-in duration-200">
            <i className="fa-solid fa-circle-exclamation mr-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <label className="block text-[10px] font-black text-[#586e75] uppercase tracking-widest mb-2">your Name</label>
              <input 
                type="text" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-4 bg-[#073642] border border-[#586e75]/30 rounded-xl text-[#eee8d5] focus:outline-none focus:border-[#268bd2] transition-all placeholder-[#586e75]/50"
                placeholder="example -Rameshwar"
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black text-[#586e75] uppercase tracking-widest mb-2">Email Address</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 bg-[#073642] border border-[#586e75]/30 rounded-xl text-[#eee8d5] focus:outline-none focus:border-[#268bd2] transition-all placeholder-[#586e75]/50"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-[#586e75] uppercase tracking-widest mb-2">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-[#073642] border border-[#586e75]/30 rounded-xl text-[#eee8d5] focus:outline-none focus:border-[#268bd2] transition-all placeholder-[#586e75]/50"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#268bd2] text-[#eee8d5] py-4 rounded-xl font-black uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-[#268bd2]/10 mt-4"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <i className="fa-solid fa-circle-notch animate-spin"></i>
                Processing...
              </span>
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-[#586e75]/10 text-center">
          <p className="text-sm text-[#586e75] font-medium">
            {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
            <button 
              type="button"
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}
              className="ml-2 font-black text-[#268bd2] hover:text-[#eee8d5] transition-colors"
            >
              {mode === 'login' ? 'Create one now' : 'Sign in here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
