export const REDACTION_ENGINE_VERSION = "1.0";

export type RedactionRemovedKind =
  | "phone"
  | "email"
  | "token"
  | "api-key"
  | "authorization-header"
  | "webhook-secret"
  | "request-body"
  | "raw-body"
  | "absolute-path"
  | "raw-transcript"
  | "file-content"
  | "provider-key"
  | "cookie"
  | "session"
  | "raw-identity"
  | "proposal-parameters"
  | "execution-output"
  | "screenshot"
  | "secret-like";

export interface RedactionMetadata {
  removedKinds: RedactionRemovedKind[];
  containsSecrets: boolean;
  containsRawIdentity: boolean;
  containsRawBody: boolean;
  containsFileContent: boolean;
  truncated: boolean;
  redactionVersion: typeof REDACTION_ENGINE_VERSION;
}

export interface RedactionResult<T = unknown> {
  value: T;
  safePreview: string;
  metadata: RedactionMetadata;
}

export interface RedactionOptions {
  maxLength?: number;
  markFileContent?: boolean;
}

const DEFAULT_PREVIEW_LIMIT = 220;

const UNSAFE_KEY_PARTS = [
  "phone",
  "phonenumber",
  "email",
  "token",
  "accesstoken",
  "refreshtoken",
  "authorization",
  "apikey",
  "api_key",
  "secret",
  "webhooksecret",
  "requestbody",
  "rawbody",
  "cookie",
  "session",
  "transcript",
  "filecontent",
] as const;

