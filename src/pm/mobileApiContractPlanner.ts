import type {
  MobileFeatureBlueprint,
  MobileFeatureBlueprintOutput,
} from "./mobileFeatureBlueprintGenerator.js";
import type {
  MobileScreenBlueprint,
  MobileScreenBlueprintOutput,
} from "./mobileScreenBlueprintGenerator.js";
import type { PMEvidenceReference, PMRecommendedNextStep, PMRiskTier, ProjectPhaseRef } from "./types.js";

export type MobileApiCategory =
  | "auth"
  | "user_profile"
  | "content_list"
  | "content_detail"
  | "create_update"
  | "delete_archive"
  | "search_filter"
  | "messaging"
  | "marketplace"
  | "gamification_progress"
  | "offline_sync"
  | "monetization"
  | "safety_report"
  | "notifications"
  | "analytics_reporting"
  | "admin_management"
  | "ai_assistant"
  | "unknown";

export type MobileApiOperationType =
  | "read"
  | "list"
  | "create"
  | "update"
  | "delete"
  | "search"
  | "submit"
  | "sync"
  | "unknown";

export type MobileApiContractConfidence = "high" | "medium" | "low" | "blocked_by_unknowns";

export type MobileApiContractNextArtifact =
  | "mobile_design_system_blueprint_plan"
  | "api_contract_followup_needed"
  | "human_review"
  | "blocked_by_unknowns";

export type MobileApiArtifactTarget =
  | "mobile_app_factory_strategy"
  | "mobile_requirements_interview"
  | "mobile_feature_blueprint_generator"
  | "mobile_screen_blueprint_generator"
  | "mobile_navigation_flow_model"
  | "mobile_state_management_strategy"
  | "offline_cache_sync_strategy"
  | "mobile_security_baseline"
  | "mobile_performance_checklist"
  | "mobile_testing_strategy"
  | "mobile_release_eas_strategy"
  | "pm_report"
  | "task_graph"
  | "dod_criteria"
  | "risk_blocker_model"
  | "autopilot_handoff_context";

export interface MobileApiContractSafetyBoundaries {
  sourceOnly: true;
  advisoryOnly: true;
  metadataOnly: true;
  noEndpointGeneration: true;
  noBackendCreation: true;
  noDbSqlMutation: true;
  noNetworkCalls: true;
  noProviderCalls: true;
  noAuthRuntime: true;
  noCredentialUse: true;
  noAppGeneration: true;
  noCodexExecution: true;
  noExpoEasExecution: true;
  noPackageChanges: true;
  noCiActivation: true;
  noMemoryPersistence: true;
  noGitAutomationFromSource: true;
}

export interface MobileApiRequestResponseModel {
  modelId: string;
  modelName: string;
  fields: readonly string[];
  requiredFields: readonly string[];
  optionalFields: readonly string[];
  sensitiveFields: readonly string[];
  validationRules: readonly string[];
  exampleShapeLabel: string;
  limitations: readonly string[];
  safetyBoundaries: Pick<
    MobileApiContractSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noBackendCreation" | "noNetworkCalls"
  >;
}

export interface MobileApiErrorModel {
  errorModelId: string;
  errorCode: string;
  userMessage: string;
  developerMessage: string;
  recoverable: boolean;
  retryAllowed: boolean;
  fallbackAction: string;
  relatedScreenStateRef: string;
  riskLevel: PMRiskTier;
  safetyBoundaries: Pick<
    MobileApiContractSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noBackendCreation" | "noNetworkCalls"
  >;
}

export interface MobileApiPaginationModel {
  paginationId: string;
  mode: "none" | "page" | "cursor" | "infinite_future" | "unknown";
  pageSizeHint: string;
  cursorLabel: string;
  emptyResultBehavior: string;
  riskLevel: PMRiskTier;
  limitations: readonly string[];
  metadataOnly: true;
  advisoryOnly: true;
}

export interface MobileApiFilterSortModel {
  filterSortId: string;
  filterFields: readonly string[];
  sortFields: readonly string[];
  defaultSort: string;
  searchSupported: boolean;
  riskLevel: PMRiskTier;
  limitations: readonly string[];
  metadataOnly: true;
  advisoryOnly: true;
}

export interface MobileApiContract {
  apiContractId: string;
  featureRef: string;
  screenRefs: readonly string[];
  endpointName: string;
  method: MobileApiOperationType;
  pathTemplate: string;
  purpose: string;
  requestModel: MobileApiRequestResponseModel;
  responseModel: MobileApiRequestResponseModel;
  authRequired: boolean;
  allowedRoles: readonly string[];
  requiredPermissions: readonly string[];
  errorModelRefs: readonly string[];
  paginationModel: MobileApiPaginationModel;
  filterSortModel: MobileApiFilterSortModel;
  offlineCachePolicy: string;
  securityRefs: readonly string[];
  performanceRefs: readonly string[];
  testingRefs: readonly string[];
  releaseRefs: readonly string[];
  category: MobileApiCategory;
  riskLevel: PMRiskTier;
  requiredApprovals: readonly string[];
  limitations: readonly string[];
  safetyBoundaries: MobileApiContractSafetyBoundaries;
}

