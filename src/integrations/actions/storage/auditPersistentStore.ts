import { homedir } from "os";
import { join } from "path";
import type { IntegrationActionAuditStore } from "../audit/store.js";
import type {
  IntegrationActionAuditEvent,
  IntegrationActionAuditRecord,
} from "../audit/types.js";
import type { IntegrationActionStoragePathOptions } from "./paths.js";

const AUDIT_STORE_VERSION = "1.0";
const MAX_AUDIT_RECORDS = 1000;
const MAX_EVENTS_PER_RECORD = 200;

type JsonStoreModule = typeof import("./jsonStore.js");

interface AuditPersistentStoreData {
  version: typeof AUDIT_STORE_VERSION;
  records: IntegrationActionAuditRecord[];
}

const EMPTY_STORE: AuditPersistentStoreData = {
  version: AUDIT_STORE_VERSION,
  records: [],
};

type RedactModule = typeof import("../audit/redact.js");

async function loadJsonStoreModule(): Promise<JsonStoreModule> {
  return (await import(new URL("./jsonStore.ts", import.meta.url).href)) as JsonStoreModule;
}

async function loadRedactModule(): Promise<RedactModule> {
  return (await import(new URL("../audit/redact.ts", import.meta.url).href)) as RedactModule;
}

function defaultAuditStorePath(
  options: IntegrationActionStoragePathOptions = {},
): string {
  const dataDir =
    options.dataDir ??
    options.env?.ORQUESTADOR_DATA_DIR?.trim() ??
    process.env.ORQUESTADOR_DATA_DIR?.trim() ??
    join(homedir(), ".orquestador-prime");
  return join(dataDir, "integration-actions", "audit-records.json");
}

function isAuditEvent(value: unknown): value is IntegrationActionAuditEvent {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.actionId === "string" &&
    typeof record.eventType === "string" &&
    typeof record.integration === "string" &&
    typeof record.action === "string" &&
    typeof record.riskLevel === "string" &&
    typeof record.status === "string" &&
    typeof record.summary === "string" &&
    typeof record.createdAt === "string"
  );
}

function isAuditRecord(value: unknown): value is IntegrationActionAuditRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.actionId === "string" &&
    typeof record.integration === "string" &&
    typeof record.action === "string" &&
    typeof record.riskLevel === "string" &&
    typeof record.createdAt === "string" &&
    typeof record.updatedAt === "string" &&
    Array.isArray(record.events) &&
    record.events.every(isAuditEvent)
  );
}

function isStoreData(value: unknown): value is AuditPersistentStoreData {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    record.version === AUDIT_STORE_VERSION &&
    Array.isArray(record.records) &&
    record.records.every(isAuditRecord)
  );
}

async function redactEvent(
  event: IntegrationActionAuditEvent,
): Promise<IntegrationActionAuditEvent> {
  const { redactSensitive } = await loadRedactModule();
  return {
    ...event,
    ...(event.detailsRedacted !== undefined
      ? { detailsRedacted: redactSensitive(event.detailsRedacted) }
      : {}),
  };
}

function cloneRecord(
  record: IntegrationActionAuditRecord,
): IntegrationActionAuditRecord {
  return {
    ...record,
    events: record.events.map((event) => ({
      ...event,
      ...(event.detailsRedacted !== undefined
        ? { detailsRedacted: event.detailsRedacted }
        : {}),
    })),
  };
}

export class PersistentIntegrationActionAuditStore
  implements IntegrationActionAuditStore
{
  private readonly path: string;

  constructor(path: string) {
    this.path = path;
  }

  private async readStore(): Promise<AuditPersistentStoreData> {
    const { readJsonStore } = await loadJsonStoreModule();
    const store = await readJsonStore(this.path, EMPTY_STORE, isStoreData);
    return {
      version: AUDIT_STORE_VERSION,
      records: store.records.map(cloneRecord),
    };
  }

  private async writeStore(store: AuditPersistentStoreData): Promise<void> {
    const { writeJsonStore } = await loadJsonStoreModule();
    await writeJsonStore(this.path, {
      version: AUDIT_STORE_VERSION,
      records: store.records.slice(-MAX_AUDIT_RECORDS).map((record) => ({
        ...record,
        events: record.events.slice(-MAX_EVENTS_PER_RECORD),
      })),
    });
  }

  async appendAuditEvent(event: IntegrationActionAuditEvent): Promise<void> {
    const safeEvent = await redactEvent(event);
    const store = await this.readStore();
    const existing = store.records.find(
      (record) => record.actionId === safeEvent.actionId,
    );

    if (!existing) {
      store.records.push({
        actionId: safeEvent.actionId,
        integration: safeEvent.integration,
        action: safeEvent.action,
        riskLevel: safeEvent.riskLevel,
        createdAt: safeEvent.createdAt,
        updatedAt: safeEvent.createdAt,
        events: [safeEvent],
      });
      await this.writeStore(store);
      return;
    }

    const updated: IntegrationActionAuditRecord = {
      ...existing,
      updatedAt: safeEvent.createdAt,
      events: [...existing.events, safeEvent],
    };
    store.records = store.records.map((record) =>
      record.actionId === updated.actionId ? updated : record,
    );
    await this.writeStore(store);
  }

  async getAuditRecord(
    actionId: string,
  ): Promise<IntegrationActionAuditRecord | undefined> {
    const store = await this.readStore();
    const record = store.records.find((item) => item.actionId === actionId);
    return record ? cloneRecord(record) : undefined;
  }

  async listAuditRecords(): Promise<IntegrationActionAuditRecord[]> {
    const store = await this.readStore();
    return store.records.map(cloneRecord);
  }
}

export function createPersistentAuditStore(
  options: IntegrationActionStoragePathOptions & { path?: string } = {},
): PersistentIntegrationActionAuditStore {
  return new PersistentIntegrationActionAuditStore(
    options.path ?? defaultAuditStorePath(options),
  );
}
