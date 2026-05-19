# Controlled Codex Report Return Boundaries

Phase: PILOT-8B - CONTROLLED CODEX REPORT RETURN PLAN

Status: planning / audit / docs-only

## Current Boundary

PILOT-8B is documentation only. It defines a future report-return contract and
does not add TypeScript modules, tests, runners, provider calls, or runtime
bridges.

The only accepted report source for the future layer is text submitted by a
human reviewer. The layer must not retrieve content from an external Codex
session by itself.

## Allowed In PILOT-8B

- inspect existing source-only Autopilot metadata modules
- inspect existing docs for handoff, validation, next action, and closeout
- create controlled report-return planning docs
- describe future metadata models
- describe validation gates and closeout states
- run local verification commands
- leave existing dirty files outside scope untouched and unstaged

## Not Allowed In PILOT-8B

- source implementation
- Codex invocation
- OpenClaw operation
- prompt insertion
- prompt send behavior
- system copy-buffer automation
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

## Future Boundary For PILOT-8I

PILOT-8I may define source-only metadata helpers that:

- accept caller-provided report text metadata
- normalize report fields
- validate required sections
- compare expected phase, mode, branch, and scope
- classify alerts
- create closeout metadata
- recommend a next action
- produce a memory proposal candidate without persistence

PILOT-8I must not become a report collector, tool bridge, provider adapter, or
runtime executor.

## Evidence Boundary

All evidence must be supplied as metadata:

- command names and safe result summaries
- typecheck and smoke summaries
- forbidden grep summaries
- git status summaries
- commit/push labels
- inspected and modified file lists
- unresolved issues
- human review labels

The validator may reason over evidence. It must not perform external actions as
part of report return.

## Stop Conditions

The future report return should stop and require human review when:

- the report does not match the expected phase or mode
- required report sections are missing
- forbidden files are modified
- dirty files outside scope are staged
- package or workflow mutation is claimed without explicit approval
- provider, DB, dashboard, or runtime mutation is claimed
- secret material is present
- unsafe action is reported
- implementation mode lacks required commit or push evidence

## Safe Continuation

Safe continuation is allowed only as metadata when:

- validation status is clean
- alert level is not blocking
- closeout status matches the phase mode
- next action is generated
- memory proposal remains optional and review-only
- no external action is performed by source code

## Relationship To Existing Boundaries

The report return boundary extends the same posture used by:

- Manual Codex Handoff Trial
- Human-Approved Handoff
- Controlled OpenClaw Paste Bridge
- Autopilot Report Validator
- Next-Action Coordinator
- Phase Closeout Coordinator

The new layer should narrow the handoff loop by validating returned report
metadata, not widen it into automation.
