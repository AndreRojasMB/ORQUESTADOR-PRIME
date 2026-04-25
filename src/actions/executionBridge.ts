// src/actions/executionBridge.ts
// Controlled execution bridge for approved ActionProposal records.
// Phase 27C — dispatch skeleton, no persistent status mutation.
//
// Supported categories (non-destructive only):
//   - query:       validates and echoes structured intent
//   - notification: logs message locally
//   - tool-invoke:  dry-run only via OpenClaw
//
// All other categories return deferred or blocked results.
// No proposal status is mutated by dispatch.

import { logger } from "../observability/logger.js";
import { isOpenClawAvailable, ACTIONS_REAL_EXECUTION_ENABLED } from "../config.js";
import { toolInvoke } from "../openclaw/openclawClient.js";
import { getProposalById } from "./actionStore.js";
import {
  appendExecutionResult,
  hasSuccessfulExecution,
} from "./executionResultStore.js";
import {
  previewFileWrite,
  previewGitBranch,
  previewPrCreate,
  realGitBranch,
  realFileWrite,
  type PreviewResult,
} from "./repoActionExecutor.js";
import { consumeSecondApproval } from "./secondApprovalStore.js";
import type {
  ActionCategory,
  ActionProposal,
  ExecutionOutcome,
} from "./types.js";

// ─── Typed parameter interfaces ─────────────────────────────────

export interface QueryParams {
  query: string;
  context?: string;
}

export interface NotificationParams {
  message: string;
  channel?: string;
  level?: "info" | "warn" | "error";
}

export interface ToolInvokeParams {
  tool: string;
  action?: string;
  args?: Record<string, unknown>;
  sessionKey?: string;
}

// ─── Dispatch result ────────────────────────────────────────────

export interface DispatchResult {
  ok: boolean;
  category: ActionCategory;
  message: string;
  output: unknown;
}

// ─── Parameter validation ───────────────────────────────────────

function validateQueryParams(
  params: Record<string, unknown>,
): { ok: true; parsed: QueryParams } | { ok: false; reason: string } {
  if (typeof params["query"] !== "string" || !params["query"]) {
    return { ok: false, reason: "Missing or invalid 'query' string in parameters" };
  }
  const parsed: QueryParams = {
    query: params["query"],
  };
  if (params["context"] !== undefined) {
    if (typeof params["context"] !== "string") {
      return { ok: false, reason: "'context' must be a string if provided" };
    }
    parsed.context = params["context"];
  }
  return { ok: true, parsed };
}

function validateNotificationParams(
  params: Record<string, unknown>,
): { ok: true; parsed: NotificationParams } | { ok: false; reason: string } {
  if (typeof params["message"] !== "string" || !params["message"]) {
    return { ok: false, reason: "Missing or invalid 'message' string in parameters" };
  }
  const parsed: NotificationParams = {
    message: params["message"],
  };
  if (params["channel"] !== undefined) {
    if (typeof params["channel"] !== "string") {
      return { ok: false, reason: "'channel' must be a string if provided" };
    }
    parsed.channel = params["channel"];
  }
  if (params["level"] !== undefined) {
    if (params["level"] !== "info" && params["level"] !== "warn" && params["level"] !== "error") {
      return { ok: false, reason: "'level' must be \"info\", \"warn\", or \"error\" if provided" };
    }
    parsed.level = params["level"];
  }
  return { ok: true, parsed };
}

function validateToolInvokeParams(
  params: Record<string, unknown>,
): { ok: true; parsed: ToolInvokeParams } | { ok: false; reason: string } {
  if (typeof params["tool"] !== "string" || !params["tool"]) {
    return { ok: false, reason: "Missing or invalid 'tool' string in parameters" };
  }
  const parsed: ToolInvokeParams = {
    tool: params["tool"],
  };
  if (params["action"] !== undefined) {
    if (typeof params["action"] !== "string") {
      return { ok: false, reason: "'action' must be a string if provided" };
    }
    parsed.action = params["action"];
  }
  if (params["args"] !== undefined) {
    if (typeof params["args"] !== "object" || params["args"] === null || Array.isArray(params["args"])) {
      return { ok: false, reason: "'args' must be an object if provided" };
    }
    parsed.args = params["args"] as Record<string, unknown>;
  }
  if (params["sessionKey"] !== undefined) {
    if (typeof params["sessionKey"] !== "string") {
      return { ok: false, reason: "'sessionKey' must be a string if provided" };
    }
    parsed.sessionKey = params["sessionKey"];
  }
  return { ok: true, parsed };
}

// ─── Category handlers ──────────────────────────────────────────

