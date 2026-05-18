# App Idea Intake Boundaries

Phase: 131B - APP IDEA INTAKE INTERVIEW PLAN

Status: planning / safety boundaries only

## Boundary Summary

App Idea Intake Interview is source-only, advisory-only, and metadata-only. It
may model an interview, questions, answers, clarification rules, and output
mapping, but it must never become a live chat system or autonomous build
trigger in this phase.

## Allowed Planning Outputs

The intake layer may define:

- interview metadata,
- question metadata,
- answer metadata,
- clarification rules,
- app type hypotheses,
- required and optional question posture,
- uncertainty and confidence posture,
- output mapping toward Mobile App Factory,
- risks, approvals, and limitations.

## Denied Actions

The intake layer must not:

- implement live conversation automation,
- contact users,
- perform outbound messaging,
- use WhatsApp outbound behavior,
- use OpenClaw,
- invoke Codex,
- generate apps,
- generate screens,
- create native folders,
- run Expo/EAS actions,
- change package files,
- modify workflow or CI files,
- activate CI,
- call providers,
- call network endpoints,
- mutate dashboards,
- touch DB/SQL,
- read secrets or environment values,
- persist memory,
- perform source-control automation from source.

## Source Boundary

Phase 131I source, if added, should be pure TypeScript metadata helpers only.
Helpers should accept caller-supplied idea text, question metadata, and answer
metadata, then return structured planning objects. They must not read files,
scan repositories, parse ASTs, discover imports, execute commands, call APIs,
write artifacts, or persist memory.

## Conversation Boundary

Questions and answers are metadata records only. A future conversational
surface may render those records after a separate approved phase. Phase 131I
must not create a chat runtime, agent loop, transport adapter, prompt runner,
or outbound channel integration.

## Mobile Factory Boundary

The intake output may map to Mobile App Factory fields such as app idea, target
users, app type, core flows, screen map seed, platform priority, auth/offline
needs, monetization needs, safety needs, and release target. It must not create
factory strategies automatically or trigger downstream app generation.

## Autopilot Boundary

Autopilot may carry intake metadata as handoff and dry-run context only. It
must not invoke Codex, run tools, persist memory, call providers, mutate
dashboards, or perform source-control actions from source modules.

## Approval Boundary

Human review is required before future work involving:

- sensitive data,
- auth/session implementation,
- payments or premium access,
- child/minor or health-adjacent use cases,
- safety/report/block workflows,
- release claims,
- external providers,
- any real execution surface.
