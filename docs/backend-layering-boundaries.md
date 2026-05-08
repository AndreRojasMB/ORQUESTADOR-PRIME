# Backend Layering Boundaries

Phase: 118B - BACKEND LAYERING RULES PLAN

Status: planning / audit / scope

## Boundary Statement

Backend Layering Rules are planned as architecture metadata only. They are meant
to help reviewers reason about backend responsibilities and IO boundaries using
caller-supplied evidence.

They are not backend runtime code, provider integration, persistence logic, or
source rewrite tooling.

## Allowed Planning Surface

Phase 118B may define:

- backend layer categories,
- IO boundary rule metadata,
- backend layering finding metadata,
- severity and risk posture,
- PM escalation metadata,
- Autopilot context metadata,
- future Phase 118I implementation scope.

## Denied Planning Surface

Phase 118B and the future 118I MVP must not introduce:

- backend or runtime state changes,
- provider calls,
- database or SQL state changes,
- filesystem scans,
- runtime scanners,
- source-tree parsing,
- repository reading,
- automatic import detection,
- source rewrites,
- refactor execution,
- OpenClaw activity,
- WhatsApp outbound activity,
- n8n activity,
- dashboard mutation,
- memory persistence,
- source-control behavior from source,
- process launch,
- env or network access,
- release rollout.

## Layer Boundaries

### Controller and API Boundary

Controller/API metadata may describe request entry points, validation
expectations, response responsibility, and authentication review concerns.
It must not call services, providers, adapters, or databases.

### Service and Application Boundary

Service/application metadata may describe orchestration ownership and use-case
coordination. It must not imply direct provider calls, database state changes,
or runtime side effects.

### Domain and Core Boundary

Domain/core metadata should stay free of infrastructure, provider, dashboard,
runtime, and configuration concerns. Domain findings should point toward
contracts, not concrete adapters.

### Repository Boundary

Repository metadata may describe persistence contracts and evidence needs. It
must not execute database clients, write schemas, change migrations, or alter
SQL artifacts.

### Adapter Boundary

Adapter metadata may describe where concrete IO translation belongs. It should
remain outside source-only review domains unless represented as caller-supplied
metadata.

### Provider Boundary

Provider metadata may describe risk and abstraction posture. It must not call
real providers or use live connector behavior.

### Config Boundary

Configuration metadata may describe ownership and review needs. It must not
read environment variables, write config, or change secrets.

### IO and Runtime Boundary

IO/runtime metadata may describe future-gated behavior. It must not execute
runtime paths, launch processes, or open network or persistence channels.

### Integration Boundary

Integration metadata may identify external-system risk. It must not connect to
real systems or mutate integration state.

### Database and SQL Boundary

Database/SQL metadata may describe persistence responsibility and safety risk.
It must not change schemas, migrations, seed data, queries, or stored records.

### Auth and Security Boundary

Auth/security metadata may describe approval, access, and risk concerns. It
must not create credentials, change policies, or approve itself.

## PM and Autopilot Boundary

Backend findings may be passed as context to PM and Autopilot reports. They
must not start handoff, validation, next-action coordination, closeout,
approval, memory writes, commits, pushes, runtime execution, or provider calls.

## Stop Conditions

Any future backend rule work should stop and require human review if it would:

- touch real backend modules outside the approved source-only metadata files,
- call providers,
- change database or SQL state,
- inspect source trees automatically,
- execute refactors,
- alter dashboard behavior,
- touch secrets,
- modify package scripts,
- change runtime wiring.
