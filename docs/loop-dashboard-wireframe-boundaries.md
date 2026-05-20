# Loop Dashboard Wireframe Boundaries

Phase: 144B - LOOP DASHBOARD WIREFRAME PLAN

Status: docs-only / advisory-only / boundary model

## Purpose

Keep the wireframe phase focused on future dashboard planning. This document
prevents wireframe work from becoming dashboard implementation, runtime control,
or external automation.

## Allowed In 144B

- Plan screen names and navigation.
- Plan layout regions.
- Plan card wireframes.
- Plan operator flow.
- Plan status and stop/continue indicators.
- Plan evidence visibility and disabled states.
- Document future implementation boundaries.

## Not Allowed In 144B

- Dashboard code changes.
- UI components.
- Routes or pages.
- Dashboard data persistence.
- Runtime reads or writes.
- Codex invocation.
- OpenClaw operation.
- System copy-buffer automation.
- Provider calls.
- Network/API calls.
- Source-side file writes.
- Package/workflow changes.
- DB/SQL changes.
- Memory persistence.
- Source-control automation from source.

## Dashboard Boundary

The future dashboard must be a review surface first. It may eventually show:

- loop state
- approval and audit state
- manual action checklist
- report return state
- validation and closeout state
- next-action recommendation
- blockers, warnings, and evidence references

It must not:

- complete manual actions for the operator
- hide missing evidence
- mark protected actions as available when future-gated
- imply that a visual button performs external work
- store sensitive evidence without a redaction policy
- mutate dashboard state without an approved future phase

## Interaction Boundary

Future wireframe actions should be phrased as review decisions:

- "Review prompt package"
- "Review approval evidence"
- "Confirm manual step evidence"
- "Review validation"
- "Review closeout"
- "Approve next phase"

Avoid labels that imply the dashboard performs the operation.

## Evidence Boundary

Evidence links in wireframes should:

- point to evidence ids or summarized labels
- show missing evidence clearly
- show redaction-needed state
- show stale-state warning when dirty files changed after evidence capture
- stay separate from secret material or production payloads

## Stop Boundary

The wireframe must show a hard stop when:

- `safeToExecute=true` appears unexpectedly
- approval is missing
- evidence is missing
- alert level is `blocking_alert`
- closeout is `blocked` or `unsafe_scope`
- outside-scope dirty files are staged
- forbidden files are touched
- future-gated actions are requested

## Continue Boundary

"Safe to continue" can appear only when:

- handoff is approved for manual transfer
- `safeToExecute=false`
- approval/audit evidence is present
- validation is clean or explicitly reviewed
- closeout is safe
- next action is explicit
- no blockers exist

## Responsive Boundary

Future responsive behavior should remain simple:

- desktop: status band, left navigation, main cards, blockers rail
- tablet: status band, tab navigation, stacked cards, blockers panel
- mobile: status summary first, blockers first when present, one-column cards

Mobile must not hide stop conditions behind menus.

## Accessibility Boundary

Future UI should:

- pair color with text labels
- keep blocker text visible
- provide plain language for status badges
- make disabled reasons explicit
- avoid hover-only safety information
- preserve keyboard and screen-reader friendly order

## Safety Summary

- docs-only
- advisory-only
- no dashboard implementation
- no dashboard mutation
- no UI components
- no source implementation
- no runtime execution
- no Codex invocation
- no OpenClaw operation
- no system copy-buffer automation
- no provider calls
- no file writes from source
- no package/workflow changes
- no DB/SQL
- no memory persistence
- no git automation from source

## Next Boundary Review

Phase 144I should preserve these boundaries. Any move toward UI must be deferred
to a separate static UI planning phase.
