
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Brain, RefreshCw, CheckCircle2, XCircle, 
  ChevronRight, ChevronLeft, Trophy, Flame, 
  RotateCcw, Sparkles, Database, Target,
  BookOpen, Layers, Info, Plus, Save, Trash2, Shuffle,
  LayoutGrid, GraduationCap, Loader2, Volume2, VolumeX
} from 'lucide-react';
import { useFirebase } from './FirebaseProvider';
import { useNarrator } from '../src/hooks/useNarrator';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category: string;
  mnemonic?: string;
  imageUrl?: string;
}

const PHYSICS_DECK: Flashcard[] = [
  {
    id: 'fc-1',
    category: 'Basic Physics',
    question: 'What is the speed of sound in soft tissue?',
    answer: '1,540 m/s (or 1.54 mm/µs)',
    mnemonic: '15-40: Think of a 15-year-old and a 40-year-old walking together.'
  },
  {
    id: 'fc-2',
    category: 'Basic Physics',
    question: 'What is the relationship between frequency and period?',
    answer: 'They are reciprocals (f = 1/T). If frequency increases, period decreases.',
    mnemonic: 'Frequency is how often, Period is how long.'
  },
  {
    id: 'fc-3',
    category: 'Attenuation',
    question: 'What are the three components of attenuation?',
    answer: 'Absorption, Reflection, and Scattering.',
    mnemonic: 'ARS: Attenuation Really Sucks.'
  },
  {
    id: 'fc-4',
    category: 'Doppler',
    question: 'What is the Doppler Equation?',
    answer: 'Δf = (2 * f₀ * v * cosθ) / c',
    mnemonic: 'Two times the source, velocity, and cosine, all over the speed of sound.'
  },
  {
    id: 'fc-5',
    category: 'Resolution',
    question: 'What determines Axial Resolution?',
    answer: 'Spatial Pulse Length (SPL). Axial Res = SPL / 2.',
    mnemonic: 'LARRD: Longitudinal, Axial, Range, Radial, Depth.'
  },
  {
    id: 'fc-6',
    category: 'Bioeffects',
    question: 'What is the ALARA principle?',
    answer: 'As Low As Reasonably Achievable. Minimize output power and exposure time.',
    mnemonic: 'ALARA: Always Low, Always Reasonable, Always Achievable.'
  },
  {
    id: 'fc-7',
    category: 'Doppler',
    question: 'What is the Nyquist Limit?',
    answer: 'The maximum Doppler shift that can be measured without aliasing (PRF / 2).',
    mnemonic: 'Nyquist = PRF / 2.'
  },
  {
    id: 'fc-8',
    category: 'Transducers',
    question: 'What is the function of the matching layer?',
    answer: 'To reduce the impedance mismatch between the crystal and the skin.',
    mnemonic: 'Matching Layer = Bridge between crystal and skin.'
  },
  {
    id: 'fc-9',
    category: 'Basic Physics',
    question: 'What is the relationship between frequency and wavelength?',
    answer: 'Inversely related (λ = c / f). Higher frequency = shorter wavelength.',
    mnemonic: 'High Freq = Short Wave.'
  },
  {
    id: 'fc-10',
    category: 'Instrumentation',
    question: 'What does TGC stand for and what is its purpose?',
    answer: 'Time Gain Compensation. It compensates for attenuation by increasing gain at greater depths.',
    mnemonic: 'TGC: Time to Get Clearer (at depth).'
  },
  {
    id: 'fc-11',
    category: 'Artifacts',
    question: 'What causes shadowing artifact?',
    answer: 'High attenuation in a structure (e.g., bone or gallstone).',
    mnemonic: 'Shadow = Blocked light (or sound).'
  },
  {
    id: 'fc-12',
    category: 'Artifacts',
    question: 'What causes enhancement artifact?',
    answer: 'Low attenuation in a structure (e.g., fluid-filled cyst).',
    mnemonic: 'Enhancement = Extra sound getting through.'
  },
  {
    id: 'fc-13',
    category: 'Doppler',
    question: 'What is the Doppler angle for maximum shift?',
    answer: '0 degrees (cosine of 0 is 1).',
    mnemonic: '0 degrees = Full speed ahead.'
  },
  {
    id: 'fc-14',
    category: 'Instrumentation',
    question: 'What is the function of the receiver\'s compression?',
    answer: 'To reduce the dynamic range of signals for display compatibility.',
    mnemonic: 'Compression = Squeezing the range.'
  },
  {
    id: 'fc-15',
    category: 'Bioeffects',
    question: 'What does the Mechanical Index (MI) indicate?',
    answer: 'The likelihood of non-thermal bioeffects, specifically cavitation.',
    mnemonic: 'MI = Mechanical = Movement (of bubbles).'
  }
];

