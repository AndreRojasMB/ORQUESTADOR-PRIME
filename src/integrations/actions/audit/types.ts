import type {
  IntegrationActionIntegration,
  IntegrationActionName,
  IntegrationActionRiskLevel,
} from "../types.js";

export type AuditEventType =
  | "action_created"
  | "validation_completed"
  | "dry_run_completed"
  | "approval_requested"
  | "approval_approved"
  | "approval_rejected"
  | "action_blocked"
  | "ready_for_execution"
  | "execution_skipped_phase_13"
  | "execution_started"
  | "execution_completed"
  | "execution_blocked"
  | "execution_failed";

export interface IntegrationActionAuditEvent {
  id: string;
  actionId: string;
  approvalId?: string;
  eventType: AuditEventType;
  integration: IntegrationActionIntegration;
  action: IntegrationActionName;
  riskLevel: IntegrationActionRiskLevel;
  status: string;
  summary: string;
  detailsRedacted?: unknown;
  actor?: string;
  createdAt: string;
}

export interface IntegrationActionAuditRecord {
  actionId: string;
  integration: IntegrationActionIntegration;
  action: IntegrationActionName;
  riskLevel: IntegrationActionRiskLevel;
  createdAt: string;
  updatedAt: string;
  events: IntegrationActionAuditEvent[];
}
