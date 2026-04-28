export type BusinessSystemFamilyId = string;

export type CatalogValidationStatus = "pass" | "warn" | "fail";

export type CatalogValidationBoundarySet = {
  dataOnly: true;
  noGeneration: true;
  noScaffolding: true;
  noDbSchemas: true;
  noRuntimeExecution: true;
  noProviderCalls: true;
  noNetwork: true;
  noActionDispatch: true;
  noProposalCreation: true;
  noStoreMutation: true;
};

export type BusinessSystemMetadataItem = {
  id: string;
  name: string;
  description: string;
  tags?: string[];
};

export type BusinessSystemWorkflow = {
  workflowId: string;
  name: string;
  description: string;
  actors: string[];
  steps: string[];
  riskNotes?: string[];
};

export type BusinessSystemIntegration = {
  integrationId: string;
  name: string;
  type: string;
  description: string;
  riskNotes?: string[];
};

export type BusinessSystemFamily = {
  familyId: BusinessSystemFamilyId;
  name: string;
  aliases: string[];
  purpose: string;
  typicalActors: string[];
  coreModules: BusinessSystemMetadataItem[];
  commonEntities: BusinessSystemMetadataItem[];
  workflows: BusinessSystemWorkflow[];
  permissions: BusinessSystemMetadataItem[];
  reports: BusinessSystemMetadataItem[];
  integrations: BusinessSystemIntegration[];
  complianceAndAuditConcerns: string[];
  dataModelPatterns: string[];
  uiPatterns: string[];
  deploymentNotes: string[];
  riskNotes: string[];
  assumptions: string[];
  tags: string[];
};

export type CatalogValidationFinding = {
  id: string;
  severity: "warn" | "fail";
  reasonCode: string;
  safeMessage: string;
  familyId?: BusinessSystemFamilyId;
  metadata?: Record<string, string | number | boolean>;
};

export type CatalogValidationResult = {
  validationId: string;
  createdAt: string;
  schemaVersion: "1.0";
  valid: boolean;
  status: CatalogValidationStatus;
  familyCount: number;
  familyIds: BusinessSystemFamilyId[];
  requiredFamilyIdsPresent: boolean;
  warnings: CatalogValidationFinding[];
  errors: CatalogValidationFinding[];
  advisoryOnly: true;
  boundaries: CatalogValidationBoundarySet;
};
