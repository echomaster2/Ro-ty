
import React, { useState, useEffect } from 'react';
import { Menu, X, BookOpen, LayoutGrid, Shield, LogOut, Bot, Target, Maximize, Minimize, ShieldCheck, ShieldAlert, Radio, Lock, ChevronRight, Rocket, Brain, Waves, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminStudio from './AdminStudio';
import SiteRadio from './SiteRadio';
import HarveyAvatar from './HarveyAvatar';
import DailyMercy from './DailyMercy';

import { useBranding } from './BrandingContext';

interface NavbarProps {
    onOpenCourse?: (view?: string) => void;
    onOpenStudyPlan?: () => void;
    onOpenProfile?: () => void;
    isAdmin?: boolean;
    onOpenLogin?: () => void;
    onLogout?: () => void;
    progress?: number;
    isAuthenticated?: boolean;
    liveBackground?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onOpenCourse, onOpenStudyPlan, onOpenProfile, isAdmin, onOpenLogin, onLogout, progress = 0, isAuthenticated = false, liveBackground = true }) => {
  const { getOverride } = useBranding();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showStudio, setShowStudio] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showHarveyMenu, setShowHarveyMenu] = useState(false);
  const [showMercy, setShowMercy] = useState(false);

  const appName = getOverride('brand-app-name', 'EchoMasters');
  const logoUrl = getOverride('brand-logo-url', '');
  
  const [aiActive, setAiActive] = useState(() => {
    const saved = localStorage.getItem('echomasters-ai-active');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('echomasters-ai-active', JSON.stringify(aiActive));
    window.dispatchEvent(new CustomEvent('echomasters-privacy-update', { detail: { aiActive } }));
  }, [aiActive]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <>
      <header className={`fixed w-full top-0 z-[100] transition-all duration-1000 ${scrolled || isOpen ? 'bg-slate-950/80 backdrop-blur-2xl border-b border-white/5 py-3' : 'bg-transparent py-6'}`}>
        {/* Neural Scan Line */}
        <motion.div 
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute top-0 left-0 w-1/4 h-[1px] bg-gold-main/20 blur-sm pointer-events-none"
        />
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10">
          <div className="flex justify-between items-center h-16">
            
            <div className="flex-shrink-0 flex items-center gap-3 md:gap-4">
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => window.dispatchEvent(new CustomEvent('echomasters-open-harvey'))} 
                  className="relative group/harvey focus:outline-none"
                >
                  {logoUrl ? (
                    <img src={logoUrl} alt={appName} className="w-10 h-10 rounded-xl object-cover border border-white/10" referrerPolicy="no-referrer" />
                  ) : (
                    <HarveyAvatar size="sm" isTalking={aiActive} />
                  )}
                </motion.button>
                <div className="flex flex-col text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-semibold text-lg md:text-xl tracking-tight text-white leading-none">{appName}</span>
                      <motion.span 
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="px-1.5 py-0.5 rounded-md bg-gold-main/20 border border-gold-main/30 text-[8px] font-black text-gold-main uppercase tracking-widest"
                      >
                        SPI PREP
                      </motion.span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className={`h-1 w-1 rounded-full ${isAuthenticated ? 'bg-green-500 shadow-green' : 'bg-gold-main/40'}`}></div>
                      <span className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] text-white/40 font-black">
                        {isAuthenticated ? 'SIGNAL_SECURE' : 'GUEST_MODE'}
                      </span>
                    </div>
                </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-4 xl:gap-8">
              <div className="flex items-center gap-2 xl:gap-4">
                {isAuthenticated && (
                  <div className="hidden xl:flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-xl group/session">
                    <ShieldCheck size={14} className="text-green-500 animate-pulse" />
                    <div className="flex flex-col">
                       <span className="text-[7px] font-black text-white/30 uppercase tracking-widest">Active Session</span>
                       <span className="text-[9px] font-mono text-white/60">NODE_77_CALIBRATED</span>
                    </div>
                  </div>
                )}
                
                <motion.button 
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const el = document.getElementById('pricing');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hidden xl:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl transition-all group"
                >
                  <ShieldCheck size={14} className="text-gold-main group-hover:animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">Membership</span>
                </motion.button>

                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.dispatchEvent(new CustomEvent('echomasters-toggle-background'))}
                  className={`flex items-center gap-2 px-3 xl:px-4 py-2 border rounded-xl transition-all group ${liveBackground ? 'bg-gold-main/10 border-gold-main/20 text-gold-main' : 'bg-white/5 border border-white/10 text-white/40 hover:bg-white/10'}`}
                  title="Toggle Live Background"
                >
                  <Waves size={14} className={liveBackground ? 'animate-pulse' : ''} />
                  <span className="text-[9px] xl:text-[10px] font-black uppercase tracking-widest">{liveBackground ? 'Live BG' : 'Live BG'}</span>
                </motion.button>
                
                <div className="flex items-center gap-2">
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleFullScreen} 
                    className="p-2 xl:p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-white/40 hover:text-gold-main"
                  >
                    <Maximize size={16} />
                  </motion.button>

                  {progress > 0 && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-2 xl:gap-3 px-3 xl:px-4 py-2 bg-gold-main/10 border border-gold-main/20 rounded-xl"
                    >
                        <Target size={12} className="text-gold-main animate-pulse" />
                        <span className="text-[9px] xl:text-[10px] font-mono font-bold text-gold-main uppercase tracking-widest">{progress}%</span>
                    </motion.div>
                  )}

                  {isAdmin ? (
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowStudio(true)} 
                      className="p-2 xl:p-3 bg-gold-main/10 text-gold-main border border-gold-main/20 rounded-xl hover:bg-gold-main/20 transition-all"
                    >
                      <LayoutGrid size={16}/>
                    </motion.button>
                  ) : (
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={onOpenLogin} 
                      className="p-2 xl:p-3 text-white/20 hover:text-gold-main transition-all"
                    >
                      <Shield size={16} />
                    </motion.button>
                  )}

                  {isAuthenticated && (
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={onOpenProfile}
                      className="p-2 xl:p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-white/40 hover:text-gold-main group relative"
                      title="Identity Node Settings"
                    >
                      <User size={16} />
                    </motion.button>
                  )}

                  {isAuthenticated && (
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={onOpenStudyPlan}
                      className="p-2 xl:p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-white/40 hover:text-gold-main group relative"
                      title="Neural Study Plan"
                    >
                      <Brain size={16} />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-gold-main rounded-full animate-pulse shadow-gold"></div>
                    </motion.button>
                  )}
                </div>

                <div className="flex items-center gap-2 xl:gap-4">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onOpenCourse?.('classroom')} 
                    className="bg-gold-main text-slate-950 px-4 xl:px-8 py-2.5 xl:py-3 rounded-xl xl:rounded-2xl font-black text-[10px] xl:text-[11px] uppercase tracking-[0.15em] xl:tracking-[0.2em] shadow-gold transition-all hover:shadow-gold-strong active:scale-95 flex items-center gap-2"
                  >
                    <BookOpen size={12} />
                    <span className="hidden sm:inline">{isAuthenticated ? 'Resume Sync' : 'Classroom'}</span>
                    <span className="sm:hidden">{isAuthenticated ? 'Resume' : 'Class'}</span>
                  </motion.button>

                  {isAuthenticated ? (
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onLogout} 
                      className="flex items-center gap-2 xl:gap-3 px-4 xl:px-6 py-2.5 xl:py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl xl:rounded-2xl font-black text-[9px] xl:text-[10px] uppercase tracking-widest hover:bg-red-500/20 transition-all"
                    >
                      <Lock size={12} /> <span className="hidden xl:inline">Lock Session</span> <span className="xl:hidden">Lock</span>
                    </motion.button>
                  ) : (
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onOpenLogin} 
                      className="px-4 xl:px-6 py-2.5 xl:py-3 bg-white/5 text-white/60 border border-white/10 rounded-xl xl:rounded-2xl font-black text-[9px] xl:text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all"
                    >
                      Login
                    </motion.button>
                  )}
                </div>
              </div>
            </nav>

            {/* Mobile Menu Trigger */}
            <div className="lg:hidden flex items-center gap-3">
              <button 
                onClick={() => onOpenCourse?.('classroom')}
                className="p-2.5 bg-gold-main text-slate-950 rounded-xl shadow-gold active:scale-95 transition-all"
                aria-label="Resume Sync"
              >
                <BookOpen size={20} />
              </button>
              <button onClick={() => setIsOpen(!isOpen)} className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-white">
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden absolute top-full left-0 w-full bg-slate-950/98 backdrop-blur-3xl border-b border-white/10 overflow-hidden shadow-2xl z-[90]"
            >
              <div className="py-10 px-8 flex flex-col gap-10">
                <div className="absolute inset-0 sonar-grid opacity-10 pointer-events-none"></div>
                
                <nav className="flex flex-col gap-4 relative z-10">
                  {[
                    { label: 'Syllabus', id: 'syllabus' },
                    { label: 'Domains', id: 'study-guides' },
                    { label: 'Features', id: 'features' },
                    { label: 'About', id: 'about' },
                    { label: 'Pricing', id: 'pricing' }
                  ].map((item, idx) => (
                    <motion.button 
                      key={item.id}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.08, type: "spring", stiffness: 100 }}
                      onClick={() => {
                        const el = document.getElementById(item.id);
                        el?.scrollIntoView({ behavior: 'smooth' });
                        setIsOpen(false);
                      }}
                      className="text-left py-5 border-b border-white/5 text-white/70 font-serif italic text-3xl hover:text-gold-main transition-all flex justify-between items-center group active:scale-95"
                    >
                      <span className="tracking-tight">{item.label}</span>
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-gold-main/20 group-hover:text-gold-main transition-all">
                        <ChevronRight size={20} />
                      </div>
                    </motion.button>
                  ))}
                </nav>

                <div className="flex flex-col gap-6 pt-6 relative z-10">
                  <div className="flex flex-col gap-4 py-6 bg-white/5 rounded-3xl border border-white/10 px-6">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Acoustic Feed</span>
                      <SiteRadio />
                    </div>
                    <div className="h-px bg-white/5 w-full"></div>
                    <button 
                      onClick={toggleFullScreen}
                      className="flex items-center justify-between text-white/60 hover:text-gold-main transition-all group"
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest">Toggle Fullscreen</span>
                      <div className="p-2 bg-white/5 rounded-lg group-hover:bg-gold-main/20 transition-all">
                        <Maximize size={16} />
                      </div>
                    </button>
                  </div>
                  {isAuthenticated ? (
                    <div className="flex flex-col gap-4">
                      <button 
                        onClick={() => { onOpenCourse?.('classroom'); setIsOpen(false); }}
                        className="w-full py-7 bg-gold-main text-slate-950 rounded-[2.5rem] font-black uppercase text-[13px] tracking-[0.25em] shadow-gold active:scale-95 transition-all flex items-center justify-center gap-4"
                      >
                        <BookOpen size={20} />
                        <span>Resume Sync</span>
                      </button>
                      <button 
                        onClick={onLogout}
                        className="w-full py-6 bg-red-500/10 text-red-500 border border-red-500/30 rounded-[2.5rem] font-black uppercase text-[12px] tracking-widest flex items-center justify-center gap-4 active:scale-95 transition-all shadow-lg shadow-red-500/10"
                      >
                        <Lock size={20} /> Lock Session
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <button 
                        onClick={() => { onOpenCourse?.('classroom'); setIsOpen(false); }}
                        className="w-full py-7 bg-gold-main text-slate-950 rounded-[2.5rem] font-black uppercase text-[13px] tracking-[0.25em] shadow-gold active:scale-95 transition-all flex items-center justify-center gap-4"
                      >
                        <Rocket size={20} />
                        <span>Establish Sync</span>
                      </button>
                      <button 
                        onClick={() => { onOpenLogin(); setIsOpen(false); }}
                        className="w-full py-6 bg-white/5 text-white/60 border border-white/10 rounded-[2.5rem] font-black uppercase text-[12px] tracking-widest flex items-center justify-center gap-4 active:scale-95 transition-all"
                      >
                        Login
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <AdminStudio isOpen={showStudio} onClose={() => setShowStudio(false)} />
    </>
  );
};

export default Navbar;
