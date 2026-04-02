// src/lightrag/lightragContext.ts
// Queries LightRAG for relevant codebase context and formats it
// for injection into orchestrator prompts.

import { query } from "./lightragClient.js";
import { logger } from "../observability/logger.js";
import type { OrchestratorMode } from "../types.js";

// ─── Types ───────────────────────────────────────────────────────

export interface RAGContext {
  hasContext: boolean;
  ragSnippets: string;
  queryUsed: string;
}

// ─── Mode-specific query prefixes ────────────────────────────────

const MODE_QUERY_PREFIX: Partial<Record<OrchestratorMode, string>> = {
  plan:      "implementation context for:",
  blueprint: "architecture and project structure for:",
  audit:     "security and code quality patterns in:",
};

// ─── Context Builder ─────────────────────────────────────────────

/**
 * Queries LightRAG in hybrid mode for context relevant to the task.
 * Returns formatted snippets ready for prompt injection.
 * Non-fatal — returns empty context on any error.
 */
export async function buildRAGContext(
  task: string,
  mode: OrchestratorMode
): Promise<RAGContext> {
  const prefix = MODE_QUERY_PREFIX[mode] ?? "relevant context for:";
  const queryText = `${prefix} ${task}`;

  try {
    const result = await query({
      query: queryText,
      mode: "hybrid",
      onlyNeedContext: true,
    });

    if (!result.ok || !result.response || result.response.trim().length === 0) {
      logger.debug("LightRAG returned no context", {
        error: result.error,
      });
      return { hasContext: false, ragSnippets: "", queryUsed: queryText };
    }

    // Truncate to avoid blowing up the prompt (max ~4K chars of RAG context)
    const MAX_RAG_CHARS = 4000;
    const snippets =
      result.response.length > MAX_RAG_CHARS
        ? result.response.slice(0, MAX_RAG_CHARS) + "\n[...truncated]"
        : result.response;

    const formatted = [
      "── Codebase Context (via LightRAG) ──",
      snippets,
      "── End Codebase Context ──",
    ].join("\n");

    logger.debug(`LightRAG context: ${snippets.length} chars`);

    return {
      hasContext: true,
      ragSnippets: formatted,
      queryUsed: queryText,
    };
  } catch (err) {
    // Non-fatal — RAG context is best-effort
    logger.debug("LightRAG query failed (non-fatal)", {
      error: err instanceof Error ? err.message : String(err),
    });
    return { hasContext: false, ragSnippets: "", queryUsed: queryText };
  }
}
