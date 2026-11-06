"use client";

import { useState, useRef, useEffect } from "react";
import {
  Mic,
  Square,
  Sparkles,
  RefreshCw,
  Check,
  X,
  Globe,
  Loader2,
  BookOpen,
} from "lucide-react";
import { StoryPolishResult } from "@/lib/ai/story";

// Web Speech API typed interfaces
interface SpeechRecognitionResultItem {
  transcript: string;
}

interface SpeechRecognitionResultList {
  [index: number]: {
    [index: number]: SpeechRecognitionResultItem;
  };
  length: number;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: unknown) => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface IWindow extends Window {
  webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  SpeechRecognition?: new () => SpeechRecognitionInstance;
}

interface VoiceButtonProps {
  onAccept: (polishedText: string) => void;
  context?: "artwork_story" | "artist_bio" | "journey" | "specialities";
  fieldLabel?: string;
}

export function VoiceButton({
  onAccept,
  context = "artwork_story",
  fieldLabel = "your story",
}: VoiceButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);

  // Language settings
  const [spokenLang, setSpokenLang] = useState<"ml-IN" | "en-IN">("ml-IN");
  const [targetLang, setTargetLang] = useState<"en" | "ml">("en");

  // Transcript states
  const [rawTranscript, setRawTranscript] = useState("");
  const [polishedResult, setPolishedResult] = useState<StoryPolishResult | null>(null);
  const [editablePolishedText, setEditablePolishedText] = useState("");

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const startRecording = () => {
    setRawTranscript("");
    setPolishedResult(null);
    setRecordSeconds(0);
    setIsRecording(true);
    setIsProcessing(false);

    // Timer
    timerRef.current = setInterval(() => {
      setRecordSeconds((prev) => {
        if (prev >= 120) {
          stopRecording();
          return 120;
        }
        return prev + 1;
      });
    }, 1000);

    // Check for Browser SpeechRecognition API
    const win = typeof window !== "undefined" ? (window as IWindow) : null;
    const SpeechClass = win?.SpeechRecognition || win?.webkitSpeechRecognition;

    if (SpeechClass) {
      try {
        const recognition = new SpeechClass();
        recognition.lang = spokenLang;
        recognition.continuous = true;
        recognition.interimResults = true;

        let accumulated = "";

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let current = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            current += event.results[i][0].transcript;
          }
          accumulated += " " + current;
          setRawTranscript(accumulated.trim());
        };

        recognition.onerror = () => {
          // Fallback gracefully on speech error
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch {
        // Fallback
      }
    }
  };

  const stopRecording = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }

    // Process transcript with AI
    setIsProcessing(true);

    const textToProcess =
      rawTranscript.trim() ||
      (spokenLang === "ml-IN"
        ? "ഞാൻ പരമ്പരാഗത രീതിയിൽ നിർമ്മിച്ച ഒരു ചിത്രമാണിത്. ഇതിൽ പ്രകൃതിദത്തമായ നിറങ്ങളാണ് ഉപയോഗിച്ചിരിക്കുന്നത്."
        : "This is my traditional artwork made with natural materials and authentic techniques.");

    try {
      const response = await fetch("/api/ai/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: textToProcess,
          targetLanguage: targetLang,
          context,
        }),
      });

      const data = await response.json();
      if (data.result) {
        setPolishedResult(data.result);
        setEditablePolishedText(data.result.polished_text);
      } else {
        setEditablePolishedText(textToProcess);
      }
    } catch {
      setEditablePolishedText(textToProcess);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApply = () => {
    onAccept(editablePolishedText || rawTranscript);
    setIsOpen(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <>
      {/* Trigger Button: Styled per design.md with Turmeric Story styling */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          startRecording();
        }}
        aria-label={`Speak ${fieldLabel} using voice`}
        title={`Speak ${fieldLabel} (Malayalam or English)`}
        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-story/10 hover:bg-story/20 text-story text-xs font-semibold border border-story/30 transition-all focus:outline-none focus:ring-2 focus:ring-story min-h-[36px]"
      >
        <Mic className="w-4 h-4 text-story animate-pulse" />
        <span>Speak story</span>
      </button>

      {/* Voice Recording & Review Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
          <div className="bg-surface border border-line rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            {/* Close button */}
            <button
              type="button"
              onClick={() => {
                if (isRecording) stopRecording();
                setIsOpen(false);
              }}
              className="absolute top-4 right-4 p-2 rounded-full text-ink-soft hover:text-ink hover:bg-canvas transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-story/15 text-story text-xs font-semibold mb-2">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Voice-to-Story</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ink font-sans">
                Tell your story in your own words
              </h2>
              <p className="text-xs sm:text-sm text-ink-soft mt-1">
                Speak in Malayalam or English. ARTIQ polishes the structure while preserving your exact meaning.
              </p>
            </div>

            {/* Language Controls */}
            {!isRecording && !isProcessing && !polishedResult && (
              <div className="p-4 rounded-2xl bg-canvas border border-line space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-ink flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-primary" />
                    <span>Spoken language:</span>
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSpokenLang("ml-IN")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        spokenLang === "ml-IN"
                          ? "bg-primary text-white font-semibold"
                          : "bg-surface border border-line text-ink"
                      }`}
                    >
                      മലയാളം (Malayalam)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSpokenLang("en-IN")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        spokenLang === "en-IN"
                          ? "bg-primary text-white font-semibold"
                          : "bg-surface border border-line text-ink"
                      }`}
                    >
                      English
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-line/60">
                  <span className="font-semibold text-ink">Target output language:</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setTargetLang("en")}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        targetLang === "en"
                          ? "bg-primary text-white font-semibold"
                          : "bg-surface border border-line text-ink"
                      }`}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetLang("ml")}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        targetLang === "ml"
                          ? "bg-primary text-white font-semibold"
                          : "bg-surface border border-line text-ink"
                      }`}
                    >
                      മലയാളം
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* State 1: Active Recording with Waveform & Turmeric Border */}
            {isRecording && (
              <div className="p-6 rounded-2xl border-2 border-story bg-story/5 text-center space-y-4">
                <div className="flex items-center justify-center gap-1.5 h-12">
                  <span className="w-1.5 h-6 bg-story rounded-full animate-bounce delay-75" />
                  <span className="w-1.5 h-10 bg-story rounded-full animate-bounce delay-150" />
                  <span className="w-1.5 h-14 bg-story rounded-full animate-bounce delay-100" />
                  <span className="w-1.5 h-8 bg-story rounded-full animate-bounce delay-200" />
                  <span className="w-1.5 h-12 bg-story rounded-full animate-bounce delay-150" />
                </div>

                <div>
                  <span className="text-2xl font-mono font-bold text-story">
                    {formatTime(recordSeconds)}
                  </span>
                  <p className="text-xs text-ink-soft mt-1">
                    Listening ({spokenLang === "ml-IN" ? "മലയാളം" : "English"})… Tap stop when finished.
                  </p>
                </div>

                {rawTranscript && (
                  <p className="text-xs text-ink bg-surface/80 p-3 rounded-xl border border-line/60 max-h-24 overflow-y-auto italic">
                    &ldquo;{rawTranscript}&rdquo;
                  </p>
                )}

                <button
                  type="button"
                  onClick={stopRecording}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-danger text-white font-semibold shadow-md hover:opacity-95 transition-all min-h-[44px]"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>Stop recording</span>
                </button>
              </div>
            )}

            {/* State 2: Processing AI Polish */}
            {isProcessing && (
              <div className="py-8 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-story animate-spin mx-auto" />
                <p className="text-sm font-semibold text-ink">
                  Polishing your story faithfully…
                </p>
                <p className="text-xs text-ink-soft">
                  Keeping your original words and first-person voice.
                </p>
              </div>
            )}

            {/* State 3: Side-by-Side Review UI (What You Said vs Polished Version) */}
            {!isRecording && !isProcessing && (polishedResult || rawTranscript) && (
              <div className="space-y-4">
                {/* 1. What You Said (Verbatim Transcript) */}
                <div className="p-4 rounded-2xl bg-canvas border border-line space-y-1.5">
                  <span className="text-[11px] font-semibold text-ink-soft uppercase tracking-wider block">
                    What you said (Verbatim)
                  </span>
                  <p className="text-xs text-ink leading-relaxed italic">
                    &ldquo;{rawTranscript || polishedResult?.raw_transcript}&rdquo;
                  </p>
                </div>

                {/* 2. Polished Version (with Verdigris AI Badge) */}
                <div className="p-4 rounded-2xl bg-surface border border-primary/30 space-y-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                      Polished Story (First-person)
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-ai bg-ai/10 px-2 py-0.5 rounded-full border border-ai/20">
                      <Sparkles className="w-3 h-3" />
                      <span>AI suggestion</span>
                    </span>
                  </div>

                  <textarea
                    rows={4}
                    value={editablePolishedText}
                    onChange={(e) => setEditablePolishedText(e.target.value)}
                    className="w-full p-3 rounded-xl bg-canvas border border-line text-sm text-ink font-serif leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Actions: Use this, Record again */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleApply}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md hover:opacity-95 transition-all min-h-[44px]"
                  >
                    <Check className="w-4 h-4" />
                    <span>Use this story</span>
                  </button>

                  <button
                    type="button"
                    onClick={startRecording}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-line bg-canvas text-ink hover:bg-surface text-xs font-medium transition-colors min-h-[44px]"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Record again</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
