export type AutopilotTaskState =
  | "pending"
  | "running"
  | "codex_done"
  | "validating"
  | "needs_review"
  | "approved"
  | "failed"
  | "blocked";

export type AutopilotLoopStage =
  | "intake"
  | "phase_planning"
  | "task_creation"
  | "codex_handoff"
  | "codex_report"
  | "validation"
  | "memory_update_proposal"
  | "next_action"
  | "human_approval";

export type AutopilotRiskLevel =
  | "observe_only"
  | "report_only"
  | "plan_only"
  | "propose_only"
  | "execute_low_risk_future"
  | "execute_gated_future"
  | "critical_plan_only";

export type AutopilotMode = "B" | "I" | "R" | "S";

export type AutopilotFindingSeverity = "info" | "warn" | "fail";

export type AutopilotValidationFinalStatus =
  | "accepted"
  | "accepted_with_warnings"
  | "needs_review"
  | "blocked"
  | "failed";

export interface AutopilotBoundarySet {
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noRuntimeExecutor: true;
  noCodexInvocation: true;
  noOpenClawExecution: true;
  noWhatsAppOutbound: true;
  noN8nExecution: true;
  noProviderCalls: true;
  noNetwork: true;
  noFilesystemReads: true;
  noFilesystemWrites: true;
  noEnvReads: true;
  noDashboardMutation: true;
  noMemoryMutation: true;
  noDbSqlMutation: true;
  noDeploy: true;
  noPackageWorkflowChanges: true;
  noGitMutationFromSource: true;
  requiresHumanApprovalForExecution: true;
}

export interface AutopilotFinding {
  findingId: string;
  severity: AutopilotFindingSeverity;
  reasonCode: string;
  safeMessage: string;
  path?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface AutopilotCommandResult {
  command: string;
  result: "not_run" | "passed" | "failed" | "skipped";
  safeSummary: string;
  metadataOnly: true;
  noExecutionFromContract: true;
}

export interface AutopilotTextListContract {
  items: string[];
  metadataOnly: true;
}

export interface AutopilotScopeCheckContract {
  gitStatusCommand: string;
  gitDiffCommand: string;
  stagedFilesCommand: string;
  expectedChangedFiles: string[];
  forbiddenChangedFiles: string[];
  metadataOnly: true;
}

export interface AutopilotForbiddenGrepContract {
  patterns: string[];
  paths: string[];
  allowedMatches: string[];
  metadataOnly: true;
}

export interface AutopilotVerificationPlan {
  commands: string[];
  typecheckRequired: boolean;
  pyCompileRequired: boolean;
  testsRequired: boolean;
  metadataOnly: true;
}

export interface AutopilotSmokePlan {
  checks: string[];
  metadataOnly: true;
}

export interface AutopilotHumanApprovalGate {
  required: boolean;
  reason: string;
  approverRole: string;
  beforeStages: AutopilotLoopStage[];
  metadataOnly: true;
  noSelfApproval: true;
}

export interface AutopilotTaskMetadata {
  taskId: string;
  objectiveId: string;
  phase: string;
  title: string;
  mode: AutopilotMode;
  state: AutopilotTaskState;
  riskLevel: AutopilotRiskLevel;
  loopStage: AutopilotLoopStage;
  allowedFiles: string[];
  forbiddenFiles: string[];
  entryCriteria: string[];
  exitCriteria: string[];
  verificationPlan: AutopilotVerificationPlan;
  smokePlan: AutopilotSmokePlan;
  scopeCheck: AutopilotScopeCheckContract;
  forbiddenGrep: AutopilotForbiddenGrepContract;
  humanApprovalGate: AutopilotHumanApprovalGate;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noExecution: true;
  boundaries: AutopilotBoundarySet;
}

export const autopilotTaskStates = [
  "pending",
  "running",
  "codex_done",
  "validating",
  "needs_review",
  "approved",
  "failed",
  "blocked",
] as const satisfies readonly AutopilotTaskState[];

export const autopilotLoopStages = [
  "intake",
  "phase_planning",
  "task_creation",
  "codex_handoff",
  "codex_report",
  "validation",
  "memory_update_proposal",
  "next_action",
  "human_approval",
] as const satisfies readonly AutopilotLoopStage[];

export const autopilotRiskLevels = [
  "observe_only",
  "report_only",
  "plan_only",
  "propose_only",
  "execute_low_risk_future",
  "execute_gated_future",
  "critical_plan_only",
] as const satisfies readonly AutopilotRiskLevel[];

export const autopilotModes = [
  "B",
  "I",
  "R",
  "S",
] as const satisfies readonly AutopilotMode[];
