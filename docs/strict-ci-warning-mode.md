# Strict CI Warning Mode

Phase 93I-STRICT-CI-WARNING-MODE is docs-only and spec-only. It does not modify
CI workflows, enable strict flags, enable `--fail-on-review`, enable
`--fail-on-regression`, create committed baselines, generate or mutate
artifacts, execute quality/eval/risk commands, implement PR annotations,
implement branch protection, or generate badges.

It does not make ORQUESTADOR-PRIME production-ready. This document defines a
future report-only warning mode before blocking strict CI.

Phase 93I does not modify CI workflows. It does not enable strict flags.
It does not create committed baselines. It does not generate or mutate artifacts.
It does not execute quality/eval/risk commands.

## A. Purpose

Strict CI warning mode exists so ORQUESTADOR-PRIME can surface stricter quality,
baseline, regression, privacy, artifact, release, and self-improvement signals
before those signals are allowed to fail CI.

The goal is to give reviewers earlier visibility into future blocking criteria
without changing workflow behavior, package scripts, quality gate behavior,
baseline storage, artifact generation, or branch policy.

This is governance/spec only. It is a future rollout plan, not a CI change.

## B. Current CI And Quality Baseline

The active `.github/workflows/quality.yml` workflow runs:

- `npm ci`,
- `npm run check:node`,
- `npm run quality:gate`,
- `npm run quality:artifacts:dry-run -- --out-dir=/tmp/orq-quality-artifacts-ci`,
- redacted artifact upload.

Current state:

- CI does not pass `--fail-on-review=true`.
- CI does not pass `--fail-on-regression=true`.
- `quality:gate` supports strict flags locally.
- `quality:snapshot` can compare against a supplied baseline and can write
  output.
- `quality:artifacts:dry-run` writes redacted files under explicit
  `/tmp/orq-*` paths.
- Phase 92I added advisory baseline manifest metadata only.
- No committed baseline anchor exists.

Phase 93I changes none of this behavior.

## C. Readiness Gaps Before Warning Mode

Current gaps before warning-mode CI can be implemented:

- no committed baseline anchor,
- no CI baseline comparison,
- no nonblocking strict CI report contract,
- no PR annotation strategy implemented,
- no branch protection,
- no badge readiness,
- no stable warning report artifact contract,
- no approved warning-to-blocking promotion policy.

These gaps should be resolved gradually and reviewed before any blocking
behavior is introduced.

## D. Warning-Mode Strict CI Concept

Warning mode means stricter signals are surfaced as advisory and report-only
evidence.

Warning mode must:

- not fail CI,
- not mutate artifacts,
- not create baselines,
- not alter `quality:gate` behavior,
- precede blocking mode.

Future warning-mode output should help reviewers see what would matter later
without changing whether CI passes.

## E. Advisory-Vs-Blocking Boundary

Advisory warnings can inform reviewers, release planning, and future baseline
governance. They are review evidence only.

Blocking failures require:

- approved committed baselines,
- explicit governance,
- rollback strategy,
- stable warning output,
- low false-positive rates,
- human approval.

There is no blocking behavior in Phase 93I.

## F. Baseline Manifest Dry-Run Relationship

Future warning mode may consume the vocabulary from
[Baseline Manifest Dry-Run](baseline-manifest-dry-run.md).

Baseline manifest metadata remains advisory and dry-run-only. It can describe
candidate readiness, redacted artifact references, comparison metadata, privacy
status, approval requirements, rollback references, and retention notes.

Phase 93I creates no baselines, reads no baseline files, and performs no
baseline comparisons.

## G. Quality / Eval / Risk Signal Relationship

Future warning mode may summarize existing quality, eval, and risk reason codes
from approved redacted outputs or future warning report contracts.

Phase 93I executes no quality, eval, or risk commands. It adds no new quality
gate behavior and does not change how `quality:gate`, `quality:snapshot`, or
artifact dry-run commands behave.

## H. Redacted Artifact Relationship

Future warning-mode evidence must remain compact, bounded, and redacted.

Warning-mode evidence must not include:

- raw task bodies,
- raw provider output,
- raw logs,
- secrets,
- full artifacts,
- raw file content,
- credentials,
- tokens,
- absolute local paths.

Phase 93I performs no artifact generation and no artifact mutation.

## I. Warning-Mode Coverage Plan

