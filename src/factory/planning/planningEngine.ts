import { getBusinessSystemFamily } from "../catalog/businessSystemsCatalog.js";
import type { BusinessSystemFamily, BusinessSystemMetadataItem } from "../catalog/types.js";
import type { ModuleBlueprint } from "../blueprints/types.js";
import type {
  BacklogItem,
  DeliveryPlan,
  DependencyItem,
  EffortBand,
  Epic,
  PlanningAssumption,
  PlanningBoundarySet,
  PlanningConfidence,
  PlanningContext,
  PlanningEngineResult,
  PlanningExclusion,
  PlanningInput,
  RiskItem,
  RoadmapPhase,
  RolloutPlan,
  UserStory,
} from "./types.js";

export const planningBoundaries: PlanningBoundarySet = {
  advisoryOnly: true,
  dataOnly: true,
  noProviderCalls: true,
  noNetwork: true,
  noFileWrites: true,
  noRuntimeExecution: true,
  noStoreMutation: true,
  noActionDispatch: true,
  noProposalCreation: true,
  noProposalApproval: true,
  noScaffolding: true,
  noDbSchemas: true,
  noEnterpriseGeneration: true,
  noExactPrices: true,
  noGuaranteedDeliveryDates: true,
  noProductionReadinessClaims: true,
};

const normalizeId = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const effortForCount = (count: number): EffortBand => {
  if (count <= 0) return "unknown";
  if (count <= 2) return "s";
  if (count <= 5) return "m";
  if (count <= 8) return "l";
  return "xl";
};

const combineUnique = (values: readonly string[]): string[] =>
  Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));

const knownModules = (
  family: BusinessSystemFamily,
  moduleBlueprints: readonly ModuleBlueprint[],
): BusinessSystemMetadataItem[] => {
  if (moduleBlueprints.length === 0) {
    return family.coreModules.slice(0, 6);
  }

  const blueprintModuleIds = new Set(
    moduleBlueprints
      .filter((blueprint) => blueprint.familyId === family.familyId)
      .map((blueprint) => normalizeId(blueprint.moduleId)),
  );

  const matchedModules = family.coreModules.filter((module) =>
    blueprintModuleIds.has(normalizeId(module.id || module.name)),
  );

  return matchedModules.length > 0 ? matchedModules : family.coreModules.slice(0, 6);
};

const confidenceFromInput = (input: PlanningInput): PlanningConfidence => {
  const answeredInterviewLike =
    input.interviewPlan &&
    input.interviewPlan.questions.length > 0 &&
    input.interviewPlan.missingAnswers.length < input.interviewPlan.questions.length;
  const hasModuleContext = (input.moduleBlueprints ?? []).length > 0;

  if (answeredInterviewLike && hasModuleContext && (input.assumptions ?? []).length > 2) {
    return "medium";
  }
  if (input.interviewPlan || hasModuleContext) {
    return "medium";
  }
  return "low";
};

const planningContext = (
  family: BusinessSystemFamily,
  input: PlanningInput,
): PlanningContext => ({
  familyId: family.familyId,
  familyName: family.name,
  moduleCount: family.coreModules.length,
  interviewQuestionCount: input.interviewPlan?.questions.length ?? 0,
  missingAnswerCount: input.interviewPlan?.missingAnswers.length ?? 0,
  hasInterviewContext: Boolean(input.interviewPlan),
  hasModuleBlueprintContext: (input.moduleBlueprints ?? []).length > 0,
  preferredRollout: input.preferredRollout ?? "phased",
});

const roadmapFor = (
  family: BusinessSystemFamily,
  modules: readonly BusinessSystemMetadataItem[],
  confidence: PlanningConfidence,
): RoadmapPhase[] => [
  {
    phaseId: `roadmap:${family.familyId}:discovery`,
    name: "Discovery and requirements closure",
    objective: `Confirm ${family.name} scope, actors, workflows, reports, and constraints before implementation planning.`,
    scopeItems: ["stakeholder answers", "scope confirmation", "risk review"],
    entryCriteria: ["Business family selected", "Initial interview plan available"],
    exitCriteria: ["Missing answers reviewed", "Assumptions and exclusions accepted"],
    effortBand: "s",
    confidence,
  },
  {
    phaseId: `roadmap:${family.familyId}:mvp`,
    name: "MVP planning slice",
    objective: "Plan the smallest reviewable operational slice without scaffold or runtime output.",
    scopeItems: modules.slice(0, 3).map((module) => module.name),
    entryCriteria: ["Discovery questions reviewed", "MVP modules selected"],
    exitCriteria: ["Backlog, risks, and dependencies reviewed"],
    effortBand: effortForCount(modules.slice(0, 3).length),
    confidence,
  },
  {
    phaseId: `roadmap:${family.familyId}:enterprise-rollout`,
    name: "Enterprise rollout planning",
    objective: "Sequence remaining modules, controls, reporting, integrations, and hardening needs.",
    scopeItems: modules.slice(3).map((module) => module.name),
    entryCriteria: ["MVP scope validated", "Enterprise dependencies identified"],
    exitCriteria: ["Rollout decision points and review gates documented"],
    effortBand: effortForCount(modules.slice(3).length),
    confidence: "low",
  },
];

