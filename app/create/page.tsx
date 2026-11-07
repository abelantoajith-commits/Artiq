"use client";

import { useState, useRef } from "react";
import { compressAndUploadArtworkImage } from "@/lib/storage/upload";
import { CreateDraftForm } from "@/components/artiq/CreateDraftForm";
import { VoiceButton } from "@/components/artiq/VoiceButton";
import { ArtworkAnalysisResult } from "@/lib/ai/gemini";
import {
  Camera,
  Image as ImageIcon,
  Mic,
  Sparkles,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

type CreateStep = "select" | "uploading" | "analyzing" | "draft";

export default function CreatePage() {
  const [step, setStep] = useState<CreateStep>("select");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  // Uploaded media state
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [imageWidth, setImageWidth] = useState<number>(800);
  const [imageHeight, setImageHeight] = useState<number>(800);
  const [analyzedDraft, setAnalyzedDraft] = useState<ArtworkAnalysisResult | null>(null);
  const [preSpokenStory, setPreSpokenStory] = useState<string>("");

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file || !file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file.");
      return;
    }

    setErrorMessage(null);
    setStep("uploading");
    setProgress(10);

    try {
      // 1. Direct browser-to-Supabase Storage upload with compression (Vercel 4.5 MB cap rule)
      const uploadResult = await compressAndUploadArtworkImage(
        file,
        "anonymous_or_user",
        (p) => setProgress(p)
      );

      setUploadedImageUrl(uploadResult.publicUrl);
      setImageWidth(uploadResult.width);
      setImageHeight(uploadResult.height);

      // 2. Call AI analysis route with storage path
      setStep("analyzing");

      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imagePath: uploadResult.filePath,
          imageUrl: uploadResult.publicUrl,
        }),
      });

      const data = await response.json();

      if (data.draft) {
        setAnalyzedDraft(data.draft);
      } else {
        // Fallback default
        setAnalyzedDraft({
          title_suggestions: ["Traditional Handcrafted Artwork"],
          description: "An authentic piece showcasing traditional forms and organic textures.",
          caption: "A celebration of handcrafted artistry.",
          hashtags: ["#TraditionalArt", "#Handmade"],
          keywords: ["craft", "traditional"],
          suggested_categories: [
            "traditional",
            "kerala-mural",
            "handicrafts",
            "textiles",
            "sculpture",
          ],
          visual_observations: { colours: [], subjects: [], style_notes: "" },
        });
      }

      setStep("draft");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(`Upload or analysis error: ${msg}. You can try again.`);
      setStep("select");
    }
  };

  const handleReset = () => {
    setStep("select");
    setUploadedImageUrl("");
    setAnalyzedDraft(null);
    setErrorMessage(null);
  };

  return (
    <div className="max-w-xl mx-auto py-4 sm:py-6 space-y-6 px-4">
      {/* Hidden native file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
      />

      {/* Step 1: Initial Three-Action Selection */}
      {step === "select" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink font-display">
              Add to your gallery
            </h1>
            <p className="text-sm text-ink-soft mt-1.5 font-sans">
              Photograph your artwork. AI will draft titles and descriptions while you share the authentic story.
            </p>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="p-4 rounded-xl bg-clay/15 border-2 border-clay text-ink text-sm flex items-start gap-2.5 font-medium"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-clay" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Three Equal-Weight Physical Sticker Actions */}
          <div className="space-y-4">
            {/* 1. Take a Photo */}
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="btn-hard w-full p-5 rounded-2xl border-2 border-ink bg-surface flex items-center gap-4 text-left shadow-hard min-h-[56px] group focus:outline-none focus:ring-2 focus:ring-forest"
            >
              <div className="w-14 h-14 rounded-xl bg-leaf border-2 border-ink flex items-center justify-center text-ink group-hover:scale-105 transition-transform flex-shrink-0">
                <Camera className="w-7 h-7 stroke-[2]" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-ink text-base">
                  Take a photo
                </h2>
                <p className="text-xs text-ink-soft mt-0.5">
                  Capture directly using your device camera
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-ink flex-shrink-0" />
            </button>

            {/* 2. Upload from Gallery */}
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="btn-hard w-full p-5 rounded-2xl border-2 border-ink bg-surface flex items-center gap-4 text-left shadow-hard min-h-[56px] group focus:outline-none focus:ring-2 focus:ring-forest"
            >
              <div className="w-14 h-14 rounded-xl bg-leaf border-2 border-ink flex items-center justify-center text-ink group-hover:scale-105 transition-transform flex-shrink-0">
                <ImageIcon className="w-7 h-7 stroke-[2]" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-ink text-base">
                  Upload from gallery
                </h2>
                <p className="text-xs text-ink-soft mt-0.5">
                  Select a high-resolution photo from your device
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-ink flex-shrink-0" />
            </button>

            {/* 3. Tell Your Story (Voice) */}
            <div className="w-full p-5 rounded-2xl border-2 border-ink bg-sand-tint shadow-hard min-h-[56px] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-sand border-2 border-ink flex items-center justify-center text-ink flex-shrink-0">
                  <Mic className="w-7 h-7 stroke-[2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-ink text-base">
                      Tell your story (Voice)
                    </h2>
                    <span className="text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded-[6px] bg-sand border border-ink text-ink">
                      Voice AI
                    </span>
                  </div>
                  <p className="text-xs text-ink-soft mt-0.5">
                    Speak your story in Malayalam or English, then pick a photo
                  </p>
                </div>
              </div>
              <VoiceButton
                context="artwork_story"
                fieldLabel="artwork story"
                onAccept={(storyText) => {
                  setPreSpokenStory(storyText);
                  galleryInputRef.current?.click();
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2 & 3: Loading States (Uploading & Gemini Analyzing) */}
      {(step === "uploading" || step === "analyzing") && (
        <div className="py-16 text-center space-y-6 bg-surface border-2 border-ink rounded-3xl p-8 shadow-hard animate-in fade-in duration-300">
          <div className="w-20 h-20 mx-auto rounded-full bg-sprout border-2 border-moss text-ink flex items-center justify-center animate-pulse">
            <Sparkles className="w-10 h-10 stroke-[2]" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight text-ink font-display">
              {step === "uploading"
                ? "Compressing and uploading image…"
                : "Looking at your artwork…"}
            </h2>
            <p className="text-sm text-ink-soft max-w-sm mx-auto leading-relaxed font-sans">
              {step === "uploading"
                ? `Direct upload in progress (${progress}%). Preserving natural aspect ratio.`
                : "Observing colors, shapes, and contours to prepare draft title and descriptions."}
            </p>
          </div>

          {/* Quiet Mist Pulse Skeletons */}
          <div className="max-w-md mx-auto space-y-3 pt-4 animate-pulse">
            <div className="h-4 bg-mist rounded w-3/4 mx-auto" />
            <div className="h-10 bg-mist rounded-xl w-full" />
            <div className="h-20 bg-mist rounded-xl w-full" />
          </div>
        </div>
      )}

      {/* Step 4: Editable Draft Screen */}
      {step === "draft" && analyzedDraft && (
        <CreateDraftForm
          imageUrl={uploadedImageUrl}
          width={imageWidth}
          height={imageHeight}
          initialDraft={analyzedDraft}
          initialStory={preSpokenStory}
          onCancel={handleReset}
        />
      )}
    </div>
  );
}
