// src/actions/channelDispatchBridge.ts
// Fail-closed external channel dispatch wrapper.
// This file adds no channel runtime wiring; callers must opt in explicitly.

import { ACTIONS_REAL_EXECUTION_ENABLED } from "../config.js";
import { readUserConfig } from "../config/userConfigStore.js";
import type { UserConfig } from "../config/userConfig.js";
import { getProposalById } from "./actionStore.js";
import {
  appendChannelAudit,
  getRecentChannelAudit,
  type AppendChannelAuditInput,
} from "./channelAuditStore.js";
import {
  dispatchAction,
  isRealExecutionCategoryAllowlisted,
  type DispatchResult,
} from "./executionBridge.js";
import {
  getResultsByProposalId,
  hasSuccessfulExecution,
} from "./executionResultStore.js";
import {
  hashProposalParameters,
  readSecondApprovalStore,
} from "./secondApprovalStore.js";
import { GLOBAL_FORBIDDEN_ACTION_CATEGORIES } from "./types.js";
import type {
  ActionCategory,
  ActionProposal,
  ChannelAuditEntry,
  ChannelAuditReasonCode,
  ChannelAuthMethod,
  ChannelIdentity,
  ChannelKind,
  ChannelPermission,
  ChannelPermissionSnapshot,
  ExecutionResult,
  SecondApproval,
} from "./types.js";

// ─── Constants ──────────────────────────────────────────────────

const ONE_HOUR_MS = 60 * 60 * 1000;

const CHANNEL_KINDS: readonly ChannelKind[] = [
  "cli",
  "whatsapp",
  "omi",
  "dashboard",
  "openclaw",
  "system",
  "api",
];

type DispatchChannelKind = Exclude<ChannelKind, "cli" | "system" | "api">;

const GLOBAL_FORBIDDEN_CATEGORY_SET: ReadonlySet<ActionCategory> =
  new Set<ActionCategory>(GLOBAL_FORBIDDEN_ACTION_CATEGORIES);

// ─── Public bridge types ────────────────────────────────────────

export interface DispatchApprovedFromChannelInput {
  identity?: ChannelIdentity | null;
  proposalId: string;
  sourceEventId?: string | null;
  correlationId?: string | null;
  runId?: string | null;
}

export interface DispatchApprovedFromChannelOptions {
  config?: UserConfig;
  now?: () => Date;
}

export interface ChannelDispatchPolicyDecision {
  ok: boolean;
  proposal: ActionProposal | null;
  permission: ChannelPermission | null;
  reasonCode: ChannelAuditReasonCode;
  reason: string;
  secondApprovalId: string | null;
}

export interface DispatchApprovedFromChannelResult {
  ok: boolean;
  dispatch: DispatchResult | null;
  proposal: ActionProposal | null;
  preAuditEntry: ChannelAuditEntry | null;
  postAuditEntry: ChannelAuditEntry | null;
  preAuditPersisted: boolean;
  postAuditPersisted: boolean;
  reasonCode: ChannelAuditReasonCode;
  reason: string;
  secondApprovalId: string | null;
  executionResultId: string | null;
}

// ─── Type guards / snapshots ────────────────────────────────────

function isChannelKind(value: unknown): value is ChannelKind {
  return typeof value === "string" && CHANNEL_KINDS.includes(value as ChannelKind);
}

function isDispatchChannelKind(channel: ChannelKind): channel is DispatchChannelKind {
  return (
    channel === "whatsapp" ||
    channel === "omi" ||
    channel === "dashboard" ||
    channel === "openclaw"
  );
}

function clonePermissionSnapshot(
  permission: ChannelPermission,
): ChannelPermissionSnapshot {
  return {
    canCreateProposal: permission.canCreateProposal,
    canRequestReview: permission.canRequestReview,
    canListPending: permission.canListPending,
    canGrantSecondApproval: permission.canGrantSecondApproval,
    canDispatchApproved: permission.canDispatchApproved,
    allowedProposalCategories: permission.allowedProposalCategories.slice(),
    allowedDispatchCategories: permission.allowedDispatchCategories.slice(),
    forbiddenCategories: permission.forbiddenCategories.slice(),
    maxProposalsPerHour: permission.maxProposalsPerHour,
    maxDispatchesPerHour: permission.maxDispatchesPerHour,
  };
}

