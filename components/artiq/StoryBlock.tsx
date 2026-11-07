import * as React from "react"
import { cn } from "cn"
import { StoryTag } from "@/components/artiq/Badges"
import { ArtistAvatar } from "@/components/artiq/ArtistAvatar"

interface StoryBlockProps {
  quote: string
  artist?: {
    display_name?: string
    location?: string
    avatar_url?: string
    id?: string
  }
  showTag?: boolean
  isArtistVoice?: boolean
  className?: string
  children?: React.ReactNode
}

export function StoryBlock({
  quote,
  artist,
  showTag = true,
  isArtistVoice,
  className,
  children,
}: StoryBlockProps) {
  const displayTag = isArtistVoice !== undefined ? isArtistVoice : showTag;
  return (
    <div
      className={cn(
        "relative p-5 rounded-[12px] bg-sand-tint border-2 border-espresso border-l-4 border-l-espresso shadow-hard-sm",
        className
      )}
    >
      {displayTag && (
        <div className="mb-2.5">
          <StoryTag />
        </div>
      )}

      <blockquote className="font-serif italic text-[18px] leading-[28px] text-espresso max-w-[60ch]">
        &ldquo;{quote}&rdquo;
      </blockquote>

      {artist && (
        <div className="mt-4 pt-3 border-t border-espresso/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <ArtistAvatar artist={artist} size="sm" />
            <div className="min-w-0">
              <p className="font-body font-bold text-xs text-espresso truncate">
                {artist.display_name || "Artist"}
              </p>
              {artist.location && (
                <p className="font-body text-[11px] text-bark truncate">
                  {artist.location}
                </p>
              )}
            </div>
          </div>
          {children}
        </div>
      )}
    </div>
  )
}

