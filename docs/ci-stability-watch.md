# CI Stability Watch

Phase: 48I
Status: observation criteria

## Purpose

This guide defines the stability watch for the active minimal `quality`
workflow before ORQUESTADOR-PRIME adds stricter CI behavior, artifacts, or
baselines.

The watch period is intentionally conservative. One passing run proves the
workflow can execute, but it does not yet justify stricter flags, committed
baselines, artifact uploads, PR annotations, badges, or branch protection.

## Current Minimal Workflow

The active workflow is `.github/workflows/quality.yml`.

Workflow summary:

- Workflow name: `quality`
- Commands:
  - `npm ci`
  - `npm run check:node`
  - `npm run quality:gate`
- Artifacts: none
- Baselines: none
- Provider secrets: none
- Runtime approval enforcement: none
- Dispatch or proposal behavior: none

The first visible `quality` run on `dev` passed after the isolated HOME path
fix in:

```text
c5ac7a6 fix(ci): use valid isolated home path in quality workflow
```

## Stability Criteria Before Escalation

Before expanding CI, observe:

- at least 3 successful `dev` push runs,
- at least 1 successful pull request run when available,
- no flaky `npm ci` failures,
- no TypeScript failures from `npm run check:node`,
- no blocking failures from `npm run quality:gate`,
- quality warnings are stable and understood,
- no unexpected provider, project-code network, action, approval, or proposal
  behavior,
- no store mutation indicators,
- no workflow syntax or permission issues,
- run duration remains reasonably stable unless dependency changes explain it.

If any criterion fails, keep the workflow minimal and fix only the evidenced
problem in a targeted follow-up phase.

## Observation Checklist

For each observed CI run, record:

- status and conclusion,
- branch/ref and commit,
- duration,
- `npm ci` result,
- `npm run check:node` result,
- `npm run quality:gate` result,
- warnings vs. failures,
- whether artifacts were uploaded,
- whether secrets or provider environment variables appeared,
- whether unexpected outputs appeared.

If a run fails, capture only step names, exit codes, and short safe snippets.

## Failure Notes

Use the failing step to choose the next targeted phase:

- `npm ci` failure: inspect lockfile/install compatibility and registry/cache
  behavior before touching source code.
- Node/version failure: confirm whether Node `22` is the real issue before
  changing the workflow.
- TypeScript failure: reproduce with `node node_modules/typescript/bin/tsc --noEmit`.
- Quality gate failure: inspect `finalStatus` and `blockingReasons`; do not
  weaken the gate just to pass CI.
- Workflow syntax or permission issue: limit the fix to the workflow file.
- Unexpected safety behavior: stop and investigate before continuing roadmap
  work.

## Escalation Gates

Future phases may consider stricter CI only after the stability criteria pass.

Possible escalations:

- `--fail-on-review=true`
  - Consider after quality review states are low-noise and actionable.
- `--fail-on-regression=true`
  - Consider after baseline snapshots are stable and explicitly approved.
- Artifact upload
  - Consider only after redaction, retention, and access policy are approved.
  - Keep deferred until the CI artifacts redaction policy is accepted and a
    later phase implements upload safely.
- Committed baseline snapshots
  - Consider only after several stable runs and a baseline update policy.
- PR annotations
  - Consider only after warning IDs and report summaries are stable.
- Badges
  - Consider after the workflow has been reliable across several runs.
- Branch protection recommendations
  - Consider only after CI reliability and team policy are settled.

All of these remain deferred during the stability watch.

Artifact upload should wait until these stability criteria are satisfied and the
[CI artifacts redaction](ci-artifacts-redaction.md) policy has been accepted.

## Optional Inspection

If GitHub CLI is installed and authenticated, these read-only commands can help:

```bash
gh run list --workflow quality.yml --limit 5
gh run view <run-id>
```

Manual GitHub Actions inspection is also acceptable. Do not rely on GitHub CLI
being available in every local environment.

## Evidence Policy

Do not commit:

- long raw logs,
- secrets,
- provider output,
- generated reports,
- generated baselines,
- raw execution output.

Capture only:

- step names,
- exit codes,
- short safe snippets,
- run duration,
- commit/ref context.

## Boundaries

This watch period does not change workflow behavior.

It does not add:

- strict CI flags,
- artifacts,
- baselines,
- provider secrets,
- runtime approval enforcement,
- dispatch or proposal behavior,
- dashboard UI,
- web servers.