export interface MobileEndpointCandidate {
  endpointCandidateId: string;
  sourceFeatureRef: string;
  sourceScreenRef: string;
  operationType: MobileApiOperationType;
  targetEntity: string;
  userGoal: string;
  dataNeeds: readonly string[];
  authNeeds: readonly string[];
  offlineNeeds: readonly string[];
  validationNeeds: readonly string[];
  suggestedContractRef: string;
  confidence: MobileApiContractConfidence;
  riskLevel: PMRiskTier;
  safetyBoundaries: Pick<
    MobileApiContractSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noEndpointGeneration" | "noBackendCreation" | "noNetworkCalls"
  >;
}

export interface MobileApiContractPlannerInput {
  plannerInputId: string;
  sourceScreenBlueprintOutputRef: string;
  screenBlueprints: readonly MobileScreenBlueprint[];
  featureBlueprints: readonly MobileFeatureBlueprint[];
  stateContext: readonly string[];
  offlineContext: readonly string[];
  securityContext: readonly string[];
  performanceContext: readonly string[];
  testingContext: readonly string[];
  releaseContext: readonly string[];
  constraints: readonly string[];
  assumptions: readonly string[];
  evidenceRefs: readonly PMEvidenceReference[];
  safetyBoundaries: MobileApiContractSafetyBoundaries;
}

export interface MobileApiArtifactMapping {
  mappingId: string;
  sourceApiContractRefs: readonly string[];
  mobileAppFactoryStrategy: readonly string[];
  mobileRequirementsInterview: readonly string[];
  mobileFeatureBlueprintGenerator: readonly string[];
  mobileScreenBlueprintGenerator: readonly string[];
  mobileNavigationFlowModel: readonly string[];
  mobileStateManagementStrategy: readonly string[];
  offlineCacheSyncStrategy: readonly string[];
  mobileSecurityBaseline: readonly string[];
  mobilePerformanceChecklist: readonly string[];
  mobileTestingStrategy: readonly string[];
  mobileReleaseEasStrategy: readonly string[];
  pmReport: readonly string[];
  taskGraph: readonly string[];
  dodCriteria: readonly string[];
  riskBlockerModel: readonly string[];
  autopilotHandoffContext: readonly string[];
  safetyBoundaries: Pick<
    MobileApiContractSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noCodexExecution" | "noNetworkCalls"
  >;
}

export interface MobileApiContractRecommendation {
  recommendationId: string;
  safeSummary: string;
  nextRecommendedArtifact: MobileApiContractNextArtifact;
  humanReviewRequired: boolean;
  riskLevel: PMRiskTier;
  requiredApprovals: readonly string[];
  recommendedNextStep: PMRecommendedNextStep;
  safetyBoundaries: Pick<
    MobileApiContractSafetyBoundaries,
    "sourceOnly" | "advisoryOnly" | "metadataOnly" | "noCodexExecution" | "noBackendCreation" | "noNetworkCalls"
  >;
}

export interface MobileApiContractSummary {
  outputId: string;
  sourceScreenBlueprintOutputRef: string;
  apiContractCount: number;
  endpointCandidateCount: number;
  requestModelCount: number;
  responseModelCount: number;
  errorModelCount: number;
  blockedContractCount: number;
  requiredApprovalCount: number;
  unresolvedQuestionCount: number;
  apiCategories: readonly MobileApiCategory[];
  riskLevel: PMRiskTier;
  confidence: MobileApiContractConfidence;
  humanReviewRequired: boolean;
  recommendedNextPhase: ProjectPhaseRef;
  safeSummary: string;
  safetyBoundaries: MobileApiContractSafetyBoundaries;
}

export interface MobileApiContractPlannerOutput {
  outputId: string;
  sourceScreenBlueprintOutputRef: string;
  apiContracts: readonly MobileApiContract[];
  endpointCandidates: readonly MobileEndpointCandidate[];
  requestModels: readonly MobileApiRequestResponseModel[];
  responseModels: readonly MobileApiRequestResponseModel[];
  errorModels: readonly MobileApiErrorModel[];
  blockedContracts: readonly MobileApiContract[];
  unresolvedQuestions: readonly string[];
  recommendedNextArtifact: MobileApiContractNextArtifact;
  confidence: MobileApiContractConfidence;
  riskLevel: PMRiskTier;
  requiredApprovals: readonly string[];
  artifactMapping: MobileApiArtifactMapping;
  recommendation: MobileApiContractRecommendation;
  summary: MobileApiContractSummary;
  safetyBoundaries: MobileApiContractSafetyBoundaries;
}

export interface MobileApiContractPlannerInputParams {
  plannerInputId?: string;
  sourceScreenBlueprintOutputRef?: string;
  screenBlueprintOutput?: MobileScreenBlueprintOutput;
  featureBlueprintOutput?: MobileFeatureBlueprintOutput;
  screenBlueprints?: readonly MobileScreenBlueprint[];
  featureBlueprints?: readonly MobileFeatureBlueprint[];
  stateContext?: readonly string[];
  offlineContext?: readonly string[];
  securityContext?: readonly string[];
  performanceContext?: readonly string[];
  testingContext?: readonly string[];
  releaseContext?: readonly string[];
  constraints?: readonly string[];
  assumptions?: readonly string[];
  evidenceRefs?: readonly PMEvidenceReference[];
}

