import { GLOBAL_FORBIDDEN_ACTION_CATEGORIES } from "../actions/types.js";
import type { ActionCategory } from "../actions/types.js";
import {
  getToolRegistryEntry,
  listToolRegistry,
} from "../tools/registry.js";
import type { ToolCapability, ToolRegistryEntry } from "../tools/types.js";
import { appendPermissionAudit } from "./permissionAuditStore.js";
import { readPermissionStore } from "./permissionStore.js";
import type {
  PermissionAuditEntry,
  PermissionCheckInput,
  PermissionCheckResult,
  PermissionCondition,
  PermissionGrant,
  PermissionReasonCode,
  PermissionStoreData,
} from "./types.js";

const GLOBAL_FORBIDDEN_CATEGORY_SET: ReadonlySet<ActionCategory> =
  new Set<ActionCategory>(GLOBAL_FORBIDDEN_ACTION_CATEGORIES);

export interface CheckPermissionOptions {
  store?: PermissionStoreData;
  now?: Date;
  appendAudit?: boolean;
}

function knownCapability(value: ToolCapability): boolean {
  return listToolRegistry().some((entry) => entry.capability === value);
}

function entryForRequest(input: PermissionCheckInput): ToolRegistryEntry | null {
  if (input.toolId) {
    return getToolRegistryEntry(input.toolId);
  }
  if (input.capability && knownCapability(input.capability)) {
    return listToolRegistry().find((entry) => entry.capability === input.capability) ?? null;
  }
  return null;
}

function safeMessage(reasonCode: PermissionReasonCode): string {
  switch (reasonCode) {
    case "allowed":
      return "Permission granted for this capability.";
    case "missing-subject":
      return "Permission denied: missing subject identity.";
    case "missing-project":
      return "Permission denied: missing project scope.";
    case "unknown-tool":
      return "Permission denied: unknown tool.";
    case "unknown-capability":
      return "Permission denied: unknown capability.";
    case "tool-forbidden":
      return "Permission denied: tool is forbidden by policy.";
    case "channel-not-allowed":
      return "Permission denied: channel is not allowed for this tool.";
    case "permission-denied":
      return "Permission denied: no matching active grant.";
    case "forbidden-category":
      return "Permission denied: category is globally forbidden.";
    case "grant-expired":
      return "Permission denied: matching grant is expired.";
    case "grant-revoked":
      return "Permission denied: matching grant is revoked.";
    case "grant-consumed":
      return "Permission denied: matching grant is consumed.";
    case "grant-max-uses-exceeded":
      return "Permission denied: matching grant exceeded max uses.";
    case "scope-mismatch":
      return "Permission denied: grant scope does not match request.";
    case "condition-unsupported":
      return "Permission denied: grant condition is unsupported.";
    case "condition-failed":
      return "Permission denied: grant condition failed.";
    case "store-read-failed":
      return "Permission denied: permission store could not be read.";
  }
}

function buildAudit(input: {
  request: PermissionCheckInput;
  reasonCode: PermissionReasonCode;
  matchedGrant: PermissionGrant | null;
}): PermissionAuditEntry {
  const decision = input.reasonCode === "allowed" ? "allowed" : "blocked";
  return {
    id: "pending",
    timestamp: new Date().toISOString(),
    decision,
    reasonCode: input.reasonCode,
    safeMessage: safeMessage(input.reasonCode),
    subjectKind: input.request.subjectKind ?? null,
    subjectHash: input.request.subjectHash ?? null,
    projectId: input.request.projectId ?? null,
    toolId: input.request.toolId ?? null,
    capability: input.request.capability ?? input.matchedGrant?.capability ?? null,
    category: input.request.category ?? null,
    channel: input.request.channel ?? null,
    operation: input.request.operation ?? null,
    matchedGrantId: input.matchedGrant?.grantId ?? null,
    grantStatus: input.matchedGrant?.status ?? null,
    correlationId: input.request.correlationId ?? null,
    jobId: input.request.jobId ?? null,
    proposalId: input.request.proposalId ?? null,
  };
}

