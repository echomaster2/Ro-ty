import React, { useState, useMemo } from 'react';
import { 
  Brain, 
  Settings2, 
  Play, 
  CheckCircle2, 
  Target, 
  Layers, 
  ArrowLeft,
  ChevronRight,
  Zap,
  Info,
  Terminal,
  XCircle,
  ArrowRight,
  History
} from 'lucide-react';
import { courseData, mockExamBank, AssessmentQuestion } from '../data/courseContent';

interface QuizGeneratorProps {
  onExit: () => void;
  onPlayCorrect: () => void;
  onPlayIncorrect: () => void;
}

type QuizState = 'config' | 'active' | 'results';

const QuizGenerator: React.FC<QuizGeneratorProps> = ({ onExit, onPlayCorrect, onPlayIncorrect }) => {
  const [state, setState] = useState<QuizState>('config');
  const [selectedModules, setSelectedModules] = useState<string[]>(courseData.map(m => m.id));
  const [questionCount, setQuestionCount] = useState(10);
  const [activeQuestions, setActiveQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isAnswered, setIsAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Configuration Logic
  const allAvailableQuestions = useMemo(() => {
    const questions: AssessmentQuestion[] = [];
    
    // Add questions from selected modules
    courseData.forEach(module => {
      if (selectedModules.includes(module.id)) {
        module.topics.forEach(topic => {
          if (topic.assessment) {
            questions.push(...topic.assessment);
          }
        });
      }
    });

    // Add relevant questions from mock bank if they match selected domains (optional, but let's just add all for now if any module is selected)
    // Or better, filter mock bank by domain if we had a mapping, but let's stick to module topics for precision
    
    return questions;
  }, [selectedModules]);

  const handleToggleModule = (id: string) => {
    setSelectedModules(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const startQuiz = () => {
    if (allAvailableQuestions.length === 0) return;
    
    const shuffled = [...allAvailableQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));
    
    setActiveQuestions(selected);
    setCurrentIndex(0);
    setAnswers({});
    setIsAnswered(false);
    setShowExplanation(false);
    setState('active');
  };

  const handleOptionClick = (idx: number) => {
    if (isAnswered) return;
    setAnswers(prev => ({ ...prev, [currentIndex]: idx }));
    setIsAnswered(true);
    setShowExplanation(true);
    
    if (idx === activeQuestions[currentIndex].correctAnswer) {
      onPlayCorrect();
    } else {
      onPlayIncorrect();
    }
  };

  const handleNext = () => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsAnswered(false);
      setShowExplanation(false);
    } else {
      setState('results');
    }
  };

  const score = useMemo(() => {
    return Object.entries(answers).reduce((acc, [idx, ans]) => {
      return acc + (activeQuestions[parseInt(idx)].correctAnswer === ans ? 1 : 0);
    }, 0);
  }, [answers, activeQuestions]);

  const percentage = Math.round((score / activeQuestions.length) * 100);

  // UI - Configuration
  if (state === 'config') {
    return (
      <div className="max-w-4xl mx-auto py-10 md:py-20 px-6 animate-fade-in">
        <div className="space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gold-main">
                <Settings2 size={20} />
                <span className="text-xs font-black uppercase tracking-[0.4em]">Neural Architect</span>
              </div>
              <h2 className="text-4xl md:text-7xl font-serif font-bold text-white italic tracking-tighter uppercase">
                Quiz <span className="text-gold-main not-italic">Generator</span>
              </h2>
              <p className="text-lg text-slate-400 font-light italic leading-relaxed max-w-xl">
                Configure your cognitive sync parameters. Select target domains and payload size for custom resonance testing.
              </p>
            </div>
            <button 
              onClick={onExit}
              className="px-6 py-3 bg-white/5 border border-white/10 text-white/40 hover:text-white rounded-xl transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest"
            >
              <ArrowLeft size={16} /> Return to Hub
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Topic Selection */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-white/60">
                  <Layers size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Select Target Sectors</span>
                </div>
                <button 
                  onClick={() => setSelectedModules(courseData.map(m => m.id))}
                  className="text-[10px] font-black text-gold-main uppercase tracking-widest hover:underline"
                >
                  Select All
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {courseData.map(module => (
                  <button
                    key={module.id}
                    onClick={() => handleToggleModule(module.id)}
                    className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                      selectedModules.includes(module.id) 
                        ? 'bg-gold-main/10 border-gold-main text-white shadow-gold-dim' 
                        : 'bg-white/[0.02] border-white/5 text-white/40 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Module {module.id.replace('m', '')}</p>
                        <h4 className="text-sm font-serif font-bold italic">{module.title.split('. ')[1]}</h4>
                      </div>
                      {selectedModules.includes(module.id) && <CheckCircle2 size={16} className="text-gold-main" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Parameters */}
            <div className="lg:col-span-4 space-y-8">
              <div className="p-8 bg-slate-900 border border-white/10 rounded-[2.5rem] space-y-8 shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-white/60">
                    <Target size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Sync Parameters</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-white/40">Question Payload</span>
                      <span className="text-gold-main">{questionCount} Nodes</span>
                    </div>
                    <input 
                      type="range" 
                      min="5" 
                      max="50" 
                      step="5"
                      value={questionCount}
                      onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                      className="w-full accent-gold-main h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] font-mono text-white/20">
                      <span>5</span>
                      <span>25</span>
                      <span>50</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-white/40">Available Pool</span>
                    <span className="text-white">{allAvailableQuestions.length} Nodes</span>
                  </div>
                  <button 
                    onClick={startQuiz}
                    disabled={selectedModules.length === 0 || allAvailableQuestions.length === 0}
                    className="w-full py-5 bg-gold-main text-slate-950 font-black rounded-2xl uppercase tracking-[0.3em] text-[11px] shadow-gold hover:shadow-gold-strong transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play size={16} /> Initiate Sync
                  </button>
                </div>
              </div>

              <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 bg-gold-main/10 rounded-xl flex items-center justify-center text-gold-main border border-gold-main/20">
                  <Zap size={20} />
                </div>
                <p className="text-[10px] text-slate-400 font-light italic leading-relaxed">
                  Payloads are randomized from the selected sectors to ensure maximum cognitive coverage.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // UI - Active Quiz
  if (state === 'active') {
    const currentQuestion = activeQuestions[currentIndex];
    const userSelection = answers[currentIndex];

    return (
      <div className="max-w-4xl mx-auto py-10 md:py-20 px-6 animate-fade-in">
        <div className="bg-slate-900 border border-white/10 rounded-[3rem] shadow-3xl overflow-hidden relative flex flex-col">
          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-white/5 relative">
            <div 
              className="h-full bg-gold-main shadow-gold transition-all duration-700" 
              style={{ width: `${((currentIndex + 1) / activeQuestions.length) * 100}%` }}
            ></div>
          </div>

          <div className="p-8 md:p-14 space-y-10">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gold-main/10 rounded-2xl border border-gold-main/20 text-gold-main">
                  <Brain size={24} />
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white/40">Custom Resonance Rig</span>
                  <p className="text-[10px] font-mono text-gold-main/60 uppercase">Node {currentIndex + 1} of {activeQuestions.length}</p>
                </div>
              </div>
              <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-mono text-white/40 uppercase tracking-widest">
                {currentQuestion.domain}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 text-gold-main/30">
                <Terminal size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Query Input</span>
              </div>
              <h3 className="text-2xl md:text-4xl font-serif font-bold text-white italic leading-tight tracking-tight">
                {currentQuestion.question}
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = userSelection === idx;
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
                    className={`p-6 md:p-8 rounded-[2rem] border text-left text-base font-medium transition-all relative overflow-hidden group ${btnStyle}`}
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <span className="flex-1 pr-6">{option}</span>
                      {isAnswered && isActuallyCorrect && <CheckCircle2 size={20} className="text-green-400 shrink-0" />}
                      {isAnswered && isSelected && !isActuallyCorrect && <XCircle size={20} className="text-red-400 shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {showExplanation && (
              <div className="p-8 md:p-10 bg-gold-main/5 border border-gold-main/20 rounded-[2.5rem] animate-slide-up space-y-4">
                <div className="flex items-center gap-3 text-gold-main">
                  <Info size={18} />
                  <span className="text-[11px] font-black uppercase tracking-widest">Logic Breakdown</span>
                </div>
                <p className="text-lg md:text-xl text-slate-200 italic leading-relaxed font-serif">
                  {currentQuestion.explanation}
                </p>
              </div>
            )}
          </div>

          <div className="p-8 md:p-10 border-t border-white/5 bg-slate-950/50 backdrop-blur-md flex justify-between items-center">
            <button 
              onClick={() => setState('config')}
              className="text-[10px] font-black text-white/20 uppercase tracking-widest hover:text-white transition-colors"
            >
              Abort Sync
            </button>
            <button 
              onClick={handleNext}
              disabled={!isAnswered}
              className={`px-12 py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] transition-all flex items-center gap-3 ${
                isAnswered 
                  ? 'bg-gold-main text-slate-950 shadow-gold hover:shadow-gold-strong active:scale-95' 
                  : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
              }`}
            >
              {currentIndex === activeQuestions.length - 1 ? 'Finalize Resonance' : 'Next Node'} 
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // UI - Results
  if (state === 'results') {
    return (
      <div className="max-w-4xl mx-auto py-10 md:py-20 px-6 animate-fade-in">
        <div className="bg-slate-900 border border-white/10 rounded-[4rem] p-10 md:p-20 space-y-12 relative overflow-hidden shadow-3xl text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(181,148,78,0.05)_0%,transparent_70%)] pointer-events-none"></div>
          
          <div className="space-y-6 relative z-10">
            <div className="w-24 h-24 bg-gold-main/10 rounded-[2rem] border border-gold-main/20 flex items-center justify-center text-gold-main mx-auto shadow-gold-dim">
              <Target size={48} />
            </div>
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-[0.5em] text-gold-main">Sync Report Finalized</span>
              <h2 className="text-5xl md:text-8xl font-serif font-bold text-white italic tracking-tighter uppercase">
                {percentage}% <span className="text-gold-main not-italic">Accuracy</span>
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl space-y-2">
              <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">Correct Nodes</p>
              <p className="text-3xl font-serif font-bold text-white italic">{score}</p>
            </div>
            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl space-y-2">
              <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">Total Payload</p>
              <p className="text-3xl font-serif font-bold text-white italic">{activeQuestions.length}</p>
            </div>
            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl space-y-2">
              <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">Sectors Tested</p>
              <p className="text-3xl font-serif font-bold text-white italic">{selectedModules.length}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <button 
              onClick={() => setState('config')}
              className="px-12 py-6 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-white/10 transition-all flex items-center justify-center gap-3"
            >
              <History size={18} /> New Configuration
            </button>
            <button 
              onClick={startQuiz}
              className="px-12 py-6 bg-gold-main text-slate-950 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-gold hover:shadow-gold-strong transition-all flex items-center justify-center gap-3"
            >
              <Zap size={18} /> Retry Payload
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default QuizGenerator;
