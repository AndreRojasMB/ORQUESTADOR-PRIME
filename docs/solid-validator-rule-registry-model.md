# Phase 116B - SOLID Validator Rule Registry Model

## Purpose

The SOLID rule registry defines metadata-only rules for the future validator core. It connects SOLID principles, review checklist items, smell categories, module boundary policies, and dependency policies into a single report-only validation layer.

The registry should remain declarative. It describes what supplied metadata means; it does not collect metadata from the repository.

## Rule Registry Entry

Future `SolidRuleRegistry` entries should include:

- `ruleId`: stable identifier.
- `title`: concise rule title.
- `principleRefs`: SOLID principles related to the rule.
- `checklistItemRefs`: review checklist items related to the rule.
- `smellCategoryRefs`: architecture smell categories related to the rule.
- `boundaryPolicyRefs`: module boundary policies related to the rule.
- `dependencyPolicyRefs`: dependency inversion policies related to the rule.
- `severityDefault`: default severity when the rule emits a finding.
- `evaluateInputKind`: supported metadata input kind.
- `requiredEvidence`: evidence expected before the rule can pass.
- `reportOnly`: true for Phase 116.
- `safetyBoundaries`: static safety notes attached to the rule.

## Supported Input Kinds

The registry should support metadata input kinds such as:

- `module_metadata`
- `dependency_metadata`
- `checklist_item_metadata`
- `boundary_finding_metadata`
- `dependency_finding_metadata`
- `smell_finding_metadata`
- `evidence_metadata`

These are caller-supplied inputs. They are not discovered by the validator.

## Validator Config Model

Future `SolidValidatorConfig` metadata should include:

- `configId`: stable config id.
- `enabledRuleIds`: rules enabled for the validation request.
- `severityOverrides`: optional caller-defined severity overrides.
- `requiredEvidencePolicy`: policy for missing evidence.
- `minimumStatusForBlock`: threshold that turns a report into blocked.
- `reportOnly`: must remain true.
- `safetyBoundaries`: global safety boundaries for the report.

## Finding Aggregation

The validator should aggregate findings by:

- Principle.
- Checklist item.
- Smell category.
- Module layer.
- Dependency policy.
- Boundary policy.
- Severity.
- Risk level.
- Approval requirement.

Aggregation must only use supplied findings and supplied evidence references.

## Status Derivation

The report status should be derived from supplied metadata:

- `passed`: no relevant findings and required evidence is present.
- `warning`: low or medium advisory findings exist.
- `failed`: high-severity findings exist without a safety block.
- `needs_review`: interpretation requires human review.
- `blocked`: supplied metadata indicates a critical safety or scope breach.
- `insufficient_evidence`: required evidence is missing.

## PM and Autopilot Metadata

Each report should be able to expose:

- PM escalation summary.
- Risk and blocker hints.
- Next-action hint.
- Closeout compatibility note.
- Autopilot advisory metadata.

This metadata is informational and must not trigger execution or approval.

## Non-Goals

The rule registry must not define:

- Filesystem scanning.
- Repository reading.
- Source-tree parsing.
- Automatic import detection.
- Runtime validators over real files.
- Refactor execution.
- Provider, dashboard, OpenClaw, WhatsApp, n8n, DB, deploy, git, memory, env, network, or process behavior.

## Future 116I Test Expectations

The future smoke test should validate:

- Rule registry metadata shape.
- Validator config metadata shape.
- Status derivation from supplied metadata.
- Severity aggregation.
- PM and Autopilot advisory metadata.
- No runtime or repository-reading assumptions.
