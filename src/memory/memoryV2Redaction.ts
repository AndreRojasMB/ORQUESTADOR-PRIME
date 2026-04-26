export const MEMORY_V2_REDACTION_VERSION = "1.0";

const DEFAULT_PREVIEW_LIMIT = 220;

const REDACTION_PATTERNS: Array<{
  kind: string;
  pattern: RegExp;
  replacement: string;
  rawIdentity: boolean;
  secret: boolean;
}> = [
  {
    kind: "email",
    pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    replacement: "[redacted-email]",
    rawIdentity: true,
    secret: false,
  },
  {
    kind: "phone",
    pattern: /\+?\d[\d\s().-]{7,}\d/g,
    replacement: "[redacted-phone]",
    rawIdentity: true,
    secret: false,
  },
  {
    kind: "token",
    pattern: /\b(api[_-]?key|access[_-]?token|refresh[_-]?token|token|secret|authorization)\b\s*[:=]\s*["']?[^"'\s,;}]+/gi,
    replacement: "$1=[redacted-secret]",
    rawIdentity: false,
    secret: true,
  },
  {
    kind: "request-body",
    pattern: /\b(requestBody|rawBody)\b\s*[:=]\s*.+/gi,
    replacement: "$1=[redacted-body]",
    rawIdentity: false,
    secret: true,
  },
  {
    kind: "absolute-path",
    pattern: /(?:[A-Za-z]:\\[^\s"'<>]+|\/(?:home|Users|var|tmp|mnt)\/[^\s"'<>]+)/g,
    replacement: "[redacted-path]",
    rawIdentity: false,
    secret: false,
  },
];

export interface MemoryV2RedactionResult {
  text: string;
  removedKinds: string[];
  containsRawIdentity: boolean;
  containsSecrets: boolean;
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function redactMemoryV2Text(value: string): MemoryV2RedactionResult {
  let text = value;
  const removedKinds = new Set<string>();
  let containsRawIdentity = false;
  let containsSecrets = false;

  for (const rule of REDACTION_PATTERNS) {
    const before = text;
    text = text.replace(rule.pattern, rule.replacement);

    if (text !== before) {
      removedKinds.add(rule.kind);
      containsRawIdentity ||= rule.rawIdentity;
      containsSecrets ||= rule.secret;
    }
  }

  return {
    text: normalizeWhitespace(text),
    removedKinds: [...removedKinds].sort(),
    containsRawIdentity,
    containsSecrets,
  };
}

export function safeMemoryV2Preview(
  value: string,
  maxLength = DEFAULT_PREVIEW_LIMIT,
): MemoryV2RedactionResult {
  const redacted = redactMemoryV2Text(value);
  const text =
    redacted.text.length <= maxLength
      ? redacted.text
      : `${redacted.text.slice(0, Math.max(0, maxLength - 3))}...`;

  return {
    ...redacted,
    text,
  };
}

export function mergeRemovedKinds(...groups: Array<string[] | undefined>): string[] {
  const merged = new Set<string>();

  for (const group of groups) {
    for (const kind of group ?? []) {
      merged.add(kind);
    }
  }

  return [...merged].sort();
}
