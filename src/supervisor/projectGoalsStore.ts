import { mkdir, readFile, writeFile } from "fs/promises";
import { homedir } from "os";
import { join } from "path";
import { logger } from "../observability/logger.js";
import { deriveProjectIdentity } from "./projectIdentity.js";
import {
  SUPERVISOR_GOALS_STORE_VERSION,
  type ProjectGoal,
  type ProjectGoalsState,
  type ProjectIdentity,
  type SupervisorGoalsStoreData,
} from "./types.js";

const DATA_DIR = join(homedir(), ".orquestador-prime");
const SUPERVISOR_GOALS_FILE = join(DATA_DIR, "supervisor-goals.json");

const EMPTY_STORE: SupervisorGoalsStoreData = {
  version: SUPERVISOR_GOALS_STORE_VERSION,
  projects: {},
};

function emptyProjectGoalsState(identity: ProjectIdentity, now: string): ProjectGoalsState {
  return {
    projectId: identity.projectId,
    projectName: identity.projectName,
    projectRootHash: identity.projectRootHash,
    createdAt: now,
    updatedAt: now,
    goals: [],
  };
}

function cloneGoal(goal: ProjectGoal): ProjectGoal {
  return {
    id: goal.id,
    title: goal.title,
    description: goal.description,
    status: goal.status,
    priority: goal.priority,
    source: goal.source,
    createdAt: goal.createdAt,
    updatedAt: goal.updatedAt,
    ...(goal.targetPhase ? { targetPhase: goal.targetPhase } : {}),
    successCriteria: goal.successCriteria.slice(),
    blockers: goal.blockers.slice(),
    riskNotes: goal.riskNotes.slice(),
    privacyLabel: goal.privacyLabel,
    links: {
      traceIds: goal.links.traceIds.slice(),
      proposalIds: goal.links.proposalIds.slice(),
      docs: goal.links.docs.slice(),
    },
  };
}

function cloneProjectGoalsState(state: ProjectGoalsState): ProjectGoalsState {
  return {
    projectId: state.projectId,
    projectName: state.projectName,
    projectRootHash: state.projectRootHash,
    createdAt: state.createdAt,
    updatedAt: state.updatedAt,
    goals: state.goals.map(cloneGoal),
  };
}

export async function readSupervisorGoalsStore(): Promise<SupervisorGoalsStoreData> {
  try {
    const raw = await readFile(SUPERVISOR_GOALS_FILE, "utf-8");
    const parsed = JSON.parse(raw) as SupervisorGoalsStoreData;
    if (parsed.version !== SUPERVISOR_GOALS_STORE_VERSION || typeof parsed.projects !== "object" || parsed.projects === null) {
      return { ...EMPTY_STORE, projects: {} };
    }
    return parsed;
  } catch {
    return { ...EMPTY_STORE, projects: {} };
  }
}

export async function writeSupervisorGoalsStore(
  store: SupervisorGoalsStoreData,
): Promise<boolean> {
  try {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(SUPERVISOR_GOALS_FILE, JSON.stringify(store, null, 2), "utf-8");
    return true;
  } catch (err) {
    logger.warn("supervisor goals store write failed — continuing without persistence", {
      error: String(err),
    });
    return false;
  }
}

export async function getProjectGoalsState(
  projectRoot = process.cwd(),
): Promise<ProjectGoalsState> {
  const identity = deriveProjectIdentity(projectRoot);
  const store = await readSupervisorGoalsStore();
  const existing = store.projects[identity.projectId];

  if (existing && existing.projectRootHash === identity.projectRootHash) {
    return cloneProjectGoalsState(existing);
  }

  return emptyProjectGoalsState(identity, new Date().toISOString());
}

export async function saveProjectGoalsState(
  state: ProjectGoalsState,
): Promise<boolean> {
  const store = await readSupervisorGoalsStore();
  store.projects[state.projectId] = cloneProjectGoalsState(state);
  return writeSupervisorGoalsStore(store);
}

export function getSupervisorGoalsPath(): string {
  return SUPERVISOR_GOALS_FILE;
}
