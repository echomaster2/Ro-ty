import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Sun, Loader2, Waves, Activity, ShieldCheck, Compass, ArrowRight, Target, Sparkles, ClipboardList, Bot, Rocket, GraduationCap, CheckCircle2, Play, X, Film, Zap, Heart, Users, Trophy } from 'lucide-react';
import ProfessorHost from './ProfessorHost';
import CinematicCommercial from './CinematicCommercial';
import MultibotPresentation from './MultibotPresentation';
import { GoogleGenAI } from "@google/genai";
import { useFirebase } from './FirebaseProvider';
import { useBranding } from './BrandingContext';

interface HeroProps {
    onOpenCourse?: (view?: string) => void;
    onPlayBubble?: () => void;
    progress?: number;
    onOpenResurrection?: () => void;
    onOpenPractice?: () => void;
}

const INSIGHT_EXPIRY = 24 * 60 * 60 * 1000; 

const Hero: React.FC<HeroProps> = ({ onOpenCourse, onPlayBubble, progress = 0, onOpenResurrection, onOpenPractice }) => {
  const { profile, progress: userProgress, updateProgress } = useFirebase();
  const dbUser = userProgress;
  const { getOverride } = useBranding();
  const [showTip, setShowTip] = useState(false);
  const [tipMessage, setTipMessage] = useState("");
  const [isSummoning, setIsSummoning] = useState(false);
  const [harveyVisible, setHarveyVisible] = useState(false);
  const [summonStage, setSummonStage] = useState<'none' | 'beaming' | 'materializing' | 'active'>('none');
  const [showCommercial, setShowCommercial] = useState(false);
  const [showMultibotDemo, setShowMultibotDemo] = useState(false);

  const customHeroUrl = getOverride('brand-hero-media', "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80");
  const heroTitle = getOverride('brand-hero-title', "Master the ARDMS® Exam the First Time");
  const heroSubtitle = getOverride('brand-hero-subtitle', "The ultimate study companion for sonography students preparing for the ARDMS® SPI Ultrasound Physics board exam.");

  const isVideo = customHeroUrl.match(/\.(mp4|webm|ogg)$/) || customHeroUrl.includes('video');

  useEffect(() => {
    if (dbUser) {
      const now = Date.now();
      if (dbUser.lastInsight && dbUser.insightText && (now - dbUser.lastInsight < INSIGHT_EXPIRY)) {
        setTipMessage(dbUser.insightText);
        setShowTip(true);
        setHarveyVisible(true);
        setSummonStage('active');
      } else {
        const initialDelay = setTimeout(() => {
          summonHarvey();
        }, 2000);
        return () => clearTimeout(initialDelay);
      }
    }
  }, [dbUser]);

  const summonHarvey = async () => {
      if (isSummoning || !dbUser) return;
      setIsSummoning(true);
      setShowTip(false);
      onPlayBubble?.(); 
      
      setSummonStage('beaming');
      
      setTimeout(() => {
          setSummonStage('materializing');
          setHarveyVisible(true);
      }, 1000);

      try {
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          const response = await ai.models.generateContent({
              model: 'gemini-3-flash-preview',
              contents: "Harvey clinical insight welcoming ultrasound student. Mention a high-yield physics fact. Max 20 words.",
          });

          const wisdom = response.text || "Synchronizing resonance... Let us begin our scan of the fundamentals.";
          setTipMessage(wisdom);
          
          await updateProgress({
            lastInsight: Date.now(),
            insightText: wisdom
          });
          
          setTimeout(() => {
            setIsSummoning(false);
            setShowTip(true);
            setSummonStage('active');
          }, 1500);

      } catch (e) {
          setTipMessage("My circuits feel the attenuation... remember sound requires a medium.");
          setIsSummoning(false);
          setShowTip(true);
          setSummonStage('active');
      }
  };

  return (
    <div id="home" className="relative min-h-screen flex items-center pt-20 pb-20 md:pt-32 md:pb-32 overflow-hidden bg-transparent">
      {/* Background Grid Overlay */}
      <div className="absolute inset-0 grid grid-cols-12 pointer-events-none opacity-[0.03]">
        {[...Array(13)].map((_, i) => (
          <div key={i} className="h-full border-r border-white"></div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-12 relative z-10 w-full">
        <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-start">
          
          <div className="lg:col-span-7 text-center lg:text-left space-y-12 md:space-y-20">
            <div className="inline-flex items-center gap-4 px-5 py-2.5 rounded-xl bg-slate-950/40 backdrop-blur-3xl border border-white/10 shadow-2xl animate-fade-in group mx-auto lg:mx-0">
              <div className="flex gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-gold-main/20"></div>
              </div>
              <div className="h-4 w-px bg-white/10"></div>
              <button 
                onClick={onOpenResurrection}
                className="text-[10px] md:text-xs font-mono font-bold uppercase tracking-[0.2em] text-gold-main/80 hover:text-gold-main transition-colors"
              >
                UPLINK_STATUS: <span className="text-white">ACTIVE_NODE_77</span>
              </button>
            </div>
            
            <div className="space-y-8 md:space-y-14">
              <div className="flex items-center gap-3 mb-[-1.5rem] md:mb-[-2.5rem] opacity-0 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="h-[1px] w-12 bg-gold-main/30"></div>
                <span className="text-[10px] md:text-xs font-mono font-bold text-gold-main/60 uppercase tracking-[0.4em]">
                  DIAGNOSTIC_BOARD_PREP_V4.0
                </span>
              </div>
              <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[clamp(4rem,9vw,11rem)] font-serif font-bold tracking-tighter leading-[0.85] text-white animate-slide-up italic">
                {heroTitle.split(' ').map((word, i) => (
                  <span key={i} className={i > 2 ? "text-gradient-gold not-italic block lg:inline" : ""}>
                    {word}{' '}
                  </span>
                ))}
              </h1>
              
              <div className="max-w-2xl mx-auto lg:mx-0 relative">
                <div className="absolute -left-6 top-0 bottom-0 w-[1px] bg-gradient-to-b from-gold-main/40 to-transparent hidden lg:block"></div>
                <p className="text-lg md:text-3xl text-slate-400 leading-relaxed font-light font-sans opacity-0 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  {heroSubtitle}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-4 md:gap-6 pt-6 md:pt-16 opacity-0 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <button 
                onClick={() => onOpenCourse?.('classroom')} 
                className="col-span-full lg:w-auto px-12 md:px-24 py-7 md:py-10 bg-gold-main text-slate-950 font-black text-sm md:text-lg uppercase tracking-[0.4em] rounded-2xl md:rounded-[3rem] shadow-[0_20px_50px_rgba(212,175,55,0.3)] hover:shadow-[0_30px_60px_rgba(212,175,55,0.4)] active:scale-95 transition-all flex items-center justify-center gap-5 md:gap-6 group overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12"></div>
                <Rocket size={24} className="md:w-8 md:h-8 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                <span className="relative z-10">{progress > 0 ? `RESUME_SYNC` : 'ESTABLISH_SYNC'}</span>
                {progress > 0 && (
                  <span className="ml-2 px-3 py-1 bg-slate-950 text-gold-main rounded-full text-[10px] font-mono">{progress}%</span>
                )}
              </button>

              <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                <button 
                  onClick={() => {
                    const pricingSection = document.getElementById('pricing');
                    if (pricingSection) pricingSection.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex-1 lg:flex-none px-8 md:px-14 py-6 md:py-9 bg-white/5 border border-white/10 text-white font-bold text-xs md:text-base uppercase tracking-[0.3em] rounded-2xl md:rounded-[2.5rem] hover:bg-white/10 hover:border-gold-main/30 transition-all flex items-center justify-center gap-4 group"
                >
                  <Trophy size={20} className="text-gold-main/60 group-hover:text-gold-main transition-colors" />
                  <span>TIERS</span>
                </button>

                <button 
                  onClick={onOpenPractice}
                  className="flex-1 lg:flex-none px-8 md:px-14 py-6 md:py-9 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs md:text-base uppercase tracking-[0.3em] rounded-2xl md:rounded-[2.5rem] hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-4 group"
                >
                  <ClipboardList size={20} className="group-hover:scale-110 transition-transform" />
                  <span>VAULT</span>
                </button>
              </div>
              
              <div className="flex gap-4 w-full lg:w-auto">
                <button 
                  onClick={() => setShowMultibotDemo(true)}
                  className="flex-1 lg:flex-none px-6 md:px-12 py-6 md:py-9 bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold text-[10px] md:text-sm uppercase tracking-[0.2em] rounded-2xl md:rounded-[2.5rem] hover:bg-purple-500/20 transition-all flex items-center justify-center gap-3"
                >
                  <Users size={18} />
                  <span>FACULTY</span>
                </button>
                
                <button 
                  onClick={() => setShowCommercial(true)}
                  className="flex-1 lg:flex-none px-6 md:px-12 py-6 md:py-9 bg-slate-900/60 backdrop-blur-2xl border border-white/10 text-gold-main font-bold text-[10px] md:text-sm uppercase tracking-[0.2em] rounded-2xl md:rounded-[2.5rem] hover:bg-gold-main/10 transition-all flex items-center justify-center gap-3 group"
                >
                  <Zap size={18} className="animate-pulse group-hover:scale-125 transition-transform" />
                  <span>TRAILER</span>
                </button>
              </div>
            </div>

            <div className="space-y-8 pt-12 md:pt-24 opacity-0 animate-slide-up border-t border-white/5 hidden sm:block" style={{ animationDelay: '0.6s' }}>
                <div className="flex flex-wrap justify-center lg:justify-start gap-8 md:gap-16">
                    {[
                      { icon: ShieldCheck, label: "SYNC_GUARANTEE", value: "99.8%" },
                      { icon: Target, label: "BOARD_MAPPED", value: "2026_V1" },
                      { icon: Activity, label: "RIG_SIMS", value: "LIVE" }
                    ].map((item, i) => (
                    <div key={i} className="flex flex-col gap-2">
                        <div className="flex items-center gap-3 text-[10px] text-white/30 font-mono font-bold uppercase tracking-[0.2em]">
                            <item.icon size={14} className="text-gold-main/40" />
                            <span>{item.label}</span>
                        </div>
                        <div className="text-sm font-mono text-white/60 tracking-wider ml-6">{item.value}</div>
                    </div>
                    ))}
                </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-12 relative mt-16 md:mt-24 lg:mt-0 px-4 md:px-0">
             <div className="relative z-10 aspect-square rounded-[3rem] md:rounded-[6rem] overflow-hidden border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] bg-slate-900 group">
                <div className="absolute inset-0 bg-gradient-to-br from-gold-main/10 to-transparent opacity-50 group-hover:opacity-70 transition-opacity"></div>
                {isVideo ? (
                  <video 
                    src={customHeroUrl} 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-[6000ms] ease-out"
                  />
                ) : (
                  <img src={customHeroUrl} alt="Hero" className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-[6000ms] ease-out" referrerPolicy="no-referrer" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                
                {/* Scanner Line Effect */}
                <motion.div 
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  className="absolute left-0 right-0 h-[2px] bg-gold-main/40 blur-[2px] z-20 pointer-events-none"
                />
                
                <div className="absolute inset-0 sonar-grid opacity-30 pointer-events-none"></div>
                
                {/* HUD Elements */}
                <div className="absolute top-8 left-8 flex flex-col gap-1">
                  <div className="text-[8px] font-mono text-gold-main/60 uppercase tracking-widest">System_Calibration</div>
                  <div className="h-1 w-16 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      animate={{ width: ['0%', '100%'] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="h-full bg-gold-main/60"
                    />
                  </div>
                </div>
             </div>
             
             <div className="relative lg:absolute lg:bottom-0 lg:right-0 lg:translate-y-1/3 lg:translate-x-1/4 z-30 flex justify-center lg:justify-end">
               {summonStage !== 'none' && (
                  <div className="transform scale-[0.85] md:scale-110 origin-bottom lg:origin-bottom-right drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)]">
                     <ProfessorHost 
                        isActive={harveyVisible} 
                        message={showTip ? tipMessage : ""} 
                        isThinking={isSummoning}
                        isSpeaking={showTip && !isSummoning}
                        userName={profile?.displayName || "Seeker"}
                     />
                  </div>
               )}
               
               {!harveyVisible && (
                  <button 
                    onClick={summonHarvey}
                    className="p-8 md:p-12 bg-gold-main text-slate-950 rounded-[2rem] md:rounded-[4rem] shadow-[0_20px_60px_rgba(212,175,55,0.4)] hover:scale-110 transition-all active:scale-95 group ring-8 md:ring-12 ring-slate-950/40 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    <Bot size={40} className="relative z-10" />
                  </button>
               )}
             </div>
          </div>
        </div>
      </div>
      
      {showCommercial && <CinematicCommercial onClose={() => setShowCommercial(false)} />}
      {showMultibotDemo && <MultibotPresentation onClose={() => setShowMultibotDemo(false)} />}
    </div>
  );
};

export default Hero;