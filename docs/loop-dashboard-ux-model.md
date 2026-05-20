# Loop Dashboard UX Model

Phase: 143B - LOOP DASHBOARD READINESS PLAN

Status: docs-only / advisory-only / future UX model

## Purpose

Define how a future loop dashboard should feel to a human operator: clear,
review-first, evidence-forward, and resistant to accidental action assumptions.

## UX Principles

- Show the current state before asking for a decision.
- Make stop conditions visually stronger than continuation hints.
- Keep manual-only wording visible near every human action.
- Show evidence references next to status claims.
- Separate warnings from blockers.
- Never imply that a dashboard card can perform the protected action.
- Prefer plain labels over internal model names when displaying to operators.

## Dashboard Card Model

Future card metadata:

```ts
interface LoopDashboardCard {
  cardId: string;
  title: string;
  purpose: string;
  inputRefs: string[];
  visibleFields: string[];
  statusBadges: string[];
  primaryActionLabel: string;
  disabledReason: string;
  safetyNotes: string[];
  riskLevel: string;
}
```

## Future Cards

### Loop Overview

- purpose: summarize current stage, global status, and safe-to-continue signal
- input refs: end-to-end trial, report return, approval/audit summary
- visible fields: stage, alert level, closeout, next action
- status badges: safe, review, stop
- primary action label: "Review next step"
- disabled reason: "Next step unavailable until blockers clear"

### Prompt Draft

- purpose: show prompt draft readiness and required sections
- input refs: conversational dry-run, prompt draft, handoff package
- visible fields: draft status, target phase, target mode, required sections
- status badges: draft, complete, missing sections, blocked
- primary action label: "Review prompt package"
- disabled reason: "Prompt draft missing or blocked"

### Approval Gate

- purpose: show approval decision, required approver, and missing evidence
- input refs: approval gates, approval decision, evidence records
- visible fields: protected action, decision, approver, evidence refs
- status badges: approved, needs review, blocked, future gated
- primary action label: "Record human decision"
- disabled reason: "Required evidence missing"

### Manual Action Checklist

- purpose: show which steps remain human-operated
- input refs: manual loop actions, UX hardening checklist
- visible fields: action type, evidence label, completion claim
- status badges: manual required, complete, blocked
- primary action label: "Confirm manual step"
- disabled reason: "Protected action requires review first"

### Report Return

- purpose: show whether a human-submitted report exists and is normalized
- input refs: controlled report return
- visible fields: received label, report phase, report mode, sections present
- status badges: missing, submitted, normalized, needs review
- primary action label: "Review report evidence"
- disabled reason: "Report has not been submitted by the human"

### Validation Result

- purpose: show scope and verification status
- input refs: validation metadata, forbidden grep evidence, typecheck evidence
- visible fields: validation status, alert level, blockers, warnings
- status badges: no alert, mild alert, blocking alert
- primary action label: "Review validation"
- disabled reason: "Validation has blocking alert"

### Closeout

- purpose: show whether the phase can close or needs retry/review
- input refs: phase closeout metadata
- visible fields: closeout status, safe to continue, retry flag
- status badges: completed, needs review, blocked, unsafe scope
- primary action label: "Review closeout"
- disabled reason: "Closeout is blocked or unsafe"

### Next Action

- purpose: show the next recommended phase and why
- input refs: next-action coordinator, closeout
- visible fields: recommended phase, reason, required approvals
- status badges: continue, retry, review, blocked
- primary action label: "Approve next phase"
- disabled reason: "Human approval or evidence missing"

### Audit Trail

- purpose: show evidence, actor, decision, and rollback hints
- input refs: audit trail, evidence records
- visible fields: audit id, actor, decision, evidence refs, rollback hint
- status badges: complete, redaction needed, weak evidence
- primary action label: "Review audit evidence"
- disabled reason: "Evidence requires redaction review"

### Blockers / Warnings

- purpose: make stop conditions impossible to miss
- input refs: all loop state blockers and warnings
- visible fields: blocker, severity, source, recommended fix
- status badges: warning, blocker, stop
- primary action label: "Resolve blocker"
- disabled reason: "No blocker selected"

## Operator-Friendly Labels

Use:

- "Safe to continue?"
- "Manual action required"
- "Do not proceed"
- "Evidence missing"
- "Needs human review"
- "Future-gated action"
- "Dirty files outside scope"
- "Report needs review"
- "Closeout blocked"

Avoid:

- "Run"
- "Submit"
- "Apply"
- "Sync"
- "Launch"
- "Mutate"
- "Approve automatically"

## Stop / Continue Indicators

Continue indicator:

- green or neutral badge
- label: "Safe to continue"
- only when no blockers exist and closeout is safe

Review indicator:

- amber badge
- label: "Needs human review"
- used for weak evidence, mild alert, or incomplete but non-blocking data

Stop indicator:

- red badge
- label: "Do not proceed"
- used for blocking alert, unsafe scope, missing approval, staged external dirty
  files, or future-gated action

## Copy-Ready But Not Action-Ready Wording

Recommended text:

```text
Approved for human transfer only. This does not authorize source-side action.
safeToExecute remains false.
```

This wording should appear in Prompt Draft, Approval Gate, and Manual Action
Checklist cards when a prompt package is ready for human transfer.

## No Automation Wording

Recommended text:

```text
This dashboard is a review surface. It does not operate tools or perform the
manual step for you.
```

Use this text near any future button-like affordance to avoid accidental action
assumptions.

## Accessibility And Scanning

Future UI should:

- pair color with text labels
- keep blocker text visible without hover
- make evidence refs copyable by the human, if a later UI phase approves it
- show long blocker messages in expandable detail
- keep the next action visible but disabled when blockers exist
- avoid burying safety notes below the fold

## Limitations

- This UX model is not a dashboard implementation.
- It does not define routes, components, storage, providers, or runtime behavior.
- It does not replace the operator guide or execution report.
- It assumes all state is supplied by source-only/advisory metadata.

## Next Recommended Phase

Phase 143I - LOOP DASHBOARD READINESS IMPLEMENTATION.
