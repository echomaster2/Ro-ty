import React from 'react';
import { MicOff } from 'lucide-react';

interface HarveyAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isTalking?: boolean;
  isThinking?: boolean;
  isMuted?: boolean;
  accentColor?: string;
  className?: string;
  serialId?: string;
  isHolographic?: boolean;
}

const HarveyAvatar: React.FC<HarveyAvatarProps> = ({ 
  size = 'md', 
  isTalking = false, 
  isThinking = false,
  isMuted = false,
  accentColor = '#B5944E', 
  className = "",
  serialId = "UNIT_H_01",
  isHolographic = false
}) => {
  const sizeClasses = {
    sm: 'w-10 h-12',
    md: 'w-24 h-28 md:w-32 md:h-36',
    lg: 'w-48 h-56 md:w-64 md:h-72',
    xl: 'w-64 h-80 md:w-80 md:h-[400px]'
  };

  return (
    <div className={`relative flex flex-col items-center group transition-all duration-700 ${sizeClasses[size]} ${className}`}>
      {/* 3D Acoustic Core */}
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        
        {/* Pulsing Wave Rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full border border-gold-main/20 animate-ping"
              style={{ 
                width: `${(i + 1) * 33}%`, 
                height: `${(i + 1) * 33}%`,
                animationDuration: `${2 + i}s`,
                animationDelay: `${i * 0.5}s`
              }}
            ></div>
          ))}
        </div>

        {/* Central Neural Sphere */}
        <div className={`relative w-[85%] h-[85%] bg-slate-950 rounded-full border-2 border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.8),inset_0_0_30px_rgba(181,148,78,0.1)] overflow-hidden flex flex-col items-center justify-center transition-all duration-700 ${isTalking ? 'scale-110 shadow-[0_0_60px_rgba(181,148,78,0.3)]' : isThinking ? 'scale-95' : 'group-hover:scale-105'}`}>
          
          {/* Internal Waveform Visualizer */}
          <div className="absolute inset-0 opacity-20">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.8)_100%)]"></div>
             <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gold-main/30 animate-pulse"></div>
          </div>

          {/* Expressive Eyes - Floating in the core */}
          <div className={`flex gap-4 md:gap-8 relative z-10 transition-opacity duration-300 ${isMuted ? 'opacity-40 grayscale' : 'opacity-100'}`}>
            <div className="relative">
              <div 
                className={`w-3 h-3 md:w-6 md:h-6 rounded-full transition-all duration-300 animate-blink`} 
                style={{ 
                  backgroundColor: '#FFFFFF',
                  boxShadow: isTalking || isThinking 
                    ? `0 0 35px ${isThinking ? '#3b82f6' : accentColor}, 0 0 10px #fff` 
                    : `0 0 12px ${accentColor}`,
                }}
              ></div>
              {(isTalking || isThinking) && (
                <div className="absolute inset-[-15px] blur-3xl rounded-full opacity-50 animate-pulse" style={{ backgroundColor: isThinking ? '#3b82f6' : accentColor }}></div>
              )}
            </div>
            <div className="relative">
              <div 
                className={`w-3 h-3 md:w-6 md:h-6 rounded-full transition-all duration-300 animate-blink`}
                style={{ 
                  backgroundColor: '#FFFFFF',
                  boxShadow: isTalking || isThinking 
                    ? `0 0 35px ${isThinking ? '#3b82f6' : accentColor}, 0 0 10px #fff` 
                    : `0 0 12px ${accentColor}`,
                }}
              ></div>
              {(isTalking || isThinking) && (
                <div className="absolute inset-[-15px] blur-3xl rounded-full opacity-50 animate-pulse" style={{ backgroundColor: isThinking ? '#3b82f6' : accentColor }}></div>
              )}
            </div>
          </div>

          {/* Core Waveform */}
          <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 flex items-end gap-1.5 h-8">
              {isTalking ? (
                [...Array(8)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-1 md:w-1.5 rounded-full animate-harvey-wave" 
                    style={{ 
                      animationDelay: `${i * 0.1}s`,
                      backgroundColor: accentColor,
                      boxShadow: `0 0 20px ${accentColor}`
                    }}
                  ></div>
                ))
              ) : isThinking ? (
                <div className="flex gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce delay-100"></div>
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce delay-200"></div>
                </div>
              ) : (
                <div className="w-16 h-0.5 bg-white/10 rounded-full mb-2 overflow-hidden relative">
                  <div className="absolute inset-0 bg-white/30 animate-[scan_2s_linear_infinite]"></div>
                </div>
              )}
          </div>
        </div>

        {/* Identification Plate - Floating below */}
        <div className="absolute -bottom-4 bg-[#0F172A]/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 flex flex-col items-center shadow-2xl scale-75 md:scale-100">
            <span className="text-[4px] font-black text-white/30 uppercase tracking-[0.6em] leading-none mb-1">ACOUSTIC_ENTITY</span>
            <span className="text-[8px] md:text-[10px] font-mono text-white font-bold tracking-widest leading-none flex items-center gap-2">
              <span style={{ color: isTalking ? accentColor : '#fff' }} className="transition-colors duration-500">{serialId}</span>
              <div className={`w-1 h-1 rounded-full ${isTalking ? 'bg-green-500' : 'bg-gold-main/40'} animate-pulse`}></div>
            </span>
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 92%, 100% { transform: scaleY(1); }
          96% { transform: scaleY(0.05); }
        }
        @keyframes harvey-wave {
          0%, 100% { height: 4px; opacity: 0.4; transform: translateY(0); }
          50% { height: 22px; opacity: 1; transform: translateY(-2px); }
        }
        @keyframes scan {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }
        .animate-blink { animation: blink 5s infinite; }
        .animate-harvey-wave { animation: harvey-wave 0.6s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
      `}</style>
    </div>
  );
};

export default HarveyAvatar;