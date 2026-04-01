// src/execution/proposalWriter.ts
// Escribe los archivos propuestos en el branch agent/*.
// Nunca opera sobre main o dev.

import { writeFile, mkdir } from "fs/promises";
import { dirname, join }    from "path";
import { GitClient }        from "./gitClient.js";
import { logger }           from "../observability/logger.js";
import type { ExecutionFile } from "../types.js";

export interface WriteResult {
  filesWritten:  string[];
  filesSkipped:  string[];
  branchName:    string;
  commitHash:    string;
}

export async function writeProposal(
  files:      ExecutionFile[],
  repoPath:   string,
  taskSlug:   string,
  commitMsg:  string
): Promise<WriteResult> {
  const git          = new GitClient(repoPath);
  const filesWritten: string[] = [];
  const filesSkipped: string[] = [];

  // Verificar repo limpio antes de operar
  await git.assertCleanRepo();

  // Crear branch agent/*
  const branchName = await git.createAgentBranch(taskSlug);

  // Escribir archivos
  for (const file of files) {
    if (file.operation === "delete") {
      logger.warn(`Delete operations require manual approval — skipping: ${file.path}`);
      filesSkipped.push(file.path);
      continue;
    }

    if (!file.content) {
      filesSkipped.push(file.path);
      continue;
    }

    const fullPath = join(repoPath, file.path);
    await mkdir(dirname(fullPath), { recursive: true });
    await writeFile(fullPath, file.content, "utf-8");
    filesWritten.push(file.path);
    logger.debug(`Written: ${file.path}`);
  }

  // Commit
  const commitHash = filesWritten.length > 0
    ? await git.commitFiles(filesWritten, commitMsg)
    : "";

  return { filesWritten, filesSkipped, branchName, commitHash };
}