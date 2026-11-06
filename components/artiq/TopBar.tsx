"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Search, Bell, Sun, Moon } from "lucide-react";
import Link from "next/link";

interface TopBarProps {
  onSearchClick?: () => void;
}

export function TopBar({ onSearchClick }: TopBarProps) {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  return (
    <header className="sticky top-0 z-30 bg-canvas/90 backdrop-blur-md border-b border-line px-4 py-3">
      <div className="flex items-center justify-between max-w-5xl mx-auto">
        <div>
          <Link href="/" className="inline-block">
            <h1 className="text-xl font-bold tracking-tight text-ink font-sans">
              ARTIQ
            </h1>
          </Link>
          <p className="text-xs text-ink-soft hidden sm:block">
            Every Artist Deserves to Be Seen.
          </p>
        </div>

        {/* Action Buttons: Search, Notifications, Theme Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Search Button (M2 placeholder for Phase 6) */}
          <button
            type="button"
            onClick={onSearchClick}
            aria-label="Search artworks and artists"
            className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl text-ink-soft hover:text-ink hover:bg-surface border border-transparent hover:border-line transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <Search className="w-5 h-5" aria-hidden="true" />
          </button>

          {/* Notifications Bell (Placeholder) */}
          <button
            type="button"
            aria-label="Notifications"
            className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl text-ink-soft hover:text-ink hover:bg-surface border border-transparent hover:border-line transition-colors relative focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <Bell className="w-5 h-5" aria-hidden="true" />
            <span
              className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-story ring-2 ring-canvas"
              title="New updates"
            />
          </button>

          {/* Dark / Light Theme Toggle */}
          {mounted && (
            <button
              type="button"
              aria-label="Toggle colour theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl text-ink-soft hover:text-ink hover:bg-surface border border-transparent hover:border-line transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-story" aria-hidden="true" />
              ) : (
                <Moon className="w-5 h-5 text-primary" aria-hidden="true" />
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
