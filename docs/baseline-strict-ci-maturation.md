# Baseline / Strict CI Maturation

Phase: 83I
Status: docs-only/spec-only

## A. Purpose

Baseline and strict CI maturity defines the future governance path for turning
today's advisory quality evidence into reviewed comparison anchors and staged CI
feedback. The future benefit is clearer regression review, safer release
readiness, and a better foundation for proposal-only self-improvement.

Phase 83I is governance/spec only. It does not implement enforcement, change
quality behavior, or make ORQUESTADOR-PRIME production-ready.

This phase does not:

- modify CI workflows,
- enable strict CI,
- create or commit baselines,
- mutate artifacts,
- change quality, eval, or risk gate behavior,
- implement PR annotations, branch protection, or badges.

## B. Current Baseline / Quality State

Quality dashboard data is advisory JSON, not a runtime gate or approval surface.
Quality snapshots and snapshot comparisons already exist for deterministic
review of summarized quality state.

Committed baselines remain deferred. Current baseline candidates are local-only
and should stay under `/tmp/orq-*` until a committed baseline location and
approval policy are explicitly approved.

The local `quality:gate` command supports strict flags such as
`--fail-on-review` and `--fail-on-regression`, but CI does not enable those
strict flags. The active `.github/workflows/quality.yml` workflow runs
typecheck, the local quality gate, redacted artifact generation, and artifact
upload.

Redacted artifacts are active and currently include:

- `quality-report.json`
- `quality-snapshot.json`
- `manifest.json`

Current artifact retention is intentionally short. No committed baseline
directory is approved yet. Safe self-improvement may depend on mature baselines
and strict CI later, but it must not update baselines autonomously.

## C. Readiness Gaps

Current gaps before strict baseline enforcement include:

- no committed baseline anchor,
- no CI baseline comparison,
- no strict CI fail-on-review or fail-on-regression in workflow,
- no PR annotations,
- no branch protection policy implemented in the repo,
- no badge generation,
- no approved committed baseline location,
- no baseline rollback playbook beyond policy guidance,
- no approved path for updating committed baselines.

## D. Baseline Storage Strategy

Keep current `/tmp/orq-*` local candidates for dry-runs. They are useful for
review and experimentation, but they are not committed baselines.

A future curated committed baseline location may be defined as a policy
candidate only after review. Future baselines should carry metadata for:

- phase,
- commit,
- schema version,
- privacy scan status,
- approving reviewer,
- rollback reference,
- comparison summary.

No baseline creation happens in 83I.

## E. Baseline Comparison Strategy

Snapshot comparison should continue as advisory first. Future CI comparison
should run in warning/report mode before becoming blocking.

Possible regression signals include:

- status worsening,
- new failing IDs,
- privacy worsening,
- budget worsening,
- risk decision worsening,
- fingerprint drift.

No comparison behavior changes happen in 83I.

## F. Strict CI Gate Strategy

The staged future path is:

1. current advisory gate,
2. CI comparison report only,
3. fail-on-review warning-mode trial,
4. fail-on-regression after approved baseline and rollback path,
5. branch protection after stability evidence.

Each stage should be reversible and human-approved before it becomes the default
for pull requests or pushes.

## G. Fail-On-Review Policy

Fail-on-review is future-only until review and blocked reason codes are stable,
understood, and human-approved.

83I does not enable fail-on-review in CI.

## H. Fail-On-Regression Policy

Fail-on-regression is future-only until committed baseline governance exists.
It should require an approved baseline, known rollback path, stable fingerprint
behavior, and a period of advisory CI comparison before blocking.

83I does not enable fail-on-regression in CI.

## I. PR Annotation Strategy

PR annotations are future-only. They should use redacted artifact summaries and
must not expose:

- raw logs,
- secrets,
- raw task bodies,
- provider output,
- raw file content.

83I does not implement PR annotations.

## J. Branch Protection Strategy

Branch protection is future-only after strict CI has a low false-positive rate
and clear rollback process. It also requires repository-hosting settings outside
the codebase.

83I does not implement branch protection.

## K. Badge Strategy

Quality badges are future-only and should be derived from approved CI state
later. Badges must not imply production readiness or compliance.

83I does not generate badges.

## L. Artifact Retention Strategy

Keep current short retention for redacted artifacts. Longer retention should be
defined only after privacy, storage, and reviewer-use policy are reviewed.

83I does not change artifact retention or artifact contents.

## M. Redacted Artifact Policy

Continue compact JSON only.

Artifacts must not include:

- raw task bodies,
- raw provider output,
- execution output,
- secrets,
- absolute paths,
- raw proposal params,
- full file content,
- credentials,
- tokens.

