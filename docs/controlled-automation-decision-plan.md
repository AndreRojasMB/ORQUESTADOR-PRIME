# Controlled Automation Decision Plan

Phase: 146B - CONTROLLED AUTOMATION DECISION PLAN

Status: docs-only / advisory-only / decision planning

## Purpose

Phase 146B decides whether the manual loop should stay manual, improve dashboard
interaction, prepare a future OpenClaw-assisted path, harden report return, or
wait for a real mini test before making the automation call.

This phase is not an implementation phase. It does not add source code, operate
OpenClaw, invoke Codex, move prompt text, call providers, mutate dashboards,
touch DB/SQL, persist memory, or change package/workflow surfaces.

## Decision Scope

Compare five paths:

- stay manual with the static dashboard
- improve dashboard interaction and UX
- plan a controlled OpenClaw paste bridge for a future phase
- harden controlled report return before any assisted path
- defer the automation decision until after a real mini test

The decision should be based on operator friction, approval/audit readiness,
report validation reliability, abort/rollback posture, and observed manual
transfer pain.

## Current Readiness Snapshot

Known strengths:

- static dashboard exists at `/autopilot/loop`
- dashboard cards show approvals, evidence, manual actions, validation, closeout,
  next action, blockers, and warnings
- approval/audit metadata exists
- semi-automated handoff safety metadata exists
- controlled OpenClaw bridge metadata exists
- controlled report return metadata exists
- manual loop instructions and execution report templates exist

Known gaps:

- no real mini test has been completed in this decision lane
- no live loop dashboard state exists
- no approval recording UI exists
- no real report intake UI exists
- no persistent audit surface exists
- no proof yet that manual transfer is the dominant friction

## Recommended Decision Posture

Default recommendation:

- defer real automation until after a real mini test

Reason:

- Dashboard/UX option B now has a read-only base.
- Controlled automation should be justified by observed pain, not presumed pain.
- Approval/audit and abort posture are strong as metadata, but not yet validated
  by a real operator run.

## Decision Rules

Use these rules in priority order:

1. If safety risk is high, stay manual.
2. If report validation is weak, harden report return before any assisted path.
3. If dashboard clarity is weak, plan dashboard interaction hardening.
4. If dashboard reduces friction and manual transfer is tolerable, run the mini
   test and then return to roadmap.
5. If only manual transfer is painful and approval/audit is ready, plan the
   controlled OpenClaw path.
6. If evidence is insufficient, defer until the real mini test is complete.

## Mini Test Requirement

Before choosing real automation, require one real mini test:

- one simple idea
- prompt generated or selected from approved metadata
- handoff approved for manual transfer
- human-managed Codex session
- report returned by the human operator
- validation and closeout reviewed
- friction scored

Required mini test evidence:

- idea label
- prompt/handoff label
- approval label
- report label
- validation status
- closeout status
- friction score
- operator confidence score
- next decision recommendation

## Option Summary

| Option | Benefit | Risk | Recommendation |
| --- | --- | --- | --- |
| `manual_dashboard_only` | Keeps safety highest and uses the new dashboard | may leave transfer friction unresolved | keep as baseline |
| `dashboard_interaction_hardening` | Improves clarity before automation | could delay learning from a real run | choose if dashboard clarity is weak |
| `controlled_openclaw_paste_future` | Reduces manual transfer friction | focus/session mistakes can be serious | only after mini test proves transfer pain |
| `controlled_report_return_future` | Improves validation reliability | does not address transfer friction | choose if reports are weak |
| `defer_until_real_test` | Produces evidence before commitment | slower than jumping to automation | primary recommendation |

## Safety Boundaries

- docs-only
- advisory-only
- no source implementation
- no OpenClaw operation
- no Codex invocation
- no system copy-buffer automation
- no prompt transfer automation
- no provider calls
- no file writes from source
- no dashboard mutation
- no DB/SQL
- no package/workflow changes
- no memory persistence
- no source-control behavior from source

## Integration

This decision plan consumes:

- Loop Dashboard Static UI for the current read-only operator view.
- Loop UX Hardening for friction and stop-condition categories.
- Approval / Audit Hardening for gate and evidence readiness.
- Semi-Automated Handoff Safety for future-gated automation levels.
- Controlled OpenClaw Paste Bridge for future bridge criteria.
- Controlled Codex Report Return for validation and closeout reliability.
- Manual Codex Handoff Trial for manual transfer evidence.
- Real User Manual Loop Instructions and execution report templates for mini
  test evidence.

## Future Implementation Split

Phase 146I - CONTROLLED AUTOMATION DECISION IMPLEMENTATION:

- document the decision model as a final operator-facing decision artifact
- preserve docs-only or metadata-only posture
- select the next 147B lane based on evidence requirements
- keep real automation out of scope

Potential 147B candidates:

- Phase 147B - REAL MINI TEST EXECUTION PLAN
- Phase 147B - LOOP DASHBOARD INTERACTION HARDENING PLAN
- Phase 147B - CONTROLLED OPENCLAW TRIAL PLAN

## Next Recommended Phase

Phase 146I - CONTROLLED AUTOMATION DECISION IMPLEMENTATION.
