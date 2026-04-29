# Release Checklist Template

Status: draft/template only

Completing this template alone does not approve a release. It creates no tag,
package, GitHub release, changelog entry, deployment, license, or security
policy.

## Release Candidate Identifier

`<release-candidate-id>`

## Reviewer Checklist

- Reviewer: `<pending>`
- Review date: `<pending>`
- Approval status: `<draft | pending | approved in later phase>`

## CI Status

- Typecheck: `<pending>`
- Quality gate: `<pending>`
- Redacted artifact dry-run: `<pending>`
- Workflow status: `<pending>`

## Strict CI / Baseline Status

- Strict CI warning mode: `<pending>`
- Fail-on-review: `<disabled | future-only>`
- Fail-on-regression: `<disabled | future-only>`
- Committed baseline status: `<none | pending | approved in later phase>`

## Baseline Manifest Status

- Manifest dry-run status: `<pending>`
- Privacy/redaction status: `<pending>`
- Approval requirement: `<pending>`

## Redacted Artifact Status

- Artifact manifest: `<pending>`
- Retention: `<pending>`
- Privacy scan: `<pending>`

## Quality / Eval / Risk Status

- Quality report: `<pending>`
- Eval status: `<pending>`
- Risk status: `<pending>`
- Human review notes: `<pending>`

## Runtime Readiness Status

- Runtime API/server: `<deferred | pending>`
- Worker/queue/scheduler: `<deferred | pending>`
- Migration/backup/repair: `<deferred | pending>`
- Auth/rate-limit: `<deferred | pending>`

## Dashboard Readiness Status

- Phase 98I gate: `<blocked | pending future review>`
- Write-path isolation: `<pending>`
- Redaction/auth policy: `<pending>`

## Automation Readiness Status

- Validation: `<pending>`
- Dry-run: `<pending>`
- Execution: `<deferred>`

## Connector Readiness Status

- Taxonomy: `<pending>`
- Credentials: `<future-only>`
- External calls: `<deferred>`

## Credential / Vault Readiness Status

- Vault strategy: `<docs-only | pending>`
- Secret storage: `<not implemented>`
- OAuth/token handling: `<not implemented>`

## Docs Completeness

- Release notes draft: `<pending>`
- Operator manual draft: `<pending>`
- Onboarding guide draft: `<pending>`
- Troubleshooting/support draft: `<pending>`
- Rollback draft: `<pending>`

## License / Security / Telemetry Decision Status

- License decision: `<pending>`
- Security disclosure decision: `<pending>`
- Telemetry decision: `<pending>`

## Rollback Plan Status

- Rollback draft exists: `<pending>`
- Reviewer assigned: `<pending>`
- Known rollback blockers: `<pending>`

## Approval Section

- Required reviewers: `<pending>`
- Final reviewer: `<pending>`
- Approval evidence: `<pending>`

## Final Decision Placeholder

`<draft | blocked | ready for separate release approval>`

This template does not approve a release.
