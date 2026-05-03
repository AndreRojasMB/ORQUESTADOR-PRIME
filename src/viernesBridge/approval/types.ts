import type { IntegrationActionApprovalGate } from "../../integrations/actions/approval/approvalGate.js";
import type { ApprovalDecision } from "../../integrations/actions/approval/types.js";
import type { IntegrationActionAuditTrail } from "../../integrations/actions/audit/auditTrail.js";
import type { IntegrationActionExecutionResult } from "../../integrations/actions/executors/types.js";
import type { TargetPolicyOptions } from "../../integrations/actions/policy/types.js";
import type {
  IntegrationActionRiskLevel,
  ProposedIntegrationAction,
} from "../../integrations/actions/types.js";

export type ViernesApprovalCommandType = "approve" | "reject" | "unknown";

export interface ViernesApprovalCommand {
  type: ViernesApprovalCommandType;
  actCode?: string;
  reason?: string;
  rawText: string;
}

export interface ViernesApprovalMessage {
  requestId?: string;
  approvalId: string;
  actionId: string;
  text: string;
  riskLevel: IntegrationActionRiskLevel;
  expiresAt: string;
  instructions: readonly string[];
}

export interface ViernesApprovalProcessorContext {
  approvalGate: IntegrationActionApprovalGate;
  auditTrail: IntegrationActionAuditTrail;
  approvalId?: string;
  actionId?: string;
  action?: ProposedIntegrationAction;
  actions?: readonly ProposedIntegrationAction[];
  resolveAction?: (
    actionId: string,
  ) => ProposedIntegrationAction | undefined | Promise<ProposedIntegrationAction | undefined>;
  policyOptions?: TargetPolicyOptions;
  resumeApprovedReadOnly?: boolean;
}

export type ViernesApprovalCommandStatus =
  | "approved"
  | "rejected"
  | "blocked"
  | "unknown"
  | "resumed_read_only"
  | "error";

export interface ViernesApprovalCommandResult {
  status: ViernesApprovalCommandStatus;
  approvalId?: string;
  actionId?: string;
  allowed: boolean;
  reasons: readonly string[];
  decision?: ApprovalDecision;
  executionResult?: IntegrationActionExecutionResult;
  createdAt: string;
}

export interface ViernesResumeApprovedActionResult {
  status: "resumed_read_only" | "blocked" | "action_not_found" | "error";
  actionId?: string;
  approvalId?: string;
  allowed: boolean;
  reasons: readonly string[];
  executionResult?: IntegrationActionExecutionResult;
  createdAt: string;
}
