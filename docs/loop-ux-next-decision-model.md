# Loop UX Next Decision Model

Phase: PILOT-12I - LOOP UX HARDENING IMPLEMENTATION

Status: implemented as operational documentation / docs-only / advisory-only

## Purpose

The next decision model makes the end of the manual loop easier to route. It
turns validation, closeout, friction, and safety results into a clear next phase
recommendation.

## Decision Inputs

Future decision records should consider:

- loop completion status
- validation status
- alert level
- closeout status
- friction severity
- usefulness score
- manual effort level
- unresolved safety issues
- retry recommendation
- roadmap continuation readiness

## Decision Outputs

Allowed next decision outputs:

- `Phase 141B - ROADMAP CONTINUATION PLAN`
- `PILOT-12I - LOOP UX HARDENING IMPLEMENTATION`
- `PILOT-12I follow-up`
- `retry PILOT-8 or PILOT-9`
- `revise PILOT-10 docs`
- `revise PILOT-11 docs`
- `blocked until safety issue is resolved`
- `PILOT-13B - LOOP DASHBOARD READINESS PLAN`

## Decision Rules

Use this priority order:

1. If any safety issue exists, choose `blocked until safety issue is resolved`.
2. If validation is weak, choose `retry PILOT-8 or PILOT-9`.
3. If manual operation is confusing, choose `revise PILOT-10 docs`.
4. If report or evaluation is confusing, choose `revise PILOT-11 docs`.
5. If loop success has high friction, choose `PILOT-12I follow-up` or
   `PILOT-13B - LOOP DASHBOARD READINESS PLAN`.
6. If loop success has low friction, choose `Phase 141B - ROADMAP CONTINUATION
   PLAN`.
7. If repeated manual trials need a future read-only surface, choose
   `PILOT-13B - LOOP DASHBOARD READINESS PLAN`.

## Routing Table

| Condition | Decision | Reason |
| --- | --- | --- |
| Safety issue | blocked until safety issue is resolved | Safety wins over roadmap speed. |
| Validation weak | retry PILOT-8 or PILOT-9 | Report return or end-to-end validation needs repair. |
| Manual operation confusing | revise PILOT-10 docs | Operator instructions need simplification. |
| Report or evaluation confusing | revise PILOT-11 docs | The result capture needs clearer fields. |
| Loop success + high friction | PILOT-12I follow-up or PILOT-13B | The loop works but should be easier. |
| Loop success + low friction | Phase 141B | Manual loop is usable enough to return to roadmap. |
| Repeated tracking burden | PILOT-13B | A future read-only dashboard may reduce operator load. |

## Friction Thresholds

- `low friction`: no blocking issues, no high-severity confusion, usefulness
  score 4 or 5, manual effort low or moderate
- `high friction`: any high-severity confusion, usefulness score 3 or lower, or
  manual effort high
- `blocked friction`: any issue that hides a stop condition or could allow unsafe
  continuation

## Stop Conditions

Route to blocked if:

- prompt package becomes action-ready from source
- handoff approval is missing
- dirty files outside scope are staged
- protected files are touched
- report lacks scope check
- report lacks forbidden grep evidence
- report claims runtime/provider/package/workflow/dashboard/DB/SQL/secret-material
  action
- closeout is `blocked`
- closeout is `unsafe_scope`

## Future Implementation Split

Phase PILOT-12I should:

- make this routing table operator-facing
- add a short decision worksheet to the manual loop report
- align wording with next-action and closeout coordinator labels
- keep decisions advisory and human-reviewed

Optional next paths:

- Phase 141B - ROADMAP CONTINUATION PLAN
- PILOT-13B - LOOP DASHBOARD READINESS PLAN

## Safety Boundaries

- docs-only
- no source implementation
- no Codex invocation from source
- no OpenClaw operation
- no system copy-buffer automation
- no automatic report retrieval
- no provider calls
- no file writes from source
- no package/workflow changes
- no DB/SQL
- no dashboard mutation
- no memory persistence
