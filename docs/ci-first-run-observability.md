# CI First-Run Observability

Phase: 47I
Status: first-run observation guide

## Purpose

This guide explains how to observe the first active minimal CI workflow after
Phase 47B-H. It is for inspection and triage only.

This phase does not change workflow behavior, make CI stricter, add artifacts,
commit baselines, or turn quality checks into runtime approval enforcement.

## Current Active Workflow

The active workflow is `.github/workflows/quality.yml`.

Workflow summary:

- Workflow name: `quality`
- Triggers:
  - push to `dev`
  - pull request to `dev`
  - manual workflow dispatch
- Runner: `ubuntu-latest`
- Node version: `22`
- Commands:
  - `npm ci`
  - `npm run check:node`
  - `npm run quality:gate`
- Permissions:
  - `contents: read`
- Artifacts: none
- Baselines: none
- Secrets: none
- Deployments: none

Dependency installation may use network access as CI infrastructure. Project
code should remain offline during the quality checks.

## First-Run Checklist

Use this checklist for the first active run:

- Confirm the `quality` workflow appears in GitHub Actions.
- Confirm it triggered on the push to `dev`.
- Inspect the `npm ci` step.
- Inspect the `npm run check:node` step.
- Inspect the `npm run quality:gate` step.
- Confirm no artifacts were uploaded.
- Confirm no secrets or provider environment variables were used.
- If the run failed, capture only bounded safe error snippets.

Record the outcome as a short observation, not a raw log dump.

## First-Run Closeout

The first minimal `quality` workflow run on `dev` was observed passing after the
isolated HOME path fix in:

```text
c5ac7a6 fix(ci): use valid isolated home path in quality workflow
```

The passing workflow remains minimal:

- `npm ci`
- `npm run check:node`
- `npm run quality:gate`

The workflow still has no artifacts, no committed baselines, no provider
secrets, no runtime approval enforcement, and no dispatch or proposal behavior.
Future strict review/regression flags remain deferred.

## Failure Triage

### Dependency Install Failure

Likely surface:

- `npm ci` fails.

Next safe actions:

- Check whether `package-lock.json` is compatible with `package.json`.
- Check whether the failure is npm registry, cache, or lockfile related.
- Do not change source logic first.
- Plan a targeted dependency or workflow fix only after the failure is clear.

### Node Version Issue

Likely surface:

- Setup Node succeeds, but install or scripts fail due runtime compatibility.

Next safe actions:

- Verify whether Node `22` is the actual incompatibility.
- Reproduce locally if practical with a matching Node version.
- Adjust the workflow only in a later targeted phase if evidence supports it.

### TypeScript Failure

Likely surface:

- `npm run check:node` fails.

Next safe action:

```bash
node node_modules/typescript/bin/tsc --noEmit
```

Treat TypeScript diagnostics as code evidence. Fix code in a targeted phase;
do not loosen CI first.

### Quality Gate Failure

Likely surface:

- `npm run quality:gate` exits nonzero.

Next safe actions:

- Inspect `finalStatus`.
- Inspect `blockingReasons`.
- Confirm whether the failure is typecheck, eval failure, invalid input, or a
  write/read error.
- Reproduce locally with `npm run quality:gate` when npm/tsx works.
- If the local WSL/Windows shim appears, use the compiled `/tmp` fallback.

Warnings alone should remain advisory by default.

### TSX Or Linux Runner Issue

Likely surface:

- `npm run quality:gate` cannot launch `tsx` or resolve modules on the Linux
  runner.

Next safe actions:

- Distinguish this from the local WSL/Windows shim issue.
- Inspect the package install result.
- Inspect the step log around the launch failure only.
- Plan a targeted CLI execution fix only with evidence.

### Unexpected Provider, Network, Or Action Behavior

Likely surface:

- Logs suggest provider access, project-code network access, runtime action
  behavior, proposal state changes, or approval state changes.

Next safe actions:

- Stop.
- Do not make CI stricter.
- Investigate the quality gate path and recent changes.
- Treat this as a safety issue before continuing roadmap work.

### Workflow Syntax Or Permissions Issue

Likely surface:

- Workflow does not start, or fails before project commands run.

Next safe actions:

- Inspect workflow syntax and permissions.
- Keep any fix limited to the workflow file.
- Make the workflow fix in a separate targeted phase after evidence is clear.

## Evidence Capture Policy

Safe evidence to capture:

- step names,
- exit codes,
- short bounded error snippets,
- whether the failure happened before or during project commands,
- whether artifacts, secrets, baselines, or provider variables appeared.

Do not commit:

- long raw logs,
- secrets,
- provider outputs,
- generated quality reports,
- generated snapshots,
- execution output,
- raw paths or payloads.

Generated reports should stay out of the repo unless a future artifact policy
explicitly allows them.

## Optional GitHub CLI Read-Only Inspection

If GitHub CLI is installed and authenticated, these read-only commands can help:

```bash
gh run list --workflow quality.yml
gh run view <run-id>
gh run view <run-id> --log
```

These commands are optional. Do not rely on them being available in every local
environment, and do not paste long logs into repo docs.

## Boundaries

This guide is observability only.

This phase does not add:

- workflow behavior changes,
- CI strict mode changes,
- artifacts,
- baselines,
- provider secrets,
- runtime approval enforcement,
- dashboard UI,
- web servers.

The first-run outcome should guide the next targeted phase. It should not cause
reactive broad changes without evidence.
