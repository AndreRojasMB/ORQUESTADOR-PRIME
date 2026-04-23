// src/trajectory/trajectoryStore.ts
// Persiste y recupera trajectories en un archivo JSON local.
// Ubicación: ~/.orquestador-prime/trajectories.json
// Patrón: mismo que memoryStore — non-fatal writes, silent on missing file.

import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { homedir } from "os";
import type { TrajectoryStore, Trajectory } from "../types.js";
import { logger } from "../observability/logger.js";

const DATA_DIR = join(homedir(), ".orquestador-prime");
const TRAJECTORY_FILE = join(DATA_DIR, "trajectories.json");
const MAX_TRAJECTORIES = 200;

const EMPTY_STORE: TrajectoryStore = {
  version: "1.0",
  trajectories: [],
};

export async function readTrajectoryStore(): Promise<TrajectoryStore> {
  try {
    const raw = await readFile(TRAJECTORY_FILE, "utf-8");
    return JSON.parse(raw) as TrajectoryStore;
  } catch {
    return { ...EMPTY_STORE, trajectories: [] };
  }
}

async function writeTrajectoryStore(store: TrajectoryStore): Promise<void> {
  try {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(TRAJECTORY_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    logger.warn("Trajectory write failed — continuing without persistence", {
      error: String(err),
    });
  }
}

export async function appendTrajectory(trajectory: Trajectory): Promise<void> {
  const store = await readTrajectoryStore();

  store.trajectories.push(trajectory);

  if (store.trajectories.length > MAX_TRAJECTORIES) {
    store.trajectories = store.trajectories.slice(-MAX_TRAJECTORIES);
  }

  await writeTrajectoryStore(store);
}

export async function getRecentTrajectories(n = 10): Promise<Trajectory[]> {
  const store = await readTrajectoryStore();
  return store.trajectories.slice(-n);
}

export async function getTrajectoryByTraceId(
  traceId: string,
): Promise<Trajectory | undefined> {
  const store = await readTrajectoryStore();
  return store.trajectories.find((t) => t.traceId === traceId);
}
