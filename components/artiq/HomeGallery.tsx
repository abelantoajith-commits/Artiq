"use client";

import { useState, useMemo } from "react";
import { Artist, Artwork } from "@/types/art";
import { TopBar } from "@/components/artiq/TopBar";
import { CategoryChips } from "@/components/artiq/CategoryChips";
import { FeaturedArtistsRow } from "@/components/artiq/FeaturedArtistsRow";
import { MasonryGrid } from "@/components/artiq/MasonryGrid";
import { ArtworkDetailModal } from "@/components/artiq/ArtworkDetailModal";
import { getCategoryLabel } from "@/lib/categories";

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
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeArtwork, setActiveArtwork] = useState<Artwork | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(10);

  // Filter artworks based on category, artist, and full search (title, About text, categories, keywords, specialities)
  const filteredArtworks = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return initialArtworks.filter((art) => {
      // 1. Category match
      const matchesCategory =
        selectedCategory === "all" || art.categories.includes(selectedCategory);

      // 2. Artist match
      const matchesArtist =
        !selectedArtistId || art.artist_id === selectedArtistId;

      if (!matchesCategory || !matchesArtist) return false;

      // 3. Search query match across title, About text, categories, keywords, hashtags, artist specialities
      if (!q) return true;

      const matchesTitle = art.title.toLowerCase().includes(q);
      const matchesAbout = art.description.toLowerCase().includes(q);
      const matchesCaption = Boolean(art.caption && art.caption.toLowerCase().includes(q));
      const matchesCategories = art.categories.some(
        (c) => c.toLowerCase().includes(q) || getCategoryLabel(c).toLowerCase().includes(q)
      );
      const matchesKeywords = Boolean(
        art.keywords && art.keywords.some((k) => k.toLowerCase().includes(q))
      );
      const matchesHashtags = Boolean(
        art.hashtags && art.hashtags.some((h) => h.toLowerCase().includes(q))
      );
      const matchesArtistName = art.artist.display_name.toLowerCase().includes(q);
      const matchesSpecialities = Boolean(
        art.artist.specialities &&
          art.artist.specialities.some((s) => s.toLowerCase().includes(q))
      );

      return (
        matchesTitle ||
        matchesAbout ||
        matchesCaption ||
        matchesCategories ||
        matchesKeywords ||
        matchesHashtags ||
        matchesArtistName ||
        matchesSpecialities
      );
    });
  }, [initialArtworks, selectedCategory, selectedArtistId, searchQuery]);

  const displayedArtworks = useMemo(() => {
    return filteredArtworks.slice(0, visibleCount);
  }, [filteredArtworks, visibleCount]);

  const hasMore = visibleCount < filteredArtworks.length;

  return (
    <div className="space-y-6">
      {/* Top Bar with Dynamic Search Input & Theme */}
      <TopBar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setVisibleCount(10);
        }}
      />

      {/* Featured Artists Row */}
      <FeaturedArtistsRow
        artists={initialArtists}
        selectedArtistId={selectedArtistId}
        onSelectArtist={(artistId) => {
          setSelectedArtistId(artistId);
          setVisibleCount(10);
        }}
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
            {searchQuery && (
              <span className="ml-1.5 font-medium text-ink">
                matching &ldquo;{searchQuery}&rdquo;
              </span>
            )}
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
