# Task Queue and Notification Inbox Specification

Phase: 37A-37G
Status: specification only

This document defines a local task queue, safe scheduler model, job runner
boundaries, notification inbox, and notification delivery policy. It is a
docs-only contract and does not add runtime logic, daemon processes, dispatch
paths, or external notification delivery.

## Goals

The queue and notification system should let ORQUESTADOR-PRIME track work and
surface outcomes without creating hidden autonomy.

The system must:

- store queued work locally,
- stay project-scoped,
- default to safe handlers only,
- avoid dangerous autonomous execution,
- redact before storage,
- make blocked jobs visible,
- keep notifications local first.

## Non-Goals

This phase must not:

- create a background daemon,
- schedule real repo mutation,
- dispatch approved actions,
- approve or reject proposals,
- grant or consume second approvals,
- deliver notifications externally,
- call OpenClaw real computer-use actions,
- bypass permission checks.

## Task Queue Store

Recommended local store:

- Path: `~/.orquestador-prime/jobs.json`
- Version: `1.0`
- Append-friendly records with bounded retention
- Non-fatal reads
- Write failures should block enqueue or mark persistence failed

## Job States

Allowed states:

- `queued`: created but not started.
- `scheduled`: waiting for `runAt`.
- `running`: currently being handled.
- `succeeded`: completed safely.
- `failed`: handler failed.
- `blocked`: safety policy denied execution.
- `cancelled`: explicitly cancelled.
- `expired`: no longer eligible to run.

State transitions must be explicit and audited. Unknown states fail closed.

## Job Shape

Recommended fields:

- `jobId`
- `version`
- `projectId`
- `createdAt`
- `updatedAt`
- `runAt`
- `expiresAt`
- `status`
- `kind`
- `requestedBy`
- `subjectHash`
- `source`
- `inputPreview`
- `inputHash`
- `redaction`
- `permissionGrantId`
- `attempts`
- `maxAttempts`
- `lastErrorCode`
- `resultSummary`
- `logs`
- `correlationId`

Raw inputs should not be stored. Store bounded redacted previews and hashes.

## Job Kinds

Safe initial job kinds:

- `supervisor.status`
- `memory.v2.retrieve`
- `learning.export`
- `notification.create`
- `tool.registry.inspect`
- `permission.audit.inspect`

Dangerous or future-only job kinds:

- `action.dispatch`
- `repo.file_write.real`
- `repo.git_branch.real`
- `computer.action.real`
- `external.notification.deliver`

Dangerous jobs must be blocked or converted into action proposals in a later
explicit phase. They must not run directly from the queue.

## Scheduler Model

The first scheduler should be explicit and non-daemon:

- read jobs,
- select eligible jobs,
- evaluate permission and safety policy,
- run only safe handlers,
- mark blocked jobs with stable error codes,
- update job status and logs,
- exit.

No persistent background process should be added in this block. Any future
daemon needs a separate safety review and stop mechanism.

## Job Runner

The runner must:

- use the Tool Registry to identify capability risk,
- use Permission Checker before non-trivial work,
- reject unknown job kinds,
- reject missing project scope,
- reject unsafe redaction,
- reject dangerous categories,
- avoid provider calls unless the specific safe handler permits them,
- never call `dispatchAction`,
- never approve or grant second approval,
- write redacted logs only.

## Retries

Retries are allowed only for safe, idempotent jobs.

Rules:

- retry count must be bounded,
- retry delay must be explicit,
- blocked jobs are not retried automatically,
- expired jobs are not retried,
- permission-denied jobs are not retried automatically,
- retry logs must not include raw payloads.

## Cancellation

Cancellation should be explicit:

- only queued or scheduled jobs can be cancelled by default,
- running jobs may be marked cancellation requested in a future phase,
- cancellation does not delete audit history,
- cancellation reason is redacted.

## Job Logs

Job logs should store:

- timestamp,
- event type,
- stable error code when applicable,
- safe summary,
- redaction metadata,
- related ids.

Job logs must not store:

- raw request bodies,
- raw proposal parameters,
- execution output,
- provider keys,
- raw screenshots,
- raw file content.

## Notification Inbox

Notifications are local records for human visibility. They are not external
messages in this phase.

Recommended local store:

- Path: `~/.orquestador-prime/notifications.json`
- Version: `1.0`
- Project-scoped records
- Bounded retention
- Non-fatal reads

## Notification Shape

Recommended fields:

- `notificationId`
- `projectId`
- `createdAt`
- `updatedAt`
- `kind`
- `severity`
- `title`
- `summary`
- `source`
- `links`
- `redaction`
- `readAt`
- `dismissedAt`
- `expiresAt`
- `deliveryPolicy`

The title and summary must be redacted before storage.

## Notification Kinds

Initial kinds:

- `job.succeeded`
- `job.failed`
- `job.blocked`
- `permission.blocked`
- `channel.blocked`
- `computer.dry_run`
- `memory.retrieval`
- `learning.export`
- `supervisor.recommendation`

## Delivery Policy

Default delivery policy:

- local inbox only,
- no WhatsApp delivery,
- no Omi delivery,
- no email,
- no API callbacks,
- no desktop notifications,
- no dashboard mutation controls.

Future external delivery must require:

- explicit permission,
- project scope,
- channel trust,
- redaction,
- rate limit,
- delivery audit.

## Dashboard and CLI Future Visibility

Future visibility surfaces may include:

- `notification:list` read-only CLI,
- dashboard notification page,
- job status page,
- supervisor summary integration.

These surfaces must stay read-only until a later phase explicitly adds
acknowledge/dismiss behavior.

## Dangerous Jobs

Dangerous jobs include:

- file deletion,
- git push,
- PR merge,
- deploy,
- real computer actions,
- real repo mutation,
- external message delivery,
- arbitrary shell execution.

Dangerous jobs must be blocked by default. If a user wants such work, the safe
path is proposal creation, review, second approval where applicable, and
existing execution gates.

## Verification Expectations

Future implementation should verify:

- missing stores return empty defaults,
- enqueue uses redacted previews,
- safe handlers run in isolated HOME smoke tests,
- dangerous jobs become blocked,
- no daemon starts,
- notification store is local-only,
- no external delivery happens,
- source stores are unchanged for read-only handlers,
- negative grep for dispatch, approvals, second approval, provider calls, and
  OpenClaw real actions remains clean.

## Automation Deeper Relationship

The deeper native automation path is documented in
[Native automation engine deeper](native-automation-engine-deeper.md).
Automation scheduling and automation notifications remain future work and must
not bypass safe job rules, dangerous job blocking, local-only notification
policy, approval gates, or runtime readiness checks. Phase 80I is docs-only and
adds no scheduler, queue worker, workflow persistence, notification delivery,
or automation execution.

## Dashboard / Control Center Relationship

The future Dashboard / Control Center path is documented in
[Dashboard / Control Center](dashboard-control-center.md). Jobs and
notifications may later appear as read-only status and inbox views, but those
views must not execute jobs, deliver notifications, activate schedulers or
workers, mutate queues, or bypass safe job rules.