export const mobileApiCategories: readonly MobileApiCategory[] = [
  "auth",
  "user_profile",
  "content_list",
  "content_detail",
  "create_update",
  "delete_archive",
  "search_filter",
  "messaging",
  "marketplace",
  "gamification_progress",
  "offline_sync",
  "monetization",
  "safety_report",
  "notifications",
  "analytics_reporting",
  "admin_management",
  "ai_assistant",
  "unknown",
];

const safetyBoundaries = (): MobileApiContractSafetyBoundaries => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noEndpointGeneration: true,
  noBackendCreation: true,
  noDbSqlMutation: true,
  noNetworkCalls: true,
  noProviderCalls: true,
  noAuthRuntime: true,
  noCredentialUse: true,
  noAppGeneration: true,
  noCodexExecution: true,
  noExpoEasExecution: true,
  noPackageChanges: true,
  noCiActivation: true,
  noMemoryPersistence: true,
  noGitAutomationFromSource: true,
});

const modelSafety = (): MobileApiRequestResponseModel["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noBackendCreation: true,
  noNetworkCalls: true,
});

const errorSafety = (): MobileApiErrorModel["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noBackendCreation: true,
  noNetworkCalls: true,
});

const candidateSafety = (): MobileEndpointCandidate["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noEndpointGeneration: true,
  noBackendCreation: true,
  noNetworkCalls: true,
});

const mappingSafety = (): MobileApiArtifactMapping["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noCodexExecution: true,
  noNetworkCalls: true,
});

const recommendationSafety = (): MobileApiContractRecommendation["safetyBoundaries"] => ({
  sourceOnly: true,
  advisoryOnly: true,
  metadataOnly: true,
  noCodexExecution: true,
  noBackendCreation: true,
  noNetworkCalls: true,
});

const uniqueStrings = (values: readonly string[] | undefined): string[] =>
  Array.from(new Set((values ?? []).map((value) => value.trim()).filter(Boolean)));

const riskRank: Record<PMRiskTier, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

const highestRisk = (risks: readonly PMRiskTier[]): PMRiskTier => {
  const sorted = [...risks].sort((left, right) => riskRank[right] - riskRank[left]);
  return sorted[0] ?? "low";
};

const sourceScreenOutputRef = (params: MobileApiContractPlannerInputParams): string => {
  if (params.sourceScreenBlueprintOutputRef) return params.sourceScreenBlueprintOutputRef;
  if (params.screenBlueprintOutput) return params.screenBlueprintOutput.outputId;
  return "mobile_screen_blueprint_output:unspecified";
};

const screenBlueprintsFromParams = (
  params: MobileApiContractPlannerInputParams,
): readonly MobileScreenBlueprint[] => {
  if (params.screenBlueprints) return [...params.screenBlueprints];
  if (params.screenBlueprintOutput) return [...params.screenBlueprintOutput.screenBlueprints];
  return [];
};

const featureBlueprintsFromParams = (
  params: MobileApiContractPlannerInputParams,
): readonly MobileFeatureBlueprint[] => {
  if (params.featureBlueprints) return [...params.featureBlueprints];
  if (params.featureBlueprintOutput) return [...params.featureBlueprintOutput.blueprints];
  return [];
};

const categoryFromScreen = (screen: MobileScreenBlueprint): MobileApiCategory => {
  const text = `${screen.category} ${screen.screenName} ${screen.description}`.toLowerCase();

  if (text.includes("auth") || text.includes("login") || text.includes("register") || text.includes("session")) return "auth";
  if (text.includes("profile") || text.includes("settings")) return "user_profile";
  if (text.includes("list") || text.includes("browse")) return "content_list";
  if (text.includes("detail")) return "content_detail";
  if (text.includes("form") || text.includes("submit") || text.includes("booking")) return "create_update";
  if (text.includes("delete") || text.includes("archive")) return "delete_archive";
  if (text.includes("search") || text.includes("filter")) return "search_filter";
  if (text.includes("message") || text.includes("chat")) return "messaging";
  if (text.includes("marketplace")) return "marketplace";
  if (text.includes("gamif") || text.includes("progress")) return "gamification_progress";
  if (text.includes("offline") || text.includes("sync")) return "offline_sync";
  if (text.includes("paywall") || text.includes("monet") || text.includes("subscription")) return "monetization";
  if (text.includes("safety") || text.includes("report") || text.includes("block")) return "safety_report";
  if (text.includes("notification")) return "notifications";
  if (text.includes("analytics")) return "analytics_reporting";
  if (text.includes("admin")) return "admin_management";
  if (text.includes("ai") || text.includes("assistant")) return "ai_assistant";

  return "unknown";
};

const operationFromCategory = (category: MobileApiCategory): MobileApiOperationType => {
  if (category === "content_list" || category === "search_filter" || category === "analytics_reporting") return "list";
  if (category === "content_detail" || category === "user_profile" || category === "auth") return "read";
  if (category === "create_update" || category === "messaging" || category === "safety_report") return "submit";
  if (category === "delete_archive") return "delete";
  if (category === "offline_sync") return "sync";
  return "unknown";
};

const targetEntityFromScreen = (screen: MobileScreenBlueprint, category: MobileApiCategory): string => {
  if (screen["dataRefs"].length > 0) return screen["dataRefs"][0] ?? "unknown_entity";
  return `${category}_entity`;
};

