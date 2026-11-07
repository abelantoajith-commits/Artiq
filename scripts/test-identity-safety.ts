import { GoogleGenAI } from "@google/genai";
import {
  IDENTITY_BUILDER_SYSTEM_INSTRUCTION,
  identityOutputSchema,
  createRawIdentityFallback,
  normalizeIdentityOutput,
} from "@/lib/ai/identity";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.log("No GEMINI_API_KEY found, fallback test only");
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

async function testAnswerSet(label: string, answers: Array<{ questionId: string; text: string }>, lang: "en" | "ml") {
  console.log(`\n========================================`);
  console.log(`TEST: ${label}`);
  console.log(`Answers provided:`, JSON.stringify(answers, null, 2));

  const t0 = Date.now();
  if (ai) {
    try {
      const prompt = `
Target Output Language: ${lang === "ml" ? "Malayalam (മലയാളം)" : "English"}

ARTIST'S SPOKEN & WRITTEN INTERVIEW ANSWERS:
${answers.map((a, i) => `[Question ${i + 1} - ID: "${a.questionId}"]\n"""\n${a.text.trim()}\n"""`).join("\n\n")}

Transform these authentic answers into a structured profile according to your system rules.
Return strictly valid JSON conforming to the requested schema.
`;

      const candidateModels = ["gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-3.8-flash"];
      let response = null;
      for (const model of candidateModels) {
        try {
          response = await ai.models.generateContent({
            model,
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
              systemInstruction: IDENTITY_BUILDER_SYSTEM_INSTRUCTION,
              responseMimeType: "application/json",
            },
          });
          if (response && response.text) break;
        } catch {
          // try next
        }
      }
      if (!response) throw new Error("All candidate models failed");

      const parsed = JSON.parse(response.text || "{}");
      const normalized = normalizeIdentityOutput(parsed);
      const validated = identityOutputSchema.safeParse(normalized);
      const durationMs = Date.now() - t0;
      console.log(`Success in ${durationMs}ms`);

      if (!validated.success) {
        console.log(`Validation errors:`, validated.error.issues);
      } else {
        console.log(`Validated JSON output:`, JSON.stringify(validated.data, null, 2));
      }

      // Safety checks:
      const fullText = JSON.stringify(validated.data || normalized);
      const suspiciousWords = ["award", "national award", "padma", "exhibition", "born in 19", "198", "199", "200", "gallery in"];
      const foundSuspicious = suspiciousWords.filter(w => fullText.toLowerCase().includes(w) && !JSON.stringify(answers).toLowerCase().includes(w));
      console.log(`Safety verification (hallucinated facts/awards):`, foundSuspicious.length === 0 ? "PASSED (No invented facts)" : `FAILED: found ${foundSuspicious.join(", ")}`);
      console.log(`Missing sections properly identified:`, (validated.data || parsed)?.missing);
      console.log(`Unclear items:`, (validated.data || parsed)?.unclear);
      return;
    } catch (e) {
      console.log(`Gemini error:`, e);
    }
  }

  // Fallback test
  const fallback = createRawIdentityFallback(answers);
  console.log(`Fallback Output:`, JSON.stringify(fallback, null, 2));
}

async function run() {
  // Set 1: Full 8 Questions Artist Portfolio Test
  await testAnswerSet("8 Questions Artist Portfolio", [
    { questionId: "name", text: "K. R. Raghavan (people call me Raghavan Master)" },
    { questionId: "location", text: "Kottayam, Kerala" },
    { questionId: "art_type", text: "Traditional Kerala temple mural painting and wooden carving" },
    { questionId: "journey", text: "I started under Guruvayur masters 40 years ago learning sacred proportions and ancient temple styles." },
    { questionId: "inspiration", text: "Ancient mythological narratives and the divine energy of nature." },
    { questionId: "techniques", text: "Fresco-secco on lime plaster, natural rock pigments, tree resin binders, fine bamboo quill lining." },
    { questionId: "cultural_stories", text: "500-year-old temple mural iconography reflecting our spiritual heritage." },
    { questionId: "audience_feeling", text: "A deep sense of peace, devotion, and appreciation for traditional Indian roots." }
  ], "en");

  // Set 2: Malayalam 8 Questions
  await testAnswerSet("Malayalam Traditional 8 Questions", [
    { questionId: "name", text: "രാഘവൻ മാസ്റ്റർ" },
    { questionId: "location", text: "കോട്ടയം, കേരളം" },
    { questionId: "art_type", text: "കേരള ചുവർചിത്രരചന" },
    { questionId: "journey", text: "ഗുരുവായൂരിലെ ചിത്രകലാ ഗുരുക്കന്മാരുടെ കീഴിൽ അഭ്യസിച്ചാണ് ഞാൻ ഈ രംഗത്തേക്ക് വന്നത്." },
    { questionId: "inspiration", text: "ക്ഷേത്രങ്ങളിലെ പഴയ ചുവർചിത്രങ്ങളും ഐതിഹ്യങ്ങളും പ്രകൃതിഭംഗിയുമാണ് എന്റെ പ്രചോദനം." },
    { questionId: "techniques", text: "പ്രകൃതിദത്ത ചായക്കൂട്ടുകൾ, ചുണ്ണാമ്പ് ഭിത്തിയിലെ രചന, മുള കൊണ്ടുള്ള ബ്രഷുകൾ." },
    { questionId: "cultural_stories", text: "നൂറ്റാണ്ടുകൾ പഴക്കമുള്ള ക്ഷേത്ര പാരമ്പര്യം." },
    { questionId: "audience_feeling", text: "മനസ്സിന് ശാന്തിയും പരമ്പരാഗത പൈതൃകത്തോടുള്ള ആദരവും." }
  ], "ml");
}

run();
