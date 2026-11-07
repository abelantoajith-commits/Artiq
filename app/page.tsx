import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createLogger } from "@/lib/logger";
import { getLocalArtworks, getSessionUser } from "@/lib/auth/demo-session";
import seedData from "@/data/seed-data.json";
import { Artist, Artwork } from "@/types/art";
import { HomeGallery } from "@/components/artiq/HomeGallery";

async function fetchGalleryData(): Promise<{
  artists: Artist[];
  artworks: Artwork[];
  isLive: boolean;
}> {
  const log = createLogger("home.gallery");
  const startTime = Date.now();
  let artists: Artist[] = seedData.artists as Artist[];
  let artworks: Artwork[] = [];
  let isLive = false;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      log.debug("home: querying live artworks from Supabase");

      const { data: dbArtworks, error: artError } = await supabase
        .from("artworks")
        .select("*, artist:profiles(*)")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      const { data: dbProfiles, error: profError } = await supabase
        .from("profiles")
        .select("*")
        .limit(20);

      if (!artError && dbArtworks && dbArtworks.length > 0) {
        artworks = dbArtworks as unknown as Artwork[];
        if (!profError && dbProfiles && dbProfiles.length > 0) {
          artists = dbProfiles as unknown as Artist[];
        }
        isLive = true;
        log.info(
          { artworkCount: artworks.length, durationMs: Date.now() - startTime },
          "home: loaded from Supabase"
        );
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      log.warn({ err: message }, "home: using seed fallback");
    }
  }

  // Graceful fallback to verified seed data if database is empty
  if (artworks.length === 0) {
    artworks = seedData.artworks.map((art) => {
      const artist = artists.find((a) => a.id === art.artist_id) || artists[0];
      return { ...art, artist } as Artwork;
    });
  }

  // Prepend any freshly published local/demo test artworks
  const localArtworks = await getLocalArtworks();
  if (localArtworks.length > 0) {
    artworks = [...localArtworks, ...artworks];
  }

  return { artists, artworks, isLive };
}

export default async function HomePage() {
  const user = await getSessionUser();
  const { artists, artworks, isLive } = await fetchGalleryData();

  return (
    <HomeGallery
      initialArtists={artists}
      initialArtworks={artworks}
      isLiveDatabase={isLive}
      currentUserId={user?.id}
      currentUsername={user?.username}
    />
  );
}
