import { supportedLanguageIds } from "../languages/languageProfiles.js";
import {
  frameworkProfileBoundaries,
  frameworkProfiles,
  supportedFrameworkIds,
} from "./frameworkProfiles.js";
import type {
  FrameworkCategory,
  FrameworkProfile,
  FrameworkProfileBoundarySet,
  FrameworkProfileValidationFinding,
  FrameworkProfileValidationResult,
  FrameworkProfileValidationStatus,
} from "./types.js";

const SCHEMA_VERSION = "1.0" as const;
const MAX_TEXT_LENGTH = 1_200;
const MAX_ARRAY_LENGTH = 100;

const frameworkCategories = [
  "web_backend",
  "desktop_ui",
  "mobile_cross_platform",
  "frontend_ui",
  "desktop_shell",
  "native_ui",
  "api_architecture",
  "architecture",
] as const satisfies readonly FrameworkCategory[];

const boundaryKeys = [
  "advisoryOnly",
  "sourceOnly",
  "noProviderCalls",
  "noNetwork",
  "noFilesystemReads",
  "noFilesystemWrites",
  "noFilesystemScanning",
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
  "noDeploymentGuarantees",
  "noFrameworkDetectionOverclaims",
] as const satisfies readonly (keyof FrameworkProfileBoundarySet)[];

const forbiddenContentPatterns = [
  "provider output",
  "network call",
  "filesystem read",
  "filesystem write",
  "filesystem scan",
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
  "deployment guaranteed",
  "framework guaranteed",
  "drop table",
  "rm -rf",
  "invoke-expression",
];

const makeValidationId = (): string =>
  `framework_profile_validation_${Date.now().toString(36)}`;

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
  findings: FrameworkProfileValidationFinding[],
  severity: "warn" | "fail",
  reasonCode: string,
  safeMessage: string,
  source?: {
    path?: string;
    frameworkId?: string;
    metadata?: Record<string, string | number | boolean>;
  },
): void => {
  findings.push({
    id: `finding_${findings.length + 1}`,
    severity,
    reasonCode,
    safeMessage,
    ...(source?.path ? { path: source.path } : {}),
    ...(source?.frameworkId ? { frameworkId: source.frameworkId } : {}),
    ...(source?.metadata ? { metadata: source.metadata } : {}),
  });
};

const sourceContext = (input: {
  path?: string | undefined;
  frameworkId?: string | undefined;
  metadata?: Record<string, string | number | boolean> | undefined;
}): Parameters<typeof addFinding>[4] => ({
  ...(input.path ? { path: input.path } : {}),
  ...(input.frameworkId ? { frameworkId: input.frameworkId } : {}),
  ...(input.metadata ? { metadata: input.metadata } : {}),
});

const hasAllBoundaries = (value: unknown): value is FrameworkProfileBoundarySet =>
  isRecord(value) && boundaryKeys.every((key) => value[key] === true);

const hasAdvisoryCommand = (value: unknown): boolean =>
  isRecord(value) &&
  isNonEmptyString(value.command) &&
  value.advisoryOnly === true &&
  value.notExecuted === true &&
  isNonEmptyString(value.assumption);

const validateTextSafety = (
  value: unknown,
  errors: FrameworkProfileValidationFinding[],
  warnings: FrameworkProfileValidationFinding[],
  path: string,
  frameworkId?: string,
): void => {
  safeStringValues(value).forEach((text, valueIndex) => {
    if (text.length > MAX_TEXT_LENGTH) {
      addFinding(errors, "fail", "TEXT_TOO_LONG", "Framework profile text exceeds the bounded description limit.", {
        ...sourceContext({ path, frameworkId }),
        metadata: { valueIndex, maxLength: MAX_TEXT_LENGTH },
      });
    }

    forbiddenContentPatterns.forEach((pattern) => {
      if (text.toLowerCase().includes(pattern)) {
        addFinding(
          errors,
          "fail",
          "FORBIDDEN_CONTENT",
          "Framework profile text contains content outside advisory source-only scope.",
          sourceContext({ path, frameworkId }),
        );
      }
    });
  });

  if (Array.isArray(value) && value.length > MAX_ARRAY_LENGTH) {
    addFinding(warnings, "warn", "ARRAY_FIELD_LARGE", "Framework profile array is larger than the recommended bound.", {
      ...sourceContext({ path, frameworkId }),
      metadata: { maxItems: MAX_ARRAY_LENGTH },
    });
  }
};

const validationResult = (
  profiles: readonly unknown[],
  warnings: FrameworkProfileValidationFinding[],
  errors: FrameworkProfileValidationFinding[],
): FrameworkProfileValidationResult => {
  const frameworkIds = profiles
    .filter(isRecord)
    .map((profile) => profile.id)
    .filter((id): id is string => typeof id === "string");
  const status: FrameworkProfileValidationStatus =
    errors.length > 0 ? "fail" : warnings.length > 0 ? "warn" : "pass";

  return {
    validationId: makeValidationId(),
    createdAt: new Date().toISOString(),
    schemaVersion: SCHEMA_VERSION,
    valid: errors.length === 0,
    status,
    profileCount: profiles.length,
    frameworkIds,
    warnings,
    errors,
    advisoryOnly: true,
    boundaries: frameworkProfileBoundaries,
  };
};

