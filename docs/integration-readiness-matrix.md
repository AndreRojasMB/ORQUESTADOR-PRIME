# Integration Readiness Matrix

This matrix tracks the real maturity of the 8 dashboard integrations. It
separates local configuration presence from optional read-only health checks and
future action automation.

## Maturity Levels

| Level | Meaning | Current gate |
| --- | --- | --- |
| Level 1 | Presence / configured | Required variables are present and non-placeholder. |
| Level 2 | Health read-only | `npm run integrations:health` has a safe diagnostic that does not mutate remote state. |
| Level 3 | Controlled actions with ACT | Future work. Actions must be typed, classified, approved, and auditable through ACT. |
| Level 4 | Automation with evidence | Future work. Recurring or autonomous actions must produce evidence, traces, and rollback-safe audit records. |

The dashboard uses Level 1 only. It must not call provider APIs or health checks.

Phase 11 adds local action contracts and a validator for proposed integration
actions. This is design and dry-run only; no integration has real Level 3
execution yet. See [Integration Action Contracts](integration-action-contracts.md).

Phase 13 adds local/dev audit and evidence records for proposed actions. This
still does not execute integrations. See
[Integration Action Audit Trail](integration-action-audit-trail.md).

Phase 14 adds a local executor framework with an explicit allowlist for safe
read-only or simulated actions only. It still does not enable destructive
Level 3 integration writes. See
[Integration Action Executors](integration-action-executors.md).

Phase 15 adds target allowlists and hardened policy checks before executor
adapters can run. See
[Integration Action Target Policy](integration-action-target-policy.md).

Phase 16 adds optional local persistent stores for approvals, audit records, and
policy snapshots, plus automated integration action safety tests. See
[Integration Action Storage](integration-action-storage.md).

Phase 17 enables the first real read-only executor:
`github.read_repo_status` can read minimal repository metadata through the full
contract, policy, ACT, audit, and execution gate path. No writes are enabled.

Phase 18 enables the second real read-only executor:
`whatsapp.validate_bridge` can read only `WHATSAPP_HEALTH_URL` through the full
contract, policy, audit, and execution gate path. It never sends messages or
calls webhook/provider send endpoints.

Phase 19 adds the Viernes bridge contract. Viernes can request structured
actions, but ORQUESTADOR-PRIME still forces mapper, validator, audit, dry-run,
target policy, and execution gate checks. See
[Viernes Bridge Contract](viernes-bridge-contract.md).

Phase 20 adds local/dev Viernes/WhatsApp ACT approval UX. It can format approval
messages, parse approve/reject commands, approve or reject local ACT requests,
and resume approved read-only allowlisted actions. It still does not send
messages or enable writes. See [Viernes Approval UX](viernes-approval-ux.md).

Phase 21 adds read-only local discovery and a payload adapter for the real
Viernes workspace. It detects safe metadata, reports `.env` presence without
reading values, and converts local payloads into `ViernesBridgeRequest`. See
[Viernes Local Adapter](viernes-local-adapter.md).

Phase 22 adds an ORQUESTADOR-side local boundary for future Viernes calls: a
CLI and a local HTTP server bound to `127.0.0.1`. It still does not modify
Viernes or enable writes. See
[Viernes Bridge Boundary](viernes-bridge-boundary.md).

Phase 24 adds a safe end-to-end handshake status store for the Viernes boundary
and a read-only dashboard Operational Bridges view. Viernes is still not one of
the eight external integrations and writes remain disabled. See
[Viernes Bridge Handshake](viernes-bridge-handshake.md).

Phase 25 adds the ORQUESTADOR-side approval command resume boundary:
`POST /viernes/approval-command`. It can approve/reject local ACT requests and
resume only read-only allowlisted actions. Writes remain blocked even when
approved. See [Viernes Approval Resume Flow](viernes-approval-resume-flow.md).

Phase 26A returns a local/dev ACT message only in the immediate
`needs_approval` response so Viernes can complete an E2E approval demo. The ACT
is not stored in status, dashboard, audit evidence, or persistent approval
records.

## Matrix

