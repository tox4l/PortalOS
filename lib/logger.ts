type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function getLevel(): LogLevel {
  const env = process.env.LOG_LEVEL?.toLowerCase();
  if (env === "debug" || env === "info" || env === "warn" || env === "error") {
    return env;
  }
  return process.env.NODE_ENV === "production" ? "info" : "debug";
}

const currentLevel = getLevel();
const minSeverity = LOG_LEVELS[currentLevel];

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  requestId?: string;
  [key: string]: unknown;
}

function format(entry: LogEntry): string {
  if (process.env.NODE_ENV === "production") {
    return JSON.stringify(entry);
  }
  const { timestamp, level, message, ...rest } = entry;
  const keys = Object.keys(rest).length ? ` ${JSON.stringify(rest)}` : "";
  return `${timestamp} [${level.toUpperCase()}] ${message}${keys}`;
}

function log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  if (LOG_LEVELS[level] < minSeverity) return;
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(meta?.requestId ? { requestId: meta.requestId as string } : {}),
  };
  if (meta) {
    for (const [k, v] of Object.entries(meta)) {
      if (k !== "requestId") entry[k] = v;
    }
  }
  const output = format(entry);
  if (level === "error") {
    process.stderr.write(output + "\n");
  } else {
    process.stdout.write(output + "\n");
  }
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => log("debug", message, meta),
  info: (message: string, meta?: Record<string, unknown>) => log("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log("error", message, meta),
};
