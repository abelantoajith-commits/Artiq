"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { INTERVIEW_QUESTIONS } from "@/lib/identity/questions";
import { VoiceButton } from "@/components/artiq/VoiceButton";
import { KikoAvatar } from "@/components/artiq/KikoAvatar";
import { speakText, stopSpeech } from "@/lib/voice/speech-synthesis";
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
  Volume2,
  VolumeX,
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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const currentQuestion = INTERVIEW_QUESTIONS[currentIndex];
  const currentAnswer = answers[currentQuestion.id] || "";
  const isLastQuestion = currentIndex === INTERVIEW_QUESTIONS.length - 1;

  const speakQuestion = useCallback(
    (qIndex = currentIndex, lang = displayLanguage) => {
      if (isMuted) return;
      const targetQ = INTERVIEW_QUESTIONS[qIndex];
      if (!targetQ) return;
      const textToSpeak = lang === "ml" ? targetQ.title.ml : targetQ.title.en;

      speakText({
        text: textToSpeak,
        lang,
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    },
    [currentIndex, displayLanguage, isMuted]
  );

  // Auto-speak question when current index or display language changes
  useEffect(() => {
    if (!isMuted) {
      speakQuestion(currentIndex, displayLanguage);
    }
    return () => {
      stopSpeech();
      setIsSpeaking(false);
    };
  }, [currentIndex, displayLanguage, isMuted, speakQuestion]);

  const handleTextChange = (text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: text,
    }));
  };

  const handleNext = async () => {
    stopSpeech();
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
      const nextIndex = Math.min(currentIndex + 1, INTERVIEW_QUESTIONS.length - 1);
      setCurrentIndex(nextIndex);
    }
  };

  const handleSkip = () => {
    stopSpeech();
    if (isLastQuestion) {
      finishAndBuildProfile();
    } else {
      const nextIndex = Math.min(currentIndex + 1, INTERVIEW_QUESTIONS.length - 1);
      setCurrentIndex(nextIndex);
    }
  };

  const handleBack = () => {
    stopSpeech();
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
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
    <div className="max-w-xl mx-auto py-4 sm:py-8 space-y-6 animate-in fade-in duration-300 px-4">
      {/* Top Header & Language Picker */}
      <div className="flex items-center justify-between gap-3 border-b-2 border-ink/15 pb-4">
        <div>
          <span className="text-xs font-bold text-ink uppercase tracking-wider font-mono">
            Portfolio Setup
          </span>
          <h1 className="text-lg sm:text-xl font-bold text-ink font-display">
            Portfolio Question {currentIndex + 1} of {INTERVIEW_QUESTIONS.length}
          </h1>
        </div>

        {/* Output & Display Language Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-[10px] bg-canvas border-2 border-ink">
          <Languages className="w-3.5 h-3.5 text-ink ml-1.5 stroke-[2]" />
          <button
            type="button"
            onClick={() => {
              setOutputLanguage("en");
              setDisplayLanguage("en");
            }}
            className={`btn-hard px-2.5 py-1 text-xs font-bold rounded-[8px] transition-all min-h-[36px] ${
              outputLanguage === "en"
                ? "bg-leaf text-ink border-2 border-ink shadow-hard-sm"
                : "text-ink-soft hover:text-ink shadow-none border-0"
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
            className={`btn-hard px-2.5 py-1 text-xs font-bold rounded-[8px] transition-all min-h-[36px] ${
              outputLanguage === "ml"
                ? "bg-leaf text-ink border-2 border-ink shadow-hard-sm"
                : "text-ink-soft hover:text-ink shadow-none border-0"
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
                className={`w-full h-2.5 rounded-full border-2 border-ink transition-all ${
                  isCurrent
                    ? "bg-sand shadow-hard-sm"
                    : isAnswered
                    ? "bg-leaf"
                    : "bg-mist"
                }`}
              />
              <span className="text-[10px] text-ink font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
                Q{idx + 1}
              </span>
            </button>
          );
        })}
      </div>

      {/* Question Card */}
      <div className="bg-surface border-2 border-ink rounded-3xl p-6 sm:p-8 space-y-6 shadow-hard">
        {/* Kiko Character & Comic Speech Bubble */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 pb-2">
          {/* Kiko Avatar */}
          <div className="flex-shrink-0 flex items-center gap-3 sm:flex-col sm:items-center">
            <KikoAvatar
              state={
                isGenerating
                  ? "celebrating"
                  : isListening
                  ? "listening"
                  : isSpeaking
                  ? "speaking"
                  : "idle"
              }
              size="md"
              onClick={() => {
                if (isSpeaking) {
                  stopSpeech();
                  setIsSpeaking(false);
                } else {
                  speakQuestion(currentIndex, displayLanguage);
                }
              }}
              className="cursor-pointer"
            />
            <div className="sm:text-center">
              <span className="inline-block text-[11px] font-bold font-mono uppercase tracking-wider text-ink bg-sprout border border-ink px-2 py-0.5 rounded-full">
                Kiko
              </span>
              <p className="text-[10px] text-ink-soft hidden sm:block mt-0.5 font-mono">
                {isSpeaking
                  ? "Speaking…"
                  : isListening
                  ? "Listening…"
                  : isGenerating
                  ? "Crafting…"
                  : "Your guide"}
              </p>
            </div>
          </div>

          {/* Comic Speech Bubble */}
          <div className="relative flex-1 w-full bg-white border-2 border-ink rounded-2xl p-4 sm:p-5 shadow-hard-sm">
            {/* Bubble pointer pointing left on desktop, top on mobile */}
            <div
              className="hidden sm:block absolute -left-2.5 top-7 w-3 h-3 bg-white border-l-2 border-b-2 border-ink -rotate-45"
              aria-hidden="true"
            />
            <div
              className="sm:hidden absolute -top-2 left-8 w-3 h-3 bg-white border-t-2 border-l-2 border-ink rotate-45"
              aria-hidden="true"
            />

            {/* Bubble Header: Badge & Audio Controls */}
            <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-ink/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-forest animate-pulse" />
                <span className="text-[11px] sm:text-xs font-mono font-bold text-ink uppercase tracking-wider">
                  {displayLanguage === "ml" ? "കികോ ചോദിക്കുന്നു" : "Kiko asks"}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Listen / Reading button */}
                <button
                  type="button"
                  onClick={() => {
                    if (isSpeaking) {
                      stopSpeech();
                      setIsSpeaking(false);
                    } else {
                      if (isMuted) setIsMuted(false);
                      speakQuestion(currentIndex, displayLanguage);
                    }
                  }}
                  className={`btn-hard inline-flex items-center gap-1 px-2.5 py-1 rounded-[8px] text-xs font-bold border-2 border-ink transition-all min-h-[32px] ${
                    isSpeaking
                      ? "bg-sprout text-ink shadow-hard-sm"
                      : "bg-canvas text-ink hover:bg-mist shadow-none"
                  }`}
                  title={isSpeaking ? "Stop audio" : "Listen to question aloud"}
                >
                  <Volume2 className={`w-3.5 h-3.5 stroke-[2] ${isSpeaking ? "animate-bounce" : ""}`} />
                  <span className="font-mono text-[11px]">
                    {isSpeaking ? "Reading…" : "Listen"}
                  </span>
                </button>

                {/* Mute Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    if (!isMuted) {
                      stopSpeech();
                      setIsSpeaking(false);
                      setIsMuted(true);
                    } else {
                      setIsMuted(false);
                      speakQuestion(currentIndex, displayLanguage);
                    }
                  }}
                  className={`btn-hard p-1.5 rounded-[8px] border-2 border-ink transition-all min-h-[32px] min-w-[32px] flex items-center justify-center ${
                    isMuted
                      ? "bg-clay/20 text-ink-soft border-ink/40 shadow-none"
                      : "bg-canvas text-ink shadow-none hover:bg-mist"
                  }`}
                  aria-label={isMuted ? "Unmute Kiko's voice" : "Mute Kiko's voice"}
                  title={isMuted ? "Unmute voice" : "Mute voice"}
                >
                  {isMuted ? (
                    <VolumeX className="w-3.5 h-3.5 text-ink-soft stroke-[2]" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 text-ink stroke-[2]" />
                  )}
                </button>
              </div>
            </div>

            {/* Question Title & Translation */}
            <div className="space-y-1.5">
              <h2 className="text-base sm:text-xl font-bold tracking-tight text-ink font-display leading-snug">
                {displayLanguage === "ml"
                  ? currentQuestion.title.ml
                  : currentQuestion.title.en}
              </h2>
              <p className="text-xs text-ink-soft font-serif italic">
                {displayLanguage === "en"
                  ? currentQuestion.title.ml
                  : currentQuestion.title.en}
              </p>
            </div>
          </div>
        </div>

        {/* Textarea with VoiceButton */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label
              htmlFor="interview-answer"
              className="text-xs font-bold text-ink uppercase tracking-wider font-mono"
            >
              Your Answer (Speak or Type)
            </label>

            {/* VoiceButton directly embedded */}
            <VoiceButton
              context="artist_bio"
              fieldLabel={`question ${currentIndex + 1}`}
              onRecordingChange={(rec) => setIsListening(rec)}
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
              className="w-full p-4 rounded-[10px] bg-white border-2 border-ink text-ink text-sm sm:text-base leading-relaxed placeholder:text-ink-soft/50 focus:outline-none focus:ring-2 focus:ring-forest transition-all resize-y min-h-[160px]"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-ink-soft">
            <span>
              {currentAnswer.trim().length > 0 ? (
                <span className="text-ink font-bold flex items-center gap-1 font-mono">
                  <Check className="w-3.5 h-3.5 text-forest stroke-[2.5]" />
                  Answer draft ready
                </span>
              ) : (
                "You can speak in Malayalam or English, or type freely."
              )}
            </span>
            <span className="font-mono text-xs">{currentAnswer.length} chars</span>
          </div>
        </div>

        {/* Error notification */}
        {generationError && (
          <div className="p-4 rounded-xl bg-clay/15 border-2 border-clay text-ink text-sm flex items-start gap-2 font-medium">
            <HelpCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-clay" />
            <span>{generationError}</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t-2 border-ink/15">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentIndex === 0 || isGenerating}
            className="btn-hard flex items-center gap-1.5 py-3 px-4 rounded-[10px] border-2 border-ink bg-white text-ink text-sm font-bold hover:bg-mist disabled:opacity-40 transition-colors min-h-[48px] shadow-hard-sm"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2]" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSkip}
              disabled={isGenerating}
              className="py-3 px-4 text-ink-soft hover:text-ink text-sm font-bold transition-colors min-h-[48px]"
            >
              Skip
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={isGenerating}
              className="btn-hard flex items-center justify-center gap-2 py-3 px-6 rounded-[10px] bg-leaf text-ink text-sm font-bold shadow-hard transition-all min-h-[48px]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-ink" />
                  <span>Building Portfolio with AI…</span>
                </>
              ) : isLastQuestion ? (
                <>
                  <Sparkles className="w-4 h-4 stroke-[2]" />
                  <span>Finish & Build Portfolio</span>
                </>
              ) : (
                <>
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4 stroke-[2]" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Helpful cultural footnote */}
      <p className="text-xs text-center text-ink-soft leading-relaxed px-4 font-sans">
        AI will organize your authentic words into a dignified portfolio. Name, phone, and address are preserved from your profile.
      </p>
    </div>
  );
}
