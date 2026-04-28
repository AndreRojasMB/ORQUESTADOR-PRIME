import { createHash, randomUUID } from "node:crypto";
import { mkdir, open, readFile, unlink } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";

import type {
  AcquireLockOptions,
  AcquireLockResult,
  ReadLockResult,
  ReleaseLockOptions,
  ReleaseLockResult,
  RuntimeLockRecord,
  SafeLockSummary,
} from "./types.js";

const LOCK_SCHEMA_VERSION = "1.0";
const DEFAULT_TTL_MS = 5 * 60 * 1000;
const SAFE_SCOPE_PATTERN = /^[a-z0-9._-]+$/;
const WINDOWS_DRIVE_PATTERN = /^[a-zA-Z]:/;

export function normalizeLockScope(scope: string): string {
  const trimmed = scope.trim();

  if (!trimmed) {
    throw new Error("lock.scope.empty");
  }
  if (
    trimmed.includes("/") ||
    trimmed.includes("\\") ||
    trimmed.includes(":") ||
    trimmed.includes("..") ||
    WINDOWS_DRIVE_PATTERN.test(trimmed)
  ) {
    throw new Error("lock.scope.unsafe");
  }

  const normalized = trimmed.toLowerCase();
  if (
    !normalized ||
    normalized === "." ||
    normalized === ".." ||
    !SAFE_SCOPE_PATTERN.test(normalized)
  ) {
    throw new Error("lock.scope.invalid");
  }

  return normalized;
}

export function getLockFileName(scope: string): string {
  return `${normalizeLockScope(scope)}.lock.json`;
}

export function getLockFilePath(lockRoot: string, scope: string): string {
  const normalizedRoot = normalizeLockRoot(lockRoot);
  const fileName = getLockFileName(scope);
  const lockPath = resolve(normalizedRoot, fileName);

  if (!isPathWithinRoot(lockPath, normalizedRoot)) {
    throw new Error("lock.path.outside_root");
  }

  return lockPath;
}

export async function acquireLock(
  options: AcquireLockOptions,
): Promise<AcquireLockResult> {
  const validation = validateAcquireOptions(options);
  if (validation.ok === false) {
    return validation.result;
  }

  const lockRoot = normalizeLockRoot(options.lockRoot);
  const lockScope = normalizeLockScope(options.lockScope);
  const lockFileName = getLockFileName(lockScope);
  const lockPath = getLockFilePath(lockRoot, lockScope);
  const now = new Date();
  const ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;
  const expiresAt = new Date(now.getTime() + ttlMs);
  const lock: RuntimeLockRecord = {
    schemaVersion: LOCK_SCHEMA_VERSION,
    lockId: randomUUID(),
    lockScope,
    operation: options.operation,
    owner: options.owner,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    ttlMs,
    staleAfter: expiresAt.toISOString(),
    advisoryOnly: true,
  };
  if (options.storeId !== undefined) {
    lock.storeId = options.storeId;
  }
  if (options.projectId !== undefined) {
    lock.projectId = options.projectId;
  }
  const metadataHash = hashMetadata(options.metadata);
  if (metadataHash !== undefined) {
    lock.metadataHash = metadataHash;
  }

  await mkdir(lockRoot, { recursive: true });

  try {
    const fileHandle = await open(lockPath, "wx");
    try {
      await fileHandle.writeFile(`${JSON.stringify(lock, null, 2)}\n`, {
        encoding: "utf8",
      });
    } finally {
      await fileHandle.close();
    }

    return {
      ok: true,
      status: "acquired",
      lock,
      reasonCode: "lock.acquired",
      safeMessage: "Lock acquired.",
      lockFileName,
    };
  } catch (error) {
    if (isAlreadyExistsError(error)) {
      const existing = await readLock(lockRoot, lockScope);
      if (existing.status === "active" && existing.lock) {
        return {
          ok: false,
          status: "active",
          existingLock: summarizeLock(existing.lock),
          reasonCode: "lock.active",
          safeMessage: "Active lock already exists.",
          lockFileName,
        };
      }
      if (existing.status === "stale" && existing.lock) {
        return {
          ok: false,
          status: "stale",
          existingLock: summarizeLock(existing.lock),
          reasonCode: "lock.stale",
          safeMessage: "Stale lock exists and was not modified.",
          lockFileName,
        };
      }

      return {
        ok: false,
        status: "corrupt",
        reasonCode: "lock.corrupt",
        safeMessage: "Existing lock could not be safely parsed.",
        lockFileName,
      };
    }

    return {
      ok: false,
      status: "invalid",
      reasonCode: "lock.acquire_failed",
      safeMessage: "Lock could not be acquired.",
      lockFileName,
    };
  }
}

