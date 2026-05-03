# Integration Action Executors

Phase 14 adds the first executor framework for integration actions. Phase 15
adds target policy enforcement before any executor adapter can run. Together,
they form a safe local gate around proposed actions, approvals, audit records,
action allowlists, and target allowlists. They do not enable destructive writes.

## Contract, Approval, Audit, Executor

The action flow is intentionally split:

1. Contract: a `ProposedIntegrationAction` describes the target integration,
   action, risk, input, expected outcome, and safety plans.
2. Validation: the validator checks the contract, risk rules, approval
   requirements, and Phase 14 dry-run limits.
3. Approval: the local/dev ACT gate can approve a proposed action, but approval
   alone does not execute anything.
4. Audit: an audit record must exist before an executor can run. Execution
   events are recorded and evidence is redacted.
5. Target policy: the integration target must be allowed before any executor
   adapter can run.
6. Executor: an integration adapter may run only if the action is valid,
   approved when required, audited, explicitly allowlisted, and target-allowed.

The dashboard must not import or call executors.

## Phase 14 Allowlist

Only these actions are executable in Phase 14:

| Integration | Action | Mode | Behavior |
| --- | --- | --- | --- |
| GitHub | `read_repo_status` | `read_only` | Checks local integration configuration status only. It does not call GitHub APIs in this phase. |
| WhatsApp | `validate_bridge` | `simulated` | Checks local configuration status. It never sends messages and never calls the webhook URL. |
| n8n | `validate_webhook` | `simulated` | Checks local configuration status. It never calls `N8N_WEBHOOK_URL` and never triggers workflows. |

All other actions are blocked by the execution gate with
`action_not_allowlisted_phase_14`.

## Blocked Actions

Phase 14 blocks write, mutation, provider-cost, and externally visible actions,
including:

- GitHub repo, issue, and pull request creation
- WhatsApp message sending
- n8n workflow triggers and imports
- OpenClaw tool, browser, and desktop invocation
- LightRAG indexing and context queries
- Coolify project/application creation, deploys, and remote environment changes
- OpenAI and Anthropic prompt/model execution

The gate also blocks any action without an audit record, any action that
requires approval but is not ACT-approved, and any action attempting
`dryRunOnly=false`.

## Phase 15 Target Policy

Phase 15 adds a second gate after the action allowlist and before executor
invocation. It checks targets such as GitHub owner/repo, n8n base URL, and
WhatsApp health URL. Webhook URLs, provider send endpoints, and write-oriented
targets are blocked.

See [Integration Action Target Policy](integration-action-target-policy.md).

## Phase 17 GitHub Read Executor

Phase 17 enables the first real low-risk executor:
`github.read_repo_status`.

The executor is read-only and can call only:

```text
GET https://api.github.com/repos/{owner}/{repo}
```

It runs only after contract validation, target policy, audit trail, and ACT
approval. It never creates repos, issues, pull requests, commits, branches,
pushes, or remote mutations.

If the action includes an allowed `repo`, the executor reads minimal repository
metadata. If the action has an allowed owner but no repo, it returns
`owner_ready` without calling GitHub. Evidence is limited to owner, optional
repo, visibility, default branch, archived flag, pushed/updated timestamps, and
a status summary. Raw GitHub responses, tokens, and authorization headers are
not stored or printed.

## Phase 18 WhatsApp Bridge Validate Executor

Phase 18 enables the second real low-risk executor:
`whatsapp.validate_bridge`.

The executor is read-only and can call only `WHATSAPP_HEALTH_URL` with `GET`.
It never calls `WHATSAPP_WEBHOOK_URL`, never sends messages, never simulates
inbound payloads, and never calls Twilio, Meta, or WhatsApp provider APIs.

If `WHATSAPP_HEALTH_URL` is missing, the execution path blocks with
`missing_health_url`. If action input attempts a webhook URL, policy blocks with
`webhook_execution_blocked` before the executor can run. Evidence is limited to
provider, `healthReachable`, optional `statusCode`, `statusSummary`, and
`checkedAt`. Hook tokens, verify tokens, authorization headers, URLs, and raw
responses are not stored or printed.

## Evidence Policy

Executors return `IntegrationActionExecutionResult` with:

- action id
- integration
- action
- status
- mode
- summary
- optional redacted evidence
- optional blocked reasons
- timestamp

The execution gate redacts evidence before recording it. Inputs, tokens,
authorization headers, cookies, API keys, ACT codes, and other suspicious fields
must not be stored or printed in clear text.

## Demo

Run:

```bash
npm run integrations:action:executor-demo
```

The demo shows:

- an audited and ACT-approved `github.read_repo_status` action passing through
  the executor framework
- `whatsapp.send_message` blocked by the Phase 14 allowlist
- `n8n.trigger_workflow` blocked by the Phase 14 allowlist
- an action without audit trail blocked
- an action requiring approval blocked when it is not approved
- redacted evidence in the audit record

No provider API calls, messages, workflows, deploys, model calls, or remote
mutations are performed.

Target policy can be tested separately:

```bash
npm run integrations:action:policy-demo
```

GitHub read-only execution can be demonstrated with:

```bash
npm run integrations:action:github-read-demo
```

WhatsApp bridge validation can be demonstrated with:

```bash
npm run integrations:action:whatsapp-validate-demo
```

## Phase 19 Viernes Bridge

Phase 19 adds a bridge contract for Viernes to request actions without bypassing
the executor framework. Viernes requests are normalized, mapped to proposed
actions, validated, audited, dry-run recorded, checked by target policy, and
only then considered for read-only execution.

See [Viernes Bridge Contract](viernes-bridge-contract.md).

## Future Connection

For Viernes and ORQUESTADOR-PRIME, this framework becomes the local safety
boundary between an intent and a real integration action. Future phases can add
provider-specific executors only after they define:

- action allowlists
- target allowlists
- approval policy
- evidence capture
- rollback or compensating-action notes
- rate limits and circuit breakers
- production-ready audit persistence
