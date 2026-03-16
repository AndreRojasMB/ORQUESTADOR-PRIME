---
name: Database Rules
globs: ["**/*.sql", "**/prisma/**", "**/migrations/**", "**/schema.*", "**/*seed*.*"]
description: Relational and NoSQL data-change safety rules.
---

# Database Rules

- Prefer additive, rollback-friendly schema changes.
- Do not perform destructive migrations without an explicit approval gate.
- For relational changes, note indexes, constraints, backfills, and rollback considerations.
- For NoSQL changes, explain access-pattern impact and denormalization trade-offs.
- Keep application changes and migration steps sequenced clearly.
- Mention data integrity and performance implications of schema changes.
- If seed or fixture data changes are needed, call that out separately.