async function finalizeResult(input: {
  request: PermissionCheckInput;
  reasonCode: PermissionReasonCode;
  matchedGrant: PermissionGrant | null;
  appendAudit: boolean;
}): Promise<PermissionCheckResult> {
  const audit = buildAudit({
    request: input.request,
    reasonCode: input.reasonCode,
    matchedGrant: input.matchedGrant,
  });

  if (input.appendAudit) {
    const persistedAudit = await appendPermissionAudit({
      decision: audit.decision,
      reasonCode: audit.reasonCode,
      safeMessage: audit.safeMessage,
      subjectKind: audit.subjectKind,
      subjectHash: audit.subjectHash,
      projectId: audit.projectId,
      toolId: audit.toolId,
      capability: audit.capability,
      category: audit.category,
      channel: audit.channel,
      operation: audit.operation,
      matchedGrantId: audit.matchedGrantId,
      grantStatus: audit.grantStatus,
      correlationId: audit.correlationId,
      jobId: audit.jobId,
      proposalId: audit.proposalId,
    });
    audit.id = persistedAudit.entry.id;
    audit.timestamp = persistedAudit.entry.timestamp;
  }

  return {
    allowed: input.reasonCode === "allowed",
    decision: input.reasonCode === "allowed" ? "allowed" : "blocked",
    reasonCode: input.reasonCode,
    safeMessage: audit.safeMessage,
    matchedGrantId: input.matchedGrant?.grantId ?? null,
    expiresAt: input.matchedGrant?.expiresAt ?? null,
    audit,
  };
}

function requestMatchesGrant(
  grant: PermissionGrant,
  request: PermissionCheckInput,
): boolean {
  if (grant.subjectKind !== request.subjectKind) {
    return false;
  }
  if (!request.subjectHash || grant.subjectHash !== request.subjectHash) {
    return false;
  }
  if (!request.projectId || grant.projectId !== request.projectId) {
    return false;
  }
  if (request.toolId && grant.toolId && grant.toolId !== request.toolId) {
    return false;
  }
  if (request.toolId && !grant.toolId && !grant.capability) {
    return false;
  }
  if (request.capability && grant.capability && grant.capability !== request.capability) {
    return false;
  }
  if (request.capability && !grant.capability && !grant.toolId) {
    return false;
  }
  return true;
}

function grantCoversRequest(
  grant: PermissionGrant,
  entry: ToolRegistryEntry,
  request: PermissionCheckInput,
): boolean {
  const toolMatches = grant.toolId !== null && grant.toolId === entry.toolId;
  const capabilityMatches =
    grant.capability !== null &&
    (grant.capability === entry.capability || grant.capability === request.capability);
  return toolMatches || capabilityMatches;
}

function validateGrantStatus(
  grant: PermissionGrant,
  now: Date,
): PermissionReasonCode | null {
  if (grant.status === "revoked") return "grant-revoked";
  if (grant.status === "consumed") return "grant-consumed";
  if (grant.status === "expired") return "grant-expired";
  if (grant.expiresAt) {
    const expiresAt = Date.parse(grant.expiresAt);
    if (Number.isFinite(expiresAt) && expiresAt <= now.getTime()) {
      return "grant-expired";
    }
  }
  if (grant.maxUses !== null && grant.usedCount >= grant.maxUses) {
    return "grant-max-uses-exceeded";
  }
  return null;
}

function validateCondition(
  condition: PermissionCondition,
  request: PermissionCheckInput,
): PermissionReasonCode | null {
  switch (condition.kind) {
    case "allowed-channels":
      return request.channel && condition.channels.includes(request.channel)
        ? null
        : "condition-failed";
    case "allowed-categories":
      return request.category && condition.categories.includes(request.category)
        ? null
        : "condition-failed";
    case "dry-run-only":
      return condition.value === true && request.dryRun !== true
        ? "condition-failed"
        : null;
    case "no-network":
      return condition.value === true && request.networkAccess === true
        ? "condition-failed"
        : null;
    case "allowed-project":
      return request.projectId === condition.projectId ? null : "condition-failed";
    default:
      return "condition-unsupported";
  }
}

function validateGrantConditions(
  grant: PermissionGrant,
  request: PermissionCheckInput,
): PermissionReasonCode | null {
  const requestedScopes = new Set(request.scopes ?? []);
  if (grant.scopes.length > 0) {
    const allScopesMatch = grant.scopes.every((scope) => requestedScopes.has(scope));
    if (!allScopesMatch) {
      return "scope-mismatch";
    }
  }

  for (const condition of grant.conditions) {
    const result = validateCondition(condition, request);
    if (result) {
      return result;
    }
  }

  return null;
}

