import { pmFoundationBoundaries, pmRiskSurfaces } from "./boundaries.js";
import type {
  PMBoundarySet,
  PMEvidenceReference,
  PMFindingSeverity,
  PMMilestoneId,
  PMRiskSurface,
  PMTaskId,
  PMSchemaVersion,
  ProjectPhaseRef,
} from "./types.js";
import {
  addRiskBlockerFinding,
  checkRiskBlockerArray,
  checkRiskBlockerEvidenceRefs,
  checkRiskBlockerForbiddenContent,
  makeRiskBlockerValidationResult,
  pmRiskSeverities,
  type PMRiskBlockerFinding,
  type PMRiskBlockerValidationResult,
  type PMRiskSeverity,
} from "./riskModel.js";

export type PMBlockerId = string;

export type PMBlockerStatus =
  | "open"
  | "watching"
  | "blocked"
  | "resolved_metadata_only"
  | "deferred";

export interface PMBlocker {
  blockerId: PMBlockerId;
  label: string;
  safeSummary: string;
  status: PMBlockerStatus;
  severity: PMRiskSeverity;
  riskSurfaces: PMRiskSurface[];
  blockedPhaseRefs: ProjectPhaseRef[];
  blockedTaskIds: PMTaskId[];
  blockedMilestoneIds: PMMilestoneId[];
  blockedDodRefs: string[];
  evidenceRefs: PMEvidenceReference[];
  assumptions: string[];
  exclusions: string[];
  metadataOnly: true;
  advisoryOnly: true;
  noExecution: true;
  noResolutionExecution: true;
  noActionProposalApprovalExecution: true;
  noJobsExecution: true;
  boundaries: PMBoundarySet;
}

export interface PMBlockerRule {
  ruleId: string;
  label: string;
  safeSummary: string;
  knownTaskIds?: PMTaskId[];
  knownMilestoneIds?: PMMilestoneId[];
  warnOnUnknownRefs: boolean;
  metadataOnly: true;
  advisoryOnly: true;
  noExecution: true;
}

export interface PMBlockerEvaluationResult {
  validationId: string;
  schemaVersion: PMSchemaVersion;
  valid: boolean;
  status: "pass" | "warn" | "fail";
  blockers: PMBlocker[];
  findings: PMRiskBlockerFinding[];
  warnings: PMRiskBlockerFinding[];
  errors: PMRiskBlockerFinding[];
  advisoryOnly: true;
  sourceOnly: true;
  noExecution: true;
  noResolutionExecution: true;
  boundaries: PMBoundarySet;
}

const MAX_TEXT_LENGTH = 1200;
const MAX_ID_LENGTH = 160;
const MAX_ARRAY_LENGTH = 120;

export const pmBlockerStatuses = [
  "open",
  "watching",
  "blocked",
  "resolved_metadata_only",
  "deferred",
] as const satisfies readonly PMBlockerStatus[];

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const checkText = (
  value: unknown,
  findings: PMRiskBlockerFinding[],
  path: string,
  required = false,
  maxLength = MAX_TEXT_LENGTH,
  blockerId?: PMBlockerId,
): void => {
  if (typeof value !== "string" || !value.trim()) {
    if (required) {
      addRiskBlockerFinding(
        findings,
        "fail",
        "REQUIRED_TEXT_MISSING",
        "Required blocker text fields must be present and non-empty.",
        path,
        undefined,
        blockerId,
      );
    }
    return;
  }

  if (value !== value.trim()) {
    addRiskBlockerFinding(
      findings,
      "fail",
      "TEXT_NOT_TRIMMED",
      "Blocker identifiers and bounded text fields must be trimmed.",
      path,
      undefined,
      blockerId,
    );
  }

  if (value.length > maxLength) {
    addRiskBlockerFinding(
      findings,
      "fail",
      "TEXT_TOO_LONG",
      "Blocker text exceeds the bounded length limit.",
      path,
      undefined,
      blockerId,
      { maxLength },
    );
  }
};

const checkStringRefArray = (
  value: unknown,
  findings: PMRiskBlockerFinding[],
  path: string,
  blockerId?: PMBlockerId,
): string[] => {
  checkRiskBlockerArray(value, findings, path);
  if (!Array.isArray(value)) return [];

  value.forEach((item, index) => {
    checkText(item, findings, `${path}.${index}`, false, MAX_ID_LENGTH, blockerId);
    if (typeof item === "string" && /([A-Za-z]:\\|\/home\/|\/Users\/|\/tmp\/|\\|\/{2,})/.test(item)) {
      addRiskBlockerFinding(
        findings,
        "fail",
        "REFERENCE_PATH_LIKE",
        "Blocker references must be metadata ids, not absolute paths.",
        `${path}.${index}`,
        undefined,
        blockerId,
      );
    }
  });

  return value.filter((item): item is string => typeof item === "string");
};

