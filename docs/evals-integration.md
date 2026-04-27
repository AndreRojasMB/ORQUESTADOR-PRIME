# Evals Integration

Phase: 42B-H
Status: local workflow foundation

This document defines how the offline eval harness should be used in the
development workflow. It does not add CI, hooks, dashboard UI, provider access,
runtime execution, or store mutation.

## Purpose

The eval integration layer turns the Phase 41B-H offline harness into a small
local quality signal.

It should help answer:

- did TypeScript still compile?
- did golden tasks, router checks, prompt-shape checks, budget checks, and
  compression-policy checks still run?
- did the eval report introduce new failures?
- is a risky change safe enough to continue reviewing?

The result is advisory. It is not an approval system.

## Local Quality Flow

Recommended local flow:

1. Run the TypeScript check.

   ```bash
   npm run check
   ```

2. If the known Windows/UNC npm shim issue appears, use the direct TypeScript
   fallback.

   ```bash
   node node_modules/typescript/bin/tsc --noEmit
   ```

3. Run the full offline eval report.

   ```bash
   npm run evals:run
   ```

4. Run the local gate.

   ```bash
   npm run evals:gate
   ```

5. Check diff whitespace.

   ```bash
   git diff --check
   ```

By default, `evals:gate` fails only when the report contains failures.
Warnings remain advisory.

To make warnings fail locally for a stricter release-style pass:

```bash
npm run evals:gate -- --fail-on-warn=true
```

## Baseline Workflow

Baselines are explicit files. They are not created automatically.

Generate a local baseline:

```bash
npm run evals:run -- --out=/tmp/orq-evals-baseline.json
```

Compare with a baseline in the report:

```bash
npm run evals:run -- --baseline=/tmp/orq-evals-baseline.json
```

Gate with a baseline:

```bash
npm run evals:gate -- --baseline=/tmp/orq-evals-baseline.json
```

Do not commit baselines yet. The eval suite is still early and intentionally
contains advisory warnings. A committed baseline should wait until the report
shape and warning policy have settled.

## CI-Ready Future Command

No GitHub Actions workflow is added in this phase.

A later CI phase can start from this command sequence:

```bash
npm run check
npm run evals:gate
git diff --check
```

That later phase should decide runner OS, Node version, dependency cache,
artifact upload policy, and whether warnings should fail.

## Dashboard Data Source Contract

The eval report already exposes a dashboard-friendly JSON summary:

- `summary`
- `qualityDashboard.latestStatus`
- `qualityDashboard.failingIds`
- `qualityDashboard.warningIds`
- `qualityDashboard.routerFailures`
- `qualityDashboard.promptShapeFailures`
- `qualityDashboard.budgetBlocks`
- `qualityDashboard.compressionWarnings`
- `changedResults`
- `privacy`

A future dashboard should read an explicit report artifact. It should not run
evals automatically in the UI.

## Approval And Risk Boundaries

Evals are advisory.

They do not:

- approve work,
- reject proposals,
- grant second approval,
- execute actions,
- change prompts,
- change routing,
- mutate stores.

Recommended risk interpretation:

- failures should pause risky work until reviewed,
- new baseline failures should trigger human review,
- unsafe privacy output should block integration until fixed,
- warnings alone should not block by default,
- a passing eval report is not permission to execute risky behavior.

## Safety And Non-Goals

This phase intentionally does not add:

- provider access,
- network access,
- runtime execution,
- store mutation,
- dashboard UI,
- git hooks,
- CI workflows,
- automatic prompt rewriting,
- self-modification.

Reports are printed to stdout by default. Report files are written only when an
explicit output path is supplied to `evals:run`.
