// src/actions/repoActionExecutor.ts
// Phase 32A — preview-only executor for repo-mutating ActionProposals.
//
// This module NEVER mutates the repo in 32A:
//   - no file writes
//   - no branch creation
//   - no commits
//   - no push
//   - no PR creation
//
// Typed zod validators reject loose parameter shapes before any work.
// GitClient is used read-only. src/execution/proposalWriter,
// gitClient.commitFiles/pushBranch/createAgentBranch and
// githubClient.createPullRequest are NOT imported here.

import { readFile, stat } from "fs/promises";
import { join, resolve } from "path";
import { z } from "zod";
import { simpleGit } from "simple-git";
import { GITHUB_CONFIG } from "../config.js";
import { logger } from "../observability/logger.js";
import { GitClient } from "../execution/gitClient.js";
import type { ActionProposal } from "./types.js";

// ─── Zod schemas ────────────────────────────────────────────────

const FileWriteEntrySchema = z.object({
  path: z.string().min(1),
  operation: z.enum(["create", "modify"]),
  content: z.string(),
  reason: z.string().min(1),
});

const FileWriteParamsSchema = z.object({
  files: z.array(FileWriteEntrySchema).min(1),
  commitMessage: z.string().min(1),
});

const GitBranchParamsSchema = z.object({
  name: z.string().regex(/^agent\/[a-z0-9][a-z0-9-]*$/),
  from: z.string().optional(),
});

const PrCreateParamsSchema = z.object({
  title: z.string().min(1).max(72),
  body: z.string().min(1),
  head: z.string().regex(/^agent\/[a-z0-9][a-z0-9-]*$/),
  base: z.enum(["dev", "develop"]).default("dev"),
  draft: z.boolean().default(true),
});

// ─── Preview result shape ───────────────────────────────────────

export type PreviewKind = "file-write" | "git-branch" | "pr-create";

export interface PreviewResult {
  ok: boolean;
  kind: PreviewKind;
  message: string;
  preview: unknown;
  warnings: string[];
  rollbackPlan: string;
}

// ─── Helpers ────────────────────────────────────────────────────

const DIFF_LIMIT_PER_FILE = 2048;

function validationFailure(
  kind: PreviewKind,
  reason: string,
  rollbackPlan: string,
): PreviewResult {
  return {
    ok: false,
    kind,
    message: `Invalid parameters: ${reason}`,
    preview: null,
    warnings: [],
    rollbackPlan,
  };
}

