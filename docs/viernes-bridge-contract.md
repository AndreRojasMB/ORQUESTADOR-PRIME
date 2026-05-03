# Viernes Bridge Contract

Phase 19 adds a safe bridge contract for Viernes to request integration actions
from ORQUESTADOR-PRIME. The bridge accepts a structured request, maps supported
intents to `ProposedIntegrationAction`, and runs the same local safety path used
by integration actions.

It does not give Viernes free execution.

## Flow

1. Viernes sends a `ViernesBridgeRequest`.
2. ORQUESTADOR-PRIME normalizes the request.
3. The mapper converts supported intents into proposed actions.
4. Each proposed action is validated.
5. An audit record is created.
6. Dry-run validation is recorded.
7. Target policy is applied.
8. Read-only allowlisted actions may execute through the execution gate.
9. Actions that require approval create a safe approval summary, without ACT
   code exposure.
10. The bridge returns a redacted `ViernesBridgeResponse`.

The dashboard must not import this bridge.

## Request

`ViernesBridgeRequest`:

| Field | Purpose |
| --- | --- |
| `id` | Request id from Viernes or local bridge. |
| `source` | `whatsapp`, `local`, or `api`. |
| `userId` | Optional local user reference. |
| `clientId` | Optional client/session reference. |
| `messageText` | Human message or command text. |
| `intent` | Optional normalized intent. |
| `context` | Optional non-secret structured context. |
| `requestedAt` | ISO timestamp. |

Do not put API keys, tokens, cookies, authorization headers, webhook secrets, or
message-provider credentials in `context`.

## Response

`ViernesBridgeResponse.status` can be:

| Status | Meaning |
| --- | --- |
| `accepted` | Request was accepted for local processing. |
| `needs_approval` | Proposed action is valid but requires ACT before execution. |
| `blocked` | Mapper, validator, policy, or execution gate blocked the request. |
| `dry_run_ready` | Action passed validation and policy but was not executed. |
| `read_only_executed` | A read-only allowlisted executor completed safely. |
| `no_action` | No supported action was requested. |
| `error` | Reserved for unexpected bridge failures. |

Approval summaries never include ACT codes.

## Allowed Intents In Phase 19

| Intent | Mapping | Behavior |
| --- | --- | --- |
| `check_github_repo_status` | `github.read_repo_status` | Creates a read-only proposal. Because the current contract requires approval, the bridge returns `needs_approval`; execution must happen through an approved action path. |
| `validate_whatsapp_bridge` | `whatsapp.validate_bridge` | May execute read-only against `WHATSAPP_HEALTH_URL` through the execution gate. |
| `prepare_whatsapp_reply` | `whatsapp.prepare_reply` | Dry-run proposal only. It does not send a message. |
| `unknown` | none | Returns `no_action`. |

## Blocked Intents

The bridge blocks:

- `send_whatsapp_message`
- `trigger_n8n_workflow`
- `create_github_issue`
- `create_github_repo`
- `deploy_coolify`
- `invoke_openclaw_tool`
- `run_browser_task`
- `index_lightrag_document`
- `run_model_prompt`

Blocked intents do not create provider calls or remote writes.

## Commands

Demo:

```bash
npm run viernes:bridge:demo
```

Tests:

```bash
npm run viernes:bridge:test
```

The tests do not call external APIs. The demo may execute the already-approved
read-only WhatsApp bridge health check if local configuration permits it.

## WhatsApp ACT UX Later

Phase 20 adds a local/dev WhatsApp approval UX on top of this bridge. See
[Viernes Approval UX](viernes-approval-ux.md).

The UX can show a concise approval prompt:

- requested intent
- proposed action
- risk level
- target summary
- policy result
- ACT approval requirement

The approval UX may show local/dev ACT codes only in the controlled approval
message. It must still avoid provider secrets, tokens, authorization headers,
webhook secrets, and raw action input in logs, traces, or ordinary chat
messages.

## Not Implemented Yet

Phase 19 does not:

- send WhatsApp messages
- execute n8n workflows
- create GitHub repos, issues, or pull requests
- deploy through Coolify
- invoke OpenClaw
- index or query LightRAG
- call OpenAI or Anthropic models
- expose raw provider responses
- persist production-ready approval provenance

Phase 20 also does not send WhatsApp messages or call Twilio/Meta. It only
formats local/dev approval text, parses approval commands, updates local
approval state, and resumes approved read-only allowlisted actions.

## Local Adapter

Phase 21 adds a local discovery and adapter layer for the real Viernes
workspace. It detects safe project metadata and converts local Viernes-style
payloads into `ViernesBridgeRequest` objects. See
[Viernes Local Adapter](viernes-local-adapter.md).

The local adapter does not modify `CodexAutomatizaciones`, execute Viernes
scripts, read Viernes `.env` values, or copy secrets.

## Local Boundary

Phase 22 adds ORQUESTADOR-side boundary entrypoints for future Viernes calls:
a local CLI and a local HTTP server bound to `127.0.0.1`. See
[Viernes Bridge Boundary](viernes-bridge-boundary.md).

The boundary still does not modify Viernes, send WhatsApp messages, execute
workflows, or enable writes. It routes requests through the existing bridge
processor and keeps dangerous intents blocked.
