
import React, { useState } from 'react';
import { Shield, Fingerprint, Zap, ShieldCheck, ShieldAlert, Loader2, Globe } from 'lucide-react';
import HarveyAvatar from './HarveyAvatar';
import { useFirebase } from './FirebaseProvider';

interface AuthPortalProps {
  onAuthenticated: (user?: any) => void;
  onClose: () => void;
}

const AuthPortal: React.FC<AuthPortalProps> = ({ onAuthenticated, onClose }) => {
  const { signIn } = useFirebase();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      await signIn();
      onAuthenticated();
    } catch (err: any) {
      console.error("Auth Error:", err);
      setError(err.message || "Authentication failed. Check your connection.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-950 flex items-center justify-center p-4 md:p-10 animate-fade-in font-sans">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] border border-gold-main/10 rounded-full animate-[spin_120s_linear_infinite]"></div>
        <div className="absolute inset-0 sonar-grid"></div>
      </div>

      <div className="w-full max-w-xl bg-slate-900 border-2 border-white/5 rounded-[3.5rem] shadow-3xl overflow-hidden relative group">
        <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
           <div className={`h-full bg-gold-main transition-all duration-300 shadow-gold`} style={{ width: isProcessing ? '100%' : '0%' }}></div>
        </div>

        <div className="p-8 md:p-14 space-y-10 relative z-10">
          {/* Header */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative">
                <div className="absolute inset-0 bg-gold-main/20 blur-3xl animate-pulse rounded-full"></div>
                <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-950 border-2 border-gold-main/30 rounded-[2rem] flex items-center justify-center shadow-gold relative z-10">
                  <HarveyAvatar size="sm" isTalking={isProcessing} />
                </div>
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl font-serif font-bold text-white italic tracking-tighter uppercase">Identity <span className="text-gold-main not-italic">Sync</span></h2>
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">Secure Sanctuary Protocol v4.0</p>
            </div>
          </div>

          {/* Mode Switcher - Simplified for Commercial Auth */}
          <div className="flex bg-slate-950/60 p-1.5 rounded-2xl border border-white/5">
            <div className="flex-1 flex items-center justify-center gap-2 py-4 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest bg-gold-main text-slate-950 shadow-gold">
              <Shield size={14} />
              <span>Secure Neural Sync</span>
            </div>
          </div>

          {/* Dynamic Content */}
          <div className="min-h-[200px] flex flex-col justify-center">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 animate-shake">
                <ShieldAlert size={18} />
                <p className="text-[10px] font-bold uppercase tracking-widest">{error}</p>
              </div>
            )}

            <div className="space-y-8 animate-slide-up">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-serif font-bold text-white italic tracking-tight">Establish Identity Link</h3>
                <p className="text-slate-400 text-xs font-light leading-relaxed max-w-sm mx-auto">
                  Synchronize your clinical profile with the Acoustic Matrix. Secure Google Authentication required for persistent neural tracking.
                </p>
              </div>

              <button 
                onClick={handleGoogleSignIn}
                disabled={isProcessing}
                className="w-full py-5 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] hover:bg-gold-main transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50 group"
              >
                {isProcessing ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <Globe size={18} className="group-hover:rotate-12 transition-transform" />
                    Sync with Google
                  </>
                )}
              </button>

              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-white/5"></div>
                <span className="text-[8px] font-black text-white/10 uppercase tracking-widest">Encrypted Protocol</span>
                <div className="h-px flex-1 bg-white/5"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Footer */}
        <div className="px-10 py-6 bg-slate-950 border-t border-white/5 flex justify-between items-center relative z-10">
           <div className="flex items-center gap-3">
              <ShieldCheck size={14} className="text-green-500/40" />
              <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">End-to-End Encryption: ACTIVE</span>
           </div>
           <button onClick={onClose} className="text-[8px] font-black text-white/20 hover:text-white uppercase tracking-widest transition-colors">Abort Access</button>
        </div>
      </div>
    </div>
  );
};

export default AuthPortal;
