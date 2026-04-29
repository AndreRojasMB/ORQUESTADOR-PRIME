# Control Center Readonly Manifest

Status: docs-only/spec-only

Phase 89I is docs-only and spec-only. It does not implement a dashboard, modify
`dashboard/`, create source metadata, generate manifests, generate artifacts,
read files, read stores, implement redaction, or implement auth.

This document defines a future read-only inventory contract for control-center
consumption. It does not make ORQUESTADOR-PRIME production-ready.

## A. Purpose

A readonly manifest is needed because a future control center should know which
redacted, approved data sources it may display without browsing raw local stores
or relying on write-capable dashboard paths.

The future control center needs a safe inventory of approved redacted data
sources: quality summaries, redacted CI artifact references, readiness
metadata, doctor summaries, governance summaries, and other bounded advisory
signals.

This phase is documentation and specification only. It creates no manifest
file, no manifest generator, no dashboard route, no dashboard component, no
server action, and no data reader.

## B. Current Baseline

Phase 88I documented the existing dashboard as live-adjacent.

The existing dashboard directly reads local stores through `dashboard/lib/data.ts`.
That same helper exposes `writeConfig`, which can persist local config changes.
`dashboard/app/config/actions.ts` has a write-capable server action,
`saveConfig`, and `dashboard/app/config/ConfigForm.tsx` is wired to that server
action.

No obvious auth, session, role, or middleware boundary was found in the tracked
dashboard source inspected during the safety audit. No centralized dashboard
redaction layer was found.

Quality dashboard data and CI artifacts show a safer pattern: compact,
advisory, redacted JSON summaries. Readiness metadata is source-only advisory
and must not be treated as live repo scanning or raw dashboard data access.

## C. Current Readiness Gaps

Current gaps before a safe readonly manifest can support future control-center
work:

- no unified manifest format,
- no allow/deny data category policy for control-center consumption,
- no manifest validation rules,
- no explicit policy separating redacted artifacts from raw local stores,
- no future dashboard consumption contract,
- no redaction/auth prerequisite tied directly to manifest use.

## D. Readonly Manifest Concept

A control-center readonly manifest is a future read-only inventory contract.

A static manifest should describe approved future control-center data sources.
Manifest entries may reference redacted artifacts, docs, source metadata, or
advisory summaries by string. Those references are metadata only.

Manifest entries must not:

- import source modules,
- read files,
- read stores,
- bind routes,
- call runtime behavior,
- browse raw stores,
- generate artifacts,
- implement dashboard behavior.

The manifest is a policy boundary between safe summary visibility and unsafe
raw operational data.

## E. Manifest Item Categories

Future manifest categories:

- `quality_reports`,
- `quality_snapshots`,
- `redacted_ci_artifacts`,
- `eval_risk_summaries`,
- `runtime_doctor_summaries`,
- `config_doctor_summaries`,
- `readiness_maturity_metadata`,
- `factory_advisory_metadata`,
- `dashboard_safety_audit_status`,
- `automation_dry_run_summaries`,
- `connector_governance_summaries`,
- `baseline_strict_ci_maturity_summaries`,
- `release_productization_maturity_summaries`.

Categories are planning vocabulary. Phase 89I adds no source enum and no
runtime validation.

## F. Allowed Data Categories

Future manifest entries may allow bounded read-only summaries such as:

- status,
- counts,
- reason codes,
- redacted artifact names,
- artifact manifest metadata,
- retention metadata,
- readiness lane maturity,
- blockers,
- next-step recommendations,
- policy stage,
- checklist status,
- validation summary,
- risk tier,
- high-level failure ids when redacted,
- doc/source reference strings.

Allowed data must stay advisory, bounded, redacted, and non-executable.

## G. Denied Raw / Private Data Categories

The manifest should deny these categories by default:

- raw stores,
- raw memory,
- raw task bodies,
- raw user messages,
- raw prompts,
- raw provider output,
- raw tool output,
- raw config values,
- hook tokens,
- provider keys,
- API tokens,
- credentials,
- OAuth material,
- full file content,
- execution output,
- raw proposal params,
- channel identity details,
- unredacted local paths,
- secrets.

Denied categories must not be reintroduced as allowed data through naming,
summaries, examples, or raw-detail escape hatches.

## H. Redaction Expectations

Future control-center data should summarize before detail.

The manifest should require:

