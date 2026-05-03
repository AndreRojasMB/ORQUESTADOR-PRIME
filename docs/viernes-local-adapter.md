# Viernes Local Adapter

Phase 21 adds a local discovery and contract adapter for the real Viernes
workspace. It is read-only and does not modify Viernes.

## Paths

Windows path:

```text
C:\Users\Franco Andre\OneDrive - Universidad Privada del Valle\Documents\CodexAutomatizaciones
```

WSL path:

```text
/mnt/c/Users/Franco Andre/OneDrive - Universidad Privada del Valle/Documents/CodexAutomatizaciones
```

## What Discovery Reads

`discoverViernesWorkspace` checks only metadata and presence:

- whether the workspace directory exists
- whether `package.json` exists
- script names from `package.json`, not script bodies or execution
- detected stack hints from dependency names
- presence of `README.md`
- presence of `.env` and `.env.local`
- presence of `src/`, `app/`, `scripts/`, and `docs/`

It does not read `.env` or `.env.local` values.

## What The Adapter Does

`adaptLocalViernesPayloadToBridgeRequest` accepts a local payload such as:

```json
{
  "source": "local",
  "messageText": "validate whatsapp bridge",
  "intent": "validate_whatsapp_bridge",
  "context": {
    "workspacePath": "C:\\Users\\Franco Andre\\OneDrive - Universidad Privada del Valle\\Documents\\CodexAutomatizaciones"
  }
}
```

It converts the payload into a `ViernesBridgeRequest` using the existing
normalizer. The adapter converts Windows workspace paths to WSL paths and keeps
only safe context keys such as workspace path, GitHub owner/repo, and safe target
URLs. Token-like or unrelated context keys are dropped.

## What This Phase Does Not Do

Phase 21 does not:

- modify files in `CodexAutomatizaciones`
- execute Viernes scripts
- install dependencies
- read `.env` values from Viernes
- copy secrets from Viernes into ORQUESTADOR-PRIME
- send WhatsApp messages
- call Twilio or Meta
- call `WHATSAPP_WEBHOOK_URL`
- execute n8n workflows
- create GitHub repositories, issues, or pull requests
- deploy through Coolify
- invoke OpenClaw
- index or query LightRAG
- call OpenAI or Anthropic models

The dashboard must not import this adapter.

## Commands

Demo:

```bash
npm run viernes:local-adapter:demo
```

Tests:

```bash
npm run viernes:local-adapter:test
```

The demo detects the Viernes workspace, prints safe metadata, adapts one local
payload, and processes it through the existing bridge in dry-run mode. It does
not execute scripts or writes.

## Phase 22 Direction

In Phase 22, Viernes should call ORQUESTADOR-PRIME by sending structured local
payloads into this adapter or an equivalent IPC/HTTP boundary. That boundary
should include request correlation, approval ids, user identity, replay
protection, and a redacted evidence path before any production message channel
is connected.

Phase 22 now provides that first ORQUESTADOR-side boundary as a local CLI and
local HTTP server. See [Viernes Bridge Boundary](viernes-bridge-boundary.md).
Viernes itself is still not modified.
