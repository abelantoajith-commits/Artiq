"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import { Artist, Artwork } from "@/types/art";
import { TopBar } from "@/components/artiq/TopBar";
import { CategoryChips } from "@/components/artiq/CategoryChips";
import { FeaturedArtistsRow } from "@/components/artiq/FeaturedArtistsRow";
import { FeatureCard } from "@/components/artiq/FeatureCard";
import { MasonryGrid } from "@/components/artiq/MasonryGrid";
import { ArtworkDetailModal } from "@/components/artiq/ArtworkDetailModal";
import { CategoryPickerDrawer } from "@/components/artiq/CategoryPickerDrawer";
import { Button } from "@/components/ui/button";
import { getCategoryLabel } from "@/lib/categories";

interface HomeGalleryProps {
  initialArtists: Artist[];
  initialArtworks: Artwork[];
  isLiveDatabase?: boolean;
  currentUserId?: string;
  currentUsername?: string;
  isMaster?: boolean;
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

export function HomeGallery({
  initialArtists,
  initialArtworks,
  isLiveDatabase = false,
  currentUserId,
  currentUsername,
  isMaster = false,
}: HomeGalleryProps) {
  const browserArtworksRaw = useSyncExternalStore(
    subscribeStorage,
    getClientStorageSnapshot,
    getServerStorageSnapshot
  );

  const artworks = useMemo(() => {
    if (!browserArtworksRaw) return initialArtworks;
    try {
      const stored = JSON.parse(browserArtworksRaw) as Artwork[];
      if (Array.isArray(stored) && stored.length > 0) {
        const storedMap = new Map(stored.map((a) => [a.id, a]));
        const merged = initialArtworks.map((art) => {
          const clientVersion = storedMap.get(art.id);
          if (clientVersion && clientVersion.image_url) {
            return { ...art, image_url: clientVersion.image_url };
          }
          return art;
        });
        const initialIds = new Set(initialArtworks.map((a) => a.id));
        const newItems = stored.filter((a) => !initialIds.has(a.id));
        return [...newItems, ...merged];
      }
    } catch {
      // ignore
    }
    return initialArtworks;
  }, [initialArtworks, browserArtworksRaw]);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeArtwork, setActiveArtwork] = useState<Artwork | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(10);
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);

  // Combine initial artists with authors of any newly published posts in gallery
  const galleryArtists = useMemo(() => {
    const artistMap = new Map<string, Artist>();
    initialArtists.forEach((a) => {
      if (a && a.id) artistMap.set(a.id, a);
    });
    artworks.forEach((art) => {
      if (art.artist && art.artist.id && !artistMap.has(art.artist.id)) {
        artistMap.set(art.artist.id, art.artist);
      }
    });
    return Array.from(artistMap.values());
  }, [initialArtists, artworks]);

  // Filter artworks based on category, artist, and full search
  const filteredArtworks = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return artworks.filter((art) => {
      // 1. Category match
      const matchesCategory =
        selectedCategory === "all" || art.categories.includes(selectedCategory);

      // 2. Artist match
      const matchesArtist =
        !selectedArtistId || art.artist_id === selectedArtistId;

      if (!matchesCategory || !matchesArtist) return false;

      // 3. Search query match
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
      const matchesArtistName = art.artist?.display_name?.toLowerCase().includes(q);
      const matchesSpecialities = Boolean(
        art.artist?.specialities &&
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
  }, [artworks, selectedCategory, selectedArtistId, searchQuery]);

  // Featured artwork: first prominent traditional or highlighted piece
  const featuredArtwork = useMemo(() => {
    if (artworks.length === 0) return null;
    return (
      artworks.find(
        (a) =>
          a.caption ||
          a.categories.includes("traditional") ||
          a.categories.includes("kerala-mural")
      ) || artworks[0]
    );
  }, [artworks]);

  const displayedArtworks = useMemo(() => {
    return filteredArtworks.slice(0, visibleCount);
  }, [filteredArtworks, visibleCount]);

  const hasMore = visibleCount < filteredArtworks.length;

  return (
    <div className="space-y-5">
      {/* 1. Header: Wordmark + 44px Notification Stamp + Soft Search Pill */}
      <TopBar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setVisibleCount(10);
        }}
      />

      {/* 2. Horizontally Scrollable Category Chips */}
      <CategoryChips
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setVisibleCount(10);
        }}
        onOpenMore={() => setIsCategoryDrawerOpen(true)}
      />

      {/* 3. "Artists to meet" Avatar Row */}
      <FeaturedArtistsRow
        artists={galleryArtists}
        selectedArtistId={selectedArtistId}
        currentUserId={currentUserId}
        currentUsername={currentUsername}
        onSelectArtist={(artistId) => {
          setSelectedArtistId(artistId);
          setVisibleCount(10);
        }}
      />

      {/* 4. ONE Asymmetric Feature Card (Only if not actively filtering or searching) */}
      {!searchQuery && selectedCategory === "all" && !selectedArtistId && featuredArtwork && (
        <section aria-label="Featured Artwork" className="pt-1">
          <FeatureCard
            artwork={featuredArtwork}
            onOpenDetail={(art) => setActiveArtwork(art)}
          />
        </section>
      )}

      {/* 5. Masonry Grid: "Recent works" */}
      <section aria-label="Artwork Gallery" className="pt-2">
        <div className="flex items-center justify-between mb-3 px-0.5">
          <h2 className="font-display font-bold text-lg text-espresso">Recent works</h2>
          <span className="font-mono text-[11px] text-bark uppercase">
            {displayedArtworks.length} ARTWORKS
            {searchQuery && ` • MATCHING "${searchQuery}"`}
            {isLiveDatabase && " • LIVE DB"}
          </span>
        </div>

        <MasonryGrid
          artworks={displayedArtworks}
          onOpenDetail={(art) => setActiveArtwork(art)}
          currentUserId={currentUserId}
          currentUsername={currentUsername}
        />

        {/* Load More Button */}
        {hasMore && (
          <div className="mt-8 text-center pb-6">
            <Button
              variant="secondary"
              onClick={() => setVisibleCount((prev) => prev + 6)}
              className="px-6 shadow-hard-sm"
            >
              Load more artworks
            </Button>
          </div>
        )}
      </section>

      {/* Category Picker Drawer (via "+" Chip) */}
      <CategoryPickerDrawer
        isOpen={isCategoryDrawerOpen}
        onClose={() => setIsCategoryDrawerOpen(false)}
        selectedCategories={selectedCategory === "all" ? [] : [selectedCategory]}
        onToggleCategory={(catId) => {
          setSelectedCategory(catId === selectedCategory ? "all" : catId);
          setIsCategoryDrawerOpen(false);
          setVisibleCount(10);
        }}
      />

      {/* Artwork Detail Modal */}
      <ArtworkDetailModal
        artwork={activeArtwork}
        onClose={() => setActiveArtwork(null)}
        currentUserId={currentUserId}
        currentUsername={currentUsername}
        isMaster={isMaster}
      />
    </div>
  );
}
