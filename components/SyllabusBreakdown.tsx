import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronRight, 
  BookOpen, 
  Clock, 
  Zap, 
  Target,
  BarChart3,
  ShieldCheck,
  Brain,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useCourse } from './CourseContext';
import { useNarrator } from '../src/hooks/useNarrator';

interface SyllabusBreakdownProps {
  onOpenCourse?: (view?: string) => void;
}

const SyllabusBreakdown: React.FC<SyllabusBreakdownProps> = ({ onOpenCourse }) => {
  const { courseData } = useCourse();
  const [expandedModule, setExpandedModule] = useState<string | null>(courseData?.[0]?.id || null);
  const { narrate, stopNarration, isNarrating } = useNarrator();

  const toggleModule = (id: string) => {
    setExpandedModule(expandedModule === id ? null : id);
  };

  if (!courseData || courseData.length === 0) return null;

  return (
    <section id="syllabus" className="py-24 md:py-40 bg-slate-950 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-gold-main/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-gold-main/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-12 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-24">
          <div className="space-y-6 max-w-2xl">
            <div className="flex items-center gap-3 text-gold-main">
              <div className="p-2 bg-gold-main/10 rounded-lg border border-gold-main/20">
                <BookOpen size={20} />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.4em]">Curriculum Architecture</span>
            </div>
            <h2 className="text-5xl md:text-8xl font-serif font-bold text-white leading-none tracking-tighter italic uppercase">
              Syllabus <span className="text-gold-main not-italic">Breakdown</span>
            </h2>
            <p className="text-xl text-slate-400 font-light leading-relaxed">
              A comprehensive roadmap of the core modules required for ARDMS mastery, 
              spanning Physics, Anatomy, and Clinical Practice.
            </p>
          </div>

          <div className="hidden lg:flex items-center gap-12 border-l border-white/10 pl-12">
            <div className="space-y-1">
              <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Total Modules</div>
              <div className="text-4xl font-serif font-bold text-white italic">{courseData.length}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Total Topics</div>
              <div className="text-4xl font-serif font-bold text-white italic">
                {courseData.reduce((acc, m) => acc + m.topics.length, 0)}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {courseData.map((module, idx) => (
            <div 
              key={module.id}
              className={`group border transition-all duration-500 rounded-3xl overflow-hidden ${
                expandedModule === module.id 
                  ? 'bg-white/[0.03] border-gold-main/30 shadow-2xl' 
                  : 'bg-slate-900/40 border-white/5 hover:border-white/20'
              }`}
            >
              <button 
                onClick={() => toggleModule(module.id)}
                className="w-full p-6 md:p-10 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-6 md:gap-10">
                  <div className="hidden sm:flex flex-col items-center justify-center">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Module</span>
                    <span className="text-3xl font-serif font-bold text-gold-main italic">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl md:text-3xl font-serif font-bold text-white group-hover:text-gold-main transition-colors uppercase italic">
                        {module.title.replace(/^\d+\.\s*/, '')}
                      </h3>
                      <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        module.pressure === 'Extreme' ? 'bg-red-500/10 border-red-500/30 text-red-500' :
                        module.pressure === 'High' ? 'bg-orange-500/10 border-orange-500/30 text-orange-500' :
                        'bg-gold-main/10 border-gold-main/30 text-gold-main'
                      }`}>
                        {module.pressure} Pressure
                      </div>
                    </div>
                    <p className="text-sm md:text-lg text-slate-400 font-light italic max-w-xl line-clamp-1 md:line-clamp-none">
                      {module.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Exam Weight</span>
                    <span className="text-xl font-serif font-bold text-white italic">{module.examWeight}%</span>
                  </div>
                  <div className={`p-3 rounded-xl border transition-all duration-500 ${
                    expandedModule === module.id ? 'bg-gold-main text-slate-950 border-gold-main' : 'bg-white/5 border-white/10 text-white/40'
                  }`}>
                    {expandedModule === module.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </div>
                </div>
              </button>

              <AnimatePresence>
                {expandedModule === module.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="px-6 md:px-10 pb-10 pt-4 border-t border-white/5">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {module.topics.map((topic) => (
                          <div 
                            key={topic.id}
                            className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-gold-main/20 transition-all group/topic"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-2 text-gold-main/60">
                                <Zap size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Topic Node</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-mono">
                                <Clock size={12} />
                                <span>{topic.estTime}</span>
                              </div>
                            </div>
                            
                            <h4 className="text-lg font-serif font-bold text-white mb-3 italic group-hover/topic:text-gold-main transition-colors">
                              {topic.title}
                            </h4>
                            
                            <div className="relative group/takeaway">
                              <p className="text-xs text-slate-400 font-light leading-relaxed mb-6 line-clamp-2 italic pr-8">
                                {topic.harveyTakeaways}
                              </p>
                              <button 
                                onClick={() => narrate(topic.detailedLecture || topic.harveyTakeaways, 'Fenrir')}
                                className="absolute right-0 top-0 p-1.5 bg-gold-main/10 text-gold-main rounded-lg opacity-0 group-hover/takeaway:opacity-100 transition-all hover:bg-gold-main hover:text-slate-950"
                                title="Listen to Harvey's Insight"
                              >
                                {isNarrating ? <VolumeX size={12} /> : <Volume2 size={12} />}
                              </button>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 text-[10px] font-black text-gold-main/40 uppercase">
                                  <BarChart3 size={12} />
                                  <span>{topic.xpReward} XP</span>
                                </div>
                              </div>
                              <div className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                                {topic.professorPersona} Protocol
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Module Summary Card */}
                        <div className="p-8 bg-gold-main/5 border border-gold-main/20 rounded-2xl flex flex-col justify-between relative overflow-hidden group/summary">
                          <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover/summary:scale-110 transition-transform">
                            <ShieldCheck size={120} />
                          </div>
                          
                          <div className="space-y-4 relative z-10">
                            <div className="flex items-center gap-2 text-gold-main">
                              <Target size={16} />
                              <span className="text-[10px] font-black uppercase tracking-widest">Module Objective</span>
                            </div>
                            <p className="text-sm text-slate-200 font-light italic leading-relaxed">
                              {module.introStory}
                            </p>
                          </div>

                          <div className="pt-6 relative z-10">
                            <div className="flex items-center gap-3 p-3 bg-slate-950/50 rounded-xl border border-white/5">
                              <Brain size={16} className="text-gold-main" />
                              <span className="text-[10px] font-black text-white uppercase tracking-widest">Cognitive Depth: {module.depth}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <div className="mt-20 p-10 bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-[3rem] text-center space-y-8">
          <div className="max-w-2xl mx-auto space-y-4">
            <h3 className="text-3xl font-serif font-bold text-white italic uppercase">
              Ready to <span className="text-gold-main not-italic">Sync?</span>
            </h3>
            <p className="text-slate-400 font-light italic">
              The full curriculum is waiting. Establish your connection to the acoustic matrix and start your journey to 100% board readiness.
            </p>
          </div>
          <button 
            onClick={() => onOpenCourse?.('classroom')}
            className="px-12 py-6 bg-gold-main text-slate-950 font-black rounded-2xl uppercase tracking-[0.3em] text-xs shadow-gold hover:shadow-gold-strong transition-all active:scale-95"
          >
            Begin First Module
          </button>
        </div>
      </div>
    </section>
  );
};

export default SyllabusBreakdown;
