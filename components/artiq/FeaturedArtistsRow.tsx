"use client";

import Image from "next/image";
import { Artist } from "@/types/art";

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
          Featured Artists
        </h2>
        {selectedArtistId && onSelectArtist && (
          <button
            type="button"
            onClick={() => onSelectArtist(null)}
            className="text-xs font-medium text-primary hover:underline"
          >
            Show All Artists
          </button>
        )}
      </div>

      <div className="overflow-x-auto no-scrollbar -mx-4 px-4 sm:-mx-6 sm:px-6 flex items-start gap-4 py-1">
        {artists.map((artist) => {
          const isSelected = selectedArtistId === artist.id;
          return (
            <button
              key={artist.id}
              type="button"
              onClick={() => onSelectArtist && onSelectArtist(isSelected ? null : artist.id)}
              className={`flex flex-col items-center flex-shrink-0 group focus:outline-none focus:ring-2 focus:ring-primary rounded-xl p-1 transition-transform ${
                isSelected ? "scale-105" : ""
              }`}
            >
              <div
                className={`relative w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden p-0.5 transition-all ${
                  isSelected
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-canvas"
                    : "ring-1 ring-line group-hover:ring-primary/50"
                }`}
              >
                <Image
                  src={artist.avatar_url}
                  alt={artist.display_name}
                  width={72}
                  height={72}
                  className="rounded-full object-cover w-full h-full"
                />
              </div>
              <span className="text-xs font-medium text-ink mt-1.5 text-center line-clamp-1 max-w-[80px]">
                {artist.display_name}
              </span>
              <span className="text-[10px] text-ink-soft text-center line-clamp-1 max-w-[80px]">
                {artist.specialities[0]}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
