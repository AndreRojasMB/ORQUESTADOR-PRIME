import { createMobileFeatureBlueprint } from "../src/pm/mobileFeatureBlueprintGenerator.js";
import {
  createMobileComponentSlot,
  createMobileScreenBlueprint,
} from "../src/pm/mobileScreenBlueprintGenerator.js";
import {
  createMobileApiContract,
  createMobileApiContractPlannerInput,
  createMobileApiContractPlannerOutput,
  createMobileApiErrorModel,
  createMobileApiRequestResponseModel,
  createMobileEndpointCandidate,
  mapScreenBlueprintsToApiContracts,
  planMobileApiContracts,
  selectApiContractsByCategory,
  selectEndpointCandidatesByOperationType,
  summarizeMobileApiContractOutput,
} from "../src/pm/mobileApiContractPlanner.js";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const feature = createMobileFeatureBlueprint({
  blueprintId: "mobile_feature_blueprint:test:booking",
  featureId: "mobile_feature:test:booking",
  featureName: "Clinic booking form",
  description: "Users can request an appointment.",
  sourceRequirementRefs: ["mobile_requirement:test:booking"],
  appType: "service_booking_app",
  targetUsers: ["patients"],
  userRoles: ["patient"],
  coreFlowRefs: ["booking_flow"],
  screenPatternRefs: ["forms"],
  routeRefs: ["booking_route"],
  stateRefs: ["form_state"],
  dataRefs: ["appointment_request"],
  securityRefs: ["privacy_review"],
  performanceRefs: ["initial_render"],
  testingRefs: ["booking_smoke"],
  releaseRefs: ["mvp_gate"],
  priority: "must_have_mvp",
  phaseScope: ["mvp"],
  category: "forms",
  riskLevel: "medium",
  requiredApprovals: ["privacy_review"],
  acceptanceCriteria: [],
  definitionOfDone: {
    dodId: "mobile_feature:test:booking:dod",
    checklistItems: ["feature_metadata_mapped"],
    mappedArtifacts: ["mobile_ux_ui_pattern_catalog"],
    requiredEvidence: ["feature_blueprint"],
    riskLevel: "medium",
    humanReviewRequired: false,
    safetyBoundaries: {
      sourceOnly: true,
      advisoryOnly: true,
      metadataOnly: true,
      noCodexExecution: true,
      noRuntimeExecution: true,
    },
  },
  dependencies: [],
  limitations: ["metadata_only"],
});

const slot = createMobileComponentSlot({
  slotId: "mobile_screen:test:booking:slot:form",
  slotName: "Booking fields",
  slotType: "form_field",
  purpose: "Collect appointment request metadata.",
  required: true,
  dataNeeds: ["appointment_request"],
  interactionNotes: ["validation_review"],
  accessibilityRequirement: "Fields require labels and recoverable errors.",
  stateRefs: ["form_state"],
  riskLevel: "medium",
  limitations: ["metadata_only_slot"],
});

const screen = createMobileScreenBlueprint({
  screenBlueprintId: "mobile_screen_blueprint:test:booking",
  screenId: "mobile_screen:test:booking",
  screenName: "Booking request screen",
  description: "Patients submit appointment request metadata.",
  sourceFeatureRefs: [feature.blueprintId, feature.featureId],
  appType: "service_booking_app",
  targetUsers: ["patients"],
  userRoles: ["patient"],
  routeRefs: ["booking_route"],
  uxPatternRefs: ["forms"],
  screenStateRefs: ["booking_loading", "booking_error", "booking_offline"],
  componentSlots: [slot],
  dataRefs: ["appointment_request"],
  stateRefs: ["form_state"],
  securityRefs: ["privacy_review"],
  accessibilityNotes: ["labels_required"],
  safetyNotes: ["metadata_only"],
  performanceRefs: ["initial_render"],
  testingRefs: ["booking_smoke"],
  releaseRefs: ["mvp_gate"],
  phaseScope: ["mvp"],
  category: "form",
  riskLevel: "medium",
  requiredApprovals: ["privacy_review"],
  acceptanceCriteria: [],
  definitionOfDone: {
    dodId: "mobile_screen:test:booking:dod",
    checklistItems: ["screen_metadata_mapped"],
    mappedArtifacts: ["mobile_testing_strategy"],
    requiredEvidence: ["screen_blueprint"],
    riskLevel: "medium",
    humanReviewRequired: false,
    safetyBoundaries: {
      sourceOnly: true,
      advisoryOnly: true,
      metadataOnly: true,
      noCodexExecution: true,
      noRuntimeExecution: true,
    },
  },
  limitations: ["metadata_only"],
});

