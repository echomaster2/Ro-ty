import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useFirebase } from './FirebaseProvider';
import { courseData, Module, Topic, AssessmentQuestion } from '../data/courseContent';
import Simulations from './Simulations';
import SimLaboratory from './SimLaboratory';
import ResonanceRooms from './ResonanceRooms';
import SectorSync from './SectorSync';
import ArtifactVault from './ArtifactVault';
import UserProfile from './UserProfile';
import ClassroomBackground from './ClassroomBackground';
import TopicQuiz from './TopicQuiz';
import QuizGenerator from './QuizGenerator';
import Glossary from './Glossary';
import AcousticBottomNav from './AcousticBottomNav';
import InteractiveLectureNotes from './InteractiveLectureNotes';
import FacultyCouncil from './FacultyCouncil';
import PodcastStudio from './PodcastStudio';
import AcousticTheater from './AcousticTheater';
import AppTour from './AppTour';
import ARDMSPractice from './ARDMSPractice';
import ARDMSAnalysis from './ARDMSAnalysis';
import FlashcardVault from './FlashcardVault';
import ClinicalCases from './ClinicalCases';
import GlobalLeaderboard from './GlobalLeaderboard';
import CalibrationTool from './CalibrationTool';
import AdminDashboard from './AdminDashboard';
import MockExam from './MockExam';
import Shop from './Shop';
import StudyPlan from './StudyPlan';
import Pricing from './Pricing';
import CinematicIntro from './CinematicIntro';
import CountdownTimer from './CountdownTimer';
import { cacheMedia, preCacheMedia } from '../src/lib/mediaCache';
import { preCacheCinematicIntro, getCachedIntrosCount } from '../src/services/cinematicService';
import CinematicLessonPresentation from './CinematicLessonPresentation';
import { motion, AnimatePresence } from 'motion/react';
import { 
    ChevronRight, BookOpen, X, LayoutGrid, ArrowRight, 
    Trophy, Zap, CheckCircle2,
    Target, Flame, Activity, 
    UserCircle, Menu, Database,
    GraduationCap, Terminal,
    ChevronLeft, List, Loader2,
    Lock, ZapOff, ShieldCheck,
    Cpu, Circle, Settings, Search,
    Brain, Layers,
    BarChart3, Hash, Users, Volume2, VolumeX, Maximize, Sparkles, Music, Radio, Headphones
} from 'lucide-react';

import SiteRadio from './SiteRadio';
import { useBranding } from './BrandingContext';
import { useCourse } from './CourseContext';
import { useNarrator } from '../src/hooks/useNarrator';

interface CourseViewerProps {
    onExit: () => void;
    onPlayCorrect: () => void;
    onPlayIncorrect: () => void;
    onPlayBubble?: () => void;
}

const VIEW_INTRO_DATA: Record<string, { title: string, seedText: string, type: 'tool' | 'section' }> = {
  'dashboard': { title: 'Neural Command Center', seedText: 'Welcome back to the dashboard. This is your central hub for tracking board readiness and acoustic mastery.', type: 'section' },
  'multibot': { title: 'Faculty Council', seedText: 'You are entering the Faculty Council. Here, multiple AI professors collaborate to provide diverse perspectives on complex ultrasound physics.', type: 'section' },
  'podcast': { title: 'Acoustic Podcast Studio', seedText: 'Welcome to the Podcast Studio. Listen to high-yield discussions on SPI topics while you are on the move.', type: 'tool' },
  'theater': { title: 'Acoustic Theater', seedText: 'The Theater is now active. Visualize complex wave interactions through immersive cinematic presentations.', type: 'section' },
  'flashcards': { title: 'Flashcard Vault', seedText: 'Entering the Flashcard Vault. Rapid-fire recall is essential for board exam success.', type: 'tool' },
  'cases': { title: 'Clinical Case Matrix', seedText: 'The Clinical Case Matrix is online. Apply your physics knowledge to real-world diagnostic scenarios.', type: 'section' },
  'leaderboard': { title: 'Global Resonance Leaderboard', seedText: 'Viewing the Global Leaderboard. See how your neural resonance compares to other candidates worldwide.', type: 'section' },
  'resonance-rooms': { title: 'Resonance Rooms', seedText: 'Entering the Resonance Rooms. Collaborative learning nodes for synchronized study sessions.', type: 'section' },
  'resonance-lab': { title: 'Sim Laboratory', seedText: 'The Sim Laboratory is ready. Experiment with real-time ultrasound parameters in a safe, virtual environment.', type: 'tool' },
  'quiz-gen': { title: 'Neural Quiz Generator', seedText: 'The Quiz Generator is active. Synthesize custom assessments to target your specific knowledge gaps.', type: 'tool' },
  'glossary': { title: 'Acoustic Lexicon', seedText: 'Accessing the Acoustic Lexicon. Every term, every definition, at your fingertips.', type: 'tool' },
  'assess': { title: 'Mock Exam Simulator', seedText: 'The Mock Exam Simulator is online. This is the ultimate test of your board readiness.', type: 'tool' },
  'artifacts': { title: 'Artifact Vault', seedText: 'Entering the Artifact Vault. Learn to identify and mitigate the most common acoustic anomalies.', type: 'tool' },
  'calibration': { title: 'Clinical Calibration', seedText: 'Starting Clinical Calibration. We will now assess your learning style and clinical goals.', type: 'tool' },
  'study-plan': { title: 'Neural Study Plan', seedText: 'Accessing your Neural Study Plan. A customized roadmap to SPI mastery.', type: 'tool' },
  'practice': { title: 'ARDMS Practice Vault', seedText: 'The Practice Vault is open. High-yield questions designed to mirror the actual SPI exam.', type: 'tool' },
  'analysis': { title: 'Board Readiness Analysis', seedText: 'Analyzing your board readiness. Let’s look at the data to see where you stand.', type: 'tool' },
  'profile': { title: 'Neural Profile', seedText: 'Accessing your neural profile. Review your achievements, inventory, and board readiness metrics.', type: 'section' },
  'shop': { title: 'Acoustic Marketplace', seedText: 'Welcome to the Marketplace. Exchange your earned XP for advanced neural boosters and clinical equipment.', type: 'tool' },
  'pricing': { title: 'Enrollment Protocol', seedText: 'Select your acoustic vector. Upgrade your neural link for full matrix access.', type: 'section' }
};