const confidenceFromScreen = (screen: MobileScreenBlueprint): MobileApiContractConfidence => {
  if (screen.phaseScope.includes("blocked")) return "blocked_by_unknowns";
  if (screen["dataRefs"].length === 0 || screen["routeRefs"].length === 0) return "medium";
  return "high";
};

const authNeedsFromScreen = (screen: MobileScreenBlueprint, category: MobileApiCategory): string[] =>
  uniqueStrings([
    ...(screen.userRoles.length > 0 ? ["role_review_required"] : []),
    ...(screen["securityRefs"].length > 0 ? ["security_review_required"] : []),
    ...(category === "auth" ? ["session_boundary_review"] : []),
    ...(category === "monetization" ? ["entitlement_review_required"] : []),
    ...(category === "safety_report" ? ["safety_review_required"] : []),
  ]);

const offlineNeedsFromScreen = (screen: MobileScreenBlueprint, category: MobileApiCategory): string[] =>
  uniqueStrings([
    ...(screen["screenStateRefs"].some((stateRef) => stateRef.includes("offline")) ? ["offline_state_mapping"] : []),
    ...(category === "offline_sync" ? ["sync_recovery_mapping"] : []),
    ...(screen["dataRefs"].length > 0 ? ["cache_policy_review"] : []),
  ]);

const validationNeedsFromScreen = (screen: MobileScreenBlueprint, category: MobileApiCategory): string[] =>
  uniqueStrings([
    ...(screen.componentSlots.some((slot) => slot.slotType === "form_field" || slot.slotType === "primary_action")
      ? ["input_validation_review"]
      : []),
    ...(category === "delete_archive" ? ["destructive_action_confirmation"] : []),
    ...(category === "safety_report" ? ["abuse_report_validation"] : []),
  ]);

const contractIdForScreen = (screen: MobileScreenBlueprint): string => `mobile_api_contract:${screen.screenId}`;

export const createMobileApiRequestResponseModel = (
  input: Omit<MobileApiRequestResponseModel, "safetyBoundaries"> & {
    safetyBoundaries?: MobileApiRequestResponseModel["safetyBoundaries"];
  },
): MobileApiRequestResponseModel => ({
  modelId: input.modelId,
  modelName: input.modelName,
  fields: uniqueStrings(input.fields),
  requiredFields: uniqueStrings(input.requiredFields),
  optionalFields: uniqueStrings(input.optionalFields),
  sensitiveFields: uniqueStrings(input.sensitiveFields),
  validationRules: uniqueStrings(input.validationRules),
  exampleShapeLabel: input.exampleShapeLabel,
  limitations: uniqueStrings(input.limitations),
  safetyBoundaries: input.safetyBoundaries ?? modelSafety(),
});

export const createMobileApiErrorModel = (
  input: Omit<MobileApiErrorModel, "safetyBoundaries"> & {
    safetyBoundaries?: MobileApiErrorModel["safetyBoundaries"];
  },
): MobileApiErrorModel => ({
  errorModelId: input.errorModelId,
  errorCode: input.errorCode,
  userMessage: input.userMessage,
  developerMessage: input.developerMessage,
  recoverable: input.recoverable,
  retryAllowed: input.retryAllowed,
  fallbackAction: input.fallbackAction,
  relatedScreenStateRef: input.relatedScreenStateRef,
  riskLevel: input.riskLevel,
  safetyBoundaries: input.safetyBoundaries ?? errorSafety(),
});

export const createMobileEndpointCandidate = (
  input: Omit<MobileEndpointCandidate, "safetyBoundaries"> & {
    safetyBoundaries?: MobileEndpointCandidate["safetyBoundaries"];
  },
): MobileEndpointCandidate => ({
  endpointCandidateId: input.endpointCandidateId,
  sourceFeatureRef: input.sourceFeatureRef,
  sourceScreenRef: input.sourceScreenRef,
  operationType: input.operationType,
  targetEntity: input.targetEntity,
  userGoal: input.userGoal,
  dataNeeds: uniqueStrings(input.dataNeeds),
  authNeeds: uniqueStrings(input.authNeeds),
  offlineNeeds: uniqueStrings(input.offlineNeeds),
  validationNeeds: uniqueStrings(input.validationNeeds),
  suggestedContractRef: input.suggestedContractRef,
  confidence: input.confidence,
  riskLevel: input.riskLevel,
  safetyBoundaries: input.safetyBoundaries ?? candidateSafety(),
});

const createPaginationModel = (
  contractId: string,
  category: MobileApiCategory,
  riskLevel: PMRiskTier,
): MobileApiPaginationModel => ({
  paginationId: `${contractId}:pagination`,
  mode: category === "content_list" || category === "search_filter" || category === "marketplace" ? "cursor" : "none",
  pageSizeHint: category === "content_list" || category === "search_filter" || category === "marketplace" ? "review_before_release" : "not_applicable",
  cursorLabel: category === "content_list" || category === "search_filter" || category === "marketplace" ? "future_cursor_label" : "none",
  emptyResultBehavior: "map_to_empty_screen_state",
  riskLevel,
  limitations: ["metadata_only_pagination"],
  metadataOnly: true,
  advisoryOnly: true,
});

