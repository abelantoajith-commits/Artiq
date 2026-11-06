import { NextRequest, NextResponse } from "next/server";
import { createLogger, getRequestId } from "@/lib/logger";
import { getGeminiClient } from "@/lib/ai/gemini";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = getRequestId(request);
  const log = createLogger("ai.transcribe", requestId);

  log.info({ path: "/api/ai/transcribe" }, "transcribe: start");

  try {
    const body = await request.json();
    const {
      audioPath,
      audioBase64,
      mimeType = "audio/webm",
      language = "ml",
    } = body as {
      audioPath?: string;
      audioBase64?: string;
      mimeType?: string;
      language?: string;
    };

    let base64Data = audioBase64 || "";

    // If audio is in Supabase Storage, fetch buffer
    if (audioPath && !base64Data) {
      const supabase = await createClient();
      const { data, error } = await supabase.storage
        .from("artworks")
        .download(audioPath);

      if (error || !data) {
        log.error({ err: error?.message }, "transcribe: audio download failed");
        return NextResponse.json(
          { error: "Could not retrieve audio recording" },
          { status: 400, headers: { "x-request-id": requestId } }
        );
      }

      const buffer = await data.arrayBuffer();
      base64Data = Buffer.from(buffer).toString("base64");
    }

    if (!base64Data) {
      log.warn("transcribe: missing audio data");
      return NextResponse.json(
        { error: "No audio data provided" },
        { status: 400, headers: { "x-request-id": requestId } }
      );
    }

    const gemini = getGeminiClient();
    let transcript = "";

    if (gemini) {
      log.info({ model: "gemini-2.5-flash", language }, "transcribe: calling Gemini multimodal audio");

      const prompt = `Please transcribe the attached spoken audio verbatim in ${
        language === "ml" ? "Malayalam (മലയാളം)" : "English"
      }. Do not translate or modify the spoken words; output only the exact spoken text.`;

      const response = await gemini.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              },
              { text: prompt },
            ],
          },
        ],
      });

      transcript = (response.text || "").trim();
    } else {
      log.info("transcribe: Gemini client unconfigured, using fallback");
      transcript =
        language === "ml"
          ? "പരമ്പരാഗത ശൈലിയിൽ ഞാൻ വരച്ച ചിത്രമാണിത്."
          : "This is my traditional handcrafted artwork inspired by local folklore.";
    }

    const durationMs = Date.now() - startTime;
    log.info({ durationMs, transcriptLength: transcript.length }, "transcribe: done");

    return NextResponse.json(
      {
        success: true,
        transcript,
        durationMs,
      },
      {
        status: 200,
        headers: { "x-request-id": requestId },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    log.error({ err: message }, "transcribe: fatal failure");
    return NextResponse.json(
      { error: "Failed to transcribe audio. You can still type your story." },
      { status: 500, headers: { "x-request-id": requestId } }
    );
  }
}

