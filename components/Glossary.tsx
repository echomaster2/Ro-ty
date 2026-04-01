import React, { useState, useMemo } from 'react';
import { 
  Search, 
  SortAsc, 
  SortDesc, 
  Book, 
  ArrowLeft,
  Terminal,
  Info,
  Hash,
  Type,
  Volume2,
  VolumeX,
  Loader2
} from 'lucide-react';
import { useNarrator } from '../src/hooks/useNarrator';

interface GlossaryEntry {
  term: string;
  definition: string;
  category: string;
  isAcronym: boolean;
}

const glossaryData: GlossaryEntry[] = [
  { term: "Acoustic Impedance", definition: "The resistance to sound travel in a medium, calculated as density multiplied by propagation speed (Z = ρc).", category: "Fundamentals", isAcronym: false },
  { term: "ALARA", definition: "As Low As Reasonably Achievable; the principle of minimizing patient exposure to ultrasound energy by using the lowest output power and shortest scan time.", category: "Safety", isAcronym: true },
  { term: "Aliasing", definition: "A visual artifact in Pulsed Wave Doppler where high velocities appear to flow in the opposite direction because the Doppler shift exceeds the Nyquist limit.", category: "Doppler", isAcronym: false },
  { term: "Amplitude", definition: "The 'bigness' of a wave; the difference between the maximum value and the average value of an acoustic variable.", category: "Fundamentals", isAcronym: false },
  { term: "Attenuation", definition: "The weakening of sound as it travels through tissue due to absorption, reflection, and scattering.", category: "Fundamentals", isAcronym: false },
  { term: "Axial Resolution", definition: "The ability to distinguish two structures that are parallel to the sound beam's main axis (LARRD).", category: "Resolution", isAcronym: false },
  { term: "B-Mode", definition: "Brightness mode; the basis for real-time gray-scale imaging where echo strength is represented by pixel brightness.", category: "Instrumentation", isAcronym: true },
  { term: "Backing Material", definition: "Damping material bonded to the back of the PZT crystal to reduce ringing and shorten pulses, improving axial resolution.", category: "Instrumentation", isAcronym: false },
  { term: "Bernoulli Principle", definition: "The principle stating that as the speed of a fluid increases, the pressure within the fluid decreases.", category: "Hemodynamics", isAcronym: false },
  { term: "Bit", definition: "The smallest unit of computer memory; the number of bits per pixel determines the number of shades of gray (contrast resolution).", category: "Digital", isAcronym: false },
  { term: "Cavitation", definition: "The interaction of sound waves with microscopic gas bubbles in tissue, categorized as stable or transient.", category: "Safety", isAcronym: false },
  { term: "Compression", definition: "The region of high pressure and high density in a longitudinal sound wave.", category: "Fundamentals", isAcronym: false },
  { term: "Contrast Agents", definition: "Gas-filled microbubbles injected into the bloodstream to enhance reflections and visualize blood flow or harmonics.", category: "Advanced", isAcronym: false },
  { term: "Dead Zone", definition: "The region closest to the transducer face where no useful clinical information can be obtained due to pulse length.", category: "QA", isAcronym: false },
  { term: "Doppler Shift", definition: "The change in frequency of a wave in relation to an observer who is moving relative to the wave source (blood flow).", category: "Doppler", isAcronym: false },
  { term: "Duty Factor", definition: "The percentage or fraction of time that the ultrasound system is actually transmitting sound pulses.", category: "Fundamentals", isAcronym: false },
  { term: "Elastography", definition: "An imaging modality that maps the elastic properties and stiffness of soft tissue.", category: "Advanced", isAcronym: false },
  { term: "Frequency", definition: "The number of complete cycles that occur in one second, measured in Hertz (Hz).", category: "Fundamentals", isAcronym: false },
  { term: "Harmonics", definition: "Secondary frequencies created by non-linear propagation of sound through tissue, typically twice the fundamental frequency.", category: "Harmonics", isAcronym: false },
  { term: "Lateral Resolution", definition: "The ability to distinguish two structures that are side-by-side or perpendicular to the sound beam's main axis (LATA).", category: "Resolution", isAcronym: false },
  { term: "Matching Layer", definition: "A layer with impedance between the PZT crystal and tissue, typically 1/4 wavelength thick, to increase transmission.", category: "Instrumentation", isAcronym: false },
  { term: "Mechanical Index (MI)", definition: "An on-screen indicator of the potential for mechanical bioeffects, specifically cavitation.", category: "Safety", isAcronym: true },
  { term: "Nyquist Limit", definition: "The highest Doppler shift that can be measured without aliasing, equal to one-half of the PRF.", category: "Doppler", isAcronym: false },
  { term: "Period", definition: "The time it takes for one complete cycle to occur.", category: "Fundamentals", isAcronym: false },
  { term: "Piezoelectric Effect", definition: "The property of certain materials to create a voltage when mechanically deformed, or to deform when a voltage is applied.", category: "Instrumentation", isAcronym: false },
  { term: "Pixel", definition: "The smallest building block of a digital picture; high pixel density improves spatial resolution.", category: "Digital", isAcronym: false },
  { term: "Poiseuille's Law", definition: "The law describing the relationship between flow rate, pressure gradient, and resistance in a vessel.", category: "Hemodynamics", isAcronym: false },
  { term: "PRF", definition: "Pulse Repetition Frequency; the number of pulses that an ultrasound system transmits into the body each second.", category: "Fundamentals", isAcronym: true },
  { term: "PRP", definition: "Pulse Repetition Period; the time from the start of one pulse to the start of the next pulse, including 'on' and 'off' time.", category: "Fundamentals", isAcronym: true },
  { term: "PZT", definition: "Lead Zirconate Titanate; the most common synthetic piezoelectric material used in ultrasound transducers.", category: "Instrumentation", isAcronym: true },
  { term: "Rarefaction", definition: "The region of low pressure and low density in a longitudinal sound wave.", category: "Fundamentals", isAcronym: false },
  { term: "Refraction", definition: "The bending of a sound beam as it passes from one medium to another at an oblique angle with different propagation speeds.", category: "Fundamentals", isAcronym: false },
  { term: "Reynolds Number", definition: "A dimensionless number used to predict whether blood flow will be laminar or turbulent; turbulence occurs above 2000.", category: "Hemodynamics", isAcronym: false },
  { term: "SPL", definition: "Spatial Pulse Length; the distance from the start to the end of a single pulse.", category: "Fundamentals", isAcronym: true },
  { term: "Thermal Index (TI)", definition: "An on-screen indicator of the potential for tissue heating (TIS, TIB, or TIC).", category: "Safety", isAcronym: true },
  { term: "Wavelength", definition: "The distance or length of one complete cycle.", category: "Fundamentals", isAcronym: false },
  { term: "LARRD", definition: "Mnemonic for Axial Resolution: Longitudinal, Axial, Range, Radial, Depth.", category: "Resolution", isAcronym: true },
  { term: "LATA", definition: "Mnemonic for Lateral Resolution: Lateral, Angular, Transverse, Azimuthal.", category: "Resolution", isAcronym: true },
  { term: "TGC", definition: "Time Gain Compensation; receiver function that compensates for attenuation at specific depths.", category: "Instrumentation", isAcronym: true },
  { term: "Snell's Law", definition: "The physics law that defines the physics of refraction.", category: "Fundamentals", isAcronym: false },
];

