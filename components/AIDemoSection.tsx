import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Play, Terminal, Activity, Users, GraduationCap, Brain, ShieldCheck, Loader2, Volume2, VolumeX } from 'lucide-react';
import { generateAIContent } from '../src/lib/aiService';
import { Type } from "@google/genai";
import HarveyAvatar from './HarveyAvatar';
import { useNarrator } from '../src/hooks/useNarrator';

interface Character {
  id: string;
  name: string;
  role: 'teacher' | 'student';
  color: string;
  voice: 'Charon' | 'Kore' | 'Zephyr' | 'Puck' | 'Fenrir';
  // Responsive positions: [mobile_x, mobile_y, desktop_x, desktop_y]
  pos: [number, number, number, number];
}

const CHARACTERS: Character[] = [
  { id: 't1', name: 'Prof. Charon', role: 'teacher', color: '#B5944E', voice: 'Charon', pos: [30, 25, 30, 35] },
  { id: 't2', name: 'Dr. Kore', role: 'teacher', color: '#10b981', voice: 'Kore', pos: [70, 25, 70, 35] },
  { id: 's1', name: 'Alpha', role: 'student', color: '#3b82f6', voice: 'Zephyr', pos: [20, 75, 25, 70] },
  { id: 's2', name: 'Beta', role: 'student', color: '#ec4899', voice: 'Puck', pos: [50, 80, 50, 75] },
  { id: 's3', name: 'Gamma', role: 'student', color: '#8b5cf6', voice: 'Fenrir', pos: [80, 75, 75, 70] },
];

const CACHE_NAME = 'echomasters-media-vault-v1';

