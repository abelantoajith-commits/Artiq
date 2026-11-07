import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { createLogger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const log = createLogger("api.upload-image");
  const startTime = Date.now();

  try {
    const contentType = req.headers.get("content-type") || "";
    let buffer: Buffer;
    let extension = "jpg";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        log.warn("upload-image: no file provided in form data");
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      if (file.type.includes("png")) extension = "png";
      else if (file.type.includes("webp")) extension = "webp";
    } else {
      const body = await req.json();
      const dataUrl = body.dataUrl || body.imageUrl;
      if (!dataUrl || typeof dataUrl !== "string") {
        return NextResponse.json({ error: "Invalid dataUrl" }, { status: 400 });
      }
      const matches = dataUrl.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
      if (!matches) {
        return NextResponse.json({ error: "Invalid base64 image data" }, { status: 400 });
      }
      extension = matches[1] === "jpeg" ? "jpg" : matches[1];
      buffer = Buffer.from(matches[2], "base64");
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const filename = `art_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;
    const filePath = path.join(uploadsDir, filename);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;
    log.info(
      { filename, sizeBytes: buffer.length, durationMs: Date.now() - startTime },
      "upload-image: successfully stored uploaded image"
    );

    return NextResponse.json({
      success: true,
      publicUrl,
      filePath: `local/${filename}`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error({ err: msg }, "upload-image: failed to save image");
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}

