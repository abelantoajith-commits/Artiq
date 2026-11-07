"use client";

import Image from "next/image";
import { X, Heart, Bookmark, BookOpen, MapPin } from "lucide-react";
import { Artwork } from "@/types/art";
import { getCategoryLabel } from "@/lib/categories";
import { useState } from "react";

interface ArtworkDetailModalProps {
  artwork: Artwork | null;
  onClose: () => void;
}

export function ArtworkDetailModal({
  artwork,
  onClose,
}: ArtworkDetailModalProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!artwork) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-line rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-surface/80 backdrop-blur-md border border-line text-ink hover:bg-canvas transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Artwork Image Uncropped */}
        <div className="w-full bg-canvas/40 flex items-center justify-center p-4 sm:p-6 border-b border-line">
          <Image
            src={artwork.image_url}
            alt={artwork.title}
            width={artwork.width}
            height={artwork.height}
            className="max-h-[60vh] w-auto h-auto rounded-xl object-contain shadow-sm"
            priority
          />
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            {artwork.categories && artwork.categories.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                {artwork.categories.map((catId) => (
                  <span
                    key={catId}
                    className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-semibold uppercase tracking-wider"
                  >
                    {getCategoryLabel(catId)}
                  </span>
                ))}
              </div>
            )}
            <h2 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight font-sans">
              {artwork.title}
            </h2>
            {artwork.caption && (
              <p className="text-sm text-ink-soft mt-1 italic">&ldquo;{artwork.caption}&rdquo;</p>
            )}
          </div>

          {/* Artist Card */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-canvas border border-line">
            <div className="flex items-center gap-3">
              <Image
                src={artwork.artist.avatar_url}
                alt={artwork.artist.display_name}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover ring-1 ring-line"
              />
              <div>
                <h3 className="font-semibold text-ink text-sm sm:text-base">
                  {artwork.artist.display_name}
                </h3>
                <p className="text-xs text-ink-soft flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{artwork.artist.location}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLiked(!liked)}
                className={`p-2.5 rounded-full border transition-colors ${
                  liked
                    ? "bg-danger text-white border-danger"
                    : "bg-surface border-line text-ink hover:text-danger"
                }`}
                aria-label="Like"
              >
                <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
              </button>
              <button
                type="button"
                onClick={() => setSaved(!saved)}
                className={`p-2.5 rounded-full border transition-colors ${
                  saved
                    ? "bg-primary text-white border-primary"
                    : "bg-surface border-line text-ink hover:text-primary"
                }`}
                aria-label="Save"
              >
                <Bookmark className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
              </button>
            </div>
          </div>

          {/* Unified "About this artwork" */}
          {artwork.description && (
            <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-line space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-story uppercase tracking-wider">
                <BookOpen className="w-4 h-4 text-story" />
                <span>About this artwork</span>
              </div>
              <p className="text-base text-ink font-serif leading-relaxed whitespace-pre-line">
                {artwork.description}
              </p>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 pt-2">
            {artwork.hashtags.map((tag, i) => (
              <span
                key={i}
                className="text-xs px-2.5 py-1 rounded-md bg-canvas border border-line text-ink-soft"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
