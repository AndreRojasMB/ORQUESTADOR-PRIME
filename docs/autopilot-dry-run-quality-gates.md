# Autopilot Dry-Run Quality Gates

Phase: PILOT-2B - AUTOPILOT DRY-RUN HARDENING PLAN

Status: quality gate plan / docs-only

## Purpose

This document defines metadata-only quality gates for future Autopilot dry-run
hardening.

The gates should make scenario results consistent and reviewable. They should
not collect live evidence or take action.

## Gate Model

Each quality gate should return:

- gate id,
- scenario id,
- status: `passed`, `warning`, `failed`, or `blocked`,
- safe summary,
- findings,
- required human review,
- recommended next action,
- metadata-only flag,
- no-action safety flags.

## Prompt Completeness Gate

Checks:

- prompt draft exists,
- prompt draft is string metadata only,
- prompt source package reference exists,
- human-facing response includes:
  1. Alerta
  2. Siguiente fase
  3. Modelo recomendado
  4. Prompt listo para Codex
- prompt output requires human review before use.

Failure should block handoff.

## Report Completeness Gate

Checks:

- report id exists,
- phase exists,
- files inspected and modified are present,
- command summaries are present when required,
- test summaries are present when required,
- scope summary exists,
- forbidden grep summary exists,
- next recommended phase exists,
- source-only flags are present.

Failure should return `needs_review` or `blocked` depending on missing fields.

## Validation Consistency Gate

Checks:

- validation status matches finding severity,
- failed commands produce failed or review status,
- forbidden files produce blocked status,
- staged files outside scope produce blocked status,
- missing tests produce warning or review status,
- next validation action matches status.

Failure should prevent continuation.

## Memory Proposal Safety Gate

Checks:

- memory output status is `proposed`,
- human review is required,
- no persistence is represented,
- unresolved issues are preserved,
- learning rules are recommendations only.

Failure should require human review and block memory use.

## Next-Action Consistency Gate

Checks:

- B-mode clean metadata maps to matching I phase,
- I-mode clean metadata with commit/push evidence maps to next B phase,
- missing implementation closeout maps to closeout required,
- blocked validation maps to blocked next action,
- critical risk maps to freeze or review behavior,
- handoff permission is denied when blockers exist.

Failure should request review.

## Closeout Consistency Gate

Checks:

- B-mode local plan can close as local-only,
- I-mode implementation needs commit/push evidence,
- failed verification maps to review,
- forbidden grep failure maps to blocked,
- unsafe scope maps to unsafe scope,
- closeout cannot advance when blockers remain.

Failure should prevent phase exit.

## Scope Safety Gate

Checks:

- changed files are inside allowed scope,
- forbidden files are not modified,
- dirty outside scope is known when allowed,
- staged outside scope is blocked,
- Phase 121B mobile docs remain outside PILOT-2 scope.

Failure should block.

## Forbidden Action Gate

Checks:

- no Codex invocation is represented as completed,
- no OpenClaw operation is represented as completed,
- no WhatsApp outbound behavior is represented as completed,
- no n8n behavior is represented as completed,
- no provider call is represented as completed,
- no dashboard mutation is represented as completed,
- no package or workflow change is represented as completed,
- no CI activation is represented as completed,
- no DB/SQL mutation is represented as completed,
- no memory persistence is represented as completed,
- no source-control mutation from source is represented as completed.

Failure should block and require human review.

## Human-Facing Response Gate

The human-facing response should be stable across all scenarios:

```text
1. Alerta
<label>

2. Siguiente fase
<phase and reason>

3. Modelo recomendado
<model or human review first>

4. Prompt listo para Codex
<prompt draft, prompt type, or unavailable reason>
```

Missing or reordered sections should fail the prompt completeness gate.