function bestBlockingReason(
  grants: PermissionGrant[],
  request: PermissionCheckInput,
  entry: ToolRegistryEntry,
  now: Date,
): { reasonCode: PermissionReasonCode; grant: PermissionGrant | null } {
  for (const grant of grants) {
    if (!requestMatchesGrant(grant, request)) {
      continue;
    }
    if (!grantCoversRequest(grant, entry, request)) {
      continue;
    }

    const statusReason = validateGrantStatus(grant, now);
    if (statusReason) {
      return { reasonCode: statusReason, grant };
    }

    const conditionReason = validateGrantConditions(grant, request);
    if (conditionReason) {
      return { reasonCode: conditionReason, grant };
    }
  }

  return { reasonCode: "permission-denied", grant: null };
}

export async function checkPermission(
  input: PermissionCheckInput,
  options: CheckPermissionOptions = {},
): Promise<PermissionCheckResult> {
  const now = options.now ?? new Date();
  const appendAudit = options.appendAudit ?? false;

  if (!input.subjectHash || input.subjectHash.trim().length === 0) {
    return finalizeResult({
      request: input,
      reasonCode: "missing-subject",
      matchedGrant: null,
      appendAudit,
    });
  }

  if (!input.projectId || input.projectId.trim().length === 0) {
    return finalizeResult({
      request: input,
      reasonCode: "missing-project",
      matchedGrant: null,
      appendAudit,
    });
  }

  if (input.category && GLOBAL_FORBIDDEN_CATEGORY_SET.has(input.category)) {
    return finalizeResult({
      request: input,
      reasonCode: "forbidden-category",
      matchedGrant: null,
      appendAudit,
    });
  }

  if (input.toolId) {
    const byTool = getToolRegistryEntry(input.toolId);
    if (!byTool) {
      return finalizeResult({
        request: input,
        reasonCode: "unknown-tool",
        matchedGrant: null,
        appendAudit,
      });
    }
  }

  if (input.capability && !knownCapability(input.capability)) {
    return finalizeResult({
      request: input,
      reasonCode: "unknown-capability",
      matchedGrant: null,
      appendAudit,
    });
  }

  const entry = entryForRequest(input);
  if (!entry) {
    return finalizeResult({
      request: input,
      reasonCode: input.toolId ? "unknown-tool" : "unknown-capability",
      matchedGrant: null,
      appendAudit,
    });
  }

  if (entry.riskLevel === "forbidden") {
    return finalizeResult({
      request: input,
      reasonCode: "tool-forbidden",
      matchedGrant: null,
      appendAudit,
    });
  }

  if (input.channel && !entry.allowedChannels.includes(input.channel)) {
    return finalizeResult({
      request: input,
      reasonCode: "channel-not-allowed",
      matchedGrant: null,
      appendAudit,
    });
  }

  const store = options.store ?? (await readPermissionStore());
  const grants = store.grants.filter((grant) => requestMatchesGrant(grant, input));
  const matching = grants.find((grant) => {
    if (!grantCoversRequest(grant, entry, input)) {
      return false;
    }
    return (
      validateGrantStatus(grant, now) === null &&
      validateGrantConditions(grant, input) === null
    );
  });

  if (entry.forbiddenByDefault && !matching) {
    const reason = bestBlockingReason(grants, input, entry, now);
    return finalizeResult({
      request: input,
      reasonCode: reason.reasonCode,
      matchedGrant: reason.grant,
      appendAudit,
    });
  }

  if (!entry.forbiddenByDefault && !matching && entry.requiredPermissions.length > 0) {
    const reason = bestBlockingReason(grants, input, entry, now);
    return finalizeResult({
      request: input,
      reasonCode: reason.reasonCode,
      matchedGrant: reason.grant,
      appendAudit,
    });
  }

  if (!matching && entry.requiredPermissions.length === 0 && !entry.forbiddenByDefault) {
    return finalizeResult({
      request: input,
      reasonCode: "allowed",
      matchedGrant: null,
      appendAudit,
    });
  }

  if (!matching) {
    return finalizeResult({
      request: input,
      reasonCode: "permission-denied",
      matchedGrant: null,
      appendAudit,
    });
  }

  return finalizeResult({
    request: input,
    reasonCode: "allowed",
    matchedGrant: matching,
    appendAudit,
  });
}
