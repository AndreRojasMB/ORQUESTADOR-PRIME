import type { AutopilotBoundarySet, AutopilotRiskLevel } from "./types.js";

export const autopilotSourceOnlyBoundaries: AutopilotBoundarySet = {
  advisoryOnly: true,
  sourceOnly: true,
  metadataOnly: true,
  noRuntimeExecutor: true,
  noCodexInvocation: true,
  noOpenClawExecution: true,
  noWhatsAppOutbound: true,
  noN8nExecution: true,
  noProviderCalls: true,
  noNetwork: true,
  noFilesystemReads: true,
  noFilesystemWrites: true,
  noEnvReads: true,
  noDashboardMutation: true,
  noMemoryMutation: true,
  noDbSqlMutation: true,
  noDeploy: true,
  noPackageWorkflowChanges: true,
  noGitMutationFromSource: true,
  requiresHumanApprovalForExecution: true,
};

export const autopilotAllowedMvpRiskLevels = [
  "observe_only",
  "report_only",
  "plan_only",
  "propose_only",
  "critical_plan_only",
] as const satisfies readonly AutopilotRiskLevel[];

export const autopilotFutureExecutionRiskLevels = [
  "execute_low_risk_future",
  "execute_gated_future",
] as const satisfies readonly AutopilotRiskLevel[];

export function isAutopilotFutureExecutionRisk(
  riskLevel: AutopilotRiskLevel,
): boolean {
  return (autopilotFutureExecutionRiskLevels as readonly AutopilotRiskLevel[])
    .includes(riskLevel);
}

export function isAutopilotMvpAllowedRisk(
  riskLevel: AutopilotRiskLevel,
): boolean {
  return (autopilotAllowedMvpRiskLevels as readonly AutopilotRiskLevel[])
    .includes(riskLevel);
}
