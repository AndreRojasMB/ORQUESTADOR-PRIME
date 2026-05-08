# Viernes WhatsApp Approval Real Bridge Plan

Phase: 26F-B - WHATSAPP APPROVAL REAL BRIDGE PLAN

Status: plan only / audit only

## Purpose

This document plans a future feature-flagged connection between the real/local
WhatsApp inbound flow and the ORQUESTADOR approval UX created in Phase 26E.

Phase 26F-B does not implement that connection. It does not activate provider
writes, does not send WhatsApp replies automatically, does not change
credentials, does not call Meta/Twilio send APIs, does not run n8n workflows,
does not invoke OpenClaw, and does not change deployment or workflow files.

## Current Inbound Flow

The current real/local WhatsApp HTTP flow is:

1. `src/whatsapp/httpBridge.ts` accepts `POST /whatsapp-orchestrator`.
2. `httpBridge.ts` validates content type and parses JSON.
3. `httpBridge.ts` validates inbound transport headers and signature-related
   metadata.
4. `httpBridge.ts` maps the n8n-style payload into the internal shape with:
   - `sender`,
   - `messageId`,
   - `text`,
   - optional timestamp.
5. `httpBridge.ts` calls `processInboundWebhook(...)`.
6. `src/whatsapp/bridge.ts` reads user config, validates the hook token, parses
   the normalized payload, and delegates to `handleWhatsAppMessage(...)`.
7. `src/whatsapp/handler.ts` applies:
   - feature gate,
   - phone allowlist,
   - rate limit,
   - replay protection,
   - deterministic WhatsApp action commands,
   - intent resolution,
   - orchestrator call,
   - reply formatting.

The Phase 26E adapter lives in:

- `scripts/orquestador_bridge_whatsapp_ux.py`
- `scripts/test_orquestador_whatsapp_local_flow.py`

It already keeps:

- `outboundSent=false`,
- `providerWrites=none`,
- `writesEnabled=false`,
- explicit ORQUESTADOR approval commands only,
- ambiguous commands blocked,
- offline ORQUESTADOR handled without crash.

## Recommended Integration Point

Recommended future insertion point:

```text
src/whatsapp/handler.ts
handleWhatsAppMessage(...)
after replay protection
before isWhatsAppActionCommand(...) and resolveIntent(...)
```

Reason:

- The message has already passed the existing WhatsApp feature gate.
- The sender has already passed allowlist checks.
- Rate limiting and replay protection have already run.
- Approval commands can be isolated before normal routing, action commands, and
  orchestrator intent resolution.
- Unknown or unrelated messages can continue through the existing normal flow.

Rejected alternative:

```text
src/whatsapp/httpBridge.ts
before processInboundWebhook(...)
```

This is riskier because it would require duplicating or bypassing allowlist,
rate-limit, replay, and handler-level audit behavior. It should only be used for
payload-shape preflight tests, not the real approval command path.

## Feature Flag Requirement

The future implementation should be behind a default-off feature flag. The
recommended behavior is:

- flag absent: approval bridge path is disabled;
- flag disabled: normal WhatsApp flow unchanged;
- flag enabled: explicit ORQUESTADOR approval commands are intercepted after
  replay protection and before normal routing;
- feature flag must not enable provider sends;
- feature flag must not enable writes;
- feature flag must not enable automatic outbound delivery.

The flag should be read through an existing safe config path or injected test
options. It must not require editing secrets or credential files.

## Future Handler Flow

The future `handleWhatsAppMessage(...)` flow should become:

1. Keep existing feature gate.
2. Keep phone allowlist.
3. Keep rate limit.
4. Keep replay protection.
5. If the approval bridge feature is disabled, continue unchanged.
6. If enabled, classify the inbound text with the exact ORQUESTADOR command
   allowlist.
7. If the command is unrelated, continue normal flow unchanged.
8. If the command is ambiguous, return a safe blocked text response.
9. If the command is status/latest/cancel, return safe local observation text.
10. If the command is approve/reject:
    - require a correlated latest approval context,
    - call only the local ORQUESTADOR approval-command boundary,
    - return only the text that would be sent,
    - keep outbound delivery disabled by default.
11. Never pass explicit ORQUESTADOR approval commands to normal action routing
    or orchestrator intent resolution.

## Approval Context Source

The future integration needs a safe source for "latest approval" metadata. The
source must provide only:

- approval id,
- local/dev ACT code received from the immediate approval contract,
- optional action id,
- approval status,
- safe summary.

It must not print or persist provider credentials. It must not invent an ACT
code. If the latest approval context is absent or incomplete, approve/reject
commands must return a safe `not_found` or `blocked` style response.

## Command Allowlist

Only these commands may be accepted:

