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

/**
 * Normalizes freeform or variant Gemini JSON output to strictly conform to ArtworkAnalysisResult.
 * Ensures the artist always receives actual AI-observed data regardless of key naming differences.
 */
export function normalizeArtworkAnalysisResponse(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;
  const obj = raw as Record<string, unknown>;

  // 1. Title suggestions: accept title_suggestions, titles, title, or name
  let titles: string[] = [];
  if (Array.isArray(obj.title_suggestions)) {
    titles = obj.title_suggestions.map(String).filter((t) => t.trim().length > 0);
  } else if (Array.isArray(obj.titles)) {
    titles = obj.titles.map(String).filter((t) => t.trim().length > 0);
  } else if (typeof obj.title === "string" && obj.title.trim()) {
    titles = [obj.title.trim()];
  } else if (typeof obj.title_suggestions === "string" && obj.title_suggestions.trim()) {
    titles = [obj.title_suggestions.trim()];
  }

  // 2. Hashtags: accept hashtags, tags, search_tags
  let hashtags: string[] = [];
  const rawTags = obj.hashtags || obj.tags || obj.search_tags;
  if (Array.isArray(rawTags)) {
    hashtags = rawTags.map(String).filter((t) => t.trim().length > 0);
  } else if (typeof rawTags === "string" && rawTags.trim()) {
    hashtags = rawTags.split(",").map((t) => t.trim()).filter((t) => t.length > 0);
  }
  hashtags = hashtags.map((t) => (t.startsWith("#") ? t : `#${t}`));

  // 3. Keywords
  let keywords: string[] = [];
  const rawKw = obj.keywords || obj.keyword_list || obj.search_terms;
  if (Array.isArray(rawKw)) {
    keywords = rawKw.map(String).filter((k) => k.trim().length > 0);
  } else if (typeof rawKw === "string" && rawKw.trim()) {
    keywords = rawKw.split(",").map((k) => k.trim()).filter((k) => k.length > 0);
  }

  // 4. Categories
  let categories: string[] = [];
  const rawCats = obj.suggested_categories || obj.categories || obj.category;
  if (Array.isArray(rawCats)) {
    categories = rawCats.map(String).filter((c) => c.trim().length > 0);
  } else if (typeof rawCats === "string" && rawCats.trim()) {
    categories = [rawCats.trim()];
  }

  // 5. Visual details / observations
  const vis = (obj.visual_observations || obj.visual_details || {}) as Record<string, unknown>;

  let colours: string[] = [];
  const rawColours = vis.colours || vis.colors || obj.colours || obj.colors;
  if (Array.isArray(rawColours)) {
    colours = rawColours.map(String).filter((c) => c.trim().length > 0);
  } else if (typeof rawColours === "string" && rawColours.trim()) {
    colours = rawColours.split(",").map((c) => c.trim()).filter((c) => c.length > 0);
  }

  let subjects: string[] = [];
  const rawSubjects = vis.subjects || vis.visible_subjects || vis.forms || obj.subjects;
  if (Array.isArray(rawSubjects)) {
    subjects = rawSubjects.map(String).filter((s) => s.trim().length > 0);
  } else if (typeof rawSubjects === "string" && rawSubjects.trim()) {
    subjects = rawSubjects.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
  }

  let styleNotes =
    vis.style_notes ||
    vis.style_observations ||
    vis.composition ||
    obj.style_notes ||
    "";
  if (Array.isArray(styleNotes)) {
    styleNotes = styleNotes.map(String).join(", ");
  }

  return {
    ...obj,
    title_suggestions: titles.length > 0 ? titles : ["Handcrafted Visual Composition"],
    description: typeof obj.description === "string" ? obj.description : "",
    caption: typeof obj.caption === "string" ? obj.caption : "",
    hashtags,
    keywords,
    suggested_categories: categories.length > 0 ? categories : ["traditional"],
    visual_observations: {
      colours,
      subjects,
      style_notes: String(styleNotes || ""),
    },
  };
}

export const ARTWORK_ANALYSIS_SYSTEM_INSTRUCTION = `
You are the visual observation AI assistant for ARTIQ, a platform dedicated to traditional and independent artists.
Tagline: "Every Artist Deserves to Be Seen."

YOUR NON-NEGOTIABLE CORE RULES (SAFETY & INTEGRITY):
1. OBSERVE ONLY WHAT IS VISIBLE: Describe colors, forms, shapes, visible subjects, composition, and visible material textures.
2. NEVER INVENT OR GUESS: Do NOT invent cultural origin, historical age, sacred authenticity, artist intent, or specific ancient technique from a photo alone.
3. RESPECTFUL SUGGESTIONS ONLY: If a style looks like a specific tradition (e.g. mural, folk drawing), frame it modestly as an observation or a question for the artist ("Appears to feature mural-like earth tones. Is this accurate?"). The artist is the sole source of truth.
4. TITLE GENERATION: Provide 3 distinct, creative, and respectful titles directly inspired by visible visual elements (e.g. key subjects, focal color, mood, or rhythmic lines). Never return generic placeholders.
5. STRICT OUTPUT FORMAT: Output MUST strictly be valid JSON adhering EXACTLY to this structure with these exact keys:
{
  "title_suggestions": ["Distinct Title 1", "Distinct Title 2", "Distinct Title 3"],
  "description": "2-3 sentences describing visible colors, shapes, subjects, and composition without guessing cultural origin.",
  "caption": "A short poetic 1-line social caption for discovery.",
  "hashtags": ["#Tag1", "#Tag2", "#Tag3", "#Tag4"],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "suggested_categories": ["traditional", "handicrafts"],
  "visual_observations": {
    "colours": ["Dominant color 1", "Accent color 2"],
    "subjects": ["Visible subject 1", "Visible motif 2"],
    "style_notes": "Visible texture, line weight, or tool marks."
  }
}
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

