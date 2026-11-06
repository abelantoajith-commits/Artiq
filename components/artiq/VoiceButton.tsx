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
  Keyboard,
  AlertCircle,
} from "lucide-react";
import { StoryPolishResult } from "@/lib/ai/story";

// Web Speech API typed interfaces for real-time live preview
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
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);

  // Mode: voice or manual type
  const [inputMode, setInputMode] = useState<"voice" | "type">("voice");
  const [manualText, setManualText] = useState("");

  // Language settings
  const [spokenLang, setSpokenLang] = useState<"ml-IN" | "en-IN">("ml-IN");
  const [targetLang, setTargetLang] = useState<"en" | "ml">("en");

  // Transcript states
  const [rawTranscript, setRawTranscript] = useState("");
  const [polishedResult, setPolishedResult] = useState<StoryPolishResult | null>(null);
  const [editablePolishedText, setEditablePolishedText] = useState("");

  // MediaRecorder & WebSpeech refs
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const supportedMimeTypeRef = useRef<string>("audio/webm");

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
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    setMicError(null);
    setRawTranscript("");
    setPolishedResult(null);
    setRecordSeconds(0);
    audioChunksRef.current = [];

    // 1. Request microphone permission & start MediaRecorder
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      let mimeType = "audio/webm";
      if (typeof MediaRecorder !== "undefined" && typeof MediaRecorder.isTypeSupported === "function") {
        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
          mimeType = "audio/webm;codecs=opus";
        } else if (MediaRecorder.isTypeSupported("audio/webm")) {
          mimeType = "audio/webm";
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4";
        }
      }
      supportedMimeTypeRef.current = mimeType;

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      mediaRecorder.start(250); // Slice audio into chunks
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setIsProcessing(false);
    } catch (err) {
      console.warn("[VoiceButton] Microphone capture failed:", err);
      setMicError(
        "Microphone access unavailable or blocked. You can type your story in the text box below."
      );
      setInputMode("type");
      return;
    }

    // 2. Start timer
    timerRef.current = setInterval(() => {
      setRecordSeconds((prev) => {
        if (prev >= 120) {
          stopRecording();
          return 120;
        }
        return prev + 1;
      });
    }, 1000);

    // 3. Optional real-time preview via browser SpeechRecognition if supported
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
          accumulated = current;
          setRawTranscript(accumulated.trim());
        };

        recognition.onerror = () => {
          // Fall back gracefully to MediaRecorder + Gemini
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch {
        // MediaRecorder will handle it
      }
    }
  };

  const stopRecording = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);

    // Stop real-time WebSpeech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }

    // Stop hardware audio recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }

    // Release microphone hardware
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    setIsProcessing(true);
    setProcessingStatus("Listening to your audio recording…");

    // Wait 300ms for final audio chunks to settle
    await new Promise((r) => setTimeout(r, 300));

    let finalTranscript = rawTranscript.trim();

    // If we have recorded audio chunks, transcribe via Gemini Multimodal Audio
    if (audioChunksRef.current.length > 0) {
      try {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: supportedMimeTypeRef.current,
        });

        if (audioBlob.size > 2000) {
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve, reject) => {
            reader.onloadend = () => {
              const res = reader.result as string;
              const base64 = res.includes(",") ? res.split(",")[1] : res;
              resolve(base64);
            };
            reader.onerror = reject;
          });
          reader.readAsDataURL(audioBlob);
          const base64Audio = await base64Promise;

          setProcessingStatus("Transcribing spoken words with Gemini…");
          const transcribeRes = await fetch("/api/ai/transcribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              audioBase64: base64Audio,
              mimeType: supportedMimeTypeRef.current,
              language: spokenLang === "ml-IN" ? "ml" : "en",
            }),
          });

          if (transcribeRes.ok) {
            const transData = await transcribeRes.json();
            if (transData.transcript && transData.transcript.trim()) {
              finalTranscript = transData.transcript.trim();
              setRawTranscript(finalTranscript);
            }
          }
        }
      } catch (err) {
        console.warn("[VoiceButton] Multimodal audio transcription failed:", err);
      }
    }

    // Check if we captured any words
    if (!finalTranscript) {
      setIsProcessing(false);
      setMicError(
        "No speech was detected in your recording. Please try speaking closer to your microphone or type your story directly."
      );
      return;
    }

    // Polish story with Gemini AI
    await polishText(finalTranscript);
  };

  const polishText = async (text: string) => {
    setIsProcessing(true);
    setProcessingStatus("Polishing your story into a faithful first-person narrative…");

    try {
      const response = await fetch("/api/ai/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: text,
          targetLanguage: targetLang,
          context,
        }),
      });

      const data = await response.json();
      if (data.result) {
        setPolishedResult(data.result);
        setEditablePolishedText(data.result.polished_text);
      } else {
        setEditablePolishedText(text);
      }
    } catch {
      setEditablePolishedText(text);
    } finally {
      setIsProcessing(false);
      setProcessingStatus("");
    }
  };

  const handleManualSubmit = () => {
    if (!manualText.trim()) return;
    setRawTranscript(manualText.trim());
    polishText(manualText.trim());
  };

  const handleApply = () => {
    onAccept(editablePolishedText || rawTranscript || manualText);
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
          setMicError(null);
          // If starting in voice mode, trigger record
          if (inputMode === "voice") {
            startRecording();
          }
        }}
        aria-label={`Speak ${fieldLabel} using voice`}
        title={`Speak ${fieldLabel} (Malayalam or English)`}
        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-story/10 hover:bg-story/20 text-story text-xs font-semibold border border-story/30 transition-all focus:outline-none focus:ring-2 focus:ring-story min-h-[36px]"
      >
        <Mic className="w-4 h-4 text-story" />
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
                Speak in Malayalam or English. ARTIQ polishes the flow while preserving your authentic voice.
              </p>
            </div>

            {/* Input Mode Switcher (Voice or Type) */}
            {!isRecording && !isProcessing && !polishedResult && (
              <div className="flex items-center gap-2 border-b border-line pb-3">
                <button
                  type="button"
                  onClick={() => {
                    setInputMode("voice");
                    setMicError(null);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    inputMode === "voice"
                      ? "bg-story/15 text-story font-semibold"
                      : "text-ink-soft hover:text-ink"
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Voice Record</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputMode("type");
                    setMicError(null);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    inputMode === "type"
                      ? "bg-story/15 text-story font-semibold"
                      : "text-ink-soft hover:text-ink"
                  }`}
                >
                  <Keyboard className="w-3.5 h-3.5" />
                  <span>Type / Paste Notes</span>
                </button>
              </div>
            )}

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

            {/* Error Message if Mic Access Fails or No Speech Detected */}
            {micError && !isRecording && (
              <div
                role="alert"
                className="p-3.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p>{micError}</p>
                </div>
              </div>
            )}

            {/* Mode 1: Manual Type Option */}
            {inputMode === "type" && !isRecording && !isProcessing && !polishedResult && (
              <div className="space-y-3">
                <textarea
                  rows={4}
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  placeholder="Type your artist thoughts or raw speech notes here in Malayalam or English..."
                  className="w-full p-3 rounded-xl bg-canvas border border-line text-sm text-ink font-serif leading-relaxed focus:outline-none focus:ring-2 focus:ring-story"
                />
                <button
                  type="button"
                  onClick={handleManualSubmit}
                  disabled={!manualText.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md hover:opacity-95 transition-all disabled:opacity-50 min-h-[44px]"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Polish with AI</span>
                </button>
              </div>
            )}

            {/* Mode 2: Start Record Trigger (when not yet recording and not yet result) */}
            {inputMode === "voice" && !isRecording && !isProcessing && !polishedResult && (
              <div className="text-center py-4 space-y-4">
                <button
                  type="button"
                  onClick={startRecording}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-story text-white font-semibold shadow-md hover:opacity-95 active:scale-98 transition-all min-h-[48px]"
                >
                  <Mic className="w-5 h-5 animate-pulse" />
                  <span>Start recording audio</span>
                </button>
                <p className="text-xs text-ink-soft">
                  Click to speak. Audio will be captured and transcribed via Gemini Multimodal AI.
                </p>
              </div>
            )}

            {/* State: Active Recording with Waveform & Turmeric Border */}
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
                    Recording ({spokenLang === "ml-IN" ? "മലയാളം" : "English"})… Tap stop when finished.
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

            {/* State: Processing AI Transcription & Polish */}
            {isProcessing && (
              <div className="py-8 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-story animate-spin mx-auto" />
                <p className="text-sm font-semibold text-ink">
                  {processingStatus || "Polishing your story faithfully…"}
                </p>
                <p className="text-xs text-ink-soft">
                  Keeping your original words and first-person voice.
                </p>
              </div>
            )}

            {/* State: Side-by-Side Review UI (What You Said vs Polished Version) */}
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
                    onClick={() => {
                      setPolishedResult(null);
                      setRawTranscript("");
                      setInputMode("voice");
                      startRecording();
                    }}
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
