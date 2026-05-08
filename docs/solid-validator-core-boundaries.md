# Phase 116B - SOLID Validator Core Boundaries

## Boundary Statement

The SOLID Validator Core is planned as a source-only, advisory-only, report-only architecture layer. It may evaluate caller-supplied metadata and produce structured reports, but it must not discover metadata by reading project files or by running tools.

The validator is a quality reporting primitive, not an execution engine.

## Allowed Behavior

Future implementation may:

- Accept explicitly supplied validation metadata.
- Accept explicitly supplied rule registry metadata.
- Accept explicitly supplied checklist, smell, boundary, and dependency findings.
- Aggregate supplied findings into a report.
- Summarize severity and risk.
- Mark missing or weak evidence as `insufficient_evidence` or `needs_review`.
- Provide PM and Autopilot metadata for advisory reporting.
- Recommend next actions as text or typed metadata.

## Forbidden Behavior

Future implementation must not:

- Read or write files.
- Inspect repository contents.
- Parse source trees.
- Discover imports automatically.
- Launch processes.
- Access environment variables.
- Use network calls.
- Call providers or connectors.
- Mutate dashboard state.
- Invoke OpenClaw.
- Send WhatsApp messages.
- Run n8n workflows.
- Persist memory.
- Run git operations.
- Execute refactors.
- Approve itself or bypass human review.
- Deploy or mutate DB/SQL state.

## Source Boundary for Phase 116I

The expected source scope for the implementation phase is limited to:

- `src/architecture/solidRuleRegistry.ts`
- `src/architecture/solidValidator.ts`
- `src/architecture/index.ts`
- `docs/solid-validator-core.md`
- optional `scripts/solid-validator-core-tests.ts`

No PM, Autopilot, integration, WhatsApp, Viernes bridge, dashboard, provider, workflow, CI, package, or runtime files should be modified for Phase 116I unless a later human-approved phase changes the scope.

## Input Boundary

Validator input must be metadata supplied by the caller:

- Module summaries.
- Dependency summaries.
- Checklist results.
- Existing boundary findings.
- Existing dependency findings.
- Existing smell findings.
- Evidence references.
- Validator configuration references.

The validator must treat missing metadata as missing evidence, not as permission to inspect the project.

## Rule Boundary

Rules must describe:

- Which metadata they evaluate.
- Which principles they relate to.
- Which evidence they require.
- Which severity they default to.
- Which safety boundaries apply.

Rules must not encode file discovery, source parsing, command execution, provider calls, dashboard calls, or refactor instructions.

## Report Boundary

Reports may include:

- Status.
- Findings.
- Severity counts.
- Risk level.
- Evidence references.
- Limitations.
- Approval requirements.
- Recommended next action.
- PM escalation metadata.
- Autopilot use metadata.

Reports must not write memory, stage files, commit, push, launch handoff, or execute a closeout.

## Human Approval Boundary

The validator can recommend human review, but it cannot grant approval. Any critical action, memory update, refactor, provider use, dashboard mutation, deploy, or execution remains outside this layer and requires a separately approved phase.

## Stop Conditions

The validator should classify the report as blocked or needing review when:

- Required evidence is missing for high-risk checks.
- Supplied metadata indicates provider leakage, dashboard mutation, runtime coupling, or process launch in a source-only domain.
- Supplied metadata indicates forbidden files were modified.
- Supplied metadata conflicts with phase boundaries.
- A requested follow-up would require execution or refactor behavior.
