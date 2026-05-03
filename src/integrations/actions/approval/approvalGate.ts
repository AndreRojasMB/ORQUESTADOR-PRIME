import { randomBytes } from "crypto";
import type { ProposedIntegrationAction } from "../types.js";
import type { IntegrationActionApprovalStore } from "./store.js";
import type {
  ApprovalDecision,
  IntegrationActionApprovalRequest,
} from "./types.js";

type ValidatorModule = typeof import("../validator.js");
type StoreModule = typeof import("./store.js");

const DEFAULT_TTL_MS = 10 * 60 * 1000;

async function loadValidatorModule(): Promise<ValidatorModule> {
  return (await import(new URL("../validator.ts", import.meta.url).href)) as ValidatorModule;
}

async function loadStoreModule(): Promise<StoreModule> {
  return (await import(new URL("./store.ts", import.meta.url).href)) as StoreModule;
}

function nowIso(): string {
  return new Date().toISOString();
}

function expiresAtIso(ttlMs: number): string {
  return new Date(Date.now() + ttlMs).toISOString();
}

function approvalId(actionId: string): string {
  return `approval-${actionId}-${randomBytes(4).toString("hex")}`;
}

function createLocalDevActCode(): string {
  const first = randomBytes(2).toString("hex").toUpperCase();
  const second = randomBytes(2).toString("hex").toUpperCase();
  return `ACT-LOCAL-${first}-${second}`;
}

function isExpired(request: IntegrationActionApprovalRequest): boolean {
  return Date.parse(request.expiresAt) <= Date.now();
}

function sanitizeSummary(action: ProposedIntegrationAction): string {
  return `${action.integration}:${action.action} - ${action.title}`;
}

function approvalReasons(action: ProposedIntegrationAction): string[] {
  const reasons: string[] = [];
  if (action.requiresApproval) reasons.push("action_requires_approval");
  if (action.riskLevel === "high" || action.riskLevel === "critical") {
    reasons.push(`risk_level:${action.riskLevel}`);
  }
  if (action.action === "send_message") reasons.push("external_message_send");
  if (action.integration === "openclaw") reasons.push("execution_substrate");
  if (action.integration === "coolify") reasons.push("deployment_surface");
  return reasons.length > 0 ? reasons : ["local_policy"];
}

export interface ApprovalGateOptions {
  store?: IntegrationActionApprovalStore;
  ttlMs?: number;
}

export class IntegrationActionApprovalGate {
  private readonly store: IntegrationActionApprovalStore;
  private readonly ttlMs: number;

  private constructor(
    store: IntegrationActionApprovalStore,
    options: ApprovalGateOptions = {},
  ) {
    this.store = store;
    this.ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;
  }

  static async create(
    options: ApprovalGateOptions = {},
  ): Promise<IntegrationActionApprovalGate> {
    const store =
      options.store ??
      (await loadStoreModule()).createInMemoryApprovalStore();
    return new IntegrationActionApprovalGate(store, options);
  }

  async createApprovalRequest(
    action: ProposedIntegrationAction,
  ): Promise<IntegrationActionApprovalRequest> {
    const { validateProposedIntegrationAction } = await loadValidatorModule();
    const validation = await validateProposedIntegrationAction(action);
    if (!validation.allowed) {
      throw new Error(`action_not_valid:${validation.reasons.join(",")}`);
    }

    const request: IntegrationActionApprovalRequest = {
      id: approvalId(action.id),
      actionId: action.id,
      actionSummary: sanitizeSummary(action),
      integration: action.integration,
      action: action.action,
      riskLevel: action.riskLevel,
      requiredBecause: approvalReasons(action),
      actCode: createLocalDevActCode(),
      status: action.requiresApproval ? "pending" : "approved",
      createdAt: nowIso(),
      expiresAt: expiresAtIso(this.ttlMs),
    };

    const storedRequest = action.requiresApproval
      ? request
      : {
          ...request,
          approvedAt: request.createdAt,
        };

    await this.store.save(storedRequest);
    return storedRequest;
  }

