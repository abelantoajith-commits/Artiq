"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Artwork } from "@/types/art"
import { FeaturedBadge } from "@/components/artiq/Badges"
import { ArtistAvatar } from "@/components/artiq/ArtistAvatar"
import { ArrowRight } from "lucide-react"

interface FeatureCardProps {
  artwork: Artwork
  onOpenDetail?: (artwork: Artwork) => void
}

export function FeatureCard({ artwork, onOpenDetail }: FeatureCardProps) {
  const quoteText =
    artwork.caption ||
    artwork.description ||
    "Every piece carries the soil, sunlight, and living heritage of our artisan tradition."

  const profileUrl = artwork.artist?.username
    ? `/artist/${artwork.artist.username}`
    : `/profile`

  return (
    <article
      onClick={() => onOpenDetail?.(artwork)}
      className="relative w-full rounded-[16px] overflow-hidden bg-transparent cursor-pointer group"
    >
      {/* 1. Artwork Presentation: 4:5 Aspect, softly rounded 16px, zero border, zero shadow */}
      <div className="relative w-full aspect-[4/5] rounded-[16px] overflow-hidden bg-mist">
        {/* Top-Left FEATURED WORK Tag */}
        <div className="absolute top-3 left-3 z-10">
          <FeaturedBadge />
        </div>

        {artwork.image_url && (
          <Image
            src={artwork.image_url}
            alt={artwork.title}
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            priority
          />
        )}
      </div>

      {/* 2. Quote Block: Sand-tint background with 2px Espresso border */}
      <div className="mt-2.5 p-4 rounded-[12px] bg-sand-tint border-2 border-espresso shadow-hard-sm">
        <blockquote className="font-serif italic text-[18px] leading-[26px] text-espresso max-w-[56ch]">
          &ldquo;{quoteText}&rdquo;
        </blockquote>

        {/* Artist Metadata & Visit Button */}
        <div className="mt-3 pt-2.5 border-t border-espresso/20 flex items-center justify-between gap-3">
          <Link
            href={profileUrl}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 min-w-0 group/author hover:opacity-90 transition-opacity"
          >
            <ArtistAvatar artist={artwork.artist} size="sm" ringOverride="sand" />
            <div className="min-w-0">
              <p className="font-body font-bold text-xs text-espresso leading-none truncate group-hover/author:underline">
                {artwork.artist?.display_name || "Featured Artist"}
              </p>
              <p className="font-body text-[11px] text-bark leading-none mt-1 truncate">
                {artwork.artist?.location || "Kerala, India"}
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onOpenDetail?.(artwork)
            }}
            className="h-[36px] px-3.5 rounded-[10px] bg-white border-2 border-espresso text-espresso font-body font-bold text-xs shadow-hard-sm btn-hard flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-forest flex-shrink-0"
          >
            <span>Visit</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-espresso" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </article>
  )
}
