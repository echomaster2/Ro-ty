
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, Edit2, X, Check, AlertCircle, ChevronRight } from 'lucide-react';
import { useFirebase } from './FirebaseProvider';

const CountdownTimer: React.FC = () => {
  const { profile, updateProfile } = useFirebase();
  const [isEditing, setIsEditing] = useState(false);
  const [tempDate, setTempDate] = useState(profile?.examDate || '');
  const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number } | null>(null);

  useEffect(() => {
    if (!profile?.examDate) {
      setTimeLeft(null);
      return;
    }

    const calculateTimeLeft = () => {
      const difference = +new Date(profile.examDate) - +new Date();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [profile?.examDate]);

  const handleSave = async () => {
    if (tempDate) {
      await updateProfile({ examDate: tempDate });
      setIsEditing(false);
    }
  };

  if (!profile?.examDate && !isEditing) {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsEditing(true)}
        className="w-full p-6 bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[2rem] flex items-center justify-between group hover:border-gold-main/30 transition-all"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gold-main/10 rounded-xl border border-gold-main/20 text-gold-main">
            <Calendar size={20} />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-black uppercase tracking-widest text-white/40">Exam Protocol</h3>
            <p className="text-lg font-serif font-bold text-white italic">Set your target date</p>
          </div>
        </div>
        <div className="p-2 bg-white/5 rounded-lg text-white/20 group-hover:text-gold-main transition-colors">
          <ChevronRight size={20} />
        </div>
      </motion.button>
    );
  }

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="editing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-6 bg-slate-900/60 backdrop-blur-3xl border border-gold-main/30 rounded-[2rem] space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gold-main">Target Calibration</h3>
              <button onClick={() => setIsEditing(false)} className="text-white/20 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-1">Select Exam Date</label>
              <input 
                type="date" 
                value={tempDate}
                onChange={(e) => setTempDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gold-main/50 focus:outline-none transition-all"
              />
            </div>
            <button 
              onClick={handleSave}
              className="w-full py-3 bg-gold-main text-slate-950 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-gold hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Check size={14} /> Initialize Countdown
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="display"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] relative overflow-hidden group hover:border-gold-main/20 transition-all"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-main/5 blur-[50px] rounded-full -mr-16 -mt-16"></div>
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gold-main/10 rounded-lg border border-gold-main/20 text-gold-main">
                  <Clock size={16} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Board Readiness Clock</span>
              </div>
              <button 
                onClick={() => setIsEditing(true)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/20 hover:text-gold-main transition-all"
              >
                <Edit2 size={14} />
              </button>
            </div>

            {timeLeft ? (
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Days', value: timeLeft.days },
                  { label: 'Hrs', value: timeLeft.hours },
                  { label: 'Min', value: timeLeft.minutes },
                  { label: 'Sec', value: timeLeft.seconds }
                ].map((item, i) => (
                  <div key={i} className="text-center space-y-1">
                    <div className="text-2xl md:text-4xl font-serif font-bold text-white italic tracking-tighter">
                      {String(item.value).padStart(2, '0')}
                    </div>
                    <div className="text-[8px] font-black uppercase tracking-widest text-white/20">{item.label}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3 text-white/40 italic font-serif">
                <AlertCircle size={16} />
                <span>No target date synchronized.</span>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
              <div className="text-[9px] font-black uppercase tracking-widest text-white/20">
                Target: <span className="text-gold-main/60">{profile?.examDate ? new Date(profile.examDate).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CountdownTimer;
