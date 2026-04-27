import type {
  CompressionPolicyResult,
  CompressionSuggestion,
  EvalStatus,
} from "./types.js";
import { estimateTokens } from "./budgetGuard.js";

const MUST_PRESERVE = [
  "current user instruction",
  "explicit safety rules",
  "approval and permission gates",
  "test contracts",
  "error evidence",
  "privacy labels",
  "exact command constraints",
];

function addSuggestion(
  suggestions: CompressionSuggestion[],
  code: string,
  target: string,
  reason: string,
  priority: CompressionSuggestion["priority"],
): void {
  suggestions.push({ code, target, reason, priority });
}

function statusForSuggestions(suggestions: CompressionSuggestion[]): EvalStatus {
  if (suggestions.some((item) => item.priority === "high")) return "warn";
  if (suggestions.length > 0) return "warn";
  return "pass";
}

export function analyzeCompressionPolicy(input: {
  promptId: string;
  text: string;
  contextItemCount?: number;
  memoryItemCount?: number;
  auditSectionCount?: number;
  docsContextCount?: number;
}): CompressionPolicyResult {
  const tokens = estimateTokens(input.text);
  const suggestions: CompressionSuggestion[] = [];

  if (tokens > 5_000) {
    addSuggestion(
      suggestions,
      "compression.large_prompt_summary",
      "large file summaries",
      "Prompt is large enough to prefer focused summaries over broad context.",
      "high",
    );
  }

  if ((input.memoryItemCount ?? 0) > 8) {
    addSuggestion(
      suggestions,
      "compression.memory_filter",
      "oversized memory lists",
      "Memory context exceeds the early-phase safe count; prefer tighter retrieval filters.",
      "medium",
    );
  }

  if ((input.auditSectionCount ?? 0) > 3) {
    addSuggestion(
      suggestions,
      "compression.repeated_audit",
      "repeated audit text",
      "Repeated audit sections should be summarized before provider use in a future phase.",
      "medium",
    );
  }

  if ((input.docsContextCount ?? 0) > 5) {
    addSuggestion(
      suggestions,
      "compression.duplicate_docs",
      "duplicate docs context",
      "Many docs references should be deduplicated into a brief source list.",
      "low",
    );
  }

  if ((input.contextItemCount ?? 0) > 20) {
    addSuggestion(
      suggestions,
      "compression.old_history",
      "old chat history",
      "Large context item count should prioritize recent task-specific context.",
      "medium",
    );
  }

  return {
    id: input.promptId,
    title: `Compression policy: ${input.promptId}`,
    status: statusForSuggestions(suggestions),
    reasonCodes: suggestions.map((item) => item.code),
    details: suggestions.length > 0
      ? suggestions.map((item) => item.reason)
      : ["No compression suggestion needed for this prompt shape."],
    promptId: input.promptId,
    advisoryOnly: true,
    suggestions,
    mustPreserve: MUST_PRESERVE.slice(),
  };
}
