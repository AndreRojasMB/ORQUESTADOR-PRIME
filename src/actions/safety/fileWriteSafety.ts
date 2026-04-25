// src/actions/safety/fileWriteSafety.ts
// Phase 32C — pure helpers for file-write safety validation.
//
// No I/O, no fs, no network. Every function is a pure validator over
// (path, content, limits). Centralizing the rules here means the future
// realFileWrite path (32D) reuses the exact same gate previewFileWrite
// applies, so once a path/content passes preview it cannot suddenly be
// rejected by a real-execution check that was only implemented downstream.

// ─── Types ──────────────────────────────────────────────────────

export type FileBlockReason =
  | "absolute-path"
  | "path-traversal"
  | "outside-allowlist"
  | "denylisted-path"
  | "sensitive-path"
  | "lockfile-or-config"
  | "binary-content"
  | "secret-pattern"
  | "byte-limit-per-file";

export interface FileValidation {
  ok: boolean;
  blockReason: FileBlockReason | null;
  detail: string | null;
  byteCount: number;
  secretMatches: string[];
}

export interface ProposalLimits {
  maxFiles: number;
  maxBytesPerFile: number;
  maxTotalBytes: number;
  allowedRoots: string[];
  allowSensitive: boolean;
}

export interface ProposalLimitCheck {
  ok: boolean;
  blockReason: "file-count" | "total-bytes" | null;
  detail: string | null;
}

// ─── Constants ──────────────────────────────────────────────────

const DENYLIST_PREFIXES: readonly string[] = [
  "node_modules/",
  ".git/",
  ".github/workflows/",
  "dist/",
  "build/",
  "coverage/",
  ".claude/",
];

// File patterns blocked outright (no escape hatch).
const SENSITIVE_FILE_PATTERNS: readonly RegExp[] = [
  /(^|\/)\.env(\..+)?$/,
  /\.pem$/,
  /\.key$/,
  /\.crt$/,
  /(^|\/)id_rsa(\..+)?$/,
  /(^|\/)secrets(\..+)?$/,
  /(^|\/)credentials(\..+)?$/,
  /\.p12$/,
  /\.pfx$/,
];

// File patterns blocked unless dual escape hatch (proposal flag + env flag).
const LOCKFILE_OR_CONFIG_PATTERNS: readonly RegExp[] = [
  /(^|\/)package\.json$/,
  /(^|\/)package-lock\.json$/,
  /(^|\/)yarn\.lock$/,
  /(^|\/)pnpm-lock\.yaml$/,
  /(^|\/)tsconfig(\..+)?\.json$/,
];

