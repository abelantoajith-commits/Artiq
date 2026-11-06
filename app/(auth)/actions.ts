"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createLogger } from "@/lib/logger";

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
  bio: z.string().max(500, "Bio must be 500 characters or less.").optional(),
  journey: z.string().max(2000, "Journey must be 2000 characters or less.").optional(),
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
 * Server Action: Sign out
 */
export async function signOutAction(): Promise<void> {
  const log = createLogger("auth.signout");
  const supabase = await createClient();
  await supabase.auth.signOut();
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
    bio: formData.get("bio")?.toString() ?? "",
    journey: formData.get("journey")?.toString() ?? "",
    specialities,
  };

  const parsed = profileUpdateSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Validation failed." };
  }

  const { displayName, location, bio, journey } = parsed.data;

  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        location,
        bio,
        journey,
        specialities,
      })
      .eq("id", user.id);

    if (error) {
      log.error({ err: error.message, userId: user.id }, "profile: update failed");
      return { error: error.message };
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

