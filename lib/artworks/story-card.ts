/**
 * ARTIQ Craft Story Card Generator
 *
 * Generates vector SVG craft cards for text-story posts matching Rule 8:
 * - Earthy Canvas, Sand, Sprout, Clay, and Mist palettes
 * - Zero black: #4A3526 Espresso for all borders, text, and decorative strokes
 * - 2px physical frame with corner notch flourishes
 * - Elegant Newsreader serif quotation typography
 * - Standard 800x1000 (4:5) aspect ratio for crisp masonry display
 */

export type StoryCardTheme = "canvas" | "clay" | "sprout" | "sand" | "mist";

export interface StoryCardOptions {
  storyText: string;
  theme?: StoryCardTheme;
  authorName?: string;
  authorAvatar?: string;
  authorLocation?: string;
  title?: string;
}

export const STORY_CARD_THEMES: Record<
  StoryCardTheme,
  {
    name: string;
    bg: string;
    cardFill: string;
    border: string;
    text: string;
    accent: string;
    secondary: string;
  }
> = {
  canvas: {
    name: "Canvas Warmth",
    bg: "#F8F7F3",
    cardFill: "#FDFCF7",
    border: "#4A3526",
    text: "#4A3526",
    accent: "#C8E096", // Leaf
    secondary: "#6B5443",
  },
  clay: {
    name: "Terracotta Clay",
    bg: "#F9EFEA",
    cardFill: "#FBF3EE",
    border: "#4A3526",
    text: "#4A3526",
    accent: "#E3B5A0", // Clay
    secondary: "#7A503C",
  },
  sprout: {
    name: "Sprout Moss",
    bg: "#F3F8EC",
    cardFill: "#F8FBF3",
    border: "#4A3526",
    text: "#4A3526",
    accent: "#E3F0CB", // Sprout
    secondary: "#6B8A4A", // Moss
  },
  sand: {
    name: "Sand Dune",
    bg: "#F7F2EC",
    cardFill: "#FAF6F1",
    border: "#4A3526",
    text: "#4A3526",
    accent: "#CDAA8A", // Sand
    secondary: "#6E5540",
  },
  mist: {
    name: "Mist Minimal",
    bg: "#EFEFEC",
    cardFill: "#F7F7F5",
    border: "#4A3526",
    text: "#4A3526",
    accent: "#DCDCD6", // Mist tint
    secondary: "#5E564E",
  },
};

/**
 * Escapes special XML characters for safe SVG insertion.
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Wraps text into lines that fit within max characters per line.
 */
function wrapText(text: string, maxCharsPerLine = 38, maxLines = 12): string[] {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if ((currentLine + " " + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + " " + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
      if (lines.length >= maxLines - 1) {
        break;
      }
    }
  }

  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }

  // If text exceeded capacity, append ellipsis to final line
  if (words.length > 0 && lines.length >= maxLines && !lines[lines.length - 1].endsWith("…")) {
    lines[lines.length - 1] = lines[lines.length - 1].slice(0, maxCharsPerLine - 2) + "…";
  }

  return lines;
}

/**
 * Generates an SVG string representation of the Story Card.
 */
