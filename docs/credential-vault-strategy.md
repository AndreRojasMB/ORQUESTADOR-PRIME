# Credential Vault Strategy

Phase 95I is docs-only/spec-only. It does not implement a vault, store
credentials, handle OAuth or tokens, add credential references to source/config,
mutate env/config, execute connectors, call providers, call networks, or make
ORQUESTADOR-PRIME production-ready.

Phase 95I explicitly states:

- It does not implement a vault.
- It does not store credentials.
- It does not handle OAuth/tokens.
- It does not add credential references to source/config.
- It does not mutate env/config.
- It does not execute connectors.
- It does not call providers or networks.

This document defines a future credential/vault architecture and threat model.
It provides governance language for later phases before any real connector,
runtime, automation, OAuth, webhook, provider, or dashboard credential behavior
advances.

## A. Purpose

Credential and vault strategy exists because connector, runtime, automation,
provider, webhook, and dashboard surfaces become unsafe if secret values are
handled without governance. Connector execution must not advance until
ORQUESTADOR-PRIME has a model for opaque references, least-privilege scopes,
redaction, approval, audit, rotation, revocation, incident response, and
operator review.

This phase is architecture/spec only. It records the safety posture required
before future credential-aware behavior.

## B. Current Credential / Config Baseline

The current repository has live-adjacent credential and config surfaces:

- `src/config.ts` loads environment values through `dotenv/config`.
- Provider keys and integration tokens are currently environment/config driven.
- Provider clients use config constants when invoked.
- n8n, Coolify, OpenClaw, GitHub, WhatsApp, and Omi surfaces are live-adjacent.
- Dashboard config can read and write `config.json`, including
  `whatsapp.hookToken`.
- Connector taxonomy represents credential needs as requirement metadata only.
- No vault abstraction exists.

This baseline is useful for local development and current diagnostics, but it
is not a productized vault model.

## C. Readiness Gaps

Before any vault implementation, the project still lacks:

- a vault abstraction,
- an opaque credential reference model,
- a rotation/revocation policy,
- a token lifecycle model,
- a connector credential binding policy,
- a centralized secret redaction policy for docs, dashboard, artifacts, and
  logs,
- an approved production/enterprise vault path,
- OAuth, Gmail, Calendar, or SSO flows,
- a backup/restore policy for secrets.

## D. Credential / Vault Strategy

Future credential governance should separate secret value storage from source,
config, docs, prompts, artifacts, dashboards, and connector metadata.

Credential values should not live in source metadata. Current local environment
variables remain the current development baseline, not a productized vault.
Future vault behavior should expose only opaque references, status summaries,
scope metadata, redaction status, and audit metadata to the rest of the system.

## E. Opaque Credential Reference Model

Future credential references should be stable opaque ids, such as a
`credentialRef`, that are not secrets by themselves.

Future references should be:

- scoped to a connector, provider, channel, or runtime capability,
- revocable,
- auditable,
- non-secret without vault access,
- safe to display as redacted metadata,
- bound to an approval and permission model.

They must not contain raw values, provider keys, tokens, webhook secrets, or
OAuth examples with real-looking values.

## F. Secret Storage Strategy

Future storage candidates:

- local development env as the current limited baseline,
- OS keychain for local workstation use,
- external vault for self-hosted deployment,
- enterprise vault for managed production environments,
- CI secret storage for CI-only values.

Phase 95I adds no storage implementation.

## G. Secret Access Strategy

Future runtime lookup should happen only after approval, scope, audit,
redaction, and permission policies exist. The access model should be
least-privilege and default-deny.

No secret access implementation is added in Phase 95I.

## H. Secret Redaction Strategy

Secrets must be denied from:

- docs,
- logs,
- dashboard,
- stores,
- prompts,
- tasks,
- artifacts,
- traces,
- provider output,
- tool output,
- memory/learning exports,
- support bundles.

Future redaction should prefer reason codes, boolean status, masked labels,
credential reference ids, and redacted summaries.

## I. OAuth / Token Lifecycle Strategy

Future-only lifecycle policy should cover:

- authorization,
- consent,
- token exchange,
- access token expiry,
- refresh token handling,
- rotation,
- revocation,
- least scopes,
- audit trail.

Phase 95I adds no OAuth or token handling.

## J. Webhook Secret Strategy

Future-only webhook policy should cover:

- HMAC or signature validation,
- replay protection,
- source event ids,
- timestamp windows,
- rotation,
- redacted audit metadata.

Phase 95I adds no webhook secret handling.

