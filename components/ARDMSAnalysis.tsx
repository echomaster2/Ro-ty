
import React from 'react';
import { motion } from 'framer-motion';
import { X, BookOpen, AlertTriangle, ChevronRight, Sparkles } from 'lucide-react';
import { criticalConcepts, commonPitfalls } from '../data/ardmsAnalysis';

interface ARDMSAnalysisProps {
  onClose: () => void;
}

const ARDMSAnalysis: React.FC<ARDMSAnalysisProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={onClose} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-5xl bg-slate-900 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-main/10 flex items-center justify-center border border-gold-main/20">
              <BookOpen className="text-gold-main w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-white italic tracking-tight">ARDMS® Study Matrix Analysis</h2>
              <p className="text-[10px] font-black text-gold-main/60 uppercase tracking-[0.2em]">Critical Concepts & Strategic Pitfalls</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Critical Concepts */}
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <Sparkles className="text-gold-main w-5 h-5" />
                <h3 className="text-xl font-serif font-bold text-white italic uppercase tracking-widest">Top Critical Concepts</h3>
              </div>
              
              <div className="space-y-4">
                {criticalConcepts.map((concept, idx) => (
                  <div key={idx} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-2 group hover:border-gold-main/30 transition-all">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-gold-main/40 uppercase tracking-widest">Node {idx + 1}</span>
                      <h4 className="text-lg font-serif font-bold text-white italic">{concept.title}</h4>
                    </div>
                    <p className="text-sm text-slate-400 font-light italic leading-relaxed">{concept.summary}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Common Pitfalls */}
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-red-500 w-5 h-5" />
                <h3 className="text-xl font-serif font-bold text-white italic uppercase tracking-widest">Common Exam Pitfalls</h3>
              </div>

              <div className="space-y-4">
                {commonPitfalls.map((pitfall, idx) => (
                  <div key={idx} className="p-6 bg-red-500/5 border border-red-500/10 rounded-3xl space-y-3 group hover:border-red-500/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 text-[10px] font-black">!</div>
                      <h4 className="text-lg font-serif font-bold text-white italic">{pitfall.title}</h4>
                    </div>
                    <p className="text-sm text-slate-400 font-light italic leading-relaxed">{pitfall.explanation}</p>
                  </div>
                ))}
              </div>

              {/* Strategic Advice */}
              <div className="p-8 bg-gold-main rounded-3xl space-y-4 shadow-gold">
                <h3 className="text-xl font-serif font-bold text-slate-950 italic uppercase leading-none">Strategic <span className="text-white not-italic">Advice</span></h3>
                <p className="text-slate-900/70 text-sm font-light italic leading-relaxed">
                  The SPI exam is 70% application and 30% recall. Don't just memorize definitions; understand how changing one parameter (like frequency) affects others (like depth, resolution, and attenuation).
                </p>
                <button 
                  onClick={onClose}
                  className="px-6 py-3 bg-slate-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-slate-950 transition-all"
                >
                  Return to Study
                </button>
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ARDMSAnalysis;
