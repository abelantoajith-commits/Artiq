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
  // Set 1: Very short / single answer
  await testAnswerSet("Minimal Single Answer", [
    { questionId: "intro", text: "I paint murals on mud walls using river stones." }
  ], "en");

  // Set 2: Ambiguous statement
  await testAnswerSet("Ambiguous Statement", [
    { questionId: "intro", text: "I do painting and sometimes something else that is very rare." },
    { questionId: "inspiration", text: "The forest behind my house." }
  ], "en");

  // Set 3: Malayalam answers
  await testAnswerSet("Malayalam Traditional Answers", [
    { questionId: "intro", text: "ഞാൻ കോട്ടയത്ത് നിന്നുള്ള പരമ്പരാഗത ചുവർചിത്രകാരനാണ്. പ്രകൃതിദത്ത ചായക്കൂട്ടുകൾ കൊണ്ടാണ് വരയ്ക്കുന്നത്." },
    { questionId: "mentor", text: "എന്റെ അച്ഛനാണ് എന്നെ ചിത്രകല പഠിപ്പിച്ചത്." },
    { questionId: "inspiration", text: "ക്ഷേത്രങ്ങളിലെ പഴയ ചുവർചിത്രങ്ങളും ഐതിഹ്യങ്ങളുമാണ് പ്രചോദനം." }
  ], "ml");
}

run();
