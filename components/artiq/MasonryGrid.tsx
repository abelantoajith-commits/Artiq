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
            className="break-inside-avoid mb-3 sm:mb-4 rounded-[16px] bg-mist animate-pulse"
            style={{ height: h }}
          />
        ))}
      </div>
    );
  }

  if (artworks.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed border-espresso/40 rounded-[16px] bg-surface/50 p-6 space-y-2">
        <p className="font-display font-bold text-base text-espresso">
          No artworks found in this craft category
        </p>
        <p className="font-body text-xs text-bark">
          Try selecting another category or clear your search filter.
        </p>
      </div>
    );
  }

  // Pure CSS Columns masonry per design reference (2 columns mobile, 12px gap, 3-4 desktop)
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
            index={idx}
          />
        </div>
      ))}
    </div>
  );
}
