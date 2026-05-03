# Viernes Approval Resume Flow

Phase 25 adds the ORQUESTADOR-side approval command boundary. It lets a future
Viernes client send an explicit approve/reject command back to ORQUESTADOR
without bypassing validator, policy, audit, approval, or execution gates.

This phase is still read-only/safe-resume only. Writes remain blocked.

## Endpoint

Normal requests still use:

```text
POST /viernes/request
```

Approval commands use:

```text
POST /viernes/approval-command
```

Payload:

```json
{
  "type": "approval_command",
  "text": "aprobar ACT-LOCAL-XXXX-YYYY",
  "approvalId": "approval-id",
  "actionId": "action-id",
  "source": "local"
}
```

`approvalId` or `actionId` is required. ORQUESTADOR does not infer approvals
from free text alone. Reject commands require `approvalId`.

Supported command text:

- `aprobar <ACT>`
- `apruebo <ACT>`
- `autorizar <ACT>`
- `rechazar <ACT>`
- `rechazo <ACT>`
- `cancelar <ACT>`

## Safety Gates

The approval command flow:

1. parses the command with `parseApprovalCommand`.
2. loads the local persistent approval store.
3. loads the local persistent audit store.
4. requires explicit `approvalId` or `actionId`.
5. requires an audit record for the action.
6. verifies the ACT code.
7. records approval or rejection in the audit trail.
8. resumes only read-only allowlisted actions.
9. returns blocked for writes, missing audit, expired approval, or invalid ACT.

Read-only resume still goes through the execution gate. That means target policy,
allowlists, audit, and executor allowlists are still enforced.

## Status Store

`POST /viernes/approval-command` updates the same safe Viernes Bridge status
store used by the handshake:

- `connected`
- `lastHandshakeAt`
- `lastStatus`
- `mode`
- `lastIntent: approval_command`
- `requestId`
- optional `lastErrorCode`
- `writesEnabled: false`

The store never saves ACT codes, tokens, Authorization headers, payloads,
message text, or provider secrets.

## Responses

Possible statuses:

- `approved`
- `rejected`
- `resumed_read_only`
- `blocked`
- `not_found`
- `error`

Writes can be approved locally but still return `blocked` at resume time. This
is intentional: approval is not execution permission.

## Tests

```bash
npm run viernes:bridge:approval-resume:test
```

The test covers:

- correct ACT approval.
- wrong ACT block.
- reject command.
- expired approval block.
- read-only allowlisted resume.
- approved write still blocked.
- missing audit trail block.
- status store redaction.
- no tokens, ACT codes, or Authorization headers in response/status.

## What This Phase Does Not Do

Phase 25 does not:

- modify CodexAutomatizaciones.
- send WhatsApp messages.
- call Twilio or Meta.
- call `WHATSAPP_WEBHOOK_URL`.
- execute n8n workflows.
- create GitHub repositories, issues, or pull requests.
- deploy through Coolify.
- invoke OpenClaw.
- index or query LightRAG.
- call OpenAI or Anthropic models.
- enable writes.
- expose ACT codes in the dashboard/status store.
