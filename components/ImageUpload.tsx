
import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { storage, auth } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { motion, AnimatePresence } from 'motion/react';

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  onUploadError?: (error: string) => void;
  folder?: string;
  maxSizeMB?: number;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onUploadComplete,
  onUploadError,
  folder = 'uploads',
  maxSizeMB = 5,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setSuccess(false);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      const msg = 'Please upload an image file.';
      setError(msg);
      onUploadError?.(msg);
      return;
    }

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      const msg = `File size must be less than ${maxSizeMB}MB.`;
      setError(msg);
      onUploadError?.(msg);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Firebase
    setUploading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('You must be logged in to upload images.');

      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const storageRef = ref(storage, `${folder}/${user.uid}/${fileName}`);

      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      setSuccess(true);
      onUploadComplete(downloadURL);
    } catch (err: any) {
      const msg = err.message || 'Failed to upload image.';
      setError(msg);
      onUploadError?.(msg);
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const reset = () => {
    setPreview(null);
    setError(null);
    setSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={`w-full ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileSelect}
        accept="image/*"
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative group cursor-pointer
              border-2 border-dashed rounded-3xl p-8
              flex flex-col items-center justify-center gap-4
              transition-all duration-500
              ${isDragging 
                ? 'border-gold-main bg-gold-main/10 scale-[1.02]' 
                : 'border-white/10 bg-slate-900/40 hover:border-white/20 hover:bg-slate-900/60'}
            `}
          >
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <Upload className={`w-8 h-8 ${isDragging ? 'text-gold-main' : 'text-white/40'}`} />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-black text-white uppercase tracking-widest">
                {isDragging ? 'Drop to Upload' : 'Upload Image'}
              </p>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">
                Drag & drop or click to browse
              </p>
            </div>
            <div className="absolute bottom-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <ImageIcon size={40} />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-3xl overflow-hidden border-2 border-white/10 bg-slate-900/40 aspect-video group"
          >
            <img 
              src={preview} 
              alt="Preview" 
              className={`w-full h-full object-cover transition-all duration-700 ${uploading ? 'blur-sm grayscale' : ''}`} 
              referrerPolicy="no-referrer"
            />
            
            {/* Overlay */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950/60 transition-opacity duration-500 ${uploading || error || success ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              {uploading && (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-10 h-10 text-gold-main animate-spin" />
                  <span className="text-[10px] font-black text-gold-main uppercase tracking-[0.3em]">Uploading...</span>
                </div>
              )}

              {success && (
                <div className="flex flex-col items-center gap-3 text-green-500">
                  <CheckCircle2 className="w-10 h-10" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Upload Complete</span>
                </div>
              )}

              {error && (
                <div className="flex flex-col items-center gap-3 text-red-500 px-6 text-center">
                  <AlertCircle className="w-10 h-10" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">{error}</span>
                </div>
              )}

              {!uploading && (
                <button
                  onClick={(e) => { e.stopPropagation(); reset(); }}
                  className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/80 text-white/60 hover:text-white hover:bg-slate-900 transition-all"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageUpload;
