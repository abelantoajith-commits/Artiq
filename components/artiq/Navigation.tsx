"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Home, Plus, User } from "lucide-react";

export function Navigation() {
  const pathname = usePathname();
  const [targetPath, setTargetPath] = useState<string | null>(null);

  // Clear optimistic selection once pathname matches
  if (targetPath === pathname) {
    setTargetPath(null);
  }

  const activePath = targetPath ?? pathname;
  const isHome = activePath === "/" || activePath.startsWith("/artwork");
  const isCreate = activePath.startsWith("/create");
  const isProfile =
    activePath.startsWith("/profile") ||
    activePath.startsWith("/login") ||
    activePath.startsWith("/register");

  return (
    <>
      {/* Mobile Bottom Navigation (Fixed) */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-md border-t border-line md:hidden pb-[env(safe-area-inset-bottom)]"
      >
        <div className="flex items-center justify-around h-16 max-w-md mx-auto px-4 relative">
          {/* Home Button */}
          <Link
            href="/"
            prefetch={true}
            onClick={() => setTargetPath("/")}
            aria-label="Home"
            aria-current={isHome ? "page" : undefined}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] px-2 py-1 rounded-xl transition-all cursor-pointer select-none active:scale-95 ${
              isHome
                ? "text-primary font-semibold"
                : "text-ink-soft hover:text-ink font-normal"
            }`}
          >
            <Home className="w-5 h-5" aria-hidden="true" />
            <span className="text-[11px] mt-0.5 tracking-tight">Home</span>
            {isHome && (
              <span className="w-1 h-1 rounded-full bg-primary mt-0.5 animate-in fade-in zoom-in duration-200" />
            )}
          </Link>

          {/* Create Button (Raised Indigo Circle) */}
          <div className="relative -top-3">
            <Link
              href="/create"
              prefetch={true}
              onClick={() => setTargetPath("/create")}
              aria-label="Create artwork listing"
              aria-current={isCreate ? "page" : undefined}
              className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-95 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer"
            >
              <Plus className="w-7 h-7" strokeWidth={2.5} aria-hidden="true" />
            </Link>
          </div>

          {/* Profile Button */}
          <Link
            href="/profile"
            prefetch={true}
            onClick={() => setTargetPath("/profile")}
            aria-label="Artist Profile"
            aria-current={isProfile ? "page" : undefined}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] px-2 py-1 rounded-xl transition-all cursor-pointer select-none active:scale-95 ${
              isProfile
                ? "text-primary font-semibold"
                : "text-ink-soft hover:text-ink font-normal"
            }`}
          >
            <User className="w-5 h-5" aria-hidden="true" />
            <span className="text-[11px] mt-0.5 tracking-tight">Profile</span>
            {isProfile && (
              <span className="w-1 h-1 rounded-full bg-primary mt-0.5 animate-in fade-in zoom-in duration-200" />
            )}
          </Link>
        </div>
      </nav>

      {/* Desktop Left Rail Navigation (From md: up) */}
      <aside
        aria-label="Desktop Navigation"
        className="hidden md:flex flex-col fixed top-0 left-0 bottom-0 w-64 bg-surface border-r border-line p-6 z-50"
      >
        <div className="mb-8">
          <Link
            href="/"
            prefetch={true}
            onClick={() => setTargetPath("/")}
            className="inline-block cursor-pointer"
          >
            <span className="text-2xl font-bold tracking-tight text-ink font-sans">
              ARTIQ
            </span>
          </Link>
          <p className="text-xs text-ink-soft mt-1 leading-snug">
            Every Artist Deserves to Be Seen.
          </p>
        </div>

        {/* Create (+) action at the top as specified in design.md section 4 */}
        <Link
          href="/create"
          prefetch={true}
          onClick={() => setTargetPath("/create")}
          className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-medium shadow-sm hover:opacity-95 transition-all mb-8 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Create Artwork</span>
        </Link>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-2">
          <Link
            href="/"
            prefetch={true}
            onClick={() => setTargetPath("/")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors cursor-pointer ${
              isHome
                ? "bg-primary/10 text-primary font-semibold"
                : "text-ink-soft hover:text-ink hover:bg-canvas font-normal"
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </Link>

          <Link
            href="/profile"
            prefetch={true}
            onClick={() => setTargetPath("/profile")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors cursor-pointer ${
              isProfile
                ? "bg-primary/10 text-primary font-semibold"
                : "text-ink-soft hover:text-ink hover:bg-canvas font-normal"
            }`}
          >
            <User className="w-5 h-5" />
            <span>Profile</span>
          </Link>
        </nav>
      </aside>
    </>
  );
}

