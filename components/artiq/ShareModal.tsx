"use client";

import { useState } from "react";
import Image from "next/image";
import { Artwork } from "@/types/art";
import {
  X,
  Share2,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  artwork: Artwork;
}

export function ShareModal({ isOpen, onClose, artwork }: ShareModalProps) {
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  if (!isOpen) return null;

  const currentOrigin =
    typeof window !== "undefined" ? window.location.origin : "https://artiq.gallery";
  const artworkUrl = `${currentOrigin}/artwork/${artwork.id}`;

  const artistName = artwork.artist?.display_name || "Artist";

  const formattedCaption = `${artwork.title} by ${artistName}

${artwork.caption ? `"${artwork.caption}"\n\n` : ""}${artwork.description ? `About this artwork:\n${artwork.description}\n\n` : ""}${(artwork.hashtags || []).join(" ")}

Discover more traditional art on ARTIQ: ${artworkUrl}`;

  /**
   * Helper to fetch the artwork image and convert to a File object for Web Share API
   */
  const getImageFile = async (): Promise<File | null> => {
    try {
      let blob: Blob;
      if (artwork.image_url.startsWith("data:")) {
        const res = await fetch(artwork.image_url);
        blob = await res.blob();
      } else {
        const res = await fetch(artwork.image_url, { mode: "cors" });
        blob = await res.blob();
      }
      const safeTitle = artwork.title.replace(/[^a-zA-Z0-9_-]/g, "_") || "artwork";
      return new File([blob], `${safeTitle}.jpg`, {
        type: blob.type || "image/jpeg",
      });
    } catch (err) {
      console.warn("Could not convert image to file for sharing:", err);
      return null;
    }
  };

  /**
   * Native Share with Photo + Caption (Instagram, WhatsApp, Messages, etc.)
   */
  const handleNativeShare = async () => {
    setIsSharing(true);
    try {
      // Auto-copy caption first so the artist can paste into Instagram/Facebook
      try {
        await navigator.clipboard.writeText(formattedCaption);
        toast.success("Caption & story copied! Ready to paste into your post.");
      } catch {
        // ignore clipboard error
      }

      const file = await getImageFile();

      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${artwork.title} by ${artistName}`,
          text: formattedCaption,
          files: [file],
        });
        onClose();
        return;
      }

      if (navigator.share) {
        await navigator.share({
          title: `${artwork.title} by ${artistName}`,
          text: formattedCaption,
          url: artworkUrl,
        });
        onClose();
        return;
      }

      // Fallback: copy caption & link
      await navigator.clipboard.writeText(formattedCaption);
      toast.success("Photo caption & link copied to clipboard!");
    } catch (err: unknown) {
      if ((err as Error)?.name !== "AbortError") {
        console.error("Share error:", err);
      }
    } finally {
      setIsSharing(false);
    }
  };

  /**
   * Share full story and caption as text (guarantees text is sent on all apps)
   */
  const handleTextOnlyShare = async () => {
    setIsSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${artwork.title} by ${artistName}`,
          text: formattedCaption,
          url: artworkUrl,
        });
        toast.success("Shared successfully!");
        onClose();
        return;
      }
      await navigator.clipboard.writeText(formattedCaption);
      toast.success("Story and caption copied to clipboard!");
    } catch (err: unknown) {
      if ((err as Error)?.name !== "AbortError") {
        console.error("Text share error:", err);
      }
    } finally {
      setIsSharing(false);
    }
  };

  /**
   * Share to Instagram helper:
   * Copies the full caption & story, downloads the artwork image, and opens Instagram
   */
  const handleInstagramShare = async () => {
    try {
      // 1. Copy formatted caption & story
      await navigator.clipboard.writeText(formattedCaption);
      toast.success("Caption & story copied! Ready to paste into Instagram.");

      // 2. Try native share sheet first (often triggers Instagram on phones)
      const file = await getImageFile();
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: artwork.title,
          text: formattedCaption,
          files: [file],
        });
        return;
      }

      // 3. Fallback: open Instagram web/app in a new tab
      window.open("https://www.instagram.com/", "_blank");
    } catch {
      window.open("https://www.instagram.com/", "_blank");
    }
  };

  /**
   * Share to WhatsApp
   */
  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(formattedCaption);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
  };

  /**
   * Copy caption only
   */
  const handleCopyCaption = async () => {
    await navigator.clipboard.writeText(formattedCaption);
    setCopiedCaption(true);
    toast.success("Caption copied to clipboard!");
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  /**
   * Copy link only
   */
  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(artworkUrl);
    setCopiedLink(true);
    toast.success("Artwork link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-line rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200 space-y-5 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-line">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-story" />
            <h2 className="text-lg font-bold text-ink">Share Artwork & Story</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-canvas text-ink-soft hover:text-ink transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Artwork Preview Card */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-canvas border border-line">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-line flex-shrink-0">
            <Image
              src={artwork.image_url}
              alt={artwork.title}
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-ink truncate">
              {artwork.title}
            </h3>
            <p className="text-xs text-ink-soft truncate">
              by {artistName}
            </p>
            {artwork.caption && (
              <p className="text-[11px] text-story italic truncate mt-0.5">
                &ldquo;{artwork.caption}&rdquo;
              </p>
            )}
          </div>
        </div>

        {/* Caption Auto-Copy Notice */}
        <div className="p-3 rounded-2xl bg-canvas border border-line text-xs space-y-1">
          <p className="font-semibold text-ink flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-story" />
            <span>Caption is auto-copied to clipboard</span>
          </p>
          <p className="text-[11px] text-ink-soft leading-relaxed">
            Social apps (like Instagram) require pasting captions for image uploads. When your app opens, simply tap <strong>Paste</strong>!
          </p>
        </div>

        {/* Primary Action: Direct Share with Photo */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleNativeShare}
            disabled={isSharing}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-xl bg-story text-white font-semibold text-sm shadow-md hover:opacity-95 transition-all min-h-[44px]"
          >
            <Share2 className="w-4 h-4" />
            <span>{isSharing ? "Preparing Share…" : "Share Photo & Story"}</span>
          </button>

          <button
            type="button"
            onClick={handleTextOnlyShare}
            disabled={isSharing}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-line bg-surface hover:bg-canvas text-ink text-xs font-semibold transition-all min-h-[40px]"
          >
            <Copy className="w-3.5 h-3.5 text-ink-soft" />
            <span>Share Story & Link (Text Only)</span>
          </button>
        </div>

        {/* Social Platforms Row */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-ink-soft uppercase tracking-wider block">
            Direct to Social Media
          </span>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Instagram */}
            <button
              type="button"
              onClick={handleInstagramShare}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-line bg-canvas hover:bg-surface text-ink text-xs font-semibold transition-all min-h-[44px]"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600" />
              <span>Instagram</span>
              <ExternalLink className="w-3.5 h-3.5 text-ink-soft" />
            </button>

            {/* WhatsApp */}
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-line bg-canvas hover:bg-surface text-ink text-xs font-semibold transition-all min-h-[44px]"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5 text-ink-soft" />
            </button>
          </div>
        </div>

        {/* Copy Tools */}
        <div className="space-y-2 pt-2 border-t border-line">
          <button
            type="button"
            onClick={handleCopyCaption}
            className="w-full flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-canvas border border-line hover:border-story/40 text-xs text-ink transition-colors min-h-[40px]"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-story" />
              <span>Copy Full Caption, Story & Tags</span>
            </span>
            {copiedCaption ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Copy className="w-4 h-4 text-ink-soft" />
            )}
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-canvas border border-line hover:border-primary/40 text-xs text-ink transition-colors min-h-[40px]"
          >
            <span className="flex items-center gap-2">
              <Copy className="w-3.5 h-3.5 text-primary" />
              <span>Copy Artwork Link</span>
            </span>
            {copiedLink ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <ExternalLink className="w-4 h-4 text-ink-soft" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
