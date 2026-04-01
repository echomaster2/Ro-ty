
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, Clock, Target, Sparkles, Brain, 
  ChevronRight, RefreshCw, Save, Loader2, 
  Moon, Sun, Zap, Info, X, CheckCircle2
} from 'lucide-react';
import { useFirebase } from './FirebaseProvider';
import { GoogleGenAI, Type } from "@google/genai";
import Markdown from 'react-markdown';
import { courseData } from '../data/courseContent';

const StudyPlan: React.FC<{ onExit: () => void; onNavigate?: (mode: string) => void }> = ({ onExit, onNavigate }) => {
  const { profile, progress, updateProfile, updateProgress } = useFirebase();
  const completedTopicIds = React.useMemo(() => new Set(progress?.completedTopicIds || []), [progress]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showForm, setShowForm] = useState(!profile?.birthDate || !profile?.studyGoals);
  
  const [formData, setFormData] = useState({
    birthDate: profile?.birthDate || '',
    birthTime: profile?.birthTime || '',
    studyGoals: profile?.studyGoals || '',
    learningStyle: profile?.learningStyle || 'Visual'
  });

  const [activeTab, setActiveTab] = useState<'plan' | 'schedule' | 'windows' | 'checklist'>('plan');

  const allTopics = courseData.flatMap(m => m.topics);
  const completionPercentage = allTopics.length > 0 ? Math.round((completedTopicIds.size / allTopics.length) * 100) : 0;

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(formData);
    setShowForm(false);
  };

  const generatePlan = async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `
        Generate a personalized ultrasound physics (ARDMS SPI) study plan for a student with the following profile:
        - Study Goals: ${formData.studyGoals}
        - Learning Style: ${formData.learningStyle}
        - Current XP: ${profile?.xp || 0}
        - Current Level: ${profile?.level || 1}

        The plan should include:
        1. AI-Generated Study Techniques specific to their learning style.
        2. A Weekly Schedule (Monday to Sunday) with specific focus areas.
        3. Strategic advice for mastering complex acoustic concepts.

        STRICT INSTRUCTION: DO NOT USE ANY SYMBOLS IN THE GENERATED TEXT. This includes but is not limited to: commas, percentages, dollar signs, periods, hashes, at-signs, asterisks, ampersands, or any other non-alphanumeric characters except for basic spaces. Use only letters and numbers. DO NOT USE MARKDOWN HEADERS OR ANY OTHER FORMATTING SYMBOLS. Use only line breaks for structure.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const planText = response.text || "Failed to generate plan.";
      
      await updateProgress({
        studyPlan: {
          plan: planText,
          generatedAt: new Date().toISOString(),
          goals: formData.studyGoals,
          style: formData.learningStyle
        }
      });
    } catch (error) {
      console.error("Error generating study plan:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const calculateWindows = (birthTime: string) => {
    if (!birthTime) return [];
    const [hour] = birthTime.split(':').map(Number);
    
    const peakStart = (hour - 1 + 24) % 24;
    const peakEnd = (hour + 1) % 24;
    
    const harmonic1Start = (hour + 7) % 24;
    const harmonic1End = (hour + 9) % 24;
    
    const harmonic2Start = (hour + 15) % 24;
    const harmonic2End = (hour + 17) % 24;
    
    return [
      { name: 'Peak Resonance', start: peakStart, end: peakEnd, type: 'primary', icon: <Zap className="text-gold-main" /> },
      { name: 'Harmonic Uplink I', start: harmonic1Start, end: harmonic1End, type: 'secondary', icon: <Sparkles className="text-blue-400" /> },
      { name: 'Harmonic Uplink II', start: harmonic2Start, end: harmonic2End, type: 'secondary', icon: <Moon className="text-purple-400" /> },
    ];
  };

  const windows = calculateWindows(formData.birthTime);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onExit} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <X size={20} className="text-white/60" />
          </button>
          <div className="h-6 w-[1px] bg-white/10 mx-2"></div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gold-main/10 rounded-lg border border-gold-main/20">
              <Calendar size={16} className="text-gold-main" />
            </div>
            <h1 className="text-lg font-serif font-bold text-white italic uppercase tracking-widest">Neural <span className="text-gold-main not-italic">Study Matrix</span></h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/60 hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <RefreshCw size={14} />
            Update Profile
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 md:p-12">
        <AnimatePresence mode="wait">
          {showForm ? (
            <motion.div 
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto space-y-12"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-6xl font-serif font-bold text-white italic uppercase tracking-tighter leading-none">Calibrate <span className="text-gold-main not-italic">Neural Path</span></h2>
                <p className="text-slate-400 font-light italic">Provide your temporal and cognitive coordinates to generate a personalized resonance plan.</p>
              </div>

              <form onSubmit={handleSaveInfo} className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-8 md:p-12 space-y-8 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Temporal Node (Birth Date)</label>
                    <input 
                      type="date" 
                      required
                      value={formData.birthDate}
                      onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-6 py-4 text-white font-serif italic outline-none focus:border-gold-main/50 transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Resonance Hour (Birth Time)</label>
                    <input 
                      type="time" 
                      required
                      value={formData.birthTime}
                      onChange={(e) => setFormData({...formData, birthTime: e.target.value})}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-6 py-4 text-white font-serif italic outline-none focus:border-gold-main/50 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Primary Study Objectives</label>
                  <textarea 
                    required
                    placeholder="e.g., Master Doppler physics, pass SPI in 30 days, focus on artifacts..."
                    value={formData.studyGoals}
                    onChange={(e) => setFormData({...formData, studyGoals: e.target.value})}
                    className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-6 py-4 text-white font-serif italic outline-none focus:border-gold-main/50 transition-all min-h-[120px] resize-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Cognitive Processing Style</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['Visual', 'Auditory', 'Kinesthetic', 'Logical'].map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => setFormData({...formData, learningStyle: style})}
                        className={`py-4 rounded-xl border font-black uppercase text-[10px] tracking-widest transition-all ${formData.learningStyle === style ? 'bg-gold-main text-slate-950 border-gold-main shadow-gold' : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10'}`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-6 rounded-2xl bg-white text-slate-950 font-black uppercase tracking-[0.4em] text-xs hover:bg-gold-main transition-all shadow-2xl flex items-center justify-center gap-3"
                >
                  <Save size={18} />
                  Lock Coordinates
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div 
              key="plan"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-gold-main">
                    <div className="p-2 bg-gold-main/10 rounded-lg border border-gold-main/20"><Brain size={18} /></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Personalized Neural Plan</span>
                  </div>
                  <h2 className="text-4xl md:text-8xl font-serif font-bold text-white italic uppercase tracking-tighter leading-none">Study <span className="text-gold-main not-italic">Resonance</span></h2>
                </div>
                
                {!progress?.studyPlan && (
                  <button 
                    onClick={generatePlan}
                    disabled={isGenerating}
                    className="px-12 py-6 rounded-2xl bg-gold-main text-slate-950 font-black uppercase tracking-[0.4em] text-xs shadow-gold hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} fill="currentColor" />}
                    {isGenerating ? 'Synthesizing...' : 'Generate Plan'}
                  </button>
                )}
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl w-fit overflow-x-auto max-w-full">
                {[
                  { id: 'plan', label: 'Neural Plan', icon: <Brain size={14} /> },
                  { id: 'checklist', label: 'Topic Checklist', icon: <Target size={14} /> },
                  { id: 'windows', label: 'Spiritual Windows', icon: <Clock size={14} /> }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-6 py-3 rounded-xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-slate-950 shadow-xl' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Main Content */}
                <div className="lg:col-span-8">
                  <AnimatePresence mode="wait">
                    {activeTab === 'plan' && (
                      <motion.div 
                        key="plan-content"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden"
                      >
                        {progress?.studyPlan ? (
                          <div className="prose prose-invert max-w-none prose-headings:font-serif prose-headings:italic prose-headings:uppercase prose-headings:tracking-tighter prose-p:text-slate-300 prose-p:font-light prose-p:italic prose-li:text-slate-400">
                            <Markdown>{progress.studyPlan.plan}</Markdown>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
                            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/20">
                              <Sparkles size={32} />
                            </div>
                            <div className="space-y-2">
                              <h3 className="text-2xl font-serif font-bold text-white italic uppercase">No Plan Detected</h3>
                              <p className="text-slate-400 font-light italic max-w-sm">Initiate the neural synthesis to generate your personalized study resonance matrix.</p>
                            </div>
                            <button 
                              onClick={generatePlan}
                              disabled={isGenerating}
                              className="px-8 py-4 rounded-xl bg-gold-main text-slate-950 font-black uppercase tracking-widest text-[10px] shadow-gold flex items-center gap-2"
                            >
                              {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} fill="currentColor" />}
                              Begin Synthesis
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {activeTab === 'checklist' && (
                      <motion.div 
                        key="checklist-content"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-8"
                      >
                        <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl space-y-8">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="space-y-2">
                              <h3 className="text-3xl font-serif font-bold text-white italic uppercase tracking-tight">Curriculum <span className="text-gold-main not-italic">Sync</span></h3>
                              <p className="text-slate-400 font-light italic leading-relaxed">Track your progress across the entire SPI Physics curriculum.</p>
                            </div>
                            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl text-center min-w-[160px]">
                              <div className="text-3xl font-serif font-bold text-gold-main italic">{completionPercentage}%</div>
                              <div className="text-[9px] font-black uppercase tracking-widest text-white/40">Overall Completion</div>
                            </div>
                          </div>

                          <div className="space-y-12">
                            {courseData.map((module, mIdx) => {
                              const moduleTopics = module.topics;
                              const completedInModule = moduleTopics.filter(t => completedTopicIds.has(t.id)).length;
                              const moduleProgress = Math.round((completedInModule / moduleTopics.length) * 100);

                              return (
                                <div key={module.id} className="space-y-6">
                                  <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gold-main font-serif font-bold italic">
                                        {mIdx + 1}
                                      </div>
                                      <div>
                                        <h4 className="text-xl font-serif font-bold text-white italic uppercase">{module.title}</h4>
                                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">{moduleTopics.length} Neural Nodes</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-lg font-serif font-bold text-white italic">{moduleProgress}%</div>
                                      <div className="w-24 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                                        <div className="h-full bg-gold-main" style={{ width: `${moduleProgress}%` }} />
                                      </div>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {moduleTopics.map((topic) => (
                                      <div 
                                        key={topic.id}
                                        className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${completedTopicIds.has(topic.id) ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/[0.02] border-white/5'}`}
                                      >
                                        <div className="flex items-center gap-3">
                                          <div className={`w-2 h-2 rounded-full ${completedTopicIds.has(topic.id) ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-white/10'}`} />
                                          <span className={`text-sm font-serif italic ${completedTopicIds.has(topic.id) ? 'text-white' : 'text-white/60'}`}>{topic.title}</span>
                                        </div>
                                        {completedTopicIds.has(topic.id) && <CheckCircle2 size={16} className="text-emerald-500" />}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'windows' && (
                      <motion.div 
                        key="windows-content"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-8"
                      >
                        <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl space-y-8">
                          <div className="space-y-2">
                            <h3 className="text-3xl font-serif font-bold text-white italic uppercase tracking-tight">Temporal <span className="text-gold-main not-italic">Resonance</span></h3>
                            <p className="text-slate-400 font-light italic leading-relaxed">Based on your birth coordinates, these windows represent periods of maximum cognitive alignment and spiritual focus.</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {windows.map((window, idx) => (
                              <div key={idx} className="p-8 bg-slate-950/60 border border-white/5 rounded-3xl space-y-6 group hover:border-gold-main/30 transition-all">
                                <div className="flex justify-between items-start">
                                  <div className="p-3 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">
                                    {window.icon}
                                  </div>
                                  <div className="px-3 py-1 bg-white/5 rounded-full text-[8px] font-black uppercase tracking-widest text-white/40">
                                    {window.type}
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <h4 className="text-xl font-serif font-bold text-white italic uppercase leading-none">{window.name}</h4>
                                  <div className="flex items-center gap-2 text-gold-main font-mono text-xs">
                                    <Clock size={12} />
                                    <span>{window.start}:00 - {window.end}:00</span>
                                  </div>
                                </div>
                                <p className="text-xs text-slate-500 font-light italic leading-relaxed">Optimal for high-pressure modules and deep neural integration.</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="p-8 bg-gold-main/5 border border-gold-main/20 rounded-3xl flex items-start gap-6">
                          <div className="p-3 bg-gold-main/10 rounded-2xl text-gold-main">
                            <Info size={24} />
                          </div>
                          <div className="space-y-2">
                            <h4 className="text-lg font-serif font-bold text-white italic uppercase">Spiritual Alignment Note</h4>
                            <p className="text-sm text-slate-400 font-light italic leading-relaxed">These windows are calculated using the harmonic resonance of your birth time. Studying during these periods can increase retention by up to 40% through synchronized neural firing.</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Sidebar Info */}
                <div className="lg:col-span-4 space-y-8">
                  <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-8 space-y-8 shadow-2xl">
                    <h3 className="text-xl font-serif font-bold text-white italic uppercase tracking-tight px-2">Profile <span className="text-gold-main not-italic">Data</span></h3>
                    
                    <div className="space-y-6">
                      <div className="space-y-2 px-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Learning Style</span>
                        <div className="flex items-center gap-3 text-white font-serif italic">
                          <Brain size={16} className="text-gold-main" />
                          <span>{formData.learningStyle} Processor</span>
                        </div>
                      </div>

                      <div className="space-y-2 px-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Active Goals</span>
                        <p className="text-sm text-slate-400 font-light italic leading-relaxed">{formData.studyGoals}</p>
                      </div>

                      <div className="h-[1px] w-full bg-white/5"></div>

                      <div className="space-y-4 px-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Plan Status</span>
                        {progress?.studyPlan ? (
                          <div className="flex items-center gap-3 text-green-400 text-xs font-black uppercase tracking-widest">
                            <CheckCircle2 size={16} />
                            Active & Synced
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 text-white/20 text-xs font-black uppercase tracking-widest">
                            <RefreshCw size={16} className="animate-spin" />
                            Awaiting Synthesis
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div 
                    onClick={() => onNavigate?.('pricing')}
                    className="bg-gold-main p-8 rounded-[3rem] space-y-4 shadow-gold group cursor-pointer overflow-hidden relative active:scale-[0.98] transition-transform"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-150 transition-transform duration-700">
                      <Zap size={120} fill="currentColor" />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-slate-950 italic uppercase leading-none relative z-10">Elite <span className="text-white not-italic">Sync</span></h3>
                    <p className="text-slate-900/70 text-sm font-light italic leading-tight relative z-10">Unlock real-time spiritual window notifications and AI-tutor resonance.</p>
                    <button 
                      onClick={() => onNavigate?.('pricing')}
                      className="px-6 py-3 bg-slate-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-slate-950 transition-all relative z-10"
                    >
                      Upgrade Now
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StudyPlan;
