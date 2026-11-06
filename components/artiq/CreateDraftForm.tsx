"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArtworkAnalysisResult } from "@/lib/ai/gemini";
import { publishArtworkAction } from "@/app/create/actions";
import { VoiceButton } from "@/components/artiq/VoiceButton";
import {
  Sparkles,
  BookOpen,
  Info,
  Check,
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

  // State for all editable fields
  const [title, setTitle] = useState(initialDraft.title_suggestions[0] || "");
  const [description, setDescription] = useState(initialDraft.description || "");
  const [isDescriptionAi, setIsDescriptionAi] = useState(true);

  const [caption, setCaption] = useState(initialDraft.caption || "");
  const [isCaptionAi, setIsCaptionAi] = useState(true);

  const [hashtags, setHashtags] = useState<string[]>(initialDraft.hashtags || []);
  const [newTag, setNewTag] = useState("");

  const [categories, setCategories] = useState<string[]>(
    initialDraft.suggested_categories || ["traditional"]
  );

  // Artist-supplied fields (never guessed by AI)
  const [artForm, setArtForm] = useState("");
  const [technique, setTechnique] = useState("");
  const [materials, setMaterials] = useState("");
  const [story, setStory] = useState(initialStory);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const ALL_CATEGORIES = [
    { key: "traditional", label: "Traditional" },
    { key: "kerala-mural", label: "Kerala Mural" },
    { key: "textiles", label: "Textiles & Weaving" },
    { key: "handicrafts", label: "Handicrafts" },
    { key: "sculpture", label: "Sculpture & Carving" },
    { key: "modern", label: "Modern & Contemporary" },
    { key: "digital", label: "Digital Art" },
  ];

  const handleToggleCategory = (catKey: string) => {
    setCategories((prev) =>
      prev.includes(catKey)
        ? prev.filter((k) => k !== catKey)
        : [...prev, catKey]
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
    if (!artForm.trim()) {
      setErrorMessage("Please specify the art form (e.g. Kerala mural, Kasavu weave).");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await publishArtworkAction({
      title: title.trim(),
      description: description.trim(),
      caption: caption.trim(),
      imageUrl,
      width,
      height,
      artForm: artForm.trim(),
      technique: technique.trim(),
      materials: materials.trim(),
      story: story.trim(),
      categories,
      hashtags,
      status,
      aiGeneratedFields: {
        visual_observations: initialDraft.visual_observations,
        suggested_titles: initialDraft.title_suggestions,
      },
    });

    if (result.error) {
      setErrorMessage(result.error);
      setIsSubmitting(false);
    } else if (result.artworkId) {
      router.push(`/artwork/${result.artworkId}`);
    } else {
      router.push("/profile");
    }
  };

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
            className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1"
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

        {/* 3 AI Title Suggestions (PRD 7.2 & 9.1) */}
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

      {/* 3. Description & Caption */}
      <div className="bg-surface border border-line rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="artwork-description"
              className="block text-xs font-semibold text-ink uppercase tracking-wider"
            >
              Visual description
            </label>
            {isDescriptionAi && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-ai bg-ai/10 px-2.5 py-0.5 rounded-full border border-ai/20">
                <Sparkles className="w-3 h-3" />
                <span>AI suggestion</span>
              </span>
            )}
          </div>
          <textarea
            id="artwork-description"
            rows={3}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setIsDescriptionAi(false);
            }}
            placeholder="Describe the visible subjects, colors, and textures…"
            className="w-full px-4 py-3 rounded-xl bg-canvas border border-line text-ink text-sm placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="artwork-caption"
              className="block text-xs font-semibold text-ink uppercase tracking-wider"
            >
              Short caption
            </label>
            {isCaptionAi && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-ai bg-ai/10 px-2.5 py-0.5 rounded-full border border-ai/20">
                <Sparkles className="w-3 h-3" />
                <span>AI suggestion</span>
              </span>
            )}
          </div>
          <input
            id="artwork-caption"
            type="text"
            value={caption}
            onChange={(e) => {
              setCaption(e.target.value);
              setIsCaptionAi(false);
            }}
            placeholder="One-line quote or poetic summary…"
            className="w-full px-4 py-2.5 rounded-xl bg-canvas border border-line text-ink text-sm placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
          />
        </div>
      </div>

      {/* 4. Your Story (Turmeric Accent) */}
      <div className="bg-story/5 border border-story/30 rounded-3xl p-5 sm:p-6 space-y-3 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-story uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Your Story (In your own words)</span>
          </div>
          <VoiceButton
            context="artwork_story"
            fieldLabel="artwork story"
            onAccept={(text) => setStory(text)}
          />
        </div>
        <p className="text-xs text-ink-soft">
          What should people know about this piece? What emotions, traditions, or memories does it embody?
        </p>
        <textarea
          id="artwork-story"
          rows={4}
          value={story}
          onChange={(e) => setStory(e.target.value)}
          placeholder="I painted this during the monsoon after visiting the temple sanctum in Thrissur…"
          className="w-full px-4 py-3 rounded-xl bg-surface border border-story/40 text-ink text-base font-serif leading-relaxed placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-story"
        />
      </div>

      {/* 5. Details Only You Know (Rule 6: Never pre-filled with guesses) */}
      <div className="bg-surface border border-line rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-canvas border border-line text-xs text-ink-soft">
          <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <p>
            <strong className="text-ink">ARTIQ does not guess these.</strong> Cultural origin, materials, and techniques are your authentic knowledge.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="art-form"
              className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5"
            >
              Art Form / Tradition <span className="text-danger">*</span>
            </label>
            <input
              id="art-form"
              type="text"
              required
              value={artForm}
              onChange={(e) => setArtForm(e.target.value)}
              placeholder="e.g. Kerala mural, Kasavu handloom"
              className="w-full px-4 py-2.5 rounded-xl bg-canvas border border-line text-ink text-sm placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
            />
          </div>

          <div>
            <label
              htmlFor="materials"
              className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5"
            >
              Materials Used
            </label>
            <input
              id="materials"
              type="text"
              value={materials}
              onChange={(e) => setMaterials(e.target.value)}
              placeholder="e.g. Natural rock pigments, laterite plaster"
              className="w-full px-4 py-2.5 rounded-xl bg-canvas border border-line text-ink text-sm placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="technique"
              className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5"
            >
              Technique & Process
            </label>
            <input
              id="technique"
              type="text"
              value={technique}
              onChange={(e) => setTechnique(e.target.value)}
              placeholder="e.g. Fresco-secco with neem gum binder, pit loom weaving"
              className="w-full px-4 py-2.5 rounded-xl bg-canvas border border-line text-ink text-sm placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
            />
          </div>
        </div>
      </div>

      {/* 6. Categories & Hashtags */}
      <div className="bg-surface border border-line rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
        <div>
          <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2">
            Categories (Select all that apply)
          </label>
          <div className="flex flex-wrap gap-2">
            {ALL_CATEGORIES.map((cat) => {
              const isSelected = categories.includes(cat.key);
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => handleToggleCategory(cat.key)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all min-h-[44px] flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                      : "bg-canvas border border-line text-ink hover:bg-surface"
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
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

      {/* 7. Sticky Bottom Actions Bar */}
      <div className="sticky bottom-0 z-40 bg-surface/95 backdrop-blur-md border-t border-line -mx-4 px-4 sm:-mx-6 sm:px-6 py-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => handlePublish("published")}
          disabled={isSubmitting || !title.trim()}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <span>{isSubmitting ? "Publishing to Gallery…" : "Publish to Gallery"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => handlePublish("draft")}
          disabled={isSubmitting || !title.trim()}
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
    </div>
  );
}
