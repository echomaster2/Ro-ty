
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Timer, ChevronLeft, ChevronRight, Flag, 
  CheckCircle2, AlertCircle, Award, X,
  LayoutGrid, List, ArrowRight, Save,
  RotateCcw, ShieldCheck, Target, BarChart3,
  Volume2, VolumeX, Loader2, Calculator, Info,
  HelpCircle, Search
} from 'lucide-react';
import { AssessmentQuestion } from '../data/courseContent';
import { spiMockExamQuestions } from '../data/spiMockExam';
import { useNarrator } from '../src/hooks/useNarrator';

interface MockExamProps {
  onComplete: (score: number, domainBreakdown: Record<string, number>) => void;
  onExit: () => void;
}

const EXAM_TIME_LIMIT = 120 * 60; // 120 minutes in seconds

const MockExam: React.FC<MockExamProps> = ({ onComplete, onExit }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(EXAM_TIME_LIMIT);
  const [isFinished, setIsFinished] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcInput, setCalcInput] = useState('');
  const [calcResult, setCalcResult] = useState<string | null>(null);
  const { narrate, isNarrating, isThinking } = useNarrator();

  // Use the full 110 question bank for the mock exam
  const questions = useMemo(() => {
    return [...spiMockExamQuestions].sort(() => Math.random() - 0.5);
  }, []);

  useEffect(() => {
    if (isFinished) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          finishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isFinished]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (optionIdx: number) => {
    setAnswers(prev => ({ ...prev, [currentIdx]: optionIdx }));
  };

  const toggleFlag = () => {
    setFlagged(prev => {
      const next = new Set(prev);
      if (next.has(currentIdx)) next.delete(currentIdx);
      else next.add(currentIdx);
      return next;
    });
  };

  const finishExam = () => {
    setIsFinished(true);
    
    // Calculate score and breakdown
    let correctCount = 0;
    const breakdown: Record<string, { correct: number, total: number }> = {};

    questions.forEach((q, idx) => {
      const domain = q.domain || 'General';
      if (!breakdown[domain]) breakdown[domain] = { correct: 0, total: 0 };
      breakdown[domain].total++;

      if (answers[idx] === q.correctAnswer) {
        correctCount++;
        breakdown[domain].correct++;
      }
    });

    const finalScore = Math.round((correctCount / questions.length) * 100);
    const finalBreakdown: Record<string, number> = {};
    Object.entries(breakdown).forEach(([domain, stats]) => {
      finalBreakdown[domain] = Math.round((stats.correct / stats.total) * 100);
    });

    onComplete(finalScore, finalBreakdown);
  };

  const progress = Math.round((Object.keys(answers).length / questions.length) * 100);

  const handleCalc = (val: string) => {
    if (val === '=') {
      try {
        // Simple eval-like logic for basic math
        const res = eval(calcInput.replace(/[^-+/*0-9.]/g, ''));
        setCalcResult(res.toString());
        setCalcInput(res.toString());
      } catch (e) {
        setCalcResult('Error');
      }
    } else if (val === 'C') {
      setCalcInput('');
      setCalcResult(null);
    } else {
      setCalcInput(prev => prev + val);
    }
  };

  if (isFinished) {
    const score = Math.round((questions.filter((q, i) => answers[i] === q.correctAnswer).length / questions.length) * 100);
    const passed = score >= 75;

    return (
      <div className="fixed inset-0 bg-[#001529] overflow-y-auto z-[2000] flex flex-col">
        {/* Pearson VUE Results Header */}
        <div className="bg-[#003366] text-white p-4 flex justify-between items-center border-b border-white/10">
          <div className="flex items-center gap-4">
            <ShieldCheck className="text-gold-main" size={24} />
            <h1 className="text-lg font-bold tracking-tight">Official SPI Simulation Score Report</h1>
          </div>
          <div className="text-xs opacity-60">Candidate: {onExit ? 'Simulation User' : 'Anonymous'}</div>
        </div>

        <div className="flex-1 max-w-5xl mx-auto w-full p-8 space-y-8 pb-24">
          <div className="bg-white rounded-lg shadow-2xl overflow-hidden border border-slate-200">
            <div className={`p-12 text-center space-y-6 ${passed ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className={`w-40 h-40 mx-auto rounded-full flex flex-col items-center justify-center border-8 ${passed ? 'border-green-500 text-green-600' : 'border-red-500 text-red-600'} bg-white shadow-xl`}>
                <span className="text-5xl font-black">{score}</span>
                <span className="text-xs font-bold uppercase tracking-widest opacity-60">Scaled Score</span>
              </div>
              
              <div className="space-y-2">
                <h2 className={`text-4xl font-bold tracking-tighter uppercase ${passed ? 'text-green-700' : 'text-red-700'}`}>
                  {passed ? 'PASS' : 'FAIL'}
                </h2>
                <p className="text-slate-600 font-medium max-w-md mx-auto">
                  {passed 
                    ? 'Congratulations! You have met the minimum requirements for board certification.' 
                    : 'Your performance did not meet the minimum standard for certification at this time.'}
                </p>
              </div>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 border-y border-slate-200">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Time Elapsed</p>
                <p className="text-2xl font-mono font-bold text-slate-800">{formatTime(EXAM_TIME_LIMIT - timeLeft)}</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Questions Answered</p>
                <p className="text-2xl font-mono font-bold text-slate-800">{Object.keys(answers).length} / {questions.length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Accuracy Rate</p>
                <p className="text-2xl font-mono font-bold text-slate-800">{Math.round((Object.keys(answers).length / questions.length) * 100)}%</p>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <List size={20} className="text-gold-main" />
                Domain Performance Breakdown
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['Fundamentals', 'Instrumentation', 'Doppler', 'Artifacts', 'Transducers'].map(domain => {
                  const domainQuestions = questions.filter(q => q.domain === domain);
                  if (domainQuestions.length === 0) return null;
                  const domainCorrect = domainQuestions.filter((q, i) => {
                    const originalIdx = questions.indexOf(q);
                    return answers[originalIdx] === q.correctAnswer;
                  }).length;
                  const domainScore = Math.round((domainCorrect / domainQuestions.length) * 100);
                  
                  return (
                    <div key={domain} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                      <span className="font-medium text-slate-700">{domain}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className={`h-full ${domainScore >= 75 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${domainScore}%` }} />
                        </div>
                        <span className="text-sm font-bold font-mono">{domainScore}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Question Review</h3>
              <span className="text-xs text-slate-500">Review your responses and correct answers</span>
            </div>
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto custom-scrollbar">
              {questions.map((q, i) => (
                <div key={i} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${answers[i] === q.correctAnswer ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {answers[i] === q.correctAnswer ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    </div>
                    <div className="space-y-3">
                      <p className="font-medium text-slate-800 leading-relaxed">{q.question}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="text-sm">
                          <span className="text-slate-400 block mb-1">Your Answer:</span>
                          <span className={`font-bold ${answers[i] === q.correctAnswer ? 'text-green-600' : 'text-red-600'}`}>
                            {answers[i] !== undefined ? q.options[answers[i]] : 'No Answer'}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-slate-400 block mb-1">Correct Answer:</span>
                          <span className="font-bold text-slate-800">{q.options[q.correctAnswer]}</span>
                        </div>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-xs text-blue-800 leading-relaxed italic">
                          <span className="font-bold uppercase mr-2">Rationale:</span>
                          {q.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results Footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 flex justify-center gap-4 shadow-2xl">
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-gold-main text-slate-950 rounded-lg font-bold uppercase tracking-widest text-xs shadow-lg hover:brightness-110 transition-all flex items-center gap-2"
          >
            <RotateCcw size={16} /> Retake Simulation
          </button>
          <button 
            onClick={onExit}
            className="px-8 py-3 bg-slate-800 text-white rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-slate-900 transition-all flex items-center gap-2"
          >
            Exit to Dashboard <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#F0F2F5] flex flex-col z-[1000] overflow-hidden font-sans">
      {/* Pearson VUE Header */}
      <div className="bg-[#003366] text-white p-3 flex justify-between items-center shadow-md border-b-4 border-gold-main/20">
        <div className="flex items-center gap-4">
          <div className="bg-white p-1 rounded">
            <ShieldCheck className="text-[#003366]" size={20} />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight uppercase">ARDMS SPI Simulation</h1>
            <p className="text-[10px] opacity-60 font-medium">Pearson VUE Professional Testing</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] opacity-60 uppercase font-bold tracking-tighter">Time Remaining</span>
            <div className={`font-mono text-xl font-bold ${timeLeft < 300 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
              {formatTime(timeLeft)}
            </div>
          </div>
          <div className="h-8 w-px bg-white/10"></div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] opacity-60 uppercase font-bold tracking-tighter">Question</span>
            <div className="font-mono text-xl font-bold">
              {currentIdx + 1} of {questions.length}
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-slate-200 p-2 flex justify-between items-center px-6 shadow-sm">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowCalculator(!showCalculator)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded border transition-all text-xs font-bold ${showCalculator ? 'bg-gold-main text-slate-950 border-gold-main' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
          >
            <Calculator size={14} /> Calculator
          </button>
          <button 
            className="flex items-center gap-2 px-4 py-1.5 rounded border bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold"
          >
            <Info size={14} /> Exhibit
          </button>
          <button 
            onClick={() => setShowGrid(!showGrid)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded border transition-all text-xs font-bold ${showGrid ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
          >
            {showGrid ? <List size={14} /> : <LayoutGrid size={14} />} Review
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={toggleFlag}
            className={`flex items-center gap-2 px-4 py-1.5 rounded border transition-all text-xs font-bold ${flagged.has(currentIdx) ? 'bg-red-500 text-white border-red-500' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
          >
            <Flag size={14} fill={flagged.has(currentIdx) ? 'white' : 'none'} />
            {flagged.has(currentIdx) ? 'Flagged for Review' : 'Flag for Review'}
          </button>
          <div className="h-6 w-px bg-slate-200"></div>
          <button 
            onClick={() => narrate(questions[currentIdx].question)}
            className={`p-2 rounded border transition-all ${isNarrating ? 'bg-red-50 text-red-500 border-red-200' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'}`}
          >
            {isNarrating ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex relative">
        {/* Question Container */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-[#F0F2F5] custom-scrollbar">
          {!showGrid ? (
            <div className="max-w-4xl mx-auto space-y-12">
              <div className="bg-white p-10 rounded shadow-sm border border-slate-200 min-h-[200px] relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#003366]"></div>
                <h2 className="text-2xl font-medium text-slate-800 leading-relaxed">
                  {questions[currentIdx].question}
                </h2>
              </div>

              <div className="space-y-4">
                {questions[currentIdx].options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className={`w-full p-6 rounded border-2 text-left transition-all flex items-center gap-6 group ${
                      answers[currentIdx] === idx 
                        ? 'bg-blue-50 border-[#003366] text-[#003366] shadow-md' 
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                      answers[currentIdx] === idx ? 'bg-[#003366] border-[#003366] text-white' : 'bg-white border-slate-200 text-slate-400'
                    }`}>
                      <span className="text-sm font-bold">{String.fromCharCode(65 + idx)}</span>
                    </div>
                    <span className="text-lg font-medium">{opt}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden">
              <div className="p-6 bg-slate-800 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <LayoutGrid size={20} />
                  <h2 className="text-lg font-bold">Review Screen</h2>
                </div>
                <div className="flex gap-4 text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-sm"></div> Answered
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-white border border-slate-400 rounded-sm"></div> Unanswered
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-sm"></div> Flagged
                  </div>
                </div>
              </div>
              <div className="p-8 grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-3">
                {questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setCurrentIdx(i); setShowGrid(false); }}
                    className={`aspect-square rounded border-2 flex flex-col items-center justify-center gap-1 transition-all relative ${
                      currentIdx === i ? 'border-[#003366] bg-blue-50 text-[#003366]' :
                      answers[i] !== undefined ? 'border-blue-500 bg-blue-500 text-white' :
                      'border-slate-200 bg-white text-slate-400 hover:border-slate-400'
                    }`}
                  >
                    <span className="text-xs font-bold">{i + 1}</span>
                    {flagged.has(i) && <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border-2 border-white"></div>}
                  </button>
                ))}
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button 
                  onClick={() => setShowGrid(false)}
                  className="px-8 py-2 bg-slate-800 text-white rounded font-bold text-sm hover:bg-slate-900 transition-all"
                >
                  Return to Question
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Calculator Modal */}
        <AnimatePresence>
          {showCalculator && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="absolute top-20 left-20 w-64 bg-slate-800 rounded-xl shadow-2xl border border-white/10 overflow-hidden z-[1100]"
            >
              <div className="p-3 bg-slate-900 flex justify-between items-center cursor-move">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Calculator</span>
                <button onClick={() => setShowCalculator(false)} className="text-white/40 hover:text-white">
                  <X size={14} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className="bg-black/40 p-3 rounded-lg text-right min-h-[60px] flex flex-col justify-end">
                  <div className="text-[10px] text-white/20 font-mono">{calcInput || '0'}</div>
                  <div className="text-xl text-white font-mono font-bold">{calcResult || calcInput || '0'}</div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {['7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+','C'].map(btn => (
                    <button
                      key={btn}
                      onClick={() => handleCalc(btn)}
                      className={`p-3 rounded-lg font-mono font-bold transition-all ${
                        btn === '=' ? 'bg-gold-main text-slate-950 col-span-1' : 
                        btn === 'C' ? 'bg-red-500/20 text-red-400 col-span-4' :
                        ['/','*','-','+'].includes(btn) ? 'bg-white/10 text-gold-main' : 'bg-white/5 text-white hover:bg-white/10'
                      }`}
                    >
                      {btn}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pearson VUE Footer */}
      <div className="bg-white border-t border-slate-200 p-4 flex justify-between items-center px-8 shadow-inner">
        <div className="flex gap-3">
          <button 
            onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
            disabled={currentIdx === 0}
            className="px-8 py-2 bg-slate-100 border border-slate-200 text-slate-600 rounded font-bold text-sm hover:bg-slate-200 disabled:opacity-30 transition-all flex items-center gap-2"
          >
            <ChevronLeft size={18} /> Previous
          </button>
          <button 
            onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
            disabled={currentIdx === questions.length - 1}
            className="px-8 py-2 bg-slate-100 border border-slate-200 text-slate-600 rounded font-bold text-sm hover:bg-slate-200 disabled:opacity-30 transition-all flex items-center gap-2"
          >
            Next <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={finishExam}
            className="px-10 py-2 bg-[#003366] text-white rounded font-bold text-sm hover:bg-[#002244] transition-all flex items-center gap-2 shadow-md"
          >
            End Exam <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MockExam;
