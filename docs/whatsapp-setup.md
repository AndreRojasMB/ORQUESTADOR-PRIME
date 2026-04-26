# WhatsApp Integration — Setup Guide

## Architecture

```
+51912996652 (WhatsApp)
    |
    v
Twilio Sandbox Number
    |  POST (form-encoded) to webhook URL
    v
ngrok (HTTPS tunnel)
    |  localhost:5678
    v
n8n (self-hosted)
    |  Workflow: Twilio Webhook -> Normalize -> Execute Command -> Reply
    v
bridge.ts -> runOrchestrator(task, mode) -> formatted reply
    |
    v
WhatsApp reply to sender
```

---

## Local Testing Path (Phase 24B)

This path runs entirely on your local machine. It is not suitable for
production — the ngrok URL is temporary and the n8n Execute Command
node shells out to the CLI directly.

Production deployments must use the hardened HTTP bridge and explicit webhook
secrets described below. Do not expose the n8n UI or the Execute Command node as
the production WhatsApp boundary.

### Prerequisites

- Node.js 18+
- n8n running locally (default: http://localhost:5678)
- ngrok installed (`npm i -g ngrok` or https://ngrok.com/download)
- `OPENAI_API_KEY` (or `ANTHROPIC_API_KEY`) set in `.env`

### 1. Configure ORQUESTADOR-PRIME

Create or edit `~/.orquestador-prime/config.json`:

```json
{
  "version": "1.0",
  "agents": { "disabled": [] },
  "routing": { "rules": [] },
  "providers": {},
  "n8n": { "triggers": {} },
  "allowedDomains": ["api.openai.com", "api.anthropic.com"],
  "whatsapp": {
    "enabled": true,
    "hookToken": "my-secret-token-change-this",
    "allowedPhones": ["+51912996652"],
    "maxMessagesPerHour": 20,
    "safeModes": ["plan", "route", "blueprint", "audit", "memory"],
    "n8nWebhookPath": "orquestador-whatsapp",
    "replyVia": "n8n"
  }
}
```

Generate a random hook token:
```bash
node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
```

### 2. Twilio Sandbox Setup

1. Sign up at https://www.twilio.com (free, no credit card needed)
2. Go to **Messaging > Try it out > Send a WhatsApp message**
3. Note the sandbox number and join keyword shown on screen
4. From **+51912996652**, send the join message (e.g., `join example-word`)
   to the Twilio sandbox number via WhatsApp
5. You should see a confirmation reply

### 3. Expose n8n with ngrok

```bash
# Start n8n if not already running
# (Docker, npm, or however you have it set up)

# Expose port 5678 publicly
ngrok http 5678
```

Copy the HTTPS URL from ngrok output (e.g., `https://abc123.ngrok-free.app`).

If n8n uses `WEBHOOK_URL`, update it:
```bash
export WEBHOOK_URL=https://abc123.ngrok-free.app
```

### 4. Import n8n Workflow

1. Open n8n at http://localhost:5678
2. **Workflows > Import from File**
3. Select `n8n-templates/whatsapp-twilio-bridge.json`
4. Edit the **"Call Bridge (LOCAL ONLY)"** node:
   - Replace `/path/to/orquestador-prime` with your actual project path
   - Replace `change-me` with your hookToken from config.json
5. **Activate** the workflow

For local HTTP bridge testing, n8n should call:

```text
POST http://127.0.0.1:8787/whatsapp-orchestrator
Content-Type: application/json
X-Hook-Token: <hookToken>
```

The JSON payload must include a stable provider message id:

```json
{
  "from": "whatsapp:+51912996652",
  "userMessage": "plan a SaaS CRM",
  "metadata": {
    "messageId": "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "timestamp": "2026-04-26T12:00:00.000Z"
  }
}
```

`metadata.messageId` should be Twilio `MessageSid` or the equivalent stable
provider event id. Random or missing ids weaken replay protection and are
rejected by default.

### 5. Configure Twilio Webhook

1. In Twilio Console, go to **Messaging > Try it out > WhatsApp sandbox settings**
2. Set **"When a message comes in"** to:
   ```
   https://abc123.ngrok-free.app/webhook/twilio-whatsapp
   ```
3. Method: **POST**
4. Save

### 6. Test

Send a WhatsApp message from +51912996652 to the Twilio sandbox number:
```
plan a SaaS CRM for small businesses
```

Expected flow:
1. Twilio forwards to ngrok -> n8n
2. n8n normalizes payload and calls bridge.ts
3. Orchestrator runs in "plan" mode
4. Reply appears in WhatsApp within 30-60 seconds

Other test messages:
- `blueprint a procurement platform` -> blueprint mode
- `audit my repository` -> audit mode
- `memory` -> shows recent runs
- `execute deploy the app` -> should be BLOCKED (not in safeModes)

### Troubleshooting

| Problem | Check |
|---------|-------|
| No reply at all | n8n execution log — is the workflow active? |
| "invalid hook token" in logs | hookToken in Execute Command must match config.json |
| "Access denied" reply | Verify +51912996652 is in config.json allowedPhones |
| "Rate limit exceeded" reply | Wait 1 hour or increase maxMessagesPerHour |
| n8n shows error on Execute Command | Check project path is correct, `npm run check` passes |
| ngrok URL expired | Restart ngrok, update Twilio webhook URL |

---

## Production Path

When ready to move beyond local testing:

1. **Replace ngrok with Cloudflare Tunnel**
   - Stable HTTPS URL tied to your domain
   - Free tier, automatic SSL
   - Separates webhook endpoint from n8n UI

2. **Replace Execute Command with HTTP adapter**
   - Run `npm run bridge:whatsapp` behind a private service boundary.
   - n8n calls `POST /whatsapp-orchestrator` via HTTP Request node instead of
     shell exec.
   - Proper process isolation and error handling
   - Keep the bridge bound to loopback or a private network; expose only the
     tunnel/proxy layer.

3. **Replace Twilio Sandbox with Meta WhatsApp Business Cloud API**
   - Create Meta Developer app, add WhatsApp product
   - Get a permanent business number (or use test number)
   - No "join" step needed — users message directly

4. **Update n8n workflow**
   - Replace Webhook node with WhatsApp Business Cloud Trigger node
   - Update normalizer for Meta JSON format (not Twilio form-encoded)
   - Meta payload: `entry[].changes[].value.messages[].text.body`

5. **Webhook signature verification**
   - Meta uses HMAC-SHA256 via `X-Hub-Signature-256`
   - n8n WhatsApp Business Cloud Trigger handles this automatically

### Hardened ORQUESTADOR HTTP bridge

The bridge applies transport validation before the message reaches
`processInboundWebhook()`:

- hook token validation using timing-safe comparison
- optional n8n shared-secret header validation
- required stable `metadata.messageId` by default
- optional Twilio signature validation when exact signed context is available
- 64 KB body limit
- safe logs with reason codes only

Secrets must come from env or local user config only. Do not store them in n8n
workflow exports, committed files, screenshots, or logs.

Recommended env:

```bash
export WHATSAPP_HOOK_TOKEN="<random bridge hook token>"
export WHATSAPP_N8N_SHARED_SECRET="<random n8n-to-orquestador secret>"
export WHATSAPP_REQUIRE_STABLE_MESSAGE_ID=true
export WHATSAPP_VALIDATE_TWILIO_SIGNATURE=false
```

If `WHATSAPP_N8N_SHARED_SECRET` is set, n8n must send one of:

```text
X-Orquestador-WhatsApp-Secret: <secret>
X-N8N-Shared-Secret: <secret>
```

n8n must always send the hook token:

```text
X-Hook-Token: <hookToken>
```

or:

```text
X-Orquestador-Hook-Token: <hookToken>
```

### Twilio signature validation behind n8n

Twilio signs the exact public URL and form parameters it sends to the webhook.
If Twilio calls n8n first, ORQUESTADOR cannot independently validate the Twilio
signature unless n8n forwards all required original context unchanged:

- `X-Twilio-Signature`
- the exact public URL configured in Twilio
- the original Twilio form fields, including `MessageSid`, `From`, `To`, and
  `Body`

For that mode, configure:

```bash
export WHATSAPP_VALIDATE_TWILIO_SIGNATURE=true
export TWILIO_AUTH_TOKEN="<twilio auth token>"
export TWILIO_WEBHOOK_PUBLIC_URL="https://example.com/webhook/twilio-whatsapp"
```

n8n must forward original Twilio scalar form fields under `raw`, `raw.twilio`,
or `raw.params` in the JSON body sent to ORQUESTADOR. If signature validation is
enabled but any required context is missing, the bridge fails closed.

If n8n already validates Twilio itself, keep
`WHATSAPP_VALIDATE_TWILIO_SIGNATURE=false` and rely on the n8n shared secret for
the n8n-to-ORQUESTADOR hop.
