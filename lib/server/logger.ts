type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  requestId?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  durationMs?: number;
  error?: string;
  [key: string]: unknown;
}

function createLogEntry(level: LogLevel, message: string, meta: Partial<LogEntry> = {}): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };
}

export const logger = {
  info(message: string, meta: Partial<LogEntry> = {}) {
    const entry = createLogEntry("info", message, meta);
    console.log(JSON.stringify(entry));
  },

  warn(message: string, meta: Partial<LogEntry> = {}) {
    const entry = createLogEntry("warn", message, meta);
    console.warn(JSON.stringify(entry));
  },

  error(message: string, meta: Partial<LogEntry> = {}) {
    const entry = createLogEntry("error", message, meta);
    console.error(JSON.stringify(entry));
  },

  request(method: string, path: string, statusCode: number, durationMs: number, meta: Partial<LogEntry> = {}) {
    const entry = createLogEntry("info", `${method} ${path} ${statusCode}`, {
      method,
      path,
      statusCode,
      durationMs,
      ...meta,
    });
    console.log(JSON.stringify(entry));
  },
};
