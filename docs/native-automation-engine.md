# Native Automation Engine

Phase: 63I
Status: specification only

## Purpose

This document is a specification only.

It defines the future native ORQUESTADOR-PRIME automation engine: an internal,
n8n-like workflow layer intended to eventually reduce dependency on n8n for
some workflows.

This phase does not implement workflow execution, scheduler behavior, webhooks,
connectors, credential handling, or a runtime server.

The future engine must be:

- default-deny,
- dry-run-first,
- auditable,
- permission-gated,
- approval-aware,
- redacted by default,
- safe for future production runtime work.

## Current State

Current foundations:

- `runtime:doctor` exists and is read-only.
- Isolated lock primitives exist, but they are not integrated with stores,
  migrations, jobs, or workflows.
- A dry-run migration planner exists.
- Tool registry and permission foundations exist.
- Action and proposal safety surfaces exist.
- Local jobs and notifications exist.
- External channel surfaces exist for current bridges.

No native automation engine exists yet. There is no workflow execution, no
workflow schema code, no validator, no scheduler, no webhook runtime, no
connector runtime, and no credential engine.

## Implementation Status

Workflow graph schema/types and a pure source-level validator now exist under
`src/automation`.

The validator is validation-only. It has no CLI, runs no workflow nodes, creates
no schedules or webhooks, loads no connectors or credentials, mutates no stores,
creates no locks, and performs no provider or network behavior.

The next future phase may plan either an automation validation CLI or the first
dry-run graph core. Workflow execution, scheduler/webhook behavior, connectors,
credentials, runtime server integration, and dashboard controls remain future
work.

## Design Principles

Future automation must follow these principles:

- Default-deny for all workflow and node behavior.
- Dry-run-first before any activation path.
- No external effects by default.
- No raw credentials in workflow definitions.
- No secrets in logs or artifacts.
- Permission checks before any future execution.
- Approval gates for sensitive or high-risk nodes.
- Second approval for dangerous actions.
- Auditable by default.
- Redacted traces.
- Sandboxed future execution.
- Explicit human review before activation.

## Workflow Graph Model

Future workflow fields:

- `workflowId`,
- `version`,
- `name`,
- `description`,
- `triggers`,
- `nodes`,
- `edges`,
- `variables`,
- `permissions`,
- `approvalPolicy`,
- `retryPolicy`,
- `timeoutPolicy`,
- `redactionPolicy`,
- `auditPolicy`,
- `dryRunOnly`.

Future node fields:

- `nodeId`,
- `type`,
- `category`,
- `inputSchema`,
- `outputSchema`,
- `riskLevel`,
- `requiredPermissions`,
- `dryRunBehavior`,
- `executionBehavior` for future phases only,
- `redactionRules`.

## Trigger Model

Future trigger types:

- manual,
- schedule,
- webhook,
- event,
- inbox or notification,
- channel message,
- file or store change in a future phase only,
- external connector event in a future phase only.

The first future implementation should support manual validation and dry-run
only. Schedule, webhook, and connector triggers remain future work.

## Node / Action Model

Future node categories:

- transform,
- condition,
- approval request,
- notification,
- connector call in a future phase,
- action proposal,
- wait or timer,
- human input,
- data read,
- data write in a future gated phase,
- branch or merge,
- loop,
- error handler.

Forbidden by default:

- external network,
- raw credentials,
- real action dispatch,
- store mutation,
- file writes,
- shell execution,
- deploy,
- provider calls.

## Permission And Approval Model

Future automation must support:

- workflow-level permissions,
- node-level permissions,
- channel identity permissions,
- project-scoped permissions,
- approval requirements,
- second approval requirements,
- default-deny decisions,
- risk-level escalation,
- forbidden categories.

No dangerous action should be possible without explicit permission plus human
approval.

## Credentials / Secrets Policy

Credential policy:

