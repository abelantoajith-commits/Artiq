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
  displayName: z
    .string()
    .default("")
    .describe("The artist's preferred name or pseudonym (from Question 1)"),
  location: z
    .string()
    .default("")
    .describe("Town/city and state if stated (from Question 2)"),
  intro: z
    .string()
    .describe("2 to 3 sentences welcoming portfolio introduction for the top of the profile, capturing their art and what they want people to feel"),
  bio: z
    .string()
    .describe("Short professional artist bio in first-person voice"),
  journey: z
    .string()
    .describe("My Journey narrative in first-person voice explaining how their journey began"),
  specialities: z
    .array(z.string())
    .describe("Clean, capitalized visual skill, art form, and tradition tags (e.g. ['Kerala Mural', 'Traditional Painting', 'Natural Pigments', 'Mythological Art'])"),
  inspiration: z
    .string()
    .describe("Inspiration narrative in first-person voice integrating their creative spark and cultural stories"),
  phone: z
    .string()
    .default("")
    .describe("Phone number or WhatsApp number for contacting the artist (e.g. '+91 94471 23456')"),
  email: z
    .string()
    .default("")
    .describe("Email address for inquiries (e.g. 'artist@artiq.gallery')"),
  address: z
    .string()
    .default("")
    .describe("Studio or workshop address for physical visits or postal inquiries"),
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

  const displayName = typeof profileObj?.displayName === "string"
    ? profileObj.displayName
    : typeof raw?.displayName === "string"
    ? raw.displayName
    : typeof profileObj?.name === "string"
    ? profileObj.name
    : "";

  const location = typeof profileObj?.location === "string"
    ? profileObj.location
    : typeof raw?.location === "string"
    ? raw.location
    : "";

  const intro = typeof profileObj?.intro === "string" ? profileObj.intro : (typeof raw?.intro === "string" ? raw.intro : "");
  const bio = typeof profileObj?.bio === "string" ? profileObj.bio : (typeof raw?.bio === "string" ? raw.bio : "");
  const journey = typeof profileObj?.journey === "string" ? profileObj.journey : (typeof raw?.journey === "string" ? raw.journey : "");
  
  const rawSpecialities = Array.isArray(profileObj?.specialities)
    ? profileObj.specialities
    : Array.isArray(raw?.specialities)
    ? raw.specialities
    : Array.isArray(profileObj?.skills)
    ? profileObj.skills
    : [];

  const specialities = rawSpecialities
    .map(String)
    .map((s) => s.replace(/^[•\-*]\s*/, "").trim())
    .filter((s) => s.length > 1 && s.length < 50);

  const inspiration = typeof profileObj?.inspiration === "string" ? profileObj.inspiration : (typeof raw?.inspiration === "string" ? raw.inspiration : "");

  const phone = typeof profileObj?.phone === "string" ? profileObj.phone : (typeof raw?.phone === "string" ? raw.phone : "");
  const email = typeof profileObj?.email === "string" ? profileObj.email : (typeof raw?.email === "string" ? raw.email : "");
  const address = typeof profileObj?.address === "string" ? profileObj.address : (typeof raw?.address === "string" ? raw.address : "");

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
    displayName,
    location,
    intro,
    bio,
    journey,
    specialities,
    inspiration,
    phone,
    email,
    address,
    missing,
    unclear,
    basedOn,
  };
}

