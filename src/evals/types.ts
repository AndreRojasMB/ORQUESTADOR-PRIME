import type { OrchestratorMode } from "../types.js";
import type { ProjectIdentity } from "../supervisor/types.js";
import type { RedactionMetadata } from "../privacy/redactionEngine.js";

export const EVAL_SUITE_VERSION = "1.0";

export type EvalStatus = "pass" | "warn" | "fail";

export type GoldenTaskCategory =
  | "frontend"
  | "backend-api"
  | "auth-security"
  | "devops"
  | "qa"
  | "ai-rag"
  | "data"
  | "ambiguous";

export type EvalRiskLevel = "low" | "medium" | "high";

export interface GoldenTaskExpectedRoute {
  agents: string[];
  matchedKeywords?: string[];
  projectType?: string;
  features?: string[];
  fallbackCore?: boolean;
}

export interface GoldenTaskExpectedOutputShape {
  mode?: OrchestratorMode | "evaluation";
  requiredKeys: string[];
  jsonOnly?: boolean;
}

export interface GoldenTaskScoringCriterion {
  code: string;
  description: string;
  weight: number;
}

export interface GoldenTask {
  id: string;
  version: string;
  title: string;
  category: GoldenTaskCategory;
  input: string;
  expectedRoute: GoldenTaskExpectedRoute;
  expectedBehavior: string[];
  requiredCapabilities: string[];
  forbiddenActions: string[];
  expectedOutputShape: GoldenTaskExpectedOutputShape;
  scoringCriteria: GoldenTaskScoringCriterion[];
  tags: string[];
  riskLevel: EvalRiskLevel;
}

export interface EvalCheckResult {
  id: string;
  title: string;
  status: EvalStatus;
  reasonCodes: string[];
  details: string[];
}

export interface RouterTestResult extends EvalCheckResult {
  taskId: string;
  selectedAgents: string[];
  matchedKeywords: string[];
  expectedAgents: string[];
  missingAgents: string[];
  unexpectedAgents: string[];
  detectedFeatures: string[];
  expectedFeatures: string[];
  projectType: string;
  expectedProjectType: string | null;
}

export interface PromptShapeResult extends EvalCheckResult {
  promptId: string;
  mode: OrchestratorMode;
  promptLength: number;
  requiredSections: string[];
  missingSections: string[];
  forbiddenMatches: string[];
  jsonOnlyExpected: boolean;
}

export interface BudgetEvaluationInput {
  id: string;
  mode: OrchestratorMode | "evaluation";
  text: string;
  contextItemCount?: number;
  memoryItemCount?: number;
  maxInputTokens?: number;
}

export interface BudgetPolicy {
  mode: OrchestratorMode | "evaluation";
  warnInputTokens: number;
  blockInputTokens: number;
  warnContextItems: number;
  blockContextItems: number;
  warnMemoryItems: number;
  blockMemoryItems: number;
}

export interface BudgetResult extends EvalCheckResult {
  mode: OrchestratorMode | "evaluation";
  estimatedInputTokens: number;
  estimatedContextItems: number;
  estimatedMemoryItems: number;
  policy: BudgetPolicy;
}

export interface CompressionSuggestion {
  code: string;
  target: string;
  reason: string;
  priority: "low" | "medium" | "high";
}

export interface CompressionPolicyResult extends EvalCheckResult {
  promptId: string;
  advisoryOnly: true;
  suggestions: CompressionSuggestion[];
  mustPreserve: string[];
}

export interface EvalSuiteSummary {
  total: number;
  passed: number;
  warned: number;
  failed: number;
  status: EvalStatus;
}

export interface EvalBaselineSummary {
  path: string;
  loaded: boolean;
  reportId: string | null;
  createdAt: string | null;
  summary: EvalSuiteSummary | null;
  warning: string | null;
}

export interface EvalChangedResults {
  addedFailingOrWarningIds: string[];
  removedFailingOrWarningIds: string[];
  changedStatusIds: string[];
}

export interface EvalPrivacySummary {
  redaction: RedactionMetadata;
  containsUnsafeOutput: boolean;
  checkedPatterns: string[];
}

export interface EvalRegressionReport {
  reportId: string;
  createdAt: string;
  suiteVersion: typeof EVAL_SUITE_VERSION;
  project: Pick<ProjectIdentity, "projectId" | "projectName" | "projectRootHash">;
  summary: EvalSuiteSummary;
  goldenTaskResults: EvalCheckResult[];
  routerResults: RouterTestResult[];
  promptShapeResults: PromptShapeResult[];
  budgetResults: BudgetResult[];
  compressionPolicyResults: CompressionPolicyResult[];
  changedResults: EvalChangedResults;
  baseline: EvalBaselineSummary | null;
  warnings: string[];
  privacy: EvalPrivacySummary;
  qualityDashboard: {
    latestStatus: EvalStatus;
    failingIds: string[];
    warningIds: string[];
    routerFailures: number;
    promptShapeFailures: number;
    budgetBlocks: number;
    compressionWarnings: number;
  };
}

export interface EvalRunnerOptions {
  baselinePath?: string;
  mode?: OrchestratorMode | "all";
}
