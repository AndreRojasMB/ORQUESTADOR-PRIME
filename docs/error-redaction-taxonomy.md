# Global Redaction Engine and Error Taxonomy Specification

Phase: 36G-36H
Status: specification only

This document defines a shared redaction engine and stable error taxonomy for
ORQUESTADOR-PRIME. It is a docs-only contract and does not implement runtime
logic.

## Goals

The redaction engine should provide one safe vocabulary and one shared behavior
for learning exports, Memory V2, supervisor reports, channel audit, jobs,
notifications, and computer-use traces.

The error taxonomy should make failures stable, safe to display, and useful for
audit without exposing secrets or raw identities.

## Non-Goals

This phase must not:

- change existing runtime logging behavior,
- rewrite stored data,
- call providers,
- inspect file contents automatically,
- store raw screenshots,
- expose raw request bodies,
- add action dispatch or approval behavior.

## Redaction Engine

The global redaction engine should accept strings, structured values, and small
metadata objects. It returns redacted values plus metadata that describes what
was removed.

### Redaction Result Shape

Recommended fields:

- `safePreview`: bounded redacted text.
- `redactedValue`: redacted string or structured value.
- `removedKinds`: sorted list of removed categories.
- `containsSecrets`: boolean.
- `containsRawIdentity`: boolean.
- `containsFileContent`: boolean.
- `containsRawBody`: boolean.
- `redactionVersion`: version string.
- `truncated`: boolean.

### Detection Rules

The engine should detect and redact:

- phone numbers,
- email addresses,
- tokens,
- API keys,
- bearer authorization headers,
- webhook secrets,
- `requestBody`,
- `rawBody`,
- absolute paths,
- raw transcripts,
- file content excerpts,
- provider keys,
- cookie/session values,
- account ids when marked as raw identity.

### Removed Kinds

Initial `removedKinds` vocabulary:

- `phone`
- `email`
- `token`
- `api-key`
- `authorization-header`
- `webhook-secret`
- `request-body`
- `raw-body`
- `absolute-path`
- `raw-transcript`
- `file-content`
- `provider-key`
- `cookie`
- `session`
- `raw-identity`
- `proposal-parameters`
- `execution-output`
- `screenshot`

Unknown sensitive-looking values should be marked as `secret-like`.

### Request Body and Raw Body Handling

Raw request bodies must not be stored by default.

For inbound webhook and API flows:

- use message ids or event ids for dedupe,
- store payload hashes only when needed,
- store redacted summaries,
- never store raw `requestBody` or `rawBody`,
- mark redaction metadata with `request-body` or `raw-body`.

### Absolute Paths

Raw absolute paths can reveal user, machine, workspace, or target repo details.

Default behavior:

- replace raw absolute paths with `[redacted-path]`,
- keep project-scoped hashes if needed,
- allow relative repo paths only when the target path is safe and expected.

### Transcripts

Voice and memory transcripts are high-risk because they may contain casual,
private, or ambiguous content.

Default behavior:

- do not store full transcripts in action proposals,
- do not convert vague transcript content into actions,
- store only explicit action-item safe previews,
- mark raw transcript redaction metadata when redacted.

### File Content

File content should be treated as sensitive unless explicitly scoped.

Default behavior:

- do not store full file content in jobs, notifications, audits, or memory,
- prefer hashes, paths, summaries, or previews,
- bound previews by byte and line count,
- mark `file-content` when content was removed.

## Usage Across Systems

### Learning

Learning exports should use redacted previews, not full raw tasks, outputs,
proposal parameters, or execution output. Labels remain heuristic.

### Memory

Memory V2 should store privacy labels and redaction metadata. Retrieval should
exclude unsafe redaction by default.

### Supervisor

Supervisor reports should summarize goals, actions, jobs, notifications, and
risks without raw proposal parameters or execution output.

### Jobs

Job inputs and logs must be redacted before storage. Dangerous raw payloads
should block the job or force a proposal-only path.

### Notifications

Notifications must store redacted title and summary only. External delivery
must be disabled until a later phase.