const STRING_RULES: Array<{
  kind: RedactionRemovedKind;
  pattern: RegExp;
  replacement: string;
  secret: boolean;
  rawIdentity: boolean;
  rawBody: boolean;
}> = [
  {
    kind: "authorization-header",
    pattern: /\b(authorization)\b\s*[:=]\s*bearer\s+["']?[^"'\s,;}]+/gi,
    replacement: "$1=[redacted-authorization]",
    secret: true,
    rawIdentity: false,
    rawBody: false,
  },
  {
    kind: "api-key",
    pattern: /\b(api[_-]?key|provider[_-]?key)\b\s*[:=]\s*["']?[^"'\s,;}]+/gi,
    replacement: "$1=[redacted-api-key]",
    secret: true,
    rawIdentity: false,
    rawBody: false,
  },
  {
    kind: "token",
    pattern: /\b(access[_-]?token|refresh[_-]?token|token|secret)\b\s*[:=]\s*["']?[^"'\s,;}]+/gi,
    replacement: "$1=[redacted-secret]",
    secret: true,
    rawIdentity: false,
    rawBody: false,
  },
  {
    kind: "email",
    pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    replacement: "[redacted-email]",
    secret: false,
    rawIdentity: true,
    rawBody: false,
  },
  {
    kind: "phone",
    pattern: /\+?\d[\d\s().-]{7,}\d/g,
    replacement: "[redacted-phone]",
    secret: false,
    rawIdentity: true,
    rawBody: false,
  },
  {
    kind: "request-body",
    pattern: /\b(requestBody)\b\s*[:=]\s*.+/gi,
    replacement: "$1=[redacted-body]",
    secret: true,
    rawIdentity: false,
    rawBody: true,
  },
  {
    kind: "raw-body",
    pattern: /\b(rawBody)\b\s*[:=]\s*.+/gi,
    replacement: "$1=[redacted-body]",
    secret: true,
    rawIdentity: false,
    rawBody: true,
  },
  {
    kind: "absolute-path",
    pattern: /(?:[A-Za-z]:\\[^\s"'<>]+|\/(?:home|Users|var|tmp|mnt)\/[^\s"'<>]+)/g,
    replacement: "[redacted-path]",
    secret: false,
    rawIdentity: false,
    rawBody: false,
  },
  {
    kind: "secret-like",
    pattern: /\b(?:sk|pk|ghp|gho|xoxb|xoxp|twilio)_[A-Za-z0-9_-]{12,}\b/g,
    replacement: "[redacted-secret]",
    secret: true,
    rawIdentity: false,
    rawBody: false,
  },
];

function emptyMetadata(): RedactionMetadata {
  return {
    removedKinds: [],
    containsSecrets: false,
    containsRawIdentity: false,
    containsRawBody: false,
    containsFileContent: false,
    truncated: false,
    redactionVersion: REDACTION_ENGINE_VERSION,
  };
}

function cloneMetadata(metadata: RedactionMetadata): RedactionMetadata {
  return {
    removedKinds: metadata.removedKinds.slice(),
    containsSecrets: metadata.containsSecrets,
    containsRawIdentity: metadata.containsRawIdentity,
    containsRawBody: metadata.containsRawBody,
    containsFileContent: metadata.containsFileContent,
    truncated: metadata.truncated,
    redactionVersion: metadata.redactionVersion,
  };
}

function addKind(
  metadata: RedactionMetadata,
  kind: RedactionRemovedKind,
): void {
  if (!metadata.removedKinds.includes(kind)) {
    metadata.removedKinds.push(kind);
    metadata.removedKinds.sort();
  }
}

function mergeMetadata(...items: RedactionMetadata[]): RedactionMetadata {
  const merged = emptyMetadata();

  for (const item of items) {
    for (const kind of item.removedKinds) {
      addKind(merged, kind);
    }
    merged.containsSecrets ||= item.containsSecrets;
    merged.containsRawIdentity ||= item.containsRawIdentity;
    merged.containsRawBody ||= item.containsRawBody;
    merged.containsFileContent ||= item.containsFileContent;
    merged.truncated ||= item.truncated;
  }

  return merged;
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function bounded(value: string, maxLength: number, metadata: RedactionMetadata): string {
  if (value.length <= maxLength) {
    return value;
  }
  metadata.truncated = true;
  return `${value.slice(0, Math.max(0, maxLength - 3))}...`;
}

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9_]/g, "");
}

function keyKind(key: string): RedactionRemovedKind | null {
  const normalized = normalizeKey(key);

  if (normalized.includes("requestbody")) return "request-body";
  if (normalized.includes("rawbody")) return "raw-body";
  if (normalized.includes("phonenumber") || normalized.includes("phone")) return "phone";
  if (normalized.includes("email")) return "email";
  if (normalized.includes("apikey") || normalized.includes("api_key")) return "api-key";
  if (normalized.includes("authorization")) return "authorization-header";
  if (normalized.includes("webhooksecret")) return "webhook-secret";
  if (normalized.includes("cookie")) return "cookie";
  if (normalized.includes("session")) return "session";
  if (normalized.includes("transcript")) return "raw-transcript";
  if (normalized.includes("filecontent")) return "file-content";
  if (normalized.includes("token") || normalized.includes("secret")) return "token";

  return null;
}

function markKind(metadata: RedactionMetadata, kind: RedactionRemovedKind): void {
  addKind(metadata, kind);

  if (
    kind === "token" ||
    kind === "api-key" ||
    kind === "authorization-header" ||
    kind === "webhook-secret" ||
    kind === "provider-key" ||
    kind === "cookie" ||
    kind === "session" ||
    kind === "secret-like" ||
    kind === "request-body" ||
    kind === "raw-body"
  ) {
    metadata.containsSecrets = true;
  }

  if (kind === "phone" || kind === "email" || kind === "raw-identity") {
    metadata.containsRawIdentity = true;
  }

  if (kind === "request-body" || kind === "raw-body") {
    metadata.containsRawBody = true;
  }

  if (kind === "file-content") {
    metadata.containsFileContent = true;
  }
}

export function redactString(
  value: string,
  options: RedactionOptions = {},
): RedactionResult<string> {
  const metadata = emptyMetadata();
  let redacted = value;

  for (const rule of STRING_RULES) {
    const before = redacted;
    redacted = redacted.replace(rule.pattern, rule.replacement);

    if (redacted !== before) {
      addKind(metadata, rule.kind);
      metadata.containsSecrets ||= rule.secret;
      metadata.containsRawIdentity ||= rule.rawIdentity;
      metadata.containsRawBody ||= rule.rawBody;
    }
  }

  if (options.markFileContent === true) {
    markKind(metadata, "file-content");
    redacted = "[redacted-file-content]";
  }

  const normalized = normalizeWhitespace(redacted);
  const maxLength = options.maxLength ?? DEFAULT_PREVIEW_LIMIT;
  const preview = bounded(normalized, maxLength, metadata);

  return {
    value: preview,
    safePreview: preview,
    metadata,
  };
}

export function safePreview(value: string, maxLength = DEFAULT_PREVIEW_LIMIT): string {
  return redactString(value, { maxLength }).safePreview;
}

export function isUnsafeKey(key: string): boolean {
  const normalized = normalizeKey(key);
  return UNSAFE_KEY_PARTS.some((part) => normalized.includes(part));
}

export function collectUnsafeKeys(value: unknown): string[] {
  const keys = new Set<string>();
  const seen = new WeakSet<object>();

  function visit(input: unknown): void {
    if (typeof input !== "object" || input === null) {
      return;
    }
    if (seen.has(input)) {
      return;
    }
    seen.add(input);

    if (Array.isArray(input)) {
      for (const item of input) {
        visit(item);
      }
      return;
    }

    for (const [key, nested] of Object.entries(input as Record<string, unknown>)) {
      if (isUnsafeKey(key)) {
        keys.add(key);
      }
      visit(nested);
    }
  }

  visit(value);
  return [...keys].sort();
}

export function redactStructuredValue(
  value: unknown,
  options: RedactionOptions = {},
): RedactionResult<unknown> {
  const seen = new WeakSet<object>();

  function visit(input: unknown, keyHint: string | null): RedactionResult<unknown> {
    const unsafeKind = keyHint ? keyKind(keyHint) : null;

    if (unsafeKind) {
      const metadata = emptyMetadata();
      markKind(metadata, unsafeKind);
      return {
        value: "[redacted]",
        safePreview: "[redacted]",
        metadata,
      };
    }

    if (typeof input === "string") {
      return redactString(input, options);
    }

    if (
      input === null ||
      typeof input === "number" ||
      typeof input === "boolean"
    ) {
      const text = input === null ? "null" : String(input);
      return {
        value: input,
        safePreview: text,
        metadata: emptyMetadata(),
      };
    }

    if (typeof input !== "object") {
      const text = safePreview(String(input), options.maxLength ?? DEFAULT_PREVIEW_LIMIT);
      return {
        value: text,
        safePreview: text,
        metadata: emptyMetadata(),
      };
    }

    if (seen.has(input)) {
      const metadata = emptyMetadata();
      addKind(metadata, "secret-like");
      return {
        value: "[redacted-cycle]",
        safePreview: "[redacted-cycle]",
        metadata,
      };
    }
    seen.add(input);

    if (Array.isArray(input)) {
      const values: unknown[] = [];
      const metadataItems: RedactionMetadata[] = [];

      for (const item of input) {
        const redactedItem = visit(item, null);
        values.push(redactedItem.value);
        metadataItems.push(redactedItem.metadata);
      }

      const metadata = mergeMetadata(...metadataItems);
      return {
        value: values,
        safePreview: safePreview(JSON.stringify(values), options.maxLength ?? DEFAULT_PREVIEW_LIMIT),
        metadata,
      };
    }

    const output: Record<string, unknown> = {};
    const metadataItems: RedactionMetadata[] = [];

    for (const [key, nested] of Object.entries(input as Record<string, unknown>)) {
      const redactedValue = visit(nested, key);
      output[key] = redactedValue.value;
      metadataItems.push(redactedValue.metadata);
    }

    const metadata = mergeMetadata(...metadataItems);
    return {
      value: output,
      safePreview: safePreview(JSON.stringify(output), options.maxLength ?? DEFAULT_PREVIEW_LIMIT),
      metadata,
    };
  }

  const result = visit(value, null);
  return {
    value: result.value,
    safePreview: result.safePreview,
    metadata: cloneMetadata(result.metadata),
  };
}
