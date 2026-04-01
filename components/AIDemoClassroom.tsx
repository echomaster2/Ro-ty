
import React, { useState, useEffect, useRef } from 'react';
import { Bot, Sparkles, Zap, Loader2, MessageSquare, Play, RefreshCw, Terminal, Users, GraduationCap, Brain, Activity, Target, ShieldCheck, Volume2, VolumeX } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import HarveyAvatar from './HarveyAvatar';
import { useNarrator } from '../src/hooks/useNarrator';

interface Character {
  id: string;
  name: string;
  role: 'teacher' | 'student';
  color: string;
  voicePersona: string;
  position: { x: number; y: number };
}

const CHARACTERS: Character[] = [
  { id: 't1', name: 'Prof. Charon', role: 'teacher', color: '#B5944E', voicePersona: 'Charon', position: { x: 30, y: 35 } },
  { id: 't2', name: 'Dr. Kore', role: 'teacher', color: '#10b981', voicePersona: 'Kore', position: { x: 70, y: 35 } },
  { id: 's1', name: 'Unit Alpha', role: 'student', color: '#3b82f6', voicePersona: 'Student1', position: { x: 25, y: 70 } },
  { id: 's2', name: 'Unit Beta', role: 'student', color: '#ec4899', voicePersona: 'Student2', position: { x: 50, y: 75 } },
  { id: 's3', name: 'Unit Gamma', role: 'student', color: '#8b5cf6', voicePersona: 'Student3', position: { x: 75, y: 70 } },
];

interface ChatMessage {
  charId: string;
  text: string;
}

