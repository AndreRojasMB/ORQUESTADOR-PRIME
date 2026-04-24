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
import { isOpenClawAvailable } from "../config.js";
import { toolInvoke } from "../openclaw/openclawClient.js";
import { getProposalById } from "./actionStore.js";
import type { ActionCategory, ActionProposal } from "./types.js";

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
  "file-write",
  "git-branch",
  "pr-create",
  "config-change",
  "other",
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

// ─── Main dispatch function ─────────────────────────────────────

/**
 * Dispatches an approved ActionProposal.
 *
 * Phase 27C constraints:
 * - Only query, notification, and tool-invoke (dry-run) are executed
 * - All other categories return deferred or blocked results
 * - No proposal status is mutated
 * - DispatchResult is ephemeral, not persisted
 */
export async function dispatchAction(proposalId: string): Promise<DispatchResult> {
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

  // Forbidden — hard block
  if (FORBIDDEN_CATEGORIES.has(proposal.category)) {
    logger.warn("action:dispatch blocked — forbidden category", {
      id: proposal.id,
      category: proposal.category,
    });
    return buildBlockedResult(proposal);
  }

  // Deferred — not yet implemented
  if (DEFERRED_CATEGORIES.has(proposal.category)) {
    logger.info("action:dispatch deferred", {
      id: proposal.id,
      category: proposal.category,
    });
    return buildDeferredResult(proposal);
  }

  // Supported categories
  switch (proposal.category) {
    case "query":
      return handleQuery(proposal);
    case "notification":
      return handleNotification(proposal);
    case "tool-invoke":
      return handleToolInvoke(proposal);
    default:
      return buildDeferredResult(proposal);
  }
}
