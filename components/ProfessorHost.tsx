
import React, { useState, useEffect } from 'react';
import { Bot, Zap, MessageSquare, Sparkles, Activity } from 'lucide-react';
import HarveyAvatar from './HarveyAvatar';

interface ProfessorHostProps {
  position?: { x: number; y: number };
  isActive: boolean;
  isThinking?: boolean;
  isSpeaking?: boolean;
  message?: string;
  onClick?: () => void;
  userName?: string;
}

const ProfessorHost: React.FC<ProfessorHostProps> = ({ 
  position = { x: 50, y: 50 }, 
  isActive, 
  isThinking, 
  isSpeaking, 
  message, 
  onClick,
  userName
}) => {
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  const safeX = position?.x ?? 50;
  const safeY = position?.y ?? 50;

  const handleRobotClick = () => {
    if (onClick) onClick();
    window.dispatchEvent(new CustomEvent('echomasters-open-harvey'));
  };

  return (
    <>
      <div 
        className="absolute z-[999] pointer-events-none transition-all duration-1000 ease-in-out transform"
        style={{ 
          left: `${safeX}%`, 
          top: `${safeY}%`,
          transform: `translate(-50%, -50%) scale(${isActive ? 1 : 0.6})`
        }}
      >
        <div 
          className={`relative flex flex-col items-center group pointer-events-auto cursor-pointer transition-all duration-1000 ${isActive ? 'opacity-100' : 'opacity-0 scale-50 rotate-12 blur-xl'}`}
          onClick={handleRobotClick}
        >
          {/* High-Fidelity Energy Rings (Same as Startup) */}
          <div className={`absolute inset-[-60px] border-2 border-gold-main/20 rounded-full blur-sm transition-all duration-1000 ${isActive ? 'opacity-100 animate-[spin_30s_linear_infinite]' : 'opacity-0'}`}></div>
          <div className={`absolute inset-[-40px] border border-white/10 rounded-full transition-all duration-1000 ${isActive ? 'opacity-100 animate-[spin_20s_linear_infinite_reverse]' : 'opacity-0'}`}></div>
          <div className={`absolute inset-[-30px] bg-gold-main/5 blur-3xl rounded-full transition-all duration-1000 ${isActive ? 'opacity-100 animate-pulse' : 'opacity-0'}`}></div>

          {/* Assistant Nameplate */}
          <div className="absolute -top-16 md:-top-20 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none scale-75 md:scale-100 z-50">
            <div className="bg-slate-950/95 backdrop-blur-xl border border-gold-main/40 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl flex flex-col items-center shadow-[0_10px_50px_rgba(181,148,78,0.3)] ring-1 ring-white/10">
              <div className="flex items-center gap-2 mb-1">
                <Activity size={10} className="text-gold-main animate-pulse" />
                <span className="text-[9px] md:text-[11px] font-black text-white uppercase tracking-[0.3em] md:tracking-[0.5em] leading-none">FACULTY_LINK: HARVEY</span>
              </div>
              <span className="text-[7px] md:text-[8px] font-bold text-gold-main/60 uppercase tracking-[0.2em]">Operational Precision Verified</span>
            </div>
          </div>

          {/* Startup-style Glowing Chassis Frame */}
          <div className={`relative transition-all duration-700 w-24 h-24 md:w-48 md:h-48 bg-slate-900/90 backdrop-blur-3xl rounded-[2rem] md:rounded-[4rem] flex items-center justify-center border-2 border-gold-main/40 shadow-[0_20px_60px_rgba(181,148,78,0.2)] z-10 ${isActive ? 'animate-materialize' : ''} ${isSpeaking ? 'scale-105 border-gold-main' : 'hover:scale-105'}`}>
             <HarveyAvatar 
                size={isMobile ? "sm" : "md"} 
                isTalking={isSpeaking} 
                isThinking={isThinking} 
                accentColor="#B5944E" 
             />
             
             {/* Dynamic Interaction Icons */}
             <div className="absolute -top-2 -right-2 md:-top-3 md:-right-3 bg-gold-main text-slate-950 p-2 md:p-2.5 rounded-lg md:rounded-xl shadow-gold group-hover:scale-110 transition-transform z-30 ring-2 md:ring-4 ring-slate-900">
                <Zap size={isMobile ? 12 : 16} fill="currentColor" />
             </div>
             <div className="absolute -bottom-2 -left-2 md:-bottom-3 md:-left-3 bg-slate-950 border border-gold-main/40 text-gold-main p-2 md:p-2.5 rounded-lg md:rounded-xl shadow-2xl opacity-80 group-hover:opacity-100 transition-opacity z-30 group-hover:scale-110">
                <MessageSquare size={isMobile ? 12 : 16} />
             </div>
          </div>

          {/* Decrypted Signal Message Bubble */}
          {message && (
            <div className="absolute bottom-full mb-10 md:mb-16 w-[240px] sm:w-[280px] md:w-[480px] right-0 md:right-auto md:left-1/2 md:-translate-x-1/2 bg-[#0A1122]/98 backdrop-blur-3xl border-2 border-gold-main/40 p-6 md:p-12 rounded-[2rem] md:rounded-[4rem] shadow-3xl animate-message-pop z-[1000] border-t-gold-main ring-1 ring-white/20">
              <div className="absolute -bottom-3 right-8 md:right-auto md:left-1/2 md:-translate-x-1/2 w-6 h-6 md:w-8 md:h-8 bg-[#0A1122] border-r-2 border-b-2 border-gold-main/40 rotate-45"></div>
              
              <div className="flex justify-between items-center mb-4 md:mb-8">
                <div className="flex gap-2 md:gap-3 items-center">
                  <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-gold-main animate-pulse shadow-[0_0_15px_#B5944E]"></div>
                  <span className="text-[9px] md:text-[11px] uppercase tracking-[0.4em] md:tracking-[0.6em] font-black text-gold-main">DECRYPTED_WISDOM</span>
                </div>
                <div className="px-2 py-0.5 md:px-3 md:py-1 rounded-md bg-white/5 border border-white/10 flex items-center gap-1 md:gap-2">
                  <span className="text-[7px] md:text-[8px] font-mono text-white/30 uppercase tracking-widest">FACULTY_UPLINK</span>
                  <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                </div>
              </div>

              <p className="text-lg md:text-3xl font-serif font-medium text-white leading-relaxed text-left italic border-l-2 md:border-l-4 border-gold-main/50 pl-6 md:pl-10 py-1">
                "{message}"
              </p>

              <div className="mt-6 md:mt-8 flex justify-end items-center gap-2 md:gap-3">
                <div className="h-px flex-1 bg-white/5"></div>
                <span className="text-[8px] md:text-[9px] font-black uppercase text-white/20 tracking-[0.2em] md:tracking-[0.3em]">Protocol: NEXUS_HIFI_SYNC</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes material-fx { 
          0% { opacity: 0; transform: translateY(40px) scale(0.8) rotate(5deg); filter: blur(20px); } 
          100% { opacity: 1; transform: translateY(0) scale(1) rotate(0deg); filter: blur(0); } 
        }
        @keyframes message-pop { 
          from { opacity: 0; transform: translateY(30px) scale(0.9); filter: blur(10px); } 
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); } 
        }
        .animate-materialize { animation: material-fx 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-message-pop { animation: message-pop 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </>
  );
};

export default ProfessorHost;
