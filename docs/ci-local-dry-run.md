# CI Local Dry Run

Phase: 46I
Status: local guidance only

## Purpose

This document explains how to simulate the future CI quality sequence locally.
It is the local companion to the active minimal CI workflow in
`.github/workflows/quality.yml`. It does not add package scripts, source
changes, or runtime enforcement.

The local dry run is a developer signal. It helps decide whether a phase is
healthy enough to review, but it is not permission to execute risky behavior.

## Local Dry-Run Sequence

Default local dry run:

```bash
node node_modules/typescript/bin/tsc --noEmit
npm run quality:gate
git diff --check
```

Interpretation:

- A TypeScript failure blocks the local dry run.
- A `quality:gate` `finalStatus` of `fail` blocks the local dry run.
- A `quality:gate` `finalStatus` of `warn` remains advisory by default.
- A `git diff --check` failure blocks the local dry run.

The quality gate already aggregates the offline eval suite, eval-derived risk
signal, quality report, and quality snapshot comparison.

## Strict Dry-Run Mode

For risky phases, use stricter quality gate flags:

```bash
npm run quality:gate -- --fail-on-review=true --fail-on-regression=true
```

Strict mode is optional. Use it when a phase touches safety, routing,
permissions, actions, computer-use behavior, quality infrastructure, or other
high-risk surfaces.

## Relationship To Future CI

The active minimal CI workflow runs:

```bash
npm ci
npm run check:node
npm run quality:gate
```

Locally, use the direct TypeScript fallback when WSL/Windows shims are unstable:

```bash
node node_modules/typescript/bin/tsc --noEmit
```

`npm ci` is part of CI dependency installation and is not normally needed for
day-to-day local dry runs once dependencies are installed.

## WSL/Windows Shim Fallback

In mixed WSL/Windows environments, `npm` or `tsx` may fail before project code
runs. That is an environment execution issue, not necessarily a code failure.

Stable TypeScript fallback:

```bash
node node_modules/typescript/bin/tsc --noEmit
```

For TypeScript CLI scripts in this environment, use the already proven compiled
fallback under `/tmp` when needed. Keep fallback files under `/tmp` only, and do
not commit generated fallback output.

## Artifact Policy

- Prefer stdout by default.
- Use `--out=<path>` only intentionally.
- Use `/tmp/orq-*` for local and smoke artifacts.
- Do not commit eval reports, risk signals, quality reports, snapshots, or gate
  outputs yet.
- Do not write to real `~/.orquestador-prime` during dry-run checks.
- Do not include raw secrets, task bodies, provider output, execution output,
  raw paths, request-body payloads, or raw-body payloads in artifacts.

## Advisory-Only Boundaries

The local CI dry run is a developer signal. It is not runtime approval
enforcement.

It does not:

- send or execute actions,
- change proposal approval state,
- change second-approval state,
- create proposals,
- call providers,
- mutate stores,
- add CI.

A passing dry run is not permission to bypass human review, permissions, or
approval gates.

## Recommended Usage By Phase Type

### Normal Implementation Phase

```bash
node node_modules/typescript/bin/tsc --noEmit
npm run quality:gate
git diff --check
```

### Risky Phase

```bash
node node_modules/typescript/bin/tsc --noEmit
npm run quality:gate -- --fail-on-review=true --fail-on-regression=true
git diff --check
```

### Docs-Only Phase

```bash
node node_modules/typescript/bin/tsc --noEmit
git diff --check
```

Run `npm run quality:gate` as an optional extra signal when docs touch quality,
safety, runtime, permission, or approval contracts.

### Pre-Push Check

```bash
node node_modules/typescript/bin/tsc --noEmit
npm run quality:gate
git diff --check
```

Keep any generated artifacts in `/tmp/orq-*`, and do not commit them.
