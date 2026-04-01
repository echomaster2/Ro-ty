import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, Heart, Zap, FileUp, X, 
  Bot, Loader2, Sparkles, ArrowRight, 
  ShieldCheck, AlertTriangle, Waves,
  Terminal, Activity, Compass, Database,
  Volume2, VolumeX, Mic2, RefreshCw
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import HarveyAvatar from './HarveyAvatar';
import { useBranding } from './BrandingContext';

interface ResurrectionProtocolProps {
  onClose: () => void;
}

const DEFAULT_VOICE_ID = 'Yko7iBn2vnSMvSAsuF8N'; 
const CACHE_NAME = 'echomasters-media-vault-v1';

const ResurrectionProtocol: React.FC<ResurrectionProtocolProps> = ({ onClose }) => {
  const { overrides } = useBranding();
  const [stage, setStage] = useState<'intro' | 'presentation' | 'form' | 'success'>('intro');
  const [failCount, setFailCount] = useState<number>(() => {
    const saved = localStorage.getItem('resurrection-draft-failcount');
    return saved ? parseInt(saved) : 2;
  });
  const [aiMessage, setAiMessage] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Form State
  const [email, setEmail] = useState(() => localStorage.getItem('resurrection-draft-email') || '');
  const [proofFile, setProofFile] = useState<File | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    localStorage.setItem('resurrection-draft-email', email);
    localStorage.setItem('resurrection-draft-failcount', failCount.toString());
  }, [email, failCount]);

  useEffect(() => {
    if (stage === 'intro') {
      const timer = setTimeout(() => setStage('presentation'), 3000);
      return () => clearTimeout(timer);
    }
    if (stage === 'presentation' && !aiMessage) {
      generateEncouragement();
    }
  }, [stage]);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const stopSpeaking = () => {
    if (currentAudioSourceRef.current) {
      currentAudioSourceRef.current.stop();
      currentAudioSourceRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
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
    if (isMuted) return;
    
    stopSpeaking();
    setIsSpeaking(true);
    if ((window as any).duckRadio) (window as any).duckRadio(true);

    const cacheKey = `resurrection-audio-${getCacheKey(text)}`;
    
    // 1. Check Cache API
    try {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(`/api/audio/resurrection/${cacheKey}`);
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
            await cache.put(new Request(`/api/audio/resurrection/${cacheKey}`), new Response(blob, { headers: { 'X-Audio-Type': 'mpeg' } }));
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
          await cache.put(new Request(`/api/audio/resurrection/${cacheKey}`), new Response(blob, { headers: { 'X-Audio-Type': 'pcm' } }));
        } catch (e) { console.warn("Cache put error", e); }

        await playAudio(base64Audio, true);
        return;
      }
    } catch (e) { console.warn("Gemini TTS failed."); }

    // 4. Final Fallback: Web Speech API
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.8;
      u.pitch = 0.7;
      u.onend = () => {
        setIsSpeaking(false);
        if ((window as any).duckRadio) (window as any).duckRadio(false);
      };
      window.speechSynthesis.speak(u);
    }
  };

  const generateEncouragement = async () => {
    setIsThinking(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Act as Harvey, a wise robotic ultrasound professor. Speak to a student who has failed the SPI physics exam ${failCount} times. 
        Acknowledge their persistence as a "high-yield trait." Offer them the "Persistence Scholarship". Keep it under 50 words.`,
      });
      const text = response.text || "Seeker, your persistence is your greatest clinical asset. We do not abandon specialists in the field. The board is a system, and together, we will decode it.";
      setAiMessage(text);
      speakText(text);
    } catch (e) {
      const failText = "Signal interference detected, but my core logic remains: Persistence is the hallmark of a true master.";
      setAiMessage(failText);
      speakText(failText);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    stopSpeaking();
    // Simulated uplink
    setTimeout(() => {
      setIsSubmitting(false);
      localStorage.removeItem('resurrection-draft-email');
      localStorage.removeItem('resurrection-draft-failcount');
      setStage('success');
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-950/95 backdrop-blur-3xl flex items-center justify-center p-4 md:p-10 animate-fade-in font-sans overflow-y-auto">
      <div className="absolute top-8 right-8 z-[1010] flex gap-4">
        <button 
          onClick={() => {
            const nextMute = !isMuted;
            setIsMuted(nextMute);
            if (nextMute) stopSpeaking();
            else if (aiMessage) speakText(aiMessage);
          }} 
          className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-white transition-all"
        >
          {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>
        <button onClick={onClose} className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-white transition-all hover:rotate-90">
          <X size={24} />
        </button>
      </div>

      <div className="max-w-4xl w-full relative">
        {/* Stage 1: Intro Scan */}
        {stage === 'intro' && (
          <div className="flex flex-col items-center gap-12 animate-pulse">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 blur-[100px]"></div>
              <ShieldAlert size={120} className="text-red-500 relative z-10 animate-bounce" />
            </div>
            <div className="space-y-4 text-center">
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-white italic uppercase tracking-tighter">Emergency Signal Detected</h2>
              <p className="text-red-400 font-mono text-xs md:text-sm uppercase tracking-[0.5em]">Scanning Persistence Vectors...</p>
            </div>
          </div>
        )}

        {/* Stage 2: AI Presentation */}
        {stage === 'presentation' && (
          <div className="space-y-12 animate-slide-up text-left md:text-center">
            <div className="flex flex-col items-center gap-8">
              <div className="scale-110 md:scale-125">
                <HarveyAvatar size="md" isTalking={isSpeaking} accentColor="#B5944E" />
              </div>
              
              <div className="space-y-4 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-main/10 border border-gold-main/20 text-[10px] font-black text-gold-main uppercase tracking-[0.4em] mb-4">
                  <Sparkles size={12} /> Persistence Resurrection Protocol
                </div>
                <div className="p-8 md:p-12 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[3rem] shadow-3xl relative overflow-hidden group/speech">
                  {isThinking ? (
                    <div className="flex flex-col items-center gap-6 py-8">
                      <Loader2 className="animate-spin text-gold-main" size={40} />
                      <p className="text-[10px] font-black uppercase text-white/30 tracking-[0.4em]">Synthesizing Empathy...</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <p className="text-xl md:text-3xl font-serif italic text-white leading-relaxed text-balance">
                        "{aiMessage}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-4 flex-col sm:flex-row">
              <button 
                onClick={() => { stopSpeaking(); setStage('form'); }}
                className="px-12 py-6 bg-gold-main text-slate-950 font-black rounded-2xl uppercase tracking-[0.3em] text-xs shadow-gold transition-all flex items-center justify-center gap-4 group"
              >
                Accept the Covenant <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Stage 3: The Form */}
        {stage === 'form' && (
          <div className="bg-slate-900/80 border border-white/10 rounded-[4rem] p-8 md:p-16 shadow-3xl animate-slide-up relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none"><Database size={240} /></div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-white/5 pb-10 mb-10">
              <div className="space-y-2">
                <h3 className="text-3xl font-serif font-bold text-white italic uppercase tracking-tight">Access Covenant</h3>
                <p className="text-gold-main/60 font-black text-[10px] uppercase tracking-[0.4em]">Scholarship Authorization Form</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] ml-2">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-gold-main/40 transition-all outline-none" 
                    placeholder="clinical_id@nexus.com" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] ml-2">Attempts Logged</label>
                  <select 
                    value={failCount}
                    onChange={e => setFailCount(parseInt(e.target.value))}
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-white appearance-none outline-none focus:border-gold-main/40"
                  >
                    <option value={2}>2 Attempts</option>
                    <option value={3}>3 Attempts</option>
                    <option value={4}>4+ Attempts</option>
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] ml-2">Uplink Proof (PDF/JPG)</label>
                  <label className="relative block w-full h-[120px] bg-slate-950 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer group hover:border-gold-main/40 transition-all">
                    <input type="file" className="hidden" onChange={e => setProofFile(e.target.files?.[0] || null)} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      <FileUp size={24} className="text-white/20 group-hover:text-gold-main transition-colors" />
                      <p className="text-[10px] font-black uppercase text-white/20 group-hover:text-white transition-colors">
                        {proofFile ? proofFile.name : 'Upload Failure Report'}
                      </p>
                    </div>
                  </label>
                </div>
                <button 
                  disabled={isSubmitting || !proofFile || !email}
                  className="w-full py-5 bg-gold-main text-slate-950 rounded-2xl font-black uppercase tracking-[0.4em] text-xs shadow-gold hover:shadow-[0_0_80px_rgba(181,148,78,0.5)] transition-all flex items-center justify-center gap-4 group disabled:grayscale disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <><Zap size={18} fill="currentColor" /> Initialize Uplink</>}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Stage 4: Success */}
        {stage === 'success' && (
          <div className="flex flex-col items-center gap-10 animate-fade-in text-center">
            <div className="w-32 h-32 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center animate-pulse">
              <ShieldCheck size={64} className="text-green-500" />
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl md:text-6xl font-serif font-bold text-white italic tracking-tighter uppercase">Signal Transmitted</h2>
              <p className="text-slate-400 text-lg md:text-2xl font-light italic max-w-xl mx-auto leading-relaxed">
                Verification in progress. Watch your signal inbox for the Resilience Authorization. We are with you now.
              </p>
            </div>
            <button 
              onClick={onClose}
              className="px-12 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
            >
              Return to Sanctuary
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResurrectionProtocol;