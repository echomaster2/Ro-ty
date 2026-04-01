import React from 'react';
import { motion } from 'framer-motion';
import { Film, Radio, Mic2, Play, Zap, Monitor, Headphones, ArrowRight, FlaskConical, Activity, Target } from 'lucide-react';

interface ResonanceRoomsProps {
  onNavigate?: (view: string, subView?: string) => void;
}

const ResonanceRooms: React.FC<ResonanceRoomsProps> = ({ onNavigate }) => {
  const [timeOfDay, setTimeOfDay] = React.useState<'dawn' | 'day' | 'dusk' | 'night'>('day');

  React.useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 8) setTimeOfDay('dawn');
    else if (hour >= 8 && hour < 17) setTimeOfDay('day');
    else if (hour >= 17 && hour < 20) setTimeOfDay('dusk');
    else setTimeOfDay('night');
  }, []);

  const timeConfig = React.useMemo(() => {
    switch (timeOfDay) {
      case 'dawn': return { glow: 'bg-orange-500/10', bg: 'bg-slate-950' };
      case 'day': return { glow: 'bg-gold-main/5', bg: 'bg-slate-950' };
      case 'dusk': return { glow: 'bg-purple-500/10', bg: 'bg-slate-950' };
      case 'night': return { glow: 'bg-blue-500/5', bg: 'bg-slate-900' };
      default: return { glow: 'bg-gold-main/5', bg: 'bg-slate-950' };
    }
  }, [timeOfDay]);

  return (
    <section className={`py-24 md:py-40 ${timeConfig.bg} relative overflow-hidden transition-colors duration-1000`}>
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className={`absolute top-1/4 -left-20 w-96 h-96 ${timeConfig.glow} rounded-full blur-[120px] transition-colors duration-1000`}></div>
        <div className={`absolute bottom-1/4 -right-20 w-96 h-96 ${timeConfig.glow} rounded-full blur-[120px] transition-colors duration-1000`}></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center space-y-6 mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-3 text-gold-main"
          >
            <Zap size={18} />
            <span className="text-xs font-black uppercase tracking-[0.5em]">Immersive Environments</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-7xl font-serif font-bold text-white italic tracking-tighter uppercase"
          >
            The <span className="text-gold-main not-italic">Resonance</span> Rooms
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-400 font-light italic max-w-2xl mx-auto"
          >
            Step beyond the textbook. Engage with physics through cinematic visuals, high-fidelity auditory briefings, and interactive simulations.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Media Viewing Room */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative p-10 bg-slate-900 border border-white/10 rounded-[4rem] overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
              <Film size={160} />
            </div>
            
            <div className="space-y-8 relative z-10 flex-1">
              <div className="flex items-center gap-4 text-gold-main">
                <div className="p-4 bg-gold-main/10 rounded-2xl border border-gold-main/20">
                  <Monitor size={24} />
                </div>
                <span className="text-sm font-black uppercase tracking-[0.4em]">Viewing Room</span>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-3xl font-serif font-bold text-white italic uppercase tracking-tight">Visual <span className="text-gold-main not-italic">Theater</span></h3>
                <p className="text-base text-slate-400 font-light italic leading-relaxed">
                  Experience the "Diagnostic Cinema." Watch 9:16 vertical trailers that synthesize complex physics into cinematic clinical briefings.
                </p>
              </div>

              <ul className="space-y-4">
                <RoomFeature icon={Play} text="Veo 3.1 AI Video Generation" />
                <RoomFeature icon={Zap} text="High-Fidelity Clinical Visuals" />
              </ul>
            </div>

            <div className="pt-8">
              <button 
                onClick={() => onNavigate?.('theater')}
                className="w-full py-5 bg-white/5 border border-white/10 rounded-2xl text-gold-main font-black uppercase tracking-widest text-xs group/btn hover:bg-gold-main hover:text-slate-950 transition-all flex items-center justify-center gap-3"
              >
                Explore Theater <ArrowRight size={16} className="group-hover/btn:translate-x-2 transition-transform" />
              </button>
            </div>
          </motion.div>

          {/* Audio Listening Room / Podcast Studio */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="group relative p-10 bg-slate-900 border border-white/10 rounded-[4rem] overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
              <Radio size={160} />
            </div>
            
            <div className="space-y-8 relative z-10 flex-1">
              <div className="flex items-center gap-4 text-gold-main">
                <div className="p-4 bg-gold-main/10 rounded-2xl border border-gold-main/20">
                  <Headphones size={24} />
                </div>
                <span className="text-sm font-black uppercase tracking-[0.4em]">Listening Room</span>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-3xl font-serif font-bold text-white italic uppercase tracking-tight">Echo <span className="text-gold-main not-italic">Chamber</span></h3>
                <p className="text-base text-slate-400 font-light italic leading-relaxed">
                  A dual-purpose studio for auditory mastery. Listen to curated faculty broadcasts or generate your own custom AI lectures.
                </p>
              </div>

              <ul className="space-y-4">
                <RoomFeature icon={Mic2} text="Sonic Architect AI Podcast Gen" />
                <RoomFeature icon={Radio} text="High-Yield Faculty Broadcasts" />
              </ul>
            </div>

            <div className="pt-8">
              <button 
                onClick={() => onNavigate?.('podcast')}
                className="w-full py-5 bg-white/5 border border-white/10 rounded-2xl text-gold-main font-black uppercase tracking-widest text-xs group/btn hover:bg-gold-main hover:text-slate-950 transition-all flex items-center justify-center gap-3"
              >
                Enter Studio <ArrowRight size={16} className="group-hover/btn:translate-x-2 transition-transform" />
              </button>
            </div>
          </motion.div>

          {/* Simulation Lab */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="group relative p-10 bg-slate-900 border border-white/10 rounded-[4rem] overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
              <FlaskConical size={160} />
            </div>
            
            <div className="space-y-8 relative z-10 flex-1">
              <div className="flex items-center gap-4 text-gold-main">
                <div className="p-4 bg-gold-main/10 rounded-2xl border border-gold-main/20">
                  <FlaskConical size={24} />
                </div>
                <span className="text-sm font-black uppercase tracking-[0.4em]">Practice Lab</span>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-3xl font-serif font-bold text-white italic uppercase tracking-tight">Resonance <span className="text-gold-main not-italic">Lab</span></h3>
                <p className="text-base text-slate-400 font-light italic leading-relaxed">
                  Hands-on practice environments. Master complex physics through interactive real-time simulations.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-2">
                <button 
                  onClick={() => onNavigate?.('resonance-lab', 'doppler')}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-gold-main/30 hover:bg-white/10 transition-all text-left group/link"
                >
                  <div className="p-2 rounded-lg bg-gold-main/10 text-gold-main group-hover/link:scale-110 transition-transform">
                    <Activity size={16} />
                  </div>
                  <span className="text-xs font-bold text-white/80 uppercase tracking-widest">Doppler Dynamics</span>
                </button>
                <button 
                  onClick={() => onNavigate?.('resonance-lab', 'beams')}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-gold-main/30 hover:bg-white/10 transition-all text-left group/link"
                >
                  <div className="p-2 rounded-lg bg-gold-main/10 text-gold-main group-hover/link:scale-110 transition-transform">
                    <Target size={16} />
                  </div>
                  <span className="text-xs font-bold text-white/80 uppercase tracking-widest">Beam Mechanics</span>
                </button>
                <button 
                  onClick={() => onNavigate?.('resonance-lab', 'attenuation')}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-gold-main/30 hover:bg-white/10 transition-all text-left group/link"
                >
                  <div className="p-2 rounded-lg bg-gold-main/10 text-gold-main group-hover/link:scale-110 transition-transform">
                    <FlaskConical size={16} />
                  </div>
                  <span className="text-xs font-bold text-white/80 uppercase tracking-widest">Attenuation Lab</span>
                </button>
              </div>
            </div>

            <div className="pt-8">
              <button 
                onClick={() => onNavigate?.('resonance-lab')}
                className="w-full py-5 bg-white/5 border border-white/10 rounded-2xl text-gold-main font-black uppercase tracking-widest text-xs group/btn hover:bg-gold-main hover:text-slate-950 transition-all flex items-center justify-center gap-3"
              >
                Open Full Lab <ArrowRight size={16} className="group-hover/btn:translate-x-2 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const RoomFeature = ({ icon: Icon, text }: { icon: any, text: string }) => (
  <li className="flex items-center gap-4 text-slate-300">
    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gold-main/60">
      <Icon size={14} />
    </div>
    <span className="text-sm font-medium italic">{text}</span>
  </li>
);

export default ResonanceRooms;