export function generateStoryCardSvg(options: StoryCardOptions): string {
  const {
    storyText,
    theme = "canvas",
    authorName = "Artist",
    authorAvatar = "🎨",
    authorLocation = "Kerala, India",
    title,
  } = options;

  const currentTheme = STORY_CARD_THEMES[theme] || STORY_CARD_THEMES.canvas;
  const wrappedLines = wrapText(storyText, 36, 11);
  const lineHeight = 36;
  const startY = 320;

  const textLinesSvg = wrappedLines
    .map((line, idx) => {
      const y = startY + idx * lineHeight;
      return `<tspan x="110" y="${y}">${escapeXml(line)}</tspan>`;
    })
    .join("\n        ");

  const safeTitle = title ? escapeXml(title.slice(0, 48)) : "";
  const safeAuthor = escapeXml(authorName.slice(0, 32));
  const safeLocation = escapeXml(authorLocation.slice(0, 32));
  const safeAvatar = escapeXml(authorAvatar);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;800&amp;family=Newsreader:ital,opsz,wght@0,6..72,400;1,6..72,400&amp;family=Figtree:wght@500;700&amp;family=DM+Mono:wght@500&amp;display=swap');

      .bg-fill { fill: ${currentTheme.bg}; }
      .card-fill { fill: ${currentTheme.cardFill}; }
      .stroke-espresso { stroke: ${currentTheme.border}; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
      .text-title { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 800; font-size: 26px; fill: ${currentTheme.text}; }
      .text-quote { font-family: 'Newsreader', Georgia, serif; font-size: 88px; fill: ${currentTheme.border}; opacity: 0.18; font-style: italic; }
      .text-story { font-family: 'Newsreader', Georgia, serif; font-size: 23px; line-height: 36px; fill: ${currentTheme.text}; font-style: normal; }
      .text-author { font-family: 'Figtree', sans-serif; font-weight: 700; font-size: 18px; fill: ${currentTheme.text}; }
      .text-meta { font-family: 'Figtree', sans-serif; font-weight: 500; font-size: 13px; fill: ${currentTheme.secondary}; }
      .text-badge { font-family: 'DM Mono', monospace; font-weight: 500; font-size: 11px; fill: ${currentTheme.text}; letter-spacing: 1.5px; }
      .shadow-hard { filter: drop-shadow(4px 4px 0px ${currentTheme.border}); }
    </style>
  </defs>

  <!-- Outer Background Canvas -->
  <rect width="800" height="1000" class="bg-fill" />

  <!-- Inner Physical Card Surface (Inset 36px) -->
  <rect x="36" y="36" width="728" height="928" rx="20" class="card-fill stroke-espresso" />

  <!-- Decorative Inner Border -->
  <rect x="52" y="52" width="696" height="896" rx="14" fill="none" stroke="${currentTheme.border}" stroke-width="1" stroke-dasharray="4 4" opacity="0.35" />

  <!-- Corner Flourish Accents (2px physical craft stamps) -->
  <path d="M 60 74 L 60 60 L 74 60" fill="none" class="stroke-espresso" />
  <path d="M 740 74 L 740 60 L 726 60" fill="none" class="stroke-espresso" />
  <path d="M 60 926 L 60 940 L 74 940" fill="none" class="stroke-espresso" />
  <path d="M 740 926 L 740 940 L 726 940" fill="none" class="stroke-espresso" />

  <!-- Top Header Badge: ARTIST STORY -->
  <g transform="translate(100, 96)">
    <rect x="0" y="0" width="144" height="28" rx="6" fill="${currentTheme.accent}" stroke="${currentTheme.border}" stroke-width="2" />
    <text x="72" y="18" text-anchor="middle" class="text-badge">ARTIST STORY</text>
  </g>

  <!-- Giant Opening Quotation Mark -->
  <text x="96" y="235" class="text-quote">“</text>

  <!-- Artwork Title (if present) -->
  ${
    safeTitle
      ? `<text x="100" y="270" class="text-title">${safeTitle}</text>`
      : ""
  }

  <!-- Story Body Text Wrapped Lines -->
  <text class="text-story">
    ${textLinesSvg}
  </text>

  <!-- Bottom Divider Rule -->
  <line x1="90" y1="840" x2="710" y2="840" stroke="${currentTheme.border}" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.3" />

  <!-- Bottom Artist Attribution Footer -->
  <g transform="translate(90, 866)">
    <!-- Avatar Stamp Circle -->
    <circle cx="28" cy="28" r="26" fill="${currentTheme.accent}" stroke="${currentTheme.border}" stroke-width="2" />
    <text x="28" y="36" font-size="24" text-anchor="middle">${safeAvatar}</text>

    <!-- Author Name & Location -->
    <text x="68" y="24" class="text-author">${safeAuthor}</text>
    <text x="68" y="44" class="text-meta">${safeLocation}</text>

    <!-- Right Side Stamp: ARTIQ AUTHENTIC STORY -->
    <g transform="translate(470, 8)">
      <rect x="0" y="0" width="150" height="36" rx="8" fill="none" stroke="${currentTheme.border}" stroke-width="1.5" />
      <text x="75" y="22" text-anchor="middle" font-family="'DM Mono', monospace" font-size="9" font-weight="700" fill="${currentTheme.border}" letter-spacing="1">ARTIQ • STORY</text>
    </g>
  </g>
</svg>`;
}

/**
 * Generates a browser-compatible Data URI for the Story Card SVG.
 */
export function generateStoryCardDataUrl(options: StoryCardOptions): string {
  const svg = generateStoryCardSvg(options);
  if (typeof window !== "undefined") {
    return `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(svg)))}`;
  }
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
