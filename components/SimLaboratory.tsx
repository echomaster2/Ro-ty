
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Waves, Activity, Target, Eye, 
  Ruler, Zap, Wind, Compass, ShieldAlert, 
  Cpu, Binary, Radar, Info, ArrowRight,
  Database, Lightbulb, Microscope, Terminal,
  Maximize2, RotateCcw, Filter, Search,
  Box, Layers, Settings, FlaskConical,
  ZapOff, Timer, Split, Repeat, ChevronRight,
  Gauge, Activity as PulseIcon, BarChart3,
  Dna, Radio, BoxSelect, Cpu as Chip,
  Layout, ChevronLeft, Sliders, MessageSquare,
  Sparkles, Power, ScanLine, ShieldCheck, UserCircle,
  ExternalLink, Orbit, BookOpen,
  LayoutGrid, GraduationCap, Bot, Monitor,
  Crosshair, Thermometer, Volume2, VolumeX, Loader2
} from 'lucide-react';
import Simulations from './Simulations';
import { courseData } from '../data/courseContent';
import HarveyAvatar from './HarveyAvatar';
import { useNarrator } from '../src/hooks/useNarrator';

interface SimModule {
  id: string;
  title: string;
  type: string;
  icon: any;
  category: 'Fundamentals' | 'Beams' | 'Doppler' | 'Artifacts' | 'Advanced';
  description: string;
  protocol: string;
  facultyTip: string;
  complexity: 'Low' | 'Medium' | 'High';
  yield: string;
}

const LAB_MODULES: SimModule[] = courseData.flatMap(m => 
  m.topics.map(t => ({
    id: t.id,
    title: t.title,
    type: t.visualType,
    icon: t.visualType.includes('Wave') ? Waves : t.visualType.includes('Doppler') ? Activity : Target,
    category: m.title.includes('Waves') ? 'Fundamentals' : 
              m.title.includes('Doppler') ? 'Doppler' : 
              m.title.includes('Resolution') ? 'Advanced' : 'Beams',
    description: t.contentBody,
    protocol: t.practicalApplication,
    facultyTip: t.harveyTakeaways,
    complexity: 'Medium',
    yield: 'High'
  }))
);

interface SimLaboratoryProps {
  initialSubView?: string;
}

