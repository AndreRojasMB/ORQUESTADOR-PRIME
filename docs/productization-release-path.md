# Productization / Release Path

Status: docs-only/spec-only

Phase 85I is docs-only and spec-only. It does not change package version, create
tags, create GitHub releases, update `CHANGELOG.md`, publish release notes, or
implement packaging, installers, deployment, docs site, telemetry, license,
security, or vulnerability disclosure policy. It does not make
ORQUESTADOR-PRIME production-ready.

This document defines a future release governance path only.

## Phase 99I Release Governance Templates

Phase 99I adds docs-only draft templates in
[Release Governance Templates](release-governance-templates.md). The templates
cover release notes, release checklist, operator manual, onboarding,
troubleshooting/support, rollback, telemetry decision, license decision, and
security disclosure decision workflows. They do not publish a release, create
tags, change package versions, update `CHANGELOG.md`, create `LICENSE`, create
`SECURITY.md`, implement deployment, implement telemetry, or make
ORQUESTADOR-PRIME production-ready.

## A. Purpose

Productization and release governance exists so ORQUESTADOR-PRIME can
eventually move from internal phase work toward reviewed, versioned, packaged,
and supportable releases.

The future benefits are clearer version discipline, safer release evidence,
reviewable rollback paths, better operator onboarding, and fewer accidental
public claims.

This phase is governance/spec only. It is not a release, a package, a tag, a
deployment, a docs site, or a production-readiness declaration.

## B. Current Productization Baseline

Current repository observations:

- `README.md` exists.
- `CHANGELOG.md` exists, but it appears historically oriented and not aligned
  with recent phase commits.
- Root `package.json` version is `1.0.0`.
- Existing Git tags include `v2.0.0`, `v2.1.0`, `v3.0.0`, `v3.2.0`,
  `v3.3.0`, and `v3.4.0`.
- No tracked root `LICENSE` was found during Phase 85B planning.
- No tracked root `SECURITY.md` was found during Phase 85B planning.
- CI has one quality workflow.
- Redacted quality artifacts exist with short retention.
- Baselines and strict CI remain deferred.
- Runtime production readiness remains deferred.
- Deployment packaging remains deferred.
- Dashboard/control center, automation, connectors, and self-improvement are
  documented as future/spec-only or read-only-first lanes.

These facts show useful release foundations, but they do not form a complete
product release process.

## C. Productization Gaps

Current gaps before productized releases include:

- no release governance spec before Phase 85I,
- no aligned semantic versioning policy,
- no current release note template or release checklist beyond quality/CI
  readiness,
- no approved tag or release process for recent phases,
- no packaging, installer, or deployment release path,
- no docs site plan,
- no tracked root license, security policy, or vulnerability disclosure policy,
- no telemetry policy,
- no operator, onboarding, or support documentation set,
- version, tag, and changelog misalignment that must be resolved later through a
  dedicated governance step.

Phase 85I documents these gaps. It does not reconcile them.

## D. Semantic Versioning Strategy

Future releases should use SemVer only after the release governance policy
defines what counts as public behavior for ORQUESTADOR-PRIME.

Possible future version rules:

- CLI behavior: breaking command or argument changes can be major; additive
  commands can be minor; wording or docs-only updates can be patch or no release
  depending on policy.
- Runtime behavior: new runtime execution surfaces, server APIs, persistence,
  or mutation semantics should require stricter review and may be major if
  public contracts change.
- Automation execution: moving from validation or dry-run to execution is a
  major governance event, not a routine minor release.
- Connector behavior: adding real connector calls, credentials, webhooks, or
  writes should be treated as high-risk release work.
- Dashboard/control-center behavior: read-only views can be minor after safety
  review; operator controls or write-capable paths require stronger governance.
- Factory advisory metadata: new advisory templates or validators may be minor
  if bounded and source-only.
- Docs-only phases: docs-only governance changes can be patch-level or
  non-release updates until a release train is approved.

Phase 85I does not change package version.

Phase 85I does not reconcile existing tags.

## E. Changelog Strategy

Future changelog discipline should separate:

- phase-level entries: detailed implementation history for internal review,
- release-level summaries: concise user/operator-facing summaries,
- governance entries: release policy, readiness, and non-goal changes,
- migration entries: only when behavior actually requires operator action,
- risk entries: known safety boundaries, deferred items, and rollback notes.

Commits and phases should map to changelog categories such as added, changed,
fixed, docs, security-policy, deprecated, removed, and known risks. The mapping
should not imply a public release until a release is explicitly approved.

Phase 85I does not update `CHANGELOG.md`.

Current changelog alignment should be handled in a future dedicated phase.

## F. Release Notes Strategy

Future release notes should include:

