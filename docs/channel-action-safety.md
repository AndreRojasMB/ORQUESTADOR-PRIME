# Channel Action Safety Specification

Phase: 33A-CHANNEL-SAFETY-SPEC
Status: specification only

This document defines how external channels may interact with the controlled
actions layer without gaining direct dangerous autonomy. It is intentionally a
docs-only contract: it does not create runtime paths, dispatch hooks, approvals,
or channel-side execution.

## Scope

External channels in scope:

- WhatsApp
- Omi / voice
- OpenClaw / computer-use substrate
- Dashboard
- Future API channel

Existing safety surfaces that must be preserved:

- 32A action proposal model
- 32B git-branch real execution gates
- 32C file-write preview safety
- 32D real file-write dual-gate safety
- 32E audit:ux read-only improvements
- CLI-only dispatch unless a later phase explicitly adds a guarded channel path

External channels must not directly execute dangerous actions. They may only:

1. create action proposals,
2. request review,
3. show pending approvals,
4. trigger dispatch only through a future guarded wrapper when every safety gate
   already exists and allows it.

## Terminology

The existing action layer defines:

- `ActionSource`: `cli`, `whatsapp`, `omi`, `dashboard`, `openclaw`, `system`
- `ActionCategory`: `file-write`, `file-delete`, `git-branch`, `git-push`,
  `pr-create`, `pr-merge`, `tool-invoke`, `deploy`, `config-change`,
  `notification`, `query`, `other`
- `ActionStatus`: `proposed`, `classified`, `pending-approval`, `approved`,
  `rejected`, `expired`, `executed`, `failed`
- `ExecutionOutcome`: `success`, `failure`, `dry-run`, `deferred`, `blocked`
- `SecondApproval`: single-use, short-lived, parameter-bound authorization

## ChannelIdentity

`ChannelIdentity` is the normalized identity attached to every external channel
request before it reaches the action layer.

Required fields:

- `channel`: `whatsapp`, `omi`, `dashboard`, `openclaw`, `api`, or `system`
- `principalHash`: hash of the user/device/token identity; raw secrets must not
  be persisted
- `displayName`: optional human-facing label
- `sourceEventId`: deduplication key from the external channel, when available
- `authMethod`: hook token, HMAC signature, local session, API token, provider
  token, or none
- `trusted`: boolean derived from channel-specific verification
- `trustReason`: short reason for trust or distrust
- `receivedAt`: ISO timestamp

Rules:

- Raw phone numbers, voice transcript account ids, API tokens, webhook secrets,
  and provider credentials must never be logged or persisted.
- Missing identity means untrusted.
- Unknown channel means untrusted.
- Trusted transport does not imply permission to dispatch.

## ChannelPermission

`ChannelPermission` is an explicit allowlist over capabilities and categories.

Recommended shape:

- `canCreateProposal`
- `canRequestReview`
- `canListPending`
- `canGrantSecondApproval`
- `canDispatchApproved`
- `allowedProposalCategories`
- `allowedDispatchCategories`
- `forbiddenCategories`
- `maxProposalsPerHour`
- `maxDispatchesPerHour`

Default values:

- All booleans false.
- All allowed category lists empty.
- Forbidden categories always include the global forbidden set.
- Rate limits default to zero unless explicitly configured.

Permission checks must be evaluated after identity verification and before any
action store mutation.

## ChannelActionBridge Responsibilities

Future runtime work should introduce a single guarded bridge between external
channels and `src/actions/*`.

Responsibilities:

- Normalize `ChannelIdentity`.
- Load channel permissions.
- Apply default-deny policy.
- Validate the requested operation.
- Validate category allowlists and forbidden category denylist.
- Create proposals through the existing action store.
- Submit proposals for review through the existing approval bridge.
- List pending proposals without exposing secrets.
- Dispatch only through a future guarded wrapper, never by exposing
  `dispatchAction` directly to channels.
- Emit a channel audit decision for every allowed or blocked request.

The bridge must not:

- bypass `approveProposal`,
- bypass `SecondApproval`,
- mutate proposal parameters after approval,
- directly call repo-mutating executors,
- create file-delete, git-push, pr-merge, or deploy paths,
- auto-approve proposals.

## ChannelAuditStore Responsibilities

Future runtime work should add an append-only audit store for external channel
decisions.

Each entry should record:

- timestamp
- channel
- principalHash
- sourceEventId
- requested operation
- requested category
- proposalId, if any
- decision: allowed or blocked
- block reason, if blocked
- identity trust status
- permission snapshot summary
- real execution flag state
- second approval id, if consumed by a future guarded dispatch

The audit store must avoid raw secrets and raw channel identifiers.

