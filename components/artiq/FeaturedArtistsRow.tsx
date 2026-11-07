"use client";

import Link from "next/link";
import { Artist } from "@/types/art";
import { ArtistAvatar } from "@/components/artiq/ArtistAvatar";

interface FeaturedArtistsRowProps {
  artists: Artist[];
  selectedArtistId?: string | null;
  onSelectArtist?: (artistId: string | null) => void;
}

export function FeaturedArtistsRow({
  artists,
  selectedArtistId,
  onSelectArtist,
}: FeaturedArtistsRowProps) {
  return (
    <section aria-labelledby="featured-artists-heading" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2
          id="featured-artists-heading"
          className="text-xs font-semibold uppercase tracking-wider text-ink-soft"
        >
          Artists in Gallery
        </h2>
        {selectedArtistId && onSelectArtist && (
          <button
            type="button"
            onClick={() => onSelectArtist(null)}
            className="text-xs font-medium text-primary hover:underline"
          >
            Show All Works
          </button>
        )}
      </div>

      <div className="overflow-x-auto no-scrollbar -mx-4 px-4 sm:-mx-6 sm:px-6 flex items-start gap-4 py-1">
        {artists.map((artist) => {
          const isSelected = selectedArtistId === artist.id;
          const profileHref =
            artist.id === "current_user" || artist.username === "you"
              ? "/profile"
              : `/artist/${artist.username || artist.id}`;

          return (
            <div
              key={artist.id}
              className="flex flex-col items-center flex-shrink-0 group relative"
            >
              <Link
                href={profileHref}
                title={`Visit ${artist.display_name}'s profile`}
                className={`flex flex-col items-center focus:outline-none focus:ring-2 focus:ring-primary rounded-2xl p-1.5 transition-all ${
                  isSelected ? "scale-105" : "hover:scale-[1.03]"
                }`}
              >
                <div
                  className={`relative rounded-full p-1 transition-all ${
                    isSelected
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-canvas shadow-md"
                      : "ring-1 ring-line group-hover:ring-primary/60 group-hover:shadow-sm"
                  }`}
                >
                  <ArtistAvatar artist={artist} size="xl" />
                </div>
                <span className="text-xs font-semibold text-ink mt-1.5 text-center line-clamp-1 max-w-[84px] group-hover:text-primary transition-colors">
                  {artist.display_name}
                </span>
                <span className="text-[10px] text-ink-soft text-center line-clamp-1 max-w-[84px]">
                  {artist.specialities?.[0] || artist.location || "Artist"}
                </span>
                <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-primary/80 group-hover:text-primary mt-0.5">
                  <span>Profile</span>
                  <span>↗</span>
                </span>
              </Link>

              {/* Optional Quick Filter Toggle */}
              {onSelectArtist && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectArtist(isSelected ? null : artist.id);
                  }}
                  title={isSelected ? "Show all artists" : `Filter works by ${artist.display_name}`}
                  className={`mt-1 px-2 py-0.5 rounded-full text-[9px] font-medium transition-all ${
                    isSelected
                      ? "bg-primary text-white"
                      : "bg-surface border border-line text-ink-soft hover:text-ink hover:border-primary/40"
                  }`}
                >
                  {isSelected ? "Filtering ✓" : "Filter"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
