import { pmFoundationBoundaries } from "./boundaries.js";
import type {
  PMMilestoneId,
  PMTaskDependencyType,
  PMTaskGraphBuildResult,
  PMTaskGraphValidationFinding,
  PMTaskGraphValidationResult,
  PMTaskId,
  PMTaskPriority,
  PMTaskStatus,
  PMEvidenceReference,
  ProjectPhaseRef,
} from "./types.js";

const MAX_TEXT_LENGTH = 1200;
const MAX_ID_LENGTH = 160;
const MAX_ARRAY_LENGTH = 120;

const supportedTaskStatuses = [
  "planned",
  "ready",
  "in_progress",
  "blocked",
  "needs_review",
  "done",
  "deferred",
] as const satisfies readonly PMTaskStatus[];

const supportedTaskPriorities = [
  "low",
  "medium",
  "high",
  "critical",
] as const satisfies readonly PMTaskPriority[];

const supportedDependencyTypes = [
  "blocks",
  "requires",
  "related",
  "sequence_after",
] as const satisfies readonly PMTaskDependencyType[];

const forbiddenContentPatterns: Array<{
  pattern: RegExp;
  reasonCode: string;
  safeMessage: string;
}> = [
  {
    pattern:
      /api\s*key|token|secret|hookToken|credential\s+value|raw\s+prompt|raw\s+provider\s+output/i,
    reasonCode: "FORBIDDEN_PRIVATE_CONTENT",
    safeMessage: "Task graph metadata must not include secrets, tokens, provider output, or raw prompt content.",
  },
  {
    pattern:
      /write\s*File|append\s*File|fetch\s*\(|child[_-]process|exec\s*\(|spawn\s*\(/i,
    reasonCode: "FORBIDDEN_SOURCE_BEHAVIOR_TOKEN",
    safeMessage: "Task graph metadata must not include filesystem, network, or command execution behavior tokens.",
  },
  {
    pattern:
      /dashboard\/|src\/runtime\/|src\/scaffold\/|src\/connectors\/|src\/actions\/|src\/jobs\/|src\/automation\//i,
    reasonCode: "FORBIDDEN_LIVE_ADJACENT_REFERENCE",
    safeMessage: "Task graph metadata must not point at live-adjacent implementation surfaces.",
  },
  {
    pattern:
      /\bproduction-ready\b|\bproduction ready\b|\bfully autonomous\b|\bself-approve\b|\bdeploy now\b|\brun in prod\b/i,
    reasonCode: "FORBIDDEN_OVERCLAIM",
    safeMessage: "Task graph metadata must not include production, full autonomy, self-approval, or deployment claims.",
  },
  {
    pattern:
      /\b(reads|writes|scans|executes|dispatches|approves|runs|mutates|persists|schedules)\s+(files|filesystem|repository|runtime|dashboard|automation|connector|store|jobs|actions|approval|workflow|memory|tasks)\b/i,
    reasonCode: "EXECUTABLE_BEHAVIOR_WORDING",
    safeMessage: "Task graph metadata must not describe operational execution, scheduling, persistence, or mutation behavior.",
  },
];

export interface PMTaskDependency {
  dependencyId: string;
  fromTaskId: PMTaskId;
  toTaskId: PMTaskId;
  dependencyType: PMTaskDependencyType;
  safeSummary: string;
  metadataOnly: true;
  noExecution: true;
}

export interface PMTaskNode {
  taskId: PMTaskId;
  label: string;
  safeSummary: string;
  status: PMTaskStatus;
  priority: PMTaskPriority;
  phaseRef?: ProjectPhaseRef;
  milestoneId?: PMMilestoneId;
  dependencies: PMTaskDependency[];
  evidenceRefs: PMEvidenceReference[];
  assumptions: string[];
  exclusions: string[];
  metadataOnly: true;
  noExecution: true;
}

export interface PMTaskGraph {
  graphId: string;
  schemaVersion: "1.0";
  name: string;
  safeSummary: string;
  tasks: PMTaskNode[];
  dependencies: PMTaskDependency[];
  orderedTaskIds: PMTaskId[];
  assumptions: string[];
  exclusions: string[];
  advisoryOnly: true;
  sourceOnly: true;
  boundaries: typeof pmFoundationBoundaries;
}

export interface PMTaskGraphInput {
  graphId?: string;
  name?: string;
  safeSummary?: string;
  tasks: PMTaskNode[];
  dependencies?: PMTaskDependency[];
  assumptions?: string[];
  exclusions?: string[];
}

export interface PMTaskGraphOrderResult {
  ok: boolean;
  orderedTaskIds: PMTaskId[];
  findings: PMTaskGraphValidationFinding[];
  advisoryOnly: true;
  sourceOnly: true;
  boundaries: typeof pmFoundationBoundaries;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const safeStringValues = (value: unknown, acc: string[] = []): string[] => {
  if (typeof value === "string") {
    acc.push(value);
    return acc;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => safeStringValues(item, acc));
    return acc;
  }
  if (isObject(value)) {
    Object.values(value).forEach((item) => safeStringValues(item, acc));
  }
  return acc;
};

const addFinding = (
  findings: PMTaskGraphValidationFinding[],
  severity: PMTaskGraphValidationFinding["severity"],
  reasonCode: string,
  safeMessage: string,
  path?: string,
  taskId?: PMTaskId,
  metadata?: PMTaskGraphValidationFinding["metadata"],
): void => {
  findings.push({
    id: `finding_${findings.length + 1}`,
    severity,
    reasonCode,
    safeMessage,
    ...(path ? { path } : {}),
    ...(taskId ? { taskId } : {}),
    ...(metadata ? { metadata } : {}),
  });
};

const makeValidationResult = (
  findings: PMTaskGraphValidationFinding[],
  orderedTaskIds: PMTaskId[] = [],
): PMTaskGraphValidationResult => {
  const errors = findings.filter((finding) => finding.severity === "fail");
  const warnings = findings.filter((finding) => finding.severity === "warn");

  return {
    validationId: "task_graph_validation:103I",
    schemaVersion: "1.0",
    valid: errors.length === 0,
    status: errors.length > 0 ? "fail" : warnings.length > 0 ? "warn" : "pass",
    findings,
    warnings,
    errors,
    orderedTaskIds,
    advisoryOnly: true,
    sourceOnly: true,
    boundaries: pmFoundationBoundaries,
  };
};

const checkText = (
  value: unknown,
  findings: PMTaskGraphValidationFinding[],
  path: string,
  required = false,
  maxLength = MAX_TEXT_LENGTH,
  taskId?: PMTaskId,
): void => {
  if (typeof value !== "string" || !value.trim()) {
    if (required) {
      addFinding(
        findings,
        "fail",
        "REQUIRED_TEXT_MISSING",
        "Required task graph text fields must be present and non-empty.",
        path,
        taskId,
      );
    }
    return;
  }

  if (value !== value.trim()) {
    addFinding(
      findings,
      "fail",
      "TEXT_NOT_TRIMMED",
      "Task graph identifiers and bounded text fields must be trimmed.",
      path,
      taskId,
    );
  }

  if (value.length > maxLength) {
    addFinding(
      findings,
      "fail",
      "TEXT_TOO_LONG",
      "Task graph text exceeds the bounded length limit.",
      path,
      taskId,
      { maxLength },
    );
  }
};

const checkArray = (
  value: unknown,
  findings: PMTaskGraphValidationFinding[],
  path: string,
  required = true,
): void => {
  if (!Array.isArray(value)) {
    if (required) {
      addFinding(
        findings,
        "fail",
        "REQUIRED_ARRAY_MISSING",
        "Task graph arrays must be present.",
        path,
      );
    }
    return;
  }

  if (value.length > MAX_ARRAY_LENGTH) {
    addFinding(
      findings,
      "fail",
      "ARRAY_TOO_LONG",
      "Task graph arrays must stay within bounded metadata limits.",
      path,
      undefined,
      { maxItems: MAX_ARRAY_LENGTH },
    );
  }
};

const checkForbiddenContent = (
  value: unknown,
  findings: PMTaskGraphValidationFinding[],
): void => {
  safeStringValues(value).forEach((text) => {
    forbiddenContentPatterns.forEach(({ pattern, reasonCode, safeMessage }) => {
      if (pattern.test(text)) {
        addFinding(findings, "fail", reasonCode, safeMessage);
      }
    });
  });
};

const dependencyKey = (dependency: PMTaskDependency): string =>
  `${dependency.fromTaskId}->${dependency.toTaskId}:${dependency.dependencyType}`;

const collectDependencies = (tasks: PMTaskNode[], rootDependencies: PMTaskDependency[]): PMTaskDependency[] => {
  const byKey = new Map<string, PMTaskDependency>();
  [...rootDependencies, ...tasks.flatMap((task) => task.dependencies)].forEach((dependency) => {
    byKey.set(dependencyKey(dependency), dependency);
  });
  return Array.from(byKey.values());
};

const validateTaskNode = (
  task: unknown,
  index: number,
  findings: PMTaskGraphValidationFinding[],
): task is PMTaskNode => {
  if (!isObject(task)) {
    addFinding(
      findings,
      "fail",
      "TASK_NOT_OBJECT",
      "Task graph tasks must be metadata objects.",
      `tasks.${index}`,
    );
    return false;
  }

  const taskId = typeof task.taskId === "string" ? task.taskId : undefined;
  checkText(task.taskId, findings, `tasks.${index}.taskId`, true, MAX_ID_LENGTH, taskId);
  checkText(task.label, findings, `tasks.${index}.label`, true, MAX_TEXT_LENGTH, taskId);
  checkText(task.safeSummary, findings, `tasks.${index}.safeSummary`, true, MAX_TEXT_LENGTH, taskId);
  checkText(task.phaseRef, findings, `tasks.${index}.phaseRef`, false, MAX_ID_LENGTH, taskId);

  if (!supportedTaskStatuses.includes(task.status as PMTaskStatus)) {
    addFinding(
      findings,
      "fail",
      "TASK_STATUS_UNSUPPORTED",
      "Task status must be one of the supported advisory task statuses.",
      `tasks.${index}.status`,
      taskId,
    );
  }

  if (!supportedTaskPriorities.includes(task.priority as PMTaskPriority)) {
    addFinding(
      findings,
      "fail",
      "TASK_PRIORITY_UNSUPPORTED",
      "Task priority must be one of the supported advisory task priorities.",
      `tasks.${index}.priority`,
      taskId,
    );
  }

  checkArray(task.dependencies, findings, `tasks.${index}.dependencies`);
  checkArray(task.evidenceRefs, findings, `tasks.${index}.evidenceRefs`);
  checkArray(task.assumptions, findings, `tasks.${index}.assumptions`);
  checkArray(task.exclusions, findings, `tasks.${index}.exclusions`);

  if (task.metadataOnly !== true || task.noExecution !== true) {
    addFinding(
      findings,
      "fail",
      "TASK_NOT_METADATA_ONLY",
      "Task nodes must remain metadata-only and non-executing.",
      `tasks.${index}`,
      taskId,
    );
  }

  if (Array.isArray(task.evidenceRefs)) {
    task.evidenceRefs.forEach((evidence, evidenceIndex) => {
      if (!isObject(evidence) || evidence.metadataOnly !== true || evidence.noFileRead !== true) {
        addFinding(
          findings,
          "fail",
          "EVIDENCE_REF_NOT_METADATA_ONLY",
          "Task graph evidence refs must be metadata-only and must not read files.",
          `tasks.${index}.evidenceRefs.${evidenceIndex}`,
          taskId,
        );
      }
    });
  }

  return true;
};

const validateDependency = (
  dependency: unknown,
  index: number,
  taskIds: Set<PMTaskId>,
  findings: PMTaskGraphValidationFinding[],
  pathPrefix = "dependencies",
): dependency is PMTaskDependency => {
  if (!isObject(dependency)) {
    addFinding(
      findings,
      "fail",
      "DEPENDENCY_NOT_OBJECT",
      "Task dependencies must be metadata objects.",
      `${pathPrefix}.${index}`,
    );
    return false;
  }

  checkText(dependency.dependencyId, findings, `${pathPrefix}.${index}.dependencyId`, true, MAX_ID_LENGTH);
  checkText(dependency.fromTaskId, findings, `${pathPrefix}.${index}.fromTaskId`, true, MAX_ID_LENGTH);
  checkText(dependency.toTaskId, findings, `${pathPrefix}.${index}.toTaskId`, true, MAX_ID_LENGTH);
  checkText(dependency.safeSummary, findings, `${pathPrefix}.${index}.safeSummary`, true);

  if (!supportedDependencyTypes.includes(dependency.dependencyType as PMTaskDependencyType)) {
    addFinding(
      findings,
      "fail",
      "DEPENDENCY_TYPE_UNSUPPORTED",
      "Task dependency type must be supported advisory metadata.",
      `${pathPrefix}.${index}.dependencyType`,
    );
  }

  const fromTaskId = dependency.fromTaskId as string;
  const toTaskId = dependency.toTaskId as string;
  if (typeof fromTaskId === "string" && !taskIds.has(fromTaskId)) {
    addFinding(
      findings,
      "fail",
      "DEPENDENCY_FROM_TASK_MISSING",
      "Task dependency source must reference a known task id.",
      `${pathPrefix}.${index}.fromTaskId`,
      fromTaskId,
    );
  }
  if (typeof toTaskId === "string" && !taskIds.has(toTaskId)) {
    addFinding(
      findings,
      "fail",
      "DEPENDENCY_TO_TASK_MISSING",
      "Task dependency target must reference a known task id.",
      `${pathPrefix}.${index}.toTaskId`,
      toTaskId,
    );
  }

  if (dependency.metadataOnly !== true || dependency.noExecution !== true) {
    addFinding(
      findings,
      "fail",
      "DEPENDENCY_NOT_METADATA_ONLY",
      "Task dependencies must remain metadata-only and non-executing.",
      `${pathPrefix}.${index}`,
    );
  }

  return true;
};

const dependencyEdges = (dependencies: PMTaskDependency[]): Array<[PMTaskId, PMTaskId]> =>
  dependencies
    .filter((dependency) => dependency.dependencyType !== "related")
    .map((dependency) => [dependency.toTaskId, dependency.fromTaskId]);

const topoOrder = (
  taskIds: PMTaskId[],
  dependencies: PMTaskDependency[],
): PMTaskGraphOrderResult => {
  const findings: PMTaskGraphValidationFinding[] = [];
  const adjacency = new Map<PMTaskId, PMTaskId[]>();
  const indegree = new Map<PMTaskId, number>();

  taskIds.forEach((taskId) => {
    adjacency.set(taskId, []);
    indegree.set(taskId, 0);
  });

  dependencyEdges(dependencies).forEach(([from, to]) => {
    if (!adjacency.has(from) || !indegree.has(to)) return;
    adjacency.get(from)?.push(to);
    indegree.set(to, (indegree.get(to) ?? 0) + 1);
  });

  const queue = taskIds.filter((taskId) => (indegree.get(taskId) ?? 0) === 0);
  const orderedTaskIds: PMTaskId[] = [];

  while (queue.length > 0) {
    const taskId = queue.shift() as PMTaskId;
    orderedTaskIds.push(taskId);
    adjacency.get(taskId)?.forEach((nextTaskId) => {
      const nextIndegree = (indegree.get(nextTaskId) ?? 0) - 1;
      indegree.set(nextTaskId, nextIndegree);
      if (nextIndegree === 0) queue.push(nextTaskId);
    });
  }

  if (orderedTaskIds.length !== taskIds.length) {
    const cycleTaskIds = taskIds.filter((taskId) => !orderedTaskIds.includes(taskId));
    addFinding(
      findings,
      "fail",
      "TASK_GRAPH_CYCLE_DETECTED",
      "Task graph contains a dependency cycle and cannot produce a full advisory order.",
      "dependencies",
      undefined,
      { cycleTaskCount: cycleTaskIds.length },
    );
  }

  return {
    ok: findings.length === 0,
    orderedTaskIds,
    findings,
    advisoryOnly: true,
    sourceOnly: true,
    boundaries: pmFoundationBoundaries,
  };
};

export const buildTaskGraphOrder = (graph: PMTaskGraph): PMTaskGraphOrderResult =>
  topoOrder(
    graph.tasks.map((task) => task.taskId),
    graph.dependencies,
  );

export const validateTaskGraph = (input: unknown): PMTaskGraphValidationResult => {
  const findings: PMTaskGraphValidationFinding[] = [];

  if (!isObject(input)) {
    addFinding(
      findings,
      "fail",
      "TASK_GRAPH_NOT_OBJECT",
      "Task graph input must be a metadata object.",
    );
    return makeValidationResult(findings);
  }

  if (input.schemaVersion !== undefined && input.schemaVersion !== "1.0") {
    addFinding(
      findings,
      "fail",
      "SCHEMA_VERSION_INVALID",
      "Task graph schemaVersion must be 1.0 when provided.",
      "schemaVersion",
    );
  }

  checkText(input.graphId, findings, "graphId", false, MAX_ID_LENGTH);
  checkText(input.name, findings, "name", false);
  checkText(input.safeSummary, findings, "safeSummary", false);
  checkArray(input.tasks, findings, "tasks");
  checkArray(input.dependencies, findings, "dependencies", false);
  checkArray(input.assumptions, findings, "assumptions", false);
  checkArray(input.exclusions, findings, "exclusions", false);
  checkForbiddenContent(input, findings);

  const taskCandidates = Array.isArray(input.tasks) ? input.tasks : [];
  const tasks = taskCandidates.filter((task, index): task is PMTaskNode =>
    validateTaskNode(task, index, findings),
  );

  const seenTaskIds = new Set<PMTaskId>();
  tasks.forEach((task, index) => {
    if (seenTaskIds.has(task.taskId)) {
      addFinding(
        findings,
        "fail",
        "TASK_ID_DUPLICATE",
        "Task ids must be unique within a task graph.",
        `tasks.${index}.taskId`,
        task.taskId,
      );
    }
    seenTaskIds.add(task.taskId);
  });

  const taskIds = new Set(tasks.map((task) => task.taskId));
  const rootDependencies = Array.isArray(input.dependencies)
    ? input.dependencies.filter((dependency, index): dependency is PMTaskDependency =>
        validateDependency(dependency, index, taskIds, findings),
      )
    : [];

  tasks.forEach((task, taskIndex) => {
    task.dependencies.forEach((dependency, dependencyIndex) => {
      validateDependency(
        dependency,
        dependencyIndex,
        taskIds,
        findings,
        `tasks.${taskIndex}.dependencies`,
      );
    });
  });

  const dependencies = collectDependencies(tasks, rootDependencies);
  const order = topoOrder(Array.from(taskIds), dependencies);
  findings.push(...order.findings);

  return makeValidationResult(findings, order.orderedTaskIds);
};

export const buildTaskGraph = (input: PMTaskGraphInput): PMTaskGraphBuildResult & { graph?: PMTaskGraph } => {
  const validation = validateTaskGraph(input);
  if (!validation.valid) {
    return {
      ok: false,
      status: "input_invalid",
      orderedTaskIds: validation.orderedTaskIds,
      validation,
      advisoryOnly: true,
      sourceOnly: true,
      boundaries: pmFoundationBoundaries,
    };
  }

  const dependencies = collectDependencies(input.tasks, input.dependencies ?? []);
  const graph: PMTaskGraph = {
    graphId: input.graphId?.trim() || "task-graph:advisory:103I",
    schemaVersion: "1.0",
    name: input.name?.trim() || "Advisory PM task graph",
    safeSummary:
      input.safeSummary?.trim() ||
      "Source-only advisory task graph for planning order review.",
    tasks: input.tasks.map((task) => ({
      ...task,
      dependencies: task.dependencies.map((dependency) => ({ ...dependency })),
      evidenceRefs: task.evidenceRefs.map((evidence) => ({ ...evidence })),
      assumptions: task.assumptions.slice(),
      exclusions: task.exclusions.slice(),
    })),
    dependencies: dependencies.map((dependency) => ({ ...dependency })),
    orderedTaskIds: validation.orderedTaskIds.slice(),
    assumptions: (input.assumptions ?? []).slice(),
    exclusions: (input.exclusions ?? []).slice(),
    advisoryOnly: true,
    sourceOnly: true,
    boundaries: pmFoundationBoundaries,
  };

  return {
    ok: true,
    status: "graph_built",
    graph,
    orderedTaskIds: graph.orderedTaskIds.slice(),
    validation,
    advisoryOnly: true,
    sourceOnly: true,
    boundaries: pmFoundationBoundaries,
  };
};
