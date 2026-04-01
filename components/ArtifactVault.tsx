
import React, { useState, useMemo } from 'react';
import { 
  ScanLine, Eye, ShieldAlert, CheckCircle2, Info, 
  Search, Zap, Activity, Maximize2, AlertTriangle, 
  Compass, Layers, ChevronRight, X, ShieldX,
  Target, Terminal, Bot, ShieldCheck, Database,
  EyeOff, Crosshair, Volume2, VolumeX, Loader2
} from 'lucide-react';
import { artifactVault, Artifact } from '../data/courseContent';
import Simulations from './Simulations';
import { useNarrator } from '../src/hooks/useNarrator';

const ArtifactVault: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>(artifactVault[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const { narrate, isNarrating, isThinking } = useNarrator();

  const selectedArtifact = useMemo(() => 
    artifactVault.find(a => a.id === selectedId) || artifactVault[0]
  , [selectedId]);

  const filteredArtifacts = artifactVault.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10 animate-fade-in text-left font-sans pb-40">
      
      {/* 1. Dashboard Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 md:gap-8 border-b border-white/10 pb-10 md:pb-12 mb-8 md:mb-12">
        <div className="space-y-4">
            <div className="flex items-center gap-3 text-gold-main">
                <div className="p-2 bg-gold-main/10 rounded-lg border border-gold-main/20">
                    <ScanLine size={18} className="animate-pulse" />
                </div>
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em]">Forensic Logic Archive</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-serif font-bold text-white italic tracking-tighter uppercase leading-none">
                Artifact <span className="text-gold-main not-italic">Vault</span>
            </h1>
            <p className="text-slate-400 text-base md:text-xl font-light italic border-l-2 border-gold-main/20 pl-4 md:pl-6 max-w-2xl">
                Master the <span className="text-white font-bold italic uppercase">"Phantom Nodes"</span> of ultrasonic physics to reveal diagnostic truth.
            </p>
        </div>
        
        <div className="w-full lg:w-96 relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-gold-main transition-colors" />
            <input 
                type="text" 
                placeholder="Search Phantom Nodes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/60 border border-white/10 rounded-2xl pl-14 pr-6 py-4 md:py-5 text-sm text-white focus:border-gold-main/40 transition-all outline-none backdrop-blur-xl shadow-inner font-serif italic"
            />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 items-start">
        
        {/* 2. Registry Rail (Mobile-Responsive Selection) */}
        <div className="lg:col-span-3 col-span-12 space-y-3 lg:max-h-[800px] overflow-x-auto lg:overflow-y-auto custom-scrollbar flex lg:flex-col gap-3 lg:gap-3 p-1">
            <div className="hidden lg:flex items-center justify-between px-3 mb-6">
                <div className="flex items-center gap-3">
                    <Layers size={14} className="text-white/20" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Node Registry</span>
                </div>
                <span className="text-[8px] font-mono text-white/20 bg-white/5 px-2 py-0.5 rounded-full">{filteredArtifacts.length} NODES</span>
            </div>
            
            {filteredArtifacts.map((art) => (
                <button 
                    key={art.id}
                    onClick={() => setSelectedId(art.id)}
                    className={`shrink-0 lg:shrink lg:w-full min-w-[200px] lg:min-w-0 p-5 rounded-[1.5rem] md:rounded-[1.8rem] border text-left transition-all duration-500 group relative overflow-hidden flex items-center justify-between ${selectedId === art.id ? 'bg-gold-main border-gold-main shadow-gold text-slate-950 scale-[1.02]' : 'bg-slate-950/40 border-white/5 hover:border-gold-main/30 text-white/60 hover:bg-white/[0.02]'}`}
                >
                    <div className="min-w-0 relative z-10">
                        <h4 className={`text-base md:text-lg font-serif font-bold italic truncate ${selectedId === art.id ? 'text-slate-950' : 'text-white'}`}>{art.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                            <div className={`w-1 h-1 rounded-full ${selectedId === art.id ? 'bg-slate-950/40' : 'bg-gold-main/40'}`}></div>
                            <span className={`text-[8px] uppercase font-black tracking-widest opacity-60`}>
                                {art.visualType.replace('Visual', '')}
                            </span>
                        </div>
                    </div>
                    <ChevronRight size={16} className={`shrink-0 transition-transform hidden lg:block ${selectedId === art.id ? 'translate-x-1 opacity-100' : 'opacity-10 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                </button>
            ))}
        </div>

        {/* 3. Primary Analysis Workspace */}
        <div className="lg:col-span-9 col-span-12 space-y-6 md:space-y-10 animate-slide-up">
            
            {/* Active Viewport */}
            <div className="bg-slate-900 border-2 border-white/10 rounded-[2rem] md:rounded-[3.5rem] overflow-hidden shadow-3xl relative group">
                <div className="absolute top-4 left-6 md:top-8 md:left-10 z-20 flex items-center gap-3 md:gap-4 bg-slate-950/80 backdrop-blur-xl border border-white/10 px-4 py-1.5 md:px-5 md:py-2 rounded-xl md:rounded-2xl shadow-2xl">
                    <div className="flex gap-1">
                        <div className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-green-500 animate-pulse shadow-green"></div>
                        <div className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-white/10"></div>
                    </div>
                    <span className="text-[8px] md:text-[10px] font-black text-white/60 uppercase tracking-[0.3em]">FIELD_VIEW</span>
                </div>
                
                <div className="p-1 md:p-2">
                    <Simulations type={selectedArtifact.visualType} isSandbox={true} />
                </div>
            </div>

            {/* Logical Bridge */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 items-stretch">
                <div className="p-8 md:p-12 bg-slate-950 border border-red-500/20 rounded-[2rem] md:rounded-[3rem] space-y-4 md:space-y-6 relative overflow-hidden group shadow-xl">
                    <div className="absolute -top-4 -right-4 opacity-[0.03] rotate-12 transition-transform duration-1000 group-hover:scale-110">
                        <ShieldX size={150} className="text-red-500" />
                    </div>
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20 text-red-500"><AlertTriangle size={18} /></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-400">The Board Trap</span>
                        </div>
                        <button 
                          onClick={() => narrate(selectedArtifact.boardTrap)}
                          disabled={isThinking}
                          className={`p-2 rounded-lg border transition-all ${isNarrating ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-white/5 border-white/10 text-white/20 hover:text-white'}`}
                        >
                          {isThinking ? <Loader2 size={12} className="animate-spin" /> : isNarrating ? <VolumeX size={12} /> : <Volume2 size={12} />}
                        </button>
                    </div>
                    <p className="text-lg md:text-2xl text-slate-200 font-serif italic leading-relaxed relative z-10">
                        "{selectedArtifact.boardTrap}"
                    </p>
                </div>

                <div className="p-8 md:p-12 bg-gold-main text-slate-950 rounded-[2rem] md:rounded-[3rem] space-y-4 md:space-y-6 relative overflow-hidden shadow-gold transition-transform hover:scale-[1.01]">
                    <div className="absolute -top-4 -right-4 opacity-[0.15] -rotate-12 transition-transform duration-1000 group-hover:scale-110">
                        <ShieldCheck size={150} />
                    </div>
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-950/10 rounded-lg border border-slate-950/10"><Zap size={18} fill="currentColor" /></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">The Clinical Fix</span>
                        </div>
                        <button 
                          onClick={() => narrate(selectedArtifact.fix)}
                          disabled={isThinking}
                          className={`p-2 rounded-lg border transition-all ${isNarrating ? 'bg-red-500/10 border-red-500/20 text-slate-950' : 'bg-slate-950/5 border-slate-950/10 text-slate-950/40 hover:text-slate-950'}`}
                        >
                          {isThinking ? <Loader2 size={12} className="animate-spin" /> : isNarrating ? <VolumeX size={12} /> : <Volume2 size={12} />}
                        </button>
                    </div>
                    <p className="text-lg md:text-2xl font-bold italic leading-relaxed font-serif relative z-10">
                        "{selectedArtifact.fix}"
                    </p>
                </div>
            </div>

            {/* Analytical Dossier */}
            <div className="p-8 md:p-14 bg-white/[0.02] border border-white/5 rounded-[2.5rem] md:rounded-[4rem] space-y-8 md:space-y-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000"><Database size={120} /></div>
                
                <div className="flex items-center justify-between border-b border-white/5 pb-8">
                    <div className="flex items-center gap-4 md:gap-6">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gold-main/10 flex items-center justify-center border border-gold-main/20 text-gold-main"><Info size={24} /></div>
                        <div>
                            <h4 className="text-xl md:text-3xl font-serif font-bold text-white italic leading-tight uppercase tracking-tight">Physics Dossier</h4>
                            <p className="text-[8px] md:text-[10px] font-black text-gold-main/40 uppercase tracking-[0.4em] mt-1">Analytical Node {selectedArtifact.id.toUpperCase()}</p>
                        </div>
                    </div>
                    <button 
                      onClick={() => narrate(selectedArtifact.description)}
                      disabled={isThinking}
                      className={`p-3 rounded-xl border transition-all ${isNarrating ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-gold-main/10 border-gold-main/20 text-gold-main hover:bg-gold-main/20'}`}
                    >
                      {isThinking ? <Loader2 size={16} className="animate-spin" /> : isNarrating ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 md:gap-12">
                    <div className="xl:col-span-8 space-y-6">
                        <p className="text-base md:text-2xl text-slate-300 font-light leading-relaxed italic border-l-4 border-gold-main/30 pl-6 md:pl-8 py-1 md:py-2">
                            {selectedArtifact.description}
                        </p>
                    </div>
                    <div className="xl:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-3 md:gap-4">
                        <DossierMetric label="Exam Yield" value="Critical" color="text-red-400" />
                        <DossierMetric label="Category" value="Propagation" color="text-white/80" />
                        <DossierMetric label="Complexity" value="Moderate" color="text-gold-main" />
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const DossierMetric = ({ label, value, color }: { label: string; value: string; color: string }) => (
    <div className="flex flex-col md:flex-row justify-between md:items-center px-5 py-3 md:px-6 md:py-4 bg-white/[0.03] rounded-xl md:rounded-2xl border border-white/5 group/metric hover:bg-white/[0.06] transition-all gap-1">
        <span className="text-[7px] md:text-[9px] font-black uppercase text-white/30 tracking-widest">{label}</span>
        <span className={`text-[10px] md:text-[11px] font-bold uppercase tracking-[0.1em] ${color}`}>{value}</span>
    </div>
);

export default ArtifactVault;