## K. Connector Credential Binding Strategy

Connector taxonomy entries should bind to requirement ids and future
credential reference ids, not secret values.

Future connector execution requires:

- a credential reference,
- a bounded permission scope,
- approval and audit metadata,
- redaction policy,
- connector-specific risk review.

Phase 95I adds no connector execution.

## L. Permission / Scope Relationship

Credentials must not bypass:

- tool permissions,
- channel-action safety,
- action/proposal/approval gates,
- connector taxonomy boundaries,
- runtime readiness gates.

Scopes must be bounded per connector and capability. Read-only capability should
advance before write capability. Critical scopes need stronger review.

## M. Approval / Audit Relationship

High and critical credential use requires approval and audit metadata. Mutating
connector actions require approval. Critical credentials need stronger review
and a clear operator-facing reason.

Phase 95I adds no approval execution.

## N. Rotation And Revocation Strategy

Future-only policy should include:

- scheduled rotation,
- emergency rotation,
- stale credential detection,
- revocation playbook,
- connector disablement,
- audit trail.

Rotation and revocation should be planned before any productized connector
execution.

## O. Least-Privilege Model

Future credentials should use:

- per-connector scopes,
- read-only before write,
- separate human, operator, and admin scopes,
- separate development, CI, and production scopes,
- no shared broad tokens.

Broad credentials should be considered a blocker for high and critical
connectors.

## P. Local Development Strategy

Current env vars are the local development baseline. They are not a productized
vault.

Local development should require:

- no committed env values,
- no docs examples with real-looking secrets,
- no secret material in logs or screenshots,
- optional future local credential refs that are safe without vault access.

## Q. Enterprise / Production Strategy

Future enterprise and production strategy should include:

- enterprise vault integration,
- audited access,
- operator roles,
- credential rotation,
- incident response,
- connector disablement,
- reviewable access trails.

Phase 95I makes no production claims.

## R. Backup / Restore Considerations

Raw secrets require a special backup policy. They must not be included in
regular artifacts, support bundles, logs, traces, or dashboard exports.

Future backup strategy should be encrypted, reviewable, and separate from
normal operational artifacts. Restore should require review and audit.

Phase 95I adds no backup/restore implementation.

## S. Incident Response Model

Future-only incident response should cover:

- detect,
- revoke,
- rotate,
- quarantine,
- disable connector capability,
- audit,
- notify operator,
- review affected artifacts, logs, and stores.

Incident response should be documented before real credential-aware connector
execution.

## T. Credential Coverage Plan

| Credential class | Risk tier | Future storage requirement | Future access requirement | Redaction requirement | Rotation/revocation requirement | Audit requirement | Future-only status | Denied behavior in 95I |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Provider API keys | critical | Vault or current local env baseline until replaced | Provider route policy and operator review | Never display values | Required before productized use | Required | Future vault path | No provider key handling |
| Connector API keys | critical | Opaque credential refs | Connector scope and approval policy | Requirement/status only | Required | Required | Future-only | No connector calls |
| OAuth access tokens | critical | Short-lived vault-managed storage | Scoped connector access only | Never displayed | Expiry and revocation required | Required | Future-only | No OAuth/token handling |
| OAuth refresh tokens | critical | Strongest vault class | Restricted refresh policy | Never displayed | Rotation/revocation required | Required | Future-only | No refresh behavior |
| Webhook secrets | high | Vault or local env until replaced | Signature policy only | Reason codes only | Rotation required | Required | Future-only | No webhook secret handling |
| GitHub tokens | critical | Vault reference | Repo-scoped access | Status only | Required | Required | Future-only | No GitHub writes |
| Gmail/Calendar OAuth | critical | Vault reference | Delegated consent and least scopes | Status only | Required | Required | Future-only | No Google connector behavior |
| WhatsApp/Twilio tokens | high | Vault/env transition policy | Channel-scoped validation | Status and reason codes only | Required | Required | Future-only | No token/config writes |
| Omi/voice credentials | high | Vault/env transition policy | Webhook verification policy | Status and reason codes only | Required | Required | Future-only | No voice action execution |
| OpenClaw/computer-use credentials | critical | Vault reference | Sandbox and approval policy | Status only | Required | Required | Future-only | No computer-use execution |
| n8n/Coolify tokens | critical | Vault reference | Service-specific scope policy | Status only | Required | Required | Future-only | No API/deploy calls |
| Payment/billing credentials | critical | Enterprise vault only | Multi-approval policy | Status only | Required | Required | Future-only | No payment/billing execution |
| SSO credentials | critical | Enterprise identity vault | Admin review and identity scopes | Status only | Required | Required | Future-only | No SSO implementation |
| BI/accounting/ERP/CRM credentials | critical | Enterprise vault or managed connector vault | System-specific least scopes | Status only | Required | Required | Future-only | No enterprise connector calls |
| Local dev env vars | high | Local env only as current baseline | Local operator only | Never logged | Manual rotation policy | Optional now, required later | Current baseline | No env mutation |
| CI secrets | critical | CI secret storage | CI-only workflows | Redacted artifacts only | Required | Required | Future-only | No workflow changes |
| Enterprise vault references | critical | Enterprise vault | Role-scoped access | Reference/status only | Required | Required | Future-only | No vault integration |

