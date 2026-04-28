import {
  languageProfileBoundaries,
  languageProfiles,
  supportedLanguageIds,
} from "./languageProfiles.js";
import type {
  LanguageProfile,
  LanguageProfileBoundarySet,
  LanguageProfileValidationFinding,
  LanguageProfileValidationResult,
  LanguageProfileValidationStatus,
} from "./types.js";

const SCHEMA_VERSION = "1.0" as const;
const MAX_TEXT_LENGTH = 1_200;
const MAX_ARRAY_LENGTH = 80;

const boundaryKeys = [
  "advisoryOnly",
  "sourceOnly",
  "noProviderCalls",
  "noNetwork",
  "noFilesystemReads",
  "noFilesystemWrites",
  "noCommandExecution",
  "noDependencyInstallation",
  "noPackageChanges",
  "noWorkflowChanges",
  "noRuntimeChanges",
  "noStoreMutation",
  "noActionDispatch",
  "noProposalCreation",
  "noScaffolding",
  "noGeneratedSystems",
  "noAutomaticCodeModification",
  "noProductionReadinessClaims",
] as const satisfies readonly (keyof LanguageProfileBoundarySet)[];

const forbiddenContentPatterns = [
  "provider output",
  "network call",
  "filesystem read",
  "filesystem write",
  "command execution",
  "dependency installation",
  "package change",
  "workflow change",
  "store mutation",
  "action dispatch",
  "proposal creation",
  "scaffold output",
  "generated project",
  "production-ready",
  "guarantees deployment",
  "framework guaranteed",
  "drop table",
  "rm -rf",
  "invoke-expression",
];

const makeValidationId = (): string =>
  `language_profile_validation_${Date.now().toString(36)}`;

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
  findings: LanguageProfileValidationFinding[],
  severity: "warn" | "fail",
  reasonCode: string,
  safeMessage: string,
  source?: {
    path?: string;
    languageId?: string;
    metadata?: Record<string, string | number | boolean>;
  },
): void => {
  findings.push({
    id: `finding_${findings.length + 1}`,
    severity,
    reasonCode,
    safeMessage,
    ...(source?.path ? { path: source.path } : {}),
    ...(source?.languageId ? { languageId: source.languageId } : {}),
    ...(source?.metadata ? { metadata: source.metadata } : {}),
  });
};

const sourceContext = (input: {
  path?: string | undefined;
  languageId?: string | undefined;
  metadata?: Record<string, string | number | boolean> | undefined;
}): Parameters<typeof addFinding>[4] => ({
  ...(input.path ? { path: input.path } : {}),
  ...(input.languageId ? { languageId: input.languageId } : {}),
  ...(input.metadata ? { metadata: input.metadata } : {}),
});

const hasAllBoundaries = (value: unknown): value is LanguageProfileBoundarySet =>
  isRecord(value) && boundaryKeys.every((key) => value[key] === true);

const hasAdvisoryCommand = (value: unknown): boolean =>
  isRecord(value) &&
  isNonEmptyString(value.command) &&
  value.advisoryOnly === true &&
  value.notExecuted === true &&
  isNonEmptyString(value.assumption);

const validateTextSafety = (
  value: unknown,
  errors: LanguageProfileValidationFinding[],
  warnings: LanguageProfileValidationFinding[],
  path: string,
  languageId?: string,
): void => {
  safeStringValues(value).forEach((text, valueIndex) => {
    if (text.length > MAX_TEXT_LENGTH) {
      addFinding(errors, "fail", "TEXT_TOO_LONG", "Language profile text exceeds the bounded description limit.", {
        ...sourceContext({ path, languageId }),
        metadata: { valueIndex, maxLength: MAX_TEXT_LENGTH },
      });
    }

    forbiddenContentPatterns.forEach((pattern) => {
      if (text.toLowerCase().includes(pattern)) {
        addFinding(
          errors,
          "fail",
          "FORBIDDEN_CONTENT",
          "Language profile text contains content outside advisory source-only scope.",
          sourceContext({ path, languageId }),
        );
      }
    });
  });

  if (Array.isArray(value) && value.length > MAX_ARRAY_LENGTH) {
    addFinding(warnings, "warn", "ARRAY_FIELD_LARGE", "Language profile array is larger than the recommended bound.", {
      ...sourceContext({ path, languageId }),
      metadata: { maxItems: MAX_ARRAY_LENGTH },
    });
  }
};

const validationResult = (
  profiles: readonly unknown[],
  warnings: LanguageProfileValidationFinding[],
  errors: LanguageProfileValidationFinding[],
): LanguageProfileValidationResult => {
  const languageIds = profiles
    .filter(isRecord)
    .map((profile) => profile.id)
    .filter((id): id is string => typeof id === "string");
  const status: LanguageProfileValidationStatus =
    errors.length > 0 ? "fail" : warnings.length > 0 ? "warn" : "pass";

  return {
    validationId: makeValidationId(),
    createdAt: new Date().toISOString(),
    schemaVersion: SCHEMA_VERSION,
    valid: errors.length === 0,
    status,
    profileCount: profiles.length,
    languageIds,
    warnings,
    errors,
    advisoryOnly: true,
    boundaries: languageProfileBoundaries,
  };
};

