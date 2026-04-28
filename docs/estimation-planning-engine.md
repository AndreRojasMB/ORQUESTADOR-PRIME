# Estimation Planning Engine

Phase: 72I
Status: source-only advisory helper

## Purpose

The Estimation Planning Engine turns Enterprise Software Factory source context
into bounded planning artifacts for human review.

It can use business system family metadata, optional requirements interview
plans, optional module blueprints, and explicit planning assumptions. It does
not create commercial quotations, delivery commitments, generated systems,
scaffolds, database schemas, runtime jobs, provider calls, actions, proposals,
or store records.

## Inputs

`PlanningInput`

- `familyId`: required Business Systems Catalog family id.
- `interviewPlan`: optional source-only requirements interview plan.
- `moduleBlueprints`: optional advisory module blueprints.
- `constraints`: optional assumption-based planning constraints.
- `assumptions`: optional reviewer-supplied assumptions.
- `exclusions`: optional reviewer-supplied non-goals.
- `preferredRollout`: optional rollout preference.

Inputs are source data only. They are not sessions, persisted records, provider
output, contracts, or implementation instructions.

## Outputs

`PlanningEngineResult`

- roadmap phases
- backlog items
- epics
- user stories
- relative effort bands
- risk matrix
- dependency matrix
- delivery plan
- MVP vs enterprise rollout plan
- assumptions
- exclusions
- confidence
- advisory safety boundaries

Outputs are JSON-safe planning data. They are not generated files, database
schemas, action plans for execution, or commercial proposals.

## Planning Artifacts

Roadmaps describe reviewable delivery phases such as discovery, MVP planning,
and enterprise rollout planning.

Backlog items, epics, and user stories are generated from catalog and blueprint
metadata using conservative business language. They must remain review drafts.

Risk and dependency matrices summarize missing requirements, catalog-derived
scope risk, integration review needs, sequencing, and rollout decision points.

Delivery plans use assumption-based ranges and review gates. They must not
state exact delivery dates, guaranteed launches, or production readiness.

## Assumptions And Confidence

Confidence is conservative:

- `low`: catalog-only planning or missing requirements.
- `medium`: interview or module blueprint context exists.
- `high`: reserved for future reviewed, bounded, answer-rich planning context.

The first implementation avoids high confidence by default because the current
interview engine does not persist reviewed stakeholder answers.

Assumptions and exclusions are first-class output fields. They must be reviewed
before any later implementation, scaffold, pricing, or delivery phase.

## Effort Bands

Effort uses relative bands only:

- `xs`
- `s`
- `m`
- `l`
- `xl`
- `unknown`

The engine must not emit exact hours, exact prices, exact costs, or commercial
quotations unless a later phase explicitly approves a commercial proposal lane
with assumption labeling.

## MVP Vs Enterprise Rollout

The rollout plan separates:

- MVP scope,
- enterprise scope,
- deferred scope,
- decision points.

This is sequencing guidance only. It does not scaffold applications, generate
systems, create deployment plans for execution, or commit to dates.

## Validation Rules

The validator checks:

- valid known `familyId`,
- required result fields,
- non-empty roadmap and backlog for known families,
- assumptions and exclusions are present,
- confidence is present,
- advisory-only flag is true,
- all safety boundaries are true,
- bounded text and arrays,
- no exact price or cost claims without hypothetical assumption wording,
- no guaranteed delivery dates,
- no production-ready or JARVIS-complete claims,
- no compliance or security certification guarantees,
- no provider output, network behavior, action execution, scaffold output,
  store mutation, database schema snippets, or code snippets.

Findings use reason codes and safe messages.

## Safety Boundaries

The planning engine is data-only and advisory.

It must not:

- call providers,
- use network,
- write files,
- mutate stores,
- dispatch actions,
- create or approve proposals,
- scaffold applications,
- create database schemas,
- generate enterprise systems,
- perform runtime execution,
- emit exact prices or delivery commitments,
- claim production readiness,
- claim compliance or security certification.

## Explicit Non-Goals

Phase 72I does not add:

- CLI commands,
- package scripts,
- artifact output,
- dashboard UI,
- persistence,
- commercial quotation logic,
- project contract generation,
- calendar scheduling,
- runtime execution,
- scaffold generation.

## Relationship To Other Factory Lanes

The Business Systems Catalog provides family metadata.

The Module Blueprint Generator provides advisory module scope.

The Requirements Interview Engine provides question plans and missing-answer
signals.

The Estimation Planning Engine combines those advisory inputs into bounded
planning artifacts for review. It does not make any of those lanes executable.

Language Profiles can later contribute advisory tooling assumptions, static
check hints, review heuristics, and risk notes. They remain source-only and do
not inspect files, execute commands, install dependencies, or modify projects.

Framework Profiles can later contribute framework/platform assumptions,
architecture risks, packaging notes, and review heuristics. They remain
source-only and do not scan files, run commands, install dependencies, scaffold
systems, or guarantee deployment outcomes.

## Future Phases

Possible future work:

1. Add answer-summary input after explicit in-memory answer modeling exists.
2. Add richer family-specific planning heuristics.
3. Add optional CLI inspection after source helpers are stable.
4. Plan commercial proposal support as a separate advisory lane.
5. Defer scaffold and runtime integration until explicit approval gates exist.
