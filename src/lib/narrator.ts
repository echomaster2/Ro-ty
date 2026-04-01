import { GoogleGenAI, Modality } from "@google/genai";
import OpenAI from "openai";
import { db } from "../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const CACHE_NAME = 'echomasters-media-vault-v1';

export const getContentHash = (text: string) => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash.toString();
};

export async function generateSpeech(
    text: string, 
    voiceId: string = 'Charon', 
    elevenLabsKey?: string
): Promise<{ base64Audio: string; isRawPCM: boolean } | null> {
    const contentHash = getContentHash(text + voiceId);

    // 1. Check Local Cache (Cache API)
    try {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(`/api/audio/narration/${contentHash}`);
        if (cachedResponse) {
            const blob = await cachedResponse.blob();
            const base64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
            });
            return {
                base64Audio: base64.split(',')[1],
                isRawPCM: blob.type === 'audio/pcm'
            };
        }
    } catch (cacheErr) {
        console.warn("Local cache check failed:", cacheErr);
    }

    // 2. Check Firestore Cache
    try {
        const cacheDoc = await getDoc(doc(db, 'narrations', contentHash));
        if (cacheDoc.exists()) {
            const data = cacheDoc.data();
            const base64Audio = data.audioData;
            const isRawPCM = data.isRawPCM;
            
            // Populate local cache
            try {
                const cache = await caches.open(CACHE_NAME);
                const binary = atob(base64Audio);
                const bytes = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
                const blob = new Blob([bytes], { type: isRawPCM ? 'audio/pcm' : 'audio/mpeg' });
                await cache.put(new Request(`/api/audio/narration/${contentHash}`), new Response(blob));
            } catch (e) { console.warn("Failed to populate local cache from Firestore", e); }

            return { base64Audio, isRawPCM };
        }
    } catch (cacheErr) {
        console.warn("Firestore cache check failed:", cacheErr);
    }

    let base64Audio: string | null = null;
    let isRawPCM = false;

    // 3. Try ElevenLabs
    if (elevenLabsKey) {
        try {
            const BURT_VOICE_ID = 'Yko7iBn2vnSMvSAsuF8N'; // Default voice
            const elRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${BURT_VOICE_ID}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'xi-api-key': elevenLabsKey },
                body: JSON.stringify({
                    text: text,
                    model_id: 'eleven_turbo_v2_5',
                    voice_settings: { stability: 0.5, similarity_boost: 0.8 }
                })
            });
            if (elRes.ok) {
                const blob = await elRes.blob();
                const reader = new FileReader();
                const base64Promise = new Promise<string>((resolve) => {
                    reader.onloadend = () => resolve(reader.result as string);
                });
                reader.readAsDataURL(blob);
                const base64 = await base64Promise;
                base64Audio = base64.split(',')[1];
                isRawPCM = false;
            }
        } catch (elErr) {
            console.warn("ElevenLabs TTS failed:", elErr);
        }
    }

    // 4. Try Gemini
    if (!base64Audio) {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: `Read this clinical briefing with professional authority: ${text}` }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: voiceId as any },
                        },
                    },
                },
            });

            base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
            if (base64Audio) isRawPCM = true;
        } catch (geminiErr) {
            console.warn("Gemini TTS failed:", geminiErr);
        }
    }

    // 5. Try OpenAI
    if (!base64Audio) {
        const openAiKey = process.env.OPENAI_API_KEY || localStorage.getItem('echomasters-openai-key');
        if (openAiKey) {
            try {
                const openai = new OpenAI({ apiKey: openAiKey, dangerouslyAllowBrowser: true });
                const mp3 = await openai.audio.speech.create({
                    model: "tts-1",
                    voice: "alloy",
                    input: text,
                });
                const arrayBuffer = await mp3.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                base64Audio = buffer.toString('base64');
                isRawPCM = false;
            } catch (oaErr) {
                console.warn("OpenAI TTS failed:", oaErr);
            }
        }
    }

    // Cache the result if successful
    if (base64Audio) {
        // Cache to Firestore
        try {
            await setDoc(doc(db, 'narrations', contentHash), {
                hash: contentHash,
                voiceId,
                audioData: base64Audio,
                isRawPCM,
                createdAt: new Date().toISOString()
            });
        } catch (saveErr) {
            console.warn("Failed to cache narration to Firestore:", saveErr);
        }

        // Cache to Local Cache API
        try {
            const cache = await caches.open(CACHE_NAME);
            const binary = atob(base64Audio);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            const blob = new Blob([bytes], { type: isRawPCM ? 'audio/pcm' : 'audio/mpeg' });
            await cache.put(new Request(`/api/audio/narration/${contentHash}`), new Response(blob));
        } catch (e) { console.warn("Failed to cache narration locally", e); }

        return { base64Audio, isRawPCM };
    }

    return null;
}

export async function playAudio(
    base64Data: string, 
    isRawPCM: boolean, 
    audioContext?: AudioContext | null
): Promise<AudioBufferSourceNode | null> {
    const ctx = audioContext || new (window.AudioContext || (window as any).webkitAudioContext)();
    if (ctx.state === 'suspended') await ctx.resume();

    const binaryString = window.atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    if (isRawPCM) {
        // Assuming 16-bit PCM at 24000Hz
        const sampleRate = 24000;
        const numSamples = len / 2;
        const audioBuffer = ctx.createBuffer(1, numSamples, sampleRate);
        const channelData = audioBuffer.getChannelData(0);
        const dataView = new DataView(bytes.buffer);

        for (let i = 0; i < numSamples; i++) {
            try {
                const sample = dataView.getInt16(i * 2, true);
                channelData[i] = sample / 32768;
            } catch (e) {
                channelData[i] = 0;
            }
        }

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.start();
        return source;
    } else {
        try {
            const audioBuffer = await ctx.decodeAudioData(bytes.buffer);
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            source.start();
            return source;
        } catch (e) {
            console.warn("Failed to decode audio data, attempting raw PCM fallback");
            return playAudio(base64Data, true, ctx);
        }
    }
}
