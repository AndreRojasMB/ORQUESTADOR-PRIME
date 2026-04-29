import {
  listTransactionalTemplates,
  supportedTransactionalCategories,
  transactionalBoundaries,
} from "./transactionTemplates.js";
import type {
  CompensationStrategy,
  IdempotencyRule,
  ReconciliationRule,
  RollbackStrategy,
  TransactionalDomainCategory,
  TransactionalSystemInput,
  TransactionalSystemModel,
  TransactionalValidationFinding,
  TransactionalValidationResult,
} from "./types.js";

const MAX_TEXT_LENGTH = 1_200;
const MAX_ARRAY_LENGTH = 120;

const forbiddenContentPatterns: Array<{ pattern: RegExp; reasonCode: string; safeMessage: string }> = [
  {
    pattern: /\bSELECT\b|\bINSERT\s+INTO\b|\bUPDATE\s+\w+\s+SET\b|\bDELETE\s+FROM\b|\bDROP\s+TABLE\b|\bCREATE\s+TABLE\b/i,
    reasonCode: "SQL_OR_SCHEMA_CONTENT",
    safeMessage: "Transactional metadata must not include SQL or database schema snippets.",
  },
  {
    pattern: /```|<script\b|function\s+\w+\s*\(|class\s+\w+\s*\{|=>|const\s+\w+\s*=/i,
    reasonCode: "CODE_SNIPPET",
    safeMessage: "Transactional metadata must not include code snippets.",
  },
  {
    pattern: /provider output|provider call|network call|filesystem read|filesystem write|command execution/i,
    reasonCode: "FORBIDDEN_RUNTIME_BEHAVIOR",
    safeMessage: "Transactional metadata must not describe provider, network, filesystem, or command behavior.",
  },
  {
    pattern: /transaction execution|execute transaction|commit transaction|run transaction|transaction will run/i,
    reasonCode: "FORBIDDEN_TRANSACTION_EXECUTION",
    safeMessage: "Transactional metadata must not describe transaction execution behavior.",
  },
  {
    pattern: /db write|database write|write to database|store mutation|runtime execution|workflow execution|automation execution/i,
    reasonCode: "FORBIDDEN_EXECUTION_BEHAVIOR",
    safeMessage: "Transactional metadata must not describe DB write, store, runtime, workflow, or automation behavior.",
  },
  {
    pattern: /migration apply|apply migration|database migration|schema migration|sql execution/i,
    reasonCode: "FORBIDDEN_MIGRATION_BEHAVIOR",
    safeMessage: "Transactional metadata must not describe migration or SQL execution behavior.",
  },
  {
    pattern: /action dispatch|proposal creation|approval execution|approve proposal|reject proposal/i,
    reasonCode: "FORBIDDEN_ACTION_BEHAVIOR",
    safeMessage: "Transactional metadata must not describe action, proposal, or approval behavior.",
  },
  {
    pattern: /queue worker|worker generation|generated queue|generated worker|ledger generation|generated ledger|generated sql|generated transactional system|scaffold output|database schema|db schema/i,
    reasonCode: "FORBIDDEN_GENERATION_BEHAVIOR",
    safeMessage: "Transactional metadata must not describe generated ledgers, queues, workers, scaffolds, systems, or schemas.",
  },
  {
    pattern: /banking guarantee|financial guarantee|guarantees financial correctness|guaranteed settlement|guaranteed revenue|guaranteed savings|guaranteed profit/i,
    reasonCode: "FINANCIAL_OVERCLAIM",
    safeMessage: "Transactional metadata must not include banking, financial, settlement, or business guarantees.",
  },
  {
    pattern: /certified|guarantees compliance|legally compliant|security certified|compliance guaranteed/i,
    reasonCode: "COMPLIANCE_OVERCLAIM",
    safeMessage: "Transactional metadata must not include compliance or security certification claims.",
  },
  {
    pattern: /production-ready|production ready|JARVIS-complete|JARVIS complete/i,
    reasonCode: "PRODUCTION_OVERCLAIM",
    safeMessage: "Transactional metadata must not claim production readiness.",
  },
  {
    pattern: /\$\s*\d|\b\d+(?:\.\d+)?\s*%/i,
    reasonCode: "UNSUPPORTED_EXACT_CLAIM",
    safeMessage: "Transactional metadata must not include exact financial or business claims without explicit assumptions.",
  },
];

const normalizeCategory = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const isSupportedCategory = (value: string): value is TransactionalDomainCategory =>
  supportedTransactionalCategories.includes(value as TransactionalDomainCategory);

const createdAt = (): string => new Date().toISOString();

const makeResult = (
  warnings: TransactionalValidationFinding[],
  errors: TransactionalValidationFinding[],
  modelCount: number,
): TransactionalValidationResult => ({
  validationId: `transactional_validation:${createdAt()}`,
  createdAt: createdAt(),
  schemaVersion: "1.0",
  valid: errors.length === 0,
  status: errors.length > 0 ? "fail" : warnings.length > 0 ? "warn" : "pass",
  modelCount,
  warnings,
  errors,
  advisoryOnly: true,
  boundaries: transactionalBoundaries,
});

const addFinding = (
  findings: TransactionalValidationFinding[],
  severity: TransactionalValidationFinding["severity"],
  reasonCode: string,
  safeMessage: string,
  path?: string,
  model?: Partial<TransactionalSystemModel>,
  metadata?: TransactionalValidationFinding["metadata"],
): void => {
  findings.push({
    id: `finding_${findings.length + 1}`,
    severity,
    reasonCode,
    safeMessage,
    ...(path ? { path } : {}),
    ...(model?.category ? { category: model.category } : {}),
    ...(model?.transactionalId ? { transactionalId: model.transactionalId } : {}),
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
  errors: TransactionalValidationFinding[],
  warnings: TransactionalValidationFinding[],
  path: string,
  model?: Partial<TransactionalSystemModel>,
): void => {
  if (typeof value === "string" && value.length > MAX_TEXT_LENGTH) {
    addFinding(
      errors,
      "fail",
      "TEXT_TOO_LONG",
      "Transactional metadata text exceeds the bounded length limit.",
      path,
      model,
    );
  }
  if (Array.isArray(value)) {
    if (value.length > MAX_ARRAY_LENGTH) {
      addFinding(
        warnings,
        "warn",
        "ARRAY_TOO_LONG",
        "Transactional metadata array exceeds the recommended item limit.",
        path,
        model,
        { maxItems: MAX_ARRAY_LENGTH },
      );
    }
    value.forEach((item, index) =>
      checkTextBounds(item, errors, warnings, `${path}.${index}`, model),
    );
  }
  if (isObject(value)) {
    Object.entries(value).forEach(([key, item]) =>
      checkTextBounds(item, errors, warnings, `${path}.${key}`, model),
    );
  }
};

const checkForbiddenContent = (
  value: unknown,
  errors: TransactionalValidationFinding[],
  model?: Partial<TransactionalSystemModel>,
): void => {
  safeStringValues(value).forEach((text) => {
    forbiddenContentPatterns.forEach(({ pattern, reasonCode, safeMessage }) => {
      if (pattern.test(text)) {
        addFinding(errors, "fail", reasonCode, safeMessage, undefined, model);
      }
    });
  });
};

const checkUniqueIds = (
  ids: string[],
  idLabel: string,
  errors: TransactionalValidationFinding[],
  model: Partial<TransactionalSystemModel>,
): void => {
  const seen = new Set<string>();
  ids.forEach((id) => {
    if (!id.trim()) {
      addFinding(errors, "fail", "EMPTY_ID", `${idLabel} must not be empty.`, idLabel, model);
      return;
    }
    if (seen.has(id)) {
      addFinding(errors, "fail", "DUPLICATE_ID", `${idLabel} values must be unique.`, idLabel, model);
    }
    seen.add(id);
  });
};

const requiredArray = (
  value: unknown,
  path: string,
  errors: TransactionalValidationFinding[],
  model: Partial<TransactionalSystemModel>,
): void => {
  if (!Array.isArray(value) || value.length === 0) {
    addFinding(
      errors,
      "fail",
      "REQUIRED_ARRAY_EMPTY",
      "Required transactional arrays must be present and non-empty.",
      path,
      model,
    );
  }
};

const checkBoundaries = (
  model: Partial<TransactionalSystemModel>,
  errors: TransactionalValidationFinding[],
): void => {
  if (model.advisoryOnly !== true) {
    addFinding(
      errors,
      "fail",
      "ADVISORY_ONLY_REQUIRED",
      "Transactional model must be advisory only.",
      "advisoryOnly",
      model,
    );
  }

  const boundaries = model.boundaries as Record<string, unknown> | undefined;
  if (!boundaries) {
    addFinding(
      errors,
      "fail",
      "BOUNDARIES_REQUIRED",
      "Transactional model must include advisory safety boundaries.",
      "boundaries",
      model,
    );
    return;
  }

  Object.keys(transactionalBoundaries).forEach((boundaryName) => {
    if (boundaries[boundaryName] !== true) {
      addFinding(
        errors,
        "fail",
        "BOUNDARY_NOT_TRUE",
        "All transactional safety boundaries must be true.",
        `boundaries.${boundaryName}`,
        model,
      );
    }
  });
};

const checkStateReferences = (
  stateIds: string[],
  ids: string[],
  path: string,
  errors: TransactionalValidationFinding[],
  model: Partial<TransactionalSystemModel>,
): void => {
  const known = new Set(stateIds);
  ids.forEach((id) => {
    if (!known.has(id)) {
      addFinding(
        errors,
        "fail",
        "UNKNOWN_STATE_REFERENCE",
        "Transactional state references must point to known states.",
        path,
        model,
      );
    }
  });
};

const checkAdvisoryRules = (
  rules: IdempotencyRule[],
  errors: TransactionalValidationFinding[],
  model: Partial<TransactionalSystemModel>,
): void => {
  rules.forEach((item, index) => {
    if (item.advisoryOnly !== true || !item.assumptions.length) {
      addFinding(
        errors,
        "fail",
        "IDEMPOTENCY_ADVISORY_REQUIRED",
        "Idempotency rules must be advisory and include assumptions.",
        `idempotencyRules.${index}`,
        model,
      );
    }
  });
};

const checkMetadataStrategies = (
  strategies: RollbackStrategy[] | CompensationStrategy[],
  path: string,
  errors: TransactionalValidationFinding[],
  model: Partial<TransactionalSystemModel>,
): void => {
  strategies.forEach((item, index) => {
    if (item.metadataOnly !== true || item.notExecutable !== true) {
      addFinding(
        errors,
        "fail",
        "STRATEGY_METADATA_ONLY_REQUIRED",
        "Rollback and compensation strategies must be metadata only and not executable.",
        `${path}.${index}`,
        model,
      );
    }
  });
};

const checkReconciliation = (
  rules: ReconciliationRule[],
  errors: TransactionalValidationFinding[],
  model: Partial<TransactionalSystemModel>,
): void => {
  rules.forEach((item, index) => {
    if (item.assumptionBased !== true || item.advisoryOnly !== true) {
      addFinding(
        errors,
        "fail",
        "RECONCILIATION_ASSUMPTION_REQUIRED",
        "Reconciliation rules must be assumption-based advisory metadata.",
        `reconciliationRules.${index}`,
        model,
      );
    }
  });
};

const checkReferences = (
  model: TransactionalSystemModel,
  errors: TransactionalValidationFinding[],
): void => {
  const stateIds = model.states.map((item) => item.stateId);
  const transitionIds = new Set(model.transitions.map((item) => item.transitionId));
  const stateIdSet = new Set(stateIds);

  model.transitions.forEach((item, index) => {
    if (!stateIdSet.has(item.fromStateId) || !stateIdSet.has(item.toStateId)) {
      addFinding(
        errors,
        "fail",
        "UNKNOWN_TRANSITION_STATE",
        "Transactional transitions must reference known states.",
        `transitions.${index}`,
        model,
      );
    }
    if (item.metadataOnly !== true) {
      addFinding(
        errors,
        "fail",
        "TRANSITION_METADATA_ONLY_REQUIRED",
        "Transactional transitions must remain metadata only.",
        `transitions.${index}.metadataOnly`,
        model,
      );
    }
  });

  model.transactionBoundaries.forEach((item, index) =>
    checkStateReferences(stateIds, item.includedStateIds, `transactionBoundaries.${index}.includedStateIds`, errors, model),
  );
  model.idempotencyRules.forEach((item, index) => {
    item.appliesToTransitionIds.forEach((transitionId) => {
      if (!transitionIds.has(transitionId)) {
        addFinding(
          errors,
          "fail",
          "UNKNOWN_TRANSITION_REFERENCE",
          "Idempotency rules must reference known transitions.",
          `idempotencyRules.${index}.appliesToTransitionIds`,
          model,
        );
      }
    });
  });
  model.rollbackStrategies.forEach((item, index) =>
    checkStateReferences(stateIds, item.appliesToStateIds, `rollbackStrategies.${index}.appliesToStateIds`, errors, model),
  );
  model.compensationStrategies.forEach((item, index) =>
    checkStateReferences(stateIds, item.triggerStateIds, `compensationStrategies.${index}.triggerStateIds`, errors, model),
  );
  model.reconciliationRules.forEach((item, index) =>
    checkStateReferences(stateIds, item.checkpointStateIds, `reconciliationRules.${index}.checkpointStateIds`, errors, model),
  );

  if (!model.states.some((item) => item.kind === "initial")) {
    addFinding(errors, "fail", "INITIAL_STATE_REQUIRED", "At least one initial state is required.", "states", model);
  }
  if (!model.states.some((item) => item.kind === "final" || item.kind === "closed" || item.kind === "review")) {
    addFinding(
      errors,
      "fail",
      "CLOSING_STATE_REQUIRED",
      "At least one final, closed, or review state is required.",
      "states",
      model,
    );
  }
};

export const validateTransactionalSystemModel = (
  model: TransactionalSystemModel,
): TransactionalValidationResult => validateTransactionalSystemModels([model]);

export const validateTransactionalSystemModels = (
  models: TransactionalSystemModel[],
): TransactionalValidationResult => {
  const warnings: TransactionalValidationFinding[] = [];
  const errors: TransactionalValidationFinding[] = [];

  if (!Array.isArray(models) || models.length === 0) {
    addFinding(
      errors,
      "fail",
      "MODELS_REQUIRED",
      "At least one transactional model is required for validation.",
    );
    return makeResult(warnings, errors, 0);
  }

  models.forEach((model, modelIndex) => {
    if (!isObject(model)) {
      addFinding(errors, "fail", "MODEL_OBJECT_REQUIRED", "Transactional model must be an object.", `models.${modelIndex}`);
      return;
    }

    if (!isSupportedCategory(model.category)) {
      addFinding(
        errors,
        "fail",
        "UNKNOWN_CATEGORY",
        "Transactional model category must be supported.",
        `models.${modelIndex}.category`,
        model,
      );
    }

    ["transactionalId", "name", "purpose"].forEach((field) => {
      const value = model[field as keyof TransactionalSystemModel];
      if (typeof value !== "string" || !value.trim()) {
        addFinding(
          errors,
          "fail",
          "REQUIRED_FIELD_EMPTY",
          "Required transactional fields must be present and non-empty.",
          `models.${modelIndex}.${field}`,
          model,
        );
      }
    });

    requiredArray(model.transactionBoundaries, `models.${modelIndex}.transactionBoundaries`, errors, model);
    requiredArray(model.consistencyModels, `models.${modelIndex}.consistencyModels`, errors, model);
    requiredArray(model.idempotencyRules, `models.${modelIndex}.idempotencyRules`, errors, model);
    requiredArray(model.rollbackStrategies, `models.${modelIndex}.rollbackStrategies`, errors, model);
    requiredArray(model.compensationStrategies, `models.${modelIndex}.compensationStrategies`, errors, model);
    requiredArray(model.reconciliationRules, `models.${modelIndex}.reconciliationRules`, errors, model);
    requiredArray(model.auditTrailRequirements, `models.${modelIndex}.auditTrailRequirements`, errors, model);
    requiredArray(model.traceabilityRequirements, `models.${modelIndex}.traceabilityRequirements`, errors, model);
    requiredArray(model.states, `models.${modelIndex}.states`, errors, model);
    requiredArray(model.transitions, `models.${modelIndex}.transitions`, errors, model);
    requiredArray(model.exceptions, `models.${modelIndex}.exceptions`, errors, model);
    requiredArray(model.integrityControls, `models.${modelIndex}.integrityControls`, errors, model);
    requiredArray(model.concurrencyRisks, `models.${modelIndex}.concurrencyRisks`, errors, model);
    requiredArray(model.metrics, `models.${modelIndex}.metrics`, errors, model);
    requiredArray(model.assumptions, `models.${modelIndex}.assumptions`, errors, model);
    requiredArray(model.exclusions, `models.${modelIndex}.exclusions`, errors, model);

    checkBoundaries(model, errors);
    checkTextBounds(model, errors, warnings, `models.${modelIndex}`, model);
    checkForbiddenContent(model, errors, model);

    if (Array.isArray(model.transactionBoundaries)) {
      checkUniqueIds(model.transactionBoundaries.map((item) => item.boundaryId), "boundaryId", errors, model);
      model.transactionBoundaries.forEach((item, index) => {
        if (item.assumptionBased !== true || item.metadataOnly !== true) {
          addFinding(
            errors,
            "fail",
            "BOUNDARY_METADATA_ONLY_REQUIRED",
            "Transaction boundaries must be assumption-based metadata only.",
            `transactionBoundaries.${index}`,
            model,
          );
        }
      });
    }
    if (Array.isArray(model.idempotencyRules)) {
      checkUniqueIds(model.idempotencyRules.map((item) => item.idempotencyRuleId), "idempotencyRuleId", errors, model);
      checkAdvisoryRules(model.idempotencyRules, errors, model);
    }
    if (Array.isArray(model.rollbackStrategies)) {
      checkUniqueIds(model.rollbackStrategies.map((item) => item.rollbackStrategyId), "rollbackStrategyId", errors, model);
      checkMetadataStrategies(model.rollbackStrategies, "rollbackStrategies", errors, model);
    }
    if (Array.isArray(model.compensationStrategies)) {
      checkUniqueIds(model.compensationStrategies.map((item) => item.compensationStrategyId), "compensationStrategyId", errors, model);
      checkMetadataStrategies(model.compensationStrategies, "compensationStrategies", errors, model);
    }
    if (Array.isArray(model.reconciliationRules)) {
      checkUniqueIds(model.reconciliationRules.map((item) => item.reconciliationRuleId), "reconciliationRuleId", errors, model);
      checkReconciliation(model.reconciliationRules, errors, model);
    }
    if (Array.isArray(model.auditTrailRequirements)) {
      checkUniqueIds(model.auditTrailRequirements.map((item) => item.auditRequirementId), "auditRequirementId", errors, model);
      model.auditTrailRequirements.forEach((item, index) => {
        if (item.advisoryOnly !== true) {
          addFinding(
            errors,
            "fail",
            "AUDIT_ADVISORY_ONLY_REQUIRED",
            "Audit trail requirements must be advisory metadata only.",
            `auditTrailRequirements.${index}`,
            model,
          );
        }
      });
    }
    if (Array.isArray(model.traceabilityRequirements)) {
      checkUniqueIds(
        model.traceabilityRequirements.map((item) => item.traceabilityRequirementId),
        "traceabilityRequirementId",
        errors,
        model,
      );
    }
    if (Array.isArray(model.states)) {
      checkUniqueIds(model.states.map((item) => item.stateId), "stateId", errors, model);
    }
    if (Array.isArray(model.transitions)) {
      checkUniqueIds(model.transitions.map((item) => item.transitionId), "transitionId", errors, model);
    }
    if (Array.isArray(model.exceptions)) {
      checkUniqueIds(model.exceptions.map((item) => item.exceptionId), "exceptionId", errors, model);
    }
    if (Array.isArray(model.integrityControls)) {
      checkUniqueIds(model.integrityControls.map((item) => item.integrityControlId), "integrityControlId", errors, model);
      model.integrityControls.forEach((item, index) => {
        if (item.advisoryOnly !== true) {
          addFinding(
            errors,
            "fail",
            "INTEGRITY_ADVISORY_ONLY_REQUIRED",
            "Integrity controls must be advisory metadata only.",
            `integrityControls.${index}`,
            model,
          );
        }
      });
    }
    if (Array.isArray(model.concurrencyRisks)) {
      checkUniqueIds(model.concurrencyRisks.map((item) => item.concurrencyRiskId), "concurrencyRiskId", errors, model);
    }
    if (Array.isArray(model.metrics)) {
      checkUniqueIds(model.metrics.map((item) => item.metricId), "metricId", errors, model);
      model.metrics.forEach((item, index) => {
        if (item.advisoryOnly !== true || !item.assumptions.length) {
          addFinding(
            errors,
            "fail",
            "METRIC_ADVISORY_ONLY_REQUIRED",
            "Transactional metrics must be advisory and include assumptions.",
            `metrics.${index}`,
            model,
          );
        }
      });
    }
    if (Array.isArray(model.closingPolicies)) {
      model.closingPolicies.forEach((item, index) => {
        if (item.assumptionBased !== true || item.notGuarantee !== true) {
          addFinding(
            errors,
            "fail",
            "CLOSING_POLICY_ASSUMPTION_REQUIRED",
            "Closing policies must be assumptions, not guarantees.",
            `closingPolicies.${index}`,
            model,
          );
        }
      });
    }
    if (Array.isArray(model.postingPolicies)) {
      model.postingPolicies.forEach((item, index) => {
        if (item.assumptionBased !== true || item.notFinancialCorrectnessClaim !== true) {
          addFinding(
            errors,
            "fail",
            "POSTING_POLICY_ASSUMPTION_REQUIRED",
            "Posting policies must not claim financial correctness.",
            `postingPolicies.${index}`,
            model,
          );
        }
      });
    }
    if (Array.isArray(model.settlementNotes)) {
      model.settlementNotes.forEach((item, index) => {
        if (item.assumptionBased !== true || item.notFinancialCorrectnessClaim !== true) {
          addFinding(
            errors,
            "fail",
            "SETTLEMENT_NOTE_ASSUMPTION_REQUIRED",
            "Settlement notes must not claim financial correctness.",
            `settlementNotes.${index}`,
            model,
          );
        }
      });
    }

    if (
      Array.isArray(model.states) &&
      Array.isArray(model.transitions) &&
      Array.isArray(model.transactionBoundaries) &&
      Array.isArray(model.idempotencyRules) &&
      Array.isArray(model.rollbackStrategies) &&
      Array.isArray(model.compensationStrategies) &&
      Array.isArray(model.reconciliationRules)
    ) {
      checkReferences(model, errors);
    }
  });

  return makeResult(warnings, errors, models.length);
};

export const validateTransactionalSystemInput = (
  input: TransactionalSystemInput,
): TransactionalValidationResult => {
  const warnings: TransactionalValidationFinding[] = [];
  const errors: TransactionalValidationFinding[] = [];

  if (!input || typeof input !== "object") {
    addFinding(
      errors,
      "fail",
      "INPUT_OBJECT_REQUIRED",
      "Transactional system input must be an object.",
    );
    return makeResult(warnings, errors, 0);
  }

  const normalized = normalizeCategory(String(input.category ?? ""));
  if (!normalized || !isSupportedCategory(normalized)) {
    addFinding(
      errors,
      "fail",
      "UNKNOWN_CATEGORY",
      "Transactional input category must be supported.",
      "category",
    );
  }

  checkTextBounds(input, errors, warnings, "input");
  checkForbiddenContent(input, errors);

  return makeResult(warnings, errors, 0);
};

export const validateTransactionalTemplateRegistry = (): TransactionalValidationResult =>
  validateTransactionalSystemModels(listTransactionalTemplates());
