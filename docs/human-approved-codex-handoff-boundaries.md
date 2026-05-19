# Human-Approved Codex Handoff Boundaries

Phase: PILOT-4B - HUMAN-APPROVED CODEX PROMPT HANDOFF PLAN

Status: safety boundaries / docs-only

## Boundary Intent

The human-approved handoff layer is a review envelope for a prompt draft. It is
not an automation system, not a runner, not a provider bridge, and not a build
surface.

It prepares metadata that helps a human decide whether a prompt is ready for
manual use in a separate context.

## Allowed In Future PILOT-4I

Future implementation may:

- define TypeScript metadata models
- define static fixtures
- define pure helper functions
- validate prompt package completeness
- validate safety checklist metadata
- classify approval status
- produce copy-ready prompt text as a string
- produce audit metadata
- recommend a next action
- add focused smoke tests
- update docs

## Disallowed

The handoff layer must not:

- run Codex
- insert prompts automatically into any tool
- automate the system copy buffer
- use OpenClaw
- send WhatsApp outbound messages
- call providers
- make network/API calls
- write project files from source
- read secret material
- mutate package or workflow files
- activate CI
- mutate DB/SQL
- mutate dashboard state
- persist memory
- automate source-control behavior from source
- generate an app
- create screens, components, routes, backend, or endpoints
- run Expo/EAS commands
- interact with app stores

## File Boundaries

Future PILOT-4I allowed files:

- `src/autopilot/humanApprovedCodexHandoff.ts`
- `src/autopilot/humanApprovedCodexHandoffFixtures.ts`
- `src/autopilot/index.ts`
- `docs/human-approved-codex-prompt-handoff.md`
- `scripts/human-approved-codex-handoff-tests.ts`

PILOT-4B allowed files:

- `docs/human-approved-codex-prompt-handoff-plan.md`
- `docs/human-approved-codex-handoff-boundaries.md`
- `docs/human-approved-codex-handoff-approval-model.md`
- `docs/human-approved-codex-handoff-safety-checklist.md`

Do not touch:

- `package.json`
- workflows
- `.github/*`
- app folders
- mobile app output folders
- Expo/EAS/native config files
- secret material or vault files
- `src/whatsapp/*`
- `src/viernesBridge/*`
- `src/integrations/*`
- `dashboard/*`
- `.env`
- providers
- DB/SQL files
- runtime execution files

## Approval Boundary

The future implementation may model these states:

- `draft`
- `needs_review`
- `approved_for_copy`
- `rejected`
- `blocked`

`approved_for_copy` only means a human reviewer accepted the text for manual
copy. It must not imply automatic use, runtime activation, or source changes.

`safeToExecute` remains false until a separate future phase defines a controlled
and explicitly approved path.

## Audit Boundary

The audit metadata should record:

- source dry-run ref
- source prompt draft ref
- reviewer label
- review date label
- checklist evidence refs
- blocking issues
- decision reason
- limitations
- required approval before copy
- required approval before any future action-capable phase

Audit metadata must remain a local object or string returned by helpers. It must
not be persisted to memory or external systems by this phase.

## Safety Boundary Checklist

PILOT-4I should prove:

- prompt text is data, not an action
- package creation is pure
- review status is explicit
- blocked states cannot be bypassed by helper defaults
- system copy automation is absent
- Codex invocation is absent
- OpenClaw operation is absent
- WhatsApp outbound behavior is absent
- provider behavior is absent
- source writes are absent
- dashboard mutation is absent
- memory persistence is absent
- source-control mutation from source is absent

## Stop Conditions

Stop and require human review if:

- prompt boundaries are missing
- allowed or forbidden file lists are empty
- verification plan is missing
- smoke plan is missing
- final report format is missing
- the prompt asks for provider, secret, runtime, package, workflow, DB,
  dashboard, store, or build action outside approved scope
- approval state is ambiguous
- a helper marks the package as usable without human review
