# Phase 116B - SOLID Validator Core Plan

## Purpose

Phase 116 defines a source-only and report-only SOLID Validator Core. The validator will operate only on metadata supplied by the caller and will produce advisory validation reports. It will not read project files, discover imports, inspect the repository, parse source trees, launch processes, call providers, mutate state, or perform refactors.

The goal is to prepare Phase 116I with a safe rule registry and validator contract that can aggregate architecture findings from the SOLID charter, module boundaries, dependency inversion rules, smell taxonomy, and review checklist.

## Validator Scope

The future validator core should cover:

- SOLID rule registry metadata.
- Caller-supplied validation input.
- Report-only validation output.
- Finding aggregation across prior architecture layers.
- Severity summarization.
- Linkage to checklist items.
- Linkage to architecture smell categories.
- Linkage to module boundary policies and findings.
- Linkage to dependency inversion policies and findings.
- PM and Autopilot metadata output for reporting, risk, next-action, and closeout context.

The validator must be a pure metadata evaluator. It may classify and summarize supplied facts, but it must not create those facts by reading files or detecting imports.

## Validator Input Model

Future `SolidValidatorInput` metadata should include:

- `validationId`: stable id for the validation request.
- `targetRef`: human-readable reference to the reviewed module, feature, phase, or report.
- `targetKind`: target category such as module, phase, report, milestone, or architecture review.
- `suppliedModules`: caller-provided module metadata.
- `suppliedDependencies`: caller-provided dependency metadata.
- `suppliedChecklistItems`: caller-provided checklist items or checklist outcomes.
- `suppliedBoundaryFindings`: caller-provided module boundary findings.
- `suppliedDependencyFindings`: caller-provided dependency inversion findings.
- `suppliedSmellFindings`: caller-provided architecture smell findings.
- `suppliedEvidenceRefs`: caller-provided evidence references.
- `configRef`: reference to the validator configuration used for the report.

Inputs must be caller-supplied metadata only. The validator must not read the filesystem, inspect the repository, parse source trees, or perform automatic import detection.

## Rule Registry Model

Future `SolidRuleRegistry` entries should include:

- `ruleId`: stable rule id.
- `title`: concise human-readable title.
- `principleRefs`: related SOLID principles.
- `checklistItemRefs`: related review checklist items.
- `smellCategoryRefs`: related smell categories.
- `boundaryPolicyRefs`: related module boundary policies.
- `dependencyPolicyRefs`: related dependency policies.
- `severityDefault`: default severity when the rule emits a finding.
- `evaluateInputKind`: metadata input kind the rule can evaluate.
- `requiredEvidence`: evidence needed for a trustworthy result.
- `reportOnly`: must be true for Phase 116.
- `safetyBoundaries`: no-go boundaries attached to the rule.

Rule entries must describe advisory checks, not executable scanners or refactor steps.

## Validator Output Model

Future `SolidValidatorReport` metadata should include:

- `reportId`: stable report id.
- `validationId`: source validation request id.
- `status`: validation status.
- `findings`: aggregated findings derived from supplied metadata.
- `summary`: short report summary.
- `severityCounts`: count of findings by severity.
- `riskLevel`: overall risk level.
- `approvalRequired`: whether human approval is required before any follow-up.
- `pmEscalation`: PM-facing escalation metadata.
- `autopilotUse`: Autopilot-facing advisory metadata.
- `evidenceRefs`: evidence references used by the report.
- `limitations`: explicit limits of the report.
- `recommendedNextAction`: advisory next action.

## Validation Statuses

Supported statuses should be:

- `passed`: supplied evidence satisfies the enabled rules.
- `warning`: non-blocking issues or incomplete low-risk evidence exist.
- `failed`: at least one required rule fails without blocking safety concerns.
- `needs_review`: human review is required before interpreting the result.
- `blocked`: safety, scope, or evidence problems prevent continuation.
- `insufficient_evidence`: supplied metadata is too thin for a meaningful report.

## Safety Boundaries

The future validator must remain:

- Report-only.
- Advisory-only.
- Source-only.
- Caller-supplied input only.
- No filesystem scanning.
- No runtime scanner.
- No syntax-tree parsing.
- No repository reading.
- No automatic import detection.
- No refactor execution.
- No providers.
- No dashboard mutation.
- No OpenClaw.
- No WhatsApp outbound.
- No n8n.
- No memory persistence.
- No git automation.
- No process launch.
- No env or network access.
- No DB, SQL, or deploy actions.

## Integration With Prior Architecture Layers

The validator should build on:

- Phase 111I SOLID Architecture Charter for principles and SOLID finding vocabulary.
- Phase 112I Module Boundary Rules for layers, import policies, and boundary findings.
- Phase 113I Dependency Inversion Rules for dependency categories, policies, and classifier metadata.
- Phase 114I Architecture Smell Taxonomy for smell categories, severity, and smell findings.
- Phase 115I SOLID Review Checklist for checklist items, review findings, and review templates.

It should aggregate metadata from these layers into one report, not replace them.

## PM and Autopilot Integration

SOLID validator reports may feed:

- PM Status Reports.
- PM risk and blocker metadata.
- Next-best-action recommendations.
- Autopilot next-action context.
- Phase closeout context.
- Future quality gate drafts.

They must not trigger refactors, scanners, handoff, execution, memory writes, approvals, commits, pushes, or dashboard changes automatically.

## Future Phase 116I Scope

Phase 116I should safely implement:

- `src/architecture/solidRuleRegistry.ts`
- `src/architecture/solidValidator.ts`
- update `src/architecture/index.ts`
- `docs/solid-validator-core.md`
- optional `scripts/solid-validator-core-tests.ts`

Phase 116I should not add repository reading, syntax-tree parsing, automatic import detection, refactors, runtime wiring, provider calls, dashboard calls, or process launch behavior.

## Return Path

After Phase 116I, the next formal roadmap target should be:

Phase 117B - FRONTEND RESPONSIBILITY RULES PLAN
