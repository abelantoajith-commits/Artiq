"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { INTERVIEW_QUESTIONS } from "@/lib/identity/questions";
import { VoiceButton } from "@/components/artiq/VoiceButton";
import {
  saveInterviewAnswerAction,
} from "@/app/profile/interview-actions";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check,
  Languages,
  Loader2,
  HelpCircle,
} from "lucide-react";

interface ProfileInterviewProps {
  initialAnswers: Record<string, { text: string; language: string }>;
}

export function ProfileInterview({ initialAnswers }: ProfileInterviewProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const q of INTERVIEW_QUESTIONS) {
      map[q.id] = initialAnswers[q.id]?.text || "";
    }
    return map;
  });

  const [outputLanguage, setOutputLanguage] = useState<"en" | "ml">("en");
  const [displayLanguage, setDisplayLanguage] = useState<"en" | "ml">("en");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const currentQuestion = INTERVIEW_QUESTIONS[currentIndex];
  const currentAnswer = answers[currentQuestion.id] || "";
  const isLastQuestion = currentIndex === INTERVIEW_QUESTIONS.length - 1;

  const handleTextChange = (text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: text,
    }));
  };

  const handleNext = async () => {
    // Auto-save current answer
    startTransition(async () => {
      await saveInterviewAnswerAction(
        currentQuestion.id,
        currentAnswer,
        outputLanguage
      );
    });

    if (isLastQuestion) {
      await finishAndBuildProfile();
    } else {
      setCurrentIndex((prev) => Math.min(prev + 1, INTERVIEW_QUESTIONS.length - 1));
    }
  };

  const handleSkip = () => {
    if (isLastQuestion) {
      finishAndBuildProfile();
    } else {
      setCurrentIndex((prev) => Math.min(prev + 1, INTERVIEW_QUESTIONS.length - 1));
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const finishAndBuildProfile = async () => {
    setIsGenerating(true);
    setGenerationError(null);

    try {
      // Package active answers
      const answersPayload = Object.entries(answers)
        .map(([questionId, text]) => ({ questionId, text: text.trim() }))
        .filter((a) => a.text.length > 0);

      const res = await fetch("/api/ai/identity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: answersPayload,
          outputLanguage,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate structured profile");
      }

      // Store generated profile in sessionStorage for the review screen
      if (typeof window !== "undefined") {
        sessionStorage.setItem("artiq_review_draft", JSON.stringify(data.result));
        sessionStorage.setItem("artiq_review_answers", JSON.stringify(answers));
      }

      router.push("/profile/review");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setGenerationError(msg);
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-4 sm:py-8 space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Language Picker */}
      <div className="flex items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <span className="text-xs font-semibold text-story uppercase tracking-wider">
            Identity Interview
          </span>
          <h1 className="text-lg sm:text-xl font-bold text-ink font-sans">
            Question {currentIndex + 1} of {INTERVIEW_QUESTIONS.length}
          </h1>
        </div>

        {/* Output & Display Language Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-canvas border border-line">
          <Languages className="w-3.5 h-3.5 text-ink-soft ml-1.5" />
          <button
            type="button"
            onClick={() => {
              setOutputLanguage("en");
              setDisplayLanguage("en");
            }}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all min-h-[36px] ${
              outputLanguage === "en"
                ? "bg-surface text-ink font-semibold shadow-xs"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => {
              setOutputLanguage("ml");
              setDisplayLanguage("ml");
            }}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all min-h-[36px] ${
              outputLanguage === "ml"
                ? "bg-surface text-story font-semibold shadow-xs"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            മലയാളം
          </button>
        </div>
      </div>

      {/* Progress Dots */}
      <div className="flex items-center justify-between gap-2 px-1">
        {INTERVIEW_QUESTIONS.map((q, idx) => {
          const isAnswered = Boolean(answers[q.id]?.trim());
          const isCurrent = idx === currentIndex;
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className="group flex-1 flex flex-col items-center gap-1 py-1 focus:outline-none"
              aria-label={`Go to question ${idx + 1}`}
            >
              <div
                className={`w-full h-2 rounded-full transition-all ${
                  isCurrent
                    ? "bg-story ring-2 ring-story/30"
                    : isAnswered
                    ? "bg-primary"
                    : "bg-line"
                }`}
              />
              <span className="text-[10px] text-ink-soft opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
                Q{idx + 1}
              </span>
            </button>
          );
        })}
      </div>

      {/* Question Card */}
      <div className="bg-surface border border-line rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Question Title */}
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ink font-serif leading-snug">
            {displayLanguage === "ml"
              ? currentQuestion.title.ml
              : currentQuestion.title.en}
          </h2>
          {displayLanguage === "en" && (
            <p className="text-xs text-ink-soft font-serif italic">
              {currentQuestion.title.ml}
            </p>
          )}
        </div>

        {/* Textarea with VoiceButton */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label
              htmlFor="interview-answer"
              className="text-xs font-semibold text-ink-soft uppercase tracking-wider"
            >
              Your Answer (Speak or Type)
            </label>

            {/* VoiceButton directly embedded */}
            <VoiceButton
              context="artist_bio"
              fieldLabel={`question ${currentIndex + 1}`}
              onAccept={(spokenText) => {
                const updated = currentAnswer
                  ? `${currentAnswer}\n\n${spokenText}`
                  : spokenText;
                handleTextChange(updated);
              }}
            />
          </div>

          <div className="relative">
            <textarea
              id="interview-answer"
              rows={6}
              value={currentAnswer}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={
                displayLanguage === "ml"
                  ? currentQuestion.placeholder.ml
                  : currentQuestion.placeholder.en
              }
              className="w-full p-4 rounded-2xl bg-canvas border border-line text-ink text-sm sm:text-base leading-relaxed placeholder:text-ink-soft/50 focus:outline-none focus:ring-2 focus:ring-story transition-all resize-y min-h-[160px]"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-ink-soft">
            <span>
              {currentAnswer.trim().length > 0 ? (
                <span className="text-story font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Answer draft ready
                </span>
              ) : (
                "You can speak in Malayalam or English, or type freely."
              )}
            </span>
            <span>{currentAnswer.length} chars</span>
          </div>
        </div>

        {/* Error notification */}
        {generationError && (
          <div className="p-4 rounded-2xl bg-danger/10 border border-danger/20 text-danger text-sm flex items-start gap-2">
            <HelpCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{generationError}</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-line">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentIndex === 0 || isGenerating}
            className="flex items-center gap-1.5 py-3 px-4 rounded-xl border border-line bg-canvas text-ink text-sm font-medium hover:bg-surface disabled:opacity-40 transition-colors min-h-[44px]"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSkip}
              disabled={isGenerating}
              className="py-3 px-4 rounded-xl text-ink-soft hover:text-ink text-sm font-medium transition-colors min-h-[44px]"
            >
              Skip
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-story hover:opacity-95 text-white text-sm font-semibold shadow-sm transition-all min-h-[44px]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Building with AI…</span>
                </>
              ) : isLastQuestion ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Finish & Build Profile</span>
                </>
              ) : (
                <>
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Helpful cultural footnote */}
      <p className="text-xs text-center text-ink-soft leading-relaxed px-4">
        AI will organize your authentic spoken words into a clean profile. It will never invent dates, awards, or cultural facts you did not mention.
      </p>
    </div>
  );
}
