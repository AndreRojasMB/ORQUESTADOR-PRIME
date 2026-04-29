# Connector Metadata Taxonomy

Phase 94I is hybrid documentation plus source-only advisory metadata. It adds a
static connector taxonomy and validator, but it does not implement connectors,
call providers, contact external APIs, handle credentials, create webhooks,
drive browsers, run terminal commands, or add dashboard/runtime/automation
behavior.

This phase does not make ORQUESTADOR-PRIME production-ready and does not provide
security, compliance, or certification guarantees.

## Purpose

The connector metadata taxonomy gives ORQUESTADOR-PRIME a safe vocabulary for
future integrations before any real connector behavior exists. It records the
connector categories, capabilities, risk tiers, credential requirements, dry-run
expectations, audit requirements, approval gates, sandbox expectations,
redaction rules, and maturity stages needed for later governance.

The taxonomy is advisory and source-only. Its entries are static metadata for
planning, review, and future validation. They are not connectors.

## Source-Only Advisory Nature

The Phase 94I source lane is limited to:

- `src/connectors/taxonomy/types.ts`
- `src/connectors/taxonomy/connectorTaxonomyTemplates.ts`
- `src/connectors/taxonomy/connectorTaxonomyBuilder.ts`
- `src/connectors/taxonomy/connectorTaxonomyValidator.ts`

Those files must not import or invoke WhatsApp, Omi, OpenClaw, computer-use,
n8n, Coolify, GitHub execution clients, action dispatch paths, job runners,
provider clients, request sandboxing, tool registry, permission stores,
automation, runtime, dashboard, store, memory, or learning modules.

## Taxonomy Model

Each connector taxonomy entry includes:

- connector id,
- category,
- name and summary,
- current status,
- risk tier,
- maturity stage,
- read-only capabilities,
- mutation capabilities,
- permission scopes,
- credential requirements,
- data access scopes,
- action scopes,
- rate-limit and retry plans,
- audit plan,
- dry-run plan,
- approval gate,
- sandbox plan,
- redaction rules,
- assumptions and exclusions,
- explicit source-only advisory boundaries.

All fields are bounded, JSON-safe metadata. Credential requirements are
requirements only and never values.

## Category Model

Supported categories are:

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

## Capability Model

Supported capability kinds are:

- read,
- write,
- mutation,
- trigger,
- webhook,
- browser action,
- terminal command,
- filesystem read,
- filesystem write,
- payment,
- identity administration.

Read, write, and mutation capability metadata must be clearly marked. Any future
write or mutation capability requires approval-gate metadata before it can
advance.

## Risk Tiers

Supported risk tiers are:

- low,
- medium,
- high,
- critical.

High and critical connector entries require audit and approval metadata.
Payments, billing, SSO, terminal, browser/computer-use, and accounting/ERP
connectors default to high or critical review posture.

## Scope Models

Read scopes describe future redacted summaries, counts, labels, status, reason
codes, and other bounded metadata.

Write and mutation scopes describe future behavior that is denied in Phase 94I
and must remain behind explicit approval, audit, sandbox, rate-limit, and
redaction prerequisites.

Data access scopes must deny raw payloads by default. Action scopes are
recommendations and requirements only; they do not execute anything.

## Credential Requirements

Credential fields describe only future requirements:

- whether a future connector needs governed credential references,
- whether delegated consent is needed,
- whether administrative review is needed,
- what broad scope category would be required later.

They must not include credential values, secrets, tokens, provider keys, OAuth
material, webhook secrets, or examples of private credentials.

## Dry-Run Model

Dry-run plans are metadata only. They must specify that external calls are
false. A dry-run plan may describe future expectations such as request previews,
redacted summaries, or approval previews, but it must not call an external
service.

## Audit Model

Audit plans describe future required audit metadata, such as connector id, risk
tier, approval state, redacted subject reference, reason code, and outcome
summary. Phase 94I does not create audit records.

## Approval Gate Model

Approval gates are metadata only. They describe when future human or policy
approval would be required. They do not approve, dispatch, execute, or mutate
anything.

## Sandbox And Isolation Model

Filesystem, terminal, browser, computer-use, payment, billing, SSO, accounting,
and ERP connectors must remain default-deny and future-only. Future sandbox
plans must include isolation, approved scope, redaction, audit, and rollback
expectations before any execution phase is considered.

## Rate-Limit And Retry Model

Rate-limit and retry plans are future policy metadata. They do not enforce
limits, retry requests, contact services, or change runtime behavior.

## Redaction And Privacy Model

Connector summaries should prefer:

- counts,
- labels,
- status,
- reason codes,
- redacted identifiers,
- policy stage,
- risk tier,
- approval status,
- safe next-step recommendations.

Denied by default:

