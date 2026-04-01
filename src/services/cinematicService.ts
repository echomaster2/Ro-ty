
import { generateAIContent } from '../lib/aiService';

const CACHE_NAME = 'echomasters-media-vault-v1';
const DEFAULT_VOICE_ID = 'Yko7iBn2vnSMvSAsuF8N';

export interface CinematicIntroData {
    title: string;
    seedText: string;
    type: 'module' | 'lesson' | 'tool' | 'section';
    persona?: 'Charon' | 'Puck' | 'Kore' | 'Zephyr';
    voiceId?: string;
}

const getCacheKey = (text: string) => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return Math.abs(hash).toString(16);
};

export const isCinematicIntroCached = async (data: CinematicIntroData): Promise<boolean> => {
    const { title, seedText, persona = 'Charon', voiceId = DEFAULT_VOICE_ID } = data;
    const textHash = getCacheKey(title + seedText);
    const cacheId = `intro-${textHash}-${persona}-${voiceId}`;
    
    try {
        const cache = await caches.open(CACHE_NAME);
        const match = await cache.match(`/api/audio/${cacheId}`);
        return !!match;
    } catch {
        return false;
    }
};

export const getCachedIntrosCount = async (): Promise<number> => {
    try {
        const cache = await caches.open(CACHE_NAME);
        const keys = await cache.keys();
        return keys.filter(k => k.url.includes('/api/audio/intro-')).length;
    } catch {
        return 0;
    }
};

export const preCacheCinematicIntro = async (data: CinematicIntroData, elevenLabsKey: string): Promise<boolean> => {
    const { title, seedText, type, persona = 'Charon', voiceId = DEFAULT_VOICE_ID } = data;
    const textHash = getCacheKey(title + seedText);
    const cacheId = `intro-${textHash}-${persona}-${voiceId}`;

    // Skip if already cached
    if (await isCinematicIntroCached(data)) return true;

    try {
        const typeContext = {
            module: "You are introducing a new module of the syllabus.",
            lesson: "You are introducing a specific lesson.",
            tool: "You are introducing a specialized training tool.",
            section: "You are introducing a new section of the matrix."
        }[type];

        const response = await generateAIContent(`ACT AS PROFESSOR ${persona}, AN ELITE ULTRASOUND PHYSICS MENTOR. SUBJECT: "${title}".
            CONTEXT: ${typeContext}
            
            STRICTLY FOLLOW THIS HUMAN-CENTRIC STORYTELLING ARCHITECTURE:
            
            1. NATURAL CADENCE: DO NOT USE ANY SYMBOLS. No commas, no periods, no ellipses, no percentages, no hashes, no at-signs, no asterisks, no ampersands. Use only letters, numbers, and spaces.
            2. NO CONTRACTIONS: Use "do not" instead of "dont", "it is" instead of "its", "you are" instead of "youre". This ensures perfect spelling without symbols.
            3. CONVERSATIONAL FILLERS: Occasionally use natural transitions like "Listen close" or "Now think about this".
            4. ZERO-HOUR SCENARIO: Start with a 10-second high-stakes medical scenario.
            5. QUANTIFY EFFORT: State how you aggregated sources to save them hours. 
            6. PROMISE ASSESSMENT: "There is a little assessment at the end."
            7. STRUCTURED ROADMAP: 4 parts: Definitions, Core Concepts, Practical Application, and Insight.
            8. THE NEGATION: Explain what it is NOT first with natural skepticism.
            9. MNEMONIC MATRIX: Create a memorable acronym.
            
            CONTENT SPECIFICS: "${seedText}"
            STRICT INSTRUCTION: DO NOT USE ANY SYMBOLS IN THE GENERATED TEXT. Use only letters, numbers, and spaces.
            MAX: 150 words. Tone: Authoritative, paternal, deeply human, concise, impactful.`, {
            model: 'gemini-3-flash-preview'
        });

        const generatedScript = response?.text || seedText;

        // TTS
        const elRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'xi-api-key': elevenLabsKey },
            body: JSON.stringify({
                text: generatedScript,
                model_id: 'eleven_turbo_v2_5',
                voice_settings: { 
                    stability: 0.45,
                    similarity_boost: 0.8,
                    style: 0.1,
                    use_speaker_boost: true 
                }
            }),
        });

        if (!elRes.ok) throw new Error("TTS Link Failed");
        const blob = await elRes.blob();
        
        const cache = await caches.open(CACHE_NAME);
        await cache.put(new Request(`/api/audio/${cacheId}`), new Response(blob));
        
        localStorage.setItem(`script-${cacheId}`, generatedScript);
        return true;
    } catch (e) {
        console.error(`Pre-cache failed for cinematic intro: ${title}`, e);
        return false;
    }
};
