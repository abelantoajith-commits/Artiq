"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArtworkAnalysisResult } from "@/lib/ai/gemini";
import { publishArtworkAction } from "@/app/create/actions";
import { VoiceButton } from "@/components/artiq/VoiceButton";
import { CategoryPickerDrawer } from "@/components/artiq/CategoryPickerDrawer";
import { getCategoryLabel } from "@/lib/categories";
import {
  Sparkles,
  BookOpen,
  Check,
  Plus,
  X,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

interface CreateDraftFormProps {
  imageUrl: string;
  width: number;
  height: number;
  initialDraft: ArtworkAnalysisResult;
  initialStory?: string;
  onCancel: () => void;
}

export function CreateDraftForm({
  imageUrl,
  width,
  height,
  initialDraft,
  initialStory = "",
  onCancel,
}: CreateDraftFormProps) {
  const router = useRouter();

  // 1. Title
  const [title, setTitle] = useState(initialDraft.title_suggestions[0] || "");

  // 2. Merged "About this artwork"
  // If user spoke earlier on step 1, prepend story; otherwise use AI visual description
  const initialAboutText = initialStory
    ? `${initialStory}\n\n${initialDraft.description || ""}`.trim()
    : initialDraft.description || "";

  const [aboutText, setAboutText] = useState(initialAboutText);
  const [isAboutAi, setIsAboutAi] = useState(!initialStory && Boolean(initialDraft.description));

  // 3. Caption
  const [caption, setCaption] = useState(initialDraft.caption || "");

  // 4. Categories: Exactly 5 suggestions with top one pre-selected
  const suggestedCategories = initialDraft.suggested_categories || [
    "traditional",
    "kerala-mural",
    "handicrafts",
    "textiles",
    "sculpture",
  ];

  const [categories, setCategories] = useState<string[]>([
    suggestedCategories[0] || "traditional",
  ]);
  const [isCategoryAi, setIsCategoryAi] = useState(true);
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);

  // 5. Hashtags
  const [hashtags, setHashtags] = useState<string[]>(initialDraft.hashtags || []);
  const [newTag, setNewTag] = useState("");

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleToggleCategory = (catId: string) => {
    setIsCategoryAi(false);
    setCategories((prev) =>
      prev.includes(catId) ? prev.filter((k) => k !== catId) : [...prev, catId]
    );
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setHashtags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    e.preventDefault();
    const clean = newTag.trim().replace(/^#/, "");
    if (clean && !hashtags.includes(`#${clean}`)) {
      setHashtags((prev) => [...prev, `#${clean}`]);
      setNewTag("");
    }
  };

  const handlePublish = async (status: "published" | "draft") => {
    if (!title.trim()) {
      setErrorMessage("Please provide a title for your artwork.");
      return;
    }
    if (categories.length === 0) {
      setErrorMessage("Please select at least one category for your artwork.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await publishArtworkAction({
        title: title.trim(),
        description: aboutText.trim(),
        caption: caption.trim(),
        imageUrl,
        width,
        height,
        categories,
        hashtags,
        status,
        aiGeneratedFields: {
          visual_observations: initialDraft.visual_observations,
          suggested_titles: initialDraft.title_suggestions,
          suggested_categories: suggestedCategories,
        },
      });

      if (result.error) {
        setErrorMessage(result.error);
        setIsSubmitting(false);
      } else if (result.artworkId) {
        // Also persist locally in browser localStorage for offline gallery access
        if (typeof window !== "undefined") {
          try {
            const raw = localStorage.getItem("artiq_browser_artworks") || "[]";
            const currentList = JSON.parse(raw);
            const newArt = {
              id: result.artworkId,
              title: title.trim(),
              description: aboutText.trim(),
              caption: caption.trim(),
              image_url: imageUrl,
              width,
              height,
              categories,
              hashtags,
              status,
              created_at: new Date().toISOString(),
              artist: {
                id: "current_user",
                display_name: "You",
                username: "you",
                location: "Kerala, India",
                avatar_url: "🎨",
                bio: "",
                journey: "",
                specialities: categories,
                preferred_language: "en",
              },
            };
            localStorage.setItem(
              "artiq_browser_artworks",
              JSON.stringify([newArt, ...currentList].slice(0, 20))
            );
            window.dispatchEvent(new Event("storage"));
          } catch {
            // ignore
          }
        }
        router.push(`/artwork/${result.artworkId}`);
      } else {
        router.push("/profile");
      }
    } catch (err: unknown) {
      console.warn("Server action fallback, saving locally:", err);
      const fallbackId = `art_${Date.now()}`;
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("artiq_browser_artworks") || "[]";
          const currentList = JSON.parse(raw);
          const newArt = {
            id: fallbackId,
            title: title.trim(),
            description: aboutText.trim(),
            caption: caption.trim(),
            image_url: imageUrl,
            width,
            height,
            categories,
            hashtags,
            status,
            created_at: new Date().toISOString(),
            artist: {
              id: "current_user",
              display_name: "You",
              username: "you",
              location: "Kerala, India",
              avatar_url: "🎨",
              bio: "",
              journey: "",
              specialities: categories,
              preferred_language: "en",
            },
          };
          localStorage.setItem(
            "artiq_browser_artworks",
            JSON.stringify([newArt, ...currentList].slice(0, 20))
          );
          window.dispatchEvent(new Event("storage"));
        } catch {
          // ignore
        }
      }
      router.push(`/artwork/${fallbackId}`);
    }
  };

  // Combine suggested categories with any extra categories picked from drawer
  const visibleCategoryPills = Array.from(
    new Set([...suggestedCategories.slice(0, 5), ...categories])
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Uncropped Artwork Image Preview */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-canvas border border-line flex items-center justify-center p-4">
        <Image
          src={imageUrl}
          alt="Artwork Preview"
          width={width}
          height={height}
          className="max-h-[50vh] w-auto h-auto rounded-xl object-contain shadow-sm"
          priority
        />
        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-surface/85 backdrop-blur-md border border-line text-[11px] text-ink-soft">
          {width} × {height} px (original ratio)
        </div>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm flex items-start gap-2.5"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 2. Title & AI Suggestions */}
      <div className="bg-surface border border-line rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
        <div>
          <label
            htmlFor="artwork-title"
            className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5"
          >
            Artwork title <span className="text-danger">*</span>
          </label>
          <input
            id="artwork-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter artwork title"
            className="w-full px-4 py-3 rounded-xl bg-canvas border border-line text-ink text-base font-medium placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
          />
        </div>

        {/* 3 AI Title Suggestions (Tap to apply) */}
        <div>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-ai uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3" />
            <span>AI Title Suggestions (Tap to apply)</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {initialDraft.title_suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setTitle(suggestion)}
                className={`text-xs px-3 py-2 rounded-xl border transition-all text-left min-h-[44px] flex items-center gap-1.5 ${
                  title === suggestion
                    ? "bg-ai/10 border-ai text-ai font-semibold"
                    : "bg-canvas border-line text-ink hover:border-ai/50"
                }`}
              >
                {title === suggestion && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                <span>{suggestion}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Merged "About this artwork" Field (Serif Newsreader Story Style) */}
      <div className="bg-surface border border-line rounded-3xl p-5 sm:p-6 space-y-3 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <label
              htmlFor="about-artwork"
              className="text-xs font-semibold text-ink uppercase tracking-wider flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4 text-story" />
              <span>About this artwork</span>
            </label>

            {isAboutAi && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-ai bg-ai/10 px-2.5 py-0.5 rounded-full border border-ai/20">
                <Sparkles className="w-3 h-3" />
                <span>AI suggestion</span>
              </span>
            )}
          </div>

          {/* Integrated Mic Button for Merging Voice with Visual Description */}
          <VoiceButton
            context="artwork_story"
            fieldLabel="about this artwork"
            visualDescription={aboutText}
            onAccept={(mergedText) => {
              setAboutText(mergedText);
              setIsAboutAi(false);
            }}
          />
        </div>

        <p className="text-xs text-ink-soft">
          Pre-filled with visual observations. Tap the mic to speak your story in your own words — AI will merge them seamlessly into one authentic narrative.
        </p>

        <textarea
          id="about-artwork"
          rows={5}
          value={aboutText}
          onChange={(e) => {
            setAboutText(e.target.value);
            setIsAboutAi(false);
          }}
          placeholder="Speak your story or describe what inspired this piece, the emotions behind it, or its heritage…"
          className="w-full px-4 py-3 rounded-xl bg-canvas border border-line text-ink text-base font-serif leading-relaxed placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-story"
        />
      </div>

      {/* 4. Categories: 5 Suggestions + "+" Button */}
      <div className="bg-surface border border-line rounded-3xl p-5 sm:p-6 space-y-3 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-semibold text-ink uppercase tracking-wider">
            Categories <span className="text-danger">*</span>
          </label>
          {isCategoryAi && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-ai bg-ai/10 px-2 py-0.5 rounded-full border border-ai/20">
              <Sparkles className="w-3 h-3" />
              <span>AI suggested</span>
            </span>
          )}
        </div>

        <p className="text-xs text-ink-soft">
          Top match is pre-selected. Tap to toggle or tap <strong className="text-ink">+</strong> to search all traditional & modern categories.
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {visibleCategoryPills.map((catId) => {
            const isSelected = categories.includes(catId);
            return (
              <button
                key={catId}
                type="button"
                onClick={() => handleToggleCategory(catId)}
                aria-pressed={isSelected}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all min-h-[44px] flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "bg-canvas border border-line text-ink hover:border-primary/40"
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                <span>{getCategoryLabel(catId)}</span>
              </button>
            );
          })}

          {/* "+" Button to open Full Category Drawer */}
          <button
            type="button"
            onClick={() => setIsCategoryDrawerOpen(true)}
            aria-label="Add more categories"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-dashed border-primary/50 text-primary bg-primary/5 hover:bg-primary/10 transition-colors min-h-[44px] flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>More categories</span>
          </button>
        </div>
      </div>

      {/* 5. Short Caption & Hashtags */}
      <div className="bg-surface border border-line rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
        <div>
          <label
            htmlFor="artwork-caption"
            className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5"
          >
            Short caption (Optional)
          </label>
          <input
            id="artwork-caption"
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="One-line quote or poetic summary…"
            className="w-full px-4 py-2.5 rounded-xl bg-canvas border border-line text-ink text-sm placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2">
            Hashtags
          </label>
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            {hashtags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-canvas border border-line text-ink text-xs"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="p-0.5 text-ink-soft hover:text-danger"
                  aria-label={`Remove tag ${tag}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Add tag and press Enter"
              className="flex-1 px-4 py-2 rounded-xl bg-canvas border border-line text-ink text-xs placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 rounded-xl bg-surface border border-line text-ink hover:bg-canvas text-xs font-medium min-h-[44px]"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* 6. Sticky Bottom Actions Bar */}
      <div className="sticky bottom-0 z-40 bg-surface/95 backdrop-blur-md border-t border-line -mx-4 px-4 sm:-mx-6 sm:px-6 py-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => handlePublish("published")}
          disabled={isSubmitting || !title.trim() || categories.length === 0}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <span>{isSubmitting ? "Publishing to Gallery…" : "Publish to Gallery"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => handlePublish("draft")}
          disabled={isSubmitting || !title.trim() || categories.length === 0}
          className="py-3.5 px-5 rounded-xl border border-line bg-canvas text-ink hover:bg-surface text-sm font-medium transition-colors min-h-[44px]"
        >
          Save draft
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="py-3.5 px-4 rounded-xl text-ink-soft hover:text-ink text-sm font-medium min-h-[44px]"
        >
          Cancel
        </button>
      </div>

      {/* Full Category Drawer / Dialog */}
      <CategoryPickerDrawer
        isOpen={isCategoryDrawerOpen}
        onClose={() => setIsCategoryDrawerOpen(false)}
        selectedCategories={categories}
        onToggleCategory={handleToggleCategory}
      />
    </div>
  );
}
