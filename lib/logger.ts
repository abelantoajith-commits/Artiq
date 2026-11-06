import pino, { Logger } from "pino";
import { env } from "./env";

export const logger: Logger = pino({
  level: env.LOG_LEVEL,
  redact: [
    "req.headers.authorization",
    "req.headers.cookie",
    "*.apiKey",
    "*.password",
    "*.serviceRoleKey",
    "*.token",
    "*.authorization",
    "authorization",
  ],
  transport:
    env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            ignore: "pid,hostname",
            translateTime: "HH:MM:ss",
          },
        }
      : undefined,
});

/**
 * Creates a child logger scoped to a specific module and optional request ID.
 */
export function createLogger(
  moduleName: string,
  requestId?: string,
  extraBindings?: Record<string, unknown>
): Logger {
  return logger.child({
    module: moduleName,
    ...(requestId ? { requestId } : {}),
    ...(extraBindings ?? {}),
  });
}

/**
 * Helper to extract or generate an x-request-id header from Next.js Request.
 */
export function getRequestId(request?: Request): string {
  if (request) {
    const existing = request.headers.get("x-request-id");
    if (existing) return existing;
  }
  return crypto.randomUUID();
}
