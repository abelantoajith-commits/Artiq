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
let activeAudio: HTMLAudioElement | null = null;

export function isCurrentlySpeaking(): boolean {
  return activeUtterance !== null || (activeAudio !== null && !activeAudio.paused);
}

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined";
}

export function stopSpeech(): void {
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    } catch {
      // ignore
    }
    activeAudio = null;
  }

  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }

  activeUtterance = null;
}

function playAudioStream(text: string, lang: string, options: SpeakOptions): void {
  const { onStart, onEnd, onError } = options;

  try {
    const url = `/api/ai/tts?lang=${encodeURIComponent(lang)}&text=${encodeURIComponent(text)}`;
    const audio = new Audio(url);
    activeAudio = audio;

    audio.onplay = () => {
      onStart?.();
    };

    audio.onended = () => {
      activeAudio = null;
      onEnd?.();
    };

    audio.onerror = (e) => {
      activeAudio = null;
      onError?.(e);
      onEnd?.();
    };

    audio.play().catch((err) => {
      activeAudio = null;
      // Usually user gesture or autoplay policy
      onError?.(err);
      onEnd?.();
    });
  } catch (err) {
    activeAudio = null;
    onError?.(err);
    onEnd?.();
  }
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

  // Malayalam audio fallback:
  // Virtually all desktop and mobile browsers do not have offline Malayalam TTS voices installed.
  // We stream high-quality authentic native Malayalam audio via our dedicated server endpoint.
  if (lang === "ml") {
    playAudioStream(text, "ml", options);
    return;
  }

  // For English: Try native Web Speech API first
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      activeUtterance = utterance;

      const voices = window.speechSynthesis.getVoices();
      const enVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().includes("en-in") ||
          v.lang.toLowerCase().includes("en_in") ||
          v.name.toLowerCase().includes("india") ||
          v.lang.toLowerCase().startsWith("en")
      );
      if (enVoice) utterance.voice = enVoice;

      utterance.lang = "en-IN";
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
        // If native voice fails or is unavailable, fallback to audio stream
        if (e.error === "language-unavailable" || e.error === "voice-unavailable" || e.error === "network") {
          playAudioStream(text, "en", options);
        } else {
          if (e.error !== "canceled" && e.error !== "interrupted") {
            onError?.(e);
          }
          onEnd?.();
        }
      };

      window.speechSynthesis.speak(utterance);
      return;
    } catch {
      // Fall through to audio stream fallback
    }
  }

  // Fallback to audio stream if speech synthesis is unavailable
  playAudioStream(text, "en", options);
}
