# Controlled Automation Decision Boundaries

Phase: 146B - CONTROLLED AUTOMATION DECISION PLAN

Status: docs-only / advisory-only / boundary planning

## Purpose

Define what Phase 146B may decide and what it must not do. The phase may compare
paths and define readiness gates. It must not implement or activate automation.

## Allowed Decision Work

Phase 146B may:

- compare manual dashboard, dashboard hardening, future OpenClaw bridge, report
  return hardening, and defer paths
- define readiness criteria
- define decision rules
- require a real mini test before automation
- describe approval and audit evidence needed for any future assisted path
- identify stop conditions and rollback posture
- recommend Phase 146I and possible 147B candidates

## Blocked Work

Phase 146B must not:

- add source implementation
- operate OpenClaw
- invoke Codex
- automate prompt transfer
- use the system copy buffer
- call providers
- call network APIs
- write project files from source
- mutate dashboards
- read or mutate DB/SQL
- change package/workflow surfaces
- access secret or environment material
- persist memory
- perform source-control behavior from source

## Safety Posture

The safe default is manual plus dashboard until evidence says otherwise.

Automation can be considered only when:

- a real mini test exists
- approval/audit evidence is complete
- abort/rollback posture is explicit
- report validation is reliable
- dirty file safety is clear
- operator confidence is high
- safety risk is low or accepted by a human reviewer

## Stop Conditions

Stop the automation decision if:

- any protected action lacks human approval
- evidence is missing or weak
- report return is unreliable
- dashboard state is confusing
- operator confidence is low
- dirty file state is unclear
- manual transfer pain is not measured
- OpenClaw readiness is inferred instead of proven
- safety risk is high

## Approval Requirements

Future assisted paths require human approval before:

- selecting a prompt package
- focusing a target session
- inserting prompt text
- sending a prompt
- accepting a returned report
- choosing the next phase
- recording memory proposals
- any future runtime or provider action

The default decision for future assisted paths is blocked until reviewed.

## Evidence Requirements

Minimum evidence before moving past manual/dashboard:

- dashboard clarity score
- manual transfer friction score
- approval/audit completeness
- abort plan reviewed
- report validation result
- closeout status
- dirty file safety evidence
- operator confidence score
- documented safety risk

## Non-Goals

- no live bridge
- no UI action handlers
- no report intake implementation
- no dashboard persistence
- no provider integration
- no runtime runner
- no real OpenClaw path
- no real external action

## Next Recommended Phase

Phase 146I - CONTROLLED AUTOMATION DECISION IMPLEMENTATION.