const CourseViewer: React.FC<CourseViewerProps> = ({ onExit, onPlayCorrect, onPlayIncorrect, onPlayBubble }) => {
    const { courseData, isLoading: isCourseLoading } = useCourse();
    const mainScrollRef = useRef<HTMLDivElement>(null);
    const [isHydrated, setIsHydrated] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (courseData.length > 0 && expandedModules.size === 0) {
            setExpandedModules(new Set([courseData[0].id]));
        }
    }, [courseData]);
    const [activeQuiz, setActiveQuiz] = useState<AssessmentQuestion[] | null>(null);
    
    const { getOverride: getBrandingOverride, overrides } = useBranding();
    const elevenLabsKey = overrides['eleven-labs-key']?.value || localStorage.getItem('spi-eleven-labs-key') || '';
    const [aiActive, setAiActive] = useState(() => {
      const saved = localStorage.getItem('echomasters-ai-active');
      return saved !== null ? JSON.parse(saved) : true;
    });

    const { user, profile, progress, updateProfile, updateProgress, isAdmin } = useFirebase();
    const isPremium = profile?.isPremium || false;
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const { narrate, stopNarration, isNarrating, isThinking } = useNarrator();
    const [isSunoTrack, setIsSunoTrack] = useState(false);
    const [sunoEmbedUrl, setSunoEmbedUrl] = useState('');
    const [autoNarrate, setAutoNarrate] = useState(() => {
        const saved = localStorage.getItem('echomasters-auto-narrate');
        return saved !== null ? JSON.parse(saved) : false;
    });

    useEffect(() => {
        localStorage.setItem('echomasters-auto-narrate', JSON.stringify(autoNarrate));
    }, [autoNarrate]);

    const readinessLink = getBrandingOverride('dash-link-readiness', "https://buy.stripe.com/00w6oGanpcH8boq5tRafS0e");
    const xpLink = getBrandingOverride('dash-link-xp', "https://buy.stripe.com/00w6oGanpcH8boq5tRafS0e");
    const streakLink = getBrandingOverride('dash-link-streak', "https://buy.stripe.com/00w6oGanpcH8boq5tRafS0e");

    const [viewMode, setViewMode] = useState<string>(() => {
        try {
            const saved = localStorage.getItem('spi-viewer-state-view-mode');
            return saved ? JSON.parse(saved) : 'dashboard';
        } catch(e) { return 'dashboard'; }
    });

    const [subView, setSubView] = useState<string | null>(() => {
        try {
            const saved = localStorage.getItem('spi-viewer-state-sub-view');
            return saved ? JSON.parse(saved) : null;
        } catch(e) { return null; }
    });

    const [currentModuleIdx, setCurrentModuleIdx] = useState<number>(0);
    const [currentTopicIdx, setCurrentTopicIdx] = useState<number>(0);
    const [showCinematicIntro, setShowCinematicIntro] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncProgress, setSyncProgress] = useState(0);
    const [cachedCount, setCachedCount] = useState(0);
    const [introData, setIntroData] = useState<{ title: string; seedText: string; type: 'module' | 'lesson' | 'tool' | 'section' } | null>(null);
    const [seenIntros, setSeenIntros] = useState<Set<string>>(() => {
        const saved = localStorage.getItem('echomasters-seen-intros');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });

    const currentModule = useMemo(() => courseData[currentModuleIdx] || courseData[0], [currentModuleIdx]);
    const currentTopic = useMemo(() => currentModule.topics[currentTopicIdx] || currentModule.topics[0], [currentModule, currentTopicIdx]);
    const completedTopicIds = useMemo(() => new Set(progress?.completedTopicIds || []), [progress]);

    useEffect(() => {
        if (autoNarrate && !isNarrating && !isThinking) {
            const timer = setTimeout(() => {
                narrate(currentTopic.detailedLecture || currentTopic.contentBody, currentTopic.professorPersona);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [currentTopic, autoNarrate]);

    const completionPercentage = useMemo(() => {
        const total = courseData.reduce((acc, m) => acc + m.topics.length, 0);
        return total > 0 ? Math.round((completedTopicIds.size / total) * 100) : 0;
    }, [completedTopicIds]);

    const [showTour, setShowTour] = useState(false);

    useEffect(() => {
        const tourSeen = localStorage.getItem('echomasters-tour-seen');
        if (!tourSeen && viewMode === 'dashboard') {
            setShowTour(true);
        }
    }, [viewMode]);

    const tourSteps = [
        {
            targetId: 'tour-welcome',
            title: 'Welcome to EchoMasters',
            content: 'Welcome to the most advanced ultrasound physics training matrix. Let’s take a quick tour of your neural uplink.',
            position: 'center' as const
        },
        {
            targetId: 'tour-curriculum',
            title: 'Curriculum Map',
            content: 'Access all 10 modules of the ARDMS SPI syllabus here. Track your progress through every acoustic principle.',
            position: 'right' as const
        },
        {
            targetId: 'tour-daily-mercy',
            title: 'Daily Protocol',
            content: 'Your daily greeting and readiness index. Keep your streak alive to maintain peak neural resonance.',
            position: 'bottom' as const
        },
        {
            targetId: 'tour-calibration',
            title: 'Clinical Calibration',
            content: 'Analyze your learning dynamics and clinical mission. This node adapts the matrix to your specific strengths.',
            position: 'top' as const
        },
        {
            targetId: 'tour-practice',
            title: 'Practice Vault',
            content: 'Test your knowledge with high-yield questions. Real-time feedback ensures clinical mastery.',
            position: 'top' as const
        },
        {
            targetId: 'tour-harvey',
            title: 'Harvey AI Support',
            content: 'Meet Harvey, your clinical AI mentor. He’s always available for real-time acoustic synthesis and support.',
            position: 'top' as const
        }
    ];

    const handleTourComplete = () => {
        setShowTour(false);
        localStorage.setItem('echomasters-tour-seen', 'true');
    };

    const isModuleUnlocked = (mIdx: number) => {
        if (isModuleLockedByTier(mIdx)) return false;
        if (mIdx === 0) return true;
        const prevModule = courseData[mIdx - 1];
        const lastTopicOfPrev = prevModule.topics[prevModule.topics.length - 1];
        return completedTopicIds.has(lastTopicOfPrev.id);
    };

    const isTopicUnlocked = (mIdx: number, tIdx: number) => {
        if (!isModuleUnlocked(mIdx)) return false;
        if (tIdx === 0) return true;
        const prevTopicInModule = courseData[mIdx].topics[tIdx - 1];
        return completedTopicIds.has(prevTopicInModule.id);
    };

    const getModuleProgress = (mIdx: number) => {
        const module = courseData[mIdx];
        const completed = module.topics.filter(t => completedTopicIds.has(t.id)).length;
        return { completed, total: module.topics.length, percent: Math.round((completed / module.topics.length) * 100) };
    };

    const boardReadiness = useMemo(() => {
        const total = courseData.reduce((acc, m) => acc + m.topics.length, 0);
        const topicProgress = (completedTopicIds.size / total) * 100;
        
        // Factor in mock exam scores if available
        const exams = profile?.mockExamHistory || [];
        if (exams.length > 0) {
            // Get the highest score or average? Let's use the average of last 3 exams for a "current" readiness
            const recentExams = exams.slice(-3);
            const avgExamScore = recentExams.reduce((acc, e) => acc + e.score, 0) / recentExams.length;
            
            // 40% weight to topic completion, 60% to exam performance (since exams are more predictive)
            return Math.round((topicProgress * 0.4) + (avgExamScore * 0.6));
        }
        
        return Math.round(topicProgress);
    }, [completedTopicIds, profile?.mockExamHistory]);

    const PREMIUM_START_MODULE_IDX = 2; // Module 3 onwards is premium

    const isModuleLockedByTier = (mIdx: number) => {
        if (isPremium) return false;
        return mIdx >= PREMIUM_START_MODULE_IDX;
    };

    useEffect(() => { setIsHydrated(true); }, []);

    useEffect(() => {
        if (isHydrated && VIEW_INTRO_DATA[viewMode]) {
            const data = VIEW_INTRO_DATA[viewMode];
            triggerIntro(data.title, data.seedText, data.type);
        }
    }, [isHydrated, viewMode]);

    useEffect(() => {
        if (isHydrated && viewMode === 'study' && courseData.length > 0) {
            const elKey = localStorage.getItem('spi-eleven-labs-key');
            if (!elKey) return;

            // Pre-cache next topic
            let nextMIdx = currentModuleIdx;
            let nextTIdx = currentTopicIdx + 1;

            if (nextTIdx >= courseData[currentModuleIdx].topics.length) {
                if (currentModuleIdx < courseData.length - 1) {
                    nextMIdx = currentModuleIdx + 1;
                    nextTIdx = 0;
                } else {
                    return; // End of course
                }
            }

            const nextTopic = courseData[nextMIdx].topics[nextTIdx];
            preCacheCinematicIntro({
                title: nextTopic.title,
                seedText: nextTopic.contentBody,
                type: 'lesson'
            }, elKey).catch(console.error);
        }
    }, [currentModuleIdx, currentTopicIdx, viewMode, isHydrated, courseData]);

    useEffect(() => {
        const updateCacheCount = async () => {
            const count = await getCachedIntrosCount();
            setCachedCount(count);
        };
        updateCacheCount();
    }, [isSyncing, isHydrated]);

    const syncAllIntros = async () => {
        const elKey = localStorage.getItem('spi-eleven-labs-key');
        if (!elKey) {
            alert("Please set your ElevenLabs API key in the settings first.");
            return;
        }

        setIsSyncing(true);
        setSyncProgress(0);

        const allTopics: any[] = [];
        courseData.forEach(m => m.topics.forEach(t => allTopics.push(t)));

        // Pre-cache all song URLs in parallel
        const allSongUrls = allTopics.map(t => t.songUrl).filter(Boolean) as string[];
        if (allSongUrls.length > 0) {
            preCacheMedia(allSongUrls).catch(console.error);
        }

        let completed = 0;
        for (const topic of allTopics) {
            await preCacheCinematicIntro({
                title: topic.title,
                seedText: topic.contentBody,
                type: 'lesson'
            }, elKey);
            completed++;
            setSyncProgress(Math.round((completed / allTopics.length) * 100));
        }

        setIsSyncing(false);
        alert("Acoustic Matrix Synchronization Complete. All lessons are now cached.");
    };

    const navigateToView = (mode: string, subView?: string) => { 
        onPlayBubble?.();
        if (mode === 'logout') {
            localStorage.removeItem('echomasters-hw-id');
            localStorage.removeItem('spi-viewer-state-view-mode');
            localStorage.removeItem('spi-viewer-state-sub-view');
            onExit();
            return;
        }

        setViewMode(mode); 
        setSubView(subView || null);
        setIsSidebarOpen(false);
        mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        localStorage.setItem('spi-viewer-state-view-mode', JSON.stringify(mode));
        if (subView) {
            localStorage.setItem('spi-viewer-state-sub-view', JSON.stringify(subView));
        } else {
            localStorage.removeItem('spi-viewer-state-sub-view');
        }
    };

    const toggleAi = () => {
        const nextState = !aiActive;
        setAiActive(nextState);
        localStorage.setItem('echomasters-ai-active', JSON.stringify(nextState));
        window.dispatchEvent(new CustomEvent('echomasters-privacy-update', { detail: { aiActive: nextState } }));
    };

    const handlePlaySong = (url: string) => {
        if (url.includes('suno.com')) {
            // We now use the global radio player for Suno tracks to enable continuous playback
            window.dispatchEvent(new CustomEvent('echomasters-play-track', { 
                detail: { 
                    track: { 
                        id: `suno-${Date.now()}`,
                        title: 'Suno Audio Node',
                        artist: 'Fairway Dreams',
                        url: url,
                        type: 'music'
                    } 
                } 
            }));
            // We don't show the iframe here anymore to keep the experience unified
            setIsSunoTrack(false);
            setSunoEmbedUrl('');
        } else {
            window.open(url, '_blank');
        }
    };

    const handleQuizComplete = async () => {
        await handleCompleteTopic(currentTopic.id);
        setActiveQuiz(null);
    };

    const handleCompleteTopic = async (topicId: string) => {
        if (user && !completedTopicIds.has(topicId)) {
            const nextCompleted = Array.from(completedTopicIds);
            nextCompleted.push(topicId);
            
            const topic = courseData.flatMap(m => m.topics).find(t => t.id === topicId);
            let xpToAdd = topic?.xpReward || 500;
            if (profile?.inventory?.includes('xp_booster')) {
                xpToAdd = Math.round(xpToAdd * 1.5);
            }

            await updateProgress({ 
                completedTopicIds: nextCompleted
            });
            await updateProfile({
                xp: (profile?.xp || 0) + xpToAdd
            });
        }
    };

    const handleCalibrationComplete = async (plan: any) => {
        if (progress) {
            const existingReports = progress.assessmentReports || [];
            await updateProgress({ 
                assessmentReports: [...existingReports, { type: 'calibration', plan, timestamp: Date.now() }] 
            });
        }
        navigateToView('dashboard');
    };

    const handleMockExamComplete = async (score: number, breakdown: Record<string, number>) => {
        if (profile) {
            const history = profile.mockExamHistory || [];
            await updateProfile({
                lastMockExamScore: score,
                mockExamHistory: [...history, { score, date: new Date().toISOString(), breakdown }],
                xp: (profile.xp || 0) + 500
            });
        }
    };

    const handleProfileUpdate = async (updates: any) => {
        if (profile) {
            await updateProfile(updates);
        }
    };

    const triggerIntro = (title: string, seedText: string, type: 'module' | 'lesson' | 'tool' | 'section') => {
        const introKey = `${type}-${title}`;
        if (seenIntros.has(introKey)) return;

        setIntroData({ title, seedText, type });
        setShowCinematicIntro(true);
        
        const nextSeen = new Set(seenIntros).add(introKey);
        setSeenIntros(nextSeen);
        localStorage.setItem('echomasters-seen-intros', JSON.stringify(Array.from(nextSeen)));
    };

    const navigateToNextUnlockedTopic = () => {
        let nextMIdx = currentModuleIdx;
        let nextTIdx = currentTopicIdx;

        if (currentTopicIdx < currentModule.topics.length - 1) {
            nextTIdx = currentTopicIdx + 1;
        } else if (currentModuleIdx < courseData.length - 1) {
            nextMIdx = currentModuleIdx + 1;
            nextTIdx = 0;
        }

        setCurrentModuleIdx(nextMIdx);
        setCurrentTopicIdx(nextTIdx);
        
        const nextTopic = courseData[nextMIdx].topics[nextTIdx];
        triggerIntro(nextTopic.title, nextTopic.contentBody, 'lesson');
        
        mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(console.error);
        } else {
            document.exitFullscreen();
        }
    };

    const toggleModule = (moduleId: string) => {
        setExpandedModules(prev => {
            const next = new Set(prev);
            if (next.has(moduleId)) next.delete(moduleId);
            else next.add(moduleId);
            return next;
        });
    };

    const navigateToTopic = (mIdx: number, tIdx: number) => {
        setCurrentModuleIdx(mIdx);
        setCurrentTopicIdx(tIdx);
        const topic = courseData[mIdx].topics[tIdx];
        triggerIntro(topic.title, topic.contentBody, 'lesson');
        if (isMobile) setIsSidebarOpen(false);
        onPlayBubble?.();
        mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const [showLevelUp, setShowLevelUp] = useState(false);
    const [lastLevel, setLastLevel] = useState(profile?.level || 1);

    useEffect(() => {
        if (profile?.level && profile.level > lastLevel) {
            setShowLevelUp(true);
            setLastLevel(profile.level);
            // Auto hide after 5 seconds
            setTimeout(() => setShowLevelUp(false), 5000);
        }
    }, [profile?.level, lastLevel]);

    if (!isHydrated) return null;

    if (isCourseLoading) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center z-[1000]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-gold-main animate-spin" />
                    <p className="text-gold-main font-black uppercase tracking-[0.4em] text-[10px]">Syncing Acoustic Matrix...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[60] flex flex-col overflow-hidden font-sans bg-slate-950 h-full">
            <AnimatePresence>
                {showLevelUp && (
                    <motion.div 
                        initial={{ opacity: 0, y: -100, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -100, scale: 0.8 }}
                        className="fixed top-12 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-md px-6"
                    >
                        <div className="bg-gradient-to-r from-gold-main to-amber-500 p-[2px] rounded-[2.5rem] shadow-[0_20px_50px_rgba(181,148,78,0.4)]">
                            <div className="bg-slate-950 rounded-[2.4rem] p-8 flex items-center gap-6 relative overflow-hidden text-left">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Trophy size={80} className="text-gold-main" />
                                </div>
                                <div className="w-20 h-20 rounded-2xl bg-gold-main flex items-center justify-center shadow-gold relative z-10">
                                    <Sparkles size={40} className="text-slate-950 animate-pulse" />
                                </div>
                                <div className="relative z-10">
                                    <p className="text-[10px] font-black text-gold-main uppercase tracking-[0.4em] mb-1">Neural Evolution</p>
                                    <h3 className="text-3xl font-serif font-bold text-white italic text-gradient-gold">Level {profile?.level} Reached</h3>
                                    <p className="text-white/60 text-xs font-light">+100 Acoustic Credits Awarded</p>
                                </div>
                                <button onClick={() => setShowLevelUp(false)} className="absolute top-4 right-4 text-white/20 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Neural Resonance Progress Bar */}
            <div className="fixed top-0 left-0 w-full h-1 z-[500] bg-white/5">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${boardReadiness}%` }}
                    className="h-full bg-gradient-to-r from-gold-main to-blue-500 shadow-[0_0_10px_rgba(181,148,78,0.5)]"
                />
            </div>

            <ClassroomBackground />

            {/* Header Controls */}
            <div className="fixed top-4 right-4 md:top-6 md:right-6 z-[400] flex items-center gap-2 md:gap-4">
                <div className="hidden lg:block">
                    <SiteRadio />
                </div>
                <button 
                    onClick={toggleFullScreen}
                    className="p-2.5 md:p-3 bg-slate-900/80 backdrop-blur-xl border border-white/10 text-white/40 hover:text-gold-main hover:border-gold-main/40 rounded-xl transition-all group"
                    title="Toggle Fullscreen"
                >
                    <Maximize size={18} className="md:w-5 md:h-5" />
                </button>
                <button 
                    onClick={onExit}
                    className="p-2.5 md:p-3 bg-slate-900/80 backdrop-blur-xl border border-white/10 text-white/40 hover:text-white hover:border-gold-main/40 rounded-xl transition-all group flex items-center gap-2 md:gap-3"
                >
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest hidden md:block">Exit Matrix</span>
                    <X size={18} className="md:w-5 md:h-5" />
                </button>
            </div>

            {/* Mobile Radio Floating */}
            <div className="lg:hidden fixed bottom-24 right-4 z-[400]">
                <SiteRadio />
            </div>

            {/* Mobile View Toggle */}
            {viewMode === 'study' && (
                <div className="fixed top-4 left-4 md:top-6 md:left-6 z-[400] flex items-center gap-2">
                    <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="xl:hidden p-2.5 md:p-3 bg-gold-main text-slate-950 rounded-xl shadow-gold"
                    >
                        <Menu size={18} className="md:w-5 md:h-5" />
                    </button>
                    <button 
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className="hidden xl:flex p-2.5 md:p-3 bg-slate-900/80 backdrop-blur-xl border border-white/10 text-white/40 hover:text-gold-main hover:border-gold-main/40 rounded-xl transition-all group items-center gap-2"
                    >
                        {isSidebarCollapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
                    </button>
                </div>
            )}

            <div className="flex-1 flex overflow-hidden relative">
                
                {viewMode === 'study' && (
                    <aside id="tour-curriculum" className={`fixed inset-y-0 left-0 xl:relative z-[450] flex flex-col bg-slate-900/95 xl:bg-slate-900/40 backdrop-blur-3xl border-r border-white/5 transition-all duration-500 overflow-hidden shrink-0 ${
                        isSidebarOpen ? 'w-full md:w-[400px]' : 
                        isSidebarCollapsed ? 'w-0 xl:w-0 border-none' : 'w-0 xl:w-[400px]'
                    }`}>
                        <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-gold-main/10 rounded-xl border border-gold-main/20">
                                    <List size={18} className="text-gold-main" />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-lg font-serif font-bold text-white italic tracking-tight">Curriculum Map</h3>
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Mastery Protocol</p>
                                </div>
                            </div>
                            <button onClick={() => { setIsSidebarOpen(false); setIsSidebarCollapsed(true); }} className="p-2 text-white/20 hover:text-white transition-colors">
                                <ChevronLeft size={24} />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-4">
                            {courseData.map((module, mIdx) => {
                                const isExpanded = expandedModules.has(module.id);
                                const moduleUnlocked = isModuleUnlocked(mIdx);
                                const mProgress = getModuleProgress(mIdx);

                                return (
                                    <div key={module.id} className="space-y-2">
                                        <button 
                                            onClick={() => toggleModule(module.id)}
                                            className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between group ${
                                                currentModuleIdx === mIdx ? 'bg-white/10 border-gold-main/30' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                                                    moduleUnlocked ? 'bg-gold-main/10 border-gold-main/20 text-gold-main' : 'bg-white/5 border-white/5 text-white/10'
                                                }`}>
                                                    {moduleUnlocked ? <BookOpen size={14} /> : <Lock size={14} />}
                                                </div>
                                                <div className="text-left">
                                                    <h4 className="text-xs font-bold text-white uppercase tracking-wider line-clamp-1">{module.title}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className="h-1 w-12 bg-white/5 rounded-full overflow-hidden">
                                                            <div className="h-full bg-gold-main" style={{ width: `${mProgress.percent}%` }}></div>
                                                        </div>
                                                        <span className="text-[8px] text-white/20 font-black">{mProgress.percent}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className={`text-white/20 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                                        </button>

                                        {isExpanded && (
                                            <div className="pl-4 space-y-2 animate-in slide-in-from-top-2 duration-300">
                                                {module.topics.map((t, tIdx) => {
                                                    const unlocked = isTopicUnlocked(mIdx, tIdx);
                                                    const completed = completedTopicIds.has(t.id);
                                                    const active = currentModuleIdx === mIdx && currentTopicIdx === tIdx;

                                                    return (
                                                        <button
                                                            key={t.id}
                                                            disabled={!unlocked}
                                                            onClick={() => navigateToTopic(mIdx, tIdx)}
                                                            className={`w-full p-3 rounded-xl border text-left transition-all flex items-center gap-3 group relative ${
                                                                active ? 'bg-gold-main border-gold-main text-slate-950' : 
                                                                completed ? 'bg-green-500/5 border-green-500/20 text-green-400' :
                                                                unlocked ? 'bg-white/[0.01] border-white/5 hover:bg-white/[0.03] text-white/60' : 
                                                                'bg-slate-950/20 border-transparent text-white/10 cursor-not-allowed grayscale'
                                                            }`}
                                                        >
                                                            <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 border text-[10px] ${
                                                                active ? 'bg-slate-950/10 border-slate-950/20' : 
                                                                completed ? 'bg-green-500/10 border-green-500/20' : 
                                                                'bg-white/5 border-white/10'
                                                            }`}>
                                                                {completed ? <CheckCircle2 size={12} /> : !unlocked ? <Lock size={12} /> : tIdx + 1}
                                                            </div>
                                                            <span className="text-xs font-medium truncate">{t.title}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </aside>
                )}

                <main ref={mainScrollRef} className="flex-1 relative overflow-y-auto custom-scrollbar bg-transparent pb-32">
                    <div className="min-h-full flex flex-col">
                        
                        {viewMode === 'dashboard' && (
                            <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-12 lg:p-24 animate-fade-in text-center max-w-7xl mx-auto w-full relative overflow-hidden">
                                {/* Atmospheric Background Elements */}
                                <div className="absolute inset-0 atmosphere-bg pointer-events-none opacity-50"></div>
                                <div className="absolute inset-0 sonar-grid opacity-10 pointer-events-none"></div>
                                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gold-main/20 animate-scanline"></div>
                                </div>

                                <div className="space-y-8 md:space-y-20 w-full relative z-10">
                                    <div className="space-y-3 md:space-y-6">
                                        <div className="flex items-center justify-center gap-2 md:gap-3">
                                            <div className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full animate-pulse shadow-gold ${aiActive ? 'bg-gold-main' : 'bg-red-500'}`}></div>
                                            <span className="text-[8px] md:text-[12px] font-black uppercase tracking-[0.3em] md:tracking-[0.6em] text-white/30">Clinical Identity Secured</span>
                                        </div>
                                        <h1 id="tour-daily-mercy" className="text-4xl sm:text-5xl md:text-8xl lg:text-[10rem] font-serif font-bold text-white italic tracking-tighter uppercase leading-[0.85] mb-2 break-words text-glow">
                                            Hello, <span className="text-gradient-gold not-italic">{profile?.displayName?.split(' ')[0].toUpperCase() || 'SEEKER'}</span>
                                        </h1>
                                        <div className="max-w-3xl mx-auto relative px-4">
                                            <div className="absolute inset-0 dashed-border opacity-20"></div>
                                            <p className="text-slate-400 text-[10px] md:text-3xl font-light italic py-3 md:py-8">
                                                The acoustic matrix is aligned. Readiness index: <span className="text-gold-main font-bold text-glow">{boardReadiness}%</span>.
                                                {profile?.specialization && (
                                                    <span className="block text-[8px] md:text-sm text-white/30 uppercase tracking-[0.4em] mt-2 md:mt-4 font-black">
                                                        {profile.specialization} {profile.institution ? `• ${profile.institution}` : ''}
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
 
                                    <motion.div 
                                        initial="hidden"
                                        animate="show"
                                        variants={{
                                            hidden: { opacity: 0 },
                                            show: {
                                                opacity: 1,
                                                transition: {
                                                    staggerChildren: 0.1
                                                }
                                            }
                                        }}
                                        className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 w-full"
                                    >
                                        <motion.div 
                                            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                                            className="md:col-span-4 glass-dossier rounded-3xl p-6 md:p-10 text-left relative overflow-hidden group transition-all flex flex-col justify-between hover-lift"
                                        >
                                            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-2.5 md:p-4 bg-gold-main text-slate-950 rounded-xl md:rounded-2xl shadow-gold glow-gold">
                                                            <Database size={20} className="md:w-6 md:h-6" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg md:text-3xl font-serif font-bold text-white italic">Matrix Synchronization</h3>
                                                            <p className="text-[8px] md:text-[10px] font-black text-gold-main uppercase tracking-widest-plus">
                                                                Acoustic Pre-Caching Protocol • {cachedCount} Lessons Synced
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm md:text-xl font-light text-slate-400 italic leading-relaxed max-w-2xl">
                                                        Initialize a full synchronization of the acoustic matrix. This will pre-generate and cache all cinematic intros for every lesson in the syllabus, ensuring zero-latency transitions during your study sessions.
                                                    </p>
                                                </div>
                                                <button 
                                                    onClick={syncAllIntros}
                                                    disabled={isSyncing}
                                                    className="w-full md:w-auto px-10 py-5 md:px-16 md:py-8 bg-gold-main text-slate-950 rounded-2xl md:rounded-[2.5rem] shadow-gold transition-all font-black uppercase tracking-[0.4em] text-[10px] group active:scale-95 disabled:opacity-50"
                                                >
                                                    {isSyncing ? (
                                                        <div className="flex items-center gap-4">
                                                            <Loader2 size={20} className="animate-spin" />
                                                            <span>Syncing {syncProgress}%</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-4">
                                                            <Zap size={20} />
                                                            <span>Initialize Sync</span>
                                                        </div>
                                                    )}
                                                </button>
                                            </div>
                                        </motion.div>

                                        {profile?.calibrationData && (
                                            <motion.div 
                                                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                                                id="tour-calibration" 
                                                className="md:col-span-2 glass-dossier rounded-3xl p-6 md:p-10 text-left relative overflow-hidden group transition-all flex flex-col justify-between hover-lift"
                                            >
                                                <div className="relative z-10 space-y-4 md:space-y-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-2.5 md:p-4 bg-gold-main text-slate-950 rounded-xl md:rounded-2xl shadow-gold glow-gold">
                                                            <Target size={20} className="md:w-6 md:h-6" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg md:text-3xl font-serif font-bold text-white italic">Clinical Mission</h3>
                                                            <p className="text-[8px] md:text-[10px] font-black text-gold-main uppercase tracking-widest-plus">Identity Calibrated: {new Date(profile.calibrationData.calibratedAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-base md:text-4xl font-light text-slate-200 italic leading-tight md:leading-relaxed border-l-2 border-gold-main/30 pl-4 md:pl-10">
                                                        "{profile.calibrationData.mission}"
                                                    </p>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 pt-2 md:pt-6">
                                                        <div className="space-y-1">
                                                            <p className="text-[8px] md:text-[10px] font-black text-white/30 uppercase tracking-widest">Learning Style</p>
                                                            <p className="text-xs md:text-lg font-bold text-white">{profile.calibrationData.style}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[8px] md:text-[10px] font-black text-white/30 uppercase tracking-widest">Primary Strength</p>
                                                            <p className="text-xs md:text-lg font-bold text-white">{profile.calibrationData.strength}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[8px] md:text-[10px] font-black text-white/30 uppercase tracking-widest">Focus Sector</p>
                                                            <p className="text-xs md:text-lg font-bold text-white">{profile.calibrationData.focusArea}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[8px] md:text-[10px] font-black text-white/30 uppercase tracking-widest">Impact Potential</p>
                                                            <p className="text-xs md:text-lg font-bold text-white">{profile.calibrationData.impactPotential}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Daily Mission Card */}
                                        <motion.div 
                                            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                                            className="md:col-span-3 bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-3xl border border-blue-500/30 rounded-3xl p-6 md:p-10 relative overflow-hidden group cursor-pointer transition-all flex flex-col justify-between hover-lift hover:border-blue-400/50"
                                            onClick={() => navigateToView('cases')}
                                        >
                                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.3)] glow-blue">
                                                        <Target size={32} className="text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <span className="px-3 py-1 bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-blue-500/20">Daily Mission</span>
                                                            <span className="text-blue-400 font-black text-[10px] uppercase tracking-widest-plus">+50 Neural EXP</span>
                                                        </div>
                                                        <h3 className="text-2xl md:text-3xl font-serif font-bold text-white italic">Clinical Diagnostic Matrix</h3>
                                                        <p className="text-white/60 text-sm md:text-base font-light">Analyze today's critical case study to maintain peak neural resonance.</p>
                                                    </div>
                                                </div>
                                                <button className="px-8 py-4 bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-400 transition-all shadow-[0_10px_30px_-5px_rgba(59,130,246,0.5)] active:scale-95">
                                                    Initialize Mission
                                                </button>
                                            </div>
                                        </motion.div>

                                        {/* Countdown Timer */}
                                        <motion.div 
                                            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                                            className="md:col-span-3 neural-pulse"
                                        >
                                            <CountdownTimer />
                                        </motion.div>

                                        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="md:col-span-2">
                                            <DashboardStatCard 
                                                icon={Trophy} 
                                                label="Readiness" 
                                                value={`${boardReadiness}%`} 
                                                progress={boardReadiness} 
                                                color="text-gold-main" 
                                                bg="bg-gold-main" 
                                                href={readinessLink}
                                                isMobile={isMobile}
                                                className="hover:scale-[1.02]"
                                            />
                                        </motion.div>
                                        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="md:col-span-2">
                                            <DashboardStatCard 
                                                icon={Zap} 
                                                label="Neural EXP" 
                                                value={profile?.xp || 0} 
                                                progress={(profile?.xp % 1000) / 10} 
                                                color="text-blue-400" 
                                                bg="bg-blue-500" 
                                                href={xpLink}
                                                isMobile={isMobile}
                                                className="hover:scale-[1.02]"
                                                subLabel={profile?.streak ? `+${Math.min(profile.streak * 10, 100)}% Bonus` : null}
                                            />
                                        </motion.div>
                                        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="md:col-span-2">
                                            <DashboardStatCard 
                                                icon={Flame} 
                                                label="Daily Streak" 
                                                value={`${profile?.streak || 0}`} 
                                                color="text-orange-500" 
                                                bg="bg-orange-500" 
                                                className="hover:scale-[1.02]" 
                                                href={streakLink}
                                                isMobile={isMobile}
                                            />
                                        </motion.div>
                                    </motion.div>

                                    {/* Neural Enhancement Suite */}
                                    <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6 mt-8">
                                            <button 
                                                id="tour-practice"
                                                onClick={() => navigateToView('practice')}
                                                className="p-6 md:p-8 bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-3xl text-left space-y-4 group transition-all neural-pulse relative overflow-hidden hover-lift hover:border-gold-main/30"
                                            >
                                                <div className="p-3 bg-gold-main/10 text-gold-main rounded-2xl w-fit group-hover:scale-110 transition-transform relative z-10 glow-gold">
                                                    <Brain size={24} />
                                                </div>
                                                <div className="relative z-10">
                                                    <h4 className="text-base md:text-lg font-serif font-bold text-white italic uppercase leading-none">Practice Vault</h4>
                                                    <p className="text-[8px] md:text-[9px] font-black text-white/20 uppercase tracking-widest mt-1">20 High-Yield Questions</p>
                                                </div>
                                            </button>

                                            <button 
                                                onClick={() => navigateToView('flashcards')}
                                                className="p-6 md:p-8 bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-3xl text-left space-y-4 group transition-all relative overflow-hidden hover-lift hover:border-blue-500/30"
                                            >
                                                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl w-fit group-hover:scale-110 transition-transform relative z-10 glow-blue">
                                                    <Layers size={24} />
                                                </div>
                                                <div className="relative z-10">
                                                    <h4 className="text-base md:text-lg font-serif font-bold text-white italic uppercase leading-none">Flashcard Deck</h4>
                                                    <p className="text-[8px] md:text-[9px] font-black text-white/20 uppercase tracking-widest mt-1">15 Core Mnemonics</p>
                                                </div>
                                            </button>

                                            <button 
                                                onClick={() => navigateToView('study-plan')}
                                                className="p-6 md:p-8 bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-3xl text-left space-y-4 group transition-all relative overflow-hidden hover-lift hover:border-emerald-500/30"
                                            >
                                                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl w-fit group-hover:scale-110 transition-transform relative z-10">
                                                    <Target size={24} />
                                                </div>
                                                <div className="relative z-10">
                                                    <h4 className="text-base md:text-lg font-serif font-bold text-white italic uppercase leading-none">Study Plan</h4>
                                                    <p className="text-[8px] md:text-[9px] font-black text-white/20 uppercase tracking-widest mt-1">{completionPercentage}% Sync Complete</p>
                                                </div>
                                            </button>

                                            <button 
                                                onClick={() => navigateToView('analysis')}
                                                className="p-6 md:p-8 bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-3xl text-left space-y-4 group transition-all relative overflow-hidden hover-lift hover:border-red-500/30"
                                            >
                                                <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl w-fit group-hover:scale-110 transition-transform relative z-10">
                                                    <Activity size={24} />
                                                </div>
                                                <div className="relative z-10">
                                                    <h4 className="text-base md:text-lg font-serif font-bold text-white italic uppercase leading-none">Exam Analysis</h4>
                                                    <p className="text-[8px] md:text-[9px] font-black text-white/20 uppercase tracking-widest mt-1">Critical Pitfalls</p>
                                                </div>
                                            </button>

                                            <button 
                                                onClick={() => navigateToView('cases')}
                                                className="p-6 md:p-8 bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-3xl text-left space-y-4 group transition-all hover-lift hover:border-orange-500/30"
                                            >
                                                <div className="p-3 bg-orange-500/10 text-orange-400 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                                                    <Activity size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="text-base md:text-lg font-serif font-bold text-white italic uppercase leading-none">Clinical Mission</h4>
                                                    <p className="text-[8px] md:text-[9px] font-black text-white/20 uppercase tracking-widest mt-1">Case-Based Diagnostics</p>
                                                </div>
                                            </button>

                                            <button 
                                                onClick={() => navigateToView('assess')}
                                                className="p-6 md:p-8 bg-gold-main/20 backdrop-blur-3xl border border-gold-main/30 rounded-3xl text-left space-y-4 group transition-all shadow-gold/10 hover-lift hover:border-gold-main/60"
                                            >
                                                <div className="p-3 bg-gold-main text-slate-950 rounded-2xl w-fit group-hover:scale-110 transition-transform shadow-gold glow-gold">
                                                    <ShieldCheck size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="text-base md:text-lg font-serif font-bold text-white italic uppercase leading-none">SPI Mock Exam</h4>
                                                    <p className="text-[8px] md:text-[9px] font-black text-gold-main uppercase tracking-widest mt-1">110 Qs • 2 Hours</p>
                                                </div>
                                            </button>
                                    </div>

                                        {/* Sonic Resonance Section */}
                                        <div className="col-span-full glass-dossier rounded-[2rem] md:rounded-[4rem] p-6 md:p-12 text-left relative overflow-hidden group hover:border-blue-500/30 transition-all">
                                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                                <Music size={120} className="text-blue-400" />
                                            </div>
                                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                                <div className="space-y-4 md:space-y-6 flex-1">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-3 md:p-4 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20 shadow-blue-500/10">
                                                            <Radio size={24} />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xl md:text-3xl font-serif font-bold text-white italic uppercase tracking-tight">Sonic Resonance</h3>
                                                            <p className="text-[8px] md:text-[10px] font-black text-blue-400 uppercase tracking-widest">Acoustic Learning Nodes Active</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm md:text-xl text-slate-400 font-light italic leading-relaxed border-l-2 border-blue-500/20 pl-6">
                                                        Master complex ultrasound physics through high-yield musical mnemonics and faculty broadcasts.
                                                    </p>
                                                </div>
                                                <button 
                                                    onClick={() => navigateToView('podcast')}
                                                    className="w-full md:w-auto px-10 py-6 bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-blue-500/20 hover:scale-105 transition-all flex items-center justify-center gap-3"
                                                >
                                                    <Headphones size={18} /> Enter Echo Chamber
                                                </button>
                                            </div>
                                        </div>

                                        {!isPremium && (
                                            <div className="p-6 md:p-12 bg-gold-main/10 border border-gold-main/30 rounded-[1.5rem] md:rounded-[4rem] flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 group hover:bg-gold-main/20 transition-all text-center md:text-left mb-8">
                                                <div className="space-y-2">
                                                    <h3 className="text-xl md:text-4xl font-serif font-bold text-gold-main italic uppercase tracking-tight">Unlock Full Matrix Access</h3>
                                                    <p className="text-slate-400 text-xs md:text-lg italic">Free Tier limited to first 3 modules. Upgrade for unlimited narrations, advanced sectors, and clinical case studies.</p>
                                                </div>
                                                <button 
                                                    onClick={() => window.open('https://buy.stripe.com/00w6oGanpcH8boq5tRafS0e', '_blank')}
                                                    className="w-full md:w-auto px-10 py-5 bg-gold-main text-slate-950 rounded-2xl font-black uppercase tracking-widest text-xs shadow-gold hover:scale-105 transition-all whitespace-nowrap"
                                                >
                                                    Upgrade to Premium
                                                </button>
                                            </div>
                                        )}
                                    
                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 md:pt-10 px-4">
                                        <button onClick={() => navigateToView('classroom')} className="w-full sm:w-auto px-10 md:px-16 py-6 md:py-8 bg-gold-main text-slate-950 rounded-[1.5rem] md:rounded-[2rem] font-black uppercase tracking-[0.4em] text-xs shadow-gold hover:shadow-gold-strong transition-all flex items-center justify-center gap-4 active:scale-95">Enter Sector Grid <ArrowRight size={20} /></button>
                                        <button onClick={() => navigateToView('assess')} className="w-full sm:w-auto px-8 md:px-12 py-6 md:py-8 bg-gold-main/10 border border-gold-main/30 text-gold-main rounded-[1.5rem] md:rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:bg-gold-main/20 transition-all flex items-center justify-center gap-4">SPI Mock Exam</button>
                                        <button onClick={() => navigateToView('calibration')} className="w-full sm:w-auto px-8 md:px-12 py-6 md:py-8 bg-white/5 border border-white/10 text-white rounded-[1.5rem] md:rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all flex items-center justify-center gap-4">Calibration</button>
                                        {isAdmin && (
                                            <button onClick={() => navigateToView('admin')} className="w-full sm:w-auto px-8 md:px-12 py-6 md:py-8 bg-red-500/10 border border-red-500/30 text-red-400 rounded-[1.5rem] md:rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:bg-red-500/20 transition-all flex items-center justify-center gap-4">
                                                <ShieldCheck size={20} /> Admin Core
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {viewMode === 'classroom' && (
                            <div className="p-6 md:p-12 lg:p-24 animate-fade-in text-left max-w-7xl mx-auto w-full">
                                 <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-10 mb-12 md:mb-24">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-gold-main">
                                            <div className="p-2 bg-gold-main/10 rounded-lg border border-gold-main/20"><LayoutGrid size={18} /></div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Sector Navigation Grid</span>
                                        </div>
                                        <h1 className="text-4xl md:text-8xl font-serif font-bold text-white italic uppercase tracking-tighter leading-none">Acoustic <span className="text-gold-main not-italic">Sectors</span></h1>
                                    </div>
                                 </div>
                                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                                    {courseData.map((module, mIdx) => {
                                        const unlocked = isModuleUnlocked(mIdx);
                                        const progress = getModuleProgress(mIdx);
                                        return (
                                            <button 
                                                key={module.id}
                                                disabled={!unlocked}
                                                onClick={() => { 
                                                    setCurrentModuleIdx(mIdx); 
                                                    setCurrentTopicIdx(0); 
                                                    navigateToView('study');
                                                    triggerIntro(module.title, module.description, 'module');
                                                }}
                                                className={`p-6 md:p-12 bg-slate-900/40 backdrop-blur-3xl border rounded-[2rem] md:rounded-[3rem] text-left group transition-all duration-700 relative overflow-hidden flex flex-col min-h-[320px] md:min-h-[380px] shadow-2xl ${unlocked ? 'border-white/10 hover:border-gold-main/40' : 'border-white/5 opacity-50 cursor-not-allowed grayscale'}`}
                                            >
                                                {!unlocked && (
                                                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/30 backdrop-blur-[2px] gap-4">
                                                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-white/20 shadow-3xl">
                                                            <Lock size={24} />
                                                        </div>
                                                        {isModuleLockedByTier(mIdx) && (
                                                            <div className="px-4 py-2 bg-gold-main/20 border border-gold-main/40 rounded-full text-[10px] font-black uppercase tracking-widest text-gold-main">Premium Sector</div>
                                                        )}
                                                    </div>
                                                )}
                                                <div className="flex justify-between items-start mb-6 md:mb-10">
                                                    <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center transition-all ${unlocked ? 'bg-gold-main/10 border border-gold-main/20 text-gold-main group-hover:scale-110 shadow-gold' : 'bg-white/5 border border-white/5 text-white/10'}`}><BookOpen size={24} /></div>
                                                </div>
                                                <div className="flex-1 space-y-3 md:space-y-4">
                                                    <h3 className={`text-xl md:text-3xl font-serif font-bold text-white italic group-hover:text-gold-main transition-colors leading-tight uppercase ${!unlocked ? 'opacity-40' : ''}`}>{module.title}</h3>
                                                    <p className="text-xs md:text-sm text-slate-400 font-light leading-relaxed italic line-clamp-3">{module.description}</p>
                                                </div>
                                                {unlocked && (
                                                    <div className="mt-8 md:mt-10 space-y-2 md:space-y-3">
                                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/20"><span>Sector Resonance</span><span className="text-gold-main">{progress.percent}%</span></div>
                                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-gold-main transition-all duration-1000 shadow-gold" style={{ width: `${progress.percent}%` }}></div></div>
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                 </div>
                            </div>
                        )}

                        {viewMode === 'study' && (
                            <div className="flex-1 flex flex-col p-4 md:p-12 lg:p-24 animate-fade-in text-left relative overflow-hidden">
                                {/* Background Decorative Elements */}
                                <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-main/5 blur-[120px] rounded-full pointer-events-none"></div>
                                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none"></div>
                                
                                <div className="max-w-6xl mx-auto w-full space-y-8 md:space-y-12 relative z-10">
                                    <div className="space-y-4 md:space-y-6">
                                        <motion.div 
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="flex items-center gap-3 text-gold-main"
                                        >
                                            <div className="relative">
                                                <div className="w-2 h-2 rounded-full bg-gold-main shadow-[0_0_10px_rgba(181,148,78,0.8)] animate-pulse"></div>
                                                <div className="absolute inset-0 w-2 h-2 rounded-full bg-gold-main animate-ping opacity-40"></div>
                                            </div>
                                            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] md:tracking-[0.6em] drop-shadow-sm">Sector {currentModuleIdx + 1} • Node {currentTopicIdx + 1}</span>
                                        </motion.div>
                                        <h1 className="text-4xl md:text-8xl lg:text-9xl font-serif font-bold text-white italic uppercase tracking-tighter leading-[1] md:leading-[0.85] drop-shadow-2xl">{currentTopic.title}</h1>
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-16">
                                        <div className="lg:col-span-9 space-y-8 md:space-y-12">
                                            <div className="rounded-[2.5rem] md:rounded-[5rem] overflow-hidden border-2 border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] bg-slate-900/60 backdrop-blur-2xl h-[250px] sm:h-[400px] md:h-[650px] relative group ring-1 ring-white/5">
                                                <Simulations type={currentTopic.visualType} />
                                                {/* Scanning Line Effect */}
                                                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                                                    <div className="w-full h-[2px] bg-gold-main/50 shadow-[0_0_15px_rgba(181,148,78,0.8)] absolute top-0 animate-scanline"></div>
                                                </div>
                                                {/* Corner Accents */}
                                                <div className="absolute top-8 left-8 w-4 h-4 border-t-2 border-l-2 border-gold-main/40 rounded-tl-sm"></div>
                                                <div className="absolute top-8 right-8 w-4 h-4 border-t-2 border-r-2 border-gold-main/40 rounded-tr-sm"></div>
                                                <div className="absolute bottom-8 left-8 w-4 h-4 border-b-2 border-l-2 border-gold-main/40 rounded-bl-sm"></div>
                                                <div className="absolute bottom-8 right-8 w-4 h-4 border-b-2 border-r-2 border-gold-main/40 rounded-br-sm"></div>
                                            </div>
                                            
                                            <div className="p-8 md:p-14 bg-gradient-to-br from-slate-900/80 to-slate-950/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] md:rounded-[4rem] space-y-8 shadow-[0_30px_80px_-15px_rgba(0,0,0,0.6)] relative overflow-hidden group/brief ring-1 ring-white/5">
                                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-gold-main/10 border border-gold-main/20 flex items-center justify-center text-gold-main shadow-inner">
                                                            <Terminal size={22} />
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest md:tracking-[0.5em] text-gold-main block">Faculty Briefing</span>
                                                            <span className="text-[9px] text-white/30 uppercase tracking-widest font-bold">Transmission Encrypted</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-3">
                                                        {currentTopic.songUrl && (
                                                            <button 
                                                                onClick={() => handlePlaySong(currentTopic.songUrl!)}
                                                                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl transition-all border ${isSunoTrack ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_25px_rgba(37,99,235,0.5)] scale-105' : 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50'}`}
                                                            >
                                                                <Music size={16} className={isSunoTrack ? 'animate-bounce' : ''} />
                                                                <span className="text-[10px] font-black uppercase tracking-widest">{isSunoTrack ? 'Resonating...' : 'Sonic Resonance'}</span>
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={() => narrate(currentTopic.detailedLecture || currentTopic.contentBody, currentTopic.professorPersona)}
                                                            disabled={isThinking}
                                                            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border transition-all ${isNarrating ? 'bg-red-500/20 border-red-500/40 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'bg-gold-main/10 border-gold-main/30 text-gold-main hover:bg-gold-main/20 hover:border-gold-main/50'}`}
                                                        >
                                                            {isThinking ? <Loader2 size={16} className="animate-spin" /> : isNarrating ? <VolumeX size={16} /> : <Volume2 size={16} />}
                                                            <span className="text-[10px] font-black uppercase tracking-widest">{isNarrating ? 'Stop' : 'Narrate'}</span>
                                                        </button>
                                                        <button 
                                                            onClick={() => setAutoNarrate(!autoNarrate)}
                                                            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border transition-all ${autoNarrate ? 'bg-gold-main text-slate-950 border-gold-main shadow-lg' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
                                                            title="Auto-Narrate on topic change"
                                                        >
                                                            <Zap size={16} className={autoNarrate ? 'fill-current' : ''} />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">{autoNarrate ? 'Auto ON' : 'Auto OFF'}</span>
                                                        </button>
                                                        <button 
                                                            onClick={() => setViewMode('cinematic-presentation')}
                                                            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-gold-main/30 text-gold-main hover:bg-gold-main/20 hover:border-gold-main/50 transition-all"
                                                        >
                                                            <Sparkles size={16} />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">Cinematic</span>
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-10">
                                                    <div className="relative">
                                                        <div className="absolute -left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-gold-main/60 via-gold-main/10 to-transparent rounded-full"></div>
                                                        <p className="text-xl md:text-3xl text-slate-100 font-serif font-light leading-relaxed italic pr-4">{currentTopic.contentBody}</p>
                                                    </div>

                                                    {currentTopic.detailedLecture && (
                                                        <motion.div 
                                                            initial={{ opacity: 0, scale: 0.98 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            className="mt-16 p-8 md:p-14 bg-slate-950/60 rounded-[3rem] border border-white/10 shadow-inner relative group/lecture overflow-hidden"
                                                        >
                                                            {/* Decorative Background for Lecture */}
                                                            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-main/5 blur-[80px] rounded-full -mr-32 -mt-32"></div>
                                                            
                                                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6 relative z-10">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-14 h-14 rounded-2xl bg-gold-main/10 flex items-center justify-center border border-gold-main/20 shadow-lg">
                                                                        <BookOpen size={28} className="text-gold-main" />
                                                                    </div>
                                                                    <div>
                                                                        <h3 className="text-xl md:text-2xl font-serif font-light text-gold-main italic">Detailed Lecture Note</h3>
                                                                        <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-black">Deep Dive Protocol v2.4</p>
                                                                    </div>
                                                                </div>
                                                                <button 
                                                                    onClick={() => narrate(currentTopic.detailedLecture!, currentTopic.professorPersona)}
                                                                    disabled={isThinking}
                                                                    className={`flex items-center gap-3 px-8 py-4 rounded-2xl border transition-all font-black uppercase tracking-widest text-xs ${isNarrating ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-gold-main text-slate-950 border-gold-main hover:scale-105 active:scale-95 shadow-[0_10px_30px_-5px_rgba(181,148,78,0.4)]'}`}
                                                                >
                                                                    {isThinking ? <Loader2 size={18} className="animate-spin" /> : isNarrating ? <VolumeX size={18} /> : <Volume2 size={18} />}
                                                                    {isNarrating ? 'Stop Transmission' : 'Narrate Full Lecture'}
                                                                </button>
                                                            </div>
                                                            <div className="prose prose-invert max-w-none relative z-10">
                                                                <div className="text-slate-300/90 text-lg md:text-xl leading-[1.8] whitespace-pre-wrap font-light tracking-wide selection:bg-gold-main/30">
                                                                    {currentTopic.detailedLecture}
                                                                </div>
                                                            </div>
                                                            {/* Bottom Accent */}
                                                            <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between text-[9px] font-black uppercase tracking-[0.4em] text-white/20">
                                                                <span>End of Node Documentation</span>
                                                                <span className="text-gold-main/40">Acoustic Matrix v4.0</span>
                                                            </div>
                                                        </motion.div>
                                                    )}

                                                    {isSunoTrack && sunoEmbedUrl && (
                                                        <motion.div 
                                                            initial={{ opacity: 0, y: 30 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="relative w-full aspect-video md:aspect-[21/9] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9)] bg-black ring-1 ring-white/10"
                                                        >
                                                            <iframe 
                                                                src={sunoEmbedUrl}
                                                                className="w-full h-full border-none"
                                                                allow="autoplay; encrypted-media"
                                                                title="Suno Player"
                                                            />
                                                            <button 
                                                                onClick={() => {
                                                                    setIsSunoTrack(false);
                                                                    setSunoEmbedUrl('');
                                                                    if ((window as any).duckRadio) (window as any).duckRadio(false);
                                                                }}
                                                                className="absolute top-6 right-6 p-3 bg-black/60 backdrop-blur-xl text-white/60 hover:text-white rounded-xl border border-white/10 z-10 transition-all hover:scale-110 active:scale-95"
                                                            >
                                                                <X size={20} />
                                                            </button>
                                                        </motion.div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-6">
                                                <button 
                                                    onClick={() => setActiveQuiz(currentTopic.assessment)} 
                                                    className={`w-full py-8 md:py-10 rounded-[2rem] md:rounded-[3rem] font-black uppercase tracking-[0.4em] md:tracking-[0.6em] text-xs md:text-sm transition-all flex items-center justify-center gap-6 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5)] group relative overflow-hidden ${completedTopicIds.has(currentTopic.id) ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-gold-main text-slate-950 shadow-gold hover:translate-y-[-4px] active:scale-[0.98]'}`}
                                                >
                                                    {!completedTopicIds.has(currentTopic.id) && (
                                                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12"></div>
                                                    )}
                                                    {completedTopicIds.has(currentTopic.id) ? (
                                                        <><CheckCircle2 size={24} className="animate-bounce" /> Logic Validated</>
                                                    ) : (
                                                        <><Zap size={24} fill="currentColor" className="group-hover:scale-125 transition-transform" /> Initialize Sync</>
                                                    )}
                                                </button>
                                                
                                                {currentTopic.interactiveNotes && <InteractiveLectureNotes notes={currentTopic.interactiveNotes} />}
                                                
                                                {completedTopicIds.has(currentTopic.id) && (
                                                    <motion.button 
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        onClick={navigateToNextUnlockedTopic} 
                                                        className="w-full py-8 md:py-10 bg-white/5 border border-white/10 text-white rounded-[2rem] md:rounded-[4rem] font-black uppercase tracking-[0.4em] md:tracking-[0.6em] text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-6 md:gap-8 group shadow-3xl ring-1 ring-white/5"
                                                    >
                                                        Next Matrix Node <ArrowRight size={28} className="group-hover:translate-x-4 transition-transform text-gold-main" />
                                                    </motion.button>
                                                )}
                                            </div>
                                        </div>
                                        <aside className="lg:col-span-3 space-y-8 md:space-y-12">
                                            <motion.div 
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="p-8 md:p-12 bg-slate-950/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] md:rounded-[4rem] space-y-6 md:space-y-10 shadow-[0_30px_80px_-15px_rgba(0,0,0,0.7)] relative overflow-hidden ring-1 ring-white/5"
                                            >
                                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-gold-main/5 blur-[50px] rounded-full"></div>
                                                <div className="flex items-center gap-4 text-gold-main">
                                                    <div className="relative">
                                                        <Activity size={22} className="relative z-10" />
                                                        <div className="absolute inset-0 bg-gold-main/40 blur-md animate-pulse"></div>
                                                    </div>
                                                    <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] md:tracking-[0.6em]">Clinical Focus</span>
                                                </div>
                                                <div className="space-y-4">
                                                    <p className="text-lg md:text-xl text-slate-300 leading-relaxed italic font-serif font-light">"{currentTopic.mnemonic || 'Focus on wave mechanics.'}"</p>
                                                    <div className="w-12 h-1 bg-gold-main/30 rounded-full"></div>
                                                </div>
                                                <div className="pt-4 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/20">
                                                    <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></div>
                                                    <span>Live Clinical Feed</span>
                                                </div>
                                            </motion.div>

                                            {/* Additional Sidebar Element: Progress Summary */}
                                            <div className="p-8 md:p-10 bg-white/5 border border-white/10 rounded-[2.5rem] md:rounded-[3rem] space-y-6">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Sector Resonance</span>
                                                    <span className="text-gold-main font-serif italic text-xl">{getModuleProgress(currentModuleIdx).percent}%</span>
                                                </div>
                                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-[2px] ring-1 ring-white/10">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${getModuleProgress(currentModuleIdx).percent}%` }}
                                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                                        className="h-full bg-gradient-to-r from-gold-main/40 to-gold-main rounded-full shadow-[0_0_15px_rgba(181,148,78,0.5)]"
                                                    ></motion.div>
                                                </div>
                                            </div>
                                        </aside>
                                    </div>
                                </div>
                            </div>
                        )}

                        {viewMode === 'multibot' && <FacultyCouncil />}
                        {viewMode === 'podcast' && <PodcastStudio />}
                        {viewMode === 'theater' && <AcousticTheater />}
                        {viewMode === 'flashcards' && <FlashcardVault />}
                        {viewMode === 'cases' && <ClinicalCases />}
                        {viewMode === 'leaderboard' && <GlobalLeaderboard />}
                        {viewMode === 'resonance-rooms' && <ResonanceRooms onNavigate={navigateToView} />}
                        {viewMode === 'resonance-lab' && <SimLaboratory initialSubView={subView || undefined} />}
                        {viewMode === 'quiz-gen' && <QuizGenerator onExit={() => navigateToView('dashboard')} onPlayCorrect={onPlayCorrect} onPlayIncorrect={onPlayIncorrect} />}
                        {viewMode === 'glossary' && <Glossary onExit={() => navigateToView('dashboard')} />}
                        {viewMode === 'assess' && <MockExam onComplete={handleMockExamComplete} onExit={() => navigateToView('dashboard')} />}
                        {viewMode === 'artifacts' && <ArtifactVault />}
                        {viewMode === 'calibration' && <div className="p-4 md:p-24 animate-fade-in text-left max-w-7xl mx-auto w-full"><CalibrationTool onComplete={handleCalibrationComplete} /></div>}
                        {viewMode === 'admin' && <AdminDashboard />}
                        {viewMode === 'shop' && <Shop />}
                        {viewMode === 'pricing' && <Pricing currentPlan={profile?.isPremium ? 'annual' : 'free'} />}
                        {viewMode === 'cinematic-presentation' && currentTopic && (
                            <div className="fixed inset-0 z-[500]">
                                <CinematicLessonPresentation 
                                    topic={{
                                        id: currentTopic.id,
                                        title: currentTopic.title,
                                        content: currentTopic.detailedLecture || currentTopic.contentBody,
                                        visualType: currentTopic.visualType
                                    }}
                                    moduleTitle={currentModule.title}
                                    onComplete={(score) => {
                                        if (score >= 100) {
                                            handleCompleteTopic(currentTopic.id);
                                        }
                                        setViewMode('study');
                                    }}
                                    onPlayCorrect={onPlayCorrect}
                                    onPlayIncorrect={onPlayIncorrect}
                                />
                                <button 
                                    onClick={() => setViewMode('study')}
                                    className="fixed top-6 left-6 z-[600] p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white hover:bg-white/20 transition-all"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        )}
                        {viewMode === 'study-plan' && <StudyPlan onExit={() => navigateToView('dashboard')} onNavigate={navigateToView} />}
                        {viewMode === 'practice' && <ARDMSPractice onClose={() => navigateToView('dashboard')} />}
                        {viewMode === 'analysis' && <ARDMSAnalysis onClose={() => navigateToView('dashboard')} />}
                        {viewMode === 'profile' && profile && <div className="p-4 md:p-24 animate-fade-in text-left max-w-7xl mx-auto w-full"><UserProfile game={profile} onUpdateProfile={handleProfileUpdate} boardReadiness={boardReadiness} isAdmin={isAdmin} onNavigateToAdmin={() => navigateToView('admin')} /></div>}
                    </div>
                </main>
            </div>

            <AcousticBottomNav activeView={viewMode} onNavigate={navigateToView} aiActive={aiActive} onToggleAi={toggleAi} isAdmin={isAdmin} />
            {activeQuiz && <TopicQuiz questions={activeQuiz} onClose={() => setActiveQuiz(null)} onComplete={handleQuizComplete} onPlayCorrect={onPlayCorrect} onPlayIncorrect={onPlayIncorrect} />}
            
            <AppTour 
                isOpen={showTour} 
                steps={tourSteps} 
                onComplete={handleTourComplete} 
            />
            {showCinematicIntro && introData && (
                <CinematicIntro 
                    title={introData.title}
                    seedText={introData.seedText}
                    type={introData.type}
                    onContinue={() => setShowCinematicIntro(false)}
                    elevenLabsKey={elevenLabsKey}
                />
            )}
            <div id="tour-welcome" className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0"></div>
        </div>
    );
};

const DashboardStatCard = ({ icon: Icon, label, value, progress, color, bg, className = "", href, isMobile, subLabel }: any) => {
    const CardContent = (
        <>
            <div className="flex items-center justify-between relative z-10 mb-4">
                <div className="flex items-center gap-3 md:gap-4">
                    <div className={`p-2 md:p-4 ${bg}/10 rounded-lg md:rounded-2xl border border-white/5 ${color} group-hover:scale-110 transition-transform shadow-inner`}>
                        <Icon size={isMobile ? 16 : 20} />
                    </div>
                    <span className="text-[8px] md:text-[11px] font-black uppercase tracking-[0.3em] text-white/40">{label}</span>
                </div>
                {subLabel && (
                    <span className="text-[7px] md:text-[9px] font-black uppercase tracking-widest text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20 animate-pulse">
                        {subLabel}
                    </span>
                )}
            </div>
            <div className="space-y-1 md:space-y-4 relative z-10 mt-auto">
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl md:text-5xl lg:text-7xl font-serif font-bold italic text-white tracking-tighter leading-none">{value}</span>
                </div>
                {progress !== undefined && (
                    <div className="h-1 md:h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative shadow-inner p-[1px]">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 2, ease: "easeOut" }}
                            className={`h-full ${bg} rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]`}
                        ></motion.div>
                    </div>
                )}
            </div>
        </>
    );

    const baseClasses = `p-4 md:p-10 bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[1.5rem] md:rounded-[3rem] space-y-4 md:space-y-8 shadow-2xl relative overflow-hidden group flex flex-col justify-between h-full transition-all hover:border-white/10 hover:bg-slate-900/60 ${className}`;

    if (href) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" className={baseClasses}>
                {CardContent}
            </a>
        );
    }

    return (
        <div className={baseClasses}>
            {CardContent}
        </div>
    );
};

export default CourseViewer;