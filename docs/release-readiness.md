# Release Readiness

Phase: 55B-F
Status: quality/CI closeout

## Purpose

This is the final docs-only release-readiness closeout for the advanced
quality, CI, baseline, and artifact stack.

This is quality/CI release-readiness. It does not claim full runtime production
readiness, and it does not claim full JARVIS completion. This closeout confirms
that the advanced quality/CI stack is ready for the next release-readiness
stage.

The full JARVIS / Software Factory gap map lives in
[JARVIS complete gap analysis](jarvis-complete-gap-analysis.md). This release
readiness document remains an advisory quality/CI closeout, not a full JARVIS
completion claim.

## Current Shipped Stack

The shipped quality stack includes:

- offline eval harness,
- `evals:gate`,
- advisory risk signal,
- `risk:from-evals`,
- quality report,
- quality snapshot,
- local quality gate,
- artifact dry-run,
- active CI,
- redacted artifact upload,
- baseline policy,
- strict CI readiness policy.

All quality outputs remain developer signals.

## Active CI Command Sequence

The active `quality` workflow runs:

```bash
npm ci
npm run check:node
npm run quality:gate
npm run quality:artifacts:dry-run -- --out-dir=/tmp/orq-quality-artifacts-ci
```

Then CI uploads the scanned redacted quality artifact.

Workflow action/runtime details:

- `actions/checkout@v6`
- `actions/setup-node@v6`
- `actions/upload-artifact@v4`
- `node-version: 22`
- artifact retention: 3 days

## Uploaded Artifact

Artifact name:

```text
quality-redacted-json
```

Uploaded files:

- `quality-report.json`
- `quality-snapshot.json`
- `manifest.json`

Artifacts are redacted advisory evidence. They are not baselines, and they are
not runtime approval.

## Final Local Verification Checklist

Recommended local checks:

```bash
node node_modules/typescript/bin/tsc --noEmit
```

```bash
npm run quality:gate
```

```bash
npm run quality:artifacts:dry-run -- --out-dir=/tmp/orq-55b-f-artifacts
```

```bash
git diff --check
```

In mixed WSL/Windows environments, the local npm or `tsx` shim may require the
compiled `/tmp` fallback documented in the local quality guides.

Generated artifacts must stay under `/tmp/orq-*` and must not be committed.

## Final Repo Hygiene Checklist

Before considering this stack closed out:

- `git status -sb` is clean and synced.
- No generated artifacts are tracked.
- No baseline files are tracked.
- No workflow, package, source, or script files changed during this closeout.
- Docs reflect the current CI, artifact, baseline, and strictness status.

## Deferred Items Beyond 55B-F

These remain deferred:

- committed baselines,
- CI baseline comparison,
- `fail-on-regression` in CI,
- `fail-on-review` in CI,
- branch protection recommendations,
- PR annotations,
- badges,
- dashboard UI or server,
- release tagging,
- stricter runtime approval integration.

## Safety Boundaries

CI quality signals are developer signals.

Artifacts are advisory evidence.

They do not:

- dispatch actions,
- approve or reject proposals,
- grant or consume second approval,
- call providers,
- mutate stores,
- change runtime gates.

## Closeout Status

The advanced quality/CI/baseline/artifact stack is release-ready as an advisory
quality system.

Baselines and strict CI are intentionally deferred.

Runtime production readiness and full JARVIS completion are outside this
closeout.