  async approveAction(
    approvalIdOrActionId: string,
    actCode: string,
  ): Promise<ApprovalDecision> {
    const request =
      (await this.store.getById(approvalIdOrActionId)) ??
      (await this.store.getByActionId(approvalIdOrActionId));

    if (!request) {
      return {
        approvalId: approvalIdOrActionId,
        actionId: approvalIdOrActionId,
        status: "rejected",
        allowed: false,
        reasons: ["approval_not_found"],
      };
    }

    if (isExpired(request)) {
      const expired = { ...request, status: "expired" as const };
      await this.store.update(expired);
      return {
        approvalId: expired.id,
        actionId: expired.actionId,
        status: expired.status,
        allowed: false,
        reasons: ["approval_expired"],
      };
    }

    if (request.status !== "pending") {
      return {
        approvalId: request.id,
        actionId: request.actionId,
        status: request.status,
        allowed: request.status === "approved",
        reasons: [`approval_status:${request.status}`],
      };
    }

    const actCodeMatches = this.store.verifyActCode
      ? await this.store.verifyActCode(request.id, actCode)
      : request.actCode === actCode;

    if (!actCodeMatches) {
      return {
        approvalId: request.id,
        actionId: request.actionId,
        status: request.status,
        allowed: false,
        reasons: ["invalid_act_code"],
      };
    }

    const approved = {
      ...request,
      status: "approved" as const,
      approvedAt: nowIso(),
    };
    await this.store.update(approved);

    return {
      approvalId: approved.id,
      actionId: approved.actionId,
      status: approved.status,
      allowed: true,
      reasons: [],
    };
  }

  async rejectApproval(
    approvalId: string,
    reason: string,
  ): Promise<ApprovalDecision> {
    const request = await this.store.getById(approvalId);
    if (!request) {
      return {
        approvalId,
        actionId: approvalId,
        status: "rejected",
        allowed: false,
        reasons: ["approval_not_found"],
      };
    }

    const rejected = {
      ...request,
      status: "rejected" as const,
      rejectedAt: nowIso(),
      rejectionReason: reason,
    };
    await this.store.update(rejected);
    return {
      approvalId: rejected.id,
      actionId: rejected.actionId,
      status: rejected.status,
      allowed: false,
      reasons: [reason],
    };
  }

  async verifyApprovalActCode(
    approvalIdOrActionId: string,
    actCode: string,
  ): Promise<ApprovalDecision> {
    const request =
      (await this.store.getById(approvalIdOrActionId)) ??
      (await this.store.getByActionId(approvalIdOrActionId));

    if (!request) {
      return {
        approvalId: approvalIdOrActionId,
        actionId: approvalIdOrActionId,
        status: "rejected",
        allowed: false,
        reasons: ["approval_not_found"],
      };
    }

    if (isExpired(request)) {
      const expired = { ...request, status: "expired" as const };
      await this.store.update(expired);
      return {
        approvalId: expired.id,
        actionId: expired.actionId,
        status: expired.status,
        allowed: false,
        reasons: ["approval_expired"],
      };
    }

    if (request.status !== "pending") {
      return {
        approvalId: request.id,
        actionId: request.actionId,
        status: request.status,
        allowed: false,
        reasons: [`approval_status:${request.status}`],
      };
    }

    const actCodeMatches = this.store.verifyActCode
      ? await this.store.verifyActCode(request.id, actCode)
      : request.actCode === actCode;

    return {
      approvalId: request.id,
      actionId: request.actionId,
      status: request.status,
      allowed: actCodeMatches,
      reasons: actCodeMatches ? [] : ["invalid_act_code"],
    };
  }

  async getApprovalStatus(
    approvalId: string,
  ): Promise<IntegrationActionApprovalRequest | undefined> {
    const request = await this.store.getById(approvalId);
    if (!request || request.status !== "pending" || !isExpired(request)) {
      return request;
    }

    const expired = { ...request, status: "expired" as const };
    await this.store.update(expired);
    return expired;
  }

  async assertActionApproved(
    action: ProposedIntegrationAction,
  ): Promise<ApprovalDecision> {
    const request = await this.store.getByActionId(action.id);
    if (!request) {
      return {
        approvalId: action.id,
        actionId: action.id,
        status: "rejected",
        allowed: false,
        reasons: ["approval_required"],
      };
    }

    const status = await this.getApprovalStatus(request.id);
    if (!status) {
      return {
        approvalId: request.id,
        actionId: action.id,
        status: "rejected",
        allowed: false,
        reasons: ["approval_not_found"],
      };
    }

    return {
      approvalId: status.id,
      actionId: status.actionId,
      status: status.status,
      allowed: status.status === "approved",
      reasons: status.status === "approved" ? [] : [`approval_status:${status.status}`],
    };
  }
}

export async function createApprovalGate(
  options: ApprovalGateOptions = {},
): Promise<IntegrationActionApprovalGate> {
  return IntegrationActionApprovalGate.create(options);
}
