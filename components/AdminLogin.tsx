
import React, { useState } from 'react';
import { Shield, Lock, User, X, Loader2, ArrowRight, Cpu, Zap } from 'lucide-react';

interface AdminLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (success: boolean) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ isOpen, onClose, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [keyState, setKeyState] = useState<'idle' | 'detecting' | 'verified'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setKeyState('detecting');

    // Simulated admin check + hardware key simulation
    setTimeout(() => {
      if (username === 'admin' && password === 'echo2025') {
        setKeyState('verified');
        setTimeout(() => {
            onLogin(true);
            onClose();
        }, 800);
      } else {
        setError('Authorization failed. Invalid credentials or Hardware Key mismatch.');
        setIsLoading(false);
        setKeyState('idle');
      }
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gold-main/20">
          <div className={`h-full bg-gold-main transition-all duration-1000 ${isLoading ? 'w-full' : 'w-0'}`}></div>
        </div>
        
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-white/20 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <div className="p-10 space-y-8">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border transition-all duration-700 ${keyState === 'verified' ? 'bg-green-500/20 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.5)]' : 'bg-gold-main/10 border-gold-main/30 shadow-gold'}`}>
              <Shield className={`w-8 h-8 ${keyState === 'verified' ? 'text-green-500' : 'text-gold-main'}`} />
            </div>
            <h2 className="text-2xl font-serif font-bold text-white tracking-tight">Faculty Vault</h2>
            <p className="text-[10px] text-white/40 uppercase tracking-[0.4em] font-black">Authorized Units Only</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gold-main uppercase tracking-widest ml-1">Admin ID</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-gold-main transition-colors" />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-gold-main/40 transition-all"
                  placeholder="Personnel ID"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gold-main uppercase tracking-widest ml-1">Logic Pattern</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-gold-main transition-colors" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-gold-main/40 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Hardware Key Mock */}
            <div className={`p-4 rounded-xl border transition-all duration-500 flex items-center justify-between ${keyState === 'detecting' ? 'bg-gold-main/10 border-gold-main/40 animate-pulse' : keyState === 'verified' ? 'bg-green-500/10 border-green-500/40' : 'bg-white/5 border-white/10'}`}>
                <div className="flex items-center gap-3">
                   <Cpu size={16} className={keyState === 'detecting' ? 'text-gold-main' : keyState === 'verified' ? 'text-green-500' : 'text-white/20'} />
                   <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Hardware Key</span>
                </div>
                <span className={`text-[8px] font-mono ${keyState === 'detecting' ? 'text-gold-main' : keyState === 'verified' ? 'text-green-500' : 'text-white/10'}`}>
                   {keyState === 'detecting' ? 'DETECTING...' : keyState === 'verified' ? 'VERIFIED_UNIT_7' : 'NOT_DETECTED'}
                </span>
            </div>

            {error && (
              <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest text-center animate-pulse">{error}</p>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-4.5 bg-gold-main text-slate-900 rounded-xl font-black uppercase text-[11px] tracking-[0.2em] shadow-gold hover:shadow-soft transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <>Access Matrix <Zap size={14} fill="currentColor" /></>}
            </button>
          </form>
        </div>

        <div className="px-10 py-6 bg-white/5 border-t border-white/5 flex justify-center">
          <div className="flex gap-2 items-center opacity-40">
            <div className="w-1.5 h-1.5 rounded-full bg-gold-main animate-ping"></div>
            <span className="text-[8px] font-black uppercase tracking-widest text-white">Quantum Session: ISOLATED</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
