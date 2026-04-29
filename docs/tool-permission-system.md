# Tool Registry and Permission System Specification

Phase: 36A-36F
Status: specification only

This document defines the Tool Registry / Capability Registry and the explicit
permission system for ORQUESTADOR-PRIME. It is a docs-only contract: it does not
add runtime permission checks, new execution paths, proposal bridges, dispatch
hooks, approval behavior, or background jobs.

## Goals

The registry and permission system should make every operational capability
visible, classifiable, and default-denied before it can be called from channels,
jobs, computer-use flows, or future APIs.

The system must:

- describe tools before executing them,
- make risk visible,
- require explicit permissions for sensitive capabilities,
- preserve global forbidden action categories,
- audit allow/block decisions,
- avoid raw identity and secret persistence,
- remain compatible with the existing action proposal and channel safety model.

## Non-Goals

This phase must not:

- call `dispatchAction`,
- approve or reject proposals,
- grant or consume second approvals,
- execute OpenClaw computer-use actions,
- create a background daemon,
- bypass existing `externalChannels` gates,
- widen real execution categories,
- allow forbidden actions through a permission grant.

## Tool Registry

The Tool Registry is a descriptive catalog of available capabilities. It is not
an executor. A registered tool entry only says what a capability is, what risk it
carries, and what checks must pass before any caller may use it.

### Registry Entry Shape

Recommended fields:

- `toolId`: stable unique id such as `actions.create_proposal`.
- `capability`: broad capability such as `action.proposal.create`.
- `category`: action-like category such as `query`, `notification`,
  `tool-invoke`, `file-write`, `git-branch`, or `computer-use`.
- `riskLevel`: `safe`, `review-required`, or `forbidden`.
- `mutatesRepo`: true when the tool can change repository contents, branches,
  commits, or working tree state.
- `networkAccess`: true when the tool can make outbound network requests.
- `externalService`: provider or service name when applicable.
- `requiresApproval`: true when human approval is required before execution.
- `allowedChannels`: channels that may request the capability.
- `requiredPermissions`: permission names or capability grants required.
- `requiredEnv`: environment variables needed for availability, by name only.
- `dryRunSupported`: true when the tool can preview without mutation.
- `realExecutionSupported`: true only when real execution exists and remains
  behind its own gates.
- `forbiddenByDefault`: true for dangerous or unreviewed capabilities.

### Example Entries

`actions.create_proposal`

- `capability`: `action.proposal.create`
- `category`: `query`
- `riskLevel`: `review-required`
- `mutatesRepo`: false
- `networkAccess`: false
- `requiresApproval`: false for proposal creation, true for later execution
- `allowedChannels`: `whatsapp`, `omi`, `dashboard`, `api`
- `dryRunSupported`: true
- `realExecutionSupported`: false
- `forbiddenByDefault`: true until channel permission allows it

`repo.file_write.preview`

- `capability`: `repo.file_write.preview`
- `category`: `file-write`
- `riskLevel`: `review-required`
- `mutatesRepo`: false
- `networkAccess`: false
- `requiresApproval`: true for real execution, false for preview
- `allowedChannels`: `cli`, `dashboard`
- `dryRunSupported`: true
- `realExecutionSupported`: false for preview entry
- `forbiddenByDefault`: true

`openclaw.computer.dry_run`

- `capability`: `computer.action.plan`
- `category`: `computer-use`
- `riskLevel`: `review-required`
- `mutatesRepo`: false
- `networkAccess`: true
- `externalService`: `openclaw`
- `requiresApproval`: false for dry-run planning
- `allowedChannels`: `cli`, `dashboard`
- `requiredEnv`: `OPENCLAW_GATEWAY_TOKEN`
- `dryRunSupported`: true
- `realExecutionSupported`: false
- `forbiddenByDefault`: true

`repo.git_push`

- `capability`: `repo.git.push`
- `category`: `git-push`
- `riskLevel`: `forbidden`
- `mutatesRepo`: true
- `networkAccess`: true
- `requiresApproval`: true
- `allowedChannels`: []
- `dryRunSupported`: false
- `realExecutionSupported`: false
- `forbiddenByDefault`: true

Global forbidden categories still override this entry and must block it.

## Capability Categories

Initial capability families:

- `action.proposal.*`
- `action.review.*`
- `action.dispatch.*`
- `repo.file_write.*`
- `repo.git_branch.*`
- `repo.pr_create.*`
- `provider.call.*`
- `memory.v2.*`
- `learning.export.*`
- `supervisor.status.*`
- `notification.inbox.*`
- `job.queue.*`
- `computer.action.*`
- `tool.registry.*`
- `permission.*`

Each capability should be stable enough to appear in audit logs and permission
grants.

## Permission System

Permissions are explicit local grants. They answer the question: "May this
subject use this capability in this project, under these conditions, before this
expiration?"

