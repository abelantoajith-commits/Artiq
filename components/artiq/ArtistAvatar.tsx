"use client";

import React from "react";

export interface ArtistAvatarProps {
  artist?: {
    display_name?: string;
    username?: string;
    avatar_url?: string;
    bio?: string;
    specialities?: string[];
  } | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
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
  const trimmed = str.trim();
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("data:")
  ) {
    return false;
  }
  return /\p{Extended_Pictographic}/u.test(trimmed);
}

export function getArtistEmoji(
  artist?: {
    display_name?: string;
    username?: string;
    avatar_url?: string;
    bio?: string;
    specialities?: string[];
  } | null
): string {
  if (!artist) return "🎨";

  // 1. If avatar_url is already a valid emoji, respect it
  if (artist.avatar_url && isEmoji(artist.avatar_url)) {
    return artist.avatar_url.trim();
  }

  // 2. Check for signature seed / demo artists
  const uname = (artist.username || "").toLowerCase();
  const dname = (artist.display_name || "").toLowerCase();

  if (uname.includes("radhika") || uname.includes("raghavan") || dname.includes("radhika") || dname.includes("raghavan")) {
    return "🎨";
  }
  if (uname.includes("devaki") || uname.includes("kasavu") || dname.includes("devaki")) {
    return "🥻";
  }
  if (uname.includes("anoop") || uname.includes("sculptor") || dname.includes("anoop")) {
    return "🪔";
  }
  if (uname.includes("lakshmi") || uname.includes("madhubani") || dname.includes("lakshmi")) {
    return "🦚";
  }
  if (uname.includes("vineeth") || uname.includes("terracotta") || dname.includes("vineeth")) {
    return "🏺";
  }

  // 3. Match based on craft specialities and bio keywords
  const text = `${artist.display_name || ""} ${artist.bio || ""} ${(artist.specialities || []).join(" ")}`.toLowerCase();

  if (text.includes("mural") || text.includes("fresco") || text.includes("pigment") || text.includes("paint")) {
    return "🎨";
  }
  if (
    text.includes("kasavu") ||
    text.includes("loom") ||
    text.includes("weav") ||
    text.includes("saree") ||
    text.includes("textile") ||
    text.includes("cotton") ||
    text.includes("zari")
  ) {
    return "🥻";
  }
  if (
    text.includes("bronze") ||
    text.includes("mirror") ||
    text.includes("kannadi") ||
    text.includes("bell metal") ||
    text.includes("metal") ||
    text.includes("cast")
  ) {
    return "🪔";
  }
  if (text.includes("madhubani") || text.includes("mithila") || text.includes("peacock") || text.includes("folk")) {
    return "🦚";
  }
  if (text.includes("terracotta") || text.includes("clay") || text.includes("potter") || text.includes("ceramic")) {
    return "🏺";
  }
  if (text.includes("wood") || text.includes("carv")) {
    return "🪵";
  }
  if (text.includes("lotus") || text.includes("temple")) {
    return "🪷";
  }
  if (text.includes("theatre") || text.includes("kathakali") || text.includes("mask")) {
    return "🎭";
  }

  return "🎨";
}

export function getEmojiStyle(emoji: string): string {
  switch (emoji) {
    case "🎨":
    case "🖌️":
      return "bg-amber-100 dark:bg-amber-950/70 border-amber-300/60 dark:border-amber-700/50 text-amber-900";
    case "🥻":
    case "🧵":
    case "🧶":
      return "bg-rose-100 dark:bg-rose-950/70 border-rose-300/60 dark:border-rose-700/50 text-rose-900";
    case "🪔":
    case "🗿":
    case "✨":
      return "bg-yellow-100 dark:bg-yellow-950/70 border-yellow-400/60 dark:border-yellow-700/50 text-yellow-900";
    case "🦚":
    case "🌺":
      return "bg-teal-100 dark:bg-teal-950/70 border-teal-300/60 dark:border-teal-700/50 text-teal-900";
    case "🏺":
      return "bg-orange-100 dark:bg-orange-950/70 border-orange-300/60 dark:border-orange-700/50 text-orange-900";
    case "🪵":
      return "bg-stone-200 dark:bg-stone-800 border-stone-400/60 dark:border-stone-600/50 text-stone-900";
    case "🪷":
      return "bg-pink-100 dark:bg-pink-950/70 border-pink-300/60 dark:border-pink-700/50 text-pink-900";
    case "🎭":
      return "bg-purple-100 dark:bg-purple-950/70 border-purple-300/60 dark:border-purple-700/50 text-purple-900";
    default:
      return "bg-primary/10 border-primary/25 text-primary";
  }
}

export function ArtistAvatar({
  artist,
  size = "md",
  className = "",
  emojiOverride,
}: ArtistAvatarProps) {
  const emoji = emojiOverride || getArtistEmoji(artist);
  const colorStyle = getEmojiStyle(emoji);

  const sizeClasses = {
    xs: "w-6 h-6 text-xs min-w-[24px] rounded-full border",
    sm: "w-8 h-8 text-sm min-w-[32px] rounded-full border",
    md: "w-10 h-10 text-lg min-w-[40px] rounded-full border",
    lg: "w-12 h-12 text-2xl min-w-[48px] rounded-full border-2",
    xl: "w-16 h-16 sm:w-18 sm:h-18 text-3xl sm:text-4xl min-w-[64px] rounded-full border-2 shadow-xs",
    "2xl": "w-20 h-20 sm:w-24 sm:h-24 text-4xl sm:text-5xl min-w-[80px] rounded-full border-2 shadow-sm",
  }[size];

  return (
    <div
      role="img"
      aria-label={`${artist?.display_name || "Artist"} profile picture (${emoji})`}
      className={`inline-flex items-center justify-center select-none flex-shrink-0 transition-transform ${sizeClasses} ${colorStyle} ${className}`}
    >
      <span className="transform translate-y-[-1px]">{emoji}</span>
    </div>
  );
}
