import type {
  IntegrationActionContract,
  IntegrationActionRiskLevel,
  IntegrationActionValidationResult,
  ProposedIntegrationAction,
} from "./types.js";

const RISK_RANK: Record<IntegrationActionRiskLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

function hasText(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function hasPlan(plan: ProposedIntegrationAction["evidencePlan"]): boolean {
  return !!(
    plan &&
    hasText(plan.summary) &&
    Array.isArray(plan.steps) &&
    plan.steps.length > 0 &&
    plan.steps.every((step) => hasText(step))
  );
}

function isValidCreatedAt(value: string): boolean {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp);
}

type ContractsModule = typeof import("./contracts.js");

async function loadContractsModule(): Promise<ContractsModule> {
  return (await import(new URL("./contracts.ts", import.meta.url).href)) as ContractsModule;
}

async function getContract(
  action: ProposedIntegrationAction,
): Promise<IntegrationActionContract | undefined> {
  const { getIntegrationActionContract } = await loadContractsModule();
  return getIntegrationActionContract(action.integration, action.action);
}

export async function validateProposedIntegrationAction(
  action: ProposedIntegrationAction,
): Promise<IntegrationActionValidationResult> {
  const reasons: string[] = [];
  const warnings: string[] = [];
  const contract = await getContract(action);

  if (!contract) {
    reasons.push("unsupported_integration_action");
  }

  if (!hasText(action.id)) reasons.push("missing_id");
  if (!hasText(action.title)) reasons.push("missing_title");
  if (!hasText(action.description)) reasons.push("missing_description");
  if (!hasText(action.expectedOutcome)) reasons.push("missing_expected_outcome");
  if (!isValidCreatedAt(action.createdAt)) reasons.push("invalid_created_at");

  if (action.blockedReasons && action.blockedReasons.length > 0) {
    reasons.push("action_contains_blocked_reasons");
  }

  if (!action.dryRunOnly) {
    reasons.push("real_execution_disabled_in_phase_11");
  }

  if (contract) {
    const requiredRisk = RISK_RANK[contract.minimumRiskLevel];
    const actualRisk = RISK_RANK[action.riskLevel];
    if (actualRisk < requiredRisk) {
      reasons.push(`risk_level_below_contract_minimum:${contract.minimumRiskLevel}`);
    }

    const approvalRequired =
      contract.requiresApproval || contract.externalEffect || contract.destructive;
    if (approvalRequired && !action.requiresApproval) {
      reasons.push("approval_required_by_contract");
    }

    if (!contract.requiresApproval && action.requiresApproval) {
      warnings.push("approval_requested_for_low_risk_local_contract");
    }

    if (contract.evidenceRequired && !hasPlan(action.evidencePlan)) {
      reasons.push("evidence_plan_required");
    }

    const critical = action.riskLevel === "critical" || contract.minimumRiskLevel === "critical";
    if (critical && !hasPlan(action.rollbackPlan)) {
      reasons.push("critical_action_requires_rollback_plan");
    }
  }

  if (action.riskLevel === "high" && !hasPlan(action.evidencePlan)) {
    reasons.push("high_risk_action_requires_evidence_plan");
  }

  if (action.riskLevel === "critical" && !hasPlan(action.rollbackPlan)) {
    reasons.push("critical_risk_action_requires_rollback_plan");
  }

  return {
    actionId: action.id,
    integration: action.integration,
    action: action.action,
    riskLevel: action.riskLevel,
    allowed: reasons.length === 0,
    reasons,
    warnings,
  };
}
