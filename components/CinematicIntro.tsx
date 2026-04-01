
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, ArrowRight, Bot, Zap, X, AlertCircle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { useFirebase } from './FirebaseProvider';

interface CinematicIntroProps {
  title: string;
  seedText: string;
  type: 'module' | 'lesson' | 'tool' | 'section';
  onContinue: () => void;
  persona?: 'Charon' | 'Puck' | 'Kore' | 'Zephyr';
  topicData?: any; 
  voiceId?: string;
  elevenLabsKey?: string;
}

const DEFAULT_VOICE_ID = 'Yko7iBn2vnSMvSAsuF8N';
const CACHE_NAME = 'echomasters-media-vault-v1';

const CinematicIntro: React.FC<CinematicIntroProps> = ({ title, seedText, type, onContinue, persona = 'Charon', topicData, voiceId = DEFAULT_VOICE_ID, elevenLabsKey }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [script, setScript] = useState("");
  const [hasAudio, setHasAudio] = useState(false);
  const [fadeStatus, setFadeStatus] = useState<'in' | 'out' | 'none'>('in');
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const { progress: userProgress, updateProgress } = useFirebase();
  const dbUser = userProgress;

  const getCacheKey = (text: string) => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16);
  };

  useEffect(() => {
    const textHash = getCacheKey(title + seedText);
    const cacheId = `intro-${textHash}-${persona}-${voiceId}`;
    
    checkCache(cacheId);
    
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      if (currentAudioSourceRef.current) currentAudioSourceRef.current.stop();
    };
  }, [title]);

  const stopAudio = () => {
    if (currentAudioSourceRef.current) {
      currentAudioSourceRef.current.stop();
      currentAudioSourceRef.current = null;
    }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsPlaying(false);
    if ((window as any).duckRadio) (window as any).duckRadio(false);
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

      setIsPlaying(true);
      if ((window as any).duckRadio) (window as any).duckRadio(true);

      return new Promise((resolve) => {
        source.onended = () => {
          currentAudioSourceRef.current = null;
          setIsPlaying(false);
          if ((window as any).duckRadio) (window as any).duckRadio(false);
          resolve(null);
        };
      });
    } catch (e) {
      console.error("Audio Playback Error:", e);
      setIsPlaying(false);
      if ((window as any).duckRadio) (window as any).duckRadio(false);
    }
  };

  const checkCache = async (cacheId: string) => {
      try {
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(`/api/audio/${cacheId}`);
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
                const savedScript = localStorage.getItem(`script-${cacheId}`);
                setScript(savedScript || seedText);
                setHasAudio(true);
                await playAudio(pureBase64, isRaw);
                return true;
              }
          }
      } catch (e) { console.warn("Cache access error", e); }
      return false;
  };

  const playFallbackSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = dbUser?.voiceRate || 0.9;
      utterance.pitch = dbUser?.voicePitch || 0.8;
      
      utterance.onstart = () => {
        setIsPlaying(true);
        if ((window as any).duckRadio) (window as any).duckRadio(true);
      };
      utterance.onend = () => {
        setIsPlaying(false);
        if ((window as any).duckRadio) (window as any).duckRadio(false);
      };
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const generateHarveyVoice = async () => {
    if (hasAudio || isGenerating) return;
    setError(null);
    setIsGenerating(true);
    const textHash = getCacheKey(title + seedText);
    const cacheId = `intro-${textHash}-${persona}-${voiceId}`;

    let generatedScript = "";
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const typeContext = {
        module: "You are introducing a new module of the syllabus.",
        lesson: "You are introducing a specific lesson.",
        tool: "You are introducing a specialized training tool.",
        section: "You are introducing a new section of the matrix."
      }[type];

      const res = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `ACT AS PROFESSOR ${persona}, AN ELITE ULTRASOUND PHYSICS MENTOR. SUBJECT: "${title}".
          CONTEXT: ${typeContext}
          
          STRICTLY FOLLOW THIS HUMAN-CENTRIC STORYTELLING ARCHITECTURE:
          
          1. NATURAL CADENCE: DO NOT USE ANY SYMBOLS. No commas, no periods, no ellipses, no percentages, no hashes, no at-signs, no asterisks, no ampersands. Use only letters, numbers, and spaces.
          2. NO CONTRACTIONS: Use "do not" instead of "dont", "it is" instead of "its", "you are" instead of "youre". This ensures perfect spelling without symbols.
          3. CONVERSATIONAL FILLERS: Occasionally use natural transitions like "Listen close" or "Now think about this".
          4. ZERO-HOUR SCENARIO: Start with a 10-second high-stakes medical scenario.
          5. QUANTIFY EFFORT: State how you aggregated sources to save them hours. 
          6. PROMISE ASSESSMENT: "There is a little assessment at the end."
          7. STRUCTURED ROADMAP: 4 parts: Definitions, Core Concepts, Practical Application, and Insight.
          8. THE NEGATION: Explain what it is NOT first with natural skepticism.
          9. MNEMONIC MATRIX: Create a memorable acronym.
          
          CONTENT SPECIFICS: "${seedText}"
          STRICT INSTRUCTION: DO NOT USE ANY SYMBOLS IN THE GENERATED TEXT. Use only letters, numbers, and spaces.
          MAX: 80 words. Tone: Authoritative, paternal, deeply human, concise, impactful.`,
      });
      generatedScript = res.text || seedText;
    } catch (e) { 
      generatedScript = `I distilled hours of board exam traps into this briefing For ${title} remember physics follows systems Synchronizing now`;
    }

    setScript(generatedScript);
    
    if (dbUser) {
      const currentVault = dbUser.vaultedScripts || [];
      if (!currentVault.find((s: any) => s.title === title)) {
        updateProgress({
          vaultedScripts: [...currentVault, {
            id: cacheId,
            title: title,
            content: generatedScript,
            timestamp: Date.now()
          }]
        });
      }
    }

    const actualKey = elevenLabsKey || localStorage.getItem('spi-eleven-labs-key');

    if (!actualKey) {
        setError("ElevenLabs key missing. Using standard acoustic uplink.");
        playFallbackSpeech(generatedScript);
        setHasAudio(true);
        setIsGenerating(false);
        return;
    }

    try {
      const elRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'xi-api-key': actualKey },
          body: JSON.stringify({
              text: generatedScript,
              model_id: 'eleven_turbo_v2_5',
              voice_settings: { 
                stability: 0.45,
                similarity_boost: 0.8,
                style: 0.1,
                use_speaker_boost: true 
              }
          }),
      });
      if (!elRes.ok) throw new Error("TTS Link Failed");
      const blob = await elRes.blob();
      
      const cache = await caches.open(CACHE_NAME);
      await cache.put(new Request(`/api/audio/${cacheId}`), new Response(blob));
      
      localStorage.setItem(`script-${cacheId}`, generatedScript);
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      await playAudio(base64.split(',')[1]);
      setHasAudio(true);
    } catch (e) {
      setError("Faculty link offline. Using standard acoustic uplink.");
      playFallbackSpeech(generatedScript);
      setHasAudio(true); 
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayback = () => {
    if (currentAudioSourceRef.current) {
      stopAudio();
    } else {
      if (hasAudio) {
        const textHash = getCacheKey(title + seedText);
        const cacheId = `intro-${textHash}-${persona}-${voiceId}`;
        checkCache(cacheId);
      } else {
        generateHarveyVoice();
      }
    }
  };

  return (
    <div className={`fixed inset-0 z-[400] bg-slate-950/60 backdrop-blur-[100px] flex flex-col p-6 md:p-12 lg:p-24 overflow-y-auto custom-scrollbar transition-all duration-1000 ${fadeStatus === 'out' ? 'opacity-0 scale-105 blur-2xl' : 'opacity-100 scale-100'}`} role="dialog">
      <div className="max-w-7xl w-full mx-auto space-y-8 md:space-y-16 relative z-10 flex flex-col min-h-full">
        <div className="flex justify-between items-center shrink-0">
            <div className="flex items-center gap-4 md:gap-8">
                <div className="w-10 h-10 md:w-20 md:h-20 rounded-xl md:rounded-[2rem] bg-gold-main/10 flex items-center justify-center border border-gold-main/30 shadow-gold shrink-0"><Bot className="w-5 h-5 md:w-10 md:h-10 text-gold-main" /></div>
                <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] md:text-[14px] font-black text-gold-main uppercase tracking-[0.4em] md:tracking-[0.8em] font-sans">Pedagogy Sync</span>
                    <div className="flex items-center gap-2">
                        <div className={`h-1.5 w-1.5 rounded-full ${hasAudio ? 'bg-green-500 shadow-green' : 'bg-gold-main animate-pulse shadow-gold'}`}></div>
                        <span className="text-[7px] md:text-[10px] text-white/40 font-mono uppercase">{hasAudio ? 'UPLINK READY' : 'ENCODING RESONANCE'}</span>
                    </div>
                </div>
            </div>
            <button onClick={() => { setFadeStatus('out'); setTimeout(onContinue, 800); }} className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all group">
                <X size={20} />
            </button>
        </div>

        <div className="space-y-6 md:space-y-10 flex-1 pb-40">
            <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-[9rem] font-serif font-bold text-white tracking-tighter leading-none italic uppercase break-words">{title}</h1>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
                <div className="lg:col-span-8 space-y-8 md:space-y-12">
                    <div className="relative p-6 md:p-14 bg-slate-950/40 rounded-3xl md:rounded-[4rem] border border-white/10 overflow-hidden backdrop-blur-3xl shadow-3xl min-h-[220px] md:min-h-[400px] flex flex-col justify-center group">
                        <div className="relative z-10 text-lg sm:text-2xl md:text-3xl lg:text-4xl text-white/95 font-serif italic leading-[1.4] drop-shadow-2xl whitespace-pre-wrap">
                            {isGenerating ? <div className="flex flex-col gap-6"><span className="animate-pulse font-sans font-bold uppercase tracking-widest text-gold-main text-sm">Drafting human cadence</span><div className="h-1 w-full max-w-sm bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-gold-main animate-[progress_3s_ease-in-out_infinite]"></div></div></div> : script || "Establishing academic resonance"}
                        </div>
                    </div>
                    {error && <div className="p-4 md:p-6 bg-gold-main/10 border border-gold-main/20 rounded-xl md:rounded-2xl flex items-center gap-3 md:gap-4 text-gold-main text-[9px] md:text-xs font-black uppercase tracking-widest animate-pulse"><AlertCircle size={18} /> {error}</div>}
                    {!hasAudio && !isGenerating && <button onClick={generateHarveyVoice} className="w-full md:w-max flex items-center justify-center gap-4 md:gap-6 px-10 py-5 md:px-16 md:py-8 bg-gold-main text-slate-950 rounded-2xl md:rounded-[2.5rem] shadow-gold transition-all font-black uppercase tracking-[0.4em] text-[10px] group active:scale-95"><Bot size={24} /><span>Initialize Clinical Briefing</span></button>}
                </div>
                <div className="lg:col-span-4">
                    <div className="aspect-[2/1] md:aspect-[4/5] rounded-3xl md:rounded-[4rem] bg-slate-900/60 border border-white/5 flex flex-col p-8 md:p-12 relative overflow-hidden group shadow-3xl backdrop-blur-xl transition-all hover:border-gold-main/20">
                        <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4 md:space-y-10 relative z-10">
                            <div className="w-16 h-16 md:w-32 md:h-32 bg-gold-main/10 rounded-2xl md:rounded-[3rem] flex items-center justify-center border-2 border-gold-main/30 shadow-gold"><Zap className={`w-8 h-8 md:w-12 md:h-12 text-gold-main ${isPlaying ? 'animate-pulse' : ''}`} /></div>
                            <div className="space-y-2"><h4 className="text-xl md:text-3xl font-serif font-bold text-white italic">Node Matrix Sync</h4><p className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-black">Architecture: PEDAGOGY V3 0</p></div>
                        </div>
                        <button onClick={() => { setFadeStatus('out'); setTimeout(onContinue, 800); }} className="w-full py-5 md:py-8 bg-gold-main text-slate-950 rounded-2xl md:rounded-[3rem] font-black uppercase tracking-[0.4em] text-[10px] md:text-xs shadow-gold transition-all flex items-center justify-center gap-4 group/btn">Pass Assessment <ArrowRight size={20} className="group-hover/btn:translate-x-2 transition-transform" /></button>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {hasAudio && (
        <div className="sticky bottom-6 md:bottom-12 left-0 right-0 w-full max-w-4xl mx-auto px-4 md:px-8 z-[450] animate-slide-up py-2">
            <div className="bg-slate-950/90 backdrop-blur-3xl border border-white/10 p-4 md:p-6 rounded-2xl md:rounded-[3rem] shadow-2xl flex items-center gap-4 md:gap-8">
                <button onClick={togglePlayback} className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-[1.5rem] bg-gold-main text-slate-950 flex items-center justify-center shadow-gold transition-all shrink-0 active:scale-95 group/play">{isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}</button>
                <div className="flex-1 flex flex-col gap-2 md:gap-3">
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden relative"><div className="h-full bg-gold-main shadow-gold transition-all duration-300" style={{ width: `${progress}%` }}></div></div>
                    <div className="flex justify-between items-center px-1"><span className="text-[7px] md:text-[10px] font-black text-gold-main uppercase tracking-[0.4em]">Audio Resonance Buffer</span><span className="text-[8px] md:text-[10px] font-mono text-white/30 font-bold">{Math.floor(progress)}%</span></div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default CinematicIntro;
