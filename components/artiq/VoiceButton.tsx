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
import { AISuggestionBadge } from "@/components/artiq/Badges";

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
  visualDescription?: string;
  onRecordingChange?: (isRecording: boolean) => void;
}

export function VoiceButton({
  onAccept,
  context = "artwork_story",
  fieldLabel = "your story",
  visualDescription,
  onRecordingChange,
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
      onRecordingChange?.(true);
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
    onRecordingChange?.(false);

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
          visualDescription,
          targetLanguage: targetLang,
          context,
        }),
      });

      const data = await response.json();
      const unifiedText = data.text || data.result?.polished_text || text;
      if (data.result) {
        setPolishedResult({
          ...data.result,
          polished_text: unifiedText,
        });
        setEditablePolishedText(unifiedText);
      } else {
        setEditablePolishedText(unifiedText);
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
    onRecordingChange?.(false);
    setIsOpen(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <>
      {/* Trigger Button: Styled as physical craft sticker in Sand */}
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
        className="btn-hard inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-sand text-ink text-xs font-bold border-2 border-ink shadow-hard-sm transition-all focus:outline-none focus:ring-2 focus:ring-forest min-h-[38px]"
      >
        <Mic className="w-4 h-4 text-ink stroke-[2]" />
        <span>Speak story</span>
      </button>

      {/* Voice Recording & Review Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-espresso/40 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
        >
          <div className="bg-surface border-2 border-ink rounded-[24px] max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-hard-lg relative animate-in zoom-in-95 duration-200">
            {/* Close button */}
            <button
              type="button"
              onClick={() => {
                if (isRecording) stopRecording();
                setIsOpen(false);
              }}
              className="btn-hard absolute top-4 right-4 w-9 h-9 rounded-full bg-mist border-2 border-ink text-ink flex items-center justify-center shadow-hard-sm hover:bg-white"
              aria-label="Close"
            >
              <X className="w-4 h-4 stroke-[2]" />
            </button>

            {/* Modal Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-sand-tint border border-ink text-ink text-xs font-mono font-bold uppercase tracking-wider mb-2.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Voice-to-Story</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ink font-display">
                Tell your story in your own words
              </h2>
              <p className="text-xs sm:text-sm text-ink-soft mt-1.5 font-sans">
                Speak in Malayalam or English. ARTIQ polishes the flow while preserving your authentic voice.
              </p>
            </div>

            {/* Input Mode Switcher (Voice or Type) */}
            {!isRecording && !isProcessing && !polishedResult && (
              <div className="flex items-center gap-2 border-b-2 border-ink/15 pb-3">
                <button
                  type="button"
                  onClick={() => {
                    setInputMode("voice");
                    setMicError(null);
                  }}
                  className={`btn-hard flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-bold transition-colors ${
                    inputMode === "voice"
                      ? "bg-sand text-ink border-2 border-ink shadow-hard-sm"
                      : "bg-white text-ink border-2 border-ink/40 shadow-none hover:border-ink"
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
                  className={`btn-hard flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-bold transition-colors ${
                    inputMode === "type"
                      ? "bg-sand text-ink border-2 border-ink shadow-hard-sm"
                      : "bg-white text-ink border-2 border-ink/40 shadow-none hover:border-ink"
                  }`}
                >
                  <Keyboard className="w-3.5 h-3.5" />
                  <span>Type / Paste Notes</span>
                </button>
              </div>
            )}

            {/* Language Controls */}
            {!isRecording && !isProcessing && !polishedResult && (
              <div className="p-4 rounded-2xl bg-canvas border-2 border-ink space-y-3 shadow-hard-sm">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-ink flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-ink" />
                    <span>Spoken language:</span>
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSpokenLang("ml-IN")}
                      className={`btn-hard px-3 py-1.5 rounded-[8px] text-xs font-bold transition-colors ${
                        spokenLang === "ml-IN"
                          ? "bg-leaf text-ink border-2 border-ink shadow-hard-sm"
                          : "bg-white border-2 border-ink/40 text-ink shadow-none hover:border-ink"
                      }`}
                    >
                      മലയാളം (Malayalam)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSpokenLang("en-IN")}
                      className={`btn-hard px-3 py-1.5 rounded-[8px] text-xs font-bold transition-colors ${
                        spokenLang === "en-IN"
                          ? "bg-leaf text-ink border-2 border-ink shadow-hard-sm"
                          : "bg-white border-2 border-ink/40 text-ink shadow-none hover:border-ink"
                      }`}
                    >
                      English
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2.5 border-t-2 border-ink/10">
                  <span className="font-bold text-ink">Target output language:</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setTargetLang("en")}
                      className={`btn-hard px-3 py-1 rounded-[8px] text-xs font-bold transition-colors ${
                        targetLang === "en"
                          ? "bg-leaf text-ink border-2 border-ink shadow-hard-sm"
                          : "bg-white border-2 border-ink/40 text-ink shadow-none hover:border-ink"
                      }`}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetLang("ml")}
                      className={`btn-hard px-3 py-1 rounded-[8px] text-xs font-bold transition-colors ${
                        targetLang === "ml"
                          ? "bg-leaf text-ink border-2 border-ink shadow-hard-sm"
                          : "bg-white border-2 border-ink/40 text-ink shadow-none hover:border-ink"
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
                className="p-3.5 rounded-xl bg-clay/15 border-2 border-clay text-ink text-xs flex items-start gap-2 font-medium"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-clay" />
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
                  className="w-full p-3.5 rounded-[10px] bg-white border-2 border-ink text-sm text-ink font-serif leading-relaxed focus:outline-none focus:ring-2 focus:ring-forest"
                />
                <button
                  type="button"
                  onClick={handleManualSubmit}
                  disabled={!manualText.trim()}
                  className="btn-hard w-full flex items-center justify-center gap-2 py-3 px-5 rounded-[10px] bg-leaf text-ink font-bold shadow-hard transition-all disabled:opacity-50 min-h-[48px]"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Polish with AI</span>
                </button>
              </div>
            )}

            {/* Mode 2: Start Record Trigger (60px Sand microphone button) */}
            {inputMode === "voice" && !isRecording && !isProcessing && !polishedResult && (
              <div className="text-center py-4 space-y-4">
                <button
                  type="button"
                  onClick={startRecording}
                  className="btn-hard w-20 h-20 mx-auto rounded-full bg-sand border-2 border-ink text-ink flex items-center justify-center shadow-hard hover:scale-105 active:scale-95 transition-transform"
                >
                  <Mic className="w-8 h-8 stroke-[2]" />
                </button>
                <p className="text-xs text-ink-soft">
                  Click to speak. Audio will be captured and transcribed via Gemini Multimodal AI.
                </p>
              </div>
            )}

            {/* State: Active Recording with Waveform */}
            {isRecording && (
              <div className="p-6 rounded-2xl border-2 border-ink bg-sand-tint text-center space-y-4 shadow-hard-sm">
                <div className="flex items-center justify-center gap-1.5 h-12">
                  <span className="w-2 h-6 bg-sand border border-ink rounded-full animate-bounce delay-75" />
                  <span className="w-2 h-10 bg-sand border border-ink rounded-full animate-bounce delay-150" />
                  <span className="w-2 h-14 bg-sand border border-ink rounded-full animate-bounce delay-100" />
                  <span className="w-2 h-8 bg-sand border border-ink rounded-full animate-bounce delay-200" />
                  <span className="w-2 h-12 bg-sand border border-ink rounded-full animate-bounce delay-150" />
                </div>

                <div>
                  <span className="text-2xl font-mono font-bold text-ink">
                    {formatTime(recordSeconds)}
                  </span>
                  <p className="text-xs text-ink-soft mt-1">
                    Recording ({spokenLang === "ml-IN" ? "മലയാളം" : "English"})… Tap stop when finished.
                  </p>
                </div>

                {rawTranscript && (
                  <p className="text-xs text-ink bg-white p-3 rounded-xl border-2 border-ink max-h-24 overflow-y-auto italic font-serif">
                    &ldquo;{rawTranscript}&rdquo;
                  </p>
                )}

                <button
                  type="button"
                  onClick={stopRecording}
                  className="btn-hard inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[10px] bg-clay text-ink font-bold shadow-hard-sm min-h-[48px]"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>Stop recording</span>
                </button>
              </div>
            )}

            {/* State: Processing AI Transcription & Polish */}
            {isProcessing && (
              <div className="py-8 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-ink animate-spin mx-auto" />
                <p className="text-sm font-bold text-ink">
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
                <div className="p-4 rounded-2xl bg-canvas border-2 border-ink/20 space-y-1.5">
                  <span className="text-[11px] font-bold text-ink-soft uppercase tracking-wider font-mono block">
                    What you said (Verbatim)
                  </span>
                  <p className="text-xs text-ink leading-relaxed italic font-serif">
                    &ldquo;{rawTranscript || polishedResult?.raw_transcript}&rdquo;
                  </p>
                </div>

                {/* 2. Polished Version (with AISuggestionBadge) */}
                <div className="p-4 rounded-2xl bg-surface border-2 border-ink space-y-2 shadow-hard-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-ink uppercase tracking-wider font-mono">
                      {visualDescription ? "Merged 'About this artwork'" : "Polished Story (First-person)"}
                    </span>
                    <AISuggestionBadge />
                  </div>

                  <textarea
                    rows={4}
                    value={editablePolishedText}
                    onChange={(e) => setEditablePolishedText(e.target.value)}
                    className="w-full p-3 rounded-[10px] bg-white border-2 border-ink text-sm text-ink font-serif leading-relaxed focus:outline-none focus:ring-2 focus:ring-forest"
                  />
                </div>

                {/* Actions: Use this, Record again */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleApply}
                    className="btn-hard flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-[10px] bg-leaf text-ink font-bold shadow-hard min-h-[48px]"
                  >
                    <Check className="w-4 h-4 stroke-[2]" />
                    <span>Use this</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPolishedResult(null);
                      setRawTranscript("");
                      setInputMode("voice");
                      startRecording();
                    }}
                    className="btn-hard flex items-center justify-center gap-2 py-3 px-4 rounded-[10px] bg-white border-2 border-ink text-ink font-bold text-xs shadow-hard-sm min-h-[48px]"
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