const ARTIFACT_PICTURE_DECK: Flashcard[] = [
  {
    id: 'art-1',
    category: 'Artifacts',
    question: 'Identify this artifact: Multiple equally spaced reflections parallel to the sound beam.',
    answer: 'Reverberation',
    mnemonic: 'Think of a ladder or a venetian blind.',
    imageUrl: 'https://picsum.photos/seed/reverb/800/600'
  },
  {
    id: 'art-2',
    category: 'Artifacts',
    question: 'Identify this artifact: A solid streak or "tail" directed downward from a strong reflector.',
    answer: 'Comet Tail (Ring Down)',
    mnemonic: 'A comet leaving a trail in the sky.',
    imageUrl: 'https://picsum.photos/seed/comettail/800/600'
  },
  {
    id: 'art-3',
    category: 'Artifacts',
    question: 'Identify this artifact: An anechoic region extending downward from a highly attenuating structure.',
    answer: 'Shadowing',
    mnemonic: 'Sound is blocked, leaving a shadow behind.',
    imageUrl: 'https://picsum.photos/seed/shadowing/800/600'
  },
  {
    id: 'art-4',
    category: 'Artifacts',
    question: 'Identify this artifact: A hyperechoic region extending downward from a low-attenuating structure.',
    answer: 'Enhancement',
    mnemonic: 'Extra sound gets through, making it brighter behind.',
    imageUrl: 'https://picsum.photos/seed/enhancement/800/600'
  },
  {
    id: 'art-5',
    category: 'Artifacts',
    question: 'Identify this artifact: A second copy of a true reflector appearing deeper than the original.',
    answer: 'Mirror Image',
    mnemonic: 'Sound reflects off a strong interface like a mirror.',
    imageUrl: 'https://picsum.photos/seed/mirror/800/600'
  },
  {
    id: 'art-6',
    category: 'Artifacts',
    question: 'Identify this artifact: A copy of a true reflector appearing side-by-side at the same depth.',
    answer: 'Refraction (Ghost Image)',
    mnemonic: 'The beam bends, creating a ghost.',
    imageUrl: 'https://picsum.photos/seed/refraction/800/600'
  },
  {
    id: 'art-7',
    category: 'Artifacts',
    question: 'Identify this artifact: Grainy appearance caused by interference of sound waves.',
    answer: 'Speckle',
    mnemonic: 'Interference pattern, not real anatomy.',
    imageUrl: 'https://picsum.photos/seed/speckle/800/600'
  },
  {
    id: 'art-8',
    category: 'Artifacts',
    question: 'Identify this artifact: False echoes appearing in anechoic structures due to beam width.',
    answer: 'Slice Thickness (Section Thickness)',
    mnemonic: 'The beam is a 3D volume, not a thin slice.',
    imageUrl: 'https://picsum.photos/seed/slicethickness/800/600'
  }
];

