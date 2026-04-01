
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Shield, AlertCircle, CheckCircle2, 
  ArrowRight, Info, Search, Filter, 
  Play, BookOpen, Zap, Target,
  ChevronRight, ChevronLeft, Award,
  Upload, X, Save, RefreshCw, Volume2, VolumeX, Loader2
} from 'lucide-react';
import { useBranding } from './BrandingContext';
import { auth, storage, db, handleFirestoreError, OperationType } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { preCacheMedia } from '../src/lib/mediaCache';
import { useNarrator } from '../src/hooks/useNarrator';
import { useFirebase } from './FirebaseProvider';
import ImageUpload from './ImageUpload';

interface CaseStudy {
  id: string;
  title: string;
  difficulty: 'Novice' | 'Expert' | 'Master';
  image: string;
  description: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  physicsConcept: string;
}

const ClinicalCases: React.FC = () => {
  const { getOverride, updateOverride, saveOverrides } = useBranding();
  const [cases, setCases] = useState<CaseStudy[]>([]);
  const [activeCaseIdx, setActiveCaseIdx] = useState<number | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [showMediaUplink, setShowMediaUplink] = useState(false);
  const [showCaseEditor, setShowCaseEditor] = useState(false);
  const [editingCase, setEditingCase] = useState<Partial<CaseStudy> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const { narrate, isNarrating, isThinking } = useNarrator();
  const { gainXP } = useFirebase();

  const isAdmin = auth.currentUser?.email === 'latchmanrav@gmail.com';
  
  const DEFAULT_CASES: CaseStudy[] = [
    {
      id: 'case-1',
      title: 'The Shadow of the Stone',
      difficulty: 'Novice',
      image: 'https://picsum.photos/seed/gallstone/800/600',
      description: 'A 45-year-old patient presents with RUQ pain. You visualize a hyperechoic structure within the gallbladder lumen.',
      question: 'What is the primary acoustic artifact seen posterior to this structure?',
      options: [
        'Acoustic Enhancement',
        'Acoustic Shadowing',
        'Reverberation',
        'Mirror Image'
      ],
      correctIndex: 1,
      explanation: 'Acoustic shadowing occurs when sound encounters a highly attenuating structure (like a gallstone), leaving a dark region behind it.',
      physicsConcept: 'Attenuation & Reflection'
    },
    {
      id: 'case-2',
      title: 'The Ghost in the Liver',
      difficulty: 'Expert',
      image: 'https://picsum.photos/seed/liver-mirror/800/600',
      description: 'During a liver scan, you see what appears to be a second diaphragm or a lesion above the actual diaphragm.',
      question: 'Which artifact is likely responsible for this "duplicate" appearance?',
      options: [
        'Refraction',
        'Side Lobes',
        'Mirror Image',
        'Comet Tail'
      ],
      correctIndex: 2,
      explanation: 'Mirror image artifact occurs when sound reflects off a strong specular reflector (like the diaphragm) and is redirected toward another object.',
      physicsConcept: 'Specular Reflection'
    },
    {
      id: 'case-3',
      title: 'The Aliasing Anomaly',
      difficulty: 'Master',
      image: 'https://picsum.photos/seed/doppler-alias/800/600',
      description: 'You are performing a carotid Doppler. The spectral waveform shows the peak velocity "wrapping around" the baseline.',
      question: 'What is the most effective way to eliminate this artifact without changing the probe?',
      options: [
        'Decrease the PRF',
        'Increase the PRF',
        'Increase the Doppler Frequency',
        'Decrease the Doppler Angle'
      ],
      correctIndex: 1,
      explanation: 'Aliasing occurs when the Doppler shift exceeds the Nyquist limit (PRF/2). Increasing the PRF raises the limit and eliminates the wrap-around.',
      physicsConcept: 'Nyquist Limit & PRF'
    },
    {
      id: 'case-4',
      title: 'The Speed Error Shift',
      difficulty: 'Expert',
      image: 'https://picsum.photos/seed/speed-error/800/600',
      description: 'While scanning through a large fatty mass (lipoma), you notice that the structures posterior to the mass appear deeper than they actually are.',
      question: 'Why does this "step-off" artifact occur?',
      options: [
        'Sound travels faster in fat than soft tissue',
        'Sound travels slower in fat than soft tissue',
        'Fat causes excessive refraction',
        'Fat causes high attenuation'
      ],
      correctIndex: 1,
      explanation: 'Sound travels at ~1450 m/s in fat, which is slower than the 1540 m/s the machine assumes. This delay makes the machine place reflectors deeper on the screen.',
      physicsConcept: 'Propagation Speed'
    },
    {
      id: 'case-5',
      title: 'The ALARA Protocol',
      difficulty: 'Novice',
      image: 'https://picsum.photos/seed/safety/800/600',
      description: 'You are performing an early OB scan. You notice the Thermal Index (TI) is rising above 1.0.',
      question: 'According to the ALARA principle, what is your immediate priority?',
      options: [
        'Increase the Gain',
        'Decrease the Output Power',
        'Increase the PRF',
        'Switch to a higher frequency probe'
      ],
      correctIndex: 1,
      explanation: 'ALARA (As Low As Reasonably Achievable) dictates that output power should be minimized to reduce potential bioeffects, especially in sensitive tissues like a fetus.',
      physicsConcept: 'Bioeffects & Safety'
    }
  ];

  // Fetch cases from Firestore
  React.useEffect(() => {
    const q = query(collection(db, 'cases'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const firestoreCases = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as CaseStudy[];
      
      if (firestoreCases.length > 0) {
        setCases(firestoreCases);
      } else {
        setCases(DEFAULT_CASES);
      }
    }, (error) => {
      console.error("Error fetching cases:", error);
      setCases(DEFAULT_CASES);
    });

    return () => unsubscribe();
  }, []);

  const handleSaveCase = async () => {
    if (!editingCase || !editingCase.title) return;
    setIsSaving(true);
    try {
      const caseData = {
        ...editingCase,
        updatedAt: serverTimestamp(),
      };

      if (editingCase.id) {
        const docRef = doc(db, 'cases', editingCase.id);
        await updateDoc(docRef, caseData);
      } else {
        const docRef = collection(db, 'cases');
        await addDoc(docRef, {
          ...caseData,
          createdAt: serverTimestamp(),
        });
      }
      setShowCaseEditor(false);
      setEditingCase(null);
    } catch (error) {
      handleFirestoreError(error, editingCase.id ? OperationType.UPDATE : OperationType.CREATE, 'cases');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCase = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this case?')) return;
    try {
      await deleteDoc(doc(db, 'cases', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `cases/${id}`);
    }
  };

  React.useEffect(() => {
    const images = cases.map(c => c.image);
    preCacheMedia(images);
  }, [cases]);

  const activeCase = activeCaseIdx !== null ? cases[activeCaseIdx] : null;

  const dailyMissionId = React.useMemo(() => {
    if (cases.length === 0) return null;
    const day = new Date().getDate();
    return cases[day % cases.length].id;
  }, [cases]);

  const handleOptionSelect = (idx: number) => {
    if (showExplanation || !activeCase) return;
    setSelectedOption(idx);
    setShowExplanation(true);
    if (idx === activeCase.correctIndex) {
      setCompletedIds(prev => new Set(prev).add(activeCase.id));
      // Reward XP
      const isDaily = activeCase.id === dailyMissionId;
      gainXP(isDaily ? 250 : 100);
    }
  };

  const handleFileUpload = async (caseId: string, file: File) => {
    setUploadingId(caseId);
    try {
      const storageRef = ref(storage, `case-studies/${caseId}-${Date.now()}-${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      if (showCaseEditor && editingCase) {
        setEditingCase(prev => ({ ...prev, image: downloadURL }));
      } else {
        updateOverride(`${caseId}-image`, downloadURL, 'image', `Case ${caseId} Image`);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploadingId(null);
    }
  };

  const nextCase = () => {
    setSelectedOption(null);
    setShowExplanation(false);
    if (activeCaseIdx !== null && activeCaseIdx < cases.length - 1) {
      setActiveCaseIdx(activeCaseIdx + 1);
    } else {
      setActiveCaseIdx(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full p-4 md:p-12 animate-fade-in">
      <div className="space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gold-main">
              <div className="p-2 bg-gold-main/10 rounded-lg border border-gold-main/20">
                <Activity size={18} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Clinical Diagnostics</span>
              {isAdmin && (
                <button 
                  onClick={() => setShowMediaUplink(true)}
                  className="ml-4 flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-black uppercase tracking-widest hover:bg-gold-main hover:text-slate-950 transition-all"
                >
                  <Upload size={10} /> Media Uplink
                </button>
              )}
            </div>
            <h1 className="text-4xl md:text-7xl font-serif font-bold text-white italic uppercase tracking-tighter leading-none">
              Case <span className="text-gold-main not-italic">Studies</span>
            </h1>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/40 backdrop-blur-xl border border-white/5 p-4 rounded-3xl">
            <div className="flex -space-x-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center text-[10px] font-black text-white/40">
                  {i}
                </div>
              ))}
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Mastery Level</p>
              <p className="text-sm font-serif font-bold text-gold-main italic">{completedIds.size} / {cases.length} Resolved</p>
            </div>
          </div>
        </div>

        {!activeCase ? (
          <div className="space-y-8">
            {isAdmin && (
              <div className="flex justify-end">
                <button 
                  onClick={() => {
                    setEditingCase({
                      title: '',
                      difficulty: 'Novice',
                      image: '',
                      description: '',
                      question: '',
                      options: ['', '', '', ''],
                      correctIndex: 0,
                      explanation: '',
                      physicsConcept: ''
                    });
                    setShowCaseEditor(true);
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-gold-main text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-gold hover:shadow-gold-strong transition-all"
                >
                  <Zap size={14} /> Add New Case Study
                </button>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-slide-up">
              {cases.map((cs, idx) => (
                <div key={cs.id} className="group relative">
                  <button 
                    onClick={() => setActiveCaseIdx(idx)}
                    className="w-full relative bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] overflow-hidden text-left transition-all hover:border-gold-main/40 hover:translate-y-[-4px] shadow-2xl flex flex-col h-full"
                  >
                    <div className="aspect-video w-full relative overflow-hidden">
                      <img key={cs.image} src={cs.image} alt={cs.title} referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                      <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                        {cs.id === dailyMissionId && (
                          <span className="px-3 py-1 bg-gold-main text-slate-950 rounded-full text-[8px] font-black uppercase tracking-widest shadow-gold">
                            Daily Mission
                          </span>
                        )}
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                          cs.difficulty === 'Novice' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                          cs.difficulty === 'Expert' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
                          'bg-red-500/10 border-red-500/30 text-red-400'
                        }`}>
                          {cs.difficulty}
                        </span>
                      </div>
                    </div>
                    <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
                      <div className="space-y-3">
                        <h3 className="text-2xl font-serif font-bold text-white italic group-hover:text-gold-main transition-colors uppercase">{cs.title}</h3>
                        <p className="text-xs text-slate-400 font-light leading-relaxed line-clamp-2 italic">"{cs.description}"</p>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2 text-white/20">
                          <Target size={14} />
                          <span className="text-[9px] font-black uppercase tracking-widest">{cs.physicsConcept}</span>
                        </div>
                        {completedIds.has(cs.id) ? (
                          <CheckCircle2 size={18} className="text-green-500" />
                        ) : (
                          <ChevronRight size={18} className="text-gold-main group-hover:translate-x-1 transition-transform" />
                        )}
                      </div>
                    </div>
                  </button>
                  {isAdmin && (
                    <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCase(cs);
                          setShowCaseEditor(true);
                        }}
                        className="p-2 bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-xl text-white hover:text-gold-main transition-colors"
                      >
                        <RefreshCw size={14} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCase(cs.id);
                        }}
                        className="p-2 bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-xl text-white hover:text-red-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-fade-in">
            {/* Left: Case Content */}
            <div className="lg:col-span-7 space-y-10">
              <div className="rounded-[3rem] overflow-hidden border-2 border-white/5 shadow-3xl bg-slate-900/40 backdrop-blur-xl relative group">
                <img key={activeCase.image} src={activeCase.image} alt={activeCase.title} referrerPolicy="no-referrer" className="w-full h-auto opacity-80" />
                
                {/* Scanline Overlay */}
                <div className="absolute inset-0 pointer-events-none bg-scanline opacity-20 animate-scanline"></div>
                
                {/* Decorative Corners */}
                <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-gold-main/30 rounded-tl-[3rem]"></div>
                <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-gold-main/30 rounded-tr-[3rem]"></div>
                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-gold-main/30 rounded-bl-[3rem]"></div>
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-gold-main/30 rounded-br-[3rem]"></div>

                <div className="absolute top-6 left-6 flex gap-3">
                   <div className="bg-slate-950/80 backdrop-blur-md border border-gold-main/30 px-4 py-1.5 rounded-full flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold-main animate-pulse"></div>
                      <span className="text-[8px] font-black text-white uppercase tracking-[0.4em]">Clinical_Scan_Active</span>
                   </div>
                </div>
              </div>

              <div className="p-8 md:p-12 bg-slate-900/60 backdrop-blur-3xl border border-white/5 rounded-[3rem] space-y-8 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-gold-main">
                    <Info size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Case Briefing</span>
                  </div>
                  <button 
                    onClick={() => narrate(activeCase.description)}
                    disabled={isThinking}
                    className={`p-2 rounded-lg border transition-all ${isNarrating ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-white/5 border-white/10 text-white/20 hover:text-white'}`}
                  >
                    {isThinking ? <Loader2 size={12} className="animate-spin" /> : isNarrating ? <VolumeX size={12} /> : <Volume2 size={12} />}
                  </button>
                </div>
                <p className="text-lg md:text-2xl text-slate-100 font-serif font-light leading-relaxed italic border-l-2 border-gold-main/30 pl-8 py-2">
                  {activeCase.description}
                </p>
              </div>
            </div>

            {/* Right: Interaction */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-gold-main">
                    <Zap size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Diagnostic Challenge</span>
                  </div>
                  <button 
                    onClick={() => narrate(activeCase.question)}
                    disabled={isThinking}
                    className={`p-2 rounded-lg border transition-all ${isNarrating ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-white/5 border-white/10 text-white/20 hover:text-white'}`}
                  >
                    {isThinking ? <Loader2 size={12} className="animate-spin" /> : isNarrating ? <VolumeX size={12} /> : <Volume2 size={12} />}
                  </button>
                </div>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-white italic leading-tight uppercase">
                  {activeCase.question}
                </h2>
              </div>

              <div className="space-y-4">
                {activeCase.options.map((opt, idx) => {
                  const isCorrect = idx === activeCase.correctIndex;
                  const isSelected = selectedOption === idx;
                  
                  let stateClasses = 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/20 text-white/60';
                  if (showExplanation) {
                    if (isCorrect) stateClasses = 'bg-green-500/10 border-green-500/40 text-green-400';
                    else if (isSelected) stateClasses = 'bg-red-500/10 border-red-500/40 text-red-400';
                    else stateClasses = 'bg-white/[0.01] border-transparent text-white/10 grayscale';
                  }

                  return (
                    <button
                      key={idx}
                      disabled={showExplanation}
                      onClick={() => handleOptionSelect(idx)}
                      className={`w-full p-6 rounded-2xl border text-left transition-all duration-500 flex items-center gap-5 group ${stateClasses}`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                        showExplanation && isCorrect ? 'bg-green-500/20 border-green-500/40' : 
                        showExplanation && isSelected ? 'bg-red-500/20 border-red-500/40' : 
                        'bg-white/5 border-white/10'
                      }`}>
                        <span className="text-xs font-mono font-bold">{String.fromCharCode(65 + idx)}</span>
                      </div>
                      <span className="text-sm md:text-base font-serif font-bold italic">{opt}</span>
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {showExplanation && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 bg-slate-900/80 border border-white/10 rounded-3xl space-y-6 shadow-2xl"
                  >
                    <div className="flex items-center gap-3">
                       {selectedOption === activeCase.correctIndex ? (
                         <div className="flex items-center gap-3 text-green-400">
                           <Award size={20} />
                           <span className="text-[10px] font-black uppercase tracking-widest">Diagnostic Accuracy: 100%</span>
                         </div>
                       ) : (
                         <div className="flex items-center gap-3 text-red-400">
                           <AlertCircle size={20} />
                           <span className="text-[10px] font-black uppercase tracking-widest">Diagnostic Refinement Required</span>
                         </div>
                       )}
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed italic">
                      {activeCase.explanation}
                    </p>
                    <button 
                      onClick={nextCase}
                      className="w-full py-5 bg-gold-main text-slate-950 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-gold hover:shadow-gold-strong transition-all flex items-center justify-center gap-3"
                    >
                      Continue Traversal <ArrowRight size={16} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
      {/* Media Uplink Modal */}
      <AnimatePresence>
        {showMediaUplink && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMediaUplink(false)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[3rem] overflow-hidden shadow-3xl"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gold-main/10 rounded-2xl border border-gold-main/20 text-gold-main">
                    <Upload size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-bold text-white italic uppercase tracking-tight">Media Uplink <span className="text-gold-main not-italic">Portal</span></h2>
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Override Case Study Visuals</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={async () => {
                      const { clearMediaCache } = await import('../src/lib/mediaCache');
                      await clearMediaCache();
                      window.location.reload();
                    }}
                    className="p-3 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-gold-main"
                    title="Clear Media Cache"
                  >
                    <RefreshCw size={18} />
                  </button>
                  <button onClick={() => setShowMediaUplink(false)} className="p-3 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-8 max-h-[60vh] overflow-y-auto space-y-8 custom-scrollbar">
                {DEFAULT_CASES.map((cs) => (
                  <div key={cs.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">{cs.title}</label>
                      <span className="text-[8px] font-mono text-gold-main/40 uppercase tracking-tighter">{cs.id}</span>
                    </div>
                    <div className="relative group flex gap-3">
                      <div className="flex-1 relative">
                        <input 
                          type="text"
                          value={getOverride(`${cs.id}-image`, '')}
                          placeholder="Enter direct image URL (e.g. https://...)"
                          onChange={(e) => updateOverride(`${cs.id}-image`, e.target.value, 'image', `${cs.title} Image`)}
                          className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-white/10 focus:border-gold-main/40 focus:ring-1 focus:ring-gold-main/40 transition-all outline-none"
                        />
                        {getOverride(`${cs.id}-image`, '') && (
                          <button 
                            onClick={() => updateOverride(`${cs.id}-image`, '', 'image', `${cs.title} Image`)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/20 hover:text-red-400"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                      <div className="relative flex gap-2">
                        {getOverride(`${cs.id}-image`, '') && (
                          <div className="w-14 h-14 rounded-2xl border border-white/10 overflow-hidden bg-slate-950">
                            <img 
                              src={getOverride(`${cs.id}-image`, '')} 
                              alt="Preview" 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}
                        <div className="relative">
                          <input 
                            type="file"
                            id={`file-${cs.id}`}
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(cs.id, file);
                            }}
                          />
                          <label 
                            htmlFor={`file-${cs.id}`}
                            className={`flex items-center justify-center w-14 h-14 rounded-2xl border border-white/10 bg-white/5 text-white/40 hover:text-gold-main hover:border-gold-main/40 hover:bg-gold-main/10 transition-all cursor-pointer ${uploadingId === cs.id ? 'animate-pulse pointer-events-none' : ''}`}
                          >
                            {uploadingId === cs.id ? <RefreshCw size={20} className="animate-spin" /> : <Upload size={20} />}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-8 bg-white/[0.02] border-t border-white/5 flex gap-4">
                <button 
                  onClick={() => setShowMediaUplink(false)}
                  className="flex-1 py-4 border border-white/10 rounded-2xl text-[10px] font-black text-white/40 uppercase tracking-widest hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    setIsSaving(true);
                    try {
                      await saveOverrides();
                      setShowMediaUplink(false);
                    } catch (e) {
                      console.error(e);
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  disabled={isSaving}
                  className="flex-[2] py-4 bg-gold-main text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-gold hover:shadow-gold-strong transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                  Synchronize Overrides
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showCaseEditor && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCaseEditor(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-white/10 rounded-[3rem] shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between sticky top-0 bg-slate-900/80 backdrop-blur-md z-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gold-main/10 rounded-2xl border border-gold-main/20 text-gold-main">
                    <Zap size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-white italic uppercase">
                      {editingCase?.id ? 'Edit Case Study' : 'New Case Study'}
                    </h2>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Clinical Protocol Configuration</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowCaseEditor(false)}
                  className="p-3 hover:bg-white/5 rounded-2xl transition-colors text-white/40 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 md:p-12 space-y-10">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gold-main uppercase tracking-widest ml-1">Case Title</label>
                    <input 
                      type="text"
                      value={editingCase?.title || ''}
                      onChange={(e) => setEditingCase(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. The Shadow in the Vessel"
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/10 focus:border-gold-main/40 focus:ring-1 focus:ring-gold-main/40 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gold-main uppercase tracking-widest ml-1">Difficulty Level</label>
                    <div className="flex gap-2">
                      {['Novice', 'Expert', 'Master'].map((level) => (
                        <button
                          key={level}
                          onClick={() => setEditingCase(prev => ({ ...prev, difficulty: level as any }))}
                          className={`flex-1 py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                            editingCase?.difficulty === level 
                              ? 'bg-gold-main border-gold-main text-slate-950 shadow-gold' 
                              : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gold-main uppercase tracking-widest ml-1">Clinical Imaging</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4">
                      <input 
                        type="text"
                        value={editingCase?.image || ''}
                        onChange={(e) => setEditingCase(prev => ({ ...prev, image: e.target.value }))}
                        placeholder="Direct Image URL"
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/10 focus:border-gold-main/40 focus:ring-1 focus:ring-gold-main/40 transition-all outline-none"
                      />
                      <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-white/5"></div>
                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">OR</span>
                        <div className="h-px flex-1 bg-white/5"></div>
                      </div>
                      <ImageUpload 
                        onUploadComplete={(url) => setEditingCase(prev => ({ ...prev, image: url }))}
                        folder="case-studies"
                        className="border-dashed border-2 border-white/10 hover:border-gold-main/40 transition-all rounded-[2rem]"
                      />
                    </div>
                    <div className="aspect-video md:aspect-square bg-slate-950 rounded-[2rem] border border-white/5 overflow-hidden relative group">
                      {editingCase?.image ? (
                        <img 
                          src={editingCase.image} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/10 gap-3">
                          <Activity size={48} strokeWidth={1} />
                          <span className="text-[8px] font-black uppercase tracking-widest">No Image Linked</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gold-main uppercase tracking-widest ml-1">Case Briefing (Description)</label>
                    <textarea 
                      value={editingCase?.description || ''}
                      onChange={(e) => setEditingCase(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/10 focus:border-gold-main/40 focus:ring-1 focus:ring-gold-main/40 transition-all outline-none resize-none"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gold-main uppercase tracking-widest ml-1">Diagnostic Question</label>
                    <input 
                      type="text"
                      value={editingCase?.question || ''}
                      onChange={(e) => setEditingCase(prev => ({ ...prev, question: e.target.value }))}
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/10 focus:border-gold-main/40 focus:ring-1 focus:ring-gold-main/40 transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-6">
                  <label className="text-[10px] font-black text-gold-main uppercase tracking-widest ml-1">Diagnostic Options</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(editingCase?.options || ['', '', '', '']).map((opt, idx) => (
                      <div key={idx} className="relative group">
                        <input 
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...(editingCase?.options || ['', '', '', ''])];
                            newOpts[idx] = e.target.value;
                            setEditingCase(prev => ({ ...prev, options: newOpts }));
                          }}
                          placeholder={`Option ${idx + 1}`}
                          className={`w-full bg-slate-950 border rounded-2xl px-6 py-4 text-white placeholder:text-white/10 focus:ring-1 transition-all outline-none ${
                            editingCase?.correctIndex === idx 
                              ? 'border-gold-main/60 focus:border-gold-main focus:ring-gold-main' 
                              : 'border-white/10 focus:border-white/30 focus:ring-white/30'
                          }`}
                        />
                        <button
                          onClick={() => setEditingCase(prev => ({ ...prev, correctIndex: idx }))}
                          className={`absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${
                            editingCase?.correctIndex === idx
                              ? 'bg-gold-main text-slate-950'
                              : 'bg-white/5 text-white/20 hover:text-white'
                          }`}
                        >
                          {editingCase?.correctIndex === idx ? 'Correct' : 'Mark Correct'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Explanation & Concept */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gold-main uppercase tracking-widest ml-1">Clinical Explanation</label>
                    <textarea 
                      value={editingCase?.explanation || ''}
                      onChange={(e) => setEditingCase(prev => ({ ...prev, explanation: e.target.value }))}
                      rows={3}
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/10 focus:border-gold-main/40 focus:ring-1 focus:ring-gold-main/40 transition-all outline-none resize-none"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gold-main uppercase tracking-widest ml-1">Physics Concept</label>
                    <input 
                      type="text"
                      value={editingCase?.physicsConcept || ''}
                      onChange={(e) => setEditingCase(prev => ({ ...prev, physicsConcept: e.target.value }))}
                      placeholder="e.g. Acoustic Impedance"
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/10 focus:border-gold-main/40 focus:ring-1 focus:ring-gold-main/40 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="p-8 bg-white/[0.02] border-t border-white/5 flex gap-4 sticky bottom-0 backdrop-blur-md">
                <button 
                  onClick={() => setShowCaseEditor(false)}
                  className="flex-1 py-4 border border-white/10 rounded-2xl text-[10px] font-black text-white/40 uppercase tracking-widest hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveCase}
                  disabled={isSaving || !editingCase?.title}
                  className="flex-[2] py-4 bg-gold-main text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-gold hover:shadow-gold-strong transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                  {editingCase?.id ? 'Update Case Protocol' : 'Deploy Case Protocol'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClinicalCases;
