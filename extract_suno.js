import { GoogleGenAI } from "@google/genai";

async function run() {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const playlistUrl = "https://suno.com/playlist/fe650ac6-a142-4583-ab07-8787e69d2ca1";
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Extract all song titles and their unique IDs from this Suno playlist: ${playlistUrl}. 
            Return the data as a JSON array of objects with 'title' and 'id' fields. 
            The ID is the UUID found in the song URLs.`,
            config: {
                tools: [{ urlContext: {} }],
                responseMimeType: "application/json"
            }
        });

        console.log(response.text);
    } catch (error) {
        console.error(error);
    }
}

run();
