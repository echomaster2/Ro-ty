import { GoogleGenAI } from "@google/genai";

export interface SunoTrack {
    id: string;
    title: string;
    artist: string;
    url: string;
}

export const syncSunoProfile = async (profileUrl: string): Promise<SunoTrack[]> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        // Use Gemini to "read" the Suno profile and extract song IDs
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Extract all song titles and their unique IDs from this Suno profile: ${profileUrl}. 
            Return the data as a JSON array of objects with 'title' and 'id' fields. 
            The ID is the UUID found in the song URLs (e.g., de485ce0-36f5-4af7-8a13-8db6656524bc).`,
            config: {
                tools: [{ urlContext: {} }],
                responseMimeType: "application/json"
            }
        });

        const text = response.text;
        const songs = JSON.parse(text);

        return songs.map((s: any) => ({
            id: `suno-${s.id}`,
            title: s.title,
            artist: 'Fairway Dreams',
            url: `https://cdn1.suno.ai/${s.id}.mp3`
        }));
    } catch (error) {
        console.error("Suno Sync Failed:", error);
        return [];
    }
};
