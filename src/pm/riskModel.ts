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

export type PMRiskId = string;

export type PMRiskLikelihood = "rare" | "possible" | "likely" | "near_certain";

export type PMRiskImpact = "low" | "medium" | "high" | "critical";

export type PMRiskSeverity = "low" | "medium" | "high" | "critical";

export type PMRiskStatus =
  | "identified"
  | "watching"
  | "active"
  | "mitigated"
  | "accepted"
  | "deferred";

export interface PMRiskEntry {
  riskId: PMRiskId;
  label: string;
  safeSummary: string;
  likelihood: PMRiskLikelihood;
  impact: PMRiskImpact;
  severity: PMRiskSeverity;
  status: PMRiskStatus;
  riskSurfaces: PMRiskSurface[];
  phaseRefs: ProjectPhaseRef[];
  taskIds: PMTaskId[];
  milestoneIds: PMMilestoneId[];
  dodRefs: string[];
  evidenceRefs: PMEvidenceReference[];
  assumptions: string[];
  exclusions: string[];
  metadataOnly: true;
  advisoryOnly: true;
  noExecution: true;
  noMitigationExecution: true;
  boundaries: PMBoundarySet;
}

export interface PMRiskClassificationInput {
  likelihood: PMRiskLikelihood;
  impact: PMRiskImpact;
  explicitSeverity?: PMRiskSeverity;
  riskSurfaces?: PMRiskSurface[];
}

export interface PMRiskClassificationResult {
  severity: PMRiskSeverity;
  derived: boolean;
  likelihood: PMRiskLikelihood;
  impact: PMRiskImpact;
  riskSurfaces: PMRiskSurface[];
  advisoryOnly: true;
  sourceOnly: true;
  noExecution: true;
  noMitigationExecution: true;
  boundaries: PMBoundarySet;
}

