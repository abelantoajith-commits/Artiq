"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Artwork } from "@/types/art";
import { ArtistAvatar } from "@/components/artiq/ArtistAvatar";

interface ArtworkCardProps {
  artwork: Artwork;
  onOpenDetail?: (artwork: Artwork) => void;
  priority?: boolean;
  currentUserId?: string;
  currentUsername?: string;
  index?: number;
}

export function ArtworkCard({
  artwork,
  onOpenDetail,
  priority = false,
  currentUserId,
  currentUsername,
  index = 0,
}: ArtworkCardProps) {
  const [imageError, setImageError] = useState(false);

  const isOwnPost = Boolean(
    artwork.artist?.id === "current_user" ||
    artwork.artist?.username?.toLowerCase() === "you" ||
    (currentUserId &&
      (artwork.artist_id === currentUserId ||
        artwork.artist?.id === currentUserId)) ||
    (currentUsername &&
      artwork.artist?.username?.toLowerCase() === currentUsername.toLowerCase())
  );

  const profileUrl = isOwnPost
    ? "/profile"
    : artwork.artist?.username && artwork.artist.username.toLowerCase() !== "you"
      ? `/artist/${artwork.artist.username}`
      : artwork.artist?.id && artwork.artist.id !== "current_user"
        ? `/artist/${artwork.artist.id}`
        : "/profile";

  // Aspect ratio calculation from dimensions to prevent layout shift
  const aspectRatio =
    artwork.width && artwork.height ? artwork.width / artwork.height : 3 / 4;

  return (
    <article
      onClick={() => onOpenDetail?.(artwork)}
      className="stagger-card bg-transparent cursor-pointer group flex flex-col mb-4 select-none focus-within:outline-none"
      style={{ animationDelay: `${Math.min(index * 40, 320)}ms` }}
    >
      {/* 1. Uncropped Artwork: 16px Radius, 0px Border, 0px Shadow */}
      <div
        className="relative w-full rounded-[16px] overflow-hidden bg-mist"
        style={{ aspectRatio: `${aspectRatio}` }}
      >
        {artwork.image_url && !imageError ? (
          <Image
            src={artwork.image_url}
            alt={artwork.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={priority}
            unoptimized={artwork.image_url.startsWith("data:")}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-mist text-bark font-mono text-xs">
            Artwork
          </div>
        )}
      </div>

      {/* 2. Metadata: Title (Figtree 13px Semibold) + 20px Avatar + Artist Name */}
      <div className="mt-2 space-y-1">
        <h3 className="font-body font-semibold text-[13px] leading-tight text-espresso line-clamp-1 group-hover:underline">
          {artwork.title}
        </h3>

        <div className="flex items-center gap-1.5 min-w-0">
          <Link
            href={profileUrl}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 min-w-0 group/author hover:opacity-80 transition-opacity"
            title={`View ${isOwnPost ? "your" : artwork.artist?.display_name || "Artist"}'s profile`}
          >
            <ArtistAvatar artist={artwork.artist} size="xs" />
            <span className="font-body text-[12px] text-bark truncate">
              {artwork.artist?.display_name || "Artist"}
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}
