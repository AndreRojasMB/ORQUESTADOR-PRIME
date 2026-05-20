# End-to-End Manual Loop Boundaries

Phase: PILOT-9B - END-TO-END MANUAL LOOP TRIAL PLAN

Status: planning / audit / docs-only

## Current Boundary

PILOT-9B is plan-only. It creates documentation for a future end-to-end manual
trial and does not add source implementation, runners, provider adapters,
bridges, or persistent state.

The trial is a human-in-the-loop exercise. Source code may model evidence, but
it must not perform the external steps.

## Allowed In PILOT-9B

- inspect existing Autopilot metadata modules
- inspect existing handoff, report return, validation, and closeout docs
- create end-to-end manual loop planning docs
- define future metadata models
- define success and block criteria
- define manual-only safety boundaries
- run local verification commands
- leave unrelated dirty files outside scope untouched and unstaged

## Not Allowed In PILOT-9B

- TypeScript implementation
- source runtime for the loop
- Codex invocation from source
- OpenClaw operation
- system copy-buffer automation
- prompt insertion automation
- automatic external report retrieval
- provider calls
- network/API calls
- project file writes from source logic
- package or workflow changes
- DB/SQL mutation
- dashboard mutation
- secret or environment access
- CI activation
- deployment
- memory persistence
- source-control behavior from source
- commit or push

## Future PILOT-9I Boundary

PILOT-9I may model the end-to-end loop as source-only metadata:

- static trial scenario fixture
- stage metadata
- manual action metadata
- expected artifact chain
- expected report shape
- validation and closeout references
- summary and decision metadata

PILOT-9I must not become a live operator. It must not move prompts, observe
external sessions, call providers, write files from source logic, or persist
memory.

## Manual-Only Principle

The trial should treat these as human actions:

- copying prompt text
- placing prompt text in a separate Codex session
- running Codex manually outside source
- returning the report text
- approving the next phase

Metadata may record that the human claimed completion. It must not create the
completion itself.

## Evidence Boundary

Future evidence should be supplied as metadata:

- dry-run output refs
- prompt draft refs
- handoff approval refs
- manual action labels
- returned report text
- validation summary
- closeout summary
- next-action recommendation
- human-facing response

No evidence should require live external-session access.

## Stop Conditions

The future trial should stop when:

- prompt draft is marked action-ready
- handoff is not approved for copy
- human approval metadata is missing
- manual action evidence is missing
- returned report is incomplete
- report phase or mode mismatches
- forbidden files are touched
- dirty files outside scope are staged
- unsafe runtime or provider claim appears
- dashboard, DB, package, workflow, or secret-material risk appears
- closeout is blocked or unsafe

## Safe Continuation

Safe continuation is metadata-only and requires:

- all required stages represented
- manual actions represented as human-supplied evidence
- no source-side external action
- report validation at `no_alert` or accepted `mild_alert`
- closeout produced
- next-action recommendation produced
- human review before any later phase that changes automation level

## Relationship To Existing Boundaries

The trial composes existing safe layers:

- Conversational Build Loop
- Human-Approved Handoff
- Manual Codex Handoff Trial
- Semi-Automated Handoff Safety
- Controlled OpenClaw Bridge metadata
- Controlled Codex Report Return
- validation, next-action, and closeout coordinators

It narrows the path into a single manual rehearsal and does not widen the
system into runtime automation.
