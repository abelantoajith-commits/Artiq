"use client";

import { useEffect, useState } from "react";
import { Artwork } from "@/types/art";
import { ArtworkCard } from "./ArtworkCard";

interface MasonryGridProps {
  artworks: Artwork[];
  onOpenDetail?: (artwork: Artwork) => void;
  isLoading?: boolean;
}

export function MasonryGrid({
  artworks,
  onOpenDetail,
  isLoading = false,
}: MasonryGridProps) {
  // Determine column count based on window width: 2 for mobile (390px), 3 for tablet, 4 for desktop
  const [columnCount, setColumnCount] = useState<number>(2);

  useEffect(() => {
    function updateColumns() {
      const width = window.innerWidth;
      if (width >= 1280) {
        setColumnCount(4);
      } else if (width >= 768) {
        setColumnCount(3);
      } else {
        setColumnCount(2);
      }
    }

    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-line bg-surface p-4 animate-pulse space-y-3"
          >
            <div className="w-full h-48 bg-canvas rounded-xl" />
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

  // Distribute items across columns balancing column heights
  const columns: Artwork[][] = Array.from({ length: columnCount }, () => []);
  const columnHeights = new Array(columnCount).fill(0);

  artworks.forEach((art) => {
    // Find shortest column
    let shortestIndex = 0;
    for (let i = 1; i < columnCount; i++) {
      if (columnHeights[i] < columnHeights[shortestIndex]) {
        shortestIndex = i;
      }
    }
    columns[shortestIndex].push(art);
    // Aspect ratio representation of height
    const normalizedHeight = art.height / art.width;
    columnHeights[shortestIndex] += normalizedHeight;
  });

  return (
    <div className="flex gap-3 sm:gap-4 w-full items-start">
      {columns.map((colArtworks, colIndex) => (
        <div key={colIndex} className="flex-1 flex flex-col">
          {colArtworks.map((artwork) => (
            <ArtworkCard
              key={artwork.id}
              artwork={artwork}
              onOpenDetail={onOpenDetail}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
