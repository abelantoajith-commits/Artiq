"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createLogger } from "@/lib/logger";
import { getSessionUser, saveLocalArtwork } from "@/lib/auth/demo-session";
import { removeLocalArtworkFile } from "@/lib/storage/local-store";
import { Artwork } from "@/types/art";

const publishArtworkSchema = z.object({
  title: z.string().min(1, "Title is required to publish an artwork."),
  description: z.string().default(""),
  caption: z.string().default(""),
  imageUrl: z.string().min(1, "Valid image is required."),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  categories: z.array(z.string()).min(1, "Please select at least one category."),
  hashtags: z.array(z.string()).default([]),
  status: z.enum(["draft", "published"]).default("published"),
  aiGeneratedFields: z.record(z.string(), z.unknown()).default({}),
});

export type PublishResult = {
  success?: boolean;
  artworkId?: string;
  error?: string;
};

export async function publishArtworkAction(
  payload: z.infer<typeof publishArtworkSchema>
): Promise<PublishResult> {
  const log = createLogger("artwork.publish");
  const startTime = Date.now();

  const user = await getSessionUser();

  if (!user) {
    log.warn("publish: rejected unauthenticated request");
    return { error: "You must be signed in to publish an artwork." };
  }

  log.info({ userId: user.id, title: payload.title }, "publish: start");

  const parsed = publishArtworkSchema.safeParse(payload);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message ?? "Validation failed";
    log.warn({ issues: parsed.error.flatten() }, "publish: validation error");
    return { error: errorMsg };
  }

  const {
    title,
    description,
    caption,
    imageUrl,
    width,
    height,
    categories,
    hashtags,
    status,
    aiGeneratedFields,
  } = parsed.data;

  // 1. If Supabase is configured, attempt database insert
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("artworks")
        .insert({
          artist_id: user.id,
          title,
          description,
          caption,
          image_url: imageUrl,
          width,
          height,
          categories,
          hashtags,
          status,
          ai_generated_fields: aiGeneratedFields,
        })
        .select("id")
        .single();

      if (!error && data) {
        log.info(
          { artworkId: data.id, durationMs: Date.now() - startTime },
          "publish: Supabase insert success"
        );
        revalidatePath("/");
        revalidatePath("/profile");
        revalidatePath(`/artist/${user.username}`);
        return { success: true, artworkId: data.id };
      }

      if (error) {
        log.warn({ err: error.message }, "publish: Supabase insert error, falling back to local session store");
      }
    } catch (dbErr) {
      log.warn({ err: String(dbErr) }, "publish: Supabase unavailable, falling back to local session store");
    }
  }

  // 2. Demo user or local fallback storage
  const localArtworkId = `art_${Date.now()}`;
  const localArtwork: Artwork = {
    id: localArtworkId,
    artist_id: user.id,
    title,
    description,
    caption,
    image_url: imageUrl,
    width,
    height,
    categories,
    hashtags,
    status,
    ai_generated_fields: aiGeneratedFields,
    created_at: new Date().toISOString(),
    artist: {
      id: user.id,
      display_name: user.display_name,
      username: user.username,
      location: user.location || "Kerala, India",
      avatar_url: user.avatar_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
      bio: user.bio || "",
      journey: user.journey || "",
      specialities: user.specialities || [],
      preferred_language: "en",
    },
  };

  try {
    await saveLocalArtwork(localArtwork);
    log.info(
      { artworkId: localArtworkId, durationMs: Date.now() - startTime },
      "publish: saved to local session store"
    );
    revalidatePath("/");
    revalidatePath("/profile");
    revalidatePath(`/artist/${user.username}`);
    return { success: true, artworkId: localArtworkId };
  } catch (saveErr) {
    const msg = saveErr instanceof Error ? saveErr.message : String(saveErr);
    log.error({ err: msg }, "publish: failed to save local artwork");
    return { success: true, artworkId: localArtworkId };
  }
}

export async function deleteArtworkAction(
  artworkId: string
): Promise<{ success: boolean; error?: string }> {
  const log = createLogger("artwork.delete");
  const startTime = Date.now();

  const user = await getSessionUser();
  if (!user) {
    log.warn("delete: unauthenticated request");
    return { success: false, error: "You must be signed in to delete an artwork." };
  }

  log.info({ userId: user.id, artworkId }, "delete: start");

  // 1. Delete from Supabase if active
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from("artworks")
        .delete()
        .eq("id", artworkId);

      if (error) {
        log.warn({ err: error.message }, "delete: Supabase delete error");
      } else {
        log.info({ artworkId }, "delete: deleted from Supabase");
      }
    } catch (dbErr) {
      log.warn({ err: String(dbErr) }, "delete: Supabase unavailable");
    }
  }

  // 2. Delete from local server file store and session
  try {
    await removeLocalArtworkFile(artworkId);
    log.info({ artworkId, durationMs: Date.now() - startTime }, "delete: removed from local file store");
  } catch (storeErr) {
    log.warn({ err: String(storeErr) }, "delete: failed removing from local file store");
  }

  revalidatePath("/");
  revalidatePath("/profile");
  revalidatePath(`/artist/${user.username}`);
  revalidatePath(`/artwork/${artworkId}`);

  return { success: true };
}
