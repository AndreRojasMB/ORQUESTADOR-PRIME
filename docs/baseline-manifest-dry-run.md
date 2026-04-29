# Baseline Manifest Dry-Run

Phase 92I-BASELINE-MANIFEST-DRY-RUN-SPEC is source-only advisory metadata plus
documentation. It does not create committed baselines, generate artifacts,
mutate artifacts, change CI, enable strict quality gates, or publish release
evidence.

This document defines the future vocabulary for describing baseline candidates
before ORQUESTADOR-PRIME has approved committed baselines or blocking strict CI.

## Purpose

The baseline manifest dry-run lane exists to describe what a future baseline
candidate should contain without creating the candidate. It gives reviewers a
bounded, redacted model for baseline references, artifact references,
comparison summaries, privacy review, approval requirements, rollback
references, retention notes, and known exclusions.

The source module added in Phase 92I is advisory and deterministic. It does not
read files, inspect reports, invoke quality tooling, call CI, create artifacts,
or update repository state.

It does not generate artifacts, mutate artifacts, create baselines, or mutate
baselines.

## Source-Only Advisory Nature

The Phase 92I source files live under `src/quality/baselineManifest/` and are
self-contained:

- `types.ts`
- `baselineManifestTemplates.ts`
- `baselineManifestBuilder.ts`
- `baselineManifestValidator.ts`

They are static metadata, pure builders, and pure validators. They must not
import quality snapshot, local gate, artifact dry-run, eval, risk, runtime,
dashboard, action, job, automation, connector, store, memory, learning,
provider, network, filesystem, or command modules.

## Dry-Run-Only Nature

The dry-run-only posture is explicit: the metadata can describe a candidate,
but it cannot create, promote, compare, publish, or enforce one.

Every manifest model must carry:

- `advisoryOnly: true`
- `dryRunOnly: true`
- `sourceOnly: true`
- every safety boundary set to `true`

Dry-run metadata is not a baseline. It is not an artifact. It is not a CI gate.
It is a structured description of what a later approved baseline candidate may
need to prove.

## Baseline Manifest Model

A baseline manifest dry-run describes:

- schema and manifest identity,
- dry-run status,
- baseline candidate references,
- redacted artifact references,
- comparison summary metadata,
- privacy scan summary metadata,
- approval requirements,
- rollback references,
- retention notes,
- assumptions,
- known exclusions,
- safety boundaries.

Supported statuses are:

- `planned`
- `candidate_described`
- `blocked`
- `deferred`

The initial static template is `baseline_manifest_dry_run_candidate`.

## Baseline Candidate References

Baseline candidate references are metadata strings only. They may describe
future review objects such as:

- quality report baseline candidate,
- quality snapshot baseline candidate,
- eval/risk summary candidate,
- artifact manifest candidate,
- baseline metadata,
- schema/version metadata,
- commit/phase reference,
- known exclusions.

They must not be file paths that the source module reads. They must not embed
raw report content, full snapshots, logs, task text, provider output, local path
details, credentials, tokens, or artifact bodies.

## Redacted Artifact References

Artifact references are metadata strings for future redacted evidence. They may
refer to future compact summaries such as:

- redacted quality report summary,
- redacted quality snapshot summary,
- redacted artifact manifest summary,
- redacted privacy scan summary.

They do not generate artifacts. They do not upload artifacts. They do not read
artifact files. They only define the reference shape that a future approved
phase can use.

## Comparison Summary Model

Comparison summaries are bounded and redacted. They may include booleans and
counts such as:

- whether a baseline was loaded,
- advisory regression status,
- status-change marker,
- fingerprint-change marker,
- added failing ID count,
- added warning ID count,
- privacy status change,
- budget status change,
- risk decision change.

Phase 92I does not run comparisons and does not turn any comparison into a
blocking gate.

## Privacy Scan Summary Model

Privacy scan summaries are bounded and redacted metadata. They may carry a
status, short summary, and reason codes. Denied content includes raw task
bodies, raw prompts, raw provider output, raw logs, raw file content, full
artifacts, secrets, tokens, provider keys, credentials, absolute local paths,
and unredacted execution output.