| Area | Signal source | Warning output | Denied behavior | Blocking status | Future blocking preconditions |
|---|---|---|---|---|---|
| Quality gate review findings | Future report from existing quality gate result | Review or blocked reason-code summary | Enabling `--fail-on-review` | Nonblocking | Stable reason codes, human approval, rollback path |
| Regression-like signals | Future snapshot comparison summary | Advisory regression summary | Enabling `--fail-on-regression` | Nonblocking | Approved baseline, warning trial, stable fingerprints |
| Baseline manifest readiness | Baseline manifest dry-run metadata | Candidate completeness and missing approval summary | Creating or reading committed baselines | Nonblocking | Approved baseline location and promotion policy |
| Snapshot drift | Quality snapshot metadata | Fingerprint, status, warning ID, or failing ID drift summary | Failing CI on drift | Nonblocking | Repeated stable warning-mode results |
| Eval/risk warnings | Eval and risk reason-code summaries | Warning IDs, risk decision, human-review flags | New eval/risk execution behavior | Nonblocking | Stable signal taxonomy and redacted outputs |
| Redaction/privacy warnings | Artifact manifest or future warning report | Privacy status and reason-code summary | Uploading unsafe or raw content | Nonblocking except existing artifact scan behavior | Proven redaction stability |
| Artifact availability warnings | Redacted CI artifact metadata | Missing, stale, or incomplete artifact note | Mutating or regenerating artifacts | Nonblocking | Approved artifact contract and retention policy |
| Release readiness warnings | Release readiness and productization docs | Release gate maturity warning | Tagging, packaging, publishing, or release gating | Nonblocking | Productization gates and strict CI maturity |
| Self-improvement readiness warnings | Safe self-improvement docs and maturity metadata | Baseline/strict CI prerequisite warning | Self-PR creation or autonomous edits | Nonblocking | Human-approved proposal flow and baseline governance |

## J. Rollout Stages

Recommended rollout:

1. Current advisory quality gate.
2. Warning-mode spec.
3. Warning report contract.
4. Warning report local dry-run.
5. CI warning-mode report-only.
6. PR annotations, nonblocking.
7. Committed baseline governance.
8. Strict CI blocking trial.
9. Fail-on-regression.
10. Branch protection.
11. Badges.

Stages after 2 are future-only unless a later phase explicitly approves them.

## K. Future PR Annotation Strategy

PR annotations are future-only.

Future annotations should be derived from redacted artifacts or warning report
summaries. They should start nonblocking and should avoid raw logs, secrets,
raw task text, raw provider output, full file content, or private local paths.

Phase 93I implements no PR annotations.

## L. Future Branch Protection Strategy

Branch protection is future-only.

It requires stable warning mode, committed baselines, low false-positive rates,
human approval, and a rollback path.

Phase 93I implements no branch protection.

## M. Future Badge Strategy

Badges are future-only.

Badge status should derive from approved CI state later and must not imply
production readiness, security readiness, compliance, or certification.

Phase 93I generates no badges.

## N. Governance And Approval Model

Human approval is required before:

- strict flags are enabled,
- committed baselines are created,
- warning reports become CI defaults,
- PR annotations are implemented,
- branch protection is implemented,
- badges are generated.

Baseline changes must not hide regressions. Any future promotion from warning
mode to blocking mode should include reason, evidence, rollback, and reviewer
approval.

## O. Rollback Strategy

If future warning-mode wiring becomes noisy, roll back the warning-mode wiring
or report contract first.

If future strict behavior becomes noisy, disable strict flags before changing
quality logic.

If a future baseline update is wrong, revert the baseline change or restore the
previous approved baseline.

Phase 93I executes no rollback behavior.

## P. Integration Plan

Strict CI warning mode should later support:

- baseline/strict CI maturation,
- baseline manifest dry-run,
- quality snapshots,
- quality/evals/risk,
- control-center readonly manifest,
- safe self-improvement,
- productization/release readiness,
- future PR annotations,
- future branch protection,
- future badges.

Integration should remain report-only until a later phase explicitly approves
runtime, workflow, baseline, artifact, package, or branch-policy changes.

## Q. Safety Boundaries / Non-Goals

Phase 93I explicitly includes:

- no provider calls,
- no network,
- no filesystem mutation,
- no workflow/CI changes,
- no package/script changes,
- no strict CI activation,
- no fail-on-review or fail-on-regression activation,
- no committed baselines,
- no baseline/artifact mutation,
- no quality/eval/risk execution,
- no PR annotation implementation,
- no branch protection implementation,
- no badge generation,
- no store/memory/learning mutation,
- no action/proposal/approval execution,
- no automation/runtime/dashboard/connector execution,
- no DB schemas/SQL,
- no production-ready claims,
- no security/compliance guarantees.

## R. Future Validation Strategy

Future warning-mode validation should require:

- warning-mode entries are advisory only,
- warning-mode outputs do not fail CI,
- warning-mode outputs do not mutate artifacts,
- baseline references are metadata only,
- comparisons are report-only until approved,
- strict flags remain disabled in CI until a later phase,
- PR annotations, branch protection, and badges are future-only,
- no raw task, provider, log, or secret exposure,
- no provider, network, filesystem write, action, store, runtime, or automation
  behavior,
- no production, security, compliance, or certification guarantees.
