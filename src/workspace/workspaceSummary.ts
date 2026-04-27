import { deriveProjectIdentity } from "../supervisor/projectIdentity.js";
import { getCurrentWorkspaceProject } from "./workspaceStore.js";
import {
  WORKSPACE_STORE_VERSION,
  type WorkspaceProject,
  type WorkspaceSummary,
} from "./types.js";

function counts(project: WorkspaceProject | null): WorkspaceSummary["counts"] {
  const links = project?.links;
  return {
    roadmap: project?.roadmap.length ?? 0,
    decisions: project?.decisions.length ?? 0,
    facts: project?.facts.length ?? 0,
    contextEntries: project?.contextMap.entries.length ?? 0,
    risks: project?.risks.length ?? 0,
    docs: links?.docs.length ?? 0,
    traceIds: links?.traceIds.length ?? 0,
    multiAgentTraceIds: links?.multiAgentTraceIds.length ?? 0,
    proposalIds: links?.proposalIds.length ?? 0,
    jobIds: links?.jobIds.length ?? 0,
    memoryIds: links?.memoryIds.length ?? 0,
  };
}

export async function buildWorkspaceSummary(
  projectRoot = process.cwd(),
): Promise<WorkspaceSummary> {
  const identity = deriveProjectIdentity(projectRoot);
  const project = await getCurrentWorkspaceProject(projectRoot);

  return {
    version: WORKSPACE_STORE_VERSION,
    generatedAt: new Date().toISOString(),
    project: {
      projectId: identity.projectId,
      projectName: identity.projectName,
      projectRootHash: identity.projectRootHash,
      initialized: project !== null,
    },
    counts: counts(project),
    activeRoadmap: (project?.roadmap ?? [])
      .filter((item) => item.status === "active" || item.status === "blocked")
      .slice(-10)
      .map((item) => ({
        phaseId: item.phaseId,
        title: item.title,
        status: item.status,
        priority: item.priority,
        blockerCount: item.blockers.length,
      })),
    recentDecisions: (project?.decisions ?? []).slice(-10).map((decision) => ({
      decisionId: decision.decisionId,
      title: decision.title,
      status: decision.status,
      createdAt: decision.createdAt,
    })),
    recentContextEntries: (project?.contextMap.entries ?? []).slice(-10).map((entry) => ({
      entryId: entry.entryId,
      path: entry.path,
      kind: entry.kind,
      tags: entry.tags.slice(),
      riskLevel: entry.riskLevel,
    })),
  };
}
