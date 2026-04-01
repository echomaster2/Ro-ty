
import React, { useState, useEffect, useRef } from 'react';
import { X, Bot, Loader2, Sparkles, Film, ArrowRight, ShieldCheck, Zap, Waves, Volume2, Maximize, Minimize } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface CinematicCommercialProps {
  onClose: () => void;
}

const LOADING_MESSAGES = [
  "Calibrating Acoustic Frequencies",
  "Rendering Doppler Vectors",
  "Synthesizing Faculty Wisdom",
  "Aligning Spectral Shifts",
  "Encoding Clinical Excellence",
  "Establishing Deep Sea Resonance",
  "Mapping Sector Traversal Paths"
];

const CACHE_NAME = 'echomasters-cinematic-vault-v1';

const CinematicCommercial: React.FC<CinematicCommercialProps> = ({ onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [needsApiKey, setNeedsApiKey] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
    // Check for cached video on mount
    const checkInitialCache = async () => {
      const prompt = `A cinematic 30-second vertical trailer for 'EchoMasters', an elite ultrasound physics study app. 9:16 vertical aspect ratio. 
      Scenes: 
      1. A high-end dark slate tablet showing glowing golden sound wave simulations. 
      2. A floating futuristic robotic professor named Harvey whispering clinical insights. 
      3. Close-up of a holographic Doppler spectral graph shifting from red to blue dynamically. 
      4. A sonographer smiling as they see a 'PASSED' result on a glowing classroom dashboard. 
      Cinematic lighting, smooth underwater aesthetic, luxury dark gold highlights. 
      Text overlays: 'MASTER THE PHYSICS', 'ESTABLISH RESONANCE', 'ECHOMASTERS'.`;
      
      const cacheKey = `trailer-video-${getCacheKey(prompt)}`;
      try {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(`/api/video/cinematic/${cacheKey}`);
        if (cachedResponse) {
          const blob = await cachedResponse.blob();
          if (blob.size > 0) {
            setVideoUrl(URL.createObjectURL(blob));
          }
        }
      } catch (e) {
        console.warn("Initial cache check failed", e);
      }
    };
    checkInitialCache();
  }, []);

  useEffect(() => {
    let interval: number;
    if (isGenerating) {
      interval = window.setInterval(() => {
        setLoadingMsgIdx(prev => (prev + 1) % LOADING_MESSAGES.length);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const checkApiKey = async () => {
    // Guidelines: Check for key selection before accessing main app/generating video
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
      setNeedsApiKey(true);
      return false;
    }
    return true;
  };

  const selectApiKey = async () => {
    await (window as any).aistudio.openSelectKey();
    setNeedsApiKey(false);
    generateVideo(); // Attempt generation after selection
  };

  const generateVideo = async () => {
    const hasKey = await checkApiKey();
    if (!hasKey) return;

    setIsGenerating(true);
    setError(null);

    const prompt = `A cinematic 30-second vertical trailer for 'EchoMasters', an elite ultrasound physics study app. 9:16 vertical aspect ratio. 
      Scenes: 
      1. A high-end dark slate tablet showing glowing golden sound wave simulations. 
      2. A floating futuristic robotic professor named Harvey whispering clinical insights. 
      3. Close-up of a holographic Doppler spectral graph shifting from red to blue dynamically. 
      4. A sonographer smiling as they see a 'PASSED' result on a glowing classroom dashboard. 
      Cinematic lighting, smooth underwater aesthetic, luxury dark gold highlights. 
      Text overlays: 'MASTER THE PHYSICS', 'ESTABLISH RESONANCE', 'ECHOMASTERS'.`;

    const cacheKey = `trailer-video-${getCacheKey(prompt)}`;

    try {
      // Check Cache API first
      try {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(`/api/video/cinematic/${cacheKey}`);
        if (cachedResponse) {
          const blob = await cachedResponse.blob();
          if (blob.size > 0) {
            setVideoUrl(URL.createObjectURL(blob));
            setIsGenerating(false);
            return;
          }
        }
      } catch (e) { console.warn("Cache access error", e); }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '9:16'
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 8000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      if (operation.response?.generatedVideos?.[0]?.video?.uri) {
        const downloadLink = operation.response.generatedVideos[0].video.uri;
        const response = await fetch(downloadLink, {
          method: 'GET',
          headers: {
            'x-goog-api-key': process.env.GEMINI_API_KEY as string,
          },
        });
        const blob = await response.blob();
        
        // Store in Cache API
        try {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(new Request(`/api/video/cinematic/${cacheKey}`), new Response(blob));
        } catch (e) { console.warn("Cache put error", e); }

        setVideoUrl(URL.createObjectURL(blob));
      } else {
        throw new Error("Video payload corrupted.");
      }
    } catch (e: any) {
      console.error("Video Generation Error:", e);
      if (e.message?.includes("Requested entity was not found.")) {
          setNeedsApiKey(true);
      } else {
          setError("The acoustic node failed to materialize. Please try again later.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-950/95 backdrop-blur-3xl flex items-center justify-center p-4 md:p-10 animate-fade-in overflow-y-auto">
      <div className="absolute top-8 right-8 z-[1010]">
        <button onClick={onClose} className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white/60 hover:text-white transition-all hover:rotate-90">
          <X size={32} />
        </button>
      </div>

      <div className="w-full max-w-4xl min-h-[600px] flex flex-col items-center justify-center text-center">
        
        {needsApiKey ? (
          <div className="space-y-10 animate-slide-up max-w-md">
            <div className="w-24 h-24 bg-gold-main/10 rounded-3xl flex items-center justify-center border-2 border-gold-main/30 mx-auto shadow-gold">
              <Zap className="text-gold-main w-12 h-12" />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-white italic">Authorization Required</h2>
              <p className="text-slate-400 font-light leading-relaxed">
                To utilize the Veo 3.1 Cinematic Engine, you must select an authorized API key from a paid GCP project.
                <br />
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-gold-main underline mt-2 inline-block">Learn more about billing</a>
              </p>
            </div>
            <button 
              onClick={selectApiKey}
              className="px-12 py-5 bg-gold-main text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-gold hover:scale-105 transition-all"
            >
              Select API Key
            </button>
          </div>
        ) : isGenerating ? (
          <div className="space-y-12 animate-fade-in">
             <div className="relative w-40 h-40 md:w-60 md:h-60 mx-auto">
                <div className="absolute inset-0 border-4 border-gold-main/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-gold-main border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Bot className="text-gold-main w-16 h-16 animate-pulse" />
                </div>
             </div>
             <div className="space-y-4">
                <h3 className="text-2xl md:text-4xl font-serif font-bold text-white italic tracking-tight">{LOADING_MESSAGES[loadingMsgIdx]}</h3>
                <p className="text-slate-500 font-mono text-[10px] md:text-xs uppercase tracking-[0.4em]">Veo 3.1 Cinematic Node Processing</p>
             </div>
             <div className="max-w-xs mx-auto p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4 text-left">
                <Info size={16} className="text-gold-main shrink-0" />
                <p className="text-[10px] text-white/40 leading-relaxed italic">Video synthesis can take up to 2 minutes Your patience establishes resonance</p>
             </div>
          </div>
        ) : videoUrl ? (
          <div 
            ref={containerRef}
            className={`w-full max-w-[340px] md:max-w-[400px] aspect-[9/16] bg-black rounded-[3rem] border-2 border-gold-main/40 shadow-3xl overflow-hidden relative animate-slide-up group ${isFullscreen ? 'max-w-none md:max-w-none aspect-auto h-screen rounded-none border-none' : ''}`}
          >
             <video 
                ref={videoRef}
                src={videoUrl} 
                autoPlay 
                loop 
                controls 
                className={`w-full h-full ${isFullscreen ? 'object-contain' : 'object-cover'}`} 
             />
             <div className="absolute top-6 left-6 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-slate-950/80 backdrop-blur-md border border-gold-main/30 px-5 py-2 rounded-full flex items-center gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-gold-main animate-pulse"></div>
                   <span className="text-[9px] font-black text-white uppercase tracking-[0.4em]">AI_GENERATED_TRAILER</span>
                </div>
             </div>
             
             {/* Custom Fullscreen Toggle */}
             <button 
                onClick={toggleFullscreen}
                className="absolute bottom-6 right-6 p-3 bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-xl text-white/60 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-50"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
             >
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
             </button>
          </div>
        ) : error ? (
          <div className="space-y-8 animate-slide-up max-w-sm">
             <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 mx-auto">
                <AlertCircle className="text-red-500 w-10 h-10" />
             </div>
             <h3 className="text-xl md:text-2xl font-serif font-bold text-white italic">{error}</h3>
             <button onClick={generateVideo} className="px-10 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all">Retry Deployment</button>
          </div>
        ) : (
          <div className="space-y-12 animate-slide-up">
            <div className="space-y-6">
                <div className="w-24 h-24 bg-gold-main/10 rounded-[2rem] flex items-center justify-center border-2 border-gold-main/30 mx-auto shadow-gold">
                  <Film className="text-gold-main w-10 h-10" />
                </div>
                <div className="space-y-3">
                    <h2 className="text-4xl md:text-7xl font-serif font-bold text-white italic tracking-tighter leading-none">The Acoustic <br /><span className="text-gold-main not-italic">Trailers</span></h2>
                    <p className="text-slate-400 text-lg md:text-xl font-light max-w-xl mx-auto italic leading-relaxed">
                        Visualize your clinical future. Generate a cinema-grade 9:16 vertical commercial featuring the core EchoMasters experience.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl mx-auto">
                <FeatureSmall icon={Bot} label="AI Directed" />
                <FeatureSmall icon={Waves} label="Physics Visuals" />
                <FeatureSmall icon={ShieldCheck} label="Success Path" />
            </div>

            <button 
                onClick={generateVideo}
                className="group px-16 py-7 bg-gold-main text-slate-950 font-black rounded-2xl md:rounded-[2.5rem] uppercase tracking-[0.4em] text-[11px] md:text-[13px] shadow-gold hover:shadow-[0_20px_80px_rgba(181,148,78,0.5)] transition-all flex items-center gap-6"
            >
              Initialize Generation <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const FeatureSmall = ({ icon: Icon, label }: any) => (
    <div className="p-6 bg-white/[0.03] border border-white/5 rounded-2xl flex flex-col items-center gap-3 group hover:border-gold-main/20 transition-all">
        <Icon size={20} className="text-gold-main/60 group-hover:scale-110 transition-transform" />
        <span className="text-[9px] font-black uppercase text-white/30 tracking-[0.2em]">{label}</span>
    </div>
);

const Info = ({ size, className }: any) => <div className={className}><Sparkles size={size} /></div>;
const AlertCircle = ({ className, size }: any) => <div className={className}><Waves size={size} /></div>;

export default CinematicCommercial;