const createFilterSortModel = (
  contractId: string,
  category: MobileApiCategory,
  screen: MobileScreenBlueprint,
): MobileApiFilterSortModel => ({
  filterSortId: `${contractId}:filter_sort`,
  filterFields: category === "search_filter" || category === "content_list" ? [...screen["dataRefs"]] : [],
  sortFields: category === "search_filter" || category === "content_list" ? ["default_priority_or_date_label"] : [],
  defaultSort: category === "search_filter" || category === "content_list" ? "review_default_sort" : "none",
  searchSupported: category === "search_filter",
  riskLevel: screen.riskLevel,
  limitations: ["metadata_only_filter_sort"],
  metadataOnly: true,
  advisoryOnly: true,
});

const defaultRequestModel = (
  contractId: string,
  screen: MobileScreenBlueprint,
  candidate: MobileEndpointCandidate,
): MobileApiRequestResponseModel =>
  createMobileApiRequestResponseModel({
    modelId: `${contractId}:request`,
    modelName: `${candidate.targetEntity}:request`,
    fields: [...screen["dataRefs"], ...screen["stateRefs"]],
    requiredFields: candidate.operationType === "read" || candidate.operationType === "list" ? [] : [...screen["dataRefs"]],
    optionalFields: [...screen["stateRefs"]],
    sensitiveFields: [...screen["securityRefs"]],
    validationRules: [...candidate.validationNeeds],
    exampleShapeLabel: `${candidate.targetEntity}_request_shape_label`,
    limitations: ["metadata_only_request_model"],
  });

const defaultResponseModel = (
  contractId: string,
  screen: MobileScreenBlueprint,
  candidate: MobileEndpointCandidate,
): MobileApiRequestResponseModel =>
  createMobileApiRequestResponseModel({
    modelId: `${contractId}:response`,
    modelName: `${candidate.targetEntity}:response`,
    fields: uniqueStrings([...screen["dataRefs"], ...screen["screenStateRefs"]]),
    requiredFields: [...screen["dataRefs"]],
    optionalFields: [...screen["screenStateRefs"]],
    sensitiveFields: [...screen["securityRefs"]],
    validationRules: ["response_shape_review"],
    exampleShapeLabel: `${candidate.targetEntity}_response_shape_label`,
    limitations: ["metadata_only_response_model"],
  });

const defaultErrorModels = (
  contractId: string,
  screen: MobileScreenBlueprint,
): readonly MobileApiErrorModel[] => [
  createMobileApiErrorModel({
    errorModelId: `${contractId}:error:validation`,
    errorCode: "validation_failed",
    userMessage: "Review the information and try again.",
    developerMessage: "Future contract validation failed according to metadata rules.",
    recoverable: true,
    retryAllowed: true,
    fallbackAction: "show_form_or_error_state",
    relatedScreenStateRef: screen["screenStateRefs"].find((stateRef) => stateRef.includes("error")) ?? "error_state:unspecified",
    riskLevel: screen.riskLevel,
  }),
  createMobileApiErrorModel({
    errorModelId: `${contractId}:error:auth`,
    errorCode: "auth_required",
    userMessage: "Sign in is required before continuing.",
    developerMessage: "Future contract requires auth or role review before use.",
    recoverable: true,
    retryAllowed: false,
    fallbackAction: "route_to_auth_or_permission_state",
    relatedScreenStateRef: screen["screenStateRefs"].find((stateRef) => stateRef.includes("auth")) ?? "auth_state:unspecified",
    riskLevel: screen["securityRefs"].length > 0 ? "high" : screen.riskLevel,
  }),
  createMobileApiErrorModel({
    errorModelId: `${contractId}:error:offline`,
    errorCode: "offline_unavailable",
    userMessage: "Connection is unavailable. Review recovery options.",
    developerMessage: "Future contract needs offline/cache fallback review.",
    recoverable: true,
    retryAllowed: true,
    fallbackAction: "show_offline_or_stale_state",
    relatedScreenStateRef: screen["screenStateRefs"].find((stateRef) => stateRef.includes("offline")) ?? "offline_state:unspecified",
    riskLevel: screen.riskLevel,
  }),
];

export const createMobileApiContract = (
  input: Omit<MobileApiContract, "safetyBoundaries"> & {
    safetyBoundaries?: MobileApiContractSafetyBoundaries;
  },
): MobileApiContract => ({
  apiContractId: input.apiContractId,
  featureRef: input.featureRef,
  screenRefs: uniqueStrings(input.screenRefs),
  endpointName: input.endpointName,
  method: input.method,
  pathTemplate: input.pathTemplate,
  purpose: input.purpose,
  requestModel: input.requestModel,
  responseModel: input.responseModel,
  authRequired: input.authRequired,
  allowedRoles: uniqueStrings(input.allowedRoles),
  requiredPermissions: uniqueStrings(input.requiredPermissions),
  errorModelRefs: uniqueStrings(input.errorModelRefs),
  paginationModel: input.paginationModel,
  filterSortModel: input.filterSortModel,
  offlineCachePolicy: input.offlineCachePolicy,
  securityRefs: uniqueStrings(input.securityRefs),
  performanceRefs: uniqueStrings(input.performanceRefs),
  testingRefs: uniqueStrings(input.testingRefs),
  releaseRefs: uniqueStrings(input.releaseRefs),
  category: input.category,
  riskLevel: input.riskLevel,
  requiredApprovals: uniqueStrings(input.requiredApprovals),
  limitations: uniqueStrings(input.limitations),
  safetyBoundaries: input.safetyBoundaries ?? safetyBoundaries(),
});

