# Release Rollback Template

Status: draft/template only

This template does not execute rollback. It does not delete tags, withdraw
releases, mutate packages, change deployments, revert baselines, or update
release artifacts.

## Purpose

Provide a future rollback planning outline for a release candidate.

## Affected Release Candidate

`<release-candidate-id>`

## Trigger Condition

- `<trigger>`
- `<severity>`
- `<who can request review>`

## Impact Summary

- Affected users/operators: `<pending>`
- Affected artifacts: `<pending>`
- Affected runtime/dashboard/automation/connectors: `<pending>`

## Tag / Release Rollback Placeholder

- Tag: `<pending>`
- GitHub release: `<pending>`
- Required approval: `<pending>`

No tag or release rollback is executed by this template.

## Package Artifact Rollback Placeholder

- Package artifact: `<pending>`
- Registry/source: `<pending>`
- Required approval: `<pending>`

No package artifact rollback is executed by this template.

## Deployment Candidate Rollback Placeholder

- Deployment candidate: `<pending>`
- Environment: `<pending>`
- Required approval: `<pending>`

No deployment rollback is executed by this template.

## Docs Release Rollback Placeholder

- Docs release: `<pending>`
- Affected pages: `<pending>`
- Required approval: `<pending>`

## Baseline Rollback Placeholder If Applicable

- Baseline id: `<pending>`
- Regression risk: `<pending>`
- Required approval: `<pending>`

Baseline rollback must not hide regressions.

## Communication Note

`<draft communication note>`

## Verification After Rollback

- Typecheck: `<pending>`
- Quality gate: `<pending>`
- Artifact review: `<pending>`
- Privacy/redaction review: `<pending>`

## Approval Section

- Requester: `<pending>`
- Reviewer: `<pending>`
- Decision: `<pending>`

## Non-Goals

- No rollback is executed.
- No tags or releases are changed.
- No package or deployment artifact is changed.
- No baseline or artifact mutation.
- No production-ready claim.
