import { NextRequest, NextResponse } from "next/server";
import { writeLocalArtworkFile } from "@/lib/storage/local-store";
import { Artwork } from "@/types/art";
import { createLogger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const log = createLogger("api.artworks.sync");

  try {
    const artwork = (await req.json()) as Artwork;
    if (!artwork || !artwork.id || !artwork.title) {
      return NextResponse.json({ error: "Invalid artwork payload" }, { status: 400 });
    }

    await writeLocalArtworkFile(artwork);
    log.info({ artworkId: artwork.id }, "artworks.sync: persisted artwork from client");

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    log.warn({ err: msg }, "artworks.sync: error saving artwork");
    return NextResponse.json({ error: "Failed to sync" }, { status: 500 });
  }
}
