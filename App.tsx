
import React, { useState, useEffect, useMemo } from 'react';
import { courseData } from './data/courseContent';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import ExamSections from './components/ExamSections';
import SyllabusBreakdown from './components/SyllabusBreakdown';
import ResonanceRooms from './components/ResonanceRooms';
import AboutUs from './components/AboutUs';
import Testimonials from './components/Testimonials';
import Pricing from './components/Pricing';
import Footer from './components/Footer';
import Guarantee from './components/Guarantee';
import CourseViewer from './components/CourseViewer';
import AppIntro from './components/AppIntro';
import LegalPages from './components/LegalPages';
import OceanBackground from './components/OceanBackground';
import NeuralBackground from './components/NeuralBackground';
import CustomCursor from './components/CustomCursor';
import ResurrectionProtocol from './components/ResurrectionProtocol';
import AIDemoSection from './components/AIDemoSection';
import AuthPortal from './components/AuthPortal';
import AcousticMobilePreview from './components/AcousticMobilePreview';
import ARDMSPractice from './components/ARDMSPractice';
import CalibrationTool from './components/CalibrationTool';
import SiteRadio from './components/SiteRadio';
import StudyPlan from './components/StudyPlan';
import HarveyChat from './components/HarveyChat';
import ProfileSettings from './components/ProfileSettings';
import { FirebaseProvider, useFirebase } from './components/FirebaseProvider';
import { BrandingProvider } from './components/BrandingContext';
import { CourseProvider } from './components/CourseContext';

courseData.forEach(module => {
  module.topics.forEach(topic => {
    (topic as any).depth = (module.pressure === 'High' || module.pressure === 'Extreme') ? 100 : 50;
  });
});

