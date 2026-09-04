import { GoogleGenAI } from "@google/genai";

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

export async function askAI(prompt) {
  if (!ai) {
    return "AI is in demo mode. Add GEMINI_API_KEY to the backend .env file to enable live Gemini responses.";
  }

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-3.6-flash",
    contents: prompt
  });

  return response.text || "No AI response was returned.";
}

export function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (match) {
      try { return JSON.parse(match[0]); } catch {}
    }
    return null;
  }
}