const backlogFor = (
  family: BusinessSystemFamily,
  modules: readonly BusinessSystemMetadataItem[],
): BacklogItem[] =>
  modules.map((module, index) => ({
    backlogItemId: `backlog:${family.familyId}:${normalizeId(module.id || module.name)}`,
    title: `Plan ${module.name}`,
    description: `Review ${module.name} scope, actors, data, reports, risks, and integrations from source metadata.`,
    source: "catalog",
    priority: index < 3 ? "must" : "should",
    effortBand: index < 2 ? "m" : "s",
    riskLevel: index < 2 ? "medium" : "low",
  }));

const epicsFor = (
  family: BusinessSystemFamily,
  backlog: readonly BacklogItem[],
  confidence: PlanningConfidence,
): Epic[] =>
  [
    {
      epicId: `epic:${family.familyId}:core-operations`,
      title: `${family.name} core operations planning`,
      description: "Plan operational modules, permissions, reporting, and review gates.",
      backlogItemIds: backlog.slice(0, 4).map((item) => item.backlogItemId),
      effortBand: effortForCount(backlog.slice(0, 4).length),
      confidence,
    },
    {
      epicId: `epic:${family.familyId}:controls-and-rollout`,
      title: `${family.name} controls and rollout planning`,
      description: "Plan audit concerns, dependencies, phased rollout, and deferred enterprise scope.",
      backlogItemIds: backlog.slice(4).map((item) => item.backlogItemId),
      effortBand: effortForCount(backlog.slice(4).length),
      confidence: "low" as const,
    },
  ].filter((epic) => epic.backlogItemIds.length > 0);

const storiesFor = (
  family: BusinessSystemFamily,
  modules: readonly BusinessSystemMetadataItem[],
  epics: readonly Epic[],
): UserStory[] => {
  const fallbackEpicId = epics[0]?.epicId ?? `epic:${family.familyId}:core-operations`;
  return modules.slice(0, 8).map((module, index) => ({
    storyId: `story:${family.familyId}:${normalizeId(module.id || module.name)}`,
    epicId: index < 4 ? fallbackEpicId : epics[1]?.epicId ?? fallbackEpicId,
    actor: family.typicalActors[index % Math.max(family.typicalActors.length, 1)] ?? "reviewer",
    goal: `review ${module.name} planning scope`,
    reason: "so the future implementation remains aligned with confirmed requirements",
    acceptanceNotes: [
      "Module scope is reviewed by a human.",
      "Assumptions, exclusions, risks, and dependencies are explicit.",
      "No generated system, scaffold, database schema, or runtime behavior is produced.",
    ],
    effortBand: index < 3 ? "s" : "xs",
  }));
};

const risksFor = (
  family: BusinessSystemFamily,
  input: PlanningInput,
): RiskItem[] => [
  {
    riskId: `risk:${family.familyId}:missing-answers`,
    title: "Incomplete requirements",
    safeSummary: "Planning confidence stays limited until stakeholder answers are reviewed.",
    likelihood: input.interviewPlan ? "medium" : "high",
    impact: "high",
    mitigation: "Complete the requirements interview before treating estimates as stable.",
  },
  {
    riskId: `risk:${family.familyId}:generic-catalog`,
    title: "Catalog-derived scope",
    safeSummary: "Catalog metadata may miss organization-specific workflows or exceptions.",
    likelihood: "medium",
    impact: "medium",
    mitigation: "Review module scope with business, technical, and audit stakeholders.",
  },
  ...family.riskNotes.slice(0, 3).map((risk, index) => ({
    riskId: `risk:${family.familyId}:catalog-${index + 1}`,
    title: "Catalog risk note",
    safeSummary: risk,
    likelihood: "medium" as const,
    impact: "medium" as const,
    mitigation: "Track this risk as an advisory review item.",
  })),
];

