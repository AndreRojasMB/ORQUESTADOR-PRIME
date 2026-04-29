# Integrations / Connectors Governance

Phase: 84I
Status: docs-only/spec-only

## A. Purpose

Connector governance exists so ORQUESTADOR-PRIME can eventually describe,
review, and approve integrations with external systems without quietly adding
network behavior, credential handling, or write-capable automation.

The future benefits are a shared connector vocabulary, clearer risk
classification, permission and credential planning, safer dry-runs, and a
reviewable path from read-only metadata toward approval-gated connector actions.

Phase 84I is architecture/spec only. It does not implement connectors, create
`src/connectors/`, call networks or external APIs, handle credentials, implement
OAuth, handle tokens, handle secrets, implement webhooks, add browser
automation, execute terminal commands, execute payments or billing, implement
SSO, write to external systems, modify existing connector-adjacent surfaces, or
make ORQUESTADOR-PRIME production-ready.

## B. Current Connector-Adjacent Baseline

There is no unified `src/connectors/` directory today.

Existing connector-adjacent surfaces are live-adjacent and must be treated with
care:

- WhatsApp bridge,
- Omi bridge,
- n8n client,
- Coolify client,
- OpenClaw/computer-use client and provider,
- GitHub client,
- action dispatch and approval scripts,
- job scripts,
- request sandbox,
- tool registry,
- permission system.

`src/security/requestSandbox.ts` can perform a real fetch when a destination is
allowed. Tool registry and permission types already classify capabilities,
channels, risk, dry-run support, real-execution support, environment
requirements, and default-deny flags.

Channel action safety defines default-deny identity, permission, audit,
proposal-only, second-approval, and dispatch boundaries. Computer-use/OpenClaw
docs and source keep real computer actions disabled or dry-run oriented, but
the OpenClaw client/provider can perform network calls when invoked.

WhatsApp setup docs include older local testing paths. Treat them as
historical/setup guidance, not as the full connector architecture.

## C. Connector Readiness Gaps

Current gaps:

- no unified connector registry/governance spec,
- no credential/vault architecture,
- no OAuth/token lifecycle strategy,
- no connector-specific permission taxonomy beyond current channel/tool
  primitives,
- no Gmail, Calendar, payments, SSO, BI, accounting, ERP, or CRM connector
  models,
- no unified connector dry-run, audit, rate-limit, sandbox, or approval-gate
  schema.

## D. Connector Registry Strategy

A future connector registry should describe connector capabilities, risk,
scopes, credential requirements, dry-run support, approval requirements, and
audit expectations.

The registry should be metadata first. A connector registry entry is not an
executor, listener, OAuth flow, credential store, API client, or job runner.

Phase 84I adds no connector implementation.

## E. Connector Category Model

Future connector categories:

- communications,
- productivity,
- developer,
- browser/computer-use,
- local system,
- external API,
- finance,
- identity,
- BI,
- accounting,
- ERP,
- CRM.

Categories should help review risk and ownership. They must not grant
capability by themselves.

## F. Permission/Scope Model

Future connector permissions should include:

- read scope,
- write scope,
- mutation scope,
- project scope,
- actor scope,
- channel scope,
- data scope,
- expiration,
- approval requirement,
- audit requirement.

Read, write, and mutation scopes must be distinct. A read permission must never
imply permission to send, update, delete, post, approve, charge, invoice, or
modify external state.

## G. Credential/Vault Strategy

Credentials are requirements only in Phase 84I.

Future vault references should use opaque IDs only. Connector metadata, workflow
definitions, dry-run plans, logs, artifacts, docs examples, and audit summaries
must never store raw secrets, raw tokens, provider keys, credential payloads, or
authorization headers.

Phase 84I adds no credential/vault implementation, no OAuth/token
implementation, and no secret examples.

## H. Data Access Model

Connector data access should be read-only first.

Future read operations should return bounded summaries, redacted payloads,
least-privilege fields, freshness metadata, and provenance. Raw payload access
should require a later explicit policy.

Phase 84I performs no external calls.

## I. Action/Mutation Model

Connector writes and mutations are future-only.

Future mutations must be approval-gated, audited, rate-limited, default-deny,
permission-scoped, and reversible where possible. They should start as
proposal-only operations with dry-run summaries before any execution phase.