const checkKnownRiskSurface = (
  value: unknown,
  findings: PMRiskBlockerFinding[],
  path: string,
  blockerId?: PMBlockerId,
): void => {
  if (!pmRiskSurfaces.includes(value as PMRiskSurface)) {
    addRiskBlockerFinding(
      findings,
      "fail",
      "RISK_SURFACE_UNSUPPORTED",
      "Blocker risk surfaces must use the supported PM risk surface vocabulary.",
      path,
      undefined,
      blockerId,
    );
  }
};

const validateBlockerObject = (
  blocker: unknown,
  index: number,
  findings: PMRiskBlockerFinding[],
): blocker is PMBlocker => {
  if (!isObject(blocker)) {
    addRiskBlockerFinding(
      findings,
      "fail",
      "BLOCKER_NOT_OBJECT",
      "Blockers must be metadata objects.",
      `blockers.${index}`,
    );
    return false;
  }

  const blockerId = typeof blocker.blockerId === "string" ? blocker.blockerId : undefined;
  checkText(blocker.blockerId, findings, `blockers.${index}.blockerId`, true, MAX_ID_LENGTH, blockerId);
  checkText(blocker.label, findings, `blockers.${index}.label`, true, MAX_TEXT_LENGTH, blockerId);
  checkText(blocker.safeSummary, findings, `blockers.${index}.safeSummary`, true, MAX_TEXT_LENGTH, blockerId);
  checkRiskBlockerArray(blocker.riskSurfaces, findings, `blockers.${index}.riskSurfaces`);
  checkRiskBlockerArray(blocker.assumptions, findings, `blockers.${index}.assumptions`);
  checkRiskBlockerArray(blocker.exclusions, findings, `blockers.${index}.exclusions`);
  checkStringRefArray(blocker.blockedPhaseRefs, findings, `blockers.${index}.blockedPhaseRefs`, blockerId);
  checkStringRefArray(blocker.blockedTaskIds, findings, `blockers.${index}.blockedTaskIds`, blockerId);
  checkStringRefArray(blocker.blockedMilestoneIds, findings, `blockers.${index}.blockedMilestoneIds`, blockerId);
  checkStringRefArray(blocker.blockedDodRefs, findings, `blockers.${index}.blockedDodRefs`, blockerId);

  if (!pmBlockerStatuses.includes(blocker.status as PMBlockerStatus)) {
    addRiskBlockerFinding(
      findings,
      "fail",
      "BLOCKER_STATUS_UNSUPPORTED",
      "Blocker status must use supported advisory values.",
      `blockers.${index}.status`,
      undefined,
      blockerId,
    );
  }

  if (!pmRiskSeverities.includes(blocker.severity as PMRiskSeverity)) {
    addRiskBlockerFinding(
      findings,
      "fail",
      "BLOCKER_SEVERITY_UNSUPPORTED",
      "Blocker severity must use supported advisory values.",
      `blockers.${index}.severity`,
      undefined,
      blockerId,
    );
  }

  if (Array.isArray(blocker.riskSurfaces)) {
    blocker.riskSurfaces.forEach((surface, surfaceIndex) =>
      checkKnownRiskSurface(surface, findings, `blockers.${index}.riskSurfaces.${surfaceIndex}`, blockerId),
    );
  }

  checkRiskBlockerEvidenceRefs(
    blocker.evidenceRefs,
    findings,
    `blockers.${index}.evidenceRefs`,
    undefined,
    blockerId,
  );

  if (
    blocker.metadataOnly !== true ||
    blocker.advisoryOnly !== true ||
    blocker.noExecution !== true ||
    blocker.noResolutionExecution !== true ||
    blocker.noActionProposalApprovalExecution !== true ||
    blocker.noJobsExecution !== true
  ) {
    addRiskBlockerFinding(
      findings,
      "fail",
      "BLOCKER_NOT_METADATA_ONLY",
      "Blockers must remain metadata-only, advisory, and non-executing.",
      `blockers.${index}`,
      undefined,
      blockerId,
    );
  }

  const boundaries = isObject(blocker.boundaries) ? blocker.boundaries : undefined;
  const missingBoundary = Object.keys(pmFoundationBoundaries).some(
    (key) => boundaries?.[key] !== true,
  );
  if (!boundaries || missingBoundary) {
    addRiskBlockerFinding(
      findings,
      "fail",
      "BOUNDARIES_REQUIRED",
      "Blockers must include all PM foundation boundaries.",
      `blockers.${index}.boundaries`,
      undefined,
      blockerId,
    );
  }

  return true;
};

