# CI Readiness

Phase: 46B-H
Status: first minimal workflow active

## Purpose

This document prepares ORQUESTADOR-PRIME for CI around the local quality stack.
The first minimal GitHub Actions workflow is active as of Phase 47B-H.

The goal is to keep CI narrow while preserving the current safety boundary:
quality checks are developer signals, not runtime approval enforcement.

## Current Local Quality Stack

Current local commands:

- Direct TypeScript check:

  ```bash
  node node_modules/typescript/bin/tsc --noEmit
  ```

- Package alias for the direct TypeScript check:

  ```bash
  npm run check:node
  ```

- Local quality gate:

  ```bash
  npm run quality:gate
  ```

- Offline eval report and eval gate:

  ```bash
  npm run evals:run
  npm run evals:gate
  ```

- Eval-derived risk signal:

  ```bash
  npm run risk:from-evals
  ```

- Quality report and snapshot:

  ```bash
  npm run quality:report
  npm run quality:snapshot
  ```

- Local quality artifact dry-run:

  ```bash
  npm run quality:artifacts:dry-run
  ```

See also:

- [Local quality workflow](local-quality-workflow.md)
- [Local quality gate](local-quality-gate.md)
- [CI local dry run](ci-local-dry-run.md)
- [CI first-run observability](ci-first-run-observability.md)
- [CI stability watch](ci-stability-watch.md)
- [CI artifacts redaction](ci-artifacts-redaction.md)
- [Quality snapshot baseline](quality-snapshot-baseline.md)
- [Quality baseline policy](baseline-policy.md)

## Active CI Scope

The active workflow is `.github/workflows/quality.yml`.

It runs on a Linux runner for pull requests to `dev`, pushes to `dev`, and
manual workflow dispatch. It installs dependencies, runs the direct TypeScript
check, runs the local quality gate, generates redacted quality artifacts, and
uploads the scanned JSON artifact:

```bash
npm ci
npm run check:node
npm run quality:gate
npm run quality:artifacts:dry-run -- --out-dir=/tmp/orq-quality-artifacts-ci
```

The workflow has read-only repository permissions, a 15-minute timeout,
concurrency cancellation per ref, no secrets, no provider environment variables,
and no committed baselines.

The workflow uses Node24-capable GitHub action versions:
`actions/checkout@v6` and `actions/setup-node@v6`. The project runtime remains
Node `22` through `setup-node`, and the quality commands are unchanged.

The active workflow uploads `quality-redacted-json` with 3-day retention after
the artifact dry-run validates JSON and passes the privacy scan.

Artifacts are advisory evidence only. Baselines and strict CI flags remain
deferred.

Quality baseline policy exists, but committed baselines and CI baseline
comparison remain deferred. CI `fail-on-regression` also remains deferred.

Dependency installation may use network access as CI infrastructure. Project
code should remain offline during the quality checks.

The first visible `quality` run on `dev` was observed passing after the isolated
HOME path fix in:

```text
c5ac7a6 fix(ci): use valid isolated home path in quality workflow
```

## CI Goals

CI should:

- run on a Linux runner,
- install dependencies with `npm ci`,
- typecheck with `npm run check:node`,
- run the local quality gate with `npm run quality:gate`,
- avoid provider calls,
- avoid network calls from project code,
- avoid store and runtime side effects,
- avoid approval, dispatch, and proposal behavior.

The CI runner may need network access to install dependencies from the npm
registry. Project code should not use network access during the quality checks.

## Active Command Sequence

Active CI commands:

```bash
npm ci
npm run check:node
npm run quality:gate
npm run quality:artifacts:dry-run -- --out-dir=/tmp/orq-quality-artifacts-ci
```

Optional stricter future mode:

```bash
npm run quality:gate -- --fail-on-review=true --fail-on-regression=true
```

The stricter mode should wait until the team decides which advisory signals
should fail CI.

## Why The Workflow Stays Minimal

The active workflow intentionally avoids baselines and strict advisory gates
because:

- baselines are not stable enough to commit,
- quality reports remain advisory,
- secrets and provider policy is not ready for CI,
- avoiding accidental CI overreach is intentional.

Future stricter modes remain later work.

The workflow should remain minimal until the
[CI stability watch](ci-stability-watch.md) criteria are met for the next
escalation. Artifact upload is limited by the
[CI artifacts redaction](ci-artifacts-redaction.md) policy.

## Active Workflow Shape

The active workflow follows this shape:

```yaml
name: quality

on:
  pull_request:
    branches:
      - dev
  push:
    branches:
      - dev
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: quality-${{ github.ref }}
  cancel-in-progress: true

jobs:
  quality:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    env:
      CI: true
      ORQUESTADOR_CI: true
      HOME: /tmp/orq-home
    steps:
      - name: Checkout
        uses: actions/checkout@v6

      - name: Setup Node
        uses: actions/setup-node@v6
        with:
          node-version: 22
          cache: npm

      - name: Prepare isolated HOME
        run: mkdir -p "$HOME"

      - name: Install dependencies
        run: npm ci

      - name: Typecheck
        run: npm run check:node

      - name: Local quality gate
        run: npm run quality:gate

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

## Artifact Policy

CI uploads the compact redacted JSON artifact `quality-redacted-json` with
3-day retention.

Artifacts must be redacted JSON only. They must not include:

- raw task bodies,
- secrets,
- provider output,
- execution output,
- raw paths,
- request-body or raw-body payloads.

Local smoke artifacts should continue to use `/tmp/orq-*`.

See [CI artifacts redaction](ci-artifacts-redaction.md) for artifact
eligibility, scan, retention, and forbidden-content policy.

## Baseline Policy

Do not commit baselines yet.

Baseline snapshots may be generated locally under `/tmp`, for example:

```bash
npm run quality:snapshot -- --out=/tmp/orq-quality-snapshot.json
```

Committed baselines should wait until quality signals stabilize and the team
decides how CI should compare them.

## Advisory-Only Boundaries

The quality gate is a developer signal. It is not runtime approval enforcement.

It does not:

- dispatch actions,
- approve or reject proposals,
- grant or consume second approvals,
- create proposals,
- call providers,
- mutate stores.

A passing CI or local quality signal would not be permission to execute risky
behavior.

## Relationship To Existing Local Workflow

Use [Local quality workflow](local-quality-workflow.md) for day-to-day commands.
Use [Local quality gate](local-quality-gate.md) for gate result shape and exit
policy. Use [CI local dry run](ci-local-dry-run.md) to simulate the future CI
sequence locally. Use [CI first-run observability](ci-first-run-observability.md)
to inspect the first active workflow run. Use
[CI stability watch](ci-stability-watch.md) before adding stricter CI behavior.
[CI artifacts redaction](ci-artifacts-redaction.md) defines the active minimal
redacted artifact upload policy. Use
[Quality snapshot baseline](quality-snapshot-baseline.md) for snapshot and
baseline comparison behavior.
