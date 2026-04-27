import type { ActionCategory } from "../actions/types.js";
import type { RedactionMetadata, RedactionRemovedKind } from "../privacy/redactionEngine.js";
import type { ToolCapability } from "../tools/types.js";

export const RISK_SIGNAL_SCHEMA_VERSION = "1.0";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type RiskDecision =
  | "proceed"
  | "proceed_with_warnings"
  | "pause_for_review"
  | "require_explicit_approval"
  | "block_until_fixed";

export type RiskConfidence = "low" | "medium" | "high";

export type EvalStatus = "pass" | "warn" | "fail" | "missing" | "unreadable";

export type PermissionStatus = "allowed" | "blocked" | "missing" | "not_checked";

export type WorkspaceStatus = "initialized" | "missing" | "blocked" | "not_checked";

export interface RiskProjectSummary {
  projectId: string | null;
  projectName: string | null;
  projectRootHash: string | null;
}

export interface RiskProposedAction {
  toolId?: string | null;
  capability?: ToolCapability | string | null;
  category?: ActionCategory | string | null;
  kind?: string | null;
  mutatesRepo?: boolean;
  requiresApproval?: boolean;
  realExecution?: boolean;
  externalExecution?: boolean;
  dispatch?: boolean;
  deploy?: boolean;
  computerAction?: "dry-run" | "real" | string | null;
}

export interface RiskPermissionMetadata {
  status?: PermissionStatus;
  allowed?: boolean;
  decision?: string | null;
  reasonCode?: string | null;
  safeMessage?: string | null;
  matchedGrantId?: string | null;
}

export interface RiskWorkspaceMetadata {
  status?: WorkspaceStatus;
  initialized?: boolean;
  blocked?: boolean;
  blockerCount?: number;
  activeBlockedCount?: number;
}

export interface RiskSupervisorMetadata {
  blockerCount?: number;
  highRiskCount?: number;
  risks?: Array<{
    severity?: RiskLevel | "medium" | "high" | "low" | string;
    title?: string;
    id?: string;
  }>;
  blockers?: string[];
}

export interface RiskMultiAgentMetadata {
  decision?: "pass" | "warn" | "needs-review" | "block" | string;
  highestRiskLevel?: RiskLevel | string;
  reasonCodes?: string[];
  advisoryOnly?: boolean;
}

export interface RiskSensitiveDataMetadata {
  removedKinds?: RedactionRemovedKind[] | string[];
  containsSecrets?: boolean;
  containsRawIdentity?: boolean;
  containsRawBody?: boolean;
  containsFileContent?: boolean;
  unsafe?: boolean;
}

export interface RiskEvalReportMetadata {
  status?: EvalStatus | string;
  summary?: {
    status?: EvalStatus | string;
    failed?: number;
    warned?: number;
    passed?: number;
    total?: number;
  };
  privacy?: {
    containsUnsafeOutput?: boolean;
    redaction?: Partial<RedactionMetadata>;
  };
  qualityDashboard?: {
    failingIds?: string[];
    warningIds?: string[];
  };
}

export interface RiskAssessmentInput {
  taskId?: string;
  task?: string;
  taskMetadata?: Record<string, unknown>;
  project?: Partial<RiskProjectSummary>;
  proposedActions?: RiskProposedAction[];
  permission?: RiskPermissionMetadata;
  workspace?: RiskWorkspaceMetadata;
  supervisor?: RiskSupervisorMetadata;
  multiAgent?: RiskMultiAgentMetadata;
  sensitiveData?: RiskSensitiveDataMetadata;
  evalReport?: RiskEvalReportMetadata;
}

export interface RiskStatusSummary {
  status: string;
  reasonCodes: string[];
}

export interface RiskSensitiveDataFlags {
  removedKinds: string[];
  containsSecrets: boolean;
  containsRawIdentity: boolean;
  containsRawBody: boolean;
  containsFileContent: boolean;
  unsafe: boolean;
}

export interface RiskSignalBoundaries {
  advisoryOnly: true;
  noProviderCalls: true;
  noNetwork: true;
  noRuntimeGateWiring: true;
  noApprovalExecution: true;
  noProposalCreation: true;
  noDispatch: true;
  noStoreMutation: true;
}

export interface RiskApprovalSignal {
  signalId: string;
  createdAt: string;
  schemaVersion: typeof RISK_SIGNAL_SCHEMA_VERSION;
  project: RiskProjectSummary;
  taskId: string | null;
  taskPreview: string;
  taskHash: string;
  riskLevel: RiskLevel;
  riskReasons: string[];
  evalStatus: EvalStatus;
  permissionStatus: PermissionStatus;
  workspaceStatus: WorkspaceStatus;
  supervisorStatus: RiskStatusSummary;
  multiAgentStatus: RiskStatusSummary;
  proposedActionTypes: string[];
  sensitiveDataFlags: RiskSensitiveDataFlags;
  recommendedDecision: RiskDecision;
  requiredHumanReview: boolean;
  requiresExplicitApproval: boolean;
  confidence: RiskConfidence;
  warnings: string[];
  advisoryOnly: true;
  boundaries: RiskSignalBoundaries;
}
