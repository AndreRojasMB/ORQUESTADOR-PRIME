# Manual Codex Handoff Trial Boundaries

Phase: PILOT-5B - MANUAL CODEX HANDOFF TRIAL PLAN

Status: boundaries / docs-only

## Boundary Intent

The manual handoff trial is a human-mediated proof of the advisory loop. It
tests whether a prompt package can be reviewed, copied by a person, used in a
separate Codex session, and validated afterward through report metadata.

It is not a runner. It is not automation. It is not a provider bridge. It is
not a file-writing service.

## Allowed In This Plan

PILOT-5B may:

- define the trial scenario
- define manual copy metadata
- define expected report fields
- define validation checks
- define success and block criteria
- define future implementation files
- document safety boundaries

PILOT-5B must remain docs-only.

## Allowed In Future PILOT-5I

Future PILOT-5I may:

- define TypeScript metadata models
- define static fixtures
- define pure helper functions
- model manual copy evidence
- model expected report shape
- model validation expectations
- connect to existing validator and coordinator types as metadata
- add smoke tests
- add docs

Future PILOT-5I must not create a runtime runner.

## Disallowed

The trial must not:

- start Codex from source
- insert prompt text into any tool automatically
- automate the system copy buffer
- use OpenClaw
- send WhatsApp outbound messages
- call providers
- make network/API calls
- write project files from source
- read secret material or environment values
- mutate package or workflow files
- activate CI
- mutate DB/SQL
- mutate dashboard state
- persist memory
- automate source-control behavior from source
- create an app
- create screens, components, routes, backend, or endpoints
- run Expo/EAS commands
- interact with app stores

## Manual Copy Boundary

Manual copy is a human step outside source behavior.

Required metadata:

- prompt ref
- approved-for-copy flag
- human copied flag
- destination label
- run-not-automated flag
- limitations

The system may record that manual copy is required. It must not perform the
copy.

## Codex Session Boundary

The target Codex session is external to ORQUESTADOR-PRIME source helpers.

The source may model:

- expected phase
- expected mode
- expected report shape
- expected verification evidence
- expected scope checks

The source must not:

- start the Codex session
- type into the Codex session
- drive a terminal
- drive a browser
- monitor a live session

## Validation Boundary

Validation is metadata validation of the returned report. It checks report
claims against expected handoff metadata.

Validation may classify:

- passed
- needs_review
- failed
- blocked

Validation must not perform runtime inspection, provider calls, dashboard
mutation, DB/SQL mutation, memory persistence, or source-control behavior.

## Stop Conditions

Stop and require human review if:

- handoff package is not `approved_for_copy`
- `safeToExecute` is true
- manual copy evidence is absent
- returned report is missing required sections
- returned report claims forbidden file changes
- returned report claims package, workflow, provider, dashboard, DB, store, or
  runtime changes
- dirty files outside scope are staged
- secret material or environment values appear in report metadata
- validation status is failed or blocked

## Future Implementation File Boundaries

Allowed for PILOT-5I:

- `src/autopilot/manualCodexHandoffTrial.ts`
- `src/autopilot/manualCodexHandoffTrialFixtures.ts`
- `src/autopilot/index.ts`
- `docs/manual-codex-handoff-trial.md`
- `scripts/manual-codex-handoff-trial-tests.ts`

Still forbidden:

- `package.json`
- workflows
- `.github/*`
- `src/whatsapp/*`
- `src/viernesBridge/*`
- `src/integrations/*`
- `dashboard/*`
- `.env`
- providers
- DB/SQL files
- runtime execution files
- app folders
- mobile app output folders
- Expo/EAS/native config files
- secret material and vault files
