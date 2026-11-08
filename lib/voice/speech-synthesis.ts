"use client";

export interface SpeakOptions {
  text: string;
  lang?: "en" | "ml";
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: unknown) => void;
}

let activeUtterance: SpeechSynthesisUtterance | null = null;

export function isCurrentlySpeaking(): boolean {
  return activeUtterance !== null;
}

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function stopSpeech(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
  activeUtterance = null;
}

export function speakText(options: SpeakOptions): void {
  if (!isSpeechSupported()) {
    options.onEnd?.();
    return;
  }

  stopSpeech();

  const {
    text,
    lang = "en",
    rate = 0.95, // Friendly, clear pacing for artists
    pitch = 1.05, // Warm, youthful, approachable voice for Kiko
    onStart,
    onEnd,
    onError,
  } = options;

  if (!text.trim()) {
    onEnd?.();
    return;
  }

  try {
    const utterance = new SpeechSynthesisUtterance(text);
    activeUtterance = utterance;

    // Pick appropriate voice
    const voices = window.speechSynthesis.getVoices();
    if (lang === "ml") {
      utterance.lang = "ml-IN";
      const mlVoice = voices.find(
        (v) => v.lang.toLowerCase().includes("ml") || v.name.toLowerCase().includes("malayalam")
      );
      if (mlVoice) utterance.voice = mlVoice;
    } else {
      utterance.lang = "en-IN";
      const enVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().includes("en-in") ||
          v.lang.toLowerCase().includes("en_in") ||
          v.name.toLowerCase().includes("india") ||
          v.lang.toLowerCase().startsWith("en")
      );
      if (enVoice) utterance.voice = enVoice;
    }

    utterance.rate = rate;
    utterance.pitch = pitch;

    utterance.onstart = () => {
      onStart?.();
    };

    utterance.onend = () => {
      activeUtterance = null;
      onEnd?.();
    };

    utterance.onerror = (e) => {
      activeUtterance = null;
      // Many browsers report "canceled" or "interrupted" as error when user navigates
      if (e.error !== "canceled" && e.error !== "interrupted") {
        onError?.(e);
      }
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    activeUtterance = null;
    onError?.(err);
    onEnd?.();
  }
}
