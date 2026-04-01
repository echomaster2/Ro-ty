import { useState, useCallback, useRef } from 'react';
import { generateSpeech, playAudio } from '../lib/narrator';
import { useBranding } from '../../components/BrandingContext';

export function useNarrator() {
  const [isNarrating, setIsNarrating] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const { overrides } = useBranding();
  const elevenLabsKey = overrides['eleven-labs-key']?.value || localStorage.getItem('spi-eleven-labs-key') || '';

  const stopNarration = useCallback(() => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch (e) {
        // Source might have already stopped
      }
      audioSourceRef.current = null;
    }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsNarrating(false);
    if ((window as any).duckRadio) (window as any).duckRadio(false);
  }, []);

  const runLuxTTS = useCallback((text: string) => {
    console.log("Activating LuxTTS Fallback Protocol...");
    setIsNarrating(true);
    if ((window as any).duckRadio) (window as any).duckRadio(true);
    
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
        v.name.includes('Google UK English Male') || 
        v.name.includes('Samantha') || 
        v.name.includes('Daniel')
    );
    
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.rate = 0.85;
    utterance.pitch = 0.9;
    
    utterance.onend = () => {
        setIsNarrating(false);
        if ((window as any).duckRadio) (window as any).duckRadio(false);
    };
    
    utterance.onerror = () => {
        setIsNarrating(false);
        if ((window as any).duckRadio) (window as any).duckRadio(false);
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const narrate = useCallback(async (text: string, voiceId: string = 'Charon') => {
    if (isNarrating) {
      stopNarration();
      return;
    }

    setIsThinking(true);
    try {
      // Clean text
      const cleanText = text.replace(/\[.*?\]/g, '').replace(/#+ /g, '').replace(/\*+/g, '');
      
      const result = await generateSpeech(cleanText, voiceId, elevenLabsKey);
      
      if (result) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        setIsNarrating(true);
        if ((window as any).duckRadio) (window as any).duckRadio(true);
        
        const source = await playAudio(result.base64Audio, result.isRawPCM, audioContextRef.current);
        audioSourceRef.current = source;
        
        if (source) {
          source.onended = () => {
            setIsNarrating(false);
            audioSourceRef.current = null;
            if ((window as any).duckRadio) (window as any).duckRadio(false);
          };
        } else {
          setIsNarrating(false);
          if ((window as any).duckRadio) (window as any).duckRadio(false);
        }
      } else {
        runLuxTTS(cleanText);
      }
    } catch (error) {
      console.error("Narration failed:", error);
      runLuxTTS(text);
    } finally {
      setIsThinking(false);
    }
  }, [isNarrating, stopNarration, elevenLabsKey, runLuxTTS]);

  return { narrate, stopNarration, isNarrating, isThinking };
}