- raw messages,
- raw prompts,
- raw provider output,
- raw service payloads,
- raw tool output,
- secrets,
- tokens,
- credential values,
- channel identity details,
- full artifacts,
- unredacted local paths.

## Maturity Stages

Supported maturity stages are:

- docs-only spec,
- source-only advisory,
- live-adjacent guarded,
- future read-only,
- future gated execution,
- deferred until prerequisites.

Phase 94I entries are source-only advisory taxonomy entries. Some connector
surfaces are marked live-adjacent because related code exists elsewhere, but
the taxonomy does not import or invoke those surfaces.

## Connector Coverage Matrix

| Connector | Category | Risk | Current status | Read-only metadata | Future mutation metadata | Phase 94I denied behavior |
| --- | --- | --- | --- | --- | --- | --- |
| Gmail | productivity | high | future-only | message, thread, label summaries | send, reply, draft, delete, label changes | Gmail remote operations |
| Calendar | productivity | high | future-only | availability and event summaries | create, update, delete, invite | Calendar remote operations |
| GitHub deeper | developer | high | live-adjacent clients exist elsewhere | repo, issue, PR, check summaries | comments, branches, PRs, merges, releases | GitHub writes |
| Browser | browser/computer-use | high | future-only | page metadata | click, type, navigate, submit | browser automation |
| Filesystem safe | local system | high | future-only | file metadata previews | create, delete, move, rename | filesystem reads/writes from taxonomy |
| Terminal safe | local system | critical | future-only | command plan metadata | command behavior | terminal execution |
| External APIs | external API | high | future-only | endpoint and response summaries | remote create, update, delete | external API calls |
| WhatsApp | communications | high | live-adjacent bridge exists elsewhere | inbound and status summaries | send, reply, dispatch | WhatsApp sends or dispatch |
| Omi/voice | communications | high | live-adjacent voice surfaces exist elsewhere | transcript and action-item summaries | proposal/action routing | action execution |
| OpenClaw/computer-use | browser/computer-use | critical | live-adjacent clients exist elsewhere | capability and dry-run summaries | tool invocation, computer actions | computer-use execution |
| Payments | finance | critical | future-only | payment status metadata | charge, transfer, refund | payment execution |
| Billing/invoicing | finance | critical | future-only | customer and invoice summaries | create, send, charge, refund | billing execution |
| SSO | identity | critical | future-only | identity, role, group summaries | user, group, role changes | SSO implementation |
| BI tools | BI | high | future-only | report and dataset summaries | refresh, share, export, write metadata | BI API calls |
| Accounting systems | accounting | critical | future-only | ledger and report summaries | post, reconcile, adjust | accounting mutations |
| ERP APIs | ERP | critical | future-only | order, inventory, procurement summaries | fulfill, post, adjust, approve | ERP mutations |
| CRM APIs | CRM | high | future-only | contact, account, opportunity summaries | update, delete, email, task | CRM writes and outbound actions |

## Validation Rules

The connector taxonomy validator should require:

- supported connector ids only,
- supported categories only,
- supported capability kinds only,
- supported risk tiers only,
- supported maturity stages only,
- bounded arrays and text,
- unique capability, scope, requirement, and rule ids,
- `advisoryOnly: true`,
- `sourceOnly: true`,
- every boundary flag true,
- credentials described only as requirements,
- no secrets, tokens, provider keys, OAuth examples, webhook secrets, or
  credential values,
- write and mutation capabilities require approval-gate metadata,
- high and critical connectors require audit and approval metadata,
- dry-run plans have no external calls,
- webhook and trigger plans are future-only,
- filesystem and terminal connectors are default-deny and future-only,
- payment, billing, and SSO connectors are critical and future-only,
- no provider, network, filesystem write, action, store, runtime, automation, or
  dashboard behavior,
- no production, security, compliance, or certification guarantees.

## Integration Plan

Connector taxonomy may later support:

- integrations/connectors governance,
- native automation connector-node planning,
- action/proposal/approval safety,
- tool permission risk and scope alignment,
- channel-action safety,
- runtime readiness,
- dashboard/control-center readonly manifests,
- readiness/maturity metadata,
- productization and release readiness,
- safe self-improvement review,
- strict CI warning-mode evidence.

All integration remains advisory in Phase 94I.

## Safety Boundaries / Non-Goals

Phase 94I explicitly includes:

- no connector implementation,
- no provider calls,
- no network or external API calls,
- no credential/vault implementation,
- no OAuth/token handling,
- no webhook listener,
- no browser automation,
- no filesystem reads/writes from source,
- no terminal execution,
- no payment/billing execution,
- no SSO implementation,
- no connector write behavior,
- no Gmail/Calendar/GitHub writes,
- no action/proposal/approval execution,
- no automation/runtime/dashboard execution,
- no package/workflow changes,
- no DB schemas/SQL,
- no production-ready claims,
- no security/compliance guarantees.
