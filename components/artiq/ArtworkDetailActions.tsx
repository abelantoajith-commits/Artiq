"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Bookmark, Share2, Trash2, AlertTriangle, Loader2, Edit3 } from "lucide-react";
import { Artwork } from "@/types/art";
import { ShareModal } from "@/components/artiq/ShareModal";
import { EditArtworkModal } from "@/components/artiq/EditArtworkModal";
import { deleteArtworkAction } from "@/app/create/actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ArtworkDetailActionsProps {
  artwork: Artwork;
  showShareBanner?: boolean;
  isOwner?: boolean;
  isMaster?: boolean;
  onArtworkUpdated?: (updated: Partial<Artwork>) => void;
}

export function ArtworkDetailActions({
  artwork,
  showShareBanner = false,
  isOwner = false,
  isMaster = false,
  onArtworkUpdated,
}: ArtworkDetailActionsProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(artwork.likes_count ?? 0);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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
    setSaved((prev) => {
      const next = !prev;
      if (next) {
        toast("Saved to your collection", {
          description: `"${artwork.title}" saved.`,
        });
      }
      return next;
    });
  };

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
      {/* Share Banner */}
      {showShareBanner && (
        <div className="p-4 rounded-[12px] bg-sand-tint border-2 border-espresso shadow-hard-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
          <div>
            <p className="font-body font-bold text-sm text-espresso">
              Share this traditional artwork
            </p>
            <p className="font-body text-xs text-bark mt-0.5">
              Support traditional artisans by sharing their authentic creations.
            </p>
          </div>
          <Button
            size="sm"
            variant="story"
            onClick={() => setIsShareModalOpen(true)}
            className="flex-shrink-0"
          >
            <Share2 className="w-4 h-4 stroke-espresso" strokeWidth={2} />
            <span>Share Portfolio</span>
          </Button>
        </div>
      )}

      {/* Main Action Bar: Physical Sticker Buttons */}
      <div className="flex items-center justify-between py-2 border-y-2 border-espresso/20 select-none">
        <div className="flex items-center gap-2.5">
          {/* Like Button (Clay) */}
          <button
            type="button"
            onClick={handleLike}
            aria-label={liked ? "Unlike" : "Like"}
            className={`h-11 px-4 rounded-[10px] border-2 border-espresso font-body font-bold text-xs shadow-hard-sm btn-hard inline-flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-forest ${
              liked
                ? "bg-clay text-espresso shadow-hard"
                : "bg-surface text-espresso hover:bg-mist"
            }`}
          >
            <Heart className={`w-4 h-4 stroke-espresso ${liked ? "fill-espresso" : ""}`} strokeWidth={2} />
            <span>{likeCount}</span>
          </button>

          {/* Save Button (White) */}
          <button
            type="button"
            onClick={handleSave}
            aria-label={saved ? "Remove from saved" : "Save to collection"}
            className={`h-11 px-4 rounded-[10px] border-2 border-espresso font-body font-bold text-xs shadow-hard-sm btn-hard inline-flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-forest ${
              saved
                ? "bg-leaf text-espresso"
                : "bg-surface text-espresso hover:bg-mist"
            }`}
          >
            <Bookmark className={`w-4 h-4 stroke-espresso ${saved ? "fill-espresso" : ""}`} strokeWidth={2} />
            <span>{saved ? "Saved" : "Save"}</span>
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Share Button (White) */}
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="h-11 px-4 rounded-[10px] bg-surface border-2 border-espresso text-espresso font-body font-bold text-xs shadow-hard-sm btn-hard inline-flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-forest"
          >
            <Share2 className="w-4 h-4 stroke-espresso" strokeWidth={2} />
            <span>Share</span>
          </button>

          {/* Edit Button (Owner or Master - Sand) */}
          {(isOwner || isMaster) && (
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="h-11 px-3.5 rounded-[10px] bg-sand border-2 border-espresso text-espresso font-body font-bold text-xs shadow-hard-sm btn-hard inline-flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-forest"
              title={isMaster ? "👑 Master Edit Artwork" : "Edit Artwork"}
            >
              <Edit3 className="w-4 h-4 stroke-espresso" strokeWidth={2} />
              <span>{isMaster ? "Master Edit" : "Edit"}</span>
            </button>
          )}

          {/* Delete Button (Owner or Master - Clay) */}
          {(isOwner || isMaster) && (
            <button
              type="button"
              onClick={() => setIsConfirmDeleteOpen(true)}
              className="h-11 w-11 rounded-[10px] bg-clay border-2 border-espresso text-espresso shadow-hard-sm btn-hard inline-flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-forest"
              title={isMaster ? "👑 Master Delete Artwork" : "Delete Artwork"}
              aria-label="Delete artwork"
            >
              <Trash2 className="w-4 h-4 stroke-espresso" strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal (Craft Styling) */}
      {isConfirmDeleteOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-espresso/40 flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsConfirmDeleteOpen(false)}
        >
          <div
            className="bg-surface border-2 border-espresso rounded-[24px] max-w-sm w-full p-6 space-y-4 shadow-hard-lg animate-in zoom-in-95 duration-150 select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[10px] bg-clay border-2 border-espresso flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 stroke-espresso" strokeWidth={2} />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-espresso">
                  {isMaster ? "Master Delete Artwork?" : "Delete Artwork?"}
                </h3>
                {isMaster && (
                  <span className="font-mono text-[10px] text-bark uppercase font-bold">
                    👑 Master Curator Permission
                  </span>
                )}
              </div>
            </div>
            <p className="font-body text-xs text-bark leading-relaxed">
              {isMaster
                ? `As Master Curator, you are about to permanently delete "${artwork.title}". This cannot be undone.`
                : `Are you sure you want to delete "${artwork.title}"? This will permanently remove your photo and story from the gallery.`}
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsConfirmDeleteOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="gap-1.5"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isDeleting ? "Deleting…" : "Yes, Delete"}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Artwork Modal */}
      <EditArtworkModal
        artwork={artwork}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        isMaster={isMaster}
        onSaved={onArtworkUpdated}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        artwork={artwork}
      />
    </>
  );
}
