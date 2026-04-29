# Runtime Doctor Safe Expansion

Status: hybrid docs plus small read-only source expansion

Phase 91I expands the existing runtime doctor with advisory, presence-only
checks. It does not implement runtime behavior, acquire locks, invoke the
migration planner, repair stores, create backups, restore data, mutate stores,
write config, execute jobs, dispatch actions, run automation, call providers,
use the network, or make ORQUESTADOR-PRIME production-ready.

## Purpose

The runtime doctor is useful because it gives operators a bounded local health
summary before runtime features mature. Phase 91I improves that visibility by
checking whether key governance docs and advisory source lanes are present.

The expansion is intentionally small. It records readiness signals without
turning the doctor into a runtime monitor, migration planner wrapper, lock
manager wrapper, dashboard source, CI gate, or execution bridge.

## Existing Runtime / Config Doctor Baseline

The existing doctor lives in `src/health/configDoctor.ts` and is invoked by
`scripts/runtime-doctor.ts`.

It already:

- resolves the ORQUESTADOR data root,
- reads package and workflow metadata,
- checks known local store file names,
- stats and reads existing store JSON files,
- parses JSON for shape and version status,
- scans keys and values for suspicious privacy patterns,
- emits bounded reason codes, safe messages, counts, warnings, and errors,
- marks the result as `advisoryOnly: true`,
- emits read-only safety boundaries.

The doctor is privacy-aware, but it is not zero-read: it already reads and
parses local store files. Phase 91I does not expand raw store inspection.

## What The Doctor Already Reads

Existing reads include:

- `package.json`,
- `.github/workflows/quality.yml`,
- `node_modules/typescript/bin/tsc` presence,
- the configured ORQUESTADOR data root,
- known store files from `src/health/storeInventory.ts`.

Known stores include config, workspace, memory, permissions, actions,
approvals, jobs, notifications, trajectories, multi-agent traces, supervisor
goals, and screenshot traces.

The output must not include raw file contents, raw config values, secrets,
tokens, provider keys, hook tokens, raw task bodies, prompts, provider output,
tool output, or raw store content.

## Safe Checks Added In 91I

Phase 91I adds presence-only checks for:

- runtime readiness metadata source files,
- runtime readiness validator documentation,
- production runtime governance docs,
- control-center readonly manifest policy,
- dashboard safety audit documentation,
- CI artifact redaction policy,
- baseline policy docs,
- migration planner source presence, without invoking the planner,
- lock primitive source presence, without importing lock code or acquiring
  locks,
- the runtime doctor boundary status.

These checks use safe presence patterns and bounded output. They do not import
the referenced source files, read source contents, inspect dashboard code,
invoke migration planning, acquire locks, create files, or repair missing
items.

Missing optional docs or source files produce warning-style visibility. The
doctor does not create, repair, or mutate anything in response.

## Unsafe / Deferred Checks

The doctor must not expand into:

- lock acquisition or release,
- migration planner invocation,
- migration apply,
- repair plan generation,
- backup or restore execution,
- config writes,
- store mutation,
- raw store browsing beyond the existing doctor behavior,
- job enqueue or run checks,
- action/proposal approval or dispatch,
- automation validation or dry-run execution,
- dashboard route, component, or server action execution,
- connector, provider, or network checks,
- database connections, DB schemas, or SQL,
- auth or rate-limit enforcement.

Those remain future work and require separate approval.

## Redaction / Privacy Rules

Runtime doctor output must remain bounded and redacted:

- summarize before detail,
- emit reason codes and safe messages,
- emit booleans and counts where useful,
- avoid absolute paths,
- avoid raw file contents,
- avoid raw config values,
- avoid raw store content,
- avoid secrets, tokens, provider keys, OAuth material, and hook tokens,
- avoid raw task bodies, prompts, provider output, tool output, and proposal
  parameters.

Presence checks should report counts and safe labels only.

## Runtime Readiness Validator Integration

The Phase 90I runtime readiness validator is source-only advisory metadata.
The runtime doctor may surface presence-only evidence that the metadata lane
exists, but it must not import, execute, wrap, or validate the readiness module.

The two lanes remain separate:

- readiness metadata is static source governance,
- runtime doctor output is local advisory diagnostics.

## Readonly Manifest / Control Center Integration

Future control-center work may display redacted runtime doctor summaries
through a readonly manifest policy. Phase 91I does not generate a manifest,
modify the dashboard, read dashboard stores, or add dashboard routes.

Doctor output should be treated as one future read-only manifest candidate, not
as permission to browse raw stores or expose operator controls.

## Safety Boundaries / Non-Goals

Phase 91I explicitly preserves:

- no provider calls,
- no network,
- no filesystem writes,
- no new raw store reads beyond current doctor behavior,
- no store, memory, or learning mutation,
- no runtime execution,
- no server or API implementation,
- no worker, queue, or scheduler implementation,
- no DB adapter implementation,
- no migration apply,
- no migration planner invocation,
- no lock acquisition,
- no backup or restore execution,
- no repair execution,
- no auth or rate-limit implementation,
- no dashboard implementation,
- no automation execution,
- no connector implementation,
- no CI or workflow changes,
- no package or script changes,
- no baseline or artifact mutation,
- no action, proposal, or approval execution,
- no jobs execution,
- no production-ready claims,
- no security or compliance guarantees.

## Verification And Smoke Strategy

Future verification for this lane should include:

- `git status --short`,
- `node node_modules/typescript/bin/tsc --noEmit`,
- `git diff --check`,
- `git diff --cached --check`,
- targeted grep for forbidden imports and behavior,
- a runtime doctor smoke run with isolated `HOME`.

Smoke should confirm:

- `advisoryOnly: true`,
- read-only boundaries remain true,
- new checks appear as `pass`, `warn`, or `skipped`,
- no config writes,
- no store mutations,
- no lock acquisition,
- no migration apply,
- no backup, restore, or repair behavior,
- no provider or network calls,
- no action, job, or automation execution,
- output remains redacted and advisory.
