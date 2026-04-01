import React from 'react';
import { BookOpen, Target, Brain, Video, Sparkles, Heart } from 'lucide-react';
import HarveyAvatar from './HarveyAvatar';

const Features: React.FC = () => {
  const benefits = [
    {
      icon: <Target className="w-10 h-10 text-gold-main" />,
      title: "Targeted Physics",
      description: "We carefully select the concepts you truly need, distilling the vast syllabus into focused, clinical insights."
    },
    {
      icon: <Brain className="w-10 h-10 text-gold-main" />,
      title: "Cognitive Clarity",
      description: "Master the mechanics of sound with psychological protocols designed to maintain focus during high-pressure exams."
    },
    {
      icon: <BookOpen className="w-10 h-10 text-gold-main" />,
      title: "Interactive Wisdom",
      description: "Explore Doppler and Artifacts through intuitive simulations that make complex physics feel natural and accessible."
    },
    {
      icon: <Video className="w-10 h-10 text-gold-main" />,
      title: "Luminous Visuals",
      description: "Sound waves are made visible through cinema-grade simulations, helping you visualize what you scan."
    }
  ];

  return (
    <div id="features" className="relative py-24 md:py-40 bg-transparent overflow-hidden">
      {/* Background Grid Overlay */}
      <div className="absolute inset-0 grid grid-cols-12 pointer-events-none opacity-[0.02]">
        {[...Array(13)].map((_, i) => (
          <div key={i} className="h-full border-r border-white"></div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-left">
        <div className="max-w-4xl mb-20 md:mb-32 space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-[1px] w-12 bg-gold-main/40"></div>
            <div className="text-[10px] md:text-xs font-mono font-bold text-gold-main/60 uppercase tracking-[0.4em]">SYSTEM_ADVANTAGES</div>
          </div>
          <h2 className="text-4xl md:text-6xl lg:text-8xl font-serif font-bold text-white italic tracking-tighter leading-none">
            Why Choose <span className="text-gradient-gold not-italic">EchoMasters</span>?
          </h2>
          <p className="text-lg md:text-3xl text-slate-400 font-light leading-relaxed font-sans max-w-3xl">
            The SPI Physics exam is your gateway to a professional career. Our approach transforms study into an <span className="text-white italic">elegant clinical journey</span> of discovery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-px bg-white/5 border border-white/10 rounded-[2rem] md:rounded-[4rem] overflow-hidden shadow-2xl">
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className={`group relative p-10 md:p-16 bg-slate-950/40 backdrop-blur-3xl hover:bg-white/[0.02] transition-all duration-700 ${
                index === 0 || index === 3 ? 'md:col-span-7' : 'md:col-span-5'
              }`}
            >
              <div className="absolute top-0 right-0 p-6 text-[10px] font-mono text-white/10 group-hover:text-gold-main/20 transition-colors">
                0{index + 1}
              </div>
              
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-10 group-hover:border-gold-main/40 group-hover:shadow-[0_0_30px_rgba(212,175,55,0.2)] transition-all duration-500">
                <div className="group-hover:scale-110 transition-transform text-gold-main/60 group-hover:text-gold-main">
                  {benefit.icon}
                </div>
              </div>
              
              <div className="space-y-6">
                <h3 className="text-2xl md:text-4xl font-serif font-bold text-white group-hover:text-gold-main transition-colors uppercase italic tracking-tight">
                  {benefit.title}
                </h3>
                <p className="text-slate-400 leading-relaxed text-base md:text-xl font-sans font-light max-w-md">
                  {benefit.description}
                </p>
              </div>

              {/* Technical Detail */}
              <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Module_Status: Optimized</div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`h-1 w-4 rounded-full ${i < 4 ? 'bg-gold-main/40' : 'bg-white/10'}`}></div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Elegant Letter Section */}
        <div className="mt-32 md:mt-48 max-w-6xl mx-auto relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-gold-main/20 via-transparent to-gold-main/20 blur-3xl opacity-20"></div>
            <div className="relative overflow-hidden rounded-[3rem] md:rounded-[5rem] border border-white/10 bg-slate-950/40 backdrop-blur-3xl p-10 md:p-24 shadow-3xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gold-main/5 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold-main/5 blur-[100px] rounded-full"></div>
                
                <div className="flex items-center gap-6 mb-12 md:mb-16">
                  <div className="h-[1px] w-16 bg-gold-main/40"></div>
                  <h3 className="font-serif font-bold text-3xl md:text-5xl text-gold-main tracking-tighter italic uppercase">To the Aspiring Clinician,</h3>
                </div>
                
                <div className="max-w-4xl space-y-8 md:space-y-12">
                    <p className="text-xl md:text-4xl text-slate-300 font-light leading-[1.4] font-sans">
                        If the mechanical principles of physics feel like <span className="text-white italic underline decoration-gold-main/40 underline-offset-8">noise in your path</span>, you have found a place of clarity. Mastery of sound is a peaceful pursuit of precision.
                    </p>
                    <p className="text-lg md:text-2xl text-slate-400 font-light leading-relaxed font-sans">
                        We designed EchoMasters to be your <span className="text-gold-main font-semibold">trusted academic sanctuary</span>. We have refined the vast physics syllabus into a medium that is visually serene, scientifically rigorous, and intuitively guided.
                    </p>
                </div>
                
                <div className="mt-16 md:mt-24 pt-12 md:pt-16 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-8">
                   <div className="flex items-center gap-8">
                      <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-900 rounded-3xl border border-white/10 flex items-center justify-center shadow-2xl overflow-hidden p-1 group-hover:border-gold-main/30 transition-colors">
                         <HarveyAvatar size="md" />
                      </div>
                      <div>
                          <p className="text-xl md:text-2xl font-bold text-white font-serif italic uppercase tracking-tight">EchoMasters Academy</p>
                          <p className="text-[10px] md:text-xs text-gold-main/60 uppercase tracking-[0.4em] font-black mt-3">Board of Sonography Educators</p>
                      </div>
                   </div>
                   <div className="flex flex-col items-end gap-2">
                      <div className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Verification_Code</div>
                      <div className="text-sm font-mono text-white/40 tracking-tighter">EM_ACAD_2026_AUTH_SECURE</div>
                   </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Features;