# Quality Snapshot Baseline

Phase: 44I
Status: local data foundation

This document defines the advisory quality snapshot and baseline comparison
workflow. It is local, offline, data-only, and designed for phase-to-phase
quality review without committing noisy baseline artifacts yet.

See [Quality baseline policy](baseline-policy.md) for the future rules around
creating, storing, reviewing, and updating baselines. Current comparisons remain
advisory, and committed baselines remain deferred. Local baseline candidates
must stay under `/tmp/orq-*` unless a future phase explicitly approves a curated
fixture. Baseline candidate dry-run guidance also lives in that policy.

## Purpose

Quality dashboard reports are useful but include generated timestamps and source
metadata. A quality snapshot extracts the stable summary fields into a compact
artifact that can be compared against a previous snapshot.

The workflow helps answer:

- did overall quality status change?
- did new failing or warning ids appear?
- did privacy, budget, or risk status worsen?
- does the stable quality fingerprint differ?
- which phase or commit produced the snapshot?

The result is advisory. It does not approve, reject, block, dispatch, create
proposals, mutate stores, call providers, use network access, start a server, or
build dashboard UI.

## Snapshot Schema Overview

Top-level snapshot fields:

- `snapshotId`
- `createdAt`
- `schemaVersion`
- `project`
- `phase`
- `commit`
- `sourceDashboardId`
- `sourceDashboardCreatedAt`
- `sourceDashboardSchemaVersion`
- `overallStatus`
- `evalSummary`
- `riskSummary`
- `privacyStatus`
- `budgetStatus`
- `failingIds`
- `warningIds`
- `fingerprint`
- `advisoryOnly`
- `boundaries`

The fingerprint is deterministic over stable summary fields:

- project id and project root hash,
- overall, privacy, and budget status,
- eval summary counts and ids,
- risk level, recommended decision, and reason codes,
- failing and warning ids,
- snapshot schema version.

The fingerprint excludes volatile values such as timestamps, snapshot ids,
comparison ids, source paths, and source artifact timestamps.

## Comparison Schema Overview

Top-level comparison fields:

- `comparisonId`
- `createdAt`
- `schemaVersion`
- `current`
- `baseline`
- `baselineLoaded`
- `baselineWarning`
- `statusChanged`
- `previousOverallStatus`
- `currentOverallStatus`
- `addedFailingIds`
- `removedFailingIds`
- `addedWarningIds`
- `removedWarningIds`
- `privacyStatusChanged`
- `budgetStatusChanged`
- `riskDecisionChanged`
- `riskLevelChanged`
- `fingerprintChanged`
- `schemaWarnings`
- `advisoryRegression`
- `advisoryOnly`
- `boundaries`

`advisoryRegression` is true when the current snapshot is worse than the
baseline by any of these signals:

- new failing ids,
- worsened overall status,
- worsened privacy status,
- worsened budget status,
- worsened risk decision,
- worsened risk level.

Schema mismatches are reported as warnings when enough fields can still be read.
Malformed or unreadable explicit inputs fail the CLI.

## CLI Usage

Generate a quality report in memory, then create a snapshot and comparison with
no baseline:

```bash
npm run quality:snapshot
```

Generate a snapshot from an explicit quality report:

```bash
npm run quality:snapshot -- --quality-report=/tmp/orq-quality-dashboard.json
```

Add phase and commit metadata:

```bash
npm run quality:snapshot -- \
  --quality-report=/tmp/orq-quality-dashboard.json \
  --phase=44I-QUALITY-SNAPSHOT-BASELINE \
  --commit=ef5f5f9
```

Write a snapshot/comparison artifact to an explicit path:

```bash
npm run quality:snapshot -- \
  --quality-report=/tmp/orq-quality-dashboard.json \
  --out=/tmp/orq-quality-snapshot.json
```

Compare against a previous snapshot baseline:

```bash
npm run quality:snapshot -- \
  --quality-report=/tmp/orq-quality-dashboard.json \
  --baseline=/tmp/orq-quality-snapshot-baseline.json
```

Pretty-print output:

```bash
npm run quality:snapshot -- --pretty
```

The CLI exits `0` for valid advisory comparisons, even when
`advisoryRegression` is true. It exits nonzero only for invalid arguments,
unreadable or malformed explicit inputs, or write errors.

## Local Workflow

Recommended local flow:

```bash
npm run quality:report -- --out=/tmp/orq-quality-dashboard.json
npm run quality:snapshot -- \
  --quality-report=/tmp/orq-quality-dashboard.json \
  --out=/tmp/orq-quality-snapshot.json
npm run quality:snapshot -- \
  --quality-report=/tmp/orq-quality-dashboard.json \
  --baseline=/tmp/orq-quality-snapshot.json
```

For now, keep baseline snapshots in explicit temporary paths such as `/tmp`.
Do not commit baselines until the report has stabilized across several phases.
Use `/tmp/orq-*` for local candidates, and treat every comparison as advisory
unless a later phase explicitly changes that policy. A self-comparison against a
fresh local candidate is expected to show no regression: `baselineLoaded` true,
`fingerprintChanged` false, `advisoryRegression` false, and no added or removed
failing or warning ids.

## Advisory Boundaries

Quality snapshots and comparisons do not:

- approve or reject proposals,
- grant or consume second approval,
- dispatch actions,
- create proposals,
- mutate stores,
- call providers,
- use network access,
- start a web server,
- add CI,
- build dashboard UI.

The snapshot is a review artifact, not a runtime gate.

## Privacy

Snapshots copy only summarized dashboard fields. They do not include raw eval
result arrays, raw task bodies, raw proposal parameters, execution output,
provider output, or source file paths in the fingerprint.

## WSL/Windows Shim Note

In mixed WSL/Windows environments, `npm` and `tsx` shims may fail before project
code runs. Use the direct typecheck fallback:

```bash
node node_modules/typescript/bin/tsc --noEmit
```

CLI verification in the affected environment may need the compiled `/tmp`
fallback used by the eval, risk, and quality report phases.

## Non-Goals

This phase does not add:

- committed baseline artifacts,
- CI workflows,
- dashboard UI,
- a web server,
- runtime approval gates,
- dispatch behavior,
- proposal creation,
- store mutation,
- provider calls,
- network calls.

## Baseline / Strict CI Maturation

Snapshot comparison may support future committed baselines and CI comparison
reports, as described in
[Baseline / Strict CI maturation](baseline-strict-ci-maturation.md). Phase 83I
does not create committed baselines or change snapshot comparison behavior.
