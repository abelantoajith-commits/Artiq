import { z } from "zod";

export const identityInputSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      text: z.string(),
    })
  ),
  outputLanguage: z.enum(["en", "ml"]).default("en"),
});

export type IdentityInput = z.infer<typeof identityInputSchema>;

export const identityOutputSchema = z.object({
  intro: z
    .string()
    .describe("2 to 3 sentences portfolio introduction for the top of the public profile"),
  bio: z
    .string()
    .describe("Short professional artist bio in first-person voice"),
  journey: z
    .string()
    .describe("My Journey narrative in first-person voice explaining how they started and developed their art"),
  specialities: z
    .array(z.string())
    .describe("Distinct art forms, specialities, and techniques as concise tags (e.g. ['Kerala mural', 'Natural pigments'])"),
  inspiration: z
    .string()
    .describe("Inspiration narrative in first-person voice"),
  missing: z
    .array(z.string())
    .default([])
    .describe("List of section keys ('intro', 'bio', 'journey', 'specialities', 'inspiration') that had no information provided"),
  unclear: z
    .array(z.string())
    .default([])
    .describe("Short questions for the artist if any answer was ambiguous"),
  basedOn: z
    .record(z.string(), z.array(z.string()))
    .default({})
    .describe("Mapping of each section key to the questionIds that were used as its source"),
});

export type IdentityOutput = z.infer<typeof identityOutputSchema>;

/**
 * Normalizes raw Gemini output into the expected flat IdentityOutput structure.
 * Handles cases where the model nests fields under `profile` or adds metadata.
 */
export function normalizeIdentityOutput(raw: Record<string, unknown>): IdentityOutput {
  const profileObj = (raw?.profile && typeof raw.profile === "object" ? raw.profile : raw) as Record<string, unknown>;

  const intro = typeof profileObj?.intro === "string" ? profileObj.intro : (typeof raw?.intro === "string" ? raw.intro : "");
  const bio = typeof profileObj?.bio === "string" ? profileObj.bio : (typeof raw?.bio === "string" ? raw.bio : "");
  const journey = typeof profileObj?.journey === "string" ? profileObj.journey : (typeof raw?.journey === "string" ? raw.journey : "");
  const specialities = Array.isArray(profileObj?.specialities)
    ? profileObj.specialities.map(String)
    : Array.isArray(raw?.specialities)
    ? raw.specialities.map(String)
    : [];
  const inspiration = typeof profileObj?.inspiration === "string" ? profileObj.inspiration : (typeof raw?.inspiration === "string" ? raw.inspiration : "");

  const missing = Array.isArray(raw?.missing)
    ? raw.missing.map(String)
    : Array.isArray(profileObj?.missing)
    ? profileObj.missing.map(String)
    : [];

  const unclear = Array.isArray(raw?.unclear)
    ? raw.unclear.map(String)
    : Array.isArray(profileObj?.unclear)
    ? profileObj.unclear.map(String)
    : [];

  const basedOn = (
    raw?.basedOn && typeof raw.basedOn === "object"
      ? raw.basedOn
      : profileObj?.basedOn && typeof profileObj.basedOn === "object"
      ? profileObj.basedOn
      : {}
  ) as Record<string, string[]>;

  return {
    intro,
    bio,
    journey,
    specialities,
    inspiration,
    missing,
    unclear,
    basedOn,
  };
}

export const IDENTITY_BUILDER_SYSTEM_INSTRUCTION = `
You are the AI Identity Assistant for ARTIQ, an empowering platform for traditional and independent artists.
Tagline: "Every Artist Deserves to Be Seen."

YOUR MISSION:
Transform the artist's spoken and written interview answers into an authentic, dignified, professional profile.

CRITICAL PRODUCT SAFETY & TRUTH RULES (NON-NEGOTIABLE):
1. SOLE SOURCE OF TRUTH: Use ONLY the information stated by the artist in their answers.
2. FIRST-PERSON VOICE: All prose sections (intro, bio, journey, inspiration) MUST be written in the artist's first-person voice ("I create...", "My art is rooted in...", "I was inspired by...").
3. STRICT BAN ON INVENTED FACTS:
   - NEVER invent or assume dates, numbers, years, awards, gallery exhibitions, prizes, or sales figures.
   - NEVER invent teachers, mentors, family heritage, geographical origins, castes, communities, or institutions that the artist did not state.
   - NEVER add claims of cultural authenticity, ritual significance, or historical lineage unless explicitly stated by the artist.
4. CLEAN STRUCTURE ONLY: Fix grammar, smooth out hesitation fillers, and format into natural sentences while keeping the artist's authentic tone, pride, and humility.
5. MISSING INFORMATION:
   - If the artist did not answer a question or provided no info for a section, leave that section EMPTY ("" or empty array []) and include its key in the "missing" list.
   - DO NOT fill empty sections with generic fluff.
6. AMBIGUITIES:
   - If a sentence in the answers is ambiguous or contradictory, place a brief, polite clarifying question in the "unclear" list.
7. TRACEABILITY:
   - Populate "basedOn" with an object mapping each section key ("intro", "bio", "journey", "specialities", "inspiration") to an array of questionIds that provided the source material for that section.
8. LANGUAGE:
   - If outputLanguage is "ml", write natural, respectful Malayalam (മലയാളം).
   - If outputLanguage is "en", write warm, respectful English.
`;

/**
 * Creates a raw fallback mapping when AI generation is unavailable.
 * Ensures the artist is never blocked from editing and publishing.
 */
export function createRawIdentityFallback(
  answers: Array<{ questionId: string; text: string }>
): IdentityOutput {
  const answerMap = new Map(answers.map((a) => [a.questionId, a.text.trim()]));

  const introAns = answerMap.get("intro") || "";
  const mentorAns = answerMap.get("mentor") || "";
  const expAns = answerMap.get("experience") || "";
  const inspAns = answerMap.get("inspiration") || "";
  const specialAns = answerMap.get("special") || "";
  const techAns = answerMap.get("techniques") || "";

  const journeyParts = [mentorAns, expAns].filter(Boolean);
  const journey = journeyParts.join(" ");

  const specialitiesRaw = [techAns, specialAns].filter(Boolean).join(", ");
  const specialities = specialitiesRaw
    ? Array.from(
        new Set(
          specialitiesRaw
            .split(/[,;\n]+/)
            .map((s) => s.trim())
            .filter((s) => s.length > 1 && s.length < 40)
        )
      ).slice(0, 8)
    : [];

  const basedOn: Record<string, string[]> = {
    intro: ["intro"].filter((id) => Boolean(answerMap.get(id))),
    bio: ["intro", "special"].filter((id) => Boolean(answerMap.get(id))),
    journey: ["mentor", "experience"].filter((id) => Boolean(answerMap.get(id))),
    specialities: ["techniques", "special"].filter((id) => Boolean(answerMap.get(id))),
    inspiration: ["inspiration"].filter((id) => Boolean(answerMap.get(id))),
  };

  const missing: string[] = [];
  if (!introAns) missing.push("intro");
  if (!introAns && !specialAns) missing.push("bio");
  if (!journey) missing.push("journey");
  if (specialities.length === 0) missing.push("specialities");
  if (!inspAns) missing.push("inspiration");

  return {
    intro: introAns,
    bio: introAns || specialAns,
    journey,
    specialities,
    inspiration: inspAns,
    missing,
    unclear: [],
    basedOn,
  };
}
