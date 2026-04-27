import { createSafeError } from "../errors/errorTaxonomy.js";
import { getOpenClawCapability } from "../openclaw/capabilityRegistry.js";
import type { OpenClawCapabilityEntry } from "../openclaw/capabilityTypes.js";
import { checkPermission } from "../permissions/permissionChecker.js";
import type { CheckPermissionOptions } from "../permissions/permissionChecker.js";
import {
  redactStructuredValue,
  type RedactionMetadata,
} from "../privacy/redactionEngine.js";
import { deriveProjectIdentity } from "../supervisor/projectIdentity.js";
import type {
  ComputerDryRunInput,
  ComputerDryRunResult,
} from "./types.js";

export interface PlanComputerActionDryRunOptions {
  permission?: CheckPermissionOptions;
}

const FORBIDDEN_TEXT_PATTERNS: Array<{ code: string; pattern: RegExp }> = [
  { code: "credential-entry", pattern: /\b(password|credential|secret|api key|token)\b/i },
  { code: "payment-flow", pattern: /\b(payment|purchase|checkout|buy now|transfer money)\b/i },
  { code: "account-destruction", pattern: /\b(delete account|close account|remove account)\b/i },
  { code: "security-bypass", pattern: /\b(captcha|2fa|mfa|bypass|disable security)\b/i },
  { code: "repo-forbidden", pattern: /\b(git push|deploy|merge pr|pr merge|delete file|file delete)\b/i },
  { code: "shell-command", pattern: /\b(rm -rf|sudo|powershell|cmd\.exe|bash -c)\b/i },
];

function emptyRedaction(): RedactionMetadata {
  return redactStructuredValue({}, { maxLength: 1 }).metadata;
}

function blocked(input: {
  capabilityId: string;
  safeSummary: string;
  blockedReasons: string[];
  riskLevel?: ComputerDryRunResult["riskLevel"];
  permission?: ComputerDryRunResult["permission"];
  redaction?: RedactionMetadata;
  screenshotTraceId?: string | null;
  correlationId?: string | null | undefined;
}): ComputerDryRunResult {
  return {
    ok: false,
    dryRun: true,
    capabilityId: input.capabilityId,
    plannedSteps: [],
    riskLevel: input.riskLevel ?? "unknown",
    requiredApprovals: [
      "future real computer action requires proposal approval",
      "future real computer action requires second approval",
    ],
    blockedReasons: input.blockedReasons,
    safeSummary: input.safeSummary,
    permission: input.permission ?? null,
    redaction: input.redaction ?? emptyRedaction(),
    screenshotTraceId: input.screenshotTraceId ?? null,
    error: createSafeError("computer.dry_run_only", {
      safeMessage: input.safeSummary,
      correlationId: input.correlationId ?? null,
      auditHint: input.blockedReasons.join(", "),
    }),
  };
}

function requiredApprovals(entry: OpenClawCapabilityEntry): string[] {
  return [
    "dry-run permission grant",
    entry.requiresScreenshot ? "redacted screenshot metadata for future real action" : "no screenshot required for dry-run",
    "future real action requires approved proposal",
    "future real action requires active second approval",
  ];
}

function findForbiddenReasons(value: string): string[] {
  const reasons: string[] = [];
  for (const item of FORBIDDEN_TEXT_PATTERNS) {
    if (item.pattern.test(value)) {
      reasons.push(item.code);
    }
  }
  return reasons;
}

function plannedStepsFor(input: {
  entry: OpenClawCapabilityEntry;
  instructionPreview: string;
  target: string;
  screenshotTraceId: string | null;
}): string[] {
  const traceNote = input.screenshotTraceId
    ? `Reference screenshot trace metadata ${input.screenshotTraceId}.`
    : "Use metadata-only context if available.";

  switch (input.entry.capabilityId) {
    case "computer.inspect.plan":
      return [
        "Would inspect the provided target description.",
        `Would summarize visible context for target ${input.target}.`,
        "Would stop before any computer control.",
      ];
    case "computer.screenshot.metadata":
      return [
        "Would record screenshot trace metadata only.",
        "Would store no raw screenshot bytes or base64 content.",
        traceNote,
      ];
    case "computer.click.plan":
      return [
        traceNote,
        `Would identify the intended clickable target from: ${input.instructionPreview}.`,
        "Would describe the click location without moving the mouse.",
      ];
    case "computer.type.plan":
      return [
        traceNote,
        "Would describe the target field and redacted text-entry intent.",
        "Would not send keystrokes.",
      ];
    case "computer.navigate.plan":
      return [
        `Would describe navigation intent for target ${input.target}.`,
        "Would not open URLs, tabs, windows, or applications.",
      ];
    case "openclaw.tool_invoke.dry_run":
      return [
        "Would describe the OpenClaw tool request.",
        "Would not call the OpenClaw gateway.",
        "Would require future explicit gates before any real tool use.",
      ];
    default:
      return ["Would return dry-run metadata only."];
  }
}

function permissionToolFor(entry: OpenClawCapabilityEntry): {
  toolId: "computer.action.dry_run" | "openclaw.tool_invoke.dry_run";
  capability: "computer.action.dry_run" | "openclaw.tool_invoke.dry_run";
} {
  if (entry.capabilityId === "openclaw.tool_invoke.dry_run") {
    return {
      toolId: "openclaw.tool_invoke.dry_run",
      capability: "openclaw.tool_invoke.dry_run",
    };
  }
  return {
    toolId: "computer.action.dry_run",
    capability: "computer.action.dry_run",
  };
}

