
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";
import { 
    Sparkles, Brain, Zap, Trophy, Play, SkipForward, 
    User, Mic2, MessageSquare, ChevronRight, 
    CheckCircle2, XCircle, AlertCircle, ArrowRight
} from 'lucide-react';

interface CinematicLessonPresentationProps {
    topic: {
        id: string;
        title: string;
        content: string;
        visualType?: string;
    };
    moduleTitle: string;
    onComplete: (score: number) => void;
    onPlayCorrect: () => void;
    onPlayIncorrect: () => void;
}

type Phase = 'INITIALIZING' | 'HOST_SPEAKING_INTRO' | 'CELEBRITY_SPEAKING' | 'USER_DECISION' | 'HOST_RESULT' | 'COMPLETED';

interface Screenplay {
    hostIntro: string;
    celebrityName: string;
    celebrityResponse: string;
    question: string;
    options: string[];
    correctAnswerIndex: number;
    hostResultSuccess: string;
    hostResultFailure: string;
}

const CinematicLessonPresentation: React.FC<CinematicLessonPresentationProps> = ({ 
    topic, 
    moduleTitle, 
    onComplete,
    onPlayCorrect,
    onPlayIncorrect
}) => {
    const [phase, setPhase] = useState<Phase>('INITIALIZING');
    const [screenplay, setScreenplay] = useState<Screenplay | null>(null);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [audioLoading, setAudioLoading] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    useEffect(() => {
        generateScreenplay();
    }, [topic]);

    const generateScreenplay = async () => {
        setPhase('INITIALIZING');
        try {
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: `
                    Create a cinematic game show screenplay for the ultrasound physics topic: "${topic.title}" from the module "${moduleTitle}".
                    
                    USE THIS CONTENT AS THE SOURCE OF TRUTH:
                    "${topic.content}"
                    
                    The screenplay must follow this structure:
                    1. A witty, high-energy game show host (Puck) introduces the topic and the "Celebrity Expert".
                    2. A "Celebrity Expert" (choose a persona like "The Grumpy Professor", "The Hyperactive Tech", or "The Zen Master") gives a brief, insightful explanation of the core concept.
                    
                    STYLE REFERENCE FOR EXPERT:
                    "Hey, I spent the last 40 hours reading textbooks, watching videos, and aggregating multiple sources on ultrasound physics so you don't have to sit through a semester of lectures. What I'm about to give you is the cliffnotes version that'll save you at least 20 hours of confusion."
                    "A wave is not a single thing moving from point A to point B. Think about ocean waves—most people think the water is moving toward the shore, but that's wrong. The water's barely moving horizontally. What IS moving is the pattern of energy."
                    
                    3. The host then asks the user a challenging multiple-choice question based on the expert's explanation.
                    
                    STRICT INSTRUCTION: DO NOT USE ANY SYMBOLS IN THE TEXT. Use only letters, numbers, and spaces.
                    NO CONTRACTIONS: Use "do not" instead of "dont", "it is" instead of "its", "you are" instead of "youre". This ensures perfect spelling without symbols.
                    MAX: 80 words per response.
                    
                    Return the result as a JSON object with these fields:
                    - hostIntro: Puck's high-energy introduction.
                    - celebrityName: The name/title of the expert.
                    - celebrityResponse: The expert's explanation.
                    - question: The challenge question.
                    - options: Array of 4 strings.
                    - correctAnswerIndex: 0-3.
                    - hostResultSuccess: Puck's reaction if the user is correct.
                    - hostResultFailure: Puck's reaction if the user is incorrect.
                `,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            hostIntro: { type: Type.STRING },
                            celebrityName: { type: Type.STRING },
                            celebrityResponse: { type: Type.STRING },
                            question: { type: Type.STRING },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            correctAnswerIndex: { type: Type.INTEGER },
                            hostResultSuccess: { type: Type.STRING },
                            hostResultFailure: { type: Type.STRING }
                        },
                        required: ["hostIntro", "celebrityName", "celebrityResponse", "question", "options", "correctAnswerIndex", "hostResultSuccess", "hostResultFailure"]
                    }
                }
            });

            const data = JSON.parse(response.text) as Screenplay;
            setScreenplay(data);
            startPresentation(data);
        } catch (error) {
            console.error("Failed to generate screenplay:", error);
        }
    };

    const playVoice = async (text: string, voiceId: string) => {
        const elevenLabsKey = localStorage.getItem('spi-eleven-labs-key') || '';
        if (!elevenLabsKey) return;

        setAudioLoading(true);
        try {
            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'xi-api-key': elevenLabsKey
                },
                body: JSON.stringify({
                    text,
                    model_id: 'eleven_monolingual_v1',
                    voice_settings: { stability: 0.5, similarity_boost: 0.5 }
                })
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                if (audioRef.current) {
                    audioRef.current.src = url;
                    audioRef.current.play();
                    return new Promise((resolve) => {
                        audioRef.current!.onended = resolve;
                    });
                }
            }
        } catch (error) {
            console.error("Voice playback failed:", error);
        } finally {
            setAudioLoading(false);
        }
    };

    const startPresentation = async (data: Screenplay) => {
        setPhase('HOST_SPEAKING_INTRO');
        await playVoice(data.hostIntro, 'kx9Z9Z9Z9Z9Z9Z9Z9Z9Z'); // Puck (Placeholder ID)
        
        setPhase('CELEBRITY_SPEAKING');
        await playVoice(data.celebrityResponse, 'Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9'); // Expert (Placeholder ID)
        
        setPhase('USER_DECISION');
    };

    const handleDecision = async (index: number) => {
        if (phase !== 'USER_DECISION') return;
        
        setSelectedOption(index);
        const correct = index === screenplay?.correctAnswerIndex;
        setIsCorrect(correct);
        
        if (correct) onPlayCorrect();
        else onPlayIncorrect();

        setPhase('HOST_RESULT');
        const resultText = correct ? screenplay?.hostResultSuccess : screenplay?.hostResultFailure;
        await playVoice(resultText || "", 'kx9Z9Z9Z9Z9Z9Z9Z9Z9Z'); // Puck
        
        setPhase('COMPLETED');
    };

    return (
        <div className="relative w-full h-full bg-slate-950 overflow-hidden flex flex-col items-center justify-center p-4 md:p-8">
            <audio ref={audioRef} className="hidden" />
            
            {/* 3D Grid Background */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ perspective: '1000px' }}>
                <div 
                    className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px]"
                    style={{ transform: 'rotateX(60deg) translateY(-20%)' }}
                />
            </div>

            {/* Stage Lighting */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-64 bg-gold-main/5 blur-[120px] rounded-full" />

            <AnimatePresence mode="wait">
                {phase === 'INITIALIZING' && (
                    <motion.div 
                        key="init"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-4"
                    >
                        <div className="w-16 h-16 border-4 border-gold-main/20 border-t-gold-main rounded-full animate-spin" />
                        <p className="text-gold-main font-black uppercase tracking-widest text-xs">Syncing Screenplay</p>
                    </motion.div>
                )}

                {(phase === 'HOST_SPEAKING_INTRO' || phase === 'HOST_RESULT') && (
                    <motion.div 
                        key="host"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.1, opacity: 0 }}
                        className="relative z-10 flex flex-col items-center gap-6 max-w-2xl text-center"
                    >
                        <div className="w-24 h-24 rounded-full bg-gold-main/20 border-2 border-gold-main flex items-center justify-center shadow-[0_0_30px_rgba(181,148,78,0.4)]">
                            <Mic2 className="text-gold-main w-12 h-12" />
                        </div>
                        <h2 className="text-3xl md:text-5xl font-serif font-black text-white italic uppercase tracking-tighter">
                            PUCK <span className="text-gold-main not-italic">LIVE</span>
                        </h2>
                        <p className="text-xl md:text-2xl text-white/80 leading-relaxed font-medium">
                            {phase === 'HOST_SPEAKING_INTRO' ? screenplay?.hostIntro : (isCorrect ? screenplay?.hostResultSuccess : screenplay?.hostResultFailure)}
                        </p>
                        {audioLoading && (
                            <div className="flex gap-1">
                                {[1,2,3].map(i => (
                                    <motion.div 
                                        key={i}
                                        animate={{ height: [10, 30, 10] }}
                                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                                        className="w-1 bg-gold-main rounded-full"
                                    />
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {phase === 'CELEBRITY_SPEAKING' && (
                    <motion.div 
                        key="expert"
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -100, opacity: 0 }}
                        className="relative z-10 flex flex-col items-center gap-6 max-w-2xl text-center"
                    >
                        <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                            <User className="text-emerald-500 w-12 h-12" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-emerald-500 font-black uppercase tracking-widest text-xs">Guest Expert</p>
                            <h2 className="text-3xl md:text-5xl font-serif font-black text-white italic uppercase tracking-tighter">
                                {screenplay?.celebrityName}
                            </h2>
                        </div>
                        <p className="text-xl md:text-2xl text-white/80 leading-relaxed font-medium">
                            {screenplay?.celebrityResponse}
                        </p>
                        {audioLoading && (
                            <div className="flex gap-1">
                                {[1,2,3].map(i => (
                                    <motion.div 
                                        key={i}
                                        animate={{ height: [10, 30, 10] }}
                                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                                        className="w-1 bg-emerald-500 rounded-full"
                                    />
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {phase === 'USER_DECISION' && (
                    <motion.div 
                        key="decision"
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="relative z-10 w-full max-w-4xl flex flex-col gap-8"
                    >
                        <div className="text-center space-y-4">
                            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-gold-main/10 border border-gold-main/20 text-gold-main text-[10px] font-black uppercase tracking-widest">
                                <Zap size={12} />
                                Final Challenge
                            </div>
                            <h3 className="text-2xl md:text-4xl font-serif font-bold text-white leading-tight">
                                {screenplay?.question}
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {screenplay?.options.map((option, idx) => (
                                <motion.button
                                    key={idx}
                                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(181, 148, 78, 0.1)' }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleDecision(idx)}
                                    className="p-6 rounded-2xl border border-white/10 bg-white/5 text-left transition-all group hover:border-gold-main/50"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gold-main font-black group-hover:bg-gold-main group-hover:text-slate-950 transition-colors">
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        <p className="text-white/80 font-medium group-hover:text-white">{option}</p>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {phase === 'COMPLETED' && (
                    <motion.div 
                        key="complete"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative z-10 flex flex-col items-center gap-8 text-center"
                    >
                        <div className={`w-32 h-32 rounded-full flex items-center justify-center shadow-2xl ${isCorrect ? 'bg-emerald-500/20 border-4 border-emerald-500' : 'bg-red-500/20 border-4 border-red-500'}`}>
                            {isCorrect ? <CheckCircle2 className="text-emerald-500 w-16 h-16" /> : <XCircle className="text-red-500 w-16 h-16" />}
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-4xl font-serif font-black text-white italic uppercase tracking-tighter">
                                {isCorrect ? 'SYNC SUCCESSFUL' : 'SYNC FAILED'}
                            </h2>
                            <p className="text-white/60 font-black uppercase tracking-[0.3em] text-xs">
                                {isCorrect ? '+500 XP RESONANCE' : 'RETRY PROTOCOL RECOMMENDED'}
                            </p>
                        </div>
                        <button 
                            onClick={() => onComplete(isCorrect ? 100 : 0)}
                            className="px-8 py-4 bg-gold-main text-slate-950 font-black uppercase tracking-widest rounded-xl hover:bg-gold-accent transition-all flex items-center gap-3 shadow-[0_0_30px_rgba(181,148,78,0.4)]"
                        >
                            Continue Matrix <ArrowRight size={18} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Progress Bar */}
            <div className="fixed bottom-0 left-0 w-full h-1 bg-white/5">
                <motion.div 
                    className="h-full bg-gold-main"
                    initial={{ width: '0%' }}
                    animate={{ 
                        width: phase === 'HOST_SPEAKING_INTRO' ? '25%' : 
                               phase === 'CELEBRITY_SPEAKING' ? '50%' :
                               phase === 'USER_DECISION' ? '75%' :
                               phase === 'COMPLETED' ? '100%' : '0%'
                    }}
                />
            </div>
        </div>
    );
};

export default CinematicLessonPresentation;
