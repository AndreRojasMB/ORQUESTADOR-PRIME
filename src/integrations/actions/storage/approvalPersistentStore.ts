import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { homedir } from "os";
import { join } from "path";
import type { IntegrationActionApprovalStore } from "../approval/store.js";
import type {
  ApprovalStatus,
  IntegrationActionApprovalRequest,
} from "../approval/types.js";
import type { IntegrationActionStoragePathOptions } from "./paths.js";

const APPROVAL_STORE_VERSION = "1.0";
const REDACTED_ACT_CODE = "[REDACTED]";
const MAX_APPROVAL_RECORDS = 1000;

type JsonStoreModule = typeof import("./jsonStore.js");

async function loadJsonStoreModule(): Promise<JsonStoreModule> {
  return (await import(new URL("./jsonStore.ts", import.meta.url).href)) as JsonStoreModule;
}

function defaultApprovalStorePath(
  options: IntegrationActionStoragePathOptions = {},
): string {
  const dataDir =
    options.dataDir ??
    options.env?.ORQUESTADOR_DATA_DIR?.trim() ??
    process.env.ORQUESTADOR_DATA_DIR?.trim() ??
    join(homedir(), ".orquestador-prime");
  return join(dataDir, "integration-actions", "approvals.json");
}

interface PersistentApprovalRequest
  extends Omit<IntegrationActionApprovalRequest, "actCode"> {
  actCode: typeof REDACTED_ACT_CODE;
  actCodeHash: string;
  actCodeSalt: string;
}

interface ApprovalPersistentStoreData {
  version: typeof APPROVAL_STORE_VERSION;
  approvals: PersistentApprovalRequest[];
}

const EMPTY_STORE: ApprovalPersistentStoreData = {
  version: APPROVAL_STORE_VERSION,
  approvals: [],
};

function isApprovalStatus(value: unknown): value is ApprovalStatus {
  return (
    value === "pending" ||
    value === "approved" ||
    value === "rejected" ||
    value === "expired"
  );
}

function isPersistentApproval(value: unknown): value is PersistentApprovalRequest {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.actionId === "string" &&
    typeof record.actionSummary === "string" &&
    typeof record.integration === "string" &&
    typeof record.action === "string" &&
    typeof record.riskLevel === "string" &&
    Array.isArray(record.requiredBecause) &&
    record.requiredBecause.every((reason) => typeof reason === "string") &&
    record.actCode === REDACTED_ACT_CODE &&
    typeof record.actCodeHash === "string" &&
    typeof record.actCodeSalt === "string" &&
    isApprovalStatus(record.status) &&
    typeof record.createdAt === "string" &&
    typeof record.expiresAt === "string"
  );
}

function isStoreData(value: unknown): value is ApprovalPersistentStoreData {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    record.version === APPROVAL_STORE_VERSION &&
    Array.isArray(record.approvals) &&
    record.approvals.every(isPersistentApproval)
  );
}

