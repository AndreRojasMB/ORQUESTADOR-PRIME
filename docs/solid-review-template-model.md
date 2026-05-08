# SOLID Review Template Model

Phase: 115B - SOLID REVIEW CHECKLIST PLAN

Status: template model plan / docs-only

## Purpose

This document defines the planned metadata model for future SOLID review
checklist items, review findings, suggestions, and templates.

Templates should give reviewers a repeatable structure for source-only
architecture review. They should not read files, run validators, or apply
changes.

## Checklist Item Fields

A future `SolidReviewChecklistItem` should include:

- `itemId`
- `title`
- `principleRefs`
- `smellCategoryRefs`
- `boundaryPolicyRefs`
- `dependencyPolicyRefs`
- `severityHint`
- `question`
- `expectedEvidence`
- `failureSignal`
- `suggestedAction`
- `riskLevel`
- `approvalRequired`
- `pmEscalation`
- `autopilotUse`
- `metadataOnly`
- `reportOnly`
- `advisoryOnly`
- `sourceOnly`
- `noRefactorExecution`
- `noScannerExecution`
- `noRuntimeExecution`

## Checklist Item Examples

Recommended item themes:

- Does this module have a single reason to change?
- Can this behavior be extended without changing core?
- Can a replacement satisfy the same contract safely?
- Is this interface small enough for its caller?
- Does the dependency point toward an abstraction?
- Is the target layer allowed by module boundary rules?
- Is the dependency policy allowed, review-required, forbidden, or
  future-gated?
- Does the design match known architecture smell categories?
- Does the automation posture stay within advisory boundaries?
- Is evidence safe, metadata-only, and non-secret?

## Review Finding Fields

A future `ReviewFinding` should include:

- `findingId`
- `checklistItemId`
- `findingType`
- `severity`
- `sourceModule`
- `affectedLayer`
- `description`
- `evidenceRefs`
- `relatedSolidFindingRefs`
- `relatedBoundaryFindingRefs`
- `relatedDependencyFindingRefs`
- `relatedSmellFindingRefs`
- `suggestedAction`
- `riskLevel`
- `approvalRequired`
- `pmEscalation`
- `autopilotUse`
- `metadataOnly`
- `reportOnly`
- `advisoryOnly`
- `sourceOnly`
- `noRefactorExecution`
- `noScannerExecution`
- `noRuntimeExecution`

## Finding Types

Recommended `findingType` values:

- `principle_gap`
- `boundary_gap`
- `dependency_direction_gap`
- `smell_detected`
- `evidence_gap`
- `safety_boundary_gap`
- `future_gate_required`
- `human_review_required`

Finding types describe review outcomes. They do not trigger actions.

## Suggestion Model

Future `SolidReviewSuggestion` metadata should include:

- `suggestionId`
- `title`
- `safeSummary`
- `suggestedPhase`
- `riskLevel`
- `requiresHumanApproval`
- `relatedChecklistItemIds`
- `metadataOnly`
- `advisoryOnly`
- `noExecution`
- `noRefactorExecution`
- `noScannerExecution`

Suggestions should remain safe next-step metadata.

## Review Template Fields

A future `ReviewTemplate` should include:

- `templateId`
- `title`
- `targetScope`
- `checklistItemIds`
- `requiredEvidence`
- `outputSections`
- `safetyBoundaries`
- `recommendedNextAction`
- `reportOnly`
- `metadataOnly`
- `advisoryOnly`
- `sourceOnly`

## Template Scopes

Recommended `targetScope` values:

- `pm_source_only_module`
- `architecture_metadata_module`
- `autopilot_metadata_module`
- `live_adjacent_boundary`
- `future_runtime_gate`
- `phase_closeout_architecture_review`

## Template Output Sections

Recommended output sections:

- review summary,
- checklist coverage,
- findings by severity,
- SOLID principle gaps,
- module boundary concerns,
- Dependency Inversion concerns,
- architecture smells,
- evidence gaps,
- safety boundary notes,
- suggested next action,
- human review requirements.

## Severity Strategy

Future checklist severity should align with prior layers:

- SOLID finding severity,
- module boundary severity,
- Dependency Inversion severity,
- architecture smell severity,
- PM risk tier,
- approval requirement metadata.

The future implementation should let caller-provided high-risk metadata raise
severity. It should not lower critical safety signals without human review.

## Validation Strategy For 115I

Future source-only validation should check:

- checklist item ids are present, trimmed, unique, and bounded,
- finding ids are present, trimmed, unique, and bounded,
- principle refs are known,
- smell category refs are known,
- boundary policy refs are known,
- dependency policy refs are known,
- severity values are known,
- source modules are metadata-only,
- evidence refs are metadata-only,
- suggested actions do not execute,
- PM escalation is metadata-only,
- Autopilot use is context-only,
- live-adjacent imports are absent from architecture source.

## Non-Goals

The template model does not:

- inspect files,
- parse imports automatically,
- parse syntax trees,
- rewrite imports,
- move modules,
- execute refactors,
- call providers,
- mutate dashboards,
- operate OpenClaw,
- send messages,
- run n8n,
- persist memory,
- create approvals,
- dispatch jobs,
- change packages,
- change workflows,
- deploy.
