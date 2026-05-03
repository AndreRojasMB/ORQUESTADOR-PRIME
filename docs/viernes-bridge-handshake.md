# Viernes Bridge Handshake

Phase 24 formalizes the local end-to-end handshake:

```text
Viernes client -> ORQUESTADOR local HTTP boundary -> Viernes bridge processor
```

The handshake is still read-only. It does not enable integration writes, send
WhatsApp messages, call production webhooks, execute n8n workflows, deploy,
invoke OpenClaw, index LightRAG, or call AI models.

## Status Store

ORQUESTADOR stores only safe metadata about the most recent boundary request in:

```text
$ORQUESTADOR_DATA_DIR/viernes-bridge-status.json
```

If `ORQUESTADOR_DATA_DIR` is not set, the existing local data root is used:

```text
~/.orquestador-prime/viernes-bridge-status.json
```

Stored fields:

- `connected`
- `lastHandshakeAt`
- `lastStatus`
- `mode`
- `writesEnabled`
- `lastIntent`
- `lastErrorCode`
- `requestId`

The store does not save full `messageText`, provider tokens, bridge tokens, ACT
codes, Authorization headers, cookies, API keys, or webhook secrets.

`writesEnabled` is always `false` in this phase.

## Server Environment

When testing `validate_whatsapp_bridge`, the bridge server process must see the
same safe presence variables used by policy:

```bash
export WHATSAPP_PROVIDER=twilio
export WHATSAPP_HEALTH_URL=http://127.0.0.1:8787/health
export WHATSAPP_WEBHOOK_URL=http://127.0.0.1:8787/whatsapp-orchestrator
export WHATSAPP_HOOK_TOKEN=local_dev_token_no_compartir

npm run viernes:bridge:server
```

Adjust the local health port if the WhatsApp bridge runs somewhere else. The
health check must use `WHATSAPP_HEALTH_URL`; the bridge must not call
`WHATSAPP_WEBHOOK_URL`.

## Dashboard

The dashboard reads the status store and shows Viernes under:

```text
Operational Bridges
```

Viernes Bridge is not counted as one of the eight external dashboard
integrations. The dashboard display is read-only and does not execute bridge
requests, health checks, actions, approvals, or provider calls.

## Test

```bash
npm run viernes:bridge:handshake:test
```

The test starts a local HTTP server on an ephemeral port and verifies:

- `validate_whatsapp_bridge` reaches the boundary and updates safe status.
- `send_whatsapp_message` is blocked.
- no writes are enabled.
- the status file does not store message text or local tokens.

## What This Phase Does Not Do

Phase 24 does not:

- modify the Viernes workspace.
- send WhatsApp messages.
- call Twilio or Meta.
- call `WHATSAPP_WEBHOOK_URL`.
- execute n8n workflows.
- create GitHub repositories, issues, or pull requests.
- deploy through Coolify.
- invoke OpenClaw.
- index or query LightRAG.
- call OpenAI or Anthropic models.
- expose ACT codes or secrets in the dashboard.
