# Mobile Security Boundaries

Phase: 127B - MOBILE SECURITY BASELINE PLAN

Status: safety boundary plan only

## Boundary Summary

Mobile Security Baseline is source-only, advisory-only, and metadata-only. It
describes future security posture and review obligations for mobile apps. It
must not implement real auth, storage, cryptographic controls, network/API behavior,
permission prompts, native config, credential handling, app generation, CI, or
runtime execution.

## Allowed In 127B

Allowed work:

- create docs that define future security metadata,
- inspect existing PM and mobile architecture metadata,
- preserve advisory-first architecture,
- run typecheck and diff checks,
- document future implementation scope.

## Denied In 127B

Denied work:

- auth implementation,
- storage implementation,
- cryptographic control implementation,
- runtime auth artifact handling,
- network/API calls,
- permission prompts,
- native config changes,
- credential reads or writes,
- provider execution,
- DB or SQL mutation,
- app generation,
- Expo/EAS commands,
- package changes,
- workflow changes,
- CI activation,
- memory persistence,
- source-control automation from source.

## Future 127I Source Boundaries

If Phase 127I creates source, it must remain pure metadata. Helpers may:

- create metadata objects,
- summarize metadata,
- select checklist items by category,
- select risks by category,
- recommend approval posture,
- generate advisory summary strings.

Helpers must not:

- read or write files,
- read environment variables,
- call providers,
- call network/API endpoints,
- configure platform storage,
- handle credentials,
- mutate dashboard state,
- mutate DB/SQL,
- run mobile commands,
- run CI,
- persist memory,
- invoke source-control commands.

## Security Technology Mentions

Any mention of storage, auth, network/API, release signing, payment, analytics,
logging, or third-party SDK technology must be:

- advisory,
- future-gated,
- non-executing,
- non-configuring,
- evidence-oriented,
- approval-gated for implementation.

The baseline may say a flow needs secure storage review, auth/session review,
network/API review, logging redaction review, or platform policy review. It
must not provide runtime code or platform configuration.

## Secrets And Credentials

The phase must not read, create, infer, rotate, store, print, validate, or
transform credentials. Any credential requirement becomes a future approval
item and evidence request.

## Release And Store Boundary

Release signing, store submission, and production rollout are future-gated
review categories only. Phase 127B and future 127I must not create builds,
submit apps, configure native projects, or modify release workflows.

## Autopilot Boundary

Autopilot may receive security baseline metadata as handoff context or dry-run
scenario input. It must not turn security findings into automatic execution,
provider calls, memory writes, dashboard updates, app generation, commits, or
pushes from source modules.

## Human Review Boundary

Human review is required before future phases implement:

- auth/session behavior,
- credential handling,
- storage of sensitive data,
- payment or premium entitlement flows,
- provider integrations,
- release signing,
- third-party SDKs,
- abuse/safety enforcement behavior,
- production deployment.
