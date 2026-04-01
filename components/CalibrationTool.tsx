import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Target, GraduationCap, Heart, 
  Zap, Flame, Calendar, User, ArrowRight,
  CheckCircle2, Brain, Rocket, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CalibrationToolProps {
  onComplete: (plan: any) => void;
  initialData?: {
    userName?: string;
    birthDate?: string;
  };
}

const CalibrationTool: React.FC<CalibrationToolProps> = ({ onComplete, initialData }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(initialData?.userName || '');
  const [birthDate, setBirthDate] = useState(initialData?.birthDate || '');
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const calculatePlan = () => {
    setIsCalculating(true);
    
    // Simulate complex calculation
    setTimeout(() => {
      const date = new Date(birthDate);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const year = date.getFullYear();
      
      // Numerology-inspired calculation (Life Path Number style)
      const sumDigits = (num: number) => String(num).split('').reduce((acc, d) => acc + Number(d), 0);
      let lifePath = sumDigits(month) + sumDigits(day) + sumDigits(year);
      while (lifePath > 9 && lifePath !== 11 && lifePath !== 22 && lifePath !== 33) {
        lifePath = sumDigits(lifePath);
      }

      let style = "Visual-Spatial";
      let strength = "Pattern Recognition";
      let mission = "To illuminate the unseen through acoustic precision.";
      let focusArea = "Hemodynamics & Doppler";

      // Map Life Path numbers to learning archetypes
      switch (lifePath) {
        case 1:
          style = "The Pioneer (Kinesthetic)";
          strength = "Independent Discovery";
          mission = "To lead the clinical frontier with innovative diagnostic clarity.";
          focusArea = "Emerging Ultrasound Tech";
          break;
        case 2:
          style = "The Harmonizer (Auditory)";
          strength = "Collaborative Analysis";
          mission = "To bridge the gap between technology and patient empathy.";
          focusArea = "Patient Communication";
          break;
        case 3:
          style = "The Communicator (Visual)";
          strength = "Creative Synthesis";
          mission = "To transform complex acoustic data into actionable clinical stories.";
          focusArea = "Image Optimization";
          break;
        case 4:
          style = "The Architect (Logical)";
          strength = "Structural Precision";
          mission = "To build a foundation of absolute accuracy in every scan.";
          focusArea = "Physics Fundamentals";
          break;
        case 5:
          style = "The Catalyst (Dynamic)";
          strength = "Adaptive Learning";
          mission = "To thrive in the high-pressure environment of emergency diagnostics.";
          focusArea = "Emergency Sonography";
          break;
        case 6:
          style = "The Guardian (Nurturing)";
          strength = "Ethical Vigilance";
          mission = "To protect patient health through meticulous detail and care.";
          focusArea = "Obstetrics & Gynecology";
          break;
        case 7:
          style = "The Sage (Introspective)";
          strength = "Deep Theory";
          mission = "To master the profound physics that govern the acoustic realm.";
          focusArea = "Advanced Wave Physics";
          break;
        case 8:
          style = "The Strategist (Authoritative)";
          strength = "Systemic Mastery";
          mission = "To command the clinical suite with unparalleled technical expertise.";
          focusArea = "Vascular Hemodynamics";
          break;
        case 9:
          style = "The Visionary (Holistic)";
          strength = "Global Perspective";
          mission = "To elevate the standard of sonography on a global scale.";
          focusArea = "Public Health Imaging";
          break;
        case 11:
          style = "The Illuminator (Intuitive)";
          strength = "Subtle Detection";
          mission = "To see the artifacts and echoes that others overlook.";
          focusArea = "Artifact Analysis";
          break;
        default:
          style = "The Specialist";
          strength = "Focused Precision";
          mission = "To achieve clinical excellence through dedicated mastery.";
          focusArea = "General SPI Prep";
      }

      const plan = {
        style,
        strength,
        mission,
        dailyGoal: "45 Minutes",
        focusArea,
        impactPotential: "Global Clinical Leadership"
      };

      setResult(plan);
      setIsCalculating(false);
      setStep(3);
    }, 2500);
  };

  useEffect(() => {
    if (step === 2 && !isCalculating) {
      calculatePlan();
    }
  }, [step, isCalculating]);

  return (
    <div className="w-full max-w-4xl mx-auto p-8 md:p-12 bg-slate-950/80 border border-white/10 rounded-[3rem] shadow-2xl backdrop-blur-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-5"><Sparkles size={160} /></div>
      
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-gold-main">
                <div className="p-3 bg-gold-main/10 rounded-2xl border border-gold-main/20"><Target size={24} /></div>
                <h2 className="text-3xl font-serif font-bold text-white italic">Acoustic Calibration</h2>
              </div>
              <p className="text-slate-400 text-lg font-light leading-relaxed max-w-2xl">
                To maximize your learning potential, we must synchronize your identity with the EchoMaster matrix. This process creates a study plan unique to your neural frequency.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gold-main/60 ml-2">Full Clinical Name</label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-slate-900 border border-white/10 rounded-[1.5rem] px-14 py-5 text-white focus:border-gold-main/40 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gold-main/60 ml-2">Date of Origin (Birthdate)</label>
                <div className="relative">
                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                  <input 
                    type="date" 
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-[1.5rem] px-14 py-5 text-white focus:border-gold-main/40 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={() => setStep(2)}
              disabled={!name || !birthDate}
              className="w-full py-6 bg-gold-main text-slate-950 rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-gold hover:shadow-gold-strong transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Initiate Calibration <ArrowRight size={18} />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 space-y-12"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gold-main/20 blur-3xl animate-pulse"></div>
              <div className="w-32 h-32 rounded-full border-4 border-gold-main/20 border-t-gold-main animate-spin relative z-10"></div>
              <Brain className="absolute inset-0 m-auto text-gold-main animate-pulse" size={48} />
            </div>
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-serif font-bold text-white italic">Synchronizing Neural Pathways...</h3>
              <p className="text-gold-main/60 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Analyzing Identity Vectors</p>
            </div>
          </motion.div>
        )}

        {step === 3 && result && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8">
              <div className="space-y-2">
                <h2 className="text-4xl font-serif font-bold text-white italic">Calibration Complete</h2>
                <p className="text-gold-main/60 text-[10px] font-black uppercase tracking-[0.5em]">Optimized Study Plan Generated</p>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 bg-green-500/10 border border-green-500/20 rounded-full text-green-400">
                <CheckCircle2 size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">100% Synchronized</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ResultCard icon={Brain} label="Learning Style" value={result.style} />
              <ResultCard icon={Zap} label="Core Strength" value={result.strength} />
              <ResultCard icon={Target} label="Daily Commitment" value={result.dailyGoal} />
            </div>

            <div className="p-10 bg-white/[0.02] border border-white/10 rounded-[2.5rem] space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform"><Globe size={80} /></div>
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gold-main/10 rounded-lg border border-gold-main/20"><Rocket size={16} className="text-gold-main" /></div>
                <h4 className="text-xl font-serif font-bold text-white italic">Your World-Impact Mission</h4>
              </div>
              <p className="text-xl text-slate-300 font-light italic leading-relaxed border-l-2 border-gold-main/20 pl-8">
                "{result.mission}"
              </p>
              <div className="pt-4 flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-gold-main animate-pulse"></div>
                <p className="text-[9px] font-black text-gold-main/40 uppercase tracking-[0.3em]">Impact Potential: {result.impactPotential}</p>
              </div>
            </div>

            <button 
              onClick={() => onComplete(result)}
              className="w-full py-6 bg-white text-slate-950 rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-gold-main transition-all flex items-center justify-center gap-4"
            >
              Accept Plan & Begin Mastery <GraduationCap size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ResultCard = ({ icon: Icon, label, value }: any) => (
  <div className="p-8 bg-slate-900/50 border border-white/5 rounded-[2rem] space-y-4 hover:border-gold-main/20 transition-all">
    <div className="flex items-center gap-4">
      <div className="p-2 bg-white/5 rounded-lg text-gold-main"><Icon size={16} /></div>
      <span className="text-[9px] font-black uppercase tracking-widest text-white/30">{label}</span>
    </div>
    <div className="text-xl font-serif font-bold italic text-white leading-tight">{value}</div>
  </div>
);

export default CalibrationTool;
