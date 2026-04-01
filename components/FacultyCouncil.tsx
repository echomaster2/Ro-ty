
import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Zap, MessageSquare, Loader2, Sparkles, 
  Terminal, Activity, Users, ShieldCheck, 
  Cpu, GraduationCap, Brain, Mic, Send, X,
  LayoutGrid, Waves, Volume2, VolumeX
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import HarveyAvatar from './HarveyAvatar';
import { useNarrator } from '../src/hooks/useNarrator';

interface CouncilResponse {
  persona: 'Charon' | 'Kore' | 'Puck' | 'Zephyr';
  text: string;
  isThinking: boolean;
}

const FACULTY_PERSONAS = [
  { id: 'Charon', name: 'Prof. Charon', role: 'Chief Strategist', color: '#B5944E', description: 'Wise, paternal, focuses on board logic and mnemonics.' },
  { id: 'Kore', name: 'Dr. Kore', role: 'Technical Lead', color: '#10b981', description: 'Methodical, precise, focuses on equipment and physics laws.' },
  { id: 'Puck', name: 'Specialist Puck', role: 'Resonance Analyst', color: '#3b82f6', description: 'Energetic, fast-paced, focuses on high-speed pattern recognition.' },
  { id: 'Zephyr', name: 'Mentor Zephyr', role: 'Safety Warden', color: '#ec4899', description: 'Authoritative, cautious, focuses on bioeffects and ALARA.' },
];

const FacultyCouncil: React.FC = () => {
  const { narrate, isNarrating, isThinking: isNarratorThinking } = useNarrator();
  const [prompt, setPrompt] = useState("");
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [thinkingStates, setThinkingStates] = useState<Record<string, boolean>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  const consultCouncil = async () => {
    if (!prompt.trim()) return;

    const currentPrompt = prompt;
    setPrompt("");
    setResponses({});
    
    const initialThinking: Record<string, boolean> = {};
    FACULTY_PERSONAS.forEach(p => initialThinking[p.id] = true);
    setThinkingStates(initialThinking);

    // Generate responses from all personas
    FACULTY_PERSONAS.forEach(async (persona) => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const res = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `ACT AS PROFESSOR ${persona.id}. Subject: "${currentPrompt}". 
          Context: You are part of a 4-person Faculty Council at EchoMasters. 
          Respond from your unique perspective: ${persona.description}. 
          Keep it under 60 words. Be elite, encouraging, and clinical.
          STRICT INSTRUCTION: DO NOT USE ANY SYMBOLS IN THE GENERATED TEXT. No commas, no periods, no percentages, no hashes, no at-signs, no asterisks, no ampersands. Use only letters, numbers, and spaces.`,
        });

        setResponses(prev => ({ ...prev, [persona.id]: res.text || "Signal attenuation detected." }));
      } catch (e) {
        setResponses(prev => ({ ...prev, [persona.id]: "My synaptic link failed to establish resonance." }));
      } finally {
        setThinkingStates(prev => ({ ...prev, [persona.id]: false }));
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-10 py-6 md:py-12 space-y-12 animate-fade-in text-left pb-40 font-sans">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border-b border-white/10 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gold-main/10 rounded-lg border border-gold-main/20">
              <Users size={18} className="text-gold-main animate-pulse" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Collective Intelligence Module</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-serif font-bold text-white italic tracking-tighter uppercase leading-none">
            Multibot <span className="text-gold-main not-italic">Council</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-xl font-light italic border-l-2 border-gold-main/20 pl-6 max-w-2xl">
            Establish a high-fidelity sync with the entire EchoMasters faculty. Receive four unique clinical perspectives on a single physics node.
          </p>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-slate-900 border-2 border-white/5 rounded-[3rem] p-8 md:p-12 shadow-3xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
          <GraduationCap size={240} />
        </div>
        <div className="relative z-10 space-y-8">
          <div className="flex items-center gap-4 text-gold-main">
            <Terminal size={20} />
            <span className="text-[11px] font-black uppercase tracking-[0.5em]">Global_Query_Protocol: ACTIVE</span>
          </div>
          <div className="relative">
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && consultCouncil()}
              placeholder="Query the Council (e.g., 'Explain the relationship between PRF and the Nyquist Limit')..."
              className="w-full h-32 md:h-40 bg-slate-950 border border-white/10 rounded-[2.5rem] p-8 text-white font-serif italic text-lg md:text-2xl focus:border-gold-main transition-all outline-none resize-none placeholder:text-white/10 shadow-inner"
            />
            <button 
              onClick={consultCouncil}
              disabled={!prompt.trim() || Object.values(thinkingStates).some(v => v)}
              className="absolute bottom-6 right-8 bg-gold-main text-slate-950 p-5 rounded-2xl shadow-gold hover:scale-105 active:scale-95 transition-all disabled:opacity-20 disabled:grayscale"
            >
              <Send size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid of responses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {FACULTY_PERSONAS.map((persona) => {
          const isThinking = thinkingStates[persona.id];
          const response = responses[persona.id];

          return (
            <div 
              key={persona.id}
              className={`p-10 rounded-[3.5rem] border-2 transition-all duration-700 relative overflow-hidden flex flex-col gap-8 ${response ? 'bg-slate-900 border-white/10 shadow-2xl' : 'bg-slate-950/40 border-white/5 opacity-40'}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="absolute -inset-2 blur-xl opacity-20 animate-pulse rounded-full" style={{ backgroundColor: persona.color }}></div>
                    <HarveyAvatar size="sm" isTalking={!!response && !isThinking} accentColor={persona.color} serialId={`FACULTY_${persona.id.toUpperCase()}`} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif font-bold italic text-white tracking-tight leading-none" style={{ color: response ? '#fff' : persona.color }}>{persona.name}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-40">{persona.role}</p>
                  </div>
                </div>
                {isThinking && <Loader2 size={24} className="text-gold-main animate-spin" />}
                {response && (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => narrate(response, persona.id)}
                      disabled={isNarratorThinking}
                      className={`p-2 rounded-lg border transition-all ${isNarrating ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-gold-main/10 border-gold-main/20 text-gold-main hover:bg-gold-main/20'}`}
                    >
                      {isNarratorThinking ? <Loader2 size={12} className="animate-spin" /> : isNarrating ? <VolumeX size={12} /> : <Volume2 size={12} />}
                    </button>
                    <ShieldCheck size={20} className="text-green-500/40" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-h-[120px] flex flex-col justify-center">
                {isThinking ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-2 w-full bg-white/5 rounded-full"></div>
                    <div className="h-2 w-4/5 bg-white/5 rounded-full"></div>
                    <div className="h-2 w-2/3 bg-white/5 rounded-full"></div>
                  </div>
                ) : response ? (
                  <p className="text-lg md:text-xl text-slate-200 font-serif italic leading-relaxed border-l-2 pl-6" style={{ borderColor: persona.color + '44' }}>
                    "{response}"
                  </p>
                ) : (
                  <p className="text-sm font-black text-white/5 uppercase tracking-[0.3em] text-center">Standby for Signal</p>
                )}
              </div>

              <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-white/10">
                <span>Core Stability: 100%</span>
                <span>Node: {persona.id.toUpperCase()}_UPLINK</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FacultyCouncil;
