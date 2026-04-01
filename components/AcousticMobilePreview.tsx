
import React, { useState, useEffect } from 'react';
import { 
  Radio, Film, Zap, Battery, Wifi, Signal, 
  Play, Pause, Disc3, Monitor, Bot, 
  Sparkles, Activity, Search, Headphones,
  ChevronRight, Heart, Share2, Volume2,
  Loader2
} from 'lucide-react';
import HarveyAvatar from './HarveyAvatar';
import { sharedAudio, DEFAULT_TRACKS, RadioTrack } from './SiteRadio';
import CinematicCommercial from './CinematicCommercial';

const AcousticMobilePreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'studio' | 'theater' | 'sync'>('studio');
  const [isPlaying, setIsPlaying] = useState(!sharedAudio.paused);
  const [isTheaterPlaying, setIsTheaterPlaying] = useState(false);
  const [showTheaterModal, setShowTheaterModal] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<RadioTrack | null>(DEFAULT_TRACKS[0]);
  const [time, setTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  const playFeedbackSound = (type: 'play' | 'pause' | 'click') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      
      if (type === 'play') {
        osc.frequency.setValueAtTime(880, t);
        osc.frequency.exponentialRampToValueAtTime(1320, t + 0.1);
      } else if (type === 'pause') {
        osc.frequency.setValueAtTime(1320, t);
        osc.frequency.exponentialRampToValueAtTime(880, t + 0.1);
      } else {
        osc.frequency.setValueAtTime(1000, t);
        osc.frequency.exponentialRampToValueAtTime(500, t + 0.05);
      }
      
      g.gain.setValueAtTime(0.02, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      
      osc.connect(g);
      g.connect(ctx.destination);
      
      osc.start(t);
      osc.stop(t + 0.1);
    } catch (e) {
      // Audio context might be blocked by browser policy until user interaction
    }
  };

  const toggleStudioPlay = () => {
    window.dispatchEvent(new CustomEvent('echomasters-toggle-play'));
    playFeedbackSound(!isPlaying ? 'play' : 'pause');
  };

  const selectTrack = (track: RadioTrack) => {
    window.dispatchEvent(new CustomEvent('echomasters-play-track', {
      detail: { track }
    }));
    playFeedbackSound('click');
  };

  const toggleTheaterPlay = () => {
    setShowTheaterModal(true);
    playFeedbackSound('click');
  };

  useEffect(() => {
    const handleAudioState = (e: any) => {
      setIsPlaying(e.detail.isPlaying);
      setCurrentTrack(e.detail.track);
    };

    window.addEventListener('echomasters-audio-state', handleAudioState);
    
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => {
      clearInterval(timer);
      window.removeEventListener('echomasters-audio-state', handleAudioState);
    };
  }, []);

  return (
    <section id="mobile-demo" className="py-24 md:py-40 bg-transparent relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-12 relative z-10">
        <div className="lg:grid lg:grid-cols-12 gap-16 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-6 space-y-10 text-left mb-20 lg:mb-0">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-gold-main/10 border border-gold-main/20 text-[10px] font-black text-gold-main uppercase tracking-[0.4em]">
              <Zap size={12} className="animate-pulse" /> Mobile Laboratory
            </div>
            <h2 className="text-4xl md:text-7xl font-serif font-bold text-white tracking-tighter leading-tight uppercase italic">
              Clinical Power <br /> <span className="text-gold-main not-italic">In Your Pocket</span>
            </h2>
            <p className="text-lg md:text-2xl text-slate-300 font-light italic leading-relaxed border-l-4 border-gold-main/20 pl-8">
              Access the full EchoMasters spectrum on the move. Our mobile-first acoustic engine delivers zero-latency simulations and high-yield briefings anywhere.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
              <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl space-y-3 group hover:border-gold-main/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-gold-main/10 flex items-center justify-center text-gold-main"><Radio size={20} /></div>
                <h4 className="text-white font-serif font-bold italic text-xl">The Studio</h4>
                <p className="text-sm text-slate-500 italic">High-fidelity podcast nodes for auditory reinforcement during clinical transit.</p>
              </div>
              <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl space-y-3 group hover:border-gold-main/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-gold-main/10 flex items-center justify-center text-gold-main"><Film size={20} /></div>
                <h4 className="text-white font-serif font-bold italic text-xl">The Theater</h4>
                <p className="text-sm text-slate-500 italic">Cinema-grade visual trailers for visual anchoring of complex physics variables.</p>
              </div>
            </div>
          </div>

          {/* Interactive Mobile Mockup */}
          <div className="lg:col-span-6 flex justify-center perspective-1000">
             <div className="relative w-[320px] h-[640px] md:w-[380px] md:h-[760px] animate-float-slow">
                
                {/* Outer Chassis */}
                <div className="absolute inset-0 bg-[#0F172A] border-[12px] border-[#1E293B] rounded-[4rem] shadow-[0_50px_100px_rgba(0,0,0,0.8),inset_0_0_10px_rgba(255,255,255,0.1)] ring-2 ring-white/5 flex flex-col overflow-hidden">
                    
                    {/* Status Bar */}
                    <div className="h-10 px-10 flex justify-between items-center bg-transparent shrink-0 z-[100]">
                        <span className="text-[11px] font-bold text-white font-sans">{time.getHours()}:{time.getMinutes().toString().padStart(2, '0')}</span>
                        <div className="flex items-center gap-2 text-white/80">
                            <Signal size={12} />
                            <Wifi size={12} />
                            <Battery size={12} className="rotate-90" />
                        </div>
                    </div>

                    {/* App Internal Viewport */}
                    <div className="flex-1 bg-slate-950 flex flex-col relative overflow-hidden p-4 pt-2">
                        
                        {/* Dynamic Island AI Hub */}
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-full z-[110] flex items-center justify-center gap-3 border border-white/5 group/island cursor-pointer transition-all hover:w-48 hover:h-12">
                            <div className="w-2 h-2 rounded-full bg-gold-main animate-pulse shadow-gold"></div>
                            <span className="text-[8px] font-black text-white/40 uppercase tracking-widest opacity-0 group-hover/island:opacity-100 transition-opacity">Harvey Active</span>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar pt-10 space-y-6">
                            
                            {activeTab === 'studio' && (
                                <div className="animate-fade-in space-y-6">
                                    <div className="p-6 bg-slate-900/60 rounded-[2.5rem] border border-white/10 flex flex-col items-center gap-6 shadow-2xl relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gold-gradient opacity-[0.02] animate-[spin_10s_linear_infinite]"></div>
                                        <div className="w-40 h-40 rounded-full border-4 border-slate-800 flex items-center justify-center bg-slate-900 shadow-inner relative">
                                            <HarveyAvatar size="sm" isTalking={isPlaying} accentColor="#B5944E" />
                                        </div>
                                        <div className="text-center space-y-1">
                                            <h3 className="text-xl font-serif font-bold text-white italic truncate max-w-[200px]">{currentTrack?.title || 'Acoustic Logic Node'}</h3>
                                            <p className="text-[9px] font-black text-gold-main uppercase tracking-[0.4em]">{currentTrack?.artist || 'Faculty Broadcast'}</p>
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <button 
                                                onClick={() => {
                                                    const idx = DEFAULT_TRACKS.findIndex(t => t.url === currentTrack?.url);
                                                    const prevIdx = (idx - 1 + DEFAULT_TRACKS.length) % DEFAULT_TRACKS.length;
                                                    selectTrack(DEFAULT_TRACKS[prevIdx]);
                                                }}
                                                className="text-white/20 hover:text-white/40 transition-colors"
                                            >
                                                <Play className="rotate-180" size={24} fill="currentColor" />
                                            </button>
                                            <button 
                                                onClick={toggleStudioPlay}
                                                className="w-14 h-14 rounded-full bg-gold-main flex items-center justify-center text-slate-950 shadow-gold hover:scale-105 active:scale-95 transition-all"
                                            >
                                                {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} className="ml-1" fill="currentColor" />}
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    const idx = DEFAULT_TRACKS.findIndex(t => t.url === currentTrack?.url);
                                                    const nextIdx = (idx + 1) % DEFAULT_TRACKS.length;
                                                    selectTrack(DEFAULT_TRACKS[nextIdx]);
                                                }}
                                                className="text-white/20 hover:text-white/40 transition-colors"
                                            >
                                                <Play size={24} fill="currentColor" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {DEFAULT_TRACKS.slice(0, 4).map((track, i) => (
                                            <button 
                                                key={track.id} 
                                                onClick={() => selectTrack(track)}
                                                className={`w-full p-4 bg-white/5 border rounded-2xl flex items-center justify-between transition-all ${currentTrack?.url === track.url ? 'border-gold-main/40 bg-gold-main/5' : 'border-white/10 hover:border-white/20'}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-8 h-8 rounded-lg bg-slate-900 border flex items-center justify-center ${currentTrack?.url === track.url ? 'text-gold-main border-gold-main/20' : 'text-gold-main/40 border-white/5'}`}>
                                                        {currentTrack?.url === track.url && isPlaying ? <Disc3 size={14} className="animate-spin" /> : <Headphones size={14} />}
                                                    </div>
                                                    <div className="text-left">
                                                        <p className={`text-[11px] font-bold italic ${currentTrack?.url === track.url ? 'text-gold-main' : 'text-white'}`}>{track.title}</p>
                                                        <p className="text-[8px] text-white/20 uppercase tracking-widest">{track.duration || '3:42'} Duration</p>
                                                    </div>
                                                </div>
                                                <ChevronRight size={14} className="text-white/10" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                             {activeTab === 'theater' && (
                                <div className="animate-fade-in space-y-6">
                                    <div 
                                        onClick={toggleTheaterPlay}
                                        className="aspect-[9/16] bg-slate-900 rounded-[2.5rem] border border-gold-main/20 overflow-hidden relative group/player cursor-pointer"
                                    >
                                        {isTheaterPlaying ? (
                                            <div className="absolute inset-0 bg-black flex flex-col items-center justify-center">
                                                <div className="w-full h-full relative overflow-hidden">
                                                    {/* Simulated Video Content */}
                                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gold-main/20 to-slate-900 animate-pulse"></div>
                                                    <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gold-main/40 shadow-[0_0_15px_rgba(181,148,78,0.5)] animate-scan"></div>
                                                    
                                                    {/* Floating Particles */}
                                                    {[...Array(12)].map((_, i) => (
                                                        <div 
                                                            key={i}
                                                            className="absolute w-1 h-1 bg-gold-main/40 rounded-full animate-float-slow"
                                                            style={{ 
                                                                top: `${Math.random() * 100}%`, 
                                                                left: `${Math.random() * 100}%`,
                                                                animationDelay: `${Math.random() * 5}s`,
                                                                animationDuration: `${5 + Math.random() * 5}s`
                                                            }}
                                                        ></div>
                                                    ))}

                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-24 h-24 rounded-full border border-gold-main/20 flex items-center justify-center animate-ping">
                                                            <Activity size={32} className="text-gold-main/40" />
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Controls Overlay */}
                                                <div className="absolute bottom-10 inset-x-0 px-6 flex items-center justify-between opacity-0 group-hover/player:opacity-100 transition-opacity">
                                                    <Pause size={20} className="text-white" />
                                                    <div className="flex-1 mx-4 h-1 bg-white/20 rounded-full overflow-hidden">
                                                        <div className="h-full bg-gold-main w-1/3 animate-[progress_10s_linear_infinite]"></div>
                                                    </div>
                                                    <Volume2 size={20} className="text-white" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-16 h-16 rounded-full bg-gold-main/20 backdrop-blur-md flex items-center justify-center text-gold-main border border-gold-main/40 group-hover/player:scale-110 transition-transform shadow-gold">
                                                    <Play size={24} fill="currentColor" />
                                                </div>
                                            </div>
                                        )}
                                        <div className="absolute bottom-6 left-6 text-left space-y-1 z-10">
                                            <h4 className="text-lg font-serif font-bold text-white italic tracking-tight">SPI Physics Core</h4>
                                            <p className="text-[8px] font-black text-gold-main uppercase tracking-widest">Veo 3.1 Rendering</p>
                                        </div>
                                        {/* Mock Scanlines */}
                                        <div className="absolute inset-0 opacity-[0.1] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none"></div>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Mobile Navigation */}
                        <div className="h-20 bg-slate-900/80 backdrop-blur-xl border-t border-white/10 mx-[-1rem] mb-[-1rem] px-6 flex items-center justify-around shrink-0 relative z-[100]">
                            <TabBtn icon={Radio} active={activeTab === 'studio'} onClick={() => setActiveTab('studio')} />
                            <div className="relative -top-6">
                                <div className="w-16 h-16 rounded-full bg-gold-main flex items-center justify-center shadow-gold border-4 border-slate-950">
                                    <Bot size={28} className="text-slate-950" />
                                </div>
                            </div>
                            <TabBtn icon={Film} active={activeTab === 'theater'} onClick={() => setActiveTab('theater')} />
                        </div>
                    </div>
                </div>

                {/* Floating UI Elements Around Device */}
                <div className="absolute -top-10 -right-20 p-6 bg-slate-900 border border-gold-main/30 rounded-3xl shadow-3xl animate-bounce-slow hidden md:block">
                    <div className="flex items-center gap-3 text-gold-main mb-2">
                        <Activity size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Real-time Sync</span>
                    </div>
                    <p className="text-xs text-white/60 italic">"Frequency doubled. <br />Wavelength halved."</p>
                </div>

                <div className="absolute top-1/2 -left-28 p-6 bg-slate-900 border border-purple-500/30 rounded-3xl shadow-3xl animate-float-slow hidden md:block" style={{ animationDelay: '1s' }}>
                    <div className="flex items-center gap-3 text-purple-400 mb-2">
                        <Monitor size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Active Sim</span>
                    </div>
                    <div className="w-20 h-10 bg-white/5 rounded-lg flex items-end gap-1 px-2 pb-2">
                        {[40, 70, 50, 90, 60].map((h, i) => (
                            <div key={i} className="flex-1 bg-purple-500/40 rounded-t-sm" style={{ height: `${h}%` }}></div>
                        ))}
                    </div>
                </div>
             </div>
          </div>

        </div>
      </div>

      {showTheaterModal && <CinematicCommercial onClose={() => setShowTheaterModal(false)} />}

      <style>{`
        .bg-grid-gold {
          background-size: 40px 40px;
          background-image: 
            linear-gradient(to right, rgba(181, 148, 78, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(181, 148, 78, 0.05) 1px, transparent 1px);
        }
        .perspective-1000 { perspective: 2000px; }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotateX(0); }
          50% { transform: translateY(-20px) rotateX(2deg); }
        }
        .animate-float-slow { animation: float 10s ease-in-out infinite; }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow { animation: bounce-slow 6s ease-in-out infinite; }
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .animate-scan { animation: scan 3s linear infinite; }
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </section>
  );
};

const TabBtn = ({ icon: Icon, active, onClick }: any) => (
    <button 
        onClick={onClick}
        className={`p-3 rounded-xl transition-all duration-500 ${active ? 'text-gold-main scale-125' : 'text-white/20'}`}
    >
        <Icon size={22} />
    </button>
);

export default AcousticMobilePreview;
