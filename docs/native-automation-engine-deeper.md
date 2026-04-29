# Native Automation Engine Deeper

Phase: 80I
Status: docs-only deeper automation specification

## A. Purpose

This document is a specification only.

It defines the safe future path from current native automation validation and
dry-run behavior toward later approval-gated runtime execution. It does not
implement automation execution, workflow persistence, scheduler behavior,
trigger behavior, webhook listeners, connector runtime behavior, credential or
vault handling, action/proposal/approval execution, provider calls, network
behavior, runtime server behavior, or production deployment behavior.

It does not implement automation execution.
It does not implement workflow persistence.
It does not enable scheduler/trigger/webhook/connector runtime behavior.
It does not make ORQUESTADOR-PRIME production-ready.

The deeper native automation engine exists to eventually let ORQUESTADOR-PRIME
manage reviewable workflows with durable definitions, versions, triggers,
operator controls, audit logs, retries, cancellation, and safe integration with
future production runtime foundations. Phase 80I only documents that future
architecture.

## B. Current Automation Baseline

Current known state:

- Automation has schema and TypeScript types.
- Automation has Zod validation.
- Automation has dry-run simulation.
- Automation has dry-run trace/reporting helpers.
- Automation validation and dry-run boundaries prohibit node runs, store
  mutation, locks, provider calls, network, action dispatch, proposal creation,
  approval execution, notification delivery, and credential access.
- Jobs and actions surfaces exist, but they are not part of Phase 80I.
- Native automation remains validation, dry-run, and trace only.

These foundations are useful for review, but they are not an automation
execution runtime.

## C. Automation Readiness Gaps

Current gaps:

- no workflow persistence,
- no workflow version store,
- no execution runtime,
- no scheduler runtime,
- no webhook listener,
- no connector runtime,
- no credential or vault implementation,
- no approval-gated execution bridge,
- no n8n importer,
- no operator dashboard or control center.

## D. Workflow Persistence Strategy

Future persisted workflow definitions should be draft and disabled by default.

Persistence should store only bounded, redacted metadata and workflow graph JSON
that passes validation. It should avoid raw request bodies, raw provider output,
raw credentials, secrets, tokens, webhook secrets, and unbounded payloads.

Workflow persistence requires these prerequisites first:

- store adapter strategy,
- lock policy,
- workflow versioning,
- backup policy,
- retention policy,
- read/status observability,
- operator review path.

Phase 80I adds no workflow persistence implementation.

## E. Workflow Versioning Strategy

Future workflow versioning should use immutable versions. A version may become
an explicit activation candidate only after validation, dry-run, trace review,
risk review, permission review, and approval preview.

Version metadata should include diff/review notes, risk notes, compatibility
notes, and rollback notes as plans only.

Saving a version must not automatically activate a workflow.

## F. Scheduler Strategy

The first future scheduler should be operator-controlled. It should not begin
as a background daemon.

Scheduler work should wait for runtime maturity, locks, queue readiness, health
checks, stop controls, duplicate prevention, and operator visibility.

Phase 80I adds no scheduler implementation.

## G. Trigger Strategy

Manual validation and dry-run remain the current active path.

Future trigger categories can include:

- schedule,
- webhook,
- event,
- inbox notification,
- channel message,
- file or store change in a later approved phase,
- connector event in a later approved phase.

All non-manual triggers remain future-only. Phase 80I adds no trigger
implementation.

## H. Webhook Strategy

Phase 80I adds no webhook listener.

Future webhooks require:

- authentication,
- replay protection,
- payload redaction,
- rate limits,
- default-deny activation,
- bounded request summaries,
- operator visibility,
- audit records,
- safe failure modes.

This document does not authorize network, server, listener, or webhook runtime
behavior.

## I. Connector Strategy

Connector definitions should start as metadata only.

Real connector calls require:

- credential or vault strategy,
- permission checks,
- rate limits,
- audit records,
- retry policy,
- timeout policy,
- sandbox review,
- connector-specific dry-run behavior,
- explicit approval gates for sensitive operations.

Phase 80I adds no connector implementation.

## J. Credentials/Vault Strategy

Workflows must never contain raw secrets.

