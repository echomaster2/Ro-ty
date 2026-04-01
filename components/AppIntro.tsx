import React, { useState, useEffect, useRef } from 'react';
import { SkipForward, Waves, Anchor, Database, Activity, Sparkles, Volume2, Loader2 } from 'lucide-react';
import { GoogleGenAI, Modality } from "@google/genai";
import HarveyAvatar from './HarveyAvatar';

interface AppIntroProps {
    onComplete: () => void;
}

const CACHE_NAME = 'echomasters-media-vault-v1';

const AppIntro: React.FC<AppIntroProps> = ({ onComplete }) => {
  const [step, setStep] = useState(-1);
  const [isExiting, setIsExiting] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const script = [
      { id: 'intro-1', text: "The transducer is your scalpel of light, reaching where hands cannot touch.", duration: 5000 },
      { id: 'intro-2', text: "A shadow in the kidney... a flutter in the fetal heart... answers hiding in the noise.", duration: 5500 },
      { id: 'intro-3', text: "Behind every gray-scale pixel is a patient waiting for your precision.", duration: 5000 },
      { id: 'intro-4', text: "To master the physics is to master the truth. To see what others miss.", duration: 6000 },
      { id: 'intro-5', text: "Welcome to EchoMasters. Your clinical journey begins now.", duration: 6500 },
  ];

  const getCacheKey = (text: string) => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16);
  };

  const stopNarration = () => {
    if (currentAudioSourceRef.current) {
      currentAudioSourceRef.current.stop();
      currentAudioSourceRef.current = null;
    }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsThinking(false);
  };

  const playAudio = async (base64Data: string, isRawPCM = false) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') await ctx.resume();
    
    const binaryString = window.atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    try {
      let audioBuffer: AudioBuffer;
      if (isRawPCM) {
        const numSamples = bytes.length / 2;
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
          resolve(null);
        };
      });
    } catch (e) {
      console.warn("Audio Playback Error:", e);
    }
  };

  const playNarration = async (text: string) => {
    stopNarration();
    const cacheKey = `intro-audio-${getCacheKey(text)}`;
    
    try {
      setIsThinking(true);

      // 1. Check Cache API
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(`/api/audio/intro/${cacheKey}`);
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

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say with clinical authority and gravitas: ${text}` }] }],
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
        await cache.put(new Request(`/api/audio/intro/${cacheKey}`), new Response(blob, { headers: { 'X-Audio-Type': 'pcm' } }));

        await playAudio(base64Audio, true);
      }
    } catch (err) {
      console.error("AI Narration Error:", err);
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.85;
        window.speechSynthesis.speak(utterance);
      }
    } finally {
      setIsThinking(false);
    }
  };

  const playSonarPing = () => {
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1100, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.15);
    g.gain.setValueAtTime(0.06, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    osc.stop(now + 1.5);
  };

  const handleStartIntro = async () => {
    playSonarPing();
    setStep(0);
  };

  useEffect(() => {
      if (step === -1) return;
      let isMounted = true;
      
      const runStep = async () => {
        if (step < script.length) {
            await playNarration(script[step].text);
            if (!isMounted) return;
            
            if (step < script.length - 1) {
              playSonarPing();
              setStep(s => s + 1);
            } else {
              setStep(script.length);
            }
        } else if (step === script.length) {
            setShowLogo(true);
            setTimeout(() => { 
                if (isMounted) {
                    setIsExiting(true); 
                    setTimeout(onComplete, 1200); 
                }
            }, 4500);
        }
      };

      runStep();

      return () => {
          isMounted = false;
          window.speechSynthesis.cancel();
      };
  }, [step, onComplete]);

  return (
    <div className={`fixed inset-0 z-[500] bg-[#020617] flex flex-col items-center justify-center transition-all duration-1000 overflow-hidden p-6 md:p-12 ${isExiting ? 'opacity-0 scale-110' : 'opacity-100'}`}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-25">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300%] h-[300%] border-[0.5px] border-gold-main/20 rounded-full animate-[spin_180s_linear_infinite]"></div>
        </div>

        {step === -1 ? (
            <div className="flex flex-col items-center gap-8 md:gap-12 animate-fade-in relative z-10 text-center w-full max-w-lg">
              <div className="relative group">
                <div className="absolute inset-0 bg-gold-main/20 blur-[80px] animate-pulse rounded-full"></div>
                <div className="w-32 h-32 md:w-48 md:h-48 bg-slate-900/90 backdrop-blur-3xl rounded-[2.5rem] md:rounded-[4rem] flex items-center justify-center border-2 border-gold-main/40 shadow-gold relative z-10 hover:scale-105 transition-transform">
                  <HarveyAvatar size="md" isTalking={false} />
                </div>
              </div>
              <div className="space-y-4 md:space-y-6">
                <h2 className="text-white font-serif italic text-4xl md:text-7xl tracking-tight leading-none uppercase">EchoMasters</h2>
                <p className="text-gold-main/60 text-xs md:text-sm font-black uppercase tracking-[0.4em] md:tracking-[0.6em]">Secure Learning Sanctuary</p>
              </div>
              <button 
                onClick={handleStartIntro} 
                className="group w-full md:w-auto px-10 py-6 md:px-20 md:py-8 bg-gold-main text-slate-950 font-black rounded-[1.5rem] md:rounded-[2.5rem] shadow-gold hover:shadow-[0_0_80px_rgba(181,148,78,0.5)] transition-all uppercase tracking-[0.3em] md:tracking-[0.5em] text-xs md:text-sm flex items-center justify-center gap-4 active:scale-95"
              >
                Establish Resonance
              </button>
              <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mt-4">Interact to initialize acoustic matrix</p>
            </div>
        ) : (
            <>
                <button onClick={onComplete} className="absolute top-6 right-6 md:top-10 md:right-10 z-[550] flex items-center gap-3 text-[10px] md:text-xs font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">
                    Skip Narrative <SkipForward className="w-4 h-4" />
                </button>
                <div className="relative z-10 max-w-6xl px-4 text-center py-10 flex flex-col justify-center min-h-full">
                    {!showLogo && step < script.length && (
                      <div className="space-y-8 md:space-y-16 animate-slide-up flex flex-col items-center">
                         <div className="scale-[0.85] md:scale-125 xl:scale-150 mb-4 md:mb-12 relative">
                            <HarveyAvatar size="md" isTalking={true} isThinking={isThinking} />
                            {isThinking && (
                              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-gold-main/60">
                                <Loader2 size={12} className="animate-spin" />
                                <span className="text-[8px] font-black uppercase tracking-widest">Syncing Audio</span>
                              </div>
                            )}
                         </div>
                         <h1 className="text-2xl sm:text-5xl md:text-7xl lg:text-9xl font-serif italic text-white leading-[1.2] md:leading-[1.1] drop-shadow-2xl select-none px-2 md:px-4">
                            {script[step].text}
                         </h1>
                      </div>
                    )}
                    {showLogo && (
                      <div className="flex flex-col items-center animate-fade-in space-y-8 md:space-y-12">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gold-main/20 blur-[120px] rounded-full animate-pulse"></div>
                            <h1 className="text-4xl sm:text-7xl md:text-[14rem] font-serif font-bold text-white mb-2 md:mb-6 tracking-tighter relative z-10 leading-none">
                              Echo<span className="text-gold-main">Masters</span>
                            </h1>
                        </div>
                        <p className="text-xs md:text-lg text-gold-main uppercase tracking-[0.5em] md:tracking-[1em] font-black opacity-80 text-center">Academic Sanctuary</p>
                      </div>
                    )}
                </div>
            </>
        )}
    </div>
  );
};
export default AppIntro;