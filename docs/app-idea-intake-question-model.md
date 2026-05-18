# App Idea Intake Question Model

Phase: 131B - APP IDEA INTAKE INTERVIEW PLAN

Status: planning model only

## Purpose

The App Idea Intake Question Model defines future metadata for structured
questions that clarify a mobile app idea. Questions help convert a rough idea
into normalized planning input without creating a live chat system, invoking
agents, or generating apps.

## Question Metadata

Future `AppIdeaIntakeQuestion` metadata should include:

- `questionId`
- `category`
- `questionText`
- `required`
- `answerType`
- `mapsToField`
- `followUpTriggers`
- `riskIfUnknown`
- `examples`
- `clarificationPriority`

## Question Categories

Recommended categories:

- `problem`
- `users`
- `app_type`
- `core_flows`
- `features`
- `platform`
- `auth`
- `data`
- `offline`
- `monetization`
- `safety_privacy`
- `release`
- `constraints`
- `unknowns`

## Required Questions

Required questions should capture:

- what problem the app solves,
- who the target users are,
- what outcome the user wants,
- the primary flow,
- must-have features,
- platform priority,
- data sensitivity,
- auth or account needs,
- monetization expectations,
- safety/privacy concerns,
- release ambition.

Required questions may still remain unanswered. Unanswered required questions
should increase risk, lower confidence, and create follow-up recommendations.

## Optional Questions

Optional questions may capture:

- nice-to-have features,
- design preferences,
- future integrations,
- analytics posture,
- notification posture,
- release timing,
- internal versus public audience,
- competitive examples,
- constraints and assumptions.

Optional answers enrich downstream planning but should not block advisory
output unless they reveal risk.

## Answer Types

Recommended answer type labels:

- `free_text`
- `single_choice`
- `multi_choice`
- `yes_no`
- `ranked_list`
- `risk_flag`
- `unknown_allowed`

Answer type labels are metadata only. They do not render UI controls or start
conversation flows.

## Follow-Up Triggers

Follow-up triggers should describe conditions such as:

- answer is missing,
- answer is too vague,
- answer conflicts with another answer,
- answer implies sensitive data,
- answer implies auth/session behavior,
- answer implies offline write behavior,
- answer implies monetization or payments,
- answer implies safety/report/block workflows,
- answer implies public release claims.

Triggers create metadata recommendations only. They do not launch a follow-up
conversation.

## Clarification Priority

Recommended priority labels:

- `required_before_factory`
- `required_before_architecture`
- `required_before_security`
- `required_before_release`
- `optional_for_mvp`
- `optional_for_later`

## Safety Boundaries

The question model must remain:

- source-only,
- advisory-only,
- metadata-only,
- no live chat automation,
- no outbound messaging,
- no WhatsApp outbound behavior,
- no OpenClaw operation,
- no Codex invocation,
- no app generation,
- no Expo/EAS execution,
- no native project creation,
- no package changes,
- no provider calls,
- no runtime execution,
- no dashboard mutation,
- no DB/SQL,
- no secrets/env/network,
- no memory persistence,
- no source-control automation from source.
