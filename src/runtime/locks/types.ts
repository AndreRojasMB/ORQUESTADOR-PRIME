export type RuntimeLockSchemaVersion = "1.0";

export type LockAcquireStatus =
  | "acquired"
  | "active"
  | "stale"
  | "corrupt"
  | "invalid";

export type LockReleaseStatus =
  | "released"
  | "not_found"
  | "owner_mismatch"
  | "corrupt"
  | "invalid";

export type LockReadStatus =
  | "missing"
  | "active"
  | "stale"
  | "corrupt"
  | "invalid";

export interface RuntimeLockRecord {
  schemaVersion: RuntimeLockSchemaVersion;
  lockId: string;
  lockScope: string;
  storeId?: string;
  projectId?: string;
  operation: string;
  owner: string;
  createdAt: string;
  expiresAt: string;
  ttlMs: number;
  staleAfter: string;
  metadataHash?: string;
  advisoryOnly: true;
}

export interface AcquireLockOptions {
  lockRoot: string;
  lockScope: string;
  operation: string;
  owner: string;
  ttlMs?: number;
  storeId?: string;
  projectId?: string;
  metadata?: unknown;
}

export interface SafeLockSummary {
  lockId: string;
  lockScope: string;
  storeId?: string;
  projectId?: string;
  operation: string;
  owner: string;
  createdAt: string;
  expiresAt: string;
  ttlMs: number;
  stale: boolean;
}

export interface AcquireLockResult {
  ok: boolean;
  status: LockAcquireStatus;
  lock?: RuntimeLockRecord;
  existingLock?: SafeLockSummary;
  reasonCode: string;
  safeMessage: string;
  lockFileName?: string;
}

export interface ReleaseLockOptions {
  lockRoot: string;
  lockScope: string;
  lockId: string;
  owner: string;
}

export interface ReleaseLockResult {
  ok: boolean;
  status: LockReleaseStatus;
  reasonCode: string;
  safeMessage: string;
  lockFileName?: string;
}

export interface ReadLockResult {
  ok: boolean;
  status: LockReadStatus;
  lock?: RuntimeLockRecord;
  reasonCode: string;
  safeMessage: string;
  lockFileName?: string;
}