## U. Threat Model

| Threat | Future mitigation strategy |
| --- | --- |
| Raw secret leakage in docs/logs/artifacts | Secret-deny docs policy, redacted logging, artifact scans, and review gates. |
| Env var exposure | Diagnostics report names/status only, never values. |
| Prompt/task leakage | Redact credential-like text before prompts and task persistence. |
| Dashboard display of secrets | Dashboard should show requirement/status only, never values. |
| Connector payload leakage | Summarize payloads before persistence or display. |
| Webhook replay | Use source event ids, timestamp windows, signatures, and replay caches. |
| Token reuse | Use scoped references, expiry, rotation, and revocation. |
| Overbroad scopes | Require least-privilege connector scopes and approval metadata. |
| Long-lived tokens | Prefer short-lived access and reviewed refresh policy. |
| Accidental commit of secrets | Secret scanning, review gates, and no real-looking examples. |
| CI artifact leakage | Redacted artifacts only and deny raw credential material. |
| Memory/store leakage | Never persist raw credential material in memory or learning stores. |
| Provider/tool output leakage | Redact outputs and deny credential-like strings in artifacts. |
| Unauthorized connector mutation | Default-deny permissions, approval gates, and audit metadata. |
| Backup/restore leakage | Separate encrypted secret backup policy with restore review. |
| Local machine compromise | Future OS/enterprise vault, revocation playbook, and connector disablement. |

All mitigations in this section are future policy only.

## V. Integration Plan

Credential vault strategy should later align with:

- connector metadata taxonomy,
- integrations/connectors governance,
- native automation deeper,
- production runtime deeper,
- action/proposal/approval safety,
- tool permission system,
- dashboard/control-center readonly manifest,
- safe self-improvement,
- productization/release path,
- baseline/strict CI warning mode.

Phase 95I adds only the strategy layer.

## W. Safety Boundaries / Non-Goals

Phase 95I explicitly includes:

- no provider calls,
- no network,
- no external API calls,
- no credential/vault implementation,
- no credential storage,
- no secret examples,
- no OAuth/token handling,
- no webhook secret handling,
- no env mutation,
- no config writes,
- no filesystem mutation,
- no connector execution,
- no action/proposal/approval execution,
- no automation/runtime/dashboard execution,
- no package/workflow/CI changes,
- no DB schemas/SQL,
- no production-ready claims,
- no security/compliance guarantees.

## X. Future Source Candidates

These are future-only candidates and are not implemented in Phase 95I:

- `src/credentials/planning/types.ts`
- `src/credentials/planning/credentialVaultPlanTemplates.ts`
- `src/credentials/planning/credentialVaultPlanValidator.ts`
- `src/credentials/planning/credentialVaultPlanBuilder.ts`

Future type candidates:

- `CredentialVaultSchemaVersion`
- `CredentialReferenceId`
- `CredentialProviderType`
- `CredentialRequirement`
- `CredentialScope`
- `CredentialAccessPolicy`
- `CredentialRotationPolicy`
- `CredentialRevocationPolicy`
- `CredentialAuditPolicy`
- `CredentialRedactionRule`
- `CredentialThreat`
- `CredentialVaultBoundarySet`
- `CredentialVaultValidationFinding`
- `CredentialVaultValidationResult`

## Y. Future Validation Strategy

Future validation should require:

- credential references are opaque ids only,
- credentials described as requirements only,
- no raw credential material,
- no tokens,
- no provider keys,
- no API key examples,
- no OAuth examples with real-looking values,
- no webhook secrets,
- bounded scopes,
- high and critical connectors require approval/audit metadata,
- access policies are strategy only,
- redaction rules are strategy only unless later implemented,
- no provider, network, filesystem write, action, store, runtime, or automation
  behavior,
- no production, security, or compliance guarantees.
