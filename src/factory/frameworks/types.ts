import type { LanguageId } from "../languages/types.js";

export type FrameworkProfileSchemaVersion = "1.0";

export type FrameworkId =
  | "aspnet-core"
  | "wpf-mvvm"
  | "winui"
  | "maui"
  | "spring-boot"
  | "fastapi"
  | "django"
  | "react"
  | "nextjs"
  | "electron"
  | "tauri"
  | "qt-cpp"
  | "rest-api"
  | "graphql"
  | "microservices"
  | "modular-monolith";

export type FrameworkCategory =
  | "web_backend"
  | "desktop_ui"
  | "mobile_cross_platform"
  | "frontend_ui"
  | "desktop_shell"
  | "native_ui"
  | "api_architecture"
  | "architecture";

export type FrameworkProfileConfidence = "low" | "medium" | "high";

export type FrameworkProfileValidationStatus = "pass" | "warn" | "fail";

export type FrameworkProfileBoundarySet = {
  advisoryOnly: true;
  sourceOnly: true;
  noProviderCalls: true;
  noNetwork: true;
  noFilesystemReads: true;
  noFilesystemWrites: true;
  noFilesystemScanning: true;
  noCommandExecution: true;
  noDependencyInstallation: true;
  noPackageChanges: true;
  noWorkflowChanges: true;
  noRuntimeChanges: true;
  noStoreMutation: true;
  noActionDispatch: true;
  noProposalCreation: true;
  noScaffolding: true;
  noGeneratedSystems: true;
  noAutomaticCodeModification: true;
  noProductionReadinessClaims: true;
  noDeploymentGuarantees: true;
  noFrameworkDetectionOverclaims: true;
};

export type FrameworkDetectionSignal = {
  signalId: string;
  kind: "file" | "folder" | "extension" | "package" | "content_hint";
  value: string;
  description: string;
  confidence: FrameworkProfileConfidence;
};

export type FrameworkProjectStructure = {
  commonRoots: string[];
  sourceFolders: string[];
  testFolders: string[];
  configFiles: string[];
  buildFiles: string[];
  routingOrUiSignals: string[];
  notes: string[];
};

export type FrameworkCommandRecommendation = {
  commandId: string;
  command: string;
  purpose: string;
  category: "build" | "test" | "lint" | "format" | "typecheck" | "inspect";
  assumption: string;
  advisoryOnly: true;
  notExecuted: true;
};

export type FrameworkDependencyStrategy = {
  strategyId: string;
  packageManagers: string[];
  manifestFiles: string[];
  lockFiles: string[];
  dependencyNotes: string[];
  updateNotes: string[];
  assumptions: string[];
};

export type FrameworkConfigNote = {
  noteId: string;
  safeMessage: string;
  assumption: string;
};

export type FrameworkArchitecturePattern = {
  patternId: string;
  name: string;
  safeMessage: string;
  tradeoffs: string[];
};

export type FrameworkSecurityNote = {
  noteId: string;
  severity: "info" | "warn" | "high";
  safeMessage: string;
};

export type FrameworkTestingNote = {
  noteId: string;
  safeMessage: string;
  recommendedChecks: string[];
  assumption: string;
};

export type FrameworkPackagingNote = {
  noteId: string;
  safeMessage: string;
  assumption: string;
};

export type FrameworkReviewHeuristic = {
  heuristicId: string;
  title: string;
  safeMessage: string;
  tags: string[];
};

export type FrameworkRisk = {
  riskId: string;
  title: string;
  safeMessage: string;
  severity: "low" | "medium" | "high";
  mitigation: string;
};

export type FrameworkProfile = {
  id: FrameworkId;
  displayName: string;
  category: FrameworkCategory;
  compatibleLanguageIds: LanguageId[];
  schemaVersion: FrameworkProfileSchemaVersion;
  ecosystemNotes: string[];
  detectionSignals: FrameworkDetectionSignal[];
  projectStructure: FrameworkProjectStructure;
  commandRecommendations: FrameworkCommandRecommendation[];
  dependencyStrategy: FrameworkDependencyStrategy;
  configNotes: FrameworkConfigNote[];
  architecturePatterns: FrameworkArchitecturePattern[];
  securityNotes: FrameworkSecurityNote[];
  testingNotes: FrameworkTestingNote[];
  packagingNotes: FrameworkPackagingNote[];
  reviewHeuristics: FrameworkReviewHeuristic[];
  risks: FrameworkRisk[];
  assumptions: string[];
  confidence: FrameworkProfileConfidence;
  advisoryOnly: true;
  boundaries: FrameworkProfileBoundarySet;
};

export type FrameworkProfileResultStatus =
  | "profile_found"
  | "framework_not_found"
  | "scored";

export type FrameworkProfileValidationFinding = {
  id: string;
  severity: "warn" | "fail";
  reasonCode: string;
  safeMessage: string;
  path?: string;
  frameworkId?: string;
  metadata?: Record<string, string | number | boolean>;
};

export type FrameworkProfileResult = {
  ok: boolean;
  status: FrameworkProfileResultStatus;
  profile?: FrameworkProfile;
  score?: number;
  matchedSignals?: string[];
  warnings: FrameworkProfileValidationFinding[];
  errors: FrameworkProfileValidationFinding[];
  advisoryOnly: true;
  boundaries: FrameworkProfileBoundarySet;
};

export type FrameworkProfileValidationResult = {
  validationId: string;
  createdAt: string;
  schemaVersion: FrameworkProfileSchemaVersion;
  valid: boolean;
  status: FrameworkProfileValidationStatus;
  profileCount: number;
  frameworkIds: string[];
  warnings: FrameworkProfileValidationFinding[];
  errors: FrameworkProfileValidationFinding[];
  advisoryOnly: true;
  boundaries: FrameworkProfileBoundarySet;
};