const AIDemoClassroom: React.FC = () => {
  const [sessionActive, setSessionActive] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { narrate, stopNarration, isNarrating } = useNarrator();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const startSeminar = async () => {
    if (sessionActive || isThinking) return;
    setSessionActive(true);
    setMessages([]);
    await runInteractionLoop();
  };

  const runInteractionLoop = async () => {
    setIsThinking(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const promptText = `Simulate a short academic seminar about "The Physics of Aliasing in Doppler Ultrasound".
      There are 2 teachers (Prof. Charon - wise, Dr. Kore - methodical) and 3 students (Alpha - eager, Beta - logical, Gamma - visual).
      Generate a dialogue script of 8 turns.
      Format: JSON array of objects with { charId, text }. 
      Character IDs: t1, t2, s1, s2, s3.
      Keep each response under 30 words. Make it feel like a real clinical discussion where teachers prompt students and students apply physics.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: promptText,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                charId: { type: Type.STRING, description: 'ID of the character speaking' },
                text: { type: Type.STRING, description: 'The text of the spoken turn' },
              },
              required: ['charId', 'text'],
            },
          },
        },
      });

      const script = JSON.parse(response.text || "[]");
      
      for (const turn of script) {
        const char = CHARACTERS.find(c => c.id === turn.charId);
        setActiveSpeakerId(turn.charId);
        
        // Narrate the turn
        const voice = char?.voicePersona === 'Charon' ? 'Charon' : 
                      char?.voicePersona === 'Kore' ? 'Kore' : 
                      char?.voicePersona === 'Student1' ? 'Zephyr' :
                      char?.voicePersona === 'Student2' ? 'Fenrir' : 'Puck';
                      
        if (!isMuted) {
          await narrate(turn.text, voice as any);
        }
        
        setMessages(prev => [...prev, turn]);
        
        // Wait for narration to finish or a minimum duration
        if (isMuted) {
          const duration = Math.max(3000, turn.text.length * 60);
          await new Promise(resolve => setTimeout(resolve, duration));
        } else {
          // useNarrator handles waiting if we await it, but let's ensure a small gap
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      setActiveSpeakerId(null);
    } catch (e) {
      console.error("Seminar Error:", e);
      setMessages(prev => [...prev, { charId: 't1', text: "Signal interference detected. We must re-establish resonance later." }]);
    } finally {
      setIsThinking(false);
    }
  };

  const resetMatrix = () => {
    setSessionActive(false);
    setMessages([]);
    stopNarration();
  };

  return (
    <div className="p-6 md:p-12 animate-fade-in text-left">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 border-b border-white/10 pb-12">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gold-main/10 rounded-2xl border border-gold-main/30 text-gold-main shadow-gold-dim">
                <Users size={24} />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.5em] text-white/50">Multi-Agent Academic Synthesis</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white italic tracking-tighter uppercase leading-none">Resonance <span className="text-gold-main not-italic">Seminar</span></h1>
            <p className="text-lg md:text-2xl text-slate-400 font-light italic leading-relaxed max-w-2xl text-balance">
              Witness a cinema-ready AI discourse between our virtual faculty units and persistent seekers.
            </p>
          </div>

          {!sessionActive ? (
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="p-6 bg-white/5 border-2 border-white/10 text-white rounded-[2rem] hover:bg-white/10 transition-all"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <button 
                onClick={startSeminar}
                className="flex-1 md:flex-none px-12 py-6 bg-gold-main text-slate-900 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs shadow-gold hover:shadow-gold-strong transition-all active:scale-95 flex items-center justify-center gap-5 group"
              >
                <Play size={20} fill="currentColor" className="group-hover:scale-125 transition-transform" /> Initiate Demo
              </button>
            </div>
          ) : (
            <button 
              onClick={resetMatrix}
              className="w-full md:w-auto px-12 py-6 bg-white/5 border-2 border-white/10 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-4"
            >
              <RefreshCw size={20} className={isThinking ? 'animate-spin' : ''} /> Reset Matrix
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 md:gap-12 items-start h-[600px] md:h-[800px]">
          {/* Virtual Classroom Viewport */}
          <div className="xl:col-span-8 bg-slate-950/40 backdrop-blur-3xl border-2 border-white/10 rounded-[4rem] relative overflow-hidden h-full shadow-3xl">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(181,148,78,0.06)_0%,transparent_70%)] opacity-50"></div>
             
             {/* Character Placements */}
             <div className="absolute inset-0 p-8 md:p-12">
                {CHARACTERS.map((char) => {
                  const isActive = activeSpeakerId === char.id;
                  return (
                    <div 
                      key={char.id}
                      className="absolute transition-all duration-1000 ease-in-out"
                      style={{ left: `${char.position.x}%`, top: `${char.position.y}%`, transform: 'translate(-50%, -50%)' }}
                    >
                      <div className="flex flex-col items-center gap-5 relative">
                          {isActive && (
                            <div 
                              className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white/95 border-2 px-6 py-2 rounded-2xl text-[10px] text-slate-950 font-black uppercase tracking-widest shadow-3xl animate-bounce mb-3 max-w-[160px] text-center z-30"
                              style={{ borderColor: char.color }}
                            >
                              Syncing Signal...
                            </div>
                          )}
                          
                          <div className="relative">
                            <HarveyAvatar 
                                size={char.role === 'teacher' ? 'md' : 'sm'} 
                                isTalking={isActive && isNarrating} 
                                accentColor={char.color} 
                            />
                            {char.role === 'teacher' && (
                              <div className="absolute -top-3 -right-2 bg-gold-main text-slate-950 p-1.5 rounded-lg shadow-gold z-20">
                                <GraduationCap size={16} />
                              </div>
                            )}
                          </div>

                          <div className="text-center space-y-1">
                             <p className={`text-[10px] md:text-xs font-black uppercase tracking-widest leading-none transition-all duration-500 ${isActive ? 'text-white' : 'text-white/40'}`} style={{ color: isActive ? char.color : undefined }}>{char.name}</p>
                             <div className={`h-0.5 w-6 md:w-8 mx-auto rounded-full transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-10'}`} style={{ backgroundColor: char.color }}></div>
                          </div>
                      </div>
                    </div>
                  );
                })}
             </div>

             {/* UI Overlays */}
             <div className="absolute bottom-10 left-12 pointer-events-none">
                <div className="flex items-center gap-4 bg-slate-950/80 backdrop-blur-xl border border-white/20 px-6 py-3 rounded-2xl shadow-2xl">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                   <span className="text-[10px] md:text-xs font-mono font-bold text-white/60 tracking-widest uppercase">Classroom_Simulation: READY</span>
                </div>
             </div>
          </div>

          {/* Transcript Log */}
          <div className="xl:col-span-4 flex flex-col h-full space-y-6 md:space-y-10">
              <div className="flex items-center justify-between px-4">
                  <div className="flex items-center gap-4 text-gold-main">
                      <Terminal size={20} />
                      <span className="text-xs font-black uppercase tracking-[0.5em]">Session Transcript</span>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-mono text-white/30 uppercase tracking-widest">Live_Log</div>
              </div>

              <div ref={scrollRef} className="flex-1 bg-slate-900/40 backdrop-blur-3xl border-2 border-white/5 rounded-[3.5rem] p-8 md:p-10 overflow-y-auto custom-scrollbar space-y-8 shadow-3xl">
                 {messages.map((msg, i) => {
                   const char = CHARACTERS.find(c => c.id === msg.charId);
                   return (
                     <div key={i} className="animate-slide-up space-y-3">
                        <div className="flex items-center gap-3">
                           <div className="w-2 h-2 rounded-full shadow-lg" style={{ backgroundColor: char?.color }}></div>
                           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">{char?.name}</span>
                        </div>
                        <div className="prose prose-invert max-w-none">
                            <p className="text-sm md:text-base lg:text-lg text-slate-100 italic font-serif leading-relaxed border-l-2 pl-5" style={{ borderColor: char?.color + '66' }}>
                                "{msg.text}"
                            </p>
                        </div>
                     </div>
                   );
                 })}
                 {isThinking && messages.length === 0 && (
                   <div className="flex flex-col items-center justify-center h-full gap-6 text-gold-main/40 animate-pulse">
                      <Loader2 size={48} className="animate-spin" />
                      <span className="text-xs font-black uppercase tracking-[0.4em]">Initializing Core Sync...</span>
                   </div>
                 )}
                 {messages.length === 0 && !isThinking && (
                   <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-20">
                      <MessageSquare size={72} strokeWidth={1} />
                      <p className="text-xs font-black uppercase tracking-[0.5em] max-w-[200px] leading-relaxed">Establish link to observe multi-agent pedagogy</p>
                   </div>
                 )}
              </div>

              <div className="p-8 bg-gold-main/5 border-2 border-gold-main/20 rounded-[3rem] space-y-4 group hover:bg-gold-main/10 transition-all duration-1000 shadow-xl">
                  <div className="flex items-center gap-4 text-gold-main">
                      <Brain size={20} className="group-hover:scale-125 transition-transform" />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em]">Faculty Observation</span>
                  </div>
                  <p className="text-sm text-slate-300 font-sans italic leading-relaxed border-l-2 border-gold-main/40 pl-6">
                      "Collective logic is the cornerstone of clinical precision. Watch how the students challenge the professor's constants."
                  </p>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDemoClassroom;
