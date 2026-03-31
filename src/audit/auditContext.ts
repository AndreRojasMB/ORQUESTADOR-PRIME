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