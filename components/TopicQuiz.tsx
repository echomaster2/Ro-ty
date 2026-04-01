
import React, { useState } from 'react';
import { CheckCircle2, XCircle, ArrowRight, Info, Zap, Terminal, Brain, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { AssessmentQuestion } from '../data/courseContent';
import { useNarrator } from '../src/hooks/useNarrator';

interface TopicQuizProps {
  questions: AssessmentQuestion[];
  onComplete: () => void;
  onClose: () => void;
  onPlayCorrect: () => void;
  onPlayIncorrect: () => void;
}

const TopicQuiz: React.FC<TopicQuizProps> = ({ questions, onComplete, onClose, onPlayCorrect, onPlayIncorrect }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const { narrate, isNarrating, isThinking } = useNarrator();

  const currentQuestion = questions[currentIndex];
  const isCorrect = selectedOption === currentQuestion.correctAnswer;

  const handleOptionClick = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    setShowExplanation(true);
    
    if (idx === currentQuestion.correctAnswer) {
      onPlayCorrect();
    } else {
      onPlayIncorrect();
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setShowExplanation(false);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8 animate-fade-in">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(181,148,78,0.05)_0%,transparent_70%)] pointer-events-none"></div>
      
      <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-3xl overflow-hidden relative animate-slide-up flex flex-col max-h-[90vh]">
        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-white/5 relative">
          <div 
            className="h-full bg-gold-main shadow-gold transition-all duration-700" 
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>

        <div className="p-6 md:p-10 space-y-8 overflow-y-auto custom-scrollbar flex-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gold-main/10 rounded-xl border border-gold-main/20 text-gold-main">
                <Brain size={18} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Resonance Checksum</span>
                <p className="text-[9px] font-mono text-gold-main/60 uppercase">Question {currentIndex + 1} of {questions.length}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-white/20 hover:text-white transition-all">
              <XCircle size={20} />
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-gold-main/30">
                <Terminal size={14} />
                <span className="text-[9px] font-black uppercase tracking-[0.4em]">Query Node</span>
              </div>
              <button 
                onClick={() => narrate(currentQuestion.question)}
                disabled={isThinking}
                className={`p-2 rounded-lg border transition-all ${isNarrating ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}`}
              >
                {isThinking ? <Loader2 size={12} className="animate-spin" /> : isNarrating ? <VolumeX size={12} /> : <Volume2 size={12} />}
              </button>
            </div>
            <h3 className="text-xl md:text-3xl font-serif font-bold text-white italic leading-tight tracking-tight">
              {currentQuestion.question}
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isActuallyCorrect = idx === currentQuestion.correctAnswer;
              
              let btnStyle = "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-gold-main/40";
              if (isAnswered) {
                if (isActuallyCorrect) btnStyle = "bg-green-500/20 border-green-500 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.2)]";
                else if (isSelected) btnStyle = "bg-red-500/20 border-red-500 text-red-400";
                else btnStyle = "bg-white/2 opacity-30 border-white/5";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(idx)}
                  disabled={isAnswered}
                  className={`p-5 md:p-6 rounded-2xl border text-left text-sm font-medium transition-all relative overflow-hidden group ${btnStyle}`}
                >
                  <div className="flex items-center justify-between relative z-10">
                    <span className="flex-1 pr-4">{option}</span>
                    {isAnswered && isActuallyCorrect && <CheckCircle2 size={18} className="text-green-400 shrink-0" />}
                    {isAnswered && isSelected && !isActuallyCorrect && <XCircle size={18} className="text-red-400 shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>

          {showExplanation && (
            <div className="p-6 md:p-8 bg-gold-main/5 border border-gold-main/20 rounded-[2rem] animate-slide-up space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-gold-main">
                  <Info size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Faculty Feedback</span>
                </div>
                <button 
                  onClick={() => narrate(currentQuestion.explanation)}
                  disabled={isThinking}
                  className={`p-2 rounded-lg border transition-all ${isNarrating ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-gold-main/10 border-gold-main/20 text-gold-main hover:bg-gold-main/20'}`}
                >
                  {isThinking ? <Loader2 size={12} className="animate-spin" /> : isNarrating ? <VolumeX size={12} /> : <Volume2 size={12} />}
                </button>
              </div>
              <p className="text-sm md:text-base text-slate-200 italic leading-relaxed font-serif">
                {currentQuestion.explanation}
              </p>
            </div>
          )}
        </div>

        <div className="p-6 md:p-8 border-t border-white/5 bg-slate-950/50 backdrop-blur-md flex justify-end shrink-0">
          <button 
            onClick={handleNext}
            disabled={!isAnswered}
            className={`px-10 py-4.5 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] transition-all flex items-center gap-3 ${
              isAnswered 
                ? 'bg-gold-main text-slate-950 shadow-gold hover:shadow-[0_0_40px_rgba(181,148,78,0.5)] active:scale-95' 
                : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
            }`}
          >
            {currentIndex === questions.length - 1 ? 'Complete Resonance' : 'Next Query'} 
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopicQuiz;
