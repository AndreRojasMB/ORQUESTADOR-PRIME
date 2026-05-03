# Dashboard Integrations

This document describes the safe, read-only integration status shown by the
dashboard at `/integrations`.

The dashboard never calls provider APIs from this page. It only checks whether
the required configuration variables are present and non-placeholder. Secret
values are never displayed.

## Configuration Locations

The status check reads variable presence from:

- the current Node process environment
- `.env.local`
- `.env`
- `dashboard/.env.local`
- `dashboard/.env`
- `~/.orquestador-prime/config.json` only for the legacy WhatsApp enabled/token
  shape

If `ORQUESTADOR_DATA_DIR` is set, the dashboard reads `config.json` from that
directory instead of `~/.orquestador-prime`.

## Required Variables

| Integration | Required variable presence |
| --- | --- |
| OpenAI | `OPENAI_API_KEY` |
| Claude / Anthropic | `ANTHROPIC_API_KEY` |
| n8n | `N8N_BASE_URL` and `N8N_WEBHOOK_URL` |
| LightRAG | `LIGHTRAG_BASE_URL` |
| Coolify | `COOLIFY_BASE_URL` and `COOLIFY_API_TOKEN` |
| OpenClaw | `OPENCLAW_BASE_URL`, `OPENCLAW_HEALTH_COMMAND`, or `OPENCLAW_STATUS_FILE` |
| GitHub | `GITHUB_TOKEN` and `GITHUB_OWNER` |
| WhatsApp | `WHATSAPP_PROVIDER`, `WHATSAPP_WEBHOOK_URL`, and `WHATSAPP_VERIFY_TOKEN` |

Supported aliases for existing installs:

- `N8N_WEBHOOK_BASE_URL` may satisfy `N8N_WEBHOOK_URL`.
- `COOLIFY_API_URL` may satisfy `COOLIFY_BASE_URL`.
- `OPENCLAW_GATEWAY_URL` may satisfy `OPENCLAW_BASE_URL`.
- `TWILIO_WEBHOOK_PUBLIC_URL` may satisfy `WHATSAPP_WEBHOOK_URL`.
- `WHATSAPP_HOOK_TOKEN` may satisfy `WHATSAPP_VERIFY_TOKEN`.

## Safe Example

Use real values only in your local `.env` or `.env.local`. Do not commit them.

```dotenv
OPENAI_API_KEY=replace_me
ANTHROPIC_API_KEY=replace_me

N8N_BASE_URL=https://n8n.example.invalid
N8N_WEBHOOK_URL=https://n8n.example.invalid/webhook/orquestador

LIGHTRAG_BASE_URL=http://localhost:9621

COOLIFY_BASE_URL=https://coolify.example.invalid
COOLIFY_API_TOKEN=replace_me

OPENCLAW_BASE_URL=http://localhost:18789
OPENCLAW_STATUS_FILE=data/openclaw_status.json
# OPENCLAW_HEALTH_COMMAND=openclaw gateway call health --json

GITHUB_TOKEN=replace_me
GITHUB_OWNER=your-github-owner

WHATSAPP_PROVIDER=twilio
WHATSAPP_WEBHOOK_URL=https://example.invalid/whatsapp
WHATSAPP_VERIFY_TOKEN=replace_me
# WHATSAPP_HEALTH_URL=https://example.invalid/health
```

Placeholder values such as `replace_me`, `change-me`, `placeholder`, `todo`, or
values starting with `your_` are treated as not configured.

## Verify

Run the local presence diagnostic from the repository root:

```bash
npm run integrations:status
```

Expected output shape:

```text
Integrations:
- OpenAI: configured
- Claude / Anthropic: missing
- n8n: configured
- LightRAG: missing
- Coolify: missing
- OpenClaw: configured
- GitHub: configured
- WhatsApp: missing
```

The status command exits with code `0` even when integrations are missing. It
does not call external APIs and does not print variable values, tokens, or
partial tokens.

Run optional health checks from the repository root:

```bash
npm run integrations:health -- --target openai
npm run integrations:health -- --target anthropic
npm run integrations:health -- --target claude
npm run integrations:health -- --target lightrag
npm run integrations:health -- --target coolify
npm run integrations:health -- --target github
npm run integrations:health -- --target openclaw
npm run integrations:health -- --target n8n
npm run integrations:health -- --target whatsapp
npm run integrations:health -- --target all
```

`integrations:status` only checks safe local presence of configuration.
`integrations:health` may perform a read-only probe for integrations that have
a safe probe available. Health checks are never called from the dashboard.
`configured` means the required local variables are present and non-placeholder.
`ok` means the optional health command also reached a safe read-only endpoint.

Health output uses normalized statuses only:

- `ok`
- `missing_config`
- `unauthorized_or_forbidden`
- `unavailable`
- `configured_without_probe`
- `unsupported_probe`
- `error`

Security constraints for health checks:

- no destructive actions
- no repository, issue, commit, deploy, or remote file mutations
- no AI text generation, model invocation, prompts, completions, responses, or
  messages calls
- no token, secret, or authorization header output
- no response body dumping
- 5 second timeout per probed integration