Future workflows should reference credentials only through opaque IDs or
bounded metadata. Workflow definitions, dry-run traces, audit logs, docs, and
artifacts must not include secret examples, tokens, provider keys, webhook
secrets, raw credentials, raw authorization headers, or sample private values.

Phase 80I adds no vault implementation and no secrets handling implementation.

## K. Approval-Gated Execution Strategy

Dry-run and approval preview must precede any future execution.

High and critical risk workflow behavior requires human approval. Critical or
mutating categories require stronger review, and may require second approval,
operator confirmation, lock checks, and runtime readiness checks.

Proposal/action execution remains separate from workflow planning and dry-run
preview. Native automation must not directly dispatch actions or execute
approvals.

Phase 80I adds no approval execution.

## L. Retry Strategy

Future retries should be allowed only for idempotent, bounded, safe future
nodes.

Retry limits and backoff must be explicit. Permission-denied, approval-denied,
blocked, expired, non-idempotent, and unsafe operations should not retry
automatically.

Phase 80I adds no retry execution behavior.

## M. Cancellation Strategy

Cancellation must be explicit and auditable.

Future cancellation behavior should avoid partial unsafe state, preserve audit
history, record a redacted cancellation reason, and make operator status clear.

Phase 80I adds no cancellation implementation.

## N. Rollback/Compensation Strategy

Rollback and compensation begin as metadata and planning only.

Future workflow definitions may describe rollback or compensation notes, but
those notes must not execute rollback, mutate stores, dispatch actions, run
transactions, call connectors, apply migrations, or alter external systems.

Phase 80I adds no rollback execution, store mutation, or transaction behavior.

## O. Audit Log Strategy

Future audit records should include:

- workflow id,
- workflow version,
- run id,
- node id where applicable,
- redacted input and output summaries,
- permission decisions,
- approval decisions,
- trigger metadata,
- retry events,
- cancellation reason,
- errors,
- operator decisions.

Audit records must remain bounded and safe to paste. Phase 80I adds no audit
store.

## P. n8n Import/Migration Strategy

Future n8n import should be dry-run-only at first.

Import rules:

- map supported n8n nodes to ORQUESTADOR node candidates,
- convert unsupported nodes to manual placeholders,
- disable webhooks by default,
- never import raw credentials,
- never activate imported workflows automatically,
- require risk review,
- require human review before any activation candidate.

Phase 80I adds no parser, importer, or n8n import execution.

## Q. Dry-Run To Execution Transition Path

Future transition path:

1. validate,
2. dry-run,
3. trace,
4. risk review,
5. permission review,
6. approval preview,
7. explicit activation candidate,
8. later runtime execution phase.

Execution is not part of Phase 80I.

## R. Operator Controls

Future operator controls can include:

- pause workflow,
- disable trigger,
- block connector,
- inspect run plan,
- cancel run,
- review approvals,
- inspect audit trail.

Phase 80I does not implement a dashboard, control center, API, CLI, or runtime
command.

## S. Automation Maturity Stages

Future maturity should advance in stages:

1. Validation-only automation: schema and validation without execution.
2. Dry-run automation: graph preview, risk summaries, permission preview, and
   approval preview.
3. Stored workflow definitions: disabled drafts with immutable versions.
4. Operator-approved workflows: activation candidates after review.
5. Scheduled workflows: operator-controlled scheduling after runtime maturity.
6. Webhook-triggered workflows: authenticated and rate-limited webhooks after
   runtime maturity.
7. Connector-enabled workflows: credential-gated integrations after vault and
   permission controls.
8. Credential-protected workflows: opaque credential references only.
9. Retry/cancel/rollback future: explicit strategy before behavior.
10. n8n import future: dry-run-only imports before activation candidates.
11. Enterprise auditability future: redacted traces and operator-visible
    decisions.

## T. Integration Plan

Future automation-deeper work should align with:

- Production Runtime Deeper: execution depends on runtime maturity.
- Jobs/notifications: future run lifecycle and human prompts must not bypass
  safe job rules.
- Action/proposal/approval system: mutation remains separate and approval-gated.
- Store migrations/locks: workflow stores and duplicate prevention require
  lock and backup policy.
- Runtime doctor: readiness checks only; no execution.
- Workspace manager: workflow context should be project-scoped.
- Dashboard/control center: future visibility and operator controls only.
- Business Process Modeling: process models can suggest workflow candidates as
  metadata only.
