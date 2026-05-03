import type { IntegrationActionApprovalGate } from "../integrations/actions/approval/approvalGate.js";
import type { IntegrationActionAuditTrail } from "../integrations/actions/audit/auditTrail.js";
import type { TargetPolicyOptions } from "../integrations/actions/policy/types.js";
import type {
  IntegrationActionValidationResult,
  ProposedIntegrationAction,
} from "../integrations/actions/types.js";
import type {
  ViernesBridgeApprovalSummary,
  ViernesBridgeRequest,
  ViernesBridgeResponse,
  ViernesBridgeStatus,
  ViernesBridgeProposedActionSummary,
} from "./types.js";

type ApprovalGateModule = typeof import("../integrations/actions/approval/approvalGate.js");
type AuditTrailModule = typeof import("../integrations/actions/audit/auditTrail.js");
type ExecutionGateModule = typeof import("../integrations/actions/executors/executionGate.js");
type ValidatorModule = typeof import("../integrations/actions/validator.js");
type DryRunModule = typeof import("../integrations/actions/dryRun.js");
type PolicyModule = typeof import("../integrations/actions/policy/policyValidator.js");
type RedactModule = typeof import("../integrations/actions/audit/redact.js");
type NormalizerModule = typeof import("./normalizer.js");
type MapperModule = typeof import("./actionMapper.js");

export interface ViernesBridgeProcessorOptions {
  approvalGate?: IntegrationActionApprovalGate;
  auditTrail?: IntegrationActionAuditTrail;
  policyOptions?: TargetPolicyOptions;
  executeReadOnly?: boolean;
}

async function loadApprovalGateModule(): Promise<ApprovalGateModule> {
  return (await import(new URL("../integrations/actions/approval/approvalGate.ts", import.meta.url).href)) as ApprovalGateModule;
}

async function loadAuditTrailModule(): Promise<AuditTrailModule> {
  return (await import(new URL("../integrations/actions/audit/auditTrail.ts", import.meta.url).href)) as AuditTrailModule;
}

async function loadExecutionGateModule(): Promise<ExecutionGateModule> {
  return (await import(new URL("../integrations/actions/executors/executionGate.ts", import.meta.url).href)) as ExecutionGateModule;
}

async function loadValidatorModule(): Promise<ValidatorModule> {
  return (await import(new URL("../integrations/actions/validator.ts", import.meta.url).href)) as ValidatorModule;
}

async function loadDryRunModule(): Promise<DryRunModule> {
  return (await import(new URL("../integrations/actions/dryRun.ts", import.meta.url).href)) as DryRunModule;
}

async function loadPolicyModule(): Promise<PolicyModule> {
  return (await import(new URL("../integrations/actions/policy/policyValidator.ts", import.meta.url).href)) as PolicyModule;
}

async function loadRedactModule(): Promise<RedactModule> {
  return (await import(new URL("../integrations/actions/audit/redact.ts", import.meta.url).href)) as RedactModule;
}

async function loadNormalizerModule(): Promise<NormalizerModule> {
  return (await import(new URL("./normalizer.ts", import.meta.url).href)) as NormalizerModule;
}

async function loadMapperModule(): Promise<MapperModule> {
  return (await import(new URL("./actionMapper.ts", import.meta.url).href)) as MapperModule;
}

function nowIso(): string {
  return new Date().toISOString();
}

function summarizeAction(
  action: ProposedIntegrationAction,
): ViernesBridgeProposedActionSummary {
  return {
    id: action.id,
    integration: action.integration,
    action: action.action,
    title: action.title,
    riskLevel: action.riskLevel,
    requiresApproval: action.requiresApproval,
    dryRunOnly: action.dryRunOnly,
  };
}

function summarizeApproval(
  approval: Awaited<ReturnType<IntegrationActionApprovalGate["createApprovalRequest"]>>,
): ViernesBridgeApprovalSummary {
  return {
    id: approval.id,
    actionId: approval.actionId,
    integration: approval.integration,
    action: approval.action,
    riskLevel: approval.riskLevel,
    status: approval.status,
    requiredBecause: approval.requiredBecause,
    expiresAt: approval.expiresAt,
  };
}

function validationResult(
  action: ProposedIntegrationAction,
  allowed: boolean,
  reasons: readonly string[],
  warnings: readonly string[] = [],
): IntegrationActionValidationResult {
  return {
    actionId: action.id,
    integration: action.integration,
    action: action.action,
    riskLevel: action.riskLevel,
    allowed,
    reasons,
    warnings,
  };
}

function isReadOnlyExecutable(action: ProposedIntegrationAction): boolean {
  return (
    (action.integration === "github" && action.action === "read_repo_status") ||
    (action.integration === "whatsapp" && action.action === "validate_bridge")
  );
}

function responseStatus(input: {
  mappedActions: number;
  blockedReasons: readonly string[];
  approvalCount: number;
  executionCount: number;
  dryRunReady: boolean;
}): ViernesBridgeStatus {
  if (input.mappedActions === 0 && input.blockedReasons.length === 0) return "no_action";
  if (input.blockedReasons.length > 0) return "blocked";
  if (input.executionCount > 0) return "read_only_executed";
  if (input.approvalCount > 0) return "needs_approval";
  if (input.dryRunReady) return "dry_run_ready";
  return "accepted";
}

