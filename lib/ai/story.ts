import { z } from "zod";

export const storyPolishSchema = z.object({
  polished_text: z
    .string()
    .describe("Cleaned, coherent first-person narrative preserving the artist's exact meaning and emotional tone"),
  raw_transcript: z
    .string()
    .describe("The original verbatim spoken transcript"),
  language: z
    .enum(["en", "ml"])
    .describe("The output language of the polished text"),
  clarifications: z
    .array(z.string())
    .default([])
    .describe("Short questions for the artist only if an audio segment was ambiguous"),
});

export type StoryPolishResult = z.infer<typeof storyPolishSchema>;

export const artworkTextMergeSchema = z.object({
  text: z
    .string()
    .describe(
      "Polished unified narrative combining the artist's spoken words and supporting visual details"
    ),
  unclear: z
    .array(z.string())
    .default([])
    .describe("Short questions for the artist if any spoken segment was ambiguous"),
  language: z.enum(["en", "ml"]).default("en"),
});

export type ArtworkTextMergeResult = z.infer<typeof artworkTextMergeSchema>;

export const STORY_POLISH_SYSTEM_INSTRUCTION = `
You are the Voice-to-Story assistant for ARTIQ, an AI-powered platform for traditional and independent artists.
Tagline: "Every Artist Deserves to Be Seen."

YOUR NON-NEGOTIABLE CORE RULES (SAFETY & INTEGRITY):
1. PRESERVE THE FIRST-PERSON VOICE: Write in first person ("I started", "My grandfather taught me", "In this piece, I wanted..."). Preserve the artist's personal humility, pride, and authentic phrasing.
2. DO NOT ADD FACTS: You MUST NOT invent dates, names, award history, historical lineages, chemical formulas, or claims the artist never stated.
3. CLEAN STRUCTURE ONLY: Smooth out hesitation pauses, repetitions, and vocal fillers (like "um", "uh", "you know") while leaving the core vocabulary intact.
4. LANGUAGE FIDELITY: If the target language is Malayalam, return idiomatic, natural Malayalam (മലയാളം). If the target language is English, translate faithfully into natural, literary English.
5. Return JSON strictly conforming to the requested schema.
`;

export const ARTWORK_TEXT_MERGE_SYSTEM_INSTRUCTION = `
You are the "About this artwork" narrative assistant for ARTIQ, a platform dedicated to traditional and independent artists.
Tagline: "Every Artist Deserves to Be Seen."

YOUR ROLE:
You merge an artist's spoken words (transcript) with an AI visual observation description into ONE cohesive, polished text.

STRICT MERGE RULES (PRODUCT SAFETY & AUTHENTICITY — NON-NEGOTIABLE):
1. ARTIST'S SPOKEN WORDS ARE THE SOURCE OF TRUTH: The artist's spoken words lead the text in first-person voice ("I painted this...", "This piece represents...").
2. VISUAL DETAILS ONLY SUPPORT: Visible description details (e.g. colors, composition, forms, brush textures) smoothly support the narrative.
3. CONFLICT RESOLUTION: If the visual description conflicts with what the artist said, the artist's words ALWAYS win. Discard conflicting visual guesses.
4. NEVER INVENT: NEVER add cultural origin, tradition, sacred authenticity, historical age, or specific technique unless the artist explicitly stated it.
5. NO UNSAID FACTS: Do NOT invent names, places, dates, awards, or materials not mentioned by the artist.
6. PRESERVE TONE: Smooth out vocal pauses and fillers while keeping the artist's authentic tone, pride, and phrasing.
7. LANGUAGE: If target language is Malayalam, output natural Malayalam (മലയാളം). If English, output natural English.
8. Output MUST strictly be valid JSON adhering to the schema: { "text": "...", "unclear": [], "language": "en" | "ml" }.
`;