const SimLaboratory: React.FC<SimLaboratoryProps> = ({ initialSubView }) => {
  const { narrate, isNarrating, isThinking } = useNarrator();
  const initialModule = useMemo(() => {
    if (initialSubView === 'doppler') {
      return LAB_MODULES.find(m => m.type === 'SpectralDopplerVisual') || LAB_MODULES[0];
    }
    if (initialSubView === 'beams') {
      return LAB_MODULES.find(m => m.type === 'BeamFocusingVisual') || LAB_MODULES[0];
    }
    if (initialSubView === 'attenuation') {
      return LAB_MODULES.find(m => m.type === 'AttenuationVisual') || LAB_MODULES[0];
    }
    return LAB_MODULES[0];
  }, [initialSubView]);

  const [selectedModule, setSelectedModule] = useState<SimModule>(initialModule);
  const [activeTab, setActiveTab] = useState<'brief' | 'lab' | 'sync'>('lab');

  useEffect(() => {
    if (initialSubView) {
      setSelectedModule(initialModule);
    }
  }, [initialSubView, initialModule]);

  return (
    <div className="h-full flex flex-col animate-fade-in font-sans bg-slate-950 overflow-hidden relative">
      
      {/* 1. Integrated Header HUD */}
      <header className="px-10 py-6 border-b border-white/5 flex justify-between items-center bg-slate-900/40 backdrop-blur-3xl shrink-0 z-[100]">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-4">
             <button className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.1)] hover:bg-red-500/20 transition-all">
               <Power size={20} />
             </button>
             <HarveyAvatar size="sm" isTalking={activeTab === 'lab'} />
          </div>
          <div className="h-10 w-px bg-white/5"></div>
          <div className="space-y-1">
             <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-gold-main tracking-[0.4em] uppercase">Sim_Interface: ACTIVE</span>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-green"></div>
             </div>
             <h1 className="text-3xl font-serif font-bold text-white tracking-tighter uppercase italic leading-none">
               Lab <span className="text-gold-main not-italic">Sanctuary</span>
             </h1>
          </div>
        </div>

        <div className="flex items-center gap-12">
           <div className="flex bg-slate-950/60 p-1.5 rounded-2xl border border-white/10 shadow-inner">
             {['brief', 'lab', 'sync'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setActiveTab(mode as any)}
                  className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === mode ? 'bg-gold-main text-slate-950 shadow-gold scale-105' : 'text-white/40 hover:text-white'}`}
                >
                  {mode}
                </button>
             ))}
           </div>
           <button className="flex flex-col items-end gap-1 group">
              <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] group-hover:text-gold-main transition-colors">Emergency_Eject</span>
              <div className="flex gap-1.5">
                 {[1,2,3].map(i => <div key={i} className="h-1 w-6 bg-red-500/40 rounded-full"></div>)}
              </div>
           </button>
        </div>
      </header>

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar: Node Selection */}
        <aside className="w-[380px] bg-slate-900/20 border-r border-white/5 flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
           <div className="p-8 space-y-8">
              <div className="space-y-6">
                 <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3 text-white/40">
                       <LayoutGrid size={16} />
                       <span className="text-[10px] font-black uppercase tracking-widest">Protocol Registry</span>
                    </div>
                    <span className="text-[8px] font-mono text-gold-main/40 uppercase">Nodes: {LAB_MODULES.length}</span>
                 </div>

                 <div className="space-y-3">
                    {LAB_MODULES.map((mod) => {
                      const isActive = selectedModule.id === mod.id;
                      return (
                        <button 
                          key={mod.id}
                          onClick={() => setSelectedModule(mod)}
                          className={`w-full p-6 rounded-[2rem] border text-left transition-all duration-500 relative group overflow-hidden ${isActive ? 'bg-gold-main border-gold-main shadow-gold text-slate-950 scale-[1.02]' : 'bg-slate-950/40 border-white/5 hover:border-gold-main/20 text-white/60'}`}
                        >
                          {isActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-3/5 bg-slate-950 rounded-r-full shadow-inner animate-pulse"></div>
                          )}
                          <div className="flex items-center justify-between relative z-10">
                            <div className="min-w-0">
                              <h4 className={`text-lg font-serif font-bold italic truncate ${isActive ? 'text-slate-950' : 'text-white'}`}>{mod.title}</h4>
                              <p className={`text-[9px] uppercase font-black tracking-widest mt-1 ${isActive ? 'text-slate-950/60' : 'opacity-60'}`}>{mod.category}</p>
                            </div>
                            <ChevronRight size={18} className={`shrink-0 transition-transform ${isActive ? 'translate-x-1 opacity-100 text-slate-950' : 'opacity-10 translate-x-4'}`} />
                          </div>
                        </button>
                      );
                    })}
                 </div>
              </div>

              <div className="p-8 bg-gold-main/5 border border-gold-main/20 rounded-[2.5rem] space-y-4 relative group/briefing">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-gold-main">
                       <Sparkles size={16} />
                       <span className="text-[9px] font-black uppercase tracking-widest">Faculty Briefing</span>
                    </div>
                    <button 
                      onClick={() => narrate(selectedModule.facultyTip)}
                      disabled={isThinking}
                      className={`p-2 rounded-lg border transition-all ${isNarrating ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-gold-main/10 border-gold-main/20 text-gold-main hover:bg-gold-main/20'}`}
                    >
                      {isThinking ? <Loader2 size={12} className="animate-spin" /> : isNarrating ? <VolumeX size={12} /> : <Volume2 size={12} />}
                    </button>
                 </div>
                 <p className="text-sm text-slate-300 italic leading-relaxed border-l-2 border-gold-main/20 pl-6">
                   "{selectedModule.facultyTip}"
                 </p>
              </div>
           </div>
        </aside>

        {/* Center Main Viewport */}
        <main className="flex-1 flex flex-col p-10 gap-10 bg-[radial-gradient(circle_at_center,rgba(181,148,78,0.02)_0%,transparent_80%)] overflow-y-auto custom-scrollbar">
           
           {/* Primary Rig Viewport */}
           <div className="relative group/rig shrink-0">
              <div className="absolute -inset-1 bg-gold-main/10 rounded-[4rem] blur-2xl opacity-0 group-hover/rig:opacity-100 transition-opacity duration-1000"></div>
              
              <div className="bg-slate-950 border-2 border-white/10 rounded-[3.5rem] overflow-hidden shadow-3xl relative h-[500px]">
                 {/* Live HUD Overlays */}
                 <div className="absolute top-10 left-12 z-20 flex flex-col gap-6 pointer-events-none">
                    <HUDTag label="Pulse_Freq" value="5.0 MHz" icon={Activity} />
                    <HUDTag label="Prop_Speed" value="1540 m/s" icon={Zap} />
                 </div>

                 <div className="absolute top-10 right-12 z-20 flex flex-col gap-6 items-end pointer-events-none">
                    <HUDTag label="Therm_Index" value="0.7 TIB" icon={Thermometer} color="text-blue-400" />
                    <HUDTag label="Mech_Index" value="1.1 MI" icon={Crosshair} color="text-red-400" />
                 </div>

                 <div className="absolute bottom-10 left-12 z-20 pointer-events-none">
                    <div className="flex items-center gap-4 bg-slate-900/80 backdrop-blur-xl border border-white/10 px-5 py-2 rounded-2xl shadow-2xl">
                       <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-green"></div>
                       <span className="text-[10px] font-mono font-bold text-white/60 tracking-[0.3em] uppercase">SYSTEM_READY: 01-NOD-ALPHA</span>
                    </div>
                 </div>

                 {/* The Simulation */}
                 <Simulations type={selectedModule.type} isSandbox={true} />
              </div>
           </div>

           {/* Secondary Controls & Info */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              
              <div className="p-10 bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-[3rem] space-y-8 shadow-2xl">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-gold-main">
                       <div className="p-3 bg-gold-main/10 rounded-xl border border-gold-main/20">
                          <Settings size={20} />
                       </div>
                       <span className="text-[11px] font-black uppercase tracking-[0.4em]">Rig Tuning Protocols</span>
                    </div>
                    <button 
                      onClick={() => narrate(selectedModule.description)}
                      disabled={isThinking}
                      className={`p-3 rounded-xl border transition-all ${isNarrating ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-gold-main/10 border-gold-main/20 text-gold-main hover:bg-gold-main/20'}`}
                    >
                      {isThinking ? <Loader2 size={16} className="animate-spin" /> : isNarrating ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                 </div>
                 <div className="space-y-6">
                    <p className="text-lg text-slate-300 font-light italic leading-relaxed border-l border-white/10 pl-8">
                       {selectedModule.description}
                    </p>
                    <div className="flex flex-wrap gap-4 pt-4">
                       <button className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gold-main hover:text-slate-950 hover:border-gold-main transition-all flex items-center gap-3">
                          <RotateCcw size={14} /> Full System Re-Sync
                       </button>
                       <button className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3">
                          <Monitor size={14} /> Toggle CRT Mask
                       </button>
                    </div>
                 </div>
              </div>

              <div className="p-10 bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-[3rem] space-y-8 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-[0.03]"><Chip size={120} /></div>
                 <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4 text-gold-main">
                       <div className="p-3 bg-gold-main/10 rounded-xl border border-gold-main/20">
                          <Terminal size={20} />
                       </div>
                       <span className="text-[11px] font-black uppercase tracking-[0.4em]">Practical Application</span>
                    </div>
                    <button 
                      onClick={() => narrate(selectedModule.protocol)}
                      disabled={isThinking}
                      className={`p-3 rounded-xl border transition-all ${isNarrating ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-gold-main/10 border-gold-main/20 text-gold-main hover:bg-gold-main/20'}`}
                    >
                      {isThinking ? <Loader2 size={16} className="animate-spin" /> : isNarrating ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                 </div>
                 <div className="space-y-6 relative z-10">
                    <div className="flex gap-6">
                       <div className="w-1.5 h-auto bg-gold-main/20 rounded-full"></div>
                       <p className="text-lg text-slate-300 font-light italic leading-relaxed">
                          {selectedModule.protocol}
                       </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-5 bg-white/[0.03] border border-white/5 rounded-2xl">
                          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Complexity</p>
                          <p className="text-base font-bold text-white">{selectedModule.complexity}</p>
                       </div>
                       <div className="p-5 bg-white/[0.03] border border-white/5 rounded-2xl">
                          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Exam Yield</p>
                          <p className="text-base font-bold text-gold-main">{selectedModule.yield}</p>
                       </div>
                    </div>
                 </div>
              </div>

           </div>
           
           {/* Space for additional workspace modules if needed */}
           <div className="h-40 shrink-0"></div>
        </main>
      </div>

      <style>{`
        .shadow-green { shadow: 0 0 15px rgba(34, 197, 94, 0.4); }
      `}</style>
    </div>
  );
};

const HUDTag = ({ label, value, icon: Icon, color = "text-white/60" }: any) => (
  <div className="flex items-center gap-4 bg-slate-950/80 backdrop-blur-2xl border border-white/10 px-6 py-4 rounded-[1.5rem] shadow-3xl group/hud hover:border-gold-main/30 transition-all">
     <div className={`p-2 rounded-lg bg-white/5 ${color} transition-transform group-hover/hud:scale-110`}>
        <Icon size={18} />
     </div>
     <div className="text-left">
        <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] leading-none mb-1.5">{label}</p>
        <p className={`text-sm font-mono font-bold ${color.includes('text-white') ? 'text-white' : color} leading-none`}>{value}</p>
     </div>
  </div>
);

export default SimLaboratory;