| Integration | Required variables | Current level | Health check | Actions currently allowed | Actions blocked | Risks | Next step |
| --- | --- | --- | --- | --- | --- | --- | --- |
| OpenAI | `OPENAI_API_KEY` | Level 2 | `GET https://api.openai.com/v1/models` | Read-only model metadata status. | Responses, chat completions, completions, prompts, model invocation. | API key scope/cost exposure if future code calls generation from diagnostics. | Add ACT action contracts before any generation path is exposed as an integration action. |
| Claude / Anthropic | `ANTHROPIC_API_KEY` | Level 2 | `GET https://api.anthropic.com/v1/models` | Read-only model metadata status. | Messages, completions, prompts, model invocation. | Health can confirm auth but not model entitlement for every future route. | Add ACT action contracts and explicit model entitlement checks before provider actions. |
| n8n | `N8N_BASE_URL` plus `N8N_WEBHOOK_URL` or `N8N_WEBHOOK_BASE_URL` | Level 2, Phase 14/15 executor for `validate_webhook` | `GET /healthz` on `N8N_BASE_URL`, fallback base URL GET | Read-only availability check; executor performs simulated/config validation only and requires allowed `N8N_BASE_URL`. | Webhook calls, workflow execution, workflow create/update/activate/deactivate, credential mutation. | Webhook URLs can trigger production workflows if misused. | Add ACT wrapper for workflow operations with dry-run, workflow allowlist, and evidence capture. |
| LightRAG | `LIGHTRAG_BASE_URL` | Level 1, Level 2 only with `LIGHTRAG_HEALTH_URL` | `GET LIGHTRAG_HEALTH_URL` when explicitly set; otherwise `configured_without_probe` | Optional read-only health URL only. | Document indexing, file upload, vector store mutation, collection deletion, RAG queries. | Repo client has write/query endpoints, but no neutral health endpoint is documented here. | Expose a dedicated LightRAG `/health` endpoint or status file before promoting health to stable Level 2. |
| Coolify | `COOLIFY_BASE_URL` or `COOLIFY_API_URL`, plus `COOLIFY_API_TOKEN` | Level 2 when configured | `GET /version`, fallback `GET /health` | Read-only metadata/status check; no executor actions allowed by Phase 15 policy. | Project/app/service creation, deploys, restarts, env var edits, domain edits, deletion. | Token may have broad deployment permissions; endpoint shape can vary by Coolify version. | Add ACT deployment proposal objects with explicit approval, target allowlists, and evidence from Coolify events/logs. |
| OpenClaw | `OPENCLAW_BASE_URL`, `OPENCLAW_GATEWAY_URL`, `OPENCLAW_HEALTH_COMMAND`, or `OPENCLAW_STATUS_FILE` | Level 1, Level 2 when status file or safe command exists | Local status file or safe local health/status command; otherwise `configured_without_probe` | Local read-only status detection; no executor actions allowed by Phase 15 policy. | `/tools/invoke`, `/v1/chat/completions`, deploy/create/delete/commit/issue/push/merge commands. | Gateway is designed for controlled execution, so accidental probes must avoid execution endpoints. | Define ACT-approved OpenClaw command envelopes and evidence capture before execution. |
| GitHub | `GITHUB_TOKEN` and `GITHUB_OWNER`; optional `GITHUB_ALLOWED_REPOS` | Level 2 plus Phase 17 read-only executor for `read_repo_status` | `GET /user`, then `GET /users/{owner}` | Read-only auth and owner lookup; executor can read minimal repo metadata for allowed owner/repo. Owner-only actions return `owner_ready` without a remote repo read. | Repo creation, issue creation, commits, PR mutation, branch push, workflow mutation. | Token scope may allow writes even though diagnostics and executor do not use write endpoints. | Add stronger repo allowlist persistence, token scope checks, and evidence review before any GitHub write action. |
| WhatsApp | `WHATSAPP_PROVIDER`, `WHATSAPP_WEBHOOK_URL` or `TWILIO_WEBHOOK_PUBLIC_URL`, plus `WHATSAPP_VERIFY_TOKEN` or `WHATSAPP_HOOK_TOKEN`; `WHATSAPP_HEALTH_URL` for executor policy | Level 2 when `WHATSAPP_HEALTH_URL` is set; Phase 18 read-only executor for `validate_bridge` | Optional `GET WHATSAPP_HEALTH_URL`; webhook URL is never called | Read-only bridge health only; executor can read allowed health URL and records provider, reachability, status code, status summary, and timestamp. | Sending messages, provider send APIs, webhook simulation, inbound production webhook calls, Meta/Twilio config mutation. | Webhook and provider credentials can trigger real user-visible effects if misused. | Add ACT inbound/outbound channel policy, test sandbox, message allowlist, and evidence logs before any send path. |

