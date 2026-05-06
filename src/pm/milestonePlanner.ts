import { pmFoundationBoundaries } from "./boundaries.js";
import type {
  PMMilestoneHealth,
  PMMilestoneId,
  PMMilestoneStatus,
  PMTaskGraphValidationFinding,
  PMTaskGraphValidationResult,
  PMTaskId,
  PMTaskStatus,
  ProjectPhaseRef,
} from "./types.js";
import type { PMTaskGraph, PMTaskNode } from "./taskGraph.js";

const MAX_TEXT_LENGTH = 1200;
const MAX_ID_LENGTH = 160;
const MAX_ARRAY_LENGTH = 120;

export interface PMMilestone {
  milestoneId: PMMilestoneId;
  label: string;
  safeSummary: string;
  status: PMMilestoneStatus;
  phaseRef?: ProjectPhaseRef;
  taskIds: PMTaskId[];
  metadataOnly: true;
  noExecution: true;
}

export interface PMMilestoneHealthSummary {
  milestoneId: PMMilestoneId;
  health: PMMilestoneHealth;
  taskCount: number;
  doneCount: number;
  blockedCount: number;
  inProgressCount: number;
  plannedCount: number;
  metadataOnly: true;
  advisoryOnly: true;
  noExecution: true;
}

export interface PMMilestonePlan {
  planId: string;
  schemaVersion: "1.0";
  milestones: PMMilestone[];
  healthSummaries: PMMilestoneHealthSummary[];
  advisoryOnly: true;
  sourceOnly: true;
  boundaries: typeof pmFoundationBoundaries;
}

export interface PMMilestonePlanResult {
  ok: boolean;
  status: "plan_built" | "input_invalid";
  plan?: PMMilestonePlan;
  validation: PMTaskGraphValidationResult;
  advisoryOnly: true;
  sourceOnly: true;
  boundaries: typeof pmFoundationBoundaries;
}

const supportedMilestoneStatuses = [
  "empty",
  "planned",
  "in_progress",
  "blocked",
  "complete",
  "mixed",
] as const satisfies readonly PMMilestoneStatus[];

const makeValidationResult = (
  findings: PMTaskGraphValidationFinding[],
): PMTaskGraphValidationResult => {
  const errors = findings.filter((finding) => finding.severity === "fail");
  const warnings = findings.filter((finding) => finding.severity === "warn");

  return {
    validationId: "milestone_plan_validation:103I",
    schemaVersion: "1.0",
    valid: errors.length === 0,
    status: errors.length > 0 ? "fail" : warnings.length > 0 ? "warn" : "pass",
    findings,
    warnings,
    errors,
    orderedTaskIds: [],
    advisoryOnly: true,
    sourceOnly: true,
    boundaries: pmFoundationBoundaries,
  };
};

