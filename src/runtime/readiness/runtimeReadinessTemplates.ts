import type {
  RuntimeReadinessBlocker,
  RuntimeReadinessBoundarySet,
  RuntimeReadinessCategory,
  RuntimeReadinessCheck,
  RuntimeReadinessCheckId,
  RuntimeReadinessEvidenceReference,
  RuntimeReadinessEvidenceReferenceType,
  RuntimeReadinessLevel,
  RuntimeReadinessPrecondition,
  RuntimeReadinessRecommendation,
  RuntimeReadinessRiskTier,
} from "./types.js";

export const supportedRuntimeReadinessCheckIds = [
  "runtime_api_server_readiness",
  "worker_readiness",
  "queue_readiness",
  "scheduler_readiness",
  "store_adapter_readiness",
  "sqlite_postgres_strategy_readiness",
  "migration_apply_readiness",
  "backup_restore_readiness",
  "repair_mode_readiness",
  "auth_rate_limit_readiness",
  "observability_readiness",
  "retention_forget_readiness",
  "approval_action_safety_integration_readiness",
  "automation_runtime_dependency_readiness",
  "dashboard_control_center_runtime_visibility_readiness",
  "deployment_productization_readiness",
] as const satisfies readonly RuntimeReadinessCheckId[];

export const supportedRuntimeReadinessCategories = [
  "api_server",
  "workers",
  "queues",
  "schedulers",
  "stores",
  "database",
  "migrations",
  "backups",
  "repairs",
  "auth",
  "observability",
  "retention",
  "actions",
  "automation",
  "dashboard",
  "deployment",
] as const satisfies readonly RuntimeReadinessCategory[];

export const supportedRuntimeReadinessLevels = [
  "not_implemented",
  "docs_only_spec",
  "source_only_advisory",
  "local_read_only_diagnostic",
  "local_dry_run_planning",
  "live_adjacent_guarded",
  "deferred_until_prerequisites",
  "future_gated_execution",
] as const satisfies readonly RuntimeReadinessLevel[];

export const supportedRuntimeReadinessRiskTiers = [
  "low",
  "medium",
  "high",
  "critical",
] as const satisfies readonly RuntimeReadinessRiskTier[];

