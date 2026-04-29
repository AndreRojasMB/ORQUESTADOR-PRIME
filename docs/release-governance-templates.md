# Release Governance Templates

Status: docs-only/templates-only

Phase 99I adds draft release governance templates only. These are not active
release artifacts, do not publish a release, do not create tags, do not update
`CHANGELOG.md`, do not create `LICENSE`, do not create `SECURITY.md`, do not
change package version, and do not implement telemetry, deployment, docs site,
package publishing, or support policy.

This template set does not make ORQUESTADOR-PRIME production-ready.

## Productization Readiness Review Relationship

The Phase 100I [Productization Readiness Review](productization-readiness-review.md)
uses these templates as evidence that release governance drafts exist. The
review does not publish a release, approve a package, create tags, update
`CHANGELOG.md`, create `LICENSE`, create `SECURITY.md`, or change template
status.

## Purpose

Release governance templates give future reviewers a safe vocabulary for
drafting release notes, release checklists, operator guidance, onboarding,
support triage, rollback plans, and policy decisions before any release action
exists.

The templates are placeholders for future review workflows. They are not
release approval, publication, legal policy, security policy, deployment
policy, telemetry policy, or support commitment.

## Current Release Governance Baseline

The current release baseline remains incomplete:

- root `package.json` version is `1.0.0`,
- local tags exist through `v3.4.0`,
- `CHANGELOG.md` exists but is not aligned with recent phase governance,
- no root `LICENSE` exists,
- no root `SECURITY.md` exists,
- no package publishing path exists,
- no release publishing path exists,
- no strict CI or committed baseline enforcement exists,
- production runtime readiness remains deferred.

Phase 99I does not reconcile any of those items.

## Template Set Overview

This phase adds these draft templates:

- [Release Notes Template](release-notes-template.md),
- [Release Checklist Template](release-checklist-template.md),
- [Operator Manual Template](operator-manual-template.md),
- [Onboarding Guide Template](onboarding-guide-template.md),
- [Troubleshooting / Support Template](troubleshooting-support-template.md),
- [Release Rollback Template](release-rollback-template.md),
- [Telemetry Decision Template](telemetry-decision-template.md),
- [License Decision Template](license-decision-template.md),
- [Security Disclosure Decision Template](security-disclosure-decision-template.md).

## How Templates Should Be Used Later

Future reviewers may copy a template into a reviewed release candidate workspace
or use it as a checklist during planning. Completing a template must not be
treated as release approval.

Before promotion, a future phase must explicitly approve:

- version policy,
- release notes publication,
- changelog update,
- tag creation,
- release publication,
- package publishing,
- deployment publication,
- license policy,
- security disclosure policy,
- telemetry policy,
- support policy.

## Release Governance Boundaries

Templates may contain placeholders, review questions, decision fields, and
future evidence references.

Templates must not:

- change versions,
- change package scripts,
- change workflows,
- create tags,
- publish releases,
- create package artifacts,
- mutate baselines or artifacts,
- implement deployment,
- implement telemetry,
- establish official support, license, or security policy.

## Human Approval Expectations

Future release work requires human approval before any risky step. Stronger
review is required for tags, package publication, deployment, license decisions,
security disclosure policy, telemetry, connector execution, runtime execution,
or dashboard exposure.

Template completion alone does not approve a release.

## Relationship To Productization / Release Path

The productization path defines future maturity stages. These templates provide
draft artifacts for the template stage only. They do not advance package,
version, release, deployment, license, security, telemetry, or docs site
maturity by themselves.

## Relationship To Strict CI / Baselines

Strict CI and committed baselines remain deferred until separately approved.
Templates may ask reviewers to record baseline or strict CI status, but they do
not enable strict flags, create baselines, mutate artifacts, or change CI.

## Relationship To Dashboard / Control Center

Future dashboard or control-center views may eventually summarize release
maturity. Phase 99I does not modify `dashboard/*`, implement release views, or
make the Phase 98I dashboard prototype gate pass.

## Relationship To Runtime / Automation / Connectors

Templates may ask reviewers to record runtime, automation, and connector
readiness status. They do not execute runtime behavior, automation, connectors,
jobs, actions, proposals, approvals, or provider calls.

## Relationship To Credential Vault Strategy

Credential governance remains future-only. Release templates may ask whether
credential strategy is ready, but they do not store credentials, create vault
references, handle tokens, or implement secret policy.

## Relationship To Safe Self-Improvement

Release governance must not be bypassed by autonomous work. Templates do not
authorize self-PRs, release tags, changelog edits, package publication, or
source changes.

## Safety Boundaries / Non-Goals

Phase 99I includes:

- no provider calls,
- no network,
- no package/version changes,
- no package/script changes,
- no workflow/CI changes,
- no Git tags,
- no GitHub releases,
- no release publication,
- no `CHANGELOG.md` update,
- no `LICENSE` creation,
- no `SECURITY.md` creation,
- no telemetry implementation,
- no deployment implementation,
- no docs site implementation,
- no package publishing,
- no baseline/artifact mutation,
- no runtime/dashboard/automation/connector execution,
- no action/proposal/approval execution,
- no jobs execution,
- no production-ready claims,
- no security/compliance guarantees.

## Future Promotion Path

Future promotion should happen in separate approved phases:

1. Review template completeness.
2. Decide version and changelog reconciliation policy.
3. Decide license and security policy.
4. Decide telemetry policy.
5. Approve release checklist gates.
6. Prepare draft release notes.
7. Approve tag and release process.
8. Publish only after explicit release approval.
