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

import { readFile, stat, writeFile, mkdir, rename, unlink } from "fs/promises";
import { join, resolve, dirname } from "path";
import { z } from "zod";
import { simpleGit } from "simple-git";
import {
  GITHUB_CONFIG,
  FILE_WRITE_ALLOWED_ROOTS,
  FILE_WRITE_MAX_FILES,
  FILE_WRITE_MAX_BYTES_PER_FILE,
  FILE_WRITE_MAX_TOTAL_BYTES,
  FILE_WRITE_ALLOW_SENSITIVE,
} from "../config.js";
import { logger } from "../observability/logger.js";
import { GitClient } from "../execution/gitClient.js";
import {
  validateFile,
  checkProposalLimits,
  parseAllowedRoots,
  type FileValidation,
  type ProposalLimits,
} from "./safety/fileWriteSafety.js";
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
  // Phase 32C — dual-key escape hatch for lockfile/tsconfig writes.
  // Both this flag AND env FILE_WRITE_ALLOW_SENSITIVE must be set; either
  // alone is insufficient. Defaults to false on omission.
  allowSensitivePaths: z.boolean().optional(),
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

const DIFF_LIMIT_PER_FILE = 8 * 1024;

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
  validation: "ok" | "blocked";
  blockReason: FileValidation["blockReason"];
  blockDetail: string | null;
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

  // Resolve runtime safety limits. Both the proposal flag and the env flag
  // must be true to relax the lockfile/tsconfig denial — either alone is no.
  const allowSensitive =
    Boolean(parsed.data.allowSensitivePaths) && FILE_WRITE_ALLOW_SENSITIVE;
  const limits: ProposalLimits = {
    maxFiles: FILE_WRITE_MAX_FILES,
    maxBytesPerFile: FILE_WRITE_MAX_BYTES_PER_FILE,
    maxTotalBytes: FILE_WRITE_MAX_TOTAL_BYTES,
    allowedRoots: parseAllowedRoots(FILE_WRITE_ALLOWED_ROOTS),
    allowSensitive,
  };

  // Proposal-level cap on file count, evaluated before any per-file work.
  const proposalCheck = checkProposalLimits(
    parsed.data.files.length,
    0,
    limits,
  );
  if (!proposalCheck.ok && proposalCheck.blockReason === "file-count") {
    return {
      ok: false,
      kind: "file-write",
      message: `Rejected: ${proposalCheck.detail}`,
      preview: null,
      warnings: [proposalCheck.detail ?? "file-count cap exceeded"],
      rollbackPlan,
    };
  }

  let totalBytes = 0;
  let blockedCount = 0;

  for (const f of parsed.data.files) {
    const validation = validateFile(f.path, f.content, limits);
    const entry: FileWriteFilePreview = {
      path: f.path,
      operation: f.operation,
      existsOnDisk: false,
      byteCount: validation.byteCount,
      reason: f.reason,
      validation: validation.ok ? "ok" : "blocked",
      blockReason: validation.blockReason,
      blockDetail: validation.detail,
    };

    if (!validation.ok) {
      blockedCount++;
      warnings.push(
        `${f.path}: blocked (${validation.blockReason})${validation.detail ? " — " + validation.detail : ""}`,
      );
      filesPreview.push(entry);
      continue;
    }

    totalBytes += validation.byteCount;

    const fullPath = join(root, f.path);
    entry.existsOnDisk = await pathExists(fullPath);

    if (f.operation === "create" && entry.existsOnDisk) {
      entry.warning = "create requested but path already exists";
      warnings.push(`${f.path}: ${entry.warning}`);
    }
    if (f.operation === "modify" && !entry.existsOnDisk) {
      entry.warning = "modify requested but path does not exist";
      warnings.push(`${f.path}: ${entry.warning}`);
    }
    if (f.operation === "modify" && entry.existsOnDisk) {
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

  // Total-bytes cap evaluated only over files that passed per-file validation.
  const totalsCheck = checkProposalLimits(
    parsed.data.files.length,
    totalBytes,
    limits,
  );
  if (!totalsCheck.ok && totalsCheck.blockReason === "total-bytes") {
    return {
      ok: false,
      kind: "file-write",
      message: `Rejected: ${totalsCheck.detail}`,
      preview: {
        repoRoot: root,
        commitMessage: parsed.data.commitMessage,
        files: filesPreview,
      },
      warnings: [...warnings, totalsCheck.detail ?? "total-bytes cap exceeded"],
      rollbackPlan,
    };
  }

  // Branch-context warning (preview never refuses on this; the future real
  // handler will). Reading current branch is best-effort.
  let currentBranch: string | null = null;
  try {
    const git = simpleGit(root);
    currentBranch = (await git.revparse(["--abbrev-ref", "HEAD"])).trim();
    if (!currentBranch.startsWith("agent/")) {
      warnings.push(
        `Current branch "${currentBranch}" is not an agent/* branch — real execution would refuse`,
      );
    }
  } catch {
    // non-fatal; branch detection is informational at preview time
  }

  logger.info("action:preview file-write", {
    proposalId: proposal.id,
    fileCount: filesPreview.length,
    blocked: blockedCount,
    totalBytes,
    warnings: warnings.length,
  });

  const ok = blockedCount === 0;
  return {
    ok,
    kind: "file-write",
    message: ok
      ? `Would write ${filesPreview.length} file(s) on a fresh agent/* branch`
      : `${blockedCount} file(s) blocked by safety validation; preview did not mutate anything`,
    preview: {
      repoRoot: root,
      commitMessage: parsed.data.commitMessage,
      currentBranch,
      allowSensitive,
      limits: {
        maxFiles: limits.maxFiles,
        maxBytesPerFile: limits.maxBytesPerFile,
        maxTotalBytes: limits.maxTotalBytes,
        allowedRoots: limits.allowedRoots,
      },
      totals: {
        fileCount: filesPreview.length,
        blockedCount,
        totalBytes,
      },
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

// ─── real file-write execution (Phase 32D) ──────────────────────
// Second real repo-mutating entry point in src/actions/*.
// executionBridge routes here only after:
//   - ACTIONS_REAL_EXECUTION_ENABLED=true
//   - REAL_EXEC_CATEGORIES contains "file-write"
//   - proposal.status === "approved"
//   - no prior successful execution for this proposal
//   - a second approval has been consumed (single-use, TTL, hash-bound)
// This function still enforces every invariant independently:
//   - clean repo at start (assertCleanRepo)
//   - current branch matches /^agent\//
//   - 32C safety gates (validateFile + checkProposalLimits) over every entry
//   - validate-all-before-write; restore-on-write-failure from a backup map
// No commit, no push, no branch creation, no PR.
// Imports stay limited to fs/promises + GitClient (read-only methods only).

export interface RealFileWriteFileEntry {
  path: string;
  operation: "create" | "modify";
  byteCount: number;
  existed: boolean;
}

export interface RealFileWriteResult {
  ok: boolean;
  message: string;
  branchName: string | null;
  filesWritten: RealFileWriteFileEntry[];
  filesSkipped: Array<{ path: string; reason: string }>;
  // Backup map: keys are repo-relative paths. existed:false → unlink to revert.
  // existed:true → writeFile(prior) to revert. Recorded BEFORE first write.
  backup: Record<string, { existed: boolean; prior: string | null }>;
  warnings: string[];
  rollbackPlan: string;
}

const REAL_FILE_WRITE_TMP_SUFFIX = ".32d.tmp";

function buildRealRollbackPlan(
  branchName: string | null,
  written: RealFileWriteFileEntry[],
): string {
  if (written.length === 0) {
    return "No files were written; nothing to roll back.";
  }
  const created = written.filter((f) => !f.existed).map((f) => f.path);
  const modified = written.filter((f) => f.existed).map((f) => f.path);
  const lines: string[] = [];
  if (modified.length > 0) {
    lines.push(`Restore modified files: \`git restore -- ${modified.join(" ")}\``);
  }
  if (created.length > 0) {
    lines.push(`Delete created files: \`rm -- ${created.join(" ")}\``);
  }
  if (branchName) {
    lines.push(
      `If the branch is disposable: \`git checkout dev && git branch -D ${branchName}\`.`,
    );
  }
  return lines.join("\n");
}

export async function realFileWrite(
  proposal: ActionProposal,
  repoRoot: string = process.cwd(),
): Promise<RealFileWriteResult> {
  const baseRollback =
    "If any write succeeded: `git restore -- <files>` for modified entries; `rm <path>` for created entries. The dispatch result includes a backup blob for full recovery.";

  // 1. Re-validate proposal shape (defense-in-depth; bridge already validated).
  const parsed = FileWriteParamsSchema.safeParse(proposal.parameters);
  if (!parsed.success) {
    return {
      ok: false,
      message: `Invalid parameters: ${parsed.error.message}`,
      branchName: null,
      filesWritten: [],
      filesSkipped: [],
      backup: {},
      warnings: [],
      rollbackPlan: baseRollback,
    };
  }

  // 2. Resolve runtime safety limits — same dual-key escape hatch as preview.
  const allowSensitive =
    Boolean(parsed.data.allowSensitivePaths) && FILE_WRITE_ALLOW_SENSITIVE;
  const limits: ProposalLimits = {
    maxFiles: FILE_WRITE_MAX_FILES,
    maxBytesPerFile: FILE_WRITE_MAX_BYTES_PER_FILE,
    maxTotalBytes: FILE_WRITE_MAX_TOTAL_BYTES,
    allowedRoots: parseAllowedRoots(FILE_WRITE_ALLOWED_ROOTS),
    allowSensitive,
  };

  // 3. Proposal-level file-count cap (cheap; pre-validation).
  const fileCountCheck = checkProposalLimits(parsed.data.files.length, 0, limits);
  if (!fileCountCheck.ok && fileCountCheck.blockReason === "file-count") {
    return {
      ok: false,
      message: `Refusing to write: ${fileCountCheck.detail}`,
      branchName: null,
      filesWritten: [],
      filesSkipped: [],
      backup: {},
      warnings: [],
      rollbackPlan: baseRollback,
    };
  }

  const root = resolve(repoRoot);
  const git = new GitClient(root);

  // 4. Clean repo + agent/* branch invariants.
  let branchName: string | null = null;
  try {
    branchName = await git.getCurrentBranch();
  } catch {
    // fall through; the prefix check below will fail
  }
  if (!branchName || !branchName.startsWith("agent/")) {
    return {
      ok: false,
      message: `Refusing to write: current branch "${branchName ?? "<unknown>"}" is not an agent/* branch`,
      branchName,
      filesWritten: [],
      filesSkipped: [],
      backup: {},
      warnings: [],
      rollbackPlan: baseRollback,
    };
  }
  try {
    await git.assertCleanRepo();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      message: `Refusing to write: ${msg}`,
      branchName,
      filesWritten: [],
      filesSkipped: [],
      backup: {},
      warnings: [],
      rollbackPlan: baseRollback,
    };
  }

  // 5. Validate every file via the 32C safety gate. Defense-in-depth: even
  // if preview passed, on-disk drift or proposal mutation is caught here.
  const validations: Array<{ raw: typeof parsed.data.files[number]; v: FileValidation }> = [];
  let totalBytes = 0;
  for (const f of parsed.data.files) {
    const v = validateFile(f.path, f.content, limits);
    validations.push({ raw: f, v });
    if (v.ok) totalBytes += v.byteCount;
  }
  const blocked = validations.filter((e) => !e.v.ok);
  if (blocked.length > 0) {
    const skipped = blocked.map((e) => ({
      path: e.raw.path,
      reason: `${e.v.blockReason ?? "blocked"}${e.v.detail ? ": " + e.v.detail : ""}`,
    }));
    return {
      ok: false,
      message: `Refusing to write: ${blocked.length} file(s) blocked by safety validation`,
      branchName,
      filesWritten: [],
      filesSkipped: skipped,
      backup: {},
      warnings: skipped.map((s) => `${s.path}: ${s.reason}`),
      rollbackPlan: baseRollback,
    };
  }

  // 6. Total-bytes cap over the validated set.
  const totalsCheck = checkProposalLimits(parsed.data.files.length, totalBytes, limits);
  if (!totalsCheck.ok && totalsCheck.blockReason === "total-bytes") {
    return {
      ok: false,
      message: `Refusing to write: ${totalsCheck.detail}`,
      branchName,
      filesWritten: [],
      filesSkipped: [],
      backup: {},
      warnings: [],
      rollbackPlan: baseRollback,
    };
  }

  // 7. Build the backup map BEFORE any write. For modify ops capture prior
  // bytes (bounded by per-file cap); for create ops record existed:false.
  const backup: Record<string, { existed: boolean; prior: string | null }> = {};
  for (const f of parsed.data.files) {
    const fullPath = join(root, f.path);
    let existed = false;
    let prior: string | null = null;
    try {
      const info = await stat(fullPath);
      if (info.isFile()) {
        existed = true;
        prior = await readFile(fullPath, "utf-8");
      }
    } catch {
      // missing or unreadable — treat as did-not-exist
    }
    backup[f.path] = { existed, prior };
  }

  // 8. Atomic write loop. Per-file: ensure parent dir, write to .tmp, rename.
  // On any failure, restore already-written files from the backup map.
  const written: RealFileWriteFileEntry[] = [];
  const warnings: string[] = [];

  async function rollback(reason: string): Promise<void> {
    for (const entry of written.slice().reverse()) {
      const fullPath = join(root, entry.path);
      try {
        const b = backup[entry.path];
        if (b && b.existed && b.prior !== null) {
          await writeFile(fullPath, b.prior, "utf-8");
        } else {
          await unlink(fullPath);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        warnings.push(`rollback ${entry.path}: ${msg}`);
        logger.warn("action:real file-write rollback step failed", {
          proposalId: proposal.id,
          path: entry.path,
          error: msg,
        });
      }
    }
    logger.warn("action:real file-write rolled back", {
      proposalId: proposal.id,
      reason,
      restored: written.length,
    });
  }

  for (const f of parsed.data.files) {
    const fullPath = join(root, f.path);
    const tmpPath  = fullPath + REAL_FILE_WRITE_TMP_SUFFIX;
    try {
      await mkdir(dirname(fullPath), { recursive: true });
      await writeFile(tmpPath, f.content, "utf-8");
      await rename(tmpPath, fullPath);
      const b = backup[f.path] ?? { existed: false, prior: null };
      written.push({
        path: f.path,
        operation: f.operation,
        byteCount: Buffer.byteLength(f.content, "utf-8"),
        existed: b.existed,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // Best-effort cleanup of the temp file.
      try { await unlink(tmpPath); } catch { /* ignore */ }
      await rollback(`writeFile failed at ${f.path}: ${msg}`);
      return {
        ok: false,
        message: `Write failed at "${f.path}": ${msg}; previously-written files restored from backup`,
        branchName,
        filesWritten: written,
        filesSkipped: [],
        backup,
        warnings,
        rollbackPlan: buildRealRollbackPlan(branchName, written),
      };
    }
  }

  logger.info("action:real file-write succeeded", {
    proposalId: proposal.id,
    branchName,
    fileCount: written.length,
    totalBytes,
  });

  return {
    ok: true,
    message: `Wrote ${written.length} file(s) on "${branchName}"`,
    branchName,
    filesWritten: written,
    filesSkipped: [],
    backup,
    warnings,
    rollbackPlan: buildRealRollbackPlan(branchName, written),
  };
}
