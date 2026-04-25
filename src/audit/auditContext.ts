// src/audit/auditContext.ts
// Construye el contexto textual del repo para el prompt de audit.
// Trunca contenido largo para no exceder context window.

import type { RepoStructure } from "./repoReader.js";

const MAX_FILE_CHARS   = 3_000;   // por archivo
const MAX_TOTAL_CHARS  = 40_000;  // total del contexto

export interface AuditContext {
  repoSummary: string;
  fileContext: string;
  totalFiles:  number;
  filesRead:   number;
}

export function buildAuditContext(repo: RepoStructure): AuditContext {
  // Árbol de archivos (primeras 100 entradas)
  const treeLines = repo.tree.slice(0, 100);
  const treeStr   = treeLines.join("\n");
  const truncated = repo.tree.length > 100
    ? `\n... and ${repo.tree.length - 100} more files`
    : "";

  const repoSummary = [
    `Repository root : ${repo.root}`,
    `Total files     : ${repo.totalFiles}`,
    `Files read      : ${repo.keyFiles.length}`,
    ``,
    `File tree:`,
    treeStr + truncated,
  ].join("\n");

  // Contenido de archivos clave
  let totalChars   = 0;
  const fileParts: string[] = [];

  for (const file of repo.keyFiles) {
    if (totalChars >= MAX_TOTAL_CHARS) break;

    const content = file.content.length > MAX_FILE_CHARS
      ? file.content.slice(0, MAX_FILE_CHARS) + `\n... [truncated at ${MAX_FILE_CHARS} chars]`
      : file.content;

    const block = [
      `${"─".repeat(50)}`,
      `FILE: ${file.path}`,
      `${"─".repeat(50)}`,
      content,
    ].join("\n");

    fileParts.push(block);
    totalChars += block.length;
  }

  return {
    repoSummary,
    fileContext: fileParts.join("\n\n"),
    totalFiles:  repo.totalFiles,
    filesRead:   repo.keyFiles.length,
  };
}

// ─── UX audit context (Phase 32C-UXAUDIT, expanded in 32E-AUDITUX-CORE) ───
// Same shape as AuditContext but built from a focused file set with
// scope/section/agent metadata in the summary. Per-file and total
// caps are larger because UI files often need fuller diff visibility.
// 32E adds: explicit-file echo, include/exclude patterns, follow depth,
// caps, reachable count, and capsApplied notes — all surfaced to the
// LLM via repoSummary.

const UX_MAX_FILE_CHARS    = 6_000;
const UX_MAX_TOTAL_CHARS   = 80_000;
const UX_SKIPPED_CAP       = 50;       // truncate skipped[] tail in summary

export interface UxAuditParams {
  scope:         string;
  entry:         string;
  sections:      string[];
  agents:        string[];
  // Phase 32E-AUDITUX-CORE — surfaced flags / caps for prompt visibility
  explicitFiles: string[];
  include:       string[];
  exclude:       string[];
  followDepth:   0 | 1 | 2;
  maxFiles:      number;
  maxBytes:      number;
}

export interface UxAuditContext extends AuditContext {
  scope:          string;
  entry:          string;
  sections:       string[];
  agents:         string[];
  skipped:        Array<{ path: string; reason: string; count?: number }>;
  // Phase 32E-AUDITUX-CORE
  reachableCount: number;
  capsApplied:    string[];
  followDepth:    0 | 1 | 2;
  caps:           { maxFiles: number; maxBytes: number };
  patterns:       { include: string[]; exclude: string[] };
}

export function buildUxAuditContext(
  repo:    import("./repoReader.js").FocusedReadResult,
  params:  UxAuditParams,
): UxAuditContext {
  const treeStr = repo.tree.join("\n");

  const skippedHead = repo.skipped.slice(0, UX_SKIPPED_CAP);
  const skippedOverflow = repo.skipped.length - skippedHead.length;
  const skippedLines = skippedHead.length === 0
    ? ["(none skipped)"]
    : skippedHead.map((s) => {
      const countSuffix = s.count && s.count > 1 ? ` x${s.count}` : "";
      return `  - ${s.path}  [${s.reason}]${countSuffix}`;
    });
  if (skippedOverflow > 0) {
    skippedLines.push(`  ... and ${skippedOverflow} more`);
  }

  const explicitNonEntry = params.explicitFiles.filter((f) => f !== params.entry);
  const explicitLine  = explicitNonEntry.length === 0 ? "(none)" : explicitNonEntry.join(", ");
  const includeLine   = params.include.length === 0   ? "(none)" : params.include.join(", ");
  const excludeLine   = params.exclude.length === 0   ? "(none)" : params.exclude.join(", ");
  const capsAppliedLn = repo.capsApplied.length === 0 ? "(none)" : repo.capsApplied.join("; ");

  const repoSummary = [
    `SCOPE           : ${params.scope}`,
    `ENTRY           : ${params.entry}`,
    `EXPLICIT FILES  : ${explicitLine}`,
    `INCLUDE         : ${includeLine}`,
    `EXCLUDE         : ${excludeLine}`,
    `FOLLOW DEPTH    : ${params.followDepth}`,
    `MAX FILES       : ${params.maxFiles}`,
    `MAX BYTES       : ${params.maxBytes}`,
    `SECTIONS        : ${params.sections.join(", ")}`,
    `ACTIVE AGENTS   : ${params.agents.join(", ")}`,
    `REPO ROOT       : ${repo.root}`,
    `FILES READ      : ${repo.keyFiles.length}`,
    `REACHABLE COUNT : ${repo.reachableCount}`,
    `CAPS APPLIED    : ${capsAppliedLn}`,
    ``,
    `Skipped:`,
    skippedLines.join("\n"),
    ``,
    `Focused file tree:`,
    treeStr || "(empty)",
  ].join("\n");

  let totalChars = 0;
  const fileParts: string[] = [];

  for (const file of repo.keyFiles) {
    if (totalChars >= UX_MAX_TOTAL_CHARS) break;

    const content = file.content.length > UX_MAX_FILE_CHARS
      ? file.content.slice(0, UX_MAX_FILE_CHARS) + `\n... [truncated at ${UX_MAX_FILE_CHARS} chars]`
      : file.content;

    const block = [
      `${"─".repeat(50)}`,
      `FILE: ${file.path}  (${file.sizeBytes} bytes)`,
      `${"─".repeat(50)}`,
      content,
    ].join("\n");

    fileParts.push(block);
    totalChars += block.length;
  }

  return {
    repoSummary,
    fileContext:    fileParts.join("\n\n"),
    totalFiles:     repo.totalFiles,
    filesRead:      repo.keyFiles.length,
    scope:          params.scope,
    entry:          params.entry,
    sections:       params.sections,
    agents:         params.agents,
    skipped:        repo.skipped,
    reachableCount: repo.reachableCount,
    capsApplied:    repo.capsApplied,
    followDepth:    repo.followDepth,
    caps:           repo.caps,
    patterns:       repo.patterns,
  };
}
