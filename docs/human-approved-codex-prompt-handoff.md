# Human-Approved Codex Prompt Handoff

Status: source-only / advisory / metadata-only

## Purpose

PILOT-4I adds a human-approved handoff layer for the passive prompt draft
created by the Conversational Build Loop dry-run. It turns prompt draft metadata
into a reviewable handoff package with safety checks, completeness checks,
approval metadata, and a manual-copy decision.

The implementation lives in:

- `src/autopilot/humanApprovedCodexHandoff.ts`
- `src/autopilot/humanApprovedCodexHandoffFixtures.ts`

It does not invoke Codex, insert prompts into tools, automate the system copy
buffer, call providers, mutate dashboards, write project files from source,
persist memory, or perform external actions.

## Handoff Package Model

`HumanApprovedCodexHandoffPackage` records:

- `handoffId`
- `sourceDryRunRef`
- `sourcePromptDraftRef`
- `targetPhase`
- `targetMode`
- `promptText`
- `contextSummary`
- `allowedFiles`
- `forbiddenFiles`
- `boundaries`
- `verificationPlan`
- `smokePlan`
- `finalReportFormat`
- `safetyChecklist`
- `completenessChecklist`
- `approvalStatus`
- `safeToCopy`
- `safeToExecute`
- `requiresHumanApproval`
- `limitations`

`safeToExecute` is always false in this phase. `requiresHumanApproval` is always
true.

## Approval Model

`HumanApprovedCodexApproval` records:

- `approvalId`
- `handoffId`
- `approvalStatus`
- `reviewer`
- `reviewedAtLabel`
- `approvalChecklist`
- `blockingIssues`
- `riskLevel`
- `decision`
- `decisionReason`
- `requiredBeforeCopy`
- `requiredBeforeExecution`

Approval statuses:

- `draft`
- `needs_review`
- `approved_for_copy`
- `rejected`
- `blocked`

`approved_for_copy` only means a human reviewer may manually copy the prompt
text. It does not mean model invocation, runtime action, or source mutation.

## Safety Checklist Model

`HumanApprovedCodexSafetyChecklistItem` records:

- `checklistItemId`
- `category`
- `question`
- `expectedSafeAnswer`
- `actualStatus`
- `blocking`
- `evidenceRefs`
- `recommendedFix`

Categories:

- `scope`
- `files`
- `secrets`
- `runtime`
- `providers`
- `database`
- `dashboard`
- `package_workflow`
- `codex_execution`
- `generated_artifacts`
- `final_report`

Safety checks block when prompt metadata implies unsafe action wording, missing
review gates, missing file boundaries, or an unsafe prompt-use flag.

## Completeness Checklist Model

`HumanApprovedCodexCompletenessChecklistItem` records:

- `checklistItemId`
- `sectionName`
- `present`
- `blocking`
- `evidenceRefs`
- `recommendedFix`

Required sections:

- project path
- branch
- task
- mode
- context summary
- allowed files
- forbidden files
- boundaries
- verification plan
- smoke plan
- final report format

Missing required sections block approval.

## Decision Behavior

Implemented helpers:

- `createHumanApprovedCodexHandoffPackage(...)`
- `createHumanApprovedCodexApproval(...)`
- `createHumanApprovedCodexSafetyChecklistItem(...)`
- `createHumanApprovedCodexCompletenessChecklistItem(...)`
- `evaluateHumanApprovedCodexHandoff(...)`
- `summarizeHumanApprovedCodexHandoff(...)`
- `selectBlockingHandoffIssues(...)`
- `markHandoffApprovedForCopy(...)`
- `createHumanApprovedCodexHandoff(...)`

Rules:

- `safeToCopy` can be true only when `approvalStatus` is `approved_for_copy`
  and there are no blocking checklist items.
- `safeToExecute` remains false.
- `requiresHumanApproval` remains true.
- missing required sections block approval.
- unsafe action wording blocks approval.
- provider, secret-material, runtime, package, workflow, DB, or dashboard
  activation wording blocks approval.

## Conversational Build Loop Integration

The handoff consumes `ConversationalBuildLoopPromptDraft` metadata from PILOT-3I.
It uses the prompt draft fields as the source for:

- prompt text
- context summary
- file scope
- safety boundaries
- verification plan
- smoke plan
- final report format

The integration remains passive. The handoff package is a review envelope, not a
runner.

## Codex Handoff Runner Integration

The package mirrors the existing Codex Handoff Runner shape:

- prompt text
- handoff metadata
- validation checklist posture
- next-action posture
- final report expectations

Unlike a runner, this layer adds human approval states and manual-copy safety
decisions. It does not perform any external action.

## Safety Boundaries

- source-only
- advisory-only
- metadata-only
- no Codex invocation
- no prompt insertion automation
- no system copy buffer automation
- no OpenClaw operation
- no WhatsApp outbound
- no provider calls
- no network/API calls
- no project file writes from source
- no package or workflow changes
- no CI activation
- no DB/SQL
- no dashboard mutation
- no memory persistence
- no source-control behavior from source

## Limitations

- default fixtures are static metadata
- review labels are strings, not runtime timestamps
- no live workspace inspection is performed by helpers
- no prompt is inserted into a tool
- no approval UI is implemented
- no external audit sink is used
- future controlled trial still needs a separate planning phase

## Next Recommended Phase

If smoke checks pass:

- PILOT-5B - MANUAL CODEX HANDOFF TRIAL PLAN

Alternative:

- Phase 141B - ROADMAP CONTINUATION PLAN
