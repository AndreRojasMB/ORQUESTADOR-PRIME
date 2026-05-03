import type {
  IntegrationActionIntegration,
  IntegrationActionName,
  ProposedIntegrationAction,
} from "../types.js";
import type { IntegrationStatusOptions } from "../../status.js";

export type ExecutionMode = "dry_run" | "read_only" | "blocked";

export type IntegrationActionExecutionStatus =
  | "skipped"
  | "blocked"
  | "executed_read_only"
  | "simulated"
  | "failed";

export interface IntegrationActionExecutionResult {
  actionId: string;
  integration: IntegrationActionIntegration;
  action: IntegrationActionName;
  status: IntegrationActionExecutionStatus;
  mode: ExecutionMode;
  summary: string;
  evidenceRedacted?: unknown;
  blockedReasons?: readonly string[];
  createdAt: string;
}

export interface IntegrationActionExecutorContext {
  phase: "phase_14" | "phase_15";
  statusOptions?: IntegrationStatusOptions;
}

export type IntegrationActionExecutor = (
  action: ProposedIntegrationAction,
  context: IntegrationActionExecutorContext,
) => Promise<IntegrationActionExecutionResult>;
