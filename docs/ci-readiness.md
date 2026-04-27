# CI Readiness

Phase: 46B-H
Status: planning guidance only

## Purpose

This document prepares ORQUESTADOR-PRIME for a future CI workflow around the
local quality stack. CI is not active yet. No GitHub Actions workflow is added
in this phase.

The goal is to make the future CI shape clear while preserving the current
safety boundary: quality checks are local developer signals, not runtime
approval enforcement.

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
- [Quality snapshot baseline](quality-snapshot-baseline.md)

## Future CI Goals

A future CI workflow should:

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

## Recommended Future Command Sequence

Recommended future CI commands:

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

## Why No GitHub Actions Workflow Is Added Yet

No `.github/workflows` file is added in this phase because:

- dependency and network policy is not finalized,
- artifact upload policy is not finalized,
- baselines are not stable enough to commit,
- quality reports remain advisory,
- secrets and provider policy is not ready for CI,
- avoiding accidental CI overreach is intentional.

This phase documents the target shape only.

## Future Non-Active Workflow Sketch

This sketch is documentation only. It is not active and should not be copied into
`.github/workflows` until CI policy is approved.

```yaml
name: quality

on:
  pull_request:
  push:
    branches:
      - dev

jobs:
  quality:
    runs-on: ubuntu-latest
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

No CI artifacts should be uploaded by default yet.

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
policy. Use [Quality snapshot baseline](quality-snapshot-baseline.md) for
snapshot and baseline comparison behavior.