export const createMobileApiContractPlannerInput = (
  params: MobileApiContractPlannerInputParams,
): MobileApiContractPlannerInput => ({
  plannerInputId: params.plannerInputId ?? "mobile_api_contract_planner_input:default",
  sourceScreenBlueprintOutputRef: sourceScreenOutputRef(params),
  screenBlueprints: screenBlueprintsFromParams(params),
  featureBlueprints: featureBlueprintsFromParams(params),
  stateContext: uniqueStrings(params.stateContext),
  offlineContext: uniqueStrings(params.offlineContext),
  securityContext: uniqueStrings(params.securityContext),
  performanceContext: uniqueStrings(params.performanceContext),
  testingContext: uniqueStrings(params.testingContext),
  releaseContext: uniqueStrings(params.releaseContext),
  constraints: uniqueStrings(params.constraints),
  assumptions: uniqueStrings([
    "API contracts are metadata-only and advisory.",
    "Backend, endpoint, provider, network, auth runtime, schema, app, CI, and release actions remain future-gated.",
    ...(params.assumptions ?? []),
  ]),
  evidenceRefs: [...(params.evidenceRefs ?? [])],
  safetyBoundaries: safetyBoundaries(),
});

export const mapScreenBlueprintsToApiContracts = (
  input: MobileApiContractPlannerInput,
): readonly MobileApiContract[] =>
  input.screenBlueprints.map((screen) => {
    const category = categoryFromScreen(screen);
    const operationType = operationFromCategory(category);
    const contractId = contractIdForScreen(screen);
    const targetEntity = targetEntityFromScreen(screen, category);
    const candidate = createMobileEndpointCandidate({
      endpointCandidateId: `${contractId}:candidate`,
      sourceFeatureRef: screen["sourceFeatureRefs"][0] ?? "mobile_feature:unspecified",
      sourceScreenRef: screen.screenBlueprintId,
      operationType,
      targetEntity,
      userGoal: screen.description,
      dataNeeds: [...screen["dataRefs"]],
      authNeeds: authNeedsFromScreen(screen, category),
      offlineNeeds: offlineNeedsFromScreen(screen, category),
      validationNeeds: validationNeedsFromScreen(screen, category),
      suggestedContractRef: contractId,
      confidence: confidenceFromScreen(screen),
      riskLevel: screen.riskLevel,
    });
    const requestModel = defaultRequestModel(contractId, screen, candidate);
    const responseModel = defaultResponseModel(contractId, screen, candidate);
    const errorModels = defaultErrorModels(contractId, screen);

    return createMobileApiContract({
      apiContractId: contractId,
      featureRef: candidate.sourceFeatureRef,
      screenRefs: [screen.screenBlueprintId, screen.screenId],
      endpointName: `${targetEntity}:${operationType}`,
      method: operationType,
      pathTemplate: `${targetEntity}:${operationType}:template_label`,
      purpose: `Advisory API contract metadata for ${screen.screenName}.`,
      requestModel,
      responseModel,
      authRequired: candidate.authNeeds.length > 0 || screen.userRoles.length > 0,
      allowedRoles: [...screen.userRoles],
      requiredPermissions: [...candidate.authNeeds],
      errorModelRefs: errorModels.map((errorModel) => errorModel.errorModelId),
      paginationModel: createPaginationModel(contractId, category, screen.riskLevel),
      filterSortModel: createFilterSortModel(contractId, category, screen),
      offlineCachePolicy:
        candidate.offlineNeeds.length > 0 ? "future_cache_or_sync_review_required" : "not_required_or_deferred",
      securityRefs: [...screen["securityRefs"]],
      performanceRefs: [...screen["performanceRefs"]],
      testingRefs: [...screen["testingRefs"]],
      releaseRefs: [...screen["releaseRefs"]],
      category,
      riskLevel: screen.riskLevel,
      requiredApprovals: [...screen.requiredApprovals],
      limitations: uniqueStrings([
        ...screen.limitations,
        ...(candidate.confidence === "blocked_by_unknowns" ? ["screen_blocked_by_unknowns"] : []),
        "metadata_only_api_contract",
      ]),
    });
  });

const endpointCandidatesFromContracts = (
  screens: readonly MobileScreenBlueprint[],
  contracts: readonly MobileApiContract[],
): readonly MobileEndpointCandidate[] =>
  contracts.map((contract) => {
    const screen = screens.find((candidateScreen) => contract["screenRefs"].includes(candidateScreen.screenBlueprintId));
    const fallbackScreen = screen ?? screens[0];
    const category = fallbackScreen ? categoryFromScreen(fallbackScreen) : "unknown";
    const operationType = contract.method;

    return createMobileEndpointCandidate({
      endpointCandidateId: `${contract.apiContractId}:candidate`,
      sourceFeatureRef: contract.featureRef,
      sourceScreenRef: contract["screenRefs"][0] ?? "mobile_screen:unspecified",
      operationType,
      targetEntity: fallbackScreen ? targetEntityFromScreen(fallbackScreen, category) : "unknown_entity",
      userGoal: contract.purpose,
      dataNeeds: fallbackScreen ? [...fallbackScreen["dataRefs"]] : [],
      authNeeds: fallbackScreen ? authNeedsFromScreen(fallbackScreen, category) : [],
      offlineNeeds: fallbackScreen ? offlineNeedsFromScreen(fallbackScreen, category) : [],
      validationNeeds: fallbackScreen ? validationNeedsFromScreen(fallbackScreen, category) : [],
      suggestedContractRef: contract.apiContractId,
      confidence: fallbackScreen ? confidenceFromScreen(fallbackScreen) : "low",
      riskLevel: contract.riskLevel,
    });
  });

