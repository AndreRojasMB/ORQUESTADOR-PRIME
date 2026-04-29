# Troubleshooting / Support Template

Status: draft/template only

This is not an official support policy. It does not establish support SLA,
guaranteed fix, compliance handling, or vulnerability response guarantees.

## Purpose

Provide a future support triage outline for bounded, redacted issue review.

## Intended Users

- Maintainers.
- Support reviewers.
- Release reviewers.
- Local operators.

## Issue Summary

- Title: `<pending>`
- Reporter: `<redacted or role only>`
- Date: `<pending>`
- Affected phase/release candidate: `<pending>`

## Environment

- OS: `<pending>`
- Node runtime: `<pending>`
- Package manager: `<pending>`
- WSL/Windows state: `<pending>`

## Symptoms

- `<symptom>`
- `<expected behavior>`
- `<actual behavior>`

## Diagnostics To Collect

- Typecheck result.
- Quality gate result.
- Redacted artifact manifest.
- Runtime/config doctor summary when safe.
- Relevant phase and commit references.

## Allowed Logs / Artifacts

Allowed evidence must be bounded and redacted:

- redacted CI artifacts,
- summary logs with secrets removed,
- reason codes,
- counts,
- status summaries.

## Redaction Rules

Do not include:

- secrets,
- tokens,
- provider keys,
- raw prompts,
- raw provider output,
- raw user messages,
- raw config values,
- webhook material,
- raw local paths,
- full artifacts.

## Known WSL / Windows Node Fallback Note

If WSL `node`, npm shims, or `tsx` are unavailable, use the approved direct
Windows Node fallback when source checks otherwise pass.

## CI Artifact Review

- Artifact name: `<pending>`
- Retention: `<pending>`
- Privacy scan status: `<pending>`

## Config Doctor Issues

- Summary: `<pending>`
- Redaction status: `<pending>`
- No config writes from this template.

## Provider Setup Issues

- Status summary only.
- No provider calls.
- No raw provider key or token values.

## Dashboard Safety Issues

Reference the Phase 98I dashboard prototype gate. Do not expose raw stores,
raw config values, or dashboard write paths.

## Automation Dry-Run Failures

Record validation or dry-run summary only. Do not execute automation.

## Connector Permission Issues

Record connector category, risk tier, and credential requirement status only.
Do not call connectors.

## Release Rollback Reference

- Rollback template/reference: `<pending>`

## Escalation Path Placeholder

- Reviewer: `<pending>`
- Criteria: `<pending>`
- Next action: `<pending>`

## Non-Goals

- No support SLA.
- No guaranteed fix.
- No compliance handling claim.
- No official vulnerability response guarantee.
- No provider, runtime, automation, connector, action, job, or dashboard
  execution.