const AppContent: React.FC = () => {
  const { user, profile, progress, loading, logout, isAdmin, updateProfile } = useFirebase();
  const [showCourse, setShowCourse] = useState(false);
  const [showStudyPlan, setShowStudyPlan] = useState(false);
  const [showARDMSPractice, setShowARDMSPractice] = useState(false);
  const [legalPage, setLegalPage] = useState<'terms' | 'privacy' | null>(null);
  const [showResurrection, setShowResurrection] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showHarveyChat, setShowHarveyChat] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [introFinished, setIntroFinished] = useState(() => {
    return localStorage.getItem('spi-intro-seen') === 'true';
  });

  const isAuthenticated = !!user;
  const needsCalibration = isAuthenticated && profile && !profile.calibrationData;

  const globalProgress = useMemo(() => {
    if (!progress) return 0;
    const totalTopics = courseData.reduce((acc, m) => acc + (m.topics?.length || 0), 0);
    const completedCount = progress.completedTopicIds?.length || 0;
    return Math.round((completedCount / Math.max(1, totalTopics)) * 100);
  }, [progress]);

  useEffect(() => {
    if (introFinished) {
      localStorage.setItem('spi-intro-seen', 'true');
    }
  }, [introFinished]);

  const handleLogout = async () => {
    await logout();
    setShowCourse(false);
    window.location.reload();
  };

  const playNavigationSound = () => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.08);
    g.gain.setValueAtTime(0.05, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.12);
  };

  const playCorrectSound = () => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(1760, t + 0.1);
    g.gain.setValueAtTime(0.05, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  };

  const playIncorrectSound = () => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.15);
    g.gain.setValueAtTime(0.05, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.3);
  };

  const [loadingStatus, setLoadingStatus] = useState(0);
  const [liveBackground, setLiveBackground] = useState(true);
  
  const statusMessages = [
    "Initializing Acoustic Matrix...",
    "Calibrating Transducer Resonance...",
    "Establishing Secure Neural Uplink...",
    "Syncing Clinical Database...",
    "Optimizing Gray-Scale Resolution...",
    "Aligning Piezoelectric Crystals...",
    "Mapping Hemodynamic Vectors...",
    "Securing Identity Node...",
    "Activating Doppler Shift Protocols...",
    "Decoding Echo-Signature..."
  ];

  useEffect(() => {
    const handleToggleBackground = () => setLiveBackground(prev => !prev);
    window.addEventListener('echomasters-toggle-background', handleToggleBackground);
    return () => window.removeEventListener('echomasters-toggle-background', handleToggleBackground);
  }, []);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingStatus(prev => (prev + 1) % statusMessages.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  useEffect(() => {
    const handleOpenHarvey = () => setShowHarveyChat(true);
    window.addEventListener('echomasters-open-harvey', handleOpenHarvey);
    return () => window.removeEventListener('echomasters-open-harvey', handleOpenHarvey);
  }, []);

  if (!introFinished) {
      return <AppIntro onComplete={() => setIntroFinished(true)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Sonar Pulse Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <motion.div 
            animate={{ scale: [1, 2], opacity: [0.5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
            className="absolute w-64 h-64 border border-gold-main rounded-full"
          />
          <motion.div 
            animate={{ scale: [1, 2.5], opacity: [0.3, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeOut", delay: 1 }}
            className="absolute w-64 h-64 border border-gold-main rounded-full"
          />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-8">
          <div className="relative">
            {/* Spinning Core */}
            <div className="w-24 h-24 border-4 border-gold-main/10 border-t-gold-main rounded-full animate-spin shadow-[0_0_30px_rgba(181,148,78,0.3)]"></div>
            {/* Inner Pulse */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-gold-main/20 rounded-full animate-pulse blur-md"></div>
            </div>
          </div>

          <div className="space-y-4 text-center">
            <h2 className="text-3xl font-serif font-bold text-white italic tracking-tighter uppercase">
              Neural <span className="text-gold-main not-italic">Sync</span>
            </h2>
            
            <div className="h-4 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.p 
                  key={loadingStatus}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-[10px] font-black text-gold-main/60 uppercase tracking-[0.4em]"
                >
                  {statusMessages[loadingStatus]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Bottom Progress Bar (Subtle) */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5 overflow-hidden">
          <motion.div 
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-1/3 h-full bg-gold-main shadow-[0_0_10px_rgba(181,148,78,0.8)]"
          />
        </div>
      </div>
    );
  }

  if (needsCalibration) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 md:p-12 relative overflow-hidden">
        {liveBackground && <OceanBackground />}
        <div className="relative z-10 w-full max-w-4xl">
          <CalibrationTool 
            onComplete={async (plan) => {
              await updateProfile({ 
                calibrationData: { 
                  ...plan, 
                  calibratedAt: new Date().toISOString() 
                } 
              });
            }} 
            initialData={{ 
              userName: profile?.displayName || '',
              birthDate: ''
            }}
          />
        </div>
      </div>
    );
  }

  const handleOpenCourse = (view?: any, subView?: string) => {
    if (!isAuthenticated) {
      setShowAuth(true);
    } else {
      const targetView = typeof view === 'string' ? view : 'dashboard';
      localStorage.setItem('spi-viewer-state-view-mode', JSON.stringify(targetView));
      if (subView) {
        localStorage.setItem('spi-viewer-state-sub-view', JSON.stringify(subView));
      } else {
        localStorage.removeItem('spi-viewer-state-sub-view');
      }
      playNavigationSound();
      setShowCourse(true);
    }
  };

  return (
    <div className="min-h-screen text-text-main selection:bg-gold-main/30 selection:text-gold-accent animate-fade-in relative overflow-hidden">
      <CustomCursor />
      {liveBackground ? <NeuralBackground /> : <div className="fixed inset-0 bg-slate-950 z-0" />}
      
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {showCourse ? (
            <motion.div
              key="course"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
            >
              <CourseViewer 
                  onExit={() => setShowCourse(false)} 
                  onPlayCorrect={playCorrectSound}
                  onPlayIncorrect={playIncorrectSound}
                  onPlayBubble={() => {}}
              />
            </motion.div>
          ) : showStudyPlan ? (
            <motion.div
              key="study-plan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <StudyPlan onExit={() => setShowStudyPlan(false)} />
            </motion.div>
          ) : (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Navbar 
                onOpenCourse={handleOpenCourse} 
                onOpenStudyPlan={() => setShowStudyPlan(true)}
                onOpenProfile={() => setShowProfile(true)}
                isAdmin={isAdmin} 
                onOpenLogin={() => setShowAuth(true)}
                onLogout={handleLogout}
                progress={globalProgress}
                isAuthenticated={isAuthenticated}
                liveBackground={liveBackground}
              />
              <Hero 
                onOpenCourse={handleOpenCourse} 
                progress={globalProgress} 
                onOpenResurrection={() => setShowResurrection(true)}
                onOpenPractice={() => setShowARDMSPractice(true)}
              />
              <Pricing 
                onEnroll={handleOpenCourse} 
                onOpenResurrection={() => setShowResurrection(true)} 
                currentPlan={profile?.plan || 'free'}
              />
              <AcousticMobilePreview />
              <AIDemoSection />
              <Features />
              <SyllabusBreakdown onOpenCourse={handleOpenCourse} />
              <ResonanceRooms onNavigate={handleOpenCourse} />
              <ExamSections />
              <AboutUs />
              <Testimonials />
              <Guarantee />
              <Footer onOpenLegal={(type) => setLegalPage(type)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showAuth && (
        <AuthPortal onAuthenticated={() => setShowAuth(false)} onClose={() => setShowAuth(false)} />
      )}

      {legalPage && (
        <LegalPages type={legalPage} onClose={() => setLegalPage(null)} />
      )}

      {showResurrection && (
        <ResurrectionProtocol onClose={() => setShowResurrection(false)} />
      )}

      {showARDMSPractice && (
        <ARDMSPractice onClose={() => setShowARDMSPractice(false)} />
      )}

      <HarveyChat 
        isOpen={showHarveyChat} 
        onClose={() => setShowHarveyChat(false)} 
        userName={profile?.displayName || "Seeker"} 
      />

      <ProfileSettings 
        isOpen={showProfile} 
        onClose={() => setShowProfile(false)} 
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <FirebaseProvider>
      <BrandingProvider>
        <CourseProvider>
          <AppContent />
        </CourseProvider>
      </BrandingProvider>
    </FirebaseProvider>
  );
};

export default App;
