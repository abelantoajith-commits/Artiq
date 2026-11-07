import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getLocalArtworks } from "@/lib/auth/demo-session";
import seedData from "@/data/seed-data.json";
import { Artist, Artwork } from "@/types/art";
import { User, MapPin, BookOpen, ArrowLeft, Compass } from "lucide-react";
import { ProfileArtworkGrid } from "@/components/artiq/ProfileArtworkGrid";
import { ContactArtistCard } from "@/components/artiq/ContactArtistCard";

export const dynamic = "force-dynamic";

interface PublicArtistPageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function PublicArtistPage({ params }: PublicArtistPageProps) {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username).toLowerCase();

  const supabase = await createClient();

  // Try fetching artist from Supabase profiles
  let profile: Artist | null = null;
  let artworks: Artwork[] = [];

  const { data: dbProfile } = await supabase
    .from("profiles")
    .select("*")
    .ilike("username", decodedUsername)
    .single();

  if (dbProfile) {
    profile = dbProfile as Artist;
    const { data: dbArtworks } = await supabase
      .from("artworks")
      .select("*")
      .eq("artist_id", profile.id)
      .eq("status", "published")
      .order("created_at", { ascending: false });
    artworks = (dbArtworks ?? []) as Artwork[];
  } else {
    // Fallback to seed data so sample artists have live working public URLs
    const seedArtist = (seedData.artists as Artist[]).find(
      (a) => a.username.toLowerCase() === decodedUsername
    );
    if (seedArtist) {
      profile = seedArtist;
      artworks = (seedData.artworks as Artwork[]).filter(
        (art) => art.artist_id === seedArtist.id
      );
    }
  }

  // Also check local test / demo artworks
  const localArtworks = await getLocalArtworks();
  const localMatching = localArtworks.filter(
    (a) =>
      a.artist.username.toLowerCase() === decodedUsername ||
      (profile && a.artist_id === profile.id)
  );

  if (!profile && localMatching.length > 0) {
    profile = localMatching[0].artist;
  }

  if (localMatching.length > 0) {
    artworks = [...localMatching, ...artworks];
  }

  if (!profile) {
    notFound();
  }

  const specialities = profile.specialities || [];
  const isEmptyProfile =
    !profile.bio?.trim() &&
    !profile.journey?.trim() &&
    !profile.inspiration?.trim() &&
    !profile.intro?.trim() &&
    specialities.length === 0 &&
    artworks.length === 0;

  if (isEmptyProfile) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-ink-soft hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Gallery</span>
          </Link>
        </div>

        <section className="bg-surface border border-line rounded-3xl p-8 text-center space-y-4 shadow-sm">
          <div className="w-20 h-20 mx-auto rounded-full bg-line flex items-center justify-center text-ink-soft">
            <User className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink">{profile.display_name}</h1>
            <p className="text-xs text-ink-soft">@{profile.username}</p>
          </div>
          <p className="text-sm text-ink-soft pt-2">
            This artist hasn&apos;t added a profile yet.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Navigation Back */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-ink-soft hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Gallery</span>
        </Link>
      </div>

      {/* Artist Profile Header */}
      <section className="bg-surface border border-line rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          {/* Avatar */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-line flex-shrink-0 ring-2 ring-primary/20">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.display_name}
                fill
                sizes="96px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-ink-soft">
                <User className="w-10 h-10" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 space-y-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink font-sans">
                {profile.display_name}
              </h1>
              <p className="text-xs text-ink-soft">@{profile.username}</p>
            </div>

            {profile.location && (
              <p className="text-xs text-ink-soft flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-story" />
                <span>{profile.location}</span>
              </p>
            )}

            {/* Visual Tags / Specialities */}
            {specialities.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {specialities.map((spec: string, idx: number) => (
                  <span
                    key={idx}
                    className="text-xs px-3 py-1 rounded-full bg-story/15 border border-story/30 text-story font-semibold tracking-wide shadow-xs"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Portfolio Introduction */}
        {profile.intro && (
          <div className="p-4 rounded-2xl bg-canvas border border-line/60 text-sm text-ink leading-relaxed">
            {profile.intro}
          </div>
        )}

        {/* Bio */}
        {profile.bio && (
          <p className="text-sm text-ink-soft leading-relaxed">
            {profile.bio}
          </p>
        )}
      </section>

      {/* Art Journey / Story Section */}
      {profile.journey && (
        <section className="bg-surface border border-line rounded-3xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-story uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Artist Journey</span>
          </div>
          <p className="text-base text-ink font-serif leading-relaxed italic">
            &ldquo;{profile.journey}&rdquo;
          </p>
        </section>
      )}

      {/* Inspiration Section */}
      {profile.inspiration && (
        <section className="bg-surface border border-line rounded-3xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-story uppercase tracking-wider">
            <Compass className="w-4 h-4" />
            <span>Inspiration</span>
          </div>
          <p className="text-sm text-ink leading-relaxed">
            {profile.inspiration}
          </p>
        </section>
      )}

      {/* Contact the Artist */}
      <ContactArtistCard artist={profile} artworkTitle="works" />

      {/* Artworks Grid */}
      <ProfileArtworkGrid
        initialArtworks={artworks}
        userId={profile.id}
        username={profile.username}
      />
    </div>
  );
}
