import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { signOutAction, signInAsDemoAction } from "@/app/(auth)/actions";
import { getSessionUser, getLocalArtworks } from "@/lib/auth/demo-session";
import { Artwork } from "@/types/art";
import {
  User,
  MapPin,
  Edit3,
  LogOut,
  Grid3X3,
  Bookmark,
  Sparkles,
  ArrowRight,
  BookOpen,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getSessionUser();

  // If visitor is signed out, render the sign-in / registration callout
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
          {/* 1-Click Test Login for quick testing */}
          <form action={signInAsDemoAction}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-story text-white font-semibold shadow-sm hover:opacity-95 transition-all min-h-[44px]"
            >
              <Sparkles className="w-4 h-4" />
              <span>1-Click Test Login (Raghavan Master)</span>
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

  // Fetch artist's artworks (merging Supabase with local test session artworks)
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
  const artistArtworks = [...localArtworks, ...dbArtworks];
  const displayName = user.display_name;
  const username = user.username;
  const specialities = user.specialities || [];

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Profile Header */}
      <section className="bg-surface border border-line rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
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
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink font-sans">
                  {displayName}
                </h1>
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

            {user.bio && (
              <p className="text-sm text-ink leading-relaxed pt-1">
                {user.bio}
              </p>
            )}

            {/* Specialities */}
            {specialities.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {specialities.map((spec: string, idx: number) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-0.5 rounded-full bg-canvas border border-line text-ink-soft font-medium"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons: Edit Profile and Sign Out */}
        <div className="flex items-center gap-3 pt-2 border-t border-line/60">
          <Link
            href="/profile/edit"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-line bg-canvas text-ink text-sm font-medium hover:bg-surface transition-colors min-h-[44px]"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit profile</span>
          </Link>

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

      {/* Profile Artwork Tabs: Artworks & Saved */}
      <section className="space-y-4">
        <div className="border-b border-line flex gap-8 px-2">
          <div className="flex items-center gap-2 pb-3 border-b-2 border-primary text-primary font-semibold text-sm">
            <Grid3X3 className="w-4 h-4" />
            <span>Artworks ({artistArtworks.length})</span>
          </div>
          <div className="flex items-center gap-2 pb-3 text-ink-soft font-normal text-sm">
            <Bookmark className="w-4 h-4" />
            <span>Saved ({savedCount ?? 0})</span>
          </div>
        </div>

        {/* Instagram-style 3-Column Square Grid (PRD 7.6 & design.md 5.7) */}
        {artistArtworks.length > 0 ? (
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {artistArtworks.map((art: Artwork) => (
              <Link
                key={art.id}
                href={`/artwork/${art.id}`}
                className="relative aspect-square rounded-lg overflow-hidden bg-canvas group cursor-pointer border border-line/60 block"
              >
                <Image
                  src={art.image_url}
                  alt={art.title}
                  fill
                  sizes="(max-width: 640px) 33vw, 200px"
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center">
                  <span className="text-white text-xs font-semibold line-clamp-2">
                    {art.title}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-line rounded-2xl bg-surface/50 space-y-3">
            <p className="text-sm font-medium text-ink">No published artworks yet</p>
            <p className="text-xs text-ink-soft max-w-xs mx-auto">
              Photograph your craft, and AI will assist with the listing details.
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:opacity-95 transition-opacity min-h-[44px]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create your first piece</span>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
