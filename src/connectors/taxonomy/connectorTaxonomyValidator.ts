import {
  connectorTaxonomyBoundaries,
  supportedConnectorCapabilityKinds,
  supportedConnectorCategories,
  supportedConnectorIds,
  supportedConnectorMaturityStages,
  supportedConnectorRiskTiers,
} from "./connectorTaxonomyTemplates.js";
import type {
  ConnectorCapability,
  ConnectorCapabilityKind,
  ConnectorCategory,
  ConnectorId,
  ConnectorMaturityStage,
  ConnectorRiskTier,
  ConnectorTaxonomy,
  ConnectorTaxonomyEntry,
  ConnectorTaxonomyInput,
  ConnectorTaxonomyValidationFinding,
  ConnectorTaxonomyValidationResult,
} from "./types.js";

const MAX_TEXT_LENGTH = 1200;
const MAX_ARRAY_LENGTH = 120;

const forbiddenContentPatterns: Array<{ pattern: RegExp; reasonCode: string; safeMessage: string }> = [
  {
    pattern:
      /@openai\/agents|fetch\s*\(|from\s+['"]fs|from\s+['"]fs\/promises|child[_-]process|exec\s*\(|spawn\s*\(|write\s*File|append\s*File|mkdir|rm\s+-rf/i,
    reasonCode: "FORBIDDEN_SOURCE_BEHAVIOR_TOKEN",
    safeMessage:
      "Connector taxonomy metadata must not include source behavior tokens for providers, network, filesystem, or command execution.",
  },
  {
    pattern:
      /\b(performs?|performed|runs?|ran|executes?|executed|starts?|started|calls?|called)\s+(a\s+|the\s+)?(provider|network|external\s+service|remote\s+service|connector|automation|runtime|dashboard|action|proposal|approval)\b/i,
    reasonCode: "FORBIDDEN_EXECUTION_WORDING",
    safeMessage: "Connector taxonomy metadata must not describe live execution behavior.",
  },
  {
    pattern:
      /\b(implements?|creates?|created|enables?|enabled|starts?|started)\s+(a\s+|the\s+)?(webhook|listener|server|browser\s+automation|terminal)\b/i,
    reasonCode: "FORBIDDEN_IMPLEMENTATION_WORDING",
    safeMessage: "Connector taxonomy metadata must not describe webhook, listener, browser, or terminal implementation.",
  },
  {
    pattern:
      /\b(secret|token|provider\s+key|api\s+key|oauth|webhook\s+secret|credential\s+value)\s*[:=]\s*\S+/i,
    reasonCode: "SECRET_OR_CREDENTIAL_VALUE",
    safeMessage: "Connector taxonomy metadata must not include secret, token, key, OAuth, webhook, or credential values.",
  },
  {
    pattern:
      /\b(Gmail\s+send|Calendar\s+create|GitHub\s+write|payment\s+execution|billing\s+execution|SSO\s+implementation|connector\s+write)\b/i,
    reasonCode: "FORBIDDEN_CONNECTOR_OPERATION_WORDING",
    safeMessage: "Connector taxonomy metadata must not describe connector write behavior as active.",
  },
  {
    pattern:
      /\b(DB\s+schema|database\s+schema|SQL\s+execution|CREATE\s+TABLE|SELECT\s+|INSERT\s+INTO|UPDATE\s+\w+\s+SET|DELETE\s+FROM|DROP\s+TABLE)\b/i,
    reasonCode: "DB_SCHEMA_OR_SQL_CONTENT",
    safeMessage: "Connector taxonomy metadata must not include database schema or SQL content.",
  },
  {
    pattern:
      /\bproduction-ready\b|\bproduction ready\b|security guarantee|compliance guarantee|certification guarantee|certified secure|guarantees compliance/i,
    reasonCode: "PRODUCTION_OR_GOVERNANCE_OVERCLAIM",
    safeMessage: "Connector taxonomy metadata must not include production, security, compliance, or certification guarantees.",
  },
];

const isSupportedConnectorId = (value: string): value is ConnectorId =>
  supportedConnectorIds.includes(value as ConnectorId);

const isSupportedCategory = (value: string): value is ConnectorCategory =>
  supportedConnectorCategories.includes(value as ConnectorCategory);

const isSupportedCapabilityKind = (value: string): value is ConnectorCapabilityKind =>
  supportedConnectorCapabilityKinds.includes(value as ConnectorCapabilityKind);

const isSupportedRiskTier = (value: string): value is ConnectorRiskTier =>
  supportedConnectorRiskTiers.includes(value as ConnectorRiskTier);

const isSupportedMaturityStage = (value: string): value is ConnectorMaturityStage =>
  supportedConnectorMaturityStages.includes(value as ConnectorMaturityStage);

const makeResult = (
  warnings: ConnectorTaxonomyValidationFinding[],
  errors: ConnectorTaxonomyValidationFinding[],
  entryCount: number,
): ConnectorTaxonomyValidationResult => ({
  validationId: "connector_taxonomy_validation:static",
  schemaVersion: "1.0",
  valid: errors.length === 0,
  status: errors.length > 0 ? "fail" : warnings.length > 0 ? "warn" : "pass",
  entryCount,
  warnings,
  errors,
  advisoryOnly: true,
  sourceOnly: true,
  boundaries: connectorTaxonomyBoundaries,
});

const addFinding = (
  findings: ConnectorTaxonomyValidationFinding[],
  severity: ConnectorTaxonomyValidationFinding["severity"],
  reasonCode: string,
  safeMessage: string,
  path?: string,
  connectorId?: ConnectorId,
  metadata?: ConnectorTaxonomyValidationFinding["metadata"],
): void => {
  findings.push({
    id: `finding_${findings.length + 1}`,
    severity,
    reasonCode,
    safeMessage,
    ...(path ? { path } : {}),
    ...(connectorId ? { connectorId } : {}),
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
  errors: ConnectorTaxonomyValidationFinding[],
  path: string,
  connectorId?: ConnectorId,
): void => {
  if (typeof value === "string" && value.length > MAX_TEXT_LENGTH) {
    addFinding(
      errors,
      "fail",
      "TEXT_TOO_LONG",
      "Connector taxonomy metadata text exceeds the bounded length limit.",
      path,
      connectorId,
    );
  }
  if (Array.isArray(value)) {
    if (value.length > MAX_ARRAY_LENGTH) {
      addFinding(
        errors,
        "fail",
        "ARRAY_TOO_LONG",
        "Connector taxonomy metadata array exceeds the bounded item limit.",
        path,
        connectorId,
      );
    }
    value.forEach((item, index) => checkTextBounds(item, errors, `${path}.${index}`, connectorId));
  }
  if (isObject(value)) {
    Object.entries(value).forEach(([key, item]) =>
      checkTextBounds(item, errors, `${path}.${key}`, connectorId),
    );
  }
};

const checkForbiddenContent = (
  value: unknown,
  errors: ConnectorTaxonomyValidationFinding[],
  connectorId?: ConnectorId,
): void => {
  safeStringValues(value).forEach((text) => {
    forbiddenContentPatterns.forEach(({ pattern, reasonCode, safeMessage }) => {
      if (pattern.test(text)) {
        addFinding(errors, "fail", reasonCode, safeMessage, undefined, connectorId);
      }
    });
  });
};

const checkUniqueIds = (
  ids: string[],
  idLabel: string,
  errors: ConnectorTaxonomyValidationFinding[],
  connectorId?: ConnectorId,
): void => {
  const seen = new Set<string>();
  ids.forEach((id, index) => {
    if (!id.trim()) {
      addFinding(errors, "fail", "EMPTY_ID", `${idLabel} must not be empty.`, `${idLabel}.${index}`, connectorId);
      return;
    }
    if (seen.has(id)) {
      addFinding(errors, "fail", "DUPLICATE_ID", `${idLabel} values must be unique.`, idLabel, connectorId);
    }
    seen.add(id);
  });
};

const requiredArray = (
  value: unknown,
  path: string,
  errors: ConnectorTaxonomyValidationFinding[],
  connectorId?: ConnectorId,
): void => {
  if (!Array.isArray(value) || value.length === 0) {
    addFinding(
      errors,
      "fail",
      "REQUIRED_ARRAY_EMPTY",
      "Required connector taxonomy metadata arrays must be present and non-empty.",
      path,
      connectorId,
    );
  }
};

const checkBoundaries = (
  model: Partial<ConnectorTaxonomyEntry | ConnectorTaxonomy>,
  errors: ConnectorTaxonomyValidationFinding[],
  pathPrefix: string,
  connectorId?: ConnectorId,
): void => {
  if (model.advisoryOnly !== true) {
    addFinding(
      errors,
      "fail",
      "ADVISORY_ONLY_REQUIRED",
      "Connector taxonomy metadata must be advisory only.",
      `${pathPrefix}.advisoryOnly`,
      connectorId,
    );
  }
  if (model.sourceOnly !== true) {
    addFinding(
      errors,
      "fail",
      "SOURCE_ONLY_REQUIRED",
      "Connector taxonomy metadata must be source only.",
      `${pathPrefix}.sourceOnly`,
      connectorId,
    );
  }

  const boundaries = model.boundaries as unknown as Record<string, unknown> | undefined;
  if (!boundaries) {
    addFinding(
      errors,
      "fail",
      "BOUNDARIES_REQUIRED",
      "Connector taxonomy metadata must include advisory safety boundaries.",
      `${pathPrefix}.boundaries`,
      connectorId,
    );
    return;
  }

  const expectedBoundaries = connectorTaxonomyBoundaries as unknown as Record<string, true>;
  Object.keys(expectedBoundaries).forEach((boundaryName) => {
    if (boundaries[boundaryName] !== true) {
      addFinding(
        errors,
        "fail",
        "BOUNDARY_NOT_TRUE",
        "All connector taxonomy safety boundaries must be true.",
        `${pathPrefix}.boundaries.${boundaryName}`,
        connectorId,
      );
    }
  });
};

const checkCapabilities = (
  entry: ConnectorTaxonomyEntry,
  errors: ConnectorTaxonomyValidationFinding[],
): void => {
  entry.capabilities.forEach((capabilityItem, index) => {
    const path = `entry.capabilities.${index}`;
    if (!isSupportedCapabilityKind(capabilityItem.kind)) {
      addFinding(
        errors,
        "fail",
        "CAPABILITY_KIND_UNSUPPORTED",
        "Connector capability kind must be in the supported taxonomy set.",
        `${path}.kind`,
        entry.connectorId,
      );
    }
    if (capabilityItem.metadataOnly !== true || capabilityItem.noExecution !== true) {
      addFinding(
        errors,
        "fail",
        "CAPABILITY_METADATA_ONLY_REQUIRED",
        "Connector capabilities must remain metadata only with no execution.",
        path,
        entry.connectorId,
      );
    }
  });

  const mutationCapabilities: ConnectorCapability[] = [
    ...entry.mutationCapabilities,
    ...entry.capabilities.filter((item) => item.mode === "write" || item.mode === "mutation"),
  ];
  if (mutationCapabilities.length > 0 && entry.approvalGate.required !== true) {
    addFinding(
      errors,
      "fail",
      "MUTATION_REQUIRES_APPROVAL",
      "Write or mutation capabilities require approval gate metadata.",
      "entry.approvalGate.required",
      entry.connectorId,
    );
  }
};

const checkCredentialRequirements = (
  entry: ConnectorTaxonomyEntry,
  errors: ConnectorTaxonomyValidationFinding[],
): void => {
  entry.credentialRequirements.forEach((requirement, index) => {
    if (requirement.metadataOnly !== true || requirement.valuesProvided !== false) {
      addFinding(
        errors,
        "fail",
        "CREDENTIAL_REQUIREMENT_METADATA_ONLY",
        "Credential requirements must remain metadata only and must not provide values.",
        `entry.credentialRequirements.${index}`,
        entry.connectorId,
      );
    }
  });
};

const checkRiskRequirements = (
  entry: ConnectorTaxonomyEntry,
  errors: ConnectorTaxonomyValidationFinding[],
): void => {
  const highRisk = entry.riskTier === "high" || entry.riskTier === "critical";
  if (highRisk && entry.auditPlan.required !== true) {
    addFinding(
      errors,
      "fail",
      "HIGH_RISK_REQUIRES_AUDIT",
      "High and critical connector taxonomy entries require audit metadata.",
      "entry.auditPlan.required",
      entry.connectorId,
    );
  }
  if (highRisk && entry.approvalGate.required !== true) {
    addFinding(
      errors,
      "fail",
      "HIGH_RISK_REQUIRES_APPROVAL",
      "High and critical connector taxonomy entries require approval metadata.",
      "entry.approvalGate.required",
      entry.connectorId,
    );
  }
  if (entry.dryRunPlan.externalCalls !== false || entry.dryRunPlan.noExecution !== true) {
    addFinding(
      errors,
      "fail",
      "DRY_RUN_NO_EXTERNAL_CALLS_REQUIRED",
      "Connector dry-run plans must remain metadata only and must not contact external services.",
      "entry.dryRunPlan",
      entry.connectorId,
    );
  }
};

const checkSpecialConnectorRules = (
  entry: ConnectorTaxonomyEntry,
  errors: ConnectorTaxonomyValidationFinding[],
): void => {
  if (
    (entry.connectorId === "filesystem_safe" || entry.connectorId === "terminal_safe") &&
    (entry.sandboxPlan.defaultDeny !== true || entry.sandboxPlan.futureOnly !== true)
  ) {
    addFinding(
      errors,
      "fail",
      "LOCAL_SYSTEM_DEFAULT_DENY_REQUIRED",
      "Filesystem and terminal connector taxonomy entries must be default-deny and future-only.",
      "entry.sandboxPlan",
      entry.connectorId,
    );
  }

  if (
    (entry.connectorId === "payments" ||
      entry.connectorId === "billing_invoicing" ||
      entry.connectorId === "sso") &&
    (entry.riskTier !== "critical" || entry.maturityStage !== "deferred_until_prerequisites")
  ) {
    addFinding(
      errors,
      "fail",
      "CRITICAL_FUTURE_ONLY_REQUIRED",
      "Payments, billing, and SSO connector taxonomy entries must remain critical and future-only.",
      "entry",
      entry.connectorId,
    );
  }
};

export const validateConnectorTaxonomyEntry = (
  entry: ConnectorTaxonomyEntry,
): ConnectorTaxonomyValidationResult => {
  const warnings: ConnectorTaxonomyValidationFinding[] = [];
  const errors: ConnectorTaxonomyValidationFinding[] = [];
  const connectorId = isSupportedConnectorId(entry.connectorId) ? entry.connectorId : undefined;

  if (!isSupportedConnectorId(entry.connectorId)) {
    addFinding(
      errors,
      "fail",
      "CONNECTOR_ID_UNSUPPORTED",
      "Connector taxonomy entry id must be in the supported registry.",
      "entry.connectorId",
    );
  }
  if (!isSupportedCategory(entry.category)) {
    addFinding(
      errors,
      "fail",
      "CATEGORY_UNSUPPORTED",
      "Connector taxonomy category must be in the supported category set.",
      "entry.category",
      connectorId,
    );
  }
  if (!isSupportedRiskTier(entry.riskTier)) {
    addFinding(
      errors,
      "fail",
      "RISK_TIER_UNSUPPORTED",
      "Connector taxonomy risk tier must be in the supported risk tier set.",
      "entry.riskTier",
      connectorId,
    );
  }
  if (!isSupportedMaturityStage(entry.maturityStage)) {
    addFinding(
      errors,
      "fail",
      "MATURITY_STAGE_UNSUPPORTED",
      "Connector taxonomy maturity stage must be in the supported maturity set.",
      "entry.maturityStage",
      connectorId,
    );
  }

  requiredArray(entry.capabilities, "entry.capabilities", errors, connectorId);
  requiredArray(entry.readOnlyCapabilities, "entry.readOnlyCapabilities", errors, connectorId);
  requiredArray(entry.mutationCapabilities, "entry.mutationCapabilities", errors, connectorId);
  requiredArray(entry.permissionScopes, "entry.permissionScopes", errors, connectorId);
  requiredArray(entry.credentialRequirements, "entry.credentialRequirements", errors, connectorId);
  requiredArray(entry.dataAccessScopes, "entry.dataAccessScopes", errors, connectorId);
  requiredArray(entry.actionScopes, "entry.actionScopes", errors, connectorId);
  requiredArray(entry.redactionRules, "entry.redactionRules", errors, connectorId);
  requiredArray(entry.assumptions, "entry.assumptions", errors, connectorId);
  requiredArray(entry.exclusions, "entry.exclusions", errors, connectorId);

  checkUniqueIds(entry.capabilities.map((item) => item.capabilityId), "capabilityId", errors, connectorId);
  checkUniqueIds(entry.permissionScopes.map((item) => item.scopeId), "scopeId", errors, connectorId);
  checkUniqueIds(
    entry.credentialRequirements.map((item) => item.requirementId),
    "requirementId",
    errors,
    connectorId,
  );
  checkUniqueIds(entry.dataAccessScopes.map((item) => item.dataScopeId), "dataScopeId", errors, connectorId);
  checkUniqueIds(entry.actionScopes.map((item) => item.actionScopeId), "actionScopeId", errors, connectorId);
  checkUniqueIds(entry.redactionRules.map((item) => item.ruleId), "ruleId", errors, connectorId);

  checkBoundaries(entry, errors, "entry", connectorId);
  checkTextBounds(entry, errors, "entry", connectorId);
  checkForbiddenContent(entry, errors, connectorId);
  checkCapabilities(entry, errors);
  checkCredentialRequirements(entry, errors);
  checkRiskRequirements(entry, errors);
  checkSpecialConnectorRules(entry, errors);

  return makeResult(warnings, errors, 1);
};

export const validateConnectorTaxonomyEntries = (
  entries: ConnectorTaxonomyEntry[],
): ConnectorTaxonomyValidationResult => {
  const warnings: ConnectorTaxonomyValidationFinding[] = [];
  const errors: ConnectorTaxonomyValidationFinding[] = [];

  if (!Array.isArray(entries) || entries.length === 0) {
    addFinding(
      errors,
      "fail",
      "ENTRIES_REQUIRED",
      "Connector taxonomy validation requires at least one entry.",
      "entries",
    );
    return makeResult(warnings, errors, 0);
  }

  checkUniqueIds(entries.map((entry) => entry.connectorId), "connectorId", errors);
  entries.forEach((entry) => {
    const result = validateConnectorTaxonomyEntry(entry);
    warnings.push(...result.warnings);
    errors.push(...result.errors);
  });

  return makeResult(warnings, errors, entries.length);
};

export const validateConnectorTaxonomy = (
  taxonomy: ConnectorTaxonomy,
): ConnectorTaxonomyValidationResult => {
  const warnings: ConnectorTaxonomyValidationFinding[] = [];
  const errors: ConnectorTaxonomyValidationFinding[] = [];

  checkBoundaries(taxonomy, errors, "taxonomy");
  checkTextBounds(taxonomy, errors, "taxonomy");
  checkForbiddenContent(taxonomy, errors);
  requiredArray(taxonomy.entries, "taxonomy.entries", errors);
  requiredArray(taxonomy.includedConnectorIds, "taxonomy.includedConnectorIds", errors);

  const entriesResult = validateConnectorTaxonomyEntries(taxonomy.entries);
  warnings.push(...entriesResult.warnings);
  errors.push(...entriesResult.errors);

  return makeResult(warnings, errors, taxonomy.entries.length);
};

export const validateConnectorTaxonomyInput = (
  input: ConnectorTaxonomyInput,
): ConnectorTaxonomyValidationResult => {
  const warnings: ConnectorTaxonomyValidationFinding[] = [];
  const errors: ConnectorTaxonomyValidationFinding[] = [];

  checkTextBounds(input, errors, "input");
  checkForbiddenContent(input, errors);

  input.connectorIds?.forEach((connectorId, index) => {
    const normalized = connectorId
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
    if (!isSupportedConnectorId(normalized)) {
      addFinding(
        errors,
        "fail",
        "CONNECTOR_ID_UNSUPPORTED",
        "Connector taxonomy input includes unsupported connector ids.",
        `input.connectorIds.${index}`,
      );
    }
  });

  return makeResult(warnings, errors, 0);
};
