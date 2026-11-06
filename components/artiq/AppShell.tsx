import React from "react";
import Link from "next/link";
import { Navigation } from "./Navigation";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col md:pl-64">
      {/* Mobile Top Bar */}
      <header className="sticky top-0 z-30 bg-canvas/90 backdrop-blur-md border-b border-line px-4 py-3 md:hidden">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div>
            <Link href="/" className="inline-block">
              <h1 className="text-xl font-bold tracking-tight text-ink">ARTIQ</h1>
            </Link>
            <p className="text-xs text-ink-soft">
              Every Artist Deserves to Be Seen.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content Area: Padding bottom on mobile to avoid overlapping fixed bottom nav */}
      <main className="flex-1 pb-24 md:pb-12 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Navigation (Mobile Bottom Bar & Desktop Left Rail) */}
      <Navigation />
    </div>
  );
}

