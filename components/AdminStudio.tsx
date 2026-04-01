
import React, { useState, useEffect } from 'react';
import { X, Upload, RotateCcw, Image as ImageIcon, Video, Save, Check, Shield, Search, LayoutGrid, Type, FileText, Music, Plus, Trash2, ShoppingBag, DollarSign, Zap, ShieldCheck, Sparkles, TrendingUp, Heart, Trophy, Brain, Mic, Globe, Link as LinkIcon, Bot, Loader2, PlayCircle, Activity, Database, Minimize, Users, MonitorPlay, ShieldAlert } from 'lucide-react';
import { courseData, Topic } from '../data/courseContent';
import { GoogleGenAI } from "@google/genai";
import MediaSettings from './MediaSettings';
import { motion, AnimatePresence } from 'framer-motion';

import { useBranding, AdminOverride } from './BrandingContext';
import { useCourse } from './CourseContext';
import { useFirebase } from './FirebaseProvider';

interface AdminStudioProps {
    isOpen: boolean;
    onClose: () => void;
}

const CACHE_NAME = 'echomasters-media-vault-v1';

const AdminStudio: React.FC<AdminStudioProps> = ({ isOpen, onClose }) => {
    const { user, profile, isAdmin, updateProfile } = useFirebase();
    const { overrides, updateOverride, resetOverride, saveOverrides: persistOverrides } = useBranding();
    const { courseData, updateTopic, saveCourse } = useCourse();
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [saveError, setSaveError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'branding' | 'classroom' | 'radio' | 'users' | 'analytics' | 'shop' | 'dashboard'>('branding');
    const [isMinimized, setIsMinimized] = useState(false);
    const [isMediaStudioOpen, setIsMediaStudioOpen] = useState(false);
    const [isTestingKey, setIsTestingKey] = useState(false);
    
    const [users, setUsers] = useState<any[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [analytics, setAnalytics] = useState<any>(null);
    const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
    const [isSyncingAll, setIsSyncingAll] = useState(false);
    const [syncProgress, setSyncProgress] = useState(0);
    const [syncLog, setSyncLog] = useState<string[]>([]);
    const [notification, setNotification] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null);

    const showNotification = (message: string, type: 'error' | 'success' | 'info' = 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    };

    useEffect(() => {
        if (isOpen) {
            console.log("AdminStudio: State Update", { isOpen, activeTab, isMinimized, isMediaStudioOpen });
        }
    }, [isOpen, activeTab, isMinimized, isMediaStudioOpen]);

    const fetchUsers = async () => {
        setIsLoadingUsers(true);
        try {
            const { getDocs, collection, query, limit } = await import('firebase/firestore');
            const { db } = await import('../firebase');
            const q = query(collection(db, 'users'), limit(50));
            const snapshot = await getDocs(q);
            const userList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(userList);
        } catch (err) {
            console.error("Failed to fetch users:", err);
        } finally {
            setIsLoadingUsers(false);
        }
    };

    const fetchAnalytics = async () => {
        setIsLoadingAnalytics(true);
        try {
            const { getDocs, collection } = await import('firebase/firestore');
            const { db } = await import('../firebase');
            
            const userSnap = await getDocs(collection(db, 'users'));
            const allUsers = userSnap.docs.map(d => d.data());
            
            const totalUsers = allUsers.length;
            const premiumUsers = allUsers.filter(u => u.isPremium).length;
            const conversionRate = totalUsers > 0 ? (premiumUsers / totalUsers) * 100 : 0;
            
            const progressSnap = await getDocs(collection(db, 'progress'));
            const allProgress = progressSnap.docs.map(d => d.data());
            
            // Calculate popular modules
            const moduleCounts: Record<string, number> = {};
            allProgress.forEach(p => {
                if (Array.isArray(p.completedTopicIds)) {
                    p.completedTopicIds.forEach((tid: string) => {
                        const moduleId = tid.split('-')[0]; // Assuming ID format module-topic
                        moduleCounts[moduleId] = (moduleCounts[moduleId] || 0) + 1;
                    });
                }
            });

            setAnalytics({
                totalUsers,
                premiumUsers,
                conversionRate: conversionRate.toFixed(1),
                moduleCounts,
                totalProgressDocs: allProgress.length
            });
            showNotification("Analytics Telemetry Synced", "success");
        } catch (err) {
            console.error("Failed to fetch analytics:", err);
            showNotification("Telemetry Sync Failed: " + (err instanceof Error ? err.message : "Unknown Error"), "error");
        } finally {
            setIsLoadingAnalytics(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers();
        }
        if (activeTab === 'analytics') {
            fetchAnalytics();
        }
    }, [activeTab]);

    const handleUpdate = (id: string, value: string, type: any, label?: string, metadata?: any) => {
        updateOverride(id, value, type, label, metadata);
    };

    const handleReset = (id: string) => {
        resetOverride(id);
    };

    const saveSettings = async () => {
        setSaveStatus('saving');
        setSaveError(null);
        try {
            console.log("Starting save sequence...");
            // Run them sequentially to avoid race conditions and pinpoint errors
            await persistOverrides();
            console.log("Overrides persisted");
            await saveCourse();
            console.log("Course structure saved");
            
            setSaveStatus('saved');
            showNotification("All Course Creations & Branding Saved", "success");
            setTimeout(() => { setSaveStatus('idle'); }, 2000);
        } catch (err: any) {
            console.error("Failed to save settings:", err);
            let errorMessage = "Unknown Error";
            if (err instanceof Error) {
                errorMessage = err.message;
                // Try to parse JSON error if it's from handleFirestoreError
                try {
                    const parsed = JSON.parse(err.message);
                    if (parsed.error) errorMessage = parsed.error;
                } catch (e) {
                    // Not a JSON error
                }
            }
            setSaveError(errorMessage);
            showNotification("Save Failed: " + errorMessage, "error");
            setSaveStatus('error');
        }
    };

    const testElevenLabsKey = async () => {
        const elevenKey = overrides['eleven-labs-key']?.value || localStorage.getItem('spi-eleven-labs-key');
        if (!elevenKey) {
            showNotification("Please enter an ElevenLabs API Key first.", "error");
            return;
        }

        setIsTestingKey(true);
        try {
            const res = await fetch('https://api.elevenlabs.io/v1/user', {
                headers: { 'xi-api-key': elevenKey }
            });
            if (res.ok) {
                const data = await res.json();
                showNotification(`Key Valid! Character Limit: ${data.subscription.character_limit}`, "success");
            } else {
                const err = await res.json().catch(() => ({ detail: { message: 'Invalid Key' } }));
                showNotification(`Key Rejected: ${err.detail?.message || res.statusText}`, "error");
            }
        } catch (e) {
            showNotification("Network error testing key.", "error");
        } finally {
            setIsTestingKey(false);
        }
    };

    const claimAdmin = async () => {
        if (user?.email === 'latchmanrav@gmail.com' && profile?.role !== 'admin') {
            try {
                await updateProfile({ role: 'admin' });
                showNotification("Admin Role Claimed Successfully", "success");
            } catch (e) {
                showNotification("Failed to claim admin role", "error");
            }
        }
    };

    const handleSyncNode = async (topic: any) => {
        const overrides = JSON.parse(localStorage.getItem('spi-admin-overrides') || '{}');
        const elevenKey = overrides['eleven-labs-key']?.value || localStorage.getItem('spi-eleven-labs-key');
        if (!elevenKey) {
            showNotification("ElevenLabs API Key is missing.", "error");
            return;
        }

        setIsSyncingAll(true);
        setSyncProgress(0);
        setSyncLog([`Initializing sync for: ${topic.title}`]);

        const persona = topic.professorPersona || 'Charon';
        const voiceId = 'Yko7iBn2vnSMvSAsuF8N'; 
        const cacheId = `intro-${topic.title.replace(/\s+/g, '-').toLowerCase()}-${persona}-${voiceId}`;
        const cache = await caches.open(CACHE_NAME);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            const scriptRes = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `ACT AS PROFESSOR ${persona}. SUBJECT: "${topic.title}".
                FOLLOW THIS STRICT 9-PART HUMANIZED PEDAGOGICAL ARCHITECTURE:
                1. NATURAL CADENCE: DO NOT USE ANY SYMBOLS. No commas, no periods, no ellipses, no percentages, no hashes, no at-signs, no asterisks, no ampersands. Use only letters, numbers, and spaces.
                2. TEACHER'S VOICE: Use conversational hooks.
                3. QUANTIFY EFFORT: "I reviewed every major paper on ${topic.title}..."
                4. PROMISE ASSESSMENT: Promise a test at the end.
                5. ROADMAP: Numbered outline.
                6. THE NEGATION: Define by strictly explaining what it is NOT first.
                7. MNEMONIC MATRIX: Create a memorable/silly acronym.
                8. RELATABLE ANALOGY: Relate concepts to anime characters or human hierarchies.
                9. PRACTICAL WORKFLOW: Copy-paste tool.
                TOPIC SPECIFICS: "${topic.contentBody}"
                STRICT INSTRUCTION: DO NOT USE ANY SYMBOLS IN THE GENERATED TEXT. Use only letters, numbers, and spaces.
                MAX: 180 words. Tone: Elite, deeply human, paternal.`,
            });
            const generatedScript = scriptRes.text || topic.contentBody;

            const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'xi-api-key': elevenKey },
                body: JSON.stringify({
                    text: generatedScript,
                    model_id: 'eleven_turbo_v2_5',
                    voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.15, use_speaker_boost: true }
                }),
            });

            if (ttsRes.ok) {
                const blob = await ttsRes.blob();
                await cache.put(new Request(`/api/audio/${cacheId}`), new Response(blob));
                const moduleId = topic.id.split('-')[0];
                updateTopic(moduleId, topic.id, { ...topic, generatedScript, audioCacheId: cacheId });
                setSyncLog(prev => [`[OK] ${topic.title} synced.`, ...prev]);
                showNotification(`Synced ${topic.title} successfully.`, "success");
            } else {
                showNotification("Sync failed. Check ElevenLabs key.", "error");
            }
        } catch (e) {
            showNotification("Sync interrupted.", "error");
        } finally {
            setIsSyncingAll(false);
            setSyncProgress(100);
        }
    };

    const handleSyncAllNodes = async () => {
        if (isSyncingAll) return;
        
        const elevenKey = overrides['eleven-labs-key']?.value || localStorage.getItem('spi-eleven-labs-key');
        if (!elevenKey) {
            showNotification("ElevenLabs API Key is missing. Faculty voice cannot be synthesized.", "error");
            return;
        }

        setIsSyncingAll(true);
        setSyncProgress(0);
        setSyncLog(["Initializing Acoustic Matrix sync..."]);

        const allTopics = courseData.flatMap(m => m.topics);
        const total = allTopics.length;
        const cache = await caches.open(CACHE_NAME);

        for (let i = 0; i < allTopics.length; i++) {
            const topic = allTopics[i];
            const persona = topic.professorPersona || 'Charon';
            const voiceId = 'Yko7iBn2vnSMvSAsuF8N'; 
            const cacheId = `intro-${topic.title.replace(/\s+/g, '-').toLowerCase()}-${persona}-${voiceId}`;
            
            setSyncLog(prev => [`Syncing Node ${i + 1}/${total}: ${topic.title}`, ...prev].slice(0, 5));
            
            const cached = await cache.match(`/api/audio/${cacheId}`);
            if (cached) {
                setSyncLog(prev => [`[SKIP] ${topic.title} already established.`, ...prev].slice(0, 5));
                setSyncProgress(Math.round(((i + 1) / total) * 100));
                continue;
            }

            try {
                const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
                const scriptRes = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: `ACT AS PROFESSOR ${persona}. SUBJECT: "${topic.title}".
                    
                    FOLLOW THIS STRICT 9-PART HUMANIZED PEDAGOGICAL ARCHITECTURE:
                    
                    1. NATURAL CADENCE: DO NOT USE ANY SYMBOLS. No commas, no periods, no ellipses, no percentages, no hashes, no at-signs, no asterisks, no ampersands. Use only letters, numbers, and spaces.
                    2. TEACHER'S VOICE: Use conversational hooks like "Now listen carefully" or "Here is where most seekers stumble"
                    3. QUANTIFY EFFORT: Start by quantifying your effort. "I reviewed every major paper on ${topic.title} so you don't have to."
                    4. PROMISE ASSESSMENT: Promise a test at the end.
                    5. ROADMAP: Numbered outline.
                    6. THE NEGATION: Define by strictly explaining what it is NOT first.
                    7. MNEMONIC MATRIX: Create a memorable/silly acronym.
                    8. RELATABLE ANALOGY: Relate concepts to anime characters (Naruto, Luffy) or human hierarchies.
                    9. PRACTICAL WORKFLOW: Copy-paste tool.
                    
                    TOPIC SPECIFICS: "${topic.contentBody}"
                    STRICT INSTRUCTION: DO NOT USE ANY SYMBOLS IN THE GENERATED TEXT. Use only letters, numbers, and spaces.
                    MAX: 180 words. Tone: Elite, deeply human, paternal.`,
                });
                const generatedScript = scriptRes.text || topic.contentBody;

                const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'xi-api-key': elevenKey },
                    body: JSON.stringify({
                        text: generatedScript,
                        model_id: 'eleven_turbo_v2_5', // High fidelity low latency
                        voice_settings: { 
                          stability: 0.45, 
                          similarity_boost: 0.8,
                          style: 0.15,
                          use_speaker_boost: true
                        }
                    }),
                });

                if (ttsRes.ok) {
                    const blob = await ttsRes.blob();
                    await cache.put(new Request(`/api/audio/${cacheId}`), new Response(blob));
                    
                    // Update the topic in the course context with the generated script
                    const moduleId = topic.id.split('-')[0];
                    updateTopic(moduleId, topic.id, { 
                        ...topic, 
                        generatedScript,
                        audioCacheId: cacheId
                    });
                    
                    localStorage.setItem(`script-${cacheId}`, generatedScript);
                    setSyncLog(prev => [`[OK] Node ${topic.id} synced.`, ...prev]);
                } else {
                    const errorData = await ttsRes.json().catch(() => ({ detail: 'Unknown error' }));
                    const errorMsg = errorData.detail?.message || errorData.detail || ttsRes.statusText;
                    setSyncLog(prev => [`[FAIL] Node ${topic.id}: ${ttsRes.status} ${errorMsg}`, ...prev]);
                    console.error(`ElevenLabs error for ${topic.id}:`, errorData);
                    if (ttsRes.status === 401) {
                        setSyncLog(prev => ["CRITICAL: Invalid ElevenLabs API Key. Stopping sync.", ...prev]);
                        setIsSyncingAll(false);
                        return;
                    }
                }
            } catch (e) {
                setSyncLog(prev => [`[FAIL] Node ${topic.id} interrupted.`, ...prev]);
            }
            
            setSyncProgress(Math.round(((i + 1) / total) * 100));
            await new Promise(r => setTimeout(r, 400)); 
        }

        setSyncLog(prev => ["MATRIX SYNC COMPLETE.", ...prev]);
        showNotification("Acoustic Matrix Sync Complete", "success");
        setTimeout(() => setIsSyncingAll(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <>
            <AnimatePresence>
                {notification && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className={`fixed bottom-12 left-1/2 -translate-x-1/2 z-[1000] px-8 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center gap-4 min-w-[320px] ${
                            notification.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 
                            notification.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 
                            'bg-gold-main/10 border-gold-main/20 text-gold-main'
                        }`}
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            notification.type === 'error' ? 'bg-red-500/20' : 
                            notification.type === 'success' ? 'bg-green-500/20' : 
                            'bg-gold-main/20'
                        }`}>
                            {notification.type === 'error' ? <ShieldAlert size={20} /> : 
                             notification.type === 'success' ? <Check size={20} /> : 
                             <Zap size={20} />}
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">{notification.type} Protocol</p>
                            <p className="text-sm font-serif font-bold italic">{notification.message}</p>
                        </div>
                        <button onClick={() => setNotification(null)} className="p-2 hover:bg-white/5 rounded-lg transition-all">
                            <X size={16} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className={`fixed z-[550] flex items-center justify-center transition-all duration-500 ${isMinimized ? 'bottom-8 right-8 w-auto h-auto' : 'inset-0 p-0 md:p-4 sm:p-8 bg-black/95 backdrop-blur-2xl'} animate-fade-in font-sans`}>
                <div className={`bg-slate-900 border border-white/10 shadow-2xl flex flex-col overflow-hidden relative border-t-gold-main/20 transition-all duration-500 ${isMinimized ? 'w-20 h-20 rounded-full cursor-pointer hover:scale-110' : 'w-full h-full md:h-[92vh] md:max-w-6xl md:rounded-[3rem]'}`}>
                
                {isMinimized ? (
                    <button onClick={() => setIsMinimized(false)} className="w-full h-full flex items-center justify-center text-gold-main">
                        <LayoutGrid size={32} />
                    </button>
                ) : (
                    <>
                <div className="px-4 py-4 md:px-12 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 bg-white/[0.02] shrink-0">
                    <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
                        <div className="w-10 h-10 md:w-14 md:h-14 bg-gold-main/10 rounded-xl md:rounded-2xl flex items-center justify-center border border-gold-main/30 shadow-gold shrink-0">
                            <Bot className="w-5 h-5 md:w-7 md:h-7 text-gold-main" />
                        </div>
                        <div className="text-left text-white overflow-hidden">
                            <h2 className="text-lg md:text-3xl font-serif font-bold tracking-tight truncate">Admin Master Control</h2>
                            <p className="text-[7px] md:text-[9px] text-white/40 font-black uppercase tracking-[0.2em] md:tracking-[0.4em] truncate">Pedagogical Cadence Engine v3.0</p>
                        </div>
                        <div className="flex md:hidden items-center gap-2 ml-auto">
                            <button onClick={() => setIsMinimized(true)} className="p-2 hover:bg-white/10 rounded-lg transition-all border border-white/5 group" title="Minimize for Preview">
                                <Minimize className="w-5 h-5 text-white/40 group-hover:text-white" />
                            </button>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-all border border-white/5 group"><X className="w-5 h-5 text-white/40 group-hover:text-white" /></button>
                        </div>
                    </div>
                    <div className="flex bg-white/5 p-1 rounded-xl md:rounded-2xl border border-white/5 overflow-x-auto max-w-full no-scrollbar">
                        {['branding', 'classroom', 'radio', 'users', 'analytics', 'shop', 'dashboard'].map(id => (
                            <button key={id} onClick={() => setActiveTab(id as any)} className={`px-3 md:px-5 py-1.5 md:py-2.5 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === id ? 'bg-gold-main text-slate-900 shadow-gold' : 'text-white/40 hover:text-white'}`}>
                                {id}
                            </button>
                        ))}
                    </div>
                    <div className="hidden md:flex items-center gap-3">
                        <button onClick={() => setIsMinimized(true)} className="p-3 hover:bg-white/10 rounded-2xl transition-all border border-white/5 group" title="Minimize for Preview">
                            <Minimize className="w-6 h-6 text-white/40 group-hover:text-white" />
                        </button>
                        <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-all border border-white/5 group"><X className="w-6 h-6 text-white/40 group-hover:text-white" /></button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 md:px-12 py-6 md:py-10 space-y-8 md:space-y-16 custom-scrollbar text-left bg-radial-glow">
                    {activeTab === 'branding' && (
                        <div className="space-y-12 animate-fade-in">
                            <div className="p-6 md:p-10 bg-gold-main/5 border border-gold-main/20 rounded-[2rem] md:rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10 group shadow-2xl relative overflow-hidden text-balance">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform hidden md:block"><Activity size={140} /></div>
                                <div className="space-y-4 flex-1 text-center md:text-left">
                                    <div className="flex items-center justify-center md:justify-start gap-3 text-gold-main">
                                        <Database size={18} />
                                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Cadence Pre-generation</span>
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-serif font-bold text-white italic tracking-tight uppercase">Sync Acoustic Matrix</h3>
                                    <p className="text-slate-400 text-xs md:text-sm max-w-xl leading-relaxed italic">
                                        Mass-generate all briefings with updated human cadence cues. Punctuation and emphasis are optimized for the latest Turbo v2.5 synthesis.
                                    </p>
                                    {isSyncingAll && (
                                        <div className="space-y-4 pt-4">
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase text-gold-main tracking-widest"><span>Encoding Cadence</span><span>{syncProgress}%</span></div>
                                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-gold-main shadow-gold transition-all duration-500" style={{ width: `${syncProgress}%` }}></div></div>
                                            <div className="space-y-1 max-h-[100px] overflow-y-auto custom-scrollbar">{syncLog.map((log, idx) => <div key={idx} className="text-[9px] font-mono text-white/30 truncate">{log}</div>)}</div>
                                        </div>
                                    )}
                                </div>
                                <button onClick={handleSyncAllNodes} disabled={isSyncingAll} className={`w-full md:w-auto px-10 md:px-12 py-5 md:py-6 rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] md:text-[11px] transition-all flex items-center justify-center gap-4 ${isSyncingAll ? 'bg-white/5 text-white/20 cursor-not-allowed' : 'bg-gold-main text-slate-950 shadow-gold hover:shadow-[0_0_80px_rgba(181,148,78,0.5)] active:scale-95'}`}>
                                    {isSyncingAll ? <Loader2 className="animate-spin" size={20} /> : <PlayCircle size={20} />}
                                    {isSyncingAll ? 'ADAPTING CADENCE...' : 'SYNC ALL BRIEFINGS'}
                                </button>
                            </div>

                            <section>
                                <AdminSectionHeader icon={Sparkles} title="Visual Identity" />
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="lg:col-span-2 p-6 md:p-10 bg-white/[0.02] border border-white/5 rounded-[2rem] md:rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10 group hover:border-gold-main/20 transition-all text-center md:text-left">
                                        <div className="space-y-2">
                                            <h4 className="text-lg md:text-xl font-serif font-bold text-white italic">Cloud Asset Management</h4>
                                            <p className="text-[11px] md:text-xs text-white/40 leading-relaxed max-w-md">Manage all instructional visuals and brand vectors via Firebase Storage. Replaces local base64 encoding for peak performance.</p>
                                        </div>
                                        <button 
                                            onClick={() => setIsMediaStudioOpen(true)}
                                            className="w-full md:w-auto px-8 py-4 bg-gold-main/10 text-gold-main border border-gold-main/20 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gold-main/20 transition-all flex items-center justify-center gap-3"
                                        >
                                            <MonitorPlay size={16} /> Open Media Studio
                                        </button>
                                    </div>
                                    <AdminInput label="App Name" id="brand-app-name" current={overrides['brand-app-name']} onUpdate={handleUpdate} onReset={handleReset} type="text" />
                                    <AdminInput label="Logo URL" id="brand-logo-url" current={overrides['brand-logo-url']} onUpdate={handleUpdate} onReset={handleReset} type="text" />
                                    <AdminInput label="Primary Accent Color (Hex)" id="brand-primary-color" current={overrides['brand-primary-color']} onUpdate={handleUpdate} onReset={handleReset} type="text" placeholder="#B5944E" />
                                    <AdminInput label="Hero Media URL" id="brand-hero-media" current={overrides['brand-hero-media']} onUpdate={handleUpdate} onReset={handleReset} type="text" />
                                    <AdminInput label="Hero Title" id="brand-hero-title" current={overrides['brand-hero-title']} onUpdate={handleUpdate} onReset={handleReset} type="text" />
                                    <AdminInput label="Hero Subtitle" id="brand-hero-subtitle" current={overrides['brand-hero-subtitle']} onUpdate={handleUpdate} onReset={handleReset} type="text" />
                                </div>
                            </section>

                            <section>
                                <AdminSectionHeader icon={Shield} title="Credentials" />
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <AdminInput label="ElevenLabs API Key" id="eleven-labs-key" current={overrides['eleven-labs-key']} onUpdate={handleUpdate} onReset={handleReset} type="text" />
                                        <button 
                                            onClick={testElevenLabsKey}
                                            disabled={isTestingKey}
                                            className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-gold-main hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                                        >
                                            {isTestingKey ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
                                            {isTestingKey ? 'Verifying...' : 'Test ElevenLabs Key'}
                                        </button>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'classroom' && (
                        <div className="space-y-12 animate-fade-in">
                            <section>
                                <AdminSectionHeader icon={LayoutGrid} title="Curriculum Architecture" />
                                <div className="grid grid-cols-1 gap-6">
                                    {courseData.map(module => (
                                        <div key={module.id} className="p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 bg-white/[0.02] space-y-6">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                                <div className="text-left">
                                                    <h4 className="text-lg font-serif font-bold text-white italic">{module.title}</h4>
                                                    <p className="text-[9px] text-white/30 uppercase tracking-widest">{module.topics.length} Nodes Active</p>
                                                </div>
                                                <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${module.pressure === 'Extreme' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-gold-main/10 border-gold-main/30 text-gold-main'}`}>
                                                    {module.pressure} Pressure
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                                                {module.topics.map(topic => (
                                                    <div key={topic.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group hover:border-gold-main/20 transition-all">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/20 group-hover:text-gold-main transition-colors shrink-0">
                                                                <FileText size={14} />
                                                            </div>
                                                            <span className="text-[11px] text-white/70 font-serif truncate">{topic.title}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <button 
                                                                onClick={() => setIsMediaStudioOpen(true)}
                                                                className="p-1.5 rounded-lg bg-white/5 hover:bg-gold-main/20 text-text-muted hover:text-gold-main transition-all md:opacity-0 md:group-hover:opacity-100 opacity-100"
                                                                title="Manage Media"
                                                            >
                                                                <ImageIcon size={12} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleSyncNode(topic)}
                                                                className="p-1.5 rounded-lg bg-white/5 hover:bg-gold-main/20 text-text-muted hover:text-gold-main transition-all md:opacity-0 md:group-hover:opacity-100 opacity-100"
                                                                title="Sync Acoustic Node"
                                                            >
                                                                <Zap size={12} />
                                                            </button>
                                                            <span className="text-[9px] font-mono text-white/20">{topic.estTime}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'radio' && (
                        <div className="space-y-12 animate-fade-in">
                            <section>
                                <AdminSectionHeader icon={Music} title="Acoustic Vault Management" />
                                <div className="grid grid-cols-1 gap-6 md:gap-8">
                                    <div className="p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 bg-white/[0.02] space-y-6">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-sm font-black text-white uppercase tracking-widest">Add New Track</h4>
                                            <Sparkles className="text-gold-main animate-pulse" size={16} />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <input 
                                                type="text" 
                                                placeholder="Track Title" 
                                                id="new-track-title"
                                                className="bg-slate-950/40 border border-white/10 rounded-xl p-4 text-xs text-white focus:border-gold-main/40 outline-none"
                                            />
                                            <input 
                                                type="text" 
                                                placeholder="Artist Name" 
                                                id="new-track-artist"
                                                className="bg-slate-950/40 border border-white/10 rounded-xl p-4 text-xs text-white focus:border-gold-main/40 outline-none"
                                            />
                                            <input 
                                                type="text" 
                                                placeholder="Audio URL (mp3/wav)" 
                                                id="new-track-url"
                                                className="bg-slate-950/40 border border-white/10 rounded-xl p-4 text-xs text-white focus:border-gold-main/40 outline-none"
                                            />
                                        </div>
                                        <button 
                                            onClick={() => {
                                                const title = (document.getElementById('new-track-title') as HTMLInputElement).value;
                                                const artist = (document.getElementById('new-track-artist') as HTMLInputElement).value;
                                                const url = (document.getElementById('new-track-url') as HTMLInputElement).value;
                                                if (title && url) {
                                                    const id = `radio-track-${Date.now()}`;
                                                    handleUpdate(id, url, 'audio', title, { artist, type: 'music' });
                                                    (document.getElementById('new-track-title') as HTMLInputElement).value = '';
                                                    (document.getElementById('new-track-artist') as HTMLInputElement).value = '';
                                                    (document.getElementById('new-track-url') as HTMLInputElement).value = '';
                                                }
                                            }}
                                            className="w-full py-4 md:py-5 bg-gold-main/10 text-gold-main border border-gold-main/20 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-gold-main/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Plus size={14} /> Add to Vault
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] ml-2">Active Custom Nodes</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {Object.keys(overrides).filter(k => k.startsWith('radio-track-')).map(id => (
                                                <div key={id} className="p-5 md:p-6 rounded-2xl md:rounded-3xl border border-white/5 bg-white/[0.01] flex items-center justify-between group hover:border-white/10 transition-all">
                                                    <div className="flex items-center gap-4 min-w-0">
                                                        <div className="w-10 h-10 rounded-xl bg-gold-main/10 flex items-center justify-center text-gold-main shrink-0">
                                                            <Music size={16} />
                                                        </div>
                                                        <div className="text-left min-w-0">
                                                            <p className="text-xs font-serif font-bold text-white truncate">{overrides[id].label}</p>
                                                            <p className="text-[9px] text-white/30 uppercase tracking-widest truncate">{overrides[id].metadata?.artist || 'Unknown Artist'}</p>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => handleReset(id)} className="p-2 text-white/10 hover:text-red-400 transition-colors shrink-0">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="space-y-12 animate-fade-in">
                            <section>
                                <AdminSectionHeader icon={ShieldCheck} title="Identity Node Management" />
                                <div className="flex justify-between items-center mb-8">
                                    <p className="text-slate-400 text-sm italic">Monitor and manage active clinical identity nodes across the matrix.</p>
                                    <button onClick={fetchUsers} className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-white/40 hover:text-gold-main transition-all">
                                        <RotateCcw size={18} className={isLoadingUsers ? 'animate-spin' : ''} />
                                    </button>
                                </div>

                                {isLoadingUsers ? (
                                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                                        <Loader2 className="animate-spin text-gold-main" size={40} />
                                        <p className="text-[10px] font-black text-gold-main uppercase tracking-[0.4em]">Syncing User Matrix...</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                        {users.map(u => (
                                            <div key={u.id} className="p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 bg-white/[0.02] flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 group hover:border-gold-main/20 transition-all">
                                                <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto min-w-0">
                                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gold-main/10 border border-gold-main/20 flex items-center justify-center text-gold-main shrink-0">
                                                        {u.role === 'admin' ? <Shield size={18} /> : <Activity size={18} />}
                                                    </div>
                                                    <div className="min-w-0 text-left">
                                                        <h4 className="text-xs md:text-sm font-serif font-bold text-white truncate">{u.displayName || 'Anonymous Node'}</h4>
                                                        <p className="text-[8px] md:text-[9px] text-white/30 uppercase tracking-widest truncate">{u.email}</p>
                                                    </div>
                                                    {u.calibrationData && (
                                                        <div className="hidden md:flex flex-col border-l border-white/5 pl-6">
                                                            <span className="text-[8px] font-black text-gold-main/60 uppercase tracking-widest">Identity</span>
                                                            <span className="text-[10px] text-white/60 font-serif italic">{u.calibrationData.archetype}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-3 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                                                    <div className={`px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[7px] md:text-[8px] font-black uppercase tracking-widest border ${u.isPremium ? 'bg-gold-main/10 border-gold-main/30 text-gold-main' : 'bg-white/5 border-white/10 text-white/20'}`}>
                                                        {u.isPremium ? 'PREMIUM' : 'FREE'}
                                                    </div>
                                                    <button 
                                                        onClick={async () => {
                                                            const { doc, updateDoc } = await import('firebase/firestore');
                                                            const { db } = await import('../firebase');
                                                            const newPremium = !u.isPremium;
                                                            await updateDoc(doc(db, 'users', u.id), { isPremium: newPremium });
                                                            fetchUsers();
                                                        }}
                                                        className="p-2.5 md:p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-gold-main/20 hover:text-gold-main transition-all text-white/40"
                                                        title="Toggle Premium Status"
                                                    >
                                                        <Zap size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {users.length === 0 && (
                                            <div className="text-center py-20 text-white/20 uppercase tracking-[0.4em] text-[10px]">No nodes detected in current sector</div>
                                        )}
                                    </div>
                                )}
                            </section>
                        </div>
                    )}

                    {activeTab === 'analytics' && (
                        <div className="space-y-12 animate-fade-in">
                            <section>
                                <AdminSectionHeader icon={TrendingUp} title="Matrix Performance Analytics" />
                                <div className="flex justify-between items-center mb-8">
                                    <p className="text-slate-400 text-sm italic">Real-time telemetry of clinical node engagement and conversion metrics.</p>
                                    <button onClick={fetchAnalytics} className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-white/40 hover:text-gold-main transition-all">
                                        <RotateCcw size={18} className={isLoadingAnalytics ? 'animate-spin' : ''} />
                                    </button>
                                </div>

                                {isLoadingAnalytics ? (
                                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                                        <Loader2 className="animate-spin text-gold-main" size={40} />
                                        <p className="text-[10px] font-black text-gold-main uppercase tracking-[0.4em]">Processing Telemetry...</p>
                                    </div>
                                ) : analytics ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                                        <div className="p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 bg-white/[0.02] space-y-4">
                                            <div className="flex items-center gap-3 text-gold-main/60">
                                                <Users size={16} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Total Nodes</span>
                                            </div>
                                            <div className="text-3xl md:text-4xl font-serif font-bold text-white italic">{analytics.totalUsers}</div>
                                            <p className="text-[9px] text-white/20 uppercase tracking-widest">Active Identity Profiles</p>
                                        </div>
                                        <div className="p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 bg-white/[0.02] space-y-4">
                                            <div className="flex items-center gap-3 text-gold-main/60">
                                                <Zap size={16} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Premium Conversion</span>
                                            </div>
                                            <div className="text-3xl md:text-4xl font-serif font-bold text-white italic">{analytics.conversionRate}%</div>
                                            <p className="text-[9px] text-white/20 uppercase tracking-widest">{analytics.premiumUsers} Elite Nodes established</p>
                                        </div>
                                        <div className="p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 bg-white/[0.02] space-y-4">
                                            <div className="flex items-center gap-3 text-gold-main/60">
                                                <Brain size={16} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Engagement Depth</span>
                                            </div>
                                            <div className="text-3xl md:text-4xl font-serif font-bold text-white italic">{analytics.totalProgressDocs}</div>
                                            <p className="text-[9px] text-white/20 uppercase tracking-widest">Clinical Sync operations recorded</p>
                                        </div>

                                        <div className="md:col-span-3 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/5 bg-white/[0.02] space-y-8">
                                            <h4 className="text-sm font-serif font-bold text-gold-main italic uppercase tracking-widest text-center md:text-left">Module Engagement Distribution</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                                                {Object.entries(analytics.moduleCounts).map(([moduleId, count]: [string, any]) => (
                                                    <div key={moduleId} className="space-y-3">
                                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                                            <span className="text-white/60">{moduleId}</span>
                                                            <span className="text-gold-main">{count} Syncs</span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-gold-main/40 shadow-gold" 
                                                                style={{ width: `${analytics.totalUsers > 0 ? Math.min(100, (count / analytics.totalUsers) * 100) : 0}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-20 text-white/20 uppercase tracking-[0.4em] text-[10px]">No telemetry data available</div>
                                )}
                            </section>
                        </div>
                    )}

                    {activeTab === 'shop' && (
                        <div className="space-y-12 animate-fade-in">
                            <section>
                                <AdminSectionHeader icon={ShoppingBag} title="Neural Marketplace Management" />
                                <div className="flex justify-between items-center mb-8">
                                    <p className="text-slate-400 text-sm italic">Define the commercial nodes available for clinical acquisition.</p>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                                    <div className="p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/5 bg-white/[0.02] space-y-6 md:space-y-8">
                                        <h4 className="text-sm font-serif font-bold text-gold-main italic">Premium Offering Configuration</h4>
                                        <div className="space-y-4 md:space-y-6">
                                            <AdminInput label="Premium Price (USD)" id="shop-premium-price" current={overrides['shop-premium-price']} onUpdate={handleUpdate} onReset={handleReset} type="text" placeholder="99.00" />
                                            <AdminInput label="Premium Title" id="shop-premium-title" current={overrides['shop-premium-title']} onUpdate={handleUpdate} onReset={handleReset} type="text" placeholder="EchoMasters Elite Access" />
                                            <AdminInput label="Premium Description" id="shop-premium-desc" current={overrides['shop-premium-desc']} onUpdate={handleUpdate} onReset={handleReset} type="text" placeholder="Full access to the acoustic matrix." />
                                        </div>
                                    </div>

                                    <div className="p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/5 bg-white/[0.02] space-y-6 md:space-y-8">
                                        <h4 className="text-sm font-serif font-bold text-gold-main italic">Marketplace Status</h4>
                                        <div className="p-6 md:p-8 rounded-2xl bg-gold-main/5 border border-gold-main/20 flex flex-col sm:flex-row items-center gap-4 md:gap-6 text-center sm:text-left">
                                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gold-main/10 flex items-center justify-center text-gold-main">
                                                <Zap size={24} />
                                            </div>
                                            <div>
                                                <p className="text-white font-serif font-bold italic">Stripe Integration Ready</p>
                                                <p className="text-[9px] text-white/40 uppercase tracking-widest">Awaiting production API keys for live transactions.</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Active Commercial Nodes</p>
                                            <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <DollarSign size={14} className="text-gold-main" />
                                                    <span className="text-xs text-white/60">Elite Access Node</span>
                                                </div>
                                                <span className="text-xs font-mono text-gold-main">${overrides['shop-premium-price']?.value || '99.00'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'dashboard' && (
                        <div className="space-y-12 animate-fade-in">
                            <section>
                                <AdminSectionHeader icon={LayoutGrid} title="Dashboard Architecture" />
                                <p className="text-slate-400 text-sm mb-8 italic">Configure the destination URLs for the primary dashboard status cards.</p>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <AdminInput label="Readiness Link" id="dash-link-readiness" current={overrides['dash-link-readiness']} onUpdate={handleUpdate} onReset={handleReset} type="text" />
                                    <AdminInput label="Neural EXP Link" id="dash-link-xp" current={overrides['dash-link-xp']} onUpdate={handleUpdate} onReset={handleReset} type="text" />
                                    <AdminInput label="Daily Streak Link" id="dash-link-streak" current={overrides['dash-link-streak']} onUpdate={handleUpdate} onReset={handleReset} type="text" />
                                </div>
                            </section>
                        </div>
                    )}
                </div>

                <div className="px-4 md:px-8 py-6 md:py-8 border-t border-white/5 bg-slate-950/80 flex flex-col sm:flex-row justify-end items-center gap-4 md:gap-6 backdrop-blur-xl">
                    {user?.email === 'latchmanrav@gmail.com' && profile?.role !== 'admin' && (
                        <button onClick={claimAdmin} className="text-[9px] font-black text-gold-main/60 hover:text-gold-main uppercase tracking-widest mr-auto">Claim Admin Status</button>
                    )}
                    {saveError && (
                        <div className="text-red-500 text-[10px] font-mono max-w-xs overflow-hidden text-ellipsis mr-auto">
                            Error: {saveError}
                        </div>
                    )}
                    <button onClick={onClose} className="w-full sm:w-auto px-8 py-4 text-[10px] font-black text-white/40 hover:text-white uppercase tracking-[0.2em]">Discard</button>
                    <button onClick={saveSettings} disabled={saveStatus === 'saving'} className={`w-full sm:w-auto px-12 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-500 ${saveStatus === 'saved' ? 'bg-green-600 text-white shadow-lg' : saveStatus === 'error' ? 'bg-red-600 text-white' : 'bg-gold-main text-slate-950 shadow-gold hover:translate-y-[-2px]'}`}>
                        {saveStatus === 'saving' ? <RotateCcw className="w-5 h-5 animate-spin" /> : saveStatus === 'saved' ? <Check className="w-5 h-5" /> : saveStatus === 'error' ? <ShieldAlert className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                        {saveStatus === 'saving' ? 'ENCODING...' : saveStatus === 'saved' ? 'SYNCED' : saveStatus === 'error' ? 'SAVE FAILED' : 'SAVE ARCHITECTURE'}
                    </button>
                </div>
                </>
                )}
                </div>
            </div>
            <MediaSettings isOpen={isMediaStudioOpen} onClose={() => setIsMediaStudioOpen(false)} />
        </>
    );
};

const AdminSectionHeader = ({ icon: Icon, title }: any) => (
    <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gold-main/5 border border-gold-main/20 flex items-center justify-center"><Icon className="text-gold-main" size={20} /></div>
        <h3 className="text-xl md:text-2xl font-serif font-bold text-white tracking-tight italic">{title}</h3>
        <div className="h-px flex-1 bg-white/5"></div>
    </div>
);

const AdminInput = ({ label, id, current, onUpdate, onReset, type }: any) => {
    const [val, setVal] = useState(current?.value || '');
    
    // Sync local state with context when it loads
    useEffect(() => {
        if (current?.value !== undefined && current.value !== val) {
            setVal(current.value);
        }
    }, [current?.value]);

    return (
        <div className="p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-white/5 bg-white/[0.02] flex flex-col justify-between group hover:border-white/10 transition-colors">
            <div className="flex justify-between items-start mb-4 md:mb-6">
                <div className="text-left">
                    <label className="text-[10px] md:text-[11px] font-black text-white uppercase tracking-widest block mb-1">{label}</label>
                    <span className="text-[8px] md:text-[9px] text-white/20 uppercase font-black tracking-widest">ID: {id}</span>
                </div>
                {current && <button onClick={() => { onReset(id); setVal(''); }} className="text-[8px] md:text-[9px] text-red-400 hover:text-red-300 font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors bg-red-500/10 px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-red-500/10"><RotateCcw size={10} /> Reset</button>}
            </div>
            <textarea value={val} onChange={(e) => { setVal(e.target.value); onUpdate(id, e.target.value, 'text'); }} className="w-full bg-slate-950/40 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-5 text-sm text-white focus:outline-none focus:border-gold-main/40 transition-all font-sans min-h-[80px] md:min-h-[100px] resize-none" placeholder="Enter configuration..." />
        </div>
    );
};

export default AdminStudio;
