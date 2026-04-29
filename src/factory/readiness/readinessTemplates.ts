import type {
  ReadinessBlocker,
  ReadinessBoundarySet,
  ReadinessEvidenceReference,
  ReadinessEvidenceReferenceType,
  ReadinessLaneCategory,
  ReadinessLaneId,
  ReadinessLaneModel,
  ReadinessMaturityLevel,
  ReadinessNextStep,
  ReadinessPrecondition,
  ReadinessRiskTier,
  ReadinessStatusType,
} from "./types.js";

export const supportedReadinessLaneIds = [
  "factory_metadata_lanes",
  "runtime_deeper",
  "native_automation_deeper",
  "dashboard_control_center",
  "integrations_connectors",
  "safe_self_improvement",
  "baseline_strict_ci",
  "productization_release",
  "quality_evals_risk",
  "workspace_memory_learning",
  "actions_proposals_approvals",
  "jobs_notifications",
  "channels_computer_use",
  "deployment_productization",
] as const satisfies readonly ReadinessLaneId[];

export const supportedReadinessMaturityLevels = [
  "not_implemented",
  "docs_only_spec",
  "source_only_advisory",
  "local_read_only_diagnostic",
  "local_advisory_tooling",
  "live_adjacent_guarded",
  "deferred_until_prerequisites",
  "future_gated_execution",
] as const satisfies readonly ReadinessMaturityLevel[];

export const supportedReadinessRiskTiers = [
  "low",
  "medium",
  "high",
  "critical",
] as const satisfies readonly ReadinessRiskTier[];

export const readinessBoundaries: ReadinessBoundarySet = {
  advisoryOnly: true,
  sourceOnly: true,
  noProviderCalls: true,
  noNetwork: true,
  noFilesystemReads: true,
  noFilesystemWrites: true,
  noRepositoryScanning: true,
  noCommandExecution: true,
  noRuntimeExecution: true,
  noDashboardImplementation: true,
  noAutomationExecution: true,
  noConnectorImplementation: true,
  noCredentialVaultImplementation: true,
  noCiWorkflowChanges: true,
  noPackageScriptChanges: true,
  noBaselineArtifactMutation: true,
  noStoreMutation: true,
  noMemoryLearningMutation: true,
  noActionDispatch: true,
  noProposalApprovalExecution: true,
  noJobsExecution: true,
  noScaffolding: true,
  noDbSchemas: true,
  noSql: true,
  noBranchTagReleaseCreation: true,
  noProductionReadinessClaims: true,
  noSecurityComplianceGuarantees: true,
};

type LaneConfig = {
  laneId: ReadinessLaneId;
  category: ReadinessLaneCategory;
  name: string;
  summary: string;
  maturityLevel: ReadinessMaturityLevel;
  riskTier: ReadinessRiskTier;
  statusType: ReadinessStatusType;
  evidence: Array<[string, string, string, ReadinessEvidenceReferenceType]>;
  preconditions: string[];
  blockers: Array<[string, ReadinessRiskTier]>;
  nextSteps: string[];
  assumptions: string[];
  exclusions: string[];
};

const idPart = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const evidence = (
  laneId: ReadinessLaneId,
  entries: LaneConfig["evidence"],
): ReadinessEvidenceReference[] =>
  entries.map(([label, reference, safeSummary, referenceType], index) => ({
    evidenceId: `${laneId}:evidence:${index + 1}:${idPart(label)}`,
    label,
    reference,
    referenceType,
    safeSummary,
    metadataOnly: true,
    noFileRead: true,
  }));

const preconditions = (
  laneId: ReadinessLaneId,
  entries: string[],
): ReadinessPrecondition[] =>
  entries.map((safeSummary, index) => ({
    preconditionId: `${laneId}:precondition:${index + 1}`,
    title: `Precondition ${index + 1}`,
    safeSummary,
    requiredBefore: "Any future maturity advancement for this lane.",
    metadataOnly: true,
  }));

const blockers = (
  laneId: ReadinessLaneId,
  entries: LaneConfig["blockers"],
): ReadinessBlocker[] =>
  entries.map(([safeSummary, severity], index) => ({
    blockerId: `${laneId}:blocker:${index + 1}`,
    title: `Blocker ${index + 1}`,
    safeSummary,
    severity,
    metadataOnly: true,
  }));

