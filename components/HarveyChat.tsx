
import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Loader2, Sparkles, Terminal, Activity, Zap, Mic, ShieldAlert, Volume2, VolumeX, Paperclip, Image as ImageIcon } from 'lucide-react';
import { generateAIContent } from '../src/lib/aiService';
import { motion, AnimatePresence } from 'motion/react';
import { useNarrator } from '../src/hooks/useNarrator';
import ImageUpload from './ImageUpload';

interface Message {
  role: 'user' | 'harvey';
  text: string;
  imageUrl?: string;
  provider?: 'gemini' | 'openai';
}

interface HarveyChatProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

const HarveyChat: React.FC<HarveyChatProps> = ({ isOpen, onClose, userName }) => {
  const { narrate, stopNarration, isNarrating } = useNarrator();
  const [aiActive, setAiActive] = useState(() => {
    const saved = localStorage.getItem('echomasters-ai-active');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    return [
      { role: 'harvey', text: `Establish link... Identity confirmed: ${userName || 'Seeker'}. My synaptic core is ready. What node shall we synchronize today?` }
    ];
  });
  
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync with global privacy updates
  useEffect(() => {
    const handlePrivacyUpdate = (e: any) => {
      setAiActive(e.detail.aiActive);
    };
    window.addEventListener('echomasters-privacy-update', handlePrivacyUpdate);
    return () => window.removeEventListener('echomasters-privacy-update', handlePrivacyUpdate);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isThinking]);

  const handleSend = async () => {
    if ((!input.trim() && !pendingImage) || isThinking || !aiActive) return;

    const userMsg = input.trim();
    const currentImage = pendingImage;
    
    setInput('');
    setPendingImage(null);
    setShowUpload(false);
    
    setMessages(prev => [...prev, { 
      role: 'user', 
      text: userMsg || (currentImage ? "[Image Uploaded]" : ""), 
      imageUrl: currentImage || undefined 
    }]);
    setIsThinking(true);

    try {
      const response = await generateAIContent(userMsg || "Analyze this image.", {
        model: 'gemini-3-flash-preview',
        images: currentImage ? [currentImage] : undefined,
        systemInstruction: `You are Harvey, a wise professor of ultrasound physics. Help seekers pass the ARDMS SPI exam. Keep responses extremely concise (under 80 words). Address the student as "Seeker" or: ${userName || 'Seeker'}. 
          If an image is provided, analyze it in the context of ultrasound physics or clinical practice.
          STRICT INSTRUCTION: DO NOT USE ANY SYMBOLS IN THE GENERATED TEXT. No commas, no periods, no percentages, no hashes, no at-signs, no asterisks, no ampersands. Use only letters, numbers, and spaces.`,
      });

      setMessages(prev => [...prev, { 
        role: 'harvey', 
        text: response.text || "My synaptic link attenuated. Please restate the query.",
        provider: response.provider
      }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'harvey', text: "Signal interference detected. Ensure your local API matrix is energized." }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] flex items-center justify-center p-0 md:p-10 bg-slate-950/80 backdrop-blur-3xl"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full md:max-w-2xl bg-slate-900 md:border-2 border-gold-main/30 md:rounded-[3rem] shadow-[0_0_100px_rgba(181,148,78,0.15)] overflow-hidden flex flex-col h-full md:h-[80vh] relative"
          >
            {/* Scanner Line Effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
              <div className="w-full h-1 bg-gold-main/10 blur-sm absolute top-0 animate-scanner-line"></div>
              <div className="absolute inset-0 bg-[linear-gradient(rgba(181,148,78,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(181,148,78,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"></div>
            </div>

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(181,148,78,0.05)_0%,transparent_70%)] pointer-events-none"></div>
            
            {/* Chat Header */}
            <div className="p-5 md:p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02] relative z-30 shrink-0">
              <div className="flex items-center gap-4 md:gap-5">
                <div className="relative">
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`absolute inset-0 blur-xl rounded-full ${aiActive ? 'bg-gold-main/20' : 'bg-red-500/10'}`}
                    ></motion.div>
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shadow-gold relative transition-colors ${aiActive ? 'bg-gold-main text-slate-950' : 'bg-red-500/20 text-red-500 border border-red-500/40'}`}>
                        {aiActive ? <Bot size={20} className="md:size-[24px]" /> : <ShieldAlert size={20} />}
                    </div>
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-serif font-bold text-white italic tracking-tight">FACULTY_FLASH: HARVEY</h3>
                  <div className="flex items-center gap-2">
                    <motion.div 
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className={`h-1 w-1 rounded-full ${aiActive ? 'bg-gold-main shadow-[0_0_8px_#B5944E]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`}
                    ></motion.div>
                    <span className={`text-[7px] md:text-[8px] font-black uppercase tracking-[0.4em] ${aiActive ? 'text-gold-main/60' : 'text-red-400'}`}>
                      {aiActive ? 'Flash Synapse Enabled' : 'Privacy Protection Active'}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="p-2 md:p-3 bg-white/5 rounded-xl md:rounded-2xl text-white/40 hover:text-white transition-all hover:rotate-90"><X size={20} /></button>
            </div>

            {/* Message Viewport */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 md:p-10 space-y-6 md:space-y-8 custom-scrollbar relative z-10">
              {messages.map((msg, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20, y: 10 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[90%] md:max-w-[85%] p-5 md:p-6 rounded-2xl md:rounded-[2rem] relative group/msg ${msg.role === 'user' ? 'bg-gold-main text-slate-950 shadow-gold rounded-tr-none' : 'bg-white/5 border border-white/10 text-white italic font-serif rounded-tl-none'}`}>
                    {msg.imageUrl && (
                      <div className="mb-4 rounded-xl overflow-hidden border border-black/10">
                        <img 
                          src={msg.imageUrl} 
                          alt="Uploaded content" 
                          className="w-full max-h-64 object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                    <p className="text-sm md:text-base leading-relaxed">{msg.text}</p>
                    {msg.role === 'harvey' && (
                      <button 
                        onClick={() => narrate(msg.text, 'Fenrir')}
                        className="absolute -right-10 top-2 p-2 bg-white/5 text-white/40 hover:text-gold-main rounded-xl opacity-0 group-hover/msg:opacity-100 transition-all"
                        title="Listen to Harvey"
                      >
                        {isNarrating ? <VolumeX size={14} /> : <Volume2 size={14} />}
                      </button>
                    )}
                    <div className={`absolute top-0 ${msg.role === 'user' ? '-right-1.5' : '-left-1.5'} w-3 h-3 ${msg.role === 'user' ? 'bg-gold-main' : 'bg-slate-900 border-l border-t border-white/10'} rotate-45`}></div>
                    
                    {/* Timestamp or Status */}
                    <div className={`absolute -bottom-5 ${msg.role === 'user' ? 'right-0' : 'left-0'} opacity-0 group-hover/msg:opacity-40 transition-opacity flex items-center gap-2`}>
                      <span className="text-[6px] font-black uppercase tracking-widest text-white">Verified_Node_{idx}</span>
                      {msg.provider && (
                        <span className={`text-[6px] font-black uppercase tracking-widest px-1 rounded ${msg.provider === 'gemini' ? 'bg-gold-main/20 text-gold-main' : 'bg-blue-500/20 text-blue-400'}`}>
                          Core: {msg.provider}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isThinking && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                   <div className="bg-white/5 border border-white/10 p-4 md:p-6 rounded-2xl md:rounded-[2rem] rounded-tl-none flex items-center gap-4">
                      <div className="flex gap-1">
                        {[0, 1, 2].map(i => (
                          <motion.div 
                            key={i}
                            animate={{ height: [4, 12, 4] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                            className="w-1 bg-gold-main rounded-full"
                          />
                        ))}
                      </div>
                      <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/40">Syncing with Flash Core...</span>
                   </div>
                </motion.div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-5 md:p-8 bg-slate-950 border-t border-white/5 relative z-30 shrink-0">
              <AnimatePresence>
                {showUpload && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 overflow-hidden"
                  >
                    <ImageUpload 
                      onUploadComplete={(url) => {
                        setPendingImage(url);
                        // Optional: auto-send or just keep it pending
                      }}
                      folder="chat_uploads"
                      className="max-w-md mx-auto"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {pendingImage && !showUpload && (
                <div className="mb-4 flex items-center gap-4 p-3 bg-white/5 rounded-2xl border border-gold-main/20">
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10">
                    <img src={pendingImage} alt="Pending" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-gold-main uppercase tracking-widest">Image Ready</p>
                    <p className="text-[9px] text-white/40 uppercase tracking-widest">Will be sent with next message</p>
                  </div>
                  <button 
                    onClick={() => setPendingImage(null)}
                    className="p-2 text-white/20 hover:text-red-500 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {!aiActive ? (
                <div className="flex flex-col items-center justify-center p-6 bg-red-500/5 rounded-[2rem] border border-red-500/20 text-center gap-2">
                   <ShieldAlert size={20} className="text-red-500" />
                   <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Input Blocked: Privacy Shield Enabled</p>
                   <p className="text-[9px] text-white/30 italic">Toggle AI processing in the main navigation to resume discourse.</p>
                </div>
              ) : (
                <div className="relative group">
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Query the clinical database..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-5 md:pl-6 pr-24 md:pr-32 py-4 md:py-5 text-white focus:outline-none focus:border-gold-main/40 transition-all font-serif italic text-base md:text-lg placeholder:text-white/10"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 md:gap-2">
                      <button 
                        onClick={() => setShowUpload(!showUpload)}
                        className={`p-2 transition-colors hidden sm:block ${showUpload || pendingImage ? 'text-gold-main' : 'text-white/20 hover:text-gold-main'}`}
                        title="Upload Image"
                      >
                        <Paperclip size={18} />
                      </button>
                      <button className="p-2 text-white/20 hover:text-gold-main transition-colors hidden sm:block"><Mic size={18} /></button>
                      <button 
                          onClick={handleSend}
                          disabled={isThinking || !input.trim()}
                          className="px-4 py-2.5 md:px-6 md:py-3 bg-gold-main text-slate-950 rounded-xl font-black uppercase text-[8px] md:text-[10px] tracking-widest shadow-gold hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                      >
                          [ SYNC ]
                      </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer HUD */}
            <div className="px-6 md:px-10 py-3 md:py-4 bg-white/[0.01] border-t border-white/5 flex justify-between items-center shrink-0 relative z-30">
                <div className="flex items-center gap-4 md:gap-6 opacity-30">
                    <div className="flex items-center gap-1.5 md:gap-2"><Activity size={10} className="text-gold-main" /><span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-white">Logic_Load: 4%</span></div>
                    <div className="flex items-center gap-1.5 md:gap-2 hidden xs:flex"><Terminal size={10} className="text-gold-main" /><span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-white">Protocol: FLASH_V3</span></div>
                </div>
                <Sparkles size={12} className="text-gold-main/20" />
            </div>
          </motion.div>

          <style>{`
            @keyframes scanner-line {
              0% { top: 0; opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { top: 100%; opacity: 0; }
            }
            .animate-scanner-line {
              animation: scanner-line 4s linear infinite;
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HarveyChat;
