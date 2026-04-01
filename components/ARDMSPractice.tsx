
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, ArrowRight, Brain, Trophy, RefreshCcw, ChevronRight, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { ardmsPracticeQuestions, ARDMSQuestion } from '../data/ardmsQuestions';
import { useNarrator } from '../src/hooks/useNarrator';

interface ARDMSPracticeProps {
  onClose: () => void;
}

const ARDMSPractice: React.FC<ARDMSPracticeProps> = ({ onClose }) => {
  const { narrate, isNarrating, isThinking } = useNarrator();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = ardmsPracticeQuestions[currentQuestionIndex];

  const handleOptionSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (selectedOption === null || isAnswered) return;
    
    setIsAnswered(true);
    if (selectedOption === currentQuestion.correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < ardmsPracticeQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setShowResults(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={onClose} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-main/10 flex items-center justify-center border border-gold-main/20">
              <Brain className="text-gold-main w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-white italic tracking-tight">ARDMS® SPI Practice Vault</h2>
              <p className="text-[10px] font-black text-gold-main/60 uppercase tracking-[0.2em]">Sonography Student Excellence Protocol</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          {!showResults ? (
            <div className="space-y-8">
              {/* Progress */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Question</span>
                  <span className="text-2xl font-serif font-bold text-gold-main italic">{currentQuestionIndex + 1}</span>
                  <span className="text-white/20 font-serif italic">/ {ardmsPracticeQuestions.length}</span>
                </div>
                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                  <span className="text-[10px] font-black text-gold-main uppercase tracking-widest">{currentQuestion.domain}</span>
                </div>
              </div>

              {/* Question */}
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-xl md:text-2xl font-serif text-white leading-tight">
                  {currentQuestion.question}
                </h3>
                <button 
                  onClick={() => narrate(currentQuestion.question)}
                  disabled={isThinking}
                  className={`p-3 rounded-xl border shrink-0 transition-all ${isNarrating ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-gold-main/10 border-gold-main/20 text-gold-main hover:bg-gold-main/20'}`}
                >
                  {isThinking ? <Loader2 size={16} className="animate-spin" /> : isNarrating ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
              </div>

              {/* Options */}
              <div className="grid gap-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedOption === index;
                  const isCorrect = isAnswered && index === currentQuestion.correctAnswer;
                  const isWrong = isAnswered && isSelected && index !== currentQuestion.correctAnswer;

                  return (
                    <button
                      key={index}
                      onClick={() => handleOptionSelect(index)}
                      disabled={isAnswered}
                      className={`
                        w-full p-4 md:p-5 rounded-2xl text-left transition-all border flex items-center justify-between group
                        ${isSelected ? 'bg-gold-main/10 border-gold-main/50' : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]'}
                        ${isCorrect ? 'bg-emerald-500/10 border-emerald-500/50' : ''}
                        ${isWrong ? 'bg-red-500/10 border-red-500/50' : ''}
                      `}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`
                          w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black transition-colors
                          ${isSelected ? 'bg-gold-main text-slate-950' : 'bg-white/5 text-white/40 group-hover:bg-white/10'}
                          ${isCorrect ? 'bg-emerald-500 text-white' : ''}
                          ${isWrong ? 'bg-red-500 text-white' : ''}
                        `}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className={`text-sm md:text-base ${isSelected ? 'text-white' : 'text-white/70'}`}>
                          {option}
                        </span>
                      </div>
                      {isCorrect && <CheckCircle2 className="text-emerald-500 w-5 h-5 shrink-0" />}
                      {isWrong && <AlertCircle className="text-red-500 w-5 h-5 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              <AnimatePresence>
                {isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-5 rounded-2xl border ${selectedOption === currentQuestion.correctAnswer ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 p-1 rounded-full ${selectedOption === currentQuestion.correctAnswer ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                          {selectedOption === currentQuestion.correctAnswer ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Clinical Rationale</p>
                          <p className="text-sm text-white/80 leading-relaxed font-serif italic">
                            {currentQuestion.explanation}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => narrate(currentQuestion.explanation)}
                        disabled={isThinking}
                        className={`p-2 rounded-lg border shrink-0 transition-all ${isNarrating ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-gold-main/10 border-gold-main/20 text-gold-main hover:bg-gold-main/20'}`}
                      >
                        {isThinking ? <Loader2 size={12} className="animate-spin" /> : isNarrating ? <VolumeX size={12} /> : <Volume2 size={12} />}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-8 py-10">
              <div className="relative">
                <div className="absolute inset-0 bg-gold-main/20 blur-3xl rounded-full" />
                <div className="relative w-32 h-32 rounded-full border-2 border-gold-main/30 flex items-center justify-center bg-slate-950">
                  <Trophy className="text-gold-main w-16 h-16" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-3xl font-serif font-bold text-white italic tracking-tight">Assessment Complete</h3>
                <p className="text-gold-main/60 text-sm font-black uppercase tracking-[0.3em]">Neural Integration Successful</p>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Score</p>
                  <p className="text-3xl font-serif font-bold text-white italic">{score} <span className="text-sm text-white/20">/ {ardmsPracticeQuestions.length}</span></p>
                </div>
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Accuracy</p>
                  <p className="text-3xl font-serif font-bold text-gold-main italic">{Math.round((score / ardmsPracticeQuestions.length) * 100)}%</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                <button
                  onClick={resetQuiz}
                  className="flex-1 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCcw size={14} />
                  Retry Vault
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-8 py-4 bg-gold-main text-slate-950 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  Exit Protocol
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!showResults && (
          <div className="px-6 py-4 border-t border-white/5 bg-white/[0.01] flex justify-between items-center">
            <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">
              {isAnswered ? 'Review Rationale' : 'Select an Option'}
            </div>
            <div className="flex gap-3">
              {!isAnswered ? (
                <button
                  onClick={handleSubmit}
                  disabled={selectedOption === null}
                  className={`
                    px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2
                    ${selectedOption !== null ? 'bg-gold-main text-slate-950 hover:scale-105' : 'bg-white/5 text-white/20 cursor-not-allowed'}
                  `}
                >
                  Submit Answer
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-8 py-3 bg-gold-main text-slate-950 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all hover:scale-105 flex items-center gap-2"
                >
                  {currentQuestionIndex === ardmsPracticeQuestions.length - 1 ? 'Finish' : 'Next Question'}
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ARDMSPractice;