const requestModel = createMobileApiRequestResponseModel({
  modelId: "mobile_api_model:test:request",
  modelName: "Appointment request",
  fields: ["appointment_request", "form_state"],
  requiredFields: ["appointment_request"],
  optionalFields: ["form_state"],
  sensitiveFields: ["privacy_review"],
  validationRules: ["input_validation_review"],
  exampleShapeLabel: "appointment_request_shape_label",
  limitations: ["metadata_only_request_model"],
});

const responseModel = createMobileApiRequestResponseModel({
  modelId: "mobile_api_model:test:response",
  modelName: "Appointment response",
  fields: ["appointment_request", "booking_error"],
  requiredFields: ["appointment_request"],
  optionalFields: ["booking_error"],
  sensitiveFields: ["privacy_review"],
  validationRules: ["response_shape_review"],
  exampleShapeLabel: "appointment_response_shape_label",
  limitations: ["metadata_only_response_model"],
});

const errorModel = createMobileApiErrorModel({
  errorModelId: "mobile_api_error:test:validation",
  errorCode: "validation_failed",
  userMessage: "Review the information and try again.",
  developerMessage: "Future contract validation failed according to metadata rules.",
  recoverable: true,
  retryAllowed: true,
  fallbackAction: "show_form_or_error_state",
  relatedScreenStateRef: "booking_error",
  riskLevel: "medium",
});

const candidate = createMobileEndpointCandidate({
  endpointCandidateId: "mobile_api_candidate:test:booking",
  sourceFeatureRef: feature.featureId,
  sourceScreenRef: screen.screenBlueprintId,
  operationType: "submit",
  targetEntity: "appointment_request",
  userGoal: "Submit an appointment request.",
  dataNeeds: ["appointment_request"],
  authNeeds: ["role_review_required"],
  offlineNeeds: ["cache_policy_review"],
  validationNeeds: ["input_validation_review"],
  suggestedContractRef: "mobile_api_contract:test:booking",
  confidence: "high",
  riskLevel: "medium",
});

assert(requestModel.safetyBoundaries.noBackendCreation === true, "request model must not create backend behavior");
assert(errorModel.safetyBoundaries.noNetworkCalls === true, "error model must not perform network calls");
assert(candidate.safetyBoundaries.noEndpointGeneration === true, "candidate must not add endpoints");

const contract = createMobileApiContract({
  apiContractId: "mobile_api_contract:test:booking",
  featureRef: feature.featureId,
  screenRefs: [screen.screenBlueprintId],
  endpointName: "appointment_request:submit",
  method: "submit",
  pathTemplate: "appointment_request:submit:template_label",
  purpose: "Advisory booking contract metadata.",
  requestModel,
  responseModel,
  authRequired: true,
  allowedRoles: ["patient"],
  requiredPermissions: ["role_review_required"],
  errorModelRefs: [errorModel.errorModelId],
  paginationModel: {
    paginationId: "mobile_api_contract:test:booking:pagination",
    mode: "none",
    pageSizeHint: "not_applicable",
    cursorLabel: "none",
    emptyResultBehavior: "map_to_empty_screen_state",
    riskLevel: "medium",
    limitations: ["metadata_only_pagination"],
    metadataOnly: true,
    advisoryOnly: true,
  },
  filterSortModel: {
    filterSortId: "mobile_api_contract:test:booking:filter_sort",
    filterFields: [],
    sortFields: [],
    defaultSort: "none",
    searchSupported: false,
    riskLevel: "medium",
    limitations: ["metadata_only_filter_sort"],
    metadataOnly: true,
    advisoryOnly: true,
  },
  offlineCachePolicy: "future_cache_or_sync_review_required",
  securityRefs: ["privacy_review"],
  performanceRefs: ["initial_render"],
  testingRefs: ["booking_smoke"],
  releaseRefs: ["mvp_gate"],
  category: "create_update",
  riskLevel: "medium",
  requiredApprovals: ["privacy_review"],
  limitations: ["metadata_only_api_contract"],
});

