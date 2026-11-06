import React from "react";
import { Navigation } from "./Navigation";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col md:pl-64">
      {/* Main Content Area: Padding bottom on mobile to avoid overlapping fixed bottom nav */}
      <main className="flex-1 pb-24 md:pb-12 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {children}
      </main>

      {/* Navigation (Mobile Bottom Bar & Desktop Left Rail) */}
      <Navigation />
    </div>
  );
}
