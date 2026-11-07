"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Edit3, Loader2, Check } from "lucide-react";
import { Artwork } from "@/types/art";
import { updateArtworkAction } from "@/app/create/actions";
import { CATEGORY_TAXONOMY } from "@/lib/categories";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface EditArtworkModalProps {
  artwork: Artwork;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (updated: Partial<Artwork>) => void;
  isMaster?: boolean;
}

export function EditArtworkModal({
  artwork,
  isOpen,
  onClose,
  onSaved,
  isMaster = false,
}: EditArtworkModalProps) {
  const router = useRouter();
  const [title, setTitle] = useState(artwork.title);
  const [description, setDescription] = useState(artwork.description || "");
  const [caption, setCaption] = useState(artwork.caption || "");
  const [categories, setCategories] = useState<string[]>(artwork.categories || []);
  const [hashtags, setHashtags] = useState<string>(
    (artwork.hashtags || []).map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ")
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleCategory = (catId: string) => {
    setCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Artwork title is required.");
      return;
    }

    setIsSubmitting(true);
    const parsedHashtags = hashtags
      .split(/[\s,]+/)
      .map((t) => t.trim().replace(/^#/, ""))
      .filter(Boolean);

    try {
      const res = await updateArtworkAction({
        id: artwork.id,
        title: title.trim(),
        description: description.trim(),
        caption: caption.trim(),
        categories,
        hashtags: parsedHashtags,
      });

      if (res.success) {
        toast.success(
          isMaster
            ? "Artwork updated via Master Curator."
            : "Artwork updated successfully."
        );
        if (onSaved) {
          onSaved({
            title: title.trim(),
            description: description.trim(),
            caption: caption.trim(),
            categories,
            hashtags: parsedHashtags,
          });
        }
        onClose();
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update artwork.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Update error: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-espresso/50 flex items-center justify-center p-4 animate-in fade-in duration-150 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-surface border-2 border-espresso rounded-[24px] max-w-lg w-full p-6 space-y-5 shadow-hard-lg animate-in zoom-in-95 duration-150 my-8 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-espresso/15">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[10px] bg-sand border-2 border-espresso flex items-center justify-center text-espresso shadow-hard-sm">
              <Edit3 className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-espresso">
                {isMaster ? "Master Edit Artwork" : "Edit Artwork"}
              </h2>
              <p className="font-mono text-[11px] text-bark uppercase tracking-wider">
                {isMaster ? "👑 Master Curator Mode" : "Update artwork details"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-[8px] bg-mist border-2 border-espresso flex items-center justify-center text-espresso hover:bg-surface transition-colors focus:outline-none focus:ring-2 focus:ring-forest cursor-pointer"
            aria-label="Close edit dialog"
          >
            <X className="w-4 h-4 stroke-[2]" />
          </button>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Title */}
          <div>
            <label className="block font-mono text-[11px] font-bold text-espresso uppercase tracking-wider mb-1.5">
              Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Traditional Kathakali Mural"
              className="w-full px-3.5 py-2.5 rounded-[10px] bg-white border-2 border-espresso text-espresso text-sm placeholder:text-bark/50 focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-1 font-body"
            />
          </div>

          {/* Caption */}
          <div>
            <label className="block font-mono text-[11px] font-bold text-espresso uppercase tracking-wider mb-1.5">
              Brief Caption
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="A one-line visual summary"
              className="w-full px-3.5 py-2.5 rounded-[10px] bg-white border-2 border-espresso text-espresso text-sm placeholder:text-bark/50 focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-1 font-body"
            />
          </div>

          {/* Description / Story */}
          <div>
            <label className="block font-mono text-[11px] font-bold text-espresso uppercase tracking-wider mb-1.5">
              Story & Technique (In the Artist&apos;s Words)
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the medium, heritage story, pigments, or inspiration behind this artwork…"
              className="w-full px-3.5 py-2.5 rounded-[10px] bg-white border-2 border-espresso text-espresso text-sm placeholder:text-bark/50 focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-1 font-body resize-y"
            />
          </div>

          {/* Categories */}
          <div>
            <label className="block font-mono text-[11px] font-bold text-espresso uppercase tracking-wider mb-2">
              Heritage Categories
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 border-2 border-espresso/20 rounded-[10px] bg-mist/40">
              {CATEGORY_TAXONOMY.map((cat) => {
                const isSelected = categories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-[8px] text-xs font-mono font-medium border-2 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-sand border-espresso text-espresso shadow-hard-sm"
                        : "bg-surface border-espresso/40 text-bark hover:border-espresso"
                    }`}
                  >
                    {isSelected && <span className="mr-1 font-bold">✓</span>}
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hashtags */}
          <div>
            <label className="block font-mono text-[11px] font-bold text-espresso uppercase tracking-wider mb-1.5">
              Tags (space separated)
            </label>
            <input
              type="text"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="#keralamural #traditional #fresco"
              className="w-full px-3.5 py-2.5 rounded-[10px] bg-white border-2 border-espresso text-espresso text-sm placeholder:text-bark/50 focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-1 font-mono text-xs"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t-2 border-espresso/15">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving…</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Save Changes</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
