import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { Music, Plus, Trash2, ExternalLink, Play, Pause, Loader2, Disc3, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Song {
  id: string;
  title: string;
  url: string;
  category: string;
  lyrics?: string;
  thumbnailUrl?: string;
  createdAt: any;
}

const AdminSongManager: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newSong, setNewSong] = useState({
    title: '',
    url: '',
    category: 'General',
    lyrics: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'songs'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const songsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Song[];
      setSongs(songsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'songs');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSong.title || !newSong.url) return;

    setIsAdding(true);
    try {
      let finalUrl = newSong.url;
      // Convert Suno URL to CDN if needed
      if (finalUrl.includes('suno.com/')) {
        const uuidMatch = finalUrl.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
        if (uuidMatch) {
          finalUrl = `https://cdn1.suno.ai/${uuidMatch[0]}.mp3`;
        }
      }

      await addDoc(collection(db, 'songs'), {
        ...newSong,
        url: finalUrl,
        createdAt: serverTimestamp()
      });
      setNewSong({ title: '', url: '', category: 'General', lyrics: '' });
      setIsAdding(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'songs');
      setIsAdding(false);
    }
  };

  const handleDeleteSong = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this song?')) return;
    try {
      await deleteDoc(doc(db, 'songs', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'songs/' + id);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-serif font-bold italic flex items-center gap-3">
            <Music className="text-gold-main" size={20} />
            Acoustic Vault Management
          </h2>
          <p className="text-white/40 text-[10px] uppercase font-black tracking-widest">Neural Harmonics & Educational Melodies</p>
        </div>
      </div>

      {/* Add Song Form */}
      <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem]">
        <form onSubmit={handleAddSong} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gold-main uppercase tracking-widest ml-1">Song Title</label>
            <input 
              type="text" 
              placeholder="e.g., THE DOPPLER SHIFT"
              value={newSong.title}
              onChange={(e) => setNewSong({...newSong, title: e.target.value})}
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-3 text-sm outline-none focus:border-gold-main/40 focus:bg-white/[0.05] transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gold-main uppercase tracking-widest ml-1">Suno URL / Audio URL</label>
            <input 
              type="text" 
              placeholder="https://suno.com/song/..."
              value={newSong.url}
              onChange={(e) => setNewSong({...newSong, url: e.target.value})}
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-3 text-sm outline-none focus:border-gold-main/40 focus:bg-white/[0.05] transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gold-main uppercase tracking-widest ml-1">Category</label>
            <select 
              value={newSong.category}
              onChange={(e) => setNewSong({...newSong, category: e.target.value})}
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-3 text-sm outline-none focus:border-gold-main/40 focus:bg-white/[0.05] transition-all appearance-none"
            >
              <option value="General">General</option>
              <option value="Physics">Physics</option>
              <option value="Anatomy">Anatomy</option>
              <option value="Instrumentation">Instrumentation</option>
              <option value="Doppler">Doppler</option>
            </select>
          </div>
          <div className="flex items-end">
            <button 
              type="submit"
              disabled={isAdding}
              className="w-full bg-gold-main text-slate-950 font-black uppercase tracking-widest text-[10px] py-4 rounded-2xl shadow-gold hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isAdding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Inject Into Matrix
            </button>
          </div>
        </form>
      </div>

      {/* Songs List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {songs.map((song, i) => (
            <motion.div 
              key={song.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.05 }}
              className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] group hover:border-gold-main/20 transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Disc3 size={48} className="animate-spin-slow" />
              </div>
              
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-1 bg-gold-main/10 text-gold-main text-[8px] font-black uppercase rounded-md border border-gold-main/20 tracking-widest">
                    {song.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <a href={song.url} target="_blank" rel="noreferrer" className="p-2 text-white/20 hover:text-white transition-colors">
                      <ExternalLink size={14} />
                    </a>
                    <button 
                      onClick={() => handleDeleteSong(song.id)}
                      className="p-2 text-white/20 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-serif font-bold italic text-white group-hover:text-gold-main transition-colors truncate pr-8">
                    {song.title}
                  </h3>
                  <p className="text-[8px] font-mono text-white/20 uppercase tracking-[0.2em] mt-1">Node ID: {song.id.slice(0, 8)}</p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button 
                    onClick={() => {
                        window.dispatchEvent(new CustomEvent('echomasters-play-track', {
                            detail: { 
                                track: {
                                    id: song.id,
                                    title: song.title,
                                    artist: 'Fairway Dreams',
                                    url: song.url,
                                    type: 'music'
                                }
                            }
                        }));
                    }}
                    className="flex-1 bg-white/5 hover:bg-gold-main/10 text-white/60 hover:text-gold-main border border-white/10 hover:border-gold-main/20 rounded-xl py-2 text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    <Play size={10} fill="currentColor" /> Preview
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {songs.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
              <Disc3 size={32} className="text-white/10" />
            </div>
            <p className="text-white/20 font-mono text-xs uppercase tracking-widest">No Harmonic Nodes Detected</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSongManager;