const nextSteps = (laneId: ReadinessLaneId, entries: string[]): ReadinessNextStep[] =>
  entries.map((safeSummary, index) => ({
    nextStepId: `${laneId}:next-step:${index + 1}`,
    title: `Recommended next step ${index + 1}`,
    safeSummary,
    priority: index === 0 ? "high" : "medium",
    recommendationOnly: true,
    noExecution: true,
  }));

const lane = (config: LaneConfig): ReadinessLaneModel => ({
  laneId: config.laneId,
  schemaVersion: "1.0",
  category: config.category,
  name: config.name,
  summary: config.summary,
  maturityLevel: config.maturityLevel,
  riskTier: config.riskTier,
  statusType: config.statusType,
  evidenceReferences: evidence(config.laneId, config.evidence),
  preconditions: preconditions(config.laneId, config.preconditions),
  blockers: blockers(config.laneId, config.blockers),
  nextSteps: nextSteps(config.laneId, config.nextSteps),
  assumptions: config.assumptions,
  exclusions: config.exclusions,
  advisoryOnly: true,
  boundaries: readinessBoundaries,
});

const commonExclusions = [
  "No runtime, dashboard, automation, connector, action, job, CI, release, or deployment behavior is enabled.",
  "Evidence references are metadata strings only and are not read by this source module.",
  "Next steps are recommendations only and do not execute work.",
];

