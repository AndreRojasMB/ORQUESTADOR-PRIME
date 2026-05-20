# Controlled Automation Decision

Phase: 146I - CONTROLLED AUTOMATION DECISION IMPLEMENTATION

Status: source-only / advisory-only / metadata-only

## Purpose

Phase 146I adds passive decision metadata for deciding whether the loop should:

- remain manual with the static dashboard
- improve dashboard interaction and UX
- harden report return
- defer assisted behavior until a real mini test
- later consider the controlled OpenClaw bridge path

This layer does not add runtime behavior. It does not invoke Codex, operate
OpenClaw, move prompt text, call providers, mutate dashboards, access DB/SQL,
persist memory, or change package/workflow surfaces.

## Option Model

`ControlledAutomationOption` records:

- `optionId`
- `optionName`
- `description`
- `benefit`
- `risk`
- `requiredReadiness`
- `requiredApproval`
- `implementationCost`
- `safetyLevel`
- `recommendation`

Required options:

- `manual_dashboard_only`
- `dashboard_interaction_hardening`
- `controlled_openclaw_paste_future`
- `controlled_report_return_future`
- `defer_until_real_test`

## Readiness Criteria

`ControlledAutomationReadinessCriteria` records:

- `dashboardClarity`
- `userFrictionLevel`
- `copyPastePainLevel`
- `approvalAuditReadiness`
- `abortRollbackReadiness`
- `reportValidationReliability`
- `dirtyFileSafety`
- `operatorConfidence`
- `safetyRisk`
- `evidenceRefs`
- `limitations`

Signals are advisory values: `strong`, `acceptable`, `weak`, or `high`.
Safety risk uses `low`, `medium`, `high`, or `critical`.

## Decision Input

`ControlledAutomationDecisionInput` records:

- `decisionId`
- `sourceDashboardRef`
- `sourceLoopUxRef`
- `sourceApprovalAuditRef`
- `sourceOpenClawBridgeRef`
- `sourceReportReturnRef`
- `realMiniTestCompleted`
- `realMiniTestEvidenceRefs`
- `readinessCriteria`
- `riskLevel`
- `requiredApprovals`
- `limitations`
- `options`

Inputs are caller-supplied metadata. They do not inspect live sessions or
perform external work.

## Outcome Model

`ControlledAutomationDecisionOutcome` records:

- `outcomeId`
- `selectedOption`
- `rejectedOptions`
- `decisionReason`
- `safeToAutomate`
- `requiresMiniTestFirst`
- `recommendedNextPhase`
- `requiredApprovals`
- `blockers`
- `warnings`
- `limitations`

`safeToAutomate` can only become true when a real mini test is complete and all
required safety criteria are strong. Even then, it only means a future assisted
path may be planned in a separate approved phase.

## Decision Rules

Rules:

- high safety risk keeps the loop manual
- missing real mini test selects `defer_until_real_test`
- weak dashboard clarity selects `dashboard_interaction_hardening`
- weak report validation selects `controlled_report_return_future`
- high manual transfer pain plus strong approval/audit and rollback readiness
  selects `controlled_openclaw_paste_future`
- good dashboard clarity plus low or acceptable manual transfer pain selects
  `manual_dashboard_only`

The OpenClaw path remains future-gated. This phase does not activate it.

## Helpers

Implemented helpers:

- `createControlledAutomationOption(...)`
- `createControlledAutomationDecisionInput(...)`
- `createControlledAutomationDecision(...)`
- `evaluateControlledAutomationDecision(...)`
- `summarizeControlledAutomationDecision(...)`
- `selectAutomationOptionsBySafetyLevel(...)`
- `selectRejectedAutomationOptions(...)`

All helpers are pure metadata functions.

## Fixtures

Implemented fixtures:

- defer until mini test
- manual dashboard only
- dashboard interaction hardening
- OpenClaw future candidate
- report return hardening
- high safety risk manual/blocking fixture

## Integration

Controlled Automation Decision consumes:

- Loop Dashboard Static UI for dashboard clarity and operator review state.
- Loop UX Hardening for friction categories and stop conditions.
- Approval / Audit Hardening for protected action evidence.
- Controlled OpenClaw Paste Bridge for future bridge posture.
- Controlled Codex Report Return for validation and closeout reliability.
- Manual Codex Handoff Trial for manual transfer and report evidence.

## Safety Boundaries

- source-only
- metadata-only
- advisory-only
- no Codex invocation
- no OpenClaw operation
- no system copy-buffer automation
- no prompt transfer automation
- no provider calls
- no network/API calls
- no project file writes from source
- no dashboard mutation
- no DB/SQL mutation
- no package/workflow changes
- no memory persistence
- no source-control behavior from source

## Limitations

- Decision signals are caller-supplied metadata.
- No real mini test is performed by this layer.
- No dashboard interaction is changed.
- No live OpenClaw, Codex, provider, DB, or dashboard surface is touched.
- OpenClaw remains a future candidate only.

## Next Recommended Phase

Phase 147B - REAL MINI TEST EXECUTION PLAN.
