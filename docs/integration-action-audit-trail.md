# Integration Action Audit Trail

Phase 13 adds a local/dev audit and evidence store for proposed integration
actions. It records the lifecycle of a proposal without executing anything.

## What This Phase Audits

Supported event types:

- `action_created`
- `validation_completed`
- `dry_run_completed`
- `approval_requested`
- `approval_approved`
- `approval_rejected`
- `action_blocked`
- `ready_for_execution`
- `execution_skipped_phase_13`
- `execution_started`
- `execution_completed`
- `execution_blocked`
- `execution_failed`

Each event records safe metadata:

- event id
- action id
- optional approval id
- integration
- action
- risk level
- status
- summary
- redacted details
- local/dev actor
- timestamp

## What This Phase Does Not Do

This phase does not:

- call provider APIs
- send WhatsApp messages
- create GitHub resources
- execute n8n workflows
- deploy through Coolify
- invoke OpenClaw
- index or query LightRAG
- call OpenAI or Anthropic models
- store provider secrets
- modify `.env.local`

Execution is explicitly recorded as `execution_skipped_phase_13`.

## Redaction Policy

Audit details are redacted before storage. Any object key matching these patterns
is replaced with `[REDACTED]`:

- `token`
- `apiKey` / `api_key`
- `password`
- `secret`
- `authorization`
- `cookie`
- `bearer`
- `webhookToken`
- `actCode`

String values that look like bearer tokens, OpenAI-style keys, GitHub classic
PATs, or GitHub fine-grained PATs are also redacted. Safe non-secret fields are
kept so the audit trail remains useful.

## Store

The default store is in-memory and local/dev only. Phase 16 adds an optional
local persistent audit store under the integration action data directory. The
persistent store redacts event details again before writing, even though the
audit trail already redacts details before appending events.

See [Integration Action Storage](integration-action-storage.md).

## Demo

Run:

```bash
npm run integrations:action:audit-demo
```

The demo creates a WhatsApp `send_message` proposal with fake sensitive fields,
then records:

1. action creation
2. validation result
3. dry-run result
4. approval request
5. approval granted
6. ready for execution
7. execution skipped for Phase 13

It prints only a safe summary, event types, and a redaction sample.

## ACT Connection

The audit trail records ACT approval lifecycle events but does not make approval
decisions itself. The approval gate owns approval state; the audit trail records
what happened so future phases can provide evidence.

## Phase 14 Executor Connection

Phase 14 executor adapters must:

- require an existing audit record before execution starts
- require a valid approved ACT decision when the action asks for approval
- append a pre-execution audit event
- execute only explicitly allowlisted actions
- redact request and response evidence
- append completed, blocked, or failed execution events
- refuse execution if audit or evidence capture fails

See [Integration Action Executors](integration-action-executors.md) for the
Phase 14 allowlist and blocked action policy.
