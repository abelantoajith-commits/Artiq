import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLocalArtworks, getSessionUser } from "@/lib/auth/demo-session";
import { getDeletedArtworkIds, getArtworkOverrides } from "@/lib/storage/local-store";
import seedData from "@/data/seed-data.json";
import { Artwork, Artist } from "@/types/art";
import { ArtworkDetailView } from "@/components/artiq/ArtworkDetailView";

export const dynamic = "force-dynamic";

interface ArtworkDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ArtworkDetailPage({
  params,
}: ArtworkDetailPageProps) {
  const { id } = await params;
  const currentUser = await getSessionUser();
  const supabase = await createClient();

  let artwork: Artwork | null = null;
  let artist: Artist | null = null;
  let moreArtworks: Artwork[] = [];

  // Check if permanently deleted by Master
  const deletedIds = await getDeletedArtworkIds();
  if (deletedIds.has(id)) {
    notFound();
  }

  // 1. Try querying Supabase
  const { data: dbArt } = await supabase
    .from("artworks")
    .select("*, artist:profiles(*)")
    .eq("id", id)
    .single();

  if (dbArt) {
    artwork = dbArt as unknown as Artwork;
    artist = dbArt.artist as unknown as Artist;

    const { data: moreFromDb } = await supabase
      .from("artworks")
      .select("*")
      .eq("artist_id", artwork.artist_id)
      .neq("id", id)
      .limit(3);
    moreArtworks = (moreFromDb ?? []) as unknown as Artwork[];
  } else {
    // 2. Fallback to seed data for sample artworks
    const seedArt = (seedData.artworks as Artwork[]).find((a) => a.id === id);
    if (seedArt) {
      const seedArtist =
        (seedData.artists as Artist[]).find((a) => a.id === seedArt.artist_id) ||
        (seedData.artists[0] as Artist);
      artwork = { ...seedArt, artist: seedArtist } as Artwork;
      artist = seedArtist;

      moreArtworks = (seedData.artworks as Artwork[])
        .filter((a) => a.artist_id === seedArt.artist_id && a.id !== id)
        .slice(0, 3);
    }
  }

  // 3. Check local session artworks (for test / demo publishing)
  if (!artwork) {
    const localArtworks = await getLocalArtworks();
    const localMatch = localArtworks.find((a) => a.id === id);
    if (localMatch) {
      artwork = localMatch;
      artist = localMatch.artist;
      moreArtworks = localArtworks.filter((a) => a.id !== id).slice(0, 3);
    }
  }

  // Apply master overrides if any
  if (artwork) {
    const overrides = await getArtworkOverrides();
    const artOverride = overrides.get(id);
    if (artOverride) {
      artwork = { ...artwork, ...artOverride };
    }
  }

  return (
    <ArtworkDetailView
      initialArtwork={artwork}
      initialArtist={artist}
      initialMoreArtworks={moreArtworks}
      artworkId={id}
      currentUser={currentUser}
    />
  );
}
