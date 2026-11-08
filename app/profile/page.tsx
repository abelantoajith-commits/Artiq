import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  signOutAction,
  resetDemoProfileAction,
} from "@/app/(auth)/actions";
import { getSessionUser, getLocalArtworks } from "@/lib/auth/demo-session";
import { Artwork } from "@/types/art";
import { ProfileArtworkGrid } from "@/components/artiq/ProfileArtworkGrid";
import { ArtistAvatar } from "@/components/artiq/ArtistAvatar";
import { StoryBlock } from "@/components/artiq/StoryBlock";
import { TryDemoButton } from "@/components/artiq/TryDemoButton";
import {
  User,
  MapPin,
  Edit3,
  LogOut,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Compass,
  Phone,
  Mail,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getSessionUser();

  // 1. Visitor signed out: render the sign-in / registration callout
  if (!user) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-6 animate-in fade-in duration-300 px-4">
        <div className="w-20 h-20 mx-auto rounded-full bg-mist border-2 border-ink flex items-center justify-center text-ink shadow-hard-sm">
          <User className="w-10 h-10 stroke-[2]" />
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink font-display">
            Your Artist Profile
          </h1>
          <p className="text-sm text-ink-soft mt-2 leading-relaxed font-sans">
            Create your portfolio, publish traditional artworks, and share your
            cultural stories with art lovers worldwide.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          {/* Prominent Try Demo Action with Profile Setup */}
          <TryDemoButton label="Try demo (Quick Setup)" />

          <Link
            href="/register"
            className="btn-hard flex items-center justify-center gap-2 py-3 px-6 rounded-[10px] bg-leaf text-ink font-bold shadow-hard min-h-[48px]"
          >
            <span>Create new account</span>
            <ArrowRight className="w-4 h-4 stroke-[2]" />
          </Link>

          <Link
            href="/login"
            className="btn-hard flex items-center justify-center gap-2 py-3 px-6 rounded-[10px] border-2 border-ink bg-white text-ink font-bold shadow-hard-sm hover:bg-mist min-h-[48px]"
          >
            <span>Sign in to existing account</span>
          </Link>
        </div>
      </div>
    );
  }

  // 2. Fetch User Artworks
  let dbArtworks: Artwork[] = [];
  let savedCount = 0;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("artworks")
        .select("*")
        .eq("artist_id", user.id)
        .order("created_at", { ascending: false });

      if (data) dbArtworks = data as unknown as Artwork[];

      const { count } = await supabase
        .from("saves")
        .select("artwork_id", { count: "exact", head: true })
        .eq("user_id", user.id);
      if (count) savedCount = count;
    } catch {
      // offline or local
    }
  }

  const localArtworks = await getLocalArtworks();
  const userLocalArtworks = localArtworks.filter(
    (a) =>
      a.artist_id === user.id ||
      a.artist?.id === user.id ||
      a.artist?.username === user.username ||
      a.artist?.id === "current_user"
  );
  const artistArtworks = [...userLocalArtworks, ...dbArtworks];

  // 3. Check if Creative Portfolio is complete
  const specialities = user.specialities || [];
  const hasPortfolio = Boolean(
    user.bio?.trim() ||
    user.journey?.trim() ||
    user.inspiration?.trim() ||
    user.intro?.trim() ||
    specialities.length > 0
  );

  const displayName = user.display_name;
  const username = user.username;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300 px-4">
      {/* Master Curator Global Banner */}
      {user.is_master && (
        <div className="p-5 rounded-2xl bg-sand-tint border-2 border-ink shadow-hard-sm space-y-2.5 select-none">
          <div className="flex items-center gap-2">
            <span className="text-xl">👑</span>
            <h2 className="font-display font-bold text-base text-ink">
              Master Curator Administration Active
            </h2>
          </div>
          <p className="font-body text-xs text-bark leading-relaxed">
            You are authenticated with universal moderation rights. You can edit, remove, or curate <strong>any post</strong> and <strong>any artist profile</strong> directly across the entire gallery.
          </p>
          <div className="pt-1 flex items-center gap-2">
            <Link
              href="/"
              className="btn-hard inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] bg-white border-2 border-ink text-xs font-bold text-ink shadow-hard-sm hover:bg-mist"
            >
              <span>Explore Gallery to Curate</span>
            </Link>
          </div>
        </div>
      )}

      {/* Profile Header Card */}
      <section className="bg-surface border-2 border-ink rounded-3xl p-6 sm:p-8 space-y-6 shadow-hard">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          {/* Avatar (with hash-colored ring) */}
          <div className="flex-shrink-0">
            <ArtistAvatar artist={user} size="2xl" />
          </div>

          {/* Details */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink font-display">
                    {displayName}
                  </h1>
                  {user.is_master ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[6px] bg-sand border border-ink text-ink text-[11px] font-mono font-bold uppercase">
                      👑 Master Curator
                    </span>
                  ) : user.is_demo ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[6px] bg-sand-tint border border-ink text-ink text-[11px] font-mono font-bold uppercase">
                      Demo mode
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-ink-soft font-mono font-medium">@{username}</p>
              </div>

              <Link
                href={`/artist/${username}`}
                target="_blank"
                className="text-xs text-ink font-bold underline hover:text-ink/80 font-mono"
              >
                Public link ↗
              </Link>
            </div>

            {user.location && (
              <p className="text-xs text-ink-soft flex items-center gap-1.5 font-sans">
                <MapPin className="w-3.5 h-3.5 text-ink stroke-[2]" />
                <span>{user.location}</span>
              </p>
            )}

            <div className="flex flex-wrap gap-3 pt-1 text-xs text-ink-soft">
              {user.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-forest" />
                  <span>{user.phone}</span>
                </span>
              )}
              {user.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-ink" />
                  <span>{user.email}</span>
                </span>
              )}
            </div>

            {/* Visual Tags / Specialities Chips */}
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
        {user.intro && (
          <div className="p-4 rounded-2xl bg-sand-tint border-2 border-ink text-sm text-ink leading-relaxed font-serif">
            {user.intro}
          </div>
        )}

        {/* Bio */}
        {user.bio && (
          <p className="text-sm text-ink-soft leading-relaxed font-sans">
            {user.bio}
          </p>
        )}

        {/* Action Buttons: Edit Profile, Start over (if demo), and Sign Out */}
        <div className="flex items-center gap-3 pt-3 border-t-2 border-ink/15">
          <Link
            href="/profile/edit"
            className="btn-hard flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-[10px] border-2 border-ink bg-white text-ink text-sm font-bold shadow-hard-sm hover:bg-mist min-h-[44px]"
          >
            <Edit3 className="w-4 h-4 stroke-[2]" />
            <span>Edit profile</span>
          </Link>

          {hasPortfolio && (
            <Link
              href="/profile/interview"
              className="btn-hard flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-[10px] border-2 border-ink bg-sand-tint text-ink text-sm font-bold shadow-hard-sm min-h-[44px]"
              title="Refine portfolio with AI Interview"
            >
              <Sparkles className="w-4 h-4 stroke-[2]" />
              <span className="hidden sm:inline">Refine Portfolio</span>
            </Link>
          )}

          {user.is_demo && (
            <form action={resetDemoProfileAction}>
              <button
                type="submit"
                className="btn-hard flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-[10px] border-2 border-ink bg-sand-tint text-ink text-sm font-bold shadow-hard-sm min-h-[44px]"
                title="Clear portfolio and retake interview"
              >
                <RotateCcw className="w-4 h-4 stroke-[2]" />
                <span>Start over</span>
              </button>
            </form>
          )}

          <form action={signOutAction}>
            <button
              type="submit"
              className="btn-hard flex items-center justify-center gap-2 py-2.5 px-4 rounded-[10px] border-2 border-ink bg-clay/20 text-ink hover:bg-clay/30 text-sm font-bold shadow-hard-sm min-h-[44px]"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4 stroke-[2]" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </form>
        </div>
      </section>

      {/* Complete Creative Portfolio Prompt Section (Shown when detailed portfolio is not yet filled) */}
      {!hasPortfolio && (
        <section className="p-6 sm:p-8 rounded-3xl bg-sand-tint border-2 border-ink shadow-hard space-y-4 select-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-lg">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] bg-sand border border-ink text-ink text-xs font-mono font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Complete Portfolio</span>
              </div>
              <h2 className="font-display font-bold text-xl sm:text-2xl text-ink">
                Set Up Your Portfolio
              </h2>
              <p className="font-body text-xs sm:text-sm text-bark leading-relaxed">
                Answer 6 quick questions by voice or typing about your art forms, creative journey, materials, and inspiration. Our AI Portfolio Builder will craft your detailed portfolio.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 flex-shrink-0">
              <Link
                href="/profile/interview"
                className="btn-hard w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-[10px] bg-leaf text-ink font-bold shadow-hard min-h-[48px]"
              >
                <Sparkles className="w-4 h-4 stroke-[2]" />
                <span>Set Up Portfolio</span>
                <ArrowRight className="w-4 h-4 stroke-[2]" />
              </Link>
            </div>
          </div>

          <div className="pt-3 border-t border-ink/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-ink-soft font-sans">
            <span>✓ Name, username, and contact details are already saved.</span>
            <Link
              href="/profile/edit"
              className="text-xs text-ink font-bold underline hover:text-ink/80"
            >
              Fill in portfolio manually
            </Link>
          </div>
        </section>
      )}

      {/* Art Journey / Story Section */}
      {user.journey && (
        <StoryBlock
          quote={user.journey}
          isArtistVoice={true}
          className="shadow-hard-sm"
        />
      )}

      {/* Inspiration Section */}
      {user.inspiration && (
        <section className="bg-surface border-2 border-ink rounded-2xl p-6 space-y-3 shadow-hard-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-ink uppercase tracking-wider font-mono">
            <Compass className="w-4 h-4 text-ink stroke-[2]" />
            <span>Inspiration</span>
          </div>
          <p className="text-sm text-ink leading-relaxed font-sans">
            {user.inspiration}
          </p>
        </section>
      )}

      {/* Contact Details for Collectors */}
      {(user.phone || user.email || user.address) && (
        <section className="bg-surface border-2 border-ink rounded-2xl p-6 space-y-3 shadow-hard-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-ink uppercase tracking-wider font-mono">
              <Phone className="w-4 h-4 stroke-[2]" />
              <span>Contact Details for Collectors</span>
            </div>
            <Link
              href="/profile/edit"
              className="text-xs text-ink font-bold underline hover:text-ink/80"
            >
              Edit
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
            {user.phone && (
              <div className="flex items-center gap-2 text-ink font-medium">
                <Phone className="w-3.5 h-3.5 text-forest flex-shrink-0" />
                <span>{user.phone}</span>
              </div>
            )}
            {user.email && (
              <div className="flex items-center gap-2 text-ink font-medium">
                <Mail className="w-3.5 h-3.5 text-ink flex-shrink-0" />
                <span>{user.email}</span>
              </div>
            )}
            {user.address && (
              <div className="flex items-start gap-2 text-ink sm:col-span-2 font-medium">
                <MapPin className="w-3.5 h-3.5 text-ink-soft flex-shrink-0 mt-0.5" />
                <span>{user.address}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Profile Artwork Tabs: Artworks & Saved */}
      <ProfileArtworkGrid
        initialArtworks={artistArtworks}
        userId={user.id}
        username={user.username}
        savedCount={savedCount}
      />
    </div>
  );
}
