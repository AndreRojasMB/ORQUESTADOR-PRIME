# Sync Conflict Resolution Model

Phase: 126B - OFFLINE / CACHE / SYNC STRATEGY PLAN

Status: model plan / source-only / advisory / metadata-only

## Purpose

The Sync Conflict Resolution Model defines future metadata for conflicts that
may happen when local state and remote state differ. It describes detection,
resolution, rollback, audit, recovery, and user decision posture without
implementing storage, network, sync runtime, database access, or provider calls.

## Future Metadata Shape

Future `SyncConflictResolutionModel` should include:

- `conflictId`
- `sourceEntity`
- `conflictType`
- `detectionStrategy`
- `resolutionStrategy`
- `userDecisionRequired`
- `rollbackHint`
- `auditHint`
- `recoveryAction`
- `riskLevel`

## Conflict Types

Recommended future labels:

- `stale_read`
- `concurrent_edit`
- `deleted_remote`
- `permission_changed`
- `auth_session_changed`
- `version_mismatch`
- `inventory_changed`
- `booking_changed`
- `premium_entitlement_changed`
- `safety_status_changed`
- `provider_state_changed`

These are descriptive labels and do not inspect or compare real data.

## Detection Strategy

Future detection metadata should describe:

- version marker comparison,
- freshness window breach,
- route re-entry validation posture,
- submit-time review posture,
- auth/session boundary review,
- human review requirement,
- blocked high-risk posture.

Detection remains future-gated and must not call APIs or read local storage.

## Resolution Strategy

Future resolution metadata should describe:

- local draft preserved for review,
- remote state preferred,
- merge requires user decision,
- retry after user confirmation,
- rollback optimistic feedback,
- block until human review,
- escalate as PM risk.

High-risk domains should avoid automatic resolution.

## User Decision Required

`userDecisionRequired` should be true for:

- identity changes,
- money or premium state,
- inventory or booking changes,
- safety and report flows,
- field operation updates,
- provider-backed data,
- destructive or irreversible user intent.

## Rollback Hint

Rollback metadata should define what future UX should say and what state should
return to if a pending or optimistic action cannot be completed.

Rollback is descriptive only. No state mutation occurs in this phase.

## Audit Hint

Audit metadata should describe future evidence needs:

- source entity,
- attempted operation category,
- conflict category,
- user-facing resolution,
- review path,
- limitation note.

Audit hints must not persist records in Phase 126B.

## Recovery Action

Recommended future recovery actions:

- show stale data copy,
- return to fallback route,
- ask user to refresh manually,
- ask user to review conflict,
- discard draft with explanation,
- preserve draft for manual retry,
- contact support or reviewer,
- block action until online.

Recovery must map to Mobile UX/UI Pattern Catalog state metadata and Mobile
Navigation fallback metadata.

## Risk Guidance

Risk is higher when conflict affects:

- auth/session posture,
- permissions,
- user identity,
- marketplace transactions,
- premium entitlement,
- bookings,
- safety reports,
- field operations,
- provider-backed records.

High and critical risks should require explicit approval before future
implementation.

## Integration

The Sync Conflict Resolution Model should feed:

- Mobile State Management `sync_conflict` and `optimistic_update` categories,
- Offline Queue Model conflict policy,
- Cache strategy freshness and invalidation posture,
- UX Pattern Catalog error/offline/recovery states,
- Navigation fallback and protected-route behavior,
- PM risk and blocker metadata,
- SOLID review of state/repository/service boundaries,
- Autopilot handoff and dry-run context.

## Safety Boundaries

The model is:

- source-only,
- advisory-only,
- metadata-only,
- no storage implementation,
- no network or API calls,
- no sync runtime,
- no queue execution,
- no provider execution,
- no DB or SQL mutation,
- no app generation,
- no mobile tooling commands,
- no package changes,
- no CI activation,
- no memory persistence,
- no git automation from source.

## Future Phase Link

Phase 126I may implement this as typed metadata and pure helpers only.
