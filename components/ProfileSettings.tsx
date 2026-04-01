
import React, { useState } from 'react';
import { X, User, Mail, Shield, Award, Zap, Save, Loader2, Camera } from 'lucide-react';
import { useFirebase } from './FirebaseProvider';
import { motion, AnimatePresence } from 'motion/react';
import ImageUpload from './ImageUpload';

interface ProfileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfile, user } = useFirebase();
  const [isSaving, setIsSaving] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    bio: profile?.bio || '',
    institution: profile?.institution || '',
    specialization: profile?.specialization || '',
    location: profile?.location || '',
    linkedinUrl: profile?.linkedinUrl || '',
    websiteUrl: profile?.websiteUrl || '',
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile(formData);
      onClose();
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (url: string) => {
    try {
      await updateProfile({ photoURL: url });
      setShowPhotoUpload(false);
    } catch (error) {
      console.error("Failed to update photo:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 md:p-10 bg-slate-950/90 backdrop-blur-2xl">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-4xl bg-slate-900 border-2 border-white/5 rounded-[3rem] shadow-[0_0_100px_rgba(181,148,78,0.1)] overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-gold-main text-slate-950 flex items-center justify-center shadow-gold">
              <User size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-serif font-bold text-white italic tracking-tight uppercase">Identity Node: Settings</h3>
              <p className="text-[10px] font-black text-gold-main/60 uppercase tracking-[0.4em]">Configure your clinical profile</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl text-white/40 hover:text-white transition-all hover:rotate-90">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Column: Avatar & Stats */}
            <div className="lg:col-span-4 space-y-8">
              <div className="relative group mx-auto w-48 h-48">
                <div className="absolute inset-0 bg-gold-main/20 blur-3xl rounded-full animate-pulse"></div>
                <div className="relative w-48 h-48 rounded-full border-4 border-gold-main/30 overflow-hidden bg-slate-950 shadow-2xl">
                  {profile?.photoURL ? (
                    <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gold-main/20">
                      <User size={80} />
                    </div>
                  )}
                  
                  <button 
                    onClick={() => setShowPhotoUpload(!showPhotoUpload)}
                    className="absolute inset-0 bg-slate-950/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  >
                    <Camera className="text-gold-main mb-2" size={32} />
                    <span className="text-[8px] font-black text-white uppercase tracking-widest">Update Photo</span>
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {showPhotoUpload && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <ImageUpload 
                      onUploadComplete={handlePhotoUpload}
                      folder="profile_photos"
                      className="mt-4"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Award className="text-gold-main" size={18} />
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Level</span>
                  </div>
                  <span className="text-xl font-serif font-bold text-white italic">{profile?.level || 1}</span>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap className="text-gold-main" size={18} />
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">XP</span>
                  </div>
                  <span className="text-xl font-serif font-bold text-white italic">{profile?.xp || 0}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Form Fields */}
            <div className="lg:col-span-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gold-main/60 uppercase tracking-[0.3em] ml-2">Display Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input 
                      type="text" 
                      value={formData.displayName}
                      onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white focus:outline-none focus:border-gold-main/40 transition-all font-serif italic"
                      placeholder="Your clinical alias..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gold-main/60 uppercase tracking-[0.3em] ml-2">Email Node</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input 
                      type="text" 
                      value={profile?.email || ''}
                      disabled
                      className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-white/40 font-serif italic cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gold-main/60 uppercase tracking-[0.3em] ml-2">Institution</label>
                  <input 
                    type="text" 
                    value={formData.institution}
                    onChange={(e) => setFormData({...formData, institution: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-gold-main/40 transition-all font-serif italic"
                    placeholder="University or Clinic..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gold-main/60 uppercase tracking-[0.3em] ml-2">Specialization</label>
                  <input 
                    type="text" 
                    value={formData.specialization}
                    onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-gold-main/40 transition-all font-serif italic"
                    placeholder="e.g. Cardiac, Vascular..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gold-main/60 uppercase tracking-[0.3em] ml-2">Clinical Bio</label>
                <textarea 
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-4 text-white focus:outline-none focus:border-gold-main/40 transition-all font-serif italic resize-none"
                  placeholder="Tell us about your journey into the acoustic matrix..."
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button 
                  onClick={onClose}
                  className="px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest text-white/40 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-10 py-4 bg-gold-main text-slate-950 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-gold hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  Save Identity
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileSettings;
