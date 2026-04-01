import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { useFirebase } from './FirebaseProvider';
import { 
  Users, Shield, Zap, Database, Search, 
  ArrowUpRight, ArrowDownRight, MoreVertical,
  CheckCircle2, XCircle, Crown, UserPlus,
  Activity, BarChart3, Settings, Lock, Unlock,
  Mail, Fingerprint
} from 'lucide-react';
import { motion } from 'framer-motion';

import AdminSongManager from './AdminSongManager';

const AdminDashboard: React.FC = () => {
  const { isAdmin } = useFirebase();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'songs'>('users');

  useEffect(() => {
    if (!isAdmin) return;

    // Real-time sync for admin dashboard
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'users');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050505]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-gold-main/20 border-t-gold-main animate-spin"></div>
          <span className="text-gold-main/40 font-mono text-xs uppercase tracking-widest">Accessing Neural Core...</span>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: "Total Nodes", value: users.length, icon: Users, trend: "+12%", color: "text-blue-400" },
    { label: "Premium Uplinks", value: users.filter(u => u.isPremium).length, icon: Crown, trend: "+5%", color: "text-gold-main" },
    { label: "Total XP Flow", value: users.reduce((acc, u) => acc + (u.xp || 0), 0).toLocaleString(), icon: Zap, trend: "+24%", color: "text-purple-400" },
    { label: "System Health", value: "99.9%", icon: Activity, trend: "Stable", color: "text-green-400" },
  ];

  const handleTogglePremium = async (user: any) => {
    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        isPremium: !user.isPremium,
        subscriptionStatus: !user.isPremium ? "premium" : "free"
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users/' + user.id);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-10 pb-32">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gold-main/10 rounded-lg border border-gold-main/20">
              <Shield className="text-gold-main" size={20} />
            </div>
            <h1 className="text-3xl font-serif font-bold italic tracking-tight">Command Center</h1>
          </div>
          <p className="text-white/40 font-mono text-[10px] uppercase tracking-[0.2em]">EchoMaster Administrative Interface // v1.0.4</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-gold-main transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search Neural IDs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-sm outline-none focus:border-gold-main/40 focus:bg-white/[0.05] transition-all w-full md:w-80 font-mono"
            />
          </div>
          <button className="p-3 bg-white/[0.03] border border-white/10 rounded-2xl hover:bg-white/[0.08] transition-all">
            <Settings size={20} className="text-white/40" />
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex items-center gap-4 mb-10 border-b border-white/5">
        <button 
          onClick={() => setActiveTab('users')}
          className={`px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === 'users' ? 'text-gold-main' : 'text-white/20 hover:text-white'}`}
        >
          Neural Nodes
          {activeTab === 'users' && <motion.div layoutId="admin-tab" className="absolute bottom-0 left-0 w-full h-0.5 bg-gold-main shadow-gold" />}
        </button>
        <button 
          onClick={() => setActiveTab('songs')}
          className={`px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === 'songs' ? 'text-gold-main' : 'text-white/20 hover:text-white'}`}
        >
          Acoustic Vault
          {activeTab === 'songs' && <motion.div layoutId="admin-tab" className="absolute bottom-0 left-0 w-full h-0.5 bg-gold-main shadow-gold" />}
        </button>
      </div>

      {activeTab === 'users' ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] relative overflow-hidden group hover:border-white/10 transition-all"
              >
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <stat.icon size={64} />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-xl bg-white/5 ${stat.color}`}>
                      <stat.icon size={18} />
                    </div>
                    <span className="text-[10px] font-mono text-green-400 flex items-center gap-1">
                      <ArrowUpRight size={10} /> {stat.trend}
                    </span>
                  </div>
                  <div>
                    <p className="text-white/40 text-[10px] uppercase font-black tracking-widest mb-1">{stat.label}</p>
                    <h3 className="text-2xl font-bold font-mono">{stat.value}</h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Main Table */}
          <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-serif font-bold italic flex items-center gap-3">
                <Users className="text-gold-main" size={20} />
                Neural Node Directory
              </h2>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-gold-main/10 text-gold-main text-[10px] font-black uppercase rounded-full border border-gold-main/20">
                  {filteredUsers.length} Active Nodes
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.01]">
                    <th className="px-8 py-4 text-[10px] font-black text-white/30 uppercase tracking-widest">User / Identity</th>
                    <th className="px-8 py-4 text-[10px] font-black text-white/30 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-4 text-[10px] font-black text-white/30 uppercase tracking-widest">Telemetry</th>
                    <th className="px-8 py-4 text-[10px] font-black text-white/30 uppercase tracking-widest">Last Sync</th>
                    <th className="px-8 py-4 text-[10px] font-black text-white/30 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-main/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-gold-main font-bold">
                            {user.displayName?.[0] || 'A'}
                          </div>
                          <div>
                            <div className="font-bold text-sm flex items-center gap-2">
                              {user.displayName || 'Anonymous'}
                              {user.isPremium && <Crown size={12} className="text-gold-main" />}
                            </div>
                            <div className="text-[10px] text-white/40 font-mono">{user.email || user.id.slice(0, 12) + '...'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          {user.isPremium ? (
                            <span className="flex items-center gap-1.5 px-2 py-1 bg-gold-main/10 text-gold-main text-[9px] font-black uppercase rounded-md border border-gold-main/20">
                              <CheckCircle2 size={10} /> Premium
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 px-2 py-1 bg-white/5 text-white/40 text-[9px] font-black uppercase rounded-md border border-white/5">
                              <XCircle size={10} /> Standard
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-6">
                          <div className="space-y-1">
                            <p className="text-[8px] text-white/30 uppercase font-black">XP</p>
                            <p className="text-xs font-mono font-bold">{user.xp || 0}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[8px] text-white/30 uppercase font-black">Level</p>
                            <p className="text-xs font-mono font-bold">{user.level || 1}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[8px] text-white/30 uppercase font-black">Streak</p>
                            <p className="text-xs font-mono font-bold text-orange-400">{user.streak || 0}d</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-[10px] font-mono text-white/40">
                          {new Date(user.lastActive || user.updatedAt).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleTogglePremium(user)}
                            className={`p-2 rounded-xl transition-all ${user.isPremium ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-gold-main/10 text-gold-main hover:bg-gold-main/20'}`}
                            title={user.isPremium ? "Revoke Premium" : "Grant Premium"}
                          >
                            {user.isPremium ? <Lock size={16} /> : <Unlock size={16} />}
                          </button>
                          <button className="p-2 bg-white/5 text-white/40 rounded-xl hover:bg-white/10 transition-all">
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <AdminSongManager />
      )}
    </div>
  );
};

export default AdminDashboard;
