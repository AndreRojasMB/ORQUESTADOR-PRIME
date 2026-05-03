# Integration Action Approval Gate

Phase 12 adds a local ACT approval gate for `ProposedIntegrationAction`. It
does not execute actions. Approval only changes local action state from pending
to approved so a future executor can decide whether it is allowed to proceed.

Phase 13 records approval lifecycle events in the local audit trail. See
[Integration Action Audit Trail](integration-action-audit-trail.md).

Phase 20 adds a local/dev Viernes and WhatsApp approval UX. It formats approval
messages, parses approval/rejection commands, and can resume approved read-only
allowlisted actions. See [Viernes Approval UX](viernes-approval-ux.md).

## What ACT Means Here

ACT is a short-lived local/dev approval code for proposed integration actions.
It is not an API key, provider token, webhook secret, or production credential.

The current implementation uses an in-memory store by default. Phase 16 also
adds an optional local persistent store. The persistent store hashes local/dev
ACT codes with a per-record salt and writes `[REDACTED]` instead of the ACT code.
No provider secrets are persisted.

## Flow

1. Build a `ProposedIntegrationAction`.
2. Validate it with the Phase 11 validator.
3. Create an `IntegrationActionApprovalRequest`.
4. Generate a local/dev ACT code with an expiration time.
5. Approve or reject using the approval gate.
6. Use `assertActionApproved` to verify approval.
7. Stop. No executor is called in Phase 12.

## Approval Request Fields

| Field | Purpose |
| --- | --- |
| `id` | Approval request id. |
| `actionId` | Proposed action id. |
| `actionSummary` | Redacted action summary. |
| `integration` | Target integration. |
| `action` | Proposed action name. |
| `riskLevel` | `low`, `medium`, `high`, or `critical`. |
| `requiredBecause` | Local policy reasons approval is required. |
| `actCode` | Local/dev ACT code. Not a provider secret. |
| `status` | `pending`, `approved`, `rejected`, or `expired`. |
| `createdAt` | Creation timestamp. |
| `expiresAt` | Expiration timestamp. |
| `approvedAt` | Approval timestamp when approved. |
| `rejectedAt` | Rejection timestamp when rejected. |

## Validation vs Approval vs Execution

Validation answers: is the proposal structurally acceptable and still dry-run?

Approval answers: did the user authorize this specific proposal with ACT?

Execution answers: should an integration adapter call a real external system?
Execution is intentionally not implemented in this phase.

## Demo

Run:

```bash
npm run integrations:action:approval-demo
```

The demo shows:

- a WhatsApp `send_message` proposal requiring approval
- approval request creation
- failed approval with an incorrect ACT code
- successful approval with the generated local/dev ACT code
- `assertActionApproved` passing for the approved action
- `assertActionApproved` blocking an unapproved action
- explicit rejection of a separate approval request

The demo may print the generated ACT code because it is local/dev only and does
not authenticate to any provider. Do not reuse this behavior for production
without a secure approval channel and store.

## What This Phase Does Not Do

This phase does not:

- call provider APIs
- send WhatsApp messages
- create GitHub repositories, issues, branches, commits, or pull requests
- execute n8n workflows
- deploy through Coolify
- invoke OpenClaw tools
- index or query LightRAG
- call OpenAI or Anthropic models
- store provider API keys or provider tokens
- modify `.env.local`

## Viernes And ORQUESTADOR-PRIME

Viernes can later generate `ProposedIntegrationAction` objects and hand them to
ORQUESTADOR-PRIME for validation and approval. The approval gate becomes the
boundary between planning and future execution.

Before production use, the system still needs:

- hardened local permissions and, where appropriate, encrypted approval storage
- signed approval records
- user identity and approval provenance
- expiry enforcement across processes
- redacted action input snapshots
- audit/evidence records
- executor adapters that refuse to run without approved ACT state
- allowlists for repos, workflows, services, phone numbers, domains, and model
  providers

See [Integration Action Storage](integration-action-storage.md) for the Phase 16
local/dev persistence details.

For Viernes/WhatsApp command parsing and local/dev approval prompts, see
[Viernes Approval UX](viernes-approval-ux.md).
