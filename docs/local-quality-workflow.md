# Local Quality Workflow

Phase: 45I
Status: developer onboarding guide

## Purpose

This is the operational guide for ORQUESTADOR-PRIME's local quality stack. It
explains which offline checks to run during roadmap phases, where temporary
artifacts should go, and how to interpret quality outputs without treating them
as runtime approval gates.

## Local Quality Stack Overview

- Direct TypeScript fallback: runs the compiler without relying on npm shims.
- `evals:run`: generates the offline eval report.
- `evals:gate`: summarizes eval pass/fail status for local checks.
- `risk:assess`: assesses explicit local risk metadata.
- `risk:from-evals`: turns an eval report into an advisory risk signal.
- `quality:report`: combines eval and risk into a dashboard-ready JSON report.
- `quality:snapshot`: creates a compact snapshot and optional baseline comparison.
- `quality:gate`: aggregates typecheck, evals, risk, quality report, and snapshot comparison.

All of these are local developer signals. They do not replace human review.

## Command Matrix

| Purpose | Command | Exit behavior | Writes files? | When to use |
|---|---|---|---|---|
| Stable typecheck | `node node_modules/typescript/bin/tsc --noEmit` | Nonzero on TypeScript errors | No | Every phase, especially mixed WSL/Windows shells |
| Package typecheck | `npm run check` | Nonzero on TypeScript errors; may hit npm shim issue | No | Healthy Node/npm environments |
| Package fallback alias | `npm run check:node` | Same as direct node fallback if npm works | No | Healthy npm with direct compiler path |
| Eval report | `npm run evals:run` | Nonzero only on CLI/input errors | Stdout by default; `--out` explicit | Inspect offline eval details |
| Eval gate | `npm run evals:gate` | Fails on eval failures; warnings advisory by default | No | Pre-commit or pre-push signal |
| Risk assessment | `npm run risk:assess` | Review/block recommendations may exit nonzero | Stdout by default; `--out` explicit | Explicit task/action metadata review |
| Risk from evals | `npm run risk:from-evals` | Review/block recommendations may exit nonzero | Stdout by default; `--out` explicit | Turn evals into risk signal |
| Quality report | `npm run quality:report` | Nonzero on invalid input/write errors | Stdout by default; `--out` explicit | Build dashboard-ready quality JSON |
| Quality snapshot | `npm run quality:snapshot` | Valid comparisons exit 0 even with advisory regression | Stdout by default; `--out` explicit | Compare quality across phases |
| Quality gate | `npm run quality:gate` | Fails on typecheck/eval failures by default; strict flags optional | Stdout by default; `--out` explicit | Normal local quality workflow |

Useful strict flags:

```bash
npm run evals:gate -- --fail-on-warn=true
npm run quality:gate -- --fail-on-review=true
npm run quality:gate -- --fail-on-regression=true
```

## WSL/Windows npm/tsx Shim Fallback

In mixed WSL/Windows environments, `npm` and `tsx` may fail before project code
runs. This is an environment execution issue, not necessarily a code failure.

Stable typecheck fallback:

```bash
node node_modules/typescript/bin/tsc --noEmit
```

For TypeScript CLI scripts in the affected environment, compile the needed
entrypoint to a temporary directory under `/tmp` and run the generated
JavaScript from there. Keep generated fallback files under `/tmp` only.

Do not commit fallback output.

## Artifact Policy

- Prefer stdout by default.
- Use `--out=<path>` only when an artifact is intentionally needed.
- Use `/tmp/orq-*` for smoke and local artifacts.
- Do not commit eval reports, risk signals, quality reports, snapshots, or gate outputs yet.
- Do not write to real `~/.orquestador-prime` during quality workflow checks.
- Do not include raw secrets, task bodies, proposal parameters, execution outputs, raw paths, `requestBody`, `rawBody`, or provider output in artifacts.

## Advisory-Only Boundaries

Quality outputs are local developer signals. They are not approval enforcement.

They do not:

- dispatch actions,
- approve or reject proposals,
- grant or consume second approval,
- call providers,
- use network access,
- mutate stores.

A passing quality signal is not permission to execute risky behavior.

## Recommended Workflows

### Normal Implementation Phase

```bash
node node_modules/typescript/bin/tsc --noEmit
npm run quality:gate
git diff --check
```

If npm or tsx is affected by the shim issue, use the compiled `/tmp` fallback
for `quality:gate`.

### Risky Phase

```bash
npm run quality:gate -- --fail-on-review=true
npm run quality:gate -- --baseline=/tmp/orq-quality-snapshot.json --fail-on-regression=true
```

Use strict flags when the phase touches safety, routing, permissions, actions,
computer-use behavior, or other high-risk surfaces.

### Docs-Only Phase

```bash
node node_modules/typescript/bin/tsc --noEmit
git diff --check
```

Run `npm run quality:gate` as an optional extra signal when documentation is
close to runtime behavior or quality contracts.

### Pre-Push Local Check

```bash
node node_modules/typescript/bin/tsc --noEmit
npm run quality:gate
git diff --check
```

Keep any generated artifacts in `/tmp/orq-*`.

### Baseline/Snapshot Comparison Workflow

```bash
npm run quality:report -- --out=/tmp/orq-quality-dashboard.json
npm run quality:snapshot -- --quality-report=/tmp/orq-quality-dashboard.json --out=/tmp/orq-quality-snapshot.json
npm run quality:gate -- --baseline=/tmp/orq-quality-snapshot.json
```

Do not commit the baseline snapshot yet. Keep it local until the quality signal
is stable enough for a future CI or release workflow.
