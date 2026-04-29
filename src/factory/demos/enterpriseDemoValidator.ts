import {
  enterpriseDemoBoundaries,
  supportedEnterpriseDemoCategories,
  supportedEnterpriseDemoIds,
  supportedEnterpriseDemoRiskTiers,
} from "./enterpriseDemoTemplates.js";
import type {
  EnterpriseDemoCategory,
  EnterpriseDemoId,
  EnterpriseDemoInput,
  EnterpriseDemoRiskTier,
  EnterpriseDemoTemplate,
  EnterpriseDemoValidationFinding,
  EnterpriseDemoValidationResult,
} from "./types.js";

const MAX_TEXT_LENGTH = 1200;
const MAX_ARRAY_LENGTH = 120;

const forbiddenContentPatterns: Array<{ pattern: RegExp; reasonCode: string; safeMessage: string }> = [
  {
    pattern:
      /@openai\/agents|fetch\s*\(|from\s+['"]fs|from\s+['"]fs\/promises|child[_-]process|exec\s*\(|spawn\s*\(|write\s*File|append\s*File|mkdir|unlink|rm\s+-rf/i,
    reasonCode: "FORBIDDEN_SOURCE_BEHAVIOR_TOKEN",
    safeMessage:
      "Enterprise demo metadata must not include source behavior tokens for providers, network, filesystem, or command execution.",
  },
  {
    pattern:
      /\b(creates?|created|generates?|generated|writes?|wrote|scaffolds?|scaffolded|renders?|rendered|implements?|implemented)\s+(a\s+|the\s+)?(demo|project|file|dashboard|UI|app|schema|SQL|scaffold)\b/i,
    reasonCode: "FORBIDDEN_GENERATION_BEHAVIOR",
    safeMessage:
      "Enterprise demo metadata must not describe demo, project, file, dashboard, UI, schema, SQL, or scaffold generation as behavior.",
  },
  {
    pattern:
      /\b(executes?|executed|runs?|ran|calls?|called|invokes?|invoked)\s+(a\s+|the\s+)?(provider|network|connector|API|runtime|automation|dashboard|action|proposal|approval|job|scaffold)\b/i,
    reasonCode: "FORBIDDEN_EXECUTION_BEHAVIOR",
    safeMessage:
      "Enterprise demo metadata must not describe provider, network, connector, runtime, automation, dashboard, action, approval, job, or scaffold execution.",
  },
  {
    pattern:
      /\b(DB\s+schema|database\s+schema|SQL\s+execution|CREATE\s+TABLE|INSERT\s+INTO|UPDATE\s+|DELETE\s+FROM|DROP\s+TABLE)\b/i,
    reasonCode: "FORBIDDEN_DB_SQL_CONTENT",
    safeMessage: "Enterprise demo metadata must not include DB schema or SQL behavior.",
  },
  {
    pattern:
      /\b(secret|token|provider\s+key|credential|api\s+key|private\s+key|config\s+value|password)\b|sk-[A-Za-z0-9]|ghp_[A-Za-z0-9]|github_pat_|AIza[0-9A-Za-z_-]/i,
    reasonCode: "SECRET_OR_CREDENTIAL_CONTENT",
    safeMessage: "Enterprise demo metadata must not include secrets, tokens, config values, provider keys, or credentials.",
  },
  {
    pattern:
      /\bproduction-ready\b|\bproduction ready\b|commercial guarantee|revenue guarantee|security guarantee|compliance guarantee|certification guarantee|certified secure|guarantees compliance/i,
    reasonCode: "PRODUCTION_COMMERCIAL_OR_GOVERNANCE_OVERCLAIM",
    safeMessage:
      "Enterprise demo metadata must not include production, commercial, security, compliance, or certification guarantees.",
  },
];

const allowedExclusionPattern = /\b(no|not|never|denied|deny|excluded|must not|without|future-only|advisory)\b/i;

const isSupportedDemoId = (value: string): value is EnterpriseDemoId =>
  supportedEnterpriseDemoIds.includes(value as EnterpriseDemoId);

const isSupportedCategory = (value: string): value is EnterpriseDemoCategory =>
  supportedEnterpriseDemoCategories.includes(value as EnterpriseDemoCategory);

const isSupportedRiskTier = (value: string): value is EnterpriseDemoRiskTier =>
  supportedEnterpriseDemoRiskTiers.includes(value as EnterpriseDemoRiskTier);

const makeResult = (
  warnings: EnterpriseDemoValidationFinding[],
  errors: EnterpriseDemoValidationFinding[],
  demoCount: number,
): EnterpriseDemoValidationResult => ({
  validationId: "enterprise_demo_validation:static",
  schemaVersion: "1.0",
  valid: errors.length === 0,
  status: errors.length > 0 ? "fail" : warnings.length > 0 ? "warn" : "pass",
  demoCount,
  warnings,
  errors,
  advisoryOnly: true,
  sourceOnly: true,
  boundaries: enterpriseDemoBoundaries,
});

const addFinding = (
  findings: EnterpriseDemoValidationFinding[],
  severity: EnterpriseDemoValidationFinding["severity"],
  reasonCode: string,
  safeMessage: string,
  path?: string,
  demoId?: EnterpriseDemoId,
  metadata?: EnterpriseDemoValidationFinding["metadata"],
): void => {
  findings.push({
    id: `finding_${findings.length + 1}`,
    severity,
    reasonCode,
    safeMessage,
    ...(path ? { path } : {}),
    ...(demoId ? { demoId } : {}),
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

const checkTextBounds = (
  value: unknown,
  errors: EnterpriseDemoValidationFinding[],
  path: string,
  demoId?: EnterpriseDemoId,
): void => {
  if (typeof value === "string" && value.length > MAX_TEXT_LENGTH) {
    addFinding(
      errors,
      "fail",
      "TEXT_TOO_LONG",
      "Enterprise demo metadata text exceeds the bounded length limit.",
      path,
      demoId,
    );
  }
  if (Array.isArray(value)) {
    if (value.length > MAX_ARRAY_LENGTH) {
      addFinding(
        errors,
        "fail",
        "ARRAY_TOO_LONG",
        "Enterprise demo metadata array exceeds the bounded item limit.",
        path,
        demoId,
      );
    }
    value.forEach((item, index) => checkTextBounds(item, errors, `${path}.${index}`, demoId));
  }
  if (isObject(value)) {
    Object.entries(value).forEach(([key, item]) =>
      checkTextBounds(item, errors, `${path}.${key}`, demoId),
    );
  }
};

const checkForbiddenContent = (
  value: unknown,
  errors: EnterpriseDemoValidationFinding[],
  demoId?: EnterpriseDemoId,
): void => {
  safeStringValues(value).forEach((text) => {
    forbiddenContentPatterns.forEach(({ pattern, reasonCode, safeMessage }) => {
      if (pattern.test(text) && !allowedExclusionPattern.test(text)) {
        addFinding(errors, "fail", reasonCode, safeMessage, undefined, demoId);
      }
    });
  });
};

const checkUniqueIds = (
  ids: string[],
  idLabel: string,
  errors: EnterpriseDemoValidationFinding[],
  demoId?: EnterpriseDemoId,
): void => {
  const seen = new Set<string>();
  ids.forEach((id, index) => {
    if (!id.trim()) {
      addFinding(errors, "fail", "EMPTY_ID", `${idLabel} must not be empty.`, `${idLabel}.${index}`, demoId);
      return;
    }
    if (seen.has(id)) {
      addFinding(errors, "fail", "DUPLICATE_ID", `${idLabel} values must be unique.`, idLabel, demoId);
    }
    seen.add(id);
  });
};

const requiredArray = (
  value: unknown,
  path: string,
  errors: EnterpriseDemoValidationFinding[],
  demoId?: EnterpriseDemoId,
): void => {
  if (!Array.isArray(value) || value.length === 0) {
    addFinding(
      errors,
      "fail",
      "REQUIRED_ARRAY_EMPTY",
      "Required enterprise demo metadata arrays must be present and non-empty.",
      path,
      demoId,
    );
  }
};

const checkBoundaries = (
  template: Partial<EnterpriseDemoTemplate>,
  errors: EnterpriseDemoValidationFinding[],
  pathPrefix: string,
  demoId?: EnterpriseDemoId,
): void => {
  if (template.advisoryOnly !== true) {
    addFinding(errors, "fail", "ADVISORY_ONLY_REQUIRED", "Enterprise demos must be advisory only.", `${pathPrefix}.advisoryOnly`, demoId);
  }
  if (template.sourceOnly !== true) {
    addFinding(errors, "fail", "SOURCE_ONLY_REQUIRED", "Enterprise demos must be source-only metadata.", `${pathPrefix}.sourceOnly`, demoId);
  }

  const boundaries = template.boundaries as unknown as Record<string, unknown> | undefined;
  if (!boundaries) {
    addFinding(
      errors,
      "fail",
      "BOUNDARIES_REQUIRED",
      "Enterprise demos must include safety boundaries.",
      `${pathPrefix}.boundaries`,
      demoId,
    );
    return;
  }

  const expectedBoundaries = enterpriseDemoBoundaries as unknown as Record<string, true>;
  Object.keys(expectedBoundaries).forEach((boundaryName) => {
    if (boundaries[boundaryName] !== true) {
      addFinding(
        errors,
        "fail",
        "BOUNDARY_NOT_TRUE",
        "All enterprise demo safety boundaries must be true.",
        `${pathPrefix}.boundaries.${boundaryName}`,
        demoId,
      );
    }
  });
};

export const validateEnterpriseDemoTemplate = (
  template: EnterpriseDemoTemplate,
): EnterpriseDemoValidationResult => {
  const warnings: EnterpriseDemoValidationFinding[] = [];
  const errors: EnterpriseDemoValidationFinding[] = [];
  const demoId = template.demoId;

  if (!isSupportedDemoId(template.demoId)) {
    addFinding(errors, "fail", "UNKNOWN_DEMO_ID", "Enterprise demo id is not supported.", "demoId");
  }
  if (!isSupportedCategory(template.category)) {
    addFinding(errors, "fail", "UNKNOWN_DEMO_CATEGORY", "Enterprise demo category is not supported.", "category", demoId);
  }
  if (!isSupportedRiskTier(template.riskTier)) {
    addFinding(errors, "fail", "UNKNOWN_RISK_TIER", "Enterprise demo risk tier is not supported.", "riskTier", demoId);
  }

  requiredArray(template.personas, "personas", errors, demoId);
  requiredArray(template.moduleReferences, "moduleReferences", errors, demoId);
  requiredArray(template.workflowReferences, "workflowReferences", errors, demoId);
  requiredArray(template.reportingReferences, "reportingReferences", errors, demoId);
  requiredArray(template.transactionalReferences, "transactionalReferences", errors, demoId);
  requiredArray(template.uiPatternReferences, "uiPatternReferences", errors, demoId);
  requiredArray(template.risks, "risks", errors, demoId);
  requiredArray(template.assumptions, "assumptions", errors, demoId);
  requiredArray(template.exclusions, "exclusions", errors, demoId);
  requiredArray(template.relevantFactoryMetadataReferences, "relevantFactoryMetadataReferences", errors, demoId);

  checkUniqueIds(template.personas.map((item) => item.personaId), "personas.personaId", errors, demoId);
  checkUniqueIds(template.moduleReferences.map((item) => item.referenceId), "moduleReferences.referenceId", errors, demoId);
  checkUniqueIds(template.workflowReferences.map((item) => item.referenceId), "workflowReferences.referenceId", errors, demoId);
  checkUniqueIds(template.reportingReferences.map((item) => item.referenceId), "reportingReferences.referenceId", errors, demoId);
  checkUniqueIds(template.transactionalReferences.map((item) => item.referenceId), "transactionalReferences.referenceId", errors, demoId);
  checkUniqueIds(template.uiPatternReferences.map((item) => item.referenceId), "uiPatternReferences.referenceId", errors, demoId);
  checkUniqueIds(template.risks.map((item) => item.riskId), "risks.riskId", errors, demoId);

  if (template.sampleDataPolicy.metadataOnly !== true || template.sampleDataPolicy.noFiles !== true) {
    addFinding(
      errors,
      "fail",
      "SAMPLE_DATA_POLICY_NOT_METADATA_ONLY",
      "Enterprise demo sample data policy must be metadata-only and must not create files.",
      "sampleDataPolicy",
      demoId,
    );
  }
  if (
    template.sampleDataPolicy.syntheticOnly !== true ||
    template.sampleDataPolicy.noRealisticPersonalData !== true ||
    template.sampleDataPolicy.noSecrets !== true ||
    template.sampleDataPolicy.noCredentialValues !== true
  ) {
    addFinding(
      errors,
      "fail",
      "SAMPLE_DATA_POLICY_PRIVACY_BOUNDARY_MISSING",
      "Enterprise demo sample data policy must deny real personal data, secrets, and credential values.",
      "sampleDataPolicy",
      demoId,
    );
  }

  template.personas.forEach((item, index) => {
    if (item.syntheticOnly !== true || item.metadataOnly !== true) {
      addFinding(errors, "fail", "PERSONA_NOT_SYNTHETIC_METADATA", "Demo personas must be synthetic metadata only.", `personas.${index}`, demoId);
    }
  });

  template.moduleReferences.forEach((item, index) => {
    if (item.metadataOnly !== true || item.noFileGeneration !== true) {
      addFinding(errors, "fail", "MODULE_REFERENCE_BOUNDARY_MISSING", "Module references must not generate files.", `moduleReferences.${index}`, demoId);
    }
  });
  template.workflowReferences.forEach((item, index) => {
    if (item.metadataOnly !== true || item.noExecution !== true) {
      addFinding(errors, "fail", "WORKFLOW_REFERENCE_BOUNDARY_MISSING", "Workflow references must not execute.", `workflowReferences.${index}`, demoId);
    }
  });
  template.reportingReferences.forEach((item, index) => {
    if (item.metadataOnly !== true || item.noDashboardGeneration !== true) {
      addFinding(errors, "fail", "REPORTING_REFERENCE_BOUNDARY_MISSING", "Reporting references must not generate dashboards.", `reportingReferences.${index}`, demoId);
    }
  });
  template.transactionalReferences.forEach((item, index) => {
    if (item.metadataOnly !== true || item.noDbOrSql !== true) {
      addFinding(errors, "fail", "TRANSACTION_REFERENCE_BOUNDARY_MISSING", "Transactional references must not include DB or SQL behavior.", `transactionalReferences.${index}`, demoId);
    }
  });
  template.uiPatternReferences.forEach((item, index) => {
    if (item.metadataOnly !== true || item.noUiGeneration !== true) {
      addFinding(errors, "fail", "UI_REFERENCE_BOUNDARY_MISSING", "UI references must not generate UI.", `uiPatternReferences.${index}`, demoId);
    }
  });

  checkBoundaries(template, errors, "template", demoId);
  checkTextBounds(template, errors, "template", demoId);
  checkForbiddenContent(template, errors, demoId);

  return makeResult(warnings, errors, 1);
};

export const validateEnterpriseDemoTemplates = (
  templates: EnterpriseDemoTemplate[],
): EnterpriseDemoValidationResult => {
  const warnings: EnterpriseDemoValidationFinding[] = [];
  const errors: EnterpriseDemoValidationFinding[] = [];
  const ids = templates.map((template) => template.demoId);

  checkUniqueIds(ids, "demoId", errors);
  templates.forEach((template, index) => {
    const result = validateEnterpriseDemoTemplate(template);
    warnings.push(...result.warnings.map((item) => ({ ...item, path: item.path ?? `templates.${index}` })));
    errors.push(...result.errors.map((item) => ({ ...item, path: item.path ?? `templates.${index}` })));
  });

  return makeResult(warnings, errors, templates.length);
};

export const validateEnterpriseDemoInput = (
  input: EnterpriseDemoInput,
): EnterpriseDemoValidationResult => {
  const warnings: EnterpriseDemoValidationFinding[] = [];
  const errors: EnterpriseDemoValidationFinding[] = [];

  if (input.demoId && !isSupportedDemoId(input.demoId)) {
    addFinding(errors, "fail", "UNKNOWN_DEMO_ID", "Enterprise demo input id is not supported.", "demoId");
  }
  if (input.category && !isSupportedCategory(input.category)) {
    addFinding(errors, "fail", "UNKNOWN_DEMO_CATEGORY", "Enterprise demo input category is not supported.", "category");
  }

  checkTextBounds(input, errors, "input");
  checkForbiddenContent(input, errors);

  return makeResult(warnings, errors, 0);
};
