# CI Artifacts Redaction

Phase: 49B-H
Status: minimal upload active

## Purpose

This document defines the policy for CI quality artifacts and redaction.
Minimal redacted artifact upload is active as of Phase 52B-H.

The goal is to make sure any future downloadable CI evidence is compact,
redacted, temporary, and useful for human review without turning quality output
into runtime approval enforcement.

## Current State

The active `quality` workflow currently runs:

```bash
npm ci
npm run check:node
npm run quality:gate
npm run quality:artifacts:dry-run -- --out-dir=/tmp/orq-quality-artifacts-ci
```

Current CI boundaries:

- quality CI is active,
- redacted artifact upload is active,
- baselines are not active,
- strict review and regression flags are not active,
- provider secrets are not configured,
- runtime approval enforcement is not active,
- dispatch or proposal behavior is not active.

## Artifact Eligibility

Eligible artifacts must be compact redacted JSON only.

The active upload includes:

- `quality-report.json`
- `quality-snapshot.json`
- `manifest.json`

Do not upload full eval, risk, or gate dumps. Those outputs are useful
locally, but they contain richer nested diagnostic context than the first CI
artifact phase needs.

## Forbidden Artifact Content

CI artifacts must not contain:

- tokens,
- API keys,
- bearer values,
- email addresses,
- phone numbers,
- request-body payloads,
- raw-body payloads,
- raw task bodies,
- raw provider output,
- execution output,
- absolute local paths,
- raw proposal parameters,
- full file contents,
- secrets or credential-like values.

## Required Safeguards Before Upload

Before CI uploads any quality artifact, the workflow must:

- generate artifacts under an isolated CI temporary directory,
- use an explicit `/tmp/orq-*` output directory,
- validate generated files as JSON,
- run a privacy and sentinel scan before upload,
- fail the upload step if the privacy scan fails,
- avoid provider secrets in CI,
- avoid store mutation,
- avoid baseline inputs,
- keep strict CI flags disabled for the first artifact upload phase,
- use a short retention period.

The active artifact job generates reports from in-memory eval and risk sources.
It does not use explicit source report paths.

## Local Artifact Dry-Run

Phase 49I adds a local dry-run command for proving the artifact shape before CI
upload is enabled:

```bash
npm run quality:artifacts:dry-run
```

Use an explicit temporary output directory when needed:

```bash
npm run quality:artifacts:dry-run -- --out-dir=/tmp/orq-quality-artifacts-test
```

The output directory must be a direct `/tmp/orq-*` path. The dry-run creates
only these files:

- `quality-report.json`
- `quality-snapshot.json`
- `manifest.json`

The manifest records file names, SHA-256 hashes, byte sizes, JSON validation
status, and the privacy scan result. It does not record absolute output paths.

The dry-run is the generation and scan step used by CI before upload.

## Upload Status

Artifact upload is active.

The workflow uploads only the compact JSON produced by the artifact dry-run
after JSON validation and privacy scan pass.

Artifact name:

```text
quality-redacted-json
```

Retention:

```text
3 days
```

Uploaded contents:

- `quality-report.json`
- `quality-snapshot.json`
- `manifest.json`

Baselines and strict review or regression flags remain deferred.

## Active Workflow Shape

The active workflow uses the artifact dry-run as the scan gate before upload:

```yaml
- name: Generate redacted quality artifacts
  run: npm run quality:artifacts:dry-run -- --out-dir=/tmp/orq-quality-artifacts-ci

- name: Upload redacted quality artifacts
  uses: actions/upload-artifact@v4
  with:
    name: quality-redacted-json
    path: /tmp/orq-quality-artifacts-ci/*.json
    retention-days: 3
    if-no-files-found: error
```

The upload step runs only after the dry-run succeeds. If JSON validation or the
privacy scan fails, the dry-run exits nonzero and upload is skipped.

## Baseline Policy

Do not commit baselines yet.

Do not run CI baseline comparison yet.

Baseline snapshots may be considered later only after:

- CI stability criteria are satisfied,
- artifact redaction is proven,
- quality warning IDs are stable,
- a baseline update policy is approved.

## Advisory Boundaries

Artifacts are evidence for humans. They are not runtime approval.

Artifacts do not:

- dispatch actions,
- create proposals,
- approve or reject proposals,
- grant or consume second approval,
- change quality gate strictness,
- execute provider-backed work,
- mutate stores.

A clean artifact should never be treated as permission to execute risky
behavior.

For the consolidated pre-55B-F readiness checklist, see
[Final hardening readiness](final-hardening-readiness.md).