- release version,
- date,
- scope,
- included phases and commits,
- verification summary,
- known risks,
- breaking changes,
- migration notes,
- runtime, connector, and automation status,
- artifact links,
- rollback plan,
- explicit non-goals,
- production-readiness status.

Release notes should be generated from reviewed inputs, not from raw logs or
unbounded task transcripts.

Phase 85I publishes no release notes.

## G. Tag And GitHub Release Strategy

Tags and GitHub releases are future-only.

Future tags should be approved, aligned with SemVer, and backed by release
readiness evidence. Signed tags or explicitly approved tags are preferred later.

Future GitHub releases should require:

- approved release notes,
- CI evidence,
- artifact redaction status,
- rollback notes,
- reviewer approval,
- known-risk summary,
- explicit production-readiness status.

Phase 85I creates no tags and no GitHub releases.

## H. Packaging Strategy

Packaging is future-only. Separate packaging concerns should be tracked for:

- CLI or npm package,
- dashboard app,
- runtime service,
- docs site,
- deployment bundle.

Packaging should wait for version policy, artifact policy, license policy,
security policy, and rollback governance.

Phase 85I adds no packaging implementation.

## I. Installer / Deployment Strategy

Installer and deployment strategy is future-only.

Future deployment work should separate:

- local install,
- local operator/admin runtime,
- server deployment,
- Coolify, Docker, or deployment candidates,
- enterprise deployment.

Deployment candidates require runtime maturity, security review, rollback
strategy, operator documentation, config policy, and release approval.

Phase 85I adds no installer and no deployment implementation.

## J. Docs Site Strategy

Docs site work is future-only.

The safe first step is a docs inventory and navigation plan. Public docs should
avoid publishing product, production, security, or compliance claims until
release governance and product status are explicit.

Phase 85I adds no docs site implementation.

## K. Onboarding Guide Strategy

Future onboarding should cover:

- local setup,
- environment expectations,
- WSL/Windows Node caveats,
- safe modes,
- quality checks,
- provider setup boundaries,
- dashboard safety,
- runtime, automation, and connector non-goals,
- operator expectations.

Phase 85I does not create a separate onboarding guide.

## L. Operator Manual Strategy

Future operator documentation should cover:

- runtime doctor,
- config doctor,
- quality artifacts,
- dashboard/control-center read-only posture,
- jobs and notifications,
- approvals and proposals,
- automation dry-runs,
- connector governance,
- rollback and support escalation.

Phase 85I does not create an operator manual.

## M. Troubleshooting / Support Strategy

Future troubleshooting and support docs should cover:

- WSL/Windows Node fallback,
- CI artifact review,
- redaction failures,
- config doctor issues,
- provider setup issues,
- dashboard safety,
- automation dry-run failures,
- connector permission issues,
- release rollback.

Phase 85I adds no support system.

## N. Telemetry Policy Strategy

Default posture: no telemetry until explicitly designed.

Future telemetry requires:

- privacy review,
- opt-in and opt-out policy,
- retention policy,
- redaction policy,
- user notice,
- artifact boundaries,
- release approval.

Phase 85I adds no telemetry implementation.

## O. License Policy Strategy

A license decision is required before distribution claims.

Future `LICENSE` creation or mutation requires explicit approval and should be
paired with a release policy review.

Phase 85I creates no `LICENSE` and changes no license policy.

## P. Security Policy And Vulnerability Disclosure Strategy

A future `SECURITY.md` candidate should define:

- reporting channel,
- supported versions,
- expected response process,
- disclosure handling,
- scope,
- vulnerability triage expectations,
- relationship to release rollback.

Phase 85I creates no `SECURITY.md` and changes no security policy.

This document makes no security or compliance guarantees.

## Q. Release Readiness Checklist

Future release readiness should check:

- quality checks,
- eval/risk status,
- baseline and strict CI maturity,
- artifact redaction,
- changelog and release notes,
- version and tag approval,
- runtime readiness,
- dashboard readiness,
- automation readiness,
- connector readiness,
- docs completeness,
- license, security, and telemetry policy status,
- rollback plan,
- reviewer approval.

Current quality/CI readiness is one input to release readiness. It is not full
product readiness.

## R. Artifact Policy

Release artifacts should be redacted, bounded, review-only, and governed by
retention and privacy policy.

Existing redacted quality artifacts remain short-retention review evidence.
They are not package artifacts, release artifacts, baselines, or runtime
approval.

Phase 85I mutates no baselines and no artifacts.

## S. Rollback Strategy

Future rollback should cover:

- revert release tag,
- withdraw GitHub release,
- rollback package artifact,
- rollback deployment candidate,
- rollback docs release,
- restore previous baseline if applicable,
- communicate known issue.

Rollback should not hide regressions or weaken quality logic.

Phase 85I adds no rollback behavior.

## T. Governance / Approval Strategy

Release changes require human review and explicit approval.

