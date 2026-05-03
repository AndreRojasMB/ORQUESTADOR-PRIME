const REDACTED = "[REDACTED]";

const SENSITIVE_KEY_PATTERNS = [
  /token/i,
  /api[_-]?key/i,
  /password/i,
  /secret/i,
  /authorization/i,
  /cookie/i,
  /bearer/i,
  /webhook[_-]?token/i,
  /act[_-]?code/i,
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
}

function redactString(value: string): string {
  if (/bearer\s+[a-z0-9._-]+/i.test(value)) return REDACTED;
  if (/sk-[a-z0-9_-]+/i.test(value)) return REDACTED;
  if (/ghp_[a-z0-9_]+/i.test(value)) return REDACTED;
  if (/github_pat_[a-z0-9_]+/i.test(value)) return REDACTED;
  return value;
}

export function redactSensitive(value: unknown): unknown {
  if (typeof value === "string") return redactString(value);
  if (value == null || typeof value !== "object") return value;

  if (Array.isArray(value)) {
    return value.map((entry) => redactSensitive(entry));
  }

  if (!isRecord(value)) return REDACTED;

  const redacted: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    redacted[key] = isSensitiveKey(key) ? REDACTED : redactSensitive(entry);
  }
  return redacted;
}
