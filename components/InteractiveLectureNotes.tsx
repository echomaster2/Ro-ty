
import React from 'react';
import { Lightbulb, ShieldAlert, Target, Brain, Bookmark, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useNarrator } from '../src/hooks/useNarrator';

interface InteractiveLectureNotesProps {
  notes: string;
}

const InteractiveLectureNotes: React.FC<InteractiveLectureNotesProps> = ({ notes }) => {
  const { narrate, isNarrating, isThinking } = useNarrator();
  // Regex to match {{Concept: ... | Def: ... | Tip: ... | Not: ...}}
  const tagRegex = /\{\{Concept:\s*(.*?)\s*\|\s*Def:\s*(.*?)\s*\|\s*Tip:\s*(.*?)\s*\|\s*Not:\s*(.*?)\s*\}\}/g;
  
  const blocks = [];
  let match;

  while ((match = tagRegex.exec(notes)) !== null) {
    const [fullMatch, concept, definition, tip, misconception] = match;
    
    blocks.push(
      <div key={match.index} className="space-y-6 mb-16 animate-fade-in group/note">
        {/* Concept Header */}
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-gold-main/10 border-2 border-gold-main/20 flex items-center justify-center text-gold-main shadow-gold-dim transition-transform group-hover/note:scale-110">
            <Brain size={28} />
          </div>
          <div>
            <h4 className="text-2xl md:text-3xl font-serif font-bold text-white italic tracking-tight uppercase leading-none">{concept}</h4>
            <p className="text-[9px] font-black text-gold-main/40 uppercase tracking-[0.4em] mt-2">Active Learning Node</p>
          </div>
        </div>

        {/* Definition */}
        <div className="relative p-8 md:p-12 bg-white/[0.02] border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden group/def">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover/note:rotate-12 transition-transform duration-1000">
             <Bookmark size={120} />
          </div>
          <div className="flex items-start justify-between gap-6 relative z-10">
            <p className="text-xl md:text-2xl text-slate-100 font-serif font-light leading-relaxed italic border-l-4 border-gold-main/40 pl-10 py-2">
              {definition}
            </p>
            <button 
              onClick={() => narrate(definition)}
              disabled={isThinking}
              className={`p-3 rounded-xl border shrink-0 transition-all ${isNarrating ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-gold-main/10 border-gold-main/20 text-gold-main hover:bg-gold-main/20'}`}
            >
              {isThinking ? <Loader2 size={16} className="animate-spin" /> : isNarrating ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </div>
        </div>

        {/* Pro-Tip and Misconception Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tip Block */}
          <div className="p-8 bg-gold-main/5 border border-gold-main/20 rounded-[2.5rem] space-y-4 relative overflow-hidden group/tip shadow-xl">
            <div className="absolute top-0 right-0 p-6 opacity-[0.04] group-hover/tip:scale-110 transition-transform">
              <Lightbulb size={120} className="text-gold-main" />
            </div>
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4 text-gold-main">
                <div className="p-2 bg-gold-main/10 rounded-lg border border-gold-main/20">
                  <Lightbulb size={18} />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.3em]">Faculty Protocol</span>
              </div>
              <button 
                onClick={() => narrate(tip)}
                disabled={isThinking}
                className={`p-2 rounded-lg border transition-all ${isNarrating ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-gold-main/10 border-gold-main/20 text-gold-main hover:bg-gold-main/20'}`}
              >
                {isThinking ? <Loader2 size={12} className="animate-spin" /> : isNarrating ? <VolumeX size={12} /> : <Volume2 size={12} />}
              </button>
            </div>
            <p className="text-lg text-slate-200 font-serif italic leading-relaxed relative z-10 pr-6">
              "{tip}"
            </p>
          </div>

          {/* Misconception Block */}
          <div className="p-8 bg-red-500/5 border border-red-500/20 rounded-[2.5rem] space-y-4 relative overflow-hidden group/trap shadow-xl">
            <div className="absolute top-0 right-0 p-6 opacity-[0.04] group-hover/trap:scale-110 transition-transform">
              <ShieldAlert size={120} className="text-red-500" />
            </div>
            <div className="flex items-center gap-4 text-red-500 relative z-10">
              <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                <ShieldAlert size={18} />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.3em]">The Signal Lie</span>
            </div>
            <p className="text-lg text-slate-200 font-sans italic leading-relaxed relative z-10 pr-6">
              "{misconception}"
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-20 border-t border-white/10 pt-20">
      <div className="flex items-center gap-4 mb-16">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
        <div className="flex items-center gap-3 px-6 py-2 bg-slate-950 border border-white/10 rounded-full">
            <Target size={14} className="text-gold-main" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/60">Acoustic Logic Notes</span>
        </div>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
      </div>
      
      {blocks.length > 0 ? (
        <div className="max-w-5xl mx-auto">
            {blocks}
        </div>
      ) : (
        <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-[3rem] opacity-20 max-w-2xl mx-auto">
            <Brain size={48} className="mx-auto mb-6" />
            <p className="text-xs font-black uppercase tracking-[0.4em]">Establishing resonance with node data...</p>
        </div>
      )}
    </div>
  );
};

export default InteractiveLectureNotes;
