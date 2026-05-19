# Store Readiness Boundaries

Phase: 139B - STORE READINESS / APP METADATA PLAN

Status: source-only / advisory / metadata-only boundaries

## Boundary Statement

Store Readiness / App Metadata must remain a planning layer. It may describe
future listing metadata, privacy labels, rating posture, support/contact
posture, release notes, screenshot posture, preview media posture, brand asset
posture, compliance notes, and readiness gates. It must not interact with store
systems, produce assets, produce screenshots, publish apps, configure accounts,
or execute release tooling.

## Allowed In 139B

- Create docs that describe the future store readiness metadata model.
- Define future listing, privacy/rating, and readiness checklist fields.
- Define source-only safety boundaries.
- Explain integration with release, security, analytics/crash, testing,
  performance, push notification, PM, SOLID, and Autopilot metadata.
- Run typecheck and grep verification.

## Not Allowed In 139B

- store submission
- store console interaction
- screenshot production
- preview media production
- icon or brand asset production
- credential material access
- app generation
- Expo/EAS commands
- package changes
- provider execution
- database or schema mutation
- dashboard mutation
- secrets/env/network access
- CI activation
- memory persistence
- source-control automation from source

## Future 139I Boundaries

The implementation phase may add TypeScript metadata models and pure helpers
under `src/pm`. Those helpers should return caller-supplied or static metadata
only. They must not:

- read environment values
- import store provider clients
- inspect app folders
- write listing files
- produce screenshots
- produce preview media
- produce icons or brand assets
- submit metadata
- mutate dashboards
- mutate database/schema assets
- execute mobile tooling

## Privacy Boundary

Store readiness metadata can expose product, audience, privacy, and compliance
claims. Required posture:

- privacy labels must be advisory until legal/privacy review
- analytics and crash disclosure must match the analytics/crash strategy
- permission disclosure must match security and push notification posture
- sensitive data categories must be explicit before release review
- age/content rating must require human review when safety or monetization
  signals exist

## Asset Boundary

Screenshot, preview media, icon, and brand posture may describe future asset
needs only. It must not write files, render UI, produce media, modify asset
folders, or claim publication readiness.

## Autopilot Boundary

Autopilot may receive store readiness metadata as handoff context only. It must
not execute Codex, call providers, mutate dashboards, persist memory, create
apps, produce assets, publish metadata, modify packages, or perform
source-control behavior from PM metadata.

## Stop Conditions

Stop and require a new approved implementation phase if the request asks for:

- real store account interaction
- real listing metadata publication
- screenshot or preview media production
- icon or brand asset production
- credential material handling
- mobile app generation
- Expo/EAS execution
- package or workflow edits
- dashboard, database, schema, or provider mutation
- release publication or external side effects
