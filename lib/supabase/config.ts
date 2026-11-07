/**
 * Checks whether Supabase is configured with real credentials (not placeholder).
 * Prevents DNS timeouts and request blocking during local demo & development.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return (
    !!url &&
    !url.includes("placeholder") &&
    !url.includes("your-project") &&
    !!key &&
    !key.includes("placeholder")
  );
}

