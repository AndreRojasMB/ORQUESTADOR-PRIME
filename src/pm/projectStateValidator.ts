import {
  pmAllowedAutonomyLevels101To120,
  pmDeniedAutonomyLevels101To120,
  pmFoundationBoundaries,
  pmRiskSurfaces,
  pmRiskTiers,
} from "./boundaries.js";
import type {
  PMAllowedAutonomyLevel,
  ProjectSnapshot,
  ProjectState,
  ProjectStateStatus,
  ProjectStateValidationFinding,
  ProjectStateValidationResult,
} from "./types.js";

const MAX_TEXT_LENGTH = 1200;
const MAX_ID_LENGTH = 160;
const MAX_ARRAY_LENGTH = 120;

const supportedProjectStateStatuses = [
  "not_started",
  "observed",
  "reported",
  "planned",
  "proposed",
  "blocked",
  "deferred",
] as const satisfies readonly ProjectStateStatus[];

const forbiddenContentPatterns: Array<{
  pattern: RegExp;
  reasonCode: string;
  safeMessage: string;
}> = [
  {
    pattern:
      /api\s*key|token|secret|hookToken|credential\s+value|raw\s+prompt|raw\s+provider\s+output/i,
    reasonCode: "FORBIDDEN_PRIVATE_CONTENT",
    safeMessage: "ProjectState metadata must not include secrets, tokens, provider output, or raw prompt content.",
  },
  {
    pattern:
      /write\s*File|append\s*File|fetch\s*\(|child[_-]process|exec\s*\(|spawn\s*\(/i,
    reasonCode: "FORBIDDEN_SOURCE_BEHAVIOR_TOKEN",
    safeMessage: "ProjectState metadata must not include filesystem, network, or command execution behavior tokens.",
  },
  {
    pattern:
      /dashboard\/|src\/runtime\/|src\/scaffold\/|src\/connectors\/|src\/actions\/|src\/jobs\/|src\/automation\//i,
    reasonCode: "FORBIDDEN_LIVE_ADJACENT_REFERENCE",
    safeMessage: "ProjectState metadata must not point at live-adjacent implementation surfaces.",
  },
  {
    pattern:
      /\bproduction-ready\b|\bproduction ready\b|\bfully autonomous\b|\bself-approve\b|\bdeploy now\b|\brun in prod\b/i,
    reasonCode: "FORBIDDEN_OVERCLAIM",
    safeMessage: "ProjectState metadata must not include production, full autonomy, self-approval, or deployment claims.",
  },
  {
    pattern:
      /\b(reads|writes|scans|executes|dispatches|approves|runs|mutates|persists)\s+(files|filesystem|repository|runtime|dashboard|automation|connector|store|jobs|actions|approval|workflow|memory)\b/i,
    reasonCode: "EXECUTABLE_BEHAVIOR_WORDING",
    safeMessage: "ProjectState metadata must not describe operational execution, persistence, or mutation behavior.",
  },
];

const makeResult = (
  findings: ProjectStateValidationFinding[],
): ProjectStateValidationResult => {
  const errors = findings.filter((finding) => finding.severity === "fail");
  const warnings = findings.filter((finding) => finding.severity === "warn");

  return {
    validationId: "project_state_validation:102I",
    schemaVersion: "1.0",
    valid: errors.length === 0,
    status: errors.length > 0 ? "fail" : warnings.length > 0 ? "warn" : "pass",
    findings,
    warnings,
    errors,
    advisoryOnly: true,
    sourceOnly: true,
    boundaries: pmFoundationBoundaries,
  };
};

const addFinding = (
  findings: ProjectStateValidationFinding[],
  severity: ProjectStateValidationFinding["severity"],
  reasonCode: string,
  safeMessage: string,
  path?: string,
  metadata?: ProjectStateValidationFinding["metadata"],
): void => {
  findings.push({
    id: `finding_${findings.length + 1}`,
    severity,
    reasonCode,
    safeMessage,
    ...(path ? { path } : {}),
    ...(metadata ? { metadata } : {}),
  });
};

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

const checkText = (
  value: unknown,
  findings: ProjectStateValidationFinding[],
  path: string,
  required = false,
  maxLength = MAX_TEXT_LENGTH,
): void => {
  if (typeof value !== "string" || !value.trim()) {
    if (required) {
      addFinding(
        findings,
        "fail",
        "REQUIRED_TEXT_MISSING",
        "Required ProjectState text fields must be present and non-empty.",
        path,
      );
    }
    return;
  }

  if (value.length > maxLength) {
    addFinding(
      findings,
      "fail",
      "TEXT_TOO_LONG",
      "ProjectState text exceeds the bounded length limit.",
      path,
      { maxLength },
    );
  }
};

const checkArray = (
  value: unknown,
  findings: ProjectStateValidationFinding[],
  path: string,
  required = true,
): void => {
  if (!Array.isArray(value)) {
    if (required) {
      addFinding(
        findings,
        "fail",
        "REQUIRED_ARRAY_MISSING",
        "ProjectState arrays must be present.",
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
      "ProjectState arrays must stay within bounded metadata limits.",
      path,
      { maxItems: MAX_ARRAY_LENGTH },
    );
  }
};

const checkForbiddenContent = (
  value: unknown,
  findings: ProjectStateValidationFinding[],
): void => {
  safeStringValues(value).forEach((text) => {
    forbiddenContentPatterns.forEach(({ pattern, reasonCode, safeMessage }) => {
      if (pattern.test(text)) {
        addFinding(findings, "fail", reasonCode, safeMessage);
      }
    });
  });
};

const checkProjectId = (
  value: unknown,
  findings: ProjectStateValidationFinding[],
): void => {
  checkText(value, findings, "projectId", true, MAX_ID_LENGTH);
  if (typeof value !== "string") return;

  const trimmed = value.trim();
  if (trimmed !== value) {
    addFinding(
      findings,
      "fail",
      "PROJECT_ID_NOT_TRIMMED",
      "ProjectState projectId must be trimmed.",
      "projectId",
    );
  }
  if (/([A-Za-z]:\\|\/home\/|\/Users\/|\/tmp\/|\\|\/{2,})/.test(trimmed)) {
    addFinding(
      findings,
      "fail",
      "PROJECT_ID_PATH_LIKE",
      "ProjectState projectId must not be path-like.",
      "projectId",
    );
  }
};

const checkAutonomyLevels = (
  value: unknown,
  findings: ProjectStateValidationFinding[],
): void => {
  if (!Array.isArray(value) || value.length === 0) {
    addFinding(
      findings,
      "fail",
      "AUTONOMY_LEVELS_REQUIRED",
      "ProjectState must include bounded allowed autonomy levels.",
      "allowedAutonomyLevels",
    );
    return;
  }

  value.forEach((level, index) => {
    if (!pmAllowedAutonomyLevels101To120.includes(level as PMAllowedAutonomyLevel)) {
      const denied = pmDeniedAutonomyLevels101To120.includes(level as never);
      addFinding(
        findings,
        "fail",
        denied ? "AUTONOMY_LEVEL_FUTURE_GATED" : "AUTONOMY_LEVEL_UNSUPPORTED",
        "ProjectState autonomy is capped to observe/report/plan/propose for Phase 101-120.",
        `allowedAutonomyLevels.${index}`,
      );
    }
  });
};

const checkKnownStatus = (
  value: unknown,
  findings: ProjectStateValidationFinding[],
): void => {
  if (!supportedProjectStateStatuses.includes(value as ProjectStateStatus)) {
    addFinding(
      findings,
      "fail",
      "PROJECT_STATE_STATUS_UNSUPPORTED",
      "ProjectState status must be one of the supported advisory statuses.",
      "status",
    );
  }
};

const checkBoundaries = (
  value: unknown,
  findings: ProjectStateValidationFinding[],
): void => {
  if (!isObject(value)) {
    addFinding(
      findings,
      "fail",
      "BOUNDARIES_REQUIRED",
      "ProjectState must include PM safety boundaries.",
      "boundaries",
    );
    return;
  }

  Object.keys(pmFoundationBoundaries).forEach((boundaryName) => {
    if (value[boundaryName] !== true) {
      addFinding(
        findings,
        "fail",
        "BOUNDARY_NOT_TRUE",
        "All PM ProjectState safety boundaries must be true.",
        `boundaries.${boundaryName}`,
      );
    }
  });
};

const checkEvidenceRefs = (
  value: unknown,
  findings: ProjectStateValidationFinding[],
): void => {
  if (!Array.isArray(value)) return;
  value.forEach((entry, index) => {
    if (!isObject(entry)) {
      addFinding(
        findings,
        "fail",
        "EVIDENCE_REF_INVALID",
        "ProjectState evidence refs must be metadata objects.",
        `evidenceRefs.${index}`,
      );
      return;
    }
    if (entry.metadataOnly !== true || entry.noFileRead !== true) {
      addFinding(
        findings,
        "fail",
        "EVIDENCE_REF_NOT_METADATA_ONLY",
        "ProjectState evidence refs must be metadata-only and must not read files.",
        `evidenceRefs.${index}`,
      );
    }
  });
};

const checkReferenceMetadata = (
  value: unknown,
  findings: ProjectStateValidationFinding[],
  path: string,
): void => {
  if (!Array.isArray(value)) return;
  value.forEach((entry, index) => {
    if (!isObject(entry)) {
      addFinding(
        findings,
        "fail",
        "REFERENCE_INVALID",
        "ProjectState references must be metadata objects.",
        `${path}.${index}`,
      );
      return;
    }
    if (entry.metadataOnly !== true) {
      addFinding(
        findings,
        "fail",
        "REFERENCE_NOT_METADATA_ONLY",
        "ProjectState references must remain metadata-only.",
        `${path}.${index}`,
      );
    }
  });
};

export const validateProjectState = (input: unknown): ProjectStateValidationResult => {
  const findings: ProjectStateValidationFinding[] = [];

  if (!isObject(input)) {
    addFinding(
      findings,
      "fail",
      "PROJECT_STATE_NOT_OBJECT",
      "ProjectState input must be a metadata object.",
    );
    return makeResult(findings);
  }

  if (input.schemaVersion !== "1.0") {
    addFinding(
      findings,
      "fail",
      "SCHEMA_VERSION_INVALID",
      "ProjectState schemaVersion must be 1.0.",
      "schemaVersion",
    );
  }

  checkProjectId(input.projectId, findings);
  checkText(input.name, findings, "name", true);
  checkText(input.safeSummary, findings, "safeSummary", true);
  checkText(input.currentPhaseRef, findings, "currentPhaseRef", true, MAX_ID_LENGTH);
  checkKnownStatus(input.status, findings);
  checkAutonomyLevels(input.allowedAutonomyLevels, findings);

  [
    "roadmapRefs",
    "milestoneRefs",
    "taskSummaryRefs",
    "decisionRefs",
    "riskRefs",
    "blockerRefs",
    "dodRefs",
    "evidenceRefs",
    "recommendedNextSteps",
    "assumptions",
    "exclusions",
  ].forEach((path) => checkArray(input[path], findings, path));

  checkEvidenceRefs(input.evidenceRefs, findings);
  checkReferenceMetadata(input.roadmapRefs, findings, "roadmapRefs");
  checkReferenceMetadata(input.milestoneRefs, findings, "milestoneRefs");
  checkReferenceMetadata(input.taskSummaryRefs, findings, "taskSummaryRefs");
  checkReferenceMetadata(input.decisionRefs, findings, "decisionRefs");
  checkReferenceMetadata(input.riskRefs, findings, "riskRefs");
  checkReferenceMetadata(input.blockerRefs, findings, "blockerRefs");
  checkReferenceMetadata(input.dodRefs, findings, "dodRefs");
  checkBoundaries(input.boundaries, findings);
  checkForbiddenContent(input, findings);

  if (Array.isArray(input.riskRefs)) {
    input.riskRefs.forEach((entry, index) => {
      if (!isObject(entry)) return;
      if (!pmRiskTiers.includes(entry.riskTier as never)) {
        addFinding(
          findings,
          "fail",
          "RISK_TIER_UNSUPPORTED",
          "ProjectState risk refs must use supported PM risk tiers.",
          `riskRefs.${index}.riskTier`,
        );
      }
      const surfaces = entry.riskSurfaces;
      if (!Array.isArray(surfaces)) return;
      surfaces.forEach((surface, surfaceIndex) => {
        if (!pmRiskSurfaces.includes(surface as never)) {
          addFinding(
            findings,
            "fail",
            "RISK_SURFACE_UNSUPPORTED",
            "ProjectState risk refs must use supported PM risk surfaces.",
            `riskRefs.${index}.riskSurfaces.${surfaceIndex}`,
          );
        }
      });
    });
  }

  return makeResult(findings);
};

export const validateProjectSnapshot = (
  input: unknown,
): ProjectStateValidationResult => {
  const findings: ProjectStateValidationFinding[] = [];

  if (!isObject(input)) {
    addFinding(
      findings,
      "fail",
      "PROJECT_SNAPSHOT_NOT_OBJECT",
      "ProjectSnapshot input must be a metadata object.",
    );
    return makeResult(findings);
  }

  if (input.schemaVersion !== "1.0") {
    addFinding(
      findings,
      "fail",
      "SCHEMA_VERSION_INVALID",
      "ProjectSnapshot schemaVersion must be 1.0.",
      "schemaVersion",
    );
  }

  checkText(input.snapshotId, findings, "snapshotId", true, MAX_ID_LENGTH);
  checkProjectId(input.projectId, findings);
  checkBoundaries(input.boundaries, findings);

  const stateValidation = validateProjectState((input as Partial<ProjectSnapshot>).state);
  stateValidation.findings.forEach((finding) => {
    findings.push({
      ...finding,
      id: `finding_${findings.length + 1}`,
      path: finding.path ? `state.${finding.path}` : "state",
    });
  });

  checkForbiddenContent(input, findings);
  return makeResult(findings);
};
