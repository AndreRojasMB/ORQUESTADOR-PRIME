# Loop Dashboard Static UI Card Model

Phase: 145B - LOOP DASHBOARD STATIC UI PLAN

Status: docs-only / advisory-only / future card model

## Purpose

Define the future static UI card metadata for a read-only manual loop dashboard.
Cards are display and review surfaces only. They do not perform protected
actions.

## Static UI Card Metadata

Future metadata:

```ts
interface LoopDashboardStaticCard {
  cardId: string;
  componentName: string;
  purpose: string;
  sourceModelRefs: string[];
  visibleFields: string[];
  statusBadges: string[];
  primaryActionLabel: string;
  secondaryActionLabel: string;
  disabledReason: string;
  emptyState: string;
  safetyNotes: string[];
  riskLevel: string;
  limitations: string[];
}
```

## Required Cards

### LoopOverviewCard

- `cardId`: `loop_overview`
- `componentName`: `LoopOverviewCard`
- purpose: Show current stage, alert level, closeout, and next action.
- sourceModelRefs: readiness state, wireframe overview card, closeout metadata.
- visibleFields: current stage, alert level, closeout status, next action.
- statusBadges: safe to continue, review required, blocked.
- primaryActionLabel: Review next step.
- secondaryActionLabel: Open blockers.
- disabledReason: Next step is unavailable until blockers clear.
- emptyState: No loop summary selected.
- safetyNotes: Overview is read-only and does not advance the loop.
- riskLevel: medium.
- limitations: fixture-backed first.

### PromptDraftCard

- `cardId`: `prompt_draft`
- `componentName`: `PromptDraftCard`
- purpose: Show prompt draft completeness and target phase/mode.
- sourceModelRefs: human-approved handoff, wireframe prompt card.
- visibleFields: prompt status, target phase, target mode, required sections.
- statusBadges: draft, complete, missing evidence, blocked.
- primaryActionLabel: Review prompt package.
- secondaryActionLabel: Open handoff review.
- disabledReason: Prompt package is missing or blocked.
- emptyState: No prompt metadata available.
- safetyNotes: Prompt text is for human review and transfer only.
- riskLevel: medium.
- limitations: no prompt transfer behavior.

### HandoffApprovalCard

- `cardId`: `handoff_approval`
- `componentName`: `HandoffApprovalCard`
- purpose: Show approval state and safe handoff posture.
- sourceModelRefs: human-approved handoff, manual handoff trial.
- visibleFields: approval status, safeToCopy, safeToExecute, reviewer.
- statusBadges: approved for copy, needs review, blocked.
- primaryActionLabel: Review approval state.
- secondaryActionLabel: Open safety checklist.
- disabledReason: Human approval is missing or blocked.
- emptyState: No handoff approval metadata available.
- safetyNotes: Approval supports human transfer only.
- riskLevel: high.
- limitations: no external action is authorized.

### ApprovalGateCard

- `cardId`: `approval_gate`
- `componentName`: `ApprovalGateCard`
- purpose: Show protected action, required approver, and required evidence.
- sourceModelRefs: approval gate hardening, audit evidence.
- visibleFields: protected action, approver, decision, missing evidence.
- statusBadges: approved, needs review, future-gated, blocked.
- primaryActionLabel: Review human decision.
- secondaryActionLabel: Review missing evidence.
- disabledReason: Required evidence is missing.
- emptyState: No gate selected.
- safetyNotes: A displayed gate does not create approval.
- riskLevel: high.
- limitations: no gate mutation.

### AuditEvidenceCard

- `cardId`: `audit_evidence`
- `componentName`: `AuditEvidenceCard`
- purpose: Show evidence quality, actor, decision, redaction status, and rollback hint.
- sourceModelRefs: audit trail hardening, evidence records.
- visibleFields: actor, decision, evidence list, redaction status, rollback hint.
- statusBadges: complete, weak evidence, redaction needed, blocked.
- primaryActionLabel: Review audit evidence.
- secondaryActionLabel: Open evidence detail.
- disabledReason: Evidence is missing, weak, or needs review.
- emptyState: No evidence records available.
- safetyNotes: Audit evidence is passive metadata.
- riskLevel: medium.
- limitations: evidence is not live data.

### ManualActionChecklistCard

