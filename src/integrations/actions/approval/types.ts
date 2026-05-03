import type {
  IntegrationActionName,
  IntegrationActionRiskLevel,
  IntegrationActionIntegration,
} from "../types.js";

export type ApprovalStatus = "pending" | "approved" | "rejected" | "expired";

export interface IntegrationActionApprovalRequest {
  id: string;
  actionId: string;
  actionSummary: string;
  integration: IntegrationActionIntegration;
  action: IntegrationActionName;
  riskLevel: IntegrationActionRiskLevel;
  requiredBecause: readonly string[];
  actCode: string;
  status: ApprovalStatus;
  createdAt: string;
  expiresAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}
export interface ApprovalDecision {
  approvalId: string;
  actionId: string;
  status: ApprovalStatus;
  allowed: boolean;
  reasons: readonly string[];
}