function auditIdentityForInput(
  input: DispatchApprovedFromChannelInput,
): Pick<
  ChannelIdentity,
  | "channel"
  | "principalHash"
  | "trusted"
  | "trustReason"
  | "authMethod"
  | "sourceEventId"
> {
  const identity = input.identity;
  const channel =
    identity && isChannelKind(identity.channel) ? identity.channel : "system";
  const authMethod: ChannelAuthMethod = identity?.authMethod ?? "none";

  return {
    channel,
    principalHash: identity?.principalHash ?? null,
    trusted: identity?.trusted ?? false,
    trustReason: identity?.trustReason ?? "missing identity",
    authMethod,
    sourceEventId: identity?.sourceEventId ?? input.sourceEventId ?? null,
  };
}

function buildPolicyDecision(
  reasonCode: ChannelAuditReasonCode,
  reason: string,
  proposal: ActionProposal | null,
  permission: ChannelPermission | null,
  secondApprovalId: string | null = null,
): ChannelDispatchPolicyDecision {
  return {
    ok: false,
    proposal,
    permission,
    reasonCode,
    reason,
    secondApprovalId,
  };
}

function safeActor(identity: ChannelIdentity): string {
  const shortHash = (identity.principalHash ?? "")
    .trim()
    .slice(0, 12)
    .replace(/[^a-zA-Z0-9_-]/g, "");
  return `channel:${identity.channel}:${shortHash || "unknown"}`;
}

// ─── Audit helpers ──────────────────────────────────────────────

async function auditDispatchDecision(
  input: DispatchApprovedFromChannelInput,
  decision: "allowed" | "blocked",
  reasonCode: ChannelAuditReasonCode,
  reason: string,
  proposal: ActionProposal | null,
  permission: ChannelPermission | null,
  secondApprovalId: string | null,
  executionResultId: string | null,
): Promise<{ entry: ChannelAuditEntry; persisted: boolean }> {
  const auditInput: AppendChannelAuditInput = {
    identity: auditIdentityForInput(input),
    operation: "dispatch-approved",
    decision,
    reasonCode,
    reason,
    category: proposal?.category ?? null,
    proposalId: proposal?.id ?? normalizedProposalId(input.proposalId),
    correlationId: input.correlationId ?? null,
    runId: input.runId ?? null,
    realExecutionEnabled: ACTIONS_REAL_EXECUTION_ENABLED,
    secondApprovalId,
    executionResultId,
  };

  if (permission) {
    auditInput.permissionSnapshot = clonePermissionSnapshot(permission);
  }

  return appendChannelAudit(auditInput);
}

async function blockedResult(
  input: DispatchApprovedFromChannelInput,
  policy: ChannelDispatchPolicyDecision,
): Promise<DispatchApprovedFromChannelResult> {
  const audit = await auditDispatchDecision(
    input,
    "blocked",
    policy.reasonCode,
    policy.reason,
    policy.proposal,
    policy.permission,
    policy.secondApprovalId,
    null,
  );

  return {
    ok: false,
    dispatch: null,
    proposal: policy.proposal,
    preAuditEntry: audit.entry,
    postAuditEntry: null,
    preAuditPersisted: audit.persisted,
    postAuditPersisted: false,
    reasonCode: policy.reasonCode,
    reason: policy.reason,
    secondApprovalId: policy.secondApprovalId,
    executionResultId: null,
  };
}

// ─── Policy helpers ─────────────────────────────────────────────

function normalizedProposalId(proposalId: string): string | null {
  if (typeof proposalId !== "string") {
    return null;
  }
  const trimmed = proposalId.trim();
  return trimmed.length > 0 ? trimmed : null;
}

