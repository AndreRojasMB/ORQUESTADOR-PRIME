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
smoke checks. CI baseline comparison is not active, `fail-on-regression` remains
deferred, and artifact upload remains deferred until stability criteria are met
or explicitly waived.

## Baseline Eligibility Criteria

Future baseline creation requires:

- CI stability criteria are met or explicitly waived.
- Artifact dry-run and redaction checks are proven.
- Warning ids and snapshot fingerprints are stable across several runs.
- `privacyStatus` is not `unsafe`.
- No active TypeScript, eval, or quality gate blocking failures exist.
- Accepted warnings are intentionally documented.
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
blocking. CI `fail-on-regression` remains deferred, and artifact upload plus
redaction should be proven before CI baselines are considered.

## Artifacts Vs Baselines

Artifacts are evidence for inspection. Baselines are comparison anchors.

They are not the same thing, and neither is runtime approval enforcement.
Artifacts may help humans inspect quality state, while baselines define an
intentional quality reference point for later comparisons.

## Safety Boundaries

Baselines do not:

- dispatch actions,
- approve or reject proposals,
- grant or consume second approval,
- call providers,
- mutate stores,
- change runtime gates.
