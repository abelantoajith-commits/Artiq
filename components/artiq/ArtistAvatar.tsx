"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "cn";

import { Artist } from "@/types/art";

export interface ArtistAvatarProps {
  artist?: Partial<Artist> | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  ringOverride?: "leaf" | "sand" | "sprout" | "clay";
  emojiOverride?: string;
}

export const POPULAR_CRAFT_EMOJIS = [
  { emoji: "🎨", label: "Mural & Canvas Painter" },
  { emoji: "🖌️", label: "Fine Brushwork & Fresco" },
  { emoji: "🥻", label: "Kasavu & Handloom Weaver" },
  { emoji: "🧵", label: "Textile & Embroidery Artisan" },
  { emoji: "🪔", label: "Bronze Casting & Sacred Metal" },
  { emoji: "🗿", label: "Stone & Metal Sculptor" },
  { emoji: "🦚", label: "Madhubani & Folk Artist" },
  { emoji: "🏺", label: "Terracotta & Pottery Master" },
  { emoji: "🪵", label: "Woodcraft & Temple Carver" },
  { emoji: "🪷", label: "Traditional Lotus & Floral Motif" },
  { emoji: "🎭", label: "Kathakali & Theatre Art" },
  { emoji: "🧑‍🎨", label: "Modern Traditionalist" },
] as const;

export function isEmoji(str?: string | null): boolean {
  if (!str) return false;
  return /\p{Extended_Pictographic}/u.test(str.trim());
}

export function getArtistEmoji(
  artist?: Partial<Artist> | null
): string {
  if (!artist) return "🎨";
  if (artist.avatar_url && isEmoji(artist.avatar_url)) return artist.avatar_url.trim();
  return "🎨";
}

export function getAvatarRing(idOrName?: string | null): {
  ringClass: string;
  borderClass: string;
  name: "leaf" | "sand" | "sprout" | "clay";
} {
  if (!idOrName) return { ringClass: "bg-leaf", borderClass: "border-espresso", name: "leaf" };
  let hash = 0;
  for (let i = 0; i < idOrName.length; i++) {
    hash = (hash << 5) - hash + idOrName.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % 4;
  switch (index) {
    case 0:
      return { ringClass: "bg-leaf", borderClass: "border-espresso", name: "leaf" };
    case 1:
      return { ringClass: "bg-sand", borderClass: "border-espresso", name: "sand" };
    case 2:
      return { ringClass: "bg-sprout", borderClass: "border-moss", name: "sprout" };
    case 3:
      return { ringClass: "bg-clay", borderClass: "border-espresso", name: "clay" };
    default:
      return { ringClass: "bg-leaf", borderClass: "border-espresso", name: "leaf" };
  }
}

function getInitials(name?: string | null): string {
  if (!name) return "A";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function ArtistAvatar({
  artist,
  size = "md",
  className,
  ringOverride,
}: ArtistAvatarProps) {
  const [imageError, setImageError] = useState(false);

  const identifier = artist?.id || artist?.username || artist?.display_name || "artist";
  const ringInfo = ringOverride
    ? {
        ringClass: `bg-${ringOverride}`,
        borderClass: ringOverride === "sprout" ? "border-moss" : "border-espresso",
        name: ringOverride,
      }
    : getAvatarRing(identifier);

  const sizeClasses = {
    xs: "w-5 h-5 min-w-[20px] min-h-[20px] p-[1px] border text-[9px]",
    sm: "w-7 h-7 min-w-[28px] min-h-[28px] p-[1.5px] border-[1.5px] text-[11px]",
    md: "w-10 h-10 min-w-[40px] min-h-[40px] p-[2px] border-2 text-xs",
    lg: "w-14 h-14 min-w-[56px] min-h-[56px] p-[2.5px] border-2 text-sm",
    xl: "w-20 h-20 min-w-[80px] min-h-[80px] p-[3px] border-2 text-lg",
    "2xl": "w-24 h-24 min-w-[96px] min-h-[96px] p-[3.5px] border-[3px] text-xl",
  }[size];

  const hasPhotoUrl =
    artist?.avatar_url &&
    (artist.avatar_url.startsWith("http://") ||
      artist.avatar_url.startsWith("https://") ||
      artist.avatar_url.startsWith("/") ||
      artist.avatar_url.startsWith("data:"));

  const initials = getInitials(artist?.display_name || artist?.username);

  return (
    <div
      className={cn(
        "relative rounded-full flex-shrink-0 flex items-center justify-center select-none overflow-hidden",
        ringInfo.ringClass,
        ringInfo.borderClass,
        sizeClasses,
        className
      )}
      title={artist?.display_name || "Artist"}
    >
      {hasPhotoUrl && !imageError ? (
        <div className="relative w-full h-full rounded-full overflow-hidden bg-mist">
          <Image
            src={artist.avatar_url!}
            alt={artist.display_name || "Artist"}
            fill
            sizes="96px"
            className="object-cover rounded-full"
            onError={() => setImageError(true)}
            unoptimized={artist.avatar_url!.startsWith("data:")}
          />
        </div>
      ) : (
        <div className="w-full h-full rounded-full bg-surface/90 flex items-center justify-center font-display font-extrabold text-espresso">
          <span>{initials}</span>
        </div>
      )}
    </div>
  );
}
