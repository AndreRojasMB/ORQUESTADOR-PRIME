# Multi-Channel Assistant Unification Specification

Phase: 43A-43F
Status: specification only

This document defines a unified multi-channel assistant pipeline for
ORQUESTADOR-PRIME. It is docs-only and does not add runtime routing, dispatch
wiring, external delivery, provider calls, or channel execution behavior.

## Goals

The multi-channel assistant should make WhatsApp, Omi, Dashboard, OpenClaw, CLI,
and future API requests use the same safety pipeline:

- normalize channel identity,
- apply permission checks,
- retrieve project-scoped memory safely,
- build supervisor context,
- route to allowed operations,
- audit decisions,
- return safe channel responses.

## Non-Goals

This phase must not:

- add new dispatch wiring,
- add external notification delivery,
- approve or reject proposals,
- grant or consume second approval,
- execute OpenClaw real actions,
- call providers,
- bypass channel-specific auth.

## ChannelRequestContext

Recommended shape:

- `requestId`
- `receivedAt`
- `channel`
- `identity`
- `principalHash`
- `sourceEventId`
- `project`
- `operation`
- `inputHash`
- `inputPreview`
- `redaction`
- `permission`
- `memoryContext`
- `supervisorSummary`
- `correlationId`

Raw request bodies, raw phone numbers, raw emails, tokens, profile names, and
provider payloads must not be stored.

## Shared Pipeline

1. Transport validation.
   Channel-specific auth, stable event id, replay protection, and rate limits.

2. Identity normalization.
   Build `ChannelIdentity` with hashed principal only.

3. Redaction.
   Redact request text and structured payloads before storage or logs.

4. Permission check.
   Use ChannelPermission and Permission Checker as appropriate.

5. Memory retrieval.
   Use Memory V2 safe context, project-scoped by default.

6. Supervisor context.
   Read advisory supervisor report. Do not mutate stores.

7. Operation routing.
   Route only to allowed operations such as list proposals, create proposal,
   request review, supervisor status, memory retrieval, or dry-run plan.

8. Audit.
   Append channel audit or permission audit for allowed and blocked decisions.

9. Reply formatting.
   Return safe, bounded, channel-specific responses.

## Reused Systems

The channel layer must reuse:

- `ChannelIdentity`
- `ChannelPermission`
- `ChannelAuditStore`
- Permission Checker
- Tool Registry
- Redaction Engine
- Memory V2 retrieval
- Supervisor advisory report
- Channel Action Bridge
- Jobs and Notifications where explicitly safe

## Operation Classes

Allowed early operation classes:

- `status.inspect`
- `memory.retrieve`
- `proposal.create`
- `proposal.list`
- `proposal.request_review`
- `computer.dry_run`
- `notification.inbox.list`

Blocked operation classes:

- `dispatch`
- `approve`
- `reject`
- `grant_second_approval`
- `consume_second_approval`
- `real_computer_action`
- `external_notification_deliver`
- `provider_call`

## No New Dispatch Wiring

The guarded channel dispatch wrapper exists but must remain unwired unless a
future phase explicitly enables it with:

- trusted identity,
- permission grant,
- approved proposal,
- active second approval,
- allowed category,
- real execution flag,
- pre/post audit,
- smoke tests.

This spec phase does not enable that path.

## Channel Smoke Suite

Future `channels:smoke` should use fixtures and isolated stores.

Checks:

- WhatsApp action commands still default-deny without permission,
- Omi explicit action items still default-deny without permission,
- OpenClaw real actions remain blocked,
- Dashboard remains read-only unless a later mutation phase is active,
- future API identity missing or untrusted blocks,
- memory retrieval is project-scoped,
- no raw identity leaks,
- no dispatch/approval imports in channel router.

## Traceability

Every channel decision should link:

- channel,
- principalHash,
- sourceEventId,
- operation,
- projectId,
- permission decision,
- memory retrieval ids when used,
- proposal id when created,
- channel audit id,
- correlation id.

Traceability must not expose raw identity or raw request bodies.

