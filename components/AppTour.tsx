
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, X, Play, Info } from 'lucide-react';

interface TourStep {
  targetId: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface AppTourProps {
  steps: TourStep[];
  onComplete: () => void;
  isOpen: boolean;
}

const AppTour: React.FC<AppTourProps> = ({ steps, onComplete, isOpen }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isOpen && steps[currentStep]) {
      const updateRect = () => {
        const element = document.getElementById(steps[currentStep].targetId);
        if (element) {
          setTargetRect(element.getBoundingClientRect());
          setIsReady(true);
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (steps[currentStep].targetId === 'center') {
          setTargetRect(null);
          setIsReady(true);
        } else {
          setIsReady(false);
        }
      };

      updateRect();
      window.addEventListener('resize', updateRect);
      const interval = setInterval(updateRect, 500); // Poll for dynamic elements

      return () => {
        window.removeEventListener('resize', updateRect);
        clearInterval(interval);
      };
    }
  }, [isOpen, currentStep, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Backdrop with Hole */}
      <AnimatePresence>
        {isReady && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm pointer-events-auto"
            style={{
              clipPath: targetRect 
                ? `polygon(0% 0%, 0% 100%, ${targetRect.left}px 100%, ${targetRect.left}px ${targetRect.top}px, ${targetRect.right}px ${targetRect.top}px, ${targetRect.right}px ${targetRect.bottom}px, ${targetRect.left}px ${targetRect.bottom}px, ${targetRect.left}px 100%, 100% 100%, 100% 0%)`
                : 'none'
            }}
            onClick={onComplete}
          />
        )}
      </AnimatePresence>

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        {isReady && (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              left: targetRect ? (
                step.position === 'right' ? targetRect.right + 20 :
                step.position === 'left' ? targetRect.left - 340 :
                step.position === 'center' ? window.innerWidth / 2 - 160 :
                targetRect.left + (targetRect.width / 2) - 160
              ) : window.innerWidth / 2 - 160,
              top: targetRect ? (
                step.position === 'bottom' ? targetRect.bottom + 20 :
                step.position === 'top' ? targetRect.top - 200 :
                step.position === 'center' ? window.innerHeight / 2 - 100 :
                targetRect.top + (targetRect.height / 2) - 100
              ) : window.innerHeight / 2 - 100
            }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute w-[320px] bg-slate-900 border border-gold-main/30 rounded-3xl p-6 shadow-2xl pointer-events-auto shadow-gold/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gold-main/10 rounded-lg">
                  <Info size={14} className="text-gold-main" />
                </div>
                <span className="text-[10px] font-black text-gold-main uppercase tracking-widest">Step {currentStep + 1} of {steps.length}</span>
              </div>
              <button onClick={onComplete} className="text-white/20 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>

            <h3 className="text-xl font-serif font-bold text-white italic mb-2">{step.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 italic">
              {step.content}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {steps.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1 rounded-full transition-all duration-500 ${i === currentStep ? 'w-4 bg-gold-main' : 'w-1 bg-white/10'}`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                {currentStep > 0 && (
                  <button 
                    onClick={handlePrev}
                    className="p-2 bg-white/5 text-white/60 rounded-xl hover:bg-white/10 transition-all"
                  >
                    <ChevronLeft size={18} />
                  </button>
                )}
                <button 
                  onClick={handleNext}
                  className="flex items-center gap-2 px-4 py-2 bg-gold-main text-slate-950 rounded-xl font-black uppercase text-[10px] tracking-widest hover:shadow-gold transition-all"
                >
                  {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Arrow */}
            {targetRect && step.position !== 'center' && (
              <div 
                className={`absolute w-4 h-4 bg-slate-900 border-t border-l border-gold-main/30 rotate-45 ${
                  step.position === 'bottom' ? '-top-2 left-1/2 -translate-x-1/2' :
                  step.position === 'top' ? '-bottom-2 left-1/2 -translate-x-1/2 rotate-[225deg]' :
                  step.position === 'right' ? 'top-1/2 -left-2 -translate-y-1/2 -rotate-45' :
                  'top-1/2 -right-2 -translate-y-1/2 rotate-[135deg]'
                }`}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppTour;
