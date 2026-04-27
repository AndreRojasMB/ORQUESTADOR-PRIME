# Final Hardening Readiness

Phase: 54I
Status: final readiness guide

## Purpose

This is the consolidated final hardening and readiness guide before 55B-F. It
summarizes the current quality, CI, artifact, baseline, and strictness posture
so release-readiness work can start from one current operational reference.

## Current Quality Posture

Current local and CI quality signals:

- Offline evals exist and can be run with `evals:run` and `evals:gate`.
- Advisory risk signals exist through `risk:assess` and `risk:from-evals`.
- Quality report generation exists through `quality:report`.
- Quality snapshot and advisory comparison exist through `quality:snapshot`.
- Local artifact dry-run exists through `quality:artifacts:dry-run`.
- CI artifact upload is active for scanned redacted JSON.
- Baselines remain deferred.
- Strict CI remains deferred.

These signals are developer review evidence. They are not runtime approval
enforcement.

## Active CI Command Sequence

The active `quality` workflow runs:

```bash
npm ci
npm run check:node
npm run quality:gate
npm run quality:artifacts:dry-run -- --out-dir=/tmp/orq-quality-artifacts-ci
```

After the dry-run passes JSON validation and the privacy scan, CI uploads the
redacted quality artifact.

Artifact contents:

- `quality-report.json`
- `quality-snapshot.json`
- `manifest.json`

Artifact retention is 3 days.

Artifacts are advisory evidence. They are not baselines, and they are not
runtime approval.

## Canonical Docs Map

Use these as the current operational docs:

- [Local quality workflow](local-quality-workflow.md)
- [Local quality gate](local-quality-gate.md)
- [CI readiness](ci-readiness.md)
- [CI artifacts redaction](ci-artifacts-redaction.md)
- [Quality baseline policy](baseline-policy.md)
- [Quality snapshot baseline](quality-snapshot-baseline.md)
- [CI strict readiness](ci-strict-readiness.md)
- [CI stability watch](ci-stability-watch.md)
- [Final hardening readiness](final-hardening-readiness.md)

Older phase-specific docs may contain useful historical context. This guide and
the docs above are the current operational map.

## Release-Readiness Command Checklist

Recommended local checks before 55B-F or release-readiness:

```bash
node node_modules/typescript/bin/tsc --noEmit
```

```bash
npm run quality:gate
```

```bash
npm run quality:artifacts:dry-run -- --out-dir=/tmp/orq-release-artifacts-check
```

```bash
git diff --check
```

In mixed WSL/Windows environments, the local npm or `tsx` shim may require the
compiled `/tmp` fallback documented in the local quality guides.

Generated artifacts must stay under `/tmp/orq-*` and must not be committed.

## Deferred Items

These remain deferred:

- committed baselines,
- CI baseline comparison,
- `fail-on-review` in CI,
- `fail-on-regression` in CI,
- PR annotations,
- badges,
- branch protection recommendations,
- dashboard UI or server.

## Safety Boundaries

CI and quality artifacts are developer signals.

They do not:

- dispatch actions,
- approve or reject proposals,
- grant or consume second approval,
- call providers,
- mutate stores,
- change runtime gates.

## 55B-F Entry Criteria

Suggested entry criteria before 55B-F:

- `dev` is synced with `origin/dev`.
- The `quality` workflow is green.
- Redacted artifact upload is successful.
- Direct typecheck passes.
- Local quality gate passes, or the compiled `/tmp` fallback passes when the
  local npm shim blocks execution.
- Artifact dry-run passes, or the compiled `/tmp` fallback passes when the
  local npm shim blocks execution.
- No generated artifacts are tracked.
- No baseline files are tracked.
- Docs reflect the current CI, artifact, baseline, and strictness status.

The final release-readiness closeout lives in
[Release readiness](release-readiness.md).
