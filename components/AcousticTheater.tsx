import React, { useState } from 'react';
import { Film, Play, X, Loader2, Sparkles, Monitor, Info, ArrowRight, Zap, Bot, ShieldCheck } from 'lucide-react';
import CinematicCommercial from './CinematicCommercial';

const AcousticTheater: React.FC = () => {
    const [showTrailerGen, setShowTrailerGen] = useState(false);

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-10 py-6 md:py-12 space-y-12 animate-fade-in text-left pb-40 font-sans">
            
            {/* Theater Header Area */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border-b border-white/5 pb-12">
                <div className="space-y-6 text-white overflow-hidden flex-1">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gold-main/10 rounded-lg border border-gold-main/20">
                            <Film size={14} className="text-gold-main animate-pulse" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Visual Resonance Theater</span>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-[clamp(2rem,8vw,5.5rem)] font-serif font-bold tracking-tighter leading-[0.8] italic uppercase">Acoustic <span className="text-gold-main not-italic">Theater</span></h1>
                        <p className="text-slate-400 text-sm md:text-xl font-light max-w-2xl italic leading-relaxed border-l-2 border-gold-main/20 pl-6 py-1">
                            Experience cinematic physics. Generate and observe clinical visual briefings in high-fidelity 9:16 vertical trailers.
                        </p>
                    </div>
                </div>
                
                <div className="px-10 py-6 bg-slate-900 border border-gold-main/20 rounded-[2rem] flex items-center gap-4 shadow-gold-dim">
                   <ShieldCheck className="text-gold-main" size={24} />
                   <div className="text-left">
                       <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Projection Auth</p>
                       <p className="text-sm font-mono font-bold text-white uppercase">UNLIMITED_LINK</p>
                   </div>
                </div>
            </div>

            {/* Main Stage */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
                
                {/* Visual Archive */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="relative group/stage bg-slate-950/40 border border-white/10 rounded-[3rem] md:rounded-[4rem] aspect-video flex flex-col items-center justify-center overflow-hidden shadow-3xl backdrop-blur-3xl">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(181,148,78,0.05)_0%,transparent_80%)] opacity-0 group-hover/stage:opacity-100 transition-opacity duration-1000"></div>
                        
                        <div className="flex flex-col items-center gap-8 text-center px-10 relative z-10">
                            <div className="w-24 h-24 bg-white/5 rounded-[2rem] border border-white/10 flex items-center justify-center text-white/20 group-hover/stage:scale-110 group-hover/stage:text-gold-main group-hover/stage:border-gold-main/40 transition-all duration-700">
                                <Bot size={48} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl md:text-4xl font-serif font-bold text-white italic tracking-tight">Main Screening Room</h3>
                                <p className="text-sm md:text-lg text-slate-400 font-light italic">No active transmission. Deploy a cinematic node below.</p>
                            </div>
                        </div>

                        {/* Visual Scanlines */}
                        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(255,255,255,0.5)_50%)] bg-[length:100%_4px]"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <TrailerCard 
                            title="SPI Physics Core" 
                            desc="The foundational waves of diagnostic ultrasound." 
                            onPlay={() => setShowTrailerGen(true)}
                        />
                        <TrailerCard 
                            title="Doppler Mastery" 
                            desc="Visualizing frequency shifts and spectral dynamics." 
                            onPlay={() => setShowTrailerGen(true)}
                        />
                    </div>
                </div>

                {/* Theater Sidebar */}
                <div className="lg:col-span-4 space-y-10">
                    <div className="p-10 bg-slate-900 border border-white/5 rounded-[3rem] space-y-8 relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform"><Monitor size={140} /></div>
                        <div className="flex items-center gap-4 text-gold-main">
                            <div className="p-3 bg-gold-main/10 rounded-xl border border-gold-main/20">
                                <Monitor size={20} />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-[0.4em]">Theater Protocol</span>
                        </div>
                        <p className="text-sm text-slate-300 italic leading-relaxed border-l-2 border-gold-main/20 pl-6">
                            "Visualization is the anchor of comprehension. By seeing the physics in motion, you solidify the resonance between theory and practice."
                        </p>
                    </div>

                    <div className="p-10 bg-gold-main/5 border border-gold-main/10 rounded-[3rem] space-y-6">
                        <div className="flex items-center gap-4 text-gold-main">
                            <Zap size={20} />
                            <span className="text-[11px] font-black uppercase tracking-[0.4em]">Veo 3.1 Synthesis</span>
                        </div>
                        <p className="text-xs text-slate-400 font-light leading-relaxed">
                            Trailers are generated on-demand using Google's Veo 3.1 video engine. High-fidelity rendering provides the ultimate visual study aid.
                        </p>
                        <button 
                            onClick={() => setShowTrailerGen(true)}
                            className="w-full py-5 bg-gold-main text-slate-950 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-gold hover:shadow-gold-strong transition-all flex items-center justify-center gap-3 active:scale-95"
                        >
                           <Play size={14} fill="currentColor" /> Deploy Trailer Gen
                        </button>
                    </div>
                </div>
            </div>

            {showTrailerGen && <CinematicCommercial onClose={() => setShowTrailerGen(false)} />}
        </div>
    );
};

const TrailerCard = ({ title, desc, onPlay }: any) => (
    <button 
        onClick={onPlay}
        className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] text-left group hover:border-gold-main/30 transition-all duration-700 shadow-xl relative overflow-hidden"
    >
        <div className="absolute inset-0 bg-gold-main/[0.02] opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 group-hover:text-gold-main group-hover:border-gold-main/20 transition-all">
                <Play size={20} fill="currentColor" className="ml-1" />
            </div>
            <span className="text-[8px] font-black text-white/10 uppercase tracking-widest">30s Duration</span>
        </div>
        <h4 className="text-xl font-serif font-bold text-white italic tracking-tight mb-2 uppercase">{title}</h4>
        <p className="text-xs text-slate-500 font-light italic leading-relaxed">{desc}</p>
    </button>
);

export default AcousticTheater;