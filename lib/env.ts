import { z } from "zod";

const envSchema = z.object({
  // Server-only variables
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  LOG_LEVEL: z
    .enum(["trace", "debug", "info", "warn", "error", "fatal", "silent"])
    .default(process.env.NODE_ENV === "production" ? "info" : "debug"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  GEMINI_API_KEY: z.string().min(1).optional(),

  // Client variables (must be prefixed with NEXT_PUBLIC_)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().default("https://placeholder.supabase.co"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).default("placeholder-anon-key"),
  NEXT_PUBLIC_LOG_LEVEL: z
    .enum(["trace", "debug", "info", "warn", "error", "silent"])
    .default("info"),
});

// Guard: Ensure no secrets are leaked to NEXT_PUBLIC_
for (const key of Object.keys(process.env)) {
  if (
    key.startsWith("NEXT_PUBLIC_") &&
    (key.includes("SERVICE_ROLE") ||
      key.includes("SECRET") ||
      key.includes("GEMINI_API_KEY"))
  ) {
    const errorMsg = `[FATAL] Security Violation: Secret detected in client variable ${key}. Never expose server secrets to NEXT_PUBLIC_!`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
}

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => ` - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  const errorMsg = `[FATAL] Environment variable validation failed:\n${issues}\nPlease check your .env or .env.local file against .env.example.`;
  console.error(errorMsg);
  throw new Error(errorMsg);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;

