# Conversational Build Loop Success Criteria

Status: source-only / advisory / metadata-only

## Purpose

This document defines how a future Conversational Build Loop dry-run should be
judged. It separates successful metadata simulation from blocked or unsafe
states before any future handoff plan.

## Success Criteria

The dry-run should pass when:

- conversational input metadata is complete
- intake metadata is present
- requirements metadata is present
- feature blueprint metadata is present
- screen blueprint metadata is present
- API contract candidate metadata is present
- design system metadata is present
- quality, security, testing, release, and store metadata are present
- artifact chain is complete enough for human review
- unresolved questions are explicit
- prompt draft exists as metadata only
- prompt draft is marked not usable without human approval
- every stage preserves safety boundaries
- no source-stage file writes happen
- no runtime behavior happens
- no providers or external actions happen
- next recommended artifact is explicit

## Warning Criteria

The dry-run may pass with warnings when:

- assumptions are present but clearly labeled
- low-risk optional artifacts are deferred
- prompt draft is incomplete but not marked usable
- non-blocking questions remain open
- risk is medium and approvals are listed

Warnings should require human review before any future handoff plan.

## Blocked Criteria

The dry-run should block when:

- intake metadata is missing
- requirements metadata is missing
- feature blueprint metadata is missing
- screen blueprint metadata is missing
- prompt draft lacks safety boundaries
- prompt draft is marked usable without approval
- unresolved questions are hidden
- high-risk action lacks approval
- artifact chain claims real implementation work
- any stage reports external action as complete
- memory proposal is treated as persisted
- provider or store behavior appears as done

## Failure Criteria

The dry-run should fail when:

- stage order is inconsistent
- required stage output refs do not match artifact chain refs
- prompt draft omits allowed/forbidden file boundaries
- verification plan is absent
- smoke plan is absent
- final report format is absent
- safety boundaries are missing from any high-risk stage
- the recommendation points to implementation without human approval

## Human Approval Criteria

Human approval must be required when:

- target project scope changes materially
- privacy or safety assumptions are present
- monetization assumptions are present
- notification or analytics posture is present
- release/store readiness is present
- prompt draft is proposed for a future handoff
- memory proposal is proposed for persistence
- any high-risk blocker is waived

## Integration Criteria

The future dry-run should show compatibility with:

- Autopilot real dry-run prompt draft metadata
- Autopilot hardening quality gates
- Mobile Factory first dry-run artifact chain
- PM metadata modules 121-140
- Codex handoff package metadata
- report validation metadata
- memory proposal metadata
- next-action coordinator metadata
- phase closeout metadata

Compatibility means shape alignment and safety preservation, not runtime use.

## Verification Criteria For PILOT-3I

PILOT-3I should verify:

- source compiles
- smoke test builds a default conversational input
- smoke test builds all required stages
- smoke test builds artifact chain
- smoke test builds prompt draft metadata
- smoke test confirms prompt draft is not usable without approval
- smoke test confirms no runtime, provider, dashboard, memory, or source-control
  behavior is represented as done

## Recommended Next Phase

If PILOT-3I passes:

- PILOT-4B - Human-Approved Codex Prompt Handoff Plan

If PILOT-3I blocks:

- Phase 141B - Roadmap Continuation Plan
