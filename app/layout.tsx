import type { Metadata, Viewport } from "next";
import {
  Figtree,
  Newsreader,
  Noto_Sans_Malayalam,
  Noto_Serif_Malayalam,
} from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/artiq/AppShell";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
});

const notoSansMalayalam = Noto_Sans_Malayalam({
  subsets: ["malayalam"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans-malayalam",
  display: "swap",
});

const notoSerifMalayalam = Noto_Serif_Malayalam({
  subsets: ["malayalam"],
  weight: ["400", "600", "700"],
  variable: "--font-noto-serif-malayalam",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ARTIQ — Every Artist Deserves to Be Seen",
  description:
    "AI-powered digital identity, portfolio and discovery platform for traditional and independent artists.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${figtree.variable} ${newsreader.variable} ${notoSansMalayalam.variable} ${notoSerifMalayalam.variable}`}
    >
      <body className="antialiased min-h-screen bg-canvas text-ink selection:bg-primary/20">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
