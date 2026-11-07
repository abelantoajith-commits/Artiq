"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createLogger } from "@/lib/logger";
import { getSessionUser } from "@/lib/auth/demo-session";
import { InterviewAnswerRecord } from "@/types/identity";

const COOKIE_INTERVIEW_ANSWERS = "artiq_interview_answers";

/**
 * Saves a single interview answer to Supabase (or local session cookie).
 */
export async function saveInterviewAnswerAction(
  questionId: string,
  text: string,
  language: string = "en"
): Promise<{ success: boolean; error?: string }> {
  const log = createLogger("profile.interview.save");
  const user = await getSessionUser();

  if (!user) {
    return { success: false, error: "Must be signed in to save interview answers" };
  }

  log.info({ userId: user.id, questionId, textLength: text.length, language }, "saving answer");

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from("profile_interview_answers")
        .upsert(
          {
            profile_id: user.id,
            question_id: questionId,
            text,
            language,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "profile_id, question_id" }
        );

      if (error) {
        log.warn({ err: error.message }, "Supabase upsert failed, persisting locally");
      } else {
        return { success: true };
      }
    } catch (err: unknown) {
      log.warn({ err: String(err) }, "Supabase interview save failed");
    }
  }

  // Fallback / local storage in cookie
  try {
    const cookieStore = await cookies();
    const existingRaw = cookieStore.get(COOKIE_INTERVIEW_ANSWERS)?.value;
    let map: Record<string, { text: string; language: string }> = {};
    if (existingRaw) {
      try {
        map = JSON.parse(existingRaw);
      } catch {
        map = {};
      }
    }
    map[questionId] = { text, language };
    cookieStore.set(COOKIE_INTERVIEW_ANSWERS, JSON.stringify(map), {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}

/**
 * Loads all saved interview answers for the current session.
 */
export async function getInterviewAnswersAction(): Promise<
  Record<string, { text: string; language: string }>
> {
  const log = createLogger("profile.interview.load");
  const user = await getSessionUser();
  const resultMap: Record<string, { text: string; language: string }> = {};

  if (!user) return resultMap;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("profile_interview_answers")
        .select("question_id, text, language")
        .eq("profile_id", user.id);

      if (!error && data) {
        for (const row of data as InterviewAnswerRecord[]) {
          resultMap[row.question_id] = {
            text: row.text,
            language: row.language || "en",
          };
        }
        log.info({ userId: user.id, count: Object.keys(resultMap).length }, "loaded answers from Supabase");
        return resultMap;
      }
    } catch (err: unknown) {
      log.warn({ err: String(err) }, "error fetching Supabase interview answers");
    }
  }

  // Fallback to local cookie
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_INTERVIEW_ANSWERS)?.value;
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  return resultMap;
}

/**
 * Final step: Publishes the structured profile to Supabase and redirects to /profile.
 */
export async function publishProfileFromInterviewAction(data: {
  intro: string;
  bio: string;
  journey: string;
  specialities: string[];
  inspiration: string;
}): Promise<{ success: boolean; error?: string }> {
  const log = createLogger("profile.publish");
  const user = await getSessionUser();

  if (!user) {
    return { success: false, error: "Must be signed in to publish profile" };
  }

  log.info({ userId: user.id, specialitiesCount: data.specialities.length }, "publishing profile");

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from("profiles")
        .update({
          intro: data.intro,
          bio: data.bio,
          journey: data.journey,
          specialities: data.specialities,
          inspiration: data.inspiration,
        })
        .eq("id", user.id);

      if (error) {
        log.error({ err: error.message }, "Supabase profile update failed");
        return { success: false, error: error.message };
      }
    } catch (err: unknown) {
      log.error({ err: String(err) }, "Supabase profile update error");
    }
  }

  // Update local session cookie if running in local demo mode
  const cookieStore = await cookies();
  const demoCookie = cookieStore.get("artiq_demo_session");
  if (demoCookie?.value) {
    try {
      const parsed = JSON.parse(demoCookie.value);
      const updated = {
        ...parsed,
        intro: data.intro,
        bio: data.bio,
        journey: data.journey,
        specialities: data.specialities,
        inspiration: data.inspiration,
      };
      cookieStore.set("artiq_demo_session", JSON.stringify(updated), {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "lax",
      });
    } catch {
      // ignore
    }
  }

  revalidatePath("/profile");
  revalidatePath("/", "layout");
  if (user.username) {
    revalidatePath(`/artist/${user.username}`);
  }

  return { success: true };
}

