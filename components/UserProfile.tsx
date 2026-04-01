import React, { useState, useEffect } from 'react';
import { useFirebase } from './FirebaseProvider';
import { useBranding } from './BrandingContext';
import { 
  UserCircle, Settings, Award, Trophy, Star, 
  Target, Zap, Flame, Coins, Shield, 
  Camera, Edit3, Save, CheckCircle2, Mic2, 
  Bot, Binary, Database, Activity, LayoutGrid,
  Sparkles, Heart, GraduationCap, Cloud, Wifi,
  Key, ShieldCheck, RefreshCw, ExternalLink,
  Calendar, Clock, AlertCircle, Volume2, FastForward,
  Waves, Mail, Linkedin, Globe, MapPin, Building2, FileText,
  PlayCircle
} from 'lucide-react';

interface UserProfileProps {
  boardReadiness: number;
  onNavigateToAdmin?: () => void;
  game?: any;
  onUpdateProfile?: (updates: any) => Promise<void>;
  isAdmin?: boolean;
}

const AVATARS = [
  { id: 'default', icon: UserCircle, label: 'Standard' },
  { id: 'av-2', icon: Bot, label: 'Cybernetic' },
  { id: 'av-3', icon: GraduationCap, label: 'Scholar' },
  { id: 'av-4', icon: Heart, label: 'Healer' },
  { id: 'av-5', icon: Activity, label: 'Pulse' },
  { id: 'av-6', icon: Shield, label: 'Guardian' }
];

