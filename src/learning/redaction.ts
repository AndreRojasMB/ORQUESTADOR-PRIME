import { createHash } from "crypto";

const PREVIEW_LIMIT = 160;

export const DEFAULT_REMOVED_KINDS = [
  "full-task",
  "user-message",
  "structured-output",
  "raw-output",
  "proposal-parameters",
  "execution-output",
  "raw-identity",
  "channel-reason-text",
  "phone",
  "email",
  "token",
  "request-body",
  "raw-body",
] as const;

const UNSAFE_KEY_PARTS = [
  "phone",
  "phonenumber",
  "email",
  "token",
  "accesstoken",
  "refreshtoken",
  "requestbody",
  "rawbody",
  "authorization",
  "apikey",
  "api_key",
  "secret",
] as const;

export function hashTask(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function normalizePreviewText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function redactUnsafeString(value: string): string {
  let redacted = value;
  redacted = redacted.replace(
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    "[redacted-email]",
  );
  redacted = redacted.replace(
    /\+?\d[\d\s().-]{7,}\d/g,
    "[redacted-phone]",
  );
  redacted = redacted.replace(
    /\b(api[_-]?key|access[_-]?token|refresh[_-]?token|token|secret|authorization)\b\s*[:=]\s*["']?[^"'\s,;}]+/gi,
    "$1=[redacted-secret]",
  );
  redacted = redacted.replace(
    /\b(requestBody|rawBody)\b\s*[:=]\s*.+/gi,
    "$1=[redacted-body]",
  );
  return redacted;
}

export function taskPreview(value: string, maxLength = PREVIEW_LIMIT): string {
  const normalized = normalizePreviewText(redactUnsafeString(value));
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, Math.max(0, maxLength - 3))}...`;
}

export function isUnsafeKey(key: string): boolean {
  const normalized = key.toLowerCase().replace(/[^a-z0-9_]/g, "");
  return UNSAFE_KEY_PARTS.some((part) => normalized.includes(part));
}

export function collectUnsafeKeys(value: unknown): string[] {
  const keys = new Set<string>();

  function visit(input: unknown): void {
    if (Array.isArray(input)) {
      for (const item of input) {
        visit(item);
      }
      return;
    }

    if (input && typeof input === "object") {
      for (const [key, nested] of Object.entries(input)) {
        if (isUnsafeKey(key)) {
          keys.add(key);
        }
        visit(nested);
      }
    }
  }

  visit(value);
  return [...keys].sort();
}
