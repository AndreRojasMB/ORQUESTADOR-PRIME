// src/memory/memoryContext.ts
// Construye contexto de memoria para inyectar en prompts.
// Solo incluye entradas relevantes — no vuelca todo el historial.

import { findRelatedEntries, getRecentEntries } from "./memoryStore.js";
import type { MemoryEntry }                      from "../types.js";

export interface MemoryContext {
  hasContext:     boolean;
  recentRuns:     MemoryEntry[];
  relatedRuns:    MemoryEntry[];
  contextString:  string;
}

// Construye contexto de memoria para un task dado
export async function buildMemoryContext(
  task:     string,
  keywords: string[],
  type?:    string
): Promise<MemoryContext> {
  const [recentRuns, relatedRuns] = await Promise.all([
    getRecentEntries(3),
    findRelatedEntries(keywords, type, 3),
  ]);

  // Deduplicar — no repetir entradas que aparezcan en ambas listas
  const recentIds  = new Set(recentRuns.map((e) => e.id));
  const uniqueRelated = relatedRuns.filter((e) => !recentIds.has(e.id));

  const hasContext = recentRuns.length > 0 || uniqueRelated.length > 0;

  const contextString = hasContext
    ? buildContextString(recentRuns, uniqueRelated)
    : "";

  return {
    hasContext,
    recentRuns,
    relatedRuns: uniqueRelated,
    contextString,
  };
}

function formatEntry(e: MemoryEntry): string {
  const lines = [
    `- [${e.type.toUpperCase()}] "${e.task}"`,
    `  Date    : ${new Date(e.timestamp).toLocaleDateString()}`,
    `  Agents  : ${e.agents.join(", ")}`,
  ];

  if (e.projectType) lines.push(`  Project : ${e.projectType}`);
  if (e.summary)     lines.push(`  Summary : ${e.summary}`);
  if (e.outputDir)   lines.push(`  Output  : ${e.outputDir}`);

  return lines.join("\n");
}

function buildContextString(
  recent:  MemoryEntry[],
  related: MemoryEntry[]
): string {
  const parts: string[] = ["Previous relevant context:"];

  if (recent.length > 0) {
    parts.push("\nRecent runs:");
    parts.push(...recent.map(formatEntry));
  }

  if (related.length > 0) {
    parts.push("\nRelated runs:");
    parts.push(...related.map(formatEntry));
  }

  return parts.join("\n");
}