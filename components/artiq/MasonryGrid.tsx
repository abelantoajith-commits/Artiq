"use client";

import { Artwork } from "@/types/art";
import { ArtworkCard } from "./ArtworkCard";

interface MasonryGridProps {
  artworks: Artwork[];
  onOpenDetail?: (artwork: Artwork) => void;
  isLoading?: boolean;
  currentUserId?: string;
  currentUsername?: string;
}

export function MasonryGrid({
  artworks,
  onOpenDetail,
  isLoading = false,
  currentUserId,
  currentUsername,
}: MasonryGridProps) {
  if (isLoading) {
    return (
      <div className="columns-2 md:columns-3 xl:columns-4 gap-3 sm:gap-4 w-full">
        {[240, 320, 260, 300, 280, 340].map((h, i) => (
          <div
            key={i}
            className="break-inside-avoid mb-3 sm:mb-4 rounded-2xl border border-line bg-surface p-4 animate-pulse space-y-3"
          >
            <div style={{ height: h }} className="w-full bg-canvas rounded-xl" />
            <div className="h-4 bg-canvas rounded w-3/4" />
            <div className="h-3 bg-canvas rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (artworks.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-line rounded-2xl bg-surface/50">
        <p className="text-sm font-medium text-ink">No artworks found in this category</p>
        <p className="text-xs text-ink-soft mt-1">
          Try selecting another category or clear the filter.
        </p>
      </div>
    );
  }

  // Pure CSS Columns masonry per design.md (2 mobile, 3 tablet, 4 desktop)
  // Zero layout thrashing, zero hydration re-render delay, instant 60fps paint
  return (
    <div className="columns-2 md:columns-3 xl:columns-4 gap-3 sm:gap-4 w-full">
      {artworks.map((artwork, idx) => (
        <div key={artwork.id} className="break-inside-avoid mb-3 sm:mb-4">
          <ArtworkCard
            artwork={artwork}
            onOpenDetail={onOpenDetail}
            priority={idx < 4}
            currentUserId={currentUserId}
            currentUsername={currentUsername}
          />
        </div>
      ))}
    </div>
  );
}

