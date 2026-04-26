// src/actions/channelActionBridge.ts
// Guarded proposal creation bridge for external channels.
// Phase 33D: proposal creation only; no dispatch, approvals, or runtime wiring.

import { createProposal, readActionStore } from "./actionStore.js";
import {
  appendChannelAudit,
  getRecentChannelAudit,
  type AppendChannelAuditInput,
} from "./channelAuditStore.js";
import { readUserConfig } from "../config/userConfigStore.js";
import { GLOBAL_FORBIDDEN_ACTION_CATEGORIES } from "./types.js";
import type {
  ActionCategory,
  ActionProposal,
  ActionSource,
  ChannelAuditEntry,
  ChannelAuditReasonCode,
  ChannelIdentity,
  ChannelKind,
  ChannelPermission,
  ChannelPermissionSnapshot,
} from "./types.js";
import type { UserConfig } from "../config/userConfig.js";

// ─── Constants ──────────────────────────────────────────────────

const ONE_HOUR_MS = 60 * 60 * 1000;

const ACTION_CATEGORIES: readonly ActionCategory[] = [
  "file-write",
  "file-delete",
  "git-branch",
  "git-push",
  "pr-create",
  "pr-merge",
  "tool-invoke",
  "deploy",
  "config-change",
  "notification",
  "query",
  "other",
];

const CHANNEL_KINDS: readonly ChannelKind[] = [
  "cli",
  "whatsapp",
  "omi",
  "dashboard",
  "openclaw",
  "system",
  "api",
];

const RAW_IDENTITY_PARAMETER_KEYS = new Set([
  "phone",
  "phonenumber",
  "email",
  "token",
  "accesstoken",
  "refreshtoken",
  "requestbody",
  "rawbody",
]);

const GLOBAL_FORBIDDEN_CATEGORY_SET: ReadonlySet<ActionCategory> =
  new Set<ActionCategory>(GLOBAL_FORBIDDEN_ACTION_CATEGORIES);

// ─── Public bridge types ────────────────────────────────────────

export interface CreateProposalFromChannelInput {
  identity?: ChannelIdentity | null;
  channel?: ChannelKind;
  sourceEventId?: string | null;
  category: string;
  title: string;
  description: string;
  parameters?: Record<string, unknown> | null;
  traceId?: string | null;
  trajectoryId?: string | null;
  expiresInMs?: number;
  correlationId?: string | null;
  runId?: string | null;
}

export interface CreateProposalFromChannelOptions {
  config?: UserConfig;
  now?: () => Date;
}

export interface ChannelPolicyDecision {
  ok: boolean;
  source: ActionSource | null;
  category: ActionCategory | null;
  parameters: Record<string, unknown> | null;
  permission: ChannelPermission | null;
  reasonCode: ChannelAuditReasonCode;
  reason: string;
}

export interface CreateProposalFromChannelResult {
  ok: boolean;
  proposal: ActionProposal | null;
  auditEntry: ChannelAuditEntry | null;
  auditPersisted: boolean;
  reasonCode: ChannelAuditReasonCode;
  reason: string;
}

// ─── Type guards / parsing ──────────────────────────────────────

function isChannelKind(value: unknown): value is ChannelKind {
  return typeof value === "string" && CHANNEL_KINDS.includes(value as ChannelKind);
}

function isKnownCategory(value: unknown): value is ActionCategory {
  return typeof value === "string" && ACTION_CATEGORIES.includes(value as ActionCategory);
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function normalizeKey(key: string): string {
  return key.replace(/[-_\s]/g, "").toLowerCase();
}

function hasRawIdentityParameterKey(
  value: unknown,
  seen = new WeakSet<object>(),
): boolean {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  if (seen.has(value)) {
    return false;
  }
  seen.add(value);

  if (Array.isArray(value)) {
    return value.some((item) => hasRawIdentityParameterKey(item, seen));
  }

  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    if (RAW_IDENTITY_PARAMETER_KEYS.has(normalizeKey(key))) {
      return true;
    }
    if (hasRawIdentityParameterKey(nested, seen)) {
      return true;
    }
  }

  return false;
}

function channelForAudit(input: CreateProposalFromChannelInput): ChannelKind {
  if (input.identity && isChannelKind(input.identity.channel)) {
    return input.identity.channel;
  }
  if (isChannelKind(input.channel)) {
    return input.channel;
  }
  return "system";
}

function sourceEventIdForAudit(input: CreateProposalFromChannelInput): string | null {
  return input.identity?.sourceEventId ?? input.sourceEventId ?? null;
}

function auditIdentityForInput(
  input: CreateProposalFromChannelInput,
): Pick<
  ChannelIdentity,
  | "channel"
  | "principalHash"
  | "trusted"
  | "trustReason"
  | "authMethod"
  | "sourceEventId"
