# Human-Approved Codex Prompt Handoff Plan

Phase: PILOT-4B - HUMAN-APPROVED CODEX PROMPT HANDOFF PLAN

Status: planning / docs-only / advisory metadata

## Purpose

PILOT-4B plans a human-approved handoff layer for the passive prompt draft
created by the Conversational Build Loop dry-run. The handoff package should
make the prompt reviewable, copy-ready by a human, auditable, and blocked by
default until explicit review is complete.

This phase does not implement source files, run Codex, automate prompt use,
call providers, mutate runtime state, write project files from source, or
advance any app build.

## Scope

The planned handoff converts prompt draft metadata into:

- a human-reviewable handoff package
- copy-ready prompt text for manual use
- an approval checklist
- a safety checklist
- a completeness checklist
- blocked and retry states
- audit metadata
- next-action recommendation metadata

The handoff remains source-only, advisory-only, and metadata-only. It is not a
runtime runner and is not an implementation surface.

## Source Inputs

The future implementation should consume:

- `ConversationalBuildLoopDryRunOutput`
- `ConversationalBuildLoopPromptDraft`
- Codex Handoff Runner package shape
- prompt renderer section conventions
- dry-run quality gate principles
- next-action coordinator recommendation style
- phase closeout coordinator posture
- validation and memory proposal modules as review metadata only

## Handoff Package Model

Future metadata:

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

Default posture:

- `approvalStatus`: `draft` or `needs_review`
- `safeToCopy`: `false` until checklist review passes
- `safeToExecute`: `false`
- `requiresHumanApproval`: `true`

`approved_for_copy` means the prompt can be manually reviewed and copied by a
human. It does not mean automatic use, runtime action, or source mutation.

## Handoff State Flow

```text
draft
-> needs_review
-> approved_for_copy
-> human uses prompt manually outside this metadata layer
```

Blocked or failed checks use:

```text
draft
-> needs_review
-> blocked | rejected
-> retry with fixed prompt metadata
```

The state machine must never mark a package as safe for autonomous use.

## Quality Gates

The handoff should pass only when:

- project path is present
- branch is present
- task and phase are present
- mode is present
- context summary is present
- allowed files are explicit
- forbidden files are explicit
- boundaries are explicit
- verification plan is present
- smoke plan is present
- final report format is present
- safety checklist has no blocking item
- completeness checklist has no required gap
- approval status is human-reviewed
- no unsafe runtime language is present
- no automatic approval is represented
- no provider, secret, runtime, package, workflow, dashboard, DB, or store action
  is enabled

## Planned Files For PILOT-4I

Future implementation may create:

- `src/autopilot/humanApprovedCodexHandoff.ts`
- `src/autopilot/humanApprovedCodexHandoffFixtures.ts`
- `docs/human-approved-codex-prompt-handoff.md`
- `scripts/human-approved-codex-handoff-tests.ts`

It may update:

- `src/autopilot/index.ts`

No runtime executor, external action, system copy automation, or Codex
invocation should be added.

## Success Criteria

PILOT-4I should be considered successful if:

- the default fixture consumes a PILOT-3I prompt draft shape
- the handoff package includes prompt text and all required sections
- approval metadata blocks unsafe packages
- safety and completeness checklist helpers return reviewable findings
- `approved_for_copy` never changes `safeToExecute` to true
- smoke tests prove the package is metadata-only
- docs clearly explain manual review and safe handoff boundaries

## Blocked Criteria

The handoff should be blocked if:

- source dry-run ref is missing
- prompt draft ref is missing
- prompt text is empty
- allowed or forbidden files are absent
- safety boundaries are absent
- verification or smoke plan is absent
- final report format is absent
- safety checklist includes a blocking issue
- approval status is not reviewed
- safe-to-use flags imply autonomous action
- high-risk scope lacks required human approval

## Integration Notes

The planned handoff sits after the Conversational Build Loop dry-run and before
any future manual trial. It should consume the prompt draft metadata, validate
the package, and produce a human-facing envelope with explicit review gates.

It may mirror the existing Codex Handoff Runner, prompt renderer, dry-run
quality gates, next-action coordinator, phase closeout coordinator, validation
contracts, and memory proposal posture. Those integrations remain metadata
references only.

## Verification Plan

For PILOT-4B:

- `git status --short --branch`
- `git diff --stat`
- `git diff --name-only`
- `git diff --check`
- `node node_modules/typescript/bin/tsc --noEmit`

If WSL Node is unavailable, use the Windows Node fallback:

- `node node_modules\\typescript\\bin\\tsc --noEmit`

## Smoke Plan

Confirm:

- only docs were modified
- no source implementation was added
- no Codex run occurred
- no prompt use was automated
- no system copy automation was added
- no file writes from source were added
- no app or backend build happened
- no Expo/EAS command was run
- no store interaction happened
- no package or workflow change happened
- no CI activation happened
- no providers were called
- no runtime executor was added
- no dashboard mutation happened
- no DB/SQL/deploy action happened
- no secret material or network action was touched
- no memory persistence happened
- no source-control behavior was added from source

## Next Recommended Phase

- Phase PILOT-4I - HUMAN-APPROVED CODEX PROMPT HANDOFF IMPLEMENTATION

Optional later path:

- PILOT-5B - MANUAL CODEX HANDOFF TRIAL PLAN
- Phase 141B - ROADMAP CONTINUATION PLAN
