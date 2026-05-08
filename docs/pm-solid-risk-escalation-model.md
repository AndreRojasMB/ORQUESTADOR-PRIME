# PM/SOLID Risk Escalation Model

Phase: 120B - PM + SOLID INTEGRATION REVIEW PLAN

Status: planning / metadata model / docs-only

## Purpose

The PM/SOLID risk escalation model defines how architecture findings may become
PM risk or blocker metadata in a future source-only integration hook.

The model does not create live risks, approve changes, dispatch work, mutate
dashboards, persist memory, or execute remediation.

## Source Metadata

Future escalation may accept caller-provided references to:

- SOLID findings,
- module boundary findings,
- dependency inversion findings,
- architecture smell findings,
- review checklist findings,
- SOLID validator reports,
- frontend responsibility findings,
- backend layering findings,
- architecture report envelopes.

These references are metadata only. They are not gathered by scanning source
trees or parsing modules.

## Target PM Metadata

Escalation may produce:

- PM risk entry candidates,
- PM blocker candidates,
- approval readiness context,
- next-best-action recommendations,
- PM status report sections,
- phase closeout evidence,
- Autopilot context.

The output remains advisory and caller-controlled.

## Escalation Record

Recommended future type: `PmSolidRiskEscalation`.

Fields:

- `sourceFindingRef`: architecture finding id or stable reference.
- `sourceReportRef`: architecture report or envelope reference.
- `targetPmRiskRef`: PM risk candidate reference.
- `severity`: finding severity.
- `riskLevel`: PM risk tier.
- `blockerCandidate`: whether the record should be reviewed as a blocker.
- `approvalRequirement`: approval context for human review.
- `suggestedMitigation`: safe mitigation text.
- `evidenceRefs`: caller-provided evidence references.
- `nextActionRecommendation`: advisory next-best-action context.
- `humanReviewRequired`: whether human judgment is required before continuing.

## Severity And Risk Mapping

Recommended mapping:

- `info`: retain as PM report context.
- `low`: retain as PM risk observation.
- `medium`: create a PM risk candidate.
- `high`: create a PM risk candidate and approval readiness context.
- `critical`: create a blocker candidate and require human review.

The mapping is advisory and should be overridable by caller-supplied PM policy
metadata.

## Decision Rules

Recommended future rules:

- Critical findings become blocker candidates.
- Approval bypass risk should require human review.
- Validator `failed` and `blocked` reports become blocker candidates.
- Validator `insufficient_evidence` reports request more evidence, not
  execution.
- Dashboard, provider, database, runtime, CI, and release concerns remain
  future-gated unless a later phase explicitly authorizes them.
- A controlled Autopilot dry-run pilot requires a separate phase after 120I
  closes cleanly.

## Evidence Rules

Escalation should preserve:

- original source finding reference,
- original report envelope reference,
- evidence references supplied by the caller,
- limitation notes,
- uncertainty notes,
- recommended human review reason.

The hook should not attempt to collect evidence on its own.

## Non-Goals

This model does not:

- mutate PM state,
- persist risk records,
- create approval records,
- start handoff,
- start validation,
- write memory,
- call providers,
- mutate dashboard state,
- touch database or SQL state,
- activate CI,
- emit SARIF files,
- read source trees,
- parse syntax trees,
- collect imports,
- execute refactors,
- commit or push.
