
import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Sparkles, Tv, Loader2, Play, 
  ArrowRight, X, UserCheck, ShieldAlert,
  Mic2, Monitor, Zap, Trophy, Heart,
  Terminal, Activity, Users, Radio,
  GraduationCap, Volume2, VolumeX
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import HarveyAvatar from './HarveyAvatar';
import { useNarrator } from '../src/hooks/useNarrator';

const CACHE_NAME = 'echomasters-media-vault-v1';

interface Screenplay {
  hostIntro: string;
  guestPersona: string;
  guestRemark: string;
  question: string;
  options: string[];
  correctAnswer: number;
  hostVerdict: string;
}

interface AIGameShowProps {
  onClose: () => void;
  onPlayResultSound?: (isCorrect: boolean) => void;
}

type Phase = 'INITIALIZING' | 'HOST_INTRO' | 'GUEST_SIGNAL' | 'USER_DECISION' | 'POST_SOUND' | 'HOST_VERDICT';

const GUESTS = [
  { name: 'Dr. Kore', color: '#10b981', icon: Activity },
  { name: 'Prof. Charon', color: '#B5944E', icon: GraduationCap },
  { name: 'Unit Alpha', color: '#3b82f6', icon: Bot }
];

const AIGameShow: React.FC<AIGameShowProps> = ({ onClose, onPlayResultSound }) => {
  const [phase, setPhase] = useState<Phase>('INITIALIZING');
  const [screenplay, setScreenplay] = useState<Screenplay | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [activeGuest, setActiveGuest] = useState(GUESTS[0]);
  const [isMuted, setIsMuted] = useState(false);
  
  const { narrate, stopNarration, isNarrating } = useNarrator();

  const speakText = async (text: string, voice: 'Harvey' | 'Guest' = 'Harvey') => {
    if (isMuted) return;
    const voiceName = voice === 'Harvey' ? 'Fenrir' : 'Kore';
    await narrate(text, voiceName as any);
  };

  useEffect(() => {
    generateScript();
    return () => stopNarration();
  }, []);

  useEffect(() => {
    if (phase === 'HOST_INTRO' && screenplay) {
      speakText(screenplay.hostIntro, 'Harvey');
    } else if (phase === 'GUEST_SIGNAL' && screenplay) {
      speakText(screenplay.guestRemark, 'Guest');
    } else if (phase === 'USER_DECISION' && screenplay) {
      speakText(screenplay.question, 'Harvey');
    } else if (phase === 'HOST_VERDICT' && screenplay) {
      speakText(screenplay.hostVerdict, 'Harvey');
    }
  }, [phase, screenplay]);

  const generateScript = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const guest = GUESTS[Math.floor(Math.random() * GUESTS.length)];
      setActiveGuest(guest);

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a short "Acoustic Game Show" script for a Sonography SPI challenge.
        Host: Professor Harvey (wise, paternal bot).
        Celebrity Guest: ${guest.name}.
        The script MUST be valid JSON.
        
        Format:
        {
          "hostIntro": "Harvey's enthusiastic welcome and introduction of the guest.",
          "guestPersona": "${guest.name}",
          "guestRemark": "A clever, high-yield physics hint or perspective related to a board topic.",
          "question": "A challenging SPI board-style multiple choice question.",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": 0,
          "hostVerdict": "Harvey's funny and wise wrap-up after the answer is revealed."
        }`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              hostIntro: { type: Type.STRING },
              guestPersona: { type: Type.STRING },
              guestRemark: { type: Type.STRING },
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.NUMBER },
              hostVerdict: { type: Type.STRING },
            },
            required: ["hostIntro", "guestPersona", "guestRemark", "question", "options", "correctAnswer", "hostVerdict"],
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      setScreenplay(data);
      setPhase('HOST_INTRO');
    } catch (e) {
      console.error(e);
      onClose();
    }
  };

  const handleDecision = (idx: number) => {
    if (phase !== 'USER_DECISION') return;
    setSelectedIdx(idx);
    
    const isCorrect = idx === screenplay?.correctAnswer;
    onPlayResultSound?.(isCorrect);
    
    setPhase('POST_SOUND');
    setTimeout(() => setPhase('HOST_VERDICT'), 1200);
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-950/95 backdrop-blur-3xl flex items-center justify-center p-4 md:p-12 animate-fade-in overflow-y-auto">
      <div className="absolute top-6 right-6 md:top-10 md:right-10 z-[1010] flex items-center gap-4">
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="p-4 bg-white/10 border border-white/20 rounded-2xl text-white/60 hover:text-white transition-all shadow-2xl"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX size={28} /> : <Volume2 size={28} />}
        </button>
        <button onClick={onClose} className="p-4 bg-white/10 border border-white/20 rounded-2xl text-white/60 hover:text-white transition-all hover:rotate-90 shadow-2xl">
          <X size={28} />
        </button>
      </div>

      <div className="max-w-6xl w-full flex flex-col gap-6 md:gap-10 relative">
        
        {/* Stage Perspective Grid */}
        <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none perspective-1000 hidden md:block">
           <div className="w-full h-full bg-grid-gold animate-[radar-sweep_12s_linear_infinite] rotate-x-60"></div>
        </div>

        {/* The Show HUD */}
        <div className="flex justify-between items-center border-b border-white/10 pb-8 relative z-10">
           <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-purple-600 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(147,51,234,0.5)] animate-pulse shrink-0">
                <Tv size={36} className="text-white" />
              </div>
              <div className="text-left">
                <h2 className="text-2xl md:text-4xl font-serif font-bold text-white italic tracking-tighter uppercase leading-none">Elite <span className="text-purple-400">Resonance</span></h2>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mt-2">Faculty Broadcast: CHANNEL_07</p>
              </div>
           </div>
           <div className="hidden lg:flex gap-6">
              <HUDStat label="Uplink Viewers" value="1,248" icon={Users} />
              <HUDStat label="Sync Fidelity" value="99.8%" icon={Radio} />
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 relative z-10 items-stretch">
          
          {/* Main Visual Node (Stage) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
             <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-[3.5rem] p-8 md:p-16 relative overflow-hidden min-h-[450px] md:h-[500px] shadow-3xl flex flex-col justify-center text-center">
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 to-transparent"></div>
                
                {phase === 'INITIALIZING' && (
                  <div className="space-y-8 flex flex-col items-center">
                    <Loader2 size={64} className="text-purple-400 animate-spin" />
                    <p className="text-xs font-black uppercase text-white/30 tracking-[0.6em] animate-pulse">Establishing Node Link...</p>
                  </div>
                )}

                {phase === 'HOST_INTRO' && (
                  <div className="space-y-10 animate-slide-up flex flex-col items-center">
                    <div className="scale-110 md:scale-125 mb-4">
                      <HarveyAvatar size="md" isTalking={isNarrating} accentColor="#B5944E" />
                    </div>
                    <div className="bg-slate-950/60 border-2 border-gold-main/40 p-8 md:p-12 rounded-[3rem] shadow-2xl relative w-full">
                       <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 bg-gold-main text-slate-950 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">Harvey Broadcast</div>
                       <p className="text-2xl md:text-4xl font-serif italic text-white leading-relaxed">
                          "{screenplay?.hostIntro}"
                       </p>
                    </div>
                    <button onClick={() => setPhase('GUEST_SIGNAL')} className="px-12 py-6 bg-purple-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-[0_0_40px_rgba(147,51,234,0.4)] hover:scale-105 transition-all flex items-center justify-center gap-5 mx-auto group active:scale-95">
                      Meet the Guest <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                    </button>
                  </div>
                )}

                {phase === 'GUEST_SIGNAL' && (
                  <div className="space-y-10 animate-slide-up flex flex-col items-center">
                    <div className="flex flex-col items-center gap-6">
                      <div className="scale-110 md:scale-125 mb-2">
                        <HarveyAvatar size="md" isTalking={isNarrating} accentColor={activeGuest.color} />
                      </div>
                      <span className="text-xs font-black uppercase tracking-[0.6em]" style={{ color: activeGuest.color }}>{activeGuest.name}</span>
                    </div>
                    <div className="bg-white/[0.04] border border-white/10 p-8 md:p-12 rounded-[3rem] shadow-inner relative overflow-hidden w-full">
                       <div className="absolute top-6 left-8 opacity-10"><Mic2 size={40} /></div>
                       <p className="text-xl md:text-3xl font-serif italic text-slate-100 leading-relaxed relative z-10">
                          "{screenplay?.guestRemark}"
                       </p>
                    </div>
                    <button onClick={() => setPhase('USER_DECISION')} className="px-12 py-6 bg-gold-main text-slate-950 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-gold hover:scale-105 transition-all flex items-center justify-center gap-5 mx-auto active:scale-95">
                      Initiate Challenge <Zap size={20} fill="currentColor" />
                    </button>
                  </div>
                )}

                {(phase === 'USER_DECISION' || phase === 'POST_SOUND' || phase === 'HOST_VERDICT') && (
                  <div className="space-y-10 animate-slide-up">
                    <div className="inline-flex items-center gap-4 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-white/50 uppercase tracking-[0.6em] mx-auto shadow-inner">
                      <Terminal size={18} /> Board Protocol Query
                    </div>
                    <h3 className="text-2xl md:text-4xl lg:text-5xl font-serif font-bold text-white italic tracking-tight leading-snug px-6 md:px-12 text-balance">
                      {screenplay?.question}
                    </h3>
                    <div className="flex items-center justify-center gap-4 text-white/10">
                       <div className="h-0.5 w-16 bg-white/10 rounded-full"></div>
                       <span className="text-[10px] font-black uppercase tracking-[0.4em]">Decisions Locked</span>
                       <div className="h-0.5 w-16 bg-white/10 rounded-full"></div>
                    </div>
                  </div>
                )}
             </div>

             {/* Verdict Reveal (Phase 5) */}
             {phase === 'HOST_VERDICT' && (
               <div className="p-10 md:p-16 bg-gold-main text-slate-950 rounded-[4rem] animate-slide-up shadow-gold relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-12 opacity-[0.08] group-hover:scale-110 transition-transform"><Trophy size={180} /></div>
                  <div className="flex items-center gap-8 mb-8">
                    <div className="shrink-0 scale-110">
                      <HarveyAvatar size="sm" isTalking={isNarrating} accentColor="#000000" />
                    </div>
                    <div>
                      <h4 className="text-3xl md:text-4xl font-serif font-bold italic tracking-tighter uppercase leading-tight">Faculty Verdict</h4>
                      <p className="text-[10px] font-black text-slate-950/60 uppercase tracking-[0.6em] mt-1">Synchronization Successful</p>
                    </div>
                  </div>
                  <p className="text-xl md:text-3xl font-bold italic leading-relaxed border-l-4 border-slate-950/20 pl-10">
                    "{screenplay?.hostVerdict}"
                  </p>
                  <button onClick={onClose} className="mt-12 px-12 py-6 bg-slate-950 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-900 transition-all flex items-center justify-center gap-5 group shadow-2xl active:scale-95">
                    Return to Lobby <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
               </div>
             )}
          </div>

          {/* Right Column: Decisions (Game Show Buttons) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
             <div className="bg-slate-950/60 backdrop-blur-3xl border-2 border-white/10 rounded-[3.5rem] p-8 md:p-10 h-full shadow-2xl flex flex-col gap-5">
                <div className="flex items-center justify-between px-3 mb-6">
                    <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white/30">Logic Control Pad</span>
                    <ShieldAlert size={18} className="text-white/20" />
                </div>
                
                {screenplay?.options.map((opt, idx) => {
                  const isAnswered = phase !== 'USER_DECISION' && phase !== 'GUEST_SIGNAL' && phase !== 'HOST_INTRO';
                  const isSelected = selectedIdx === idx;
                  const isCorrect = idx === screenplay?.correctAnswer;
                  
                  let btnStyle = "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-purple-400/50";
                  if (isAnswered) {
                    if (isCorrect) btnStyle = "bg-green-500 text-slate-950 border-green-500 shadow-green scale-[1.03] z-10";
                    else if (isSelected) btnStyle = "bg-red-500/20 border-red-500 text-red-500 opacity-50";
                    else btnStyle = "bg-white/2 border-white/5 opacity-10 grayscale pointer-events-none";
                  }

                  return (
                    <button 
                      key={idx}
                      disabled={phase !== 'USER_DECISION'}
                      onClick={() => handleDecision(idx)}
                      className={`flex-1 min-h-[80px] p-6 rounded-2xl border text-left text-base md:text-lg font-bold transition-all duration-500 relative group overflow-hidden shadow-lg ${btnStyle}`}
                    >
                      <div className="flex items-center justify-between relative z-10">
                         <span className="pr-4">{String.fromCharCode(65 + idx)}. {opt}</span>
                         {isAnswered && isCorrect && <CheckCircle2 size={24} />}
                      </div>
                    </button>
                  );
                })}

                <div className="mt-auto pt-10 border-t border-white/10 space-y-5">
                   <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/30 px-2">
                      <span>Sync Status</span>
                      <span className={phase === 'USER_DECISION' ? 'text-purple-400 animate-pulse' : 'text-white/10'}>
                        {phase === 'USER_DECISION' ? 'Awaiting Input' : 'Signal Processing'}
                      </span>
                   </div>
                   <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden shadow-inner">
                      <div className={`h-full bg-purple-600 transition-all duration-[3000ms] linear ${phase === 'USER_DECISION' ? 'w-full shadow-purple' : 'w-0'}`}></div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      <style>{`
        .bg-grid-gold {
          background-size: 60px 60px;
          background-image: 
            linear-gradient(to right, rgba(181, 148, 78, 0.08) 1.5px, transparent 1.5px),
            linear-gradient(to bottom, rgba(181, 148, 78, 0.08) 1.5px, transparent 1.5px);
        }
        .perspective-1000 { perspective: 1200px; }
        .rotate-x-60 { transform: rotateX(60deg); }
        .shadow-purple { box-shadow: 0 0 20px rgba(147, 51, 234, 0.6); }
      `}</style>
    </div>
  );
};

const HUDStat = ({ label, value, icon: Icon }: any) => (
  <div className="flex items-center gap-4 px-8 py-4 bg-white/5 rounded-2xl border border-white/10 shadow-inner">
     <Icon size={20} className="text-purple-400" />
     <div className="text-left">
        <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] leading-none mb-1.5">{label}</p>
        <p className="text-base font-mono font-bold text-white leading-none">{value}</p>
     </div>
  </div>
);

const CheckCircle2 = ({ size }: any) => <div className="text-current shrink-0 ml-2"><Zap size={size} fill="currentColor" /></div>;

export default AIGameShow;