## Default-Deny Policy

External channel action access is denied unless all of the following are true:

1. the channel is recognized,
2. identity is trusted,
3. the operation is explicitly allowed for that channel,
4. the action category is explicitly allowed for that operation,
5. the action category is not globally forbidden,
6. the request passes channel-specific validation,
7. the action layer's existing gates also pass.

Any parse error, missing config, unknown identity, unknown category, expired
approval, malformed parameters, or store read failure must fail closed.

## Trusted And Untrusted Channel Rules

Trusted means the transport and principal passed channel-specific checks. It
does not mean the channel may execute.

Untrusted channels may receive only generic rejection responses. They must not
receive proposal details, pending approval contents, execution logs, or internal
paths.

Trusted channels still require explicit permissions for each operation.

## WhatsApp Rules

Current WhatsApp safety already includes hook-token verification, allowed phone
numbers, rate limiting, replay protection, safe modes, and hashed sender audit.

Future WhatsApp action support should be limited to:

- create proposal,
- request review,
- list pending proposals in a short redacted summary.

WhatsApp must not:

- grant second approval by default,
- dispatch approved actions by default,
- run `execute` mode unless separately approved in config,
- expose file contents or secret-like parameter values,
- accept ambiguous natural-language approval as a real approval.

Recommended first categories:

- `query`
- `notification`
- `git-branch` proposal only
- `file-write` proposal only, with compact preview summary

## Omi / Voice Rules

Current Omi behavior is ingestion only. It validates webhooks, checks configured
event types, deduplicates memory ids, and appends memory entries.

Voice is inherently ambiguous. Omi should remain memory-only by default.

Future Omi action-item support may create proposals from explicit action items,
but only when enabled with a dedicated permission and category allowlist.

Omi must not:

- approve proposals,
- grant second approval,
- dispatch actions,
- infer dangerous intent from passive transcript text,
- execute from action items without a separate human review path.

## OpenClaw Rules

OpenClaw is a computer-use substrate and provider/tool gateway, not a trusted
human identity by itself.

OpenClaw may be used for:

- provider calls,
- dry-run `tool-invoke` proposals,
- preview-only tool checks.

OpenClaw must not:

- approve proposals,
- grant second approval,
- dispatch repo-mutating actions,
- receive raw secrets through proposal parameters,
- be treated as a human approver.

Any future `tool-invoke` real execution must have its own allowlist and remain
separate from repo-mutating execution.

## Dashboard Rules

Current dashboard action behavior is read-only visibility. It shows proposals,
dispatch results, second approvals, and real-execution flag status.

Dashboard may later support:

- filtering and viewing proposals,
- redacted preview display,
- local-only review actions,
- second-approval visibility.

Dashboard must not add a real dispatch button unless a later phase explicitly
implements the guarded channel dispatch wrapper.

Dashboard approval actions, if added, must record an authenticated local actor
and must not auto-dispatch.

## Future API Rules

The future API channel must use explicit authentication such as HMAC or scoped
API tokens.

API tokens should be scoped by:

- channel name,
- principal,
- allowed operations,
- allowed categories,
- optional repository or project scope,
- expiry.

The future API should default to proposal creation and pending-list visibility
only. Dispatch must stay disabled until the guarded wrapper phase and must
require a dispatch-specific scope.

## Forbidden Categories

These categories are globally forbidden for external channel dispatch:

- `file-delete`
- `git-push`
- `pr-merge`
- `deploy`

No channel config may remove these from the forbidden set. A future change to
this list requires an explicit reviewed code change and a new safety phase.

## Proposal-Only Vs Dispatch-Approved

Proposal-only means a channel can create an `ActionProposal` or ask that it be
submitted for review. No side effect happens beyond the action store write and
audit log entry.

Dispatch-approved means a future guarded wrapper may call the existing
dispatcher only after all gates pass.

Dispatch-approved is not equivalent to approved proposal status. It requires:

- proposal status is `approved`,
- category is not forbidden,
- channel permission allows dispatch,
- `ACTIONS_REAL_EXECUTION_ENABLED=true`,
- category is in the hard-coded real execution allowlist,
- valid active second approval exists and is consumed,
- proposal parameters match the second approval hash,
- no prior successful execution exists,
- action executor invariants pass.

## Second Approval Boundaries

Second approval remains a human boundary. It is single-use, short-lived, and
bound to proposal parameters.

External channels must not grant second approval by default.

If a future phase allows any channel to request or grant second approval, it
must:

- require trusted identity,
- require explicit channel permission,
- use a short TTL,
- bind to the current proposal parameter hash,
- log the actor and source event id,
- never grant for forbidden categories,
- never consume approval outside the guarded dispatch wrapper.