const validateProfileShape = (
  profile: unknown,
  errors: LanguageProfileValidationFinding[],
  warnings: LanguageProfileValidationFinding[],
): void => {
  if (!isRecord(profile)) {
    addFinding(errors, "fail", "INVALID_PROFILE", "Language profile must be an object.");
    return;
  }

  const languageId = isNonEmptyString(profile.id) ? profile.id : undefined;
  const source = sourceContext({ languageId });

  if (!languageId || !supportedLanguageIds.includes(languageId as never)) {
    addFinding(errors, "fail", "UNKNOWN_LANGUAGE_ID", "Language profile id must be supported.", source);
  }

  ["displayName"].forEach((field) => {
    if (!isNonEmptyString(profile[field])) {
      addFinding(errors, "fail", "MISSING_REQUIRED_FIELD", "Language profile required field is missing.", {
        ...sourceContext({ path: field, languageId }),
      });
    }
  });

  if (profile.schemaVersion !== SCHEMA_VERSION) {
    addFinding(errors, "fail", "INVALID_SCHEMA_VERSION", "Language profile schema version is unsupported.", source);
  }

  if (profile.advisoryOnly !== true) {
    addFinding(errors, "fail", "ADVISORY_BOUNDARY_MISSING", "Language profile must remain advisory only.", source);
  }

  if (!hasAllBoundaries(profile.boundaries)) {
    addFinding(errors, "fail", "BOUNDARY_MISSING", "All language profile safety boundaries must be true.", source);
  }

  [
    "ecosystemNotes",
    "detectionSignals",
    "commandRecommendations",
    "staticChecks",
    "safeExecutionNotes",
    "packagingNotes",
    "reviewHeuristics",
    "risks",
    "assumptions",
  ].forEach((field) => {
    const value = profile[field];
    if (!Array.isArray(value) || value.length === 0) {
      addFinding(errors, "fail", "EMPTY_REQUIRED_ARRAY", "Language profile array field must be non-empty.", {
        ...sourceContext({ path: field, languageId }),
      });
    }
  });

  if (!isRecord(profile.projectStructure)) {
    addFinding(errors, "fail", "MISSING_PROJECT_STRUCTURE", "Language profile project structure is required.", source);
  }

  if (!isRecord(profile.dependencyStrategy)) {
    addFinding(errors, "fail", "MISSING_DEPENDENCY_STRATEGY", "Language profile dependency strategy is required.", source);
  }

  if (Array.isArray(profile.commandRecommendations)) {
    profile.commandRecommendations.forEach((recommendation, index) => {
      if (!hasAdvisoryCommand(recommendation)) {
        addFinding(
          errors,
          "fail",
          "INVALID_COMMAND_RECOMMENDATION",
          "Command recommendations must be advisory strings with notExecuted true and assumptions.",
          sourceContext({ path: `commandRecommendations.${index}`, languageId }),
        );
      }
    });
  }

  if (Array.isArray(profile.staticChecks)) {
    profile.staticChecks.forEach((check, index) => {
      if (
        !isRecord(check) ||
        check.advisoryOnly !== true ||
        check.notExecuted !== true ||
        !isNonEmptyString(check.assumption)
      ) {
        addFinding(
          errors,
          "fail",
          "INVALID_STATIC_CHECK",
          "Static checks must be advisory and not executed.",
          sourceContext({ path: `staticChecks.${index}`, languageId }),
        );
      }
    });
  }

  validateTextSafety(profile, errors, warnings, "profile", languageId);
};

export const validateLanguageProfile = (
  profile: LanguageProfile,
): LanguageProfileValidationResult => {
  const warnings: LanguageProfileValidationFinding[] = [];
  const errors: LanguageProfileValidationFinding[] = [];
  validateProfileShape(profile, errors, warnings);
  return validationResult([profile], warnings, errors);
};

export const validateLanguageProfiles = (
  profiles: readonly LanguageProfile[] = languageProfiles,
): LanguageProfileValidationResult => {
  const warnings: LanguageProfileValidationFinding[] = [];
  const errors: LanguageProfileValidationFinding[] = [];
  const profileIds = new Set<string>();

  profiles.forEach((profile) => {
    validateProfileShape(profile, errors, warnings);
    if (profileIds.has(profile.id)) {
      addFinding(errors, "fail", "DUPLICATE_LANGUAGE_ID", "Language profile ids must be unique.", {
        languageId: profile.id,
      });
    }
    profileIds.add(profile.id);
  });

  supportedLanguageIds.forEach((languageId) => {
    if (!profileIds.has(languageId)) {
      addFinding(errors, "fail", "MISSING_REQUIRED_LANGUAGE", "Supported language profile is missing.", {
        languageId,
      });
    }
  });

  return validationResult(profiles, warnings, errors);
};
