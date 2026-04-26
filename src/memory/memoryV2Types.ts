import type { ProjectIdentity } from "../supervisor/types.js";
import type { MemoryEntry } from "../types.js";

export const MEMORY_V2_STORE_VERSION = "1.0";
export const MEMORY_V2_ENTRY_SCHEMA_VERSION = "1.0";

export type MemoryV2EntryType =
  | "run-summary"
  | "project-goal"
  | "decision"
  | "preference"
  | "constraint"
  | "risk"
  | "integration-note"
  | "external-note"
  | "learning-summary";

export type MemoryV2Source =
  | "manual"
  | "supervisor"
  | "orchestrator"
  | "learning-export"
  | "whatsapp"
  | "omi"
  | "dashboard"
  | "openclaw"
  | "v1-adapter";

export type MemoryV2PrivacyLabel = "public" | "project" | "private" | "secret";

export type MemoryV2Priority = "low" | "medium" | "high";

export type MemoryV2Confidence = "low" | "medium" | "high";

export interface MemoryV2ProjectScope {
  projectId: string;
  projectName: string;
  workspaceHash: string;
  repoRemoteHash: string | null;
  branch: string | null;
}

export interface MemoryV2Links {
  traceIds: string[];
  trajectoryIds: string[];
  proposalIds: string[];
  executionResultIds: string[];
  channelAuditIds: string[];
  memoryV1Ids: string[];
  docs: string[];
}

export interface MemoryV2Privacy {
  label: MemoryV2PrivacyLabel;
  allowedForPrompt: boolean;
  allowCrossProject: false;
  reason: string;
}

export interface MemoryV2Redaction {
  redacted: boolean;
  redactionVersion: "1.0";
  removedKinds: string[];
  containsRawIdentity: boolean;
  containsSecrets: boolean;
  safePreview: string;
}

export interface MemoryV2Retention {
  expiresAt: string | null;
  ttlDays: number | null;
  retainUntilExplicitlyDeleted: boolean;
}

export interface MemoryV2Entry {
  id: string;
  schemaVersion: typeof MEMORY_V2_ENTRY_SCHEMA_VERSION;
  createdAt: string;
  updatedAt: string;
  projectScope: MemoryV2ProjectScope;
  type: MemoryV2EntryType;
  title: string;
  summary: string;
  tags: string[];
  source: MemoryV2Source;
  links: MemoryV2Links;
  privacy: MemoryV2Privacy;
  redaction: MemoryV2Redaction;
  retention: MemoryV2Retention;
  priority: MemoryV2Priority;
  confidence: MemoryV2Confidence;
}

export interface MemoryV2Indexes {
  byProjectId: Record<string, string[]>;
  byTag: Record<string, string[]>;
  byType: Partial<Record<MemoryV2EntryType, string[]>>;
}

export interface MemoryV2StoreData {
  version: typeof MEMORY_V2_STORE_VERSION;
  entries: MemoryV2Entry[];
  indexes: MemoryV2Indexes;
  lastUpdatedAt: string | null;
}

export interface AppendMemoryV2EntryInput {
  type: MemoryV2EntryType;
  title: string;
  summary: string;
  tags?: string[];
  source: MemoryV2Source;
  links?: Partial<MemoryV2Links>;
  privacy?: Partial<MemoryV2Privacy>;
  redaction?: Partial<MemoryV2Redaction>;
  retention?: Partial<MemoryV2Retention>;
  priority?: MemoryV2Priority;
  confidence?: MemoryV2Confidence;
  projectRoot?: string;
  createdAt?: string;
}

export interface MemoryV2RetrievalQuery {
  query: string;
  projectRoot?: string;
  tags?: string[];
  type?: MemoryV2EntryType;
  limit?: number;
  includeV1Backfill?: boolean;
  allowPrivate?: boolean;
  allowUnsafeRedaction?: boolean;
  now?: string;
}

export interface MemoryV2SafeContext {
  title: string;
  summary: string;
  tags: string[];
  type: MemoryV2EntryType;
  ageDays: number;
  privacyLabel: MemoryV2PrivacyLabel;
}

export interface MemoryV2RetrievalResult {
  entryId: string;
  score: number;
  reasons: string[];
  safeContext: MemoryV2SafeContext;
}

export interface MemoryV2RetrievalResponse {
  project: Pick<ProjectIdentity, "projectId" | "projectName" | "projectRootHash">;
  query: {
    text: string;
    tags: string[];
    type: MemoryV2EntryType | null;
    includeV1Backfill: boolean;
    allowPrivate: boolean;
    allowUnsafeRedaction: boolean;
    limit: number;
  };
  results: MemoryV2RetrievalResult[];
  totalCandidates: number;
  filtered: {
    projectMismatch: number;
    expired: number;
    privacy: number;
    unsafeRedaction: number;
    lowScore: number;
  };
}

export interface MemoryV1BackfillCandidate {
  entry: MemoryV2Entry;
  original: MemoryEntry;
}