OpenAI health uses `OPENAI_API_KEY` and performs a read-only
`GET https://api.openai.com/v1/models` request. The command ignores the response
body and only classifies the HTTP status. It does not call Responses, Chat
Completions, Completions, or any model-generating endpoint.

Claude / Anthropic health uses `ANTHROPIC_API_KEY` and performs a read-only
`GET https://api.anthropic.com/v1/models` request with the required
`anthropic-version` header. The command ignores the response body and only
classifies the HTTP status. `--target claude` is an alias for
`--target anthropic`. It does not call Messages or Completions.

LightRAG status uses `LIGHTRAG_BASE_URL`. `LIGHTRAG_API_KEY` is optional and is
sent only as the `X-API-Key` header when present. `LIGHTRAG_HEALTH_URL` is an
optional explicit read-only endpoint for health diagnostics; it is separate from
the base URL so local installs can expose a dedicated health route.

LightRAG health never calls the repo's write/query endpoints
`/documents/text`, `/documents/file`, or `/query`. It does not upload files,
index documents, delete collections, modify embeddings, or run RAG queries. If
`LIGHTRAG_HEALTH_URL` is set, the command performs a single `GET` against that
URL. If only `LIGHTRAG_BASE_URL` is set, the command reports
`configured_without_probe` because this repo does not document a neutral
LightRAG health endpoint.

Coolify status uses `COOLIFY_BASE_URL` or `COOLIFY_API_URL`, plus
`COOLIFY_API_TOKEN`. Coolify health performs read-only `GET` requests against
the official Coolify API metadata endpoints: `/version` first, then `/health`
only if the version probe cannot be classified. It does not list resources,
create projects, create applications, deploy, restart services, mutate
environment variables, change domains, or delete anything. `401` and `403` are
reported as `unauthorized_or_forbidden`.

GitHub health uses `GITHUB_TOKEN` and `GITHUB_OWNER`, then performs safe
read-only calls to the official GitHub API to validate the authenticated token
and owner lookup. `401` and `403` are reported as
`unauthorized_or_forbidden`.

n8n status uses `N8N_BASE_URL` plus `N8N_WEBHOOK_URL` or
`N8N_WEBHOOK_BASE_URL` to mark the integration configured. For health checks,
`N8N_BASE_URL` is the only URL that is probed. `N8N_WEBHOOK_URL` points at a
workflow trigger and is never called by `integrations:health`, because that
could execute a production workflow. When only webhook configuration is present,
n8n reports `configured_without_probe`.

n8n health first tries `GET /healthz` on `N8N_BASE_URL`. If that endpoint is
not available, it falls back to a conservative `GET` of the base URL with
redirects disabled. It does not call `/webhook/...`, does not call
`/api/v1/workflows/:id/execute`, and does not send payloads.

WhatsApp status uses `WHATSAPP_PROVIDER`,
`WHATSAPP_WEBHOOK_URL` or `TWILIO_WEBHOOK_PUBLIC_URL`, and
`WHATSAPP_VERIFY_TOKEN` or `WHATSAPP_HOOK_TOKEN`. The webhook URL is the
inbound production trigger and is never called by `integrations:health`.

WhatsApp health reports `configured_without_probe` when the required presence
checks pass and no separate probe is configured. To allow a real read-only
probe, set `WHATSAPP_HEALTH_URL` to a dedicated health endpoint that is not a
webhook and not a provider send endpoint. The command performs only a `GET`
request with no payload, no message simulation, and no Meta/Twilio configuration
changes. URLs that look like webhook, Twilio, Meta, message, or send endpoints
are treated conservatively as `configured_without_probe`.

The local WhatsApp bridge in `src/whatsapp/httpBridge.ts` exposes `GET /health`
next to the inbound `POST /whatsapp-orchestrator` route. If that bridge is the
probe target, use a URL shaped like `http://127.0.0.1:<BRIDGE_PORT>/health`.

OpenClaw health first checks for a local status file. The default optional path
is `data/openclaw_status.json`; `OPENCLAW_STATUS_FILE` can point to another
local JSON file. A healthy file may contain one of these read-only shapes:

```json
{ "status": "ok" }
```

or:

```json
{ "ok": true }
```

If `OPENCLAW_HEALTH_COMMAND` is set, the command is executed locally with a
maximum 5 second timeout only when its text looks like a health/status command.
Commands containing execution terms such as `invoke`, `chat/completions`,
`deploy`, `create`, `delete`, `commit`, `issue`, `push`, or `merge` are reported
as `unsupported_probe`.

The current repo only defines OpenClaw gateway calls for `/v1/chat/completions`
and `/tools/invoke`; the health check never calls those endpoints. If no local
status file or safe health command is configured, but OpenClaw has a base URL,
the result is `configured_without_probe`.

Run the TypeScript check from the repository root:

```bash
node node_modules/typescript/bin/tsc --noEmit
```

Start the dashboard, then open `/integrations`:

```bash
cd dashboard
npm run dev
```

The page should show `8 of 8 integrations configured` when all required
variables are present. It should still show only `Configured` or
`Not Configured`, never secret values.
