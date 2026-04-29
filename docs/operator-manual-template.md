# Operator Manual Template

Status: draft/template only

This is not an official operator manual and does not claim production operations
readiness, support SLA, or security guarantee.

## Purpose

Provide a future outline for operating ORQUESTADOR-PRIME after release
governance, runtime maturity, credential governance, and dashboard safety are
approved.

## Intended Users

- Local operators.
- Maintainers.
- Release reviewers.
- Support reviewers.

## Operating Posture

`<describe intended operating mode>`

The default posture remains human-reviewed and non-autonomous unless a later
phase explicitly approves more.

## Safe Modes

- `<safe mode>`
- `<disabled behavior>`
- `<review expectation>`

## Runtime Doctor

- Command/reference: `<pending>`
- Expected output: `<bounded summary only>`
- Non-goal: no repair, migration apply, backup, restore, or runtime mutation.

## Config Doctor

- Command/reference: `<pending>`
- Expected output: `<redacted summary only>`
- Non-goal: no config write and no raw secret display.

## Quality Artifacts

- Artifact class: `<redacted quality artifact>`
- Retention: `<pending>`
- Review notes: `<pending>`

## Dashboard / Control-Center Read-Only Posture

The dashboard remains gated by the Phase 98I decision until write isolation,
redaction, auth/role strategy, privacy review, and manifest-backed data
sourcing are complete.

## Jobs / Notifications Boundaries

- Read-only status only unless later approved.
- No job execution, enqueue, delivery, retry, or scheduler activation.

## Actions / Proposals / Approvals Boundaries

- Review metadata only unless later approved.
- No action dispatch.
- No proposal execution.
- No approval grant, consume, reject, or bypass.

## Automation Dry-Run Boundaries

- Validation and dry-run summaries only.
- No workflow persistence, trigger enablement, scheduler activation, connector
  invocation, or action bridge.

## Connector Governance Boundaries

- Connector metadata and risk summaries only.
- No external API calls, credentials, OAuth, webhooks, browser automation, or
  connector writes.

## Credential / Vault Boundaries

- Credential requirements only.
- No vault implementation, secret storage, token handling, or secret display.

## Escalation Path Placeholder

- Primary reviewer: `<pending>`
- Backup reviewer: `<pending>`
- Escalation criteria: `<pending>`

## Redaction / Privacy Notes

- Summaries before raw detail.
- No secrets, tokens, provider keys, raw prompts, raw provider output, raw
  config values, or raw local paths.

## Non-Goals

- No production operations readiness claim.
- No support SLA.
- No security guarantee.
- No compliance guarantee.
- No runtime, dashboard, automation, connector, action, proposal, approval, or
  job execution.