- no raw secrets, config values, or tokens,
- no raw prompts, task bodies, or provider output,
- no raw local paths by default,
- redaction before dashboard consumption,
- explicit redaction status for each source class,
- future redaction layer as a prerequisite.

Redaction rules are strategy only in Phase 89I. This phase implements no
redaction behavior.

## I. Artifact / Source Reference Model

Artifact references are read-only references only. They may name an approved
artifact class, artifact label, retention policy, privacy scan status, or
manifest metadata shape.

Source references are documentation or source pointers only. They are not
imports, module bindings, runtime dependencies, or file-read instructions.

Future metadata should make freshness and staleness explicit, such as:

- generated-at timestamp when already available from a redacted source,
- retention window,
- source phase,
- known stale/unavailable state,
- human review note.

Phase 89I adds no live scanning, no file reads, and no source metadata.

## J. Manifest Coverage Plan

| Area | Allowed read-only summary | Denied raw/private data | Required redaction expectation | Risk tier | Future dashboard visibility |
|---|---|---|---|---|---|
| Quality reports | Overall status, counts, reason codes, warning/failing ids when redacted | Raw eval payloads, raw task bodies, provider output, execution output | Compact advisory JSON with bounded fields | medium | Future read-only summary |
| Quality snapshots | Snapshot status, comparison summary, privacy/budget status, fingerprint summary | Baseline mutation data, raw report dumps, full diagnostic payloads | Redacted snapshot fields only | medium | Future read-only summary |
| Redacted CI artifacts | Artifact names, byte sizes, hashes, retention, privacy scan status | Full file content, absolute paths, secrets, raw proposal params | Artifact manifest metadata only | medium | Future read-only artifact index |
| Eval/risk summaries | Eval status, risk decision, reason codes, human review flag | Raw eval cases, raw task bodies, raw provider output | Summary before detail, no raw payloads | medium | Future read-only review panel |
| Runtime/config doctor | Check status, bounded check names, safe summaries | Raw config values, hook tokens, secrets, repair actions | Masked summaries only | high | Future read-only doctor status |
| Readiness metadata | Lane maturity, risk tier, blockers, next-step recommendations | Live repo scan output, direct dashboard/store reads | Source-only advisory metadata strings | low | Future read-only maturity lane |
| Factory metadata | Advisory catalog and lane status | Generated systems, runtime tasks, DB schemas, scaffold output | Advisory metadata only | low | Future read-only factory view |
| Dashboard audit | Read/write inventory status, prerequisite checklist | Raw dashboard data, config values, local store content | Audit summaries only | medium | Future safety readiness view |
| Automation dry-run | Validation status, unsupported feature summary, trace summary | Workflow execution, persisted workflows, secrets, trigger payloads | Dry-run summaries only | high | Future read-only automation review |
| Connector governance | Connector category, risk tier, credential requirement status without values | Tokens, OAuth material, API payloads, webhook secrets, external call output | Requirements and policy metadata only | critical | Future read-only connector inventory |
| Baseline/strict CI | Maturity stage, policy status, comparison plan, reviewer note | Baseline mutation, strict enforcement changes, raw artifact dumps | Policy summaries only | medium | Future read-only CI maturity status |
| Release/productization | Checklist status, maturity stage, release policy summary | Tags, release artifacts, packages, security claims | Governance summaries only | medium | Future read-only release maturity status |

## K. Future Dashboard Consumption Model

A future dashboard or control center may consume manifest entries read-only only
after the dashboard write paths are isolated and redaction/auth prerequisites
exist.

Future consumption must preserve:

- no direct raw store browsing,
- no write paths,
- no server-action mutation,
- no `writeConfig`,
- no config mutation,
- no operator controls,
- no raw secret exposure,
- auth/redaction policy before display.

The manifest should make safe display possible without encouraging operators to
treat visibility as permission to mutate runtime, config, jobs, actions,
automation, connectors, or releases.

## Runtime Doctor Summary Relationship

The Phase 91I [Runtime Doctor Safe Expansion](runtime-doctor-safe-expansion.md)
keeps doctor output read-only and redacted. Future control-center manifests may
reference bounded doctor summaries, but they must not use the dashboard to read
raw stores, expose raw config values, invoke migration planning, acquire locks,
or execute runtime behavior.

## L. Future Validation Strategy

Future validation should require:

- required manifest planning fields,
- bounded arrays and text,
- known categories only,
- known risk tiers only,
- `advisoryOnly: true` if metadata is later added,
- all safety boundaries set to true,
- references as metadata strings only,
- artifact references as read-only references only,
- source references as pointers only, not imports,
- denied raw data categories cannot appear as allowed data,
- redaction rules remain strategy only unless later implemented,
- no secret, token, or provider key examples,
- no provider, network, filesystem, action, store, runtime, automation, job, or
  dashboard behavior,
- no production, security, or compliance guarantees.

## M. Integration Plan

The readonly manifest should later support:

- Dashboard / Control Center read-only source inventory,
- Readiness / Maturity Metadata lane visibility,
- Runtime Readiness Validator summaries,
- quality, evals, and risk summaries,
- baseline and strict CI maturity summaries,
- production runtime and config doctor status,
- native automation validation and dry-run summaries,
- integrations/connectors governance summaries,
- productization and release maturity status,
- safe self-improvement review evidence,
- enterprise software factory governance.

Integration should start with redacted summaries and metadata strings before any
direct store access or dashboard UI work.

## Runtime Readiness Relationship

Future read-only manifest entries may include bounded summaries from
[Runtime Readiness Validator](runtime-readiness-validator.md). Those entries
should be metadata strings and readiness status only. They must not become live
runtime probes, direct store reads, runtime doctor wrappers, migration planner
wrappers, lock operations, dashboard controls, or server-action behavior.

## Baseline Manifest Dry-Run Relationship

Future read-only manifest entries may include bounded summaries from
[Baseline Manifest Dry-Run](baseline-manifest-dry-run.md). Those entries should
remain metadata strings for baseline candidate status, redacted artifact
references, privacy status, approval needs, rollback references, and retention
notes; they must not become artifact reads, baseline writes, strict CI gates, or
dashboard controls.

## N. Risks And Open Questions

Open questions for later phases:

- whether the future manifest should remain docs-only, become static source
  metadata, or become a generated artifact later,
- whether references should point to CI artifact names, source metadata ids,
  docs, or all three,
- how freshness and staleness should be represented without live scanning,
- whether future dashboard consumption should happen only from CI artifacts or
  also from curated source metadata,
- how auth and redaction prerequisites will be proven before display,
- how unavailable or stale references should be shown without reading stores.

Existing dashboard write paths remain hard blockers for treating the dashboard
as a safe read-only control center.

## O. Safety Boundaries / Non-Goals

Phase 89I explicitly includes:

- no dashboard source changes,
- no dashboard app implementation,
- no route/component/server-action changes,
- no `writeConfig` changes,
- no config writes,
- no direct raw store browsing,
- no filesystem reads/writes from source,
- no store/memory mutation,
- no artifact generation/mutation,
- no provider calls,
- no network,
- no command execution,
- no runtime execution,
- no action/proposal/approval execution,
- no automation execution,
- no jobs execution,
- no package/workflow changes,
- no production-ready claims,
- no security/compliance guarantees.

## P. Future Source Candidates

Future source candidates, not implemented in Phase 89I:

- `src/controlCenter/manifest/types.ts`,
- `src/controlCenter/manifest/controlCenterManifestTemplates.ts`,
- `src/controlCenter/manifest/controlCenterManifestValidator.ts`,
- `src/controlCenter/manifest/controlCenterManifestBuilder.ts`.

Future type candidates:

- `ControlCenterManifestSchemaVersion`,
- `ControlCenterManifestId`,
- `ControlCenterManifestCategory`,
- `ControlCenterManifestRiskTier`,
- `ControlCenterManifestBoundarySet`,
- `ControlCenterManifestItem`,
- `ControlCenterManifestArtifactReference`,
- `ControlCenterManifestSourceReference`,
- `ControlCenterManifestRedactionRule`,
- `ControlCenterManifestAllowedDataCategory`,
- `ControlCenterManifestDeniedDataCategory`,
- `ControlCenterManifestConsumerNote`,
- `ControlCenterManifestValidationFinding`,
- `ControlCenterManifestValidationResult`.

## Connector Metadata Taxonomy Relationship

Future readonly manifest entries may include bounded summaries from
[Connector Metadata Taxonomy](connector-metadata-taxonomy.md), such as connector
category, risk tier, maturity stage, credential requirement status, dry-run
expectations, audit requirement status, and approval-gate requirement status.
Those entries must remain read-only metadata strings and must not become direct
connector imports, external service calls, credential access, webhook listeners,
dashboard controls, or connector writes.
