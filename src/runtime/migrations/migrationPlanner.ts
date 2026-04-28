import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

import { getStoreInventory } from "../../health/storeInventory.js";
import type { SafeMetadata, StoreInventoryEntry } from "../../health/types.js";
import {
  findMigrationDefinitions,
  getMigrationDefinitions,
} from "./migrationRegistry.js";
import type {
  MigrationDefinition,
  MigrationPlanBoundaries,
  MigrationPlanDataRootSummary,
  MigrationPlanFinding,
  MigrationPlannerOptions,
  MigrationPlanResult,
  StoreMigrationPlanEntry,
} from "./types.js";

export const MIGRATION_PLANNER_SCHEMA_VERSION = "1.0";

const BOUNDARIES: MigrationPlanBoundaries = {
  noStoreMutation: true,
  noBackupsCreated: true,
  noLocksCreated: true,
  noRepair: true,
  noApply: true,
  noProviderCalls: true,
  noNetwork: true,
  noActionDispatch: true,
};

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function planId(createdAt: string, dataRoot: string): string {
  return `migplan_${sha256(`${createdAt}:${dataRoot}`).slice(0, 16)}`;
}

function findingId(prefix: string, parts: string[]): string {
  return `${prefix}_${sha256(parts.join(":")).slice(0, 12)}`;
}

function resolveDataRoot(options: MigrationPlannerOptions): {
  dataRoot: string;
  source: MigrationPlanDataRootSummary["source"];
} {
  if (options.dataRoot?.trim()) {
    return { dataRoot: options.dataRoot.trim(), source: "explicit" };
  }
  const envRoot = process.env.ORQUESTADOR_DATA_DIR?.trim();
  if (envRoot) {
    return { dataRoot: envRoot, source: "env" };
  }
  return { dataRoot: join(homedir(), ".orquestador-prime"), source: "default" };
}

function dataRootSummary(
  dataRoot: string,
  source: MigrationPlanDataRootSummary["source"],
): MigrationPlanDataRootSummary {
  return {
    source,
    rootHash: sha256(dataRoot).slice(0, 16),
    pathRedacted: true,
  };
}

function buildFinding(input: {
  severity: "warn" | "fail";
  reasonCode: string;
  safeMessage: string;
  storeId?: string;
  migrationId?: string;
  metadata?: SafeMetadata;
}): MigrationPlanFinding {
  return {
    id: findingId("migfind", [
      input.severity,
      input.reasonCode,
      input.storeId ?? "",
      input.migrationId ?? "",
      input.safeMessage,
    ]),
    severity: input.severity,
    reasonCode: input.reasonCode,
    safeMessage: input.safeMessage,
    ...(input.storeId ? { storeId: input.storeId } : {}),
    ...(input.migrationId ? { migrationId: input.migrationId } : {}),
    ...(input.metadata ? { metadata: input.metadata } : {}),
  };
}

function baseEntry(entry: StoreInventoryEntry): StoreMigrationPlanEntry {
  const planEntry: StoreMigrationPlanEntry = {
    storeId: entry.storeId,
    displayName: entry.displayName,
    fileName: entry.fileName,
    scope: entry.scope,
    status: "skipped",
    required: entry.required,
    exists: false,
    readable: false,
    parseable: false,
    lockScopeKnown: Boolean(entry.futureLockScope),
    availableMigrations: [],
    warnings: [],
    errors: [],
    metadata: {
      lockScopeKnown: Boolean(entry.futureLockScope),
    },
  };

  if (entry.expectedVersion !== undefined) {
    planEntry.expectedVersion = entry.expectedVersion;
  }
  if (entry.futureMigrationVersion !== undefined) {
    planEntry.futureMigrationVersion = entry.futureMigrationVersion;
  }
  if (entry.versionField !== undefined) {
    planEntry.versionField = entry.versionField;
  }
  if (entry.futureLockScope !== undefined) {
    planEntry.metadata = {
      ...planEntry.metadata,
      futureLockScope: entry.futureLockScope,
    };
  }

  return planEntry;
}

