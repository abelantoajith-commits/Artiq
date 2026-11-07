"use client";

import Link from "next/link";
import { Artist } from "@/types/art";
import { ArtistAvatar } from "@/components/artiq/ArtistAvatar";

interface FeaturedArtistsRowProps {
  artists: Artist[];
  selectedArtistId?: string | null;
  currentUserId?: string;
  currentUsername?: string;
  onSelectArtist?: (artistId: string | null) => void;
}

export function FeaturedArtistsRow({
  artists,
  selectedArtistId,
  currentUserId,
  currentUsername,
  onSelectArtist,
}: FeaturedArtistsRowProps) {
  return (
    <section aria-labelledby="artists-to-meet-heading" className="space-y-2 py-1 select-none">
      {/* Header Row: "Artists to meet" + "KERALA & BEYOND" */}
      <div className="flex items-center justify-between">
        <h2
          id="artists-to-meet-heading"
          className="font-display font-bold text-lg text-espresso"
        >
          Artists to meet
        </h2>
        <div className="flex items-center gap-2">
          {selectedArtistId && onSelectArtist && (
            <button
              type="button"
              onClick={() => onSelectArtist(null)}
              className="text-xs font-bold text-espresso hover:underline mr-2"
            >
              Show all
            </button>
          )}
          <span className="font-mono text-[11px] text-bark tracking-wider uppercase">
            KERALA &amp; BEYOND
          </span>
        </div>
      </div>

      {/* Horizontal Avatar Row: 56px Avatars with Colored Rings */}
      <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar -mx-4 px-4 sm:-mx-6 sm:px-6 py-1">
        {artists.map((artist) => {
          const isSelected = selectedArtistId === artist.id;
          const isOwn =
            artist.id === "current_user" ||
            artist.username?.toLowerCase() === "you" ||
            (currentUserId && artist.id === currentUserId) ||
            (currentUsername &&
              artist.username?.toLowerCase() === currentUsername.toLowerCase());

          const profileHref = isOwn
            ? "/profile"
            : `/artist/${artist.username || artist.id}`;

          // Format short first name for clean mobile avatar label
          const firstName = artist.display_name?.split(" ")[0] || "Artist";

          return (
            <div
              key={artist.id}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
            >
              <Link
                href={profileHref}
                title={`Visit ${artist.display_name}'s profile`}
                className={`focus:outline-none focus:ring-2 focus:ring-forest rounded-full p-0.5 transition-transform duration-200 ${
                  isSelected ? "scale-105" : "group-hover:scale-105"
                }`}
              >
                <ArtistAvatar artist={artist} size="lg" />
              </Link>
              <span className="font-body font-semibold text-xs text-espresso text-center truncate max-w-[64px]">
                {firstName}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
