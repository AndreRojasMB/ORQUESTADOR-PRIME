# Local Quality Gate

Phase: 45B-H
Status: local workflow helper

The local quality gate aggregates the offline quality signals that were added in
the Advanced JARVIS Core phases. It is a developer workflow command, not runtime
approval enforcement.

## Purpose

The gate answers one local question:

> Is the current repository state healthy enough to keep reviewing?

It combines:

- TypeScript compiler API check with no emit,
- offline eval suite,
- advisory risk signal from the eval report,
- quality dashboard report,
- quality snapshot and optional baseline comparison.

The gate is offline and local. It does not call providers, use network access,
mutate stores, create proposals, approve work, or dispatch actions.

## CLI Usage

Run the gate with default advisory policy:

```bash
npm run quality:gate
```

Pretty-print output:

```bash
npm run quality:gate -- --pretty
```

Write the JSON result to an explicit path:

```bash
npm run quality:gate -- --out=/tmp/orq-quality-gate.json
```

Add phase and commit metadata to the generated snapshot:

```bash
npm run quality:gate -- \
  --phase=45B-H-LOCAL-QUALITY-GATE \
  --commit=b746a9d
```

Compare with a quality snapshot baseline:

```bash
npm run quality:gate -- --baseline=/tmp/orq-quality-snapshot.json
```

Make review or blocked quality/risk states fail the command:

```bash
npm run quality:gate -- --fail-on-review=true
```

Make snapshot regression fail the command:

```bash
npm run quality:gate -- --fail-on-regression=true
```

## Default Exit Policy

The gate exits nonzero when:

- TypeScript check fails,
- offline evals fail,
- arguments or explicit input files are invalid,
- explicit output write fails.

By default, these remain advisory and exit `0`:

- risk review or approval recommendations,
- quality `review` or `blocked`,
- snapshot advisory regression,
- eval warnings.

Use `--fail-on-review=true` or `--fail-on-regression=true` for stricter local
checks.

## Result Shape

The JSON result includes:

- `gateId`
- `createdAt`
- `schemaVersion`
- `project`
- `commandResults`
- `typecheck`
- `evalGate`
- `riskSignal`
- `qualityReport`
- `qualitySnapshotComparison`
- `finalStatus`
- `blockingReasons`
- `advisoryWarnings`
- `outputs`
- `advisoryOnly`
- `boundaries`

`finalStatus` can be `pass`, `warn`, or `fail`.

## Baseline Workflow

The gate accepts a quality snapshot baseline produced by `quality:snapshot`.
Baselines are explicit files and are not created automatically.

Example:

```bash
npm run quality:snapshot -- --out=/tmp/orq-quality-snapshot.json
npm run quality:gate -- --baseline=/tmp/orq-quality-snapshot.json
```

Do not commit baseline artifacts yet. Keep them in explicit temporary paths
until the quality signal has stabilized.

## WSL/Windows Shim Note

In mixed WSL/Windows environments, `npm` and `tsx` shims may fail before project
code runs. The gate itself uses the TypeScript compiler API for its internal
typecheck, but launching the CLI through npm may still hit the environment shim
issue.

Stable direct typecheck fallback:

```bash
node node_modules/typescript/bin/tsc --noEmit
```

CLI verification in affected environments may need the compiled `/tmp` fallback
used by previous eval, risk, quality report, and snapshot phases.

## Advisory Boundaries

The gate does not:

- approve or reject proposals,
- grant or consume second approval,
- dispatch actions,
- create proposals,
- mutate stores,
- call providers,
- use network access,
- add CI,
- start a server,
- build dashboard UI.

It is a local review signal only.

## Non-Goals

This phase does not add:

- CI workflows,
- dashboard UI,
- a web server,
- runtime approval gates,
- dispatch behavior,
- proposal creation,
- store mutation,
- provider calls,
- network calls.
