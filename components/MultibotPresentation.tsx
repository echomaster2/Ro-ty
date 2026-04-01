
import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Sparkles, Zap, Loader2, Play, 
  ArrowRight, X, GraduationCap, Brain, 
  Activity, Target, ShieldCheck, Terminal,
  Cpu, Waves, Radio, Monitor, Mic2,
  ChevronRight, Volume2, VolumeX
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import HarveyAvatar from './HarveyAvatar';
import { useNarrator } from '../src/hooks/useNarrator';

interface PresentationTurn {
  personaId: string;
  speech: string;
  slideTitle: string;
  slideData: string;
  accent: string;
}

const FACULTY = [
  { id: 'Charon', name: 'Prof. Charon', role: 'Chief Strategist', color: '#B5944E', icon: GraduationCap },
  { id: 'Kore', name: 'Dr. Kore', role: 'Technical Lead', color: '#10b981', icon: Cpu },
  { id: 'Puck', name: 'Specialist Puck', role: 'Resonance Analyst', color: '#3b82f6', icon: Activity },
  { id: 'Zephyr', name: 'Mentor Zephyr', role: 'Safety Warden', color: '#ec4899', icon: ShieldCheck },
];

const MultibotPresentation: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [phase, setPhase] = useState<'IDLE' | 'LOADING' | 'ACTIVE' | 'COMPLETE'>('IDLE');
  const [currentTurnIdx, setCurrentTurnIdx] = useState(0);
  const [script, setScript] = useState<PresentationTurn[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const { narrate, stopNarration, isNarrating } = useNarrator();

  const startPresentation = async () => {
    setPhase('LOADING');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Generate a cinematic 4-part presentation script for the 'EchoMasters' Ultrasound Physics app.
      Each part must be delivered by a different bot persona:
      1. Charon (The Strategist): Introduce the EchoMasters Protocol.
      2. Kore (The Engineer): Present the Live Simulation Rigs.
      3. Puck (The Analyst): Present the High-Speed Acoustic Studio.
      4. Zephyr (The Warden): Present the Resilience Pass & Safety.
      
      Return a JSON array of objects:
      {
        "personaId": "Charon|Kore|Puck|Zephyr",
        "speech": "Cinematic, elite, short speech (max 30 words)",
        "slideTitle": "The feature name",
        "slideData": "A high-yield physics constant or benefit",
        "accent": "The hex color from the persona"
      }`;

      const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                personaId: { type: Type.STRING },
                speech: { type: Type.STRING },
                slideTitle: { type: Type.STRING },
                slideData: { type: Type.STRING },
                accent: { type: Type.STRING },
              },
              required: ["personaId", "speech", "slideTitle", "slideData", "accent"],
            }
          }
        }
      });

      const data = JSON.parse(res.text || "[]");
      setScript(data);
      setPhase('ACTIVE');
    } catch (e) {
      console.error(e);
      onClose();
    }
  };

  const nextTurn = () => {
    if (currentTurnIdx < script.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentTurnIdx(prev => prev + 1);
        setIsTransitioning(false);
      }, 800);
    } else {
      setPhase('COMPLETE');
    }
  };

  const currentTurn = script[currentTurnIdx];
  const currentPersona = FACULTY.find(f => f.id === currentTurn?.personaId) || FACULTY[0];

  useEffect(() => {
    if (phase === 'ACTIVE' && currentTurn && !isMuted) {
      narrate(currentTurn.speech, currentTurn.personaId);
    }
    return () => stopNarration();
  }, [currentTurnIdx, phase, isMuted]);

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-950/98 backdrop-blur-3xl flex items-center justify-center p-4 md:p-12 animate-fade-in overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(181,148,78,0.03)_0%,transparent_80%)] pointer-events-none"></div>
      
      <div className="absolute top-8 right-8 z-[1010] flex items-center gap-4">
        <button 
          onClick={() => setIsMuted(!isMuted)} 
          className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-white transition-all"
        >
          {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>
        <button onClick={onClose} className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-white transition-all hover:rotate-90">
          <X size={32} />
        </button>
      </div>

      {phase === 'IDLE' && (
        <div className="max-w-3xl text-center space-y-12 animate-slide-up">
           <div className="relative mx-auto w-32 h-32 md:w-48 md:h-48">
              <div className="absolute inset-0 bg-gold-main/20 blur-[100px] animate-pulse rounded-full"></div>
              <div className="relative z-10 w-full h-full bg-slate-900 border-2 border-gold-main/30 rounded-[3rem] md:rounded-[4rem] flex items-center justify-center shadow-gold">
                <Bot size={64} className="text-gold-main" />
              </div>
           </div>
           <div className="space-y-4">
              <h2 className="text-4xl md:text-7xl font-serif font-bold text-white italic uppercase tracking-tighter leading-none">The Faculty <br /><span className="text-gold-main not-italic">Keynote</span></h2>
              <p className="text-slate-400 text-lg md:text-2xl font-light italic leading-relaxed">
                Experience the synchronized vision of the EchoMasters council. A cinematic briefing on the future of clinical mastery.
              </p>
           </div>
           <button 
             onClick={startPresentation}
             className="px-16 py-8 bg-gold-main text-slate-950 rounded-2xl md:rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-xs md:text-sm shadow-gold hover:shadow-gold-strong transition-all flex items-center justify-center gap-6 mx-auto active:scale-95 group"
           >
             Initialize Presentation <Play size={20} fill="currentColor" className="group-hover:scale-125 transition-transform" />
           </button>
        </div>
      )}

      {phase === 'LOADING' && (
        <div className="flex flex-col items-center gap-10 animate-fade-in text-center">
           <div className="relative w-40 h-40 md:w-60 md:h-60">
              <div className="absolute inset-0 border-4 border-gold-main/10 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-gold-main border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <Radio className="text-gold-main w-16 h-16 animate-pulse" />
              </div>
           </div>
           <div className="space-y-2">
             <h3 className="text-2xl md:text-4xl font-serif font-bold text-white italic tracking-tight">Syncing Faculty Cores...</h3>
             <p className="text-slate-500 font-mono text-[10px] md:text-xs uppercase tracking-[0.5em]">Establishing Multi-Agent Resonance</p>
           </div>
        </div>
      )}

      {phase === 'ACTIVE' && currentTurn && (
        <div className={`w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-20 items-center transition-all duration-1000 ${isTransitioning ? 'opacity-0 scale-105 blur-2xl' : 'opacity-100 scale-100 blur-0'}`}>
          
          {/* Left: The Virtual Stage (Bots) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center gap-12 relative">
             {/* Secondary Bots (Inactive) */}
             <div className="flex gap-4 md:gap-8 opacity-20 scale-75">
                {FACULTY.filter(f => f.id !== currentTurn.personaId).map(bot => (
                  <div key={bot.id} className="relative group">
                    <HarveyAvatar size="sm" accentColor={bot.color} />
                  </div>
                ))}
             </div>

             {/* Main Speaker Bot */}
             <div className="relative group/speaker">
                <div className="absolute inset-[-60px] bg-[radial-gradient(circle_at_center,var(--accent-glow),transparent_70%)] opacity-40 animate-pulse" style={{ '--accent-glow': currentTurn.accent + '66' } as any}></div>
                <div className="scale-125 md:scale-[1.5] relative z-10 transition-transform duration-1000">
                  <HarveyAvatar 
                    size="md" 
                    isTalking={isNarrating} 
                    accentColor={currentTurn.accent} 
                    serialId={`FACULTY_${currentTurn.personaId.toUpperCase()}`} 
                  />
                </div>
                {/* Spotlight Floor Glow */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-48 h-8 bg-white/5 blur-2xl rounded-full"></div>
             </div>

             <div className="text-center space-y-2 relative z-10">
                <h4 className="text-2xl md:text-4xl font-serif font-bold italic tracking-tighter uppercase" style={{ color: currentTurn.accent }}>{currentPersona.name}</h4>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em]">{currentPersona.role}</p>
             </div>
          </div>

          {/* Right: The Content Display (Slides) */}
          <div className="lg:col-span-7 space-y-10 md:space-y-16 text-left">
             <div className="space-y-6">
                <div className="flex items-center gap-4 text-gold-main/40">
                  <Monitor size={20} />
                  <span className="text-[10px] font-black uppercase tracking-[0.6em]">Visual_Feed: ACTIVE</span>
                </div>
                <div className="bg-slate-900/60 backdrop-blur-2xl border-2 border-white/5 rounded-[3rem] md:rounded-[4rem] p-10 md:p-16 shadow-3xl relative overflow-hidden group/slide transition-all hover:border-white/10">
                   <div className="absolute top-0 right-0 p-8 opacity-5"><currentPersona.icon size={180} /></div>
                   <div className="space-y-8 relative z-10">
                      <h3 className="text-3xl md:text-6xl font-serif font-bold text-white italic tracking-tight uppercase leading-none">
                        {currentTurn.slideTitle}
                      </h3>
                      <div className="h-px w-20 bg-white/20"></div>
                      <p className="text-xl md:text-3xl text-slate-300 font-light leading-relaxed italic border-l-4 pl-10" style={{ borderColor: currentTurn.accent }}>
                        "{currentTurn.speech}"
                      </p>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="bg-white/[0.03] border border-white/5 p-8 rounded-3xl space-y-3">
                   <span className="text-[9px] font-black uppercase text-gold-main/60 tracking-widest">Clinical Variable</span>
                   <p className="text-2xl font-serif font-bold text-white italic">{currentTurn.slideData}</p>
                </div>
                <button 
                  onClick={nextTurn}
                  className="w-full h-full py-8 bg-white text-slate-950 rounded-3xl font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl hover:bg-gold-main transition-all flex items-center justify-center gap-4 group/next active:scale-95"
                >
                  {currentTurnIdx === script.length - 1 ? 'End Keynote' : 'Proceed Sequence'} 
                  <ChevronRight size={20} className="group-hover/next:translate-x-1 transition-transform" />
                </button>
             </div>
          </div>

        </div>
      )}

      {phase === 'COMPLETE' && (
        <div className="max-w-3xl text-center space-y-12 animate-fade-in">
           <div className="w-24 h-24 md:w-32 md:h-32 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/40 mx-auto shadow-[0_0_50px_rgba(34,197,94,0.3)] animate-pulse">
              <ShieldCheck size={48} className="text-green-500" />
           </div>
           <div className="space-y-4">
              <h2 className="text-4xl md:text-7xl font-serif font-bold text-white italic uppercase tracking-tighter">Resonance <span className="text-green-500 not-italic">Established</span></h2>
              <p className="text-slate-400 text-lg md:text-2xl font-light italic leading-relaxed">
                The faculty council has completed the briefing. Your clinical identity is now synchronized with our core modules.
              </p>
           </div>
           <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button 
                onClick={onClose}
                className="px-12 py-6 bg-gold-main text-slate-950 rounded-2xl font-black uppercase tracking-widest text-xs shadow-gold hover:shadow-gold-strong transition-all active:scale-95"
              >
                Enter the Classroom
              </button>
              <button 
                onClick={() => { setPhase('IDLE'); setCurrentTurnIdx(0); }}
                className="px-10 py-6 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all"
              >
                Replay Briefing
              </button>
           </div>
        </div>
      )}

      {/* Presentation HUD Metadata */}
      {phase === 'ACTIVE' && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-md px-6 animate-slide-up">
           <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-[0.4em] text-white/20 mb-3">
              <span>Sequence Progress</span>
              <span>Node {currentTurnIdx + 1} / {script.length}</span>
           </div>
           <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden flex gap-1">
              {script.map((_, i) => (
                <div key={i} className={`flex-1 h-full transition-all duration-1000 ${i <= currentTurnIdx ? 'bg-gold-main shadow-gold' : 'bg-white/10'}`}></div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default MultibotPresentation;
