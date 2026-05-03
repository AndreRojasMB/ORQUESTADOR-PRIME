import type { IntegrationActionApprovalRequest } from "../../integrations/actions/approval/types.js";
import type { ProposedIntegrationAction } from "../../integrations/actions/types.js";
import type {
  ViernesApprovalCommand,
  ViernesApprovalCommandResult,
  ViernesApprovalProcessorContext,
  ViernesResumeApprovedActionResult,
} from "./types.js";

type ExecutionGateModule = typeof import("../../integrations/actions/executors/executionGate.js");
type RedactModule = typeof import("../../integrations/actions/audit/redact.js");

async function loadExecutionGateModule(): Promise<ExecutionGateModule> {
  return (await import(new URL("../../integrations/actions/executors/executionGate.ts", import.meta.url).href)) as ExecutionGateModule;
}

async function loadRedactModule(): Promise<RedactModule> {
  return (await import(new URL("../../integrations/actions/audit/redact.ts", import.meta.url).href)) as RedactModule;
}

function nowIso(): string {
  return new Date().toISOString();
}

function isReadOnlyAllowlistedAction(action: ProposedIntegrationAction): boolean {
  return (
    (action.integration === "github" && action.action === "read_repo_status") ||
    (action.integration === "whatsapp" && action.action === "validate_bridge") ||
    (action.integration === "n8n" && action.action === "validate_webhook")
  );
}

async function finalizeResult<T>(result: T): Promise<T> {
  const { redactSensitive } = await loadRedactModule();
  return redactSensitive(result) as T;
}

async function resolveAction(
  actionId: string,
  context: ViernesApprovalProcessorContext,
): Promise<ProposedIntegrationAction | undefined> {
  if (context.action?.id === actionId) return context.action;

  const listedAction = context.actions?.find((action) => action.id === actionId);
  if (listedAction) return listedAction;

  return context.resolveAction?.(actionId);
}

async function statusByApprovalId(
  approvalId: string | undefined,
  context: ViernesApprovalProcessorContext,
): Promise<IntegrationActionApprovalRequest | undefined> {
  if (!approvalId) return undefined;
  return context.approvalGate.getApprovalStatus(approvalId);
}

async function recordApprovalDecision(
  approval: IntegrationActionApprovalRequest | undefined,
  action: ProposedIntegrationAction | undefined,
  context: ViernesApprovalProcessorContext,
): Promise<void> {
  if (!approval || !action) return;

  if (approval.status === "approved") {
    await context.auditTrail.recordApprovalApproved(action, approval);
  } else if (approval.status === "rejected") {
    await context.auditTrail.recordApprovalRejected(action, approval);
  }
}

export async function resumeApprovedViernesAction(
  actionIdOrApprovalId: string,
  context: ViernesApprovalProcessorContext,
): Promise<ViernesResumeApprovedActionResult> {
  const approval =
    (await statusByApprovalId(context.approvalId ?? actionIdOrApprovalId, context)) ??
    (await statusByApprovalId(context.approvalId, context));
  const actionId = context.actionId ?? approval?.actionId ?? actionIdOrApprovalId;
  const action = await resolveAction(actionId, context);

  if (!action) {
    return finalizeResult({
      status: "action_not_found",
      ...(approval?.id ? { approvalId: approval.id } : {}),
      actionId,
      allowed: false,
      reasons: ["action_not_found_for_resume"],
      createdAt: nowIso(),
    });
  }

  if (!isReadOnlyAllowlistedAction(action)) {
    const { createExecutionGate } = await loadExecutionGateModule();
    const executionGate = createExecutionGate({
      approvalGate: context.approvalGate,
      auditTrail: context.auditTrail,
      ...(context.policyOptions ? { policyOptions: context.policyOptions } : {}),
    });
    const executionResult = await executionGate.execute(action);
    return finalizeResult({
      status: "blocked",
      ...(approval?.id ? { approvalId: approval.id } : {}),
      actionId: action.id,
      allowed: false,
      reasons: executionResult.blockedReasons ?? ["write_action_blocked"],
      executionResult,
      createdAt: nowIso(),
    });
  }

  const { createExecutionGate } = await loadExecutionGateModule();
  const executionGate = createExecutionGate({
    approvalGate: context.approvalGate,
    auditTrail: context.auditTrail,
    ...(context.policyOptions ? { policyOptions: context.policyOptions } : {}),
  });
  const executionResult = await executionGate.execute(action);
  const allowed =
    executionResult.status === "executed_read_only" ||
    executionResult.status === "simulated";

  return finalizeResult({
    status: allowed ? "resumed_read_only" : "blocked",
    ...(approval?.id ? { approvalId: approval.id } : {}),
    actionId: action.id,
    allowed,
    reasons: executionResult.blockedReasons ?? [],
    executionResult,
    createdAt: nowIso(),
  });
}

