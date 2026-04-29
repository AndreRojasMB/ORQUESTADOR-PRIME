# Quality Baseline Policy

Phase: 51B-H
Status: policy only

## Purpose

This policy defines how future quality snapshot baselines may be created,
reviewed, stored, and updated. It exists to prevent noisy baseline drift and to
keep snapshot comparison useful before any baseline becomes part of CI.

## Current Status

Baselines are not committed yet.

For now, baselines remain local-only under `/tmp` for manual comparison and
smoke checks. CI baseline comparison is not active, and `fail-on-regression`
remains deferred.

Redacted artifact upload is active and verified. The first verified upload
produced only `quality-report.json`, `quality-snapshot.json`, and
`manifest.json`, with a passing manifest scan. This is useful evidence for
human inspection, but it does not yet justify committed baselines.

## Baseline Eligibility Criteria

Future baseline creation requires:

- CI stability criteria are met or explicitly waived.
- The artifact manifest scan is `pass`.
- `privacyStatus` is not `unsafe`.
- No TypeScript failure is active.
- No eval failure is active.
- No quality gate blocking failure is active.
- Warning ids and snapshot fingerprints are stable across several runs.
- Warning ids are understood and intentionally documented.
- Human approval is recorded before promoting a candidate.
- Local candidates remain under `/tmp/orq-*`.
- The snapshot contains only summarized safe fields.

Baseline candidates must not include raw task bodies, secrets, raw paths,
provider output, execution output, request body payloads, or raw body payloads.

## Storage Policy

Current stage:

- Use `/tmp/orq-*` paths only.
- Do not commit baselines.
- Do not commit generated quality reports, risk signals, gate outputs, or
  snapshots as baselines.

Future options:

- A committed curated baseline may live under an approved fixture path only
  after policy approval.
- CI artifact baselines may be considered later after upload and redaction
  policy are proven.
- External release baselines may be considered for release checkpoints after
  snapshot behavior is stable.

## Baseline Candidate Dry-Run

Baseline candidate dry-runs are local-only. Candidate files must stay under
`/tmp/orq-*`, must not be moved into the repository, and must not be committed.
CI baseline comparison remains inactive, `fail-on-regression` remains inactive,
and the process uses only the existing quality report and snapshot commands.

Example local flow:

```bash
npm run quality:report -- --out=/tmp/orq-53i-quality-dashboard.json

npm run quality:snapshot -- --quality-report=/tmp/orq-53i-quality-dashboard.json --out=/tmp/orq-53i-baseline-candidate.json

npm run quality:snapshot -- --quality-report=/tmp/orq-53i-quality-dashboard.json --baseline=/tmp/orq-53i-baseline-candidate.json
```

If the local npm or `tsx` shim fails before project code runs, use the compiled
`/tmp` fallback process documented in the local quality workflow guides. Do not
change the storage rule: candidate output stays outside the repository.

Candidate validation checklist:

- JSON parses successfully.
- A top-level snapshot exists.
- `snapshot.advisoryOnly` is `true`.
- `snapshot.fingerprint` is present.
- `snapshot.privacyStatus` is not `unsafe`.
- `snapshot.boundaries` indicates no provider calls and no store mutation.
- `comparison.advisoryOnly` is `true`.
- Self-comparison has `baselineLoaded` set to `true`.
- Self-comparison has `fingerprintChanged` set to `false`.
- Self-comparison has `advisoryRegression` set to `false`.
- Self-comparison has no added or removed failing ids.
- Self-comparison has no added or removed warning ids.
- Candidate output contains no raw secrets, raw task bodies, raw paths,
  provider output, execution output, request body payloads, or raw body payloads.

A local baseline candidate is not an approved committed baseline. Promotion
requires a future explicit phase, human approval, privacy evidence, and a
comparison summary.

## Update Policy

Future baseline updates must be:

- explicit,
- human-approved,
- never automatic,
- tied to intentional quality changes,
- accompanied by a comparison summary,
- accompanied by a privacy scan result,
- tied to phase and commit metadata,
- committed with a clear convention, for example:

  ```text
  chore(quality): update baseline for <phase>
  ```

A baseline update must never be used to hide unexplained regressions.

## CI Relationship

There is no CI baseline comparison yet.

Future baseline comparison in CI should start as advisory before becoming
blocking. CI `fail-on-regression` remains deferred. Artifact upload and
redaction are now proven for compact evidence, but CI baselines still require
separate candidate evidence, fingerprint stability, and human approval.

## Artifacts Vs Baselines

Artifacts are evidence for inspection. Baselines are comparison anchors.

They are not the same thing, and neither is runtime approval enforcement.
Artifacts may help humans inspect quality state, while baselines define an
intentional quality reference point for later comparisons.

Verified artifacts may inform a future baseline candidate, but they are not a
baseline by themselves.

## Safety Boundaries

Baselines do not:

- dispatch actions,
- approve or reject proposals,
- grant or consume second approval,
- call providers,
- mutate stores,
- change runtime gates.

For the consolidated pre-55B-F readiness checklist, see
[Final hardening readiness](final-hardening-readiness.md).

## Deeper Self-Improvement Relationship

The deeper safe self-improvement path is documented in
[Safe self-improvement deeper](safe-self-improvement-deeper.md). Baseline and
strict CI maturity must come before regression-enforced self-improvement.
Phase 82I does not create baselines, update baselines, mutate artifacts, enable
strict CI, or treat quality comparison as permission to modify the system.

## Baseline / Strict CI Maturation

The future governance path for committed baselines, update approval, rollback,
and staged strict CI is documented in
[Baseline / Strict CI maturation](baseline-strict-ci-maturation.md). Phase 83I
is docs-only and does not create committed baselines or change baseline update
policy.

## Baseline Manifest Dry-Run

[Baseline Manifest Dry-Run](baseline-manifest-dry-run.md) defines source-only
advisory metadata that future baseline candidates can use before promotion.
Phase 92I creates no committed baselines, writes no artifacts, and does not
change this baseline policy.
