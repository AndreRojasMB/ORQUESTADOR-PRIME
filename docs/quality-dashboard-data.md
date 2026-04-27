# Quality Dashboard Data

Phase: 44B-H
Status: local data foundation

This document defines the offline quality dashboard data artifact. It is a JSON
report for future dashboard UI work. It does not add a dashboard UI, web server,
runtime gate, approval system, dispatch behavior, provider access, network
access, or store mutation.

## Purpose

The quality report combines two existing advisory artifacts:

- an eval report,
- a risk signal.

The combined JSON helps answer:

- did offline evals pass, warn, or fail?
- did the advisory risk signal recommend review or a fix?
- are privacy or budget warnings visible?
- what should a human inspect next?

The report is advisory. It is not an approval gate.

## Schema Overview

Top-level fields:

- `dashboardId`
- `createdAt`
- `schemaVersion`
- `project`
- `sources`
- `overallStatus`
- `evalSummary`
- `riskSummary`
- `failingIds`
- `warningIds`
- `trend`
- `privacyStatus`
- `budgetStatus`
- `recommendedNextActions`
- `advisoryOnly`
- `boundaries`

Status values:

- `overallStatus`: `pass`, `warn`, `review`, `blocked`
- `privacyStatus`: `clear`, `redacted`, `unsafe`
- `budgetStatus`: `ok`, `warn`, `block`

The report summarizes top-level eval and risk fields only. It does not include
raw task bodies, raw eval payloads, raw sensitive values, proposal parameters,
execution output, or provider output.

## CLI Usage

Generate eval and risk in memory, then print the quality report:

```bash
npm run quality:report
```

Use an explicit eval report:

```bash
npm run quality:report -- --eval-report=/tmp/orq-evals-report.json
```

Use explicit eval and risk signal artifacts:

```bash
npm run quality:report -- \
  --eval-report=/tmp/orq-evals-report.json \
  --risk-signal=/tmp/orq-risk-signal.json
```

Write only to an explicit output path:

```bash
npm run quality:report -- --out=/tmp/orq-quality-dashboard.json
```

Pretty-print:

```bash
npm run quality:report -- --pretty
```

When no eval report is supplied, the CLI runs the offline eval suite in memory.
When no risk signal is supplied, the CLI generates an advisory risk signal from
the eval report in memory.

## Advisory Boundaries

The quality report does not:

- approve or reject proposals,
- grant or consume second approval,
- dispatch actions,
- create proposals,
- mutate stores,
- call providers,
- use network access,
- start a server,
- build dashboard UI,
- install hooks,
- add CI.

`overallStatus` is a local quality summary. It is not permission to execute or a
runtime block.

## Relationship With Evals

The report reads or generates an eval report, then summarizes:

- eval status,
- pass/warn/fail counts,
- failing ids,
- warning ids,
- router failures,
- prompt-shape failures,
- budget blocks,
- compression warnings,
- changed result ids,
- privacy summary.

It does not recalculate eval results.

## Relationship With Risk

The report reads or generates a risk signal, then summarizes:

- risk level,
- recommended decision,
- human review flag,
- explicit approval flag,
- reason codes,
- warnings,
- sensitive data flags.

It does not recalculate risk logic.

## Recommended Next Actions

The report includes bounded static recommendations such as:

- review failing eval ids,
- inspect risk reason codes,
- address unsafe privacy output,
- review budget blocks.

These recommendations are text only and do not execute commands.

## WSL/Windows Shim Note

In mixed WSL/Windows environments, `npm` and `tsx` shims may fail before project
code runs. Use the direct typecheck fallback:

```bash
node node_modules/typescript/bin/tsc --noEmit
```

CLI verification in the affected environment may need the compiled `/tmp`
fallback used by previous eval and risk phases.

## Non-Goals

This phase does not add:

- dashboard UI,
- a web server,
- CI workflows,
- runtime approval gates,
- dispatch behavior,
- proposal creation,
- store mutation,
- provider calls,
- network calls.