assert(contract.safetyBoundaries.metadataOnly === true, "contract must be metadata-only");
assert(contract.safetyBoundaries.noBackendCreation === true, "contract must not create backend behavior");
assert(contract.safetyBoundaries.noDbSqlMutation === true, "contract must not mutate database or schema assets");
assert(contract.safetyBoundaries.noNetworkCalls === true, "contract must not perform network calls");

const input = createMobileApiContractPlannerInput({
  plannerInputId: "mobile_api_contract_input:test",
  sourceScreenBlueprintOutputRef: "mobile_screen_blueprint_output:test",
  screenBlueprints: [screen],
  featureBlueprints: [feature],
  stateContext: ["form_state"],
  offlineContext: ["cache_policy_review"],
  securityContext: ["privacy_review"],
  testingContext: ["booking_smoke"],
});

const mappedContracts = mapScreenBlueprintsToApiContracts(input);
const mappedContract = mappedContracts[0];

assert(input.safetyBoundaries.noProviderCalls === true, "input must not call providers");
assert(mappedContracts.length === 1, "mapping should return one contract");
if (!mappedContract) {
  throw new Error("mapped contract should exist");
}
assert(mappedContract.category === "create_update", "mapped contract should classify as create_update");
assert(mappedContract.requestModel.fields.includes("appointment_request"), "mapped request should include screen data refs");

const output = planMobileApiContracts(input);

assert(output.apiContracts.length === 1, "output should include one API contract");
assert(output.endpointCandidates.length === 1, "output should include one endpoint candidate");
assert(output.errorModels.length >= 3, "output should include default error models");
assert(output.safetyBoundaries.noBackendCreation === true, "output must not create backend behavior");
assert(output.safetyBoundaries.noNetworkCalls === true, "output must not perform network calls");

const explicitOutput = createMobileApiContractPlannerOutput({
  outputId: "mobile_api_contract_output:test:manual",
  sourceScreenBlueprintOutputRef: input.sourceScreenBlueprintOutputRef,
  apiContracts: [contract],
  endpointCandidates: [candidate],
  requestModels: [requestModel],
  responseModels: [responseModel],
  errorModels: [errorModel],
  blockedContracts: [],
  unresolvedQuestions: [],
  recommendedNextArtifact: "mobile_design_system_blueprint_plan",
  confidence: "high",
  riskLevel: "medium",
  requiredApprovals: ["privacy_review"],
});

const summary = summarizeMobileApiContractOutput(explicitOutput);
const createContracts = selectApiContractsByCategory(explicitOutput.apiContracts, "create_update");
const submitCandidates = selectEndpointCandidatesByOperationType(explicitOutput.endpointCandidates, "submit");

assert(summary.apiContractCount === 1, "summary should count API contracts");
assert(summary.endpointCandidateCount === 1, "summary should count endpoint candidates");
assert(summary.recommendedNextPhase === "Phase 136B", "summary should point to Phase 136B");
assert(createContracts.length === 1, "category filtering should work");
assert(submitCandidates.length === 1, "operation filtering should work");

console.log("Mobile API Contract Planner smoke tests passed");
console.log(`API contracts: ${summary.apiContractCount}`);
console.log(`Endpoint candidates: ${summary.endpointCandidateCount}`);
console.log(`Error models: ${summary.errorModelCount}`);