const validateProfileShape = (
  profile: unknown,
  errors: FrameworkProfileValidationFinding[],
  warnings: FrameworkProfileValidationFinding[],
): void => {
  if (!isRecord(profile)) {
    addFinding(errors, "fail", "INVALID_PROFILE", "Framework profile must be an object.");
    return;
  }

  const frameworkId = isNonEmptyString(profile.id) ? profile.id : undefined;
  const source = sourceContext({ frameworkId });

  if (!frameworkId || !supportedFrameworkIds.includes(frameworkId as never)) {
    addFinding(errors, "fail", "UNKNOWN_FRAMEWORK_ID", "Framework profile id must be supported.", source);
  }

  if (!isNonEmptyString(profile.displayName)) {
    addFinding(errors, "fail", "MISSING_REQUIRED_FIELD", "Framework profile display name is missing.", {
      ...sourceContext({ path: "displayName", frameworkId }),
    });
  }

  if (!isNonEmptyString(profile.category) || !frameworkCategories.includes(profile.category as never)) {
    addFinding(errors, "fail", "INVALID_CATEGORY", "Framework profile category must be supported.", {
      ...sourceContext({ path: "category", frameworkId }),
    });
  }

  if (profile.schemaVersion !== SCHEMA_VERSION) {
    addFinding(errors, "fail", "INVALID_SCHEMA_VERSION", "Framework profile schema version is unsupported.", source);
  }

  if (profile.advisoryOnly !== true) {
    addFinding(errors, "fail", "ADVISORY_BOUNDARY_MISSING", "Framework profile must remain advisory only.", source);
  }

  if (!hasAllBoundaries(profile.boundaries)) {
    addFinding(errors, "fail", "BOUNDARY_MISSING", "All framework profile safety boundaries must be true.", source);
  }

  [
    "compatibleLanguageIds",
    "ecosystemNotes",
    "detectionSignals",
    "commandRecommendations",
    "configNotes",
    "architecturePatterns",
    "securityNotes",
    "testingNotes",
    "packagingNotes",
    "reviewHeuristics",
    "risks",
    "assumptions",
  ].forEach((field) => {
    const value = profile[field];
    if (!Array.isArray(value) || value.length === 0) {
      addFinding(errors, "fail", "EMPTY_REQUIRED_ARRAY", "Framework profile array field must be non-empty.", {
        ...sourceContext({ path: field, frameworkId }),
      });
    }
  });

  if (!isRecord(profile.projectStructure)) {
    addFinding(errors, "fail", "MISSING_PROJECT_STRUCTURE", "Framework profile project structure is required.", source);
  }

  if (!isRecord(profile.dependencyStrategy)) {
    addFinding(errors, "fail", "MISSING_DEPENDENCY_STRATEGY", "Framework profile dependency strategy is required.", source);
  }

  if (Array.isArray(profile.compatibleLanguageIds)) {
    profile.compatibleLanguageIds.forEach((languageId, index) => {
      if (typeof languageId !== "string" || !supportedLanguageIds.includes(languageId as never)) {
        addFinding(
          errors,
          "fail",
          "UNKNOWN_COMPATIBLE_LANGUAGE",
          "Framework profile compatible language id must reference a supported language profile.",
          sourceContext({
            path: `compatibleLanguageIds.${index}`,
            frameworkId,
            metadata: { languageId: typeof languageId === "string" ? languageId : "non_string" },
          }),
        );
      }
    });
  }

  if (Array.isArray(profile.commandRecommendations)) {
    profile.commandRecommendations.forEach((recommendation, index) => {
      if (!hasAdvisoryCommand(recommendation)) {
        addFinding(
          errors,
          "fail",
          "INVALID_COMMAND_RECOMMENDATION",
          "Command recommendations must be advisory strings with notExecuted true and assumptions.",
          sourceContext({ path: `commandRecommendations.${index}`, frameworkId }),
        );
      }
    });
  }

  validateTextSafety(profile, errors, warnings, "profile", frameworkId);
};

export const validateFrameworkProfile = (
  profile: FrameworkProfile,
): FrameworkProfileValidationResult => {
  const warnings: FrameworkProfileValidationFinding[] = [];
  const errors: FrameworkProfileValidationFinding[] = [];
  validateProfileShape(profile, errors, warnings);
  return validationResult([profile], warnings, errors);
};

export const validateFrameworkProfiles = (
  profiles: readonly FrameworkProfile[] = frameworkProfiles,
): FrameworkProfileValidationResult => {
  const warnings: FrameworkProfileValidationFinding[] = [];
  const errors: FrameworkProfileValidationFinding[] = [];
  const profileIds = new Set<string>();

  profiles.forEach((profile) => {
    validateProfileShape(profile, errors, warnings);
    if (profileIds.has(profile.id)) {
      addFinding(errors, "fail", "DUPLICATE_FRAMEWORK_ID", "Framework profile ids must be unique.", {
        frameworkId: profile.id,
      });
    }
    profileIds.add(profile.id);
  });

  supportedFrameworkIds.forEach((frameworkId) => {
    if (!profileIds.has(frameworkId)) {
      addFinding(errors, "fail", "MISSING_REQUIRED_FRAMEWORK", "Supported framework profile is missing.", {
        frameworkId,
      });
    }
  });

  return validationResult(profiles, warnings, errors);
};
