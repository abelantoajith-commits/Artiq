"use client";

import { useState } from "react";
import { Heart, Bookmark, Share2 } from "lucide-react";
import { Artwork } from "@/types/art";
import { ShareModal } from "@/components/artiq/ShareModal";

interface ArtworkDetailActionsProps {
  artwork: Artwork;
  showShareBanner?: boolean;
}

export function ArtworkDetailActions({
  artwork,
  showShareBanner = false,
}: ArtworkDetailActionsProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(artwork.likes_count ?? 0);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleLike = () => {
    setLiked((prev) => {
      const next = !prev;
      setLikeCount((c) => (next ? c + 1 : c - 1));
      return next;
    });
  };

  const handleSave = () => {
    setSaved((prev) => !prev);
  };

  return (
    <>
      {/* Prominent Share Banner (e.g. after publishing or at top of artwork detail) */}
      {showShareBanner && (
        <div className="p-4 rounded-2xl bg-story/10 border border-story/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div>
            <p className="text-xs font-semibold text-story uppercase tracking-wider">
              Published to Gallery
            </p>
            <p className="text-sm font-medium text-ink">
              Ready to share your artwork and story with your community?
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-story text-white text-xs font-semibold hover:opacity-95 transition-opacity shadow-sm min-h-[44px]"
          >
            <Share2 className="w-4 h-4" />
            <span>Share to Social Media</span>
          </button>
        </div>
      )}

      {/* Main Action Bar */}
      <div className="flex items-center justify-between py-2 border-y border-line/60">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLike}
            aria-label={liked ? "Unlike" : "Like"}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all text-xs font-semibold min-h-[44px] ${
              liked
                ? "bg-danger text-white border-danger shadow-sm"
                : "bg-surface border-line text-ink hover:text-danger hover:border-danger/30"
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
            <span>{likeCount}</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            aria-label={saved ? "Remove from saved" : "Save to collection"}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all text-xs font-semibold min-h-[44px] ${
              saved
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-surface border-line text-ink hover:text-primary hover:border-primary/30"
            }`}
          >
            <Bookmark className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
            <span>{saved ? "Saved" : "Save"}</span>
          </button>
        </div>

        {/* Share Button */}
        <button
          type="button"
          onClick={() => setIsShareModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface border border-line text-ink hover:text-story hover:border-story/40 transition-all text-xs font-semibold shadow-sm min-h-[44px]"
        >
          <Share2 className="w-4 h-4 text-story" />
          <span>Share to</span>
        </button>
      </div>

      {/* Share Modal Dialog */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        artwork={artwork}
      />
    </>
  );
}
