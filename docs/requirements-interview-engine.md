# Requirements Interview Engine

Phase: 71I
Status: source-only advisory helper

## Purpose

The Requirements Interview Engine creates structured question plans for the
Enterprise Software Factory before enterprise blueprints are enriched.

It helps identify missing requirements, assumptions, risks, and stakeholder
questions. It does not call providers, use network, create chats, create
sessions, persist interview records, mutate stores, dispatch actions, create
proposals, scaffold applications, create database schemas, or generate
enterprise systems.

## Current Status

The current engine is source-only:

- no CLI,
- no package script,
- no provider calls,
- no chat or session creation,
- no persistence,
- no store mutation,
- no artifact output,
- no dashboard UI,
- no runtime behavior.

It reads static factory metadata and returns bounded planning data for human
review.

## Stakeholder Modes

| Mode | Focus |
|---|---|
| CEO / business owner | Strategy, scope, success metrics, ownership, rollout priorities. |
| Operational user | Daily workflows, exceptions, handoffs, pain points. |
| Technical user | Systems, integrations, constraints, migration, deployment. |
| Auditor / compliance | Controls, traceability, retention, review gates. |
| Client / customer | External experience, service expectations, usability. |
| Project manager | Milestones, dependencies, risks, team constraints. |
| Finance / admin | Billing, reconciliation, approvals, reporting, migration. |
| Support / helpdesk | Incidents, user issues, escalation, support visibility. |

## Question Categories

The question bank covers:

- actors
- business rules
- processes
- exceptions
- entities
- permissions
- integrations
- reports
- compliance
- volume/performance
- SLA
- risks
- constraints
- data migration
- UX/workflows
- deployment

## Question Model

`InterviewQuestion`

- `questionId`
- `mode`
- `category`
- `text`
- `purpose`
- `expectedAnswerType`
- `required`
- `followUps`
- `mapsTo`
- `riskLevel`
- `tags`

Questions are generic and enterprise-aware. They should reveal requirements;
they should not assume requirements have already been answered.

## Interview Plan Model

`InterviewPlan`

- `interviewId`
- `schemaVersion`
- `createdAt`
- `familyId`
- `familyName`
- `stakeholderModes`
- `moduleIds`
- `questions`
- `missingAnswers`
- `extractedFacts`
- `assumptions`
- `risks`
- `confidence`
- `recommendedNextQuestions`
- `advisoryOnly`
- `boundaries`

Interview plans are drafts. `missingAnswers` lists required questions that still
need stakeholder responses. `confidence` remains low until real answers exist.

## Extraction Model

The first implementation only produces deterministic planning facts from
catalog and question metadata. It does not infer from user answers, provider
output, live systems, stores, external APIs, or local project files.

Future extraction may map reviewed answers to:

- domain entities,
- workflows,
- permissions,
- reports,
- integrations,
- business rules,
- data model hints,
- module blueprint inputs,
- estimation inputs.

That future work should remain advisory until separate implementation phases
approve any stronger behavior.

## Relationship To Business Systems Catalog

The interview planner validates `familyId` against the Business Systems Catalog
and uses catalog metadata to shape assumptions, risks, and recommended next
questions.

The catalog remains static metadata. The interview engine does not change it.

## Relationship To Module Blueprint Generator

Module IDs can be included as optional context. The planner uses them to add
targeted follow-up questions, but it does not assume module requirements are
complete.

The module blueprint generator remains source-only and advisory.

## Relationship To Future Estimation And Planning

A future estimation and roadmap lane may use completed interview summaries to
reason about scope, confidence, dependencies, and rollout phases.

The current engine does not estimate effort, create backlogs, or produce
delivery commitments.

## Safety Boundaries

The interview engine is data-only and advisory.

It must not:

- call providers,
- use network,
- create chats,
- create or persist sessions,
- mutate stores,
- dispatch actions,
- create proposals,
- scaffold applications,
- create database schemas,
- generate enterprise systems.

Compliance-related questions are checklist prompts only, not certification or
legal sufficiency claims.

## Future Phases

Recommended next work:

1. Add answer capture as explicit in-memory data only.
2. Add deterministic answer summarization and missing-answer scoring.
3. Plan estimation and roadmap helpers.
4. Add richer family-specific question templates after review.
5. Defer persistence, CLI, and scaffold planning until explicit approval gates
   exist.