### Channels

Channel audit and channel replies should store hashed principals only and avoid
raw phone numbers, account ids, tokens, request bodies, and provider payloads.

### Computer Use

Computer-use traces should store metadata and hashes first. Raw screenshots are
disabled by default and require a future explicit policy.

## Error Taxonomy

Errors should have stable codes and safe messages.

### Error Shape

Recommended fields:

- `code`: stable dotted string.
- `severity`: `info`, `warning`, `error`, or `critical`.
- `safeMessage`: user-facing redacted message.
- `retryable`: boolean.
- `auditHint`: safe operational hint.
- `source`: subsystem name.
- `correlationId`: optional id.
- `redaction`: optional redaction metadata.

Errors must not contain raw secrets, raw request bodies, raw identity, raw file
content, or provider keys.

## Stable Codes

Initial codes:

- `permission.denied`
- `permission.expired`
- `permission.scope_mismatch`
- `tool.unknown`
- `tool.forbidden`
- `tool.env_missing`
- `redaction.unsafe`
- `job.blocked`
- `job.cancelled`
- `job.expired`
- `job.handler_unavailable`
- `notification.blocked`
- `notification.delivery_disabled`
- `computer.dry_run_only`
- `computer.approval_required`
- `computer.capability_denied`
- `computer.trace_redacted`
- `store.read_failed`
- `store.write_failed`
- `store.corrupt`
- `channel.untrusted`
- `channel.rate_limited`
- `provider.unavailable`
- `network.blocked_by_sandbox`

## Examples

`permission.denied`

- `severity`: `warning`
- `safeMessage`: `Permission denied for this capability.`
- `retryable`: false
- `auditHint`: `Check project-scoped permission grants.`

`tool.forbidden`

- `severity`: `error`
- `safeMessage`: `This tool is forbidden by default policy.`
- `retryable`: false
- `auditHint`: `Global forbidden categories override grants.`

`redaction.unsafe`

- `severity`: `warning`
- `safeMessage`: `Payload contains sensitive data and cannot be stored safely.`
- `retryable`: true
- `auditHint`: `Remove raw identity, secrets, request bodies, or file content.`

`job.blocked`

- `severity`: `warning`
- `safeMessage`: `Job blocked by safety policy.`
- `retryable`: false
- `auditHint`: `Dangerous jobs must become proposals or remain blocked.`

`notification.blocked`

- `severity`: `warning`
- `safeMessage`: `Notification blocked by delivery policy.`
- `retryable`: false
- `auditHint`: `External delivery is disabled in this phase.`

`computer.dry_run_only`

- `severity`: `warning`
- `safeMessage`: `Computer-use capability is available only as dry-run.`
- `retryable`: false
- `auditHint`: `Real computer actions require future approval gates.`

`computer.approval_required`

- `severity`: `warning`
- `safeMessage`: `Computer action requires proposal approval and second approval.`
- `retryable`: true
- `auditHint`: `Use proposal and review flow before real action.`

`store.read_failed`

- `severity`: `warning`
- `safeMessage`: `Store could not be read; using safe empty defaults.`
- `retryable`: true
- `auditHint`: `Inspect local store path and permissions.`

`store.write_failed`

- `severity`: `error`
- `safeMessage`: `Store could not be written; operation did not persist.`
- `retryable`: true
- `auditHint`: `Fail closed if persistence is required.`

## Logging Rules

Logs should include:

- stable error code,
- safe message,
- subsystem,
- ids and hashes,
- redaction metadata.

Logs should not include:

- raw tokens,
- raw phone or email,
- raw request bodies,
- raw transcripts,
- raw provider responses containing secrets,
- full proposal parameters,
- full execution output,
- raw screenshots.

## Verification Expectations

Future implementation should verify:

- sensitive fixtures are redacted,
- redaction metadata is stable,
- safe previews are bounded,
- errors use stable codes,
- no raw secrets appear in logs, notifications, jobs, audit, learning exports,
  memory retrieval, or computer-use traces.

