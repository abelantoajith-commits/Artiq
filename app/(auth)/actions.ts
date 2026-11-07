"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createLogger } from "@/lib/logger";
import { DEMO_EMPTY_ARTIST } from "@/lib/auth/demo-session";

const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters.")
    .max(30, "Username must be 30 characters or less.")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores."),
  displayName: z.string().min(2, "Name must be at least 2 characters."),
});

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

const profileUpdateSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters."),
  location: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().max(1000, "Bio must be 1000 characters or less.").optional(),
  intro: z.string().max(1000, "Intro must be 1000 characters or less.").optional(),
  journey: z.string().max(3000, "Journey must be 3000 characters or less.").optional(),
  inspiration: z.string().max(3000, "Inspiration must be 3000 characters or less.").optional(),
  specialities: z.array(z.string()).optional(),
});

export type AuthState = {
  error?: string;
  success?: boolean;
};

/**
 * Server Action: Register new artist
 */
export async function signUpAction(
  _prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const log = createLogger("auth.signup");
  const startTime = Date.now();

  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
    username: formData.get("username"),
    displayName: formData.get("displayName"),
  };

  log.info({ email: rawData.email, username: rawData.username }, "signUp: start");

  const parsed = signUpSchema.safeParse(rawData);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message ?? "Invalid form data";
    log.warn({ issues: parsed.error.flatten() }, "signUp: validation error");
    return { error: errorMsg };
  }

  const { email, password, username, displayName } = parsed.data;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username.toLowerCase(),
          display_name: displayName,
        },
      },
    });

    if (error) {
      log.error({ err: error.message }, "signUp: Supabase auth error");
      return { error: error.message };
    }

    log.info(
      { userId: data.user?.id, durationMs: Date.now() - startTime },
      "signUp: success"
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error({ err: msg }, "signUp: unexpected failure");
    return { error: "An unexpected error occurred during signup." };
  }

  revalidatePath("/", "layout");
  redirect("/profile");
}

/**
 * Server Action: Sign in existing artist
 */
export async function signInAction(
  _prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const log = createLogger("auth.login");
  const startTime = Date.now();

  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  log.info({ email: rawData.email }, "signIn: start");

  const parsed = signInSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid credentials" };
  }

  const { email, password } = parsed.data;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      log.warn({ email, err: error.message }, "signIn: failed authentication");
      return { error: error.message };
    }

    log.info(
      { userId: data.user?.id, durationMs: Date.now() - startTime },
      "signIn: success"
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error({ err: msg }, "signIn: unexpected error");
    return { error: "An unexpected error occurred. Please try again." };
  }

  revalidatePath("/", "layout");
  redirect("/profile");
}

/**
 * Server Action: Instant 1-Click Demo Login (Supabase Anonymous Sign-in)
 */
export async function signInAsDemoAction(): Promise<void> {
  const log = createLogger("auth.demo-login");
  const startTime = Date.now();
  log.info("signInAsDemo: starting demo sign-in");

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) {
        log.warn({ err: error.message }, "signInAsDemo: anonymous auth failed, falling back to local demo");
      } else if (data.user) {
        log.info(
          { userId: data.user.id, durationMs: Date.now() - startTime },
          "signInAsDemo: anonymous sign-in success"
        );

        // Ensure profile row exists with is_demo = true and empty identity fields
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", data.user.id)
          .maybeSingle();

        if (!existingProfile) {
          const shortId = data.user.id.slice(0, 4);
          await supabase.from("profiles").insert({
            id: data.user.id,
            username: `demo_artist_${data.user.id.slice(0, 8)}`,
            display_name: `Demo artist ${shortId}`,
            is_demo: true,
            bio: "",
            journey: "",
            inspiration: "",
            intro: "",
            specialities: [],
          });
          log.info({ userId: data.user.id }, "signInAsDemo: created initial demo profile row");
        }

        revalidatePath("/", "layout");
        redirect("/");
      }
    } catch (err: unknown) {
      if ((err as Error)?.message?.includes("NEXT_REDIRECT")) throw err;
      log.error({ err: String(err) }, "signInAsDemo: unexpected error with Supabase");
    }
  }

  // Fallback for offline / local mode
  const cookieStore = await cookies();
  cookieStore.set("artiq_demo_session", JSON.stringify(DEMO_EMPTY_ARTIST), {
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
  });
  log.info("signInAsDemo: signed in with local empty demo session");

  revalidatePath("/", "layout");
  redirect("/");
}

