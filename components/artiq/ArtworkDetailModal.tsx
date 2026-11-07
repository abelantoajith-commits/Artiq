"use client";

import Image from "next/image";
import Link from "next/link";
import { X, Heart, Bookmark, MapPin, Share2, Trash2, AlertTriangle, Loader2, Edit3 } from "lucide-react";
import { Artwork, Artist } from "@/types/art";
import { getCategoryLabel } from "@/lib/categories";
import { useState, useMemo } from "react";
import { ShareModal } from "@/components/artiq/ShareModal";
import { ContactArtistCard } from "@/components/artiq/ContactArtistCard";
import { ArtistAvatar } from "@/components/artiq/ArtistAvatar";
import { StoryTag } from "@/components/artiq/Badges";
import { EditArtworkModal } from "@/components/artiq/EditArtworkModal";
import { deleteArtworkAction } from "@/app/create/actions";
import { Button } from "@/components/ui/button";
import seedData from "@/data/seed-data.json";
import { toast } from "sonner";

interface ArtworkDetailModalProps {
  artwork: Artwork | null;
  onClose: () => void;
  currentUserId?: string;
  currentUsername?: string;
  isMaster?: boolean;
}

export function ArtworkDetailModal({
  artwork: initialArtwork,
  onClose,
  currentUserId,
  currentUsername,
  isMaster = false,
}: ArtworkDetailModalProps) {
  const [artworkOverrides, setArtworkOverrides] = useState<Record<string, Partial<Artwork>>>({});
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const artwork = useMemo(() => {
    if (!initialArtwork) return null;
    const override = artworkOverrides[initialArtwork.id];
    return override ? { ...initialArtwork, ...override } : initialArtwork;
  }, [initialArtwork, artworkOverrides]);

  const fullArtist = useMemo(() => {
    if (!artwork) return null;
    let base = artwork.artist;
    const seedArtist = (seedData.artists as Artist[]).find(
      (a) => a.id === artwork.artist_id || a.id === base?.id || a.username === base?.username
    );
    if (seedArtist) {
      base = { ...seedArtist, ...base };
    }
    return base;
  }, [artwork]);

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
        artwork.artist?.id === "current_user" ||
        artwork.artist?.username?.toLowerCase() === "you")
  );

  const profileHref =
    isOwner ||
    artwork.artist?.id === "current_user" ||
    artwork.artist?.username?.toLowerCase() === "you"
      ? "/profile"
      : artwork.artist?.username && artwork.artist.username.toLowerCase() !== "you"
        ? `/artist/${artwork.artist.username}`
        : artwork.artist?.id && artwork.artist.id !== "current_user"
          ? `/artist/${artwork.artist.id}`
          : "/profile";

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
      className="fixed inset-0 z-50 bg-espresso/40 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-surface border-2 border-espresso rounded-[24px] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-hard-lg relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button: 44px Icon Stamp */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 z-10 w-11 h-11 rounded-[10px] bg-surface border-2 border-espresso shadow-hard-sm btn-hard text-espresso flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-forest"
        >
          <X className="w-5 h-5 stroke-espresso" strokeWidth={2} />
        </button>

        {/* Artwork Image Presentation: Uncropped, 16px radius, zero border */}
        <div className="w-full bg-canvas/60 flex items-center justify-center p-4 sm:p-6 border-b-2 border-espresso/20">
          <div className="relative max-h-[60vh] rounded-[16px] overflow-hidden bg-mist">
            <Image
              src={artwork.image_url}
              alt={artwork.title}
              width={artwork.width || 800}
              height={artwork.height || 800}
              className="max-h-[60vh] w-auto h-auto rounded-[16px] object-contain"
              priority
            />
          </div>
        </div>

        {/* Content Details */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Header & Categories */}
          <div>
            {artwork.categories && artwork.categories.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                {artwork.categories.map((catId) => (
                  <span
                    key={catId}
                    className="px-2.5 py-0.5 rounded-full bg-sand border-[1.5px] border-espresso text-espresso text-[11px] font-bold uppercase tracking-wider"
                  >
                    {getCategoryLabel(catId)}
                  </span>
                ))}
              </div>
            )}
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-espresso tracking-tight">
              {artwork.title}
            </h2>
            {artwork.caption && (
              <p className="text-sm text-bark mt-1.5 italic font-serif">&ldquo;{artwork.caption}&rdquo;</p>
            )}
          </div>

          {/* Artist Card with Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-[12px] bg-mist/60 border-2 border-espresso gap-4 select-none">
            <Link
              href={profileHref}
              className="flex items-center gap-3 group/modal-artist hover:opacity-90 transition-opacity min-w-0"
              title={`View ${isOwner ? "your" : artwork.artist?.display_name || "Artist"}'s profile`}
            >
              <ArtistAvatar artist={fullArtist || artwork.artist} size="lg" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display font-bold text-espresso text-sm sm:text-base group-hover/modal-artist:underline truncate">
                    {artwork.artist?.display_name || "Artist"}
                  </h3>
                  <span className="text-xs text-espresso">↗</span>
                </div>
                <p className="text-xs text-bark flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-bark flex-shrink-0" />
                  <span className="truncate">{artwork.artist?.location || "Kerala, India"}</span>
                </p>
              </div>
            </Link>

            {/* Action Buttons: Like, Save, Share, Delete */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Like Button */}
              <button
                type="button"
                onClick={() => setLiked(!liked)}
                className={`h-10 px-3.5 rounded-[10px] border-2 border-espresso font-bold text-xs shadow-hard-sm btn-hard flex items-center gap-1.5 cursor-pointer ${
                  liked ? "bg-clay text-espresso shadow-hard" : "bg-surface text-espresso"
                }`}
                aria-label="Like artwork"
              >
                <Heart className={`w-4 h-4 stroke-espresso ${liked ? "fill-espresso" : ""}`} strokeWidth={2} />
              </button>

              {/* Save Button */}
              <button
                type="button"
                onClick={() => {
                  setSaved(!saved);
                  if (!saved) toast("Saved to your collection");
                }}
                className={`h-10 px-3.5 rounded-[10px] border-2 border-espresso font-bold text-xs shadow-hard-sm btn-hard flex items-center gap-1.5 cursor-pointer ${
                  saved ? "bg-leaf text-espresso" : "bg-surface text-espresso"
                }`}
                aria-label="Save artwork"
              >
                <Bookmark className={`w-4 h-4 stroke-espresso ${saved ? "fill-espresso" : ""}`} strokeWidth={2} />
              </button>

              {/* Share Button */}
              <button
                type="button"
                onClick={() => setIsShareOpen(true)}
                className="h-10 px-3.5 rounded-[10px] bg-surface border-2 border-espresso text-espresso font-bold text-xs shadow-hard-sm btn-hard flex items-center gap-1.5 cursor-pointer"
                aria-label="Share artwork"
              >
                <Share2 className="w-4 h-4 stroke-espresso" strokeWidth={2} />
              </button>

              {/* Edit Button (Owner or Master) */}
              {(isOwner || isMaster) && (
                <button
                  type="button"
                  onClick={() => setIsEditOpen(true)}
                  className="h-10 px-3 rounded-[10px] bg-sand border-2 border-espresso text-espresso font-bold text-xs shadow-hard-sm btn-hard flex items-center gap-1.5 cursor-pointer"
                  aria-label="Edit artwork"
                  title={isMaster ? "👑 Master Edit Artwork" : "Edit artwork"}
                >
                  <Edit3 className="w-4 h-4 stroke-espresso" strokeWidth={2} />
                  <span>{isMaster ? "Master Edit" : "Edit"}</span>
                </button>
              )}

              {/* Delete Button (Owner or Master) */}
              {(isOwner || isMaster) && (
                <button
                  type="button"
                  onClick={() => setIsConfirmDeleteOpen(true)}
                  className="h-10 w-10 rounded-[10px] bg-clay border-2 border-espresso text-espresso shadow-hard-sm btn-hard flex items-center justify-center cursor-pointer"
                  aria-label="Delete artwork"
                  title={isMaster ? "👑 Master Delete Artwork" : "Delete artwork"}
                >
                  <Trash2 className="w-4 h-4 stroke-espresso" strokeWidth={2} />
                </button>
              )}
            </div>
          </div>

          {/* Unified "About this artwork" Story Block */}
          {artwork.description && (
            <div className="p-5 sm:p-6 rounded-[12px] bg-sand-tint border-2 border-espresso border-l-4 border-l-espresso shadow-hard-sm space-y-2.5">
              <div className="flex items-center gap-2">
                <StoryTag />
              </div>
              <blockquote className="text-base sm:text-lg text-espresso font-serif italic leading-relaxed whitespace-pre-line max-w-[60ch]">
                &ldquo;{artwork.description}&rdquo;
              </blockquote>
            </div>
          )}

          {/* Tags */}
          {artwork.hashtags && artwork.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {artwork.hashtags.map((tag, i) => (
                <span
                  key={i}
                  className="text-xs px-2.5 py-1 rounded-[6px] bg-surface border border-espresso text-bark font-mono"
                >
                  {tag.startsWith("#") ? tag : `#${tag}`}
                </span>
              ))}
            </div>
          )}

          {/* Contact the Artist Card */}
          <ContactArtistCard artist={fullArtist} artworkTitle={artwork.title} />
        </div>

        <ShareModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          artwork={artwork}
        />

        {/* Edit Artwork Modal */}
        <EditArtworkModal
          artwork={artwork}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          isMaster={isMaster}
          onSaved={(updated) => {
            if (initialArtwork) {
              setArtworkOverrides((prev) => ({
                ...prev,
                [initialArtwork.id]: {
                  ...(prev[initialArtwork.id] || {}),
                  ...updated,
                },
              }));
            }
          }}
        />

        {/* Delete Confirmation Modal */}
        {isConfirmDeleteOpen && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 bg-espresso/40 flex items-center justify-center p-4 animate-in fade-in duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-surface border-2 border-espresso rounded-[24px] max-w-sm w-full p-6 space-y-4 shadow-hard-lg animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[10px] bg-clay border-2 border-espresso flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 stroke-espresso" strokeWidth={2} />
                </div>
                <h3 className="font-display font-bold text-base text-espresso">Delete Artwork?</h3>
              </div>
              <p className="font-body text-xs text-bark leading-relaxed">
                Are you sure you want to delete <strong>&ldquo;{artwork.title}&rdquo;</strong>? This will permanently remove your photo and story from the gallery.
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
      </div>
    </div>
  );
}