export async function processViernesApprovalCommand(
  command: ViernesApprovalCommand,
  context: ViernesApprovalProcessorContext,
): Promise<ViernesApprovalCommandResult> {
  if (command.type === "unknown") {
    return finalizeResult({
      status: "unknown",
      allowed: false,
      reasons: ["approval_command_not_recognized"],
      createdAt: nowIso(),
    });
  }

  const approvalIdOrActionId = context.approvalId ?? context.actionId;
  if (!approvalIdOrActionId) {
    return finalizeResult({
      status: "blocked",
      allowed: false,
      reasons: ["approval_context_required"],
      createdAt: nowIso(),
    });
  }

  if (command.type === "reject") {
    if (!context.approvalId) {
      return finalizeResult({
        status: "blocked",
        ...(context.actionId ? { actionId: context.actionId } : {}),
        allowed: false,
        reasons: ["approval_id_required_for_reject"],
        createdAt: nowIso(),
      });
    }

    if (!command.actCode) {
      return finalizeResult({
        status: "blocked",
        approvalId: context.approvalId,
        ...(context.actionId ? { actionId: context.actionId } : {}),
        allowed: false,
        reasons: ["act_code_required"],
        createdAt: nowIso(),
      });
    }

    const verification = await context.approvalGate.verifyApprovalActCode(
      context.approvalId,
      command.actCode,
    );
    if (!verification.allowed) {
      return finalizeResult({
        status: "blocked",
        approvalId: verification.approvalId,
        actionId: verification.actionId,
        allowed: false,
        reasons: verification.reasons,
        decision: verification,
        createdAt: nowIso(),
      });
    }

    const decision = await context.approvalGate.rejectApproval(
      context.approvalId,
      command.reason ?? "user_rejected",
    );
    const approval = await context.approvalGate.getApprovalStatus(decision.approvalId);
    const action = await resolveAction(decision.actionId, context);
    await recordApprovalDecision(approval, action, context);

    return finalizeResult({
      status: "rejected",
      approvalId: decision.approvalId,
      actionId: decision.actionId,
      allowed: false,
      reasons: decision.reasons,
      decision,
      createdAt: nowIso(),
    });
  }

  if (!command.actCode) {
    return finalizeResult({
      status: "blocked",
      allowed: false,
      reasons: ["act_code_required"],
      createdAt: nowIso(),
    });
  }

  const decision = await context.approvalGate.approveAction(
    approvalIdOrActionId,
    command.actCode,
  );
  const approval = await context.approvalGate.getApprovalStatus(decision.approvalId);
  const action = await resolveAction(decision.actionId, context);

  if (decision.allowed) {
    await recordApprovalDecision(approval, action, context);
  }

  if (!decision.allowed || !context.resumeApprovedReadOnly) {
    return finalizeResult({
      status: decision.allowed ? "approved" : "blocked",
      approvalId: decision.approvalId,
      actionId: decision.actionId,
      allowed: decision.allowed,
      reasons: decision.reasons,
      decision,
      createdAt: nowIso(),
    });
  }

  const resumed = await resumeApprovedViernesAction(decision.approvalId, {
    ...context,
    approvalId: decision.approvalId,
    actionId: decision.actionId,
  });

  return finalizeResult({
    status: resumed.allowed ? "resumed_read_only" : "blocked",
    approvalId: decision.approvalId,
    actionId: decision.actionId,
    allowed: resumed.allowed,
    reasons: resumed.reasons,
    decision,
    ...(resumed.executionResult ? { executionResult: resumed.executionResult } : {}),
    createdAt: nowIso(),
  });
}
