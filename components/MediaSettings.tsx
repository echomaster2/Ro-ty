import React, { useState, useEffect } from 'react';
import { X, Upload, RotateCcw, Image as ImageIcon, Video, Save, Check, Shield, Search, LayoutGrid, Loader2, ShieldAlert, Zap } from 'lucide-react';
import { useCourse } from './CourseContext';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useBranding } from './BrandingContext';
import { motion, AnimatePresence } from 'framer-motion';

interface MediaSettingsProps {
    isOpen: boolean;
    onClose: () => void;
    topicId?: string;
}

export type MediaAsset = {
    url: string;
    type: 'image' | 'video' | 'default';
};

const MediaSettings: React.FC<MediaSettingsProps> = ({ isOpen, onClose, topicId }) => {
    const { overrides, updateOverride, resetOverride, saveOverrides } = useBranding();
    const { courseData, updateTopic, saveCourse } = useCourse();
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [saveError, setSaveError] = useState<string | null>(null);
    const [uploadingId, setUploadingId] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null);

    // Find topic and module if topicId is provided
    const topic = topicId ? courseData.flatMap(m => m.topics).find(t => t.id === topicId) : null;
    const module = topicId ? courseData.find(m => m.topics.some(t => t.id === topicId)) : null;

    const showNotification = (message: string, type: 'error' | 'success' | 'info' = 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    };

    const handleUpdate = (id: string, url: string, type: 'image' | 'video') => {
        if (topicId && module) {
            updateTopic(module.id, topicId, { [id]: url });
        } else {
            updateOverride(id, url, type, id);
        }
    };

    const handleReset = (id: string) => {
        if (topicId && module) {
            updateTopic(module.id, topicId, { [id]: '' });
        } else {
            resetOverride(id);
        }
    };

    const handleSave = async () => {
        setSaveStatus('saving');
        setSaveError(null);
        try {
            if (topicId) {
                await saveCourse();
            } else {
                await saveOverrides();
            }
            setSaveStatus('saved');
            showNotification(topicId ? "Topic Media Matrix Synced" : "Global Media Matrix Synced", "success");
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (error: any) {
            console.error("Save failed:", error);
            let errorMessage = "Unknown Error";
            if (error instanceof Error) {
                errorMessage = error.message;
                try {
                    const parsed = JSON.parse(error.message);
                    if (parsed.error) errorMessage = parsed.error;
                } catch (e) {}
            }
            setSaveError(errorMessage);
            showNotification("Save Failed: " + errorMessage, "error");
            setSaveStatus('idle');
        }
    };

    const handleFileUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingId(id);
        try {
            const storageRef = ref(storage, `assets/${id}_${Date.now()}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            handleUpdate(id, downloadURL, type);
            showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} Uploaded Successfully`, "success");
        } catch (error) {
            console.error("Upload failed:", error);
            showNotification("Upload Failed: " + (error instanceof Error ? error.message : "Unknown Error"), "error");
        } finally {
            setUploadingId(null);
        }
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
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Studio Feedback</p>
                            <p className="text-sm font-serif font-bold italic">{notification.message}</p>
                        </div>
                        <button onClick={() => setNotification(null)} className="p-2 hover:bg-white/5 rounded-lg transition-all">
                            <X size={16} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-xl animate-fade-in font-sans">
            <div className="w-full max-w-5xl h-[90vh] glass-panel rounded-[3rem] border-white/10 shadow-2xl flex flex-col overflow-hidden relative border-t-gold-main/20">
                
                {/* Studio Header */}
                <div className="px-8 py-8 md:px-12 border-b border-white/5 flex justify-between items-center bg-dark-secondary/50 backdrop-blur-md">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-gold-dim rounded-2xl flex items-center justify-center border border-gold-main/30 shadow-gold">
                            <LayoutGrid className="w-7 h-7 text-gold-main" />
                        </div>
                        <div className="text-left">
                            <h2 className="text-2xl md:text-3xl font-display font-bold text-white tracking-wide uppercase">Media Studio</h2>
                            <div className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                <p className="text-[10px] text-text-muted font-bold uppercase tracking-[0.3em]">Protocol Active: Asset Customization</p>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-3 hover:bg-white/10 rounded-2xl transition-all border border-white/5 group"
                    >
                        <X className="w-6 h-6 text-text-muted group-hover:text-white group-hover:rotate-90 transition-all duration-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-8 md:px-12 py-10 space-y-16 custom-scrollbar text-left">
                    
                    {/* Global Assets Section */}
                    <section>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
                            <h3 className="text-[11px] font-bold text-gold-accent uppercase tracking-[0.5em] px-4 whitespace-nowrap">Global Identity</h3>
                            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <AssetInput 
                                label="Academic Logo" 
                                description="The primary brand vector (E)"
                                id="global-logo" 
                                current={overrides['global-logo']} 
                                onUpdate={handleUpdate} 
                                onReset={handleReset} 
                                onFile={(e: any) => handleFileUpload('global-logo', e, 'image')}
                                isUploading={uploadingId === 'global-logo'}
                            />
                            <AssetInput 
                                label="Hero Illustration" 
                                description="Featured book cover display"
                                id="global-hero" 
                                current={overrides['global-hero']} 
                                onUpdate={handleUpdate} 
                                onReset={handleReset} 
                                onFile={(e: any) => handleFileUpload('global-hero', e, 'image')}
                                isUploading={uploadingId === 'global-hero'}
                            />
                        </div>
                    </section>

                    {/* Topic Specific Section */}
                    <section>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
                            <h3 className="text-[11px] font-bold text-gold-accent uppercase tracking-[0.5em] px-4 whitespace-nowrap">Topic Vectors</h3>
                            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {courseData.flatMap(m => m.topics).map(topic => (
                                <AssetInput 
                                    key={topic.id}
                                    label={topic.title} 
                                    description={`Instructional visual for ${topic.estTime} lesson`}
                                    id={`topic-${topic.id}`} 
                                    current={overrides[`topic-${topic.id}`]} 
                                    onUpdate={handleUpdate} 
                                    onReset={handleReset} 
                                    onFile={(e: any) => {
                                        const type = e.target.accept.includes('video') ? 'video' : 'image';
                                        handleFileUpload(`topic-${topic.id}`, e, type);
                                    }}
                                    isUploading={uploadingId === `topic-${topic.id}`}
                                    allowVideo
                                />
                            ))}
                        </div>
                    </section>

                    {/* Clinical Case Assets Section */}
                    <section>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
                            <h3 className="text-[11px] font-bold text-gold-accent uppercase tracking-[0.5em] px-4 whitespace-nowrap">Clinical Diagnostics</h3>
                            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {[1, 2, 3, 4, 5].map(num => (
                                <AssetInput 
                                    key={`case-${num}`}
                                    label={`Case Study ${num}`} 
                                    description={`Diagnostic image for clinical case ${num}`}
                                    id={`case-${num}-image`} 
                                    current={overrides[`case-${num}-image`]} 
                                    onUpdate={handleUpdate} 
                                    onReset={handleReset} 
                                    onFile={(e: any) => handleFileUpload(`case-${num}-image`, e, 'image')}
                                    isUploading={uploadingId === `case-${num}-image`}
                                />
                            ))}
                        </div>
                    </section>
                </div>

                {/* Studio Footer */}
                <div className="px-8 py-8 border-t border-white/5 bg-dark-secondary/90 flex flex-col sm:flex-row justify-between items-center gap-6 backdrop-blur-xl">
                    <div className="text-left hidden sm:block">
                        <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] font-bold mb-1">Uncommitted Changes</p>
                        <p className="text-xs text-white/40 font-mono italic">Assets will persist in local storage upon syncing.</p>
                    </div>
                    <div className="flex items-center gap-6 w-full sm:w-auto">
                        <button onClick={onClose} className="flex-1 sm:flex-none px-8 py-4 text-xs font-bold text-text-muted hover:text-white transition-colors uppercase tracking-widest">Discard</button>
                        <button 
                            onClick={handleSave}
                            disabled={saveStatus !== 'idle'}
                            className={`flex-1 sm:flex-none px-12 py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-500 ${
                                saveStatus === 'saved' ? 'bg-green-600 text-white shadow-lg' : 'bg-gold-main text-dark-primary shadow-gold hover:shadow-gold-strong'
                            }`}
                        >
                            {saveStatus === 'saving' ? <RotateCcw className="w-4 h-4 animate-spin" /> : saveStatus === 'saved' ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                            {saveStatus === 'saving' ? 'Syncing...' : saveStatus === 'saved' ? 'Locked' : 'Sync Vectors'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

const AssetInput = ({ label, description, id, current, onUpdate, onReset, onFile, allowVideo, isUploading }: any) => {
    const [url, setUrl] = useState(current?.value || '');
    
    useEffect(() => {
        if (current?.value) setUrl(current.value);
    }, [current]);

    return (
        <div className="glass-card p-6 rounded-2xl border-white/5 space-y-5 bg-white/[0.02] flex flex-col justify-between relative overflow-hidden">
            {isUploading && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 text-gold-main animate-spin" />
                    <span className="text-[10px] font-black text-gold-main uppercase tracking-[0.3em]">Uploading to Cloud...</span>
                </div>
            )}
            <div className="flex justify-between items-start">
                <div className="text-left">
                    <label className="text-sm font-bold text-text-main font-sans uppercase tracking-widest block mb-1">{label}</label>
                    <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider opacity-60">{description}</span>
                </div>
                {current && (
                    <button 
                        onClick={() => { onReset(id); setUrl(''); }} 
                        className="text-[9px] text-red-400 hover:text-red-300 font-bold uppercase tracking-[0.2em] flex items-center gap-1.5 transition-colors bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20"
                    >
                        <RotateCcw className="w-2.5 h-2.5" /> Reset
                    </button>
                )}
            </div>
            
            <div className="flex gap-5">
                <div className="flex-1 space-y-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted group-focus-within:text-gold-main transition-colors" />
                        <input 
                            type="text" 
                            value={url}
                            onChange={(e) => { 
                                setUrl(e.target.value); 
                                // Try to guess type from URL if possible, default to image
                                const isVideo = e.target.value.match(/\.(mp4|webm|ogg|mov)$|youtube\.com|vimeo\.com/i);
                                onUpdate(id, e.target.value, isVideo ? 'video' : 'image'); 
                            }}
                            placeholder="Enter asset URL..."
                            className="w-full bg-dark-primary/40 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-xs text-white focus:outline-none focus:border-gold-main/40 transition-all font-mono placeholder:text-text-muted/30"
                        />
                    </div>
                    <div className="flex gap-3">
                        <label className="flex-1 cursor-pointer bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 px-3 py-2 rounded-xl flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-widest text-text-main transition-all">
                            <ImageIcon className="w-3.5 h-3.5 text-gold-main" /> Upload Image
                            <input type="file" accept="image/*" className="hidden" onChange={onFile} />
                        </label>
                        {allowVideo && (
                            <label className="flex-1 cursor-pointer bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 px-3 py-2 rounded-xl flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-widest text-text-main transition-all">
                                <Video className="w-3.5 h-3.5 text-gold-main" /> Upload Video
                                <input type="file" accept="video/*" className="hidden" onChange={onFile} />
                            </label>
                        )}
                    </div>
                </div>
                <div className="w-24 h-24 bg-dark-primary rounded-xl border border-white/10 overflow-hidden flex items-center justify-center relative group shrink-0 shadow-inner">
                    {current ? (
                        current.type === 'video' ? (
                            <video src={current.value} className="w-full h-full object-cover" muted />
                        ) : (
                            <img src={current.value} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt="Preview" />
                        )
                    ) : (
                        <ImageIcon className="w-6 h-6 text-white/5" />
                    )}
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                        <span className="text-[9px] font-bold text-gold-accent uppercase tracking-widest">Preview</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MediaSettings;