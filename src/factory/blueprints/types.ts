import type {
  BusinessSystemFamilyId,
  BusinessSystemIntegration,
  BusinessSystemMetadataItem,
  BusinessSystemWorkflow,
} from "../catalog/types.js";

export type ModuleBlueprintSchemaVersion = "1.0";

export type ModuleBlueprintBoundary = {
  advisoryOnly: true;
  noCodeGeneration: true;
  noScaffolding: true;
  noDbSchemas: true;
  noFileWrites: true;
  noRuntimeExecution: true;
  noProviderCalls: true;
  noNetwork: true;
  noActionDispatch: true;
  noProposalCreation: true;
  noStoreMutation: true;
};

export type ModuleBlueprint = {
  blueprintId: string;
  createdAt: string;
  schemaVersion: ModuleBlueprintSchemaVersion;
  familyId: BusinessSystemFamilyId;
  moduleId: string;
  name: string;
  purpose: string;
  actors: string[];
  responsibilities: string[];
  entities: BusinessSystemMetadataItem[];
  workflows: BusinessSystemWorkflow[];
  permissions: BusinessSystemMetadataItem[];
  reports: BusinessSystemMetadataItem[];
  integrations: BusinessSystemIntegration[];
  businessRules: string[];
  auditConcerns: string[];
  risks: string[];
  assumptions: string[];
  uiPatterns: string[];
  dataConsiderations: string[];
  testConsiderations: string[];
  implementationNotes: string[];
  advisoryOnly: true;
  boundaries: ModuleBlueprintBoundary;
};

export type ModuleBlueprintGenerationOptions = {
  familyId: BusinessSystemFamilyId;
  moduleId?: string;
  includeAssumptions?: boolean;
};

export type ModuleBlueprintGenerationStatus =
  | "generated"
  | "family_not_found"
  | "module_not_found"
  | "invalid";

export type ModuleBlueprintValidationStatus = "pass" | "warn" | "fail";

export type ModuleBlueprintValidationFinding = {
  id: string;
  severity: "warn" | "fail";
  reasonCode: string;
  safeMessage: string;
  familyId?: BusinessSystemFamilyId;
  moduleId?: string;
  metadata?: Record<string, string | number | boolean>;
};

export type ModuleBlueprintGenerationResult = {
  ok: boolean;
  status: ModuleBlueprintGenerationStatus;
  blueprint?: ModuleBlueprint;
  blueprints?: ModuleBlueprint[];
  errors: ModuleBlueprintValidationFinding[];
  warnings: ModuleBlueprintValidationFinding[];
  advisoryOnly: true;
  boundaries: ModuleBlueprintBoundary;
};

export type ModuleBlueprintValidationResult = {
  validationId: string;
  createdAt: string;
  schemaVersion: ModuleBlueprintSchemaVersion;
  valid: boolean;
  status: ModuleBlueprintValidationStatus;
  blueprintCount: number;
  warnings: ModuleBlueprintValidationFinding[];
  errors: ModuleBlueprintValidationFinding[];
  advisoryOnly: true;
  boundaries: ModuleBlueprintBoundary;
};
