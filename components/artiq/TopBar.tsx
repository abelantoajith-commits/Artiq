"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore, useState } from "react";
import { Search, Bell, Sun, Moon, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface TopBarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function TopBar({ searchQuery = "", onSearchChange }: TopBarProps) {
  const { theme, setTheme } = useTheme();
  const [hasNotification, setHasNotification] = useState(true);

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  return (
    <header className="w-full space-y-2.5 pt-2 pb-1">
      {/* 1. Header Row: Wordmark + Notification Stamp + Theme Switcher */}
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-1.5 focus:outline-none">
          <h1 className="font-display font-extrabold text-[32px] leading-tight text-espresso tracking-tight">
            artiq
          </h1>
          <span className="w-2 h-2 rounded-full bg-leaf border border-espresso inline-block" />
        </Link>

        <div className="flex items-center gap-2">
          {/* Theme Switcher Stamp */}
          {mounted && (
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle dark mode"
              className="w-[44px] h-[44px] rounded-[10px] bg-surface border-2 border-espresso shadow-hard-sm btn-hard flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-2 cursor-pointer"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 stroke-espresso" strokeWidth={2} />
              ) : (
                <Moon className="w-5 h-5 stroke-espresso" strokeWidth={2} />
              )}
            </button>
          )}

          {/* Notification Button: 44px square hard stamp with Clay dot */}
          <button
            type="button"
            onClick={() => {
              setHasNotification(false);
              toast("No new notifications", {
                description: "You're all caught up with Kerala craft updates.",
              });
            }}
            aria-label="Notifications"
            className="w-[44px] h-[44px] rounded-[10px] bg-surface border-2 border-espresso shadow-hard-sm btn-hard relative flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-2 cursor-pointer"
          >
            <Bell className="w-5 h-5 stroke-espresso fill-none" strokeWidth={2} />
            {hasNotification && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-clay border-[1.5px] border-espresso" />
            )}
          </button>
        </div>
      </div>

      {/* 2. Soft Search Pill: Mist container (#EFEFEC), 48px height, 0px border, 0px shadow */}
      <div className="w-full">
        <div className="w-full h-[48px] rounded-full bg-mist px-4 flex items-center gap-3 transition-colors focus-within:ring-2 focus-within:ring-forest focus-within:ring-offset-1">
          <Search className="w-5 h-5 stroke-bark flex-shrink-0" strokeWidth={2} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder="Search artists, art, Kerala mural..."
            className="w-full bg-transparent text-sm text-espresso placeholder-bark outline-none font-body"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange && onSearchChange("")}
              className="p-1 text-bark hover:text-espresso"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
