import type {
  BudgetEvaluationInput,
  BudgetPolicy,
  BudgetResult,
  EvalStatus,
} from "./types.js";

const DEFAULT_POLICY: BudgetPolicy = {
  mode: "evaluation",
  warnInputTokens: 3_000,
  blockInputTokens: 6_000,
  warnContextItems: 20,
  blockContextItems: 50,
  warnMemoryItems: 8,
  blockMemoryItems: 16,
};

const MODE_POLICIES: BudgetPolicy[] = [
  { ...DEFAULT_POLICY, mode: "route", warnInputTokens: 1_000, blockInputTokens: 2_000 },
  { ...DEFAULT_POLICY, mode: "plan", warnInputTokens: 4_000, blockInputTokens: 8_000 },
  { ...DEFAULT_POLICY, mode: "blueprint", warnInputTokens: 5_000, blockInputTokens: 10_000 },
  { ...DEFAULT_POLICY, mode: "audit", warnInputTokens: 20_000, blockInputTokens: 40_000, warnContextItems: 80, blockContextItems: 160 },
  { ...DEFAULT_POLICY, mode: "audit-ux", warnInputTokens: 18_000, blockInputTokens: 36_000, warnContextItems: 60, blockContextItems: 140 },
  { ...DEFAULT_POLICY, mode: "scaffold", warnInputTokens: 6_000, blockInputTokens: 12_000 },
  { ...DEFAULT_POLICY, mode: "execute", warnInputTokens: 5_000, blockInputTokens: 10_000 },
  { ...DEFAULT_POLICY, mode: "chat", warnInputTokens: 4_000, blockInputTokens: 8_000 },
];

export function estimateTokens(text: string): number {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return 0;
  return Math.ceil(normalized.length / 4);
}

export function getBudgetPolicy(mode: BudgetEvaluationInput["mode"]): BudgetPolicy {
  return MODE_POLICIES.find((policy) => policy.mode === mode) ?? DEFAULT_POLICY;
}

function statusFromReasons(reasonCodes: string[]): EvalStatus {
  if (reasonCodes.some((code) => code.endsWith(".block") || code === "context.too_large")) {
    return "fail";
  }
  if (reasonCodes.length > 0) {
    return "warn";
  }
  return "pass";
}

export function evaluateBudget(input: BudgetEvaluationInput): BudgetResult {
  const basePolicy = getBudgetPolicy(input.mode);
  const policy = input.maxInputTokens
    ? { ...basePolicy, blockInputTokens: input.maxInputTokens }
    : basePolicy;
  const estimatedInputTokens = estimateTokens(input.text);
  const estimatedContextItems = input.contextItemCount ?? 0;
  const estimatedMemoryItems = input.memoryItemCount ?? 0;
  const reasonCodes: string[] = [];
  const details: string[] = [];

  if (estimatedInputTokens >= policy.blockInputTokens) {
    reasonCodes.push("budget.input.block");
    details.push(`Estimated input tokens ${estimatedInputTokens} exceed block threshold ${policy.blockInputTokens}.`);
  } else if (estimatedInputTokens >= policy.warnInputTokens) {
    reasonCodes.push("budget.input.warn");
    details.push(`Estimated input tokens ${estimatedInputTokens} exceed warn threshold ${policy.warnInputTokens}.`);
  }

  if (estimatedContextItems >= policy.blockContextItems) {
    reasonCodes.push("context.too_large");
    details.push(`Context item count ${estimatedContextItems} exceeds block threshold ${policy.blockContextItems}.`);
  } else if (estimatedContextItems >= policy.warnContextItems) {
    reasonCodes.push("context.warn");
    details.push(`Context item count ${estimatedContextItems} exceeds warn threshold ${policy.warnContextItems}.`);
  }

  if (estimatedMemoryItems >= policy.blockMemoryItems) {
    reasonCodes.push("memory.too_many_items");
    details.push(`Memory item count ${estimatedMemoryItems} exceeds block threshold ${policy.blockMemoryItems}.`);
  } else if (estimatedMemoryItems >= policy.warnMemoryItems) {
    reasonCodes.push("memory.warn");
    details.push(`Memory item count ${estimatedMemoryItems} exceeds warn threshold ${policy.warnMemoryItems}.`);
  }

  if (details.length === 0) {
    details.push("Static local budget estimate is within configured thresholds.");
  }

  return {
    id: input.id,
    title: `Budget guard: ${input.id}`,
    status: statusFromReasons(reasonCodes),
    reasonCodes,
    details,
    mode: input.mode,
    estimatedInputTokens,
    estimatedContextItems,
    estimatedMemoryItems,
    policy,
  };
}

export function runBudgetSuite(inputs: BudgetEvaluationInput[]): BudgetResult[] {
  return inputs.map((input) => evaluateBudget(input));
}