Artifacts are evidence for review. They are not baselines by themselves and are
not approval to execute risky behavior.

## N. Baseline Update Approval Policy

Future baseline updates require:

- manual approval,
- reason,
- diff,
- privacy scan result,
- comparison summary,
- rollback plan,
- reviewer identity or role,
- explicit statement that the baseline update is not hiding a regression.

Baseline updates should be rare, reviewable, and traceable.

## O. Rollback Strategy

Rollback should revert the baseline commit or restore the previous approved
baseline. A noisy strict CI rollout should remove only strict arguments or
strict enforcement wiring, not weaken the underlying quality logic.

Never update baselines merely to hide regression.

83I does not implement rollback behavior.

## P. Dashboard / Control-Center Visibility

A future read-only control center may display baseline status, comparison
results, maturity stage, policy status, and reviewer notes.

83I does not implement a dashboard or control center.

## Q. Safe Self-Improvement Integration

Self-improvement proposals may depend on strict CI later. They must not update
baselines autonomously, treat baseline changes as automatic approval, or bypass
human review.

83I does not enable regression enforcement or self-improvement behavior changes.

## R. CI Maturity Stages

The intended maturity stages are:

1. advisory quality artifacts,
2. local quality reports,
3. uploaded redacted artifacts,
4. committed baseline candidates, local-only first,
5. baseline comparison dry-run,
6. strict CI warning mode,
7. strict CI fail-on-regression mode,
8. PR annotations,
9. branch protection,
10. badges,
11. enterprise governance.

## S. Integration Plan

Baseline and strict CI maturity should later support:

- quality reports, snapshots, and gates through stable redacted outputs,
- evals and risk through advisory summaries and stable reason IDs,
- learning and self-improvement through approved regression evidence only,
- dashboard/control center through read-only baseline and CI status views,
- release readiness through explicit criteria for strict mode,
- PR review through future redacted annotations,
- branch protection after stable strict CI behavior,
- CI artifacts through retention and redaction policy,
- productization through governance, rollback, and reviewer policy.

## T. Safety Boundaries / Non-Goals

83I explicitly does not include:

- provider calls,
- network,
- command execution beyond read-only inspection/planning,
- filesystem mutation,
- workflow/CI changes,
- package/script changes,
- baseline or artifact mutation,
- eval, quality, or risk execution,
- gate behavior changes,
- PR annotation implementation,
- branch protection implementation,
- badge generation,
- action/proposal/approval execution,
- automation execution,
- runtime or dashboard implementation,
- production-ready claims,
- security/compliance guarantees.

## U. Future Source Candidates

These are future-only candidates and are not implemented in 83I:

- `src/quality/baselinePlanning/types.ts`
- `src/quality/baselinePlanning/baselineStrictCiPlanTemplates.ts`
- `src/quality/baselinePlanning/baselineStrictCiPlanValidator.ts`
- `src/quality/baselinePlanning/baselineStrictCiPlanBuilder.ts`

Future type candidates include:

- `BaselineStrictCiSchemaVersion`
- `BaselineStrictCiBoundarySet`
- `BaselineCandidatePlan`
- `BaselineComparisonPlan`
- `StrictCiGatePlan`
- `FailOnReviewPolicyPlan`
- `FailOnRegressionPolicyPlan`
- `PrAnnotationPlan`
- `BranchProtectionPlan`
- `QualityBadgePlan`
- `ArtifactRetentionPlan`
- `RedactedArtifactPolicy`
- `BaselineUpdateApproval`
- `BaselineRollbackPlan`
- `CiMaturityStage`
- `BaselineStrictCiRisk`
- `BaselineStrictCiValidationFinding`
- `BaselineStrictCiValidationResult`

## V. Future Validation Strategy

Future source metadata should validate:

- required baseline planning fields,
- bounded arrays and text,
- `advisoryOnly: true`,
- all safety boundaries true,
- baseline references marked as plans unless explicitly implemented later,
- strict CI entries marked as plans only, not workflow changes,
- PR annotation entries marked as plans only,
- branch protection entries marked as plans only,
- badge entries marked as plans only,
- no provider, network, filesystem write, action, store, runtime, or automation
  execution behavior,
- no production, security, or compliance guarantees.

## Productization / Release Path

The future productization path is documented in
[Productization / Release Path](productization-release-path.md). Approved
baseline and strict CI maturity are prerequisites for stronger release gates,
but Phase 85I does not enable strict CI, create baselines, mutate artifacts, or
publish a release.

## Post-85 Roadmap Sequencing

Future baseline and strict CI work should follow
[Post-85 Roadmap Sequencing](post-85-roadmap-sequencing.md). Blocking CI should
not advance before committed baseline governance, warning-mode trials, rollback
policy, and human approval are in place.
