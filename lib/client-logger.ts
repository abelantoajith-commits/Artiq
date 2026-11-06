/**
 * Client-side structured logger for browser code.
 * Controlled by NEXT_PUBLIC_LOG_LEVEL or ?debug=1 in browser URL.
 */

type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
  silent: 5,
};

function getClientLogLevel(): LogLevel {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    if (params.get("debug") === "1" || params.get("debug") === "true") {
      return "debug";
    }
  }

  const configured = process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel | undefined;
  if (configured && configured in LEVEL_PRIORITY) {
    return configured;
  }
  return process.env.NODE_ENV === "production" ? "info" : "debug";
}

export function createClientLogger(moduleName: string) {
  const shouldLog = (level: LogLevel): boolean => {
    const current = getClientLogLevel();
    return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[current];
  };

  const formatPrefix = (level: string) =>
    `%c[ARTIQ][${level.toUpperCase()}][${moduleName}]`;

  const getStyle = (level: LogLevel) => {
    switch (level) {
      case "debug":
        return "color: #5B6070; font-weight: bold;";
      case "info":
        return "color: #2E3A87; font-weight: bold;";
      case "warn":
        return "color: #D99A1E; font-weight: bold;";
      case "error":
        return "color: #B23A48; font-weight: bold;";
      default:
        return "";
    }
  };

  return {
    debug: (msg: string, ...args: unknown[]) => {
      if (shouldLog("debug")) {
        console.debug(formatPrefix("debug"), getStyle("debug"), msg, ...args);
      }
    },
    info: (msg: string, ...args: unknown[]) => {
      if (shouldLog("info")) {
        console.info(formatPrefix("info"), getStyle("info"), msg, ...args);
      }
    },
    warn: (msg: string, ...args: unknown[]) => {
      if (shouldLog("warn")) {
        console.warn(formatPrefix("warn"), getStyle("warn"), msg, ...args);
      }
    },
    error: (msg: string, ...args: unknown[]) => {
      if (shouldLog("error")) {
        console.error(formatPrefix("error"), getStyle("error"), msg, ...args);
      }
    },
  };
}

export const clientLogger = createClientLogger("app");
