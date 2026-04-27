# Project Workspace Manager Specification

Phase: 40A-40F
Status: specification only

This document defines the project-scoped workspace manager for
ORQUESTADOR-PRIME. It is docs-only and does not add runtime logic, dashboard
changes, source edits, provider calls, or automatic roadmap mutation.

## Goals

The workspace manager should hold durable project coordination state:

- roadmap phases,
- current milestones,
- decisions,
- project facts,
- file and context maps,
- known risks and blockers,
- links to trajectories, proposals, memory entries, jobs, and docs.

The store is local-first and project-scoped.

## Non-Goals

The workspace manager must not:

- mutate source files,
- change prompts,
- create branches,
- create PRs,
- dispatch actions,
- approve or reject proposals,
- grant second approval,
- write automatically from orchestrator output,
- expose cross-project state by default.

## Store

Recommended path:

- `~/.orquestador-prime/workspaces.json`

Recommended top-level shape:

- `version`
- `projects`
- `lastUpdatedAt`

Each project state should be keyed by `projectId` from supervisor project
identity.

## WorkspaceProject

Recommended fields:

- `projectId`
- `projectName`
- `projectRootHash`
- `createdAt`
- `updatedAt`
- `roadmap`
- `decisions`
- `facts`
- `contextMap`
- `risks`
- `links`
- `redaction`

No raw absolute path should be required. If file paths are stored, prefer repo
relative paths.

## Roadmap Tracker

Roadmap entries should represent phases and milestones.

Recommended fields:

- `phaseId`
- `title`
- `status`: `planned`, `active`, `blocked`, `done`, `deferred`, `dropped`
- `priority`
- `summary`
- `successCriteria`
- `blockers`
- `dependsOn`
- `links`
- `createdAt`
- `updatedAt`

Roadmap writes must be explicit CLI writes only in the first implementation.
No automatic roadmap mutation from supervisor or orchestrator.

## Decision Log

Decision records capture durable choices.

Recommended fields:

- `decisionId`
- `createdAt`
- `title`
- `context`
- `decision`
- `alternatives`
- `rationale`
- `consequences`
- `status`: `active`, `superseded`, `reversed`
- `links`
- `redaction`

Decision text must be redacted before storage.

## File and Context Map

The context map should help JARVIS know where things live without reading the
whole repository.

Recommended fields:

- `mapId`
- `generatedAt`
- `entries`
- `source`: `manual`, `scan`, `audit`, `supervisor`

Each entry:

- `path`
- `kind`
- `ownerArea`
- `summary`
- `tags`
- `riskLevel`
- `lastObservedAt`
- `links`

Initial scans should be read-only and bounded. File summaries should be
previews, not full file contents.

## Project Facts

Project facts are stable facts about the repo or workflow:

- branch policy,
- test commands,
- deployment constraints,
- known external services,
- safety rules,
- current roadmap block,
- owner preferences.

Facts should include confidence and source.

## Dashboard

Dashboard visibility should be read-only in a later phase:

- roadmap summary,
- active blockers,
- recent decisions,
- context map search,
- links to docs and reports.

No dashboard mutation UI should be added until CLI mutation and store safety are
verified.

## CLI Direction

Initial CLIs may include:

- `workspace:status`
- `workspace:roadmap:list`
- `workspace:decision:list`
- `workspace:context-map`

Mutation CLIs, if added, must be explicit:

- `workspace:roadmap:add`
- `workspace:decision:add`
- `workspace:fact:add`

No automatic writes.

## Verification

Future smoke should use isolated `HOME` and verify:

- project isolation,
- explicit write only,
- no source file mutation,
- no raw secret storage,
- missing/corrupt store returns empty defaults,
- dashboard remains read-only if touched.

