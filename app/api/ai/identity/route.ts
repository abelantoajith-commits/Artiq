import { NextRequest, NextResponse } from "next/server";
import { createLogger } from "@/lib/logger";
import { getGeminiClient } from "@/lib/ai/gemini";
import {
  identityInputSchema,
  identityOutputSchema,
  IDENTITY_BUILDER_SYSTEM_INSTRUCTION,
  createRawIdentityFallback,
  normalizeIdentityOutput,
  IdentityOutput,
} from "@/lib/ai/identity";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const log = createLogger("ai.identity");
  const startTime = Date.now();

  try {
    const rawBody = await request.json();
    const parseResult = identityInputSchema.safeParse(rawBody);

    if (!parseResult.success) {
      log.warn(
        { errors: parseResult.error.issues },
        "ai.identity: invalid request payload"
      );
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input",
          issues: parseResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { answers, outputLanguage } = parseResult.data;

    // Filter non-empty answers
    const activeAnswers = answers.filter((a) => a.text && a.text.trim().length > 0);

    log.info(
      {
        totalAnswers: answers.length,
        activeAnswersCount: activeAnswers.length,
        totalChars: activeAnswers.reduce((sum, a) => sum + a.text.length, 0),
        outputLanguage,
      },
      "ai.identity: processing request"
    );

    // Only log answer content at debug level per security rule
    log.debug(
      {
        answersSummary: activeAnswers.map((a) => ({
          questionId: a.questionId,
          length: a.text.length,
        })),
      },
      "ai.identity: answer details"
    );

    if (activeAnswers.length === 0) {
      const emptyFallback = createRawIdentityFallback([]);
      return NextResponse.json({
        success: true,
        result: emptyFallback,
        isFallback: true,
        durationMs: Date.now() - startTime,
      });
    }

    const gemini = getGeminiClient();
    let structuredResult: IdentityOutput | null = null;

    if (gemini) {
      const prompt = `
Target Output Language: ${outputLanguage === "ml" ? "Malayalam (മലയാളം)" : "English"}

ARTIST'S SPOKEN & WRITTEN INTERVIEW ANSWERS:
${activeAnswers
  .map(
    (a, i) =>
      `[Question ${i + 1} - ID: "${a.questionId}"]\n"""\n${a.text.trim()}\n"""`
  )
  .join("\n\n")}

Transform these authentic answers into a structured profile according to your system rules.
Return strictly valid JSON conforming to the requested schema.
`;

      // Candidate models cascade with retry
      const candidateModels = ["gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-3.8-flash"];
      let lastError: unknown = null;

      for (const model of candidateModels) {
        try {
          log.info({ model }, "ai.identity: invoking Gemini model");
          const response = await gemini.models.generateContent({
            model,
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
              systemInstruction: IDENTITY_BUILDER_SYSTEM_INSTRUCTION,
              responseMimeType: "application/json",
            },
          });

          const rawText = response.text || "{}";
          log.debug(
            { preview: rawText.slice(0, 200) },
            "ai.identity: raw model output received"
          );

          const parsed = JSON.parse(rawText);
          const normalized = normalizeIdentityOutput(parsed);
          const validated = identityOutputSchema.safeParse(normalized);

          if (validated.success) {
            structuredResult = validated.data;
            log.info(
              {
                model,
                durationMs: Date.now() - startTime,
                missingCount: structuredResult.missing.length,
                unclearCount: structuredResult.unclear.length,
              },
              "ai.identity: generated valid profile structure"
            );
            break;
          } else {
            log.warn(
              { issues: validated.error.issues },
              "ai.identity: output schema validation warning, trying fallback"
            );
          }
        } catch (err: unknown) {
          lastError = err;
          log.warn({ model, err: String(err) }, "ai.identity: model attempt failed");
        }
      }

      if (!structuredResult && lastError) {
        log.error({ err: String(lastError) }, "ai.identity: all models failed, using safe fallback");
      }
    }

    // If Gemini failed or is not configured, generate safe raw fallback
    if (!structuredResult) {
      log.info("ai.identity: returning safe raw fallback from answers");
      structuredResult = createRawIdentityFallback(activeAnswers);
      return NextResponse.json({
        success: true,
        result: structuredResult,
        isFallback: true,
        durationMs: Date.now() - startTime,
      });
    }

    return NextResponse.json({
      success: true,
      result: structuredResult,
      isFallback: false,
      durationMs: Date.now() - startTime,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error({ err: msg }, "ai.identity: unexpected internal error");
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process identity interview.",
      },
      { status: 500 }
    );
  }
}
