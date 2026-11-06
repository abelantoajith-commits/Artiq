import { NextRequest, NextResponse } from "next/server";
import { createLogger, getRequestId } from "@/lib/logger";
import { getGeminiClient } from "@/lib/ai/gemini";
import {
  storyPolishSchema,
  STORY_POLISH_SYSTEM_INSTRUCTION,
  StoryPolishResult,
} from "@/lib/ai/story";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = getRequestId(request);
  const log = createLogger("ai.story", requestId);

  log.info({ path: "/api/ai/story" }, "story: start");

  try {
    const body = await request.json();
    const {
      transcript,
      targetLanguage = "en",
      context = "artwork_story",
    } = body as {
      transcript?: string;
      targetLanguage?: "en" | "ml";
      context?: string;
    };

    if (!transcript || !transcript.trim()) {
      log.warn("story: empty transcript received");
      return NextResponse.json(
        { error: "Transcript is required" },
        { status: 400, headers: { "x-request-id": requestId } }
      );
    }

    const cleanTranscript = transcript.trim();
    log.debug(
      { length: cleanTranscript.length, targetLanguage, context },
      "story: processing transcript"
    );

    const gemini = getGeminiClient();
    let result: StoryPolishResult;

    if (gemini) {
      try {
        log.info({ model: "gemini-3.5-flash" }, "story: calling Gemini API");

        const prompt = `
Context of the speech: ${context}
Target language: ${targetLanguage === "ml" ? "Malayalam (മലയാളം)" : "English"}

Raw spoken transcript:
"""
${cleanTranscript}
"""

Please polish this transcript following your strict system rules: preserve first-person voice, do not add any unsaid facts, and output strictly valid JSON matching the schema.`;

        const response = await gemini.models.generateContent({
          model: "gemini-3.5-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          config: {
            systemInstruction: STORY_POLISH_SYSTEM_INSTRUCTION,
            responseMimeType: "application/json",
          },
        });

        const rawText = response.text || "{}";
        log.debug({ preview: rawText.slice(0, 150) }, "story: raw model output");

        const parsedJson = JSON.parse(rawText);
        const validated = storyPolishSchema.safeParse(parsedJson);

        if (validated.success) {
          result = validated.data;
        } else {
          log.warn({ issues: validated.error.flatten() }, "story: validation fallback");
          result = fallbackPolish(cleanTranscript, targetLanguage);
        }
      } catch (geminiError: unknown) {
        const msg = geminiError instanceof Error ? geminiError.message : String(geminiError);
        log.error({ err: msg }, "story: Gemini API failed, using faithful fallback");
        result = fallbackPolish(cleanTranscript, targetLanguage);
      }
    } else {
      log.info("story: Gemini client unconfigured, using baseline polish");
      result = fallbackPolish(cleanTranscript, targetLanguage);
    }

    const durationMs = Date.now() - startTime;
    log.info({ durationMs }, "story: done");

    return NextResponse.json(
      {
        success: true,
        result,
        durationMs,
      },
      {
        status: 200,
        headers: { "x-request-id": requestId },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    log.error({ err: message }, "story: fatal exception");
    return NextResponse.json(
      { error: "Failed to process voice story." },
      { status: 500, headers: { "x-request-id": requestId } }
    );
  }
}

/**
 * Clean baseline without external API (never invents facts).
 */
function fallbackPolish(
  transcript: string,
  targetLanguage: "en" | "ml"
): StoryPolishResult {
  // Simple punctuation and sentence-case cleanup
  const cleaned = transcript
    .replace(/\s+/g, " ")
    .replace(/\b(um|uh|ah|like|you know)\b/gi, "")
    .trim();

  const sentences = cleaned.split(". ");
  const capitalized = sentences
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(". ");

  return {
    polished_text: capitalized,
    raw_transcript: transcript,
    language: targetLanguage,
    clarifications: [],
  };
}