const addFinding = (
  findings: PMTaskGraphValidationFinding[],
  severity: PMTaskGraphValidationFinding["severity"],
  reasonCode: string,
  safeMessage: string,
  path?: string,
  milestoneId?: PMMilestoneId,
  metadata?: PMTaskGraphValidationFinding["metadata"],
): void => {
  findings.push({
    id: `finding_${findings.length + 1}`,
    severity,
    reasonCode,
    safeMessage,
    ...(path ? { path } : {}),
    ...(milestoneId ? { milestoneId } : {}),
    ...(metadata ? { metadata } : {}),
  });
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const checkText = (
  value: unknown,
  findings: PMTaskGraphValidationFinding[],
  path: string,
  required = false,
  maxLength = MAX_TEXT_LENGTH,
  milestoneId?: PMMilestoneId,
): void => {
  if (typeof value !== "string" || !value.trim()) {
    if (required) {
      addFinding(
        findings,
        "fail",
        "REQUIRED_TEXT_MISSING",
        "Required milestone text fields must be present and non-empty.",
        path,
        milestoneId,
      );
    }
    return;
  }

  if (value !== value.trim()) {
    addFinding(
      findings,
      "fail",
      "TEXT_NOT_TRIMMED",
      "Milestone identifiers and bounded text fields must be trimmed.",
      path,
      milestoneId,
    );
  }

  if (value.length > maxLength) {
    addFinding(
      findings,
      "fail",
      "TEXT_TOO_LONG",
      "Milestone text exceeds the bounded length limit.",
      path,
      milestoneId,
      { maxLength },
    );
  }
};

const checkArray = (
  value: unknown,
  findings: PMTaskGraphValidationFinding[],
  path: string,
): void => {
  if (!Array.isArray(value)) {
    addFinding(
      findings,
      "fail",
      "REQUIRED_ARRAY_MISSING",
      "Milestone arrays must be present.",
      path,
    );
    return;
  }

  if (value.length > MAX_ARRAY_LENGTH) {
    addFinding(
      findings,
      "fail",
      "ARRAY_TOO_LONG",
      "Milestone arrays must stay within bounded metadata limits.",
      path,
      undefined,
      { maxItems: MAX_ARRAY_LENGTH },
    );
  }
};

const taskStatusCounts = (tasks: PMTaskNode[]) => ({
  doneCount: tasks.filter((task) => task.status === "done").length,
  blockedCount: tasks.filter((task) => task.status === "blocked").length,
  inProgressCount: tasks.filter((task) =>
    ["in_progress", "needs_review"].includes(task.status),
  ).length,
  plannedCount: tasks.filter((task) =>
    ["planned", "ready", "deferred"].includes(task.status),
  ).length,
});

const healthFromStatuses = (statuses: PMTaskStatus[]): PMMilestoneHealth => {
  if (statuses.length === 0) return "empty";
  if (statuses.every((status) => status === "done")) return "complete";
  if (statuses.some((status) => status === "blocked")) return "blocked";
  if (statuses.some((status) => status === "in_progress" || status === "needs_review")) {
    return "in_progress";
  }
  const uniqueStatuses = new Set(statuses);
  if (
    [...uniqueStatuses].every((status) => ["planned", "ready", "deferred"].includes(status))
  ) {
    return uniqueStatuses.size === 1 ? "planned" : "mixed";
  }
  return "mixed";
};

export const summarizeMilestoneHealth = (
  milestone: PMMilestone,
  tasks: PMTaskNode[],
): PMMilestoneHealthSummary => {
  const milestoneTasks = tasks.filter((task) => milestone.taskIds.includes(task.taskId));
  const counts = taskStatusCounts(milestoneTasks);

  return {
    milestoneId: milestone.milestoneId,
    health: healthFromStatuses(milestoneTasks.map((task) => task.status)),
    taskCount: milestoneTasks.length,
    ...counts,
    metadataOnly: true,
    advisoryOnly: true,
    noExecution: true,
  };
};

export const validateMilestonePlan = (input: unknown): PMTaskGraphValidationResult => {
  const findings: PMTaskGraphValidationFinding[] = [];

  if (!isObject(input)) {
    addFinding(
      findings,
      "fail",
      "MILESTONE_PLAN_NOT_OBJECT",
      "Milestone plan input must be a metadata object.",
    );
    return makeValidationResult(findings);
  }

  checkArray(input.milestones, findings, "milestones");

  const milestones = Array.isArray(input.milestones) ? input.milestones : [];
  const graph = isObject(input.taskGraph) ? (input.taskGraph as Partial<PMTaskGraph>) : undefined;
  const taskIds = new Set(
    Array.isArray(graph?.tasks) ? graph.tasks.map((task) => task.taskId) : [],
  );

  if (!graph || !Array.isArray(graph.tasks)) {
    addFinding(
      findings,
      "fail",
      "TASK_GRAPH_REQUIRED",
      "Milestone plans require a provided advisory task graph object.",
      "taskGraph",
    );
  }

  const seenMilestoneIds = new Set<PMMilestoneId>();
  milestones.forEach((milestone, index) => {
    if (!isObject(milestone)) {
      addFinding(
        findings,
        "fail",
        "MILESTONE_NOT_OBJECT",
        "Milestones must be metadata objects.",
        `milestones.${index}`,
      );
      return;
    }

    const milestoneId = typeof milestone.milestoneId === "string" ? milestone.milestoneId : undefined;
    checkText(milestone.milestoneId, findings, `milestones.${index}.milestoneId`, true, MAX_ID_LENGTH, milestoneId);
    checkText(milestone.label, findings, `milestones.${index}.label`, true, MAX_TEXT_LENGTH, milestoneId);
    checkText(milestone.safeSummary, findings, `milestones.${index}.safeSummary`, true, MAX_TEXT_LENGTH, milestoneId);
    checkText(milestone.phaseRef, findings, `milestones.${index}.phaseRef`, false, MAX_ID_LENGTH, milestoneId);
    checkArray(milestone.taskIds, findings, `milestones.${index}.taskIds`);

    if (!supportedMilestoneStatuses.includes(milestone.status as PMMilestoneStatus)) {
      addFinding(
        findings,
        "fail",
        "MILESTONE_STATUS_UNSUPPORTED",
        "Milestone status must be supported advisory metadata.",
        `milestones.${index}.status`,
        milestoneId,
      );
    }

    if (milestone.metadataOnly !== true || milestone.noExecution !== true) {
      addFinding(
        findings,
        "fail",
        "MILESTONE_NOT_METADATA_ONLY",
        "Milestones must remain metadata-only and non-executing.",
        `milestones.${index}`,
        milestoneId,
      );
    }

    if (typeof milestoneId === "string") {
      if (seenMilestoneIds.has(milestoneId)) {
        addFinding(
          findings,
          "fail",
          "MILESTONE_ID_DUPLICATE",
          "Milestone ids must be unique.",
          `milestones.${index}.milestoneId`,
          milestoneId,
        );
      }
      seenMilestoneIds.add(milestoneId);
    }

    if (Array.isArray(milestone.taskIds)) {
      milestone.taskIds.forEach((taskId: unknown, taskIndex: number) => {
        if (typeof taskId !== "string" || !taskId.trim()) {
          addFinding(
            findings,
            "fail",
            "MILESTONE_TASK_ID_INVALID",
            "Milestone task ids must be non-empty strings.",
            `milestones.${index}.taskIds.${taskIndex}`,
            milestoneId,
          );
          return;
        }
        if (!taskIds.has(taskId)) {
          addFinding(
            findings,
            "fail",
            "MILESTONE_TASK_ID_MISSING",
            "Milestones must reference known task ids.",
            `milestones.${index}.taskIds.${taskIndex}`,
            milestoneId,
            { missingTaskId: taskId },
          );
        }
      });
    }
  });

  return makeValidationResult(findings);
};

export const buildMilestonePlan = (input: {
  milestones: PMMilestone[];
  taskGraph: PMTaskGraph;
}): PMMilestonePlanResult => {
  const validation = validateMilestonePlan(input);
  if (!validation.valid) {
    return {
      ok: false,
      status: "input_invalid",
      validation,
      advisoryOnly: true,
      sourceOnly: true,
      boundaries: pmFoundationBoundaries,
    };
  }

  const plan: PMMilestonePlan = {
    planId: "milestone-plan:advisory:103I",
    schemaVersion: "1.0",
    milestones: input.milestones.map((milestone) => ({
      ...milestone,
      taskIds: milestone.taskIds.slice(),
    })),
    healthSummaries: input.milestones.map((milestone) =>
      summarizeMilestoneHealth(milestone, input.taskGraph.tasks),
    ),
    advisoryOnly: true,
    sourceOnly: true,
    boundaries: pmFoundationBoundaries,
  };

  return {
    ok: true,
    status: "plan_built",
    plan,
    validation,
    advisoryOnly: true,
    sourceOnly: true,
    boundaries: pmFoundationBoundaries,
  };
};
