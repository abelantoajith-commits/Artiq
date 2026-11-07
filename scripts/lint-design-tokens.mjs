import fs from "fs";
import path from "path";

const BANNED_PATTERNS = [
  { pattern: /backdrop-blur/i, reason: "No glassmorphism or backdrop-blur allowed. Use solid craft surfaces." },
  { pattern: /bg-gradient/i, reason: "No gradients allowed in craft theme." },
  { pattern: /#000000\b|#000\b/i, reason: "Pure black is banned. Use Espresso #4A3526." },
  { pattern: /from-(?:purple|indigo|violet|pink)-/i, reason: "Purple/pink gradients are banned." },
];

const SCAN_DIRS = ["app", "components"];
const ALLOWED_FILES = [
  "app/globals.css",
  "docs/design-tokens.md",
  "docs/design-reference-audit.md",
];

let errorCount = 0;

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const normalized = fullPath.replace(/\\/g, "/");

    if (ALLOWED_FILES.some((allowed) => normalized.endsWith(allowed))) {
      continue;
    }

    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".next") {
        scanDir(fullPath);
      }
    } else if (/\.(tsx|ts|jsx|js)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, "utf-8");
      const lines = content.split("\n");

      lines.forEach((line, lineIdx) => {
        for (const { pattern, reason } of BANNED_PATTERNS) {
          if (pattern.test(line)) {
            console.error(
              `\x1b[31m[DESIGN TOKEN GUARD ERROR]\x1b[0m ${normalized}:${lineIdx + 1}\n` +
              `  Line:   ${line.trim()}\n` +
              `  Reason: ${reason}\n`
            );
            errorCount++;
          }
        }
      });
    }
  }
}

console.log("\x1b[34m[DESIGN TOKEN GUARD]\x1b[0m Scanning app and components for banned design artifacts...");

for (const dir of SCAN_DIRS) {
  scanDir(dir);
}

if (errorCount > 0) {
  console.error(`\x1b[31m[FAILED]\x1b[0m Found ${errorCount} banned design pattern(s). Please fix before committing.`);
  process.exit(1);
} else {
  console.log("\x1b[32m[PASSED]\x1b[0m Zero banned patterns found. All files comply with craft design tokens.");
  process.exit(0);
}
