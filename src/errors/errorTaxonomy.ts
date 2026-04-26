import {
  redactString,
  type RedactionMetadata,
} from "../privacy/redactionEngine.js";

export type SafeErrorCode =
  | "permission.denied"
  | "tool.forbidden"
  | "redaction.unsafe"
  | "job.blocked"
  | "notification.blocked"
  | "computer.dry_run_only"
  | "computer.approval_required"
  | "store.read_failed"
  | "store.write_failed"
  | "unknown";

export type SafeErrorSeverity = "info" | "warning" | "error" | "critical";

export interface SafeError {
  code: SafeErrorCode;
  severity: SafeErrorSeverity;
  safeMessage: string;
  retryable: boolean;
  auditHint: string;
  source: string | null;
  correlationId: string | null;
  redaction: RedactionMetadata;
}

export interface CreateSafeErrorOverrides {
  severity?: SafeErrorSeverity;
  safeMessage?: string;
  retryable?: boolean;
  auditHint?: string;
  source?: string | null;
  correlationId?: string | null;
}

const ERROR_DEFAULTS: Record<
  SafeErrorCode,
  Pick<SafeError, "severity" | "safeMessage" | "retryable" | "auditHint">
> = {
  "permission.denied": {
    severity: "warning",
    safeMessage: "Permission denied for this capability.",
    retryable: false,
    auditHint: "Check project-scoped permission grants.",
  },
  "tool.forbidden": {
    severity: "error",
    safeMessage: "This tool is forbidden by default policy.",
    retryable: false,
    auditHint: "Global forbidden categories and registry policy override grants.",
  },
  "redaction.unsafe": {
    severity: "warning",
    safeMessage: "Payload contains sensitive data and cannot be stored safely.",
    retryable: true,
    auditHint: "Remove raw identity, secrets, request bodies, or file content.",
  },
  "job.blocked": {
    severity: "warning",
    safeMessage: "Job blocked by safety policy.",
    retryable: false,
    auditHint: "Dangerous jobs must become proposals or remain blocked.",
  },
  "notification.blocked": {
    severity: "warning",
    safeMessage: "Notification blocked by delivery policy.",
    retryable: false,
    auditHint: "External delivery is disabled in this phase.",
  },
  "computer.dry_run_only": {
    severity: "warning",
    safeMessage: "Computer-use capability is available only as dry-run.",
    retryable: false,
    auditHint: "Real computer actions require future approval gates.",
  },
  "computer.approval_required": {
    severity: "warning",
    safeMessage: "Computer action requires proposal approval and second approval.",
    retryable: true,
    auditHint: "Use proposal and review flow before real action.",
  },
  "store.read_failed": {
    severity: "warning",
    safeMessage: "Store could not be read; using safe empty defaults.",
    retryable: true,
    auditHint: "Inspect local store path and permissions.",
  },
  "store.write_failed": {
    severity: "error",
    safeMessage: "Store could not be written; operation did not persist.",
    retryable: true,
    auditHint: "Fail closed if persistence is required.",
  },
  unknown: {
    severity: "error",
    safeMessage: "An unknown safe error occurred.",
    retryable: false,
    auditHint: "Inspect redacted logs and correlation ids.",
  },
};

function safeBounded(value: string): {
  message: string;
  redaction: RedactionMetadata;
} {
  const redacted = redactString(value, { maxLength: 220 });
  return {
    message: redacted.safePreview,
    redaction: redacted.metadata,
  };
}

export function createSafeError(
  code: SafeErrorCode,
  overrides: CreateSafeErrorOverrides = {},
): SafeError {
  const defaults = ERROR_DEFAULTS[code];
  const messageInput = overrides.safeMessage ?? defaults.safeMessage;
  const safe = safeBounded(messageInput);
  const hint = safeBounded(overrides.auditHint ?? defaults.auditHint);

  return {
    code,
    severity: overrides.severity ?? defaults.severity,
    safeMessage: safe.message,
    retryable: overrides.retryable ?? defaults.retryable,
    auditHint: hint.message,
    source: overrides.source ?? null,
    correlationId: overrides.correlationId ?? null,
    redaction: safe.redaction,
  };
}

export function safeErrorFromUnknown(
  err: unknown,
  source: string,
): SafeError {
  const rawMessage = err instanceof Error ? err.message : String(err);
  return createSafeError("unknown", {
    source,
    safeMessage: rawMessage || "Unknown error",
    auditHint: "Original error was redacted by safeErrorFromUnknown.",
  });
}
