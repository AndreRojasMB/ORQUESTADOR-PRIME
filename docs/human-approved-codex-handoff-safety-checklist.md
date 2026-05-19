# Human-Approved Codex Handoff Safety Checklist

Phase: PILOT-4B - HUMAN-APPROVED CODEX PROMPT HANDOFF PLAN

Status: safety checklist plan / docs-only

## Purpose

This checklist defines the planned safety gates for turning a passive
Conversational Build Loop prompt draft into a human-reviewed handoff package.

The checklist is metadata only. It does not run tools, inspect runtime state,
call providers, or take action.

## Checklist Model

Future metadata:

- `checklistItemId`
- `category`
- `question`
- `expectedSafeAnswer`
- `actualStatus`
- `blocking`
- `evidenceRefs`
- `recommendedFix`

Planned statuses:

- `pass`
- `warning`
- `fail`
- `blocked`

Any `blocking: true` item with `fail` or `blocked` status prevents
`approved_for_copy`.

## Checklist Categories

- `scope`
- `files`
- `secrets`
- `runtime`
- `providers`
- `database`
- `dashboard`
- `package_workflow`
- `codex_run`
- `generated_artifacts`
- `final_report`

## Scope Checks

Questions:

- Is the target phase explicit?
- Is the mode explicit?
- Is the task narrow enough for one phase?
- Are non-goals explicit?
- Are unresolved questions visible?
- Does the prompt avoid autonomous action language?

Expected safe answer:

- The prompt is bounded to one phase, includes non-goals, and requires human
  review before any future action-capable step.

## File Checks

Questions:

- Are allowed files present?
- Are forbidden files present?
- Are app folders and runtime surfaces excluded unless explicitly authorized?
- Are package and workflow files excluded unless explicitly authorized?
- Are dashboard, provider, DB/SQL, integration, WhatsApp, and Viernes Bridge
  surfaces excluded unless explicitly authorized?

Expected safe answer:

- Allowed files are narrow, forbidden files are explicit, and scope-sensitive
  surfaces remain excluded.

## Secret Material Checks

Questions:

- Does the prompt avoid asking for secret material?
- Does it avoid environment access?
- Does it exclude vault and private key surfaces?
- Does it avoid asking the model to invent account details?

Expected safe answer:

- The handoff does not request secret material or environment access.

## Runtime Checks

Questions:

- Does the handoff avoid runtime runners?
- Does it avoid process launching?
- Does it avoid desktop or browser automation?
- Does it avoid source-stage file writes?
- Does it avoid memory persistence?

Expected safe answer:

- The package is passive metadata and text only.

## Provider Checks

Questions:

- Does the prompt avoid provider calls?
- Does it avoid network/API calls?
- Does it avoid OpenClaw operations?
- Does it avoid WhatsApp outbound behavior?

Expected safe answer:

- No provider or outbound behavior is included.

## Database And Dashboard Checks

Questions:

- Does the prompt avoid DB/SQL mutation?
- Does it avoid migrations?
- Does it avoid dashboard mutation?
- Does it avoid deploy or release surfaces?

Expected safe answer:

- No DB, dashboard, deploy, or release action is enabled.

## Package And Workflow Checks

Questions:

- Does the prompt avoid package changes unless the phase explicitly allows
  them?
- Does it avoid workflow changes unless the phase explicitly allows them?
- Does it avoid CI activation?
- Does it avoid Expo/EAS commands unless a future approved phase allows them?

Expected safe answer:

- Package, workflow, CI, and Expo/EAS surfaces remain excluded.

## Codex Run Checks

Questions:

- Is the prompt a string or metadata object only?
- Is manual review required before copy use?
- Is `safeToExecute` false?
- Is `requiresHumanApproval` true?
- Is automatic prompt insertion absent?

Expected safe answer:

- The handoff is review text only and cannot trigger a Codex run.

## Generated Artifact Checks

Questions:

- Does the prompt avoid app build output?
- Does it avoid screen, component, route, backend, and endpoint creation unless a
  later phase explicitly allows implementation?
- Does it avoid asset, screenshot, or store publication actions?

Expected safe answer:

- No build output or publication action is enabled by the handoff.

## Final Report Checks

Questions:

- Does the prompt include files inspected?
- Does the prompt include files modified?
- Does it include implementation or plan summary?
- Does it include commands executed?
- Does it include scope check?
- Does it include forbidden grep result?
- Does it include commit/push status expectations for the mode?
- Does it include next recommended phase?

Expected safe answer:

- The prompt requires a complete final report with verification and scope
  evidence.

## Retry Guidance

If a checklist item blocks:

- keep the package in `blocked`
- list blocking issues
- recommend a precise metadata fix
- require human review after the fix
- keep `safeToCopy` false
- keep `safeToExecute` false

## PILOT-4I Smoke Expectations

Future smoke tests should verify:

- default package starts as `needs_review`
- missing prompt text blocks
- missing boundaries block
- missing allowed or forbidden files block
- missing verification or smoke plan blocks
- `approved_for_copy` never sets `safeToExecute` true
- package remains source-only, advisory-only, and metadata-only
- no provider, runtime, dashboard, DB, memory, or source-control behavior is
  represented as complete
