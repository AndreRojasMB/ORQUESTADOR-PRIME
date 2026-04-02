// src/lightrag/lightragIndexer.ts
// Indexes a repository into LightRAG using the existing repoReader.
// Pushes each key file as a text document for graph-based retrieval.

import { readRepo } from "../audit/repoReader.js";
import { insertText } from "./lightragClient.js";
import { logger } from "../observability/logger.js";

// ─── Types ───────────────────────────────────────────────────────

export interface IndexResult {
  filesIndexed: number;
  filesSkipped: number;
  filesFailed: number;
  totalBytes: number;
  errors: string[];
}

// ─── Indexer ─────────────────────────────────────────────────────

/**
 * Reads a repository and inserts each readable file into LightRAG.
 * Uses the existing repoReader infrastructure (same as audit mode).
 */
export async function indexRepo(repoPath: string): Promise<IndexResult> {
  const repo = await readRepo(repoPath);

  logger.info(`LightRAG indexing: ${repo.keyFiles.length} files from ${repoPath}`);

  let filesIndexed = 0;
  let filesSkipped = 0;
  let filesFailed = 0;
  let totalBytes = 0;
  const errors: string[] = [];

  for (const file of repo.keyFiles) {
    // Skip very small files (likely empty or trivial)
    if (file.content.trim().length < 10) {
      filesSkipped++;
      continue;
    }

    const description = `${repo.root} — ${file.path}`;
    const text = `// File: ${file.path}\n${file.content}`;

    try {
      const result = await insertText({ text, description });

      if (result.ok) {
        filesIndexed++;
        totalBytes += file.sizeBytes;
        logger.debug(`Indexed: ${file.path} (${file.sizeBytes}b)`);
      } else {
        filesFailed++;
        const msg = `Failed to index ${file.path}: ${result.error}`;
        errors.push(msg);
        logger.warn(msg);
      }
    } catch (err) {
      filesFailed++;
      const msg = `Error indexing ${file.path}: ${err instanceof Error ? err.message : String(err)}`;
      errors.push(msg);
      logger.warn(msg);
    }
  }

  logger.info(
    `LightRAG index complete: ${filesIndexed} indexed, ${filesSkipped} skipped, ${filesFailed} failed`
  );

  return { filesIndexed, filesSkipped, filesFailed, totalBytes, errors };
}
