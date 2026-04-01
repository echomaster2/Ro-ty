
import { GoogleGenAI } from "@google/genai";

export interface AIRequestConfig {
  model?: string;
  systemInstruction?: string;
  responseMimeType?: "text/plain" | "application/json";
  responseSchema?: any;
  images?: string[]; // Base64 encoded images or URLs
}

export interface AIResponse {
  text: string;
  provider: "gemini" | "openai";
}

export const generateAIContent = async (prompt: string, config: AIRequestConfig = {}): Promise<AIResponse> => {
  // Try Gemini first
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Construct contents for multimodal if images are provided
    let contents: any = prompt;
    if (config.images && config.images.length > 0) {
      const parts: any[] = [{ text: prompt }];
      for (const img of config.images) {
        // Check if it's a base64 string or URL
        if (img.startsWith('data:')) {
          const [mime, data] = img.split(';base64,');
          parts.push({
            inlineData: {
              mimeType: mime.split(':')[1],
              data: data
            }
          });
        } else {
          // If it's a URL, we might need to fetch it or use it directly if supported
          // For now, assume base64 for simplicity in this demo
          parts.push({ text: `[Image Context: ${img}]` });
        }
      }
      contents = { parts };
    }

    const response = await ai.models.generateContent({
      model: config.model || 'gemini-3-flash-preview',
      contents: contents,
      config: {
        systemInstruction: config.systemInstruction,
        responseMimeType: config.responseMimeType,
        responseSchema: config.responseSchema,
      },
    });

    if (response.text) {
      return { text: response.text, provider: "gemini" };
    }
    throw new Error("Gemini returned empty response");
  } catch (geminiError) {
    console.warn("Gemini failed, falling back to OpenAI:", geminiError);

    // Fallback to OpenAI via server-side proxy
    try {
      const response = await fetch("/api/ai/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          systemInstruction: config.systemInstruction,
          responseMimeType: config.responseMimeType,
          images: config.images,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "OpenAI fallback failed");
      }

      const data = await response.json();
      return { text: data.text, provider: "openai" };
    } catch (openaiError) {
      console.error("Both AI providers failed:", openaiError);
      throw openaiError;
    }
  }
};
