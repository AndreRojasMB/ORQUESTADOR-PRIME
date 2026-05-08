# Mobile App Factory Boundaries

Phase: 121B - MOBILE APP FACTORY STRATEGY PLAN

Status: planning / boundary definition / docs-only

## Boundary Statement

The Mobile App Factory is a future advisory layer for professional mobile app
planning. It can describe product strategy, screen maps, navigation, React
Native or Expo architecture recommendations, quality expectations, and release
readiness metadata.

It is not an app generator, native project creator, store submission tool,
payment processor, notification service, backend deployer, or runtime executor.

## Allowed Planning Surface

Phase 121B may document:

- app idea intake,
- requirement clarification,
- app type classification,
- mobile product brief structure,
- screen map and navigation planning,
- architecture recommendation criteria,
- UX/UI guidance,
- security baseline,
- data and offline posture,
- testing strategy,
- release readiness strategy,
- monetization and premium strategy as advisory metadata,
- PM/SOLID/Autopilot integration as context only.

## Denied Surface

Phase 121B and future 121I must not introduce:

- app generation,
- native project creation,
- mobile template creation,
- mobile build commands,
- store submission behavior,
- credential use,
- payment processing,
- provider execution,
- push notification setup,
- production backend setup,
- database or SQL state changes,
- runtime execution,
- process launch from source,
- dashboard mutation,
- OpenClaw operation,
- WhatsApp outbound behavior,
- n8n execution,
- CI activation,
- package script changes,
- memory persistence,
- source-control behavior from source.

## Product Boundary

The factory may recommend:

- target audience,
- value proposition,
- monetization posture,
- retention loops,
- premium feature grouping,
- launch sequencing,
- support model,
- privacy posture.

It must not create accounts, process payments, submit store metadata, create
subscriptions, or claim market validation.

## Architecture Boundary

The factory may recommend:

- React Native and Expo suitability,
- navigation style,
- state ownership,
- data adapter boundaries,
- offline strategy,
- auth posture,
- analytics posture,
- testing posture,
- release readiness posture.

It must not create source files, install dependencies, run tooling, generate
native folders, call providers, or modify package manifests.

## Security Boundary

The factory may describe:

- auth needs,
- session posture,
- privacy needs,
- data sensitivity,
- device permission concerns,
- abuse and trust risks,
- human approval requirements.

It must not read credentials, create secrets, configure stores, access
production systems, or connect to external services.

## PM/SOLID Boundary

Mobile strategy may feed PM and SOLID metadata:

- PM reports,
- project state,
- task graph,
- DoD criteria,
- risks and blockers,
- SOLID review,
- Autopilot context,
- phase closeout.

This metadata must not trigger implementation, generation, execution, handoff,
validation, memory persistence, approval execution, commit, or push.

## Stop Conditions

A future implementation phase should stop and request human review if the work
requires:

- app project creation,
- native code generation,
- mobile tooling commands,
- external service setup,
- payment or credential handling,
- store submission,
- production backend behavior,
- database changes,
- dashboard changes,
- CI changes,
- package manifest changes,
- runtime execution.
