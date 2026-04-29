# Providers Setup and Router Safety

Phase 33J documents and exposes safe diagnostics for provider setup. It does
not change runtime provider behavior, does not validate API keys against remote
services, and does not add new fallback routing.

## Current Provider Support

ORQUESTADOR-PRIME currently has provider adapters for:

- OpenAI
- Anthropic / Claude
- Kimi via Moonshot's OpenAI-compatible API
- OpenClaw Gateway via OpenAI-compatible chat completions

Ollama and direct local-model providers are not supported yet. OpenClaw can sit
in front of local or computer-use substrates, but that is separate from direct
Ollama support.

## OpenAI

OpenAI is the default provider for planner, specialist, and synthesis models.

Required env:

- `OPENAI_API_KEY`

Model env:

- `PLANNER_MODEL`
- `SPECIALIST_MODEL`
- `SYNTHESIS_MODEL`

Current behavior: model names that do not match a known provider prefix route
to OpenAI. This preserves existing behavior, but it is also a spend risk if an
unknown model name was intended for another provider.

## Anthropic / Claude

Claude is selected by model names starting with `claude-`.

Required env when using Claude:

- `ANTHROPIC_API_KEY`

Model env:

- `CLAUDE_ARCHITECT_MODEL`
- `CLAUDE_BLUEPRINT_MODEL`

If Claude is unavailable, existing orchestrator paths fall back to OpenAI in
the same places they did before Phase 33J.

## Kimi

Kimi is selected by model names starting with `kimi-`.

Required env when using Kimi:

- `KIMI_API_KEY`

Model/settings env:

- `KIMI_MODEL`
- `KIMI_THINKING`

Kimi diagnostics only report whether `KIMI_API_KEY` is present. They never print
the key and never call Moonshot APIs.

## OpenClaw Gateway

OpenClaw is selected by model names starting with `openclaw-`.

Required env when using OpenClaw provider routing:

- `OPENCLAW_GATEWAY_TOKEN`

Gateway/model env:

- `OPENCLAW_GATEWAY_URL`
- `OPENCLAW_MODEL`

OpenClaw can also be used by tool-gateway flows elsewhere in the system. Phase
33J does not change those flows and does not add computer-use execution.

## WhatsApp, n8n, Twilio and Omi References

Provider setup is separate from external-channel safety, but these env vars are
often configured in the same deployment:

- `WHATSAPP_HOOK_TOKEN`
- `WHATSAPP_N8N_SHARED_SECRET`
- `WHATSAPP_REQUIRE_STABLE_MESSAGE_ID`
- `WHATSAPP_VALIDATE_TWILIO_SIGNATURE`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_WEBHOOK_PUBLIC_URL`
- `OMI_WEBHOOK_SECRET`

These are secrets or transport-safety settings, not model provider settings.
Diagnostics must not print their values.

## LightRAG and Coolify References

The config also supports optional integrations:

- `LIGHTRAG_BASE_URL`
- `LIGHTRAG_API_KEY`
- `COOLIFY_API_URL`
- `COOLIFY_API_TOKEN`
- `COOLIFY_PROJECT_UUID`
- `COOLIFY_SERVER_UUID`

These integrations are outside provider routing. Phase 33J only documents them
in `.env.example` for deployment clarity.

## Ollama / Local Models

Direct Ollama and local-model providers are not implemented yet.

Do not set an Ollama model expecting it to route locally. With current behavior,
unknown model names default to OpenAI unless they start with a known prefix:

- `claude-`
- `kimi-`
- `openclaw-`

Direct local provider support should be added in a future runtime/provider
phase with explicit routing, diagnostics, and safe defaults.

## Safe Diagnostics

Provider diagnostics are read-only and local-only. They report:

- provider name
- configured boolean
- required env var names
- missing env var names
- selected model names
- model-to-provider detection reason
- whether a model defaulted to OpenAI

Diagnostics do not:

- print API key values
- print token values
- call OpenAI, Anthropic, Moonshot, OpenClaw, Ollama, or any remote service
- validate whether a key is valid
- change provider routing
- enable fallback behavior
- execute actions

## Fallback Strategy

Current runtime fallback behavior remains unchanged:

- `claude-*` routes to Anthropic.
- `kimi-*` routes to Kimi.
- `openclaw-*` routes to OpenClaw.
- everything else routes to OpenAI.

Future provider-router work should separate:

- primary provider,
- secondary provider,
- local provider,
- disabled provider,
- and unknown-model handling.

For now, diagnostics flag OpenAI defaulting so operators can catch accidental
spend risks before running expensive modes.

## Integrations / Connectors Relationship

The future connector governance path is documented in
[Integrations / Connectors](integrations-connectors.md). Model/provider setup is
separate from connector credentials: provider diagnostics report required env
names only, while future connector credentials need their own vault, scope,
audit, and approval policy.
