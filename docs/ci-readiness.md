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

See also:

- [Local quality workflow](local-quality-workflow.md)
- [Local quality gate](local-quality-gate.md)
- [CI local dry run](ci-local-dry-run.md)
- [CI first-run observability](ci-first-run-observability.md)
- [Quality snapshot baseline](quality-snapshot-baseline.md)

## Active CI Scope

The active workflow is `.github/workflows/quality.yml`.

It runs on a Linux runner for pull requests to `dev`, pushes to `dev`, and
manual workflow dispatch. It installs dependencies, runs the direct TypeScript
check, and runs the local quality gate:

```bash
npm ci
npm run check:node
npm run quality:gate
```

The workflow has read-only repository permissions, a 15-minute timeout,
concurrency cancellation per ref, no secrets, no provider environment variables,
no artifact upload, and no committed baselines.

Dependency installation may use network access as CI infrastructure. Project
code should remain offline during the quality checks.

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
```

Optional stricter future mode:

```bash
npm run quality:gate -- --fail-on-review=true --fail-on-regression=true
```

The stricter mode should wait until the team decides which advisory signals
should fail CI.

## Why The Workflow Stays Minimal

The active workflow intentionally avoids artifacts and strict advisory gates
because:

- artifact upload policy is not finalized,
- baselines are not stable enough to commit,
- quality reports remain advisory,
- secrets and provider policy is not ready for CI,
- avoiding accidental CI overreach is intentional.

Future stricter modes and artifacts remain later work.

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
      HOME: ${{ runner.temp }}/orq-home
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Typecheck
        run: npm run check:node

      - name: Local quality gate
        run: npm run quality:gate
```

## Artifact Policy

No CI artifacts are uploaded by default yet.

Future artifacts, if enabled, must be redacted JSON only. They must not include:

- raw task bodies,
- secrets,
- provider output,
- execution output,
- raw paths,
- request-body or raw-body payloads.

Local smoke artifacts should continue to use `/tmp/orq-*`.

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
[Quality snapshot baseline](quality-snapshot-baseline.md) for snapshot and
baseline comparison behavior.