- Workflow JSON must not contain credentials.
- Workflows may reference credentials only by opaque IDs.
- Future vault integration is required before connector execution.
- Secrets must not appear in logs.
- Secrets must not appear in artifacts.
- Secrets must not be committed to Git.
- Secrets must not appear in dry-run traces.
- Credential access requires permission checks.
- Provider keys are never exposed.

## Dry-Run And Simulation Model

Future dry-run modes:

- validation-only,
- simulated outputs,
- proposed actions only,
- no external effects,
- no network,
- no store mutation except isolated test fixtures,
- dry-run trace,
- risk report,
- approval preview,
- rollback preview in a future phase.

Dry-runs must never activate workflows.

## Execution Lifecycle

Future lifecycle states:

- draft,
- validated,
- dry_run_ready,
- approval_required,
- approved,
- scheduled,
- running,
- paused,
- failed,
- completed,
- cancelled,
- archived.

This lifecycle is not implemented in this phase.

## Audit / Logging / Trace Model

Future audit and trace records should include:

- `workflowRunId`,
- `nodeRunId`,
- `traceId`,
- timestamps,
- statuses,
- redacted inputs and outputs,
- permission decisions,
- approval decisions,
- errors,
- retries,
- cancellation reason.

Trace payloads must remain bounded and safe to paste.

## Scheduler / Retry / Cancel Design

Future scheduler support needs:

- schedule expression,
- max retries,
- backoff,
- timeout,
- cancellation,
- idempotency key,
- lock requirements,
- duplicate execution prevention.

Scheduler work should wait until runtime, locks, and jobs are mature.

## Integration With Existing Systems

Future relationships:

- Tool Registry: node capability metadata.
- Permission Checker: default-deny workflow and node decisions.
- Action Proposals: proposed actions only at first.
- Jobs Queue: future durable workflow runs.
- Notification Inbox: human and operator prompts.
- Runtime Locks: future duplicate-execution prevention.
- Migration Planner: store readiness signal.
- Runtime Doctor: environment readiness signal.
- Channels: channel identities and operator inputs.
- Quality/Risk system: advisory workflow risk reports.
- Dashboard/Control Center: future visibility and operator controls.

## n8n Migration / Import Strategy

Future import strategy:

- Map n8n nodes to ORQUESTADOR nodes.
- Unsupported nodes become manual placeholders.
- Credentials are never imported raw.
- Webhooks are disabled by default.
- Imported workflows start as `dryRunOnly`.
- Risk review is required.
- Human approval is required before activation.

## Future Implementation Grouping

Recommended grouping:

1. 63I: docs/spec only.
2. 64B: workflow graph schema plan.
3. 64I: schema/types plus validator, no execution.
4. 65B: dry-run graph core plan.
5. 65I: dry-run graph core implementation.
6. Later: scheduler, webhooks, connectors, credentials, dashboard.

## Verification And Smoke Standards For Future Work

Future implementation phases should include:

- direct typecheck,
- runtime doctor or compiled fallback,
- migration planner or compiled fallback,
- quality gate or compiled fallback,
- artifact dry-run or compiled fallback,
- Git diff check,
- isolated `HOME`,
- no provider, network, or action behavior,
- no workflow activation.

## Risks And Mitigations

| Risk | Mitigation |
|---|---|
| Recreating n8n unsafely | Start with docs, schema, validation, and dry-run only. |
| Credential leakage | Use opaque credential references and future vault integration. |
| Accidental external effects | Keep connectors, webhooks, and network behavior disabled by default. |
| Workflow loops | Require loop limits, timeout policy, and cancellation support before execution. |
| Runaway schedules | Defer scheduler work until runtime locks and jobs are mature. |
| Permission bypass | Check workflow and node permissions before any future effect. |
| Confusing proposed actions with executed actions | Keep proposals and execution as separate lifecycle concepts. |
| Unsafe n8n imports | Import as dry-run-only and require risk review plus human approval. |
| Overbuilding before runtime foundation is mature | Keep this phase spec-only and require later schema and dry-run phases before execution. |
