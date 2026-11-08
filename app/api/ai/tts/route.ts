import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const text = searchParams.get("text")?.trim();
  const lang = searchParams.get("lang") || "ml";

  if (!text) {
    return NextResponse.json({ error: "Missing text query parameter" }, { status: 400 });
  }

  // Cap length to prevent abuse (single question titles are < 250 chars)
  const sanitizedText = text.slice(0, 300);
  const targetLang = lang.startsWith("en") ? "en" : "ml";

  try {
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(
      targetLang
    )}&client=tw-ob&q=${encodeURIComponent(sanitizedText)}`;

    const res = await fetch(ttsUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://translate.google.com/",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream TTS service returned status ${res.status}` },
        { status: res.status }
      );
    }

    const arrayBuffer = await res.arrayBuffer();

    return new Response(arrayBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[TTS API] Error generating audio stream:", message);
    return NextResponse.json(
      { error: "Failed to generate speech audio" },
      { status: 500 }
    );
  }
}

