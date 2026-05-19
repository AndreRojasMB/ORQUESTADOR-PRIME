# Mobile Analytics / Crash Reporting Boundaries

Phase: 138B - MOBILE ANALYTICS / CRASH REPORTING STRATEGY PLAN

Status: source-only / advisory / metadata-only boundaries

## Boundary Statement

Mobile Analytics / Crash Reporting Strategy must remain a planning layer. It
may describe analytics goals, event candidates, funnel candidates, metric
posture, crash/error reporting posture, consent, redaction, retention, release
monitoring, and alerting readiness. It must not configure any provider, SDK,
runtime listener, native config, dashboard, database/schema asset, workflow,
mobile project, or external system.

## Allowed In 138B

- Create docs that describe the future strategy model.
- Define future event, funnel, metric, and crash reporting metadata fields.
- Define source-only safety boundaries.
- Explain integration with mobile factory, UX, navigation, state, offline,
  security, performance, testing, release, push notification, PM, SOLID, and
  Autopilot metadata.
- Run typecheck and grep verification.

## Not Allowed In 138B

- analytics SDK setup
- crash SDK setup
- event tracking implementation
- data collection
- user identity tracking
- provider execution
- credential material access
- network or API calls
- app generation
- Expo/EAS commands
- package changes
- native config changes
- dashboard mutation
- database or schema mutation
- CI activation
- memory persistence
- source-control automation from source

## Future 138I Boundaries

The implementation phase may add TypeScript metadata models and pure helpers
under `src/pm`. Those helpers should return caller-supplied or static metadata
only. They must not:

- import provider clients
- read environment values
- write config files
- inspect app folders
- create event emitters
- collect device state
- send reports
- create dashboards
- mutate persistence
- execute mobile tooling

## Privacy Boundary

The future strategy must assume analytics and crash metadata can become
privacy-sensitive. Required posture:

- consent is explicit before future tracking
- sensitive fields are blocked by default
- user identity is abstract until approved
- redaction rules are required before release monitoring
- retention policy is described before any implementation
- human approval is required for high-risk categories

## Release Monitoring Boundary

Release monitoring posture may describe future signals, version awareness, and
alerting readiness. It must not create provider alerts, dashboards, native
release hooks, or runtime reporting behavior.

## Autopilot Boundary

Autopilot may receive analytics/crash strategy as handoff context only. It must
not execute Codex, call providers, mutate dashboards, persist memory, create
apps, modify packages, or perform source-control behavior from PM metadata.

## Stop Conditions

Stop and require a new approved implementation phase if the request asks for:

- real analytics setup
- real crash setup
- provider selection or account wiring
- runtime event collection
- user identity collection
- release alert configuration
- mobile app generation
- Expo/EAS execution
- package or workflow edits
- credential material handling
- dashboard, database, schema, or provider mutation
