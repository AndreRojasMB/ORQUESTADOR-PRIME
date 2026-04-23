// src/whatsapp/replyFormatter.ts
// Formats an OrchestratorResult into a WhatsApp-safe plain text reply.

import type { OrchestratorResult } from "../types.js";

const MODE_TAGS: Record<string, string> = {
  plan:      "[PLAN]",
  blueprint: "[BLUEPRINT]",
  audit:     "[AUDIT]",
  route:     "[ROUTE]",
  scaffold:  "[SCAFFOLD]",
  memory:    "[MEMORY]",
  execute:   "[EXECUTE]",
};

const DEFAULT_MAX_LENGTH = 4000;

/**
 * Converts an OrchestratorResult into a plain-text string suitable
 * for WhatsApp delivery. Strips markdown, truncates to maxLength.
 */
export function formatReply(
  result: OrchestratorResult,
  maxLength = DEFAULT_MAX_LENGTH,
): string {
  const tag = MODE_TAGS[result.mode] ?? `[${result.mode.toUpperCase()}]`;

  let body: string;

  if (result.structured) {
    // Extract a readable summary from structured output
    body = extractStructuredSummary(result.structured);
  } else {
    body = stripMarkdown(result.finalOutput);
  }

  let text = `${tag}\n\n${body}`;

  if (result.parseError) {
    text += "\n\n-- Output had parsing issues.";
  }

  if (text.length > maxLength) {
    const suffix = "\n\n[Truncated -- run the full command for complete output]";
    text = text.slice(0, maxLength - suffix.length) + suffix;
  }

  return text;
}

// ─── Helpers ─────────────────────────────────────────────────────

function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, "")          // headings
    .replace(/\*\*(.+?)\*\*/g, "$1")      // bold
    .replace(/\*(.+?)\*/g, "$1")          // italic
    .replace(/`{3}[\s\S]*?`{3}/g, "[code block omitted]") // code blocks
    .replace(/`(.+?)`/g, "$1")            // inline code
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")   // links
    .trim();
}

function extractStructuredSummary(structured: unknown): string {
  if (structured == null || typeof structured !== "object") {
    return String(structured);
  }

  const obj = structured as Record<string, unknown>;
  const parts: string[] = [];

  // Common summary fields across modes
  if (typeof obj["mode"] === "string") {
    parts.push(`Mode: ${obj["mode"]}`);
  }
  if (typeof obj["architectureOverview"] === "string") {
    parts.push(obj["architectureOverview"]);
  }
  if (obj["projectOverview"] && typeof obj["projectOverview"] === "object") {
    const po = obj["projectOverview"] as Record<string, unknown>;
    if (typeof po["scope"] === "string") parts.push(po["scope"]);
    if (typeof po["type"] === "string") parts.push(`Type: ${po["type"]}`);
  }
  if (typeof obj["repositorySummary"] === "object" && obj["repositorySummary"]) {
    parts.push(JSON.stringify(obj["repositorySummary"], null, 2));
  }
  if (Array.isArray(obj["prioritizedActions"])) {
    parts.push("Actions:");
    for (const action of obj["prioritizedActions"].slice(0, 5)) {
      if (typeof action === "object" && action && "action" in action) {
        parts.push(`- ${(action as Record<string, unknown>)["action"]}`);
      }
    }
  }

  return parts.length > 0 ? parts.join("\n\n") : JSON.stringify(obj, null, 2);
}
