# End-to-End Manual Loop Trial Plan

Phase: PILOT-9B - END-TO-END MANUAL LOOP TRIAL PLAN

Status: planning / audit / docs-only

## Purpose

PILOT-9B plans a complete manual loop trial for ORQUESTADOR-PRIME / Viernes.
The trial connects the existing passive Autopilot layers into one reviewable
flow:

```text
simple idea -> conversational dry-run -> prompt draft metadata
-> human-approved handoff -> manual Codex run outside source
-> human-submitted report -> controlled report return
-> validation -> next action -> closeout -> human-facing response
```

This phase does not implement source modules, start Codex, operate OpenClaw,
move prompt text, retrieve external reports, call providers, access network,
write project files from source, mutate dashboards, touch DB/SQL, persist
memory, or perform source-control behavior from source.

## End-to-End Trial Scope

The future trial should cover:

- user idea input
- conversational dry-run metadata
- artifact chain metadata
- prompt draft metadata
- human-approved handoff metadata
- manual copy evidence
- external manual Codex run evidence supplied by a human
- human-submitted report text
- controlled report return metadata
- report normalization and validation
- next-action recommendation
- phase closeout metadata
- final human-facing response metadata

The default idea should reuse the Mobile Factory habit-world scenario:

```text
Quiero una app movil de habitos gamificada con mundo vivo, progreso,
recordatorios y premium futuro.
```

## Trial Scenario Model

Future metadata:

- `trialId`
- `userIdeaText`
- `sourceDryRunRef`
- `handoffRef`
- `targetCodexPhase`
- `targetCodexMode`
- `manualCopyRequired`
- `manualReportReturnRequired`
- `expectedArtifactChain`
- `expectedReportShape`
- `expectedValidationStatus`
- `expectedCloseoutStatus`
- `expectedNextAction`
- `riskLevel`
- `requiredApprovals`
- `limitations`

The scenario model should bind the simple idea to every downstream artifact
without activating any runtime path.

## Trial Stage Model

Future stages:

- `create_dry_run`
- `generate_prompt_draft`
- `validate_handoff`
- `approve_for_copy`
- `manual_copy_to_codex`
- `manual_codex_execution`
- `manual_report_return`
- `normalize_report`
- `validate_report`
- `generate_next_action`
- `generate_closeout`
- `render_human_response`

Each stage should record:

- `inputRefs`
- `outputRefs`
- `humanActionRequired`
- `automationAllowed`
- `blockingConditions`
- `riskLevel`
- `evidenceRefs`
- `limitations`

All stages remain metadata-only. Stages that mention a manual Codex run describe
human-supplied evidence only.

## Manual Action Model

Future metadata:

- `actionId`
- `actionType`
- `requiredHuman`
- `instruction`
- `expectedEvidence`
- `safetyWarning`
- `allowedAutomationLevel`
- `completionClaim`
- `riskLevel`
- `limitations`

Manual action types:

- `copy_prompt`
- `paste_prompt_to_codex`
- `run_codex_manually`
- `paste_codex_report_back`
- `approve_next_phase`

Only `manual_only` should be allowed for the trial. Assisted levels remain
future-gated.

## Success Criteria

The trial succeeds when:

- dry-run artifact chain is complete
- prompt draft exists
- handoff passes safety and completeness checks
- handoff approval is `approved_for_copy`
- `safeToExecute` remains false
- copy, external manual run, and report return are marked manual
- report return validation is `no_alert` or accepted `mild_alert`
- closeout metadata is produced
- next-action recommendation is produced
- no source-side external action occurred

## Block Criteria

The trial blocks when:

- prompt draft is marked action-ready
- handoff has blocking issues
- manual approval is missing
- report is missing required fields
- report phase or mode mismatches the target
- unsafe runtime, provider, secret-material, dashboard, DB, package, or workflow
  mutation is claimed
- forbidden files are touched
- dirty files outside scope are staged
- closeout status is `unsafe_scope` or `blocked`

## Safety Boundaries

- source-only
- advisory-only
- metadata-only
- no Codex invocation from source
- no OpenClaw operation
- no system copy-buffer automation
- no prompt insertion automation
- no automatic report retrieval
- no provider calls
- no network/API calls
- no file writes from source
- no package/workflow changes
- no DB/SQL
- no dashboard mutation
- no secret or environment access
- no memory persistence
- no source-control behavior from source

## Integration

The future implementation should consume:

- Conversational Build Loop dry-run
- Human-Approved Handoff
- Manual Codex Handoff Trial
- Semi-Automated Handoff Safety
- Controlled OpenClaw Bridge metadata
- Controlled Codex Report Return
- Report Validator
- Next-Action Coordinator
- Phase Closeout Coordinator
- Human-facing response renderer
- future approval/audit metadata

## Future PILOT-9I Scope

PILOT-9I may add:

- `src/autopilot/endToEndManualLoopTrial.ts`
- `src/autopilot/endToEndManualLoopFixtures.ts`
- `src/autopilot/index.ts` exports
- `docs/end-to-end-manual-loop-trial.md`
- optional `scripts/end-to-end-manual-loop-trial-tests.ts`

It must remain source-only/advisory/metadata-only with no external actions.

## Future After PILOT-9I

Depending on the result, recommend one of:

- PILOT-10B - REAL USER MANUAL LOOP TRIAL INSTRUCTIONS PLAN
- Phase 141B - ROADMAP CONTINUATION PLAN