/**
 * Server Action: Reset Demo Profile (Clears fields & answers for fresh demo run)
 */
export async function resetDemoProfileAction(): Promise<void> {
  const log = createLogger("auth.demo-reset");

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from("profiles")
          .update({
            bio: "",
            journey: "",
            inspiration: "",
            intro: "",
            specialities: [],
          })
          .eq("id", user.id);

        await supabase
          .from("profile_interview_answers")
          .delete()
          .eq("profile_id", user.id);

        log.info({ userId: user.id }, "resetDemoProfile: reset Supabase demo profile & answers");
      }
    } catch (err: unknown) {
      log.error({ err: String(err) }, "resetDemoProfile: Supabase error");
    }
  }

  const cookieStore = await cookies();
  cookieStore.set("artiq_demo_session", JSON.stringify(DEMO_EMPTY_ARTIST), {
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
  });
  cookieStore.delete("artiq_interview_answers");

  revalidatePath("/profile");
  revalidatePath("/", "layout");
  redirect("/profile");
}

/**
 * Server Action: Sign out
 */
export async function signOutAction(): Promise<void> {
  const log = createLogger("auth.signout");
  const cookieStore = await cookies();
  cookieStore.delete("artiq_demo_session");

  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // ignore
  }

  log.info("signOut: complete");
  revalidatePath("/", "layout");
  redirect("/");
}

/**
 * Server Action: Update Profile Details
 */
export async function updateProfileAction(
  _prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const log = createLogger("profile.update");
  const startTime = Date.now();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to update your profile." };
  }

  const specialitiesRaw = formData.get("specialities")?.toString() ?? "";
  const specialities = specialitiesRaw
    ? specialitiesRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const rawData = {
    displayName: formData.get("displayName")?.toString() ?? "",
    location: formData.get("location")?.toString() ?? "",
    phone: formData.get("phone")?.toString() ?? "",
    email: formData.get("email")?.toString() ?? "",
    address: formData.get("address")?.toString() ?? "",
    bio: formData.get("bio")?.toString() ?? "",
    intro: formData.get("intro")?.toString() ?? "",
    journey: formData.get("journey")?.toString() ?? "",
    inspiration: formData.get("inspiration")?.toString() ?? "",
    specialities,
  };

  const parsed = profileUpdateSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Validation failed." };
  }

  const { displayName, location, phone, email, address, bio, intro, journey, inspiration } = parsed.data;

  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        location,
        phone,
        email,
        address,
        bio,
        intro,
        journey,
        inspiration,
        specialities,
      })
      .eq("id", user.id);

    if (error) {
      log.error({ err: error.message, userId: user.id }, "profile: update failed");
    }

    // Also update demo session cookie if present
    const cookieStore = await cookies();
    const demoCookie = cookieStore.get("artiq_demo_session");
    if (demoCookie?.value) {
      try {
        const parsedDemo = JSON.parse(demoCookie.value);
        cookieStore.set(
          "artiq_demo_session",
          JSON.stringify({
            ...parsedDemo,
            display_name: displayName,
            location,
            phone,
            email,
            address,
            bio,
            intro,
            journey,
            inspiration,
            specialities,
          }),
          { path: "/", maxAge: 60 * 60 * 24 * 7, sameSite: "lax" }
        );
      } catch {
        // ignore
      }
    }

    log.info(
      { userId: user.id, durationMs: Date.now() - startTime },
      "profile: updated successfully"
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error({ err: msg }, "profile: unexpected update error");
    return { error: "Could not update profile. Please try again." };
  }

  revalidatePath("/profile");
  revalidatePath("/", "layout");
  redirect("/profile");
}

