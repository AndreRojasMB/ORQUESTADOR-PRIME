# Integration Action Contracts

Phase 11 introduces a local contract layer for proposed integration actions. It
does not execute actions, call provider APIs, send messages, create resources,
deploy, index documents, or invoke tools.

The purpose is to standardize what a future action request must contain before
it can enter an ACT approval and execution path.

## ProposedIntegrationAction

Every proposed action uses this shape:

| Field | Purpose |
| --- | --- |
| `id` | Stable local action id for audit and evidence. |
| `integration` | One of `github`, `n8n`, `whatsapp`, `openclaw`, `lightrag`, `coolify`, `openai`, `anthropic`. |
| `action` | Supported action name for that integration. |
| `title` | Human-readable summary. |
| `description` | Clear explanation of what would happen later. |
| `riskLevel` | `low`, `medium`, `high`, or `critical`. |
| `requiresApproval` | Whether ACT approval is required before any future execution. |
| `approvalCode` / `actToken` | Optional future approval material. Not required in Phase 11. |
| `dryRunOnly` | Must be `true` in Phase 11. |
| `input` | Proposed action input. Must not include secrets. |
| `expectedOutcome` | Expected result if a future executor is approved. |
| `blockedReasons` | Optional reasons the action is intentionally blocked. |
| `evidencePlan` | Required for high-risk and critical proposals. |
| `rollbackPlan` | Required for critical proposals unless the action is explicitly blocked. |
| `createdAt` | ISO timestamp for audit ordering. |

## Supported Contract Actions

| Integration | Actions |
| --- | --- |
| GitHub | `create_repo`, `create_issue`, `open_pull_request`, `read_repo_status` |
| n8n | `trigger_workflow`, `validate_webhook`, `import_workflow` |
| WhatsApp | `send_message`, `validate_bridge`, `prepare_reply` |
| OpenClaw | `invoke_tool`, `run_browser_task`, `run_desktop_task` |
| LightRAG | `index_document`, `query_context`, `refresh_index` |
| Coolify | `create_project`, `create_application`, `deploy_application`, `set_environment_variable` |
| OpenAI | `run_model_prompt`, `classify_task`, `summarize_context` |
| Anthropic | `run_model_prompt`, `classify_task`, `summarize_context` |

## Risk Levels

| Risk | Meaning |
| --- | --- |
| `low` | Read-only or local validation proposal. |
| `medium` | External read, provider usage, or externally meaningful prepared output. |
| `high` | Writes, workflow triggers, indexing, repository or deployment preparation. |
| `critical` | Execution substrate actions, deploys, environment mutation, desktop/browser control, or index rebuilds. |

## Validation Rules

The local validator enforces these rules:

- `dryRunOnly` must be `true`; real execution is rejected in Phase 11.
- Unsupported integration/action pairs are rejected.
- Risk level must be at least the contract minimum.
- External or destructive actions require `requiresApproval=true`.
- High-risk actions require an `evidencePlan`.
- Critical actions require a `rollbackPlan`.
- Actions with `blockedReasons` are rejected as intentionally blocked.
- WhatsApp `send_message` always requires approval.
- OpenClaw `invoke_tool`, `run_browser_task`, and `run_desktop_task` always require approval and critical risk handling.
- LightRAG `index_document` requires approval.
- Coolify create/deploy/environment actions are high or critical.
- OpenAI and Anthropic model actions require approval because they can consume provider quota.

## Dry-Run Command

Run the local dry-run examples:

```bash
npm run integrations:action:dry-run
```

The command prints only safe metadata:

- action id
- integration
- action
- risk level
- whether the proposal is allowed by the local validator
- validation reasons

It does not print secrets, call APIs, execute workflows, send messages, deploy,
index documents, invoke OpenClaw, or call AI models.

## Approval Gate

Phase 12 adds a local approval gate on top of these contracts. A valid proposal
can create an ACT approval request, but approval still does not execute the
action. See [Integration Action Approval Gate](integration-action-approval-gate.md).

Phase 13 adds local audit/evidence records for the proposal lifecycle. See
[Integration Action Audit Trail](integration-action-audit-trail.md).

Phase 14 adds a safe executor gate for a tiny read-only/simulated allowlist.
Approval and audit are required before an allowlisted executor can run, and all
dangerous actions remain blocked. See
[Integration Action Executors](integration-action-executors.md).

## Safe Examples

Low-risk valid proposal:

```json
{
  "integration": "github",
  "action": "read_repo_status",
  "riskLevel": "low",
  "requiresApproval": true,
  "dryRunOnly": true
}
```

Blocked WhatsApp send proposal:

```json
{
  "integration": "whatsapp",
  "action": "send_message",
  "riskLevel": "high",
  "requiresApproval": false,
  "dryRunOnly": true
}
```

Blocked real execution proposal:

```json
{
  "integration": "github",
  "action": "create_issue",
  "riskLevel": "medium",
  "requiresApproval": true,
  "dryRunOnly": false
}
```

## Relation To Viernes And ORQUESTADOR-PRIME

In a later phase, Viernes and ORQUESTADOR-PRIME can use
`ProposedIntegrationAction` as the handoff format between planning, approval,
and execution. Phase 11 stops at local validation. Future phases still need:

- ACT approval storage and verification
- production executor adapters per integration
- broader target allowlists
- secret redaction around inputs and evidence
- evidence capture
- result persistence
- rollback or compensating-action notes
