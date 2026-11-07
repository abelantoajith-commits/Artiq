"use client";

import Image from "next/image";
import { useState } from "react";
import { Heart, Bookmark, Share2, BookOpen } from "lucide-react";
import { Artwork } from "@/types/art";

interface ArtworkCardProps {
  artwork: Artwork;
  onOpenDetail?: (artwork: Artwork) => void;
  priority?: boolean;
}

export function ArtworkCard({ artwork, onOpenDetail, priority = false }: ArtworkCardProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(artwork.likes_count ?? 0);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked((prev) => {
      const next = !prev;
      setLikeCount((c) => (next ? c + 1 : c - 1));
      return next;
    });
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaved((prev) => !prev);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareData = {
      title: `${artwork.title} by ${artwork.artist.display_name}`,
      text: artwork.description,
      url: typeof window !== "undefined" ? window.location.href : "",
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled or share failed, ignore
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareData.url);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <article
      onClick={() => onOpenDetail && onOpenDetail(artwork)}
      className="group bg-surface rounded-2xl border border-line overflow-hidden cursor-pointer transition-all hover:shadow-md focus-within:ring-2 focus-within:ring-primary flex flex-col mb-4"
    >
      {/* Artwork Image Container — Natural aspect ratio preserved (never cropped) */}
      <div className="relative w-full bg-canvas/60 overflow-hidden">
        <Image
          src={artwork.image_url}
          alt={`${artwork.title} by ${artwork.artist.display_name}. ${artwork.description}`}
          width={artwork.width}
          height={artwork.height}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="w-full h-auto object-cover rounded-t-2xl transition-transform duration-300 group-hover:scale-[1.02]"
          priority={priority}
        />

        {/* Story Indicator Badge (Turmeric means Story) */}
        {artwork.description && (
          <div
            className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-surface/90 backdrop-blur-md border border-story/30 text-ink text-[11px] font-medium flex items-center gap-1 shadow-sm"
            title="Artist's story included"
          >
            <BookOpen className="w-3 h-3 text-story" />
            <span>Story</span>
          </div>
        )}

        {/* Quick Actions (Floating on hover / focus) */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={handleLike}
            aria-label={liked ? `Unlike artwork (${likeCount})` : `Like artwork (${likeCount})`}
            className={`p-2 rounded-full backdrop-blur-md transition-colors ${
              liked
                ? "bg-danger text-white"
                : "bg-surface/90 text-ink hover:text-danger hover:bg-surface"
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? "fill-current" : ""}`} />
          </button>
          <button
            type="button"
            onClick={handleSave}
            aria-label={saved ? "Remove from saved" : "Save artwork"}
            className={`p-2 rounded-full backdrop-blur-md transition-colors ${
              saved
                ? "bg-primary text-white"
                : "bg-surface/90 text-ink hover:text-primary hover:bg-surface"
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>

      {/* Card Metadata */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-2">
        <div>
          <h3 className="font-semibold text-sm sm:text-base text-ink tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
            {artwork.title}
          </h3>
          <p className="text-xs text-ink-soft mt-0.5 line-clamp-2 leading-relaxed">
            {artwork.description}
          </p>
        </div>

        {/* Artist Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-line/60">
          <div className="flex items-center gap-2 min-w-0">
            <Image
              src={artwork.artist.avatar_url}
              alt={artwork.artist.display_name}
              width={24}
              height={24}
              className="w-6 h-6 rounded-full object-cover flex-shrink-0"
            />
            <span className="text-xs font-medium text-ink truncate">
              {artwork.artist.display_name}
            </span>
          </div>

          <button
            type="button"
            onClick={handleShare}
            aria-label="Share artwork"
            className="p-1.5 rounded-lg text-ink-soft hover:text-ink hover:bg-canvas transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
