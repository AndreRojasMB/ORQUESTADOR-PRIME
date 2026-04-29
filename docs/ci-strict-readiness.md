# CI Strict Readiness

Phase: 54B-H
Status: readiness criteria only

## Purpose

This guide defines when ORQUESTADOR-PRIME may later move from advisory CI to
stricter CI behavior. It does not enable stricter CI.

Strict CI means making selected advisory quality states fail the CI workflow. It
is still developer feedback, not runtime approval enforcement.

## Current Status

CI is active and uploads redacted quality artifacts. The active workflow remains
advisory/default:

- `fail-on-review` is not active in CI.
- `fail-on-regression` is not active in CI.
- Baselines remain deferred.
- CI baseline comparison is not active.
- Strict CI is not runtime approval enforcement.

The current workflow continues to run the default quality gate without strict
review or regression flags.

## Available Local Strict Checks

Strict checks may be run manually and locally:

```bash
npm run quality:gate -- --fail-on-review=true
```

```bash
npm run quality:gate -- --fail-on-regression=true
```

```bash
npm run quality:gate -- --fail-on-review=true --fail-on-regression=true
```

In mixed WSL/Windows environments, the local npm or `tsx` shim may fail before
project code runs. Use the compiled `/tmp` fallback process documented in the
local quality guides when that environment issue appears.

Local strict checks are developer signals. They do not approve work, reject
work, dispatch actions, or change runtime behavior.

## Readiness Criteria For Fail-On-Review

Before CI enables `fail-on-review`, all of these should be true:

- Review and blocked states are classified and stable.
- Warning and review ids are understood.
- `privacyStatus` is not `unsafe`.
- Several CI runs are stable after artifact upload.
- A human explicitly approves the strictness change.
- A rollback path is documented.

Review strictness should not be enabled while the team is still learning whether
review states are noisy, transient, or unactionable.

## Readiness Criteria For Fail-On-Regression

Before CI enables `fail-on-regression`, all of these should be true:

- Baseline policy is approved for the intended use.
- A baseline candidate is approved.
- Snapshot fingerprints are stable across repeated runs.
- Privacy and manifest scan evidence is available.
- Advisory baseline comparison has been proven before blocking mode.
- A human explicitly approves the strictness change.
- A rollback path is documented.

Regression strictness should not be enabled without an approved baseline anchor.

## Future Strict CI Options

Future phases may consider:

- enabling `fail-on-review` in push and pull request CI,
- enabling `fail-on-regression` after baseline approval,
- adding a manual `workflow_dispatch` strict mode,
- using a staged rollout where manual strict mode comes before default strict
  push or pull request behavior.

These options are not implemented in this phase.

## Rollback Guidance

If strict CI is enabled later and proves too noisy, rollback should remove only
the strict arguments from the workflow.

Do not weaken quality gate logic just to make CI pass. Do not update baselines
to hide unexplained regressions.

## Boundaries

Strict CI is developer feedback.

Strict CI is not:

- action dispatch,
- proposal approval or rejection,
- second approval,
- runtime gate wiring,
- provider calls,
- store mutation.

## Deeper Self-Improvement Relationship

The deeper safe self-improvement path is documented in
[Safe self-improvement deeper](safe-self-improvement-deeper.md). Strict CI
readiness is a prerequisite for safer automated comparison, but it is not
permission for autonomous modification. Phase 82I does not change CI, run
strict checks, update workflows, or enable prompt/router/agent/source changes.

## Baseline / Strict CI Maturation

The staged governance path for strict CI is documented in
[Baseline / Strict CI maturation](baseline-strict-ci-maturation.md). Phase 83I
does not enable strict CI, modify workflows, or turn local strict flags into CI
defaults.