Phase 92I does not run a privacy scanner. It only models the fields that a
future baseline candidate must provide before promotion.

## Approval Metadata Model

Baseline promotion requires future explicit human approval. The metadata model
records:

- approval requirement,
- reviewer role,
- reason requirement,
- explicit statement that a baseline update is not hiding unexplained
  regressions.

Approval metadata is not an approval execution path and cannot approve a
baseline by itself.

## Rollback Reference Model

Rollback references are metadata only. A future baseline process should define
how to revert or supersede an approved baseline candidate, but Phase 92I does
not implement rollback behavior.

## Retention Metadata Model

Retention notes describe the future retention policy class for redacted
evidence. They do not change retention, upload behavior, artifact generation, or
CI configuration.

## Known Exclusions

Baseline manifest dry-runs exclude:

- committed baseline creation,
- baseline mutation,
- artifact generation or mutation,
- quality/eval/risk execution,
- CI workflow changes,
- strict CI activation,
- `fail-on-review` or `fail-on-regression` activation,
- PR annotations,
- branch protection,
- badge generation,
- package/script changes,
- provider or network calls,
- filesystem writes,
- store/memory/learning mutation,
- action/proposal/approval execution,
- automation/runtime/dashboard/connector execution,
- production-ready claims,
- security/compliance guarantees.

## Validation Rules

The validator checks:

- required manifest fields,
- known manifest statuses,
- bounded arrays and text,
- unique candidate and artifact IDs,
- `advisoryOnly === true`,
- `dryRunOnly === true`,
- every boundary flag is true,
- artifact references are metadata strings only,
- baseline candidate references are metadata only,
- comparison summaries are bounded and redacted,
- privacy scan summaries are bounded and redacted,
- approval requirements are metadata only,
- rollback references are metadata only,
- retention notes are metadata only,
- no raw task bodies, raw provider output, raw logs, secrets, tokens, absolute
  paths, raw file contents, or full artifacts,
- no provider, network, filesystem write, action, store, runtime, or automation
  behavior,
- no production, security, compliance, or certification guarantees.

## Integration With Baseline / Strict CI Maturation

The manifest dry-run lane gives baseline/strict CI maturation a vocabulary for
candidate evidence before committed baselines exist. It does not create
baselines, alter baseline policy, enable strict flags, change workflows, or
write artifacts.

Future strict CI warning mode can use this vocabulary only after a separate
approved phase defines where evidence comes from and how it remains redacted.

## Integration With Quality Snapshots

Quality snapshots remain separate. Existing snapshot and gate tooling can write
local outputs when invoked through their existing commands, but Phase 92I does
not invoke or wrap them. Manifest references are strings only and do not load
snapshot files.

## Integration With Control Center Readonly Manifest

Baseline manifest dry-run metadata may later become a read-only source for the
control-center manifest policy. Any future dashboard visibility must use
redacted summaries and metadata strings, not direct raw store browsing, artifact
body reads, or dashboard write paths.

## Integration With Safe Self-Improvement

Safe self-improvement must not use baseline manifest metadata to approve
changes, update baselines, mutate artifacts, alter prompts, or bypass human
review. The manifest can become non-blocking evidence only after strict CI and
baseline governance mature.

## Integration With Productization / Release Readiness

Productization and release readiness may later reference baseline manifest
metadata as advisory evidence. It must not be treated as release proof, product
readiness, security readiness, compliance readiness, or permission to tag,
package, deploy, or publish.

## Safety Boundaries / Non-Goals

Phase 92I explicitly includes:

- no committed baselines,
- no baseline creation or mutation,
- no artifact generation or mutation,
- no quality/eval/risk execution,
- no quality snapshot invocation,
- no quality gate invocation,
- no artifact dry-run invocation,
- no CI/workflow changes,
- no strict CI activation,
- no fail-on-review or fail-on-regression activation,
- no PR annotations,
- no branch protection,
- no badge generation,
- no package/script changes,
- no provider calls,
- no network,
- no filesystem reads or writes from the new source module,
- no store/memory/learning mutation,
- no action/proposal/approval execution,
- no automation/runtime/dashboard/connector execution,
- no DB schemas,
- no SQL,
- no production-ready claims,
- no security/compliance guarantees.
