
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { 
  Trophy, Medal, Crown, Star, 
  Zap, Target, Flame, Users,
  ChevronRight, ArrowUpRight, Activity,
  Globe, ShieldCheck, Loader2
} from 'lucide-react';

const GlobalLeaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      orderBy('xp', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLeaderboard(users);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching leaderboard:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 size={40} className="text-gold-main animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full p-4 md:p-12 animate-fade-in">
      <div className="space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gold-main">
              <div className="p-2 bg-gold-main/10 rounded-lg border border-gold-main/20">
                <Globe size={18} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Global Resonance</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-serif font-bold text-white italic uppercase tracking-tighter leading-none">
              The <span className="text-gold-main not-italic">Leaderboard</span>
            </h1>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/40 backdrop-blur-xl border border-white/5 p-4 rounded-3xl">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{leaderboard.length} Seekers Active</span>
            </div>
          </div>
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end pt-10">
          {leaderboard.slice(0, 3).map((user, idx) => {
            const isFirst = idx === 0;
            const isSecond = idx === 1;
            const isThird = idx === 2;

            const order = isFirst ? 'order-1 md:order-2' : isSecond ? 'order-2 md:order-1' : 'order-3';
            const height = isFirst ? 'h-[320px]' : isSecond ? 'h-[280px]' : 'h-[240px]';
            const Icon = isFirst ? Crown : isSecond ? Medal : Medal;
            const color = isFirst ? 'text-gold-main' : isSecond ? 'text-slate-300' : 'text-orange-400';

            return (
              <div key={user.id} className={`flex flex-col items-center gap-6 ${order}`}>
                <div className="relative group">
                  <div className={`absolute -inset-4 rounded-full blur-2xl opacity-20 transition-opacity group-hover:opacity-40 ${isFirst ? 'bg-gold-main' : 'bg-white'}`}></div>
                  <div className={`w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] bg-slate-900 border-2 flex items-center justify-center relative z-10 shadow-2xl ${isFirst ? 'border-gold-main' : 'border-white/10'}`}>
                    <span className={`text-4xl font-serif font-bold italic ${color}`}>{user.displayName?.[0].toUpperCase() || 'S'}</span>
                    <div className={`absolute -top-4 -right-4 w-10 h-10 rounded-full bg-slate-950 border-2 flex items-center justify-center shadow-lg ${isFirst ? 'border-gold-main' : 'border-white/10'}`}>
                      <Icon size={18} className={color} />
                    </div>
                  </div>
                </div>
                
                <div className={`w-full ${height} bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-t-[3rem] p-8 flex flex-col items-center justify-center text-center space-y-4 relative overflow-hidden group hover:border-gold-main/20 transition-all`}>
                  <div className="space-y-1">
                    <h3 className="text-xl font-serif font-bold text-white italic uppercase truncate max-w-[150px]">{user.displayName || 'Seeker'}</h3>
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">{user.role || 'Student'}</p>
                  </div>
                  <div className="space-y-1">
                    <div className={`text-3xl font-serif font-bold italic ${color}`}>{user.xp} XP</div>
                    <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">Neural Resonance</div>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gold-main/10">
                    <div className="h-full bg-gold-main shadow-gold" style={{ width: `${(user.lastExamScore || 0)}%` }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* List View */}
        <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Global Ranking Grid</span>
            <div className="flex gap-6">
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">XP</span>
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Readiness</span>
            </div>
          </div>
          
          <div className="divide-y divide-white/5">
            {leaderboard.slice(3).map((user, idx) => (
              <div key={user.id} className="p-6 md:p-8 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                <div className="flex items-center gap-6 md:gap-10">
                  <span className="text-sm font-mono font-bold text-white/10 w-6">{idx + 4}</span>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center text-white/40 group-hover:border-gold-main/40 transition-colors">
                      <span className="text-lg font-serif font-bold italic">{user.displayName?.[0].toUpperCase() || 'S'}</span>
                    </div>
                    <div>
                      <h4 className="text-base font-serif font-bold text-white italic uppercase group-hover:text-gold-main transition-colors">{user.displayName || 'Seeker'}</h4>
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">{user.role || 'Student'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-8 md:gap-16">
                  <div className="text-right">
                    <div className="text-lg font-serif font-bold text-white italic">{user.xp}</div>
                    <div className="text-[8px] font-black text-white/20 uppercase tracking-widest">XP</div>
                  </div>
                  <div className="text-right min-w-[60px]">
                    <div className="text-lg font-serif font-bold text-gold-main italic">{user.lastExamScore || 0}%</div>
                    <div className="text-[8px] font-black text-gold-main/40 uppercase tracking-widest">Ready</div>
                  </div>
                  <ChevronRight size={18} className="text-white/10 group-hover:text-gold-main group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-10 bg-slate-950/40 border border-white/5 rounded-[3rem]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gold-main/10 rounded-2xl border border-gold-main/20 text-gold-main">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h5 className="text-sm font-serif font-bold text-white italic">Verified Resonance</h5>
              <p className="text-[10px] text-slate-400 font-light">Rankings are synchronized in real-time across all clinical nodes.</p>
            </div>
          </div>
          <button className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all flex items-center gap-3">
            <ArrowUpRight size={16} /> Share My Standing
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalLeaderboard;
