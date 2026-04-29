# Computer Use and OpenClaw Safety Specification

Phase: 38A-38G
Status: specification only

This document defines the safety model for computer use and OpenClaw in
ORQUESTADOR-PRIME. It is a docs-only contract and does not add real
computer-use actions, OpenClaw execution paths, dispatch hooks, approval
behavior, or screenshot capture.

## Goals

Computer use should begin as descriptive, dry-run, and auditable. OpenClaw is a
provider/tool gateway and a computer-use substrate, not a trusted human.

The system must:

- keep OpenClaw untrusted by default,
- describe capabilities before use,
- support dry-run planning first,
- store redacted trace metadata,
- require permission, proposal approval, and second approval before any future
  real action,
- keep forbidden actions impossible,
- support red-team review and risk matrices.

## Non-Goals

This phase must not:

- click, type, drag, open applications, or control windows,
- run real OpenClaw computer actions,
- store raw screenshots by default,
- call OpenClaw from a dry-run spec unless explicitly part of a later smoke,
- add WhatsApp/Omi/OpenClaw dispatch commands,
- bypass action gates,
- approve or grant second approval,
- run deploy, git-push, PR merge, or file-delete actions.

## Trust Boundary

OpenClaw is untrusted by default.

OpenClaw may:

- provide model responses when configured,
- provide tool invocation dry-runs,
- participate in preview-only computer-use planning,
- return capability metadata.

OpenClaw must not:

- be treated as a human approver,
- grant second approval,
- dispatch actions,
- receive raw secrets through proposal parameters,
- execute repo-mutating actions by default,
- control the desktop without explicit future gates.

## Capability Registry

Computer-use capabilities should be represented in the Tool Registry and in an
OpenClaw-specific capability registry.

Recommended fields:

- `capabilityId`
- `openclawTool`
- `action`
- `description`
- `riskLevel`
- `dryRunSupported`
- `realExecutionSupported`
- `requiresScreenshot`
- `requiresKeyboard`
- `requiresMouse`
- `requiresNetwork`
- `mutatesExternalState`
- `mutatesRepo`
- `allowedTargets`
- `requiredPermissions`
- `requiredEnv`
- `forbiddenByDefault`

Initial capabilities should be dry-run only:

- `computer.inspect.plan`
- `computer.screenshot.metadata`
- `computer.click.plan`
- `computer.type.plan`
- `computer.navigate.plan`

Real variants should be registered as disabled/future-only.

## Screenshot Trace Metadata

Screenshot trace logs should start with metadata only.

Recommended fields:

- `traceId`
- `projectId`
- `createdAt`
- `source`
- `screenHash`
- `viewport`
- `windowTitlePreview`
- `urlHost`
- `redaction`
- `linkedProposalId`
- `linkedJobId`
- `storageMode`

Default `storageMode` should be `metadata-only`.

Raw screenshots are disabled by default. If a future phase stores image files,
it must define:

- retention,
- redaction,
- storage path,
- access controls,
- preview limits,
- deletion rules,
- explicit user approval.

## Dry-Run Computer Actions

Dry-run actions describe what would happen without touching the computer.

Dry-run result shape:

- `ok`
- `capabilityId`
- `dryRun: true`
- `plannedSteps`
- `riskLevel`
- `requiredApprovals`
- `blockedReasons`
- `safeSummary`
- `redaction`

Dry-run must not:

- click,
- type,
- move mouse,
- open URLs,
- run shell commands,
- mutate files,
- call external services beyond an explicitly allowed dry-run metadata endpoint.

## Future Real Action Gates

Real computer actions are disabled in this block. A future real action would
require all of these gates:

1. recognized capability,
2. OpenClaw configured,
3. explicit project-scoped permission grant,
4. trusted requester identity,
5. action proposal exists,
6. proposal status is `approved`,
7. category is not globally forbidden,
8. capability is not forbidden,
9. real execution flag is enabled for computer use,
10. active second approval exists,
11. screenshot/target context passes redaction policy,
12. no prior successful execution for the same proposal,
13. pre-action audit persisted,
14. action-specific allowlist passes,
15. post-action audit persisted.

The wrapper must not consume second approval directly unless a future design
explicitly assigns that responsibility. Existing action/execution gates should
remain final authority for repo-mutating operations.

## Forbidden Actions

Computer use must not enable:

- file deletion,
- git push,
- PR merge,
- deploy,
- credential entry,
- secret extraction,
- payment or purchasing flows,
- account deletion,
- destructive admin actions,
- bypassing CAPTCHA or security controls,
- interacting with another project by default.

Any requested forbidden action must be blocked and audited.

## Red-Team Scenarios

Future red-team tests should include:

- prompt asks OpenClaw to click an approval button,
- screenshot contains API key,
- webpage asks for credential entry,
- tool attempts to run shell command,
- proposed action targets another repo,
- notification tries to deliver raw secrets,
- job attempts computer action from background queue,
- external channel requests computer dispatch,
- second approval is missing or expired,
- capability registry marks real action unsupported.

Expected result for all: blocked or dry-run only.

## Risk Matrix

Risk dimensions:

- user intent ambiguity,
- target uncertainty,
- privacy exposure,
- credential exposure,
- external state mutation,
- repo mutation,
- reversibility,
- network impact,
- legal/financial impact,
- cross-project leakage.

Risk levels:

- `safe`: read-only metadata, no raw sensitive data.
- `review-required`: dry-run plans, screenshots metadata, target inspection.
- `high-risk`: real click/type/navigation, credential-adjacent contexts.
- `forbidden`: destructive, deploy, push, merge, delete, credential theft,
  bypassing controls, or payment/account actions.

High-risk and forbidden capabilities must be disabled by default.

## Audit Requirements

Computer-use audit records should include:

- timestamp,
- projectId,
- capabilityId,
- channel,
- principalHash,
- proposalId,
- jobId,
- decision,
- reasonCode,
- dryRun flag,
- screenshotTraceId,
- permissionGrantId,
- secondApprovalId if applicable,
- redaction metadata.

Audit records must not include raw screenshots, raw secrets, raw file content, or
raw identity.

## Verification Expectations

Future implementation should verify:

- OpenClaw capabilities default to disabled or dry-run only,
- no real OpenClaw actions are called,
- screenshot trace store uses metadata only,
- dry-run outputs contain planned steps only,
- forbidden actions block,
- missing permission blocks,
- missing proposal approval blocks,
- missing second approval blocks,
- no runtime channel imports a real computer-use wrapper,
- no dashboard dispatch or approval buttons are added.

## Integrations / Connectors Relationship

The future connector governance path is documented in
[Integrations / Connectors](integrations-connectors.md). OpenClaw and
computer-use connectors remain critical-risk, default-deny, dry-run first, and
future approval-gated. Phase 84I adds no browser automation, connector
execution, or real computer-use behavior.
