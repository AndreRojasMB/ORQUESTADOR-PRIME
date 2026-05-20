# Loop Dashboard Card Wireframes

Phase: 144B - LOOP DASHBOARD WIREFRAME PLAN

Status: docs-only / advisory-only / card wireframe model

## Purpose

Define future card wireframes for the manual loop dashboard. Cards are planned as
display surfaces for metadata and human review; they are not action runners.

## Card Wireframe Metadata

Future metadata:

```ts
interface LoopDashboardCardWireframe {
  cardId: string;
  title: string;
  purpose: string;
  visibleFields: string[];
  statusBadges: string[];
  primaryAction: string;
  secondaryAction: string;
  disabledReason: string;
  evidenceLinks: string[];
  safetyNotes: string[];
  operatorGuidance: string;
  riskLevel: string;
}
```

## Required Card Wireframes

### Loop Overview

- `cardId`: `loop_overview`
- title: Loop Overview
- purpose: Show current loop stage, global alert, closeout, and next action.
- visibleFields: current stage, alert level, closeout status, next action
- statusBadges: safe to continue, needs review, blocked
- primaryAction: Review next step
- secondaryAction: Open blockers
- disabledReason: Next step unavailable until blockers clear.
- evidenceLinks: next-action evidence, closeout summary
- safetyNotes: Overview is display-only.
- operatorGuidance: Start here, then follow the strongest status badge.
- riskLevel: medium

### Prompt Draft

- `cardId`: `prompt_draft`
- title: Prompt Draft
- purpose: Show whether the prompt draft is complete and ready for human review.
- visibleFields: prompt status, target phase, target mode, required sections
- statusBadges: draft, complete, missing evidence, blocked
- primaryAction: Review prompt package
- secondaryAction: Open handoff review
- disabledReason: Prompt draft is missing or blocked.
- evidenceLinks: prompt snapshot, completeness checklist
- safetyNotes: Approved prompt text is for human transfer only.
- operatorGuidance: Confirm `safeToExecute=false` before continuing.
- riskLevel: medium

### Handoff Approval

- `cardId`: `handoff_approval`
- title: Handoff Approval
- purpose: Show approval status and copy-readiness posture.
- visibleFields: approval status, safeToCopy, safeToExecute, reviewer
- statusBadges: approved for copy, needs review, blocked
- primaryAction: Review approval state
- secondaryAction: Open safety checklist
- disabledReason: Approval is missing or blocked.
- evidenceLinks: approval decision, safety checklist
- safetyNotes: `approved_for_copy` does not authorize source-side action.
- operatorGuidance: Continue only when approval is explicit and non-blocking.
- riskLevel: high

### Approval Gate

- `cardId`: `approval_gate`
- title: Approval Gate
- purpose: Show protected action, required approver, and required evidence.
- visibleFields: protected action, approver, decision, missing evidence
- statusBadges: approved, needs review, future-gated, blocked
- primaryAction: Record human decision
- secondaryAction: Review missing evidence
- disabledReason: Required evidence is missing.
- evidenceLinks: approval decision, gate evidence
- safetyNotes: A visible gate does not grant approval.
- operatorGuidance: Do not infer approval from a green-looking summary.
- riskLevel: high

### Audit Evidence

- `cardId`: `audit_evidence`
- title: Audit Evidence
- purpose: Show audit entries, evidence quality, redaction state, and rollback hint.
- visibleFields: actor, decision, evidence references, redaction status, rollback hint
- statusBadges: complete, weak evidence, redaction needed, blocked
- primaryAction: Review audit evidence
- secondaryAction: Open evidence detail
- disabledReason: Evidence requires review or redaction.
- evidenceLinks: audit entry, validation summary, closeout summary
- safetyNotes: Audit records are passive metadata.
- operatorGuidance: Prefer evidence ids and summaries over raw sensitive material.
- riskLevel: medium

### Manual Action Checklist

