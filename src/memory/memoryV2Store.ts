import { createHash } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import { homedir } from "os";
import { join } from "path";
import { logger } from "../observability/logger.js";
import { deriveProjectIdentity } from "../supervisor/projectIdentity.js";
import type { ProjectIdentity } from "../supervisor/types.js";
import {
  MEMORY_V2_ENTRY_SCHEMA_VERSION,
  MEMORY_V2_STORE_VERSION,
  type AppendMemoryV2EntryInput,
  type MemoryV2Entry,
  type MemoryV2Indexes,
  type MemoryV2Links,
  type MemoryV2Privacy,
  type MemoryV2ProjectScope,
  type MemoryV2Redaction,
  type MemoryV2Retention,
  type MemoryV2StoreData,
} from "./memoryV2Types.js";
import {
  MEMORY_V2_REDACTION_VERSION,
  mergeRemovedKinds,
  safeMemoryV2Preview,
} from "./memoryV2Redaction.js";

const DATA_DIR = join(homedir(), ".orquestador-prime");
const MEMORY_V2_FILE = join(DATA_DIR, "memory-v2.json");
const MAX_MEMORY_V2_ENTRIES = 1000;

const EMPTY_INDEXES: MemoryV2Indexes = {
  byProjectId: {},
  byTag: {},
  byType: {},
};

const EMPTY_STORE: MemoryV2StoreData = {
  version: MEMORY_V2_STORE_VERSION,
  entries: [],
  indexes: EMPTY_INDEXES,
  lastUpdatedAt: null,
};