async function countRecentAllowedDispatchRequests(
  identity: ChannelIdentity,
  now: Date,
): Promise<number> {
  if (!identity.principalHash) {
    return 0;
  }
  const cutoff = now.getTime() - ONE_HOUR_MS;
  const recent = await getRecentChannelAudit(1000);
  return recent.filter((entry) => {
    const timestamp = Date.parse(entry.timestamp);
    return (
      entry.decision === "allowed" &&
      entry.reasonCode === "allowed" &&
      entry.operation === "dispatch-approved" &&
      entry.channel === identity.channel &&
      entry.principalHash === identity.principalHash &&
      entry.secondApprovalId !== null &&
      entry.executionResultId === null &&
      Number.isFinite(timestamp) &&
      timestamp >= cutoff
    );
  }).length;
}

function isActiveGranted(approval: SecondApproval, nowMs: number): boolean {
  return (
    approval.status === "granted" &&
    Date.parse(approval.expiresAt) > nowMs
  );
}

async function findValidSecondApproval(
  proposal: ActionProposal,
  now: Date,
): Promise<
  | { ok: true; approval: SecondApproval; reasonCode: "allowed"; reason: string }
  | {
      ok: false;
      approval: SecondApproval | null;
      reasonCode: ChannelAuditReasonCode;
      reason: string;
    }
> {
  const store = await readSecondApprovalStore();
  const approvals = store.approvals.filter(
    (approval) => approval.proposalId === proposal.id,
  );
  const nowMs = now.getTime();
  const active = approvals.filter((approval) => isActiveGranted(approval, nowMs));

  if (active.length === 0) {
    const expired = approvals.find((approval) => {
      const expiresAt = Date.parse(approval.expiresAt);
      return (
        approval.status === "granted" &&
        Number.isFinite(expiresAt) &&
        expiresAt <= nowMs
      );
    });

    if (expired) {
      return {
        ok: false,
        approval: expired,
        reasonCode: "second-approval-expired",
        reason: "Active second approval has expired",
      };
    }

    return {
      ok: false,
      approval: null,
      reasonCode: "second-approval-missing",
      reason: "Active second approval is required before channel dispatch",
    };
  }

  const currentHash = hashProposalParameters(proposal);
  const matching = active.find(
    (approval) =>
      approval.proposalParameterHash === currentHash &&
      approval.proposalStatusAtGrant === "approved",
  );

  if (!matching) {
    return {
      ok: false,
      approval: active[0] ?? null,
      reasonCode: "second-approval-parameter-drift",
      reason: "Second approval no longer matches current proposal parameters",
    };
  }

  return {
    ok: true,
    approval: matching,
    reasonCode: "allowed",
    reason: "Active second approval matches proposal parameters",
  };
}

