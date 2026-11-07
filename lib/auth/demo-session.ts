import { cookies } from "next/headers";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Artwork } from "@/types/art";
import {
  readLocalArtworksFile,
  writeLocalArtworkFile,
} from "@/lib/storage/local-store";

export interface AppUser {
  id: string;
  email: string;
  display_name: string;
  username: string;
  phone?: string;
  address?: string;
  location?: string;
  bio?: string;
  journey?: string;
  inspiration?: string;
  intro?: string;
  avatar_url?: string;
  specialities?: string[];
  is_demo?: boolean;
}

export const DEMO_EMPTY_ARTIST: AppUser = {
  id: "artist_demo_empty",
  email: "",
  display_name: "Demo artist 4a12",
  username: "demo_artist_4a12",
  phone: "",
  address: "",
  location: "",
  bio: "",
  journey: "",
  inspiration: "",
  intro: "",
  avatar_url: "🧑‍🎨",
  specialities: [],
  is_demo: true,
};

export const DEMO_ARTIST: AppUser = {
  id: "artist_demo_raghavan",
  email: "raghavan.master@artiq.gallery",
  display_name: "K. R. Raghavan Master",
  username: "raghavan_murals",
  phone: "+91 94471 23456",
  address: "Raghavan Mural Studio, West Temple Gate, Kottayam, Kerala 686001",
  location: "Kottayam, Kerala",
  bio: "Master Kerala temple muralist preserving 500-year-old fresco-secco traditions with natural rock pigments and herbal binders.",
  journey: "Initiated under Guruvayur temple masters in 1984. Dedicated the last four decades to traditional iconography and temple wall restoration.",
  avatar_url: "🎨",
  specialities: ["Kerala mural", "Fresco-secco", "Natural pigments", "Temple iconography"],
  is_demo: true,
};

/**
 * Returns the currently authenticated user (either from Supabase session or demo test login).
 */
export async function getSessionUser(): Promise<AppUser | null> {
  const cookieStore = await cookies();

  // 1. Check for Demo test login cookie
  const demoCookie = cookieStore.get("artiq_demo_session");
  if (demoCookie?.value) {
    try {
      const parsed = JSON.parse(demoCookie.value);
      const base = parsed.id === "artist_demo_raghavan" ? DEMO_ARTIST : DEMO_EMPTY_ARTIST;
      return { ...base, ...parsed, is_demo: true };
    } catch {
      return DEMO_ARTIST;
    }
  }

  // 2. Check Supabase Auth
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Fetch profile data if available
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        return {
          id: user.id,
          email: user.email || "",
          display_name: profile?.display_name || user.user_metadata?.display_name || user.email?.split("@")[0] || "Artist",
          username: profile?.username || user.user_metadata?.username || `artist_${user.id.slice(0, 6)}`,
          phone: profile?.phone || user.user_metadata?.phone || "",
          address: profile?.address || user.user_metadata?.address || "",
          location: profile?.location || user.user_metadata?.location || "",
          bio: profile?.bio || "",
          journey: profile?.journey || "",
          inspiration: profile?.inspiration || "",
          intro: profile?.intro || "",
          avatar_url: profile?.avatar_url || "",
          specialities: profile?.specialities || [],
          is_demo: Boolean(profile?.is_demo ?? user.is_anonymous),
        };
      }
    } catch {
      // Supabase offline or unconfigured
    }
  }

  return null;
}

/**
 * Retrieves local artworks published in test/demo mode from server store (and cookie fallback)
 */
export async function getLocalArtworks(): Promise<Artwork[]> {
  try {
    const fromFile = await readLocalArtworksFile();
    if (fromFile && fromFile.length > 0) {
      return fromFile;
    }
  } catch {
    // fallback to cookie
  }

  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get("artiq_local_artworks")?.value;
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Artwork[]) : [];
  } catch {
    return [];
  }
}

/**
 * Persists an artwork in the local session for test/demo publishing.
 * Stores full artwork in server file store (no 4KB limit) and only lightweight IDs in cookies.
 */
export async function saveLocalArtwork(artwork: Artwork): Promise<void> {
  let safeImageUrl = artwork.image_url;

  // If artwork has a large data URL, persist to public/uploads on disk so it keeps the real photo
  if (safeImageUrl.startsWith("data:")) {
    try {
      const matches = safeImageUrl.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
      if (matches) {
        const extension = matches[1] === "jpeg" ? "jpg" : matches[1];
        const filename = `art_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${extension}`;
        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        await mkdir(uploadsDir, { recursive: true });
        await writeFile(path.join(uploadsDir, filename), Buffer.from(matches[2], "base64"));
        safeImageUrl = `/uploads/${filename}`;
      }
    } catch (fsErr) {
      console.warn("Could not save data URL to uploads:", fsErr);
    }
  }

  const cookieSafeArtwork: Artwork = {
    ...artwork,
    image_url: safeImageUrl,
  };

  // 1. Write full artwork to server-side local file store
  await writeLocalArtworkFile(cookieSafeArtwork);

  // 2. Set ultra-lightweight cookie with only IDs (< 100 bytes) to prevent any HTTP header overflow
  try {
    const cookieStore = await cookies();
    const idCookiePayload = JSON.stringify([artwork.id]);
    cookieStore.set("artiq_local_ids", idCookiePayload, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });
  } catch (err) {
    console.warn("Could not set local id cookie:", err);
  }
}