function hashValue(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function normalizeTag(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
}

function generateMemoryV2Id(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `mem2_${ts}_${rand}`;
}

async function readGitFile(projectRoot: string, relPath: string): Promise<string | null> {
  try {
    return await readFile(join(projectRoot, ".git", relPath), "utf-8");
  } catch {
    return null;
  }
}

async function detectBranch(projectRoot: string): Promise<string | null> {
  const head = await readGitFile(projectRoot, "HEAD");
  if (!head) {
    return null;
  }

  const match = head.trim().match(/^ref:\s+refs\/heads\/(.+)$/);
  return match?.[1] ?? null;
}

async function detectRepoRemoteHash(projectRoot: string): Promise<string | null> {
  const config = await readGitFile(projectRoot, "config");
  if (!config) {
    return null;
  }

  const match = config.match(/\[remote "origin"\][\s\S]*?\n\s*url\s*=\s*(.+)/);
  const remote = match?.[1]?.trim();
  return remote ? hashValue(remote) : null;
}

export async function createMemoryV2ProjectScope(
  projectRoot = process.cwd(),
): Promise<MemoryV2ProjectScope> {
  const identity = deriveProjectIdentity(projectRoot);

  return {
    projectId: identity.projectId,
    projectName: identity.projectName,
    workspaceHash: identity.projectRootHash,
    repoRemoteHash: await detectRepoRemoteHash(identity.projectRoot),
    branch: await detectBranch(identity.projectRoot),
  };
}

function emptyLinks(): MemoryV2Links {
  return {
    traceIds: [],
    trajectoryIds: [],
    proposalIds: [],
    executionResultIds: [],
    channelAuditIds: [],
    memoryV1Ids: [],
    docs: [],
  };
}

function mergeLinks(input?: Partial<MemoryV2Links>): MemoryV2Links {
  const base = emptyLinks();

  return {
    traceIds: input?.traceIds?.slice() ?? base.traceIds,
    trajectoryIds: input?.trajectoryIds?.slice() ?? base.trajectoryIds,
    proposalIds: input?.proposalIds?.slice() ?? base.proposalIds,
    executionResultIds: input?.executionResultIds?.slice() ?? base.executionResultIds,
    channelAuditIds: input?.channelAuditIds?.slice() ?? base.channelAuditIds,
    memoryV1Ids: input?.memoryV1Ids?.slice() ?? base.memoryV1Ids,
    docs: input?.docs?.slice() ?? base.docs,
  };
}

function createPrivacy(input?: Partial<MemoryV2Privacy>): MemoryV2Privacy {
  const label = input?.label ?? "project";

  return {
    label,
    allowedForPrompt:
      input?.allowedForPrompt ?? (label === "public" || label === "project"),
    allowCrossProject: false,
    reason: input?.reason ?? "default project-scoped memory policy",
  };
}

function createRetention(input?: Partial<MemoryV2Retention>): MemoryV2Retention {
  return {
    expiresAt: input?.expiresAt ?? null,
    ttlDays: input?.ttlDays ?? null,
    retainUntilExplicitlyDeleted: input?.retainUntilExplicitlyDeleted ?? true,
  };
}

function createRedaction(input: {
  title: string;
  summary: string;
  override?: Partial<MemoryV2Redaction>;
}): MemoryV2Redaction {
  const preview = safeMemoryV2Preview(`${input.title} ${input.summary}`);

  return {
    redacted: input.override?.redacted ?? true,
    redactionVersion: MEMORY_V2_REDACTION_VERSION,
    removedKinds: mergeRemovedKinds(preview.removedKinds, input.override?.removedKinds),
    containsRawIdentity: input.override?.containsRawIdentity ?? preview.containsRawIdentity,
    containsSecrets: input.override?.containsSecrets ?? preview.containsSecrets,
    safePreview: input.override?.safePreview ?? preview.text,
  };
}

export function rebuildMemoryV2Indexes(entries: MemoryV2Entry[]): MemoryV2Indexes {
  const indexes: MemoryV2Indexes = {
    byProjectId: {},
    byTag: {},
    byType: {},
  };

  for (const entry of entries) {
    indexes.byProjectId[entry.projectScope.projectId] ??= [];
    indexes.byProjectId[entry.projectScope.projectId]?.push(entry.id);

    indexes.byType[entry.type] ??= [];
    indexes.byType[entry.type]?.push(entry.id);

    for (const rawTag of entry.tags) {
      const tag = normalizeTag(rawTag);
      if (!tag) {
        continue;
      }
      indexes.byTag[tag] ??= [];
      indexes.byTag[tag]?.push(entry.id);
    }
  }

  return indexes;
}

export async function readMemoryV2Store(): Promise<MemoryV2StoreData> {
  try {
    const raw = await readFile(MEMORY_V2_FILE, "utf-8");
    const parsed = JSON.parse(raw) as MemoryV2StoreData;

    if (parsed.version !== MEMORY_V2_STORE_VERSION || !Array.isArray(parsed.entries)) {
      return { ...EMPTY_STORE, indexes: { ...EMPTY_INDEXES } };
    }

    return {
      version: MEMORY_V2_STORE_VERSION,
      entries: parsed.entries,
      indexes: rebuildMemoryV2Indexes(parsed.entries),
      lastUpdatedAt: parsed.lastUpdatedAt ?? null,
    };
  } catch {
    return { ...EMPTY_STORE, indexes: { ...EMPTY_INDEXES } };
  }
}

export async function writeMemoryV2Store(store: MemoryV2StoreData): Promise<boolean> {
  try {
    const normalized: MemoryV2StoreData = {
      version: MEMORY_V2_STORE_VERSION,
      entries: store.entries.slice(-MAX_MEMORY_V2_ENTRIES),
      indexes: rebuildMemoryV2Indexes(store.entries.slice(-MAX_MEMORY_V2_ENTRIES)),
      lastUpdatedAt: store.lastUpdatedAt ?? new Date().toISOString(),
    };

    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(MEMORY_V2_FILE, JSON.stringify(normalized, null, 2), "utf-8");
    return true;
  } catch (err) {
    logger.warn("Memory V2 write failed — continuing without persistence", {
      error: String(err),
    });
    return false;
  }
}

export async function appendMemoryV2Entry(
  input: AppendMemoryV2EntryInput,
): Promise<{ entry: MemoryV2Entry; persisted: boolean }> {
  const createdAt = input.createdAt ?? new Date().toISOString();
  const projectScope = await createMemoryV2ProjectScope(input.projectRoot);
  const redactedTitle = safeMemoryV2Preview(input.title, 160).text;
  const redactedSummary = safeMemoryV2Preview(input.summary, 600).text;

  const entry: MemoryV2Entry = {
    id: generateMemoryV2Id(),
    schemaVersion: MEMORY_V2_ENTRY_SCHEMA_VERSION,
    createdAt,
    updatedAt: createdAt,
    projectScope,
    type: input.type,
    title: redactedTitle,
    summary: redactedSummary,
    tags: (input.tags ?? []).map(normalizeTag).filter((tag) => tag.length > 0),
    source: input.source,
    links: mergeLinks(input.links),
    privacy: createPrivacy(input.privacy),
    redaction: createRedaction({
      title: input.title,
      summary: input.summary,
      ...(input.redaction ? { override: input.redaction } : {}),
    }),
    retention: createRetention(input.retention),
    priority: input.priority ?? "medium",
    confidence: input.confidence ?? "medium",
  };

  const store = await readMemoryV2Store();
  store.entries.push(entry);
  store.lastUpdatedAt = createdAt;
  const persisted = await writeMemoryV2Store(store);

  return { entry, persisted };
}

export async function getMemoryV2ForProject(
  project: ProjectIdentity | string,
): Promise<MemoryV2Entry[]> {
  const projectId = typeof project === "string" ? project : project.projectId;
  const store = await readMemoryV2Store();
  return store.entries.filter((entry) => entry.projectScope.projectId === projectId);
}

export function getMemoryV2Path(): string {
  return MEMORY_V2_FILE;
}