const dependenciesFor = (
  family: BusinessSystemFamily,
  modules: readonly BusinessSystemMetadataItem[],
): DependencyItem[] => [
  {
    dependencyId: `dependency:${family.familyId}:requirements-review`,
    title: "Requirements review",
    safeSummary: "Roadmap confidence depends on completed stakeholder review.",
    dependsOn: ["requirements interview", "assumption review"],
    riskLevel: "high",
  },
  {
    dependencyId: `dependency:${family.familyId}:module-sequencing`,
    title: "Module sequencing",
    safeSummary: "Later module planning depends on agreement about the MVP slice.",
    dependsOn: modules.slice(0, 3).map((module) => module.name),
    riskLevel: "medium",
  },
  {
    dependencyId: `dependency:${family.familyId}:integration-review`,
    title: "Integration review",
    safeSummary: "Integration timing depends on system owners and available test data.",
    dependsOn: family.integrations.slice(0, 3).map((integration) => integration.name),
    riskLevel: "medium",
  },
];

const assumptionsFor = (
  family: BusinessSystemFamily,
  input: PlanningInput,
  confidence: PlanningConfidence,
): PlanningAssumption[] => [
  ...family.assumptions.slice(0, 4).map((assumption, index) => ({
    assumptionId: `assumption:${family.familyId}:catalog-${index + 1}`,
    source: "catalog" as const,
    safeSummary: assumption,
    confidence: "low" as const,
  })),
  ...(input.assumptions ?? []).slice(0, 6).map((assumption, index) => ({
    assumptionId: `assumption:${family.familyId}:input-${index + 1}`,
    source: "planner" as const,
    safeSummary: assumption,
    confidence,
  })),
  {
    assumptionId: `assumption:${family.familyId}:relative-estimation`,
    source: "planner",
    safeSummary: "Effort uses relative bands only, not exact hours, prices, or delivery commitments.",
    confidence: "medium",
  },
];

const exclusionsFor = (
  familyId: string,
  input: PlanningInput,
): PlanningExclusion[] => [
  ...(input.exclusions ?? []).slice(0, 6).map((exclusion, index) => ({
    exclusionId: `exclusion:${familyId}:input-${index + 1}`,
    safeSummary: exclusion,
    reasonCode: "USER_SUPPLIED_EXCLUSION",
  })),
  {
    exclusionId: `exclusion:${familyId}:no-commercial-quotation`,
    safeSummary: "Commercial quotation, exact pricing, and contractual delivery commitment are out of scope.",
    reasonCode: "COMMERCIAL_PROPOSAL_OUT_OF_SCOPE",
  },
  {
    exclusionId: `exclusion:${familyId}:no-generation`,
    safeSummary: "System generation, scaffolding, database schemas, and live runtime behavior are out of scope.",
    reasonCode: "GENERATION_OUT_OF_SCOPE",
  },
];

const deliveryPlanFor = (
  family: BusinessSystemFamily,
  preferredRollout: PlanningContext["preferredRollout"],
  confidence: PlanningConfidence,
): DeliveryPlan => ({
  deliveryPlanId: `delivery:${family.familyId}`,
  strategy: preferredRollout,
  planningHorizon: "assumption_based_range",
  milestones: [
    "Requirements review complete",
    "MVP scope agreed",
    "Dependencies and risks reviewed",
    "Enterprise rollout decision points accepted",
  ],
  reviewGates: [
    "Human review of assumptions",
    "Human review of exclusions",
    "Risk and dependency review",
    "Separate approval before any scaffold or implementation phase",
  ],
  nonCommitmentNotes: [
    "This plan does not create delivery commitments.",
    "This plan does not include exact prices, exact dates, or production-readiness claims.",
  ],
  confidence,
});

const rolloutPlanFor = (
  family: BusinessSystemFamily,
  modules: readonly BusinessSystemMetadataItem[],
  confidence: PlanningConfidence,
): RolloutPlan => ({
  rolloutPlanId: `rollout:${family.familyId}`,
  mvpScope: modules.slice(0, 3).map((module) => module.name),
  enterpriseScope: modules.slice(3, 8).map((module) => module.name),
  deferredScope: combineUnique([
    ...family.integrations.slice(0, 3).map((integration) => integration.name),
    ...family.reports.slice(0, 3).map((report) => report.name),
  ]),
  decisionPoints: [
    "Confirm MVP scope with stakeholders.",
    "Confirm integrations and migration needs before implementation planning.",
    "Confirm review gates before any scaffold or runtime phase.",
  ],
  confidence,
});

