
import React, { useState, useEffect, useRef } from 'react';
import { Music, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Radio, ListMusic, ChevronDown, Disc3, Sparkles, Mic, Headphones, Loader2, AlertCircle, Clock, Zap, Maximize, Minimize, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { preCacheMedia, cacheMedia } from '../src/lib/mediaCache';

import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

export interface RadioTrack {
    id: string;
    title: string;
    artist: string;
    url: string;
    duration?: string;
    type?: 'music' | 'podcast' | 'study';
}

export const DEFAULT_TRACKS: RadioTrack[] = [
    { id: 'suno-1', title: 'ATTENUATION', artist: 'Fairway Dreams', url: 'https://cdn1.suno.ai/de485ce0-36f5-4af7-8a13-8db6656524bc.mp3', duration: '3:15', type: 'music' },
    { id: 'suno-2', title: 'The Transducer', artist: 'Fairway Dreams', url: 'https://cdn1.suno.ai/1ab86882-d7e2-40ad-b317-3b7b4f23584d.mp3', duration: '2:45', type: 'music' },
    { id: 'suno-3', title: 'SOUND WAVES', artist: 'Fairway Dreams', url: 'https://cdn1.suno.ai/6bb37caa-b672-4e3b-ae20-5b576667d170.mp3', duration: '3:00', type: 'music' },
    { id: 'suno-4', title: 'BIOEFFECTS AND SAFETY', artist: 'Fairway Dreams', url: 'https://cdn1.suno.ai/df1e99e8-ac74-4daf-b187-4877fb77adab.mp3', duration: '3:30', type: 'music' },
    { id: 'suno-5', title: 'Quality Assurance', artist: 'Fairway Dreams', url: 'https://cdn1.suno.ai/401ecfdf-7f29-4d89-bba2-53594883c648.mp3', duration: '2:50', type: 'music' },
    { id: 'suno-6', title: 'PROPAGATION ARTIFACTS', artist: 'Fairway Dreams', url: 'https://cdn1.suno.ai/890d81af-a9dd-4a7c-bd8b-8b8ad2130009.mp3', duration: '3:10', type: 'music' },
];

export const sharedAudio = new Audio();
sharedAudio.preload = "auto";
// Remove crossOrigin = "anonymous" to prevent CORS issues with non-CORS sources
// sharedAudio.crossOrigin = "anonymous";

let isAudioInitialized = false;
let globalTrackIdx = 0;
let globalVolume = 0.5;
let globalIsMuted = false;
let globalPlaylist: RadioTrack[] = [...DEFAULT_TRACKS];

const isValidUrl = (url: string) => {
    if (!url || typeof url !== 'string') return false;
    if (url.startsWith('/') || url.startsWith('blob:') || url.startsWith('data:')) return true;
    try {
        const parsed = new URL(url);
        if (parsed.href === window.location.href) return false;
        
        // Suno URLs are handled by our conversion logic
        if (url.includes('suno.com/')) return true;
        
        // Check for common audio extensions or known audio CDNs
        const path = parsed.pathname.toLowerCase();
        const isAudioExtension = path.endsWith('.mp3') || path.endsWith('.wav') || path.endsWith('.m4a') || path.endsWith('.ogg') || path.endsWith('.aac');
        const isKnownCDN = url.includes('cdn1.suno.ai') || url.includes('cdn2.suno.ai') || url.includes('elevenlabs.io');
        
        // Allow if it's a known audio source or has an audio extension
        // Also allow local API routes we use for cached audio
        if (isAudioExtension || isKnownCDN || path.startsWith('/api/audio/')) return true;
        
        // If it's a generic URL without an extension, we'll allow it only if it doesn't look like a common web page
        // or if it's a blob/data URL (already handled above)
        const isCommonWebPage = url.includes('google.com') || url.includes('facebook.com') || url.includes('twitter.com') || url.includes('youtube.com');
        if (isCommonWebPage) return false;

        // For other unknown URLs, we'll be cautious. 
        // If it has no extension and isn't a known CDN, it's likely not a direct audio file.
        // However, some APIs don't use extensions.
        // Let's allow it but it might still fail in the audio element.
        return !path.includes('.') || isAudioExtension; 
    } catch (e) {
        return false;
    }
};

(window as any).duckRadio = (duck: boolean) => {
    sharedAudio.volume = duck ? globalVolume * 0.2 : globalVolume;
};

const SiteRadio: React.FC = () => {
    const [currentPlaylist, setCurrentPlaylist] = useState<RadioTrack[]>(globalPlaylist);
    const [isPlaying, setIsPlaying] = useState(!sharedAudio.paused && isAudioInitialized);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentTrackIdx, setCurrentTrackIdx] = useState(globalTrackIdx);
    const [volume, setVolume] = useState(globalVolume);
    const [isMuted, setIsMuted] = useState(globalIsMuted);
    const [showFullPlayer, setShowFullPlayer] = useState(false);
    const [showPlaylist, setShowPlaylist] = useState(false);
    const [needsInteraction, setNeedsInteraction] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const playerRef = useRef<HTMLDivElement>(null);
    const [isMobileExpanded, setIsMobileExpanded] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    
    useEffect(() => {
        (window as any).setRadioVolume = (vol: number) => {
            globalVolume = vol;
            setVolume(vol);
            sharedAudio.volume = vol;
            // Trigger state update across components
            window.dispatchEvent(new CustomEvent('echomasters-audio-state', {
                detail: { 
                    isPlaying: !sharedAudio.paused, 
                    volume: vol, 
                    isMuted: sharedAudio.muted,
                    track: currentPlaylist[currentTrackIdx]
                }
            }));
        };
    }, [currentPlaylist, currentTrackIdx]);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    
    // Progress state
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const [retryCount, setRetryCount] = useState(0);
    const [consecutiveSkips, setConsecutiveSkips] = useState(0);
    const MAX_RETRIES = 3;

    const syncTracks = (firestoreSongs: RadioTrack[] = []) => {
        try {
            const saved = localStorage.getItem('spi-admin-overrides');
            const customTracks: RadioTrack[] = [];
            if (saved) {
                const overrides = JSON.parse(saved);
                Object.keys(overrides).forEach(key => {
                    if (key.startsWith('radio-track-')) {
                        const data = overrides[key];
                        if (isValidUrl(data.value)) {
                            customTracks.push({
                                id: key,
                                title: data.label || `Custom Node`,
                                artist: data.metadata?.artist || 'Academy Broadcast',
                                url: data.value,
                                type: data.metadata?.type || 'podcast'
                            });
                        }
                    }
                });
            }
            const newPlaylist = [...DEFAULT_TRACKS, ...firestoreSongs, ...customTracks];
            globalPlaylist = newPlaylist;
            setCurrentPlaylist(newPlaylist);
        } catch (e) {
            const newPlaylist = [...DEFAULT_TRACKS, ...firestoreSongs];
            globalPlaylist = newPlaylist;
            setCurrentPlaylist(newPlaylist);
        }
    };

    useEffect(() => {
        const q = query(collection(db, 'songs'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const firestoreSongs = snapshot.docs.map(doc => ({
                id: doc.id,
                title: doc.data().title,
                artist: 'Fairway Dreams',
                url: doc.data().url,
                type: 'music' as const
            }));
            syncTracks(firestoreSongs);
        }, (error) => {
            handleFirestoreError(error, OperationType.GET, 'songs');
            syncTracks([]);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        syncTracks();
        
        const initTrack = currentPlaylist[globalTrackIdx];
        if (!isAudioInitialized && isValidUrl(initTrack?.url)) {
            sharedAudio.src = initTrack.url;
            sharedAudio.volume = globalVolume;
            sharedAudio.load();
            isAudioInitialized = true;
        }

        // Pre-cache all media in the background
        const mediaToCache = [
            ...currentPlaylist.map(t => t.url),
            ...currentPlaylist.map(t => (t as any).coverArt).filter(Boolean)
        ].filter(url => url && !url.startsWith('/api/audio/'));
        preCacheMedia(mediaToCache);

        const handlePlay = () => { 
            setIsPlaying(true); 
            setIsLoading(false); 
            setError(null);
            setNeedsInteraction(false);
            setRetryCount(0);
            setConsecutiveSkips(0);
        };
        const handlePause = () => { 
            setIsPlaying(false);
        };
        const handleWaiting = () => setIsLoading(true);
        const handleCanPlay = () => setIsLoading(false);
        
        const handleEnded = () => {
            if (currentPlaylist.length === 0) return;
            const nextIdx = (globalTrackIdx + 1) % currentPlaylist.length;
            selectTrack(nextIdx);
        };

        const broadcastState = () => {
            window.dispatchEvent(new CustomEvent('echomasters-audio-state', {
                detail: {
                    isPlaying: !sharedAudio.paused,
                    track: currentPlaylist[globalTrackIdx],
                    currentTime: sharedAudio.currentTime,
                    duration: sharedAudio.duration,
                    volume: sharedAudio.volume,
                    isMuted: globalIsMuted
                }
            }));
        };

        const handleTimeUpdate = () => {
            const cur = sharedAudio.currentTime;
            const dur = sharedAudio.duration;
            if (dur > 0) {
                setProgress((cur / dur) * 100);
                setCurrentTime(cur);
                setDuration(dur);
            }
            broadcastState();
        };

        const handleError = (e: any) => {
            console.error("Audio Error Event:", e);
            const audioErr = sharedAudio.error;
            
            // Handle blob: URL fallback if cached source fails
            if (sharedAudio.src.startsWith('blob:')) {
                console.warn("Cached blob source failed, attempting direct link fallback...");
                const track = currentPlaylist[currentTrackIdx];
                if (track && isValidUrl(track.url)) {
                    sharedAudio.src = track.url;
                    sharedAudio.load();
                    sharedAudio.play().catch(() => {});
                    return;
                }
            }

            // Handle Suno CDN fallback (cdn1 <-> cdn2)
            if (sharedAudio.src.includes('cdn1.suno.ai')) {
                console.log("cdn1 failed, trying cdn2...");
                sharedAudio.src = sharedAudio.src.replace('cdn1.suno.ai', 'cdn2.suno.ai');
                sharedAudio.load();
                sharedAudio.play().catch(() => {});
                return;
            } else if (sharedAudio.src.includes('cdn2.suno.ai')) {
                console.log("cdn2 failed, trying cdn1...");
                sharedAudio.src = sharedAudio.src.replace('cdn2.suno.ai', 'cdn1.suno.ai');
                sharedAudio.load();
                sharedAudio.play().catch(() => {});
                return;
            }

            if (retryCount < MAX_RETRIES) {
                console.log(`Retrying track... Attempt ${retryCount + 1}`);
                setRetryCount(prev => prev + 1);
                setTimeout(() => {
                    sharedAudio.load();
                    sharedAudio.play().catch(() => {});
                }, 3000);
                return;
            }

            // If it's a "Source Unsupported" or "Network Error" and we have a playlist, skip to next
            if (audioErr?.code === 4 || audioErr?.code === 2) {
                if (consecutiveSkips < currentPlaylist.length) {
                    console.warn("Source unsupported or network error, skipping to next track...");
                    setConsecutiveSkips(prev => prev + 1);
                    nextTrack();
                } else {
                    setError("All Nodes Offline");
                    setIsLoading(false);
                    setIsPlaying(false);
                }
                return;
            }

            if (sharedAudio.src && sharedAudio.src !== window.location.href) {
                let msg = "Signal Lost";
                if (audioErr?.code === 4) msg = "Source Unsupported";
                else if (audioErr?.code === 3) msg = "Decode Error";
                else if (audioErr?.code === 2) msg = "Network Error";
                setError(`${msg}: ${audioErr?.message || 'Check Connection'}`);
            }
            setIsPlaying(false);
            setIsLoading(false);
        };

        const handleStalled = () => {
            console.warn("Audio Stalled");
            setIsLoading(true);
        };

        const handleSuspend = () => {
            console.warn("Audio Suspended");
        };

        const handleVolumeChange = () => {
            setVolume(sharedAudio.volume);
        };

        sharedAudio.addEventListener('play', handlePlay);
        sharedAudio.addEventListener('pause', handlePause);
        sharedAudio.addEventListener('waiting', handleWaiting);
        sharedAudio.addEventListener('canplay', handleCanPlay);
        sharedAudio.addEventListener('error', handleError);
        sharedAudio.addEventListener('ended', handleEnded);
        sharedAudio.addEventListener('timeupdate', handleTimeUpdate);
        sharedAudio.addEventListener('stalled', handleStalled);
        sharedAudio.addEventListener('suspend', handleSuspend);
        sharedAudio.addEventListener('volumechange', handleVolumeChange);

        const handleExternalPlay = (e: any) => {
            const { track } = e.detail;
            if (!isValidUrl(track?.url)) return;
            
            // Ensure unmuted when playing from Echo Chamber
            if (globalIsMuted) {
                setIsMuted(false);
                sharedAudio.muted = false;
            }

            setCurrentPlaylist(prev => {
                let idx = prev.findIndex(t => t?.url === track.url);
                if (idx === -1) {
                    const newList = [track, ...prev];
                    globalPlaylist = newList;
                    selectTrack(0, newList);
                    return newList;
                } else {
                    selectTrack(idx, prev);
                    return prev;
                }
            });
        };

        window.addEventListener('echomasters-play-track', handleExternalPlay);
        window.addEventListener('echomasters-toggle-play', togglePlay);

        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            sharedAudio.removeEventListener('play', handlePlay);
            sharedAudio.removeEventListener('pause', handlePause);
            sharedAudio.removeEventListener('waiting', handleWaiting);
            sharedAudio.removeEventListener('canplay', handleCanPlay);
            sharedAudio.removeEventListener('error', handleError);
            sharedAudio.removeEventListener('ended', handleEnded);
            sharedAudio.removeEventListener('timeupdate', handleTimeUpdate);
            sharedAudio.removeEventListener('stalled', handleStalled);
            sharedAudio.removeEventListener('suspend', handleSuspend);
            sharedAudio.removeEventListener('volumechange', handleVolumeChange);
            window.removeEventListener('echomasters-play-track', handleExternalPlay);
            window.removeEventListener('echomasters-toggle-play', togglePlay);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, [retryCount]);

    const resetAudio = () => {
        setError(null);
        setIsLoading(true);
        setRetryCount(0);
        setConsecutiveSkips(0);
        selectTrack(currentTrackIdx);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        sharedAudio.volume = isMuted ? 0 : volume;
        globalVolume = volume;
        globalIsMuted = isMuted;
    }, [volume, isMuted]);

    const togglePlay = () => {
        if (!isValidUrl(sharedAudio.src)) {
            selectTrack(currentTrackIdx);
            return;
        }
        if (isPlaying) {
            sharedAudio.pause();
        } else {
            const playPromise = sharedAudio.play();
            if (playPromise !== undefined) {
                playPromise.catch(err => {
                    if (err.name === 'NotAllowedError') {
                        setNeedsInteraction(true);
                    } else if (err.name !== 'AbortError') {
                        setError("Source Error");
                    }
                });
            }
        }
    };

    const nextTrack = () => selectTrack((currentTrackIdx + 1) % currentPlaylist.length);
    const prevTrack = () => selectTrack((currentTrackIdx - 1 + currentPlaylist.length) % currentPlaylist.length);

    const selectTrack = async (idx: number, playlistOverride?: RadioTrack[]) => {
        const list = playlistOverride || currentPlaylist;
        const track = list[idx];
        if (!isValidUrl(track?.url)) {
            setError("No Source");
            return;
        }
        
        globalTrackIdx = idx;
        setCurrentTrackIdx(idx);
        setError(null);
        setIsLoading(true);
        setProgress(0);
        
        let finalUrl = track.url;

        // Handle Suno song URLs by converting to direct CDN links if they aren't already
        if (finalUrl.includes('suno.com/')) {
            try {
                // Match UUID pattern: 8-4-4-4-12 hex chars
                const uuidMatch = finalUrl.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
                if (uuidMatch) {
                    const songId = uuidMatch[0];
                    finalUrl = `https://cdn1.suno.ai/${songId}.mp3`;
                    console.log("Converted Suno URL to CDN:", finalUrl);
                }
            } catch (e) {
                console.error("Failed to parse Suno URL:", finalUrl, e);
            }
        }

        // Unlock audio immediately to preserve user interaction chain
        const unlock = sharedAudio.play();
        if (unlock !== undefined) {
            unlock.then(() => {
                if (!isPlaying) sharedAudio.pause();
            }).catch(() => {});
        }

        // Use mediaCache utility for all tracks
        let cachedUrl = finalUrl;
        try {
            cachedUrl = await cacheMedia(finalUrl);
        } catch (e) {
            console.warn("Media cache resolution failed", e);
        }

        const attemptPlay = (url: string, isRetry = false) => {
            if (!isValidUrl(url)) {
                console.error("Invalid Source URL:", url);
                setError("Invalid Source");
                setIsLoading(false);
                return;
            }
            
            console.log(`Setting audio source to (${isRetry ? 'Direct' : 'Cached'}):`, url);
            sharedAudio.src = url;
            sharedAudio.load();
            const playPromise = sharedAudio.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    setIsLoading(false);
                    const errorMsg = e.message || e.name || "Unknown Error";
                    
                    if (e.name === 'NotAllowedError') {
                        setNeedsInteraction(true);
                        setShowFullPlayer(true);
                        if (window.innerWidth < 768) setIsMobileExpanded(true);
                    } else if (e.name === 'AbortError') {
                        console.log("Playback interrupted.");
                    } else if (!isRetry && (e.name === 'NotSupportedError' || errorMsg.toLowerCase().includes('no supported source'))) {
                        console.warn("Cached source failed, attempting direct link bypass...");
                        attemptPlay(finalUrl, true); // Use finalUrl (the converted CDN link) as fallback
                    } else {
                        setError(`Node Offline: ${errorMsg}`);
                        console.error("Audio Playback Error:", e);
                        
                        if (e.name === 'NotSupportedError' || errorMsg.toLowerCase().includes('no supported source')) {
                            if (consecutiveSkips < currentPlaylist.length) {
                                console.warn("All sources for this track failed, skipping...");
                                setConsecutiveSkips(prev => prev + 1);
                                setTimeout(() => nextTrack(), 1000);
                            } else {
                                setError("All Sources Failed");
                            }
                        }
                    }
                });
            }
        };

        attemptPlay(cachedUrl);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        const dur = sharedAudio.duration;
        if (dur > 0) {
            const next = (val / 100) * dur;
            sharedAudio.currentTime = next;
            setProgress(val);
        }
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const currentTrack = currentPlaylist[currentTrackIdx];

    return (
        <div className="relative font-sans flex items-center h-full">
            {/* Mobile Expanded Player Overlay */}
            <AnimatePresence>
                {isMobileExpanded && (
                    <motion.div 
                        initial={{ opacity: 0, y: '100%' }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-0 z-[1000] bg-slate-950 flex flex-col md:hidden overflow-y-auto custom-scrollbar"
                    >
                        <div className="absolute inset-0 bg-gold-gradient opacity-5 animate-pulse"></div>
                        
                        {/* Header */}
                        <div className="relative z-10 flex items-center justify-between p-6 sticky top-0 bg-slate-950">
                            <button onClick={() => setIsMobileExpanded(false)} className="p-2 text-white/40 hover:text-white transition-colors">
                                <ChevronDown size={24} />
                            </button>
                            <div className="flex flex-col items-center">
                                <span className="text-[8px] font-black text-gold-main uppercase tracking-[0.4em]">Acoustic Uplink</span>
                                <span className="text-[10px] text-white/40 font-mono uppercase tracking-widest">
                                    {isLoading ? 'Synchronizing...' : error ? 'Signal Lost' : retryCount > 0 ? `Retrying (${retryCount}/${MAX_RETRIES})` : 'Node_77_Active'}
                                </span>
                            </div>
                            <button onClick={() => setShowPlaylist(!showPlaylist)} className={`p-2 rounded-xl transition-all ${showPlaylist ? 'bg-gold-main/20 text-gold-main' : 'text-white/40'}`}>
                                <ListMusic size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="relative z-10 flex-1 flex flex-col items-center justify-start p-8 gap-12 pb-32">
                            {/* Artwork Area */}
                            <div className="relative group w-full max-w-[280px] aspect-square">
                                <div className={`w-full h-full rounded-[3rem] overflow-hidden border-4 border-white/10 shadow-[0_0_80px_rgba(181,148,78,0.2)] transition-all duration-1000 ${isPlaying ? 'scale-105' : 'scale-95 grayscale'}`}>
                                    <div className={`absolute inset-0 bg-gold-gradient transition-transform duration-[15s] linear infinite ${isPlaying ? 'animate-spin' : ''}`}></div>
                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/20 backdrop-blur-[2px]">
                                        <Music size={100} className="text-white opacity-20" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Disc3 size={140} className={`text-gold-main/20 ${isPlaying ? 'animate-spin-slow' : ''}`} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="text-center space-y-3 w-full">
                                <h2 className="text-3xl font-serif font-bold text-white tracking-tighter italic uppercase leading-tight">{currentTrack?.title}</h2>
                                <p className="text-lg text-slate-400 font-light italic opacity-70">{currentTrack?.artist}</p>
                            </div>

                            {/* Controls */}
                            <div className="w-full space-y-10">
                                {/* Seeker */}
                                <div className="space-y-3">
                                    <div className="relative h-6 flex items-center">
                                        <div className="absolute w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-gold-main shadow-gold transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                        </div>
                                        <input 
                                            type="range" 
                                            min="0" max="100" step="0.1" 
                                            value={progress} 
                                            onChange={handleSeek}
                                            className="absolute w-full h-1.5 bg-transparent appearance-none cursor-pointer accent-gold-main"
                                        />
                                    </div>
                                    <div className="flex justify-between text-[10px] font-mono text-white/20 uppercase tracking-widest">
                                        <span>{formatTime(currentTime)}</span>
                                        <span>{formatTime(duration)}</span>
                                    </div>
                                </div>

                                {/* Main Buttons */}
                                <div className="flex items-center justify-between px-4">
                                    <button onClick={prevTrack} className="p-4 text-white/40 hover:text-white transition-all transform active:scale-90"><SkipBack size={32} /></button>
                                    <button 
                                        onClick={togglePlay}
                                        className="w-24 h-24 rounded-[2.5rem] bg-gold-main text-slate-950 flex items-center justify-center shadow-gold active:scale-95 transition-all"
                                    >
                                        {isPlaying ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-2" />}
                                    </button>
                                    <button onClick={nextTrack} className="p-4 text-white/40 hover:text-white transition-all transform active:scale-90"><SkipForward size={32} /></button>
                                </div>

                                {/* Volume */}
                                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl">
                                    <Volume2 size={20} className="text-white/40" />
                                    <input 
                                        type="range" 
                                        min="0" max="1" step="0.01" 
                                        value={volume} 
                                        onChange={(e) => setVolume(parseFloat(e.target.value))} 
                                        className="flex-1 h-1 bg-white/10 rounded-full appearance-none accent-gold-main" 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-8 text-center">
                            <p className="text-[8px] font-black text-white/10 uppercase tracking-[0.5em]">Echo Masters High-Fidelity Audio Stream</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showPlaylist && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full right-0 mt-4 w-80 bg-slate-950/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl z-[200]"
                    >
                        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                            <div className="flex items-center gap-2"><Headphones size={14} className="text-gold-main" /><h4 className="text-[9px] font-black text-gold-main uppercase tracking-[0.4em]">Acoustic Vault</h4></div>
                            <button onClick={() => setShowPlaylist(false)} className="text-white/40 hover:text-white transition-colors"><ChevronDown size={14} /></button>
                        </div>
                        <div className="max-h-72 overflow-y-auto custom-scrollbar p-2">
                            {currentPlaylist.map((track, idx) => (
                                <motion.button 
                                    key={track.id + idx} 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    onClick={() => selectTrack(idx)} 
                                    className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all group ${currentTrackIdx === idx ? 'bg-gold-main/10 border border-gold-main/20' : 'hover:bg-white/5 border border-transparent'}`}
                                >
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${currentTrackIdx === idx ? 'bg-gold-main text-slate-900 border-gold-main shadow-gold' : 'bg-white/5 text-white/20 border-white/5'}`}>{currentTrackIdx === idx && isLoading ? <Loader2 size={14} className="animate-spin" /> : currentTrackIdx === idx && isPlaying ? <Disc3 size={18} className="animate-spin" /> : track.type === 'study' ? <Sparkles size={14} /> : <Music size={14} />}</div>
                                    <div className="text-left flex-1 min-w-0"><div className="flex items-center justify-between"><p className={`text-[11px] font-serif font-bold truncate ${currentTrackIdx === idx ? 'text-gold-main' : 'text-white'}`}>{track.title}</p><span className="text-[8px] text-white/20 font-mono">{track.duration || 'LIVE'}</span></div><p className="text-[8px] text-white/40 uppercase tracking-widest truncate">{track.artist}</p></div>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div 
                ref={playerRef}
                className={`flex flex-col bg-slate-950/40 backdrop-blur-xl border border-white/10 p-1.5 rounded-3xl transition-all duration-700 hover:border-gold-main/30 group ${showFullPlayer ? 'w-[280px] sm:w-[350px]' : 'w-auto'} touch-pan-y`}
            >
                {needsInteraction && showFullPlayer && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="px-4 py-2 bg-gold-main/10 border-b border-gold-main/20 flex items-center justify-between overflow-hidden"
                    >
                        <span className="text-[8px] font-black text-gold-main uppercase tracking-widest">Signal Locked</span>
                        <button onClick={togglePlay} className="px-3 py-1 bg-gold-main text-slate-950 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-gold">Establish Link</button>
                    </motion.div>
                )}

                {error && showFullPlayer && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="px-4 py-2 bg-red-500/10 border-b border-red-500/20 flex items-center justify-between overflow-hidden"
                    >
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">Signal Error</span>
                            <span className="text-[6px] text-red-400/60 uppercase truncate max-w-[150px]">{error}</span>
                        </div>
                        <button onClick={resetAudio} className="px-3 py-1 bg-red-500 text-white rounded-lg text-[8px] font-black uppercase tracking-widest shadow-lg">Reset Node</button>
                    </motion.div>
                )}
                
                <div className="flex items-center gap-3 px-2 py-1">
                    <button 
                        onClick={() => {
                            if (needsInteraction) {
                                togglePlay();
                            }
                            if (isMobile) {
                                setIsMobileExpanded(true);
                            } else {
                                setShowFullPlayer(!showFullPlayer);
                            }
                        }} 
                        className="flex items-center gap-3 group/icon relative"
                    >
                        <motion.div 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`rounded-2xl flex items-center justify-center border transition-all duration-500 ${isPlaying ? 'bg-gold-main/20 border-gold-main/40 shadow-gold' : error ? 'border-red-500/50 bg-red-500/10' : needsInteraction ? 'border-gold-main/50 bg-gold-main/10 animate-pulse' : 'bg-white/5 border border-white/10'} w-9 h-9 md:w-10 md:h-10`}
                        >
                            {isLoading ? <Loader2 size={16} className="text-gold-main animate-spin" /> : isPlaying ? (
                                <div className="flex gap-1 items-end h-3">
                                    <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.7 }} className="w-0.5 rounded-full bg-gold-main"></motion.div>
                                    <motion.div animate={{ height: [10, 4, 10] }} transition={{ repeat: Infinity, duration: 1.0 }} className="w-0.5 rounded-full bg-gold-main"></motion.div>
                                    <motion.div animate={{ height: [6, 14, 6] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-0.5 rounded-full bg-gold-main"></motion.div>
                                </div>
                            ) : error ? <AlertCircle size={16} className="text-red-500" /> : needsInteraction ? <Zap size={16} className="text-gold-main" /> : <Radio size={16} className="text-white/30 group-hover/icon:text-gold-main transition-colors" />}
                        </motion.div>
                        {!showFullPlayer && <div className="hidden sm:block max-w-[100px] overflow-hidden text-left">
                            <p className="text-[7px] font-black text-gold-main/60 uppercase tracking-widest leading-none mb-1">{error ? 'SIGNAL ERROR' : needsInteraction ? 'RE-SYNC REQ' : 'Acoustic'}</p>
                            <p className="text-[10px] text-white/80 font-serif font-bold truncate leading-none italic">{error || currentTrack?.title || 'Offline'}</p>
                        </div>}
                    </button>

                    {showFullPlayer && (
                        <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex flex-col min-w-0 px-1 flex-1"
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <div className={`w-1 h-1 rounded-full animate-pulse ${isPlaying ? 'bg-gold-main shadow-[0_0_8px_rgba(181,148,78,0.8)]' : 'bg-red-500'}`}></div>
                                        <span className="text-[6px] font-black uppercase tracking-[0.2em] text-white/30">Node {currentTrackIdx.toString().padStart(2, '0')} Active</span>
                                    </div>
                                    <h4 className="text-[11px] font-serif font-bold text-white truncate leading-tight uppercase italic">{currentTrack?.title}</h4>
                                    <p className="text-[8px] font-black text-white/30 uppercase tracking-widest truncate">{currentTrack?.artist}</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button onClick={prevTrack} className="text-white/20 hover:text-white transition-all transform hover:scale-110 p-1"><SkipBack size={12} /></button>
                                    <button onClick={togglePlay} className="rounded-xl bg-gold-main text-slate-950 flex items-center justify-center shadow-gold hover:scale-105 active:scale-95 transition-all w-8 h-8">
                                        {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
                                    </button>
                                    <button onClick={nextTrack} className="text-white/20 hover:text-white transition-all transform hover:scale-110 p-1"><SkipForward size={12} /></button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {showFullPlayer && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="px-3 pb-3 pt-2 space-y-3 overflow-hidden"
                    >
                        {/* Seeker */}
                        <div className="space-y-1.5">
                            <div className="relative group/seeker h-4 flex items-center">
                                <div className="absolute w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-gold-main/40 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                </div>
                                <input 
                                    type="range" 
                                    min="0" max="100" step="0.1" 
                                    value={progress} 
                                    onChange={handleSeek}
                                    className="absolute w-full h-1 bg-transparent appearance-none cursor-pointer accent-gold-main opacity-0 group-hover/seeker:opacity-100 transition-opacity"
                                />
                                <div className="absolute h-2 w-2 rounded-full bg-gold-main shadow-gold pointer-events-none group-hover/seeker:scale-125 transition-transform" style={{ left: `${progress}%`, transform: 'translateX(-50%)' }}></div>
                            </div>
                            <div className="flex justify-between items-center text-[8px] font-mono text-white/20 uppercase tracking-widest">
                                <span>{formatTime(currentTime)}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-gold-main/40">NODE_77</span>
                                    <span>{formatTime(duration)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Controls Row */}
                        <div className="flex items-center justify-between pt-1 border-t border-white/5">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setShowPlaylist(!showPlaylist)} className={`p-1.5 rounded-lg transition-all ${showPlaylist ? 'bg-gold-main/20 text-gold-main' : 'text-white/20 hover:text-white'}`}>
                                    <ListMusic size={14} />
                                </button>
                                <div className="h-4 w-px bg-white/5"></div>
                                <div className="flex items-center gap-2 group/vol">
                                    <button onClick={() => setIsMuted(!isMuted)} className="text-white/20 hover:text-gold-main transition-colors p-1">
                                        {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                                    </button>
                                    <input 
                                        type="range" 
                                        min="0" max="1" step="0.01" 
                                        value={volume} 
                                        onChange={(e) => setVolume(parseFloat(e.target.value))} 
                                        className="w-16 h-0.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-gold-main" 
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={toggleFullscreen}
                                    className="p-1.5 text-white/20 hover:text-white rounded-lg transition-all"
                                    title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                                >
                                    {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
                                </button>
                                <div className="flex items-center gap-2">
                                    <span className="text-[7px] font-black text-white/10 uppercase tracking-[0.3em]">HIFI_UPLINK</span>
                                    <div className="h-1 w-1 rounded-full bg-green-500/40"></div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            <style>{`
                @keyframes radio-wave-1 { 0%, 100% { height: 4px; } 50% { height: 12px; } }
                @keyframes radio-wave-2 { 0%, 100% { height: 10px; } 50% { height: 4px; } }
                @keyframes radio-wave-3 { 0%, 100% { height: 6px; } 50% { height: 14px; } }
                .animate-radio-wave-1 { animation: radio-wave-1 0.7s ease-in-out infinite; }
                .animate-radio-wave-2 { animation: radio-wave-2 1.0s ease-in-out infinite; }
                .animate-radio-wave-3 { animation: radio-wave-3 0.8s ease-in-out infinite; }
                
                input[type="range"]::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  height: 12px;
                  width: 12px;
                  border-radius: 50%;
                  background: #B5944E;
                  cursor: pointer;
                  border: 2px solid #020617;
                  box-shadow: 0 0 10px rgba(181, 148, 78, 0.4);
                }
            `}</style>
        </div>
    );
};

export default SiteRadio;
