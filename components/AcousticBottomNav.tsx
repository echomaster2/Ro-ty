import React, { useState, useEffect } from 'react';
import { 
  Layers, GraduationCap, Zap, Database, ShieldAlert, 
  ShieldCheck, Users, Radio, Film, Target, Book, 
  Activity, MoreHorizontal, X, ChevronUp, Trophy, UserCircle,
  LogOut, Sparkles, Brain
} from 'lucide-react';
import HarveyAvatar from './HarveyAvatar';
import { motion, AnimatePresence } from 'framer-motion';
import { useFirebase } from './FirebaseProvider';

interface AcousticBottomNavProps {
  activeView: string;
  onNavigate: (view: string) => void;
  aiActive: boolean;
  onToggleAi: () => void;
  isAdmin?: boolean;
}

const AcousticBottomNav: React.FC<AcousticBottomNavProps> = ({ activeView, onNavigate, aiActive, onToggleAi, isAdmin: isAdminProp }) => {
  const { isAdmin: isAdminContext, logout } = useFirebase();
  const isAdmin = isAdminProp !== undefined ? isAdminProp : isAdminContext;
  const [showMore, setShowMore] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const mainActions = [
    { icon: Layers, label: "Hub", id: 'dashboard' },
    { icon: GraduationCap, label: "Sync", id: 'classroom' },
    { icon: Target, label: "Rig", id: 'quiz-gen' },
    { icon: Zap, label: "Neural", id: 'flashcards' },
  ];

  const secondaryActions = [
    { icon: Sparkles, label: "Shop", id: 'shop' },
    { icon: Brain, label: "Plan", id: 'study-plan' },
    { icon: Activity, label: "Cases", id: 'cases' },
    { icon: Book, label: "Lexicon", id: 'glossary' },
    { icon: Radio, label: "Listening", id: 'podcast' },
    { icon: Users, label: "Council", id: 'multibot' },
    { icon: Film, label: "Viewing", id: 'theater' },
    { icon: Database, label: "Vault", id: 'artifacts' },
    { icon: Trophy, label: "Rank", id: 'leaderboard' },
    { icon: ShieldCheck, label: "Exam", id: 'assess' },
    { icon: Activity, label: "Calibrate", id: 'calibration' },
    { icon: UserCircle, label: "Profile", id: 'profile' },
    { icon: LogOut, label: "Exit", id: 'logout' },
  ];

  if (isAdmin) {
    secondaryActions.splice(secondaryActions.length - 1, 0, { icon: ShieldAlert, label: "Admin", id: 'admin' });
  }

  // Desktop layout: main + selected secondary + more
  const desktopSecondary = secondaryActions.slice(0, 4);
  const desktopMore = secondaryActions.slice(4);

  const handleNavigate = async (id: string) => {
    if (id === 'logout') {
      await logout();
      return;
    }
    onNavigate(id);
    setShowMore(false);
  };

  return (
    <div className="fixed bottom-0 md:bottom-8 left-1/2 -translate-x-1/2 z-[500] w-full max-w-5xl px-0 md:px-6 animate-slide-up">
      
      {/* More Menu Overlay */}
      <AnimatePresence>
        {showMore && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-full left-4 right-4 md:left-auto md:right-0 mb-4 glass-panel rounded-[2.5rem] p-6 shadow-[0_20px_100px_rgba(0,0,0,0.8)] grid grid-cols-3 md:grid-cols-4 gap-4"
          >
            {(isMobile ? secondaryActions : desktopMore).map((action) => (
              <NavButton 
                key={action.id}
                icon={action.icon}
                label={action.label}
                isActive={activeView === action.id}
                onClick={() => handleNavigate(action.id)}
                isSmall
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass-panel rounded-t-[2rem] md:rounded-[3.5rem] shadow-[0_20px_100px_rgba(0,0,0,0.7)] h-20 md:h-24 flex items-center justify-around px-2 md:px-8 relative ring-1 ring-white/10">
        
        {/* Desktop View: All buttons */}
        <div className="hidden md:flex items-center justify-around flex-1 gap-2">
          {mainActions.map(action => (
            <NavButton 
              key={action.id}
              icon={action.icon} 
              label={action.label} 
              isActive={activeView === action.id || (action.id === 'classroom' && activeView === 'study')} 
              onClick={() => onNavigate(action.id)} 
            />
          ))}
        </div>

        {/* Mobile View: Main buttons */}
        <div className="flex md:hidden items-center justify-around flex-1">
          {mainActions.slice(0, 2).map(action => (
            <NavButton 
              key={action.id}
              icon={action.icon} 
              label={action.label} 
              isActive={activeView === action.id || (action.id === 'classroom' && activeView === 'study')} 
              onClick={() => onNavigate(action.id)} 
            />
          ))}
        </div>

        {/* Central Button: HARVEY */}
        <div className="relative -top-6 md:-top-10 group px-2 shrink-0">
          <div className={`absolute inset-[-8px] md:inset-[-15px] rounded-full blur-2xl transition-all duration-1000 ${aiActive ? 'bg-gold-main/20 animate-pulse' : 'bg-red-500/20'}`}></div>
          <div className={`absolute inset-[-3px] md:inset-[-4px] rounded-full border-2 transition-all duration-700 ${aiActive ? 'border-gold-main/50 shadow-[0_0_40px_rgba(181,148,78,0.4)]' : 'border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-pulse'}`}></div>
          
          <motion.button 
            id="tour-harvey"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              onToggleAi();
              window.dispatchEvent(new CustomEvent('echomasters-open-harvey'));
            }}
            className="relative w-16 h-16 md:w-24 md:h-24 bg-[#0A1122] rounded-full border border-white/10 flex items-center justify-center overflow-hidden transition-all group shadow-2xl hover:border-gold-main/40 ring-4 ring-slate-950/20"
          >
             <div className="mt-1 md:mt-2 scale-[0.8] md:scale-[1.1]">
                <HarveyAvatar size="sm" isTalking={aiActive} accentColor={aiActive ? '#B5944E' : '#ef4444'} />
             </div>
             {!aiActive && (
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="absolute inset-0 bg-red-500/20 backdrop-blur-[1.5px] flex items-center justify-center"
               >
                  <ShieldAlert size={16} className="md:w-6 md:h-6 text-red-500 animate-bounce" />
               </motion.div>
             )}
          </motion.button>
        </div>

        {/* Desktop View: Secondary buttons */}
        <div className="hidden md:flex items-center justify-around flex-1 gap-2">
          {desktopSecondary.map(action => (
            <NavButton 
              key={action.id}
              icon={action.icon} 
              label={action.label} 
              isActive={activeView === action.id} 
              onClick={() => onNavigate(action.id)} 
            />
          ))}
          <NavButton 
            icon={showMore ? X : MoreHorizontal} 
            label="More" 
            isActive={showMore} 
            onClick={() => setShowMore(!showMore)} 
          />
        </div>

        {/* Mobile View: Remaining main + More */}
        <div className="flex md:hidden items-center justify-around flex-1">
          {mainActions.slice(2).map(action => (
            <NavButton 
              key={action.id}
              icon={action.icon} 
              label={action.label} 
              isActive={activeView === action.id} 
              onClick={() => onNavigate(action.id)} 
            />
          ))}
          <NavButton 
            icon={showMore ? X : MoreHorizontal} 
            label="More" 
            isActive={showMore} 
            onClick={() => setShowMore(!showMore)} 
          />
        </div>

      </div>
    </div>
  );
};

const NavButton = ({ icon: Icon, label, isActive, onClick, isSmall = false }: any) => (
    <motion.button 
      whileHover={{ scale: 1.1, y: -2 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all duration-500 flex-1 min-w-0 ${isActive ? 'text-gold-main scale-110 text-glow' : 'text-white/30 hover:text-white/60'} ${isSmall ? 'py-2' : ''}`}
    >
      <Icon size={isSmall ? 20 : 18} className="md:w-[22px] md:h-[22px]" strokeWidth={isActive ? 2 : 1.5} />
      <span className={`text-[9px] md:text-xs font-black uppercase tracking-tight md:tracking-[0.1em] truncate w-full text-center ${isActive ? 'opacity-100' : 'opacity-60'}`}>{label}</span>
      {isActive && (
        <motion.div 
          layoutId="nav-active-indicator"
          className="absolute -bottom-1 w-1 h-1 bg-gold-main rounded-full shadow-gold"
        />
      )}
    </motion.button>
);

export default AcousticBottomNav;