const invalidFamilyResult = (input: PlanningInput): PlanningEngineResult => {
  const familyId = input.familyId || "unknown";
  const confidence: PlanningConfidence = "low";
  return {
    planningId: `planning:${normalizeId(familyId || "unknown")}`,
    createdAt: new Date().toISOString(),
    schemaVersion: "1.0",
    familyId,
    familyName: "Unknown family",
    context: {
      familyId,
      familyName: "Unknown family",
      moduleCount: 0,
      interviewQuestionCount: input.interviewPlan?.questions.length ?? 0,
      missingAnswerCount: input.interviewPlan?.missingAnswers.length ?? 0,
      hasInterviewContext: Boolean(input.interviewPlan),
      hasModuleBlueprintContext: (input.moduleBlueprints ?? []).length > 0,
      preferredRollout: input.preferredRollout ?? "unknown",
    },
    roadmap: [],
    backlog: [],
    epics: [],
    userStories: [],
    effortBands: ["unknown"],
    risks: [],
    dependencies: [],
    deliveryPlan: {
      deliveryPlanId: `delivery:${normalizeId(familyId || "unknown")}`,
      strategy: input.preferredRollout ?? "unknown",
      planningHorizon: "assumption_based_range",
      milestones: [],
      reviewGates: ["Select a valid business system family."],
      nonCommitmentNotes: ["No planning output was generated for an unknown family."],
      confidence,
    },
    rolloutPlan: {
      rolloutPlanId: `rollout:${normalizeId(familyId || "unknown")}`,
      mvpScope: [],
      enterpriseScope: [],
      deferredScope: [],
      decisionPoints: ["Select a valid catalog family before roadmap planning."],
      confidence,
    },
    assumptions: [
      {
        assumptionId: `assumption:${normalizeId(familyId || "unknown")}:invalid-family`,
        source: "planner",
        safeSummary: "Requested family was not found in the business systems catalog.",
        confidence,
      },
    ],
    exclusions: exclusionsFor(normalizeId(familyId || "unknown"), input),
    confidence,
    warnings: [
      {
        id: "finding_1",
        severity: "fail",
        reasonCode: "UNKNOWN_FAMILY",
        safeMessage: "Planning input family must exist in the business systems catalog.",
        familyId,
      },
    ],
    advisoryOnly: true,
    boundaries: planningBoundaries,
  };
};

export const createPlanningEngineResult = (
  input: PlanningInput,
): PlanningEngineResult => {
  const family = getBusinessSystemFamily(input.familyId);
  if (!family) {
    return invalidFamilyResult(input);
  }

  const moduleBlueprints = (input.moduleBlueprints ?? []).filter(
    (blueprint) => blueprint.familyId === family.familyId,
  );
  const modules = knownModules(family, moduleBlueprints);
  const confidence = confidenceFromInput({ ...input, moduleBlueprints });
  const context = planningContext(family, { ...input, moduleBlueprints });
  const roadmap = roadmapFor(family, modules, confidence);
  const backlog = backlogFor(family, modules);
  const epics = epicsFor(family, backlog, confidence);
  const userStories = storiesFor(family, modules, epics);

  return {
    planningId: `planning:${family.familyId}`,
    createdAt: new Date().toISOString(),
    schemaVersion: "1.0",
    familyId: family.familyId,
    familyName: family.name,
    context,
    roadmap,
    backlog,
    epics,
    userStories,
    effortBands: combineUnique([
      ...roadmap.map((phase) => phase.effortBand),
      ...backlog.map((item) => item.effortBand),
      ...epics.map((epic) => epic.effortBand),
    ]) as EffortBand[],
    risks: risksFor(family, input),
    dependencies: dependenciesFor(family, modules),
    deliveryPlan: deliveryPlanFor(family, context.preferredRollout, confidence),
    rolloutPlan: rolloutPlanFor(family, modules, confidence),
    assumptions: assumptionsFor(family, input, confidence),
    exclusions: exclusionsFor(family.familyId, input),
    confidence,
    warnings: [],
    advisoryOnly: true,
    boundaries: planningBoundaries,
  };
};
