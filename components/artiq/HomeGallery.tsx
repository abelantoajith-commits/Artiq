"use client";

import { useState, useMemo } from "react";
import { Artist, Artwork, CategoryKey } from "@/types/art";
import { TopBar } from "@/components/artiq/TopBar";
import { CategoryChips } from "@/components/artiq/CategoryChips";
import { FeaturedArtistsRow } from "@/components/artiq/FeaturedArtistsRow";
import { MasonryGrid } from "@/components/artiq/MasonryGrid";
import { ArtworkDetailModal } from "@/components/artiq/ArtworkDetailModal";

interface HomeGalleryProps {
  initialArtists: Artist[];
  initialArtworks: Artwork[];
  isLiveDatabase?: boolean;
}

export function HomeGallery({
  initialArtists,
  initialArtworks,
  isLiveDatabase = false,
}: HomeGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("all");
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
  const [activeArtwork, setActiveArtwork] = useState<Artwork | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(10);

  // Filter artworks based on selected category and selected artist
  const filteredArtworks = useMemo(() => {
    return initialArtworks.filter((art) => {
      const matchesCategory =
        selectedCategory === "all" || art.categories.includes(selectedCategory);
      const matchesArtist =
        !selectedArtistId || art.artist_id === selectedArtistId;
      return matchesCategory && matchesArtist;
    });
  }, [initialArtworks, selectedCategory, selectedArtistId]);

  const displayedArtworks = useMemo(() => {
    return filteredArtworks.slice(0, visibleCount);
  }, [filteredArtworks, visibleCount]);

  const hasMore = visibleCount < filteredArtworks.length;

  return (
    <div className="space-y-6">
      {/* Top Bar with Search & Theme */}
      <TopBar />

      {/* Featured Artists Row */}
      <FeaturedArtistsRow
        artists={initialArtists}
        selectedArtistId={selectedArtistId}
        onSelectArtist={(artistId) => setSelectedArtistId(artistId)}
      />

      {/* Category Chips Strip */}
      <CategoryChips
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setVisibleCount(10);
        }}
      />

      {/* Masonry Artwork Gallery */}
      <section aria-label="Artwork Gallery">
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-xs text-ink-soft">
            Showing{" "}
            <span className="font-semibold text-ink">
              {displayedArtworks.length}
            </span>{" "}
            of {filteredArtworks.length} works
            {isLiveDatabase && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-ai/10 text-ai text-[10px] font-medium">
                Live DB
              </span>
            )}
          </p>
        </div>

        <MasonryGrid
          artworks={displayedArtworks}
          onOpenDetail={(art) => setActiveArtwork(art)}
        />

        {/* Load More Trigger */}
        {hasMore && (
          <div className="mt-8 text-center pb-6">
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + 6)}
              className="px-6 py-3 rounded-full bg-surface border border-line text-ink hover:bg-canvas text-sm font-medium transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
            >
              Load more artworks
            </button>
          </div>
        )}
      </section>

      {/* Artwork Detail View (Uncropped + Story) */}
      <ArtworkDetailModal
        artwork={activeArtwork}
        onClose={() => setActiveArtwork(null)}
      />
    </div>
  );
}