> {
  if (input.identity) {
    return {
      channel: channelForAudit(input),
      principalHash: input.identity.principalHash,
      trusted: input.identity.trusted,
      trustReason: input.identity.trustReason,
      authMethod: input.identity.authMethod,
      sourceEventId: input.identity.sourceEventId,
    };
  }

  return {
    channel: channelForAudit(input),
    principalHash: null,
    trusted: false,
    trustReason: "missing identity",
    authMethod: "none",
    sourceEventId: sourceEventIdForAudit(input),
  };
}

function sourceForChannel(channel: ChannelKind): ActionSource | null {
  switch (channel) {
    case "whatsapp":
    case "omi":
    case "dashboard":
    case "openclaw":
      return channel;
    case "cli":
    case "system":
    case "api":
      return null;
  }
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

function buildDecision(
  reasonCode: ChannelAuditReasonCode,
  reason: string,
  category: ActionCategory | null,
  permission: ChannelPermission | null,
): ChannelPolicyDecision {
  return {
    ok: false,
    source: null,
    category,
    parameters: null,
    permission,
    reasonCode,
    reason,
  };
}

async function hasDuplicateSourceEvent(
  source: ActionSource,
  sourceEventId: string | null,
): Promise<boolean> {
  if (!sourceEventId) {
    return false;
  }
  const store = await readActionStore();
  return store.proposals.some(
    (proposal) =>
      proposal.source === source &&
      proposal.sourceEventId === sourceEventId,
  );
}

async function countRecentAllowedProposalRequests(
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
      entry.operation === "create-proposal" &&
      entry.channel === identity.channel &&
      entry.principalHash === identity.principalHash &&
      Number.isFinite(timestamp) &&
      timestamp >= cutoff
    );
  }).length;
}

// ─── Audit helper ───────────────────────────────────────────────

async function auditDecision(
  input: CreateProposalFromChannelInput,
  decision: "allowed" | "blocked",
  reasonCode: ChannelAuditReasonCode,
  reason: string,
  category: ActionCategory | null,
  permission: ChannelPermission | null,
): Promise<{ entry: ChannelAuditEntry; persisted: boolean }> {
  const auditInput: AppendChannelAuditInput = {
    identity: auditIdentityForInput(input),
    operation: "create-proposal",
    decision,
    reasonCode,
    reason,
    category,
    correlationId: input.correlationId ?? null,
    runId: input.runId ?? null,
  };

  if (permission) {
    auditInput.permissionSnapshot = clonePermissionSnapshot(permission);
  }

  return appendChannelAudit(auditInput);
}

async function blockedResult(
  input: CreateProposalFromChannelInput,
  reasonCode: ChannelAuditReasonCode,
  reason: string,
  category: ActionCategory | null,
  permission: ChannelPermission | null,
): Promise<CreateProposalFromChannelResult> {
  const audit = await auditDecision(
    input,
    "blocked",
    reasonCode,
    reason,
    category,
    permission,
  );

  return {
    ok: false,
    proposal: null,
    auditEntry: audit.entry,
    auditPersisted: audit.persisted,
    reasonCode,
    reason,
  };
}

// ─── Policy evaluation ──────────────────────────────────────────

