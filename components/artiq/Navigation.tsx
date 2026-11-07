"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Home, Plus, User } from "lucide-react";
import { cn } from "cn";

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
    activePath.startsWith("/register") ||
    activePath.startsWith("/artist");

  return (
    <>
      {/* Mobile Bottom Navigation (Fixed 74px White Bar with 1.5px Espresso Top Border) */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-50 h-[74px] bg-surface border-t-[1.5px] border-espresso px-6 flex items-center justify-around select-none md:hidden pb-[env(safe-area-inset-bottom)]"
      >
        {/* Item 1: Home */}
        <Link
          href="/"
          prefetch={true}
          onClick={() => setTargetPath("/")}
          aria-label="Home"
          aria-current={isHome ? "page" : undefined}
          className="flex flex-col items-center justify-center gap-1 min-w-[56px] focus:outline-none group"
        >
          {isHome ? (
            <div className="w-10 h-7 rounded-full bg-leaf border border-espresso flex items-center justify-center shadow-[1px_1px_0px_var(--shadow-ink)]">
              <Home className="w-4 h-4 stroke-espresso" strokeWidth={2.5} />
            </div>
          ) : (
            <div className="w-10 h-7 flex items-center justify-center">
              <Home className="w-5 h-5 stroke-bark group-hover:stroke-espresso transition-colors" strokeWidth={2} />
            </div>
          )}
          <span
            className={cn(
              "font-body text-[11px] tracking-tight transition-colors",
              isHome
                ? "font-bold text-espresso"
                : "font-medium text-bark group-hover:text-espresso"
            )}
          >
            Home
          </span>
        </Link>

        {/* Item 2: Central Create Plus Button (60px Espresso circle, raised -20px, Moss hard shadow) */}
        <div className="relative -top-5 flex flex-col items-center">
          <Link
            href="/create"
            prefetch={true}
            onClick={() => setTargetPath("/create")}
            aria-label="Create artwork listing"
            aria-current={isCreate ? "page" : undefined}
            className="w-[60px] h-[60px] rounded-full bg-espresso border-2 border-espresso text-canvas flex items-center justify-center shadow-hard-moss transition-transform duration-100 hover:-translate-y-0.5 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-2 cursor-pointer"
          >
            <Plus className="w-7 h-7 stroke-canvas" strokeWidth={2.5} />
          </Link>
        </div>

        {/* Item 3: Profile */}
        <Link
          href="/profile"
          prefetch={true}
          onClick={() => setTargetPath("/profile")}
          aria-label="Profile"
          aria-current={isProfile ? "page" : undefined}
          className="flex flex-col items-center justify-center gap-1 min-w-[56px] focus:outline-none group"
        >
          {isProfile ? (
            <div className="w-10 h-7 rounded-full bg-leaf border border-espresso flex items-center justify-center shadow-[1px_1px_0px_var(--shadow-ink)]">
              <User className="w-4 h-4 stroke-espresso" strokeWidth={2.5} />
            </div>
          ) : (
            <div className="w-10 h-7 flex items-center justify-center">
              <User className="w-5 h-5 stroke-bark group-hover:stroke-espresso transition-colors" strokeWidth={2} />
            </div>
          )}
          <span
            className={cn(
              "font-body text-[11px] tracking-tight transition-colors",
              isProfile
                ? "font-bold text-espresso"
                : "font-medium text-bark group-hover:text-espresso"
            )}
          >
            Profile
          </span>
        </Link>
      </nav>

      {/* Desktop Left Rail Navigation (Slim rail with exact 3 items) */}
      <aside
        aria-label="Desktop Navigation"
        className="hidden md:flex flex-col fixed top-0 left-0 bottom-0 w-64 bg-surface border-r-2 border-espresso p-6 z-50"
      >
        {/* Brand Header */}
        <div className="mb-8">
          <Link
            href="/"
            prefetch={true}
            onClick={() => setTargetPath("/")}
            className="flex items-baseline gap-1.5 focus:outline-none"
          >
            <span className="font-display font-extrabold text-[32px] text-espresso tracking-tight">
              artiq
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-leaf border border-espresso inline-block" />
          </Link>
          <p className="font-serif italic text-xs text-bark mt-0.5">
            Every artist deserves to be seen.
          </p>
        </div>

        {/* Create Action Button at Top */}
        <div className="mb-8">
          <Link
            href="/create"
            prefetch={true}
            onClick={() => setTargetPath("/create")}
            className="w-full h-12 rounded-[10px] bg-espresso text-canvas border-2 border-espresso shadow-hard-moss flex items-center justify-center gap-2 font-body font-bold text-sm btn-hard focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-2"
          >
            <Plus className="w-5 h-5 stroke-canvas" strokeWidth={2.5} />
            <span>Create Listing</span>
          </Link>
        </div>

        {/* Primary Rail Links (Home, Profile) */}
        <nav className="flex-1 space-y-2">
          <Link
            href="/"
            prefetch={true}
            onClick={() => setTargetPath("/")}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-[10px] border-2 transition-all font-body text-sm",
              isHome
                ? "bg-leaf border-espresso text-espresso font-bold shadow-hard-sm"
                : "border-transparent text-bark hover:text-espresso hover:bg-mist font-medium"
            )}
          >
            <Home className="w-5 h-5" strokeWidth={isHome ? 2.5 : 2} />
            <span>Explore</span>
          </Link>

          <Link
            href="/profile"
            prefetch={true}
            onClick={() => setTargetPath("/profile")}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-[10px] border-2 transition-all font-body text-sm",
              isProfile
                ? "bg-leaf border-espresso text-espresso font-bold shadow-hard-sm"
                : "border-transparent text-bark hover:text-espresso hover:bg-mist font-medium"
            )}
          >
            <User className="w-5 h-5" strokeWidth={isProfile ? 2.5 : 2} />
            <span>Profile</span>
          </Link>
        </nav>

        {/* Bottom Craft Stamp Info */}
        <div className="pt-4 border-t border-espresso/20 flex flex-col gap-1 text-[11px] font-mono text-bark">
          <span className="font-bold text-espresso uppercase tracking-wider">CRAFT SYSTEM</span>
          <span>Zero black • Physical stamps</span>
        </div>
      </aside>
    </>
  );
}
