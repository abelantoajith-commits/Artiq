"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Heart, Bookmark, Share2, BookOpen } from "lucide-react";
import { Artwork } from "@/types/art";
import { ShareModal } from "@/components/artiq/ShareModal";
import { ArtistAvatar } from "@/components/artiq/ArtistAvatar";

interface ArtworkCardProps {
  artwork: Artwork;
  onOpenDetail?: (artwork: Artwork) => void;
  priority?: boolean;
  currentUserId?: string;
  currentUsername?: string;
}

export function ArtworkCard({
  artwork,
  onOpenDetail,
  priority = false,
  currentUserId,
  currentUsername,
}: ArtworkCardProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(artwork.likes_count ?? 0);
  const [isShareOpen, setIsShareOpen] = useState(false);

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

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsShareOpen(true);
  };

  return (
    <article
      onClick={() => onOpenDetail && onOpenDetail(artwork)}
      className="group bg-surface rounded-2xl border border-line overflow-hidden cursor-pointer transition-all hover:shadow-md focus-within:ring-2 focus-within:ring-primary flex flex-col mb-4"
    >
      {/* User Profile Tab of Post (Direct link to artist profile) */}
      <div className="px-3 py-2.5 flex items-center justify-between border-b border-line/40 bg-canvas/30">
        <Link
          href={profileUrl}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-2.5 min-w-0 group/author hover:opacity-85 transition-opacity"
          title={`View ${artwork.artist?.display_name || "Artist"}'s profile`}
        >
          <ArtistAvatar artist={artwork.artist} size="sm" />
          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-ink group-hover/author:text-primary transition-colors truncate">
              {artwork.artist?.display_name || "Artist"}
            </h4>
            <p className="text-[10px] text-ink-soft truncate">
              {artwork.artist?.location || "Kerala, India"}
            </p>
          </div>
        </Link>

        <Link
          href={profileUrl}
          onClick={(e) => e.stopPropagation()}
          className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all flex items-center gap-1 flex-shrink-0"
        >
          <span>Profile</span>
          <span className="text-[9px]">↗</span>
        </Link>
      </div>

      {/* Artwork Image Container — Natural aspect ratio preserved (never cropped) */}
      <div className="relative w-full bg-canvas/60 overflow-hidden">
        <Image
          src={artwork.image_url}
          alt={`${artwork.title} by ${artwork.artist?.display_name || "Artist"}. ${artwork.description}`}
          width={artwork.width}
          height={artwork.height}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.02]"
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
          <Link
            href={profileUrl}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 min-w-0 group/footer hover:opacity-80 transition-opacity"
            title={`View ${artwork.artist?.display_name || "Artist"}'s profile`}
          >
            <ArtistAvatar artist={artwork.artist} size="xs" />
            <span className="text-xs font-medium text-ink truncate group-hover/footer:text-primary transition-colors">
              {artwork.artist?.display_name || "Artist"}
            </span>
          </Link>

          <button
            type="button"
            onClick={handleShare}
            aria-label="Share artwork"
            className="p-1.5 rounded-lg text-ink-soft hover:text-ink hover:bg-canvas transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        artwork={artwork}
      />
    </article>
  );
}
