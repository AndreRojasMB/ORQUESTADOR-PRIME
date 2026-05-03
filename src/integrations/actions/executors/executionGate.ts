import type { IntegrationActionApprovalGate } from "../approval/approvalGate.js";
import type { IntegrationActionAuditTrail } from "../audit/auditTrail.js";
import type { TargetPolicyOptions } from "../policy/types.js";
import type { ProposedIntegrationAction } from "../types.js";
import type { IntegrationActionExecutionResult } from "./types.js";

type ValidatorModule = typeof import("../validator.js");
type PolicyModule = typeof import("../policy/policyValidator.js");
type RedactModule = typeof import("../audit/redact.js");
type RegistryModule = typeof import("./registry.js");

async function loadValidatorModule(): Promise<ValidatorModule> {
  return (await import(new URL("../validator.ts", import.meta.url).href)) as ValidatorModule;
}

async function loadPolicyModule(): Promise<PolicyModule> {
  return (await import(new URL("../policy/policyValidator.ts", import.meta.url).href)) as PolicyModule;
}

async function loadRedactModule(): Promise<RedactModule> {
  return (await import(new URL("../audit/redact.ts", import.meta.url).href)) as RedactModule;
}

async function loadRegistryModule(): Promise<RegistryModule> {
  return (await import(new URL("./registry.ts", import.meta.url).href)) as RegistryModule;
}

function nowIso(): string {
  return new Date().toISOString();
}

function blockedResult(
  action: ProposedIntegrationAction,
  reasons: readonly string[],
): IntegrationActionExecutionResult {
  return {
    actionId: action.id,
    integration: action.integration,
    action: action.action,
    status: "blocked",
    mode: "blocked",
    summary: "Execution gate blocked the action.",
    blockedReasons: reasons,
    createdAt: nowIso(),
  };
}

export interface ExecutionGateOptions {
  approvalGate: IntegrationActionApprovalGate;
  auditTrail: IntegrationActionAuditTrail;
  policyOptions?: TargetPolicyOptions;
}

export class IntegrationActionExecutionGate {
  private readonly approvalGate: IntegrationActionApprovalGate;
  private readonly auditTrail: IntegrationActionAuditTrail;
  private readonly policyOptions: TargetPolicyOptions;

  constructor(options: ExecutionGateOptions) {
    this.approvalGate = options.approvalGate;
    this.auditTrail = options.auditTrail;
    this.policyOptions = options.policyOptions ?? {};
  }

  async execute(
    action: ProposedIntegrationAction,
  ): Promise<IntegrationActionExecutionResult> {
    const auditRecord = await this.auditTrail.getAuditRecord(action.id);
    if (!auditRecord) {
      return blockedResult(action, ["audit_record_required"]);
    }

    const { validateProposedIntegrationAction } = await loadValidatorModule();
    const validation = await validateProposedIntegrationAction(action);
    if (!validation.allowed) {
      const result = blockedResult(action, validation.reasons);
      await this.auditTrail.recordExecutionBlocked(action, validation.reasons);
      return result;
    }

    const registry = await loadRegistryModule();
    if (!registry.isExecutorAllowlisted(action.integration, action.action)) {
      const reasons = ["action_not_allowlisted_phase_14"];
      const result = blockedResult(action, reasons);
      await this.auditTrail.recordExecutionBlocked(action, reasons);
      return result;
    }

    if (!action.dryRunOnly) {
      const reasons = ["real_execution_not_enabled_phase_15"];
      const result = blockedResult(action, reasons);
      await this.auditTrail.recordExecutionBlocked(action, reasons);
      return result;
    }

    const { validateIntegrationActionPolicy } = await loadPolicyModule();
    const policy = await validateIntegrationActionPolicy(
      action,
      this.policyOptions,
    );
    if (!policy.allowed) {
      const result = blockedResult(action, policy.reasons);
      await this.auditTrail.recordExecutionBlocked(action, policy.reasons);
      return result;
    }

    if (action.requiresApproval) {
      const approval = await this.approvalGate.assertActionApproved(action);
      if (!approval.allowed) {
        const result = blockedResult(action, approval.reasons);
        await this.auditTrail.recordExecutionBlocked(action, approval.reasons);
        return result;
      }
    }

    const executor = await registry.getIntegrationActionExecutor(
      action.integration,
      action.action,
    );
    if (!executor) {
      const reasons = ["executor_not_registered"];
      const result = blockedResult(action, reasons);
      await this.auditTrail.recordExecutionBlocked(action, reasons);
      return result;
    }

    await this.auditTrail.recordExecutionStarted(action);

    try {
      const result = await executor(action, {
        phase: "phase_15",
        statusOptions: this.policyOptions,
      });
      const { redactSensitive } = await loadRedactModule();
      const redactedResult: IntegrationActionExecutionResult = {
        ...result,
        ...(result.evidenceRedacted !== undefined
          ? { evidenceRedacted: redactSensitive(result.evidenceRedacted) }
          : {}),
      };
      await this.auditTrail.recordExecutionCompleted(action, redactedResult);
      return redactedResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : "unknown_executor_error";
      await this.auditTrail.recordExecutionFailed(action, message);
      return {
        actionId: action.id,
        integration: action.integration,
        action: action.action,
        status: "failed",
        mode: "blocked",
        summary: "Safe executor failed before completing.",
        blockedReasons: ["executor_failed"],
        createdAt: nowIso(),
      };
    }
  }
}

export function createExecutionGate(
  options: ExecutionGateOptions,
): IntegrationActionExecutionGate {
  return new IntegrationActionExecutionGate(options);
}