export async function readLock(
  lockRoot: string,
  lockScope: string,
): Promise<ReadLockResult> {
  let lockFileName: string | undefined;
  let lockPath: string;

  try {
    lockFileName = getLockFileName(lockScope);
    lockPath = getLockFilePath(lockRoot, lockScope);
  } catch {
    return {
      ok: false,
      status: "invalid",
      reasonCode: "lock.invalid",
      safeMessage: "Lock root or scope is invalid.",
    };
  }

  try {
    const raw = await readFile(lockPath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!isRuntimeLockRecord(parsed)) {
      return {
        ok: false,
        status: "corrupt",
        reasonCode: "lock.corrupt_shape",
        safeMessage: "Lock file has an invalid shape.",
        lockFileName,
      };
    }

    return {
      ok: true,
      status: isLockStale(parsed) ? "stale" : "active",
      lock: parsed,
      reasonCode: isLockStale(parsed) ? "lock.stale" : "lock.active",
      safeMessage: isLockStale(parsed)
        ? "Lock exists and is stale."
        : "Lock exists and is active.",
      lockFileName,
    };
  } catch (error) {
    if (isNotFoundError(error)) {
      return {
        ok: true,
        status: "missing",
        reasonCode: "lock.missing",
        safeMessage: "Lock is not present.",
        lockFileName,
      };
    }
    return {
      ok: false,
      status: "corrupt",
      reasonCode: "lock.read_failed",
      safeMessage: "Lock file could not be safely read.",
      lockFileName,
    };
  }
}

export async function releaseLock(
  options: ReleaseLockOptions,
): Promise<ReleaseLockResult> {
  let lockFileName: string | undefined;
  let lockPath: string;

  try {
    lockFileName = getLockFileName(options.lockScope);
    lockPath = getLockFilePath(options.lockRoot, options.lockScope);
  } catch {
    return {
      ok: false,
      status: "invalid",
      reasonCode: "lock.invalid",
      safeMessage: "Lock root or scope is invalid.",
    };
  }

  if (!options.lockId.trim() || !options.owner.trim()) {
    return {
      ok: false,
      status: "invalid",
      reasonCode: "lock.release_identity_missing",
      safeMessage: "Release requires a lock id and owner.",
      lockFileName,
    };
  }

  const existing = await readLock(options.lockRoot, options.lockScope);
  if (existing.status === "missing") {
    return {
      ok: false,
      status: "not_found",
      reasonCode: "lock.not_found",
      safeMessage: "No lock exists for this scope.",
      lockFileName,
    };
  }
  if (!existing.lock) {
    return {
      ok: false,
      status: "corrupt",
      reasonCode: existing.reasonCode,
      safeMessage: "Existing lock was not modified.",
      lockFileName,
    };
  }
  if (
    existing.lock.lockId !== options.lockId ||
    existing.lock.owner !== options.owner
  ) {
    return {
      ok: false,
      status: "owner_mismatch",
      reasonCode: "lock.owner_mismatch",
      safeMessage: "Lock owner or id did not match; lock was not released.",
      lockFileName,
    };
  }

  try {
    await unlink(lockPath);
    return {
      ok: true,
      status: "released",
      reasonCode: "lock.released",
      safeMessage: "Lock released.",
      lockFileName,
    };
  } catch (error) {
    if (isNotFoundError(error)) {
      return {
        ok: false,
        status: "not_found",
        reasonCode: "lock.not_found",
        safeMessage: "Lock disappeared before release.",
        lockFileName,
      };
    }
    return {
      ok: false,
      status: "invalid",
      reasonCode: "lock.release_failed",
      safeMessage: "Lock could not be released.",
      lockFileName,
    };
  }
}

