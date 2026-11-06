"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createLogger } from "@/lib/logger";

const publishArtworkSchema = z.object({
  title: z.string().min(1, "Title is required to publish an artwork."),
  description: z.string().default(""),
  caption: z.string().default(""),
  imageUrl: z.string().url("Valid image URL is required."),
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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  try {
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

    if (error) {
      log.error({ err: error.message }, "publish: database insert failed");
      return { error: error.message };
    }

    log.info(
      { artworkId: data.id, durationMs: Date.now() - startTime },
      "publish: success"
    );

    revalidatePath("/");
    revalidatePath("/profile");
    revalidatePath(`/artist/${user.id}`);

    return {
      success: true,
      artworkId: data.id,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error({ err: msg }, "publish: unexpected exception");
    return { error: "An unexpected error occurred while publishing." };
  }
}
