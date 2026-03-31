// src/observability/logger.ts
// Logger estructurado con niveles y timestamps.
// Output legible en consola durante desarrollo.
// V2 extension: agregar transport a archivo o servicio externo aquí.

export type LogLevel = "info" | "warn" | "error" | "debug" | "trace";

const LEVEL_ICONS: Record<LogLevel, string> = {
  info:  "ℹ",
  warn:  "⚠",
  error: "✖",
  debug: "⬡",
  trace: "◎",
};

const LEVEL_ORDER: Record<LogLevel, number> = {
  trace: 0,
  debug: 1,
  info:  2,
  warn:  3,
  error: 4,
};

// Nivel mínimo de log — configurable por env
const MIN_LEVEL: LogLevel =
  (process.env["LOG_LEVEL"] as LogLevel | undefined) ?? "info";

function shouldLog(level: LogLevel): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[MIN_LEVEL];
}

function formatMs(ms: number): string {
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms}ms`;
}

function timestamp(): string {
  return new Date().toISOString().replace("T", " ").replace("Z", "");
}

export const logger = {
  info:  (msg: string, meta?: Record<string, unknown>) => log("info",  msg, meta),
  warn:  (msg: string, meta?: Record<string, unknown>) => log("warn",  msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => log("error", msg, meta),
  debug: (msg: string, meta?: Record<string, unknown>) => log("debug", msg, meta),
  trace: (msg: string, meta?: Record<string, unknown>) => log("trace", msg, meta),

  // Separador visual para secciones del trace
  section: (title: string) => {
    if (!shouldLog("info")) return;
    console.log(`\n${"─".repeat(50)}`);
    console.log(`  ${title}`);
    console.log("─".repeat(50));
  },

  // Timing helper — imprime duración formateada
  timing: (label: string, ms: number) => {
    if (!shouldLog("debug")) return;
    console.log(`  ⏱  ${label}: ${formatMs(ms)}`);
  },
};

function log(
  level:  LogLevel,
  msg:    string,
  meta?:  Record<string, unknown>
): void {
  if (!shouldLog(level)) return;

  const icon   = LEVEL_ICONS[level];
  const ts     = timestamp();
  const prefix = `${icon} [${ts}]`;

  if (level === "error") {
    console.error(`${prefix} ${msg}`, meta ?? "");
  } else if (level === "warn") {
    console.warn(`${prefix} ${msg}`, meta ?? "");
  } else {
    console.log(`${prefix} ${msg}`, meta ? JSON.stringify(meta) : "");
  }
}