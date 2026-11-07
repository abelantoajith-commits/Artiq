import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getLocalArtworks, getSessionUser } from "@/lib/auth/demo-session";
import {
  getDeletedProfileUsernames,
  getProfileOverrides,
  getDeletedArtworkIds,
  getArtworkOverrides,
} from "@/lib/storage/local-store";
import seedData from "@/data/seed-data.json";
import { Artist, Artwork } from "@/types/art";
import { User, MapPin, ArrowLeft, Compass } from "lucide-react";
import { ProfileArtworkGrid } from "@/components/artiq/ProfileArtworkGrid";
import { ContactArtistCard } from "@/components/artiq/ContactArtistCard";
import { ArtistAvatar } from "@/components/artiq/ArtistAvatar";
import { StoryBlock } from "@/components/artiq/StoryBlock";
import { MasterArtistModerator } from "@/components/artiq/MasterArtistModerator";

export const dynamic = "force-dynamic";

interface PublicArtistPageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function PublicArtistPage({ params }: PublicArtistPageProps) {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username).toLowerCase();

  // "you" and "current_user" are reserved identifiers representing the active user's profile
  if (decodedUsername === "you" || decodedUsername === "current_user") {
    redirect("/profile");
  }

  // 1. Check if artist profile was permanently deleted by Master
  const deletedProfiles = await getDeletedProfileUsernames();
  if (deletedProfiles.has(decodedUsername)) {
    notFound();
  }

  const currentUser = await getSessionUser();
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

  // 2. Apply Master profile overrides if any
  const profileOverrides = await getProfileOverrides();
  const profileOverride = profileOverrides.get(decodedUsername);
  if (profileOverride) {
    profile = { ...profile, ...profileOverride };
  }

  // 3. Filter deleted artworks and apply overrides
  const deletedArtIds = await getDeletedArtworkIds();
  const artOverrides = await getArtworkOverrides();

  artworks = artworks
    .filter((a) => !deletedArtIds.has(a.id))
    .map((a) => {
      const override = artOverrides.get(a.id);
      return override ? { ...a, ...override } : a;
    });

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
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300 px-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="btn-hard inline-flex items-center gap-2 px-3.5 py-2 rounded-[10px] bg-white border-2 border-ink text-xs text-ink font-bold shadow-hard-sm hover:bg-mist transition-colors"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2]" />
            <span>Back to Gallery</span>
          </Link>
        </div>

        <section className="bg-surface border-2 border-ink rounded-3xl p-8 text-center space-y-4 shadow-hard">
          <div className="w-20 h-20 mx-auto rounded-full bg-mist border-2 border-ink flex items-center justify-center text-ink shadow-hard-sm">
            <User className="w-10 h-10 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink font-display">{profile.display_name}</h1>
            <p className="text-xs text-ink-soft font-mono">@{profile.username}</p>
          </div>
          <p className="text-sm text-ink-soft pt-2 font-sans">
            This artist hasn&apos;t added a profile yet.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300 px-4">
      {/* Top Navigation Back */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="btn-hard inline-flex items-center gap-2 px-3.5 py-2 rounded-[10px] bg-white border-2 border-ink text-xs text-ink font-bold shadow-hard-sm hover:bg-mist transition-colors"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2]" />
          <span>Back to Gallery</span>
        </Link>
      </div>

      {/* Master Moderation Ribbon if authenticated as Master Curator */}
      {currentUser?.is_master && (
        <MasterArtistModerator artist={profile} />
      )}

      {/* Artist Profile Header Card */}
      <section className="bg-surface border-2 border-ink rounded-3xl p-6 sm:p-8 space-y-6 shadow-hard">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          {/* Avatar (with hash-colored ring) */}
          <div className="flex-shrink-0">
            <ArtistAvatar artist={profile} size="2xl" />
          </div>

          {/* Details */}
          <div className="flex-1 space-y-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink font-display">
                {profile.display_name}
              </h1>
              <p className="text-xs text-ink-soft font-mono font-medium">@{profile.username}</p>
            </div>

            {profile.location && (
              <p className="text-xs text-ink-soft flex items-center gap-1.5 font-sans">
                <MapPin className="w-3.5 h-3.5 text-ink stroke-[2]" />
                <span>{profile.location}</span>
              </p>
            )}

            {/* Visual Tags / Specialities */}
            {specialities.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {specialities.map((spec: string, idx: number) => (
                  <span
                    key={idx}
                    className="text-xs px-3 py-1 rounded-[6px] bg-sand-tint border border-ink text-ink font-mono font-bold uppercase tracking-wider"
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
          <div className="p-4 rounded-2xl bg-sand-tint border-2 border-ink text-sm text-ink leading-relaxed font-serif">
            {profile.intro}
          </div>
        )}

        {/* Bio */}
        {profile.bio && (
          <p className="text-sm text-ink-soft leading-relaxed font-sans">
            {profile.bio}
          </p>
        )}
      </section>

      {/* Art Journey / Story Section */}
      {profile.journey && (
        <StoryBlock
          quote={profile.journey}
          isArtistVoice={true}
          className="shadow-hard-sm"
        />
      )}

      {/* Inspiration Section */}
      {profile.inspiration && (
        <section className="bg-surface border-2 border-ink rounded-2xl p-6 space-y-3 shadow-hard-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-ink uppercase tracking-wider font-mono">
            <Compass className="w-4 h-4 text-ink stroke-[2]" />
            <span>Inspiration</span>
          </div>
          <p className="text-sm text-ink leading-relaxed font-sans">
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
