import type { BusinessSystemFamilyId } from "../catalog/types.js";
import type { ModuleBlueprint } from "../blueprints/types.js";
import type { InterviewPlan } from "../interview/types.js";

export type PlanningEngineSchemaVersion = "1.0";

export type PlanningConfidence = "low" | "medium" | "high";

export type EffortBand = "xs" | "s" | "m" | "l" | "xl" | "unknown";

export type PlanningValidationStatus = "pass" | "warn" | "fail";

export type PlanningBoundarySet = {
  advisoryOnly: true;
  dataOnly: true;
  noProviderCalls: true;
  noNetwork: true;
  noFileWrites: true;
  noRuntimeExecution: true;
  noStoreMutation: true;
  noActionDispatch: true;
  noProposalCreation: true;
  noProposalApproval: true;
  noScaffolding: true;
  noDbSchemas: true;
  noEnterpriseGeneration: true;
  noExactPrices: true;
  noGuaranteedDeliveryDates: true;
  noProductionReadinessClaims: true;
};

export type PlanningConstraint = {
  constraintId: string;
  name: string;
  description: string;
  assumptionBased: true;
};

export type PlanningInput = {
  familyId: BusinessSystemFamilyId;
  interviewPlan?: InterviewPlan;
  moduleBlueprints?: ModuleBlueprint[];
  constraints?: PlanningConstraint[];
  assumptions?: string[];
  exclusions?: string[];
  preferredRollout?: "mvp_first" | "enterprise_first" | "phased" | "unknown";
};

export type PlanningContext = {
  familyId: BusinessSystemFamilyId;
  familyName: string;
  moduleCount: number;
  interviewQuestionCount: number;
  missingAnswerCount: number;
  hasInterviewContext: boolean;
  hasModuleBlueprintContext: boolean;
  preferredRollout: "mvp_first" | "enterprise_first" | "phased" | "unknown";
};

export type PlanningAssumption = {
  assumptionId: string;
  source: "catalog" | "interview" | "module_blueprint" | "constraint" | "planner";
  safeSummary: string;
  confidence: PlanningConfidence;
};

export type PlanningExclusion = {
  exclusionId: string;
  safeSummary: string;
  reasonCode: string;
};

export type RoadmapPhase = {
  phaseId: string;
  name: string;
  objective: string;
  scopeItems: string[];
  entryCriteria: string[];
  exitCriteria: string[];
  effortBand: EffortBand;
  confidence: PlanningConfidence;
};

export type BacklogItem = {
  backlogItemId: string;
  title: string;
  description: string;
  source: "catalog" | "interview" | "module_blueprint" | "planner";
  priority: "must" | "should" | "could";
  effortBand: EffortBand;
  riskLevel: "low" | "medium" | "high";
};

export type Epic = {
  epicId: string;
  title: string;
  description: string;
  backlogItemIds: string[];
  effortBand: EffortBand;
  confidence: PlanningConfidence;
};

export type UserStory = {
  storyId: string;
  epicId: string;
  actor: string;
  goal: string;
  reason: string;
  acceptanceNotes: string[];
  effortBand: EffortBand;
};

export type RiskItem = {
  riskId: string;
  title: string;
  safeSummary: string;
  likelihood: "low" | "medium" | "high";
  impact: "low" | "medium" | "high";
  mitigation: string;
};

export type DependencyItem = {
  dependencyId: string;
  title: string;
  safeSummary: string;
  dependsOn: string[];
  riskLevel: "low" | "medium" | "high";
};

export type DeliveryPlan = {
  deliveryPlanId: string;
  strategy: "mvp_first" | "enterprise_first" | "phased" | "unknown";
  planningHorizon: "assumption_based_range";
  milestones: string[];
  reviewGates: string[];
  nonCommitmentNotes: string[];
  confidence: PlanningConfidence;
};

export type RolloutPlan = {
  rolloutPlanId: string;
  mvpScope: string[];
  enterpriseScope: string[];
  deferredScope: string[];
  decisionPoints: string[];
  confidence: PlanningConfidence;
};

export type PlanningEngineResult = {
  planningId: string;
  createdAt: string;
  schemaVersion: PlanningEngineSchemaVersion;
  familyId: BusinessSystemFamilyId;
  familyName: string;
  context: PlanningContext;
  roadmap: RoadmapPhase[];
  backlog: BacklogItem[];
  epics: Epic[];
  userStories: UserStory[];
  effortBands: EffortBand[];
  risks: RiskItem[];
  dependencies: DependencyItem[];
  deliveryPlan: DeliveryPlan;
  rolloutPlan: RolloutPlan;
  assumptions: PlanningAssumption[];
  exclusions: PlanningExclusion[];
  confidence: PlanningConfidence;
  warnings: PlanningValidationFinding[];
  advisoryOnly: true;
  boundaries: PlanningBoundarySet;
};

export type PlanningValidationFinding = {
  id: string;
  severity: "warn" | "fail";
  reasonCode: string;
  safeMessage: string;
  path?: string;
  familyId?: BusinessSystemFamilyId;
  metadata?: Record<string, string | number | boolean>;
};

export type PlanningValidationResult = {
  validationId: string;
  createdAt: string;
  schemaVersion: PlanningEngineSchemaVersion;
  valid: boolean;
  status: PlanningValidationStatus;
  findingCount: number;
  warnings: PlanningValidationFinding[];
  errors: PlanningValidationFinding[];
  advisoryOnly: true;
  boundaries: PlanningBoundarySet;
};
