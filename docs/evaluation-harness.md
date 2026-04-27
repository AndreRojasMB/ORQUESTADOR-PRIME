# Evaluation Harness and Budget Guard Specification

Phase: 41A-41H
Status: specification only

This document defines the offline evaluation harness, quality reporting, cost
and token budget guard, and prompt/context compression policy. It is docs-only
and does not add provider calls, prompt rewriting, or runtime routing changes.

## Goals

The evaluation layer should catch regressions and runaway context before
expensive or risky execution occurs.

It should support:

- golden tasks,
- router tests,
- prompt-shape tests,
- regression reports,
- local quality dashboards later,
- cost and token estimates,
- context size warnings,
- compression policy checks.

Initial evaluation is offline and local.

## Non-Goals

The first evaluation implementation must not:

- call providers,
- validate real API keys,
- upload datasets,
- fine-tune models,
- rewrite prompts,
- alter router behavior,
- mutate production stores,
- dispatch actions.

## Golden Tasks

Golden tasks are local fixtures with expected classifications and safety
boundaries.

Recommended fields:

- `taskId`
- `title`
- `mode`
- `inputPreview`
- `expectedAgents`
- `expectedRisk`
- `expectedActionCategory`
- `expectedDecision`
- `forbiddenImports`
- `requiredWarnings`
- `tags`

Golden tasks should avoid real secrets and real customer data.

## Router Tests

Router tests should validate:

- selected agents,
- mode selection,
- action category classification,
- provider route detection,
- default OpenAI fallback warnings,
- channel operation routing,
- forbidden category blocking.

Router tests should use deterministic local functions where possible.

## Prompt-Shape Tests

Prompt-shape tests inspect prompt construction without calling providers.

They should verify:

- required sections are present,
- raw secrets are absent,
- Memory V2 safe context is bounded,
- action gates are described,
- output schema instructions are present,
- no prompt includes full raw stores,
- no prompt includes unredacted channel identity.

## Regression Report

Regression report shape:

- `reportId`
- `createdAt`
- `suiteVersion`
- `projectId`
- `summary`
- `results`
- `failures`
- `warnings`
- `budget`
- `redaction`

Reports may be written only to explicit output paths or a future local eval
store. Default CLI output should be stdout.

## Quality Dashboard

A future quality dashboard should be read-only:

- latest report,
- pass/fail trend,
- high-risk failures,
- router drift,
- prompt size warnings,
- budget warnings.

Dashboard should not run evals automatically in the first dashboard phase.

## Cost and Token Budget Guard

The budget guard estimates before provider calls happen.

Inputs:

- model route,
- prompt text length,
- message count,
- memory context count,
- tool/context attachments,
- max tokens,
- mode,
- channel,
- project id.

Outputs:

- estimated input tokens,
- configured max output tokens,
- estimated cost band,
- budget status: `ok`, `warn`, `block`,
- compression suggestions,
- reason codes.

The guard must not call providers or price APIs. Pricing tables, if added, must
be static and explicitly versioned.

## Context Compression Policy

Compression should be advisory first. It must not rewrite prompts
automatically.

Policy should warn or block when:

- context exceeds model budget,
- Memory V2 results exceed safe count,
- raw file content is included where summary would suffice,
- repeated audit sections duplicate context,
- channel input includes raw body-like fields,
- provider route falls back unexpectedly.

Allowed compression actions in early phases:

- recommend focused repo reads,
- recommend Memory V2 retrieval filters,
- recommend summary-only context,
- recommend lowering recent history count.

Forbidden in early phases:

- automatic prompt rewriting,
- persistent prompt changes,
- deleting context without reporting,
- changing model/provider automatically.

## Smoke Tests

Future smoke should verify:

- golden tasks parse,
- router tests are deterministic,
- prompt-shape tests catch secret strings,
- budget guard warns on oversized context,
- budget guard blocks above hard cap,
- reports write only to explicit path or stdout,
- no provider/network calls occur.

