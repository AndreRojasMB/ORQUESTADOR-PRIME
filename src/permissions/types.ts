import type { ActionCategory, ChannelKind } from "../actions/types.js";
import type { ToolCapability } from "../tools/types.js";

export const PERMISSION_STORE_VERSION = "1.0";
export const PERMISSION_AUDIT_STORE_VERSION = "1.0";

export type PermissionSubjectKind =
  | "user"
  | "channel"
  | "agent"
  | "job"
  | "system"
  | "api-client";

export type PermissionRole =
  | "viewer"
  | "operator"
  | "maintainer"
  | "owner"
  | "automation";

export type PermissionGrantStatus =
  | "active"
  | "expired"
  | "revoked"
  | "consumed";

export type PermissionDecision = "allowed" | "blocked";

export type PermissionReasonCode =
  | "allowed"
  | "missing-subject"
  | "missing-project"
  | "unknown-tool"
  | "unknown-capability"
  | "tool-forbidden"
  | "channel-not-allowed"
  | "permission-denied"
  | "forbidden-category"
  | "grant-expired"
  | "grant-revoked"
  | "grant-consumed"
  | "grant-max-uses-exceeded"
  | "scope-mismatch"
  | "condition-unsupported"
  | "condition-failed"
  | "store-read-failed";

export type PermissionCondition =
  | {
      kind: "allowed-channels";
      channels: ChannelKind[];
    }
  | {
      kind: "allowed-categories";
      categories: ActionCategory[];
    }
  | {
      kind: "dry-run-only";
      value: boolean;
    }
  | {
      kind: "no-network";
      value: boolean;
    }
  | {
      kind: "allowed-project";
      projectId: string;
    };

export interface PermissionGrant {
  grantId: string;
  subjectKind: PermissionSubjectKind;
  subjectHash: string;
  role: PermissionRole | null;
  projectId: string;
  toolId: string | null;
  capability: ToolCapability | null;
  scopes: string[];
  conditions: PermissionCondition[];
  expiresAt: string | null;
  maxUses: number | null;
  usedCount: number;
  createdAt: string;
  createdBy: string;
  reason: string;
  status: PermissionGrantStatus;
}

export interface PermissionStoreData {
  version: typeof PERMISSION_STORE_VERSION;
  grants: PermissionGrant[];
}

export interface AppendPermissionGrantInput {
  subjectKind: PermissionSubjectKind;
  subjectHash: string;
  role?: PermissionRole | null;
  projectId: string;
  toolId?: string | null;
  capability?: ToolCapability | null;
  scopes?: string[];
  conditions?: PermissionCondition[];
  expiresAt?: string | null;
  maxUses?: number | null;
  createdBy: string;
  reason: string;
  status?: PermissionGrantStatus;
  createdAt?: string;
}

export interface PermissionCheckInput {
  subjectKind: PermissionSubjectKind;
  subjectHash: string | null;
  projectId: string | null;
  toolId?: string | null;
  capability?: ToolCapability | null;
  category?: ActionCategory | null;
  operation?: string | null;
  channel?: ChannelKind | null;
  dryRun?: boolean;
  networkAccess?: boolean;
  scopes?: string[];
  correlationId?: string | null;
  jobId?: string | null;
  proposalId?: string | null;
}

export interface PermissionCheckResult {
  allowed: boolean;
  decision: PermissionDecision;
  reasonCode: PermissionReasonCode;
  safeMessage: string;
  matchedGrantId: string | null;
  expiresAt: string | null;
  audit: PermissionAuditEntry;
}

export interface PermissionAuditEntry {
  id: string;
  timestamp: string;
  decision: PermissionDecision;
  reasonCode: PermissionReasonCode;
  safeMessage: string;
  subjectKind: PermissionSubjectKind | null;
  subjectHash: string | null;
  projectId: string | null;
  toolId: string | null;
  capability: ToolCapability | null;
  category: ActionCategory | null;
  channel: ChannelKind | null;
  operation: string | null;
  matchedGrantId: string | null;
  grantStatus: PermissionGrantStatus | null;
  correlationId: string | null;
  jobId: string | null;
  proposalId: string | null;
}

export interface PermissionAuditStoreData {
  version: typeof PERMISSION_AUDIT_STORE_VERSION;
  entries: PermissionAuditEntry[];
}

export interface PermissionAuditStats {
  total: number;
  allowed: number;
  blocked: number;
  byReasonCode: Partial<Record<PermissionReasonCode, number>>;
  bySubjectKind: Partial<Record<PermissionSubjectKind, number>>;
}
