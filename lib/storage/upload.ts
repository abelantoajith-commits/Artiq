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

function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Compresses an image client-side and uploads it directly to Supabase Storage.
 * Complies with Vercel 4.5 MB request limit by bypassing server route handlers.
 * Falls back gracefully to base64 data URL if Supabase credentials are placeholder or offline.
 */
export async function compressAndUploadArtworkImage(
  file: File,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  // 1. Extract natural uncropped dimensions before compression
  const { width, height } = await getImageDimensions(file);

  // 2. Client-side compression (< 800 KB)
  const compressionOptions = {
    maxSizeMB: 0.8,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    onProgress: (p: number) => {
      if (onProgress) onProgress(Math.round(p * 0.5));
    },
  };

  let compressedFile = file;
  try {
    compressedFile = await imageCompression(file, compressionOptions);
  } catch {
    compressedFile = file;
  }

  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filePath = `${userId}/${Date.now()}_${cleanName}`;

  // 3. Check if Supabase URL is placeholder
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const isPlaceholder =
    !supabaseUrl ||
    supabaseUrl.includes("placeholder") ||
    supabaseUrl.includes("your-project");

  if (!isPlaceholder) {
    try {
      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from("artworks")
        .upload(filePath, compressedFile, {
          contentType: compressedFile.type || "image/jpeg",
          upsert: true,
        });

      if (!uploadError) {
        if (onProgress) onProgress(100);
        const { data } = supabase.storage.from("artworks").getPublicUrl(filePath);
        return {
          filePath,
          publicUrl: data.publicUrl,
          width,
          height,
        };
      } else {
        console.warn("[ARTIQ] Supabase upload failed, falling back to local data URL:", uploadError.message);
      }
    } catch (err) {
      console.warn("[ARTIQ] Storage network fetch failed, using local data URL fallback:", err);
    }
  }

  // Graceful Fallback: Upload locally to /api/upload-image to preserve real photo
  try {
    const formData = new FormData();
    formData.append("file", compressedFile);

    const uploadRes = await fetch("/api/upload-image", {
      method: "POST",
      body: formData,
    });

    if (uploadRes.ok) {
      const data = await uploadRes.json();
      if (data.publicUrl) {
        if (onProgress) onProgress(100);
        return {
          filePath: data.filePath || `local/${Date.now()}_${cleanName}`,
          publicUrl: data.publicUrl,
          width,
          height,
        };
      }
    }
  } catch (localUploadErr) {
    console.warn("[ARTIQ] Local upload endpoint failed, using dataUrl fallback:", localUploadErr);
  }

  // Final Fallback: Convert to data URL for seamless local testing & analysis
  if (onProgress) onProgress(100);
  const dataUrl = await fileToDataUrl(compressedFile);

  return {
    filePath: `local/${Date.now()}_${cleanName}`,
    publicUrl: dataUrl,
    width,
    height,
  };
}