const refsForContracts = (
  contracts: readonly MobileApiContract[],
  selector: (contract: MobileApiContract) => readonly string[],
): string[] => uniqueStrings(contracts.flatMap((contract) => selector(contract)));

const mapContractsToArtifacts = (contracts: readonly MobileApiContract[]): MobileApiArtifactMapping => ({
  mappingId: "mobile_api_contract_mapping:default",
  sourceApiContractRefs: contracts.map((contract) => contract.apiContractId),
  mobileAppFactoryStrategy: refsForContracts(contracts, (contract) => contract["screenRefs"]),
  mobileRequirementsInterview: refsForContracts(contracts, (contract) => [contract.featureRef]),
  mobileFeatureBlueprintGenerator: refsForContracts(contracts, (contract) => [contract.featureRef]),
  mobileScreenBlueprintGenerator: refsForContracts(contracts, (contract) => contract["screenRefs"]),
  mobileNavigationFlowModel: refsForContracts(contracts, (contract) => contract["screenRefs"]),
  mobileStateManagementStrategy: refsForContracts(contracts, (contract) => [
    ...contract.requestModel.fields,
    ...contract.responseModel.fields,
  ]),
  offlineCacheSyncStrategy: refsForContracts(contracts, (contract) =>
    contract.offlineCachePolicy === "not_required_or_deferred" ? [] : [contract.apiContractId],
  ),
  mobileSecurityBaseline: refsForContracts(contracts, (contract) => contract["securityRefs"]),
  mobilePerformanceChecklist: refsForContracts(contracts, (contract) => contract["performanceRefs"]),
  mobileTestingStrategy: refsForContracts(contracts, (contract) => contract["testingRefs"]),
  mobileReleaseEasStrategy: refsForContracts(contracts, (contract) => contract["releaseRefs"]),
  pmReport: contracts.map((contract) => contract.apiContractId),
  taskGraph: contracts.map((contract) => contract.apiContractId),
  dodCriteria: contracts.map((contract) => `${contract.apiContractId}:dod`),
  riskBlockerModel: contracts
    .filter((contract) => contract.riskLevel === "high" || contract.riskLevel === "critical")
    .map((contract) => contract.apiContractId),
  autopilotHandoffContext: contracts.map((contract) => contract.apiContractId),
  safetyBoundaries: mappingSafety(),
});

const confidenceFromContracts = (
  contracts: readonly MobileApiContract[],
  candidates: readonly MobileEndpointCandidate[],
  unresolvedQuestions: readonly string[],
): MobileApiContractConfidence => {
  if (
    unresolvedQuestions.length >= 3 ||
    candidates.some((candidate) => candidate.confidence === "blocked_by_unknowns") ||
    contracts.some((contract) => contract.limitations.includes("screen_blocked_by_unknowns"))
  ) {
    return "blocked_by_unknowns";
  }
  if (
    unresolvedQuestions.length > 0 ||
    contracts.some((contract) => contract.requestModel.fields.length === 0 && contract.responseModel.fields.length === 0)
  ) {
    return "medium";
  }
  return contracts.length > 0 ? "high" : "low";
};

const buildRecommendation = (
  riskLevel: PMRiskTier,
  confidence: MobileApiContractConfidence,
  requiredApprovals: readonly string[],
): MobileApiContractRecommendation => {
  const humanReviewRequired = riskLevel === "high" || riskLevel === "critical" || requiredApprovals.length > 0;
  const nextRecommendedArtifact: MobileApiContractNextArtifact =
    confidence === "blocked_by_unknowns"
      ? "blocked_by_unknowns"
      : humanReviewRequired
        ? "human_review"
        : "mobile_design_system_blueprint_plan";

  return {
    recommendationId: "mobile_api_contract_recommendation:136B",
    safeSummary:
      "Use API contract metadata as advisory context for future design system planning after human review when needed.",
    nextRecommendedArtifact,
    humanReviewRequired,
    riskLevel,
    requiredApprovals: [...requiredApprovals],
    recommendedNextStep: {
      nextStepId: "mobile_api_contract_next_step:136B",
      title: "Plan the Mobile Design System Blueprint",
      safeSummary:
        "Continue with Phase 136B to plan design-system metadata before any UI, backend, provider, or app work.",
      priority: riskLevel,
      decisionMode: "plan_only",
      riskSurfaces: ["automation", "scaffold", "security_policy", "release", "unknown"],
      recommendationOnly: true,
      noExecution: true,
    },
    safetyBoundaries: recommendationSafety(),
  };
};

export const selectApiContractsByCategory = (
  contracts: readonly MobileApiContract[],
  category: MobileApiCategory,
): readonly MobileApiContract[] => contracts.filter((contract) => contract.category === category);

export const selectEndpointCandidatesByOperationType = (
  candidates: readonly MobileEndpointCandidate[],
  operationType: MobileApiOperationType,
): readonly MobileEndpointCandidate[] => candidates.filter((candidate) => candidate.operationType === operationType);