export function isLockStale(lock: RuntimeLockRecord, now = new Date()): boolean {
  const staleAt = Date.parse(lock.staleAfter);
  const expiresAt = Date.parse(lock.expiresAt);
  const threshold = Number.isFinite(staleAt) ? staleAt : expiresAt;
  return Number.isFinite(threshold) && threshold <= now.getTime();
}

export function summarizeLock(lock: RuntimeLockRecord): SafeLockSummary {
  const summary: SafeLockSummary = {
    lockId: lock.lockId,
    lockScope: lock.lockScope,
    operation: lock.operation,
    owner: lock.owner,
    createdAt: lock.createdAt,
    expiresAt: lock.expiresAt,
    ttlMs: lock.ttlMs,
    stale: isLockStale(lock),
  };
  if (lock.storeId !== undefined) {
    summary.storeId = lock.storeId;
  }
  if (lock.projectId !== undefined) {
    summary.projectId = lock.projectId;
  }
  return summary;
}

function validateAcquireOptions(
  options: AcquireLockOptions,
):
  | { ok: true }
  | { ok: false; result: AcquireLockResult } {
  let lockFileName: string | undefined;
  try {
    lockFileName = getLockFileName(options.lockScope);
    getLockFilePath(options.lockRoot, options.lockScope);
  } catch {
    const result: AcquireLockResult = {
      ok: false,
      status: "invalid",
      reasonCode: "lock.invalid",
      safeMessage: "Lock root or scope is invalid.",
    };
    if (lockFileName !== undefined) {
      result.lockFileName = lockFileName;
    }
    return {
      ok: false,
      result,
    };
  }

  if (!options.operation.trim() || !options.owner.trim()) {
    return {
      ok: false,
      result: {
        ok: false,
        status: "invalid",
        reasonCode: "lock.identity_missing",
        safeMessage: "Lock operation and owner are required.",
        lockFileName,
      },
    };
  }

  if (options.ttlMs !== undefined && (!Number.isFinite(options.ttlMs) || options.ttlMs <= 0)) {
    return {
      ok: false,
      result: {
        ok: false,
        status: "invalid",
        reasonCode: "lock.ttl_invalid",
        safeMessage: "Lock TTL must be a positive finite number.",
        lockFileName,
      },
    };
  }

  return { ok: true };
}

function normalizeLockRoot(lockRoot: string): string {
  const trimmed = lockRoot.trim();
  if (!trimmed) {
    throw new Error("lock.root.empty");
  }
  if (!isAbsolute(trimmed)) {
    throw new Error("lock.root.relative");
  }
  return resolve(trimmed);
}

function isPathWithinRoot(filePath: string, root: string): boolean {
  const rootRelativePath = relative(root, filePath);
  return (
    rootRelativePath !== "" &&
    !rootRelativePath.startsWith("..") &&
    !isAbsolute(rootRelativePath)
  );
}

function hashMetadata(metadata: unknown): string | undefined {
  if (metadata === undefined) {
    return undefined;
  }
  return createHash("sha256")
    .update(stableStringify(metadata))
    .digest("hex")
    .slice(0, 24);
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value) ?? "undefined";
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(",")}}`;
}

function isRuntimeLockRecord(value: unknown): value is RuntimeLockRecord {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Partial<RuntimeLockRecord>;
  return (
    record.schemaVersion === LOCK_SCHEMA_VERSION &&
    typeof record.lockId === "string" &&
    typeof record.lockScope === "string" &&
    typeof record.operation === "string" &&
    typeof record.owner === "string" &&
    typeof record.createdAt === "string" &&
    typeof record.expiresAt === "string" &&
    typeof record.ttlMs === "number" &&
    typeof record.staleAfter === "string" &&
    record.advisoryOnly === true
  );
}

function isAlreadyExistsError(error: unknown): boolean {
  return isNodeError(error) && error.code === "EEXIST";
}

function isNotFoundError(error: unknown): boolean {
  return isNodeError(error) && error.code === "ENOENT";
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