- `APROBAR ORQUESTADOR`
- `RECHAZAR ORQUESTADOR`
- `aprobar ultima de orquestador`
- `rechazar ultima de orquestador`
- `estado aprobacion orquestador`
- `ultima aprobacion orquestador`
- `cancelar aprobacion orquestador`

These must not approve:

- `si`
- `sí`
- `ok`
- `dale`
- `hazlo`
- any partial or fuzzy approval phrase

The command classifier must remain exact after whitespace/case normalization.

## Output Contract

The future handler response should keep a safe observation shape:

- text that would be sent,
- no automatic real outbound send,
- provider writes set to none,
- writes disabled,
- status from ORQUESTADOR local boundary when available,
- safe failure when ORQUESTADOR is offline.

The future implementation must not call provider send APIs. If `httpBridge.ts`
returns `replyText`, n8n or another caller may decide what to do outside this
codebase. This code should still identify its result as observation-mode text.

## Isolation From Normal Routing

Approval UX classification must run before:

- deterministic action commands,
- intent resolution,
- orchestrator execution.

Only exact ORQUESTADOR approval UX commands should be intercepted. Any unrelated
message should return to the existing normal flow. Any ambiguous command should
stop inside the approval UX branch and must not continue to normal routing as an
approval.

## Rollback Plan

Rollback should be simple:

1. Disable the future feature flag.
2. Confirm explicit ORQUESTADOR commands no longer intercept.
3. Confirm normal WhatsApp routing still works.
4. Revert only the future 26F-I integration files if needed.
5. Do not touch approval stores, audit stores, providers, credentials, or
   deployment files during rollback.

Because 26F-I should be feature-flagged and default-off, rollback should not
require changing secrets or restarting external providers.

## Proposed 26F-I Change Scope

Allowed future scope:

- add a TypeScript equivalent of the 26E classifier/adapter near the WhatsApp
  layer or a small wrapper under the WhatsApp module,
- minimally integrate it in `src/whatsapp/handler.ts`,
- add focused tests for explicit/ambiguous commands,
- optionally add docs explaining the flag and observation behavior.

Avoid in 26F-I:

- provider modules,
- credential/config secret files,
- package scripts,
- dashboard files,
- workflows,
- deployment files,
- ORQUESTADOR write paths,
- `src/viernesBridge/*`,
- `src/integrations/actions/policy/policyValidator.ts`.

## Required Future Tests For 26F-I

Before enabling any real bridge path, add or update tests that prove:

1. Feature flag disabled keeps current WhatsApp flow unchanged.
2. Feature flag enabled intercepts `estado aprobacion orquestador`.
3. Feature flag enabled intercepts `APROBAR ORQUESTADOR`.
4. Feature flag enabled intercepts `RECHAZAR ORQUESTADOR`.
5. Ambiguous commands do not approve.
6. Unrelated messages continue normal flow or return no action according to
   current behavior.
7. ORQUESTADOR offline returns a safe response without crash.
8. ORQUESTADOR online with pending approval can return `read_only_executed` for
   approve and `rejected` for reject.
9. No provider send APIs are called.
10. No n8n workflow is executed.
11. No OpenClaw action is invoked.
12. No branch, commit, PR, issue, repo, deployment, or dashboard mutation is
    created.
13. No token, header, ACT hash, secret, raw provider response, or authorization
    value is logged.
14. Replay protection still prevents duplicate handling.
15. Phone allowlist still applies before the approval UX branch.
16. Rate limiting still applies before the approval UX branch.

## Risk Assessment

Risk: medium.

The proposed insertion point is safe relative to the rest of the real WhatsApp
flow because it occurs after existing authorization and abuse controls. The risk
is still medium because it touches the real inbound handler and changes routing
order for a small set of commands.

Risk controls:

- default-off feature flag,
- exact command allowlist,
- no fuzzy approval matching,
- local ORQUESTADOR boundary only,
- no provider send call,
- no write-capable action path,
- normal routing fallback for unrelated messages,
- focused tests before implementation.

## 26F-I Entry Criteria

Proceed to 26F-I only when:

- the owner approves touching `src/whatsapp/handler.ts`,
- the feature flag name/source is approved,
- the latest approval context source is identified,
- tests for disabled/enabled behavior are ready,
- no unrelated dirty files need to be staged.

## 26F-I Exit Criteria

26F-I should be considered complete only if:

- feature flag defaults off,
- real outbound send remains disabled,
- provider writes remain none,
- writes remain disabled,
- explicit commands work under the flag,
- ambiguous commands block,
- unrelated messages preserve existing behavior,
- offline ORQUESTADOR fails safely,
- all targeted tests pass,
- no forbidden files are modified.
