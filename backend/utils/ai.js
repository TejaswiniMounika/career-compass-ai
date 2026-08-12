import { GoogleGenAI } from "@google/genai";

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

export async function askAI(prompt) {
  if (!ai) {
    return "AI is in demo mode. Add GEMINI_API_KEY to the backend .env file to enable live Gemini responses.";
  }

  try {
    const response = await Promise.race([
      ai.models.generateContent({
        model: process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
        contents: prompt,
        config: {
          maxOutputTokens: 800,
          temperature: 0.3
        }
      }),

      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("AI request timed out after 30 seconds")), 30000)
      )
    ]);

    return response.text || "No AI response was returned.";

  } catch (error) {
    console.error("Gemini error:", error.message);
    return `AI request failed: ${error.message}`;
  }
}

export function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {}

  // Remove markdown code fences
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {}

  // Find JSON object
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start !== -1 && end !== -1 && end > start) {
    try {
      return JSON.parse(cleaned.slice(start, end + 1));
    } catch {}
  }

  return null;
}