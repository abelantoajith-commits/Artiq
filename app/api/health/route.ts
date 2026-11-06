import { NextRequest, NextResponse } from "next/server";
import { createLogger, getRequestId } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const requestId = getRequestId(request);
  const log = createLogger("api.health", requestId);

  log.info({ path: "/api/health", method: "GET" }, "health: start");

  let supabaseStatus: "connected" | "degraded" | "unconfigured" = "unconfigured";
  let supabaseMessage = "Supabase check skipped or unconfigured";

  try {
    const supabase = await createClient();
    log.debug({ operation: "head", table: "profiles" }, "supabase: ping start");
    const dbStartTime = Date.now();

    // Run a light ping against Supabase
    const { error } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true });

    const dbDurationMs = Date.now() - dbStartTime;

    if (error) {
      // If table does not exist yet (expected in early Phase 0), it confirms the API reached Supabase
      if (
        error.code === "PGRST204" ||
        error.message?.includes("relation") ||
        error.message?.includes("does not exist")
      ) {
        supabaseStatus = "connected";
        supabaseMessage = "Supabase reachable (tables pending Phase 2 migrations)";
        log.debug(
          { dbDurationMs, note: "tables_pending" },
          "supabase: connected (tables pending)"
        );
      } else {
        supabaseStatus = "degraded";
        supabaseMessage = error.message;
        log.warn(
          { dbDurationMs, errorCode: error.code, message: error.message },
          "supabase: ping returned warning"
        );
      }
    } else {
      supabaseStatus = "connected";
      supabaseMessage = "Database query succeeded";
      log.debug({ dbDurationMs }, "supabase: ping ok");
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    supabaseStatus = "degraded";
    supabaseMessage = message;
    log.error({ err: message }, "supabase: ping failed");
  }

  const durationMs = Date.now() - startTime;
  log.info(
    {
      durationMs,
      supabaseStatus,
      status: 200,
    },
    "health: done"
  );

  return NextResponse.json(
    {
      status: "ok",
      app: "ARTIQ",
      tagline: "Every Artist Deserves to Be Seen.",
      version: "0.1.0",
      timestamp: new Date().toISOString(),
      durationMs,
      supabase: {
        status: supabaseStatus,
        message: supabaseMessage,
      },
    },
    {
      status: 200,
      headers: {
        "x-request-id": requestId,
      },
    }
  );
}
