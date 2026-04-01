import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import HarveyAvatar from './HarveyAvatar';
import { 
  Mic, MicOff, Volume2, VolumeX, Loader2, Sparkles, Bot, Zap, 
  Camera, CameraOff, X, Activity, Cpu, Radio, ShieldCheck,
  ZapOff, Terminal, Settings2, Sliders, Eye, ShieldAlert,
  FastForward, Play
} from 'lucide-react';

interface LiveOracleProps {
    isActive: boolean;
    onClose?: () => void;
}

const PERSONAS = [
  { id: 'Zephyr', name: 'Standard (Zephyr)', desc: 'Balanced & Wise', icon: Bot },
  { id: 'Kore', name: 'Methodical (Kore)', desc: 'Technical & Precise', icon: Activity },
  { id: 'Puck', name: 'Energetic (Puck)', desc: 'High-Speed Logic', icon: Zap },
  { id: 'Fenrir', name: 'Deep (Fenrir)', desc: 'Authoritative Tone', icon: Cpu }
];

const LiveOracle: React.FC<LiveOracleProps> = ({ isActive, onClose }) => {
    const [isConnecting, setIsConnecting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [isTalking, setIsTalking] = useState(false);
    const [useCamera, setUseCamera] = useState(false);
    const [isMicMuted, setIsMicMuted] = useState(false);
    const [selectedPersona, setSelectedPersona] = useState(PERSONAS[0]);
    const [voiceVolume, setVoiceVolume] = useState(0.8);
    const [voiceSpeed, setVoiceSpeed] = useState(0.9);
    const [voicePitch, setVoicePitch] = useState(0.8);
    const [isVoiceMuted, setIsVoiceMuted] = useState(false);
    
    const [aiBlocked, setAiBlocked] = useState(() => {
      const saved = localStorage.getItem('echomasters-ai-active');
      return saved !== null ? !JSON.parse(saved) : false;
    });
    
    const audioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const sessionPromiseRef = useRef<any>(null);
    const nextStartTimeRef = useRef(0);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const frameIntervalRef = useRef<number | null>(null);
    const outputGainNodeRef = useRef<GainNode | null>(null);

    // Listen for global privacy updates
    useEffect(() => {
      const handlePrivacyUpdate = (e: any) => {
        const isAiActive = e.detail.aiActive;
        setAiBlocked(!isAiActive);
        if (!isAiActive) {
          cleanup(); 
        }
      };
      window.addEventListener('echomasters-privacy-update', handlePrivacyUpdate);
      return () => window.removeEventListener('echomasters-privacy-update', handlePrivacyUpdate);
    }, []);

    // Update gain node volume when voiceVolume or isVoiceMuted changes
    useEffect(() => {
        if (outputGainNodeRef.current) {
            const finalGain = isVoiceMuted ? 0 : voiceVolume;
            outputGainNodeRef.current.gain.setValueAtTime(finalGain, outputGainNodeRef.current.context.currentTime);
        }
    }, [voiceVolume, isVoiceMuted]);

    const encode = (bytes: Uint8Array) => {
        let binary = '';
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    };

    const decode = (base64: string) => {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    };

    const cleanup = () => {
        setIsConnected(false);
        setIsConnecting(false);
        if (frameIntervalRef.current) window.clearInterval(frameIntervalRef.current);
        
        if (streamRef.current) {
           streamRef.current.getTracks().forEach(t => t.stop());
           streamRef.current = null;
        }

        sourcesRef.current.forEach(s => {
          try { s.stop(); } catch(e) {}
        });
        sourcesRef.current.clear();
        if ((window as any).duckRadio) (window as any).duckRadio(false);
    };

    const toggleMic = () => {
        if (streamRef.current) {
            const audioTrack = streamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = isMicMuted;
                setIsMicMuted(!isMicMuted);
            }
        }
    };

    const startSession = async () => {
        if (aiBlocked) {
          alert("PRIVACY WARNING: AI features are currently disabled. Enable AI in the top navigation.");
          return;
        }

        setIsConnecting(true);
        try {
            const ai = new (await import('@google/genai')).GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            const constraints = { 
                audio: true, 
                video: useCamera ? { width: 640, height: 480 } : false 
            };
            
            if (localStorage.getItem('echomasters-ai-active') === 'false') {
              throw new Error("Acoustic Privacy Shield active.");
            }

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;
            setIsMicMuted(false); // Default to unmuted on start

            if (useCamera && videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            }
            const inputCtx = audioContextRef.current;
            const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            
            // Create global gain node for AI output volume control
            const gainNode = outputCtx.createGain();
            gainNode.gain.value = voiceVolume;
            gainNode.connect(outputCtx.destination);
            outputGainNodeRef.current = gainNode;

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-12-2025',
                callbacks: {
                    onopen: () => {
                        setIsConnected(true);
                        setIsConnecting(false);
                        
                        const source = inputCtx.createMediaStreamSource(stream);
                        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
                        processor.onaudioprocess = (e) => {
                            // Don't send audio if muted or AI blocked
                            if (localStorage.getItem('echomasters-ai-active') === 'false' || !stream.getAudioTracks()[0].enabled) {
                              return;
                            }

                            const inputData = e.inputBuffer.getChannelData(0);
                            const l = inputData.length;
                            const int16 = new Int16Array(l);
                            for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
                            const base64 = encode(new Uint8Array(int16.buffer));
                            sessionPromise.then(s => s.sendRealtimeInput({ media: { data: base64, mimeType: 'audio/pcm;rate=16000' } }));
                        };
                        source.connect(processor);
                        processor.connect(inputCtx.destination);

                        if (useCamera && canvasRef.current && videoRef.current) {
                            const canvas = canvasRef.current;
                            const video = videoRef.current;
                            const ctx = canvas.getContext('2d');
                            frameIntervalRef.current = window.setInterval(() => {
                                if (ctx) {
                                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                                    canvas.toBlob(async (blob) => {
                                        if (blob) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                const base64 = (reader.result as string).split(',')[1];
                                                sessionPromise.then(s => s.sendRealtimeInput({ media: { data: base64, mimeType: 'image/jpeg' } }));
                                            };
                                            reader.readAsDataURL(blob);
                                        }
                                    }, 'image/jpeg', 0.6);
                                }
                            }, 500); 
                        }
                    },
                    onmessage: async (msg: LiveServerMessage) => {
                        const interrupted = msg.serverContent?.interrupted;
                        if (interrupted) {
                          for (const source of sourcesRef.current.values()) {
                            try { source.stop(); } catch (e) {}
                            sourcesRef.current.delete(source);
                          }
                          nextStartTimeRef.current = 0;
                          setIsTalking(false);
                        }

                        if (msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
                            setIsTalking(true);
                            if ((window as any).duckRadio) (window as any).duckRadio(true);
                            
                            const base64 = msg.serverContent.modelTurn.parts[0].inlineData.data;
                            const bytes = decode(base64);
                            const dataInt16 = new Int16Array(bytes.buffer);
                            const buffer = outputCtx.createBuffer(1, dataInt16.length, 24000);
                            const chan = buffer.getChannelData(0);
                            for (let i = 0; i < dataInt16.length; i++) chan[i] = dataInt16[i] / 32768.0;

                            const source = outputCtx.createBufferSource();
                            source.buffer = buffer;
                            source.playbackRate.value = voiceSpeed; // Real-time speed adjustment
                            
                            // Apply pitch adjustment via detune
                            // 1200 cents = 1 octave. 100 cents = 1 semitone.
                            // pitch 1.0 = 0 detune. pitch 0.8 = 1200 * log2(0.8)
                            if (source.detune) {
                                source.detune.value = 1200 * Math.log2(voicePitch);
                            }
                            
                            source.connect(outputGainNodeRef.current || outputCtx.destination);
                            
                            const now = outputCtx.currentTime;
                            const start = Math.max(now, nextStartTimeRef.current);
                            source.start(start);
                            // Adjust next start time based on duration and speed
                            nextStartTimeRef.current = start + (buffer.duration / voiceSpeed);
                            sourcesRef.current.add(source);
                            source.onended = () => {
                                sourcesRef.current.delete(source);
                                if (sourcesRef.current.size === 0) {
                                  setIsTalking(false);
                                  if ((window as any).duckRadio) (window as any).duckRadio(false);
                                }
                            };
                        }
                    },
                    onclose: () => cleanup(),
                    onerror: () => cleanup()
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedPersona.id } } },
                    systemInstruction: `You are the EchoMasters Live Oracle. Support SPI physics exam prep.`
                }
            });
            sessionPromiseRef.current = sessionPromise;
        } catch (e) {
            console.error(e);
            cleanup();
        }
    };

    return (
        <div className="bg-slate-950/60 backdrop-blur-[100px] rounded-[3.5rem] border-2 border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col h-full md:h-[800px] relative group text-left font-sans">
            <div className="absolute inset-0 bg-gradient-to-b from-gold-main/5 via-transparent to-black/40 pointer-events-none"></div>
            
            {/* Terminal Header */}
            <div className="px-10 py-8 border-b border-white/10 flex justify-between items-center bg-white/[0.02] relative z-20">
              <div className="flex items-center gap-6">
                <div className="relative group/core">
                  <div className={`absolute -inset-4 blur-2xl rounded-full transition-all duration-1000 ${isConnected ? 'opacity-100 animate-pulse bg-gold-main/20' : aiBlocked ? 'opacity-100 bg-red-500/20' : 'opacity-0'}`}></div>
                  <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all duration-700 ${isConnected ? 'bg-gold-main border-gold-main text-slate-950 shadow-gold' : aiBlocked ? 'bg-red-500/10 border-red-500/40 text-red-500' : 'bg-slate-900 border-white/10 text-white/40 shadow-inner'}`}>
                    {aiBlocked ? <ShieldAlert size={24} /> : <HarveyAvatar size="sm" isTalking={isTalking} isMuted={isMicMuted && isConnected} />}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-serif font-bold text-white italic tracking-tight uppercase leading-none">Acoustic Terminal</h3>
                  <p className={`text-[9px] font-black uppercase tracking-[0.4em] mt-1.5 flex items-center gap-2 ${aiBlocked ? 'text-red-400' : 'text-gold-main/60'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? (isMicMuted ? 'bg-yellow-500' : 'bg-green-500 animate-pulse') : aiBlocked ? 'bg-red-500 animate-ping' : 'bg-white/10'}`}></span>
                    {aiBlocked ? 'PRIVACY_SHIELD_ACTIVE' : isConnected ? (isMicMuted ? 'LISTENING_PAUSED' : `SYNC_CONNECTED: ${selectedPersona.id.toUpperCase()}`) : 'STANDBY_FOR_LINK'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
                   <Activity size={14} className="text-gold-main/40" />
                   <span className="text-[9px] font-mono text-white/30 uppercase">Latency: {isConnected ? '12ms' : '---'}</span>
                 </div>
                 {onClose && (
                    <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-white/40 transition-all hover:rotate-90">
                        <X size={20} />
                    </button>
                 )}
              </div>
            </div>

            {/* Main Interactive Deck */}
            <div className="flex-1 flex flex-col md:flex-row relative z-10">
              
              {/* Left Column: Visual Feedback */}
              <div className="flex-1 p-8 md:p-12 flex flex-col gap-8">
                {aiBlocked ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-red-500/5 rounded-[3rem] border-2 border-dashed border-red-500/20 animate-fade-in">
                     <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-8 shadow-2xl">
                        <ShieldAlert size={48} />
                     </div>
                     <h4 className="text-2xl md:text-3xl font-serif font-bold text-white italic mb-4">Uplink Severed</h4>
                     <p className="text-slate-400 text-sm md:text-lg font-light leading-relaxed max-w-sm">
                        AI listening is currently disabled. Return to the main navigation to authorize acoustic processing.
                     </p>
                  </div>
                ) : (
                  <div className={`flex-1 bg-black/40 rounded-[3rem] border-2 border-dashed transition-all duration-700 relative overflow-hidden flex items-center justify-center ${useCamera && isConnected ? 'border-gold-main/40' : 'border-white/5'}`}>
                    {useCamera && isConnected ? (
                        <div className="absolute inset-0">
                          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-80" />
                          <canvas ref={canvasRef} width="640" height="480" className="hidden" />
                          <div className="absolute inset-0 crt-overlay pointer-events-none opacity-40"></div>
                          <div className="absolute top-6 left-6 flex items-center gap-3 bg-slate-950/80 px-4 py-1.5 rounded-full border border-gold-main/30">
                              <Eye size={12} className="text-gold-main animate-pulse" />
                              <span className="text-[9px] font-black text-white uppercase tracking-widest">Scan_Lens: ACTIVE</span>
                          </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-10 opacity-30 text-center px-10 group-hover:opacity-100 transition-all duration-1000">
                          <HarveyAvatar size="lg" isTalking={isTalking} isMuted={isMicMuted && isConnected} />
                          <div className="space-y-2">
                            <p className="text-lg font-serif font-bold text-white italic">Neural Core Idle</p>
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-relaxed">Establish native-audio resonance to begin clinical observation.</p>
                          </div>
                        </div>
                    )}

                    {isConnected && (
                      <div className="absolute bottom-10 left-12 -translate-x-1/2 flex items-end gap-1 h-12">
                          {[...Array(12)].map((_, i) => (
                            <div key={i} className={`w-1 bg-gold-main/40 rounded-full transition-all duration-300 ${!isTalking && !isMicMuted ? 'animate-pulse' : 'h-2'}`} style={{ height: (!isTalking && !isMicMuted) ? `${20 + Math.random() * 80}%` : '4px' }}></div>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Settings Section (New Controls) */}
                {!aiBlocked && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-3">
                         <Settings2 size={14} className="text-gold-main" />
                         <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Communication Engine</span>
                      </div>
                      {!isConnected && (
                         <div className="grid grid-cols-4 gap-2">
                            {PERSONAS.map(p => (
                                <button 
                                    key={p.id}
                                    onClick={() => setSelectedPersona(p)}
                                    title={p.name}
                                    className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${selectedPersona.id === p.id ? 'bg-gold-main border-gold-main text-slate-950' : 'bg-white/5 border-white/10 text-white/30 hover:text-white'}`}
                                >
                                    <p.icon size={16} />
                                </button>
                            ))}
                         </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Audio Sliders */}
                        <div className="bg-white/[0.03] border border-white/5 p-6 rounded-3xl space-y-6">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-white/40">
                                        <Volume2 size={12} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Faculty Volume</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={() => setIsVoiceMuted(!isVoiceMuted)}
                                            className={`p-1 rounded-md transition-colors ${isVoiceMuted ? 'text-red-500 bg-red-500/10' : 'text-gold-main hover:bg-white/5'}`}
                                        >
                                            {isVoiceMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                                        </button>
                                        <span className="text-[10px] font-mono text-gold-main">{Math.round(voiceVolume * 100)}%</span>
                                    </div>
                                </div>
                                <input 
                                    type="range" min="0" max="1" step="0.01" value={voiceVolume} 
                                    onChange={e => setVoiceVolume(parseFloat(e.target.value))}
                                    className="w-full h-1 bg-white/10 rounded-full appearance-none accent-gold-main"
                                />
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-white/40">
                                        <FastForward size={12} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Delivery Speed</span>
                                    </div>
                                    <span className="text-[10px] font-mono text-gold-main">{voiceSpeed}x</span>
                                </div>
                                <input 
                                    type="range" min="0.5" max="2.0" step="0.1" value={voiceSpeed} 
                                    onChange={e => setVoiceSpeed(parseFloat(e.target.value))}
                                    className="w-full h-1 bg-white/10 rounded-full appearance-none accent-gold-main"
                                />
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-white/40">
                                        <Activity size={12} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Vocal Pitch</span>
                                    </div>
                                    <span className="text-[10px] font-mono text-gold-main">{voicePitch}x</span>
                                </div>
                                <input 
                                    type="range" min="0.5" max="1.5" step="0.05" value={voicePitch} 
                                    onChange={e => setVoicePitch(parseFloat(e.target.value))}
                                    className="w-full h-1 bg-white/10 rounded-full appearance-none accent-gold-main"
                                />
                            </div>
                        </div>

                        {/* Privacy & Media Card */}
                        <div className="bg-white/[0.03] border border-white/5 p-6 rounded-3xl flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Privacy Controls</span>
                                {isConnected && <div className="w-2 h-2 rounded-full bg-green-500 shadow-green animate-pulse"></div>}
                            </div>
                            <div className="flex gap-3">
                                <button 
                                    onClick={toggleMic}
                                    disabled={!isConnected}
                                    className={`flex-1 p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${!isConnected ? 'opacity-20' : isMicMuted ? 'bg-red-500/20 border-red-500 text-red-500 shadow-lg shadow-red-500/10' : 'bg-green-500/10 border-green-500/40 text-green-500'}`}
                                >
                                    {isMicMuted ? <MicOff size={20} /> : <Mic size={20} />}
                                    <span className="text-[8px] font-black uppercase tracking-widest">{isMicMuted ? 'Mic Off' : 'Mic On'}</span>
                                </button>
                                <button 
                                    onClick={() => setUseCamera(!useCamera)}
                                    disabled={isConnected}
                                    className={`flex-1 p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${useCamera ? 'bg-gold-main/20 border-gold-main/40 text-gold-main' : 'bg-white/5 border-white/10 text-white/20'}`}
                                >
                                    {useCamera ? <Camera size={20} /> : <CameraOff size={20} />}
                                    <span className="text-[8px] font-black uppercase tracking-widest">Visuals</span>
                                </button>
                            </div>
                        </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Signal Data */}
              <div className="w-full md:w-[380px] bg-white/[0.02] border-l border-white/10 p-8 md:p-12 flex flex-col gap-10">
                 <div className="space-y-8 flex-1">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-gold-main">
                          <Terminal size={16} />
                          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Signal Dossier</span>
                        </div>
                        <div className="bg-slate-950/60 rounded-[2rem] p-6 space-y-4 border border-white/5">
                           <DossierLine label="Security" value={aiBlocked ? "SEVERED" : "HIFI_TUNNEL"} />
                           <DossierLine label="Listening" value={isConnected ? (isMicMuted ? "PAUSED" : "STREAMING") : aiBlocked ? "DISABLED" : "PAUSED"} />
                           <DossierLine label="Voice" value={selectedPersona.id} />
                           <DossierLine label="Protocol" value="Native_v3.1" />
                        </div>
                    </div>

                    <div className="p-8 bg-gold-main/5 border border-gold-main/20 rounded-[2.5rem] space-y-4">
                        <div className="flex items-center gap-3 text-gold-main">
                            <Sparkles size={16} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Expert Tip</span>
                        </div>
                        <p className="text-xs text-slate-300 italic leading-relaxed">
                            "Muting your input doesn't sever the link, seeker. Use it when you need to focus on my lecture without environmental interference."
                        </p>
                    </div>
                 </div>

                 <div className="space-y-6">
                    {!isConnected && !isConnecting && !aiBlocked && (
                        <button 
                            onClick={startSession}
                            className="w-full py-7 bg-gold-main text-slate-950 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-xs shadow-gold hover:shadow-[0_0_80px_rgba(181,148,78,0.5)] active:scale-[0.98] transition-all flex items-center justify-center gap-5 group"
                        >
                            <Play size={22} fill="currentColor" className="group-hover:scale-125 transition-transform" />
                            Initialize Link
                        </button>
                    )}

                    {aiBlocked && (
                        <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 text-center space-y-4">
                            <ShieldAlert size={24} className="mx-auto text-white/20" />
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Acoustic Logic Offlined</p>
                        </div>
                    )}

                    {isConnected && (
                        <div className="space-y-4">
                           <div className={`flex items-center justify-center gap-4 py-4 rounded-2xl border transition-all duration-500 ${isMicMuted ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-white/5 border-white/10'}`}>
                              {isMicMuted ? (
                                <MicOff size={16} className="text-yellow-500" />
                              ) : (
                                <Mic size={16} className="text-green-500 animate-pulse" />
                              )}
                              <span className={`text-[9px] font-black uppercase tracking-[0.4em] ${isMicMuted ? 'text-yellow-500' : 'text-green-500/80'}`}>
                                {isMicMuted ? 'Input Suspended' : 'Uplink Established'}
                              </span>
                           </div>
                           <button 
                                onClick={cleanup}
                                className="w-full py-6 bg-red-500/10 backdrop-blur-xl text-red-400 rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] border border-red-500/20 hover:bg-red-500/20 transition-all flex items-center justify-center gap-4 group"
                            >
                                <ZapOff size={18} className="group-hover:rotate-12 transition-transform" /> Abort Session
                            </button>
                        </div>
                    )}

                    {isConnecting && (
                        <div className="w-full py-7 bg-white/5 rounded-[2.5rem] border border-white/10 flex items-center justify-center gap-5">
                            <Loader2 size={24} className="animate-spin text-gold-main" />
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.6em] animate-pulse">Syncing...</span>
                        </div>
                    )}
                 </div>
              </div>
            </div>

            {/* Sub-Acoustic Metadata Footer */}
            <div className="px-10 py-5 bg-white/[0.02] border-t border-white/5 flex justify-between items-center relative z-20">
               <div className="flex items-center gap-6 text-white/20">
                  <div className="flex items-center gap-2.5">
                    <Radio size={14} />
                    <span className="text-[8px] font-mono uppercase tracking-widest">NATIVE_AUDIO_12_25</span>
                  </div>
                  <div className="h-4 w-px bg-white/5"></div>
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck size={14} className="text-green-500/40" />
                    <span className="text-[8px] font-mono uppercase tracking-widest">Privacy Encrypted</span>
                  </div>
               </div>
            </div>
        </div>
    );
};

const DossierLine = ({ label, value }: { label: string, value: string }) => (
  <div className="flex justify-between items-center group/line">
    <span className="text-[8px] font-black uppercase text-white/20 tracking-widest">{label}</span>
    <span className="text-[9px] font-bold text-white/60 group-hover/line:text-gold-main transition-colors font-mono">{value}</span>
  </div>
);

export default LiveOracle;