function hashActCode(actCode: string, salt: string): string {
  return createHash("sha256").update(`${salt}:${actCode}`).digest("hex");
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

function toRequest(
  request: PersistentApprovalRequest,
): IntegrationActionApprovalRequest {
  return {
    id: request.id,
    actionId: request.actionId,
    actionSummary: request.actionSummary,
    integration: request.integration,
    action: request.action,
    riskLevel: request.riskLevel,
    requiredBecause: request.requiredBecause.slice(),
    actCode: REDACTED_ACT_CODE,
    status: request.status,
    createdAt: request.createdAt,
    expiresAt: request.expiresAt,
    ...(request.approvedAt ? { approvedAt: request.approvedAt } : {}),
    ...(request.rejectedAt ? { rejectedAt: request.rejectedAt } : {}),
    ...(request.rejectionReason
      ? { rejectionReason: request.rejectionReason }
      : {}),
  };
}

function toPersistent(
  request: IntegrationActionApprovalRequest,
  existing?: PersistentApprovalRequest,
): PersistentApprovalRequest {
  const hasPlainActCode =
    request.actCode.length > 0 && request.actCode !== REDACTED_ACT_CODE;
  const salt = hasPlainActCode
    ? randomBytes(16).toString("hex")
    : existing?.actCodeSalt ?? randomBytes(16).toString("hex");
  const actCodeHash = hasPlainActCode
    ? hashActCode(request.actCode, salt)
    : existing?.actCodeHash ?? hashActCode(REDACTED_ACT_CODE, salt);

  return {
    id: request.id,
    actionId: request.actionId,
    actionSummary: request.actionSummary,
    integration: request.integration,
    action: request.action,
    riskLevel: request.riskLevel,
    requiredBecause: request.requiredBecause.slice(),
    actCode: REDACTED_ACT_CODE,
    actCodeHash,
    actCodeSalt: salt,
    status: request.status,
    createdAt: request.createdAt,
    expiresAt: request.expiresAt,
    ...(request.approvedAt ? { approvedAt: request.approvedAt } : {}),
    ...(request.rejectedAt ? { rejectedAt: request.rejectedAt } : {}),
    ...(request.rejectionReason
      ? { rejectionReason: request.rejectionReason }
      : {}),
  };
}

function expirePending(request: PersistentApprovalRequest): PersistentApprovalRequest {
  if (
    request.status === "pending" &&
    Number.isFinite(Date.parse(request.expiresAt)) &&
    Date.parse(request.expiresAt) <= Date.now()
  ) {
    return {
      ...request,
      status: "expired",
    };
  }

  return request;
}

export class PersistentIntegrationActionApprovalStore
  implements IntegrationActionApprovalStore
{
  private readonly path: string;

  constructor(path: string) {
    this.path = path;
  }

  private async readStore(): Promise<ApprovalPersistentStoreData> {
    const { readJsonStore } = await loadJsonStoreModule();
    const store = await readJsonStore(this.path, EMPTY_STORE, isStoreData);
    return {
      version: APPROVAL_STORE_VERSION,
      approvals: store.approvals.map(expirePending),
    };
  }

  private async writeStore(store: ApprovalPersistentStoreData): Promise<void> {
    const { writeJsonStore } = await loadJsonStoreModule();
    await writeJsonStore(this.path, {
      version: APPROVAL_STORE_VERSION,
      approvals: store.approvals.slice(-MAX_APPROVAL_RECORDS),
    });
  }

  async save(request: IntegrationActionApprovalRequest): Promise<void> {
    const store = await this.readStore();
    const existing = store.approvals.find((item) => item.id === request.id);
    const persisted = toPersistent(request, existing);
    store.approvals = [
      ...store.approvals.filter((item) => item.id !== request.id),
      persisted,
    ];
    await this.writeStore(store);
  }

  async update(request: IntegrationActionApprovalRequest): Promise<void> {
    await this.save(request);
  }

  async getById(
    approvalId: string,
  ): Promise<IntegrationActionApprovalRequest | undefined> {
    const store = await this.readStore();
    return store.approvals.find((request) => request.id === approvalId)
      ? toRequest(store.approvals.find((request) => request.id === approvalId)!)
      : undefined;
  }

  async getByActionId(
    actionId: string,
  ): Promise<IntegrationActionApprovalRequest | undefined> {
    const store = await this.readStore();
    const request = store.approvals.find((item) => item.actionId === actionId);
    return request ? toRequest(request) : undefined;
  }

  async verifyActCode(approvalId: string, actCode: string): Promise<boolean> {
    const store = await this.readStore();
    const request = store.approvals.find((item) => item.id === approvalId);
    if (!request) return false;

    return safeEqual(
      hashActCode(actCode, request.actCodeSalt),
      request.actCodeHash,
    );
  }
}

export function createPersistentApprovalStore(
  options: IntegrationActionStoragePathOptions & { path?: string } = {},
): PersistentIntegrationActionApprovalStore {
  return new PersistentIntegrationActionApprovalStore(
    options.path ?? defaultApprovalStorePath(options),
  );
}