## Current Commands

Presence:

```bash
npm run integrations:status
```

Optional read-only health:

```bash
npm run integrations:health -- --target all
```

Action safety tests:

```bash
npm run integrations:action:test
```

GitHub read-only action demo:

```bash
npm run integrations:action:github-read-demo
```

WhatsApp bridge read-only demo:

```bash
npm run integrations:action:whatsapp-validate-demo
```

Viernes bridge demo and tests:

```bash
npm run viernes:bridge:demo
npm run viernes:bridge:test
```

Viernes approval UX demo and tests:

```bash
npm run viernes:approval:demo
npm run viernes:approval:test
```

Viernes local adapter demo and tests:

```bash
npm run viernes:local-adapter:demo
npm run viernes:local-adapter:test
```

Viernes boundary CLI, server, and tests:

```bash
npm run viernes:bridge:cli -- --intent validate_whatsapp_bridge --message "valida el bridge"
npm run viernes:bridge:server
npm run viernes:bridge:boundary:test
npm run viernes:bridge:handshake:test
npm run viernes:bridge:approval-resume:test
```

Both commands avoid printing secrets. `integrations:status` exits with code `0`
even when integrations are missing. `integrations:health` exits with code `0`
for missing or unavailable integrations and only exits with code `1` for command
usage errors or unexpected internal failures.

## ACT Requirements For Level 3

Before any integration moves to controlled actions, it needs:

- typed action definitions with explicit provider, target, verb, and payload
- risk classification for read/write/destructive behavior
- dry-run or proposal mode where possible
- human approval for write or externally visible actions
- allowlists for domains, repositories, workflows, services, phone numbers, and
  deployment targets
- redaction for tokens, headers, URLs with secrets, message bodies, and provider
  responses
- auditable execution records with timestamps, actor, target, decision, result,
  and evidence references

## Automation Requirements For Level 4

Before autonomous or recurring automation is enabled, it needs:

- evidence collection for every run
- idempotency and replay protection
- rate limits and circuit breakers
- rollback or compensating-action notes where rollback is not possible
- monitorable success/failure status
- explicit owner and escalation path
- periodic review of credentials, scopes, and allowlists

## Phase 16 Test Coverage

The local test command covers validator blocking rules, ACT approval outcomes,
approval expiration, audit redaction, target policy decisions, execution gate
blocking, persistent approval ACT hashing, persistent audit redaction, and policy
snapshot persistence. It does not call external APIs or execute integration
actions.

Phase 17 adds tests that assert GitHub read results do not contain the token or
authorization headers.

Phase 18 adds tests that assert WhatsApp webhook attempts and `send_message`
remain blocked and execution results do not contain hook or verify tokens.

Phase 19 adds bridge tests for safe intent mapping, dangerous intent blocking,
unknown `no_action`, validator/policy/audit enforcement, redaction, and dry-run
mode without external calls.

Phase 20 adds approval UX tests for Spanish approve/reject commands, safe
message formatting, incorrect ACT rejection, correct ACT approval, write action
blocking after approval, and approved read-only resume.

Phase 21 adds local adapter tests for Windows-to-WSL path conversion, missing
workspace handling, `.env` presence without value leaks, payload conversion,
dangerous intent blocking, and no workspace modification.

Phase 22 adds boundary tests for CLI processing, CLI blocking, HTTP token
rejection, HTTP allowed-intent handling, HTTP dangerous-intent blocking, secret
redaction, and no Viernes workspace modification.

Phase 24 adds handshake tests for safe status persistence, blocked dangerous
requests, no writes, and no storage of message text or local tokens. The
dashboard reads this status only.

Phase 25 adds approval resume tests for correct ACT approval, incorrect ACT
blocking, rejection, expired approvals, missing audit trail blocking, read-only
resume, write blocking after approval, and status-store redaction.

Phase 26A adds tests that verify the immediate `needs_approval` response carries
a local/dev ACT message while status, audit, and persistent approval stores do
not retain the plain ACT.
