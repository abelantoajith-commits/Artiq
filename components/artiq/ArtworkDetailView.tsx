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
import { ContactArtistCard } from "@/components/artiq/ContactArtistCard";
import { ArtistAvatar } from "@/components/artiq/ArtistAvatar";
import { StoryTag } from "@/components/artiq/Badges";
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
    const baseArtist = artwork?.artist;
    if (baseArtist) {
      if (
        currentUser &&
        (currentUser.id === baseArtist.id ||
          baseArtist.id === "current_user" ||
          baseArtist.username?.toLowerCase() === "you" ||
          currentUser.username.toLowerCase() === baseArtist.username?.toLowerCase())
      ) {
        return {
          ...baseArtist,
          display_name:
            baseArtist.display_name === "You"
              ? currentUser.display_name
              : baseArtist.display_name || currentUser.display_name,
          username:
            baseArtist.username?.toLowerCase() === "you"
              ? currentUser.username
              : baseArtist.username || currentUser.username,
          avatar_url:
            baseArtist.avatar_url && baseArtist.avatar_url !== "🎨"
              ? baseArtist.avatar_url
              : currentUser.avatar_url || baseArtist.avatar_url || "🎨",
          location: baseArtist.location || currentUser.location || "Kerala, India",
          phone: baseArtist.phone || currentUser.phone,
          email: baseArtist.email || currentUser.email,
          address: baseArtist.address || currentUser.address,
        } as Artist;
      }
      return baseArtist;
    }
    if (currentUser) {
      return {
        id: currentUser.id,
        display_name: currentUser.display_name,
        username: currentUser.username,
        location: currentUser.location || "Kerala, India",
        avatar_url: currentUser.avatar_url || "🎨",
        bio: currentUser.bio || "",
        journey: currentUser.journey || "",
        specialities: currentUser.specialities || [],
        phone: currentUser.phone || "",
        email: currentUser.email || "",
        address: currentUser.address || "",
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
        <div className="w-16 h-16 mx-auto rounded-[16px] bg-mist border-2 border-espresso flex items-center justify-center text-espresso shadow-hard-sm">
          <BookOpen className="w-8 h-8 stroke-espresso" strokeWidth={2} />
        </div>
        <div>
          <h1 className="font-display font-bold text-xl text-espresso">Artwork Not Found</h1>
          <p className="font-body text-xs text-bark mt-1 leading-relaxed">
            This artwork may have been removed or is no longer available in the gallery.
          </p>
        </div>
        <Link
          href="/"
          className="h-12 px-5 rounded-[10px] bg-leaf text-espresso border-2 border-espresso shadow-hard btn-hard inline-flex items-center gap-2 font-body font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4 stroke-espresso" strokeWidth={2.5} />
          <span>Back to Gallery</span>
        </Link>
      </div>
    );
  }

  const isSeedArt = (seedData.artworks as { id: string }[]).some((a) => a.id === artwork.id);
  const isOwner = Boolean(
    !isSeedArt &&
      ((currentUser &&
        (currentUser.id === artwork.artist_id ||
          currentUser.id === artwork.artist?.id ||
          currentUser.username.toLowerCase() === artwork.artist?.username?.toLowerCase())) ||
        artwork.artist?.id === "current_user" ||
        artwork.artist?.username?.toLowerCase() === "you" ||
        artist?.id === "current_user" ||
        artist?.username?.toLowerCase() === "you")
  );

  const profileHref =
    isOwner ||
    artist?.id === "current_user" ||
    artist?.username?.toLowerCase() === "you" ||
    (currentUser &&
      (artist?.id === currentUser.id ||
        artist?.username?.toLowerCase() === currentUser.username?.toLowerCase()))
      ? "/profile"
      : `/artist/${artist?.username || artist?.id || ""}`;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16">
      {/* 1. Top Back Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="h-10 px-3.5 rounded-[10px] bg-surface border-2 border-espresso text-espresso shadow-hard-sm btn-hard inline-flex items-center gap-2 font-body font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4 stroke-espresso" strokeWidth={2.5} />
          <span>Back to Gallery</span>
        </Link>
      </div>

      {/* 2. Uncropped Artwork Presentation (16px radius, zero border, zero shadow) */}
      <ArtworkImageDisplay artwork={artwork} />

      {/* 3. Primary Info & Actions */}
      <div className="space-y-6">
        <div>
          {artwork.categories && artwork.categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
              {artwork.categories.map((catId) => (
                <span
                  key={catId}
                  className="px-2.5 py-0.5 rounded-full bg-sand border-[1.5px] border-espresso text-espresso text-[11px] font-bold uppercase tracking-wider"
                >
                  {getCategoryLabel(catId)}
                </span>
              ))}
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-espresso">
            {artwork.title}
          </h1>
          {artwork.caption && (
            <p className="text-sm sm:text-base text-bark mt-1.5 italic font-serif">
              &ldquo;{artwork.caption}&rdquo;
            </p>
          )}
        </div>

        {/* Action Bar & Share Banner */}
        <ArtworkDetailActions
          artwork={artwork}
          showShareBanner={true}
          isOwner={isOwner}
          isMaster={Boolean(currentUser?.is_master)}
        />

        {/* 4. Artist Profile Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-[16px] bg-surface border-2 border-espresso shadow-hard-sm gap-4 select-none">
          <Link
            href={profileHref}
            className="flex items-center gap-3.5 group min-w-0"
          >
            <ArtistAvatar artist={artist} size="lg" />
            <div className="min-w-0">
              <h2 className="font-display font-bold text-espresso group-hover:underline text-base sm:text-lg truncate">
                {artist.display_name}
              </h2>
              <p className="text-xs text-bark flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-bark flex-shrink-0" />
                <span className="truncate">{artist.location || "Kerala, India"}</span>
              </p>
            </div>
          </Link>

          <Link
            href={profileHref}
            className="h-10 px-4 rounded-[10px] bg-surface border-2 border-espresso text-espresso font-body font-bold text-xs shadow-hard-sm btn-hard flex items-center justify-center gap-1.5 flex-shrink-0"
          >
            <span>{isOwner ? "View your profile" : "Visit profile"}</span>
            <span className="text-xs">↗</span>
          </Link>
        </div>

        {/* 5. "About this artwork" Story Block (Newsreader on Sand-tint with 2px left border) */}
        {artwork.description && (
          <section className="p-6 sm:p-7 rounded-[12px] bg-sand-tint border-2 border-espresso border-l-4 border-l-espresso shadow-hard-sm space-y-3">
            <div className="flex items-center gap-2">
              <StoryTag />
            </div>
            <blockquote className="text-base sm:text-lg text-espresso font-serif italic leading-relaxed whitespace-pre-line max-w-[60ch]">
              &ldquo;{artwork.description}&rdquo;
            </blockquote>
          </section>
        )}

        {/* Tags */}
        {artwork.hashtags && artwork.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {artwork.hashtags.map((tag, idx) => (
              <span
                key={idx}
                className="text-xs px-3 py-1 rounded-[6px] bg-surface border border-espresso text-bark font-mono"
              >
                {tag.startsWith("#") ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        )}

        {/* 6. Contact the Artist Card */}
        <ContactArtistCard artist={artist} artworkTitle={artwork.title} />

        {/* 7. More from this artist */}
        {initialMoreArtworks && initialMoreArtworks.length > 0 && (
          <div className="pt-8 border-t-2 border-espresso/20 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-espresso">
                More by {artist.display_name}
              </h3>
              <span className="font-mono text-[11px] text-bark uppercase">
                {initialMoreArtworks.length} WORKS
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {initialMoreArtworks.map((item) => (
                <Link
                  key={item.id}
                  href={`/artwork/${item.id}`}
                  className="group relative aspect-square rounded-[16px] overflow-hidden bg-mist"
                >
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 50vw, 250px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
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