export interface PMRiskBlockerFinding {
  id: string;
  severity: PMFindingSeverity;
  reasonCode: string;
  safeMessage: string;
  path?: string;
  riskId?: PMRiskId;
  blockerId?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface PMRiskBlockerValidationResult {
  validationId: string;
  schemaVersion: PMSchemaVersion;
  valid: boolean;
  status: "pass" | "warn" | "fail";
  findings: PMRiskBlockerFinding[];
  warnings: PMRiskBlockerFinding[];
  errors: PMRiskBlockerFinding[];
  advisoryOnly: true;
  sourceOnly: true;
  boundaries: PMBoundarySet;
}

const MAX_TEXT_LENGTH = 1200;
const MAX_ID_LENGTH = 160;
const MAX_ARRAY_LENGTH = 120;

export const pmRiskLikelihoods = [
  "rare",
  "possible",
  "likely",
  "near_certain",
] as const satisfies readonly PMRiskLikelihood[];

export const pmRiskImpacts = [
  "low",
  "medium",
  "high",
  "critical",
] as const satisfies readonly PMRiskImpact[];

export const pmRiskSeverities = [
  "low",
  "medium",
  "high",
  "critical",
] as const satisfies readonly PMRiskSeverity[];

export const pmRiskStatuses = [
  "identified",
  "watching",
  "active",
  "mitigated",
  "accepted",
  "deferred",
] as const satisfies readonly PMRiskStatus[];

const forbiddenContentPatterns: Array<{
  pattern: RegExp;
  reasonCode: string;
  safeMessage: string;
}> = [
  {
    pattern:
      /api\s*key|token|secret|hookToken|credential|raw\s+prompt|raw\s+provider\s+output/i,
    reasonCode: "FORBIDDEN_PRIVATE_CONTENT",
    safeMessage: "Risk metadata must not include secrets, tokens, credential wording, raw prompts, or raw provider output.",
  },
  {
    pattern:
      /npm\s+test|test\s+execution|CI\s+execution|write\s*File|append\s*File|fetch\s*\(|child[_-]process|exec\s*\(|spawn\s*\(/i,
    reasonCode: "FORBIDDEN_EXECUTION_TOKEN",
    safeMessage: "Risk metadata must not include test, CI, filesystem, network, or command execution tokens.",
  },
  {
    pattern:
      /dashboard\/|src\/runtime\/|src\/scaffold\/|src\/connectors\/|src\/actions\/|src\/jobs\/|src\/automation\//i,
    reasonCode: "FORBIDDEN_LIVE_ADJACENT_REFERENCE",
    safeMessage: "Risk metadata must not point at live-adjacent implementation surfaces.",
  },
  {
    pattern:
      /\bproduction-ready\b|\bproduction ready\b|\bfully autonomous\b|\bself-approve\b|\bdeploy now\b|\brun in prod\b/i,
    reasonCode: "FORBIDDEN_OVERCLAIM",
    safeMessage: "Risk metadata must not include production, full autonomy, self-approval, or deployment claims.",
  },
  {
    pattern:
      /\b(reads|writes|scans|executes|dispatches|approves|runs|mutates|persists|schedules|triggers|resolves)\s+(files|filesystem|repository|runtime|dashboard|automation|connector|store|jobs|actions|approval|workflow|memory|tests|CI|blockers|mitigations)\b/i,
    reasonCode: "EXECUTABLE_BEHAVIOR_WORDING",
    safeMessage: "Risk metadata must not describe operational execution, scheduling, persistence, mutation, or mitigation behavior.",
  },
  {
    pattern: /\b[A-Za-z]:\\|\/(?:home|users|tmp|mnt|var|etc)\//i,
    reasonCode: "ABSOLUTE_PATH_CONTENT",
    safeMessage: "Risk metadata must not require absolute local paths.",
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

export const addRiskBlockerFinding = (
  findings: PMRiskBlockerFinding[],
  severity: PMRiskBlockerFinding["severity"],
  reasonCode: string,
  safeMessage: string,
  path?: string,
  riskId?: PMRiskId,
  blockerId?: string,
  metadata?: PMRiskBlockerFinding["metadata"],
): void => {
  findings.push({
    id: `finding_${findings.length + 1}`,
    severity,
    reasonCode,
    safeMessage,
    ...(path ? { path } : {}),
    ...(riskId ? { riskId } : {}),
    ...(blockerId ? { blockerId } : {}),
    ...(metadata ? { metadata } : {}),
  });
};

export const makeRiskBlockerValidationResult = (
  findings: PMRiskBlockerFinding[],
  validationId = "risk_model_validation:105I",
): PMRiskBlockerValidationResult => {
  const errors = findings.filter((finding) => finding.severity === "fail");
  const warnings = findings.filter((finding) => finding.severity === "warn");

  return {
    validationId,
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
  findings: PMRiskBlockerFinding[],
  path: string,
  required = false,
  maxLength = MAX_TEXT_LENGTH,
  riskId?: PMRiskId,
): void => {
  if (typeof value !== "string" || !value.trim()) {
    if (required) {
      addRiskBlockerFinding(
        findings,
        "fail",
        "REQUIRED_TEXT_MISSING",
        "Required risk text fields must be present and non-empty.",
        path,
        riskId,
      );
    }
    return;
  }

  if (value !== value.trim()) {
    addRiskBlockerFinding(
      findings,
      "fail",
      "TEXT_NOT_TRIMMED",
      "Risk identifiers and bounded text fields must be trimmed.",
      path,
      riskId,
    );
  }

  if (value.length > maxLength) {
    addRiskBlockerFinding(
      findings,
      "fail",
      "TEXT_TOO_LONG",
      "Risk text exceeds the bounded length limit.",
      path,
      riskId,
      undefined,
      { maxLength },
    );
  }
};

export const checkRiskBlockerArray = (
  value: unknown,
  findings: PMRiskBlockerFinding[],
  path: string,
  required = true,
): void => {
  if (!Array.isArray(value)) {
    if (required) {
      addRiskBlockerFinding(
        findings,
        "fail",
        "REQUIRED_ARRAY_MISSING",
        "Risk/blocker arrays must be present.",
        path,
      );
    }
    return;
  }

  if (value.length > MAX_ARRAY_LENGTH) {
    addRiskBlockerFinding(
      findings,
      "fail",
      "ARRAY_TOO_LONG",
      "Risk/blocker arrays must stay within bounded metadata limits.",
      path,
      undefined,
      undefined,
      { maxItems: MAX_ARRAY_LENGTH },
    );
  }
};

export const checkRiskBlockerForbiddenContent = (
  value: unknown,
  findings: PMRiskBlockerFinding[],
): void => {
  safeStringValues(value).forEach((text) => {
    forbiddenContentPatterns.forEach(({ pattern, reasonCode, safeMessage }) => {
      if (pattern.test(text)) {
        addRiskBlockerFinding(findings, "fail", reasonCode, safeMessage);
      }
    });
  });
};

export const checkRiskBlockerEvidenceRefs = (
  refs: unknown,
  findings: PMRiskBlockerFinding[],
  path: string,
  riskId?: PMRiskId,
  blockerId?: string,
): PMEvidenceReference[] => {
  if (!Array.isArray(refs)) {
    addRiskBlockerFinding(
      findings,
      "fail",
      "EVIDENCE_REFS_ARRAY_REQUIRED",
      "Evidence refs must be provided as bounded metadata arrays.",
      path,
      riskId,
      blockerId,
    );
    return [];
  }

  if (refs.length > MAX_ARRAY_LENGTH) {
    addRiskBlockerFinding(
      findings,
      "fail",
      "EVIDENCE_REFS_TOO_LONG",
      "Evidence refs must stay within bounded metadata limits.",
      path,
      riskId,
      blockerId,
      { maxItems: MAX_ARRAY_LENGTH },
    );
  }

  refs.forEach((ref, index) => {
    if (!isObject(ref) || ref.metadataOnly !== true || ref.noFileRead !== true) {
      addRiskBlockerFinding(
        findings,
        "fail",
        "EVIDENCE_REF_NOT_METADATA_ONLY",
        "Evidence refs must be metadata-only and must not read files.",
        `${path}.${index}`,
        riskId,
        blockerId,
      );
      return;
    }
    checkText(ref.evidenceId, findings, `${path}.${index}.evidenceId`, true, MAX_ID_LENGTH, riskId);
    checkText(ref.label, findings, `${path}.${index}.label`, true, MAX_TEXT_LENGTH, riskId);
    checkText(ref.reference, findings, `${path}.${index}.reference`, true, MAX_TEXT_LENGTH, riskId);
    checkText(ref.safeSummary, findings, `${path}.${index}.safeSummary`, true, MAX_TEXT_LENGTH, riskId);
  });

  return refs.filter((ref): ref is PMEvidenceReference => isObject(ref)) as PMEvidenceReference[];
};

const riskScore = (value: PMRiskLikelihood | PMRiskImpact): number => {
  if (value === "rare" || value === "low") return 1;
  if (value === "possible" || value === "medium") return 2;
  if (value === "likely" || value === "high") return 3;
  return 4;
};

const severityFromScore = (score: number): PMRiskSeverity => {
  if (score <= 3) return "low";
  if (score <= 6) return "medium";
  if (score <= 9) return "high";
  return "critical";
};

export const classifyRisk = (input: PMRiskClassificationInput): PMRiskClassificationResult => {
  const explicitSeverity = input.explicitSeverity;
  const severity = explicitSeverity ?? severityFromScore(riskScore(input.likelihood) * riskScore(input.impact));

  return {
    severity,
    derived: explicitSeverity === undefined,
    likelihood: input.likelihood,
    impact: input.impact,
    riskSurfaces: (input.riskSurfaces ?? []).slice(),
    advisoryOnly: true,
    sourceOnly: true,
    noExecution: true,
    noMitigationExecution: true,
    boundaries: pmFoundationBoundaries,
  };
};

const checkKnownRiskSurface = (
  value: unknown,
  findings: PMRiskBlockerFinding[],
  path: string,
  riskId?: PMRiskId,
): void => {
  if (!pmRiskSurfaces.includes(value as PMRiskSurface)) {
    addRiskBlockerFinding(
      findings,
      "fail",
      "RISK_SURFACE_UNSUPPORTED",
      "Risk surfaces must use the supported PM risk surface vocabulary.",
      path,
      riskId,
    );
  }
};

const checkStringRefArray = (
  value: unknown,
  findings: PMRiskBlockerFinding[],
  path: string,
  riskId?: PMRiskId,
): void => {
  checkRiskBlockerArray(value, findings, path);
  if (!Array.isArray(value)) return;

  value.forEach((item, index) => {
    checkText(item, findings, `${path}.${index}`, false, MAX_ID_LENGTH, riskId);
    if (typeof item === "string" && /([A-Za-z]:\\|\/home\/|\/Users\/|\/tmp\/|\\|\/{2,})/.test(item)) {
      addRiskBlockerFinding(
        findings,
        "fail",
        "REFERENCE_PATH_LIKE",
        "Risk references must be metadata ids, not absolute paths.",
        `${path}.${index}`,
        riskId,
      );
    }
  });
};

const validateRiskEntry = (
  risk: unknown,
  index: number,
  findings: PMRiskBlockerFinding[],
): risk is PMRiskEntry => {
  if (!isObject(risk)) {
    addRiskBlockerFinding(
      findings,
      "fail",
      "RISK_NOT_OBJECT",
      "Risk entries must be metadata objects.",
      `risks.${index}`,
    );
    return false;
  }

  const riskId = typeof risk.riskId === "string" ? risk.riskId : undefined;
  checkText(risk.riskId, findings, `risks.${index}.riskId`, true, MAX_ID_LENGTH, riskId);
  checkText(risk.label, findings, `risks.${index}.label`, true, MAX_TEXT_LENGTH, riskId);
  checkText(risk.safeSummary, findings, `risks.${index}.safeSummary`, true, MAX_TEXT_LENGTH, riskId);
  checkRiskBlockerArray(risk.riskSurfaces, findings, `risks.${index}.riskSurfaces`);
  checkStringRefArray(risk.phaseRefs, findings, `risks.${index}.phaseRefs`, riskId);
  checkStringRefArray(risk.taskIds, findings, `risks.${index}.taskIds`, riskId);
  checkStringRefArray(risk.milestoneIds, findings, `risks.${index}.milestoneIds`, riskId);
  checkStringRefArray(risk.dodRefs, findings, `risks.${index}.dodRefs`, riskId);
  checkRiskBlockerArray(risk.assumptions, findings, `risks.${index}.assumptions`);
  checkRiskBlockerArray(risk.exclusions, findings, `risks.${index}.exclusions`);

  if (!pmRiskLikelihoods.includes(risk.likelihood as PMRiskLikelihood)) {
    addRiskBlockerFinding(
      findings,
      "fail",
      "RISK_LIKELIHOOD_UNSUPPORTED",
      "Risk likelihood must use supported advisory values.",
      `risks.${index}.likelihood`,
      riskId,
    );
  }

  if (!pmRiskImpacts.includes(risk.impact as PMRiskImpact)) {
    addRiskBlockerFinding(
      findings,
      "fail",
      "RISK_IMPACT_UNSUPPORTED",
      "Risk impact must use supported advisory values.",
      `risks.${index}.impact`,
      riskId,
    );
  }

  if (!pmRiskSeverities.includes(risk.severity as PMRiskSeverity)) {
    addRiskBlockerFinding(
      findings,
      "fail",
      "RISK_SEVERITY_UNSUPPORTED",
      "Risk severity must use supported advisory values.",
      `risks.${index}.severity`,
      riskId,
    );
  }

  if (!pmRiskStatuses.includes(risk.status as PMRiskStatus)) {
    addRiskBlockerFinding(
      findings,
      "fail",
      "RISK_STATUS_UNSUPPORTED",
      "Risk status must use supported advisory values.",
      `risks.${index}.status`,
      riskId,
    );
  }

  if (Array.isArray(risk.riskSurfaces)) {
    risk.riskSurfaces.forEach((surface, surfaceIndex) =>
      checkKnownRiskSurface(surface, findings, `risks.${index}.riskSurfaces.${surfaceIndex}`, riskId),
    );
  }

  checkRiskBlockerEvidenceRefs(risk.evidenceRefs, findings, `risks.${index}.evidenceRefs`, riskId);

  if (
    risk.metadataOnly !== true ||
    risk.advisoryOnly !== true ||
    risk.noExecution !== true ||
    risk.noMitigationExecution !== true
  ) {
    addRiskBlockerFinding(
      findings,
      "fail",
      "RISK_NOT_METADATA_ONLY",
      "Risk entries must remain metadata-only, advisory, and non-executing.",
      `risks.${index}`,
      riskId,
    );
  }

  const boundaries = isObject(risk.boundaries) ? risk.boundaries : undefined;
  const missingBoundary = Object.keys(pmFoundationBoundaries).some(
    (key) => boundaries?.[key] !== true,
  );
  if (!boundaries || missingBoundary) {
    addRiskBlockerFinding(
      findings,
      "fail",
      "BOUNDARIES_REQUIRED",
      "Risk entries must include all PM foundation boundaries.",
      `risks.${index}.boundaries`,
      riskId,
    );
  }

  return true;
};

const riskEntriesFromInput = (input: unknown): unknown[] => {
  if (Array.isArray(input)) return input;
  if (isObject(input) && Array.isArray(input.risks)) return input.risks;
  return [input];
};

export const validateRiskEntries = (input: unknown): PMRiskBlockerValidationResult => {
  const findings: PMRiskBlockerFinding[] = [];
  checkRiskBlockerForbiddenContent(input, findings);

  const risks = riskEntriesFromInput(input);
  const seenRiskIds = new Set<PMRiskId>();
  risks.forEach((risk, index) => {
    if (validateRiskEntry(risk, index, findings)) {
      if (seenRiskIds.has(risk.riskId)) {
        addRiskBlockerFinding(
          findings,
          "fail",
          "RISK_ID_DUPLICATE",
          "Risk ids must be unique.",
          `risks.${index}.riskId`,
          risk.riskId,
        );
      }
      seenRiskIds.add(risk.riskId);
    }
  });

  return makeRiskBlockerValidationResult(findings);
};