interface GlossaryProps {
  onExit: () => void;
}

const Glossary: React.FC<GlossaryProps> = ({ onExit }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const { narrate, isNarrating, isThinking } = useNarrator();

  const categories = useMemo(() => {
    const cats = new Set(glossaryData.map(item => item.category));
    return ["All", ...Array.from(cats).sort()];
  }, []);

  const filteredData = useMemo(() => {
    let data = glossaryData.filter(item => 
      item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.definition.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filterCategory !== "All") {
      data = data.filter(item => item.category === filterCategory);
    }

    return data.sort((a, b) => {
      if (sortOrder === 'asc') return a.term.localeCompare(b.term);
      return b.term.localeCompare(a.term);
    });
  }, [searchQuery, sortOrder, filterCategory]);

  return (
    <div className="max-w-6xl mx-auto py-10 md:py-20 px-6 animate-fade-in">
      <div className="space-y-12">
        {/* Header */}
        <div className="flex flex-col md:row justify-between items-start md:items-end gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gold-main">
              <Book size={20} />
              <span className="text-xs font-black uppercase tracking-[0.4em]">Acoustic Lexicon</span>
            </div>
            <h2 className="text-4xl md:text-7xl font-serif font-bold text-white italic tracking-tighter uppercase">
              Technical <span className="text-gold-main not-italic">Glossary</span>
            </h2>
            <p className="text-lg text-slate-400 font-light italic leading-relaxed max-w-xl">
              A comprehensive directory of acoustic parameters, clinical acronyms, and hemodynamic laws.
            </p>
          </div>
          <button 
            onClick={onExit}
            className="px-6 py-3 bg-white/5 border border-white/10 text-white/40 hover:text-white rounded-xl transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest"
          >
            <ArrowLeft size={16} /> Return to Hub
          </button>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-6 relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-gold-main transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search terms or definitions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white placeholder:text-white/20 focus:outline-none focus:border-gold-main/50 transition-all shadow-xl"
            />
          </div>
          
          <div className="lg:col-span-3">
            <div className="relative">
              <select 
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-2xl py-5 px-6 text-white appearance-none focus:outline-none focus:border-gold-main/50 transition-all shadow-xl cursor-pointer text-sm font-medium"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                <ChevronRight size={16} className="rotate-90" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 flex gap-2">
            <button 
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex-1 bg-slate-900 border border-white/10 rounded-2xl py-5 px-6 text-white flex items-center justify-center gap-3 hover:bg-white/5 transition-all shadow-xl group"
            >
              {sortOrder === 'asc' ? <SortAsc size={20} className="text-gold-main" /> : <SortDesc size={20} className="text-gold-main" />}
              <span className="text-[10px] font-black uppercase tracking-widest">Sort {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}</span>
            </button>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredData.length > 0 ? (
            filteredData.map((entry, idx) => (
              <div 
                key={idx}
                className="p-8 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] space-y-6 hover:border-gold-main/30 transition-all group animate-slide-up"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-serif font-bold text-white italic group-hover:text-gold-main transition-colors">
                        {entry.term}
                      </h3>
                      {entry.isAcronym && (
                        <span className="px-2 py-0.5 bg-gold-main/10 border border-gold-main/20 rounded-md text-[8px] font-black text-gold-main uppercase tracking-tighter">
                          Acronym
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-black text-white/20 uppercase tracking-widest">
                      <Terminal size={10} />
                      <span>{entry.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/10 group-hover:text-gold-main/40 transition-colors">
                      {entry.isAcronym ? <Type size={18} /> : <Hash size={18} />}
                    </div>
                    <button 
                      onClick={() => narrate(`${entry.term}. ${entry.definition}`)}
                      disabled={isThinking}
                      className={`p-2 rounded-lg border transition-all ${isNarrating ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-white/5 border-white/10 text-white/20 hover:text-white'}`}
                    >
                      {isThinking ? <Loader2 size={12} className="animate-spin" /> : isNarrating ? <VolumeX size={12} /> : <Volume2 size={12} />}
                    </button>
                  </div>
                </div>
                
                <p className="text-slate-300 font-serif italic leading-relaxed text-lg border-l border-gold-main/20 pl-6">
                  {entry.definition}
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center space-y-6 bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem]">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/10">
                <Search size={40} />
              </div>
              <div className="space-y-2">
                <h4 className="text-2xl font-serif font-bold text-white italic">No resonance found</h4>
                <p className="text-slate-500 font-light italic">Try adjusting your search parameters or category filter.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ChevronRight = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

export default Glossary;
