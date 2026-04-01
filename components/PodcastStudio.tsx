import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, Pause, SkipForward, SkipBack, Music, Mic, 
  Disc3, Radio, Headphones, Volume2, Search, 
  Sparkles, Clock, ArrowRight, Share2, Heart,
  VolumeX, ListMusic, Bot, Wifi, Download, 
  Loader2, Zap, Save, Trash2, Mic2, AlertCircle,
  Database, Plus, Globe, Upload, FileAudio, X,
  Activity, BarChart3, Binary, Link as LinkIcon, ChevronRight, ZapOff,
  Maximize, Minimize, Star, Library
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { podcastTracks, PodcastTrack, courseData } from '../data/courseContent';
import { GoogleGenAI } from "@google/genai";
import { cacheMedia, preCacheMedia } from '../src/lib/mediaCache';
import { useBranding } from './BrandingContext';
import { syncSunoProfile, SunoTrack } from '../src/services/sunoService';

interface PodcastStudioProps {
  onOpenConsultancy?: () => void;
  elevenLabsKey?: string;
  voiceId?: string;
}

const BURT_VOICE_ID = 'Yko7iBn2vnSMvSAsuF8N'; // Default
const CACHE_NAME = 'echomasters-media-vault-v1';

const PodcastStudio: React.FC<PodcastStudioProps> = ({ onOpenConsultancy, elevenLabsKey: propElevenLabsKey, voiceId }) => {
  const { overrides } = useBranding();
  const elevenLabsKey = propElevenLabsKey || overrides['eleven-labs-key']?.value || localStorage.getItem('spi-eleven-labs-key') || '';
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'songs' | 'lectures' | 'custom'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTrackId, setCurrentTrackId] = useState<string>('');
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);

  const [showManualUplink, setShowManualUplink] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualArtist, setManualArtist] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [uplinkError, setUplinkError] = useState<string | null>(null);
  const [cacheSize, setCacheSize] = useState<string>('0 B');

  const [customTracks, setCustomTracks] = useState<PodcastTrack[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);

  // Sync overrides tracks
  const overrideTracks = useMemo(() => {
    return Object.keys(overrides)
      .filter(k => k.startsWith('radio-track-'))
      .map(id => ({
        id,
        title: overrides[id].label || 'Untitled Track',
        artist: overrides[id].metadata?.artist || 'Unknown Artist',
        url: overrides[id].value,
        duration: 'LIVE',
        type: overrides[id].metadata?.type || 'song',
        description: 'Custom node from Admin Core.',
        tags: ['Admin', 'Custom']
      } as PodcastTrack));
  }, [overrides]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!playerRef.current) return;
    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const [radioState, setRadioState] = useState<{ isPlaying: boolean; volume: number; isMuted: boolean }>({ isPlaying: false, volume: 0.5, isMuted: false });

  useEffect(() => {
    loadCachedTracks();
    updateCacheSize();
    const handleAudioState = (e: any) => {
        setIsPlaying(e.detail.isPlaying);
        setRadioState({
            isPlaying: e.detail.isPlaying,
            volume: e.detail.volume,
            isMuted: e.detail.isMuted
        });
        if (e.detail.track) setCurrentTrackId(e.detail.track.id);
    };
    window.addEventListener('echomasters-audio-state', handleAudioState);
    return () => window.removeEventListener('echomasters-audio-state', handleAudioState);
  }, []);

  const loadCachedTracks = async () => {
    try {
      const metadata = localStorage.getItem('echomasters-custom-tracks');
      if (metadata) {
        const parsed = JSON.parse(metadata);
        if (Array.isArray(parsed)) {
          setCustomTracks(parsed.filter(t => t && t.id && t.url));
        }
      }
      updateCacheSize();
    } catch (e) {
      console.error("Cache load failed", e);
    }
  };

  const updateCacheSize = async () => {
    try {
      const { getCacheSize } = await import('../src/lib/mediaCache');
      const size = await getCacheSize();
      if (size < 1024) setCacheSize(`${size} B`);
      else if (size < 1024 * 1024) setCacheSize(`${(size / 1024).toFixed(1)} KB`);
      else setCacheSize(`${(size / (1024 * 1024)).toFixed(1)} MB`);
    } catch (e) {
      console.warn("Could not get cache size", e);
    }
  };

  const handleSunoSync = async () => {
    setIsSyncing(true);
    try {
      const newSongs = await syncSunoProfile('https://suno.com/@fairwaydreams');
      if (newSongs.length > 0) {
        // Pre-cache the newly synced tracks
        preCacheMedia(newSongs.map(t => t.url));

        setCustomTracks(prev => {
          const existingIds = new Set(prev.map(t => t.id));
          const uniqueNew = newSongs
            .filter(s => !existingIds.has(s.id))
            .map(s => ({
              ...s,
              duration: '3:30',
              type: 'song' as const,
              description: 'Synced from Suno Profile.',
              tags: ['Suno', 'Synced']
            }));
          
          if (uniqueNew.length === 0) return prev;
          
          const updated = [...uniqueNew, ...prev];
          localStorage.setItem('echomasters-custom-tracks', JSON.stringify(updated));
          return updated;
        });
      }
    } catch (e) {
      console.error("Sync failed", e);
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredTracks = [...podcastTracks, ...customTracks, ...overrideTracks].filter(track => {
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'songs' && track.type === 'song') || 
                      (activeTab === 'lectures' && track.type === 'lecture') ||
                      (activeTab === 'custom' && (track.id.startsWith('custom-') || track.id.startsWith('manual-') || track.id.startsWith('radio-track-')));
    const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          track.artist.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const playTrack = (track: PodcastTrack) => {
    if (!track || !track.url) return;
    setCurrentTrackId(track.id);
    setIsPlaying(true);

    // Dispatch event to SiteRadio
    window.dispatchEvent(new CustomEvent('echomasters-play-track', { 
        detail: { track } 
    }));

    // Check for Suno - handled by SiteRadio centrally
    (window as any).duckRadio?.(false);
  };

  const generateModuleAudio = async (moduleId: string) => {
    const module = courseData.find(m => m.id === moduleId);
    if (!module || isRecording) return;
    
    setIsRecording(true);
    setRecordingProgress(0);
    
    const topics = module.topics;
    const total = topics.length;
    
    for (let i = 0; i < total; i++) {
        const topic = topics[i];
        setRecordingProgress((i / total) * 100);
        
        // Check if already in custom tracks
        if (customTracks.some(t => t.title.includes(topic.title))) continue;

        let script = "";
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            const prompt = `Write a high-yield ultrasound physics podcast script for: "${topic.title}". Narrator: Faculty Unit. Tone: Cool, mature, paternal. Max 55 words. Start with "Listen close." Raw text only.`;
            const res = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
            script = res.text || `Focus on ${topic.title}. Let's secure this concept.`;
        } catch (e) {
            script = `Attention student. Focus on ${topic.title} mechanics. Let's secure this concept.`;
        }

        try {
            const elRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId || BURT_VOICE_ID}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'xi-api-key': elevenLabsKey },
                body: JSON.stringify({
                    text: script, model_id: 'eleven_multilingual_v2',
                    voice_settings: { stability: 0.5, similarity_boost: 0.8 }
                })
            });
            if (elRes.ok) {
                const audioBlob = await elRes.blob();
                const customId = `custom-lecture-${Date.now()}-${i}`;
                const apiUrl = `/api/audio/${customId}`;
                
                // Use Cache API via mediaCache logic (manual put for custom API routes)
                const cache = await caches.open(CACHE_NAME);
                await cache.put(new Request(apiUrl), new Response(audioBlob));

                const newTrack: PodcastTrack = {
                    id: customId, title: `${topic.title} (Lecture)`, artist: 'Faculty Node 01',
                    url: apiUrl, duration: '1:00', type: 'lecture',
                    description: `Custom deep dive into ${topic.title}.`, tags: ['AI Generated', module.title]
                };
                setCustomTracks(prev => {
                    const updated = [newTrack, ...prev];
                    localStorage.setItem('echomasters-custom-tracks', JSON.stringify(updated));
                    return updated;
                });
            }
        } catch (e) {
            console.error(`Failed to generate audio for ${topic.title}`, e);
        }
        // Small delay to avoid rate limits
        await new Promise(r => setTimeout(r, 1000));
    }
    
    setRecordingProgress(100);
    updateCacheSize();
    setTimeout(() => { setIsRecording(false); setRecordingProgress(0); setActiveTab('custom'); }, 1000);
  };

  const activeTrack = filteredTracks.find(t => t.id === currentTrackId) || filteredTracks[0] || podcastTracks[0];

  const getCacheKey = (text: string) => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16);
  };

  const generateNewLecture = async (topicTitle: string) => {
    if (isRecording) return;
    setIsRecording(true);
    setRecordingProgress(10);
    
    let script = "";
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Write a high-yield ultrasound physics podcast script for: "${topicTitle}". Narrator: Faculty Unit. Tone: Cool, mature, paternal. Max 55 words. Start with "Listen close." Raw text only.`;
      const res = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      script = res.text || `Focus on ${topicTitle}. Let's secure this concept.`;
    } catch (e) {
      script = `Attention student. Focus on ${topicTitle} mechanics. Let's secure this concept.`;
    }
      
    setRecordingProgress(40);

    try {
      const cacheKey = getCacheKey(script);
      const apiUrl = `/api/audio/lecture/${cacheKey}`;
      
      // Check Cache API first
      try {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(apiUrl);
        if (cachedResponse) {
          const blob = await cachedResponse.blob();
          if (blob.size > 0) {
            const newTrack: PodcastTrack = {
              id: `cached-lecture-${cacheKey}`, title: `${topicTitle} (Lecture)`, artist: 'Faculty Node 01',
              url: apiUrl, duration: '1:00', type: 'lecture',
              description: `Cached deep dive into ${topicTitle}.`, tags: ['AI Generated', 'Cached']
            };
            const updatedCustom = [newTrack, ...customTracks.filter(t => t.id !== newTrack.id)];
            setCustomTracks(updatedCustom);
            localStorage.setItem('echomasters-custom-tracks', JSON.stringify(updatedCustom));
            setRecordingProgress(100);
            setTimeout(() => { setIsRecording(false); setRecordingProgress(0); setActiveTab('custom'); playTrack(newTrack); }, 500);
            return;
          }
        }
      } catch (e) { console.warn("Cache check error", e); }

      const elRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId || BURT_VOICE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'xi-api-key': elevenLabsKey },
        body: JSON.stringify({
          text: script, model_id: 'eleven_multilingual_v2',
          voice_settings: { stability: 0.5, similarity_boost: 0.8 }
        })
      });
      if (!elRes.ok) throw new Error("TTS Failed");
      const audioBlob = await elRes.blob();
      setRecordingProgress(80);
      
      const cache = await caches.open(CACHE_NAME);
      await cache.put(new Request(apiUrl), new Response(audioBlob));
      
      const newTrack: PodcastTrack = {
        id: `custom-lecture-${cacheKey}`, title: `${topicTitle} (Lecture)`, artist: 'Faculty Node 01',
        url: apiUrl, duration: '1:00', type: 'lecture',
        description: `Custom deep dive into ${topicTitle}.`, tags: ['AI Generated']
      };
      const updatedCustom = [newTrack, ...customTracks];
      setCustomTracks(updatedCustom);
      localStorage.setItem('echomasters-custom-tracks', JSON.stringify(updatedCustom));
      setRecordingProgress(100);
      setTimeout(() => { setIsRecording(false); setRecordingProgress(0); setActiveTab('custom'); playTrack(newTrack); }, 1000);
    } catch (e) {
      setIsRecording(false);
    }
  };

  const handleManualDeployment = async () => {
    if (!manualTitle || (!manualUrl && !manualArtist)) return;
    setIsDeploying(true);
    setUplinkError(null);
    const customId = `manual-${Date.now()}`;
    const newTrack: PodcastTrack = {
      id: customId, title: manualTitle, artist: manualArtist || 'Specialist ID',
      url: manualUrl, duration: 'LIVE', type: 'song',
      description: 'Manually deployed node.', tags: ['Manual']
    };
    
    try {
      // Cache it if it's a remote URL
      if (manualUrl.startsWith('http')) {
        const { cacheMedia } = await import('../src/lib/mediaCache');
        await cacheMedia(manualUrl);
      }
      
      const updatedCustom = [newTrack, ...customTracks];
      setCustomTracks(updatedCustom);
      localStorage.setItem('echomasters-custom-tracks', JSON.stringify(updatedCustom));
      
      setTimeout(() => {
        setIsDeploying(false); 
        setManualTitle(''); 
        setManualArtist(''); 
        setManualUrl('');
        setShowManualUplink(false); 
        setActiveTab('custom'); 
        playTrack(newTrack);
        updateCacheSize();
      }, 800);
    } catch (err) {
      console.error("Deployment failed", err);
      setUplinkError("Deployment failed. Check signal.");
      setIsDeploying(false);
    }
  };

  const clearManualForm = () => {
    setManualTitle('');
    setManualArtist('');
    setManualUrl('');
    setUplinkError(null);
  };

  const handleClearCache = async () => {
    if (window.confirm("Are you sure you want to clear the media cache? This will remove all offline audio.")) {
        const { clearMediaCache } = await import('../src/lib/mediaCache');
        await clearMediaCache();
        updateCacheSize();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 md:px-10 py-6 md:py-16 space-y-12 md:space-y-16 text-left font-sans pb-40"
    >
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border-b border-white/5 pb-12">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="space-y-6 text-white overflow-hidden flex-1"
        >
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg border transition-all ${radioState.isPlaying ? 'bg-gold-main/20 border-gold-main/40 shadow-gold' : 'bg-white/5 border-white/10'}`}>
                    <Radio size={14} className={radioState.isPlaying ? "text-gold-main animate-pulse" : "text-white/20"} />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Sector Resonance Chamber</span>
                    <div className="flex items-center gap-4">
                        <span className={`text-[8px] font-mono uppercase tracking-widest ${radioState.isPlaying ? 'text-gold-main' : 'text-white/20'}`}>
                            {radioState.isPlaying ? 'Signal Active' : 'Signal Standby'} {radioState.isMuted ? '(MUTED)' : ''}
                        </span>
                        <div className="flex items-center gap-2 group/vol">
                            <Volume2 size={10} className="text-white/20 group-hover/vol:text-gold-main transition-colors" />
                            <input 
                                type="range" 
                                min="0" 
                                max="1" 
                                step="0.01" 
                                value={radioState.volume} 
                                onChange={(e) => {
                                    const vol = parseFloat(e.target.value);
                                    (window as any).setRadioVolume?.(vol);
                                }}
                                className="w-16 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-gold-main"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="space-y-2">
                <h1 className="text-[clamp(2rem,8vw,5.5rem)] font-serif font-bold tracking-tighter leading-[0.8] italic uppercase">Echo <span className="text-gold-main not-italic">Chamber</span></h1>
                <p className="text-slate-400 text-sm md:text-xl font-light max-w-2xl italic leading-relaxed border-l-2 border-gold-main/20 pl-6 py-1">
                    State-of-the-art auditory physics. Master high-yield clinical concepts through our exclusive Faculty Broadcasts.
                </p>
            </div>
        </motion.div>
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex flex-wrap gap-4 w-full lg:w-auto"
        >
            <div className="flex flex-col items-end justify-center px-4 border-r border-white/5 mr-2">
                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Cache Storage</span>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-gold-main/60">{cacheSize}</span>
                    <button onClick={handleClearCache} className="text-white/10 hover:text-red-500 transition-colors" title="Clear Cache">
                        <Trash2 size={10} />
                    </button>
                </div>
            </div>
            <button 
                onClick={handleSunoSync}
                disabled={isSyncing}
                className={`px-8 py-5 rounded-[2rem] bg-blue-500/10 text-blue-400 border border-blue-500/20 font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-3 hover:bg-blue-500/20 ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {isSyncing ? <Loader2 className="animate-spin" size={16} /> : <Music size={16} />}
                <span>{isSyncing ? 'Scanning Suno...' : 'Sync Suno Profile'}</span>
            </button>
            <button onClick={() => setShowManualUplink(!showManualUplink)} className={`px-8 py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-3 border ${showManualUplink ? 'bg-white text-slate-950 border-white shadow-xl' : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'}`}>
                {showManualUplink ? <X size={16} /> : <Plus size={16} />}
                <span>{showManualUplink ? 'Abort Uplink' : 'Manual Uplink'}</span>
            </button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        
        <div className="lg:col-span-8 space-y-12">
            
            <AnimatePresence>
              {showManualUplink && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0, y: -20 }}
                    animate={{ height: 'auto', opacity: 1, y: 0 }}
                    exit={{ height: 0, opacity: 0, y: -20 }}
                    className="p-8 md:p-14 bg-gold-main/5 border-2 border-gold-main/20 rounded-[3rem] space-y-10 relative overflow-hidden shadow-3xl"
                  >
                      <div className="flex items-center justify-between border-b border-gold-main/10 pb-8">
                          <div className="flex items-center gap-6">
                              <div className="w-16 h-16 bg-gold-main text-slate-950 rounded-2xl flex items-center justify-center shadow-gold"><Globe size={28} /></div>
                              <div>
                                  <h3 className="text-2xl md:text-3xl font-serif font-bold text-white italic uppercase tracking-tight leading-none">External Node Uplink</h3>
                                  <p className="text-[9px] text-gold-main/60 font-black uppercase tracking-[0.3em] mt-2">Remote Signal Deployment Protocol</p>
                              </div>
                          </div>
                          <button onClick={clearManualForm} className="p-3 text-white/20 hover:text-red-500 transition-colors" title="Clear Form">
                              <Trash2 size={20} />
                          </button>
                      </div>

                      {uplinkError && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-xs animate-pulse"
                          >
                              <AlertCircle size={16} />
                              <span>{uplinkError}</span>
                          </motion.div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                              <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] ml-2">Node Identification</label>
                              <input type="text" value={manualTitle} onChange={(e) => setManualTitle(e.target.value)} className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-6 py-4 text-white font-serif italic text-lg focus:border-gold-main/40 transition-all outline-none" placeholder="Target Lesson Title" />
                          </div>
                          <div className="space-y-3">
                              <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] ml-2">Transmitting Specialist</label>
                              <input type="text" value={manualArtist} onChange={(e) => setManualArtist(e.target.value)} className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-6 py-4 text-white font-serif italic text-lg focus:border-gold-main/40 transition-all outline-none" placeholder="Identity Code" />
                          </div>
                      </div>
                      <div className="space-y-3">
                          <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] ml-2">Acoustic Signal Source (.mp3)</label>
                          <div className="flex gap-4">
                              <div className="relative flex-1">
                                  <LinkIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                  <input type="text" value={manualUrl} onChange={(e) => setManualUrl(e.target.value)} className="w-full bg-slate-950/60 border border-white/10 rounded-2xl pl-16 pr-6 py-4 text-gold-main font-mono text-xs focus:border-gold-main transition-all outline-none" placeholder="https://external-resource.mp3" />
                              </div>
                              <div className="relative">
                                  <input 
                                      type="file" 
                                      id="manual-audio-upload" 
                                      className="hidden" 
                                      accept="audio/mpeg,audio/wav,audio/mp3" 
                                      onChange={async (e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                              setIsDeploying(true);
                                              setUplinkError(null);
                                              try {
                                                  const { storage } = await import('../firebase');
                                                  const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
                                                  const storageRef = ref(storage, `manual-uploads/${Date.now()}-${file.name}`);
                                                  const snapshot = await uploadBytes(storageRef, file);
                                                  const url = await getDownloadURL(snapshot.ref);
                                                  setManualUrl(url);
                                                  
                                                  // Pre-cache the uploaded file
                                                  const { cacheMedia } = await import('../src/lib/mediaCache');
                                                  await cacheMedia(url);
                                                  updateCacheSize();
                                              } catch (err) {
                                                  console.error("Upload failed", err);
                                                  setUplinkError("Upload failed. Check storage permissions.");
                                              } finally {
                                                  setIsDeploying(false);
                                              }
                                          }
                                      }}
                                  />
                                  <label 
                                      htmlFor="manual-audio-upload"
                                      className={`flex items-center justify-center w-16 h-16 rounded-2xl border border-white/10 bg-white/5 text-white/40 hover:text-gold-main hover:border-gold-main/40 hover:bg-gold-main/10 transition-all cursor-pointer ${isDeploying ? 'animate-pulse pointer-events-none' : ''}`}
                                  >
                                      {isDeploying ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
                                  </label>
                              </div>
                          </div>
                      </div>

                      {manualUrl && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-6 bg-slate-950/40 border border-white/5 rounded-2xl space-y-4 animate-fade-in"
                          >
                              <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-gold-main/10 rounded-lg flex items-center justify-center border border-gold-main/20">
                                          <Activity size={14} className="text-gold-main animate-pulse" />
                                      </div>
                                      <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Signal Preview Active</span>
                                  </div>
                                  <button onClick={() => setManualUrl('')} className="text-white/20 hover:text-white transition-colors">
                                      <X size={14} />
                                  </button>
                              </div>
                              <audio src={manualUrl} controls className="w-full h-10 opacity-60 hover:opacity-100 transition-opacity" />
                          </motion.div>
                      )}

                      <button onClick={handleManualDeployment} disabled={!manualTitle || (!manualUrl && !manualArtist) || isDeploying} className={`w-full py-6 rounded-2xl font-black uppercase text-[12px] tracking-[0.4em] transition-all flex items-center justify-center gap-4 ${isDeploying ? 'bg-white/5 text-white/20' : 'bg-gold-main text-slate-950 shadow-gold hover:shadow-[0_0_60px_rgba(181,148,78,0.5)] active:scale-[0.98]'}`}>
                          {isDeploying ? <Loader2 className="animate-spin" size={20} /> : <><Zap size={20} fill="currentColor" /> Initialize Resonance</>}
                      </button>
                  </motion.div>
              )}
            </AnimatePresence>

            <div 
                ref={playerRef}
                className={`bg-slate-950/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] md:rounded-[4rem] p-8 md:p-14 shadow-3xl relative overflow-hidden group ${isFullscreen ? 'fixed inset-0 z-[2000] rounded-none border-none flex flex-col items-center justify-start md:justify-center bg-slate-950 overflow-y-auto custom-scrollbar' : ''}`}
            >
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(181,148,78,0.02)_50%,transparent_100%)] w-full h-full animate-radar-sweep pointer-events-none opacity-40"></div>
                
                {isFullscreen && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold-main/5 blur-[120px] rounded-full animate-pulse"></div>
                    <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full animate-bounce-slow"></div>
                  </div>
                )}

                {isFullscreen && (
                  <button 
                    onClick={toggleFullscreen}
                    className="fixed top-6 right-6 z-[2001] p-3 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-white transition-all active:scale-95"
                  >
                    <X size={24} />
                  </button>
                )}

                <div className={`flex flex-col md:flex-row items-center gap-12 md:gap-16 relative z-10 ${isFullscreen ? 'max-w-4xl mx-auto py-20 md:py-0' : ''}`}>
                    <div className={`relative shrink-0 transition-all duration-1000 ${isFullscreen ? 'w-64 h-64 md:w-96 md:h-96' : 'w-48 h-48 md:w-64 md:h-64'}`}>
                        <div className={`relative w-full h-full rounded-full border-[8px] border-slate-950 shadow-[0_0_80px_rgba(181,148,78,0.2)] overflow-hidden transition-all duration-1000 ${isPlaying ? 'scale-105' : 'scale-95 grayscale'}`}>
                            <div className={`absolute inset-0 bg-gold-gradient transition-transform duration-1000 ${isPlaying ? 'animate-[spin_10s_linear_infinite]' : ''}`}></div>
                            
                            {/* Visualizer Rings */}
                            {isPlaying && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                {[1, 2, 3].map(i => (
                                  <motion.div 
                                    key={i}
                                    initial={{ scale: 1, opacity: 0.5 }}
                                    animate={{ scale: 1.5, opacity: 0 }}
                                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.6 }}
                                    className="absolute inset-0 border-2 border-gold-main/20 rounded-full"
                                  />
                                ))}
                              </div>
                            )}

                            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/20 backdrop-blur-[2px]">
                                {activeTrack.type === 'song' ? <Headphones size={isFullscreen ? 120 : 80} className="text-white/90 drop-shadow-3xl" /> : <Mic2 size={isFullscreen ? 120 : 80} className="text-white/90 drop-shadow-3xl" />}
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-6">
                        <div className="space-y-3">
                            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white tracking-tighter italic uppercase leading-none">{activeTrack.title}</h2>
                            <p className="text-lg text-slate-400 font-light italic opacity-70">{activeTrack.artist}</p>
                        </div>

                        <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-center md:justify-start gap-8">
                                <button className="p-2 text-white/20 hover:text-white transition-all transform hover:scale-110"><SkipBack size={32} /></button>
                                <button onClick={() => playTrack(activeTrack)} className="w-20 h-20 rounded-[2rem] bg-gold-main text-slate-950 flex items-center justify-center shadow-gold hover:scale-105 active:scale-95 transition-all group">
                                    {isPlaying && activeTrack.id === currentTrackId ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1.5" />}
                                </button>
                                <button className="p-2 text-white/20 hover:text-white transition-all transform hover:scale-110"><SkipForward size={32} /></button>
                                <button 
                                    onClick={toggleFullscreen}
                                    className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/20 hover:text-gold-main transition-all hover:scale-110"
                                    title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                                >
                                    {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                                </button>
                            </div>
                        </div>
                    </div>
                  </div>
                </div>

            {!showManualUplink && (
                <div className="p-8 bg-slate-900 border border-white/5 rounded-[3rem] space-y-8 relative group overflow-hidden shadow-2xl">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-gold-main/10 rounded-2xl flex items-center justify-center border border-gold-main/30 shadow-gold group-hover:rotate-12 transition-transform">
                                <Bot className="text-gold-main" size={28} />
                            </div>
                            <div className="text-left">
                                <h3 className="text-xl font-serif font-bold text-white italic tracking-tight">Sonic Architect</h3>
                                <p className="text-[9px] font-black text-gold-main/60 uppercase tracking-[0.4em]">Lecture Deployment</p>
                            </div>
                        </div>
                        <div className="flex-1 w-full max-w-sm">
                            {isRecording ? (
                                <div className="h-14 bg-white/5 rounded-2xl border border-white/10 flex items-center px-6 gap-4 overflow-hidden relative">
                                    <div className="h-full bg-gold-main/10 absolute left-0 transition-all duration-[2000ms] ease-linear" style={{ width: `${recordingProgress}%` }}></div>
                                    <Loader2 className="w-5 h-5 text-gold-main animate-spin relative z-10" />
                                    <span className="text-[9px] font-black text-white uppercase tracking-[0.4em] relative z-10">Encoding...</span>
                                </div>
                            ) : (
                                <select 
                                    className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white font-serif font-bold italic focus:border-gold-main/50 transition-all outline-none appearance-none cursor-pointer"
                                    onChange={(e) => {
                                        if (e.target.value.startsWith('module-')) {
                                            generateModuleAudio(e.target.value.replace('module-', ''));
                                        } else {
                                            generateNewLecture(e.target.value);
                                        }
                                    }}
                                    defaultValue=""
                                >
                                    <option value="" disabled>Deploy New Node...</option>
                                    {courseData.map(m => (
                                        <optgroup key={m.id} label={m.title} className="bg-slate-950 text-white/40 uppercase text-[9px] tracking-widest font-black">
                                            <option value={`module-${m.id}`} className="bg-gold-main/20 text-gold-main font-black">GENERATE FULL MODULE</option>
                                            {m.topics.map(t => <option key={t.id} value={t.title} className="bg-slate-900 text-white font-serif italic">{t.title}</option>)}
                                        </optgroup>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>

        <div className="lg:col-span-4 space-y-8">
            <div className="bg-slate-950/40 p-8 rounded-[3.5rem] border border-white/10 flex flex-col h-[600px] shadow-3xl relative overflow-hidden">
                <div className="space-y-6 mb-8 relative z-10">
                    <h3 className="text-xl font-serif font-bold text-white tracking-tight uppercase italic px-2">Library</h3>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-gold-main" />
                        <input type="text" placeholder="Filter..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-xs text-white outline-none focus:border-gold-main/40 font-mono" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-8 pr-2 relative z-10">
                    {/* Featured Section */}
                    {filteredTracks.some(t => t.artist === 'Fairway Dreams') && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 px-2">
                                <Star size={12} className="text-gold-main fill-gold-main" />
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gold-main/60">Featured Artist</span>
                            </div>
                            <div className="space-y-2">
                                {filteredTracks.filter(t => t.artist === 'Fairway Dreams').map((track, i) => (
                                    <motion.button 
                                      key={track.id + i} 
                                      whileHover={{ scale: 1.02, x: 5 }}
                                      whileTap={{ scale: 0.98 }}
                                      onClick={() => playTrack(track)} 
                                      className={`w-full p-4 rounded-2xl border transition-all flex items-center gap-4 group/item ${currentTrackId === track.id ? 'bg-blue-500 text-white border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.4)]' : 'bg-blue-500/5 border-blue-500/10 hover:border-blue-500/40 text-blue-400/70'}`}
                                    >
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center border bg-slate-950 border-white/5">
                                            {currentTrackId === track.id && isPlaying ? <Disc3 size={16} className="animate-spin" /> : <Music size={16} />}
                                        </div>
                                        <div className="flex-1 min-w-0 text-left">
                                            <p className="text-sm font-serif font-bold truncate leading-tight">{track.title}</p>
                                            <p className="text-[7px] font-black uppercase tracking-widest truncate opacity-40">{track.artist}</p>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-2">
                            <Library size={12} className="text-white/20" />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Faculty Archives</span>
                        </div>
                        <div className="space-y-2">
                            {filteredTracks.filter(t => t.artist !== 'Fairway Dreams').map((track, i) => (
                                <motion.button 
                                  key={track.id + i} 
                                  whileHover={{ scale: 1.02, x: 5 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => playTrack(track)} 
                                  className={`w-full p-4 rounded-2xl border transition-all flex items-center gap-4 group/item ${currentTrackId === track.id ? 'bg-gold-main text-slate-950 border-gold-main shadow-gold' : 'bg-white/[0.02] border-white/5 hover:border-gold-main/20 text-white/70'}`}
                                >
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center border bg-slate-900 border-white/5">
                                        {currentTrackId === track.id && isPlaying ? <Disc3 size={16} className="animate-spin" /> : track.type === 'song' ? <Music size={16} /> : <Mic2 size={16} />}
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="text-sm font-serif font-bold truncate leading-tight">{track.title}</p>
                                        <p className="text-[7px] font-black uppercase tracking-widest truncate opacity-40">{track.artist}</p>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <style>{`
        @keyframes radar-sweep { from { transform: translateX(-100%); } to { transform: translateX(100%); } }
        .animate-radar-sweep { animation: radar-sweep 6s linear infinite; }
      `}</style>
    </motion.div>
  );
};

export default PodcastStudio;