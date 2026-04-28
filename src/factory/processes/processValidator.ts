import {
  businessProcessBoundaries,
  businessProcessTemplates,
  supportedBusinessProcessCategories,
} from "./processTemplates.js";
import type {
  BusinessProcessBoundarySet,
  BusinessProcessCategory,
  BusinessProcessModel,
  BusinessProcessModelInput,
  BusinessProcessValidationFinding,
  BusinessProcessValidationResult,
  BusinessProcessValidationStatus,
} from "./types.js";

const SCHEMA_VERSION = "1.0" as const;
const MAX_TEXT_LENGTH = 1_200;
const MAX_ARRAY_LENGTH = 120;

const boundaryKeys = [
  "advisoryOnly",
  "sourceOnly",
  "noProviderCalls",
  "noNetwork",
  "noFilesystemReads",
  "noFilesystemWrites",
  "noCommandExecution",
  "noRuntimeExecution",
  "noWorkflowExecution",
  "noAutomationExecution",
  "noStoreMutation",
  "noActionDispatch",
  "noProposalCreation",
  "noApprovalExecution",
  "noScaffolding",
  "noDbSchemas",
  "noGeneratedSystems",
  "noProductionReadinessClaims",
  "noComplianceGuarantees",
] as const satisfies readonly (keyof BusinessProcessBoundarySet)[];

const forbiddenContentPatterns = [
  "provider output",
  "network call",
  "filesystem read",
  "filesystem write",
  "command execution",
  "runtime execution",
  "workflow execution",
  "automation execution",
  "approval execution",
  "store mutation",
  "action dispatch",
  "proposal creation",
  "create table",
  "generated code",
  "code snippet",
  "scaffold instruction",
  "scaffold output",
  "production-ready",
  "guarantees compliance",
  "legally compliant",
  "security certified",
  "certified compliant",
];

