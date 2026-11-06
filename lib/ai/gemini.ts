import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import { env } from "@/lib/env";

export const artworkAnalysisSchema = z.object({
  title_suggestions: z
    .array(z.string())
    .min(1)
    .describe("3 distinct, respectful titles describing visible subjects and forms"),
  description: z
    .string()
    .default("")
    .describe(
      "A thoughtful 2-3 sentence description focusing purely on visible colors, composition, and subjects without guessing cultural history"
    ),
  caption: z
    .string()
    .default("")
    .describe("A short poetic 1-line social caption for discovery"),
  hashtags: z
    .union([z.array(z.string()), z.string()])
    .transform((v) => (Array.isArray(v) ? v : [v]))
    .default([])
    .describe("Relevant searchable hashtags (e.g. #TraditionalArt, #Handmade, #Ochre)"),
  keywords: z
    .union([z.array(z.string()), z.string()])
    .transform((v) => (Array.isArray(v) ? v : [v]))
    .default([]),
  suggested_categories: z
    .union([z.array(z.string()), z.string()])
    .transform((v) => (Array.isArray(v) ? v : [v]))
    .default([])
    .describe("Matched categories from: traditional, kerala-mural, textiles, handicrafts, sculpture, modern, digital"),
  visual_observations: z
    .object({
      colours: z
        .union([z.array(z.string()), z.string()])
        .transform((v) => (Array.isArray(v) ? v : [v]))
        .default([]),
      subjects: z
        .union([z.array(z.string()), z.string()])
        .transform((v) => (Array.isArray(v) ? v : [v]))
        .default([]),
      style_notes: z
        .union([z.string(), z.array(z.string())])
        .transform((v) => (Array.isArray(v) ? v.join(", ") : v || ""))
        .default(""),
    })
    .default({ colours: [], subjects: [], style_notes: "" }),
});

export type ArtworkAnalysisResult = z.infer<typeof artworkAnalysisSchema>;

export const ARTWORK_ANALYSIS_SYSTEM_INSTRUCTION = `
You are the visual observation AI assistant for ARTIQ, a platform dedicated to traditional and independent artists.
Tagline: "Every Artist Deserves to Be Seen."

YOUR NON-NEGOTIABLE CORE RULES (SAFETY & INTEGRITY):
1. OBSERVE ONLY WHAT IS VISIBLE: Describe colors, forms, shapes, visible subjects, composition, and visible material textures.
2. NEVER INVENT OR GUESS: Do NOT invent cultural origin, historical age, sacred authenticity, artist intent, or specific ancient technique from a photo alone.
3. RESPECTFUL SUGGESTIONS ONLY: If a style looks like a specific tradition (e.g. mural, folk drawing), frame it modestly as an observation or a question for the artist ("Appears to feature mural-like earth tones. Is this accurate?"). The artist is the sole source of truth.
4. Output MUST strictly be valid JSON adhering to the schema.
`;

/**
 * Returns an initialized Google GenAI instance if API key is present.
 */
export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your-gemini-api-key") {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

