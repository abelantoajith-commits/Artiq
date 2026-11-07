import * as React from "react"
import { cn } from "cn"

export function AISuggestionBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-sprout border-[1.5px] border-moss select-none",
        className
      )}
    >
      <span className="w-2 h-2 rounded-full bg-moss inline-block flex-shrink-0" />
      <span className="font-mono text-[11px] font-bold text-espresso uppercase tracking-wider">
        AI SUGGESTION
      </span>
    </div>
  )
}

export function ProcessBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded-[4px] bg-sprout border border-moss font-mono text-[10px] font-bold text-espresso tracking-wider uppercase select-none",
        className
      )}
    >
      PROCESS
    </span>
  )
}

export function FeaturedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-[6px] bg-sand border-[1.5px] border-espresso font-mono text-[11px] font-bold text-espresso uppercase tracking-wider shadow-hard-sm select-none",
        className
      )}
    >
      FEATURED WORK
    </span>
  )
}

export function StoryTag({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-[4px] bg-sand-tint border border-espresso/30 font-mono text-[10px] font-bold text-espresso uppercase tracking-wider select-none",
        className
      )}
    >
      IN THE ARTIST&apos;S WORDS
    </span>
  )
}

