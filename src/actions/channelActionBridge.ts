// src/actions/channelActionBridge.ts
// Guarded action bridge for external channels.
// Proposal creation, proposal listing, and review requests only. No dispatch.

import {
  createProposal,
  getProposalById,
  readActionStore,
} from "./actionStore.js";
import { submitForReview } from "./approvalBridge.js";
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
  ChannelOperation,
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

interface ChannelBridgeAuditInput {
  identity?: ChannelIdentity | null;
  channel?: ChannelKind;
  sourceEventId?: string | null;
  correlationId?: string | null;
  runId?: string | null;
}

export interface CreateProposalFromChannelOptions {
  config?: UserConfig;
  now?: () => Date;
}

export type ChannelProposalListMode = "pending" | "recent";

export interface ListProposalsFromChannelInput extends ChannelBridgeAuditInput {
  listMode?: ChannelProposalListMode;
  limit?: number;
}

export interface RequestReviewFromChannelInput extends ChannelBridgeAuditInput {
  proposalId: string;
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

interface ChannelOperationPolicyDecision {
  ok: boolean;
  source: ActionSource | null;
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

export interface ListProposalsFromChannelResult {
  ok: boolean;
  proposals: ActionProposal[];
  auditEntry: ChannelAuditEntry | null;
  auditPersisted: boolean;
  reasonCode: ChannelAuditReasonCode;
  reason: string;
}

export interface RequestReviewFromChannelResult {
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

function channelForAudit(input: ChannelBridgeAuditInput): ChannelKind {
  if (input.identity && isChannelKind(input.identity.channel)) {
    return input.identity.channel;
  }
  if (isChannelKind(input.channel)) {
    return input.channel;
  }
  return "system";
}

function sourceEventIdForAudit(input: ChannelBridgeAuditInput): string | null {
  return input.identity?.sourceEventId ?? input.sourceEventId ?? null;
}

function auditIdentityForInput(
  input: ChannelBridgeAuditInput,
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

function buildOperationDecision(
  reasonCode: ChannelAuditReasonCode,
  reason: string,
  permission: ChannelPermission | null,
): ChannelOperationPolicyDecision {
  return {
    ok: false,
    source: null,
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
  input: ChannelBridgeAuditInput,
  operation: ChannelOperation,
  decision: "allowed" | "blocked",
  reasonCode: ChannelAuditReasonCode,
  reason: string,
  category: ActionCategory | null,
  permission: ChannelPermission | null,
  proposalId: string | null = null,
): Promise<{ entry: ChannelAuditEntry; persisted: boolean }> {
  const auditInput: AppendChannelAuditInput = {
    identity: auditIdentityForInput(input),
    operation,
    decision,
    reasonCode,
    reason,
    category,
    proposalId,
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
    "create-proposal",
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

async function blockedListResult(
  input: ListProposalsFromChannelInput,
  reasonCode: ChannelAuditReasonCode,
  reason: string,
  permission: ChannelPermission | null,
): Promise<ListProposalsFromChannelResult> {
  const audit = await auditDecision(
    input,
    "list-pending",
    "blocked",
    reasonCode,
    reason,
    null,
    permission,
  );

  return {
    ok: false,
    proposals: [],
    auditEntry: audit.entry,
    auditPersisted: audit.persisted,
    reasonCode,
    reason,
  };
}

async function blockedReviewResult(
  input: RequestReviewFromChannelInput,
  reasonCode: ChannelAuditReasonCode,
  reason: string,
  category: ActionCategory | null,
  permission: ChannelPermission | null,
): Promise<RequestReviewFromChannelResult> {
  const proposalId =
    typeof input.proposalId === "string" && input.proposalId.trim().length > 0
      ? input.proposalId.trim()
      : null;
  const audit = await auditDecision(
    input,
    "request-review",
    "blocked",
    reasonCode,
    reason,
    category,
    permission,
    proposalId,
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

function evaluateChannelOperationPolicy(
  input: ChannelBridgeAuditInput,
  config: UserConfig,
  permissionFlag: "canListPending" | "canRequestReview",
  operationLabel: string,
): ChannelOperationPolicyDecision {
  if (!input.identity) {
    return buildOperationDecision(
      "missing-identity",
      "Channel identity is required",
      null,
    );
  }

  if (!isChannelKind(input.identity.channel)) {
    return buildOperationDecision(
      "unknown-channel",
      "Channel is not recognized",
      null,
    );
  }

  if (input.identity.channel === "cli" || input.identity.channel === "system") {
    return buildOperationDecision(
      "operation-not-allowed",
      `CLI and system identities cannot ${operationLabel}`,
      null,
    );
  }

  if (input.identity.channel === "api") {
    return buildOperationDecision(
      "operation-not-allowed",
      `API channel ${operationLabel} is not supported in Phase 33F`,
      null,
    );
  }

  if (!input.identity.trusted) {
    return buildOperationDecision(
      "untrusted-identity",
      "Channel identity is not trusted",
      null,
    );
  }

  if (
    typeof input.identity.principalHash !== "string" ||
    input.identity.principalHash.trim().length === 0
  ) {
    return buildOperationDecision(
      "missing-identity",
      "Trusted channel identity must include a principalHash",
      null,
    );
  }

  const source = sourceForChannel(input.identity.channel);
  if (!source) {
    return buildOperationDecision(
      "operation-not-allowed",
      `Channel cannot ${operationLabel} in Phase 33F`,
      null,
    );
  }

  const permission = config.externalChannels[input.identity.channel];
  if (!permission) {
    return buildOperationDecision(
      "permission-denied",
      "No external channel permission config exists for this channel",
      null,
    );
  }

  if (permission[permissionFlag] !== true) {
    return buildOperationDecision(
      "operation-not-allowed",
      `Channel is not allowed to ${operationLabel}`,
      permission,
    );
  }

  return {
    ok: true,
    source,
    permission,
    reasonCode: "allowed",
    reason: `Channel ${operationLabel} allowed`,
  };
}

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
    "create-proposal",
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

function normalizedLimit(limit: number | undefined): number {
  if (typeof limit !== "number" || !Number.isFinite(limit)) {
    return 10;
  }
  return Math.max(1, Math.min(20, Math.floor(limit)));
}

function createdAtMs(proposal: ActionProposal): number {
  const timestamp = Date.parse(proposal.createdAt);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function newestFirst(a: ActionProposal, b: ActionProposal): number {
  return createdAtMs(b) - createdAtMs(a);
}

export async function listProposalsFromChannel(
  input: ListProposalsFromChannelInput,
  options: CreateProposalFromChannelOptions = {},
): Promise<ListProposalsFromChannelResult> {
  const config = options.config ?? await readUserConfig();
  const policy = evaluateChannelOperationPolicy(
    input,
    config,
    "canListPending",
    "list proposals",
  );

  if (!policy.ok || !policy.source) {
    return blockedListResult(
      input,
      policy.reasonCode,
      policy.reason,
      policy.permission,
    );
  }

  const allowedAudit = await auditDecision(
    input,
    "list-pending",
    "allowed",
    "allowed",
    policy.reason,
    null,
    policy.permission,
  );

  if (!allowedAudit.persisted) {
    return {
      ok: false,
      proposals: [],
      auditEntry: allowedAudit.entry,
      auditPersisted: false,
      reasonCode: "audit-store-write-failed",
      reason: "Channel proposal list was blocked because audit persistence failed",
    };
  }

  const limit = normalizedLimit(input.limit);
  const store = await readActionStore();
  const sourceProposals = store.proposals
    .filter((proposal) => proposal.source === policy.source)
    .sort(newestFirst);

  const proposals =
    input.listMode === "recent"
      ? sourceProposals.slice(0, limit)
      : sourceProposals
          .filter(
            (proposal) =>
              proposal.status === "classified" ||
              proposal.status === "pending-approval",
          )
          .slice(0, limit);

  return {
    ok: true,
    proposals,
    auditEntry: allowedAudit.entry,
    auditPersisted: true,
    reasonCode: "allowed",
    reason: "Channel proposals listed",
  };
}

export async function requestReviewFromChannel(
  input: RequestReviewFromChannelInput,
  options: CreateProposalFromChannelOptions = {},
): Promise<RequestReviewFromChannelResult> {
  const config = options.config ?? await readUserConfig();
  const policy = evaluateChannelOperationPolicy(
    input,
    config,
    "canRequestReview",
    "request proposal review",
  );

  if (!policy.ok || !policy.source) {
    return blockedReviewResult(
      input,
      policy.reasonCode,
      policy.reason,
      null,
      policy.permission,
    );
  }

  if (typeof input.proposalId !== "string" || input.proposalId.trim().length === 0) {
    return blockedReviewResult(
      input,
      "malformed-request",
      "Proposal id is required",
      null,
      policy.permission,
    );
  }

  const proposalId = input.proposalId.trim();
  const proposal = await getProposalById(proposalId);
  if (!proposal) {
    return blockedReviewResult(
      input,
      "proposal-not-found",
      `Proposal "${proposalId}" not found`,
      null,
      policy.permission,
    );
  }

  if (proposal.source !== policy.source) {
    return blockedReviewResult(
      input,
      "permission-denied",
      "Proposal source does not match the requesting channel",
      proposal.category,
      policy.permission,
    );
  }

  if (GLOBAL_FORBIDDEN_CATEGORY_SET.has(proposal.category)) {
    return blockedReviewResult(
      input,
      "forbidden-category",
      `Action category "${proposal.category}" is globally forbidden`,
      proposal.category,
      policy.permission,
    );
  }

  if (policy.permission?.forbiddenCategories.includes(proposal.category)) {
    return blockedReviewResult(
      input,
      "forbidden-category",
      `Action category "${proposal.category}" is forbidden for this channel`,
      proposal.category,
      policy.permission,
    );
  }

  if (!policy.permission?.allowedProposalCategories.includes(proposal.category)) {
    return blockedReviewResult(
      input,
      "category-not-allowed",
      `Action category "${proposal.category}" is not allowlisted for this channel`,
      proposal.category,
      policy.permission,
    );
  }

  if (proposal.status !== "classified") {
    return blockedReviewResult(
      input,
      "operation-not-allowed",
      `Cannot request review: proposal is "${proposal.status}", expected "classified"`,
      proposal.category,
      policy.permission,
    );
  }

  const allowedAudit = await auditDecision(
    input,
    "request-review",
    "allowed",
    "allowed",
    policy.reason,
    proposal.category,
    policy.permission,
    proposal.id,
  );

  if (!allowedAudit.persisted) {
    return {
      ok: false,
      proposal: null,
      auditEntry: allowedAudit.entry,
      auditPersisted: false,
      reasonCode: "audit-store-write-failed",
      reason: "Channel review request was blocked because audit persistence failed",
    };
  }

  const transition = await submitForReview(proposal.id);
  return {
    ok: transition.ok,
    proposal: transition.proposal,
    auditEntry: allowedAudit.entry,
    auditPersisted: true,
    reasonCode: transition.ok ? "allowed" : "unknown-error",
    reason: transition.reason,
  };
}