Phase 84I adds no connector write behavior.

## J. Dry-Run Strategy

Connector dry-runs should describe:

- intended operation,
- high-level payload shape without secrets,
- target system,
- read/write/mutation classification,
- risk,
- required approval,
- expected audit record,
- expected rollback or compensation note when applicable.

Dry-runs must not perform external calls.

## K. Approval Gates

Write, mutation, and high-risk connector actions require human approval.
Critical actions require stronger future governance, potentially including
second approval, operator confirmation, runtime readiness, lock checks,
redacted audit persistence, and rate-limit checks.

The following require stronger gates before any future implementation:

- payments,
- SSO/admin actions,
- accounting mutations,
- ERP posting,
- CRM outbound communication,
- Gmail sending,
- Calendar changes,
- GitHub writes,
- browser/computer-use actions,
- filesystem writes,
- terminal commands.

Phase 84I adds no approval execution.

## L. Rate-Limit And Retry Strategy

Rate limits should be planned per connector and per capability.

Retries should be idempotency-aware. Denied, mutating, high-risk, payment,
credential, SSO, terminal, and computer-use operations should not retry
automatically.

Phase 84I adds no retry implementation.

## M. Audit Log Strategy

Future redacted connector decision records should include:

- actor hash,
- connector id,
- capability,
- scope,
- approval id when applicable,
- dry-run id,
- result summary,
- risk decision,
- timestamp,
- redaction status.

Audit entries must avoid raw secrets, raw payloads, raw credentials, raw
provider output, raw file content, and raw identity.

Phase 84I adds no audit store implementation.

## N. Sandbox/Isolation Strategy

Filesystem and terminal connectors are future-only.

They must be default-deny and sandboxed. Future filesystem access needs root
allowlists, file count limits, byte limits, preview-first behavior, and explicit
approval for mutation. Future terminal access needs command allowlists, argument
parsing, no shell expansion, no arbitrary interpreter execution, redacted
output, and explicit approval.

Phase 84I adds no terminal execution and no filesystem mutation.

## O. Webhook/Trigger Strategy

Webhook and trigger behavior remains future planning only.

Future webhook connectors require authentication, replay protection, rate
limits, redaction, bounded payloads, source event IDs, audit records, and
default-deny activation.

Phase 84I adds no listeners and no webhook implementation.

## P. Channel Connector Strategy

WhatsApp and Omi/voice are channel-specific, live-adjacent surfaces.

Future connector governance should classify inbound, read, reply, send, create,
update, and dispatch-like behavior separately. Inbound processing does not
imply permission to send or mutate. Voice-derived action items must remain
proposal-only unless a later phase explicitly approves a guarded path.

Phase 84I adds no WhatsApp, Omi, or OpenClaw execution.

## Q. External API Connector Strategy

External APIs are future-only.

Read/write risk depends on the API and endpoint. Credentials are requirements
only in this phase. Dry-runs must avoid calls and should only describe planned
requests, scopes, redaction, approvals, and audit records.

Phase 84I adds no external API implementation.

## R. Payments And Billing Connector Strategy

Payments and billing are critical-risk future connectors.

Phase 84I adds no payment, transfer, purchase, charge, refund, invoice
creation, billing update, settlement, posting, or financial mutation behavior.
Connector metadata must not claim financial correctness.

## S. SSO Connector Strategy

SSO is a critical-risk future connector category.

Identity metadata may be read-only later, but admin, user, group, role,
permission, policy, security, and account mutations are future-only.

Phase 84I adds no OAuth/token handling and no SSO implementation.

## T. BI/Accounting/ERP/CRM Connector Strategy

BI tools should begin with future read-only dashboard and dataset metadata.
Accounting systems should begin with future read-only summaries and no posting
or reconciliation mutation. ERP APIs should begin with future read-only orders,
inventory, procurement, and maintenance summaries. CRM APIs should begin with
future read-only contact, opportunity, account, and activity summaries.

All write and mutation capabilities remain approval-gated future work.

## U. Dashboard/Control-Center Future Visibility

A future read-only control center may display:

- connector inventory,
- connector risk matrix,
- permission status,
- credential requirement status without secret exposure,
- audit summaries,
- dry-run summaries,
- blocked reason codes.

