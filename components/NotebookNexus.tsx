
import React, { useState, useEffect, useRef } from 'react';
import { 
  Binary, Zap, Database, ExternalLink, Bot, 
  Loader2, Sparkles, Send, X, Clipboard,
  Terminal, Activity, ShieldCheck, ArrowRight,
  Volume2, VolumeX, Mic2
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { useBranding } from './BrandingContext';

interface NotebookNexusProps {
  onPlayCorrect: () => void;
  onPlayBubble?: () => void;
}

interface SyntheticNote {
  id: string;
  title: string;
  body: string;
  timestamp: number;
}

const NOTEBOOK_URL = "https://notebooklm.google.com/notebook/c05c264c-4a2c-4ea2-9375-1628606fb25d";
const DEFAULT_VOICE_ID = 'Yko7iBn2vnSMvSAsuF8N';
const CACHE_NAME = 'echomasters-media-vault-v1';

const NotebookNexus: React.FC<NotebookNexusProps> = ({ onPlayCorrect, onPlayBubble }) => {
  const { overrides } = useBranding();
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [synthesizedNotes, setSynthesizedNotes] = useState<SyntheticNote[]>(() => {
    const saved = localStorage.getItem('spi-notebook-nexus-data');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeNote, setActiveNote] = useState<SyntheticNote | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    localStorage.setItem('spi-notebook-nexus-data', JSON.stringify(synthesizedNotes));
  }, [synthesizedNotes]);

  const stopSpeaking = () => {
    if (currentAudioSourceRef.current) {
      currentAudioSourceRef.current.stop();
      currentAudioSourceRef.current = null;
    }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);
    if ((window as any).duckRadio) (window as any).duckRadio(false);
  };

  const getCacheKey = (text: string) => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16);
  };

  const playAudio = async (base64Data: string, isRawPCM = false) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') await ctx.resume();

    const binaryString = window.atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    try {
      let audioBuffer: AudioBuffer;
      if (isRawPCM) {
        const numSamples = len / 2;
        audioBuffer = ctx.createBuffer(1, numSamples, 24000);
        const channelData = audioBuffer.getChannelData(0);
        const dataView = new DataView(bytes.buffer);
        for (let i = 0; i < numSamples; i++) {
          const sample = dataView.getInt16(i * 2, true);
          channelData[i] = sample / 32768;
        }
      } else {
        audioBuffer = await ctx.decodeAudioData(bytes.buffer);
      }

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      currentAudioSourceRef.current = source;
      source.start();

      return new Promise((resolve) => {
        source.onended = () => {
          currentAudioSourceRef.current = null;
          setIsSpeaking(false);
          if ((window as any).duckRadio) (window as any).duckRadio(false);
          resolve(null);
        };
      });
    } catch (e) {
      console.error("Audio Playback Error:", e);
      setIsSpeaking(false);
      if ((window as any).duckRadio) (window as any).duckRadio(false);
    }
  };

  const speakText = async (text: string) => {
    stopSpeaking();
    setIsSpeaking(true);
    if ((window as any).duckRadio) (window as any).duckRadio(true);

    const cacheKey = `nexus-audio-${getCacheKey(text)}`;
    
    // 1. Check Cache API
    try {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(`/api/audio/nexus/${cacheKey}`);
      if (cachedResponse) {
        const blob = await cachedResponse.blob();
        if (blob.size > 0) {
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          const pureBase64 = base64.split(',')[1];
          const isRaw = cachedResponse.headers.get('X-Audio-Type') === 'pcm';
          await playAudio(pureBase64, isRaw);
          return;
        }
      }
    } catch (e) { console.warn("Cache access error", e); }

    // 2. Try ElevenLabs
    const elevenKey = overrides['eleven-labs-key']?.value || localStorage.getItem('spi-eleven-labs-key');
    if (elevenKey) {
      try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${DEFAULT_VOICE_ID}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'xi-api-key': elevenKey },
          body: JSON.stringify({
            text: text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: { stability: 0.5, similarity_boost: 0.8 }
          }),
        });

        if (response.ok) {
          const blob = await response.blob();
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          const pureBase64 = base64.split(',')[1];
          
          try {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(new Request(`/api/audio/nexus/${cacheKey}`), new Response(blob, { headers: { 'X-Audio-Type': 'mpeg' } }));
          } catch (e) { console.warn("Cache put error", e); }

          await playAudio(pureBase64, false);
          return;
        }
      } catch (e) { console.warn("ElevenLabs failed."); }
    }

    // 3. Try Gemini TTS Fallback
    try {
      const { GoogleGenAI, Modality } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say with clinical authority: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Charon' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const binary = atob(base64Audio);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const blob = new Blob([bytes], { type: 'audio/pcm' });
        
        try {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(new Request(`/api/audio/nexus/${cacheKey}`), new Response(blob, { headers: { 'X-Audio-Type': 'pcm' } }));
        } catch (e) { console.warn("Cache put error", e); }

        await playAudio(base64Audio, true);
        return;
      }
    } catch (e) { console.warn("Gemini TTS failed."); }

    // 4. Final Fallback: Web Speech API
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.9;
      u.onend = () => {
        setIsSpeaking(false);
        if ((window as any).duckRadio) (window as any).duckRadio(false);
      };
      window.speechSynthesis.speak(u);
    }
  };

  const handleIngest = async () => {
    if (!inputText.trim() || isProcessing) return;
    setIsProcessing(true);
    onPlayBubble?.();

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview', // Speed-optimized ingestion
        contents: `Ingest the following raw study data and re-process it as a high-yield 'Faculty Sync Node' for ultrasound physics. 
        Create a cinematic title and a structured summary (max 100 words).
        DATA: "${inputText}"`,
        config: {
          systemInstruction: "You are Harvey's high-speed analytical subsystem powered by FLASH intelligence. Format the response as simple text: TITLE | SUMMARY",
        }
      });

      const [title, body] = (response.text || "Synchronized Node | Processed Successfully").split(' | ');
      const newNote: SyntheticNote = {
        id: `note-${Date.now()}`,
        title: title.trim(),
        body: body.trim(),
        timestamp: Date.now()
      };

      setSynthesizedNotes(prev => [newNote, ...prev]);
      setInputText("");
      onPlayCorrect();
    } catch (e) {
      console.error("Ingestion failed", e);
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSynthesizedNotes(prev => prev.filter(n => n.id !== id));
    if (activeNote?.id === id) {
      setActiveNote(null);
      stopSpeaking();
    }
  };

  return (
    <div className="p-6 md:p-16 animate-fade-in text-left font-sans h-full overflow-y-auto custom-scrollbar">
      <div className="max-w-7xl mx-auto space-y-12 pb-40">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 border-b border-white/10 pb-12">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gold-main/10 rounded-2xl border border-gold-main/30 text-gold-main shadow-gold-dim">
                <Binary size={24} />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.5em] text-white/50">External Knowledge Uplink</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-serif font-bold text-white italic tracking-tighter uppercase leading-none">Notebook <span className="text-gold-main not-italic">Nexus</span></h1>
            <p className="text-lg md:text-2xl text-slate-400 font-light italic leading-relaxed max-w-2xl text-balance">
              Establish a secure bridge with your **NotebookLM** archives. Our **Flash-Sync** engine synthesizes raw clinical data into high-yield memory nodes.
            </p>
          </div>

          <a 
            href={NOTEBOOK_URL} 
            target="_blank" 
            rel="noreferrer"
            className="w-full md:w-auto px-10 py-6 bg-white/5 border-2 border-white/10 rounded-[2rem] text-white font-black uppercase tracking-[0.3em] text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-4 group shadow-xl"
          >
            Open Source Notebook <ExternalLink size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 items-start">
          
          {/* Left Column: The Bridge Terminal */}
          <div className="lg:col-span-7 space-y-12">
            <div className="bg-slate-900/60 backdrop-blur-3xl border-2 border-white/10 rounded-[4rem] p-10 md:p-14 space-y-10 shadow-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12 pointer-events-none"><Database size={240} /></div>
              
              <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-4 text-gold-main">
                  <Terminal size={20} />
                  <span className="text-[10px] font-black uppercase tracking-[0.5em]">Ingestion Protocol: FLASH_SYNC</span>
                </div>
                <div className="relative">
                  <textarea 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Paste massive amounts of raw data for Harvey to synthesize in milliseconds..."
                    className="w-full h-48 bg-slate-950 border border-white/10 rounded-[2.5rem] p-8 text-slate-200 font-serif italic text-lg focus:border-gold-main/40 transition-all outline-none resize-none placeholder:text-white/10 shadow-inner"
                  />
                  <div className="absolute bottom-6 right-8 flex items-center gap-4 opacity-30">
                    <Zap size={14} className="text-gold-main animate-pulse" />
                    <span className="text-[9px] font-mono text-white">Flash Core Energized</span>
                  </div>
                </div>
                <button 
                  onClick={handleIngest}
                  disabled={!inputText.trim() || isProcessing}
                  className={`w-full py-7 rounded-[2rem] font-black uppercase tracking-[0.4em] text-xs transition-all flex items-center justify-center gap-5 shadow-gold ${isProcessing ? 'bg-white/5 text-white/20' : 'bg-gold-main text-slate-950 hover:shadow-[0_0_80px_rgba(181,148,78,0.5)] active:scale-[0.98]'}`}
                >
                  {isProcessing ? <Loader2 size={24} className="animate-spin" /> : <><Zap size={22} fill="currentColor" /> Flash-Process Nodes</>}
                </button>
              </div>
            </div>

            {/* Active Display Panel */}
            {activeNote && (
              <div className="p-10 md:p-16 bg-slate-950 border-2 border-gold-main/30 rounded-[4rem] animate-slide-up space-y-10 relative overflow-hidden shadow-[0_0_100px_rgba(181,148,78,0.1)]">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03]"><Bot size={160} /></div>
                
                <div className="flex justify-between items-start border-b border-white/5 pb-8 relative z-10">
                  <div className="space-y-2">
                    <div className="flex items-center gap-4 text-gold-main">
                      <Sparkles size={18} className="animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-[0.5em]">Flash Node Synthesized</span>
                    </div>
                    <h3 className="text-3xl md:text-5xl font-serif font-bold text-white italic tracking-tight uppercase leading-none">{activeNote.title}</h3>
                  </div>
                  <button 
                    onClick={() => speakText(activeNote.body)}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isSpeaking ? 'bg-gold-main text-slate-950 shadow-gold' : 'bg-white/5 text-gold-main border border-white/10 hover:bg-white/10'}`}
                  >
                    {isSpeaking ? <Activity size={24} className="animate-pulse" /> : <Volume2 size={24} />}
                  </button>
                </div>

                <div className="prose prose-invert prose-lg md:prose-2xl max-w-none relative z-10">
                  <p className="text-xl md:text-3xl text-slate-200 font-serif italic leading-relaxed border-l-4 border-gold-main/40 pl-10">
                    "{activeNote.body}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-10 border-t border-white/5 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold-main animate-pulse shadow-gold"></div>
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Acoustic Consistency Verified</span>
                  </div>
                  <button onClick={() => { setActiveNote(null); stopSpeaking(); }} className="text-[10px] font-black text-white/40 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2">
                    De-Link <X size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sync Archives */}
          <div className="lg:col-span-5 space-y-10">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-4 text-gold-main">
                <Database size={18} />
                <span className="text-[10px] font-black uppercase tracking-[0.5em]">Flash-Sync Archive</span>
              </div>
              <span className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[9px] font-mono text-white/40">{synthesizedNotes.length} NODES</span>
            </div>

            <div className="grid grid-cols-1 gap-4 max-h-[700px] overflow-y-auto custom-scrollbar pr-2">
              {synthesizedNotes.map((note) => (
                <button 
                  key={note.id}
                  onClick={() => { setActiveNote(note); onPlayBubble?.(); }}
                  className={`p-8 rounded-[2.5rem] border text-left transition-all duration-700 relative group overflow-hidden ${activeNote?.id === note.id ? 'bg-gold-main border-gold-main shadow-gold text-slate-950 scale-[1.02]' : 'bg-slate-950/40 border-white/5 hover:border-gold-main/40 hover:bg-white/[0.03] text-white'}`}
                >
                  <div className="flex justify-between items-start relative z-10">
                    <div className="space-y-3 flex-1 min-w-0 pr-6">
                      <h4 className={`text-xl font-serif font-bold italic truncate leading-tight ${activeNote?.id === note.id ? 'text-slate-950' : 'text-white'}`}>{note.title}</h4>
                      <p className={`text-xs italic leading-relaxed line-clamp-2 ${activeNote?.id === note.id ? 'text-slate-950/60' : 'text-slate-400'}`}>
                        {note.body}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-4 shrink-0">
                      <div className={`p-2 rounded-xl transition-all ${activeNote?.id === note.id ? 'bg-slate-950/10' : 'bg-slate-900'}`}>
                        <Zap size={18} fill={activeNote?.id === note.id ? "currentColor" : "none"} />
                      </div>
                      <button 
                        onClick={(e) => deleteNote(note.id, e)}
                        className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${activeNote?.id === note.id ? 'hover:bg-slate-950/20 text-slate-950' : 'hover:bg-red-500/10 text-red-400'}`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center gap-3 opacity-30 text-[8px] font-mono uppercase tracking-widest relative z-10">
                    <span>Sync_ID: {note.id.split('-')[1]}</span>
                    <span>•</span>
                    <span>{new Date(note.timestamp).toLocaleDateString()}</span>
                  </div>
                </button>
              ))}

              {synthesizedNotes.length === 0 && (
                <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem] space-y-6 opacity-20">
                  <Mic2 size={48} className="mx-auto" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em]">Establish Link to Ingest Data</p>
                </div>
              )}
            </div>

            {/* Faculty Insight Sidebar */}
            <div className="p-10 bg-gold-main/5 border border-gold-main/20 rounded-[3rem] space-y-6 group hover:bg-gold-main/10 transition-all duration-1000 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5"><ShieldCheck size={100} /></div>
              <div className="flex items-center gap-5 text-gold-main">
                <Bot size={24} className="group-hover:rotate-12 transition-transform" />
                <span className="text-[11px] font-black uppercase tracking-[0.4em]">Flash Logic View</span>
              </div>
              <p className="text-base font-serif italic text-slate-300 leading-relaxed border-l-2 border-gold-main/20 pl-8 py-1">
                "Seeker, time is a non-renewable acoustic variable. By utilizing my **Flash Intelligence**, we can bypass the noise of traditional studying and synchronize with the core logic instantly."
              </p>
              <div className="pt-4 flex justify-end">
                <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[8px] font-mono text-white/30 uppercase tracking-widest">Protocol: FLASH_NEXUS_4.2</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotebookNexus;
