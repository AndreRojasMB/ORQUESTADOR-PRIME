import { randomBytes } from "crypto";
import type { IntegrationActionApprovalRequest } from "../approval/types.js";
import type {
  IntegrationActionValidationResult,
  ProposedIntegrationAction,
} from "../types.js";
import type { IntegrationActionAuditStore } from "./store.js";
import type {
  IntegrationActionExecutionResult,
} from "../executors/types.js";
import type {
  AuditEventType,
  IntegrationActionAuditEvent,
  IntegrationActionAuditRecord,
} from "./types.js";

type StoreModule = typeof import("./store.js");
type RedactModule = typeof import("./redact.js");

async function loadStoreModule(): Promise<StoreModule> {
  return (await import(new URL("./store.ts", import.meta.url).href)) as StoreModule;
}

async function loadRedactModule(): Promise<RedactModule> {
  return (await import(new URL("./redact.ts", import.meta.url).href)) as RedactModule;
}

function nowIso(): string {
  return new Date().toISOString();
}

function eventId(eventType: AuditEventType): string {
  return `audit-${eventType}-${randomBytes(5).toString("hex")}`;
}

export interface IntegrationActionAuditTrailOptions {
  store?: IntegrationActionAuditStore;
}

export class IntegrationActionAuditTrail {
  private readonly store: IntegrationActionAuditStore;

  private constructor(store: IntegrationActionAuditStore) {
    this.store = store;
  }

  static async create(
    options: IntegrationActionAuditTrailOptions = {},
  ): Promise<IntegrationActionAuditTrail> {
    const store =
      options.store ?? (await loadStoreModule()).createInMemoryAuditStore();
    return new IntegrationActionAuditTrail(store);
  }

  async appendAuditEvent(event: IntegrationActionAuditEvent): Promise<void> {
    await this.store.appendAuditEvent(event);
  }

  async getAuditRecord(
    actionId: string,
  ): Promise<IntegrationActionAuditRecord | undefined> {
    return this.store.getAuditRecord(actionId);
  }

  async listAuditRecords(): Promise<IntegrationActionAuditRecord[]> {
    return this.store.listAuditRecords();
  }

  private async buildEvent(
    action: ProposedIntegrationAction,
    eventType: AuditEventType,
    status: string,
    summary: string,
    details?: unknown,
    approvalId?: string,
  ): Promise<IntegrationActionAuditEvent> {
    const { redactSensitive } = await loadRedactModule();
    const base = {
      id: eventId(eventType),
      actionId: action.id,
      eventType,
      integration: action.integration,
      action: action.action,
      riskLevel: action.riskLevel,
      status,
      summary,
      actor: "local-dev",
      createdAt: nowIso(),
    };

    return {
      ...base,
      ...(approvalId ? { approvalId } : {}),
      ...(details !== undefined
        ? { detailsRedacted: redactSensitive(details) }
        : {}),
    };
  }

  async createActionAudit(action: ProposedIntegrationAction): Promise<void> {
    await this.appendAuditEvent(
      await this.buildEvent(action, "action_created", "created", action.title, {
        input: action.input,
        expectedOutcome: action.expectedOutcome,
      }),
    );
  }

  async recordValidationResult(
    action: ProposedIntegrationAction,
    result: IntegrationActionValidationResult,
  ): Promise<void> {
    await this.appendAuditEvent(
      await this.buildEvent(
        action,
        "validation_completed",
        result.allowed ? "allowed" : "blocked",
        "Validation completed.",
        {
          allowed: result.allowed,
          reasons: result.reasons,
          warnings: result.warnings,
        },
      ),
    );
  }

  async recordDryRunResult(
    action: ProposedIntegrationAction,
    result: IntegrationActionValidationResult,
  ): Promise<void> {
    await this.appendAuditEvent(
      await this.buildEvent(
        action,
        "dry_run_completed",
        result.allowed ? "allowed" : "blocked",
        "Dry-run validation completed.",
        {
          allowed: result.allowed,
          reasons: result.reasons,
        },
      ),
    );
  }

  async recordApprovalRequested(
    action: ProposedIntegrationAction,
    approval: IntegrationActionApprovalRequest,
  ): Promise<void> {
    await this.appendAuditEvent(
      await this.buildEvent(
        action,
        "approval_requested",
        approval.status,
        "Approval requested.",
        {
          approvalId: approval.id,
          requiredBecause: approval.requiredBecause,
          expiresAt: approval.expiresAt,
        },
        approval.id,
      ),
    );
  }

  async recordApprovalApproved(
    action: ProposedIntegrationAction,
    approval: IntegrationActionApprovalRequest,
  ): Promise<void> {
    await this.appendAuditEvent(
      await this.buildEvent(
        action,
        "approval_approved",
        "approved",
        "Approval granted.",
        {
          approvalId: approval.id,
          approvedAt: approval.approvedAt,
        },
        approval.id,
      ),
    );
  }

  async recordApprovalRejected(
    action: ProposedIntegrationAction,
    approval: IntegrationActionApprovalRequest,
  ): Promise<void> {
    await this.appendAuditEvent(
      await this.buildEvent(
        action,
        "approval_rejected",
        "rejected",
        "Approval rejected.",
        {
          approvalId: approval.id,
          rejectedAt: approval.rejectedAt,
          reason: approval.rejectionReason,
        },
        approval.id,
      ),
    );
  }

  async recordActionBlocked(
    action: ProposedIntegrationAction,
    reasons: readonly string[],
  ): Promise<void> {
    await this.appendAuditEvent(
      await this.buildEvent(action, "action_blocked", "blocked", "Action blocked.", {
        reasons,
      }),
    );
  }

  async recordReadyForExecution(action: ProposedIntegrationAction): Promise<void> {
    await this.appendAuditEvent(
      await this.buildEvent(
        action,
        "ready_for_execution",
        "ready",
        "Action approved and ready for a future executor.",
      ),
    );
  }

  async recordExecutionSkippedPhase13(
    action: ProposedIntegrationAction,
  ): Promise<void> {
    await this.appendAuditEvent(
      await this.buildEvent(
        action,
        "execution_skipped_phase_13",
        "skipped",
        "Execution skipped because Phase 13 is audit-only.",
      ),
    );
  }

  async recordExecutionStarted(action: ProposedIntegrationAction): Promise<void> {
    await this.appendAuditEvent(
      await this.buildEvent(
        action,
        "execution_started",
        "started",
        "Execution gate started safe executor evaluation.",
      ),
    );
  }

  async recordExecutionCompleted(
    action: ProposedIntegrationAction,
    result: IntegrationActionExecutionResult,
  ): Promise<void> {
    await this.appendAuditEvent(
      await this.buildEvent(
        action,
        "execution_completed",
        result.status,
        result.summary,
        result,
      ),
    );
  }

  async recordExecutionBlocked(
    action: ProposedIntegrationAction,
    reasons: readonly string[],
  ): Promise<void> {
    await this.appendAuditEvent(
      await this.buildEvent(
        action,
        "execution_blocked",
        "blocked",
        "Execution gate blocked the action.",
        { reasons },
      ),
    );
  }

  async recordExecutionFailed(
    action: ProposedIntegrationAction,
    error: string,
  ): Promise<void> {
    await this.appendAuditEvent(
      await this.buildEvent(
        action,
        "execution_failed",
        "failed",
        "Safe executor failed before completing.",
        { error },
      ),
    );
  }
}

export async function createActionAuditTrail(
  options: IntegrationActionAuditTrailOptions = {},
): Promise<IntegrationActionAuditTrail> {
  return IntegrationActionAuditTrail.create(options);
}
