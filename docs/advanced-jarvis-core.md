# Advanced JARVIS Core Specification

Phase: 39-44A
Status: specification only

This document defines the Advanced JARVIS Core layer for ORQUESTADOR-PRIME. It
is a docs-only contract. It does not add runtime logic, provider calls,
automatic PR creation, prompt rewriting, self-modification, server/API runtime,
dispatch behavior, approval behavior, second-approval behavior, or channel
execution.

## Purpose

Advanced JARVIS Core is the coordination layer above the existing supervisor,
memory, permission, tool, job, channel, and action systems. It should make the
system more situationally aware without granting hidden autonomy.

The core should help answer:

- What is the current project state?
- What risks or blockers are visible?
- Which reviewers should inspect this work?
- Which memories or goals are relevant?
- Which channels are allowed to ask for what?
- Which next step is safe to recommend?
- Which failures should become improvement proposals?

It must not turn recommendations into execution without explicit user approval
and existing safety gates.

## Existing Foundations

The 39-44 block builds on already shipped components:

- Supervisor/JARVIS advisory status.
- Project-scoped Memory V2 retrieval.
- Export-only learning datasets.
- Tool Registry and Permission Checker.
- Permission Audit Store.
- Global Redaction Engine and Safe Error Taxonomy.
- Local jobs queue and notification inbox.
- Channel identity, channel audit, and action bridges.
- Guarded channel dispatch wrapper, currently not wired to channels.
- OpenClaw/computer-use dry-run and metadata-only screenshot traces.

These systems remain separate gates. JARVIS Core composes them; it does not
replace them.

## Architecture

JARVIS Core should be layered as follows:

1. Request context.
   Normalize user or channel intent into a safe context with project identity,
   channel identity when applicable, redaction metadata, and correlation id.

2. State context.
   Read supervisor status, workspace state, Memory V2 safe context, recent
   action/channel/job signals, and relevant evaluation reports.

3. Review context.
   Run deterministic local reviewers such as critic, security, and QA when
   configured for the workflow. Provider-backed reviewers are future work and
   must be explicit.

4. Consensus context.
   Aggregate reviews into an advisory `ConsensusDecision`. Consensus is not
   approval and must not dispatch, approve, reject, or grant second approval.

5. Recommendation context.
   Produce next safe steps, blocked shortcuts, open questions, and optional
   proposal recommendations.

6. Trace context.
   Persist redacted traces only when an explicit trace store phase approves it.
   Trace records must not include raw secrets, raw prompts, provider outputs, or
   raw channel identifiers.

## Advisory-First Behavior

JARVIS Core may:

- summarize current project state,
- recommend implementation order,
- recommend review or smoke tests,
- identify safety blockers,
- recommend creating an action proposal through existing bridges,
- recommend memory retrieval or learning export,
- create local reports in explicit CLI phases.

JARVIS Core must not:

- call providers without explicit phase approval,
- mutate prompts,
- edit source files,
- create branches or PRs,
- approve or reject actions,
- grant or consume second approval,
- dispatch actions,
- bypass permission checks,
- bypass channel identity checks,
- bypass computer-use dry-run boundaries,
- auto-run jobs in the background.

## Permission Boundaries

Every future callable JARVIS capability should map to a Tool Registry entry and
Permission Checker request. Default behavior is denied unless the capability is
safe and explicitly designed as read-only.

Recommended future capabilities:

- `jarvis.status.inspect`
- `multi_agent.review.run`
- `workspace.roadmap.inspect`
- `workspace.roadmap.update`
- `evaluation.report.generate`
- `budget.estimate`
- `channel.route.inspect`
- `self_improvement.review.generate`

Risky capabilities must be `forbiddenByDefault`.

## Approval Boundaries

JARVIS consensus, reviewer agreement, workspace roadmap state, and evaluation
success are not approvals.

Only existing action approval systems may represent proposal approval. Only the
second approval store may represent active second approval. Only existing
dispatch/execution paths may execute actions after gates pass.

## Memory Boundaries

JARVIS may retrieve Memory V2 safe context using project-scoped retrieval. It
must:

- hard-filter project mismatch,
- respect privacy labels,
- omit secret/private memory unless explicitly allowed by retrieval policy,
- avoid prompt injection from memory by treating memory as context, not command,
- never retrieve across projects by default.

## Jobs and Notifications

Jobs remain local and manual-run only. JARVIS may recommend jobs or read job
status. It must not create background daemons or run dangerous job kinds.

Notifications remain local inbox records unless a later delivery phase is
approved. Notification summaries must be redacted before storage.

## Channels

The multi-channel assistant layer should reuse:

- `ChannelIdentity`
- `ChannelPermission`
- `ChannelAuditStore`
- Permission Checker
- Memory V2 retrieval
- Supervisor report
- Channel Action Bridge

It must not add new dispatch wiring in this spec phase.

## Self-Improvement

Self-improvement starts as failure review and proposal-only analysis. It may
suggest changes. It must not edit code, rewrite prompts, create PRs, or alter
configuration automatically.

## Verification Expectations

Each implementation phase should verify:

- typecheck passes,
- `git diff --check` passes,
- scope only includes approved files,
- no provider/network calls unless explicitly allowed,
- no dispatch/approval/second-approval imports for advisory modules,
- stores use isolated `HOME` in smoke tests,
- privacy scans find no raw phone, email, token, request body, raw body, full
  paths, or raw provider output.

