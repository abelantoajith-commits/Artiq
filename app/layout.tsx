import type { Metadata, Viewport } from "next";
import {
  Bricolage_Grotesque,
  Figtree,
  Newsreader,
  DM_Mono,
  Noto_Sans_Malayalam,
  Noto_Serif_Malayalam,
} from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/artiq/AppShell";
import { ThemeProvider } from "@/components/artiq/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-bricolage",
  display: "swap",
});

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-figtree",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-dm-mono",
  display: "swap",
});

const notoSansMalayalam = Noto_Sans_Malayalam({
  subsets: ["malayalam"],
  weight: ["500", "700"],
  variable: "--font-noto-sans-malayalam",
  display: "swap",
});

const notoSerifMalayalam = Noto_Serif_Malayalam({
  subsets: ["malayalam"],
  weight: ["400", "700"],
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
      suppressHydrationWarning
      className={`${bricolage.variable} ${figtree.variable} ${newsreader.variable} ${dmMono.variable} ${notoSansMalayalam.variable} ${notoSerifMalayalam.variable}`}
    >
      <body className="antialiased min-h-screen bg-canvas text-ink selection:bg-primary/20">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppShell>{children}</AppShell>
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