Phase 84I adds no dashboard implementation.

## V. Connector Coverage Matrix

| Connector | MVP/Future status | Risk level | Read-only capabilities | Write/mutation capabilities | Credential needs | Approval needs | Audit needs | Dry-run needs | Notes |
|---|---|---|---|---|---|---|---|---|---|
| Gmail | Future | High | Label, thread, and message summaries | Send, reply, draft, delete, label changes future-only | OAuth/vault reference later | Required for any send or mutation | Required | Required, no calls | No Gmail send in 84I |
| Calendar | Future | High | Availability and event summaries | Create, update, delete, invite future-only | OAuth/vault reference later | Required for changes | Required | Required, no calls | No Calendar create/update in 84I |
| GitHub deeper | Future | High | Repo, issue, PR, and check summaries | Comment, branch, PR, merge, release future-only | Token/vault reference later | Required for writes | Required | Required, no calls | Existing GitHub client is live-adjacent |
| Browser | Future | High | Page metadata and inspection summaries | Click, type, navigate, submit future-only | Optional profile/session reference later | Required for real actions | Required | Required, no browser control | No browser automation in 84I |
| Filesystem safe | Future | High | Bounded metadata and previews | Write, delete, move, rename future-only | Local permission policy | Required for mutation | Required | Required | Default-deny roots |
| Terminal safe | Future | Critical | Command plan metadata | Command execution future-only | Local permission policy | Required | Required | Required | No shell expansion |
| External APIs | Future | Medium/High | API-specific summaries | Endpoint writes future-only | Credential/vault reference later | Required for writes | Required | Required, no calls | Risk varies by endpoint |
| WhatsApp | Existing-adjacent / future governance | High | Inbound/status metadata | Reply/send/create/update future-only | Hook/secret requirements only | Required for sends | Required | Required | Existing bridge is live-adjacent |
| Omi/voice | Existing-adjacent / future governance | High | Memory/action-item summaries | Proposal/action behavior future-only | Webhook secret requirement | Required for action conversion | Required | Required | Voice ambiguity stays high risk |
| OpenClaw/computer-use | Existing-adjacent / future governance | Critical | Capability and dry-run summaries | Tool invoke, click, type, navigate future-only | Gateway token requirement | Required for real actions | Required | Required | Existing client can call network |
| Payments | Future | Critical | Account/status summaries later | Pay, transfer, refund, purchase forbidden until separate approval | Vault reference later | Strong approval required | Required | Required | No financial guarantees |
| Billing/invoicing | Future | Critical | Customer/invoice summaries later | Invoice creation, charge, refund future-only | Vault reference later | Strong approval required | Required | Required | No billing execution in 84I |
| SSO | Future | Critical | Identity metadata later | User, group, role, policy mutation future-only | OAuth/vault reference later | Strong approval required | Required | Required | No SSO implementation in 84I |
| BI tools | Future | Medium/High | Dashboard, dataset, report metadata | Sharing, refresh, export, write future-only | Credential/vault reference later | Required for writes | Required | Required | No BI integration in 84I |
| Accounting systems | Future | Critical | Report and ledger summaries later | Posting, reconciliation, adjustment future-only | Vault reference later | Strong approval required | Required | Required | No correctness guarantees |
| ERP APIs | Future | Critical | Order, inventory, procurement summaries | Fulfill, post, adjust, approve future-only | Vault reference later | Strong approval required | Required | Required | Align with transactional layer |
| CRM APIs | Future | High | Contacts, accounts, opportunities summaries | Email, task, update, delete future-only | OAuth/vault reference later | Required for writes | Required | Required | Outbound comms are high risk |

## W. Integration Plan

Future connector governance should align with:

- Production Runtime Deeper: connector execution depends on runtime maturity,
  credentials, rate limits, audit, and operator controls.
- Native Automation Engine Deeper: connector nodes depend on dry-run,
  versioning, approval gates, and credential strategy.
- Action/proposal/approval system: mutations become proposals first.
- Jobs/notifications: connector jobs remain safe, bounded, and explicit.
- Dashboard/control center: connector inventory and audit are read-only first.
- Channel-action safety: external channel identity and dispatch remain
  default-deny.