async function pathExists(p: string): Promise<boolean> {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

function minimalDiff(oldText: string, newText: string): string {
  // Intentionally minimal — we do not pull a diff library. This renders
  // a compact, line-count summary; good enough for preview dispatch.
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");
  const header = `--- current (${oldLines.length} lines)\n+++ proposed (${newLines.length} lines)`;
  const sample: string[] = [];
  const max = Math.min(Math.max(oldLines.length, newLines.length), 6);
  for (let i = 0; i < max; i++) {
    const o = oldLines[i] ?? "";
    const n = newLines[i] ?? "";
    if (o === n) {
      sample.push(`  ${o}`);
    } else {
      sample.push(`- ${o}`);
      sample.push(`+ ${n}`);
    }
  }
  const body = sample.join("\n");
  const truncated = body.length > DIFF_LIMIT_PER_FILE
    ? body.slice(0, DIFF_LIMIT_PER_FILE) + "\n…[truncated]"
    : body;
  return `${header}\n${truncated}`;
}

// ─── file-write preview ─────────────────────────────────────────

interface FileWriteFilePreview {
  path: string;
  operation: "create" | "modify";
  existsOnDisk: boolean;
  byteCount: number;
  reason: string;
  diff?: string;
  warning?: string;
}

export async function previewFileWrite(
  proposal: ActionProposal,
  repoRoot: string = process.cwd(),
): Promise<PreviewResult> {
  const parsed = FileWriteParamsSchema.safeParse(proposal.parameters);
  const rollbackPlan =
    "Revert by dropping the agent/* branch created at real-execution time (`git branch -D <branch>`). Preview did not mutate the working tree.";

  if (!parsed.success) {
    return validationFailure("file-write", parsed.error.message, rollbackPlan);
  }

  const root = resolve(repoRoot);
  const warnings: string[] = [];
  const filesPreview: FileWriteFilePreview[] = [];

  for (const f of parsed.data.files) {
    // Reject path escape attempts. A safe preview still guards on paths.
    if (f.path.startsWith("/") || f.path.includes("..")) {
      warnings.push(`Rejected path (absolute or traversal): ${f.path}`);
      continue;
    }
    const fullPath = join(root, f.path);
    const exists = await pathExists(fullPath);
    const entry: FileWriteFilePreview = {
      path: f.path,
      operation: f.operation,
      existsOnDisk: exists,
      byteCount: Buffer.byteLength(f.content, "utf-8"),
      reason: f.reason,
    };
    if (f.operation === "create" && exists) {
      entry.warning = "create requested but path already exists";
      warnings.push(`${f.path}: ${entry.warning}`);
    }
    if (f.operation === "modify" && !exists) {
      entry.warning = "modify requested but path does not exist";
      warnings.push(`${f.path}: ${entry.warning}`);
    }
    if (f.operation === "modify" && exists) {
      try {
        const current = await readFile(fullPath, "utf-8");
        entry.diff = minimalDiff(current, f.content);
      } catch (err) {
        entry.warning = `could not read for diff: ${err instanceof Error ? err.message : String(err)}`;
        warnings.push(`${f.path}: ${entry.warning}`);
      }
    }
    filesPreview.push(entry);
  }

  logger.info("action:preview file-write", {
    proposalId: proposal.id,
    fileCount: filesPreview.length,
    warnings: warnings.length,
  });

  return {
    ok: true,
    kind: "file-write",
    message: `Would write ${filesPreview.length} file(s) on a fresh agent/* branch`,
    preview: {
      repoRoot: root,
      commitMessage: parsed.data.commitMessage,
      files: filesPreview,
    },
    warnings,
    rollbackPlan,
  };
}

// ─── git-branch preview ─────────────────────────────────────────

const PROTECTED_BRANCHES = new Set(["main", "master", "dev", "develop", "staging"]);

export async function previewGitBranch(
  proposal: ActionProposal,
  repoRoot: string = process.cwd(),
): Promise<PreviewResult> {
  const parsed = GitBranchParamsSchema.safeParse(proposal.parameters);
  const rollbackPlan =
    "Delete the branch once it has been created (at real execution time): `git branch -D <branch>`. Preview did not touch git state.";

  if (!parsed.success) {
    return validationFailure("git-branch", parsed.error.message, rollbackPlan);
  }

  const warnings: string[] = [];
  const git = simpleGit(resolve(repoRoot));

  let currentBranch = "";
  let clean = false;
  try {
    const status = await git.status();
    clean = status.isClean();
    currentBranch = (await git.revparse(["--abbrev-ref", "HEAD"])).trim();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    warnings.push(`git read failed: ${msg}`);
  }

  if (!clean) {
    warnings.push("Repository is not clean — real execution would refuse to start");
  }

  const from = parsed.data.from ?? currentBranch;
  if (from && PROTECTED_BRANCHES.has(from)) {
    // Basing on a protected branch is fine (agent/* is new); just note it.
    warnings.push(`Base branch is protected (${from}) — new branch stays off protected history`);
  }

  const tsSuffix = Date.now().toString(36);
  const wouldCreate = `${parsed.data.name}-${tsSuffix}`;

  logger.info("action:preview git-branch", {
    proposalId: proposal.id,
    wouldCreate,
    from,
  });

  return {
    ok: true,
    kind: "git-branch",
    message: `Would create branch "${wouldCreate}" from "${from || "HEAD"}"`,
    preview: {
      wouldCreate,
      from,
      currentBranch,
      cleanRepo: clean,
    },
    warnings,
    rollbackPlan,
  };
}

// ─── pr-create preview ──────────────────────────────────────────

export async function previewPrCreate(
  proposal: ActionProposal,
  repoRoot: string = process.cwd(),
): Promise<PreviewResult> {
  const parsed = PrCreateParamsSchema.safeParse(proposal.parameters);
  const rollbackPlan =
    "If a PR is later opened, close it (GitHub UI or `gh pr close <number>`) and delete the agent/* branch.";

  if (!parsed.success) {
    return validationFailure("pr-create", parsed.error.message, rollbackPlan);
  }

  const warnings: string[] = [];

  const githubReady = Boolean(
    GITHUB_CONFIG.token && GITHUB_CONFIG.owner && GITHUB_CONFIG.repo,
  );
  if (!githubReady) {
    warnings.push(
      "GitHub integration not configured (token/owner/repo missing); real PR creation would fail",
    );
  }

  const git = simpleGit(resolve(repoRoot));
  let headExists = false;
  let commitsAhead: number | null = null;
  try {
    await git.revparse([parsed.data.head]);
    headExists = true;
  } catch {
    warnings.push(`Head branch "${parsed.data.head}" does not exist locally`);
  }

  if (headExists) {
    try {
      const log = await git.raw(["log", "--oneline", `${parsed.data.base}..${parsed.data.head}`]);
      commitsAhead = log.split("\n").filter((l) => l.trim().length > 0).length;
      if (commitsAhead === 0) {
        warnings.push(`No commits on ${parsed.data.head} ahead of ${parsed.data.base}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      warnings.push(`git log ${parsed.data.base}..${parsed.data.head} failed: ${msg}`);
    }
  }

  const compareUrl = githubReady
    ? `https://github.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/compare/${parsed.data.base}...${parsed.data.head}`
    : null;

  logger.info("action:preview pr-create", {
    proposalId: proposal.id,
    head: parsed.data.head,
    base: parsed.data.base,
    draft: parsed.data.draft,
  });

  return {
    ok: true,
    kind: "pr-create",
    message: `Would open ${parsed.data.draft ? "draft " : ""}PR from ${parsed.data.head} into ${parsed.data.base}`,
    preview: {
      title: parsed.data.title,
      body: parsed.data.body,
      head: parsed.data.head,
      base: parsed.data.base,
      draft: parsed.data.draft,
      githubReady,
      headExistsLocally: headExists,
      commitsAhead,
      compareUrl,
    },
    warnings,
    rollbackPlan,
  };
}

// ─── real git-branch execution (Phase 32B) ──────────────────────
// The ONLY real repo-mutating entry point in src/actions/*.
// executionBridge routes here only after:
//   - ACTIONS_REAL_EXECUTION_ENABLED=true
//   - REAL_EXEC_CATEGORIES contains "git-branch"
//   - proposal.status === "approved"
//   - no prior successful execution for this proposal
//   - a second approval has been consumed (single-use, TTL, hash-bound)
// This function still enforces its own invariants independently.

export interface RealGitBranchResult {
  ok: boolean;
  message: string;
  branchName: string | null;
  fromBranch: string | null;
  warnings: string[];
  rollbackPlan: string;
}

export async function realGitBranch(
  proposal: ActionProposal,
  repoRoot: string = process.cwd(),
): Promise<RealGitBranchResult> {
  const baseRollback =
    "Delete the created branch: `git branch -D <branchName>` (or `git checkout <fromBranch> && git branch -D <branchName>` if currently on it).";

  const parsed = GitBranchParamsSchema.safeParse(proposal.parameters);
  if (!parsed.success) {
    return {
      ok: false,
      message: `Invalid parameters: ${parsed.error.message}`,
      branchName: null,
      fromBranch: null,
      warnings: [],
      rollbackPlan: baseRollback,
    };
  }

  // Defense-in-depth: the regex already rejects protected names, but
  // re-assert here so a future regex relaxation cannot silently bypass it.
  const paramName = parsed.data.name;
  const prefix = "agent/";
  if (!paramName.startsWith(prefix)) {
    return {
      ok: false,
      message: `Branch name must start with "agent/"`,
      branchName: null,
      fromBranch: null,
      warnings: [],
      rollbackPlan: baseRollback,
    };
  }
  const suffix = paramName.slice(prefix.length);
  if (PROTECTED_BRANCHES.has(paramName) || PROTECTED_BRANCHES.has(suffix)) {
    return {
      ok: false,
      message: `Refusing to create a protected branch name`,
      branchName: null,
      fromBranch: null,
      warnings: [],
      rollbackPlan: baseRollback,
    };
  }

  const root = resolve(repoRoot);
  const git = new GitClient(root);

  let fromBranch: string | null = null;
  try {
    fromBranch = await git.getCurrentBranch();
  } catch {
    // non-fatal for reporting; createAgentBranch will error clearly below
  }

  try {
    await git.assertCleanRepo();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      message: `Refusing to create branch: ${msg}`,
      branchName: null,
      fromBranch,
      warnings: [],
      rollbackPlan: baseRollback,
    };
  }

  let branchName: string;
  try {
    branchName = await git.createAgentBranch(suffix);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.warn("action:real git-branch create failed", {
      proposalId: proposal.id,
      suffix,
      error: msg,
    });
    return {
      ok: false,
      message: `createAgentBranch failed: ${msg}`,
      branchName: null,
      fromBranch,
      warnings: [],
      rollbackPlan: baseRollback,
    };
  }

  logger.info("action:real git-branch created", {
    proposalId: proposal.id,
    branchName,
    fromBranch,
  });

  return {
    ok: true,
    message: `Created branch "${branchName}" from "${fromBranch ?? "HEAD"}"`,
    branchName,
    fromBranch,
    warnings: [],
    rollbackPlan: `git branch -D ${branchName}`,
  };
}