async function evaluateDispatchPolicy(
  input: DispatchApprovedFromChannelInput,
  config: UserConfig,
  now: Date,
): Promise<ChannelDispatchPolicyDecision> {
  if (!input.identity) {
    return buildPolicyDecision(
      "missing-identity",
      "Channel identity is required",
      null,
      null,
    );
  }

  if (!isChannelKind(input.identity.channel)) {
    return buildPolicyDecision(
      "unknown-channel",
      "Channel is not recognized",
      null,
      null,
    );
  }

  if (input.identity.channel === "cli" || input.identity.channel === "system") {
    return buildPolicyDecision(
      "operation-not-allowed",
      "CLI and system identities cannot use the external channel dispatch bridge",
      null,
      null,
    );
  }

  if (input.identity.channel === "api") {
    return buildPolicyDecision(
      "operation-not-allowed",
      "API channel dispatch is not supported in Phase 33H",
      null,
      null,
    );
  }

  if (!input.identity.trusted) {
    return buildPolicyDecision(
      "untrusted-identity",
      "Channel identity is not trusted",
      null,
      null,
    );
  }

  if (
    typeof input.identity.principalHash !== "string" ||
    input.identity.principalHash.trim().length === 0
  ) {
    return buildPolicyDecision(
      "missing-identity",
      "Trusted channel identity must include a principalHash",
      null,
      null,
    );
  }

  if (!isDispatchChannelKind(input.identity.channel)) {
    return buildPolicyDecision(
      "operation-not-allowed",
      "Channel cannot dispatch approved proposals in Phase 33H",
      null,
      null,
    );
  }

  const permission = config.externalChannels[input.identity.channel];
  if (!permission) {
    return buildPolicyDecision(
      "permission-denied",
      "No external channel permission config exists for this channel",
      null,
      null,
    );
  }

  if (permission.canDispatchApproved !== true) {
    return buildPolicyDecision(
      "operation-not-allowed",
      "Channel is not allowed to dispatch approved proposals",
      null,
      permission,
    );
  }

  if (
    !Number.isFinite(permission.maxDispatchesPerHour) ||
    permission.maxDispatchesPerHour <= 0
  ) {
    return buildPolicyDecision(
      "permission-denied",
      "Channel dispatch rate limit is disabled",
      null,
      permission,
    );
  }

  const recentDispatchCount = await countRecentAllowedDispatchRequests(
    input.identity,
    now,
  );
  if (recentDispatchCount >= permission.maxDispatchesPerHour) {
    return buildPolicyDecision(
      "rate-limit-exceeded",
      "Channel dispatch rate limit exceeded",
      null,
      permission,
    );
  }

  const proposalId = normalizedProposalId(input.proposalId);
  if (!proposalId) {
    return buildPolicyDecision(
      "malformed-request",
      "Proposal id is required",
      null,
      permission,
    );
  }

  const proposal = await getProposalById(proposalId);
  if (!proposal) {
    return buildPolicyDecision(
      "proposal-not-found",
      `Proposal "${proposalId}" not found`,
      null,
      permission,
    );
  }

  if (proposal.status !== "approved") {
    return buildPolicyDecision(
      "proposal-not-approved",
      `Cannot dispatch: proposal is "${proposal.status}", expected "approved"`,
      proposal,
      permission,
    );
  }

  if (GLOBAL_FORBIDDEN_CATEGORY_SET.has(proposal.category)) {
    return buildPolicyDecision(
      "forbidden-category",
      `Action category "${proposal.category}" is globally forbidden`,
      proposal,
      permission,
    );
  }

  if (permission.forbiddenCategories.includes(proposal.category)) {
    return buildPolicyDecision(
      "forbidden-category",
      `Action category "${proposal.category}" is forbidden for this channel`,
      proposal,
      permission,
    );
  }

  if (!permission.allowedDispatchCategories.includes(proposal.category)) {
    return buildPolicyDecision(
      "category-not-allowed",
      `Action category "${proposal.category}" is not allowlisted for channel dispatch`,
      proposal,
      permission,
    );
  }

  if (!ACTIONS_REAL_EXECUTION_ENABLED) {
    return buildPolicyDecision(
      "real-execution-disabled",
      "Real action execution is disabled",
      proposal,
      permission,
    );
  }

  if (!isRealExecutionCategoryAllowlisted(proposal.category)) {
    return buildPolicyDecision(
      "real-execution-category-not-allowlisted",
      `Action category "${proposal.category}" is not allowlisted for real execution`,
      proposal,
      permission,
    );
  }

  const secondApproval = await findValidSecondApproval(proposal, now);
  if (!secondApproval.ok) {
    return buildPolicyDecision(
      secondApproval.reasonCode,
      secondApproval.reason,
      proposal,
      permission,
      secondApproval.approval?.id ?? null,
    );
  }

  if (await hasSuccessfulExecution(proposal.id)) {
    return buildPolicyDecision(
      "prior-successful-execution",
      "Dispatch refused: this proposal has already been executed successfully",
      proposal,
      permission,
      secondApproval.approval.id,
    );
  }

  return {
    ok: true,
    proposal,
    permission,
    reasonCode: "allowed",
    reason: "Channel dispatch allowed",
    secondApprovalId: secondApproval.approval.id,
  };
}

