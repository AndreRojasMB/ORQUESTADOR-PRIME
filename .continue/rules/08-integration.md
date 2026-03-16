---
name: Integration & Interop Rules
globs: ["**/integrations/**", "**/webhooks/**", "**/adapters/**", "**/sdk/**", "**/oauth/**"]
description: Rules for third-party integrations, adapters, and interop layers.
---

# Integration & Interop Rules

- Use adapter or anti-corruption layer patterns; never call third-party SDKs directly from business logic.
- Document every external dependency: auth method, rate limits, failure modes, and versioning.
- Validate and sanitize all data received from external sources at the boundary.
- Prefer webhook signature verification for all inbound callbacks.
- Version integrations explicitly; breaking changes require a migration path.
- Use feature flags when rolling out new integrations to production.
- Never store third-party tokens in application state or logs.
- Test integrations against sandbox or mock endpoints, not production.