- `cardId`: `manual_action_checklist`
- title: Manual Action Checklist
- purpose: Show human-managed steps and completion evidence.
- visibleFields: action type, manual-only flag, required evidence, blocked reason
- statusBadges: manual required, complete, needs review, blocked
- primaryAction: Confirm manual step evidence
- secondaryAction: Review safety notes
- disabledReason: Protected action requires review first.
- evidenceLinks: approval decision, manual step evidence
- safetyNotes: The dashboard does not perform the manual step.
- operatorGuidance: Complete the step outside the system and record evidence.
- riskLevel: high

### Report Return

- `cardId`: `report_return`
- title: Report Return
- purpose: Show report return status and whether report metadata is present.
- visibleFields: report status, report phase, report mode, section completeness
- statusBadges: missing, submitted, normalized, needs review, blocked
- primaryAction: Review report metadata
- secondaryAction: Open validation
- disabledReason: Report metadata is missing.
- evidenceLinks: report evidence, validation summary
- safetyNotes: Report data is human-supplied metadata.
- operatorGuidance: Do not continue if report scope evidence is missing.
- riskLevel: medium

### Validation Result

- `cardId`: `validation_result`
- title: Validation Result
- purpose: Show validation status, alert level, blockers, and warnings.
- visibleFields: validation status, alert level, blockers, warnings, recommended fixes
- statusBadges: no alert, mild alert, blocking alert
- primaryAction: Review validation
- secondaryAction: Open blockers
- disabledReason: Validation has a blocking alert.
- evidenceLinks: forbidden grep result, typecheck result, smoke result
- safetyNotes: Validation is metadata review, not a runner.
- operatorGuidance: Route blocking alerts to stop/retry, not next phase.
- riskLevel: high

### Closeout

- `cardId`: `closeout`
- title: Closeout
- purpose: Show closeout status and whether the phase can safely close.
- visibleFields: closeout status, safe to continue, retry flag, human review flag
- statusBadges: completed, needs review, needs retry, blocked, unsafe scope
- primaryAction: Review closeout
- secondaryAction: Open next action
- disabledReason: Closeout is blocked or unsafe.
- evidenceLinks: closeout summary, validation summary
- safetyNotes: Closeout evidence does not mutate repository state.
- operatorGuidance: Only clean closeout should route forward.
- riskLevel: high

### Next Action

- `cardId`: `next_action`
- title: Next Action
- purpose: Show the recommended next phase and approval requirement.
- visibleFields: recommended phase, reason, required approvals, risk level
- statusBadges: ready, review, retry, blocked
- primaryAction: Approve next phase
- secondaryAction: Review decision model
- disabledReason: Human approval or evidence is missing.
- evidenceLinks: next-action evidence, closeout summary
- safetyNotes: Next action is a recommendation, not an operation.
- operatorGuidance: Confirm the recommendation before creating the next phase.
- riskLevel: medium

### Blockers / Warnings

- `cardId`: `blockers_warnings`
- title: Blockers / Warnings
- purpose: Make stop conditions and warning details impossible to miss.
- visibleFields: blocker, warning, severity, source, recommended fix
- statusBadges: warning, blocker, stop
- primaryAction: Resolve blocker
- secondaryAction: Review source evidence
- disabledReason: No blocker selected.
- evidenceLinks: validation summary, dirty file state, approval decision
- safetyNotes: Blockers must remain visible before next phase approval.
- operatorGuidance: Stop on blockers. Review warnings before continuing.
- riskLevel: critical

## Cross-Card Rules

- Every card shows a disabled reason even when the action is only advisory.
- Stop states appear above optional detail.
- Evidence links point to evidence ids or summaries, not raw sensitive material.
- Manual-only wording appears on prompt, approval, manual action, and next action
  cards.
- Future-gated states are never shown as available.

## Next Recommended Phase

Phase 144I - LOOP DASHBOARD WIREFRAME IMPLEMENTATION.
