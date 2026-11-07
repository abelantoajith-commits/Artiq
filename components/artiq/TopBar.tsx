"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore, useState } from "react";
import { Search, Bell, Sun, Moon, X } from "lucide-react";
import Link from "next/link";

interface TopBarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function TopBar({ searchQuery = "", onSearchChange }: TopBarProps) {
  const { theme, setTheme } = useTheme();
  const [isSearchVisible, setIsSearchVisible] = useState(Boolean(searchQuery));

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  return (
    <header className="sticky top-0 z-30 bg-canvas/90 backdrop-blur-md border-b border-line px-4 py-3">
      <div className="flex items-center justify-between max-w-5xl mx-auto gap-3">
        {/* Brand / Logo */}
        {!isSearchVisible && (
          <div className="flex-shrink-0">
            <Link href="/" className="inline-block">
              <h1 className="text-xl font-bold tracking-tight text-ink font-sans">
                ARTIQ
              </h1>
            </Link>
            <p className="text-xs text-ink-soft hidden sm:block">
              Every Artist Deserves to Be Seen.
            </p>
          </div>
        )}

        {/* Search Field (Expands smoothly on click) */}
        {isSearchVisible ? (
          <div className="flex-1 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150">
            <div className="relative flex-1 flex items-center">
              <Search className="w-4 h-4 text-ink-soft absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                placeholder="Search titles, about text, categories, artist specialities…"
                className="w-full pl-10 pr-9 py-2 rounded-xl bg-surface border border-line text-xs sm:text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-primary min-h-[40px]"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange && onSearchChange("")}
                  className="absolute right-3 text-xs text-ink-soft hover:text-ink p-1"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setIsSearchVisible(false);
                if (onSearchChange) onSearchChange("");
              }}
              className="px-3 py-2 text-xs font-semibold text-ink-soft hover:text-ink min-h-[40px]"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {/* Action Buttons */}
        {!isSearchVisible && (
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Search Trigger */}
            <button
              type="button"
              onClick={() => setIsSearchVisible(true)}
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
        )}
      </div>
    </header>
  );
}