const AIDemoSection: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [messages, setMessages] = useState<{ charId: string; text: string }[]>([]);
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { narrate, stopNarration, isNarrating } = useNarrator();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isThinking]);

  const startDemo = async () => {
    if (isActive || isThinking) return;
    setIsActive(true);
    setMessages([]);
    await runSimulation();
  };

  const runSimulation = async () => {
    setIsThinking(true);
    try {
      const prompt = `Simulate an elite ARDMS SPI clinical seminar demo. 
      2 Teachers: Prof. Charon, Dr. Kore.
      3 Students: Alpha, Beta, Gamma.
      Subject: "The mystery of the 13-microsecond rule."
      Generate 6 turns of dialogue as a JSON array of {charId, text}.
      IDs: t1, t2, s1, s2, s3. Keep each turn under 20 words.`;

      const response = await generateAIContent(prompt, {
        model: 'gemini-3-flash-preview',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              charId: { type: Type.STRING },
              text: { type: Type.STRING },
            },
            required: ['charId', 'text'],
          },
        },
      });

      const script = JSON.parse(response.text || "[]");
      
      for (const turn of script) {
        const char = CHARACTERS.find(c => c.id === turn.charId);
        setActiveSpeakerId(turn.charId);
        
        if (!isMuted && char) {
          try {
            await narrate(turn.text, char.voice);
          } catch (err) {
            console.error("TTS Error:", err);
            await new Promise(r => setTimeout(r, 1500));
          }
        } else {
          await new Promise(r => setTimeout(r, 1000));
        }

        setMessages(prev => [...prev, turn]);
        // Wait for narration to finish or a minimum duration
        const duration = Math.max(2000, turn.text.length * 50);
        await new Promise(r => setTimeout(r, duration));
      }
      setActiveSpeakerId(null);
    } catch (e) {
      setMessages([{ charId: 't1', text: "Signal interference detected. Re-sync node." }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <section id="ai-demo" className="py-16 md:py-32 bg-transparent relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-12 relative z-10 text-left">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12 md:mb-20 space-y-4 md:space-y-8">
          <div className="inline-flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 rounded-full bg-gold-main/10 border border-gold-main/20 text-[8px] md:text-[10px] font-black text-gold-main uppercase tracking-[0.4em]">
             <Activity size={10} className="animate-pulse" /> Live Preview
          </div>
          <h2 className="text-3xl md:text-6xl lg:text-7xl font-serif font-bold text-white tracking-tight leading-tight uppercase italic">
            The <span className="text-gold-main not-italic">Multi-Agent</span> <br className="hidden md:block" /> Academy
          </h2>
          <p className="text-base md:text-2xl text-slate-300 font-light italic leading-relaxed border-l-4 border-gold-main/20 pl-6 md:pl-8">
            Observe the collective logic of our **Unit_H faculty** in real-time.
          </p>
        </div>

        {/* Demo Stage */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch h-auto xl:h-[850px]">
          
          {/* Main Visual Arena */}
          <div className="xl:col-span-8 bg-slate-900/60 backdrop-blur-3xl border-2 border-white/5 rounded-[2.5rem] md:rounded-[4rem] relative overflow-hidden shadow-3xl group min-h-[450px] md:min-h-[600px]">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(181,148,78,0.08)_0%,transparent_75%)] opacity-50"></div>
             
             {/* Virtual Seminar Space */}
             <div className="absolute inset-0 p-6 md:p-12">
                {CHARACTERS.map((char) => {
                  const isActiveSpeaker = activeSpeakerId === char.id;
                  const xPos = isMobile ? char.pos[0] : char.pos[2];
                  const yPos = isMobile ? char.pos[1] : char.pos[3];

                  return (
                    <div 
                      key={char.id}
                      className="absolute transition-all duration-1000 ease-in-out"
                      style={{ left: `${xPos}%`, top: `${yPos}%`, transform: 'translate(-50%, -50%)' }}
                    >
                      <div className="flex flex-col items-center gap-3 md:gap-6 relative group/char">
                          {isActiveSpeaker && (
                            <div className="absolute -top-12 md:-top-16 left-1/2 -translate-x-1/2 bg-white/95 border-2 px-3 md:px-6 py-1 md:py-2 rounded-xl md:rounded-2xl text-[7px] md:text-[9px] text-slate-950 font-black uppercase tracking-widest shadow-3xl animate-bounce z-30 whitespace-nowrap" style={{ borderColor: char.color }}>
                              Syncing...
                            </div>
                          )}
                          
                          <div className={`relative transition-all duration-700 ${isActiveSpeaker ? 'scale-110' : 'scale-100 opacity-60 grayscale-[0.5]'}`}>
                            <HarveyAvatar 
                                size={char.role === 'teacher' ? (isMobile ? 'sm' : 'md') : 'sm'} 
                                isTalking={isActiveSpeaker && isNarrating} 
                                isThinking={isActiveSpeaker && isThinking}
                                accentColor={char.color} 
                                serialId={char.role === 'teacher' ? `FACULTY_${char.name.split(' ')[1].toUpperCase()}` : `STUDENT_${char.name.toUpperCase()}`}
                            />
                            {char.role === 'teacher' && (
                              <div className="absolute -top-2 md:-top-4 -right-2 md:-right-3 bg-gold-main text-slate-950 p-1 md:p-2 rounded-lg md:rounded-xl shadow-gold z-20 border border-slate-950">
                                <GraduationCap size={isMobile ? 12 : 16} />
                              </div>
                            )}
                          </div>

                          <div className="text-center space-y-1">
                             <p className="text-[7px] md:text-xs font-black uppercase tracking-widest transition-colors duration-500" style={{ color: isActiveSpeaker ? char.color : 'rgba(255,255,255,0.3)' }}>{char.name}</p>
                             <div className={`h-0.5 md:h-1 w-4 md:w-8 mx-auto rounded-full transition-all duration-500 ${isActiveSpeaker ? 'opacity-100 scale-x-125 shadow-lg' : 'opacity-10 scale-x-50'}`} style={{ backgroundColor: char.color }}></div>
                          </div>
                      </div>
                    </div>
                  );
                })}
             </div>

             {/* UI HUD Overlay */}
             <div className="absolute bottom-6 md:bottom-10 left-6 md:left-12 pointer-events-none flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                <div className="flex items-center gap-3 md:gap-4 bg-slate-950/90 backdrop-blur-2xl border border-white/10 px-4 md:px-8 py-2 md:py-4 rounded-2xl md:rounded-3xl shadow-3xl">
                   <div className="flex gap-1">
                      <div className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <div className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-white/10"></div>
                   </div>
                   <span className="text-[8px] md:text-[11px] font-mono font-bold text-white/60 tracking-widest uppercase">Demo_Sim: READY</span>
                </div>
             </div>

             {/* Dark Glass Start Overlay */}
             {!isActive && (
               <div className="absolute inset-0 z-40 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-6">
                  <button 
                    onClick={startDemo}
                    className="group flex flex-col items-center gap-4 md:gap-8 hover:scale-105 transition-all duration-500"
                  >
                     <div className="w-20 h-20 md:w-40 md:h-40 rounded-full bg-gold-main text-slate-950 flex items-center justify-center shadow-gold hover:shadow-gold-strong transition-all active:scale-95">
                        <Play size={32} fill="currentColor" className="ml-1 md:ml-2 group-hover:scale-110 transition-transform" />
                     </div>
                     <div className="space-y-1 md:space-y-2 text-center">
                        <h4 className="text-lg md:text-3xl font-serif font-bold text-white italic uppercase tracking-tighter">Enter Academy Preview</h4>
                        <p className="text-[7px] md:text-[10px] font-black text-gold-main uppercase tracking-[0.4em] opacity-60">Initiate Flash Synapse</p>
                     </div>
                  </button>
               </div>
             )}
          </div>

          {/* Transcript / Event Log */}
          <div className="xl:col-span-4 flex flex-col h-auto md:h-[600px] xl:h-full space-y-6 md:space-y-10">
              <div className="flex items-center justify-between px-2 md:px-4">
                  <div className="flex items-center gap-3 md:gap-4 text-gold-main">
                      <Terminal size={18} />
                      <span className="text-[9px] md:text-xs font-black uppercase tracking-[0.5em]">Real-time Log</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-2 text-white/20 hover:text-white transition-all"
                      title={isMuted ? "Unmute Narration" : "Mute Narration"}
                    >
                      {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                    <button 
                      onClick={() => { setIsActive(false); setMessages([]); setActiveSpeakerId(null); }}
                      className="p-2 text-white/20 hover:text-white transition-all"
                    >
                      <RotateCcw size={16} />
                    </button>
                  </div>
              </div>

              <div ref={scrollRef} className="flex-1 bg-slate-950/40 backdrop-blur-3xl border-2 border-white/5 rounded-[2rem] md:rounded-[3.5rem] p-6 md:p-10 overflow-y-auto custom-scrollbar space-y-8 md:space-y-10 shadow-inner max-h-[400px] xl:max-h-none">
                 {messages.map((msg, i) => {
                   const char = CHARACTERS.find(c => c.id === msg.charId);
                   return (
                     <div key={i} className="animate-slide-up space-y-3 md:space-y-4">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2 md:gap-3">
                              <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full shadow-lg" style={{ backgroundColor: char?.color }}></div>
                              <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-white/30">{char?.name}</span>
                           </div>
                           <span className="text-[7px] md:text-[8px] font-mono text-white/10 uppercase">{char?.role}</span>
                        </div>
                        <div className="relative">
                            <p className="text-sm md:text-xl text-slate-100 italic font-serif leading-relaxed border-l-2 pl-4 md:pl-6" style={{ borderColor: char?.color + '44' }}>
                                "{msg.text}"
                            </p>
                        </div>
                     </div>
                   );
                 })}
                 
                 {isThinking && messages.length === 0 && (
                   <div className="flex flex-col items-center justify-center h-full gap-6 md:gap-8 text-gold-main/40">
                      <Loader2 size={32} className="animate-spin" />
                      <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Syncing...</span>
                   </div>
                 )}

                 {messages.length === 0 && !isThinking && (
                   <div className="flex flex-col items-center justify-center h-full text-center space-y-6 md:space-y-8 opacity-20 group-hover:opacity-40 transition-opacity py-12">
                      <Users size={64} strokeWidth={1} />
                      <div className="space-y-1 md:space-y-2 px-6">
                        <p className="text-[9px] md:text-xs font-black uppercase tracking-[0.6em]">Faculty Standby</p>
                        <p className="text-[8px] md:text-[10px] italic font-serif leading-relaxed">Waiting for student interaction...</p>
                      </div>
                   </div>
                 )}
              </div>

              {/* CTA Insight */}
              <div className="p-6 md:p-10 bg-gold-main/5 border-2 border-gold-main/20 rounded-[2rem] md:rounded-[3.5rem] space-y-4 md:space-y-6 shadow-2xl relative overflow-hidden group/cta">
                  <div className="absolute top-0 right-0 p-4 md:p-8 opacity-5 group-hover/cta:scale-110 transition-transform"><ShieldCheck size={100} /></div>
                  <div className="flex items-center gap-3 md:gap-5 text-gold-main">
                      <Brain size={18} className="group-hover/cta:rotate-12 transition-transform" />
                      <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.4em]">Faculty Insight</span>
                  </div>
                  <p className="text-sm md:text-lg text-slate-300 font-sans italic leading-relaxed border-l-2 border-gold-main/40 pl-6 md:pl-8">
                      "Collective logic ensures perfect resonance. Observe. Pass. Prevail."
                  </p>
              </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIDemoSection;