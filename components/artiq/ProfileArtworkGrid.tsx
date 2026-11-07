"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { Artwork } from "@/types/art";
import { Grid3X3, Bookmark, Sparkles } from "lucide-react";

interface ProfileArtworkGridProps {
  initialArtworks: Artwork[];
  userId: string;
  username: string;
  savedCount?: number;
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

export function ProfileArtworkGrid({
  initialArtworks,
  userId,
  username,
  savedCount = 0,
}: ProfileArtworkGridProps) {
  const browserArtworksRaw = useSyncExternalStore(
    subscribeStorage,
    getClientStorageSnapshot,
    getServerStorageSnapshot
  );

  const artworks = useMemo(() => {
    let combined = [...initialArtworks];

    if (browserArtworksRaw) {
      try {
        const stored = JSON.parse(browserArtworksRaw) as Artwork[];
        if (Array.isArray(stored) && stored.length > 0) {
          // Filter artworks created by this user
          const userStored = stored.filter(
            (a) =>
              a.artist_id === userId ||
              a.artist?.id === userId ||
              (username &&
                a.artist?.username?.toLowerCase() === username.toLowerCase()) ||
              a.artist?.username?.toLowerCase() === "you" ||
              a.artist?.id === "current_user"
          );

          const storedMap = new Map(userStored.map((a) => [a.id, a]));
          const merged = initialArtworks.map((art) => {
            const clientVersion = storedMap.get(art.id);
            if (clientVersion && clientVersion.image_url) {
              return { ...art, image_url: clientVersion.image_url };
            }
            return art;
          });

          const initialIds = new Set(initialArtworks.map((a) => a.id));
          const newlyCreated = userStored.filter((a) => !initialIds.has(a.id));
          combined = [...newlyCreated, ...merged];
        }
      } catch {
        // ignore
      }
    }

    return combined;
  }, [initialArtworks, browserArtworksRaw, userId, username]);

  return (
    <section className="space-y-4">
      <div className="border-b-2 border-ink/15 flex gap-8 px-2">
        <div className="flex items-center gap-2 pb-3 border-b-2 border-ink text-ink font-bold text-sm font-sans">
          <Grid3X3 className="w-4 h-4 stroke-[2]" />
          <span>Artworks ({artworks.length})</span>
        </div>
        <div className="flex items-center gap-2 pb-3 text-ink-soft font-medium text-sm font-sans">
          <Bookmark className="w-4 h-4 stroke-[2]" />
          <span>Saved ({savedCount})</span>
        </div>
      </div>

      {artworks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {artworks.map((art: Artwork) => (
            <Link
              key={art.id}
              href={`/artwork/${art.id}`}
              className="relative aspect-square rounded-[16px] overflow-hidden bg-mist group cursor-pointer border-2 border-ink/20 hover:border-ink transition-all block"
            >
              <Image
                src={art.image_url}
                alt={art.title}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-espresso/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center">
                <span className="text-white text-xs font-bold line-clamp-2 drop-shadow-sm font-sans">
                  {art.title}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-ink rounded-2xl bg-surface space-y-3 p-6 shadow-hard-sm">
          <p className="text-sm font-bold text-ink">No published artworks yet</p>
          <p className="text-xs text-ink-soft max-w-xs mx-auto font-sans">
            Photograph your craft, and AI will assist with the listing details.
          </p>
          <Link
            href="/create"
            className="btn-hard inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-leaf text-ink text-xs font-bold shadow-hard min-h-[48px]"
          >
            <Sparkles className="w-4 h-4 stroke-[2]" />
            <span>Create your first artwork</span>
          </Link>
        </div>
      )}
    </section>
  );
}

