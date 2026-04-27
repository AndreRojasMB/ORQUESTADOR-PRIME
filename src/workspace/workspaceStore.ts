import { mkdir, readFile, writeFile } from "fs/promises";
import { homedir } from "os";
import { isAbsolute, join } from "path";
import { logger } from "../observability/logger.js";
import {
  redactString,
  type RedactionMetadata,
} from "../privacy/redactionEngine.js";
import { deriveProjectIdentity } from "../supervisor/projectIdentity.js";
import type { ProjectIdentity } from "../supervisor/types.js";
import {
  WORKSPACE_STORE_VERSION,
  type AppendWorkspaceContextEntryInput,
  type AppendWorkspaceDecisionInput,
  type InitWorkspaceProjectResult,
  type WorkspaceContextEntry,
  type WorkspaceContextEntryKind,
  type WorkspaceContextMap,
  type WorkspaceDecision,
  type WorkspaceLinks,
  type WorkspaceProject,
  type WorkspaceRiskLevel,
  type WorkspaceStoreData,
} from "./types.js";

const DATA_DIR = join(homedir(), ".orquestador-prime");
const WORKSPACE_FILE = join(DATA_DIR, "workspaces.json");

const EMPTY_STORE: WorkspaceStoreData = {
  version: WORKSPACE_STORE_VERSION,
  projects: {},
  lastUpdatedAt: null,
};

function emptyMetadata(): RedactionMetadata {
  return {
    removedKinds: [],
    containsSecrets: false,
    containsRawIdentity: false,
    containsRawBody: false,
    containsFileContent: false,
    truncated: false,
    redactionVersion: "1.0",
  };
}

function mergeMetadata(items: RedactionMetadata[]): RedactionMetadata {
  return {
    removedKinds: [...new Set(items.flatMap((item) => item.removedKinds))].sort(),
    containsSecrets: items.some((item) => item.containsSecrets),
    containsRawIdentity: items.some((item) => item.containsRawIdentity),
    containsRawBody: items.some((item) => item.containsRawBody),
    containsFileContent: items.some((item) => item.containsFileContent),
    truncated: items.some((item) => item.truncated),
    redactionVersion: "1.0",
  };
}