export const runtimeReadinessBoundaries: RuntimeReadinessBoundarySet = {
  advisoryOnly: true,
  sourceOnly: true,
  noProviderCalls: true,
  noNetwork: true,
  noFilesystemReads: true,
  noFilesystemWrites: true,
  noRepositoryScanning: true,
  noCommandExecution: true,
  noRuntimeExecution: true,
  noServerApiImplementation: true,
  noWorkerImplementation: true,
  noQueueImplementation: true,
  noSchedulerImplementation: true,
  noDbAdapterImplementation: true,
  noMigrationApply: true,
  noBackupRestoreExecution: true,
  noRepairExecution: true,
  noAuthRateLimitImplementation: true,
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

type CheckConfig = {
  checkId: RuntimeReadinessCheckId;
  category: RuntimeReadinessCategory;
  name: string;
  summary: string;
  readinessLevel: RuntimeReadinessLevel;
  riskTier: RuntimeReadinessRiskTier;
  currentStatus: string;
  evidence: Array<[string, string, string, RuntimeReadinessEvidenceReferenceType]>;
  preconditions: string[];
  blockers: Array<[string, RuntimeReadinessRiskTier]>;
  recommendations: string[];
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
  checkId: RuntimeReadinessCheckId,
  entries: CheckConfig["evidence"],
): RuntimeReadinessEvidenceReference[] =>
  entries.map(([label, reference, safeSummary, referenceType], index) => ({
    evidenceId: `${checkId}:evidence:${index + 1}:${idPart(label)}`,
    label,
    reference,
    referenceType,
    safeSummary,
    metadataOnly: true,
    noFileRead: true,
  }));

const preconditions = (
  checkId: RuntimeReadinessCheckId,
  entries: string[],
): RuntimeReadinessPrecondition[] =>
  entries.map((safeSummary, index) => ({
    preconditionId: `${checkId}:precondition:${index + 1}`,
    title: `Precondition ${index + 1}`,
    safeSummary,
    requiredBefore: "Any future runtime maturity advancement for this check.",
    metadataOnly: true,
  }));

const blockers = (
  checkId: RuntimeReadinessCheckId,
  entries: CheckConfig["blockers"],
): RuntimeReadinessBlocker[] =>
  entries.map(([safeSummary, severity], index) => ({
    blockerId: `${checkId}:blocker:${index + 1}`,
    title: `Blocker ${index + 1}`,
    safeSummary,
    severity,
    metadataOnly: true,
  }));

const recommendations = (
  checkId: RuntimeReadinessCheckId,
  entries: string[],
): RuntimeReadinessRecommendation[] =>
  entries.map((safeSummary, index) => ({
    recommendationId: `${checkId}:recommendation:${index + 1}`,
    title: `Recommended next step ${index + 1}`,
    safeSummary,
    priority: index === 0 ? "high" : "medium",
    recommendationOnly: true,
    noExecution: true,
  }));

const check = (config: CheckConfig): RuntimeReadinessCheck => ({
  checkId: config.checkId,
  schemaVersion: "1.0",
  category: config.category,
  name: config.name,
  summary: config.summary,
  readinessLevel: config.readinessLevel,
  riskTier: config.riskTier,
  currentStatus: config.currentStatus,
  evidenceReferences: evidence(config.checkId, config.evidence),
  preconditions: preconditions(config.checkId, config.preconditions),
  blockers: blockers(config.checkId, config.blockers),
  recommendations: recommendations(config.checkId, config.recommendations),
  assumptions: config.assumptions,
  exclusions: config.exclusions,
  advisoryOnly: true,
  boundaries: runtimeReadinessBoundaries,
});

const commonAssumptions = [
  "Runtime readiness is curated advisory metadata, not a live runtime probe.",
  "Evidence references are metadata strings only and are not read by this source module.",
];

const commonExclusions = [
  "No runtime, server, worker, queue, scheduler, database, migration, backup, repair, auth, dashboard, automation, connector, action, job, CI, package, release, or deployment behavior is enabled.",
  "Recommendations are metadata only and do not execute work.",
];

const runtimeReadinessTemplates: RuntimeReadinessCheck[] = [
  check({
    checkId: "runtime_api_server_readiness",
    category: "api_server",
    name: "Runtime API / Server Readiness",
    summary: "Runtime API and server readiness remains a documented future surface only.",
    readinessLevel: "docs_only_spec",
    riskTier: "high",
    currentStatus: "No production API or runtime server exists.",
    evidence: [
      ["Production runtime deeper", "docs/production-runtime-deeper.md", "Documents future runtime API strategy and boundaries.", "doc"],
      ["Production runtime roadmap", "docs/production-runtime.md", "Documents earlier runtime roadmap and non-goals.", "doc"],
    ],
    preconditions: [
      "Define auth, API policy, server boundary, operator controls, audit, and rate-limit strategy before any server work.",
    ],
    blockers: [
      ["No approved auth model, API route policy, server boundary, or operator control contract exists.", "high"],
    ],
    recommendations: [
      "Keep runtime API/server readiness as advisory metadata until read-only status surfaces and auth boundaries are separately approved.",
    ],
    assumptions: commonAssumptions,
    exclusions: commonExclusions,
  }),
  check({
    checkId: "worker_readiness",
    category: "workers",
    name: "Worker Readiness",
    summary: "Worker readiness is planned but no durable worker daemon exists.",
    readinessLevel: "docs_only_spec",
    riskTier: "high",
    currentStatus: "No daemon exists.",
    evidence: [
      ["Worker model", "docs/production-runtime-deeper.md#e-worker-model", "Documents future worker lifecycle states.", "doc"],
    ],
    preconditions: [
      "Define lifecycle, locks, queue backend, health checks, stop controls, idempotency, and audit before worker implementation.",
    ],
    blockers: [
      ["No worker lifecycle implementation, queue backend, stop control, or health contract exists.", "high"],
    ],
    recommendations: [
      "Model worker readiness as deferred until queue, lock, and operator-control prerequisites are proven.",
    ],
    assumptions: commonAssumptions,
    exclusions: commonExclusions,
  }),
  check({
    checkId: "queue_readiness",
    category: "queues",
    name: "Queue Readiness",
    summary: "Local job helpers exist, but they are not a durable runtime queue backend.",
    readinessLevel: "live_adjacent_guarded",
    riskTier: "high",
    currentStatus: "Local job helpers exist but no queue backend is approved.",
    evidence: [
      ["Task queue notifications", "docs/task-queue-notifications.md", "Documents jobs and notifications safety posture.", "doc"],
      ["Jobs source surface", "src/jobs/*", "Local job helpers are live-adjacent and must not be imported by this module.", "source"],
    ],
    preconditions: [
      "Define persistence, retry, dead-letter, idempotency, locks, operator controls, and audit policy before queue maturity advances.",
    ],
    blockers: [
      ["Current job helpers can mutate local job state and are not a backend queue boundary.", "high"],
    ],
    recommendations: [
      "Keep queue readiness separate from job helper execution and classify it as live-adjacent guarded.",
    ],
    assumptions: commonAssumptions,
    exclusions: commonExclusions,
  }),
  check({
    checkId: "scheduler_readiness",
    category: "schedulers",
    name: "Scheduler Readiness",
    summary: "Manual due-job selection exists near the job lane, but no scheduler daemon controls exist.",
    readinessLevel: "live_adjacent_guarded",
    riskTier: "high",
    currentStatus: "Manual due-job runner exists but no daemon controls exist.",
    evidence: [
      ["Scheduler source surface", "src/jobs/scheduler.ts", "Manual due-job helpers are live-adjacent and must not be imported by this module.", "source"],
      ["Scheduler model", "docs/production-runtime-deeper.md#g-scheduler-model", "Documents future scheduler strategy.", "doc"],
    ],
    preconditions: [
      "Define daemon model, stop controls, locks, missed schedule policy, audit, and operator visibility before scheduler work.",
    ],
    blockers: [
      ["No daemon boundary, stop control, lock integration, or operator-visible scheduler lifecycle exists.", "high"],
    ],
    recommendations: [
      "Treat scheduler readiness as deferred and avoid wiring runtime readiness into job running.",
    ],
    assumptions: commonAssumptions,
    exclusions: commonExclusions,
  }),
  check({
    checkId: "store_adapter_readiness",
    category: "stores",
    name: "Store Adapter Readiness",
    summary: "Current stores remain local JSON; adapter contracts are not implemented.",
    readinessLevel: "docs_only_spec",
    riskTier: "high",
    currentStatus: "JSON/local stores remain in use and adapter contract is missing.",
    evidence: [
      ["Runtime foundation storage strategy", "docs/production-runtime-foundation.md#storage-strategy", "Documents future adapter strategy.", "doc"],
      ["Store inventory", "src/health/storeInventory.ts", "Defines store inventory metadata for the read-only doctor.", "source"],
    ],
    preconditions: [
      "Define adapter contract, version policy, migration policy, backup policy, and lock discipline before storage engine changes.",
    ],
    blockers: [
      ["No adapter interface, transaction boundary, backup capability, or migration apply path exists.", "high"],
    ],
    recommendations: [
      "Keep store adapter readiness as metadata until migration and backup prerequisites mature.",
    ],
    assumptions: commonAssumptions,
    exclusions: commonExclusions,
  }),
  check({
    checkId: "sqlite_postgres_strategy_readiness",
    category: "database",
    name: "SQLite / Postgres Strategy Readiness",
    summary: "SQLite and Postgres remain future storage candidates and no database implementation is approved.",
    readinessLevel: "docs_only_spec",
    riskTier: "high",
    currentStatus: "Deferred.",
    evidence: [
      ["SQLite/Postgres strategy", "docs/production-runtime-deeper.md#i-sqlitepostgres-strategy", "Documents candidate storage paths.", "doc"],
    ],
    preconditions: [
      "Define schema governance, migration safety, backup/restore, privacy policy, and deployment target before database work.",
    ],
    blockers: [
      ["No schema governance, migration apply safety, backup/restore policy, or adapter boundary exists.", "high"],
    ],
    recommendations: [
      "Keep database strategy as docs-only readiness until adapter and migration governance are approved.",
    ],
    assumptions: commonAssumptions,
    exclusions: commonExclusions,
  }),
  check({
    checkId: "migration_apply_readiness",
    category: "migrations",
    name: "Migration Apply Readiness",
    summary: "A dry-run migration planner exists, but apply remains deferred.",
    readinessLevel: "local_dry_run_planning",
    riskTier: "high",
    currentStatus: "Dry-run planner only.",
    evidence: [
      ["Store migration lock policy", "docs/store-migration-locks.md", "Documents migration apply prerequisites.", "doc"],
      ["Migration planner source surface", "src/runtime/migrations/*", "Dry-run migration planner exists and must not be imported by this module.", "source"],
    ],
    preconditions: [
      "Implement backup, lock, explicit apply approval, source/target validation, and repair separation before apply is considered.",
    ],
    blockers: [
      ["No backup, lock integration, explicit apply command, repair plan, or rollback path exists.", "high"],
    ],
    recommendations: [
      "Use readiness metadata to keep migration apply visibly deferred while dry-run planning remains separate.",
    ],
    assumptions: commonAssumptions,
    exclusions: commonExclusions,
  }),
  check({
    checkId: "backup_restore_readiness",
    category: "backups",
    name: "Backup / Restore Readiness",
    summary: "Backup and restore execution are not implemented and remain critical-risk future work.",
    readinessLevel: "docs_only_spec",
    riskTier: "critical",
    currentStatus: "Not implemented.",
    evidence: [
      ["Backup/restore strategy", "docs/production-runtime-deeper.md#k-backuprestore-strategy", "Documents future backup and restore requirements.", "doc"],
    ],
    preconditions: [
      "Define backup policy, restore review, lock discipline, audit, privacy handling, and rollback expectations.",
    ],
    blockers: [
      ["No backup command, restore command, lock integration, audit record, or privacy-reviewed backup format exists.", "critical"],
    ],
    recommendations: [
      "Keep backup/restore as critical deferred readiness until a separate safety phase approves implementation.",
    ],
    assumptions: commonAssumptions,
    exclusions: commonExclusions,
  }),
  check({
    checkId: "repair_mode_readiness",
    category: "repairs",
    name: "Repair Mode Readiness",
    summary: "Repair mode is not implemented and requires inspect, diagnose, and repair separation.",
    readinessLevel: "docs_only_spec",
    riskTier: "critical",
    currentStatus: "Not implemented.",
    evidence: [
      ["Repair mode strategy", "docs/production-runtime-deeper.md#l-repair-mode-strategy", "Documents future repair boundaries.", "doc"],
    ],
    preconditions: [
      "Define inspect/diagnose/repair separation, dry-run repair plans, backup, locks, and operator confirmation.",
    ],
    blockers: [
      ["No repair plan format, backup requirement, lock requirement, or apply boundary exists.", "critical"],
    ],
    recommendations: [
      "Keep repair readiness deferred until migration apply and backup governance are mature.",
    ],
    assumptions: commonAssumptions,
    exclusions: commonExclusions,
  }),
  check({
    checkId: "auth_rate_limit_readiness",
    category: "auth",
    name: "Auth / Rate-Limit Readiness",
    summary: "Auth and rate-limit enforcement are strategy-only and not implemented.",
    readinessLevel: "docs_only_spec",
    riskTier: "critical",
    currentStatus: "Not implemented.",
    evidence: [
      ["Auth and rate-limit strategy", "docs/production-runtime-deeper.md#m-auth-and-rate-limit-strategy", "Documents future local admin/operator strategy.", "doc"],
    ],
    preconditions: [
      "Define subject model, opaque token handling, audit, permissions, operator roles, and rate-limit policy before enforcement.",
    ],
    blockers: [
      ["No subject model, token boundary, session model, enforcement layer, or rate-limit implementation exists.", "critical"],
    ],
    recommendations: [
      "Keep auth/rate-limit readiness as critical deferred metadata until runtime API work is separately approved.",
    ],
    assumptions: commonAssumptions,
    exclusions: commonExclusions,
  }),
  check({
    checkId: "observability_readiness",
    category: "observability",
    name: "Observability Readiness",
    summary: "Read-only doctor summaries exist, but structured production runtime observability is not implemented.",
    readinessLevel: "local_read_only_diagnostic",
    riskTier: "medium",
    currentStatus: "Doctor summaries exist, but no structured production runtime logs exist.",
    evidence: [
      ["Config doctor", "docs/config-doctor-health-check.md", "Documents read-only doctor output and boundaries.", "doc"],
      ["Runtime doctor source surface", "src/health/configDoctor.ts", "Read-only doctor source exists and must not be imported by this module.", "source"],
    ],
    preconditions: [
      "Define runtime log strategy, health checks, trace retention, redaction, and operator visibility before production observability claims.",
    ],
    blockers: [
      ["No runtime log contract, worker status stream, queue status stream, or trace retention policy exists.", "medium"],
    ],
    recommendations: [
      "Reference doctor summaries as advisory evidence only and avoid treating them as live runtime monitoring.",
    ],
    assumptions: commonAssumptions,
    exclusions: commonExclusions,
  }),
  check({
    checkId: "retention_forget_readiness",
    category: "retention",
    name: "Retention / Forget Readiness",
    summary: "Retention and forget operations are documented future work and not implemented.",
    readinessLevel: "docs_only_spec",
    riskTier: "high",
    currentStatus: "Not implemented.",
    evidence: [
      ["Retention/forget policy", "docs/production-runtime-deeper.md#o-retentionforget-policy", "Documents future retention and forget strategy.", "doc"],
    ],
    preconditions: [
      "Define privacy policy, project scope, dry-run/apply split, backup recommendation, and audit before retention work.",
    ],
    blockers: [
      ["No retention metadata model, forget dry-run, backup policy, or apply boundary exists.", "high"],
    ],
    recommendations: [
      "Keep retention/forget readiness as docs-only until privacy and backup prerequisites are mature.",
    ],
    assumptions: commonAssumptions,
    exclusions: commonExclusions,
  }),
  check({
    checkId: "approval_action_safety_integration_readiness",
    category: "actions",
    name: "Approval / Action Safety Integration Readiness",
    summary: "Approval and dispatch paths exist, but there is no runtime boundary that can safely own them.",
    readinessLevel: "live_adjacent_guarded",
    riskTier: "critical",
    currentStatus: "Approval/dispatch paths exist but no runtime boundary exists.",
    evidence: [
      ["Channel action safety", "docs/channel-action-safety.md", "Documents action safety and approval boundaries.", "doc"],
      ["Actions source surface", "src/actions/*", "Action surfaces are live-adjacent and must not be imported by this module.", "source"],
    ],
    preconditions: [
      "Define action scope model, approval bridge isolation, second approval policy, audit, locks, and runtime ownership boundary.",
    ],
    blockers: [
      ["Action approval and dispatch paths can mutate local state and are not governed by a runtime server boundary.", "critical"],
    ],
    recommendations: [
      "Keep runtime readiness separated from action execution until approval integration is explicitly designed.",
    ],
    assumptions: commonAssumptions,
    exclusions: commonExclusions,
  }),
  check({
    checkId: "automation_runtime_dependency_readiness",
    category: "automation",
    name: "Automation Runtime Dependency Readiness",
    summary: "Automation remains validation/dry-run only and does not have an execution substrate.",
    readinessLevel: "docs_only_spec",
    riskTier: "high",
    currentStatus: "Automation remains validation and dry-run only.",
    evidence: [
      ["Native automation deeper", "docs/native-automation-engine-deeper.md", "Documents future automation runtime dependency boundaries.", "doc"],
    ],
    preconditions: [
      "Define runtime execution substrate, workflow persistence, approval gates, scheduler integration, and cancellation policy.",
    ],
    blockers: [
      ["No workflow persistence, scheduler runtime, approval-gated execution bridge, or cancellation control exists.", "high"],
    ],
    recommendations: [
      "Keep automation dependency readiness deferred until runtime worker and approval boundaries mature.",
    ],
    assumptions: commonAssumptions,
    exclusions: commonExclusions,
  }),
  check({
    checkId: "dashboard_control_center_runtime_visibility_readiness",
    category: "dashboard",
    name: "Dashboard / Control Center Runtime Visibility Readiness",
    summary: "Runtime visibility through the control center is governed by docs and manifest policy only.",
    readinessLevel: "docs_only_spec",
    riskTier: "high",
    currentStatus: "Manifest policy only; no safe read-only dashboard consumption exists yet.",
    evidence: [
      ["Readonly manifest", "docs/control-center-readonly-manifest.md", "Documents future manifest policy for read-only consumption.", "doc"],
      ["Dashboard safety audit", "docs/dashboard-safety-audit.md", "Documents existing dashboard write-path risk.", "doc"],
    ],
    preconditions: [
      "Isolate dashboard write paths and define auth, redaction, and manifest consumption policy before runtime visibility work.",
    ],
    blockers: [
      ["Dashboard write paths, missing auth, and missing redaction remain blockers.", "high"],
    ],
    recommendations: [
      "Expose runtime readiness only through future read-only manifest entries after dashboard safety prerequisites are met.",
    ],
    assumptions: commonAssumptions,
    exclusions: commonExclusions,
  }),
  check({
    checkId: "deployment_productization_readiness",
    category: "deployment",
    name: "Deployment / Productization Readiness",
    summary: "Deployment and productization depend on runtime maturity and remain deferred.",
    readinessLevel: "docs_only_spec",
    riskTier: "critical",
    currentStatus: "Deferred.",
    evidence: [
      ["Productization release path", "docs/productization-release-path.md", "Documents release and productization prerequisites.", "doc"],
      ["Post-85 roadmap", "docs/post-85-roadmap-sequencing.md", "Sequences runtime and productization work after advisory readiness phases.", "roadmap"],
    ],
    preconditions: [
      "Mature release governance, security policy, runtime readiness, rollback, strict CI, and operator documentation before deployment claims.",
    ],
    blockers: [
      ["No release governance implementation, security policy, packaging path, rollback path, or runtime maturity evidence exists.", "critical"],
    ],
    recommendations: [
      "Keep deployment/productization readiness as critical deferred metadata until runtime, CI, and release governance mature.",
    ],
    assumptions: commonAssumptions,
    exclusions: commonExclusions,
  }),
];

const cloneCheck = (model: RuntimeReadinessCheck): RuntimeReadinessCheck => ({
  ...model,
  evidenceReferences: model.evidenceReferences.map((item) => ({ ...item })),
  preconditions: model.preconditions.map((item) => ({ ...item })),
  blockers: model.blockers.map((item) => ({ ...item })),
  recommendations: model.recommendations.map((item) => ({ ...item })),
  assumptions: model.assumptions.slice(),
  exclusions: model.exclusions.slice(),
  boundaries: { ...model.boundaries },
});

export const listRuntimeReadinessTemplates = (): RuntimeReadinessCheck[] =>
  runtimeReadinessTemplates.map(cloneCheck);
