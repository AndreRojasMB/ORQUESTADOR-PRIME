# App Idea Intake Interview Plan

Phase: 131B - APP IDEA INTAKE INTERVIEW PLAN

Status: planning / audit / scope only

## Purpose

This plan defines App Idea Intake Interview as a future source-only,
advisory, metadata-only layer for ORQUESTADOR-PRIME / Viernes. The layer will
capture a simple mobile app idea, ask structured clarification questions, and
normalize answers into planning metadata that can feed the Mobile App Factory
and the 121-130 mobile advisory stack.

Phase 131B does not add source code, does not implement live conversation
automation, does not run agents, does not invoke Codex, does not generate apps,
does not run Expo/EAS actions, does not create native folders, does not change
packages, does not activate workflows or CI, and does not call providers,
mutate dashboards, touch DB/SQL, read secrets, persist memory, or perform
source-control automation from source.

## Review Scope

The planning scope covers:

- Mobile App Factory Strategy from Phase 121I.
- RN/Expo Architecture Profile from Phase 122I.
- Mobile UX/UI Pattern Catalog from Phase 123I.
- Mobile Navigation Flow Model from Phase 124I.
- Mobile State Management Strategy from Phase 125I.
- Offline / Cache / Sync Strategy from Phase 126I.
- Mobile Security Baseline from Phase 127I.
- Mobile Performance Checklist from Phase 128I.
- Mobile Testing Strategy from Phase 129I.
- Mobile Release / EAS Strategy from Phase 130I.
- Autopilot dry-run and hardening context.

## App Idea Intake Scope

The future intake interview should collect and normalize:

- simple idea capture,
- target users,
- problem statement,
- app type hypothesis,
- core flows,
- must-have features,
- nice-to-have features,
- platform priority,
- auth needs,
- offline needs,
- monetization needs,
- safety/privacy needs,
- release ambition,
- uncertainty and unknowns,
- follow-up questions.

The intake is not a live chat engine. It is a metadata planning contract that a
future conversational layer may use after a separate approved phase.

## Intake Interview Model

Future metadata should define:

- `interviewId`
- `ideaText`
- `appTypeHypothesis`
- `targetUsers`
- `problemStatement`
- `desiredOutcome`
- `coreFlows`
- `featureCandidates`
- `constraints`
- `assumptions`
- `unansweredQuestions`
- `confidence`
- `riskLevel`
- `requiredApprovals`
- `nextRecommendedArtifact`

The model should consume caller-supplied text and answer metadata only. It
must not contact users, run agents, call messaging systems, generate apps, or
persist memory.

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

## Expected 131I Output

Phase 131I should implement a typed metadata layer that can:

- describe intake interview questions,
- classify required and optional questions,
- normalize supplied answers,
- identify unanswered questions,
- produce an app type hypothesis,
- map intake output toward Mobile App Factory metadata,
- provide PM, SOLID, and Autopilot handoff context.

## Non-Goals

Phase 131I must not:

- implement live conversation automation,
- contact users,
- use WhatsApp outbound behavior,
- invoke Codex,
- use OpenClaw,
- generate apps,
- create native folders,
- run Expo/EAS actions,
- modify package files,
- activate workflows or CI,
- call providers,
- mutate dashboard state,
- touch DB/SQL,
- read secrets or environment values,
- persist memory,
- perform source-control automation from source.

## Future Implementation Split

Phase 131I - APP IDEA INTAKE INTERVIEW IMPLEMENTATION:

- create `src/pm/appIdeaIntakeInterview.ts`,
- update `src/pm/index.ts` exports if needed,
- add `docs/app-idea-intake-interview.md`,
- optionally add `scripts/app-idea-intake-interview-tests.ts` as a source-only
  smoke script that validates metadata helpers without conversation or agent
  execution.

Phase 132B - MOBILE REQUIREMENTS INTERVIEW PLAN:

- plan a deeper requirements interview that expands normalized intake into
  requirements, acceptance criteria, risks, and implementation-ready planning
  metadata.

## Exit Criteria

Phase 131B is complete when:

- only docs in the app idea intake scope are modified,
- no source implementation is added,
- typecheck still passes through the existing repo command path,
- forbidden grep is clean or safety-wording false positives are documented,
- no files are staged,
- no commit or push is made.
