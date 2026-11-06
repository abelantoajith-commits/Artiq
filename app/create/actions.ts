"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createLogger } from "@/lib/logger";
import { getSessionUser, saveLocalArtwork } from "@/lib/auth/demo-session";
import { Artwork } from "@/types/art";

const publishArtworkSchema = z.object({
  title: z.string().min(1, "Title is required to publish an artwork."),
  description: z.string().default(""),
  caption: z.string().default(""),
  imageUrl: z.string().min(1, "Valid image is required."),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  artForm: z.string().min(1, "Please specify an art form."),
  technique: z.string().default(""),
  materials: z.string().default(""),
  story: z.string().default(""),
  categories: z.array(z.string()).default([]),
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
    artForm,
    technique,
    materials,
    story,
    categories,
    hashtags,
    status,
    aiGeneratedFields,
  } = parsed.data;

  // 1. If not demo user, try inserting into Supabase
  if (!user.is_demo) {
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
          art_form: artForm,
          technique,
          materials,
          story,
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
    } catch (dbErr) {
      log.warn({ err: dbErr }, "publish: Supabase unavailable, falling back to local session store");
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
    art_form: artForm,
    technique,
    materials,
    story,
    categories: categories as Artwork["categories"],
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
    },
  };

  await saveLocalArtwork(localArtwork);
  log.info({ artworkId: localArtworkId }, "publish: saved to local test session store");

  revalidatePath("/");
  revalidatePath("/profile");
  revalidatePath(`/artist/${user.username}`);

  return {
    success: true,
    artworkId: localArtworkId,
  };
}

