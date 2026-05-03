import { homedir } from "os";
import { join } from "path";
import type { IntegrationTargetPolicy } from "../policy/types.js";
import type { IntegrationActionStoragePathOptions } from "./paths.js";

const POLICY_SNAPSHOT_STORE_VERSION = "1.0";
const MAX_POLICY_SNAPSHOTS = 100;

type JsonStoreModule = typeof import("./jsonStore.js");

export interface IntegrationTargetPolicySnapshot {
  id: string;
  createdAt: string;
  source: "local_env" | "test" | "manual";
  policies: readonly IntegrationTargetPolicy[];
}

interface PolicySnapshotStoreData {
  version: typeof POLICY_SNAPSHOT_STORE_VERSION;
  snapshots: IntegrationTargetPolicySnapshot[];
}

const EMPTY_STORE: PolicySnapshotStoreData = {
  version: POLICY_SNAPSHOT_STORE_VERSION,
  snapshots: [],
};

type RedactModule = typeof import("../audit/redact.js");

async function loadJsonStoreModule(): Promise<JsonStoreModule> {
  return (await import(new URL("./jsonStore.ts", import.meta.url).href)) as JsonStoreModule;
}

async function loadRedactModule(): Promise<RedactModule> {
  return (await import(new URL("../audit/redact.ts", import.meta.url).href)) as RedactModule;
}

function defaultPolicySnapshotStorePath(
  options: IntegrationActionStoragePathOptions = {},
): string {
  const dataDir =
    options.dataDir ??
    options.env?.ORQUESTADOR_DATA_DIR?.trim() ??
    process.env.ORQUESTADOR_DATA_DIR?.trim() ??
    join(homedir(), ".orquestador-prime");
  return join(dataDir, "integration-actions", "policy-snapshots.json");
}

function isPolicy(value: unknown): value is IntegrationTargetPolicy {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.integration === "string" &&
    Array.isArray(record.allowedActions) &&
    record.allowedActions.every((action) => typeof action === "string")
  );
}

function isSnapshot(value: unknown): value is IntegrationTargetPolicySnapshot {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.createdAt === "string" &&
    (record.source === "local_env" ||
      record.source === "test" ||
      record.source === "manual") &&
    Array.isArray(record.policies) &&
    record.policies.every(isPolicy)
  );
}

function isStoreData(value: unknown): value is PolicySnapshotStoreData {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    record.version === POLICY_SNAPSHOT_STORE_VERSION &&
    Array.isArray(record.snapshots) &&
    record.snapshots.every(isSnapshot)
  );
}

function snapshotId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `policy_${ts}_${rand}`;
}

async function safePolicies(
  policies: readonly IntegrationTargetPolicy[],
): Promise<IntegrationTargetPolicy[]> {
  const { redactSensitive } = await loadRedactModule();
  return redactSensitive(policies) as IntegrationTargetPolicy[];
}

export class IntegrationTargetPolicySnapshotStore {
  private readonly path: string;

  constructor(path: string) {
    this.path = path;
  }

  private async readStore(): Promise<PolicySnapshotStoreData> {
    const { readJsonStore } = await loadJsonStoreModule();
    return readJsonStore(this.path, EMPTY_STORE, isStoreData);
  }

  private async writeStore(store: PolicySnapshotStoreData): Promise<void> {
    const { writeJsonStore } = await loadJsonStoreModule();
    await writeJsonStore(this.path, {
      version: POLICY_SNAPSHOT_STORE_VERSION,
      snapshots: store.snapshots.slice(-MAX_POLICY_SNAPSHOTS),
    });
  }

  async saveSnapshot(input: {
    policies: readonly IntegrationTargetPolicy[];
    source: IntegrationTargetPolicySnapshot["source"];
    createdAt?: string;
  }): Promise<IntegrationTargetPolicySnapshot> {
    const snapshot: IntegrationTargetPolicySnapshot = {
      id: snapshotId(),
      createdAt: input.createdAt ?? new Date().toISOString(),
      source: input.source,
      policies: await safePolicies(input.policies),
    };

    const store = await this.readStore();
    store.snapshots.push(snapshot);
    await this.writeStore(store);
    return snapshot;
  }

  async listSnapshots(): Promise<IntegrationTargetPolicySnapshot[]> {
    const store = await this.readStore();
    return store.snapshots.map((snapshot) => ({
      ...snapshot,
      policies: snapshot.policies.map((policy) => ({ ...policy })),
    }));
  }
}

export function createPolicySnapshotStore(
  options: IntegrationActionStoragePathOptions & { path?: string } = {},
): IntegrationTargetPolicySnapshotStore {
  return new IntegrationTargetPolicySnapshotStore(
    options.path ?? defaultPolicySnapshotStorePath(options),
  );
}
