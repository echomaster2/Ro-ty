
import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, X, Loader2, Waves, Zap, Bot, ShieldCheck, Quote } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface DailyMercyProps {
  onClose: () => void;
}

const DailyMercy: React.FC<DailyMercyProps> = ({ onClose }) => {
  const [message, setMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    generateMercy();
  }, []);

  const generateMercy = async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "You are 'Mother', a warm, maternal figure supporting an ultrasound student. Provide a daily encouragement titled 'Mercies New Everyday'. Max 50 words. Sign it 'Love, Mother'.",
      });
      setMessage(response.text || "Every wave has its purpose, and so do you. Love, Mother.");
    } catch (e) {
      setMessage("Though the signal is weak, my belief in you is strong. Love, Mother.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-950/80 backdrop-blur-2xl flex items-center justify-center p-4 md:p-6 animate-fade-in">
      <div className="w-full max-w-xl bg-[#FDFCF8] border-2 border-gold-main/20 rounded-[2.5rem] md:rounded-[4rem] shadow-3xl overflow-hidden relative animate-slide-up group">
        {/* Paper Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]"></div>
        
        {/* Header Decor */}
        <div className="px-6 md:px-12 py-6 md:py-10 border-b border-gold-main/10 flex justify-between items-center relative z-10">
          <div className="flex items-center gap-3 md:gap-6">
             <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-[2rem] bg-gold-main text-slate-950 flex items-center justify-center shadow-gold">
               <Heart size={20} className="md:w-8 md:h-8" fill="currentColor" />
             </div>
             <div>
               <h3 className="text-base md:text-3xl font-serif font-bold text-slate-900 italic leading-none">Mercies New Everyday</h3>
               <p className="text-[7px] md:text-[10px] font-black text-gold-main/80 uppercase tracking-[0.3em] mt-1 md:mt-2">Maternal Sanctuary</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 md:p-4 bg-slate-900/5 hover:bg-slate-900/10 rounded-xl transition-all">
            <X size={18} className="md:w-6 md:h-6 text-slate-400" />
          </button>
        </div>

        <div className="p-6 md:p-14 space-y-6 md:space-y-12 relative z-10 text-left">
           {isGenerating ? (
             <div className="py-12 md:py-24 flex flex-col items-center gap-4 md:gap-6 text-center">
                <Loader2 size={32} className="md:w-14 md:h-14 animate-spin text-gold-main" />
                <p className="text-slate-500 font-serif italic text-sm md:text-xl">Establishing resonance...</p>
             </div>
           ) : (
             <div className="space-y-6 md:space-y-10 animate-fade-in">
                <p className="text-lg md:text-4xl text-slate-800 font-serif italic leading-relaxed font-medium drop-shadow-sm">
                  "{message}"
                </p>
                
                <div className="pt-6 md:pt-10 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
                   <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-[7px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest">Resonance: PURE</span>
                   </div>
                   <button 
                     onClick={onClose}
                     className="w-full md:w-auto px-10 py-4 bg-slate-900 text-white rounded-xl md:rounded-2xl font-black uppercase text-[9px] md:text-[10px] tracking-widest shadow-2xl transition-all active:scale-95"
                   >
                     Blessings Received
                   </button>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default DailyMercy;
