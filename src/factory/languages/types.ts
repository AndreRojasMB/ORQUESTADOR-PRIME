export type LanguageProfileSchemaVersion = "1.0";

export type LanguageId =
  | "python"
  | "csharp"
  | "java"
  | "kotlin"
  | "javascript"
  | "typescript"
  | "cpp"
  | "sql"
  | "bash"
  | "powershell"
  | "go";

export type LanguageProfileConfidence = "low" | "medium" | "high";

export type LanguageProfileValidationStatus = "pass" | "warn" | "fail";

export type LanguageProfileBoundarySet = {
  advisoryOnly: true;
  sourceOnly: true;
  noProviderCalls: true;
  noNetwork: true;
  noFilesystemReads: true;
  noFilesystemWrites: true;
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
};

export type LanguageDetectionSignal = {
  signalId: string;
  kind: "file" | "folder" | "extension" | "content_hint";
  value: string;
  description: string;
  confidence: LanguageProfileConfidence;
};

export type LanguageProjectStructure = {
  commonRoots: string[];
  sourceFolders: string[];
  testFolders: string[];
  configFiles: string[];
  buildFiles: string[];
  notes: string[];
};

export type LanguageCommandRecommendation = {
  commandId: string;
  command: string;
  purpose: string;
  category: "build" | "test" | "lint" | "format" | "typecheck" | "security" | "inspect";
  assumption: string;
  advisoryOnly: true;
  notExecuted: true;
};

export type LanguageDependencyStrategy = {
  strategyId: string;
  packageManagers: string[];
  manifestFiles: string[];
  lockFiles: string[];
  dependencyNotes: string[];
  updateNotes: string[];
  assumptions: string[];
};

export type LanguageStaticCheck = {
  checkId: string;
  name: string;
  command?: string;
  purpose: string;
  assumption: string;
  advisoryOnly: true;
  notExecuted: true;
};

export type LanguageSafeExecutionNote = {
  noteId: string;
  severity: "info" | "warn" | "high";
  safeMessage: string;
};

export type LanguagePackagingNote = {
  noteId: string;
  safeMessage: string;
  assumption: string;
};

export type LanguageReviewHeuristic = {
  heuristicId: string;
  title: string;
  safeMessage: string;
  tags: string[];
};

export type LanguageRisk = {
  riskId: string;
  title: string;
  safeMessage: string;
  severity: "low" | "medium" | "high";
  mitigation: string;
};

export type LanguageProfile = {
  id: LanguageId;
  displayName: string;
  schemaVersion: LanguageProfileSchemaVersion;
  ecosystemNotes: string[];
  detectionSignals: LanguageDetectionSignal[];
  projectStructure: LanguageProjectStructure;
  commandRecommendations: LanguageCommandRecommendation[];
  dependencyStrategy: LanguageDependencyStrategy;
  staticChecks: LanguageStaticCheck[];
  safeExecutionNotes: LanguageSafeExecutionNote[];
  packagingNotes: LanguagePackagingNote[];
  reviewHeuristics: LanguageReviewHeuristic[];
  risks: LanguageRisk[];
  assumptions: string[];
  confidence: LanguageProfileConfidence;
  advisoryOnly: true;
  boundaries: LanguageProfileBoundarySet;
};

export type LanguageProfileResultStatus =
  | "profile_found"
  | "language_not_found"
  | "scored";

export type LanguageProfileValidationFinding = {
  id: string;
  severity: "warn" | "fail";
  reasonCode: string;
  safeMessage: string;
  path?: string;
  languageId?: string;
  metadata?: Record<string, string | number | boolean>;
};

export type LanguageProfileResult = {
  ok: boolean;
  status: LanguageProfileResultStatus;
  profile?: LanguageProfile;
  score?: number;
  matchedSignals?: string[];
  warnings: LanguageProfileValidationFinding[];
  errors: LanguageProfileValidationFinding[];
  advisoryOnly: true;
  boundaries: LanguageProfileBoundarySet;
};

export type LanguageProfileValidationResult = {
  validationId: string;
  createdAt: string;
  schemaVersion: LanguageProfileSchemaVersion;
  valid: boolean;
  status: LanguageProfileValidationStatus;
  profileCount: number;
  languageIds: string[];
  warnings: LanguageProfileValidationFinding[];
  errors: LanguageProfileValidationFinding[];
  advisoryOnly: true;
  boundaries: LanguageProfileBoundarySet;
};
