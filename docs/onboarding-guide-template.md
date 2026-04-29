# Onboarding Guide Template

Status: draft/template only

This is not an official installer, package publication, deployment guide, or
production setup guide.

## Purpose

Provide a future onboarding outline for developers, reviewers, and operators
after release governance decides what can be published.

## Intended Users

- New maintainers.
- Local developers.
- Release reviewers.
- Operators in future approved environments.

## Prerequisites

- Node version: `<pending>`
- Package manager: `<pending>`
- Operating system notes: `<pending>`
- Access requirements: `<pending>`

## Local Setup Placeholder

```text
<future setup steps after approval>
```

Do not treat this template as a runnable install guide.

## WSL / Windows Node Caveats

Mixed WSL/Windows environments may require direct Windows Node fallback when
WSL `node`, npm shims, or `tsx` are unavailable.

## Environment Variable Boundaries

- Never commit env values.
- Never include provider keys, tokens, webhook secrets, or credential values in
  docs.
- Future credential references must remain opaque.

## Provider Setup Caveats

Provider setup remains local and sensitive. This template does not call
providers, validate provider keys, or implement provider onboarding.

## Quality Checks

- Typecheck: `<pending>`
- Quality gate: `<pending>`
- Artifact dry-run: `<pending>`

Quality checks are review signals, not release approval by themselves.

## Safe Modes

- `<mode>`
- `<boundary>`
- `<review note>`

## Dashboard Safety

Dashboard prototype work remains blocked until the Phase 98I gate prerequisites
are met.

## Runtime / Automation / Connector Non-Goals

- No production runtime readiness claim.
- No automation execution.
- No connector execution.
- No credential/vault implementation.

## Contribution / Review Workflow Placeholder

- Branch strategy: `<pending>`
- Reviewers: `<pending>`
- Required checks: `<pending>`

## Common Pitfalls

- Treating templates as release approval.
- Publishing raw artifacts.
- Exposing secrets in docs or logs.
- Assuming package version and tags are aligned.
- Treating dashboard visibility as safe control-center readiness.

## Non-Goals

- No official installer.
- No production deployment guide.
- No package publishing.
- No provider/network behavior.
- No security or compliance guarantee.
