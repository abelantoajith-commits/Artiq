import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { Artwork } from "@/types/art";

export interface AppUser {
  id: string;
  email: string;
  display_name: string;
  username: string;
  location?: string;
  bio?: string;
  journey?: string;
  avatar_url?: string;
  specialities?: string[];
  is_demo?: boolean;
}

export const DEMO_ARTIST: AppUser = {
  id: "artist_demo_raghavan",
  email: "raghavan.master@artiq.gallery",
  display_name: "K. R. Raghavan Master",
  username: "raghavan_murals",
  location: "Kottayam, Kerala",
  bio: "Master Kerala temple muralist preserving 500-year-old fresco-secco traditions with natural rock pigments and herbal binders.",
  journey: "Initiated under Guruvayur temple masters in 1984. Dedicated the last four decades to traditional iconography and temple wall restoration.",
  avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
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
      return { ...DEMO_ARTIST, ...parsed, is_demo: true };
    } catch {
      return DEMO_ARTIST;
    }
  }

  // 2. Check Supabase Auth
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
        location: profile?.location || user.user_metadata?.location || "Kerala, India",
        bio: profile?.bio || "",
        journey: profile?.journey || "",
        avatar_url: profile?.avatar_url || "",
        specialities: profile?.specialities || [],
        is_demo: false,
      };
    }
  } catch {
    // Supabase offline or unconfigured
  }

  return null;
}

/**
 * Retrieves local artworks published in test/demo mode
 */
export async function getLocalArtworks(): Promise<Artwork[]> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("artiq_local_artworks")?.value;
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Artwork[];
  } catch {
    return [];
  }
}

/**
 * Persists an artwork in the local session for test/demo publishing
 */
export async function saveLocalArtwork(artwork: Artwork): Promise<void> {
  const cookieStore = await cookies();
  const existing = await getLocalArtworks();
  const updated = [artwork, ...existing.filter((a) => a.id !== artwork.id)].slice(0, 30);

  cookieStore.set("artiq_local_artworks", JSON.stringify(updated), {
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: "lax",
  });
}
