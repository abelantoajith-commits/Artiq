"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

export type KikoState = "idle" | "speaking" | "listening" | "celebrating";

interface KikoAvatarProps {
  state?: KikoState;
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
}

export function KikoAvatar({
  state = "idle",
  size = "md",
  className,
  onClick,
}: KikoAvatarProps) {
  const clipId = useId();

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-20 h-20 sm:w-24 sm:h-24",
    lg: "w-28 h-28 sm:w-32 sm:h-32",
  }[size];

  const isSpeaking = state === "speaking";
  const isListening = state === "listening";
  const isCelebrating = state === "celebrating";

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative rounded-full bg-sand-tint border-2 border-espresso flex items-center justify-center flex-shrink-0 shadow-hard-sm transition-transform select-none",
        sizeClasses,
        isSpeaking && "ring-2 ring-leaf ring-offset-2",
        onClick && "cursor-pointer hover:scale-105 active:scale-95",
        className
      )}
      title="Kiko - Your Art Companion"
      aria-label={`Kiko is ${state}`}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full p-1 overflow-visible"
      >
        <defs>
          <clipPath id={clipId}>
            <circle cx="50" cy="50" r="46" />
          </clipPath>
        </defs>

        <g clipPath={`url(#${clipId})`}>
          {/* Background Aura */}
          <circle cx="50" cy="50" r="48" fill="#F8F7F3" />

          {/* Body / Tunic (Sand) */}
          <path
            d="M26 82 C26 68, 38 65, 50 65 C62 65, 74 68, 74 82 L76 100 L24 100 Z"
            fill="#CDAA8A"
            stroke="#4A3526"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Apron Pocket */}
          <path
            d="M42 75 H58 V88 C58 90, 56 92, 54 92 H46 C44 92, 42 90, 42 88 Z"
            fill="#FDFBF7"
            stroke="#4A3526"
            strokeWidth="2"
          />

          {/* Mini Paintbrush in Pocket */}
          <path d="M46 75 L44 68 L48 68 Z" fill="#6B8A4A" stroke="#4A3526" strokeWidth="1.5" />
          <path d="M45 68 L45 63" stroke="#4A3526" strokeWidth="2" strokeLinecap="round" />

          {/* Neck */}
          <rect x="45" y="58" width="10" height="9" fill="#FDFBF7" stroke="#4A3526" strokeWidth="2" />

          {/* Head */}
          <circle
            cx="50"
            cy="46"
            r="19"
            fill="#FDFBF7"
            stroke="#4A3526"
            strokeWidth="2.5"
          />

          {/* Rosy Cheeks (Clay) */}
          <ellipse cx="37" cy="51" rx="3.5" ry="2" fill="#E3B5A0" />
          <ellipse cx="63" cy="51" rx="3.5" ry="2" fill="#E3B5A0" />

          {/* Eyes */}
          {isCelebrating ? (
            // Happy crescent eyes
            <>
              <path
                d="M38 44 C40 40, 44 40, 46 44"
                stroke="#4A3526"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M54 44 C56 40, 60 40, 62 44"
                stroke="#4A3526"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </>
          ) : isListening ? (
            // Attentive wide eyes
            <>
              <circle cx="42" cy="45" r="3.5" fill="#4A3526" />
              <circle cx="43.5" cy="43.5" r="1.2" fill="#FFFFFF" />
              <circle cx="58" cy="45" r="3.5" fill="#4A3526" />
              <circle cx="59.5" cy="43.5" r="1.2" fill="#FFFFFF" />
            </>
          ) : (
            // Warm normal eyes with subtle blink
            <>
              <circle cx="42" cy="46" r="3" fill="#4A3526" className={!isSpeaking ? "animate-pulse" : ""} />
              <circle cx="43" cy="45" r="1" fill="#FFFFFF" />
              <circle cx="58" cy="46" r="3" fill="#4A3526" className={!isSpeaking ? "animate-pulse" : ""} />
              <circle cx="59" cy="45" r="1" fill="#FFFFFF" />
            </>
          )}

          {/* Nose */}
          <circle cx="50" cy="49" r="1" fill="#4A3526" />

          {/* Mouth */}
          {isSpeaking ? (
            // Animated speaking mouth
            <ellipse
              cx="50"
              cy="55"
              rx="4"
              ry="3"
              fill="#4A3526"
              className="animate-bounce"
            />
          ) : isCelebrating ? (
            // Broad joyful smile
            <path
              d="M44 53 Q50 60 56 53"
              stroke="#4A3526"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="#E3B5A0"
            />
          ) : (
            // Friendly calm smile
            <path
              d="M46 54 Q50 57 54 54"
              stroke="#4A3526"
              strokeWidth="2"
              strokeLinecap="round"
            />
          )}

          {/* Beret / Cap (Leaf) */}
          <path
            d="M30 40 C30 26, 68 22, 72 35 C74 41, 68 44, 52 42 C38 40, 30 44, 30 40 Z"
            fill="#C8E096"
            stroke="#4A3526"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Beret Stem */}
          <path d="M52 26 C53 23, 56 23, 57 25" stroke="#4A3526" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      </svg>

      {/* Floating Sound / State Badge */}
      {isSpeaking && (
        <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-leaf border-2 border-espresso flex items-center justify-center text-espresso text-[10px] shadow-hard-sm animate-pulse">
          🔊
        </span>
      )}

      {isListening && (
        <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-sand border-2 border-espresso flex items-center justify-center text-espresso text-[10px] shadow-hard-sm animate-bounce">
          👂
        </span>
      )}

      {isCelebrating && (
        <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-sprout border-2 border-espresso flex items-center justify-center text-espresso text-[10px] shadow-hard-sm">
          ✨
        </span>
      )}
    </div>
  );
}