async function evaluateCreateProposalPolicy(
  input: CreateProposalFromChannelInput,
  config: UserConfig,
  now: Date,
): Promise<ChannelPolicyDecision> {
  const category = isKnownCategory(input.category) ? input.category : null;

  if (!input.identity) {
    return buildDecision(
      "missing-identity",
      "Channel identity is required",
      category,
      null,
    );
  }

  if (!isChannelKind(input.identity.channel)) {
    return buildDecision(
      "unknown-channel",
      "Channel is not recognized",
      category,
      null,
    );
  }

  if (input.identity.channel === "cli" || input.identity.channel === "system") {
    return buildDecision(
      "operation-not-allowed",
      "CLI and system identities cannot use the external channel proposal bridge",
      category,
      null,
    );
  }

  if (input.identity.channel === "api") {
    return buildDecision(
      "operation-not-allowed",
      "API channel proposal creation is not supported in Phase 33D",
      category,
      null,
    );
  }

  if (!input.identity.trusted) {
    return buildDecision(
      "untrusted-identity",
      "Channel identity is not trusted",
      category,
      null,
    );
  }

  if (
    typeof input.identity.principalHash !== "string" ||
    input.identity.principalHash.trim().length === 0
  ) {
    return buildDecision(
      "missing-identity",
      "Trusted channel identity must include a principalHash",
      category,
      null,
    );
  }

  const source = sourceForChannel(input.identity.channel);
  if (!source) {
    return buildDecision(
      "operation-not-allowed",
      "Channel cannot be used as an ActionSource in Phase 33D",
      category,
      null,
    );
  }

  const permission = config.externalChannels[input.identity.channel];
  if (!permission) {
    return buildDecision(
      "permission-denied",
      "No external channel permission config exists for this channel",
      category,
      null,
    );
  }

  if (permission.canCreateProposal !== true) {
    return buildDecision(
      "operation-not-allowed",
      "Channel is not allowed to create proposals",
      category,
      permission,
    );
  }

  if (
    !Number.isFinite(permission.maxProposalsPerHour) ||
    permission.maxProposalsPerHour <= 0
  ) {
    return buildDecision(
      "permission-denied",
      "Channel proposal rate limit is disabled",
      category,
      permission,
    );
  }

  if (!category) {
    return buildDecision(
      "malformed-request",
      "Action category is not recognized",
      null,
      permission,
    );
  }

  if (GLOBAL_FORBIDDEN_CATEGORY_SET.has(category)) {
    return buildDecision(
      "forbidden-category",
      `Action category "${category}" is globally forbidden for channel proposals`,
      category,
      permission,
    );
  }

  if (permission.forbiddenCategories.includes(category)) {
    return buildDecision(
      "forbidden-category",
      `Action category "${category}" is forbidden for this channel`,
      category,
      permission,
    );
  }

  if (!permission.allowedProposalCategories.includes(category)) {
    return buildDecision(
      "category-not-allowed",
      `Action category "${category}" is not allowlisted for proposal creation`,
      category,
      permission,
    );
  }

  if (typeof input.title !== "string" || input.title.trim().length === 0) {
    return buildDecision(
      "malformed-request",
      "Proposal title must be a non-empty string",
      category,
      permission,
    );
  }

  if (
    typeof input.description !== "string" ||
    input.description.trim().length === 0
  ) {
    return buildDecision(
      "malformed-request",
      "Proposal description must be a non-empty string",
      category,
      permission,
    );
  }

  const parameters = input.parameters === undefined ? {} : input.parameters;
  if (!isPlainRecord(parameters)) {
    return buildDecision(
      "malformed-request",
      "Proposal parameters must be a plain object",
      category,
      permission,
    );
  }

  if (hasRawIdentityParameterKey(parameters)) {
    return buildDecision(
      "malformed-request",
      "Proposal parameters contain disallowed raw identity material",
      category,
      permission,
    );
  }

  if (
    input.expiresInMs !== undefined &&
    (!Number.isFinite(input.expiresInMs) || input.expiresInMs <= 0)
  ) {
    return buildDecision(
      "malformed-request",
      "expiresInMs must be a positive finite number when provided",
      category,
      permission,
    );
  }

  if (await hasDuplicateSourceEvent(source, input.identity.sourceEventId)) {
    return buildDecision(
      "duplicate-source-event",
      "A proposal already exists for this channel source event",
      category,
      permission,
    );
  }

  const recentCount = await countRecentAllowedProposalRequests(
    input.identity,
    now,
  );
  if (recentCount >= permission.maxProposalsPerHour) {
    return buildDecision(
      "rate-limit-exceeded",
      "Channel proposal rate limit exceeded",
      category,
      permission,
    );
  }

  return {
    ok: true,
    source,
    category,
    parameters,
    permission,
    reasonCode: "allowed",
    reason: "Channel proposal creation allowed",
  };
}

// ─── Public API ─────────────────────────────────────────────────

export async function createProposalFromChannel(
  input: CreateProposalFromChannelInput,
  options: CreateProposalFromChannelOptions = {},
): Promise<CreateProposalFromChannelResult> {
  const config = options.config ?? await readUserConfig();
  const now = options.now?.() ?? new Date();
  const policy = await evaluateCreateProposalPolicy(input, config, now);

  if (!policy.ok || !policy.source || !policy.category || !policy.parameters) {
    return blockedResult(
      input,
      policy.reasonCode,
      policy.reason,
      policy.category,
      policy.permission,
    );
  }

  const allowedAudit = await auditDecision(
    input,
    "allowed",
    "allowed",
    policy.reason,
    policy.category,
    policy.permission,
  );

  if (!allowedAudit.persisted) {
    return {
      ok: false,
      proposal: null,
      auditEntry: allowedAudit.entry,
      auditPersisted: false,
      reasonCode: "audit-store-write-failed",
      reason: "Allowed channel proposal was blocked because audit persistence failed",
    };
  }

  try {
    const proposalInput = {
      source: policy.source,
      sourceEventId: input.identity?.sourceEventId ?? null,
      category: policy.category,
      title: input.title.trim(),
      description: input.description.trim(),
      parameters: policy.parameters,
      traceId: input.traceId ?? null,
      trajectoryId: input.trajectoryId ?? null,
    };

    const proposal = await createProposal(
      input.expiresInMs === undefined
        ? proposalInput
        : { ...proposalInput, expiresInMs: input.expiresInMs },
    );

    return {
      ok: true,
      proposal,
      auditEntry: allowedAudit.entry,
      auditPersisted: true,
      reasonCode: "allowed",
      reason: "Channel proposal created",
    };
  } catch {
    return {
      ok: false,
      proposal: null,
      auditEntry: allowedAudit.entry,
      auditPersisted: true,
      reasonCode: "unknown-error",
      reason: "Proposal creation failed after channel policy allowed it",
    };
  }
}