- Business Process Modeling: connector handoffs and events remain metadata.
- Transactional Systems Layer: external mutations are transaction-adjacent risk.
- BI/reporting: connector data sources begin as metadata.
- Enterprise UI Patterns: connector admin panels remain advisory UI patterns.
- Safe Self-Improvement: no autonomous connector changes.
- Productization/release path: connector execution requires governance,
  rollback, privacy, and support policy.

## X. Safety Boundaries / Non-Goals

Phase 84I explicitly does not include:

- provider calls,
- network,
- external API calls,
- command execution,
- filesystem mutation,
- credential/vault implementation,
- OAuth/token handling,
- webhook listener implementation,
- browser automation,
- terminal execution,
- payment/billing execution,
- SSO implementation,
- connector write behavior,
- Gmail/Calendar/GitHub write behavior,
- action/proposal/approval execution,
- automation execution,
- runtime/dashboard implementation,
- package/workflow/CI changes,
- DB schemas or SQL,
- production-ready claims,
- security/compliance guarantees.

## Y. Future Source Candidates

These are future-only candidates and are not implemented in 84I:

- `src/connectors/planning/types.ts`
- `src/connectors/planning/connectorPlanTemplates.ts`
- `src/connectors/planning/connectorPlanValidator.ts`
- `src/connectors/planning/connectorPlanBuilder.ts`

Future type candidates include:

- `ConnectorSchemaVersion`
- `ConnectorId`
- `ConnectorCategory`
- `ConnectorCapability`
- `ConnectorRiskLevel`
- `ConnectorBoundarySet`
- `ConnectorPermission`
- `ConnectorCredentialRequirement`
- `ConnectorDataAccessScope`
- `ConnectorActionScope`
- `ConnectorRateLimitPlan`
- `ConnectorAuditPlan`
- `ConnectorDryRunPlan`
- `ConnectorApprovalGate`
- `ConnectorSandboxPlan`
- `ConnectorRedactionRule`
- `ConnectorMaturityPlan`
- `ConnectorValidationFinding`
- `ConnectorValidationResult`

## Z. Future Validation Strategy

Future connector metadata should validate:

- required connector planning fields,
- bounded arrays and text,
- `advisoryOnly` is true,
- all boundaries are true,
- read, write, and mutation capabilities are clearly marked,
- credentials are described as requirements only, never values,
- no secrets, tokens, provider keys, or examples of private credentials,
- write and mutation capabilities require approval-gate metadata,
- high-risk connectors require human approval and audit plan metadata,
- dry-run plans do not perform calls,
- webhooks and triggers are future plans only, not listeners,
- filesystem and terminal connectors are default-deny and sandboxed in future,
- payments, billing, and SSO are future-only unless separately approved,
- no provider, network, filesystem write, action, store, runtime, or automation
  execution behavior,
- no production, security, or compliance guarantees.

## Productization / Release Path

The future productization path is documented in
[Productization / Release Path](productization-release-path.md). Connector
execution cannot be productized before credential governance, audit records,
rate limits, sandboxing, approval gates, runtime maturity, and rollback policy
exist. Phase 85I adds no connector execution, package, tag, release, or
deployment behavior.

## Post-85 Roadmap Sequencing

Future connector work should follow
[Post-85 Roadmap Sequencing](post-85-roadmap-sequencing.md). Connector metadata
may advance before real calls, but credential vaults, external API calls,
webhooks, payments, SSO, and write behavior remain deferred until their
roadmap prerequisites are satisfied.

## Connector Metadata Taxonomy

Phase 94I adds the source-only advisory
[Connector Metadata Taxonomy](connector-metadata-taxonomy.md). The taxonomy
defines connector categories, capability kinds, risk tiers, credential
requirements, dry-run expectations, audit plans, approval gates, sandbox plans,
redaction rules, and maturity stages. It is not connector implementation and
does not enable external API calls, credential handling, webhooks, payments,
SSO, browser automation, terminal execution, or connector writes.

## Credential Vault Strategy

The future credential path is documented in
[Credential Vault Strategy](credential-vault-strategy.md). Connector execution
depends on credential governance, opaque references, least-privilege scopes,
redaction, approval, audit, rotation, revocation, and incident response. Phase
95I does not implement a vault, store credentials, handle OAuth/tokens, call
external services, or enable connector execution.