function newestExecutionResult(
  results: ExecutionResult[],
): ExecutionResult | null {
  if (results.length === 0) {
    return null;
  }
  return results.reduce((newest, current) => {
    const newestTime = Date.parse(newest.finishedAt);
    const currentTime = Date.parse(current.finishedAt);
    return currentTime >= newestTime ? current : newest;
  });
}

// ─── Public API ─────────────────────────────────────────────────

export async function dispatchApprovedFromChannel(
  input: DispatchApprovedFromChannelInput,
  options: DispatchApprovedFromChannelOptions = {},
): Promise<DispatchApprovedFromChannelResult> {
  const config = options.config ?? await readUserConfig();
  const now = options.now?.() ?? new Date();
  const policy = await evaluateDispatchPolicy(input, config, now);

  if (!policy.ok || !policy.proposal || !policy.permission) {
    return blockedResult(input, policy);
  }

  const allowedAudit = await auditDispatchDecision(
    input,
    "allowed",
    "allowed",
    policy.reason,
    policy.proposal,
    policy.permission,
    policy.secondApprovalId,
    null,
  );

  if (!allowedAudit.persisted) {
    return {
      ok: false,
      dispatch: null,
      proposal: policy.proposal,
      preAuditEntry: allowedAudit.entry,
      postAuditEntry: null,
      preAuditPersisted: false,
      postAuditPersisted: false,
      reasonCode: "audit-store-write-failed",
      reason: "Allowed channel dispatch was blocked because audit persistence failed",
      secondApprovalId: policy.secondApprovalId,
      executionResultId: null,
    };
  }

  const resultsBefore = await getResultsByProposalId(policy.proposal.id);
  const resultIdsBefore = new Set(resultsBefore.map((result) => result.id));
  let dispatch: DispatchResult;

  try {
    dispatch = await dispatchAction(
      policy.proposal.id,
      safeActor(input.identity as ChannelIdentity),
    );
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    const postAudit = await auditDispatchDecision(
      input,
      "blocked",
      "unknown-error",
      `Dispatch threw after channel policy allowed it: ${reason}`,
      policy.proposal,
      policy.permission,
      policy.secondApprovalId,
      null,
    );

    return {
      ok: false,
      dispatch: null,
      proposal: policy.proposal,
      preAuditEntry: allowedAudit.entry,
      postAuditEntry: postAudit.entry,
      preAuditPersisted: true,
      postAuditPersisted: postAudit.persisted,
      reasonCode: "unknown-error",
      reason: "Dispatch threw after channel policy allowed it",
      secondApprovalId: policy.secondApprovalId,
      executionResultId: null,
    };
  }

  const resultsAfter = await getResultsByProposalId(policy.proposal.id);
  const newResults = resultsAfter.filter(
    (result) => !resultIdsBefore.has(result.id),
  );
  const executionResult = newestExecutionResult(newResults);
  const postAudit = await auditDispatchDecision(
    input,
    dispatch.ok ? "allowed" : "blocked",
    dispatch.ok ? "allowed" : "unknown-error",
    dispatch.ok
      ? `Dispatch completed: ${dispatch.message}`
      : `Dispatch failed after channel policy allowed it: ${dispatch.message}`,
    policy.proposal,
    policy.permission,
    policy.secondApprovalId,
    executionResult?.id ?? null,
  );

  return {
    ok: dispatch.ok,
    dispatch,
    proposal: policy.proposal,
    preAuditEntry: allowedAudit.entry,
    postAuditEntry: postAudit.entry,
    preAuditPersisted: true,
    postAuditPersisted: postAudit.persisted,
    reasonCode: dispatch.ok ? "allowed" : "unknown-error",
    reason: dispatch.message,
    secondApprovalId: policy.secondApprovalId,
    executionResultId: executionResult?.id ?? null,
  };
}
