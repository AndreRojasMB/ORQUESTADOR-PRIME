// src/actions/executionResultStore.ts
// Append-only log of ActionProposal dispatches.
// Location: ~/.orquestador-prime/action-executions.json
// Non-fatal I/O, same pattern as actionStore / trajectoryStore.
// Phase 30A — records every dispatch outcome; never mutates ActionStatus.

import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { homedir } from "os";
import { logger } from "../observability/logger.js";
import type {
  ExecutionResult,
  ExecutionResultStoreData,
} from "./types.js";

// ─── Constants ──────────────────────────────────────────────────

const DATA_DIR = join(homedir(), ".orquestador-prime");
const RESULTS_FILE = join(DATA_DIR, "action-executions.json");
const MAX_RESULTS = 500;

const EMPTY_STORE: ExecutionResultStoreData = {
  version: "1.0",
  results: [],
};

// ─── Store I/O ──────────────────────────────────────────────────

export async function readExecutionResultStore(): Promise<ExecutionResultStoreData> {
  try {
    const raw = await readFile(RESULTS_FILE, "utf-8");
    const parsed = JSON.parse(raw) as ExecutionResultStoreData;
    if (!Array.isArray(parsed.results)) {
      return { ...EMPTY_STORE, results: [] };
    }
    return parsed;
  } catch {
    return { ...EMPTY_STORE, results: [] };
  }
}

async function writeExecutionResultStore(
  store: ExecutionResultStoreData,
): Promise<void> {
  try {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(RESULTS_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    logger.warn("execution-result store write failed — continuing without persistence", {
      error: String(err),
    });
  }
}

// ─── ID generation ──────────────────────────────────────────────

function generateExecutionId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 7);
  return `exec_${ts}_${rand}`;
}

// ─── Append ─────────────────────────────────────────────────────

export interface AppendExecutionResultInput {
  proposalId: string;
  category: ExecutionResult["category"];
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  outcome: ExecutionResult["outcome"];
  ok: boolean;
  message: string;
  output: unknown;
  actor: string;
}

export async function appendExecutionResult(
  input: AppendExecutionResultInput,
): Promise<ExecutionResult> {
  const result: ExecutionResult = {
    id: generateExecutionId(),
    proposalId: input.proposalId,
    category: input.category,
    startedAt: input.startedAt,
    finishedAt: input.finishedAt,
    durationMs: input.durationMs,
    outcome: input.outcome,
    ok: input.ok,
    message: input.message,
    output: input.output,
    actor: input.actor,
  };

  const store = await readExecutionResultStore();
  store.results.push(result);

  if (store.results.length > MAX_RESULTS) {
    store.results = store.results.slice(-MAX_RESULTS);
  }

  await writeExecutionResultStore(store);
  logger.info("execution-result appended", {
    id: result.id,
    proposalId: result.proposalId,
    outcome: result.outcome,
    ok: result.ok,
  });

  return result;
}

// ─── Queries ────────────────────────────────────────────────────

export async function getResultsByProposalId(
  proposalId: string,
): Promise<ExecutionResult[]> {
  const store = await readExecutionResultStore();
  return store.results.filter((r) => r.proposalId === proposalId);
}

export async function hasSuccessfulExecution(
  proposalId: string,
): Promise<boolean> {
  const results = await getResultsByProposalId(proposalId);
  return results.some((r) => r.outcome === "success" && r.ok);
}

export async function getRecentResults(n = 10): Promise<ExecutionResult[]> {
  const store = await readExecutionResultStore();
  return store.results.slice(-n);
}

// ─── Store path ─────────────────────────────────────────────────

export function getExecutionResultsPath(): string {
  return RESULTS_FILE;
}