## Fail-Closed Behavior

Every layer must prefer blocked over ambiguous.

Fail closed on:

- missing config,
- malformed request,
- unknown channel,
- untrusted identity,
- absent permission,
- category not in allowlist,
- forbidden category,
- missing proposal,
- proposal not approved,
- expired proposal,
- missing or expired second approval,
- second approval parameter-hash drift,
- prior successful execution,
- real execution flag disabled,
- real execution category not hard-coded allowlisted,
- executor validation failure,
- audit store write uncertainty when the operation would dispatch.

For proposal creation, audit store write failure may be non-fatal only if the
main action store write remains visible and a logger warning is emitted. For
dispatch, audit uncertainty should block.

## Threat Model

Primary threats:

- spoofed channel identity,
- replayed webhook events,
- prompt injection through channel text,
- voice transcription ambiguity,
- overbroad API tokens,
- compromised dashboard session,
- OpenClaw tool injection,
- category confusion between preview and real execution,
- proposal parameter drift after approval,
- repeated dispatch of the same proposal,
- leakage of raw phone numbers, tokens, file contents, or secrets.

Mitigations:

- hashed identities only,
- hook token / HMAC / token verification,
- source event deduplication,
- per-channel rate limits,
- default-deny permission config,
- global forbidden category denylist,
- explicit proposal lifecycle,
- existing approval and second-approval gates,
- parameter hashing,
- idempotency via execution result store,
- redacted dashboard/channel summaries,
- append-only audit decisions.

## Audit Log Requirements

External channel audit logs must be sufficient to answer:

- who requested the operation, without storing raw secrets,
- which channel delivered it,
- which proposal was affected,
- which category was requested,
- whether the request was allowed or blocked,
- which permission/gate decided the outcome,
- whether a second approval was present or consumed,
- whether real execution was enabled,
- what execution result id was produced, if any.

Audit entries must be append-only and bounded by rotation.

## Smoke Tests For Future Phases

Identity/config:

- unknown channel is blocked,
- known channel with missing identity is blocked,
- trusted identity without permission is blocked,
- forbidden category is blocked even when channel allows all non-forbidden categories.

Proposal bridge:

- trusted WhatsApp proposal command creates an action proposal,
- proposal stores `source=whatsapp` and source event id,
- duplicate source event id does not create duplicate proposals,
- Omi remains memory-only when action-items permission is disabled.

Channel audit:

- allowed proposal request writes an audit decision,
- blocked request writes a block reason,
- raw phone/API token values never appear in audit JSON.

Dashboard visibility:

- channel/source/decision metadata appears read-only,
- no dispatch control is present before 33H.

Guarded dispatch wrapper:

- env flag false blocks dispatch,
- missing channel dispatch permission blocks dispatch,
- forbidden category blocks dispatch,
- missing second approval blocks dispatch,
- expired second approval blocks dispatch,
- parameter drift blocks dispatch,
- prior success blocks repeat dispatch,
- successful dispatch logs channel actor and execution result.

## Phased Implementation Roadmap

### 33B Identity And Config

Add channel identity and permission types plus default-deny config. No channel
behavior change.

### 33C Channel Audit

Add append-only channel audit storage and helpers. Wire no dispatch paths.

### 33D Proposal Bridge

Add `ChannelActionBridge` for guarded proposal creation, review requests, and
pending-list reads. No dispatch.

### 33E Dashboard Visibility

Expose channel identity, permissions, and audit decisions in the dashboard as
read-only information.

### 33F WhatsApp Proposal/List

Allow trusted WhatsApp users to create proposals, request review, and list
pending proposals through the guarded bridge. No dispatch.

### 33G Omi Action-Items

Optionally convert explicit Omi action items into proposals when enabled. Keep
Omi dispatch disabled.

### 33H Guarded Dispatch Wrapper

Introduce the only channel-aware dispatch entry point. It must evaluate channel
identity, permissions, forbidden categories, real execution flag, hard-coded
category allowlist, approval status, second approval, idempotency, and executor
invariants before delegating to the existing dispatcher.

## Non-Goals

- No file-delete.
- No git-push from channels.
- No PR merge.
- No deploy.
- No direct external call to `dispatchAction`.
- No auto-approval.
- No runtime change in this phase.

## Automation Deeper Relationship

The deeper native automation path is documented in
[Native automation engine deeper](native-automation-engine-deeper.md).
Automation execution must remain approval-gated and separate from direct action
dispatch. Phase 80I is docs-only and adds no channel dispatch path, approval
execution, workflow activation, webhook listener, connector behavior, or
runtime wiring.
