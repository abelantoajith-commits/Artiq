import { NextRequest, NextResponse } from "next/server";
import { createLogger, getRequestId } from "@/lib/logger";
import { getGeminiClient } from "@/lib/ai/gemini";
import {
  storyPolishSchema,
  artworkTextMergeSchema,
  STORY_POLISH_SYSTEM_INSTRUCTION,
  ARTWORK_TEXT_MERGE_SYSTEM_INSTRUCTION,
  StoryPolishResult,
  ArtworkTextMergeResult,
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
      visualDescription,
      targetLanguage = "en",
      context = "artwork_story",
    } = body as {
      transcript?: string;
      visualDescription?: string;
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
    const cleanVisualDesc = visualDescription?.trim() || "";
    const isArtworkMerge = Boolean(cleanVisualDesc) || context === "artwork_story";

    log.debug(
      {
        transcriptLength: cleanTranscript.length,
        visualDescLength: cleanVisualDesc.length,
        targetLanguage,
        isArtworkMerge,
      },
      "story: processing request"
    );

    const gemini = getGeminiClient();
    let textResult = "";
    let unclearIssues: string[] = [];

    if (gemini) {
      try {
        log.info({ model: "gemini-3.5-flash-lite" }, "story: calling Gemini API");

        let prompt = "";
        let systemInstruction = "";

        if (isArtworkMerge && cleanVisualDesc) {
          systemInstruction = ARTWORK_TEXT_MERGE_SYSTEM_INSTRUCTION;
          prompt = `
Target language: ${targetLanguage === "ml" ? "Malayalam (മലയാളം)" : "English"}

ARTIST'S SPOKEN TRANSCRIPT (SOURCE OF TRUTH - MUST LEAD THE TEXT):
"""
${cleanTranscript}
"""

AI VISUAL OBSERVATION (SUPPORTING DETAILS ONLY):
"""
${cleanVisualDesc}
"""

Please merge these into ONE cohesive "About this artwork" text following your strict system rules:
- Artist's spoken words lead in their first-person voice.
- Visual details only support.
- Never add unsaid cultural origins, age, or technique.
- Output valid JSON matching schema: { "text": "...", "unclear": [], "language": "${targetLanguage}" }
`;
        } else {
          systemInstruction = STORY_POLISH_SYSTEM_INSTRUCTION;
          prompt = `
Context of the speech: ${context}
Target language: ${targetLanguage === "ml" ? "Malayalam (മലയാളം)" : "English"}

Raw spoken transcript:
"""
${cleanTranscript}
"""

Please polish this transcript following your strict system rules: preserve first-person voice, do not add any unsaid facts, and output strictly valid JSON matching schema: { "polished_text": "...", "raw_transcript": "...", "language": "${targetLanguage}", "clarifications": [] }
`;
        }

        // Resilient model cascade: flash-lite first, then flash
        const candidateModels = ["gemini-3.5-flash-lite", "gemini-3.5-flash"];
        let response = null;
        let lastError = null;

        for (const candidate of candidateModels) {
          try {
            log.info({ model: candidate }, "story: calling Gemini model");
            const res = await gemini.models.generateContent({
              model: candidate,
              contents: [{ role: "user", parts: [{ text: prompt }] }],
              config: {
                systemInstruction,
                responseMimeType: "application/json",
              },
            });
            if (res && res.text) {
              response = res;
              break;
            }
          } catch (modelErr) {
            lastError = modelErr;
          }
        }

        if (!response) {
          throw lastError || new Error("All candidate story models failed");
        }

        const rawText = response.text || "{}";
        log.debug({ preview: rawText.slice(0, 150) }, "story: raw model output");

        const parsedJson = JSON.parse(rawText);

        if (isArtworkMerge && cleanVisualDesc) {
          // Normalize possible key variations
          const rawResultText = parsedJson.text || parsedJson.polished_text || cleanTranscript;
          const rawUnclear = parsedJson.unclear || parsedJson.clarifications || [];
          textResult = String(rawResultText).trim();
          unclearIssues = Array.isArray(rawUnclear) ? rawUnclear.map(String) : [];
        } else {
          const validated = storyPolishSchema.safeParse(parsedJson);
          if (validated.success) {
            textResult = validated.data.polished_text;
            unclearIssues = validated.data.clarifications;
          } else {
            textResult = fallbackPolish(cleanTranscript);
          }
        }
      } catch (geminiError: unknown) {
        const msg = geminiError instanceof Error ? geminiError.message : String(geminiError);
        log.error({ err: msg }, "story: Gemini API failed, using faithful fallback");
        textResult = fallbackMerge(cleanTranscript, cleanVisualDesc);
      }
    } else {
      log.info("story: Gemini client unconfigured, using baseline fallback");
      textResult = fallbackMerge(cleanTranscript, cleanVisualDesc);
    }

    const durationMs = Date.now() - startTime;
    log.info({ durationMs }, "story: done");

    // Unified response format satisfying both new merge and legacy consumers
    const legacyResult: StoryPolishResult = {
      polished_text: textResult,
      raw_transcript: cleanTranscript,
      language: targetLanguage,
      clarifications: unclearIssues,
    };

    return NextResponse.json(
      {
        success: true,
        text: textResult,
        unclear: unclearIssues,
        language: targetLanguage,
        result: legacyResult,
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

function fallbackPolish(transcript: string): string {
  const cleaned = transcript
    .replace(/\s+/g, " ")
    .replace(/\b(um|uh|ah|like|you know)\b/gi, "")
    .trim();

  const sentences = cleaned.split(". ");
  return sentences
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(". ");
}

function fallbackMerge(transcript: string, visualDesc: string): string {
  const cleanedSpoken = fallbackPolish(transcript);
  if (!visualDesc) return cleanedSpoken;
  return `${cleanedSpoken}\n\n${visualDesc.trim()}`;
}