const readinessTemplates: ReadinessLaneModel[] = [
  lane({
    laneId: "factory_metadata_lanes",
    category: "factory",
    name: "Factory Metadata Lanes",
    summary: "Implemented advisory factory metadata lanes cover catalog, blueprints, interviews, planning, profiles, processes, reporting, transactions, and UI patterns without generation or runtime behavior.",
    maturityLevel: "source_only_advisory",
    riskTier: "low",
    statusType: "implemented_advisory",
    evidence: [
      ["Factory governance", "docs/enterprise-software-factory.md", "Documents advisory factory scope and non-goals.", "doc"],
      ["Factory source", "src/factory/*", "Contains bounded source-only metadata helpers.", "source"],
    ],
    preconditions: ["Future executable factory work needs separate scaffold, runtime, permission, and review gates."],
    blockers: [["No approved scaffold or generated-system path exists for factory outputs.", "medium"]],
    nextSteps: ["Use readiness metadata to keep factory lanes advisory while later implementation plans mature."],
    assumptions: ["Current factory metadata helpers remain pure source-only planning utilities."],
    exclusions: commonExclusions,
  }),
  lane({
    laneId: "runtime_deeper",
    category: "runtime",
    name: "Production Runtime Deeper",
    summary: "Runtime deeper is a docs-only future architecture lane with existing read-only doctor and planning primitives nearby, not a production runtime.",
    maturityLevel: "docs_only_spec",
    riskTier: "high",
    statusType: "spec_only",
    evidence: [
      ["Runtime deeper spec", "docs/production-runtime-deeper.md", "Documents future runtime strategy.", "doc"],
      ["Runtime foundation", "docs/production-runtime-foundation.md", "Documents earlier runtime foundation boundaries.", "doc"],
    ],
    preconditions: ["Runtime advancement requires auth, audit, operator controls, backup, locks, rate limits, and validation boundaries."],
    blockers: [
      ["No production API, durable workers, queue backend, database adapter, auth model, or backup/restore path exists.", "high"],
    ],
    nextSteps: ["Plan source-only runtime readiness validation before any server, worker, queue, scheduler, or mutation work."],
    assumptions: ["Existing runtime-adjacent primitives must remain read-only or planning-only unless separately approved."],
    exclusions: commonExclusions,
  }),
  lane({
    laneId: "native_automation_deeper",
    category: "automation",
    name: "Native Automation Deeper",
    summary: "Native automation has validation and dry-run surfaces, while deeper automation execution remains docs-only and deferred.",
    maturityLevel: "local_advisory_tooling",
    riskTier: "high",
    statusType: "local_advisory",
    evidence: [
      ["Automation deeper spec", "docs/native-automation-engine-deeper.md", "Defines future automation execution path as gated and deferred.", "doc"],
      ["Automation source", "src/automation/*", "Contains validation and dry-run source surfaces.", "source"],
    ],
    preconditions: ["Execution requires workflow persistence governance, scheduler strategy, approvals, runtime queues, audit, and cancellation controls."],
    blockers: [["No workflow persistence, scheduler runtime, trigger runtime, webhook listener, or approval-gated execution bridge exists.", "high"]],
    nextSteps: ["Keep automation readiness as validation and dry-run evidence only."],
    assumptions: ["Automation dry-run output can inform readiness but must not become execution permission."],
    exclusions: commonExclusions,
  }),
  lane({
    laneId: "dashboard_control_center",
    category: "dashboard",
    name: "Dashboard / Control Center",
    summary: "Control center strategy is docs-only, while the existing dashboard app is live-adjacent because config write paths and server actions exist.",
    maturityLevel: "docs_only_spec",
    riskTier: "high",
    statusType: "live_adjacent",
    evidence: [
      ["Control center spec", "docs/dashboard-control-center.md", "Documents read-only-first future dashboard strategy.", "doc"],
      ["Dashboard app", "dashboard/*", "Existing app is tracked and must be audited before read-only control center work.", "source"],
    ],
    preconditions: ["Read-only dashboard implementation requires write-path audit, isolation, redaction policy, and permission boundaries."],
    blockers: [["Existing config write capability and server action paths require a dedicated safety audit.", "high"]],
    nextSteps: ["Perform docs-only dashboard safety audit before any dashboard implementation."],
    assumptions: ["Readiness metadata may later be displayed by a read-only dashboard, but it must not feed controls in 87I."],
    exclusions: commonExclusions,
  }),
  lane({
    laneId: "integrations_connectors",
    category: "connectors",
    name: "Integrations / Connectors",
    summary: "Connector governance is docs-only, while connector-adjacent clients and channels are live-adjacent and require stronger governance before use.",
    maturityLevel: "docs_only_spec",
    riskTier: "critical",
    statusType: "live_adjacent",
    evidence: [
      ["Connector governance", "docs/integrations-connectors.md", "Defines future connector governance without implementation.", "doc"],
      ["Connector-adjacent clients", "src/openclaw/*, src/n8n/*, src/coolify/*, src/security/requestSandbox.ts", "Existing clients require caution and are not used by readiness metadata.", "source"],
    ],
    preconditions: ["Connector advancement requires credential strategy, unified registry, rate limits, audit, approvals, and sandboxing."],
    blockers: [["No credential vault, unified connector registry, approval/audit/rate-limit maturity, or safe external-call boundary exists.", "critical"]],
    nextSteps: ["Add source-only connector taxonomy later without external calls or credential handling."],
    assumptions: ["Connector readiness is governance metadata only and never calls external services."],
    exclusions: commonExclusions,
  }),
  lane({
    laneId: "safe_self_improvement",
    category: "self_improvement",
    name: "Safe Self-Improvement",
    summary: "Safe self-improvement is docs-only and proposal-only; autonomous prompt, router, agent, source, branch, or PR mutation remains prohibited.",
    maturityLevel: "docs_only_spec",
    riskTier: "critical",
    statusType: "spec_only",
    evidence: [
      ["Self-improvement deeper spec", "docs/safe-self-improvement-deeper.md", "Defines future approval-gated proposal-only improvement path.", "doc"],
    ],
    preconditions: ["Self-improvement advancement requires strict CI, baselines, eval comparison governance, approval gates, redaction, and rollback policy."],
    blockers: [["No proposal schema, strict CI baseline anchor, or safe self-PR governance exists.", "critical"]],
    nextSteps: ["Keep self-improvement readiness as proposal-only governance evidence."],
    assumptions: ["Learning signals may inform proposals later but must not mutate memory or behavior in 87I."],
    exclusions: commonExclusions,
  }),
  lane({
    laneId: "baseline_strict_ci",
    category: "ci_governance",
    name: "Baseline / Strict CI",
    summary: "Baseline and strict CI maturity is docs-only with local advisory quality gate capabilities; CI strict enforcement and committed baselines are deferred.",
    maturityLevel: "docs_only_spec",
    riskTier: "medium",
    statusType: "spec_only",
    evidence: [
      ["Baseline strict CI spec", "docs/baseline-strict-ci-maturation.md", "Defines future baseline and strict CI governance.", "doc"],
      ["Quality workflow", ".github/workflows/quality.yml", "Current workflow uploads redacted artifacts without strict baseline enforcement.", "workflow"],
    ],
    preconditions: ["Strict CI advancement requires approved baselines, rollback policy, warning mode, and low false-positive evidence."],
    blockers: [["No committed baselines exist and strict flags are not active in CI.", "medium"]],
    nextSteps: ["Define baseline manifest dry-run metadata before workflow enforcement."],
    assumptions: ["Local quality flags are advisory until a future approved CI phase changes policy."],
    exclusions: commonExclusions,
  }),
  lane({
    laneId: "productization_release",
    category: "release_governance",
    name: "Productization / Release",
    summary: "Productization release path is docs-only and does not reconcile package version, tags, changelog, release notes, packages, license, or security policy.",
    maturityLevel: "docs_only_spec",
    riskTier: "medium",
    statusType: "spec_only",
    evidence: [
      ["Productization release path", "docs/productization-release-path.md", "Defines future release governance path.", "doc"],
      ["Package metadata", "package.json", "Package version is evidence metadata only and is not read by readiness code.", "package"],
    ],
    preconditions: ["Release advancement requires strict CI/baselines, release checklist, rollback, license/security decisions, and approved tag process."],
    blockers: [["Version, tag, and changelog alignment remains unresolved; no root LICENSE or SECURITY.md was found in prior planning.", "medium"]],
    nextSteps: ["Use readiness metadata as non-blocking release evidence only."],
    assumptions: ["Release metadata must not create tags, releases, packages, or policy files."],
    exclusions: commonExclusions,
  }),
  lane({
    laneId: "quality_evals_risk",
    category: "quality",
    name: "Quality / Evals / Risk",
    summary: "Quality, eval, and risk surfaces provide local advisory evidence and redacted artifacts, not blocking release or execution gates.",
    maturityLevel: "local_advisory_tooling",
    riskTier: "medium",
    statusType: "local_advisory",
    evidence: [
      ["Quality dashboard data", "docs/quality-dashboard-data.md", "Documents advisory quality report data.", "doc"],
      ["Quality source", "src/quality/*, src/evals/*, src/risk/*", "Local advisory tools exist and are not imported by readiness metadata.", "source"],
    ],
    preconditions: ["Blocking use requires committed baselines, strict CI policy, and approved regression handling."],
    blockers: [["Advisory signals are not yet governed as blocking gates.", "medium"]],
    nextSteps: ["Represent quality readiness as evidence, not enforcement."],
    assumptions: ["Readiness templates do not run evals, reports, risk gates, or artifact generation."],
    exclusions: commonExclusions,
  }),
  lane({
    laneId: "workspace_memory_learning",
    category: "workspace_state",
    name: "Workspace / Memory / Learning",
    summary: "Workspace, memory, and learning surfaces are local-state adjacent and privacy-sensitive; readiness metadata must not read or mutate them.",
    maturityLevel: "live_adjacent_guarded",
    riskTier: "high",
    statusType: "live_adjacent",
    evidence: [
      ["Workspace and learning source", "src/workspace/*, src/memory/*, src/learning/*", "Existing state and export surfaces are referenced only as metadata strings.", "source"],
    ],
    preconditions: ["Future use requires redaction, retention, permission, and no-raw-memory exposure policies."],
    blockers: [["Store mutation and private-memory exposure risks require strict separation.", "high"]],
    nextSteps: ["Keep readiness references bounded and never read stores from this lane."],
    assumptions: ["Learning exports may be evidence later but are not produced or consumed by readiness code."],
    exclusions: commonExclusions,
  }),
  lane({
    laneId: "actions_proposals_approvals",
    category: "actions",
    name: "Actions / Proposals / Approvals",
    summary: "Action, proposal, and approval surfaces are live-adjacent with local store writes and guarded dispatch paths.",
    maturityLevel: "live_adjacent_guarded",
    riskTier: "critical",
    statusType: "live_adjacent",
    evidence: [
      ["Action safety", "docs/channel-action-safety.md", "Documents action/proposal/approval boundaries.", "doc"],
      ["Action source", "src/actions/*", "Existing stores and dispatch paths are referenced only as metadata.", "source"],
    ],
    preconditions: ["Future readiness views require read-only status boundaries and must not invoke approval or dispatch behavior."],
    blockers: [["Dispatch/write paths exist and must remain gated outside readiness metadata.", "critical"]],
    nextSteps: ["Represent this lane as live-adjacent risk metadata only."],
    assumptions: ["No readiness helper imports action, proposal, approval, or dispatch modules."],
    exclusions: commonExclusions,
  }),
  lane({
    laneId: "jobs_notifications",
    category: "jobs",
    name: "Jobs / Notifications",
    summary: "Jobs and notifications are live-adjacent because enqueue, run, and local state paths exist.",
    maturityLevel: "live_adjacent_guarded",
    riskTier: "high",
    statusType: "live_adjacent",
    evidence: [
      ["Jobs and notifications", "docs/task-queue-notifications.md", "Documents job and notification safety posture.", "doc"],
      ["Jobs source", "src/jobs/*", "Existing job queue state helpers are not imported by readiness metadata.", "source"],
    ],
    preconditions: ["Future dashboard or runtime use requires read-only views, operator controls, and scheduler boundaries."],
    blockers: [["Enqueue, run-due, and local job state risks require explicit gating.", "high"]],
    nextSteps: ["Keep jobs readiness metadata descriptive only."],
    assumptions: ["No readiness helper enqueues, runs, or updates jobs."],
    exclusions: commonExclusions,
  }),
  lane({
    laneId: "channels_computer_use",
    category: "channels",
    name: "Channels / Computer Use",
    summary: "WhatsApp, Omi, OpenClaw, and computer-use surfaces are live-adjacent because bridges and clients can interact with external or local control boundaries when invoked.",
    maturityLevel: "live_adjacent_guarded",
    riskTier: "critical",
    statusType: "live_adjacent",
    evidence: [
      ["WhatsApp setup", "docs/whatsapp-setup.md", "Historical/setup guidance referenced as metadata only.", "doc"],
      ["Computer-use safety", "docs/computer-use-safety.md", "Documents critical-risk computer-use boundaries.", "doc"],
      ["Channel source", "src/whatsapp/*, src/omi/*, src/openclaw/*, src/computerUse/*", "Existing channel and computer-use source is not imported by readiness metadata.", "source"],
    ],
    preconditions: ["Future maturity requires connector governance, credential strategy, rate limits, audit, approvals, and sandbox review."],
    blockers: [["Bridge, network, and computer-use risks require critical controls before any execution path.", "critical"]],
    nextSteps: ["Keep channels and computer-use readiness as high-risk governance metadata."],
    assumptions: ["Readiness metadata does not call channels, providers, bridges, or computer-use clients."],
    exclusions: commonExclusions,
  }),
  lane({
    laneId: "deployment_productization",
    category: "deployment",
    name: "Deployment / Productization Readiness",
    summary: "Deployment and productization readiness is docs-only; packaging, deployment, release, and security policy remain deferred.",
    maturityLevel: "docs_only_spec",
    riskTier: "critical",
    statusType: "deferred",
    evidence: [
      ["Productization release path", "docs/productization-release-path.md", "Documents release and deployment governance without implementation.", "doc"],
      ["Post-85 sequencing", "docs/post-85-roadmap-sequencing.md", "Defers production deployment and release behavior.", "roadmap"],
    ],
    preconditions: ["Deployment maturity requires runtime readiness, strict CI/baselines, rollback, operator docs, license/security policy, and release governance."],
    blockers: [["No packaging, deployment, security policy, release gate, or production runtime maturity exists.", "critical"]],
    nextSteps: ["Keep deployment readiness deferred until prerequisites mature."],
    assumptions: ["Readiness metadata does not deploy, package, tag, release, or publish anything."],
    exclusions: commonExclusions,
  }),
];

const cloneLane = (model: ReadinessLaneModel): ReadinessLaneModel => ({
  ...model,
  evidenceReferences: model.evidenceReferences.map((item) => ({ ...item })),
  preconditions: model.preconditions.map((item) => ({ ...item })),
  blockers: model.blockers.map((item) => ({ ...item })),
  nextSteps: model.nextSteps.map((item) => ({ ...item })),
  assumptions: model.assumptions.slice(),
  exclusions: model.exclusions.slice(),
  boundaries: { ...model.boundaries },
});

export const listReadinessTemplates = (): ReadinessLaneModel[] =>
  readinessTemplates.map(cloneLane);
