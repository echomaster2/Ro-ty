import React from 'react';
import { ChevronRight, Layers, Activity, Zap, Eye, Cpu, GraduationCap, AlertTriangle, BarChart3, Brain, Target, ShieldAlert } from 'lucide-react';

const ExamSections: React.FC = () => {
  const sections = [
    {
      id: "DOM-01",
      icon: <Layers className="w-5 h-5" />,
      title: "Physics Fundamentals",
      weight: "20%",
      trap: "Frequency vs Period: They are reciprocal (f = 1/T).",
      topics: ["Wave properties & propagation", "Acoustic variables", "Interaction with tissue", "Intensity/Power dynamics", "Pulsed vs CW"]
    },
    {
      id: "DOM-02",
      icon: <Zap className="w-5 h-5" />,
      title: "Transducers & Beams",
      weight: "25%",
      trap: "Damping improves axial resolution (LARRD).",
      topics: ["PZT construction", "Matching layer efficiency", "Beam formation", "Array tech", "Far field divergence"]
    },
    {
      id: "DOM-03",
      icon: <Cpu className="w-5 h-5" />,
      title: "Instrumentation",
      weight: "20%",
      trap: "Demodulation is not operator adjustable.",
      topics: ["Receiver Functions", "Pre/Postprocessing", "TGC optimization", "A-to-D conversion", "DICOM/PACS"]
    },
    {
      id: "DOM-04",
      icon: <Activity className="w-5 h-5" />,
      title: "Doppler Dynamics",
      weight: "15%",
      trap: "90° angle = zero shift measured.",
      topics: ["Doppler Equation", "Flow profiles", "Aliasing limits", "Color/Power modes", "Spectral analysis"]
    },
    {
      id: "DOM-05",
      icon: <Eye className="w-5 h-5" />,
      title: "Resolution & QA",
      weight: "20%",
      trap: "Shadowing = high atten; Enhancement = low atten.",
      topics: ["Axial/Lateral detail", "Artifact identification", "Phantom testing", "ALARA safety", "TI & MI indices"]
    }
  ];

  return (
    <div id="study-guides" className="py-16 md:py-32 bg-transparent relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <div className="lg:grid lg:grid-cols-12 gap-10 lg:gap-20 items-start">
            
            {/* Dossier Header Info */}
            <div className="lg:col-span-5 space-y-8 md:space-y-14 text-left">
                <div className="space-y-4 md:space-y-6">
                  <div className="flex items-center gap-3 text-gold-main">
                    <div className="p-2 bg-gold-main/10 rounded-lg border border-gold-main/20"><GraduationCap size={20} /></div>
                    <span className="text-xs font-black uppercase tracking-[0.3em] md:tracking-[0.4em]">Clinical Matrix</span>
                  </div>
                  <h2 className="text-4xl md:text-7xl font-serif font-bold text-white leading-tight tracking-tighter italic uppercase">
                      Study <span className="text-gold-main not-italic">Domains</span>
                  </h2>
                  <p className="text-lg md:text-xl text-slate-300 font-light leading-relaxed border-l-2 border-gold-main/20 pl-6 md:pl-8 py-2">
                      Precision-engineered to match ARDMS® weighting.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { title: "Mnemonic Matrix", icon: Brain, desc: "Memory anchors for physics." },
                    { title: "Trap Detection", icon: ShieldAlert, desc: "Alerts for board pitfalls." }
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col gap-2 p-5 md:p-6 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/5 transition-all shadow-xl">
                      <div className="flex items-center gap-3">
                         <div className="p-1.5 rounded-lg bg-gold-main/10 text-gold-main"><item.icon size={16} /></div>
                         <h4 className="text-[10px] font-black text-white uppercase tracking-widest">{item.title}</h4>
                      </div>
                      <p className="text-xs text-slate-400 font-light italic leading-snug">{item.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="p-6 md:p-8 bg-red-500/5 border border-red-500/20 rounded-2xl md:rounded-[2.5rem] space-y-3 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] rotate-12 group-hover:scale-110 transition-transform"><Target size={100} className="text-red-500" /></div>
                    <div className="flex items-center gap-3 text-red-500 relative z-10">
                        <AlertTriangle size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Fail-Point Log</span>
                    </div>
                    <p className="text-base text-slate-200 font-light italic leading-relaxed relative z-10">
                        <span className="text-white font-bold">72% of candidates</span> fail due to rote memorization. We fix the logic gap.
                    </p>
                </div>
            </div>

            {/* Detailed Domain List */}
            <div className="lg:col-span-7 grid gap-4 md:gap-6 relative mt-10 lg:mt-0 text-left">
                {sections.map((section, idx) => (
                    <div key={idx} className="bg-slate-900/40 backdrop-blur-3xl p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] border border-white/5 shadow-2xl hover:border-gold-main/40 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 px-4 md:px-6 py-2 md:py-2 bg-white/5 border-b border-l border-white/10 text-white/20 text-[10px] md:text-[9px] font-black rounded-bl-xl md:rounded-bl-2xl uppercase">
                            {section.id}
                        </div>
                        
                        <div className="flex flex-col gap-6 md:gap-6">
                            <div className="flex items-center gap-4 md:gap-5">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-gold-main/10 rounded-xl md:rounded-2xl border border-gold-main/30 flex items-center justify-center text-gold-main shrink-0">
                                    {section.icon}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl md:text-2xl font-serif font-bold text-white group-hover:text-gold-main transition-colors italic leading-none uppercase">
                                        {section.title}
                                    </h3>
                                    <span className="text-[10px] font-black text-gold-main uppercase tracking-widest">{section.weight} Yield</span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 py-4 md:py-4 border-y border-white/5">
                                {section.topics.map((topic, tIdx) => (
                                    <div key={tIdx} className="flex items-start text-xs md:text-sm text-slate-400 group-hover:text-white transition-colors leading-tight">
                                        <ChevronRight className="w-3.5 h-3.5 text-gold-main/40 mt-0.5 mr-1.5 shrink-0" />
                                        {topic}
                                    </div>
                                ))}
                            </div>
                            
                            <div className="flex items-start gap-3 p-4 bg-red-500/10 rounded-xl md:rounded-2xl border border-red-500/20">
                                <ShieldAlert size={16} className="text-red-500 shrink-0 mt-0.5" />
                                <p className="text-xs md:text-sm text-slate-200 font-sans italic leading-relaxed">
                                    {section.trap}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ExamSections;