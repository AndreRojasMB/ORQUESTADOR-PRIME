# Real Mini Test Execution Plan

Phase: 147B - REAL MINI TEST EXECUTION PLAN

Status: docs-only / advisory-only / manual test planning

## Purpose

Plan one small real manual loop test before choosing whether to return to the
main roadmap, harden dashboard UX, or plan a future controlled OpenClaw path.

The test validates this flow:

```text
simple idea -> dashboard/readiness review -> approved prompt package
-> human-managed Codex session -> human-submitted report
-> validation -> closeout -> A/B/C decision
```

This phase does not perform the test. It only defines the scenario, flow,
rubric, decision output, stop conditions, and safety boundaries.

## Mini Test Scope

Use one simple idea:

```text
Quiero una app movil simple de habitos con progreso diario, recordatorios y una
pantalla de estadisticas.
```

The test should stay small enough to evaluate the loop itself, not the quality of
a full product build. The expected output is a structured report and a decision,
not a finished app.

## Test Flow

1. Prepare repo state.
2. Open or review `/autopilot/loop`.
3. Choose the simple idea.
4. Produce or select prompt draft metadata.
5. Approve the handoff manually.
6. Transfer the prompt manually into a separate human-managed Codex session.
7. Let the human operator run that separate session.
8. Submit the report back manually.
9. Validate the report.
10. Classify alert level.
11. Produce closeout.
12. Decide A/B/C or Blocked.

Each step must produce evidence labels for the final report.

## Required Evidence

- `repo_state_checked`
- `dashboard_reviewed`
- `idea_selected`
- `prompt_metadata_selected`
- `handoff_approved`
- `manual_transfer_completed`
- `codex_report_submitted`
- `report_validated`
- `alert_classified`
- `closeout_reviewed`
- `abc_decision_recorded`

## Evaluation Focus

Measure:

- dashboard clarity
- prompt clarity
- copy/paste friction
- report quality
- validation reliability
- closeout clarity
- user confidence
- total manual effort
- usefulness
- safety confidence

The test should answer whether manual plus dashboard is good enough, whether UX
needs another pass, or whether manual transfer pain is strong enough to justify
a future controlled OpenClaw plan.

## Stop Conditions

Stop if:

- prompt boundaries are missing
- approval evidence is missing
- forbidden files are touched
- dirty files outside scope are staged
- report lacks scope check
- report lacks forbidden grep evidence
- package/workflow/provider/dashboard/DB areas are unexpectedly touched
- secret or environment material appears
- closeout is unsafe or blocked

If a stop condition appears, record the blocker and choose `Blocked`.

## Safety Boundaries

- docs-only
- manual-only
- no source implementation
- no Codex invocation from source
- no OpenClaw operation
- no system copy-buffer automation
- no prompt transfer automation
- no report retrieval from external sessions
- no provider calls
- no file writes from source
- no package/workflow changes
- no DB/SQL
- no dashboard mutation
- no memory persistence
- no source-control behavior from source

## Future Split

Phase 147I - REAL MINI TEST EXECUTION INSTRUCTIONS IMPLEMENTATION:

- create operator-facing execution instructions
- include the final evidence template
- include A/B/C decision output
- keep the test manual-only

Potential next decisions:

- A: Phase 148B - MAIN ROADMAP RETURN PLAN
- B: Phase 148B - LOOP DASHBOARD UX HARDENING PLAN
- C: Phase 148B - CONTROLLED OPENCLAW AUTOMATION TRIAL PLAN
- Blocked: safety or validation repair phase

## Next Recommended Phase

Phase 147I - REAL MINI TEST EXECUTION INSTRUCTIONS IMPLEMENTATION.
