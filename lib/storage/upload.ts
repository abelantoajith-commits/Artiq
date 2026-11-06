import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";

export interface UploadResult {
  filePath: string;
  publicUrl: string;
  width: number;
  height: number;
}

/**
 * Extracts natural image dimensions from a browser File.
 */
export function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      resolve({
        width: img.naturalWidth || 800,
        height: img.naturalHeight || 800,
      });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve({ width: 800, height: 800 });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

/**
 * Compresses an image client-side and uploads it directly to Supabase Storage.
 * Complies with Vercel 4.5 MB request limit by bypassing server route handlers.
 */
export async function compressAndUploadArtworkImage(
  file: File,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  // 1. Extract natural uncropped dimensions before compression
  const { width, height } = await getImageDimensions(file);

  // 2. Client-side compression
  const compressionOptions = {
    maxSizeMB: 0.8,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    onProgress: (p: number) => {
      if (onProgress) onProgress(Math.round(p * 0.5)); // First 50%
    },
  };

  let compressedFile = file;
  try {
    compressedFile = await imageCompression(file, compressionOptions);
  } catch {
    // If compression fails (e.g. unsupported web worker), fallback to original file
    compressedFile = file;
  }

  // 3. Direct upload to Supabase Storage using browser client
  const supabase = createClient();
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filePath = `${userId}/${Date.now()}_${cleanName}`;

  const { error: uploadError } = await supabase.storage
    .from("artworks")
    .upload(filePath, compressedFile, {
      contentType: compressedFile.type || "image/jpeg",
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Upload to storage failed: ${uploadError.message}`);
  }

  if (onProgress) onProgress(100);

  const { data } = supabase.storage.from("artworks").getPublicUrl(filePath);

  return {
    filePath,
    publicUrl: data.publicUrl,
    width,
    height,
  };
}
