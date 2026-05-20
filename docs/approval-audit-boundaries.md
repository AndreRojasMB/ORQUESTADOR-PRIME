# Approval / Audit Boundaries

Phase: 142B - APPROVAL / AUDIT HARDENING PLAN

Status: planning / docs-only / advisory-only

## Purpose

This document defines what approval/audit hardening may and may not do before a
future implementation phase. It keeps review, evidence, rollback, and closeout
concerns separate from runtime behavior.

## Allowed Planning Scope

Phase 142B may define:

- approval gate metadata
- audit trail metadata
- evidence metadata
- hardening risk taxonomy
- rollback posture
- next-action review posture
- closeout confidence criteria
- future Phase 142I implementation scope

## Disallowed Scope

Phase 142B must not:

- add source implementation
- add runtime behavior
- invoke Codex from source
- operate OpenClaw
- automate system copy-buffer behavior
- call providers
- write project files from source
- change package or workflow files
- touch DB/SQL
- mutate dashboard files
- access secret material
- persist memory
- perform source-control behavior from source

## Boundary Rules

### Approval Is Metadata

Approval records may describe:

- actor
- decision
- required evidence
- risk level
- blocker state
- rollback requirement

Approval records must not perform the protected action.

### Audit Is Metadata

Audit entries may describe:

- source phase
- action type
- actor label
- evidence refs
- redaction status
- rollback hint

Audit entries must not write to an external audit sink in this phase.

### Evidence Is Referenced

Evidence may be referenced by label or summary.

Evidence must not include raw secret material, environment values, private keys,
or sensitive operational payloads.

### Future Actions Are Blocked By Default

The following remain blocked until a later phase explicitly narrows scope:

- future runtime action
- future OpenClaw action
- future provider action
- future dashboard mutation
- future memory persistence

## Stop Conditions

Stop and replan if any approval/audit proposal requires:

- source implementation during B mode
- external action
- provider activity
- dashboard mutation
- DB/SQL work
- package/workflow changes
- secret material
- memory persistence
- source-control behavior from source

## Rollback Posture

Each protected action should state one of:

- `rollback_not_needed`: metadata-only decision
- `rollback_review_required`: human must review before continuing
- `rollback_plan_required`: no continuation without rollback plan
- `rollback_impossible_blocked`: action must remain blocked

Default:

- future runtime, OpenClaw, provider, and dashboard mutation actions use
  `rollback_impossible_blocked` until a later phase changes the scope.

## Safety Boundaries

- docs-only
- advisory-only
- no source implementation
- no runtime behavior
- no Codex invocation from source
- no OpenClaw operation
- no system copy-buffer automation
- no provider calls
- no file writes from source
- no package/workflow changes
- no DB/SQL
- no dashboard mutation
- no memory persistence
- no source-control behavior from source