function generateId(prefix: string): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${ts}_${rand}`;
}

function emptyLinks(): WorkspaceLinks {
  return {
    traceIds: [],
    multiAgentTraceIds: [],
    proposalIds: [],
    jobIds: [],
    memoryIds: [],
    docs: [],
  };
}

function uniq(values: string[] | undefined): string[] {
  return [...new Set((values ?? []).map((item) => item.trim()).filter(Boolean))].sort();
}

function mergeLinks(input?: Partial<WorkspaceLinks>): WorkspaceLinks {
  return {
    traceIds: uniq(input?.traceIds),
    multiAgentTraceIds: uniq(input?.multiAgentTraceIds),
    proposalIds: uniq(input?.proposalIds),
    jobIds: uniq(input?.jobIds),
    memoryIds: uniq(input?.memoryIds),
    docs: uniq(input?.docs),
  };
}

function normalizeTags(values: string[] | undefined): string[] {
  return uniq(
    values?.map((tag) =>
      tag.toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, ""),
    ),
  );
}

function redactText(value: string, maxLength: number): { text: string; metadata: RedactionMetadata } {
  const result = redactString(value, { maxLength });
  return {
    text: result.safePreview,
    metadata: result.metadata,
  };
}

function redactTextList(values: string[] | undefined, maxLength: number): {
  values: string[];
  metadata: RedactionMetadata;
} {
  const redacted = (values ?? []).map((value) => redactText(value, maxLength));
  return {
    values: redacted.map((item) => item.text).filter((value) => value.length > 0),
    metadata: mergeMetadata(redacted.map((item) => item.metadata)),
  };
}

function assertRepoRelativePath(path: string): string {
  const normalized = path.trim().replace(/\\/g, "/");

  if (!normalized) {
    throw new Error("workspace context path is required");
  }
  if (isAbsolute(normalized) || normalized.startsWith("~/")) {
    throw new Error("workspace context path must be repo-relative");
  }
  if (normalized.includes("..")) {
    throw new Error("workspace context path cannot contain parent traversal");
  }
  if (/^[a-zA-Z]:\//.test(normalized)) {
    throw new Error("workspace context path must not be an absolute Windows path");
  }

  return normalized;
}

function emptyContextMap(now: string): WorkspaceContextMap {
  return {
    mapId: generateId("wmap"),
    generatedAt: now,
    source: "manual",
    entries: [],
  };
}

function emptyProject(identity: ProjectIdentity, now: string): WorkspaceProject {
  return {
    projectId: identity.projectId,
    projectName: identity.projectName,
    projectRootHash: identity.projectRootHash,
    createdAt: now,
    updatedAt: now,
    roadmap: [],
    decisions: [],
    facts: [],
    contextMap: emptyContextMap(now),
    risks: [],
    links: emptyLinks(),
    redaction: emptyMetadata(),
  };
}

function cloneLinks(links: WorkspaceLinks): WorkspaceLinks {
  return {
    traceIds: links.traceIds.slice(),
    multiAgentTraceIds: links.multiAgentTraceIds.slice(),
    proposalIds: links.proposalIds.slice(),
    jobIds: links.jobIds.slice(),
    memoryIds: links.memoryIds.slice(),
    docs: links.docs.slice(),
  };
}

function cloneMetadata(metadata: RedactionMetadata): RedactionMetadata {
  return {
    removedKinds: metadata.removedKinds.slice(),
    containsSecrets: metadata.containsSecrets,
    containsRawIdentity: metadata.containsRawIdentity,
    containsRawBody: metadata.containsRawBody,
    containsFileContent: metadata.containsFileContent,
    truncated: metadata.truncated,
    redactionVersion: metadata.redactionVersion,
  };
}

function cloneProject(project: WorkspaceProject): WorkspaceProject {
  return {
    projectId: project.projectId,
    projectName: project.projectName,
    projectRootHash: project.projectRootHash,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    roadmap: project.roadmap.map((item) => ({
      ...item,
      successCriteria: item.successCriteria.slice(),
      blockers: item.blockers.slice(),
      dependsOn: item.dependsOn.slice(),
      links: cloneLinks(item.links),
      redaction: cloneMetadata(item.redaction),
    })),
    decisions: project.decisions.map((decision) => ({
      ...decision,
      alternatives: decision.alternatives.slice(),
      consequences: decision.consequences.slice(),
      links: cloneLinks(decision.links),
      redaction: cloneMetadata(decision.redaction),
    })),
    facts: project.facts.map((fact) => ({
      ...fact,
      tags: fact.tags.slice(),
      links: cloneLinks(fact.links),
      redaction: cloneMetadata(fact.redaction),
    })),
    contextMap: {
      mapId: project.contextMap.mapId,
      generatedAt: project.contextMap.generatedAt,
      source: project.contextMap.source,
      entries: project.contextMap.entries.map((entry) => ({
        ...entry,
        tags: entry.tags.slice(),
        links: cloneLinks(entry.links),
        redaction: cloneMetadata(entry.redaction),
      })),
    },
    risks: project.risks.map((risk) => ({
      ...risk,
      links: cloneLinks(risk.links),
      redaction: cloneMetadata(risk.redaction),
    })),
    links: cloneLinks(project.links),
    redaction: cloneMetadata(project.redaction),
  };
}

function cloneReadableProjects(
  projects: Record<string, WorkspaceProject>,
): Record<string, WorkspaceProject> {
  const readable: Record<string, WorkspaceProject> = {};

  for (const [key, value] of Object.entries(projects)) {
    try {
      readable[key] = cloneProject(value);
    } catch (err) {
      logger.warn("workspace project record skipped during read", {
        projectKey: key,
        error: String(err),
      });
    }
  }

  return readable;
}

export async function readWorkspaceStore(): Promise<WorkspaceStoreData> {
  try {
    const raw = (await readFile(WORKSPACE_FILE, "utf-8")).replace(/^\uFEFF/, "");
    const parsed = JSON.parse(raw) as WorkspaceStoreData;
    if (parsed.version !== WORKSPACE_STORE_VERSION || typeof parsed.projects !== "object" || parsed.projects === null) {
      return { ...EMPTY_STORE, projects: {} };
    }
    return {
      version: WORKSPACE_STORE_VERSION,
      projects: cloneReadableProjects(parsed.projects),
      lastUpdatedAt: parsed.lastUpdatedAt ?? null,
    };
  } catch {
    return { ...EMPTY_STORE, projects: {} };
  }
}

export async function writeWorkspaceStore(store: WorkspaceStoreData): Promise<boolean> {
  try {
    const normalized: WorkspaceStoreData = {
      version: WORKSPACE_STORE_VERSION,
      projects: Object.fromEntries(
        Object.entries(store.projects).map(([key, value]) => [key, cloneProject(value)]),
      ),
      lastUpdatedAt: new Date().toISOString(),
    };
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(WORKSPACE_FILE, JSON.stringify(normalized, null, 2), "utf-8");
    return true;
  } catch (err) {
    logger.warn("workspace store write failed - continuing without persistence", {
      error: String(err),
    });
    return false;
  }
}

export function getWorkspacePath(): string {
  return WORKSPACE_FILE;
}

export async function getCurrentWorkspaceProject(
  projectRoot = process.cwd(),
): Promise<WorkspaceProject | null> {
  const identity = deriveProjectIdentity(projectRoot);
  const store = await readWorkspaceStore();
  const existing = store.projects[identity.projectId];

  if (existing && existing.projectRootHash === identity.projectRootHash) {
    return cloneProject(existing);
  }

  return null;
}

export async function initWorkspaceProject(
  projectRoot = process.cwd(),
): Promise<InitWorkspaceProjectResult> {
  const identity = deriveProjectIdentity(projectRoot);
  const now = new Date().toISOString();
  const store = await readWorkspaceStore();
  const existing = store.projects[identity.projectId];

  if (existing && existing.projectRootHash === identity.projectRootHash) {
    return {
      project: cloneProject(existing),
      created: false,
      persisted: true,
    };
  }

  const project = emptyProject(identity, now);
  store.projects[identity.projectId] = cloneProject(project);
  const persisted = await writeWorkspaceStore(store);

  return {
    project: cloneProject(project),
    created: true,
    persisted,
  };
}

async function getOrCreateProject(projectRoot: string | undefined): Promise<{
  store: WorkspaceStoreData;
  project: WorkspaceProject;
}> {
  const identity = deriveProjectIdentity(projectRoot);
  const store = await readWorkspaceStore();
  const existing = store.projects[identity.projectId];
  const project =
    existing && existing.projectRootHash === identity.projectRootHash
      ? cloneProject(existing)
      : emptyProject(identity, new Date().toISOString());

  return { store, project };
}

export async function appendWorkspaceDecision(
  input: AppendWorkspaceDecisionInput,
): Promise<{ decision: WorkspaceDecision; persisted: boolean }> {
  const { store, project } = await getOrCreateProject(input.projectRoot);
  const now = new Date().toISOString();
  const title = redactText(input.title, 160);
  const context = redactText(input.context, 800);
  const decisionText = redactText(input.decision, 800);
  const rationale = redactText(input.rationale ?? "", 500);
  const alternatives = redactTextList(input.alternatives, 300);
  const consequences = redactTextList(input.consequences, 300);
  const redaction = mergeMetadata([
    title.metadata,
    context.metadata,
    decisionText.metadata,
    rationale.metadata,
    alternatives.metadata,
    consequences.metadata,
  ]);

  const decision: WorkspaceDecision = {
    decisionId: generateId("wdec"),
    createdAt: now,
    updatedAt: now,
    title: title.text,
    context: context.text,
    decision: decisionText.text,
    alternatives: alternatives.values,
    rationale: rationale.text,
    consequences: consequences.values,
    status: "active",
    links: mergeLinks(input.links),
    redaction,
  };

  project.decisions.push(decision);
  project.updatedAt = now;
  project.redaction = mergeMetadata([project.redaction, redaction]);
  store.projects[project.projectId] = cloneProject(project);

  return {
    decision,
    persisted: await writeWorkspaceStore(store),
  };
}

export async function listWorkspaceDecisions(
  projectRoot = process.cwd(),
): Promise<WorkspaceDecision[]> {
  const project = await getCurrentWorkspaceProject(projectRoot);
  return project?.decisions.map((decision) => ({
    ...decision,
    alternatives: decision.alternatives.slice(),
    consequences: decision.consequences.slice(),
    links: cloneLinks(decision.links),
    redaction: cloneMetadata(decision.redaction),
  })) ?? [];
}

function normalizeKind(value: WorkspaceContextEntryKind): WorkspaceContextEntryKind {
  return value;
}

function normalizeRisk(value: WorkspaceRiskLevel | undefined): WorkspaceRiskLevel {
  return value ?? "low";
}

export async function appendWorkspaceContextEntry(
  input: AppendWorkspaceContextEntryInput,
): Promise<{ entry: WorkspaceContextEntry; persisted: boolean }> {
  const { store, project } = await getOrCreateProject(input.projectRoot);
  const now = new Date().toISOString();
  const summary = redactText(input.summary, 500);
  const ownerArea = redactText(input.ownerArea ?? "", 120);
  const entry: WorkspaceContextEntry = {
    entryId: generateId("wctx"),
    path: assertRepoRelativePath(input.path),
    kind: normalizeKind(input.kind),
    ownerArea: ownerArea.text,
    summary: summary.text,
    tags: normalizeTags(input.tags),
    riskLevel: normalizeRisk(input.riskLevel),
    lastObservedAt: now,
    links: mergeLinks(input.links),
    redaction: mergeMetadata([summary.metadata, ownerArea.metadata]),
  };

  project.contextMap.entries.push(entry);
  project.contextMap.generatedAt = now;
  project.updatedAt = now;
  project.redaction = mergeMetadata([project.redaction, entry.redaction]);
  store.projects[project.projectId] = cloneProject(project);

  return {
    entry,
    persisted: await writeWorkspaceStore(store),
  };
}

export async function listWorkspaceContextEntries(input: {
  projectRoot?: string;
  tag?: string | null;
} = {}): Promise<WorkspaceContextEntry[]> {
  const project = await getCurrentWorkspaceProject(input.projectRoot);
  const tag = input.tag?.trim().toLowerCase() ?? null;

  return (
    project?.contextMap.entries
      .filter((entry) => (tag ? entry.tags.includes(tag) : true))
      .map((entry) => ({
        ...entry,
        tags: entry.tags.slice(),
        links: cloneLinks(entry.links),
        redaction: cloneMetadata(entry.redaction),
      })) ?? []
  );
}