- Transactional Systems Layer: transaction notes can inform idempotency,
  compensation, and reconciliation planning.
- Enterprise UI Patterns: future workflow queues and approval inboxes remain UI
  metadata until implemented separately.
- Connectors/credentials: future integrations require vault, permission, audit,
  and rate-limit controls.
- Deployment/productization: requires separate runtime and security review.

## U. Safety Boundaries / Non-Goals

Phase 80I has these non-goals:

- no provider calls,
- no network,
- no command execution,
- no filesystem mutation,
- no store mutation,
- no automation execution,
- no workflow persistence implementation,
- no scheduler, trigger, or webhook implementation,
- no connector implementation,
- no credentials or vault implementation,
- no action, proposal, or approval execution,
- no runtime server or API implementation,
- no worker or queue implementation,
- no DB adapter, schema, or migration implementation,
- no n8n import execution,
- no secrets handling implementation,
- no package, workflow, or CI changes,
- no generated systems,
- no production-ready claims,
- no security or compliance guarantees.

## V. Future Source Candidates

Future source-only planning metadata may eventually live in:

- `src/automation/runtimePlanning/types.ts`
- `src/automation/runtimePlanning/automationRuntimePlanTemplates.ts`
- `src/automation/runtimePlanning/automationRuntimePlanValidator.ts`
- `src/automation/runtimePlanning/automationRuntimePlanBuilder.ts`

These files are future candidates only. They are not implemented in Phase 80I.

Future type candidates:

- `AutomationRuntimeSchemaVersion`
- `AutomationCapability`
- `AutomationBoundarySet`
- `WorkflowPersistencePlan`
- `WorkflowVersioningPlan`
- `AutomationSchedulerPlan`
- `AutomationTriggerPlan`
- `AutomationWebhookPlan`
- `AutomationConnectorPlan`
- `AutomationCredentialVaultPlan`
- `AutomationApprovalGatePlan`
- `AutomationRetryPolicyPlan`
- `AutomationCancellationPlan`
- `AutomationRollbackPlan`
- `AutomationAuditLogPlan`
- `N8nImportPlan`
- `AutomationOperatorControl`
- `AutomationRuntimeRisk`
- `AutomationMaturityPlan`
- `AutomationValidationFinding`
- `AutomationValidationResult`

## W. Future Validation Strategy

Future source metadata should validate:

- required automation planning fields,
- bounded arrays and text,
- `advisoryOnly` is true,
- all safety boundaries are true,
- persistence entries are plans only, not writes,
- scheduler, trigger, and webhook entries are plans only, not listeners or
  loops,
- connector and credential entries are strategy metadata only,
- approval gate entries are plans only, not approval execution,
- retry, cancel, and rollback entries are strategy only,
- n8n import entries are strategy only, not parser or importer behavior,
- no provider, network, filesystem, action, store, runtime, or automation
  execution behavior,
- no secret examples, tokens, provider keys, raw credentials, or real webhook
  secrets,
- no production, security, or compliance guarantees.

## Dashboard / Control Center Relationship

The future Dashboard / Control Center path is documented in
[Dashboard / Control Center](dashboard-control-center.md). A later control
center may display automation validation, dry-run, trace, and risk summaries,
but it must not enable automation execution, workflow persistence, scheduler or
trigger behavior, webhook listeners, connector calls, credential access, or
approval/action execution. Phase 81I is docs-only.

## Integrations / Connectors Relationship

The future connector governance path is documented in
[Integrations / Connectors](integrations-connectors.md). Future automation
connector nodes depend on connector governance, credential strategy, dry-run
contracts, audit policy, rate limits, and approval gates. Phase 84I is
docs-only and does not enable connector execution.

## Productization / Release Path

The future productization path is documented in
[Productization / Release Path](productization-release-path.md). Automation
execution cannot be productized until approval-gated runtime maturity,
operator controls, audit policy, rollback strategy, and release governance
exist. Phase 85I adds no automation execution, package, tag, release, or
deployment behavior.

## Post-85 Roadmap Sequencing

Future automation work should follow
[Post-85 Roadmap Sequencing](post-85-roadmap-sequencing.md). Automation
execution remains deferred until runtime maturity, approval gates, connector
governance, audit, cancellation, rollback, and operator controls are ready.