const blockersFromInput = (input: unknown): unknown[] => {
  if (Array.isArray(input)) return input;
  if (isObject(input) && Array.isArray(input.blockers)) return input.blockers;
  return [input];
};

export const validateBlockers = (input: unknown): PMRiskBlockerValidationResult => {
  const findings: PMRiskBlockerFinding[] = [];
  checkRiskBlockerForbiddenContent(input, findings);

  const blockers = blockersFromInput(input);
  const seenBlockerIds = new Set<PMBlockerId>();
  blockers.forEach((blocker, index) => {
    if (validateBlockerObject(blocker, index, findings)) {
      if (seenBlockerIds.has(blocker.blockerId)) {
        addRiskBlockerFinding(
          findings,
          "fail",
          "BLOCKER_ID_DUPLICATE",
          "Blocker ids must be unique.",
          `blockers.${index}.blockerId`,
          undefined,
          blocker.blockerId,
        );
      }
      seenBlockerIds.add(blocker.blockerId);
    }
  });

  return makeRiskBlockerValidationResult(findings, "blocker_validation:105I");
};

const checkKnownRefs = (
  refs: string[],
  knownRefs: readonly string[] | undefined,
  findings: PMRiskBlockerFinding[],
  path: string,
  blockerId: PMBlockerId,
  reasonCode: string,
  safeMessage: string,
  warnOnly: boolean,
): void => {
  if (knownRefs === undefined) return;
  const known = new Set(knownRefs);
  refs.forEach((ref, index) => {
    if (!known.has(ref)) {
      addRiskBlockerFinding(
        findings,
        warnOnly ? "warn" : "fail",
        reasonCode,
        safeMessage,
        `${path}.${index}`,
        undefined,
        blockerId,
        { missingRef: ref },
      );
    }
  });
};

export const evaluateBlockers = (input: unknown): PMBlockerEvaluationResult => {
  const validation = validateBlockers(input);
  const findings = validation.findings.slice();
  const blockers = blockersFromInput(input).filter((blocker): blocker is PMBlocker => isObject(blocker));

  const knownTaskIds = isObject(input) && Array.isArray(input.knownTaskIds)
    ? input.knownTaskIds.filter((taskId): taskId is string => typeof taskId === "string")
    : undefined;
  const knownMilestoneIds = isObject(input) && Array.isArray(input.knownMilestoneIds)
    ? input.knownMilestoneIds.filter((milestoneId): milestoneId is string => typeof milestoneId === "string")
    : undefined;
  const warnOnUnknownRefs = isObject(input) && input.warnOnUnknownRefs === true;

  blockers.forEach((blocker, index) => {
    if (typeof blocker.blockerId !== "string") return;
    const taskRefs = Array.isArray(blocker.blockedTaskIds)
      ? blocker.blockedTaskIds.filter((taskId): taskId is string => typeof taskId === "string")
      : [];
    const milestoneRefs = Array.isArray(blocker.blockedMilestoneIds)
      ? blocker.blockedMilestoneIds.filter((milestoneId): milestoneId is string => typeof milestoneId === "string")
      : [];
    checkKnownRefs(
      taskRefs,
      knownTaskIds,
      findings,
      `blockers.${index}.blockedTaskIds`,
      blocker.blockerId,
      "BLOCKER_TASK_REF_UNKNOWN",
      "Blocker references a task id that is not in the caller-provided known task id set.",
      warnOnUnknownRefs,
    );
    checkKnownRefs(
      milestoneRefs,
      knownMilestoneIds,
      findings,
      `blockers.${index}.blockedMilestoneIds`,
      blocker.blockerId,
      "BLOCKER_MILESTONE_REF_UNKNOWN",
      "Blocker references a milestone id that is not in the caller-provided known milestone id set.",
      warnOnUnknownRefs,
    );
  });

  const result = makeRiskBlockerValidationResult(findings, "blocker_evaluation:105I");

  return {
    validationId: result.validationId,
    schemaVersion: result.schemaVersion,
    valid: result.valid,
    status: result.status,
    blockers,
    findings: result.findings,
    warnings: result.warnings,
    errors: result.errors,
    advisoryOnly: true,
    sourceOnly: true,
    noExecution: true,
    noResolutionExecution: true,
    boundaries: pmFoundationBoundaries,
  };
};
