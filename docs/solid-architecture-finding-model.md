# SOLID Architecture Finding Model

Phase: 111B - SOLID ARCHITECTURE CHARTER PLAN

Status: finding model plan / docs-only

## Purpose

This document defines the planned metadata shape for future SOLID architecture
findings.

SOLID findings should help reviewers describe architecture quality concerns
and safe next steps. They must remain metadata only and must not trigger
refactors automatically.

## Planned Finding Fields

A future SOLID finding should include:

- `findingId`
- `principle`
- `severity`
- `moduleRef`
- `description`
- `evidenceRefs`
- `suggestedAction`
- `riskLevel`
- `approvalRequired`
- `autopilotUse`
- `pmEscalation`
- `metadataOnly`
- `advisoryOnly`
- `sourceOnly`
- `noRefactorExecution`

## Principle Vocabulary

Recommended principle values:

- `srp`
- `ocp`
- `lsp`
- `isp`
- `dip`

These values should be architecture review categories only.

## Severity Vocabulary

Recommended severity values:

- `info`
- `warn`
- `fail`
- `critical`

Severity describes review attention. It does not execute or enforce a change.

## Module Reference

`moduleRef` should be a safe metadata reference to a module or architecture
surface. It should avoid absolute local paths and should not require source
modules to read files.

Recommended fields:

- `moduleRefId`
- `label`
- `safeSummary`
- `layer`
- `riskSurfaces`
- `metadataOnly`
- `noFileRead`

## Evidence References

Evidence references should reuse the PM metadata posture:

- metadata only,
- no file read,
- safe summary,
- no raw secrets,
- no raw logs,
- no provider output,
- no dashboard dump.

Evidence references may point to docs, source module names, review notes, or
roadmap references as metadata.

## Suggested Action

Suggested actions should describe future work without applying it.

Recommended fields:

- `actionId`
- `label`
- `safeSummary`
- `recommendedPhase`
- `requiresHumanApproval`
- `riskLevel`
- `noExecution`

Examples:

- split a module responsibility in a future implementation phase,
- add an adapter contract in a future design phase,
- narrow a public interface in a future review phase,
- reverse a dependency direction in a future refactor plan.

## PM Escalation

`pmEscalation` should describe how the finding may feed PM Core:

- PM Status Report section,
- risk entry,
- blocker entry,
- next-best-action recommendation,
- phase closeout note.

The escalation is a metadata relationship. It does not mutate PM state or
invoke any PM builder.

## Autopilot Use

`autopilotUse` should describe whether a future Autopilot handoff may include
the finding as context.

Possible values:

- `not_applicable`
- `handoff_context_only`
- `validation_context_only`
- `closeout_context_only`

These values are descriptive. They do not start handoff, validation, closeout,
or memory persistence.

## Validation Strategy For 111I

Future source model validation should check:

- finding ids are present, trimmed, unique, and bounded,
- principles are known,
- severities are known,
- module references are metadata only,
- evidence references are metadata only,
- suggested actions are non-executing,
- approval requirements are metadata only,
- PM escalation does not mutate PM state,
- Autopilot use remains context only,
- live-adjacent imports are absent.

## Planned Outputs

Future 111I should define source-only objects such as:

- `SolidPrinciple`
- `SolidFindingSeverity`
- `SolidModuleRef`
- `SolidEvidenceRef`
- `SolidSuggestedAction`
- `SolidPmEscalation`
- `SolidAutopilotUse`
- `SolidArchitectureFinding`
- `SolidArchitectureCharter`
- `SolidArchitectureBoundarySet`

All outputs should include advisory/source-only posture flags.

## Non-Goals

The finding model does not:

- execute refactors,
- inspect files,
- scan source trees,
- call providers,
- mutate dashboards,
- operate OpenClaw,
- send messages,
- run n8n,
- persist findings,
- create approvals,
- dispatch jobs,
- change packages,
- change workflows,
- deploy.
