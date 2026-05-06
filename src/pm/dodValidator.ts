import { pmFoundationBoundaries } from "./boundaries.js";
import type { PMEvidenceReference, PMFindingSeverity } from "./types.js";
import type {
  PMAcceptanceCriterion,
  PMAcceptanceCriterionId,
  PMAcceptanceCriterionStatus,
  PMDefinitionOfDone,
  PMDoDId,
  PMDoDSeverityThreshold,
  PMDoDValidationFinding,
  PMDoDValidationResult,
  PMEvidenceRequirement,
} from "./dodTypes.js";

const MAX_TEXT_LENGTH = 1200;
const MAX_ID_LENGTH = 160;
const MAX_ARRAY_LENGTH = 120;

const supportedCriterionStatuses = [
  "not_started",
  "pending_evidence",
  "satisfied",
  "failed",
  "waived",
  "not_applicable",
] as const satisfies readonly PMAcceptanceCriterionStatus[];

const supportedFindingSeverities = [
  "info",
  "warn",
  "fail",
] as const satisfies readonly PMFindingSeverity[];

const supportedBlockingThresholds = supportedFindingSeverities satisfies readonly PMDoDSeverityThreshold[];

const forbiddenContentPatterns: Array<{
  pattern: RegExp;
  reasonCode: string;
  safeMessage: string;
}> = [
  {
    pattern:
      /api\s*key|token|secret|hookToken|credential|raw\s+prompt|raw\s+provider\s+output/i,
    reasonCode: "FORBIDDEN_PRIVATE_CONTENT",
    safeMessage: "DoD metadata must not include secrets, tokens, credential wording, raw prompts, or raw provider output.",
  },
  {
    pattern:
      /npm\s+test|test\s+execution|CI\s+execution|write\s*File|append\s*File|fetch\s*\(|child[_-]process|exec\s*\(|spawn\s*\(/i,
    reasonCode: "FORBIDDEN_EXECUTION_TOKEN",
    safeMessage: "DoD metadata must not include test, CI, filesystem, network, or command execution tokens.",
  },
  {
    pattern:
      /dashboard\/|src\/runtime\/|src\/scaffold\/|src\/connectors\/|src\/actions\/|src\/jobs\/|src\/automation\//i,
    reasonCode: "FORBIDDEN_LIVE_ADJACENT_REFERENCE",
    safeMessage: "DoD metadata must not point at live-adjacent implementation surfaces.",
  },
  {
    pattern:
      /\bproduction-ready\b|\bproduction ready\b|\bfully autonomous\b|\bself-approve\b|\bdeploy now\b|\brun in prod\b/i,
    reasonCode: "FORBIDDEN_OVERCLAIM",
    safeMessage: "DoD metadata must not include production, full autonomy, self-approval, or deployment claims.",
  },
  {
    pattern:
      /\b(reads|writes|scans|executes|dispatches|approves|runs|mutates|persists|schedules|triggers)\s+(files|filesystem|repository|runtime|dashboard|automation|connector|store|jobs|actions|approval|workflow|memory|tests|CI)\b/i,
    reasonCode: "EXECUTABLE_BEHAVIOR_WORDING",
    safeMessage: "DoD metadata must not describe operational execution, scheduling, persistence, mutation, test, or CI behavior.",
  },
  {
    pattern: /\b[A-Za-z]:\\|\/(?:home|users|tmp|mnt|var|etc)\//i,
    reasonCode: "ABSOLUTE_PATH_CONTENT",
    safeMessage: "DoD metadata must not require absolute local paths.",
  },
];

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
  findings: PMDoDValidationFinding[],
  severity: PMDoDValidationFinding["severity"],
  reasonCode: string,
  safeMessage: string,
  path?: string,
  dodId?: PMDoDId,
  criterionId?: PMAcceptanceCriterionId,
  metadata?: PMDoDValidationFinding["metadata"],
): void => {
  findings.push({
    id: `finding_${findings.length + 1}`,
    severity,
    reasonCode,
    safeMessage,
    ...(path ? { path } : {}),
    ...(dodId ? { dodId } : {}),
    ...(criterionId ? { criterionId } : {}),
    ...(metadata ? { metadata } : {}),
  });
};

const makeResult = (findings: PMDoDValidationFinding[]): PMDoDValidationResult => {
  const errors = findings.filter((finding) => finding.severity === "fail");
  const warnings = findings.filter((finding) => finding.severity === "warn");

  return {
    validationId: "definition_of_done_validation:104I",
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

const checkText = (
  value: unknown,
  findings: PMDoDValidationFinding[],
  path: string,
  required = false,
  maxLength = MAX_TEXT_LENGTH,
  dodId?: PMDoDId,
  criterionId?: PMAcceptanceCriterionId,
): void => {
  if (typeof value !== "string" || !value.trim()) {
    if (required) {
      addFinding(
        findings,
        "fail",
        "REQUIRED_TEXT_MISSING",
        "Required DoD text fields must be present and non-empty.",
        path,
        dodId,
        criterionId,
      );
    }
    return;
  }

  if (value !== value.trim()) {
    addFinding(
      findings,
      "fail",
      "TEXT_NOT_TRIMMED",
      "DoD identifiers and bounded text fields must be trimmed.",
      path,
      dodId,
      criterionId,
    );
  }

  if (value.length > maxLength) {
    addFinding(
      findings,
      "fail",
      "TEXT_TOO_LONG",
      "DoD text exceeds the bounded length limit.",
      path,
      dodId,
      criterionId,
      { maxLength },
    );
  }
};

const checkArray = (
  value: unknown,
  findings: PMDoDValidationFinding[],
  path: string,
  required = true,
): void => {
  if (!Array.isArray(value)) {
    if (required) {
      addFinding(
        findings,
        "fail",
        "REQUIRED_ARRAY_MISSING",
        "DoD arrays must be present.",
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
      "DoD arrays must stay within bounded metadata limits.",
      path,
      undefined,
      undefined,
      { maxItems: MAX_ARRAY_LENGTH },
    );
  }
};

const checkForbiddenContent = (
  value: unknown,
  findings: PMDoDValidationFinding[],
): void => {
  safeStringValues(value).forEach((text) => {
    forbiddenContentPatterns.forEach(({ pattern, reasonCode, safeMessage }) => {
      if (pattern.test(text)) {
        addFinding(findings, "fail", reasonCode, safeMessage);
      }
    });
  });
};

const hasRequiredSeverity = (
  severity: PMFindingSeverity,
  threshold: PMDoDSeverityThreshold,
): boolean =>
  supportedFindingSeverities.indexOf(severity) >= supportedFindingSeverities.indexOf(threshold);

const checkEvidenceRefs = (
  refs: unknown,
  findings: PMDoDValidationFinding[],
  path: string,
  dodId?: PMDoDId,
  criterionId?: PMAcceptanceCriterionId,
): PMEvidenceReference[] => {
  if (!Array.isArray(refs)) {
    addFinding(
      findings,
      "fail",
      "EVIDENCE_REFS_ARRAY_REQUIRED",
      "Evidence refs must be provided as bounded metadata arrays.",
      path,
      dodId,
      criterionId,
    );
    return [];
  }

  if (refs.length > MAX_ARRAY_LENGTH) {
    addFinding(
      findings,
      "fail",
      "EVIDENCE_REFS_TOO_LONG",
      "Evidence refs must stay within bounded metadata limits.",
      path,
      dodId,
      criterionId,
      { maxItems: MAX_ARRAY_LENGTH },
    );
  }

  refs.forEach((ref, index) => {
    if (!isObject(ref) || ref.metadataOnly !== true || ref.noFileRead !== true) {
      addFinding(
        findings,
        "fail",
        "EVIDENCE_REF_NOT_METADATA_ONLY",
        "Evidence refs must be metadata-only and must not read files.",
        `${path}.${index}`,
        dodId,
        criterionId,
      );
      return;
    }
    checkText(ref.evidenceId, findings, `${path}.${index}.evidenceId`, true, MAX_ID_LENGTH, dodId, criterionId);
    checkText(ref.label, findings, `${path}.${index}.label`, true, MAX_TEXT_LENGTH, dodId, criterionId);
    checkText(ref.reference, findings, `${path}.${index}.reference`, true, MAX_TEXT_LENGTH, dodId, criterionId);
    checkText(ref.safeSummary, findings, `${path}.${index}.safeSummary`, true, MAX_TEXT_LENGTH, dodId, criterionId);
  });

  return refs.filter((ref): ref is PMEvidenceReference => isObject(ref)) as PMEvidenceReference[];
};

const validateEvidenceRequirement = (
  requirement: unknown,
  index: number,
  findings: PMDoDValidationFinding[],
  pathPrefix: string,
  dodId?: PMDoDId,
  criterionId?: PMAcceptanceCriterionId,
): requirement is PMEvidenceRequirement => {
  const path = `${pathPrefix}.${index}`;
  if (!isObject(requirement)) {
    addFinding(
      findings,
      "fail",
      "EVIDENCE_REQUIREMENT_NOT_OBJECT",
      "Evidence requirements must be metadata objects.",
      path,
      dodId,
      criterionId,
    );
    return false;
  }

  checkText(requirement.evidenceRequirementId, findings, `${path}.evidenceRequirementId`, true, MAX_ID_LENGTH, dodId, criterionId);
  checkText(requirement.label, findings, `${path}.label`, true, MAX_TEXT_LENGTH, dodId, criterionId);
  checkText(requirement.safeSummary, findings, `${path}.safeSummary`, true, MAX_TEXT_LENGTH, dodId, criterionId);

  if (typeof requirement.required !== "boolean") {
    addFinding(
      findings,
      "fail",
      "EVIDENCE_REQUIREMENT_REQUIRED_FLAG_INVALID",
      "Evidence requirements must explicitly state whether they are required.",
      `${path}.required`,
      dodId,
      criterionId,
    );
  }

  if (
    requirement.metadataOnly !== true ||
    requirement.noFileRead !== true ||
    requirement.noCommandExecution !== true
  ) {
    addFinding(
      findings,
      "fail",
      "EVIDENCE_REQUIREMENT_NOT_METADATA_ONLY",
      "Evidence requirements must remain metadata-only with no file reads or command execution.",
      path,
      dodId,
      criterionId,
    );
  }

  const evidenceRefs = checkEvidenceRefs(
    requirement.acceptedEvidenceRefs,
    findings,
    `${path}.acceptedEvidenceRefs`,
    dodId,
    criterionId,
  );
  if (requirement.required === true && evidenceRefs.length === 0) {
    addFinding(
      findings,
      "fail",
      "REQUIRED_EVIDENCE_MISSING",
      "Required evidence must include at least one metadata-only evidence ref.",
      `${path}.acceptedEvidenceRefs`,
      dodId,
      criterionId,
    );
  }

  return true;
};

const validateCriterion = (
  criterion: unknown,
  index: number,
  findings: PMDoDValidationFinding[],
  dodId?: PMDoDId,
  threshold: PMDoDSeverityThreshold = "fail",
): criterion is PMAcceptanceCriterion => {
  const path = `criteria.${index}`;
  if (!isObject(criterion)) {
    addFinding(
      findings,
      "fail",
      "CRITERION_NOT_OBJECT",
      "Acceptance criteria must be metadata objects.",
      path,
      dodId,
    );
    return false;
  }

  const criterionId = typeof criterion.criterionId === "string" ? criterion.criterionId : undefined;
  checkText(criterion.criterionId, findings, `${path}.criterionId`, true, MAX_ID_LENGTH, dodId, criterionId);
  checkText(criterion.label, findings, `${path}.label`, true, MAX_TEXT_LENGTH, dodId, criterionId);
  checkText(criterion.safeSummary, findings, `${path}.safeSummary`, true, MAX_TEXT_LENGTH, dodId, criterionId);
  checkText(criterion.phaseRef, findings, `${path}.phaseRef`, false, MAX_ID_LENGTH, dodId, criterionId);
  checkArray(criterion.taskIds, findings, `${path}.taskIds`);
  checkArray(criterion.evidenceRequirements, findings, `${path}.evidenceRequirements`);
  checkArray(criterion.evidenceRefs, findings, `${path}.evidenceRefs`);
  checkArray(criterion.assumptions, findings, `${path}.assumptions`);
  checkArray(criterion.exclusions, findings, `${path}.exclusions`);

  if (!supportedCriterionStatuses.includes(criterion.status as PMAcceptanceCriterionStatus)) {
    addFinding(
      findings,
      "fail",
      "CRITERION_STATUS_UNSUPPORTED",
      "Acceptance criterion status must be supported advisory metadata.",
      `${path}.status`,
      dodId,
      criterionId,
    );
  }

  if (!supportedFindingSeverities.includes(criterion.severity as PMFindingSeverity)) {
    addFinding(
      findings,
      "fail",
      "CRITERION_SEVERITY_UNSUPPORTED",
      "Acceptance criterion severity must be supported PM finding severity.",
      `${path}.severity`,
      dodId,
      criterionId,
    );
  }

  if (typeof criterion.required !== "boolean") {
    addFinding(
      findings,
      "fail",
      "CRITERION_REQUIRED_FLAG_INVALID",
      "Acceptance criteria must explicitly state whether they are required.",
      `${path}.required`,
      dodId,
      criterionId,
    );
  }

  if (
    criterion.metadataOnly !== true ||
    criterion.noExecution !== true ||
    criterion.noTestExecution !== true ||
    criterion.noCiExecution !== true
  ) {
    addFinding(
      findings,
      "fail",
      "CRITERION_NOT_METADATA_ONLY",
      "Acceptance criteria must remain metadata-only with no execution, test execution, or CI execution.",
      path,
      dodId,
      criterionId,
    );
  }

  if (
    criterion.required === true &&
    criterion.status === "failed" &&
    supportedFindingSeverities.includes(criterion.severity as PMFindingSeverity) &&
    hasRequiredSeverity(criterion.severity as PMFindingSeverity, threshold)
  ) {
    addFinding(
      findings,
      "fail",
      "REQUIRED_CRITERION_FAILED",
      "Failed required criteria at or above the blocking threshold must fail DoD validation.",
      `${path}.status`,
      dodId,
      criterionId,
    );
  }

  checkEvidenceRefs(criterion.evidenceRefs, findings, `${path}.evidenceRefs`, dodId, criterionId);

  if (Array.isArray(criterion.evidenceRequirements)) {
    criterion.evidenceRequirements.forEach((requirement, requirementIndex) => {
      validateEvidenceRequirement(
        requirement,
        requirementIndex,
        findings,
        `${path}.evidenceRequirements`,
        dodId,
        criterionId,
      );
    });
  }

  return true;
};

const validateDoDObject = (
  dod: unknown,
  findings: PMDoDValidationFinding[],
  index?: number,
): dod is PMDefinitionOfDone => {
  const pathPrefix = index === undefined ? "" : `dods.${index}.`;
  if (!isObject(dod)) {
    addFinding(
      findings,
      "fail",
      "DOD_NOT_OBJECT",
      "Definition of Done input must be a metadata object.",
      index === undefined ? undefined : `dods.${index}`,
    );
    return false;
  }

  const dodId = typeof dod.dodId === "string" ? dod.dodId : undefined;
  checkText(dod.dodId, findings, `${pathPrefix}dodId`, true, MAX_ID_LENGTH, dodId);
  checkText(dod.title, findings, `${pathPrefix}title`, true, MAX_TEXT_LENGTH, dodId);
  checkText(dod.safeSummary, findings, `${pathPrefix}safeSummary`, true, MAX_TEXT_LENGTH, dodId);
  checkText(dod.phaseRef, findings, `${pathPrefix}phaseRef`, false, MAX_ID_LENGTH, dodId);
  checkArray(dod.taskIds, findings, `${pathPrefix}taskIds`);
  checkArray(dod.criteria, findings, `${pathPrefix}criteria`);
  checkArray(dod.evidenceRequirements, findings, `${pathPrefix}evidenceRequirements`);
  checkArray(dod.assumptions, findings, `${pathPrefix}assumptions`);
  checkArray(dod.exclusions, findings, `${pathPrefix}exclusions`);

  if (dod.schemaVersion !== "1.0") {
    addFinding(
      findings,
      "fail",
      "SCHEMA_VERSION_INVALID",
      "Definition of Done schemaVersion must be 1.0.",
      `${pathPrefix}schemaVersion`,
      dodId,
    );
  }

  if (!supportedBlockingThresholds.includes(dod.blockingSeverityThreshold as PMDoDSeverityThreshold)) {
    addFinding(
      findings,
      "fail",
      "BLOCKING_THRESHOLD_UNSUPPORTED",
      "Blocking severity threshold must be a supported PM finding severity.",
      `${pathPrefix}blockingSeverityThreshold`,
      dodId,
    );
  }

  if (
    dod.advisoryOnly !== true ||
    dod.sourceOnly !== true ||
    dod.noExecution !== true ||
    dod.noTestExecution !== true ||
    dod.noCiExecution !== true ||
    dod.noCommandExecution !== true
  ) {
    addFinding(
      findings,
      "fail",
      "DOD_NOT_SOURCE_ONLY_ADVISORY",
      "Definition of Done objects must remain advisory, source-only, and non-executing.",
      pathPrefix ? pathPrefix.slice(0, -1) : undefined,
      dodId,
    );
  }

  const boundaries = isObject(dod.boundaries) ? dod.boundaries : undefined;
  const missingBoundary = Object.keys(pmFoundationBoundaries).some(
    (key) => boundaries?.[key] !== true,
  );
  if (!boundaries || missingBoundary) {
    addFinding(
      findings,
      "fail",
      "BOUNDARIES_REQUIRED",
      "Definition of Done objects must include PM boundaries.",
      `${pathPrefix}boundaries`,
      dodId,
    );
  }

  const threshold = supportedBlockingThresholds.includes(
    dod.blockingSeverityThreshold as PMDoDSeverityThreshold,
  )
    ? (dod.blockingSeverityThreshold as PMDoDSeverityThreshold)
    : "fail";

  const seenCriterionIds = new Set<PMAcceptanceCriterionId>();
  if (Array.isArray(dod.criteria)) {
    dod.criteria.forEach((criterion, criterionIndex) => {
      if (validateCriterion(criterion, criterionIndex, findings, dodId, threshold)) {
        if (seenCriterionIds.has(criterion.criterionId)) {
          addFinding(
            findings,
            "fail",
            "CRITERION_ID_DUPLICATE",
            "Acceptance criterion ids must be unique within a Definition of Done.",
            `${pathPrefix}criteria.${criterionIndex}.criterionId`,
            dodId,
            criterion.criterionId,
          );
        }
        seenCriterionIds.add(criterion.criterionId);
      }
    });
  }

  if (Array.isArray(dod.evidenceRequirements)) {
    dod.evidenceRequirements.forEach((requirement, requirementIndex) => {
      validateEvidenceRequirement(
        requirement,
        requirementIndex,
        findings,
        `${pathPrefix}evidenceRequirements`,
        dodId,
      );
    });
  }

  return true;
};

export const validateDefinitionOfDone = (input: unknown): PMDoDValidationResult => {
  const findings: PMDoDValidationFinding[] = [];
  checkForbiddenContent(input, findings);

  if (isObject(input) && Array.isArray(input.dods)) {
    const seenDodIds = new Set<PMDoDId>();
    input.dods.forEach((dod, index) => {
      if (validateDoDObject(dod, findings, index)) {
        if (seenDodIds.has(dod.dodId)) {
          addFinding(
            findings,
            "fail",
            "DOD_ID_DUPLICATE",
            "Definition of Done ids must be unique when validating a DoD array.",
            `dods.${index}.dodId`,
            dod.dodId,
          );
        }
        seenDodIds.add(dod.dodId);
      }
    });
    return makeResult(findings);
  }

  validateDoDObject(input, findings);
  return makeResult(findings);
};
