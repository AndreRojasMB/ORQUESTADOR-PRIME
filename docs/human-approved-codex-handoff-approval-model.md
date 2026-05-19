# Human-Approved Codex Handoff Approval Model

Phase: PILOT-4B - HUMAN-APPROVED CODEX PROMPT HANDOFF PLAN

Status: model plan / docs-only

## Purpose

The approval model makes the handoff package explicitly review-gated. It records
whether a prompt draft is ready for manual copy, which issues block it, and what
evidence supports the decision.

Approval metadata is advisory. It does not trigger runtime behavior.

## Handoff Package Model

Future TypeScript model:

```ts
interface HumanApprovedCodexHandoffPackage {
  handoffId: string;
  sourceDryRunRef: string;
  sourcePromptDraftRef: string;
  targetPhase: string;
  targetMode: string;
  promptText: string;
  contextSummary: string;
  allowedFiles: readonly string[];
  forbiddenFiles: readonly string[];
  boundaries: readonly string[];
  verificationPlan: readonly string[];
  smokePlan: readonly string[];
  finalReportFormat: readonly string[];
  safetyChecklist: readonly HumanApprovedCodexHandoffChecklistItem[];
  completenessChecklist: readonly HumanApprovedCodexHandoffChecklistItem[];
  approvalStatus: HumanApprovedCodexHandoffApprovalStatus;
  safeToCopy: boolean;
  safeToExecute: false;
  requiresHumanApproval: true;
  limitations: readonly string[];
}
```

## Approval Statuses

Allowed statuses:

- `draft`
- `needs_review`
- `approved_for_copy`
- `rejected`
- `blocked`

Status meaning:

- `draft`: package exists but has not been reviewed
- `needs_review`: package is structurally available but awaits human decision
- `approved_for_copy`: reviewer accepts the text for manual copy only
- `rejected`: reviewer rejects the handoff package
- `blocked`: checklist or scope issue prevents use

`approved_for_copy` must not alter `safeToExecute`; the future model keeps it
false.

## Approval Model

Future TypeScript model:

```ts
interface HumanApprovedCodexHandoffApproval {
  approvalId: string;
  handoffId: string;
  approvalStatus: HumanApprovedCodexHandoffApprovalStatus;
  reviewer: string;
  reviewedAtLabel: string;
  approvalChecklist: readonly HumanApprovedCodexHandoffChecklistItem[];
  blockingIssues: readonly string[];
  riskLevel: string;
  decision: string;
  decisionReason: string;
  requiredBeforeCopy: true;
  requiredBeforeExecution: true;
}
```

The `reviewedAtLabel` field is a label, not a runtime clock requirement.

## Decision Rules

Set `blocked` when:

- prompt text is empty
- source dry-run ref is absent
- source prompt draft ref is absent
- safety boundaries are absent
- allowed or forbidden file lists are absent
- verification plan is absent
- smoke plan is absent
- final report format is absent
- a blocking checklist item fails
- package implies autonomous action
- package marks itself as executable

Set `needs_review` when:

- required fields exist
- no blocking issue is known
- human reviewer has not approved copy use yet

Set `approved_for_copy` only when:

- required fields exist
- checklist results pass
- no blocking issue remains
- reviewer label is present
- decision reason is present
- `safeToCopy` is true
- `safeToExecute` is false
- `requiresHumanApproval` is true

## Completeness Checklist Model

Future checklist item:

```ts
interface HumanApprovedCodexHandoffChecklistItem {
  checklistItemId: string;
  category: HumanApprovedCodexHandoffChecklistCategory;
  question: string;
  expectedSafeAnswer: string;
  actualStatus: "pass" | "warning" | "fail" | "blocked";
  blocking: boolean;
  evidenceRefs: readonly string[];
  recommendedFix: string;
}
```

## Completeness Checklist Categories

Planned completeness categories:

- `scope`
- `files`
- `runtime`
- `providers`
- `database`
- `dashboard`
- `package_workflow`
- `codex_run`
- `generated_artifacts`
- `final_report`

Completeness checks should verify:

- phase is present
- mode is present
- project path is present
- branch is present
- task is clear
- previous context is present
- allowed files are scoped
- forbidden files are scoped
- boundaries are explicit
- verification plan is present
- smoke plan is present
- final report format is present
- next recommended phase is present

## Approval Checklist

The approval checklist should ask:

- Is the handoff scope narrow and reversible?
- Are allowed files limited to the intended phase?
- Are forbidden files explicit?
- Are secret material and runtime surfaces excluded?
- Are provider and network actions excluded?
- Are package and workflow changes excluded unless explicitly allowed?
- Are DB, dashboard, store, and memory actions excluded?
- Does the prompt include verification and smoke plans?
- Does the prompt include scope checks?
- Does the prompt include final report sections?
- Is manual review required before any future action-capable phase?

## Audit Metadata

Future audit metadata should include:

- approval id
- handoff id
- reviewer label
- review label
- checklist summary
- blocking issue count
- decision
- decision reason
- risk level
- limitations

It should not persist memory or call external systems.
