# Viernes Bridge Boundary

Phase 22 adds a local boundary on the ORQUESTADOR-PRIME side so Viernes can
send structured requests in a future phase. Viernes is not modified in this
phase.

The boundary has two entrypoints:

- local CLI
- local HTTP server bound to `127.0.0.1`

Both entrypoints convert input into the existing Viernes bridge request shape
and call `processViernesBridgeRequest`. They do not bypass validator, dry-run,
target policy, audit, approval, or the existing execution gate behavior.

## CLI

Example:

```bash
npm run viernes:bridge:cli -- --intent validate_whatsapp_bridge --message "valida el bridge"
```

With safe context:

```bash
npm run viernes:bridge:cli -- \
  --intent validate_whatsapp_bridge \
  --message "valida el bridge" \
  --context healthUrl=http://127.0.0.1:8787/health
```

Supported flags:

- `--intent <intent>`
- `--message <text>`
- `--source <local|whatsapp|api>`
- `--context key=value`
- `--context-json <json-object>`
- `--execute-read-only`

By default the CLI does not execute read-only probes. It returns dry-run or
approval/blocking status. `--execute-read-only` is explicit and still only uses
existing allowlisted read-only behavior.

## HTTP

Start locally:

```bash
npm run viernes:bridge:server
```

Endpoint:

```text
POST http://127.0.0.1:8789/viernes/request
```

Payload:

```json
{
  "source": "local",
  "messageText": "valida el bridge",
  "intent": "validate_whatsapp_bridge",
  "context": {}
}
```

Response shape:

```json
{
  "requestId": "viernes-example",
  "status": "dry_run_ready",
  "summary": "Action proposal passed validation and dry-run only.",
  "proposedActions": [],
  "approvalRequests": [],
  "executionResults": [],
  "blockedReasons": []
}
```

## HTTP Security

Defaults:

- host: `127.0.0.1`
- port: `8789`
- no CORS headers
- no remote bind by default

Optional variables:

```bash
ORQUESTADOR_VIERNES_BRIDGE_PORT=8789
ORQUESTADOR_VIERNES_BRIDGE_TOKEN=local_dev_token
```

If `ORQUESTADOR_VIERNES_BRIDGE_TOKEN` is configured, callers must send:

```text
X-Orquestador-Bridge-Token: <token>
```

The server never prints the token.

## Approval Command Endpoint

Phase 25 adds a second local endpoint:

```text
POST http://127.0.0.1:8789/viernes/approval-command
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

This endpoint reuses `parseApprovalCommand` and
`processViernesApprovalCommand`, then requires persistent approval state and an
existing audit record before ACT validation can approve anything. If the action
is read-only and allowlisted, the execution gate may resume it. Writes remain
blocked even after approval.

See [Viernes Approval Resume Flow](viernes-approval-resume-flow.md).

For local/dev E2E demos, `POST /viernes/request` includes the ACT only in the
immediate `needs_approval` response. The response includes top-level
`approvalCode`, `approvalInstruction`, `rejectInstruction`, `approvalId`,
`actionId`, `riskLevel`, `expiresAt`, and `localDevOnly: true`; it may also
include `approvalRequests[].message` marked with `channel: local_dev`. The ACT
is not written to status, audit, dashboard, or persistent approval records.

## Handshake Status

Phase 24 adds a safe local status store for the HTTP boundary. Every processed
`POST /viernes/request` updates metadata for the most recent handshake:

- connected/disconnected
- timestamp
- response status
- mode: `local_http`
- last intent
- safe error code when blocked
- request id
- writes enabled: always `false`

The store does not save `messageText`, ACT codes, bridge tokens, provider
tokens, webhook secrets, or Authorization headers. The dashboard reads this
store only to show Viernes under Operational Bridges.

See [Viernes Bridge Handshake](viernes-bridge-handshake.md).

## Tests

```bash
npm run viernes:bridge:boundary:test
npm run viernes:bridge:handshake:test
npm run viernes:bridge:approval-resume:test
```

Coverage:

- CLI processes `validate_whatsapp_bridge`
- CLI blocks `send_whatsapp_message`
- HTTP rejects incorrect token
- HTTP processes an allowed intent
- HTTP blocks a dangerous intent
- response does not contain local bridge token or payload secrets
- no Viernes workspace modification

## What This Phase Does Not Do

Phase 22 does not:

- modify `CodexAutomatizaciones`
- send WhatsApp messages
- call Twilio or Meta
- call `WHATSAPP_WEBHOOK_URL`
- execute n8n workflows
- create GitHub repositories, issues, or pull requests
- deploy through Coolify
- invoke OpenClaw
- index or query LightRAG
- call OpenAI or Anthropic models
- modify `.env.local`
- import boundary code from the dashboard

## Phase 23 Direction

Viernes should call ORQUESTADOR-PRIME through the CLI or local HTTP boundary
with structured payloads. Phase 23 should add request correlation,
approval/action lookup, user identity, replay protection, and a safe transport
decision before connecting a real WhatsApp-facing flow.
