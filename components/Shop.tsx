import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Flame, Rocket, Target, ShoppingBag, 
  Coins, CheckCircle2, Lock, ArrowRight,
  ShieldCheck, Sparkles, Cpu
} from 'lucide-react';
import { useFirebase } from './FirebaseProvider';
import { shopItems, ShopItem } from '../data/courseContent';

const Shop: React.FC = () => {
  const { profile, updateProfile } = useFirebase();
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const coins = profile?.coins || 0;
  const inventory = profile?.inventory || [];

  const handleBuy = async (item: ShopItem) => {
    if (coins < item.cost) {
      setMessage({ text: "Insufficient Neural Credits.", type: 'error' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (inventory.includes(item.id)) {
      setMessage({ text: "Module already integrated.", type: 'error' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setBuyingId(item.id);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const updates: any = {
        coins: coins - item.cost,
        inventory: [...inventory, item.id]
      };

      if (item.id === 'premium_unlock') {
        updates.isPremium = true;
      }

      await updateProfile(updates);
      setMessage({ text: `${item.name} successfully integrated.`, type: 'success' });
    } catch (err) {
      setMessage({ text: "Integration failed. Try again.", type: 'error' });
    } finally {
      setBuyingId(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap': return <Zap size={24} />;
      case 'Flame': return <Flame size={24} />;
      case 'Rocket': return <Rocket size={24} />;
      case 'Target': return <Target size={24} />;
      case 'Shield': return <ShieldCheck size={24} />;
      case 'Star': return <Sparkles size={24} />;
      case 'Brain': return <Cpu size={24} />;
      default: return <Sparkles size={24} />;
    }
  };

  return (
    <div className="p-6 md:p-12 lg:p-24 animate-fade-in text-left max-w-7xl mx-auto w-full relative overflow-hidden">
      {/* Atmospheric Background Elements */}
      <div className="absolute inset-0 atmosphere-bg pointer-events-none opacity-30"></div>
      <div className="absolute inset-0 sonar-grid opacity-10 pointer-events-none"></div>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gold-main/20 animate-scanline"></div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-10 mb-12 md:mb-24 relative z-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-gold-main">
            <div className="p-2 bg-gold-main/10 rounded-lg border border-gold-main/20 shadow-gold">
              <ShoppingBag size={18} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Neural Exchange</span>
          </div>
          <h1 className="text-4xl md:text-8xl font-serif font-bold text-white italic uppercase tracking-tighter leading-none text-glow">
            The <span className="text-gold-main not-italic">Shop</span>
          </h1>
        </div>

        <div className="glass-dossier rounded-3xl p-6 flex items-center gap-6 shadow-2xl border-gold-main/20">
          <div className="w-12 h-12 rounded-2xl bg-gold-main/10 border border-gold-main/20 flex items-center justify-center text-gold-main shadow-gold">
            <Coins size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Available Credits</p>
            <p className="text-3xl font-serif font-bold text-white italic text-glow">{coins.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Message Banner */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`mb-8 p-4 rounded-2xl border flex items-center gap-3 relative z-20 ${
              message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400 shadow-green-500/10' : 'bg-red-500/10 border-red-500/30 text-red-400 shadow-red-500/10'
            }`}
          >
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <Lock size={18} />}
            <span className="text-xs font-bold uppercase tracking-wider">{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 relative z-10">
        {shopItems.map((item) => {
          const isOwned = inventory.includes(item.id);
          const canAfford = coins >= item.cost;

          return (
            <div 
              key={item.id}
              className={`group p-6 md:p-10 glass-dossier rounded-[2rem] md:rounded-[3rem] transition-all duration-700 relative overflow-hidden flex flex-col min-h-[350px] shadow-2xl ${
                isOwned ? 'border-green-500/30 bg-green-500/5' : 'border-white/10 hover:border-gold-main/40 hover:bg-white/[0.05]'
              }`}
            >
              {/* Background Glow */}
              <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] transition-opacity duration-700 ${
                isOwned ? 'bg-green-500/10 opacity-40' : 'bg-gold-main/5 group-hover:opacity-20'
              }`}></div>

              <div className="flex justify-between items-start mb-8">
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-all ${
                  isOwned ? 'bg-green-500/10 border border-green-500/20 text-green-400 shadow-green-500/20' : 'bg-gold-main/10 border border-gold-main/20 text-gold-main shadow-gold'
                }`}>
                  {getIcon(item.icon)}
                </div>
                {isOwned && (
                  <div className="px-3 py-1 bg-green-500/20 border border-green-500/40 rounded-full text-[8px] font-black uppercase tracking-widest text-green-400 shadow-green-500/10">
                    Integrated
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <h3 className={`text-xl md:text-2xl font-serif font-bold text-white italic uppercase tracking-tight transition-colors ${isOwned ? 'text-green-400' : 'group-hover:text-gold-main'}`}>
                    {item.name}
                  </h3>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mt-1">
                    {item.benefit}
                  </p>
                </div>
                <p className="text-xs md:text-sm text-slate-400 font-light leading-relaxed italic border-l border-white/10 pl-4">
                  {item.description}
                </p>
              </div>

              <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins size={14} className="text-gold-main" />
                  <span className={`text-lg font-serif font-bold italic ${!canAfford && !isOwned ? 'text-red-400' : 'text-white'}`}>
                    {item.cost}
                  </span>
                </div>

                <button
                  disabled={isOwned || buyingId === item.id}
                  onClick={() => handleBuy(item)}
                  className={`px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 ${
                    isOwned ? 'bg-green-500/10 text-green-400 cursor-default border border-green-500/20' :
                    buyingId === item.id ? 'bg-gold-main/20 text-gold-main cursor-wait border border-gold-main/30' :
                    canAfford ? 'bg-gold-main text-slate-950 hover:scale-105 shadow-gold' :
                    'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                  }`}
                >
                  {isOwned ? (
                    <>Active <CheckCircle2 size={12} /></>
                  ) : buyingId === item.id ? (
                    <>Syncing... <Cpu size={12} className="animate-spin" /></>
                  ) : (
                    <>Acquire <ArrowRight size={12} /></>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
      <div className="mt-24 p-8 glass-dossier border border-white/5 rounded-3xl flex items-center gap-6 max-w-3xl relative z-10">
        <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 shadow-blue-500/10">
          <ShieldCheck size={24} />
        </div>
        <p className="text-xs text-slate-400 italic leading-relaxed">
          Neural Credits are earned through sector traversals, quiz mastery, and daily streaks. 
          All integrations are permanent and tied to your clinical identity node.
        </p>
      </div>
    </div>
  );
};

export default Shop;