// Secret content patterns. Matches are reported and cause a hard reject.
const SECRET_PATTERNS: ReadonlyArray<{ name: string; re: RegExp }> = [
  { name: "aws-access-key", re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: "github-token", re: /\bgh[pousr]_[A-Za-z0-9]{36,}\b/ },
  { name: "openai-key", re: /\bsk-[A-Za-z0-9]{20,}\b/ },
  { name: "anthropic-key", re: /\bsk-ant-[A-Za-z0-9-]{20,}\b/ },
  { name: "private-key-block", re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
];

const NUL_CHAR = String.fromCharCode(0);
const BINARY_SCAN_BYTES = 8 * 1024;

// ─── Path helpers ───────────────────────────────────────────────

/** Normalize a path string for matching. Forward slashes only; no leading "./". */
export function normalizeRelPath(p: string): string {
  let out = p.replace(/\\/g, "/");
  while (out.startsWith("./")) out = out.slice(2);
  return out;
}

export function isAbsolutePath(p: string): boolean {
  // Cover POSIX absolute and Windows-style drive letters defensively.
  return p.startsWith("/") || /^[A-Za-z]:[\\/]/.test(p);
}

export function hasPathTraversal(p: string): boolean {
  const norm = normalizeRelPath(p);
  if (norm === "..") return true;
  if (norm.startsWith("../")) return true;
  if (norm.endsWith("/..")) return true;
  return norm.includes("/../");
}

export function isInAllowedRoots(p: string, allowedRoots: readonly string[]): boolean {
  if (allowedRoots.length === 0) return true; // empty list disables the check
  const norm = normalizeRelPath(p);
  return allowedRoots.some((root) => {
    const r = normalizeRelPath(root).replace(/\/+$/, "");
    if (!r) return true;
    return norm === r || norm.startsWith(r + "/");
  });
}

export function isDeniedPath(p: string): boolean {
  const norm = normalizeRelPath(p);
  return DENYLIST_PREFIXES.some((d) => norm === d.replace(/\/$/, "") || norm.startsWith(d));
}

export function isSensitivePath(p: string): boolean {
  const norm = normalizeRelPath(p);
  return SENSITIVE_FILE_PATTERNS.some((re) => re.test(norm));
}

export function isLockfileOrConfigPath(p: string): boolean {
  const norm = normalizeRelPath(p);
  return LOCKFILE_OR_CONFIG_PATTERNS.some((re) => re.test(norm));
}

// ─── Content helpers ────────────────────────────────────────────

/**
 * Heuristic: text must not contain a NUL byte in the first 8 KiB.
 * Plain-text source files never legitimately contain NUL.
 */
export function looksBinary(content: string): boolean {
  const slice = content.length > BINARY_SCAN_BYTES ? content.slice(0, BINARY_SCAN_BYTES) : content;
  return slice.indexOf(NUL_CHAR) !== -1;
}

export function findSecretMatches(content: string): string[] {
  const hits: string[] = [];
  for (const { name, re } of SECRET_PATTERNS) {
    if (re.test(content)) hits.push(name);
  }
  return hits;
}

// ─── Per-file validation ────────────────────────────────────────

export function validateFile(
  path: string,
  content: string,
  limits: ProposalLimits,
): FileValidation {
  const byteCount = Buffer.byteLength(content, "utf-8");

  if (isAbsolutePath(path)) {
    return { ok: false, blockReason: "absolute-path", detail: path, byteCount, secretMatches: [] };
  }
  if (hasPathTraversal(path)) {
    return { ok: false, blockReason: "path-traversal", detail: path, byteCount, secretMatches: [] };
  }
  if (isDeniedPath(path)) {
    return { ok: false, blockReason: "denylisted-path", detail: path, byteCount, secretMatches: [] };
  }
  if (isSensitivePath(path)) {
    return { ok: false, blockReason: "sensitive-path", detail: path, byteCount, secretMatches: [] };
  }
  if (isLockfileOrConfigPath(path) && !limits.allowSensitive) {
    return {
      ok: false,
      blockReason: "lockfile-or-config",
      detail: `${path}: lockfile/config writes require dual escape hatch (proposal.allowSensitivePaths + FILE_WRITE_ALLOW_SENSITIVE)`,
      byteCount,
      secretMatches: [],
    };
  }
  if (!isInAllowedRoots(path, limits.allowedRoots)) {
    return {
      ok: false,
      blockReason: "outside-allowlist",
      detail: `${path}: not under any of [${limits.allowedRoots.join(", ")}]`,
      byteCount,
      secretMatches: [],
    };
  }
  if (byteCount > limits.maxBytesPerFile) {
    return {
      ok: false,
      blockReason: "byte-limit-per-file",
      detail: `${path}: ${byteCount} bytes > ${limits.maxBytesPerFile} (per-file cap)`,
      byteCount,
      secretMatches: [],
    };
  }
  if (looksBinary(content)) {
    return {
      ok: false,
      blockReason: "binary-content",
      detail: `${path}: NUL byte detected in first ${BINARY_SCAN_BYTES} bytes`,
      byteCount,
      secretMatches: [],
    };
  }
  const secretMatches = findSecretMatches(content);
  if (secretMatches.length > 0) {
    return {
      ok: false,
      blockReason: "secret-pattern",
      detail: `${path}: matched [${secretMatches.join(", ")}]`,
      byteCount,
      secretMatches,
    };
  }
  return { ok: true, blockReason: null, detail: null, byteCount, secretMatches: [] };
}

// ─── Proposal-level limit checks ────────────────────────────────

export function checkProposalLimits(
  fileCount: number,
  totalBytes: number,
  limits: ProposalLimits,
): ProposalLimitCheck {
  if (fileCount > limits.maxFiles) {
    return {
      ok: false,
      blockReason: "file-count",
      detail: `${fileCount} files > ${limits.maxFiles} (proposal cap)`,
    };
  }
  if (totalBytes > limits.maxTotalBytes) {
    return {
      ok: false,
      blockReason: "total-bytes",
      detail: `${totalBytes} bytes > ${limits.maxTotalBytes} (proposal total cap)`,
    };
  }
  return { ok: true, blockReason: null, detail: null };
}

// ─── Allowed-roots parsing ──────────────────────────────────────

/**
 * Split a comma-separated env value into a normalized root list.
 * Empty entries dropped; trailing slashes stripped; backslashes converted.
 */
export function parseAllowedRoots(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => normalizeRelPath(s.trim()).replace(/\/+$/, ""))
    .filter((s) => s.length > 0);
}