const guaranteePattern = /\b(guarantee|guaranteed|must be completed within|will always|legally sufficient)\b/i;
const codeLikePattern = /```|function\s+\w+\s*\(|class\s+\w+|const\s+\w+\s*=|=>\s*\{/i;

const makeValidationId = (): string =>
  `business_process_validation_${Date.now().toString(36)}`;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const safeStringValues = (value: unknown): string[] => {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(safeStringValues);
  if (isRecord(value)) return Object.values(value).flatMap(safeStringValues);
  return [];
};

const addFinding = (
  findings: BusinessProcessValidationFinding[],
  severity: "warn" | "fail",
  reasonCode: string,
  safeMessage: string,
  source?: {
    path?: string;
    processId?: string;
    category?: BusinessProcessCategory;
    metadata?: Record<string, string | number | boolean>;
  },
): void => {
  findings.push({
    id: `finding_${findings.length + 1}`,
    severity,
    reasonCode,
    safeMessage,
    ...(source?.path ? { path: source.path } : {}),
    ...(source?.processId ? { processId: source.processId } : {}),
    ...(source?.category ? { category: source.category } : {}),
    ...(source?.metadata ? { metadata: source.metadata } : {}),
  });
};

const sourceContext = (input: {
  path?: string | undefined;
  processId?: string | undefined;
  category?: BusinessProcessCategory | undefined;
  metadata?: Record<string, string | number | boolean> | undefined;
}): Parameters<typeof addFinding>[4] => ({
  ...(input.path ? { path: input.path } : {}),
  ...(input.processId ? { processId: input.processId } : {}),
  ...(input.category ? { category: input.category } : {}),
  ...(input.metadata ? { metadata: input.metadata } : {}),
});

const hasAllBoundaries = (value: unknown): value is BusinessProcessBoundarySet =>
  isRecord(value) && boundaryKeys.every((key) => value[key] === true);

const isKnownCategory = (value: unknown): value is BusinessProcessCategory =>
  typeof value === "string" &&
  supportedBusinessProcessCategories.includes(value as BusinessProcessCategory);

const validationResult = (
  models: readonly unknown[],
  warnings: BusinessProcessValidationFinding[],
  errors: BusinessProcessValidationFinding[],
): BusinessProcessValidationResult => {
  const status: BusinessProcessValidationStatus =
    errors.length > 0 ? "fail" : warnings.length > 0 ? "warn" : "pass";
  const processIds = models
    .filter(isRecord)
    .map((model) => model.processId)
    .filter((id): id is string => typeof id === "string");

  return {
    validationId: makeValidationId(),
    createdAt: new Date().toISOString(),
    schemaVersion: SCHEMA_VERSION,
    valid: errors.length === 0,
    status,
    modelCount: models.length,
    processIds,
    warnings,
    errors,
    advisoryOnly: true,
    boundaries: businessProcessBoundaries,
  };
};

const validateTextSafety = (
  value: unknown,
  errors: BusinessProcessValidationFinding[],
  warnings: BusinessProcessValidationFinding[],
  path: string,
  processId?: string,
  category?: BusinessProcessCategory,
): void => {
  safeStringValues(value).forEach((text, valueIndex) => {
    if (text.length > MAX_TEXT_LENGTH) {
      addFinding(errors, "fail", "TEXT_TOO_LONG", "Business process text exceeds the bounded description limit.", {
        ...sourceContext({ path, processId, category }),
        metadata: { valueIndex, maxLength: MAX_TEXT_LENGTH },
      });
    }

    forbiddenContentPatterns.forEach((pattern) => {
      if (text.toLowerCase().includes(pattern)) {
        addFinding(
          errors,
          "fail",
          "FORBIDDEN_CONTENT",
          "Business process text contains content outside advisory source-only scope.",
          sourceContext({ path, processId, category }),
        );
      }
    });

    if (guaranteePattern.test(text)) {
      addFinding(
        errors,
        "fail",
        "UNSAFE_GUARANTEE",
        "Business process text must not include SLA, production, legal, or compliance guarantees.",
        sourceContext({ path, processId, category }),
      );
    }

    if (codeLikePattern.test(text)) {
      addFinding(
        errors,
        "fail",
        "CODE_SNIPPET",
        "Business process text must not include code snippets.",
        sourceContext({ path, processId, category }),
      );
    }
  });

  if (Array.isArray(value) && value.length > MAX_ARRAY_LENGTH) {
    addFinding(warnings, "warn", "ARRAY_FIELD_LARGE", "Business process array is larger than the recommended bound.", {
      ...sourceContext({ path, processId, category }),
      metadata: { maxItems: MAX_ARRAY_LENGTH },
    });
  }
};

const validateUniqueIds = (
  values: unknown,
  idField: string,
  reasonCode: string,
  path: string,
  errors: BusinessProcessValidationFinding[],
  processId?: string,
  category?: BusinessProcessCategory,
): Set<string> => {
  const ids = new Set<string>();
  if (!Array.isArray(values)) return ids;

  values.forEach((item, index) => {
    if (!isRecord(item) || !isNonEmptyString(item[idField])) {
      addFinding(errors, "fail", "MISSING_REQUIRED_ID", "Business process item id is required.", {
        ...sourceContext({ path: `${path}.${index}.${idField}`, processId, category }),
      });
      return;
    }

    const id = item[idField];
    if (ids.has(id)) {
      addFinding(errors, "fail", reasonCode, "Business process ids must be unique within their collection.", {
        ...sourceContext({ path: `${path}.${index}.${idField}`, processId, category }),
      });
    }
    ids.add(id);
  });

  return ids;
};

const validateReferences = (
  model: Record<string, unknown>,
  errors: BusinessProcessValidationFinding[],
  processId?: string,
  category?: BusinessProcessCategory,
): void => {
  const roleIds = validateUniqueIds(model.roles, "roleId", "DUPLICATE_ROLE_ID", "roles", errors, processId, category);
  const actorIds = validateUniqueIds(model.actors, "actorId", "DUPLICATE_ACTOR_ID", "actors", errors, processId, category);
  const stateIds = validateUniqueIds(model.states, "stateId", "DUPLICATE_STATE_ID", "states", errors, processId, category);
  const transitionIds = validateUniqueIds(model.transitions, "transitionId", "DUPLICATE_TRANSITION_ID", "transitions", errors, processId, category);
  validateUniqueIds(model.approvals, "approvalId", "DUPLICATE_APPROVAL_ID", "approvals", errors, processId, category);

  if (Array.isArray(model.actors)) {
    model.actors.forEach((actor, index) => {
      if (isRecord(actor) && isNonEmptyString(actor.roleId) && !roleIds.has(actor.roleId)) {
        addFinding(errors, "fail", "UNKNOWN_ACTOR_ROLE", "Process actor must reference a known role.", {
          ...sourceContext({ path: `actors.${index}.roleId`, processId, category }),
        });
      }
    });
  }

  if (Array.isArray(model.states)) {
    const hasInitial = model.states.some((item) => isRecord(item) && item.kind === "initial");
    const hasFinal = model.states.some((item) => isRecord(item) && item.kind === "final");
    if (!hasInitial) {
      addFinding(errors, "fail", "MISSING_INITIAL_STATE", "Business process model must include at least one initial state.", {
        ...sourceContext({ path: "states", processId, category }),
      });
    }
    if (!hasFinal) {
      addFinding(errors, "fail", "MISSING_FINAL_STATE", "Business process model must include at least one final state.", {
        ...sourceContext({ path: "states", processId, category }),
      });
    }
  }

  if (Array.isArray(model.transitions)) {
    model.transitions.forEach((transition, index) => {
      if (!isRecord(transition)) return;
      if (isNonEmptyString(transition.fromStateId) && !stateIds.has(transition.fromStateId)) {
        addFinding(errors, "fail", "UNKNOWN_FROM_STATE", "Process transition must reference a known fromStateId.", {
          ...sourceContext({ path: `transitions.${index}.fromStateId`, processId, category }),
        });
      }
      if (isNonEmptyString(transition.toStateId) && !stateIds.has(transition.toStateId)) {
        addFinding(errors, "fail", "UNKNOWN_TO_STATE", "Process transition must reference a known toStateId.", {
          ...sourceContext({ path: `transitions.${index}.toStateId`, processId, category }),
        });
      }
    });
  }

  if (Array.isArray(model.approvals)) {
    model.approvals.forEach((approval, index) => {
      if (!isRecord(approval)) return;
      if (approval.advisoryOnly !== true) {
        addFinding(errors, "fail", "APPROVAL_NOT_ADVISORY", "Process approvals must remain advisory metadata only.", {
          ...sourceContext({ path: `approvals.${index}.advisoryOnly`, processId, category }),
        });
      }
      if (Array.isArray(approval.requiredRoleIds)) {
        approval.requiredRoleIds.forEach((roleId) => {
          if (typeof roleId === "string" && !roleIds.has(roleId)) {
            addFinding(errors, "fail", "UNKNOWN_APPROVAL_ROLE", "Process approval must reference known roles.", {
              ...sourceContext({ path: `approvals.${index}.requiredRoleIds`, processId, category }),
            });
          }
        });
      }
      if (Array.isArray(approval.requiredActorIds)) {
        approval.requiredActorIds.forEach((actorId) => {
          if (typeof actorId === "string" && !actorIds.has(actorId)) {
            addFinding(errors, "fail", "UNKNOWN_APPROVAL_ACTOR", "Process approval must reference known actors.", {
              ...sourceContext({ path: `approvals.${index}.requiredActorIds`, processId, category }),
            });
          }
        });
      }
      if (Array.isArray(approval.appliesToTransitionIds)) {
        approval.appliesToTransitionIds.forEach((transitionId) => {
          if (typeof transitionId === "string" && !transitionIds.has(transitionId)) {
            addFinding(errors, "fail", "UNKNOWN_APPROVAL_TRANSITION", "Process approval must reference known transitions.", {
              ...sourceContext({ path: `approvals.${index}.appliesToTransitionIds`, processId, category }),
            });
          }
        });
      }
    });
  }

  if (Array.isArray(model.handoffs)) {
    model.handoffs.forEach((handoff, index) => {
      if (!isRecord(handoff)) return;
      if (isNonEmptyString(handoff.fromRoleId) && !roleIds.has(handoff.fromRoleId)) {
        addFinding(errors, "fail", "UNKNOWN_HANDOFF_FROM_ROLE", "Process handoff must reference a known source role.", {
          ...sourceContext({ path: `handoffs.${index}.fromRoleId`, processId, category }),
        });
      }
      if (isNonEmptyString(handoff.toRoleId) && !roleIds.has(handoff.toRoleId)) {
        addFinding(errors, "fail", "UNKNOWN_HANDOFF_TO_ROLE", "Process handoff must reference a known target role.", {
          ...sourceContext({ path: `handoffs.${index}.toRoleId`, processId, category }),
        });
      }
    });
  }
};

const validateModelShape = (
  model: unknown,
  errors: BusinessProcessValidationFinding[],
  warnings: BusinessProcessValidationFinding[],
): void => {
  if (!isRecord(model)) {
    addFinding(errors, "fail", "INVALID_MODEL", "Business process model must be an object.");
    return;
  }

  const processId = isNonEmptyString(model.processId) ? model.processId : undefined;
  const category = isKnownCategory(model.category) ? model.category : undefined;

  ["processId", "name", "purpose"].forEach((field) => {
    if (!isNonEmptyString(model[field])) {
      addFinding(errors, "fail", "MISSING_REQUIRED_FIELD", "Business process required field is missing.", {
        ...sourceContext({ path: field, processId, category }),
      });
    }
  });

  if (!category) {
    addFinding(errors, "fail", "UNKNOWN_CATEGORY", "Business process category must be supported.", {
      ...sourceContext({ path: "category", processId }),
    });
  }

  if (model.schemaVersion !== SCHEMA_VERSION) {
    addFinding(errors, "fail", "INVALID_SCHEMA_VERSION", "Business process schema version is unsupported.", {
      ...sourceContext({ path: "schemaVersion", processId, category }),
    });
  }

  if (model.advisoryOnly !== true) {
    addFinding(errors, "fail", "ADVISORY_BOUNDARY_MISSING", "Business process model must remain advisory only.", {
      ...sourceContext({ path: "advisoryOnly", processId, category }),
    });
  }

  if (!hasAllBoundaries(model.boundaries)) {
    addFinding(errors, "fail", "BOUNDARY_MISSING", "All business process safety boundaries must be true.", {
      ...sourceContext({ path: "boundaries", processId, category }),
    });
  }

  [
    "roles",
    "actors",
    "states",
    "transitions",
    "rules",
    "slaAssumptions",
    "exceptions",
    "events",
    "handoffs",
    "checkpoints",
    "metrics",
    "risks",
    "moduleAlignment",
    "planningAlignment",
    "automationAlignment",
    "assumptions",
    "exclusions",
  ].forEach((field) => {
    const value = model[field];
    if (!Array.isArray(value) || value.length === 0) {
      addFinding(errors, "fail", "EMPTY_REQUIRED_ARRAY", "Business process array field must be non-empty.", {
        ...sourceContext({ path: field, processId, category }),
      });
    }
  });

  if (!isRecord(model.maturityNotes)) {
    addFinding(errors, "fail", "MISSING_MATURITY_NOTES", "Business process maturity notes are required.", {
      ...sourceContext({ path: "maturityNotes", processId, category }),
    });
  }

  if (!["low", "medium", "high"].includes(String(model.confidence))) {
    addFinding(errors, "fail", "INVALID_CONFIDENCE", "Business process model must include valid confidence.", {
      ...sourceContext({ path: "confidence", processId, category }),
    });
  }

  if (Array.isArray(model.slaAssumptions)) {
    model.slaAssumptions.forEach((item, index) => {
      if (!isRecord(item) || item.assumptionBased !== true || !Array.isArray(item.escalationNotes) || item.escalationNotes.length === 0) {
        addFinding(errors, "fail", "INVALID_SLA_ASSUMPTION", "SLA entries must be assumption-based and include escalation notes.", {
          ...sourceContext({ path: `slaAssumptions.${index}`, processId, category }),
        });
      }
    });
  }

  if (Array.isArray(model.exceptions)) {
    model.exceptions.forEach((item, index) => {
      if (!isRecord(item) || !Array.isArray(item.handlingNotes) || item.handlingNotes.length === 0) {
        addFinding(errors, "fail", "INVALID_EXCEPTION_HANDLING", "Process exceptions must include safe handling notes.", {
          ...sourceContext({ path: `exceptions.${index}`, processId, category }),
        });
      }
    });
  }

  if (Array.isArray(model.metrics)) {
    model.metrics.forEach((item, index) => {
      if (!isRecord(item) || item.advisoryOnly !== true) {
        addFinding(errors, "fail", "INVALID_METRIC", "Process metrics must remain advisory.", {
          ...sourceContext({ path: `metrics.${index}`, processId, category }),
        });
      }
    });
  }

  ["moduleAlignment", "planningAlignment", "automationAlignment"].forEach((field) => {
    const value = model[field];
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (!isRecord(item) || item.advisoryOnly !== true) {
          addFinding(errors, "fail", "INVALID_ALIGNMENT", "Process alignment entries must remain advisory metadata.", {
            ...sourceContext({ path: `${field}.${index}`, processId, category }),
          });
        }
      });
    }
  });

  validateReferences(model, errors, processId, category);
  validateTextSafety(model, errors, warnings, "model", processId, category);
};

export const validateBusinessProcessInput = (
  input: unknown,
): BusinessProcessValidationResult => {
  const warnings: BusinessProcessValidationFinding[] = [];
  const errors: BusinessProcessValidationFinding[] = [];

  if (!isRecord(input)) {
    addFinding(errors, "fail", "INVALID_INPUT", "Business process input must be an object.");
    return validationResult([input], warnings, errors);
  }

  if (!isKnownCategory(input.category)) {
    addFinding(errors, "fail", "UNKNOWN_CATEGORY", "Business process input category must be supported.", {
      path: "category",
    });
  }

  if (input.moduleIds !== undefined && !Array.isArray(input.moduleIds)) {
    addFinding(errors, "fail", "INVALID_MODULE_IDS", "Business process input moduleIds must be an array when provided.", {
      path: "moduleIds",
    });
  }

  validateTextSafety(input, errors, warnings, "input", undefined, isKnownCategory(input.category) ? input.category : undefined);
  return validationResult([input], warnings, errors);
};

export const validateBusinessProcessModel = (
  model: BusinessProcessModel,
): BusinessProcessValidationResult => {
  const warnings: BusinessProcessValidationFinding[] = [];
  const errors: BusinessProcessValidationFinding[] = [];
  validateModelShape(model, errors, warnings);
  return validationResult([model], warnings, errors);
};

export const validateBusinessProcessModels = (
  models: readonly BusinessProcessModel[] = businessProcessTemplates,
): BusinessProcessValidationResult => {
  const warnings: BusinessProcessValidationFinding[] = [];
  const errors: BusinessProcessValidationFinding[] = [];
  const processIds = new Set<string>();

  models.forEach((model) => {
    validateModelShape(model, errors, warnings);
    if (processIds.has(model.processId)) {
      addFinding(errors, "fail", "DUPLICATE_PROCESS_ID", "Business process ids must be unique.", {
        processId: model.processId,
        category: model.category,
      });
    }
    processIds.add(model.processId);
  });

  return validationResult(models, warnings, errors);
};
