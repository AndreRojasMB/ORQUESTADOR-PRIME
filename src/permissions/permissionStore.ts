import { mkdir, readFile, writeFile } from "fs/promises";
import { homedir } from "os";
import { join } from "path";
import { logger } from "../observability/logger.js";
import {
  PERMISSION_STORE_VERSION,
  type AppendPermissionGrantInput,
  type PermissionGrant,
  type PermissionStoreData,
  type PermissionSubjectKind,
} from "./types.js";

const DATA_DIR = join(homedir(), ".orquestador-prime");
const PERMISSIONS_FILE = join(DATA_DIR, "permissions.json");
const MAX_PERMISSION_GRANTS = 1000;

const EMPTY_STORE: PermissionStoreData = {
  version: PERMISSION_STORE_VERSION,
  grants: [],
};

function generateGrantId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 7);
  return `perm_${ts}_${rand}`;
}

function cloneGrant(grant: PermissionGrant): PermissionGrant {
  return {
    grantId: grant.grantId,
    subjectKind: grant.subjectKind,
    subjectHash: grant.subjectHash,
    role: grant.role,
    projectId: grant.projectId,
    toolId: grant.toolId,
    capability: grant.capability,
    scopes: grant.scopes.slice(),
    conditions: grant.conditions.map((condition) => ({ ...condition })),
    expiresAt: grant.expiresAt,
    maxUses: grant.maxUses,
    usedCount: grant.usedCount,
    createdAt: grant.createdAt,
    createdBy: grant.createdBy,
    reason: grant.reason,
    status: grant.status,
  };
}

export async function readPermissionStore(): Promise<PermissionStoreData> {
  try {
    const raw = await readFile(PERMISSIONS_FILE, "utf-8");
    const parsed = JSON.parse(raw) as PermissionStoreData;

    if (parsed.version !== PERMISSION_STORE_VERSION || !Array.isArray(parsed.grants)) {
      return { ...EMPTY_STORE, grants: [] };
    }

    return {
      version: PERMISSION_STORE_VERSION,
      grants: parsed.grants.map(cloneGrant),
    };
  } catch {
    return { ...EMPTY_STORE, grants: [] };
  }
}

export async function writePermissionStore(
  store: PermissionStoreData,
): Promise<boolean> {
  try {
    const normalized: PermissionStoreData = {
      version: PERMISSION_STORE_VERSION,
      grants: store.grants.slice(-MAX_PERMISSION_GRANTS).map(cloneGrant),
    };
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(PERMISSIONS_FILE, JSON.stringify(normalized, null, 2), "utf-8");
    return true;
  } catch (err) {
    logger.warn("permission store write failed — continuing without persistence", {
      error: String(err),
    });
    return false;
  }
}

export async function appendPermissionGrant(
  input: AppendPermissionGrantInput,
): Promise<{ grant: PermissionGrant; persisted: boolean }> {
  const createdAt = input.createdAt ?? new Date().toISOString();
  const grant: PermissionGrant = {
    grantId: generateGrantId(),
    subjectKind: input.subjectKind,
    subjectHash: input.subjectHash,
    role: input.role ?? null,
    projectId: input.projectId,
    toolId: input.toolId ?? null,
    capability: input.capability ?? null,
    scopes: input.scopes?.slice() ?? [],
    conditions: input.conditions?.map((condition) => ({ ...condition })) ?? [],
    expiresAt: input.expiresAt ?? null,
    maxUses: input.maxUses ?? null,
    usedCount: 0,
    createdAt,
    createdBy: input.createdBy,
    reason: input.reason,
    status: input.status ?? "active",
  };

  const store = await readPermissionStore();
  store.grants.push(grant);
  const persisted = await writePermissionStore(store);

  return { grant: cloneGrant(grant), persisted };
}

export async function getPermissionGrantsForSubject(input: {
  subjectKind: PermissionSubjectKind;
  subjectHash: string;
  projectId?: string | null;
}): Promise<PermissionGrant[]> {
  const store = await readPermissionStore();
  return store.grants
    .filter((grant) => {
      const projectMatches =
        input.projectId === undefined ||
        input.projectId === null ||
        grant.projectId === input.projectId;
      return (
        grant.subjectKind === input.subjectKind &&
        grant.subjectHash === input.subjectHash &&
        projectMatches
      );
    })
    .map(cloneGrant);
}

export function getPermissionsPath(): string {
  return PERMISSIONS_FILE;
}