- `cardId`: `manual_action_checklist`
- `componentName`: `ManualActionChecklistCard`
- purpose: Show manual-only steps and required completion evidence.
- sourceModelRefs: loop dashboard readiness, end-to-end manual loop trial.
- visibleFields: action type, manual-only flag, evidence, blocked reason.
- statusBadges: manual action required, complete, needs review, blocked.
- primaryActionLabel: Review manual evidence.
- secondaryActionLabel: Review safety notes.
- disabledReason: Protected action requires approval first.
- emptyState: No manual actions selected.
- safetyNotes: The dashboard never performs the manual action.
- riskLevel: high.
- limitations: human completion is recorded outside this UI.

### ReportReturnCard

- `cardId`: `report_return`
- `componentName`: `ReportReturnCard`
- purpose: Show report return status and report section completeness.
- sourceModelRefs: controlled report return, validation summary.
- visibleFields: report status, report phase, report mode, required sections.
- statusBadges: missing, submitted, normalized, needs review, blocked.
- primaryActionLabel: Review report metadata.
- secondaryActionLabel: Open validation.
- disabledReason: Report metadata is missing.
- emptyState: No report return metadata available.
- safetyNotes: Report data is human-supplied metadata.
- riskLevel: medium.
- limitations: no external report retrieval.

### ValidationResultCard

- `cardId`: `validation_result`
- `componentName`: `ValidationResultCard`
- purpose: Show validation status, alert level, blockers, warnings, and fixes.
- sourceModelRefs: controlled report validation, report validator metadata.
- visibleFields: validation status, alert level, blockers, warnings, fixes.
- statusBadges: no alert, mild alert, blocking alert.
- primaryActionLabel: Review validation.
- secondaryActionLabel: Open blockers.
- disabledReason: Validation has a blocking alert.
- emptyState: No validation metadata available.
- safetyNotes: Validation display is not a runner.
- riskLevel: high.
- limitations: evidence must be supplied separately.

### CloseoutCard

- `cardId`: `closeout`
- `componentName`: `CloseoutCard`
- purpose: Show closeout state and whether continuation is safe.
- sourceModelRefs: phase closeout metadata, validation summary.
- visibleFields: closeout status, safe to continue, retry flag, human review flag.
- statusBadges: completed, needs review, needs retry, blocked, unsafe scope.
- primaryActionLabel: Review closeout.
- secondaryActionLabel: Open next action.
- disabledReason: Closeout is blocked or unsafe.
- emptyState: No closeout metadata available.
- safetyNotes: Closeout review does not mutate repository state.
- riskLevel: high.
- limitations: no source-control behavior.

### NextActionCard

- `cardId`: `next_action`
- `componentName`: `NextActionCard`
- purpose: Show recommended next phase and approval requirement.
- sourceModelRefs: next-action coordinator metadata, closeout summary.
- visibleFields: recommended phase, reason, required approvals, risk level.
- statusBadges: ready, review, retry, blocked.
- primaryActionLabel: Review next phase.
- secondaryActionLabel: Review decision model.
- disabledReason: Human approval or evidence is missing.
- emptyState: No next action metadata available.
- safetyNotes: Next action is a recommendation only.
- riskLevel: medium.
- limitations: no phase creation behavior.

### BlockersWarningsCard

- `cardId`: `blockers_warnings`
- `componentName`: `BlockersWarningsCard`
- purpose: Keep stop conditions and warnings visible.
- sourceModelRefs: readiness state, validation summary, approval/audit risks.
- visibleFields: blocker, warning, severity, source, recommended fix.
- statusBadges: warning, blocker, stop.
- primaryActionLabel: Review blocker.
- secondaryActionLabel: Review source evidence.
- disabledReason: No blocker is selected.
- emptyState: No blockers or warnings.
- safetyNotes: Blockers must be resolved before next phase approval.
- riskLevel: critical.
- limitations: no remediation behavior.

## Cross-Card UX Rules

- Every card has an empty state.
- Every card has a visible disabled reason.
- Every high-risk card shows evidence status.
- Stop states appear before optional context.
- Manual-only wording appears on handoff, approval, manual action, and next-action cards.
- Continue states must show the evidence that supports continuation.
- Future-gated surfaces remain disabled.

## Future 145I Scope

Phase 145I may implement this as source-only card metadata or expanded docs. It
must not add real dashboard components unless a later phase explicitly approves
dashboard UI implementation.

## Next Recommended Phase

Phase 145I - LOOP DASHBOARD STATIC UI IMPLEMENTATION.
