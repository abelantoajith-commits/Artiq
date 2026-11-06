import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import seedData from "@/data/seed-data.json";
import { Artwork, Artist } from "@/types/art";
import { ArrowLeft, BookOpen, MapPin } from "lucide-react";

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
  const supabase = await createClient();

  let artwork: Artwork | null = null;
  let artist: Artist | null = null;
  let moreArtworks: Artwork[] = [];

  // 1. Try querying Supabase
  const { data: dbArt } = await supabase
    .from("artworks")
    .select("*, artist:profiles(*)")
    .eq("id", id)
    .single();

  if (dbArt) {
    artwork = dbArt as unknown as Artwork;
    artist = dbArt.artist as unknown as Artist;

    // Fetch more from this artist
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
      const seedArtist = (seedData.artists as Artist[]).find(
        (a) => a.id === seedArt.artist_id
      ) || (seedData.artists[0] as Artist);
      artwork = { ...seedArt, artist: seedArtist } as Artwork;
      artist = seedArtist;

      moreArtworks = (seedData.artworks as Artwork[])
        .filter((a) => a.artist_id === seedArt.artist_id && a.id !== id)
        .slice(0, 3);
    }
  }

  if (!artwork || !artist) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-ink-soft hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Gallery</span>
        </Link>
      </div>

      {/* Uncropped Artwork Presentation (design.md 5.6: Artwork is never cropped) */}
      <div className="w-full bg-surface border border-line rounded-3xl overflow-hidden p-3 sm:p-6 shadow-sm flex items-center justify-center">
        <Image
          src={artwork.image_url}
          alt={artwork.title}
          width={artwork.width}
          height={artwork.height}
          sizes="(max-width: 768px) 100vw, 800px"
          className="max-h-[70vh] w-auto h-auto rounded-2xl object-contain shadow-sm"
          priority
        />
      </div>

      {/* Primary Info & Actions */}
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            <span>{artwork.art_form}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink font-sans">
            {artwork.title}
          </h1>
          {artwork.caption && (
            <p className="text-sm sm:text-base text-ink-soft mt-1 italic">
              &ldquo;{artwork.caption}&rdquo;
            </p>
          )}
        </div>

        {/* Artist Profile Card */}
        <div className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-surface border border-line shadow-sm">
          <Link
            href={`/artist/${artist.username}`}
            className="flex items-center gap-3.5 group min-w-0"
          >
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-line ring-1 ring-line group-hover:ring-primary transition-all flex-shrink-0">
              <Image
                src={artist.avatar_url}
                alt={artist.display_name}
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-ink group-hover:text-primary transition-colors text-sm sm:text-base truncate">
                {artist.display_name}
              </h2>
              <p className="text-xs text-ink-soft flex items-center gap-1">
                <MapPin className="w-3 h-3 text-story flex-shrink-0" />
                <span className="truncate">{artist.location}</span>
              </p>
            </div>
          </Link>

          <Link
            href={`/artist/${artist.username}`}
            className="px-4 py-2 rounded-xl bg-canvas border border-line text-xs font-semibold text-ink hover:bg-surface hover:border-primary/40 transition-colors flex-shrink-0"
          >
            Visit profile
          </Link>
        </div>

        {/* Visual Description */}
        {artwork.description && (
          <div className="bg-surface border border-line rounded-2xl p-5 space-y-1">
            <h3 className="text-xs font-semibold text-ink-soft uppercase tracking-wider">
              About this piece
            </h3>
            <p className="text-sm text-ink leading-relaxed">
              {artwork.description}
            </p>
          </div>
        )}

        {/* The Artist's Story (Turmeric Accent & Newsreader Serif) */}
        {artwork.story && (
          <section className="p-6 sm:p-8 rounded-3xl bg-story/10 border border-story/30 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-story uppercase tracking-wider">
              <BookOpen className="w-4 h-4" />
              <span>The Artist&apos;s Story</span>
            </div>
            <p className="text-lg sm:text-xl text-ink font-serif leading-relaxed italic">
              &ldquo;{artwork.story}&rdquo;
            </p>
          </section>
        )}

        {/* Technique & Materials Badges */}
        {(artwork.materials || artwork.technique) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {artwork.materials && (
              <div className="p-4 rounded-2xl bg-surface border border-line">
                <span className="text-ink-soft block mb-1 uppercase font-semibold text-[10px] tracking-wider">
                  Materials
                </span>
                <span className="font-medium text-ink text-sm">
                  {artwork.materials}
                </span>
              </div>
            )}
            {artwork.technique && (
              <div className="p-4 rounded-2xl bg-surface border border-line">
                <span className="text-ink-soft block mb-1 uppercase font-semibold text-[10px] tracking-wider">
                  Technique
                </span>
                <span className="font-medium text-ink text-sm">
                  {artwork.technique}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {artwork.hashtags && artwork.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {artwork.hashtags.map((tag, idx) => (
              <span
                key={idx}
                className="text-xs px-3 py-1 rounded-lg bg-surface border border-line text-ink-soft font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* More from this artist */}
        {moreArtworks.length > 0 && (
          <div className="pt-8 border-t border-line space-y-4">
            <h3 className="text-sm font-semibold text-ink">
              More by {artist.display_name}
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {moreArtworks.map((item) => (
                <Link
                  key={item.id}
                  href={`/artwork/${item.id}`}
                  className="group relative aspect-square rounded-xl overflow-hidden bg-canvas border border-line"
                >
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    fill
                    sizes="200px"
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