export async function planComputerActionDryRun(
  input: ComputerDryRunInput,
  options: PlanComputerActionDryRunOptions = {},
): Promise<ComputerDryRunResult> {
  const entry = getOpenClawCapability(input.capabilityId);
  if (!entry) {
    return blocked({
      capabilityId: input.capabilityId,
      safeSummary: "Computer dry-run blocked: unknown capability.",
      blockedReasons: ["unknown-capability"],
      screenshotTraceId: input.screenshotTraceId ?? null,
      correlationId: input.correlationId,
    });
  }

  if (!entry.dryRunSupported || entry.realExecutionSupported || entry.riskLevel === "forbidden") {
    return blocked({
      capabilityId: entry.capabilityId,
      safeSummary: "Computer dry-run blocked: capability is disabled or future-only.",
      blockedReasons: ["real-capability-disabled"],
      riskLevel: entry.riskLevel,
      screenshotTraceId: input.screenshotTraceId ?? null,
      correlationId: input.correlationId,
    });
  }

  if (!input.subjectHash || input.subjectHash.trim().length === 0) {
    return blocked({
      capabilityId: entry.capabilityId,
      safeSummary: "Computer dry-run blocked: missing subject hash.",
      blockedReasons: ["missing-subject"],
      riskLevel: entry.riskLevel,
      screenshotTraceId: input.screenshotTraceId ?? null,
      correlationId: input.correlationId,
    });
  }

  const identity = deriveProjectIdentity(input.projectRoot);
  if (!identity.projectId) {
    return blocked({
      capabilityId: entry.capabilityId,
      safeSummary: "Computer dry-run blocked: missing project scope.",
      blockedReasons: ["missing-project"],
      riskLevel: entry.riskLevel,
      screenshotTraceId: input.screenshotTraceId ?? null,
      correlationId: input.correlationId,
    });
  }

  const target = input.target?.trim() || entry.allowedTargets[0] || "metadata";
  if (!(entry.allowedTargets as readonly string[]).includes(target)) {
    return blocked({
      capabilityId: entry.capabilityId,
      safeSummary: "Computer dry-run blocked: target is not allowed for this capability.",
      blockedReasons: ["target-not-allowed"],
      riskLevel: entry.riskLevel,
      screenshotTraceId: input.screenshotTraceId ?? null,
      correlationId: input.correlationId,
    });
  }

  const redacted = redactStructuredValue(
    {
      instruction: input.instruction,
      target,
      screenshotTraceId: input.screenshotTraceId ?? null,
    },
    { maxLength: 500 },
  );

  if (
    redacted.metadata.containsSecrets ||
    redacted.metadata.containsRawBody ||
    redacted.metadata.containsFileContent
  ) {
    return blocked({
      capabilityId: entry.capabilityId,
      safeSummary: "Computer dry-run blocked: request contains unsafe data.",
      blockedReasons: ["redaction-unsafe"],
      riskLevel: entry.riskLevel,
      redaction: redacted.metadata,
      screenshotTraceId: input.screenshotTraceId ?? null,
      correlationId: input.correlationId,
    });
  }

  const forbiddenReasons = findForbiddenReasons(`${input.instruction} ${target}`);
  if (forbiddenReasons.length > 0) {
    return blocked({
      capabilityId: entry.capabilityId,
      safeSummary: "Computer dry-run blocked: request matches forbidden computer-use policy.",
      blockedReasons: forbiddenReasons,
      riskLevel: entry.riskLevel,
      redaction: redacted.metadata,
      screenshotTraceId: input.screenshotTraceId ?? null,
      correlationId: input.correlationId,
    });
  }

  const permissionTool = permissionToolFor(entry);
  const permission = await checkPermission(
    {
      subjectKind: input.subjectKind,
      subjectHash: input.subjectHash,
      projectId: identity.projectId,
      toolId: permissionTool.toolId,
      capability: permissionTool.capability,
      category: null,
      operation: "computer.dry_run",
      channel: input.channel ?? "cli",
      dryRun: true,
      networkAccess: false,
      scopes: [permissionTool.capability],
      correlationId: input.correlationId ?? null,
      jobId: input.linkedJobId ?? null,
      proposalId: input.linkedProposalId ?? null,
    },
    {
      ...options.permission,
      appendAudit: options.permission?.appendAudit ?? true,
    },
  );

  if (!permission.allowed) {
    return blocked({
      capabilityId: entry.capabilityId,
      safeSummary: permission.safeMessage,
      blockedReasons: [permission.reasonCode],
      riskLevel: entry.riskLevel,
      permission,
      redaction: redacted.metadata,
      screenshotTraceId: input.screenshotTraceId ?? null,
      correlationId: input.correlationId,
    });
  }

  const instructionPreview =
    typeof redacted.value === "object" && redacted.value !== null
      ? JSON.stringify(redacted.value)
      : redacted.safePreview;

  return {
    ok: true,
    dryRun: true,
    capabilityId: entry.capabilityId,
    plannedSteps: plannedStepsFor({
      entry,
      instructionPreview,
      target,
      screenshotTraceId: input.screenshotTraceId ?? null,
    }),
    riskLevel: entry.riskLevel,
    requiredApprovals: requiredApprovals(entry),
    blockedReasons: [],
    safeSummary: "Computer dry-run plan generated. No computer action was performed.",
    permission,
    redaction: redacted.metadata,
    screenshotTraceId: input.screenshotTraceId ?? null,
    error: null,
  };
}
