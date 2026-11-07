"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Bookmark, Share2, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { Artwork } from "@/types/art";
import { ShareModal } from "@/components/artiq/ShareModal";
import { deleteArtworkAction } from "@/app/create/actions";
import { toast } from "sonner";

interface ArtworkDetailActionsProps {
  artwork: Artwork;
  showShareBanner?: boolean;
  isOwner?: boolean;
}

export function ArtworkDetailActions({
  artwork,
  showShareBanner = false,
  isOwner = false,
}: ArtworkDetailActionsProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(artwork.likes_count ?? 0);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteArtworkAction(artwork.id);
      if (result.success) {
        // Remove from browser localStorage backup
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
        router.push("/");
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

        <div className="flex items-center gap-2">
          {/* Share Button */}
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface border border-line text-ink hover:text-story hover:border-story/40 transition-all text-xs font-semibold shadow-sm min-h-[44px]"
          >
            <Share2 className="w-4 h-4 text-story" />
            <span>Share to</span>
          </button>

          {/* Delete Button (Only for artwork owner) */}
          {isOwner && (
            <button
              type="button"
              onClick={() => setIsConfirmDeleteOpen(true)}
              className="inline-flex items-center justify-center p-2.5 rounded-full bg-surface border border-line text-ink-soft hover:text-danger hover:border-danger/40 transition-colors min-h-[44px] min-w-[44px]"
              title="Delete this artwork"
              aria-label="Delete artwork"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isConfirmDeleteOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
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

      {/* Share Modal Dialog */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        artwork={artwork}
      />
    </>
  );
}
