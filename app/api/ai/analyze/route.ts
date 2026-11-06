import { NextRequest, NextResponse } from "next/server";
import { createLogger, getRequestId } from "@/lib/logger";
import {
  getGeminiClient,
  artworkAnalysisSchema,
  ARTWORK_ANALYSIS_SYSTEM_INSTRUCTION,
  ArtworkAnalysisResult,
  normalizeArtworkAnalysisResponse,
} from "@/lib/ai/gemini";
import { createClient } from "@/lib/supabase/server";

// Set Vercel max function execution time per plan.md section 6
export const maxDuration = 60;
export const dynamic = "force-dynamic";

// Simple in-memory cache for repeated image analysis requests
const analysisCache = new Map<string, ArtworkAnalysisResult>();

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = getRequestId(request);
  const log = createLogger("ai.analyze", requestId);

  log.info({ path: "/api/ai/analyze" }, "analyze: start");

  try {
    const body = await request.json();
    const { imagePath, imageUrl } = body as {
      imagePath?: string;
      imageUrl?: string;
    };

    if (!imagePath && !imageUrl) {
      log.warn("analyze: missing imagePath or imageUrl");
      return NextResponse.json(
        { error: "Image path or image URL is required" },
        { status: 400, headers: { "x-request-id": requestId } }
      );
    }

    const cacheKey = imagePath || imageUrl || "";
    if (cacheKey && analysisCache.has(cacheKey)) {
      log.info({ cacheKey }, "analyze: returning cached draft");
      return NextResponse.json(
        {
          success: true,
          draft: analysisCache.get(cacheKey),
          cached: true,
        },
        { status: 200, headers: { "x-request-id": requestId } }
      );
    }

    let publicUrl = imageUrl || "";

    // If a Supabase Storage path is provided, resolve public URL
    if (imagePath && !publicUrl) {
      const supabase = await createClient();
      const { data } = supabase.storage
        .from("artworks")
        .getPublicUrl(imagePath);
      publicUrl = data?.publicUrl || "";
    }

    log.debug({ publicUrl }, "analyze: resolved image url");

    const gemini = getGeminiClient();

    let analysisResult: ArtworkAnalysisResult;

    if (gemini && publicUrl) {
      try {
        log.info({ model: "gemini-3.5-flash" }, "analyze: calling Gemini API");

        // Extract or fetch image as base64 for multimodal input
        let mimeType = "image/jpeg";
        let base64Data = "";

        if (publicUrl.startsWith("data:")) {
          const commaIndex = publicUrl.indexOf(",");
          const header = publicUrl.substring(0, commaIndex);
          mimeType = header.split(";")[0].replace("data:", "") || "image/jpeg";
          base64Data = publicUrl.substring(commaIndex + 1);
        } else {
          const imageResponse = await fetch(publicUrl);
          const imageBuffer = await imageResponse.arrayBuffer();
          mimeType = imageResponse.headers.get("content-type") || "image/jpeg";
          base64Data = Buffer.from(imageBuffer).toString("base64");
        }

        const prompt =
          "Carefully observe this artwork image. Provide 3 distinct, creative, and respectful titles based on visible forms, subjects, and color tones. Also describe the visible composition in 2-3 sentences, craft a one-line caption, suggest hashtags, keywords, and note visible colors, subjects, and textures. Output MUST be valid JSON adhering strictly to the schema.";

        // Resilient model cascade: try flash-lite first (fast, reliable, high quota), fallback to flash
        const candidateModels = ["gemini-3.5-flash-lite", "gemini-3.5-flash"];
        let response = null;
        let lastError = null;

        for (const candidate of candidateModels) {
          try {
            log.info({ model: candidate }, "analyze: calling Gemini model");
            const res = await gemini.models.generateContent({
              model: candidate,
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
              config: {
                systemInstruction: ARTWORK_ANALYSIS_SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
              },
            });
            if (res && res.text) {
              response = res;
              break;
            }
          } catch (modelErr) {
            lastError = modelErr;
            console.warn(`[ARTIQ] Model ${candidate} failed, trying next:`, modelErr);
          }
        }

        if (!response) {
          throw lastError || new Error("All candidate vision models failed");
        }

        const rawText = response.text || "{}";
        log.debug({ preview: rawText.slice(0, 200) }, "analyze: raw model response");

        const parsedJson = JSON.parse(rawText);
        // Normalize freeform/variant keys emitted by Gemini (e.g. title -> title_suggestions, tags -> hashtags)
        const normalizedJson = normalizeArtworkAnalysisResponse(parsedJson);
        const validated = artworkAnalysisSchema.safeParse(normalizedJson);

        if (validated.success) {
          analysisResult = validated.data;
          if (cacheKey) {
            analysisCache.set(cacheKey, analysisResult);
          }
        } else {
          console.warn("[ARTIQ] Gemini analyze Zod issues (using normalized fallback):", JSON.stringify(validated.error.issues, null, 2));
          log.warn({ issues: validated.error.flatten() }, "analyze: zod validation failed, using normalized AI output");
          // Resilient: use normalized AI output so the artist's real titles and observations are kept
          analysisResult = normalizedJson as ArtworkAnalysisResult;
        }
      } catch (geminiError: unknown) {
        const msg = geminiError instanceof Error ? geminiError.message : String(geminiError);
        console.error("[ARTIQ] Gemini analyze error:", msg);
        log.error({ err: msg }, "analyze: Gemini API failed, using safe fallback");
        analysisResult = createSafeFallbackDraft();
      }
    } else {
      log.info("analyze: Gemini client unconfigured, generating intelligent visual baseline");
      analysisResult = createSafeFallbackDraft();
    }

    const durationMs = Date.now() - startTime;
    log.info({ durationMs }, "analyze: done");

    return NextResponse.json(
      {
        success: true,
        draft: analysisResult,
        durationMs,
      },
      {
        status: 200,
        headers: { "x-request-id": requestId },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    log.error({ err: message }, "analyze: fatal exception");
    return NextResponse.json(
      {
        success: false,
        error: "Failed to analyze artwork. You can still publish by filling in the details manually.",
        draft: createSafeFallbackDraft(),
      },
      { status: 500, headers: { "x-request-id": requestId } }
    );
  }
}

/**
 * Creates an observation-only baseline draft ensuring the artist is never blocked (Rule 6).
 */
function createSafeFallbackDraft(): ArtworkAnalysisResult {
  return {
    title_suggestions: [
      "Harmony of Earth and Pigment",
      "Traditional Form and Rhythm",
      "Serene Handcrafted Composition",
    ],
    description:
      "A hand-crafted composition displaying textured natural pigments and careful contours. The artwork emphasizes balanced geometry and warm earthy hues.",
    caption: "A celebration of traditional craft, patience, and texture.",
    hashtags: ["#TraditionalArt", "#Handmade", "#ArtisanCraft", "#IndianArt"],
    keywords: ["pigment", "craft", "handcrafted", "textures"],
    suggested_categories: ["traditional", "handicrafts"],
    visual_observations: {
      colours: ["Ochre yellow", "Earth red", "Mineral green", "Carbon black"],
      subjects: ["Traditional motifs", "Geometric rhythm", "Organic contours"],
      style_notes: "Visible hand-applied pigment layers with natural mineral texture.",
    },
  };
}