Permissions do not replace action approvals, second approvals, or execution
bridges. They are an additional gate before a capability is used.

## Permission Store

Recommended local store:

- Path: `~/.orquestador-prime/permissions.json`
- Version: `1.0`
- Append-friendly records with stable ids
- Non-fatal reads
- Safe write failures that block the attempted permission-dependent operation

### Permission Grant Shape

Recommended fields:

- `grantId`: stable local id.
- `subjectKind`: `user`, `channel`, `agent`, `job`, `system`, or `api-client`.
- `subjectHash`: hash of the principal; never raw phone, email, token, or
  account id.
- `role`: optional role such as `owner`, `operator`, `viewer`, or `automation`.
- `projectId`: project identity. Required unless a future global grant is
  explicitly approved.
- `toolId`: optional specific tool id.
- `capability`: optional broad capability.
- `scopes`: list of scope strings such as `project:current`,
  `channel:whatsapp`, or `repo:preview-only`.
- `conditions`: structured constraints.
- `expiresAt`: ISO timestamp.
- `maxUses`: integer or null.
- `usedCount`: integer.
- `createdAt`: ISO timestamp.
- `createdBy`: safe actor string.
- `reason`: redacted reason.
- `status`: `active`, `expired`, `revoked`, or `consumed`.

At least one of `toolId` or `capability` must be present.

### Conditions

Conditions may include:

- allowed channels,
- allowed action categories,
- allowed project id,
- dry-run only,
- no network,
- max file count,
- max bytes,
- allowed roots,
- required second approval,
- required proposal status,
- allowed time window,
- allowed notification severity.

Unknown conditions must fail closed until supported.

## Roles

Roles are convenience labels, not bypasses.

Suggested roles:

- `viewer`: read-only status, inbox, and summaries.
- `operator`: may request proposals and safe dry-runs when explicitly granted.
- `maintainer`: may use repo preview tools when explicitly granted.
- `owner`: may create permission grants in a future phase.
- `automation`: may enqueue safe jobs only when explicitly granted.

No role can override global forbidden categories.

## Permission Checker Contract

The checker receives:

- subject identity,
- project identity,
- requested `toolId` or `capability`,
- requested category,
- requested operation,
- channel, if any,
- dry-run/real-execution intent,
- current time,
- optional proposal/job ids.

It returns:

- `allowed`: boolean.
- `reasonCode`: stable reason code.
- `safeMessage`: redacted human-readable message.
- `matchedGrantId`: id or null.
- `audit`: redacted decision payload.
- `expiresAt`: relevant expiration if allowed.

The checker must fail closed when:

- identity is missing,
- subject hash is missing,
- project id is missing,
- store read fails,
- grant is expired, revoked, consumed, over max uses, or wrong project,
- requested capability is unknown,
- registry marks the capability forbidden,
- category is globally forbidden,
- conditions are unsupported or unmet.

## Default-Deny Policy

Default-deny applies at every level:

- unknown tool: denied,
- unknown capability: denied,
- missing grant: denied,
- missing project scope: denied,
- expired grant: denied,
- unknown condition: denied,
- missing required env: unavailable,
- global forbidden category: denied.

## Forbidden Actions Override Everything

The global forbidden action categories are:

- `file-delete`
- `git-push`
- `pr-merge`
- `deploy`

No registry entry, permission grant, role, job, channel, or computer-use flow can
enable these categories unless a future roadmap phase explicitly changes the
global forbidden set with its own review and smoke tests.

## Permission Audit

Every permission decision should be auditable.

Audit fields:

- timestamp,
- subjectKind,
- subjectHash,
- projectId,
- toolId,
- capability,
- category,
- channel,
- decision: `allowed` or `blocked`,
- reasonCode,
- matchedGrantId,
- grant status,
- safeMessage,
- correlationId,
- jobId or proposalId if present.

Audit logs must not store raw identity, raw request bodies, provider tokens, or
proposal parameters.

## Integration Boundaries

The permission checker may be used by:

- channel bridges,
- task queue handlers,
- notification policy,
- OpenClaw dry-run/real-action gates,
- future dashboard controls,
- future API routes.

It must not directly execute actions. Callers remain responsible for using
existing proposal, approval, second approval, dispatch, and execution bridges.

## Verification Expectations

Future implementation should verify:

- registry is static/read-only by default,
- default-deny blocks unknown capabilities,
- explicit grants are project-scoped,
- expired/revoked grants block,
- global forbidden categories block even with a grant,
- audit entries are redacted,
- no `dispatchAction`, approval, or second-approval behavior is added by the
  registry or permission checker.

## Integrations / Connectors Relationship

The future connector governance path is documented in
[Integrations / Connectors](integrations-connectors.md). Connector permissions
should build on tool capability risk, scopes, and default-deny policy, but they
also need credential requirements, connector audit policy, dry-run contracts,
and approval gates before any execution path exists.