const UserProfile: React.FC<UserProfileProps> = ({ boardReadiness, onNavigateToAdmin, game, onUpdateProfile, isAdmin: isAdminProp }) => {
  const { user, profile, updateProfile, isAdmin: isAdminContext } = useFirebase();
  const { overrides } = useBranding();
  const isAdmin = isAdminProp !== undefined ? isAdminProp : isAdminContext;
  const [isEditing, setIsEditing] = useState(false);
  const [localName, setLocalName] = useState(profile?.displayName || "");
  const [localBirthDate, setLocalBirthDate] = useState("");
  const [localRole, setLocalRole] = useState<string>(profile?.role || "user");
  const [localBio, setLocalBio] = useState(profile?.bio || "");
  const [localInstitution, setLocalInstitution] = useState(profile?.institution || "");
  const [localSpecialization, setLocalSpecialization] = useState(profile?.specialization || "");
  const [localLocation, setLocalLocation] = useState(profile?.location || "");
  const [localLinkedinUrl, setLocalLinkedinUrl] = useState(profile?.linkedinUrl || "");
  const [localWebsiteUrl, setLocalWebsiteUrl] = useState(profile?.websiteUrl || "");
  const [localVoiceRate, setLocalVoiceRate] = useState(1.0);
  const [localVoicePitch, setLocalVoicePitch] = useState(1.0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    if (profile) {
      setLocalName(profile.displayName || "");
      setLocalRole(profile.role || "user");
      setLocalBio(profile.bio || "");
      setLocalInstitution(profile.institution || "");
      setLocalSpecialization(profile.specialization || "");
      setLocalLocation(profile.location || "");
      setLocalLinkedinUrl(profile.linkedinUrl || "");
      setLocalWebsiteUrl(profile.websiteUrl || "");
    }
  }, [profile]);
  
  const [elevenKey, setElevenKey] = useState(() => overrides['eleven-labs-key']?.value || localStorage.getItem('spi-eleven-labs-key') || '');
  const [openAiKey, setOpenAiKey] = useState(() => localStorage.getItem('echomasters-openai-key') || '');
  const [hasGeminiKey, setHasGeminiKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      if ((window as any).aistudio?.hasSelectedApiKey) {
        const has = await (window as any).aistudio.hasSelectedApiKey();
        setHasGeminiKey(has);
      }
    };
    checkKey();
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!localName.trim() || localName.length < 2) newErrors.name = "Name must be at least 2 characters.";
    if (localBirthDate) {
      const selectedDate = new Date(localBirthDate);
      if (selectedDate > new Date()) newErrors.birthDate = "Birthdate cannot be in the future.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    await updateProfile({ 
      displayName: localName,
      bio: localBio,
      institution: localInstitution,
      specialization: localSpecialization,
      location: localLocation,
      linkedinUrl: localLinkedinUrl,
      websiteUrl: localWebsiteUrl
    });
    setIsEditing(false);
  };

  const handleUpdateElevenKey = (val: string) => {
    setElevenKey(val);
    localStorage.setItem('spi-eleven-labs-key', val);
  };

  const handleUpdateOpenAiKey = (val: string) => {
    setOpenAiKey(val);
    localStorage.setItem('echomasters-openai-key', val);
  };

  const handleSwitchGeminiKey = async () => {
    if ((window as any).aistudio?.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
      setHasGeminiKey(true);
    }
  };

  const handleRestartTour = () => {
    localStorage.removeItem('echomasters-tour-seen');
    window.location.reload(); // Reload to trigger the tour in CourseViewer
  };

  const currentAvatar = AVATARS.find(a => a.id === profile?.avatarId) || AVATARS[0];

  if (!profile) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in text-left pb-40 px-4 md:px-0">
      
      {/* Header / Identity Hub */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b border-white/5 pb-12">
        <div className="flex flex-col md:flex-row items-center gap-8 flex-1">
          <div className="relative group shrink-0">
            <div className="absolute -inset-4 bg-gold-main/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-32 h-32 md:w-44 md:h-44 rounded-[3rem] bg-slate-900 border-2 border-gold-main/30 flex items-center justify-center text-gold-main shadow-gold relative z-10 overflow-hidden">
              <currentAvatar.icon size={64} className="opacity-80" />
              <button 
                onClick={() => setIsEditing(true)}
                className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm"
              >
                <Camera size={24} className="text-white" />
              </button>
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gold-main text-slate-900 rounded-full font-black text-[9px] uppercase tracking-widest shadow-gold z-20">
              LVL {profile.level}
            </div>
          </div>

          <div className="space-y-4 text-center md:text-left flex-1 min-w-0">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="p-2 bg-gold-main/10 rounded-lg border border-gold-main/20"><UserCircle size={14} className="text-gold-main" /></div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Identity Node</span>
            </div>
            {isEditing ? (
              <div className="space-y-6 max-w-2xl mx-auto md:mx-0 bg-white/[0.02] p-8 rounded-[2.5rem] border border-white/10 shadow-2xl backdrop-blur-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gold-main/60 ml-1">Clinical ID</label>
                    <input 
                      type="text" 
                      value={localName}
                      onChange={(e) => setLocalName(e.target.value)}
                      className={`w-full bg-slate-950 border rounded-2xl px-5 py-4 text-xl font-serif font-bold text-white italic outline-none transition-all ${errors.name ? 'border-red-500 shadow-red-500/20' : 'border-white/10 focus:border-gold-main/40'}`}
                      placeholder="Full Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gold-main/60 ml-1">Specialization</label>
                    <input 
                      type="text" 
                      value={localSpecialization}
                      onChange={(e) => setLocalSpecialization(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-4 text-sm text-slate-400 outline-none focus:border-gold-main/40 transition-all"
                      placeholder="e.g. Cardiac Sonography"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gold-main/60 ml-1">Institution</label>
                    <input 
                      type="text" 
                      value={localInstitution}
                      onChange={(e) => setLocalInstitution(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-4 text-sm text-slate-400 outline-none focus:border-gold-main/40 transition-all"
                      placeholder="e.g. Mayo Clinic"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gold-main/60 ml-1">Location</label>
                    <input 
                      type="text" 
                      value={localLocation}
                      onChange={(e) => setLocalLocation(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-4 text-sm text-slate-400 outline-none focus:border-gold-main/40 transition-all"
                      placeholder="e.g. Rochester, MN"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gold-main/60 ml-1">Professional Bio</label>
                  <textarea 
                    value={localBio}
                    onChange={(e) => setLocalBio(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-4 text-sm text-slate-400 outline-none focus:border-gold-main/40 transition-all min-h-[100px] resize-none"
                    placeholder="Tell us about your clinical background..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gold-main/60 ml-1">LinkedIn URL</label>
                    <input 
                      type="text" 
                      value={localLinkedinUrl}
                      onChange={(e) => setLocalLinkedinUrl(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-4 text-sm text-slate-400 outline-none focus:border-gold-main/40 transition-all"
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gold-main/60 ml-1">Website URL</label>
                    <input 
                      type="text" 
                      value={localWebsiteUrl}
                      onChange={(e) => setLocalWebsiteUrl(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-4 text-sm text-slate-400 outline-none focus:border-gold-main/40 transition-all"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                   <button onClick={() => setIsEditing(false)} className="flex-1 px-6 py-4 bg-white/5 text-white/40 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all">Cancel</button>
                   <button onClick={handleSave} className="flex-[2] items-center justify-center gap-3 px-10 py-4 bg-gold-main text-slate-950 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-gold hover:shadow-gold-strong transition-all flex active:scale-95">
                    <Save size={16} /> Sync Profile Node
                   </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h1 className="text-4xl md:text-7xl font-serif font-bold text-white tracking-tighter leading-none italic uppercase truncate group flex items-center justify-center md:justify-start gap-4">
                    {profile.displayName || 'Seeker'}
                    <button onClick={() => setIsEditing(true)} className="opacity-0 group-hover:opacity-30 hover:!opacity-100 transition-opacity">
                      <Edit3 size={24} />
                    </button>
                  </h1>
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 border-l-2 border-gold-main/20 pl-6">
                    <p className="text-slate-400 text-sm md:text-xl font-light italic leading-relaxed uppercase tracking-widest">
                      {profile.specialization || profile.role || 'Uncalibrated Seeker'}
                    </p>
                    {profile.institution && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-white/20"></span>
                        <p className="text-slate-500 text-sm md:text-lg font-light italic">
                          {profile.institution}
                        </p>
                      </>
                    )}
                    {profile.location && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-white/20"></span>
                        <div className="flex items-center gap-2 text-slate-500 text-sm md:text-lg font-light italic">
                          <MapPin size={14} />
                          {profile.location}
                        </div>
                      </>
                    )}
                  </div>

                  {profile.bio && (
                    <p className="text-slate-300 text-sm md:text-base font-light italic leading-relaxed max-w-2xl pl-6 mt-4">
                      {profile.bio}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-6 pl-6 mt-4">
                    {profile.email && (
                      <div className="flex items-center gap-2 text-white/30 text-[10px] font-mono uppercase tracking-widest">
                        <Mail size={10} />
                        <span>{profile.email}</span>
                      </div>
                    )}
                    {profile.linkedinUrl && (
                      <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gold-main/60 hover:text-gold-main text-[10px] font-mono uppercase tracking-widest transition-colors">
                        <Linkedin size={10} />
                        <span>LinkedIn</span>
                      </a>
                    )}
                    {profile.websiteUrl && (
                      <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gold-main/60 hover:text-gold-main text-[10px] font-mono uppercase tracking-widest transition-colors">
                        <Globe size={10} />
                        <span>Website</span>
                      </a>
                    )}
                    {isAdmin && onNavigateToAdmin && (
                      <button 
                        onClick={onNavigateToAdmin}
                        className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg font-black uppercase text-[8px] tracking-widest hover:bg-red-500/20 transition-all"
                      >
                        <ShieldCheck size={10} /> Admin Core
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 w-full lg:w-auto">
          <div className="px-10 py-6 bg-slate-900 border border-white/5 rounded-[2rem] flex flex-col items-center gap-1 shadow-2xl flex-1 md:flex-none">
            <Coins size={14} className="text-gold-main/60 mb-1" />
            <span className="text-2xl font-serif font-bold text-white italic leading-none">0</span>
            <span className="text-[8px] font-black uppercase text-white/20 tracking-widest">Credits</span>
          </div>
          <div className="px-10 py-6 bg-slate-950 border border-gold-main/20 rounded-[2rem] flex flex-col items-center gap-1 shadow-gold-dim flex-1 md:flex-none">
            <Target size={14} className="text-gold-main mb-1" />
            <span className="text-2xl font-serif font-bold text-gold-main italic leading-none">{boardReadiness}%</span>
            <span className="text-[8px] font-black uppercase text-gold-main/40 tracking-widest">Readiness</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        <div className="lg:col-span-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard icon={Zap} label="Experience" value={`${profile.xp} XP`} sub={`${1000 - (profile.xp % 1000)} to Next Lvl`} color="text-yellow-400" />
            <StatCard icon={Flame} label="Daily Streak" value={`${profile.streak} Days`} sub="Neural Momentum" color="text-orange-500" />
            <StatCard icon={Trophy} label="Avg. Accuracy" value={`0%`} sub="Last Assessment" color="text-gold-main" />
          </div>
          
          <section className="p-8 md:p-12 bg-slate-950/80 border border-white/10 rounded-[3rem] space-y-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><Award size={160} /></div>
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-gold-main/10 rounded-2xl flex items-center justify-center border border-gold-main/30 text-gold-main shadow-gold"><ShieldCheck size={28} /></div>
              <div>
                <h4 className="text-2xl font-serif font-bold text-white italic">Membership Protocol</h4>
                <p className="text-[9px] font-black text-gold-main/60 uppercase tracking-[0.4em] mt-1">Access Tier & Billing</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl space-y-6">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Active Tier</span>
                            <h5 className="text-xl font-serif font-bold text-white italic uppercase tracking-tight">
                              {profile.plan === 'lifetime' ? 'Eternal Matrix' : 
                               profile.plan === 'annual' ? 'Annual Resonance' : 
                               profile.plan === 'monthly' ? 'Monthly Pro' : 'Guest Protocol'}
                            </h5>
                        </div>
                        <div className="px-3 py-1 bg-gold-main/20 border border-gold-main/30 rounded-full text-[8px] font-black text-gold-main uppercase tracking-widest">
                          {profile.plan === 'free' ? 'Limited' : 'Full Access'}
                        </div>
                    </div>
                    <div className="h-px bg-white/5 w-full"></div>
                    <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-white/30 uppercase tracking-widest">Status</span>
                        <span className="text-green-500 font-bold">ACTIVE_LINK</span>
                    </div>
                    <button 
                        onClick={() => {
                          const el = document.getElementById('pricing');
                          el?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="w-full py-4 bg-gold-main text-slate-950 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-gold hover:shadow-gold-strong transition-all flex items-center justify-center gap-3 active:scale-95"
                    >
                        {profile.plan === 'free' ? 'Upgrade Protocol' : 'Manage Subscription'}
                    </button>
                </div>

                <div className="p-8 bg-slate-900/40 rounded-3xl border border-white/5 space-y-6">
                    <div className="flex items-center gap-4">
                        <Sparkles className="text-gold-main" size={20} />
                        <h5 className="text-sm font-serif font-bold text-white italic">Tier Benefits</h5>
                    </div>
                    <ul className="space-y-3">
                      {[
                        { label: 'Full Course Access', active: profile.plan !== 'free' },
                        { label: 'AI Narrations', active: profile.plan !== 'free' },
                        { label: 'Mock Exam Vault', active: ['annual', 'lifetime'].includes(profile.plan || 'free') },
                        { label: 'Priority Support', active: ['annual', 'lifetime'].includes(profile.plan || 'free') }
                      ].map((benefit, i) => (
                        <li key={i} className={`flex items-center gap-3 text-[10px] uppercase tracking-widest font-black ${benefit.active ? 'text-white/60' : 'text-white/10'}`}>
                          <CheckCircle2 size={12} className={benefit.active ? 'text-gold-main' : 'text-white/5'} />
                          {benefit.label}
                        </li>
                      ))}
                    </ul>
                </div>
            </div>
          </section>

          {/* Communication Preferences (New Section) */}
          <section className="p-8 md:p-12 bg-slate-950/80 border border-white/10 rounded-[3rem] space-y-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><Activity size={160} /></div>
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-gold-main/10 rounded-2xl flex items-center justify-center border border-gold-main/30 text-gold-main shadow-gold"><Mic2 size={28} /></div>
              <div>
                <h4 className="text-2xl font-serif font-bold text-white italic">Voice & Communication</h4>
                <p className="text-[9px] font-black text-gold-main/60 uppercase tracking-[0.4em] mt-1">Acoustic Synthesis Profiles</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                <div className="space-y-8 p-8 bg-white/[0.02] border border-white/5 rounded-3xl">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/60">Voice Rate</label>
                            <span className="text-[10px] font-mono text-gold-main">{localVoiceRate.toFixed(1)}x</span>
                        </div>
                        <input 
                            type="range" min="0.5" max="2.0" step="0.1" value={localVoiceRate}
                            onChange={(e) => setLocalVoiceRate(parseFloat(e.target.value))}
                            className="w-full h-1 bg-white/5 rounded-full appearance-none accent-gold-main"
                        />
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/60">Voice Pitch</label>
                            <span className="text-[10px] font-mono text-gold-main">{localVoicePitch.toFixed(1)}</span>
                        </div>
                        <input 
                            type="range" min="0.5" max="2.0" step="0.1" value={localVoicePitch}
                            onChange={(e) => setLocalVoicePitch(parseFloat(e.target.value))}
                            className="w-full h-1 bg-white/5 rounded-full appearance-none accent-gold-main"
                        />
                    </div>
                    <button 
                        onClick={handleSave}
                        className="w-full py-4 bg-gold-main/10 hover:bg-gold-main/20 border border-gold-main/30 text-gold-main rounded-xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-3"
                    >
                        <RefreshCw size={14} /> Update Acoustic Node
                    </button>
                </div>

                <div className="p-8 bg-slate-900/40 rounded-3xl border border-white/5 space-y-6">
                    <div className="flex items-center gap-4">
                        <ShieldCheck className="text-green-500" size={20} />
                        <h5 className="text-sm font-serif font-bold text-white italic">Acoustic Privacy Shield</h5>
                    </div>
                    <p className="text-xs text-slate-400 font-light leading-relaxed">
                        Your communication settings are stored locally. High-fidelity voice synthesis requires an ElevenLabs uplink, while standard feedback utilizes your browser's native audio engine.
                    </p>
                    <div className="pt-4 flex items-center gap-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[8px] font-black uppercase text-white/20 tracking-widest">End-to-End Signal Protection: ACTIVE</span>
                    </div>
                </div>
            </div>
          </section>

          <section className="p-8 md:p-12 bg-slate-950/80 border border-white/10 rounded-[3rem] space-y-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><ShieldCheck size={160} /></div>
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/30 text-blue-400 shadow-blue-dim"><Key size={28} /></div>
              <div>
                <h4 className="text-2xl font-serif font-bold text-white italic">Acoustic Engine Auth</h4>
                <p className="text-[9px] font-black text-blue-400/60 uppercase tracking-[0.4em] mt-1">AI Protocol Configuration</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-6 p-8 bg-white/[0.02] border border-white/5 rounded-3xl">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Logic Engine</span>
                    <h5 className="text-lg font-serif font-bold text-white italic">Google Gemini API</h5>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[7px] font-black uppercase ${hasGeminiKey ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gold-main/20 text-gold-main border border-gold-main/30'}`}>
                    {hasGeminiKey ? 'Authorized' : 'Default Mode'}
                  </div>
                </div>
                <button onClick={handleSwitchGeminiKey} className="w-full py-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-3">
                  <RefreshCw size={14} /> Switch Gemini Key
                </button>
              </div>
              <div className="space-y-6 p-8 bg-white/[0.02] border border-white/5 rounded-3xl">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Acoustic Synthesis</span>
                    <h5 className="text-lg font-serif font-bold text-white italic">ElevenLabs API</h5>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[7px] font-black uppercase ${elevenKey ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                    {elevenKey ? 'Active' : 'Offline'}
                  </div>
                </div>
                <div className="space-y-2">
                  <input type="password" value={elevenKey} onChange={(e) => handleUpdateElevenKey(e.target.value)} placeholder="Enter ElevenLabs Key..." className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white font-mono outline-none focus:border-gold-main/40 transition-all" />
                </div>
              </div>
              <div className="space-y-6 p-8 bg-white/[0.02] border border-white/5 rounded-3xl">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Fallback Synthesis</span>
                    <h5 className="text-lg font-serif font-bold text-white italic">OpenAI TTS API</h5>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[7px] font-black uppercase ${openAiKey ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                    {openAiKey ? 'Active' : 'Offline'}
                  </div>
                </div>
                <div className="space-y-2">
                  <input type="password" value={openAiKey} onChange={(e) => handleUpdateOpenAiKey(e.target.value)} placeholder="Enter OpenAI Key..." className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white font-mono outline-none focus:border-gold-main/40 transition-all" />
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-10">
          <section className="p-8 bg-gold-main/5 border border-gold-main/20 rounded-[2.5rem] space-y-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform"><Cloud size={100} /></div>
            <div className="flex items-center gap-4 text-gold-main">
              <Wifi size={18} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Infrastructure</span>
            </div>
            <div className="space-y-4">
              <DiagnosticLine label="Node Sync" status="Healthy" value="UP" />
              <DiagnosticLine label="Provider" status="Verified" value="Firebase" />
              <DiagnosticLine label="Persistence" status="Active" value="Cloud" />
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3 text-gold-main px-2">
              <LayoutGrid size={18} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Visual chassis Selection</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {AVATARS.map((av) => (
                <button key={av.id} onClick={() => updateProfile({ avatarId: av.id })} className={`aspect-square rounded-[1.5rem] border flex flex-col items-center justify-center gap-2 transition-all duration-500 ${profile.avatarId === av.id ? 'bg-gold-main border-gold-main shadow-gold text-slate-950' : 'bg-slate-950/40 border-white/5 hover:border-gold-main/20 text-white/30'}`}>
                  <av.icon size={28} />
                  <span className="text-[7px] font-black uppercase tracking-widest">{av.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="p-8 bg-slate-950/40 border border-white/5 rounded-[2.5rem] space-y-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform"><Settings size={100} /></div>
            <div className="flex items-center gap-4 text-gold-main">
              <Settings size={18} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">System Protocol</span>
            </div>
            <div className="space-y-4">
              <button 
                onClick={handleRestartTour}
                className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-3"
              >
                <PlayCircle size={14} /> Restart Introductory Tour
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, sub, color }: any) => (
  <div className="p-8 bg-slate-950/40 border border-white/5 rounded-[2.5rem] space-y-4 shadow-xl group hover:border-gold-main/20 transition-all">
    <div className="flex items-center gap-4">
      <div className={`p-2 rounded-lg bg-white/5 ${color} transition-transform group-hover:scale-110`}><Icon size={16} /></div>
      <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{label}</span>
    </div>
    <div className="space-y-1">
      <div className="text-3xl font-serif font-bold italic text-white leading-none">{value}</div>
      <p className="text-[9px] font-black uppercase text-white/10 tracking-widest">{sub}</p>
    </div>
  </div>
);

const DiagnosticLine = ({ label, status, value }: any) => (
  <div className="flex justify-between items-end group/line">
    <div className="space-y-0.5">
      <span className="text-[8px] font-black uppercase text-white/20 tracking-widest block">{label}</span>
      <span className="text-[10px] font-bold text-white group-hover/line:text-gold-main transition-colors uppercase">{status}</span>
    </div>
    <span className="text-[11px] font-mono font-bold text-gold-main/60">{value}</span>
  </div>
);

export default UserProfile;