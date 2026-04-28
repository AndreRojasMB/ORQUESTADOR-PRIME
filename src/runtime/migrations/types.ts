import type { SafeMetadata, StoreScope } from "../../health/types.js";

export type MigrationPlannerSchemaVersion = "1.0";

export type MigrationStoreStatus =
  | "up_to_date"
  | "missing_store"
  | "missing_version"
  | "version_unknown"
  | "migration_available"
  | "migration_required"
  | "migration_blocked"
  | "corrupt"
  | "skipped";

export type MigrationSafetyClass =
  | "read-only-check"
  | "shape-only"
  | "destructive-risk"
  | "sensitive";

export interface MigrationDefinition {
  migrationId: string;
  storeId: string;
  fromVersion: string;
  toVersion: string;
  description: string;
  safetyClass: MigrationSafetyClass;
  requiresBackup: boolean;
  requiresLock: boolean;
  applyImplemented: false;
  dryRunImplemented: boolean;
  validationNotes: string[];
}

export interface MigrationPlanFinding {
  id: string;
  severity: "warn" | "fail";
  reasonCode: string;
  safeMessage: string;
  storeId?: string;
  migrationId?: string;
  metadata?: SafeMetadata;
}

export interface StoreMigrationPlanEntry {
  storeId: string;
  displayName: string;
  fileName: string;
  scope: StoreScope;
  status: MigrationStoreStatus;
  required: boolean;
  exists: boolean;
  readable: boolean;
  parseable: boolean;
  currentVersion?: string;
  expectedVersion?: string;
  futureMigrationVersion?: string;
  versionField?: string;
  lockScopeKnown: boolean;
  availableMigrations: MigrationDefinition[];
  warnings: MigrationPlanFinding[];
  errors: MigrationPlanFinding[];
  metadata?: SafeMetadata;
}

export interface MigrationPlanDataRootSummary {
  source: "explicit" | "env" | "default";
  rootHash: string;
  pathRedacted: true;
}

export interface MigrationPlanBoundaries {
  noStoreMutation: true;
  noBackupsCreated: true;
  noLocksCreated: true;
  noRepair: true;
  noApply: true;
  noProviderCalls: true;
  noNetwork: true;
  noActionDispatch: true;
}

export interface MigrationPlanResult {
  planId: string;
  createdAt: string;
  schemaVersion: MigrationPlannerSchemaVersion;
  advisoryOnly: true;
  dataRootSummary: MigrationPlanDataRootSummary;
  stores: StoreMigrationPlanEntry[];
  migrations: MigrationDefinition[];
  warnings: MigrationPlanFinding[];
  errors: MigrationPlanFinding[];
  recommendations: string[];
  boundaries: MigrationPlanBoundaries;
}

export interface MigrationPlannerOptions {
  dataRoot?: string;
  createdAt?: string;
}