async function handleQuery(proposal: ActionProposal): Promise<DispatchResult> {
  const validation = validateQueryParams(proposal.parameters);
  if (!validation.ok) {
    return { ok: false, category: "query", message: validation.reason, output: null };
  }

  const { parsed } = validation;
  logger.info("action:dispatch query", { query: parsed.query, context: parsed.context });

  return {
    ok: true,
    category: "query",
    message: "Query intent confirmed",
    output: { query: parsed.query, context: parsed.context ?? null },
  };
}

async function handleNotification(proposal: ActionProposal): Promise<DispatchResult> {
  const validation = validateNotificationParams(proposal.parameters);
  if (!validation.ok) {
    return { ok: false, category: "notification", message: validation.reason, output: null };
  }

  const { parsed } = validation;
  const level = parsed.level ?? "info";

  if (level === "error") {
    logger.error(`action:notification [${parsed.channel ?? "default"}] ${parsed.message}`);
  } else if (level === "warn") {
    logger.warn(`action:notification [${parsed.channel ?? "default"}] ${parsed.message}`);
  } else {
    logger.info(`action:notification [${parsed.channel ?? "default"}] ${parsed.message}`);
  }

  return {
    ok: true,
    category: "notification",
    message: `Notification logged (${level})`,
    output: { message: parsed.message, channel: parsed.channel ?? null, level },
  };
}

