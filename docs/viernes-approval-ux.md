# Viernes Approval UX

Phase 20 adds a local/dev approval UX layer for Viernes and WhatsApp-facing
flows. It formats ACT approval prompts, parses approval/rejection replies, and
can resume already-approved read-only allowlisted actions through the existing
execution gate.

It does not send WhatsApp messages.

## Flow

1. Viernes sends a structured request to ORQUESTADOR-PRIME.
2. The Viernes bridge maps the request to `ProposedIntegrationAction`.
3. The action is validated, dry-run checked, audited, and target-policy checked.
4. If approval is required, an `IntegrationActionApprovalRequest` is created.
5. `formatApprovalRequestForWhatsApp` builds a safe local/dev message.
6. A user reply such as `aprobar ACT-LOCAL-1234-ABCD` is parsed.
7. `processViernesApprovalCommand` approves or rejects the local approval.
8. `resumeApprovedViernesAction` may resume only read-only allowlisted actions.
9. Writes remain blocked by policy and the execution gate.

## Supported Commands

Approve:

```text
aprobar ACT-LOCAL-1234-ABCD
apruebo ACT-LOCAL-1234-ABCD
autorizar ACT-LOCAL-1234-ABCD
```

Reject:

```text
rechazar ACT-LOCAL-1234-ABCD
rechazo ACT-LOCAL-1234-ABCD
cancelar ACT-LOCAL-1234-ABCD
```

Anything else is parsed as `unknown`.

## Message Shape

The formatter includes:

- action title
- `integration.action`
- risk level
- approval id
- expiration time
- local/dev ACT code
- approve/reject instructions

The formatter does not include action input, provider tokens, webhook secrets,
authorization headers, cookies, or raw provider responses.

The ACT code shown here is local/dev only. It is not a provider credential. A
production WhatsApp UX must use a secure channel and a persistent approval store
with user identity and provenance.

## Resume Behavior

`resumeApprovedViernesAction` always goes through:

- audit record lookup
- validator
- executor allowlist
- target policy
- ACT approval assertion when the action requires approval
- redacted execution result

Allowed in this phase:

- `github.read_repo_status`
- `whatsapp.validate_bridge`
- `n8n.validate_webhook` as safe simulated/config validation

Still blocked:

- `whatsapp.send_message`
- `n8n.trigger_workflow`
- GitHub writes such as repo, issue, or PR creation
- Coolify deploys or remote config writes
- OpenClaw tool/browser/desktop actions
- LightRAG index/query actions
- OpenAI/Anthropic model calls

## Commands

Demo:

```bash
npm run viernes:approval:demo
```

Tests:

```bash
npm run viernes:approval:test
```

The demo may print a local/dev ACT code. It does not call Twilio, Meta, or
`WHATSAPP_WEBHOOK_URL`, and it does not send messages.

## Viernes Real Integration Later

The real Viernes workspace is expected at:

```text
C:\Users\Franco Andre\OneDrive - Universidad Privada del Valle\Documents\CodexAutomatizaciones
```

Future integration should pass structured requests into ORQUESTADOR-PRIME and
route approval replies back through this parser/processor. Before production,
the flow still needs durable request correlation, authenticated user identity,
approval provenance, replay protection, and a secure message delivery channel.

Phase 21 adds the first read-only local adapter for that workspace. See
[Viernes Local Adapter](viernes-local-adapter.md). The adapter detects safe
metadata and converts local payloads into bridge requests without modifying
Viernes or reading its `.env` values.
