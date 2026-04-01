import React from 'react';
import { Check, ShieldCheck, Sun, Sparkles, Zap, Infinity, Star, Heart, ArrowRight, Headphones } from 'lucide-react';

interface PricingProps {
  onEnroll?: () => void;
  onOpenResurrection?: () => void;
  currentPlan?: string;
}

const Pricing: React.FC<PricingProps> = ({ onEnroll, onOpenResurrection, currentPlan = 'free' }) => {
  const isPlanActive = (plan: string) => currentPlan.toLowerCase() === plan.toLowerCase();

  return (
    <div id="pricing" className="py-16 md:py-32 bg-transparent relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-10 relative z-10 text-center">
        <div className="mb-12 md:mb-24 space-y-4 md:space-y-6">
          <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-full bg-gold-main/10 border border-gold-main/20 text-[10px] md:text-[11px] font-black text-gold-main uppercase tracking-widest md:tracking-[0.4em] mx-auto">
            <ShieldCheck size={14} /> Enrollment Protocol
          </div>
          <h2 className="text-3xl md:text-7xl font-serif font-bold text-white tracking-tighter italic uppercase">Enrollment <span className="text-gold-main not-italic">Plans</span></h2>
          <p className="text-base md:text-xl text-slate-400 font-light font-sans max-w-xl mx-auto italic leading-relaxed opacity-80 px-4">Select the acoustic vector for your clinical timeline.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-8 items-stretch px-4">
          
          {/* Free Tier */}
          <div className="group relative">
            <div className={`relative h-full bg-slate-900/20 backdrop-blur-3xl border p-8 flex flex-col rounded-[2rem] transition-all duration-700 shadow-xl hover:bg-slate-900/40 ${isPlanActive('free') ? 'border-gold-main/40 bg-gold-main/5' : 'border-white/5'}`}>
                {isPlanActive('free') && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gold-main text-slate-950 text-[8px] font-black uppercase tracking-widest rounded-full shadow-gold">Current Protocol</div>
                )}
                <div className="mb-6 text-left">
                    <h3 className="text-xl font-serif font-bold text-white mb-1 uppercase italic">Guest Protocol</h3>
                    <p className="text-white/20 text-[10px] uppercase tracking-widest font-black">Entry Level</p>
                </div>
                
                <div className="flex items-baseline mb-8 text-left">
                    <span className="text-4xl font-serif font-bold text-white tracking-tighter">$0</span>
                    <span className="ml-2 text-white/20 font-sans text-base">/ free</span>
                </div>
                
                <ul className="space-y-4 mb-8 flex-1 font-sans text-sm text-slate-500 text-left italic">
                    <li className="flex items-start gap-3"><Check className="w-4 h-4 mt-1 text-white/20 shrink-0" /><span>First 3 Modules Unlocked</span></li>
                    <li className="flex items-start gap-3"><Check className="w-4 h-4 mt-1 text-white/20 shrink-0" /><span>Basic Flashcard Access</span></li>
                    <li className="flex items-start gap-3"><Check className="w-4 h-4 mt-1 text-white/20 shrink-0" /><span>Public Leaderboard</span></li>
                    <li className="flex items-start gap-3"><Check className="w-4 h-4 mt-1 text-white/20 shrink-0" /><span>Site Radio (Limited)</span></li>
                </ul>
                
                <button 
                    disabled={isPlanActive('free')}
                    onClick={onEnroll}
                    className={`w-full py-5 font-black rounded-xl uppercase tracking-widest text-[11px] border active:scale-95 transition-all flex items-center justify-center ${isPlanActive('free') ? 'bg-white/5 text-white/20 border-white/5 cursor-default' : 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10'}`}
                >
                    {isPlanActive('free') ? 'Protocol Active' : 'Start Free Protocol'}
                </button>
            </div>
          </div>

          {/* Monthly Plan */}
          <div className="group relative">
            <div className={`relative h-full bg-slate-900/40 backdrop-blur-3xl border p-8 flex flex-col rounded-[2rem] transition-all duration-700 shadow-2xl ${isPlanActive('monthly') ? 'border-gold-main/40 bg-gold-main/5' : 'border-white/5'}`}>
                {isPlanActive('monthly') && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gold-main text-slate-950 text-[8px] font-black uppercase tracking-widest rounded-full shadow-gold">Current Protocol</div>
                )}
                <div className="mb-6 text-left">
                    <h3 className="text-xl font-serif font-bold text-white mb-1 uppercase italic">Monthly Pro</h3>
                    <p className="text-white/30 text-[10px] uppercase tracking-widest font-black">Flexible Access</p>
                </div>
                
                <div className="flex items-baseline mb-8 text-left">
                    <span className="text-4xl font-serif font-bold text-white tracking-tighter">$44</span>
                    <span className="ml-2 text-white/30 font-sans text-base">/ mo</span>
                </div>
                
                <ul className="space-y-4 mb-8 flex-1 font-sans text-sm text-slate-400 text-left italic">
                    <li className="flex items-start gap-3"><Check className="w-4 h-4 mt-1 text-gold-main/60 shrink-0" /><span>All Physics Modules Unlocked</span></li>
                    <li className="flex items-start gap-3"><Check className="w-4 h-4 mt-1 text-gold-main/60 shrink-0" /><span>Simulation Lab Access</span></li>
                    <li className="flex items-start gap-3"><Check className="w-4 h-4 mt-1 text-gold-main/60 shrink-0" /><span>AI Narrations (Standard)</span></li>
                    <li className="flex items-start gap-3"><Check className="w-4 h-4 mt-1 text-gold-main/60 shrink-0" /><span>Full Flashcard Vault</span></li>
                </ul>
                
                <a 
                    href={isPlanActive('monthly') ? "#" : "https://buy.stripe.com/aFaaEWfHJdLc6465tRafS0g"}
                    target={isPlanActive('monthly') ? "_self" : "_blank"}
                    rel="noopener noreferrer"
                    className={`w-full py-5 font-black rounded-xl uppercase tracking-widest text-[11px] border active:scale-95 transition-all flex items-center justify-center ${isPlanActive('monthly') ? 'bg-white/5 text-white/20 border-white/5 cursor-default' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'}`}
                >
                    {isPlanActive('monthly') ? 'Protocol Active' : 'Initiate Monthly Link'}
                </a>
            </div>
          </div>

          {/* Annual Plan - Featured */}
          <div className="relative group">
             <div className="absolute -inset-1 bg-gold-main/10 rounded-[2.5rem] blur-2xl opacity-40"></div>
             
             <div className={`relative h-full bg-slate-900 border-2 p-8 flex flex-col rounded-[2.2rem] shadow-gold-dim text-left ${isPlanActive('annual') ? 'border-gold-main' : 'border-gold-main/50'}`}>
                {isPlanActive('annual') ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gold-main text-slate-950 text-[8px] font-black uppercase tracking-widest rounded-full shadow-gold">Current Protocol</div>
                ) : (
                  <div className="absolute top-6 right-8 flex items-center gap-2">
                      <Star size={14} className="text-gold-main fill-gold-main animate-pulse" />
                      <span className="text-[10px] font-black uppercase text-gold-main tracking-widest">BEST VALUE</span>
                  </div>
                )}
                
                <div className="mb-6 pt-4">
                    <h3 className="text-2xl font-serif font-bold text-white mb-1 uppercase italic">Annual Resonance</h3>
                    <p className="text-gold-main/60 text-[10px] uppercase tracking-widest font-black">Full Optimization</p>
                </div>
                
                <div className="flex items-baseline mb-8">
                    <span className="text-5xl font-serif font-bold text-white tracking-tighter">$143</span>
                    <span className="ml-2 text-white/40 font-sans text-lg">/ year</span>
                </div>
                
                <ul className="space-y-4 mb-8 flex-1 font-sans text-base text-slate-300 italic">
                    <li className="flex items-start gap-3"><Sparkles className="w-5 h-5 text-gold-main mt-1 shrink-0" /><span className="text-white">Mock Exam Vault Access</span></li>
                    <li className="flex items-start gap-3"><Check className="w-5 h-5 text-gold-main mt-1 shrink-0" /><span>Interactive Artifact Catalog</span></li>
                    <li className="flex items-start gap-3"><Check className="w-5 h-5 text-gold-main mt-1 shrink-0" /><span>Priority Support Line</span></li>
                    <li className="flex items-start gap-3"><Check className="w-5 h-5 text-gold-main mt-1 shrink-0" /><span>Neural EXP Multiplier</span></li>
                </ul>
                
                <a 
                    href={isPlanActive('annual') ? "#" : "https://buy.stripe.com/8x228q0MPdLc8ce5tRafS06"}
                    target={isPlanActive('annual') ? "_self" : "_blank"}
                    rel="noopener noreferrer"
                    className={`w-full py-6 font-black rounded-2xl transition-all uppercase tracking-[0.3em] text-xs shadow-gold active:scale-95 flex items-center justify-center ${isPlanActive('annual') ? 'bg-gold-main/20 text-gold-main/40 cursor-default' : 'bg-gold-main text-slate-900 hover:shadow-gold-strong'}`}
                >
                    {isPlanActive('annual') ? 'Protocol Active' : 'Enroll One Year'}
                </a>
             </div>
          </div>

          {/* Lifetime Plan */}
          <div className="group relative">
            <div className={`relative h-full bg-slate-900/40 backdrop-blur-3xl border p-8 flex flex-col rounded-[2rem] transition-all duration-700 shadow-2xl ${isPlanActive('lifetime') ? 'border-gold-main/40 bg-gold-main/5' : 'border-white/5'}`}>
                {isPlanActive('lifetime') && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gold-main text-slate-950 text-[8px] font-black uppercase tracking-widest rounded-full shadow-gold">Current Protocol</div>
                )}
                <div className="mb-6 text-left">
                    <h3 className="text-xl font-serif font-bold text-white mb-1 uppercase italic">Eternal Matrix</h3>
                    <p className="text-white/30 text-[10px] uppercase tracking-widest font-black">Infinite Access</p>
                </div>
                
                <div className="flex items-baseline mb-8 text-left">
                    <span className="text-4xl font-serif font-bold text-white tracking-tighter">$350</span>
                    <span className="ml-2 text-white/30 font-sans text-base">one-time</span>
                </div>
                
                <ul className="space-y-4 mb-8 flex-1 font-sans text-sm text-slate-400 text-left italic">
                    <li className="flex items-start gap-3"><Check className="w-4 h-4 mt-1 text-gold-main/60 shrink-0" /><span>Lifetime Updates</span></li>
                    <li className="flex items-start gap-3"><Check className="w-4 h-4 mt-1 text-gold-main/60 shrink-0" /><span>All Future Clinical Sims</span></li>
                    <li className="flex items-start gap-3"><Check className="w-4 h-4 mt-1 text-gold-main/60 shrink-0" /><span>Podcast Node Archive</span></li>
                    <li className="flex items-start gap-3"><Check className="w-4 h-4 mt-1 text-gold-main/60 shrink-0" /><span>Exclusive Beta Sectors</span></li>
                </ul>
                
                <a 
                    href={isPlanActive('lifetime') ? "#" : "https://buy.stripe.com/00w6oGanpcH8boq5tRafS0e"}
                    target={isPlanActive('lifetime') ? "_self" : "_blank"}
                    rel="noopener noreferrer"
                    className={`w-full py-5 font-black rounded-xl uppercase tracking-widest text-[11px] border active:scale-95 transition-all flex items-center justify-center ${isPlanActive('lifetime') ? 'bg-white/5 text-white/20 border-white/5 cursor-default' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'}`}
                >
                    {isPlanActive('lifetime') ? 'Protocol Active' : 'Secure Eternal Link'}
                </a>
            </div>
          </div>
        </div>
        
        {/* Detailed Feature Comparison */}
        <div className="mt-20 md:mt-32 text-left max-w-4xl mx-auto px-4">
          <h3 className="text-xl md:text-3xl font-serif font-bold text-white mb-8 uppercase italic border-b border-white/10 pb-4">Protocol <span className="text-gold-main">Comparison</span></h3>
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-gold-main font-black uppercase text-xs tracking-widest flex items-center gap-2">
                  <Check size={14} /> Core Education
                </h4>
                <p className="text-slate-400 text-sm italic leading-relaxed">
                  All plans include access to our high-fidelity visual rigs and foundational physics modules. Free users can access the first 3 modules of the Waves & Sound sector.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="text-gold-main font-black uppercase text-xs tracking-widest flex items-center gap-2">
                  <Zap size={14} /> Simulation Lab
                </h4>
                <p className="text-slate-400 text-sm italic leading-relaxed">
                  Pro and Resonance plans unlock the full Simulation Lab, including advanced Doppler physics and artifact identification rigs.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="text-gold-main font-black uppercase text-xs tracking-widest flex items-center gap-2">
                  <Headphones size={14} /> Echo Chamber
                </h4>
                <p className="text-slate-400 text-sm italic leading-relaxed">
                  Full access to the Suno-synced podcast node archive is reserved for Pro and Eternal members. Free users get a curated selection of foundational tracks.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="text-gold-main font-black uppercase text-xs tracking-widest flex items-center gap-2">
                  <ShieldCheck size={14} /> Board Readiness
                </h4>
                <p className="text-slate-400 text-sm italic leading-relaxed">
                  Annual and Eternal plans include the Mock Exam Vault with 1,000+ high-yield questions and detailed faculty explanations.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Resurrection Offer Section */}
        <div className="mt-16 md:mt-24 max-w-5xl mx-auto px-4">
          <div className="p-8 md:p-14 bg-red-500/5 border border-red-500/20 rounded-[2.5rem] md:rounded-[4rem] flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 group relative overflow-hidden shadow-3xl">
            <div className="absolute top-0 right-0 p-4 md:p-8 opacity-5"><Heart size={200} className="text-red-500" /></div>
            <div className="space-y-4 md:space-y-6 text-center md:text-left flex-1 relative z-10">
              <div className="flex items-center gap-3 text-red-500 justify-center md:justify-start">
                <ShieldCheck size={20} />
                <span className="text-[11px] md:text-[12px] font-black uppercase tracking-[0.4em]">Resilience Scholarship</span>
              </div>
              <h3 className="text-2xl md:text-5xl font-serif font-bold text-white italic tracking-tighter uppercase leading-tight">Failed 2+ Times? <br className="hidden md:block" /> We See You.</h3>
              <p className="text-base md:text-xl text-slate-300 font-light italic leading-relaxed max-w-xl mx-auto md:mx-0">
                EchoMasters offers a <span className="text-red-400 font-bold underline decoration-red-400/30 underline-offset-4">Resilience Pass</span> at no cost to specialists who persist.
              </p>
            </div>
            <button 
              onClick={onOpenResurrection}
              className="w-full md:w-auto px-12 md:px-16 py-6 md:py-8 bg-white text-slate-950 font-black rounded-2xl md:rounded-[2.5rem] uppercase tracking-widest text-xs md:text-sm shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4 hover:scale-105"
            >
              Apply Now <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;