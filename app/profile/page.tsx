import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  signOutAction,
  signInAsDemoAction,
  resetDemoProfileAction,
} from "@/app/(auth)/actions";
import { getSessionUser, getLocalArtworks } from "@/lib/auth/demo-session";
import { Artwork } from "@/types/art";
import { ProfileArtworkGrid } from "@/components/artiq/ProfileArtworkGrid";
import {
  User,
  MapPin,
  Edit3,
  LogOut,
  Sparkles,
  ArrowRight,
  BookOpen,
  RotateCcw,
  Compass,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getSessionUser();

  // 1. Visitor signed out: render the sign-in / registration callout
  if (!user) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-6 animate-in fade-in duration-300">
        <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <User className="w-10 h-10" />
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink font-sans">
            Your Artist Profile
          </h1>
          <p className="text-sm text-ink-soft mt-2 leading-relaxed">
            Create your portfolio, publish traditional artworks, and share your
            cultural stories with art lovers worldwide.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          {/* Prominent Try Demo Action */}
          <form action={signInAsDemoAction}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-story text-white font-semibold shadow-sm hover:opacity-95 transition-all min-h-[44px]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Try demo (Instant Access)</span>
            </button>
          </form>

          <Link
            href="/register"
            className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-primary text-primary-foreground font-medium shadow-sm hover:opacity-95 transition-all min-h-[44px]"
          >
            <span>Create new account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/login"
            className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl border border-line bg-surface text-ink font-medium hover:bg-canvas transition-colors min-h-[44px]"
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

  // 3. Check if Profile is EMPTY (Both zero bio AND zero artworks)
  const specialities = user.specialities || [];
  const hasBio = Boolean(
    user.bio?.trim() ||
    user.journey?.trim() ||
    user.inspiration?.trim() ||
    user.intro?.trim() ||
    specialities.length > 0
  );
  const hasArtworks = artistArtworks.length > 0;
  const isEmptyProfile = !hasBio && !hasArtworks;

  if (isEmptyProfile) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-6 animate-in fade-in duration-300">
        {user.is_demo && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-story/15 border border-story/30 text-story text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Demo mode</span>
          </div>
        )}

        {/* Avatar placeholder */}
        <div className="w-24 h-24 mx-auto rounded-full bg-line flex items-center justify-center text-ink-soft ring-4 ring-primary/10">
          <User className="w-12 h-12" />
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink font-sans">
            Your profile is empty
          </h1>
          <p className="text-sm text-ink-soft mt-2 leading-relaxed">
            Answer a few quick questions by voice or typing. Our AI Identity Builder will organize your authentic words into a dignified artist profile.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Link
            href="/profile/interview"
            className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-story text-white font-semibold shadow-sm hover:opacity-95 transition-all min-h-[44px]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create your profile</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/profile/edit"
            className="text-xs text-ink-soft hover:text-ink font-medium py-2 min-h-[36px] flex items-center justify-center"
          >
            Fill it in myself
          </Link>
        </div>

        {/* Demo reset / sign out options */}
        <div className="pt-6 border-t border-line flex items-center justify-center gap-5 text-xs">
          {user.is_demo && (
            <form action={resetDemoProfileAction}>
              <button
                type="submit"
                className="text-ink-soft hover:text-story font-medium flex items-center gap-1 min-h-[36px]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Start over</span>
              </button>
            </form>
          )}

          <form action={signOutAction}>
            <button
              type="submit"
              className="text-ink-soft hover:text-danger font-medium flex items-center gap-1 min-h-[36px]"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  const displayName = user.display_name;
  const username = user.username;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Profile Header */}
      <section className="bg-surface border border-line rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          {/* Avatar */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-line flex-shrink-0 ring-2 ring-primary/20">
            {user.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt={displayName}
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
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink font-sans">
                    {displayName}
                  </h1>
                  {user.is_demo && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-story/15 border border-story/30 text-story text-[11px] font-semibold">
                      Demo mode
                    </span>
                  )}
                </div>
                <p className="text-xs text-ink-soft">@{username}</p>
              </div>

              <Link
                href={`/artist/${username}`}
                target="_blank"
                className="text-xs text-primary font-medium hover:underline"
              >
                Public link ↗
              </Link>
            </div>

            {user.location && (
              <p className="text-xs text-ink-soft flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-story" />
                <span>{user.location}</span>
              </p>
            )}

            {/* Visual Tags / Specialities Chips */}
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

        {/* Portfolio Introduction (at the top of profile) */}
        {user.intro && (
          <div className="p-4 rounded-2xl bg-canvas border border-line/60 text-sm text-ink leading-relaxed">
            {user.intro}
          </div>
        )}

        {/* Bio */}
        {user.bio && (
          <p className="text-sm text-ink-soft leading-relaxed">
            {user.bio}
          </p>
        )}

        {/* Action Buttons: Edit Profile, Start over (if demo), and Sign Out */}
        <div className="flex items-center gap-3 pt-2 border-t border-line/60">
          <Link
            href="/profile/edit"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-line bg-canvas text-ink text-sm font-medium hover:bg-surface transition-colors min-h-[44px]"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit profile</span>
          </Link>

          {user.is_demo && (
            <form action={resetDemoProfileAction}>
              <button
                type="submit"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-line bg-canvas text-ink-soft hover:text-story text-sm font-medium transition-colors min-h-[44px]"
                title="Clear profile and retake interview"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Start over</span>
              </button>
            </form>
          )}

          <form action={signOutAction}>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-line bg-canvas text-ink-soft hover:text-danger hover:border-danger/40 text-sm font-medium transition-colors min-h-[44px]"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </form>
        </div>
      </section>

      {/* Art Journey / Story Section */}
      {user.journey && (
        <section className="bg-surface border border-line rounded-3xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-story uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>My Art Journey</span>
          </div>
          <p className="text-base text-ink font-serif leading-relaxed italic">
            &ldquo;{user.journey}&rdquo;
          </p>
        </section>
      )}

      {/* Inspiration Section */}
      {user.inspiration && (
        <section className="bg-surface border border-line rounded-3xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-story uppercase tracking-wider">
            <Compass className="w-4 h-4" />
            <span>Inspiration</span>
          </div>
          <p className="text-sm text-ink leading-relaxed">
            {user.inspiration}
          </p>
        </section>
      )}

      {/* Bio prompt banner if profile bio is not yet filled */}
      {!hasBio && (
        <div className="p-4 rounded-2xl bg-story/10 border border-story/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-story uppercase tracking-wider">
              Introduce Yourself
            </p>
            <p className="text-xs text-ink-soft mt-0.5">
              Answer a few quick questions to create your story, mentor, and technique portfolio.
            </p>
          </div>
          <Link
            href="/profile/interview"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-story text-white text-xs font-semibold hover:opacity-95 transition-opacity min-h-[40px] flex-shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Build Story</span>
          </Link>
        </div>
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
