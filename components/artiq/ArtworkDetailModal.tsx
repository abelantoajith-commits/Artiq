"use client";

import Image from "next/image";
import { X, Heart, Bookmark, BookOpen, MapPin, Share2, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { Artwork } from "@/types/art";
import { getCategoryLabel } from "@/lib/categories";
import { useState } from "react";
import { ShareModal } from "@/components/artiq/ShareModal";
import { deleteArtworkAction } from "@/app/create/actions";
import seedData from "@/data/seed-data.json";
import { toast } from "sonner";

interface ArtworkDetailModalProps {
  artwork: Artwork | null;
  onClose: () => void;
  currentUserId?: string;
  currentUsername?: string;
}

export function ArtworkDetailModal({
  artwork,
  onClose,
  currentUserId,
  currentUsername,
}: ArtworkDetailModalProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!artwork) return null;

  const isSeedArt = (seedData.artworks as { id: string }[]).some((a) => a.id === artwork?.id);
  const isOwner = Boolean(
    artwork &&
      !isSeedArt &&
      ((currentUserId &&
        (artwork.artist_id === currentUserId ||
          artwork.artist?.id === currentUserId)) ||
        (currentUsername &&
          artwork.artist?.username?.toLowerCase() ===
            currentUsername.toLowerCase()) ||
        artwork.artist?.id === "current_user")
  );

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteArtworkAction(artwork.id);
      if (result.success) {
        if (typeof window !== "undefined") {
          try {
            const raw = localStorage.getItem("artiq_browser_artworks");
            if (raw) {
              const list = JSON.parse(raw) as Artwork[];
              const updated = list.filter((a) => a.id !== artwork.id);
              localStorage.setItem("artiq_browser_artworks", JSON.stringify(updated));
              window.dispatchEvent(new Event("storage"));
            }
          } catch {
            // ignore
          }
        }
        toast.success("Artwork deleted from gallery.");
        setIsConfirmDeleteOpen(false);
        onClose();
      } else {
        toast.error(result.error || "Failed to delete artwork.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Delete failed: ${msg}`);
    } finally {
      setIsDeleting(false);
    }
  };

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
              <button
                type="button"
                onClick={() => setIsShareOpen(true)}
                className="p-2.5 rounded-full border border-line bg-surface text-ink hover:text-story hover:border-story/40 transition-colors"
                aria-label="Share artwork"
              >
                <Share2 className="w-4 h-4 text-story" />
              </button>
              {isOwner && (
                <button
                  type="button"
                  onClick={() => setIsConfirmDeleteOpen(true)}
                  className="p-2.5 rounded-full border border-line bg-surface text-ink-soft hover:text-danger hover:border-danger/40 transition-colors"
                  aria-label="Delete artwork"
                  title="Delete artwork"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
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

        <ShareModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          artwork={artwork}
        />

        {/* Delete Confirmation Modal */}
        {isConfirmDeleteOpen && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-surface border border-line rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 text-danger">
                <div className="p-2.5 rounded-full bg-danger/10">
                  <AlertTriangle className="w-5 h-5 text-danger" />
                </div>
                <h3 className="text-base font-bold text-ink">Delete Artwork?</h3>
              </div>
              <p className="text-xs text-ink-soft leading-relaxed">
                Are you sure you want to delete <strong>&ldquo;{artwork.title}&rdquo;</strong>? This will permanently remove your photo and story from the gallery. This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConfirmDeleteOpen(false)}
                  disabled={isDeleting}
                  className="px-4 py-2.5 rounded-xl border border-line text-xs font-semibold text-ink hover:bg-canvas transition-colors min-h-[40px]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-danger text-white text-xs font-semibold hover:opacity-90 transition-opacity min-h-[40px]"
                >
                  {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isDeleting ? "Deleting…" : "Yes, Delete"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
