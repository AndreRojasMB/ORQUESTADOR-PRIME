# Advanced Learning Strategy and Safety Review

Phase: 34A + 34F
Status: specification only

This document defines the first safe learning layer for ORQUESTADOR-PRIME. The
initial learning system is export-only and analysis-only. It must not fine-tune
models, rewrite prompts automatically, self-modify code, or bypass human
approval.

## Goals

The learning layer should turn existing operational records into reviewable
datasets and quality summaries:

- trajectories from `~/.orquestador-prime/trajectories.json`
- memory references from `~/.orquestador-prime/memory.json`
- action proposals from `~/.orquestador-prime/actions.json`
- execution results from `~/.orquestador-prime/action-executions.json`
- channel audit decisions from `~/.orquestador-prime/channel-audit.json`

The output is intended for offline inspection, evaluation, future labeling, and
possible future training workflows after explicit human approval.

## Non-Goals

The learning layer must not:

- call providers,
- upload datasets,
- fine-tune models,
- run DPO automatically,
- rewrite prompts automatically,
- change routing behavior,
- change agent instructions,
- mutate action approvals,
- dispatch actions,
- grant or consume second approvals,
- modify source files,
- infer user preferences as permanent truth without review.

## Trajectory Export Purpose

Trajectory export packages past runs into a stable, machine-readable format.
The export should support:

- auditability of orchestration quality,
- prompt and routing evaluation,
- human review of accepted/rejected examples,
- future preference-pair generation,
- aggregate quality reporting,
- safe dataset handoff.

Exports should be deterministic for the same input store and options.

## Export Record Shape

Each exported trajectory record should include:

- `schemaVersion`
- `exportedAt`
- `trajectoryId`
- `traceId`
- `source`
- `mode`
- `taskHash`
- `taskPreview`
- `agentsUsed`
- `providerCalls` with provider/model/tokens/duration only
- `parseSuccess`
- `outcome`
- `approvalStatus`
- `judgeScore`
- `distillationTier`
- `qualitySignals`
- `actionLinks`
- `privacy`

The default export should not include full raw prompts, full user task text, raw
provider output, proposal parameters, raw channel identity, raw phone numbers,
tokens, request bodies, or file contents.

## Accepted and Rejected Trajectory Logic

Accepted trajectories are candidates for positive examples. A trajectory may be
accepted when evidence shows successful behavior:

- `result.parseSuccess === true`
- no recorded errors
- `outcome` is `completed` or `merged`
- `approvalStatus` is `approved` when action execution was involved
- `judgeScore >= 7`, or distillation tier is `trusted`

Usable trajectories are lower-confidence examples:

- `result.parseSuccess === true`
- `outcome` is `completed`
- `judgeScore >= 5`, or distillation tier is `usable`

Rejected trajectories are negative examples or cautionary records:

- parse failure
- human rejection
- `outcome === "rejected"`
- `outcome === "ci_failed"`
- low judge score below accepted threshold
- forbidden or blocked action category
- action result failure after dispatch

Ambiguous trajectories should be labeled `needs-review`, not forced into
accepted or rejected buckets.

All labels are heuristic unless a human reviewer explicitly confirms them.

## Preference Pairs

Preference pairs compare two trajectories or two outputs for similar tasks.

Initial pair generation should be conservative:

- same or similar mode
- overlapping task keywords
- compatible agent set
- one accepted candidate and one rejected or weak candidate
- both records pass privacy filters

Preference pair shape:

- `schemaVersion`
- `pairId`
- `createdAt`
- `promptContext`
- `chosenTrajectoryId`
- `rejectedTrajectoryId`
- `reasonCodes`
- `heuristicConfidence`
- `requiresHumanReview`
- `privacy`

Preference pairs are not training data until reviewed. They should be exported
as candidate pairs, not as final labels.

## Quality Signals

Quality signals should combine existing evidence without inventing certainty:

- parse success or failure
- structured output present
- error count
- raw output length bucket, not full raw output
- duration bucket
- provider token usage when available
- selected agents count
- judge score
- outcome
- approval status
- execution result outcome
- channel audit decision if applicable
- distillation tier and reason

Quality signal output should include both machine-readable reason codes and a
short human-readable explanation.

## Dataset Manifest

Every export should write or print a manifest:

- `schemaVersion`
- `createdAt`
- `sourceStores`
- `recordCounts`
- `acceptedCount`
- `rejectedCount`
- `needsReviewCount`
- `preferencePairCount`
- `redactionPolicy`
- `includeRaw`
- `filters`
- `warnings`
- `toolVersion`

The manifest should state clearly that labels are heuristic unless human
reviewed.

## Export-Only Principle

Learning exports may read local stores and write export artifacts only to an
explicit path or stdout. They must not modify source stores.

Allowed:

- read trajectory/action/memory/channel-audit stores
- derive labels
- derive quality signals
- emit JSONL/JSON summaries
- emit a manifest

Forbidden:

- mutating trajectories
- mutating memory
- changing prompts
- changing config
- dispatching actions
- calling providers
- uploading datasets

## Privacy and Redaction Rules

Default export mode is redacted.

Do not export by default:

- raw phone numbers
- raw email addresses
- raw tokens
- API keys
- webhook secrets
- request bodies
- raw voice transcripts
- raw provider prompts
- raw provider completions
- full proposal parameters
- file contents
- full paths outside the current project boundary

Allowed by default:

- hashes
- short previews
- mode/category/source names
- timestamps
- counts
- score values
- reason codes
- provider/model names

If a future `--include-raw` option is added, it must be explicit, noisy, and
blocked unless a local human operator opts in.

## Human Approval Boundaries

Human approval is required before:

- treating heuristic labels as training labels,
- uploading any dataset,
- using exported data for fine-tuning,
- changing prompts based on exported data,
- changing provider routing based on exported data,
- merging a learning-derived code change.

Learning may recommend, but the human decides.

## Safe Future DPO/Fine-Tune Path

A future DPO/fine-tune workflow must be separate from this export layer:

1. Export redacted candidate records.
2. Review manifest and privacy warnings.
3. Human-label preference pairs.
4. Run a privacy scan.
5. Create a training dataset artifact with a new schema version.
6. Require explicit human approval to upload.
7. Track dataset provenance and model version.
8. Never auto-deploy the resulting model.

No part of this path is implemented in Phase 34A-F.

## Deeper Self-Improvement Relationship

The deeper safe self-improvement path is documented in
[Safe self-improvement deeper](safe-self-improvement-deeper.md). Learning
signals may later feed redacted retrospective findings and proposal-only
improvement plans, but they must not directly mutate prompts, router behavior,
agent instructions, source files, memory stores, learning stores, or CI.