async function handleToolInvoke(proposal: ActionProposal): Promise<DispatchResult> {
  const validation = validateToolInvokeParams(proposal.parameters);
  if (!validation.ok) {
    return { ok: false, category: "tool-invoke", message: validation.reason, output: null };
  }

  if (!isOpenClawAvailable()) {
    return {
      ok: false,
      category: "tool-invoke",
      message: "OpenClaw is not configured — tool invocation unavailable",
      output: null,
    };
  }

  const { parsed } = validation;

  try {
    const response = await toolInvoke({
      tool: parsed.tool,
      action: parsed.action,
      args: parsed.args,
      sessionKey: parsed.sessionKey ?? "main",
      dryRun: true,
    });

    logger.info("action:dispatch tool-invoke dry-run", {
      tool: parsed.tool,
      action: parsed.action,
      ok: response.ok,
    });

    return {
      ok: response.ok,
      category: "tool-invoke",
      message: response.ok
        ? `Dry-run of "${parsed.tool}" succeeded`
        : `Dry-run of "${parsed.tool}" failed: ${response.error ?? "unknown error"}`,
      output: { dryRun: true, result: response.result ?? null, error: response.error ?? null },
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logger.warn("action:dispatch tool-invoke error", { tool: parsed.tool, error: errorMsg });
    return {
      ok: false,
      category: "tool-invoke",
      message: `Tool invocation failed: ${errorMsg}`,
      output: { dryRun: true, error: errorMsg },
    };
  }
}

// ─── Deferred / blocked categories ──────────────────────────────

const FORBIDDEN_CATEGORIES: Set<ActionCategory> = new Set([
  "file-delete",
  "git-push",
  "pr-merge",
  "deploy",
]);

const DEFERRED_CATEGORIES: Set<ActionCategory> = new Set([
  "config-change",
  "other",
]);

// Phase 32A — preview-only categories. Real execution stays gated on
// ACTIONS_REAL_EXECUTION_ENABLED, which defaults to false. When the flag
// is on in a future phase, these categories will consume a second approval
// and delegate to src/execution/*; for 32A they always return a preview.
const PREVIEW_CATEGORIES: Set<ActionCategory> = new Set([
  "file-write",
  "git-branch",
  "pr-create",
]);

// Phase 32B/D — hard-coded allowlist for real (repo-mutating) execution.
// Belt-and-suspenders with ACTIONS_REAL_EXECUTION_ENABLED: both must hold.
// Expanding this set requires a code change (reviewable), not an env flip.
const REAL_EXEC_CATEGORIES: Set<ActionCategory> = new Set([
  "git-branch",
  "file-write",
]);

function buildBlockedResult(proposal: ActionProposal): DispatchResult {
  return {
    ok: false,
    category: proposal.category,
    message: `Category "${proposal.category}" is forbidden — execution permanently blocked`,
    output: null,
  };
}

function buildDeferredResult(proposal: ActionProposal): DispatchResult {
  return {
    ok: false,
    category: proposal.category,
    message: `Category "${proposal.category}" is deferred — execution not yet available in this phase`,
    output: null,
  };
}

// ─── Preview handler (Phase 32A) ────────────────────────────────

async function handleRepoPreview(proposal: ActionProposal): Promise<DispatchResult> {
  // Real-execution routing (Phase 32B/D). Both gates required.
  if (
    ACTIONS_REAL_EXECUTION_ENABLED &&
    REAL_EXEC_CATEGORIES.has(proposal.category)
  ) {
    if (proposal.category === "git-branch") {
      return handleGitBranchReal(proposal);
    }
    if (proposal.category === "file-write") {
      return handleFileWriteReal(proposal);
    }
    // Category is in the real allowlist but has no handler yet — fail closed.
    logger.warn("action:dispatch real execution allowlisted but handler not implemented", {
      id: proposal.id,
      category: proposal.category,
    });
    return {
      ok: false,
      category: proposal.category,
      message: `Real execution for "${proposal.category}" is not implemented yet.`,
      output: null,
    };
  }

  if (ACTIONS_REAL_EXECUTION_ENABLED) {
    // Flag is on, but this category is not in the hard-coded allowlist.
    // Refuse to emit a preview to avoid confusion about whether it ran.
    logger.warn("action:dispatch real execution flag set but category not allowlisted", {
      id: proposal.id,
      category: proposal.category,
    });
    return {
      ok: false,
      category: proposal.category,
      message: `Category "${proposal.category}" is not enabled for real execution.`,
      output: null,
    };
  }

  let preview: PreviewResult;
  try {
    if (proposal.category === "file-write") {
      preview = await previewFileWrite(proposal);
    } else if (proposal.category === "git-branch") {
      preview = await previewGitBranch(proposal);
    } else if (proposal.category === "pr-create") {
      preview = await previewPrCreate(proposal);
    } else {
      return buildDeferredResult(proposal);
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logger.warn("action:preview threw", {
      id: proposal.id,
      category: proposal.category,
      error: errorMsg,
    });
    return {
      ok: false,
      category: proposal.category,
      message: `Preview failed: ${errorMsg}`,
      output: null,
    };
  }

  return {
    ok: preview.ok,
    category: proposal.category,
    message: `${preview.message} (preview only — no repo mutation)`,
    output: {
      dryRun: true,
      kind: preview.kind,
      preview: preview.preview,
      warnings: preview.warnings,
      rollbackPlan: preview.rollbackPlan,
    },
  };
}

// ─── Real git-branch handler (Phase 32B) ────────────────────────

async function handleGitBranchReal(proposal: ActionProposal): Promise<DispatchResult> {
  // Consume-before-mutate. Single-use: a granted approval is spent even if
  // the mutation later fails (fail-closed policy). Existing guards inside
  // consumeSecondApproval: not found, not approved, no active grant,
  // expired, revoked, consumed, parameter-hash drift.
  const consume = await consumeSecondApproval(proposal.id);
  if (!consume.ok || !consume.approval) {
    logger.warn("action:real git-branch refused — second approval not consumable", {
      id: proposal.id,
      reason: consume.reason,
    });
    return {
      ok: false,
      category: proposal.category,
      message: `Refused: ${consume.reason}`,
      output: null,
    };
  }

  const approvalId = consume.approval.id;
  const result = await realGitBranch(proposal);

  if (!result.ok) {
    return {
      ok: false,
      category: proposal.category,
      message: result.message,
      output: {
        dryRun: false,
        kind: "git-branch",
        approvalId,
        branchName: result.branchName,
        fromBranch: result.fromBranch,
        warnings: result.warnings,
        rollbackPlan: result.rollbackPlan,
      },
    };
  }

  return {
    ok: true,
    category: proposal.category,
    message: result.message,
    output: {
      dryRun: false,
      kind: "git-branch",
      approvalId,
      branchName: result.branchName,
      fromBranch: result.fromBranch,
      warnings: result.warnings,
      rollbackPlan: result.rollbackPlan,
    },
  };
}

// ─── Real file-write handler (Phase 32D) ────────────────────────

async function handleFileWriteReal(proposal: ActionProposal): Promise<DispatchResult> {
  // Consume-before-mutate. Single-use: a granted approval is spent even if
  // the validation or write later fails (fail-closed policy, matches
  // handleGitBranchReal). Existing guards inside consumeSecondApproval:
  // not found, not approved, no active grant, expired, revoked, consumed,
  // parameter-hash drift.
  const consume = await consumeSecondApproval(proposal.id);
  if (!consume.ok || !consume.approval) {
    logger.warn("action:real file-write refused — second approval not consumable", {
      id: proposal.id,
      reason: consume.reason,
    });
    return {
      ok: false,
      category: proposal.category,
      message: `Refused: ${consume.reason}`,
      output: null,
    };
  }

  const approvalId = consume.approval.id;
  const result = await realFileWrite(proposal);

  return {
    ok: result.ok,
    category: proposal.category,
    message: result.message,
    output: {
      dryRun: false,
      kind: "file-write",
      approvalId,
      branchName: result.branchName,
      filesWritten: result.filesWritten,
      filesSkipped: result.filesSkipped,
      backup: result.backup,
      warnings: result.warnings,
      rollbackPlan: result.rollbackPlan,
    },
  };
}

// ─── Outcome classification ─────────────────────────────────────

function outcomeFor(
  category: ActionCategory,
  dispatch: DispatchResult,
): ExecutionOutcome {
  if (FORBIDDEN_CATEGORIES.has(category)) return "blocked";
  if (DEFERRED_CATEGORIES.has(category)) return "deferred";
  if (category === "tool-invoke") return "dry-run";

  // Real-execution path (Phase 32B): both gates required.
  if (
    ACTIONS_REAL_EXECUTION_ENABLED &&
    REAL_EXEC_CATEGORIES.has(category)
  ) {
    return dispatch.ok ? "success" : "failure";
  }

  if (PREVIEW_CATEGORIES.has(category)) {
    // Flag on without a real-execution handler for this category: the
    // dispatcher refused, record as failure so it is visible in the log.
    if (ACTIONS_REAL_EXECUTION_ENABLED) return "failure";
    return "dry-run";
  }

  if (dispatch.ok) return "success";
  return "failure";
}

// ─── Main dispatch function ─────────────────────────────────────

/**
 * Dispatches an approved ActionProposal.
 *
 * Phase 30A constraints:
 * - Only query, notification, and tool-invoke (dry-run) have side effects
 * - All other categories return deferred or blocked results
 * - No ActionStatus mutation — approval metadata is preserved
 * - Every dispatch is logged to the execution result store (append-only)
 * - Idempotency: refuses if a prior successful dispatch exists for this proposal
 */
export async function dispatchAction(
  proposalId: string,
  actor: string = "cli:local",
): Promise<DispatchResult> {
  const proposal = await getProposalById(proposalId);

  if (!proposal) {
    return {
      ok: false,
      category: "other",
      message: `Proposal "${proposalId}" not found`,
      output: null,
    };
  }

  if (proposal.status !== "approved") {
    return {
      ok: false,
      category: proposal.category,
      message: `Cannot dispatch: proposal is "${proposal.status}", expected "approved"`,
      output: null,
    };
  }

  // Idempotency — refuse if an earlier dispatch succeeded for this proposal.
  if (await hasSuccessfulExecution(proposal.id)) {
    logger.info("action:dispatch refused — already succeeded", {
      id: proposal.id,
      category: proposal.category,
    });
    return {
      ok: false,
      category: proposal.category,
      message: "Dispatch refused: this proposal has already been executed successfully",
      output: null,
    };
  }

  const startedAt = new Date();
  let result: DispatchResult;

  try {
    if (FORBIDDEN_CATEGORIES.has(proposal.category)) {
      logger.warn("action:dispatch blocked — forbidden category", {
        id: proposal.id,
        category: proposal.category,
      });
      result = buildBlockedResult(proposal);
    } else if (DEFERRED_CATEGORIES.has(proposal.category)) {
      logger.info("action:dispatch deferred", {
        id: proposal.id,
        category: proposal.category,
      });
      result = buildDeferredResult(proposal);
    } else if (PREVIEW_CATEGORIES.has(proposal.category)) {
      logger.info("action:dispatch preview", {
        id: proposal.id,
        category: proposal.category,
      });
      result = await handleRepoPreview(proposal);
    } else {
      switch (proposal.category) {
        case "query":
          result = await handleQuery(proposal);
          break;
        case "notification":
          result = await handleNotification(proposal);
          break;
        case "tool-invoke":
          result = await handleToolInvoke(proposal);
          break;
        default:
          result = buildDeferredResult(proposal);
      }
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logger.warn("action:dispatch handler threw", {
      id: proposal.id,
      category: proposal.category,
      error: errorMsg,
    });
    result = {
      ok: false,
      category: proposal.category,
      message: `Handler threw: ${errorMsg}`,
      output: null,
    };
  }

  const finishedAt = new Date();
  await appendExecutionResult({
    proposalId: proposal.id,
    category: proposal.category,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs: finishedAt.getTime() - startedAt.getTime(),
    outcome: outcomeFor(proposal.category, result),
    ok: result.ok,
    message: result.message,
    output: result.output,
    actor,
  });

  return result;
}