async function inspectStore(
  entry: StoreInventoryEntry,
  dataRoot: string,
): Promise<StoreMigrationPlanEntry> {
  const planEntry = baseEntry(entry);
  const filePath = join(dataRoot, entry.fileName);

  try {
    await stat(filePath);
    planEntry.exists = true;
  } catch {
    const finding = buildFinding({
      severity: entry.required ? "fail" : "warn",
      reasonCode: entry.required
        ? "migration.store.required_missing"
        : "migration.store.optional_missing",
      safeMessage: entry.required
        ? "Required store file is missing."
        : "Optional store file is missing.",
      storeId: entry.storeId,
    });
    if (entry.required) {
      planEntry.errors.push(finding);
    } else {
      planEntry.warnings.push(finding);
    }
    planEntry.status = "missing_store";
    return planEntry;
  }

  let raw: string;
  try {
    raw = await readFile(filePath, "utf8");
    planEntry.readable = true;
  } catch {
    planEntry.errors.push(buildFinding({
      severity: "fail",
      reasonCode: "migration.store.unreadable",
      safeMessage: "Store file exists but could not be read.",
      storeId: entry.storeId,
    }));
    planEntry.status = "corrupt";
    return planEntry;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw.replace(/^\uFEFF/, ""));
    planEntry.parseable = true;
  } catch {
    planEntry.errors.push(buildFinding({
      severity: "fail",
      reasonCode: "migration.store.invalid_json",
      safeMessage: "Store file is not valid JSON.",
      storeId: entry.storeId,
    }));
    planEntry.status = "corrupt";
    return planEntry;
  }

  if (!entry.versionField) {
    planEntry.warnings.push(buildFinding({
      severity: "warn",
      reasonCode: "migration.version_field.unconfigured",
      safeMessage: "Store inventory does not configure a version field.",
      storeId: entry.storeId,
    }));
    planEntry.status = "version_unknown";
    return planEntry;
  }

  const parsedObject = parsed && typeof parsed === "object"
    ? parsed as Record<string, unknown>
    : null;
  if (!parsedObject || !Object.prototype.hasOwnProperty.call(parsedObject, entry.versionField)) {
    planEntry.warnings.push(buildFinding({
      severity: "warn",
      reasonCode: "migration.version.missing",
      safeMessage: "Store JSON does not include the expected version field.",
      storeId: entry.storeId,
    }));
    planEntry.status = "missing_version";
    return planEntry;
  }

  const currentVersion = String(parsedObject[entry.versionField] ?? "");
  planEntry.currentVersion = currentVersion;

  if (!entry.expectedVersion) {
    planEntry.warnings.push(buildFinding({
      severity: "warn",
      reasonCode: "migration.expected_version.unconfigured",
      safeMessage: "Store inventory does not configure an expected version.",
      storeId: entry.storeId,
    }));
    planEntry.status = "version_unknown";
    return planEntry;
  }

  if (currentVersion === entry.expectedVersion) {
    planEntry.status = "up_to_date";
    return planEntry;
  }

  const targetVersion = entry.futureMigrationVersion ?? entry.expectedVersion;
  const availableMigrations = findMigrationDefinitions({
    storeId: entry.storeId,
    fromVersion: currentVersion,
    toVersion: targetVersion,
  });
  planEntry.availableMigrations = availableMigrations;

  if (availableMigrations.length > 0) {
    planEntry.status = availableMigrations.some((migration) => migration.requiresBackup || migration.requiresLock)
      ? "migration_required"
      : "migration_available";
    planEntry.warnings.push(buildFinding({
      severity: "warn",
      reasonCode: "migration.available",
      safeMessage: "Migration metadata exists, but apply is not implemented.",
      storeId: entry.storeId,
      metadata: { availableMigrationCount: availableMigrations.length },
    }));
    return planEntry;
  }

  planEntry.errors.push(buildFinding({
    severity: "fail",
    reasonCode: "migration.blocked.no_metadata",
    safeMessage: "Store version differs from expected version and no migration metadata is available.",
    storeId: entry.storeId,
    metadata: { expectedVersion: entry.expectedVersion },
  }));
  planEntry.status = "migration_blocked";
  return planEntry;
}

function recommendations(errors: MigrationPlanFinding[]): string[] {
  const items = [
    "Treat this migration plan as advisory dry-run output only.",
    "Do not apply migrations until backup and lock phases are explicitly implemented.",
    "Keep runtime doctor read-only and lock-free.",
  ];

  if (errors.length > 0) {
    items.unshift("Resolve blocking migration findings before implementing any apply path.");
  }

  return items;
}

export async function planStoreMigrations(
  options: MigrationPlannerOptions = {},
): Promise<MigrationPlanResult> {
  const createdAt = options.createdAt ?? new Date().toISOString();
  const root = resolveDataRoot(options);
  const stores = await Promise.all(
    getStoreInventory().map((entry) => inspectStore(entry, root.dataRoot)),
  );
  const migrations: MigrationDefinition[] = getMigrationDefinitions();
  const warnings = stores.flatMap((store) => store.warnings);
  const errors = stores.flatMap((store) => store.errors);

  return {
    planId: planId(createdAt, root.dataRoot),
    createdAt,
    schemaVersion: MIGRATION_PLANNER_SCHEMA_VERSION,
    advisoryOnly: true,
    dataRootSummary: dataRootSummary(root.dataRoot, root.source),
    stores,
    migrations,
    warnings,
    errors,
    recommendations: recommendations(errors),
    boundaries: { ...BOUNDARIES },
  };
}

export function createMigrationPlanErrorResult(error: unknown): MigrationPlanResult {
  const createdAt = new Date().toISOString();
  const finding = buildFinding({
    severity: "fail",
    reasonCode: "migration_planner.execution_error",
    safeMessage: error instanceof Error
      ? "Migration planner failed before checks completed."
      : "Migration planner failed with an unknown error.",
  });

  return {
    planId: `migplan_error_${sha256(createdAt).slice(0, 16)}`,
    createdAt,
    schemaVersion: MIGRATION_PLANNER_SCHEMA_VERSION,
    advisoryOnly: true,
    dataRootSummary: {
      source: "default",
      rootHash: sha256("error").slice(0, 16),
      pathRedacted: true,
    },
    stores: [],
    migrations: getMigrationDefinitions(),
    warnings: [],
    errors: [finding],
    recommendations: [
      "Fix the migration planner execution error before trusting dry-run output.",
    ],
    boundaries: { ...BOUNDARIES },
  };
}