Risky release steps require stronger review and may require second approval.
Examples include tags, public releases, package publication, deployment
candidates, license changes, security policy changes, telemetry, connector
execution, runtime execution, and automation execution.

Productization must not bypass action/proposal/approval safety.

Phase 85I executes no approvals.

## U. Productization Maturity Stages

The intended maturity stages are:

1. Internal docs-only release strategy.
2. Release checklist and templates.
3. Changelog and release note discipline.
4. Semantic versioning discipline.
5. Strict CI and baseline prerequisite.
6. Signed or approved tags future.
7. GitHub release future.
8. Packaging and installer future.
9. Docs site future.
10. Operator, onboarding, and support docs future.
11. Security, license, and telemetry governance future.
12. Enterprise deployment governance future.

Each stage should be reversible or explicitly reviewed before it becomes a
release gate.

## V. Integration Plan

Future productization should align with:

- Baseline / Strict CI: stronger release gates require approved baseline and CI
  governance.
- Quality / Evals / Risk: release evidence remains review evidence until
  approved gates exist.
- Release Readiness: current quality/CI readiness becomes one input to release
  readiness.
- Dashboard / Control Center: future read-only release status and maturity
  visibility.
- Production Runtime: executable release claims require runtime maturity.
- Native Automation: automation execution cannot be productized until
  approval-gated runtime maturity exists.
- Integrations / Connectors: connector execution requires credential, audit,
  rate-limit, and approval governance.
- Safe Self-Improvement: no autonomous release artifact, tag, baseline,
  changelog, prompt, router, agent, or source changes.
- Enterprise Software Factory: factory outputs remain advisory until release
  packaging and publishing boundaries exist.
- GitHub releases and tags: future-only after release approval.
- Deployment / productization: future packaging requires separate deployment
  review.

## W. Safety Boundaries / Non-Goals

Phase 85I explicitly does not include:

- provider calls,
- network,
- filesystem mutation from source,
- package or version changes,
- package or script changes,
- workflow or CI changes,
- Git tags,
- GitHub releases,
- changelog or release note publication,
- packaging or installer implementation,
- deployment implementation,
- docs site implementation,
- telemetry implementation,
- license or security policy changes,
- baseline or artifact mutation,
- action, proposal, or approval execution,
- automation, runtime, dashboard, or connector execution,
- production-ready claims,
- security or compliance guarantees.

## X. Future Docs / Source Candidates

Future docs candidates:

- `docs/release-notes-template.md`
- `docs/operator-manual.md`
- `docs/onboarding-guide.md`
- `docs/troubleshooting-support.md`
- future `SECURITY.md`
- future `LICENSE`
- future `CHANGELOG.md` update policy section

Future source metadata candidates, only if a later phase approves them:

- `ProductizationSchemaVersion`
- `ReleaseCapability`
- `ReleaseBoundarySet`
- `SemanticVersioningPlan`
- `ChangelogPlan`
- `ReleaseNotesPlan`
- `TagReleasePlan`
- `PackagingPlan`
- `DeploymentPlan`
- `DocsSitePlan`
- `TelemetryPolicyPlan`
- `LicensePolicyPlan`
- `SecurityPolicyPlan`
- `ReleaseReadinessChecklist`
- `ReleaseArtifactPolicy`
- `ReleaseRollbackPlan`
- `ReleaseValidationResult`

## Y. Future Validation Strategy

Future metadata should validate:

- bounded planning fields and text,
- `advisoryOnly` is true,
- all boundaries are true,
- version, tag, and release entries are marked plans only,
- package and deployment entries are marked plans only,
- telemetry, security, and license entries are marked policy plans only,
- no provider, network, filesystem write, action, store, runtime, or automation
  behavior,
- no release publication claims,
- no production, security, or compliance guarantees.

## Post-85 Roadmap Sequencing

The safe implementation order after Phase 85 is documented in
[Post-85 Roadmap Sequencing](post-85-roadmap-sequencing.md). Productization
should follow that sequence and its maturity gates before any package, tag,
release, deployment, dashboard control, runtime execution, connector execution,
or strict CI work advances.

## Readiness / Maturity Metadata

Future release readiness may reference
[Readiness / Maturity Metadata](readiness-maturity-metadata.md) as non-blocking
review evidence. The readiness lane does not create release gates, change
versions, update changelogs, publish packages, create tags, create releases,
deploy systems, or make productization claims.

## Enterprise Demo Advisory Relationship

[Enterprise Demo Generator Advisory](enterprise-demo-generator-advisory.md)
can support future product narrative review, but demos are not product or
release evidence until governed. Phase 97I demo metadata does not generate demo
apps, scaffold projects, write files, create dashboards, create DB schemas,
publish artifacts, or make production, commercial, security, or compliance
claims.
