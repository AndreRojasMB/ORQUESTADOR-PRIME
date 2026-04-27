import type { RedactionMetadata } from "../privacy/redactionEngine.js";

export const WORKSPACE_STORE_VERSION = "1.0";

export type WorkspaceItemStatus =
  | "planned"
  | "active"
  | "blocked"
  | "done"
  | "deferred"
  | "dropped";

export type WorkspaceDecisionStatus = "active" | "superseded" | "reversed";

export type WorkspacePriority = "low" | "medium" | "high";

export type WorkspaceRiskLevel = "low" | "medium" | "high";

export type WorkspaceConfidence = "low" | "medium" | "high";

export type WorkspaceFactSource =
  | "manual"
  | "supervisor"
  | "memory"
  | "multi-agent"
  | "docs";

export type WorkspaceContextEntryKind =
  | "module"
  | "script"
  | "docs"
  | "config"
  | "test"
  | "store"
  | "dashboard"
  | "other";

export type WorkspaceContextMapSource =
  | "manual"
  | "scan"
  | "audit"
  | "supervisor";

export interface WorkspaceLinks {
  traceIds: string[];
  multiAgentTraceIds: string[];
  proposalIds: string[];
  jobIds: string[];
  memoryIds: string[];
  docs: string[];
}

export interface WorkspaceRoadmapItem {
  phaseId: string;
  title: string;
  status: WorkspaceItemStatus;
  priority: WorkspacePriority;
  summary: string;
  successCriteria: string[];
  blockers: string[];
  dependsOn: string[];
  links: WorkspaceLinks;
  createdAt: string;
  updatedAt: string;
  redaction: RedactionMetadata;
}

export interface WorkspaceDecision {
  decisionId: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  context: string;
  decision: string;
  alternatives: string[];
  rationale: string;
  consequences: string[];
  status: WorkspaceDecisionStatus;
  links: WorkspaceLinks;
  redaction: RedactionMetadata;
}

export interface WorkspaceContextEntry {
  entryId: string;
  path: string;
  kind: WorkspaceContextEntryKind;
  ownerArea: string;
  summary: string;
  tags: string[];
  riskLevel: WorkspaceRiskLevel;
  lastObservedAt: string;
  links: WorkspaceLinks;
  redaction: RedactionMetadata;
}

export interface WorkspaceContextMap {
  mapId: string;
  generatedAt: string;
  source: WorkspaceContextMapSource;
  entries: WorkspaceContextEntry[];
}

export interface WorkspaceFact {
  factId: string;
  key: string;
  value: string;
  confidence: WorkspaceConfidence;
  source: WorkspaceFactSource;
  tags: string[];
  links: WorkspaceLinks;
  createdAt: string;
  updatedAt: string;
  redaction: RedactionMetadata;
}

export interface WorkspaceRisk {
  riskId: string;
  title: string;
  summary: string;
  riskLevel: WorkspaceRiskLevel;
  status: WorkspaceItemStatus;
  links: WorkspaceLinks;
  createdAt: string;
  updatedAt: string;
  redaction: RedactionMetadata;
}

export interface WorkspaceProject {
  projectId: string;
  projectName: string;
  projectRootHash: string;
  createdAt: string;
  updatedAt: string;
  roadmap: WorkspaceRoadmapItem[];
  decisions: WorkspaceDecision[];
  facts: WorkspaceFact[];
  contextMap: WorkspaceContextMap;
  risks: WorkspaceRisk[];
  links: WorkspaceLinks;
  redaction: RedactionMetadata;
}

export interface WorkspaceStoreData {
  version: typeof WORKSPACE_STORE_VERSION;
  projects: Record<string, WorkspaceProject>;
  lastUpdatedAt: string | null;
}

export interface WorkspaceSummary {
  version: typeof WORKSPACE_STORE_VERSION;
  generatedAt: string;
  project: {
    projectId: string;
    projectName: string;
    projectRootHash: string;
    initialized: boolean;
  };
  counts: {
    roadmap: number;
    decisions: number;
    facts: number;
    contextEntries: number;
    risks: number;
    docs: number;
    traceIds: number;
    multiAgentTraceIds: number;
    proposalIds: number;
    jobIds: number;
    memoryIds: number;
  };
  activeRoadmap: Array<{
    phaseId: string;
    title: string;
    status: WorkspaceItemStatus;
    priority: WorkspacePriority;
    blockerCount: number;
  }>;
  recentDecisions: Array<{
    decisionId: string;
    title: string;
    status: WorkspaceDecisionStatus;
    createdAt: string;
  }>;
  recentContextEntries: Array<{
    entryId: string;
    path: string;
    kind: WorkspaceContextEntryKind;
    tags: string[];
    riskLevel: WorkspaceRiskLevel;
  }>;
}

export interface InitWorkspaceProjectResult {
  project: WorkspaceProject;
  created: boolean;
  persisted: boolean;
}

export interface AppendWorkspaceDecisionInput {
  title: string;
  context: string;
  decision: string;
  alternatives?: string[];
  rationale?: string;
  consequences?: string[];
  links?: Partial<WorkspaceLinks>;
  projectRoot?: string;
}

export interface AppendWorkspaceContextEntryInput {
  path: string;
  kind: WorkspaceContextEntryKind;
  summary: string;
  ownerArea?: string;
  tags?: string[];
  riskLevel?: WorkspaceRiskLevel;
  links?: Partial<WorkspaceLinks>;
  projectRoot?: string;
}
