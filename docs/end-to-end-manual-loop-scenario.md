# End-to-End Manual Loop Scenario

Phase: PILOT-9B - END-TO-END MANUAL LOOP TRIAL PLAN

Status: planning / audit / docs-only

## Scenario Purpose

This scenario plans the first complete manual loop trial. It uses a simple
mobile idea, produces a passive artifact chain, packages a human-approved
handoff, records manual handoff evidence, receives a human-submitted report,
validates it, and closes the phase.

The scenario remains source-only/advisory/metadata-only.

## Default Trial Scenario

Future metadata:

- `trialId`: `end_to_end_manual_loop:habit_world_v1`
- `userIdeaText`: `Quiero una app movil de habitos gamificada con mundo vivo, progreso, recordatorios y premium futuro.`
- `sourceDryRunRef`: `conversational_build_loop:habit_world_v1`
- `handoffRef`: `human_approved_codex_handoff:habit_world_v1`
- `targetCodexPhase`: `TRIAL-1B - SAMPLE MOBILE IDEA BLUEPRINT DRY-RUN PLAN`
- `targetCodexMode`: `B`
- `manualCopyRequired`: `true`
- `manualReportReturnRequired`: `true`
- `expectedArtifactChain`: intake, requirements, feature blueprints, screen
  blueprints, API candidates, design system, quality/release/store metadata,
  prompt draft, human review
- `expectedReportShape`: phase, files inspected, files modified, summary,
  safety guarantees, tests/scripts, commands, scope, grep, commit/push, next
  phase
- `expectedValidationStatus`: `passed` or accepted `needs_review`
- `expectedCloseoutStatus`: `completed_local_only`
- `expectedNextAction`: `continue_to_I_phase`
- `riskLevel`: `plan_only`
- `requiredApprovals`: PM review, safety review, manual handoff review,
  closeout review
- `limitations`: static fixture, manual evidence only, no live automation

## Stage Sequence

### create_dry_run

- inputRefs: user idea, Mobile Factory refs
- outputRefs: conversational dry-run output
- humanActionRequired: false
- automationAllowed: metadata helper only
- blockingConditions: missing idea, hidden unresolved questions
- riskLevel: medium
- evidenceRefs: dry-run summary
- limitations: static assumptions

### generate_prompt_draft

- inputRefs: dry-run artifact chain
- outputRefs: prompt draft metadata
- humanActionRequired: false
- automationAllowed: metadata helper only
- blockingConditions: missing boundaries, action-ready prompt
- riskLevel: high
- evidenceRefs: prompt draft refs
- limitations: not usable without approval

### validate_handoff

- inputRefs: prompt draft metadata
- outputRefs: safety and completeness checklist
- humanActionRequired: true
- automationAllowed: metadata validation only
- blockingConditions: missing sections, unsafe wording, forbidden scope
- riskLevel: high
- evidenceRefs: checklist refs
- limitations: no approval UI

### approve_for_copy

- inputRefs: handoff validation
- outputRefs: approval metadata
- humanActionRequired: true
- automationAllowed: none
- blockingConditions: reviewer missing, blocking checklist item
- riskLevel: high
- evidenceRefs: approval label
- limitations: approval permits manual copy only

### manual_copy_to_codex

- inputRefs: approved handoff package
- outputRefs: manual copy evidence
- humanActionRequired: true
- automationAllowed: manual_only
- blockingConditions: safeToExecute true, approval missing
- riskLevel: high
- evidenceRefs: copiedByHuman label
- limitations: no source-side prompt movement

### manual_codex_execution

- inputRefs: manually copied prompt
- outputRefs: human-supplied run-complete label
- humanActionRequired: true
- automationAllowed: manual_only
- blockingConditions: wrong target phase, missing human confirmation
- riskLevel: high
- evidenceRefs: external manual run label
- limitations: no source-side operation

### manual_report_return

- inputRefs: external manual report
- outputRefs: report return metadata
- humanActionRequired: true
- automationAllowed: manual_only
- blockingConditions: report absent, incomplete report
- riskLevel: high
- evidenceRefs: submittedByHuman label
- limitations: report text is caller-supplied

### normalize_report

- inputRefs: report return metadata
- outputRefs: normalized report fields
- humanActionRequired: false
- automationAllowed: metadata parser only
- blockingConditions: missing phase or required sections
- riskLevel: medium
- evidenceRefs: normalized report refs
- limitations: string metadata only

### validate_report

- inputRefs: normalized report, expected scope
- outputRefs: validation metadata
- humanActionRequired: false unless warnings appear
- automationAllowed: metadata validation only
- blockingConditions: wrong phase, forbidden files, staged external dirty files
- riskLevel: high
- evidenceRefs: validation refs
- limitations: no live workspace enforcement

### generate_next_action

- inputRefs: validation metadata
- outputRefs: next-action recommendation
- humanActionRequired: false
- automationAllowed: metadata coordinator only
- blockingConditions: blocking validation
- riskLevel: medium
- evidenceRefs: next-action refs
- limitations: recommendation only

### generate_closeout

- inputRefs: validation, next-action, report metadata
- outputRefs: closeout metadata
- humanActionRequired: false unless warning/blocker
- automationAllowed: metadata coordinator only
- blockingConditions: unsafe scope, missing closeout evidence
- riskLevel: high
- evidenceRefs: closeout refs
- limitations: no source-control mutation

### render_human_response

- inputRefs: closeout and next-action metadata
- outputRefs: human-facing response
- humanActionRequired: false
- automationAllowed: metadata renderer only
- blockingConditions: missing next phase, unresolved blockers
- riskLevel: low
- evidenceRefs: response skeleton
- limitations: response only

## Manual Action Records

### copy_prompt

- requiredHuman: true
- instruction: human copies approved prompt text
- expectedEvidence: copiedByHuman label
- safetyWarning: do not use unapproved prompt
- allowedAutomationLevel: manual_only
- completionClaim: caller-supplied metadata

### paste_prompt_to_codex

- requiredHuman: true
- instruction: human places prompt in the selected Codex session
- expectedEvidence: target session label
- safetyWarning: confirm project and branch manually
- allowedAutomationLevel: manual_only
- completionClaim: caller-supplied metadata

### run_codex_manually

- requiredHuman: true
- instruction: human runs the separate Codex session manually
- expectedEvidence: run-complete label
- safetyWarning: target phase must remain safe and metadata-only
- allowedAutomationLevel: manual_only
- completionClaim: caller-supplied metadata

### paste_codex_report_back

- requiredHuman: true
- instruction: human returns the structured report text
- expectedEvidence: submittedByHuman label
- safetyWarning: report must not include secret material
- allowedAutomationLevel: manual_only
- completionClaim: caller-supplied metadata

### approve_next_phase

- requiredHuman: true
- instruction: human reviews closeout and next-action recommendation
- expectedEvidence: approval label
- safetyWarning: do not advance on blocking alert
- allowedAutomationLevel: manual_only
- completionClaim: caller-supplied metadata

## Expected Artifact Chain

- conversational dry-run output
- artifact chain summary
- prompt draft metadata
- handoff package
- handoff approval
- manual copy evidence
- manual run evidence
- report return metadata
- normalized report
- validation result
- next-action recommendation
- closeout result
- human-facing response

## Recommended Future Implementation

PILOT-9I should implement only static fixtures and pure helper metadata for
this scenario. It should not perform any manual step.
