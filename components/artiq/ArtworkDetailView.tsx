"use client";

import { useSyncExternalStore, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Artwork, Artist } from "@/types/art";
import { AppUser } from "@/lib/auth/demo-session";
import { getCategoryLabel } from "@/lib/categories";
import { ArrowLeft, BookOpen, MapPin } from "lucide-react";
import { ArtworkDetailActions } from "@/components/artiq/ArtworkDetailActions";
import { ArtworkImageDisplay } from "@/components/artiq/ArtworkImageDisplay";
import seedData from "@/data/seed-data.json";

interface ArtworkDetailViewProps {
  initialArtwork: Artwork | null;
  initialArtist: Artist | null;
  initialMoreArtworks: Artwork[];
  artworkId: string;
  currentUser: AppUser | null;
}

function subscribeStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getClientStorageSnapshot() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("artiq_browser_artworks");
}

function getServerStorageSnapshot() {
  return null;
}

export function ArtworkDetailView({
  initialArtwork,
  initialArtist,
  initialMoreArtworks,
  artworkId,
  currentUser,
}: ArtworkDetailViewProps) {
  const browserArtworksRaw = useSyncExternalStore(
    subscribeStorage,
    getClientStorageSnapshot,
    getServerStorageSnapshot
  );

  // If artwork was not found on server, resolve from browser localStorage
  const artwork = useMemo(() => {
    if (initialArtwork) return initialArtwork;
    if (browserArtworksRaw) {
      try {
        const list = JSON.parse(browserArtworksRaw) as Artwork[];
        const match = list.find((a) => a.id === artworkId);
        if (match) return match;
      } catch {
        // ignore
      }
    }
    return null;
  }, [initialArtwork, browserArtworksRaw, artworkId]);

  const artist = useMemo(() => {
    if (initialArtist) return initialArtist;
    if (artwork?.artist) return artwork.artist;
    if (currentUser) {
      return {
        id: currentUser.id,
        display_name: currentUser.display_name,
        username: currentUser.username,
        location: currentUser.location || "Kerala, India",
        avatar_url:
          currentUser.avatar_url ||
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
        bio: currentUser.bio || "",
        journey: currentUser.journey || "",
        specialities: currentUser.specialities || [],
        preferred_language: "en",
      } as Artist;
    }
    return null;
  }, [initialArtist, artwork, currentUser]);

  // If artwork was found locally in browser but missing on server, sync in background
  useEffect(() => {
    if (!initialArtwork && artwork) {
      fetch("/api/artworks/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(artwork),
      }).catch(() => {});
    }
  }, [initialArtwork, artwork]);

  if (!artwork || !artist) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-5 animate-in fade-in duration-300">
        <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <BookOpen className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-ink">Artwork Not Found</h1>
          <p className="text-xs text-ink-soft mt-1 leading-relaxed">
            This artwork may have been removed or is no longer available in the gallery.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-95 transition-opacity min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Gallery</span>
        </Link>
      </div>
    );
  }

  const isSeedArt = (seedData.artworks as { id: string }[]).some((a) => a.id === artwork.id);
  const isOwner = Boolean(
    !isSeedArt &&
      currentUser &&
      (currentUser.id === artwork.artist_id ||
        currentUser.id === artwork.artist?.id ||
        currentUser.username.toLowerCase() === artwork.artist?.username.toLowerCase() ||
        artwork.artist?.id === "current_user")
  );

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
      <ArtworkImageDisplay artwork={artwork} />

      {/* Primary Info & Actions */}
      <div className="space-y-6">
        <div>
          {artwork.categories && artwork.categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {artwork.categories.map((catId) => (
                <span
                  key={catId}
                  className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-semibold uppercase tracking-wider"
                >
                  {getCategoryLabel(catId)}
                </span>
              ))}
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink font-sans">
            {artwork.title}
          </h1>
          {artwork.caption && (
            <p className="text-sm sm:text-base text-ink-soft mt-1 italic">
              &ldquo;{artwork.caption}&rdquo;
            </p>
          )}
        </div>

        {/* Action Bar & Share to Social Media */}
        <ArtworkDetailActions
          artwork={artwork}
          showShareBanner={true}
          isOwner={isOwner}
        />

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

        {/* Unified "About this artwork" (Story & Observations in Serif) */}
        {artwork.description && (
          <section className="p-6 sm:p-8 rounded-3xl bg-surface border border-line space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-story uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-story" />
              <span>About this artwork</span>
            </div>
            <p className="text-base sm:text-lg text-ink font-serif leading-relaxed whitespace-pre-line">
              {artwork.description}
            </p>
          </section>
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
        {initialMoreArtworks.length > 0 && (
          <div className="pt-8 border-t border-line space-y-4">
            <h3 className="text-sm font-semibold text-ink">
              More by {artist.display_name}
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {initialMoreArtworks.map((item) => (
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
