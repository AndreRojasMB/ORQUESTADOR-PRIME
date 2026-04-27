export type DoctorStatus = "pass" | "warn" | "fail" | "skipped";

export type DoctorFindingSeverity = "warn" | "fail";

export type StoreScope = "global" | "project-scoped" | "mixed";

export type SafeMetadataValue =
  | string
  | number
  | boolean
  | null
  | string[]
  | number[]
  | boolean[];

export type SafeMetadata = Record<string, SafeMetadataValue>;

export interface DoctorCheck {
  id: string;
  label: string;
  status: DoctorStatus;
  reasonCode: string;
  safeMessage: string;
  metadata?: SafeMetadata;
}

export interface DoctorFinding {
  id: string;
  severity: DoctorFindingSeverity;
  reasonCode: string;
  safeMessage: string;
  storeId?: string;
  checkId?: string;
  metadata?: SafeMetadata;
}

export interface StoreInventoryEntry {
  storeId: string;
  displayName: string;
  fileName: string;
  scope: StoreScope;
  required: boolean;
  expectedVersion?: string;
  versionField?: string;
  collectionFields?: string[];
  sensitiveFields?: string[];
  futureMigrationVersion?: string;
  futureLockScope?: string;
}

export interface StoreHealth {
  storeId: string;
  displayName: string;
  fileName: string;
  scope: StoreScope;
  required: boolean;
  status: DoctorStatus;
  exists: boolean;
  readable: boolean;
  parseable: boolean;
  schemaVersionPresent: boolean;
  versionMatches?: boolean;
  initialized?: boolean;
  collectionCounts?: Record<string, number>;
  sizeBytes?: number;
  warnings: DoctorFinding[];
  errors: DoctorFinding[];
  metadata?: SafeMetadata;
}

export interface RuntimeDoctorSummary {
  status: Exclude<DoctorStatus, "skipped">;
  passCount: number;
  warnCount: number;
  failCount: number;
  skippedCount: number;
  storeCount: number;
}

export interface RuntimeDoctorRedaction {
  status: Exclude<DoctorStatus, "skipped">;
  rawValuesIncluded: false;
  reasonCode: string;
}

export interface RuntimeDoctorBoundaries {
  readOnly: true;
  noStoreMutation: true;
  noRepair: true;
  noMigration: true;
  noLocksCreated: true;
  noProviderCalls: true;
  noNetwork: true;
  noActionDispatch: true;
}

export interface RuntimeDoctorResult {
  doctorId: string;
  createdAt: string;
  schemaVersion: "1.0";
  advisoryOnly: true;
  summary: RuntimeDoctorSummary;
  checks: DoctorCheck[];
  stores: StoreHealth[];
  warnings: DoctorFinding[];
  errors: DoctorFinding[];
  recommendations: string[];
  redaction: RuntimeDoctorRedaction;
  boundaries: RuntimeDoctorBoundaries;
}

