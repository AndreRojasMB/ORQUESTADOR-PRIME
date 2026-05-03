# Integration Action Storage

Phase 16 prepares local persistent stores for integration action approvals,
audit records, and target policy snapshots. These stores are local/dev only and
do not enable real integration writes.

## Storage Location

The storage path respects `ORQUESTADOR_DATA_DIR` when it is set. Otherwise it
uses the same local data root pattern already used by the project:

```text
~/.orquestador-prime/integration-actions/
```

Files:

```text
approvals.json
audit-records.json
policy-snapshots.json
```

Tests use temporary local data directories and do not read `.env.local`.

## Approval Store

`createPersistentApprovalStore` persists approval metadata. It does not persist
ACT codes in clear text. The local/dev ACT code is hashed with a per-record salt
before writing to disk, and the stored `actCode` field is `[REDACTED]`.

Persisted approval metadata includes:

- approval id
- action id
- redacted action summary
- integration and action
- risk level
- approval reasons
- status
- created, expiration, approval, or rejection timestamps

Pending approvals are treated as expired when `expiresAt` is in the past.

## Audit Store

`createPersistentAuditStore` persists audit records and redacts event details
before writing. The audit trail already redacts details before appending events;
the persistent store redacts again as a defensive layer.

The audit store must not contain:

- API keys
- provider tokens
- authorization headers
- cookies
- passwords
- webhook secrets
- ACT codes

## Policy Snapshot Store

`createPolicySnapshotStore` can store local policy snapshots for review and
tests. Policy snapshots are redacted before persistence. They are intended to
record non-secret target allowlists such as owners, repos, base URLs, and health
URLs.

## In-Memory Stores

In-memory stores remain the default for demos and tests unless a persistent
store is explicitly passed in. This keeps the existing local/dev flows simple
and avoids accidental persistence.

## Automated Tests

Run:

```bash
npm run integrations:action:test
```

The test command covers:

- validator blocking rules
- ACT approval success, failure, and expiration
- audit redaction
- execution gate audit requirement
- target policy allow/block decisions
- execution gate block decisions
- persistent approval hashing
- persistent audit redaction
- policy snapshot persistence

The command does not call provider APIs, webhooks, workflows, messages, deploys,
OpenClaw tools, LightRAG, or model providers.

## Production Gaps

Before production use, this layer still needs:

- file permissions and deployment-specific hardening
- encryption or OS-backed secret-safe storage where appropriate
- user identity and provenance on approvals
- tamper-evident audit records
- retention policy
- migrations for schema updates
- backups or export controls for compliance workflows
