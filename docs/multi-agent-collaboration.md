# Multi-Agent Collaboration Specification

Phase: 39A-39F
Status: specification only

This document defines traceable multi-agent collaboration for ORQUESTADOR-PRIME.
It is docs-only and does not add runtime agents, provider calls, action
dispatch, approval behavior, or automatic code changes.

## Goals

Multi-agent collaboration should improve review quality without creating hidden
autonomy. The first implementation should be deterministic and local:

- collect review inputs,
- run local critic/security/QA review logic,
- produce advisory findings,
- aggregate a consensus decision,
- persist or export redacted traces when explicitly requested.

Provider-backed reviewers are future work.

## Non-Goals

This phase family must not:

- call model providers,
- modify source files,
- create proposals automatically,
- approve or reject proposals,
- dispatch actions,
- grant or consume second approval,
- treat consensus as permission,
- treat reviewer agreement as human approval.

## MultiAgentTrace

`MultiAgentTrace` is a project-scoped, redacted collaboration record.

Recommended fields:

- `traceId`
- `version`
- `projectId`
- `projectName`
- `projectRootHash`
- `createdAt`
- `updatedAt`
- `source`
- `requestHash`
- `requestPreview`
- `reviewMode`
- `reviewers`
- `reviews`
- `consensus`
- `linkedTrajectoryIds`
- `linkedProposalIds`
- `linkedJobIds`
- `redaction`
- `correlationId`

Trace records must not include raw prompts, full provider outputs, secrets,
raw channel identities, raw screenshots, raw execution output, or proposal
parameters.

## AgentReview

`AgentReview` is the output of one reviewer.

Recommended fields:

- `reviewId`
- `reviewer`
- `reviewerKind`
- `createdAt`
- `decision`
- `confidence`
- `findings`
- `riskLevel`
- `requiredFollowups`
- `blockedShortcuts`
- `safeSummary`
- `redaction`

Decisions:

- `pass`
- `warn`
- `needs-review`
- `block`

Findings should be bounded and should cite safe file paths or identifiers when
available. Findings should not quote raw secrets or large file contents.

## Reviewers

Initial reviewers should be deterministic local reviewers:

- Critic reviewer:
  Checks clarity, completeness, contradictions, unsupported assumptions,
  missing verification, and roadmap drift.

- Security reviewer:
  Checks secret exposure, forbidden actions, permission bypasses, unsafe
  channels, dispatch/approval imports, OpenClaw risk, and privacy issues.

- QA reviewer:
  Checks test gaps, smoke coverage, regression risk, typecheck/build coverage,
  and edge cases.

Future provider-backed reviewers may be added only after a separate phase
defines provider budget, trace redaction, prompt boundaries, and opt-in config.

## ConsensusDecision

`ConsensusDecision` aggregates reviews. It is advisory only.

Recommended fields:

- `decision`: `pass`, `warn`, `needs-review`, or `block`
- `reasonCodes`
- `reviewerVotes`
- `highestRiskLevel`
- `requiredFollowups`
- `safeSummary`
- `advisoryOnly: true`

Consensus must not:

- approve a proposal,
- reject a proposal,
- grant second approval,
- consume second approval,
- dispatch an action,
- override Permission Checker,
- override channel permission,
- override global forbidden categories.

## Consensus Rules

Suggested deterministic rules:

- Any security `block` makes consensus `block`.
- Any forbidden action finding makes consensus `block`.
- Any missing verification for a risky change makes consensus `needs-review`.
- Any QA warning with no blocker makes consensus `warn`.
- All reviewers passing makes consensus `pass`.

When in doubt, consensus should prefer `needs-review`.

## Storage

If a trace store is added later:

- path: `~/.orquestador-prime/multi-agent-traces.json`
- version: `1.0`
- retention cap: 1000 traces
- project-scoped
- append-only preferred
- redacted request previews only

The first code slice may export traces to stdout before adding persistence.

## Verification

Future implementation smoke should verify:

- critic/security/QA reviewers produce deterministic reviews,
- consensus is advisory only,
- dangerous requests produce `block`,
- no provider imports or calls,
- no action/approval/dispatch imports,
- no raw secrets in traces,
- project scoping works,
- missing or corrupt stores fail closed or empty.

