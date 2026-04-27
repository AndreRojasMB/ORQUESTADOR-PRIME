# CI Artifacts Redaction

Phase: 49B-H
Status: policy only

## Purpose

This document defines the policy for future CI quality artifacts and redaction.
Artifact upload is not active in this phase.

The goal is to make sure any future downloadable CI evidence is compact,
redacted, temporary, and useful for human review without turning quality output
into runtime approval enforcement.

## Current State

The active `quality` workflow currently runs:

```bash
npm ci
npm run check:node
npm run quality:gate
```

Current CI boundaries:

- quality CI is active,
- artifact upload is not active,
- baselines are not active,
- strict review and regression flags are not active,
- provider secrets are not configured,
- runtime approval enforcement is not active,
- dispatch or proposal behavior is not active.

## Artifact Eligibility

Future eligible artifacts should be compact redacted JSON only.

The first artifact upload phase, if approved later, should prefer:

- `quality-report.json`
- `quality-snapshot.json`

Do not upload full eval, risk, or gate dumps initially. Those outputs are useful
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

## Required Future Safeguards Before Upload

Before CI uploads any quality artifact, the implementation must:

- generate artifacts under an isolated CI temporary directory,
- use explicit `--out=<path>` paths only,
- validate generated files as JSON,
- run a privacy and sentinel scan before upload,
- fail the upload step if the privacy scan fails,
- avoid provider secrets in CI,
- avoid store mutation,
- avoid baseline inputs,
- keep strict CI flags disabled for the first artifact upload phase,
- use a short retention period, recommended between 3 and 7 days.

The future artifact job should generate reports from in-memory eval and risk
sources where possible. Avoid explicit source report paths unless the artifact
schema first removes or redacts those paths.

## Future Workflow Shape

The following sketch is non-active. It documents the intended shape only and is
not implemented in the active workflow yet.

```yaml
- name: Prepare quality artifact directory
  run: mkdir -p /tmp/orq-quality-artifacts

- name: Generate quality report artifact
  run: npm run quality:report -- --out=/tmp/orq-quality-artifacts/quality-report.json

- name: Generate quality snapshot artifact
  run: npm run quality:snapshot -- --quality-report=/tmp/orq-quality-artifacts/quality-report.json --out=/tmp/orq-quality-artifacts/quality-snapshot.json

- name: Privacy scan quality artifacts
  run: <approved privacy scan command for /tmp/orq-quality-artifacts>

- name: Upload redacted quality artifacts
  uses: actions/upload-artifact@v4
  with:
    name: quality-redacted-json
    path: /tmp/orq-quality-artifacts/*.json
    retention-days: 3
```

A future phase may choose a different scan command, but it must keep the same
policy: scan before upload, upload only compact redacted JSON, and stop upload
on privacy failure.

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