const FlashcardVault: React.FC = () => {
  const { progress: userProgress, updateProgress } = useFirebase();
  const dbUser = userProgress;
  const { narrate, isNarrating, isThinking } = useNarrator();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });
  const [viewMode, setViewMode] = useState<'study' | 'results' | 'manage'>('study');
  const [activeCards, setActiveCards] = useState<Flashcard[]>([]);
  const [activeDeck, setActiveDeck] = useState<'physics' | 'artifacts' | 'custom'>('physics');
  
  // Creation State
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newCategory, setNewCategory] = useState('Custom');
  const [newMnemonic, setNewMnemonic] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize cards
  useEffect(() => {
    if (activeDeck === 'physics') {
        setActiveCards(PHYSICS_DECK);
    } else if (activeDeck === 'artifacts') {
        setActiveCards(ARTIFACT_PICTURE_DECK);
    } else if (activeDeck === 'custom') {
        setActiveCards(dbUser?.customFlashcards || []);
    }
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [activeDeck, dbUser]);

  const currentCard = activeCards[currentIndex];
  const progress = activeCards.length > 0 ? ((currentIndex + 1) / activeCards.length) * 100 : 0;

  const handleFlip = () => setIsFlipped(!isFlipped);

  const [direction, setDirection] = useState(0);

  const handleNext = (mastered: boolean) => {
    if (mastered) {
      setMasteredIds(prev => new Set(prev).add(currentCard.id));
      setSessionStats(prev => ({ ...prev, correct: prev.correct + 1 }));
    }
    setSessionStats(prev => ({ ...prev, total: prev.total + 1 }));

    if (currentIndex < activeCards.length - 1) {
      setDirection(1);
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 50);
    } else {
      setViewMode('results');
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex(currentIndex - 1);
      }, 50);
    }
  };

  const shuffleCards = () => {
    const shuffled = [...activeCards].sort(() => Math.random() - 0.5);
    setActiveCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const resetSession = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionStats({ correct: 0, total: 0 });
    setViewMode('study');
  };

  const handleAddCard = async () => {
    if (!newQuestion || !newAnswer || !dbUser) return;
    
    setIsSaving(true);
    const newCard: Flashcard = {
      id: `custom-${Date.now()}`,
      question: newQuestion,
      answer: newAnswer,
      category: newCategory,
      mnemonic: newMnemonic,
      imageUrl: newImageUrl
    };

    const updatedCustom = [...(dbUser.customFlashcards || []), newCard];
    
    try {
      await updateProgress({ customFlashcards: updatedCustom });
      setNewQuestion('');
      setNewAnswer('');
      setNewMnemonic('');
      setNewImageUrl('');
    } catch (e) {
      console.error("Failed to save card", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCard = async (id: string) => {
    if (!dbUser) return;
    const updatedCustom = (dbUser.customFlashcards || []).filter((c: any) => c.id !== id);
    await updateProgress({ customFlashcards: updatedCustom });
  };

  if (!activeCards.length && !dbUser) {
      return (
          <div className="flex items-center justify-center h-96">
              <Loader2 className="text-gold-main animate-spin" size={40} />
          </div>
      );
  }

  return (
    <div className="max-w-6xl mx-auto w-full p-4 md:p-12 animate-fade-in">
      <div className="space-y-8 md:space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gold-main">
              <div className="p-2 bg-gold-main/10 rounded-lg border border-gold-main/20">
                <Brain size={18} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Neural Reinforcement</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-serif font-bold text-white italic uppercase tracking-tighter leading-none">
              Flashcard <span className="text-gold-main not-italic">Vault</span>
            </h1>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex bg-slate-950 rounded-2xl p-1 border border-white/5">
                <button 
                    onClick={() => setActiveDeck('physics')}
                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeDeck === 'physics' ? 'bg-gold-main text-slate-950 shadow-gold' : 'text-white/40 hover:text-white'}`}
                >
                    Physics
                </button>
                <button 
                    onClick={() => setActiveDeck('artifacts')}
                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeDeck === 'artifacts' ? 'bg-gold-main text-slate-950 shadow-gold' : 'text-white/40 hover:text-white'}`}
                >
                    Visual Artifacts
                </button>
                <button 
                    onClick={() => setActiveDeck('custom')}
                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeDeck === 'custom' ? 'bg-gold-main text-slate-950 shadow-gold' : 'text-white/40 hover:text-white'}`}
                >
                    Custom
                </button>
            </div>
            <button 
                onClick={() => setViewMode(viewMode === 'manage' ? 'study' : 'manage')}
                className={`px-6 py-4 rounded-2xl border transition-all flex items-center gap-3 font-black uppercase text-[10px] tracking-widest ${
                    viewMode === 'manage' 
                    ? 'bg-gold-main text-slate-950 border-gold-main' 
                    : 'bg-slate-900 border-white/5 text-white/40 hover:text-white'
                }`}
            >
                {viewMode === 'manage' ? <GraduationCap size={16} /> : <Plus size={16} />}
                {viewMode === 'manage' ? 'Return to Study' : 'Manage Nodes'}
            </button>
            <button 
                onClick={shuffleCards}
                className="px-6 py-4 bg-slate-900 border border-white/5 rounded-2xl text-white/40 hover:text-gold-main transition-all flex items-center gap-3 font-black uppercase text-[10px] tracking-widest"
            >
                <Shuffle size={16} /> Shuffle
            </button>
          </div>
        </div>

        {viewMode === 'study' ? (
          <div className="space-y-12">
            {/* HUD Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gold-main/10 border border-gold-main/20 flex items-center justify-center text-gold-main shadow-gold">
                  <Database size={20} />
                </div>
                <div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-white/20">Active Node</div>
                  <div className="text-sm font-mono font-bold text-white">ID: {currentCard?.id.toUpperCase()}</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-white/20">
                  <span>Neural Sync Progress</span>
                  <span className="text-gold-main">{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative">
                  <motion.div 
                    className="h-full bg-gold-main shadow-gold relative z-10"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                  <div className="absolute inset-0 bg-gold-main/10 animate-pulse" />
                </div>
              </div>

              <div className="flex justify-end items-center gap-6">
                <div className="text-right">
                  <div className="text-[9px] font-black uppercase tracking-widest text-white/20">Mastery Rate</div>
                  <div className="text-sm font-mono font-bold text-gold-main">
                    {sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0}%
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                  <Target size={20} />
                </div>
              </div>
            </div>

            {/* Card Container */}
            {activeCards.length > 0 ? (
                <div className="relative h-[450px] md:h-[550px] w-full perspective-2000">
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                      key={currentCard?.id}
                      custom={direction}
                      initial={{ x: direction > 0 ? 1000 : -1000, opacity: 0, rotateY: direction > 0 ? 45 : -45 }}
                      animate={{ x: 0, opacity: 1, rotateY: 0 }}
                      exit={{ x: direction > 0 ? -1000 : 1000, opacity: 0, rotateY: direction > 0 ? -45 : 45 }}
                      transition={{ type: "spring", damping: 25, stiffness: 120 }}
                      className="absolute inset-0 w-full h-full"
                    >
                      <div 
                        className="relative w-full h-full transition-all duration-700 preserve-3d cursor-pointer"
                        style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                        onClick={handleFlip}
                      >
                        {/* Front Side */}
                        <div className="absolute inset-0 w-full h-full backface-hidden rounded-[3rem] md:rounded-[4rem] bg-slate-900/40 border-2 border-white/10 backdrop-blur-3xl p-8 md:p-16 flex flex-col items-center justify-center text-center shadow-3xl overflow-hidden group">
                          {/* Scanning Line */}
                          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                            <motion.div 
                              className="w-full h-1 bg-gold-main/50 shadow-[0_0_15px_rgba(181,148,78,0.5)]"
                              animate={{ top: ['0%', '100%'] }}
                              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                              style={{ position: 'absolute' }}
                            />
                          </div>

                          <div className="absolute top-10 left-12 flex items-center gap-4">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                narrate(currentCard?.question);
                              }}
                              disabled={isThinking}
                              className={`p-3 rounded-xl border transition-all ${isNarrating ? 'bg-red-500/10 border-red-500/20 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:border-white/30'}`}
                            >
                              {isThinking ? <Loader2 size={16} className="animate-spin" /> : isNarrating ? <VolumeX size={16} /> : <Volume2 size={16} />}
                            </button>
                            <div className="text-[10px] font-mono text-white/20 tracking-widest">AUDIO_LINK_ACTIVE</div>
                          </div>

                          <div className="absolute top-10 right-12">
                            <div className="text-[10px] font-mono text-gold-main/40 tracking-widest">NODE_{currentIndex + 1} / {activeCards.length}</div>
                          </div>

                          <div className="space-y-8 w-full relative z-10">
                            <div className="mx-auto w-fit">
                              <span className="px-6 py-2 bg-gold-main/10 border border-gold-main/20 rounded-full text-[10px] font-black uppercase tracking-widest text-gold-main shadow-gold">
                                {currentCard?.category}
                              </span>
                            </div>

                            {currentCard?.imageUrl && (
                                <motion.div 
                                  initial={{ scale: 0.9, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  className="w-full max-w-md mx-auto aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative group-hover:border-gold-main/30 transition-colors"
                                >
                                    <img 
                                        src={currentCard.imageUrl} 
                                        alt="Visual Reference" 
                                        className="w-full h-full object-cover"
                                        referrerPolicy="no-referrer"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                                </motion.div>
                            )}
                            
                            <h3 className="text-3xl md:text-5xl font-serif font-bold italic leading-tight text-white text-glow">
                              {currentCard?.question}
                            </h3>
                          </div>

                          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                            <div className="flex items-center gap-3 text-white/20">
                              <RotateCcw size={14} className="animate-spin-slow" />
                              <span className="text-[10px] font-black uppercase tracking-widest">Initialize Flip</span>
                            </div>
                            <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                className="h-full bg-gold-main/20"
                                animate={{ x: ['-100%', '100%'] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Back Side */}
                        <div 
                          className="absolute inset-0 w-full h-full backface-hidden rounded-[3rem] md:rounded-[4rem] bg-slate-900 border-2 border-gold-main/30 backdrop-blur-3xl p-8 md:p-16 flex flex-col items-center justify-center text-center shadow-gold-strong overflow-hidden"
                          style={{ transform: 'rotateY(180deg)' }}
                        >
                          <div className="absolute top-10 left-12">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                narrate(currentCard?.answer);
                              }}
                              disabled={isThinking}
                              className={`p-3 rounded-xl border transition-all ${isNarrating ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}`}
                            >
                              {isThinking ? <Loader2 size={16} className="animate-spin" /> : isNarrating ? <VolumeX size={16} /> : <Volume2 size={16} />}
                            </button>
                          </div>

                          <div className="space-y-10 w-full relative z-10">
                            <div className="mx-auto w-fit">
                              <span className="px-6 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-green-500">
                                Resolution Found
                              </span>
                            </div>

                            <h3 className="text-3xl md:text-5xl font-serif font-bold italic leading-tight text-gold-main text-glow">
                              {currentCard?.answer}
                            </h3>
                            
                            {currentCard?.mnemonic && (
                              <motion.div 
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="p-6 md:p-8 bg-gold-main/5 border border-gold-main/10 rounded-[2rem] max-w-lg mx-auto relative group"
                              >
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-slate-900 border border-gold-main/20 rounded-full text-[9px] font-black uppercase tracking-widest text-gold-main">
                                  Mnemonic Node
                                </div>
                                <p className="text-sm md:text-base text-slate-300 italic leading-relaxed">
                                  "{currentCard.mnemonic}"
                                </p>
                                <Sparkles className="absolute top-4 right-4 text-gold-main/20 group-hover:text-gold-main/40 transition-colors" size={20} />
                              </motion.div>
                            )}
                          </div>

                          <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
                            <div className="text-[10px] font-black uppercase tracking-widest text-white/20">Click to Re-Scan</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
            ) : (
                <div className="h-[400px] flex flex-col items-center justify-center text-center space-y-6 bg-slate-900/20 border border-white/5 rounded-[3rem]">
                    <Layers size={48} className="text-white/10" />
                    <div className="space-y-2">
                        <h3 className="text-2xl font-serif font-bold text-white italic">Vault Empty</h3>
                        <p className="text-slate-400 font-light italic">Initialize your first neural nodes in the management sector.</p>
                    </div>
                    <button onClick={() => setViewMode('manage')} className="px-8 py-4 bg-gold-main text-slate-950 rounded-2xl font-black uppercase tracking-widest text-[10px]">Create First Card</button>
                </div>
            )}

            {/* Controls */}
            {activeCards.length > 0 && (
                <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                <button 
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="hidden md:flex p-6 bg-white/5 border border-white/10 text-white/40 rounded-2xl hover:text-white hover:bg-white/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                >
                    <ChevronLeft size={24} />
                </button>

                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                  <button 
                      onClick={() => handleNext(false)}
                      className="w-full md:w-auto px-12 py-6 bg-slate-900/60 border border-white/10 text-white/60 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-500 transition-all flex items-center justify-center gap-3 active:scale-95 group"
                  >
                      <XCircle size={18} className="group-hover:animate-pulse" /> Still Learning
                  </button>
                  <button 
                      onClick={() => handleNext(true)}
                      className="w-full md:w-auto px-16 py-6 bg-gold-main text-slate-950 rounded-2xl font-black uppercase tracking-[0.3em] text-xs shadow-gold hover:shadow-gold-strong transition-all flex items-center justify-center gap-4 active:scale-95 group"
                  >
                      <CheckCircle2 size={18} className="group-hover:scale-110 transition-transform" /> Mastered Node
                  </button>
                </div>

                <button 
                    onClick={() => handleNext(false)}
                    disabled={currentIndex === activeCards.length - 1}
                    className="hidden md:flex p-6 bg-white/5 border border-white/10 text-white/40 rounded-2xl hover:text-white hover:bg-white/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                >
                    <ChevronRight size={24} />
                </button>
                </div>
            )}
          </div>
        ) : viewMode === 'manage' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-slide-up">
                {/* Creation Form */}
                <div className="lg:col-span-5 space-y-8">
                    <div className="p-8 md:p-12 bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] space-y-8">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-serif font-bold text-white italic uppercase">New Neural Node</h3>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Input term and definition</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gold-main uppercase tracking-widest">Term / Question</label>
                                <input 
                                    value={newQuestion}
                                    onChange={(e) => setNewQuestion(e.target.value)}
                                    placeholder="e.g. Axial Resolution"
                                    className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white font-serif italic focus:border-gold-main/50 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gold-main uppercase tracking-widest">Definition / Answer</label>
                                <textarea 
                                    value={newAnswer}
                                    onChange={(e) => setNewAnswer(e.target.value)}
                                    placeholder="e.g. Ability to distinguish reflectors parallel to the beam..."
                                    rows={4}
                                    className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white font-serif italic focus:border-gold-main/50 outline-none transition-all resize-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gold-main uppercase tracking-widest">Mnemonic (Optional)</label>
                                <input 
                                    value={newMnemonic}
                                    onChange={(e) => setNewMnemonic(e.target.value)}
                                    placeholder="e.g. LARRD"
                                    className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white font-serif italic focus:border-gold-main/50 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gold-main uppercase tracking-widest">Image URL (Optional)</label>
                                <input 
                                    value={newImageUrl}
                                    onChange={(e) => setNewImageUrl(e.target.value)}
                                    placeholder="https://..."
                                    className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white font-serif italic focus:border-gold-main/50 outline-none transition-all"
                                />
                            </div>

                            <button 
                                onClick={handleAddCard}
                                disabled={isSaving || !newQuestion || !newAnswer}
                                className="w-full py-6 bg-gold-main text-slate-950 rounded-2xl font-black uppercase tracking-widest text-xs shadow-gold hover:shadow-gold-strong transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                Save to Vault
                            </button>
                        </div>
                    </div>
                </div>

                {/* List of Custom Cards */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <h3 className="text-xl font-serif font-bold text-white italic uppercase">Custom Repository</h3>
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{(dbUser?.customFlashcards || []).length} Nodes</span>
                    </div>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {(dbUser?.customFlashcards || []).map((card: any) => (
                            <div key={card.id} className="p-6 bg-slate-900/40 border border-white/5 rounded-3xl flex items-center justify-between group hover:border-white/20 transition-all">
                                <div className="space-y-1">
                                    <h4 className="text-lg font-serif font-bold text-white italic">{card.question}</h4>
                                    <p className="text-xs text-slate-400 line-clamp-1 italic">{card.answer}</p>
                                </div>
                                <button 
                                    onClick={() => handleDeleteCard(card.id)}
                                    className="p-3 text-white/10 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                        {!(dbUser?.customFlashcards || []).length && (
                            <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-[3rem] space-y-4">
                                <Info className="mx-auto text-white/10" size={32} />
                                <p className="text-slate-500 font-light italic">No custom nodes detected in your neural link.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        ) : (
          <div className="py-12 md:py-24 space-y-12 animate-slide-up text-center">
            <div className="space-y-6">
              <div className="w-24 h-24 bg-gold-main/10 rounded-[2.5rem] flex items-center justify-center border-2 border-gold-main/30 mx-auto shadow-gold">
                <Trophy className="text-gold-main w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-4xl md:text-6xl font-serif font-bold text-white italic tracking-tighter uppercase">Session <span className="text-gold-main not-italic">Complete</span></h2>
                <p className="text-slate-400 text-lg md:text-xl font-light italic">Neural pathways have been reinforced.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="p-8 bg-slate-900/40 border border-white/5 rounded-3xl space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Accuracy</span>
                <div className="text-4xl font-serif font-bold text-white italic">{sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0}%</div>
              </div>
              <div className="p-8 bg-slate-900/40 border border-white/5 rounded-3xl space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Nodes Mastered</span>
                <div className="text-4xl font-serif font-bold text-gold-main italic">{sessionStats.correct}</div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <button 
                onClick={resetSession}
                className="w-full md:w-auto px-16 py-6 bg-gold-main text-slate-950 rounded-2xl font-black uppercase tracking-[0.4em] text-xs shadow-gold hover:shadow-gold-strong transition-all flex items-center justify-center gap-4 active:scale-95"
              >
                <RefreshCw size={18} /> Re-Initialize
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardVault;
