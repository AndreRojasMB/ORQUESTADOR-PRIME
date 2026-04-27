# Safe Self-Improvement Specification

Phase: 44A-44F
Status: specification only

This document defines the safe self-improvement boundary for ORQUESTADOR-PRIME.
It is docs-only and does not add source edits, prompt rewrites, PR creation,
provider calls, or runtime mutation.

## Goals

Self-improvement should turn failures into reviewable proposals, not automatic
changes.

It may:

- inspect redacted trajectories,
- inspect learning exports,
- inspect eval reports,
- inspect supervisor risks,
- summarize recurring failures,
- recommend future changes,
- create a self-improvement proposal record in a later explicit phase.

It must not change the system by itself.

## Non-Goals

Self-improvement must not:

- edit source files,
- rewrite prompts,
- change model routing,
- change config,
- create branches,
- create PRs,
- approve proposals,
- dispatch actions,
- grant second approval,
- call providers,
- train or fine-tune models,
- upload data.

## Failure Review Engine

The failure review engine should read only safe, local artifacts:

- trajectory exports,
- eval reports,
- supervisor advisory reports,
- action/execution summaries,
- channel audit summaries,
- job failure summaries,
- red-team reports.

It should output:

- failure clusters,
- suspected causes,
- affected phases,
- risk level,
- evidence ids,
- recommended next safe steps,
- confidence,
- human review requirement.

All labels are heuristic until reviewed.

## Self-Improvement Proposal

Recommended shape:

- `proposalId`
- `version`
- `createdAt`
- `projectId`
- `title`
- `summary`
- `sourceEvidence`
- `failureClusterIds`
- `recommendedChangeType`
- `affectedFiles`
- `expectedBenefit`
- `riskLevel`
- `requiredReviewers`
- `humanApprovalRequired: true`
- `status`
- `redaction`

Statuses:

- `draft`
- `needs-review`
- `accepted`
- `rejected`
- `deferred`

Accepted does not mean implemented. It means a human accepted the improvement
idea for future work.

## Human Approval Gate

Human approval is required before:

- turning a self-improvement proposal into a task,
- editing source files,
- changing prompts,
- changing provider routing,
- changing safety gates,
- creating a PR.

The approval gate should be separate from action dispatch approval. It is a
planning approval, not execution approval.

## Accept/Reject Learning

Accept/reject decisions may feed future learning exports only as reviewed
metadata.

Rules:

- accepted proposals are not ground truth for training,
- rejected proposals remain useful negative examples,
- all labels must include source `human-reviewed` or `heuristic`,
- no automatic prompt rewrite from accepted proposals,
- no automatic code generation from accepted proposals.

## Red-Team Checklist

Self-improvement red-team should block or flag:

- proposal suggests disabling approval gates,
- proposal suggests widening forbidden categories,
- proposal suggests logging secrets for debugging,
- proposal suggests provider calls without budget guard,
- proposal suggests cross-project memory sharing by default,
- proposal suggests automatic PR creation,
- proposal suggests prompt rewrite without human review,
- proposal is based on private/secret memory,
- proposal cites raw channel identity,
- proposal recommends real computer use without 38E-G gates.

## Safe Implementation Path

Recommended future phases:

1. `44B-FAILURE-REVIEW-ENGINE`
   Read-only clustering over existing redacted reports.

2. `44C-SELF-IMPROVEMENT-PROPOSALS`
   Local proposal store, explicit CLI writes only.

3. `44D-HUMAN-APPROVAL-GATE`
   Human accept/reject workflow for proposals, not execution.

4. `44E-LEARNING-FEEDBACK`
   Export accepted/rejected proposal metadata to learning datasets.

5. `44F-SELF-IMPROVEMENT-REDTEAM`
   Red-team fixtures proving no self-modification or safety bypass.

## Disabled By Default

These remain disabled by default:

- source edits,
- branch creation,
- PR creation,
- prompt rewriting,
- provider-backed proposal generation,
- config mutation,
- safety gate mutation,
- model fine-tuning,
- dataset upload,
- automatic implementation of proposals.

