"use client";

import { useSyncExternalStore } from "react";
import Image from "next/image";
import { Artwork } from "@/types/art";

interface ArtworkImageDisplayProps {
  artwork: Artwork;
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

export function ArtworkImageDisplay({ artwork }: ArtworkImageDisplayProps) {
  const browserArtworksRaw = useSyncExternalStore(
    subscribeStorage,
    getClientStorageSnapshot,
    getServerStorageSnapshot
  );

  let imageUrl = artwork.image_url;
  if (browserArtworksRaw) {
    try {
      const list = JSON.parse(browserArtworksRaw) as Artwork[];
      const match = list.find((a) => a.id === artwork.id);
      if (match && match.image_url) {
        imageUrl = match.image_url;
      }
    } catch {
      // ignore
    }
  }

  return (
    <div className="w-full bg-surface border border-line rounded-3xl overflow-hidden p-3 sm:p-6 shadow-sm flex items-center justify-center">
      <Image
        src={imageUrl}
        alt={artwork.title}
        width={artwork.width || 800}
        height={artwork.height || 800}
        sizes="(max-width: 768px) 100vw, 800px"
        className="max-h-[70vh] w-auto h-auto rounded-2xl object-contain shadow-sm"
        priority
      />
    </div>
  );
}
