# Loop UX Operator Checklist Model

Phase: PILOT-12I - LOOP UX HARDENING IMPLEMENTATION

Status: implemented as operational documentation / docs-only / advisory-only

## Purpose

The operator checklist model defines a compact checklist layer for future
PILOT-12I hardening. It should make the manual loop easier to follow without
weakening stop conditions or implying source-side behavior.

## Checklist Metadata

Checklist records should include:

- `checklistId`
- `section`
- `itemText`
- `required`
- `blockingIfMissing`
- `evidenceNeeded`
- `relatedStopCondition`
- `recommendedWording`

## Checklist Sections

Allowed `section` values:

- `before_prompt_copy`
- `before_codex_run`
- `after_codex_report`
- `before_next_phase`
- `closeout`

## Checklist Items

### Before Prompt Copy

```text
checklistId: before_prompt_copy:repo_branch
section: before_prompt_copy
itemText: Confirm repo path and branch.
required: true
blockingIfMissing: true
evidenceNeeded: repo_state_checked
relatedStopCondition: branch or project path mismatch
recommendedWording: Continue only if project path and branch match the approved prompt package.
```

```text
checklistId: before_prompt_copy:dirty_scope
section: before_prompt_copy
itemText: Confirm dirty files are known and outside-scope files are not staged.
required: true
blockingIfMissing: true
evidenceNeeded: dirty_files_reviewed
relatedStopCondition: dirty files outside scope are staged
recommendedWording: Stop if unknown staged files appear.
```

```text
checklistId: before_prompt_copy:approval
section: before_prompt_copy
itemText: Confirm handoff is approved_for_copy and safeToExecute=false.
required: true
blockingIfMissing: true
evidenceNeeded: handoff_approved_for_copy
relatedStopCondition: approval missing or prompt package action-ready from source
recommendedWording: This approval allows human transfer only.
```

Recommended wording:

```text
Continue only if the prompt package is approved for human transfer and remains
not action-ready from source.
```

### Before Codex Run

```text
checklistId: before_codex_run:target_session
section: before_codex_run
itemText: Confirm the separate target session is selected by the human.
required: true
blockingIfMissing: true
evidenceNeeded: target_session_confirmed
relatedStopCondition: target session, project, branch, or prompt text is uncertain
recommendedWording: Start the separate Codex task only as a human-managed step.
```

```text
checklistId: before_codex_run:scope
section: before_codex_run
itemText: Confirm target phase, mode, forbidden files, and final report format.
required: true
blockingIfMissing: true
evidenceNeeded: target_scope_confirmed
relatedStopCondition: protected file scope is unclear
recommendedWording: Stop if protected areas appear in the requested scope.
```

Recommended wording:

```text
Start the separate Codex task only as a human-managed step. Stop if the target
session, project, branch, or prompt text is uncertain.
```

### After Codex Report

```text
checklistId: after_codex_report:required_sections
section: after_codex_report
itemText: Confirm report includes phase, files inspected, files modified, summary, commands, scope check, forbidden grep, commit/push posture, and next phase.
required: true
blockingIfMissing: true
evidenceNeeded: structured_report_received
relatedStopCondition: report is partial or lacks scope evidence
recommendedWording: Validate the report as evidence. Do not infer missing fields.
```

```text
checklistId: after_codex_report:unsafe_claims
section: after_codex_report
itemText: Confirm unsafe runtime, provider, package/workflow, dashboard, DB/SQL, and secret-material claims are absent.
required: true
blockingIfMissing: true
evidenceNeeded: unsafe_claims_absent
relatedStopCondition: report claims protected-scope or external action
recommendedWording: Stop if the report claims action outside the approved scope.
```

Recommended wording:

```text
Validate the report as evidence. Do not infer missing safety or scope fields.
```

### Before Next Phase

```text
checklistId: before_next_phase:validation_closeout
section: before_next_phase
itemText: Confirm validation, alert level, closeout, and next action agree.
required: true
blockingIfMissing: true
evidenceNeeded: next_phase_decided
relatedStopCondition: alert is blocking or closeout is unsafe
recommendedWording: Proceed only when validation, alert level, closeout, and next action agree.
```

```text
checklistId: before_next_phase:friction_log
section: before_next_phase
itemText: Record operator confusion points, usefulness score, and friction severity.
required: true
blockingIfMissing: false
evidenceNeeded: friction_logged
relatedStopCondition: high friction requires hardening route
recommendedWording: Log friction before choosing Phase 141B.
```

Recommended wording:

```text
Proceed only when validation, alert level, closeout, and next action agree.
```

### Closeout

```text
checklistId: closeout:scope
section: closeout
itemText: Confirm docs-only scope, staged files, and commit/push posture match the phase mode.
required: true
blockingIfMissing: true
evidenceNeeded: closeout_recorded
relatedStopCondition: staged files outside scope or wrong commit/push posture
recommendedWording: Closeout is an evidence decision, not an action.
```

```text
checklistId: closeout:persistence
section: closeout
itemText: Confirm memory persistence and source-control behavior from source remain absent.
required: true
blockingIfMissing: true
evidenceNeeded: passive_closeout_confirmed
relatedStopCondition: source-side persistence or source-control behavior claimed
recommendedWording: Record the boundary; do not add behavior.
```

Recommended wording:

```text
Closeout is an evidence decision. It does not perform source-control behavior
from source.
```

## Blocking Behavior

Set `blockingIfMissing=true` for:

- missing `approved_for_copy`
- `safeToExecute` not false
- missing human approval evidence
- staged dirty files outside scope
- report missing scope check
- report missing forbidden grep evidence
- unsafe runtime/provider/package/workflow/dashboard/DB/SQL/secret-material claim
- closeout `blocked`
- closeout `unsafe_scope`

## Usability Notes

- Keep checklist text short enough to scan during a live manual trial.
- Put stop conditions next to the action they protect.
- Prefer one evidence label per step.
- Use "continue only if" wording for gates.
- Use "stop if" wording for blockers.
- Avoid wording that suggests source-side action.

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