export const createMobileApiContractPlannerOutput = (
  input: Omit<
    MobileApiContractPlannerOutput,
    "artifactMapping" | "recommendation" | "summary" | "safetyBoundaries"
  > & {
    artifactMapping?: MobileApiArtifactMapping;
    recommendation?: MobileApiContractRecommendation;
    summary?: MobileApiContractSummary;
    safetyBoundaries?: MobileApiContractSafetyBoundaries;
  },
): MobileApiContractPlannerOutput => {
  const boundaries = input.safetyBoundaries ?? safetyBoundaries();
  const artifactMapping = input.artifactMapping ?? mapContractsToArtifacts(input.apiContracts);
  const recommendation =
    input.recommendation ?? buildRecommendation(input.riskLevel, input.confidence, input.requiredApprovals);
  const outputWithoutSummary = {
    outputId: input.outputId,
    sourceScreenBlueprintOutputRef: input.sourceScreenBlueprintOutputRef,
    apiContracts: [...input.apiContracts],
    endpointCandidates: [...input.endpointCandidates],
    requestModels: [...input.requestModels],
    responseModels: [...input.responseModels],
    errorModels: [...input.errorModels],
    blockedContracts: [...input.blockedContracts],
    unresolvedQuestions: uniqueStrings(input.unresolvedQuestions),
    recommendedNextArtifact: input.recommendedNextArtifact,
    confidence: input.confidence,
    riskLevel: input.riskLevel,
    requiredApprovals: uniqueStrings(input.requiredApprovals),
    artifactMapping,
    recommendation,
    safetyBoundaries: boundaries,
  };
  const summary = input.summary ?? summarizeMobileApiContractOutput(outputWithoutSummary);

  return {
    ...outputWithoutSummary,
    summary,
  };
};

export const summarizeMobileApiContractOutput = (
  output: Pick<
    MobileApiContractPlannerOutput,
    | "outputId"
    | "sourceScreenBlueprintOutputRef"
    | "apiContracts"
    | "endpointCandidates"
    | "requestModels"
    | "responseModels"
    | "errorModels"
    | "blockedContracts"
    | "unresolvedQuestions"
    | "riskLevel"
    | "confidence"
    | "requiredApprovals"
    | "recommendation"
    | "safetyBoundaries"
  >,
): MobileApiContractSummary => ({
  outputId: output.outputId,
  sourceScreenBlueprintOutputRef: output.sourceScreenBlueprintOutputRef,
  apiContractCount: output.apiContracts.length,
  endpointCandidateCount: output.endpointCandidates.length,
  requestModelCount: output.requestModels.length,
  responseModelCount: output.responseModels.length,
  errorModelCount: output.errorModels.length,
  blockedContractCount: output.blockedContracts.length,
  requiredApprovalCount: output.requiredApprovals.length,
  unresolvedQuestionCount: output.unresolvedQuestions.length,
  apiCategories: uniqueStrings(output.apiContracts.map((contract) => contract.category)) as MobileApiCategory[],
  riskLevel: output.riskLevel,
  confidence: output.confidence,
  humanReviewRequired: output.recommendation.humanReviewRequired,
  recommendedNextPhase: "Phase 136B",
  safeSummary:
    `${output.apiContracts.length} API contract(s), ${output.blockedContracts.length} blocked, ${output.confidence} confidence.`,
  safetyBoundaries: output.safetyBoundaries,
});

export const planMobileApiContracts = (
  input: MobileApiContractPlannerInput,
): MobileApiContractPlannerOutput => {
  const apiContracts = mapScreenBlueprintsToApiContracts(input);
  const endpointCandidates = endpointCandidatesFromContracts(input.screenBlueprints, apiContracts);
  const requestModels = apiContracts.map((contract) => contract.requestModel);
  const responseModels = apiContracts.map((contract) => contract.responseModel);
  const errorModels = apiContracts.flatMap((contract) =>
    defaultErrorModels(
      contract.apiContractId,
      input.screenBlueprints.find((screen) => contract["screenRefs"].includes(screen.screenBlueprintId)) ?? input.screenBlueprints[0]!,
    ),
  );
  const blockedContracts = apiContracts.filter((contract) => contract.limitations.includes("screen_blocked_by_unknowns"));
  const unresolvedQuestions = uniqueStrings([
    ...input.constraints,
    ...blockedContracts.map((contract) => contract.endpointName),
  ]);
  const riskLevel = highestRisk(apiContracts.map((contract) => contract.riskLevel));
  const requiredApprovals = uniqueStrings(apiContracts.flatMap((contract) => contract.requiredApprovals));
  const confidence = confidenceFromContracts(apiContracts, endpointCandidates, unresolvedQuestions);
  const recommendation = buildRecommendation(riskLevel, confidence, requiredApprovals);

  return createMobileApiContractPlannerOutput({
    outputId: `mobile_api_contract_output:${input.plannerInputId}`,
    sourceScreenBlueprintOutputRef: input.sourceScreenBlueprintOutputRef,
    apiContracts,
    endpointCandidates,
    requestModels,
    responseModels,
    errorModels,
    blockedContracts,
    unresolvedQuestions,
    recommendedNextArtifact: recommendation.nextRecommendedArtifact,
    confidence,
    riskLevel,
    requiredApprovals,
    recommendation,
  });
};