export const IDENTITY_BUILDER_SYSTEM_INSTRUCTION = `
You are the AI Identity Assistant for ARTIQ, an empowering platform for traditional and independent artists.
Tagline: "Every Artist Deserves to Be Seen."

YOUR MISSION:
Transform the artist's spoken and written interview answers into an authentic, dignified, professional portfolio profile.

ORGANIZING DETAILS INTO THE PORTFOLIO:
1. "displayName": The artist's preferred name or studio moniker (from Question 1).
2. "location": Town/city and state (from Question 2).
3. "specialities": Display the artist's skills, art types, techniques, and traditions as VISUAL TAGS.
   Extract 4 to 8 crisp, capitalized tags (e.g. ["Kerala Mural", "Traditional Painting", "Natural Pigments", "Mythological Art", "Fresco-secco", "Handloom Weaving"]).
   NEVER write full sentences in specialities, only concise visual tags.
4. "intro": 2 to 3 sentences welcoming visitors at the top of their public profile. Synthesize what they create, their roots, and what they want viewers to understand or feel (Question 8).
5. "bio": A short, dignified professional first-person bio.
6. "journey": My Art Journey narrative in first-person voice ("I began...", "My journey started...").
7. "inspiration": What inspires their creations, including cultural traditions, folklore, and stories reflected in their work (Questions 5 & 7).

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
  answers: Array<{ questionId: string; text: string }>,
  userProfile?: {
    displayName?: string;
    location?: string;
    phone?: string;
    email?: string;
    address?: string;
  }
): IdentityOutput {
  const answerMap = new Map(answers.map((a) => [a.questionId, a.text.trim()]));

  const nameAns = userProfile?.displayName || answerMap.get("name") || "";
  const locAns = userProfile?.location || userProfile?.address || answerMap.get("location") || "";
  const artTypeAns = answerMap.get("art_type") || "";
  const journeyAns = answerMap.get("journey") || "";
  const inspAns = answerMap.get("inspiration") || "";
  const techAns = answerMap.get("techniques") || "";
  const storiesAns = answerMap.get("cultural_stories") || "";
  const feelingAns = answerMap.get("audience_feeling") || "";
  const contactAns = answerMap.get("contact") || "";

  // Contact fields from profile or fallback
  const emailMatch = contactAns.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = userProfile?.email || (emailMatch ? emailMatch[0] : "");

  const phoneMatch = contactAns.match(/(?:\+?\d{1,3}[\s-]?)?\(?\d{3,5}\)?[\s.-]?\d{3,5}[\s.-]?\d{3,5}/);
  const phone = userProfile?.phone || (phoneMatch ? phoneMatch[0].trim() : "");

  let address = userProfile?.address || contactAns;
  if (!userProfile?.address && address) {
    if (email) address = address.replace(email, "");
    if (phone) address = address.replace(phone, "");
    address = address.replace(/^[\s,;:\-]+|[\s,;:\-]+$/g, "").trim();
  }

  // Visual skills / tags extraction
  const rawTagSource = [artTypeAns, techAns, storiesAns].filter(Boolean).join(", ");
  const specialities = rawTagSource
    ? Array.from(
        new Set(
          rawTagSource
            .split(/[,;\n•\-*]+/)
            .map((s) => s.trim())
            .filter((s) => s.length > 1 && s.length < 40)
            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        )
      ).slice(0, 8)
    : [];

  const intro = [feelingAns, artTypeAns].filter(Boolean).join(" ");
  const bio = [nameAns, locAns, artTypeAns].filter(Boolean).join(" · ") || artTypeAns;
  const inspiration = [inspAns, storiesAns].filter(Boolean).join("\n\n");

  const basedOn: Record<string, string[]> = {
    intro: ["audience_feeling", "art_type"].filter((id) => Boolean(answerMap.get(id))),
    bio: ["art_type"].filter((id) => Boolean(answerMap.get(id))),
    journey: ["journey"].filter((id) => Boolean(answerMap.get(id))),
    specialities: ["art_type", "techniques", "cultural_stories"].filter((id) => Boolean(answerMap.get(id))),
    inspiration: ["inspiration", "cultural_stories"].filter((id) => Boolean(answerMap.get(id))),
  };

  const missing: string[] = [];
  if (!intro) missing.push("intro");
  if (!bio) missing.push("bio");
  if (!journeyAns) missing.push("journey");
  if (specialities.length === 0) missing.push("specialities");
  if (!inspiration) missing.push("inspiration");

  return {
    displayName: nameAns,
    location: locAns,
    intro,
    bio,
    journey: journeyAns,
    specialities,
    inspiration,
    phone,
    email,
    address,
    missing,
    unclear: [],
    basedOn,
  };
}
