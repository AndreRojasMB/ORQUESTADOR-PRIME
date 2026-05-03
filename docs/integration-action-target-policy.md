# Integration Action Target Policy

Phase 15 adds a hardened target policy layer before integration executors. An
action being valid and allowlisted by action type is not enough. The target must
also be permitted for that integration.

This phase still does not enable destructive writes.

## What The Policy Checks

The policy layer validates safe local metadata only:

- integration
- action name
- owner, repo, base URL, or health URL from action input
- non-secret environment configuration such as `GITHUB_OWNER`,
  `GITHUB_ALLOWED_REPOS`, `N8N_BASE_URL`, and `WHATSAPP_HEALTH_URL`

It does not print target URLs, tokens, secrets, provider responses, or request
headers.

## Integration Rules

| Integration | Allowed in Phase 15 | Blocked |
| --- | --- | --- |
| GitHub | `read_repo_status` for `GITHUB_OWNER`; repo must match `GITHUB_ALLOWED_REPOS` when that list is set. | `create_repo`, `create_issue`, `open_pull_request`. |
| WhatsApp | `validate_bridge` only against `WHATSAPP_HEALTH_URL`; `prepare_reply` as dry-run only. | `send_message`, webhook calls, provider send APIs. |
| n8n | `validate_webhook` as config/base validation only. | `N8N_WEBHOOK_URL` calls, workflow triggers, workflow imports. |
| OpenClaw | No executor actions. | tool invocation, browser tasks, desktop tasks. |
| LightRAG | No executor actions. | indexing, querying, refreshing indexes. |
| Coolify | No executor actions. | create project/app, deploy, set remote environment variables. |
| OpenAI | No executor actions. | prompts, model calls, classification, summarization. |
| Anthropic | No executor actions. | prompts, model calls, classification, summarization. |

## Safe Configuration Sources

The target policy reads the same safe environment snapshot used by integration
status detection. Useful variables:

```bash
GITHUB_OWNER=your_owner
GITHUB_ALLOWED_REPOS=repo-one,repo-two
N8N_BASE_URL=http://127.0.0.1:5678
WHATSAPP_HEALTH_URL=http://127.0.0.1:8787/health
OPENCLAW_GATEWAY_URL=http://127.0.0.1:18789
LIGHTRAG_BASE_URL=http://127.0.0.1:9621
COOLIFY_BASE_URL=https://coolify.example.invalid
```

Do not put provider tokens, API keys, webhook secrets, or authorization headers
inside action inputs.

## Execution Gate Integration

The execution gate now checks target policy before invoking any executor. The
gate blocks when:

- no audit record exists
- the action fails contract validation
- the action is not in the executor allowlist
- `dryRunOnly=false`
- the target policy denies the target
- the action requires ACT approval and is not approved
- no executor is registered

Policy failures are recorded as `execution_blocked` audit events.

## Demo

Run:

```bash
npm run integrations:action:policy-demo
```

The demo uses local placeholder environment values and does not read
`.env.local`. It demonstrates:

- allowed GitHub owner/repo read status
- blocked GitHub owner
- allowed WhatsApp health URL
- blocked WhatsApp webhook URL
- blocked n8n webhook URL
- blocked Coolify deploy
- blocked OpenClaw tool invocation

No APIs, webhooks, workflows, messages, deploys, tools, indexes, or model calls
are executed.

Phase 17 uses this policy before the real GitHub read-only repo metadata
executor runs. If an owner or repo fails policy, the execution gate blocks before
the GitHub adapter can call the API.

Phase 18 uses this policy before the real WhatsApp bridge health executor runs.
If `WHATSAPP_HEALTH_URL` is missing, the action blocks with `missing_health_url`.
If action input references a webhook URL, the action blocks with
`webhook_execution_blocked` before the WhatsApp adapter can call anything.

## Policy Snapshots

Phase 16 adds an optional local policy snapshot store. Snapshots can record the
current non-secret target policy for review or tests. They are redacted before
being written and live under the integration action data directory.

See [Integration Action Storage](integration-action-storage.md).

## Pending For Production

Future phases still need:

- production policy configuration with review history
- per-environment target allowlists
- repo, workflow, phone number, deployment, and service allowlists
- policy tests for every future executor
- production audit persistence
- explicit owner approval for expanding allowlists