function summaryFor(status: ViernesBridgeStatus): string {
  if (status === "no_action") return "No supported Viernes action was requested.";
  if (status === "blocked") return "Viernes request was blocked by local safety policy.";
  if (status === "read_only_executed") return "Allowed read-only action executed safely.";
  if (status === "needs_approval") return "Action proposal is valid but requires ACT approval.";
  if (status === "dry_run_ready") return "Action proposal passed validation and dry-run only.";
  return "Viernes request was accepted for local safety processing.";
}

async function finalizeResponse(
  response: ViernesBridgeResponse,
): Promise<ViernesBridgeResponse> {
  const { redactSensitive } = await loadRedactModule();
  return redactSensitive(response) as ViernesBridgeResponse;
}

export async function processViernesBridgeRequest(
  rawRequest: Partial<ViernesBridgeRequest> & Record<string, unknown>,
  options: ViernesBridgeProcessorOptions = {},
): Promise<ViernesBridgeResponse> {
  const [{ normalizeViernesBridgeRequest }, { mapViernesRequestToActions }] =
    await Promise.all([loadNormalizerModule(), loadMapperModule()]);
  const request = normalizeViernesBridgeRequest(rawRequest);
  const mapped = mapViernesRequestToActions(request);

  if (mapped.actions.length === 0) {
    const status = mapped.blockedReasons.length > 0 ? "blocked" : "no_action";
    return finalizeResponse({
      requestId: request.id,
      status,
      summary: summaryFor(status),
      proposedActions: [],
      ...(mapped.blockedReasons.length > 0
        ? { blockedReasons: mapped.blockedReasons }
        : {}),
      createdAt: nowIso(),
    });
  }

  const [
    approvalGateModule,
    auditTrailModule,
    executionGateModule,
    validatorModule,
    dryRunModule,
    policyModule,
  ] = await Promise.all([
    loadApprovalGateModule(),
    loadAuditTrailModule(),
    loadExecutionGateModule(),
    loadValidatorModule(),
    loadDryRunModule(),
    loadPolicyModule(),
  ]);
  const approvalGate =
    options.approvalGate ?? (await approvalGateModule.createApprovalGate());
  const auditTrail =
    options.auditTrail ?? (await auditTrailModule.createActionAuditTrail());
  const executionGate = executionGateModule.createExecutionGate({
    approvalGate,
    auditTrail,
    ...(options.policyOptions ? { policyOptions: options.policyOptions } : {}),
  });
  const executeReadOnly = options.executeReadOnly ?? true;

  const proposedActions: ViernesBridgeProposedActionSummary[] = [];
  const approvalRequests: ViernesBridgeApprovalSummary[] = [];
  const executionResults = [];
  const blockedReasons: string[] = [];
  const auditIds: string[] = [];
  let dryRunReady = false;

  for (const action of mapped.actions) {
    proposedActions.push(summarizeAction(action));
    await auditTrail.createActionAudit(action);

    const validation = await validatorModule.validateProposedIntegrationAction(action);
    await auditTrail.recordValidationResult(action, validation);
    const [dryRunResult] = await dryRunModule.runIntegrationActionDryRun([action]);
    await auditTrail.recordDryRunResult(action, dryRunResult ?? validation);

    if (!validation.allowed) {
      blockedReasons.push(...validation.reasons);
      await auditTrail.recordActionBlocked(action, validation.reasons);
      const record = await auditTrail.getAuditRecord(action.id);
      auditIds.push(...(record?.events.map((event) => event.id) ?? []));
      continue;
    }

    const policy = await policyModule.validateIntegrationActionPolicy(
      action,
      options.policyOptions,
    );

    if (!policy.allowed) {
      blockedReasons.push(...policy.reasons);
      await auditTrail.recordActionBlocked(action, policy.reasons);
      const record = await auditTrail.getAuditRecord(action.id);
      auditIds.push(...(record?.events.map((event) => event.id) ?? []));
      continue;
    }

    dryRunReady = true;

    if (action.requiresApproval) {
      const approval = await approvalGate.createApprovalRequest(action);
      approvalRequests.push(summarizeApproval(approval));
      await auditTrail.recordApprovalRequested(action, approval);
      const record = await auditTrail.getAuditRecord(action.id);
      auditIds.push(...(record?.events.map((event) => event.id) ?? []));
      continue;
    }

    if (executeReadOnly && isReadOnlyExecutable(action)) {
      const result = await executionGate.execute(action);
      executionResults.push(result);
      if (result.status === "blocked" || result.status === "failed") {
        blockedReasons.push(...(result.blockedReasons ?? ["execution_blocked"]));
      }
    }

    const record = await auditTrail.getAuditRecord(action.id);
    auditIds.push(...(record?.events.map((event) => event.id) ?? []));
  }

  const uniqueBlockedReasons = [...new Set(blockedReasons)];
  const status = responseStatus({
    mappedActions: mapped.actions.length,
    blockedReasons: uniqueBlockedReasons,
    approvalCount: approvalRequests.length,
    executionCount: executionResults.filter(
      (result) => result.status === "executed_read_only",
    ).length,
    dryRunReady,
  });

  return finalizeResponse({
    requestId: request.id,
    status,
    summary: summaryFor(status),
    proposedActions,
    ...(uniqueBlockedReasons.length > 0
      ? { blockedReasons: uniqueBlockedReasons }
      : {}),
    ...(approvalRequests.length > 0 ? { approvalRequests } : {}),
    ...(executionResults.length > 0 ? { executionResults } : {}),
    ...(auditIds.length > 0 ? { auditIds } : {}),
    createdAt: nowIso(),
  });
}
