# Autopilot Validation And Memory MVP

Phase: 26I-I - AUTOPILOT VALIDATION AND MEMORY MVP

Status: implemented / source-only / metadata-only

## Purpose

Phase 26I-I adds the first source-only validation and memory proposal MVP for
the ORQUESTADOR-PRIME / Viernes autopilot loop.

The MVP validates caller-provided `CodexReportContract` metadata against
handoff expectations, summarizes the validation result, derives learning-rule
proposals, and creates a memory update proposal that still requires human
approval.

## Implemented Modules

- `src/autopilot/reportValidator.ts`
  - validates report metadata against expected phase scope,
  - checks allowed and forbidden file metadata,
  - checks required command and expected test metadata,
  - checks forbidden grep summary metadata,
  - checks staged and dirty file metadata supplied by the caller,
  - classifies the report as `passed`, `failed`, `needs_review`, or `blocked`.

- `src/autopilot/autopilotValidationSummary.ts`
  - summarizes finding counts,
  - carries the post-validation action,
  - preserves source-only and proposal-only boundaries.

- `src/autopilot/memoryProposalBuilder.ts`
  - builds a proposal-only memory update from the report and validation result,
  - keeps `requiresHumanApproval=true`,
  - does not persist, sync, publish, or apply memory.

- `src/autopilot/errorLearningRules.ts`
  - derives advisory guardrail proposals from report and validation metadata,
  - captures fallback, scope, feature flag, provider, execution, memory, and
    handoff boundaries.

## Validation Model

The validator consumes metadata only:

- report phase,
- expected branch metadata,
- inspected and modified files,
- allowed and forbidden file patterns,
- required commands,
- expected tests,
- forbidden grep summary,
- previous dirty files,
- current dirty files,
- staged files,
- commit and push expectations,
- risk level.

It does not inspect the repository or execute checks. The caller must supply
all evidence.

## Status Mapping

- `passed`: no warnings or failures were found.
- `needs_review`: warnings exist, evidence is missing, or human judgment is
  needed.
- `failed`: required checks or metadata expectations failed.
- `blocked`: forbidden files or unrelated staged files appear in supplied
  metadata.

## Post-Validation Actions

The MVP can recommend:

- `continue_next_phase`,
- `retry_phase`,
- `request_human_review`,
- `freeze_scope`,
- `rollback_plan`,
- `blocked`.

Recommendations are advisory metadata only. They do not start a new task.

## Memory Proposal Boundary

Memory proposals include:

- source report reference,
- source phase,
- summary,
- error/fix learning,
- decision made,
- future rule recommendation,
- risk level,
- evidence references,
- unresolved issues,
- next phase,
- human approval requirement,
- proposal status.

The MVP does not write memory. Human approval and a separate persistence design
are required before any memory storage exists.

## Safety Boundaries

The MVP does not:

- execute Codex,
- launch processes,
- read or write files,
- read environment values,
- use network calls,
- invoke OpenClaw,
- send WhatsApp messages,
- run n8n,
- mutate dashboard state,
- call providers,
- automate git,
- mutate databases or SQL,
- deploy,
- persist memory.

## Relationship To Next Phase

Phase 26J-B should plan the next-action coordinator that consumes validation
and memory proposal metadata and prepares the next advisory phase decision.
