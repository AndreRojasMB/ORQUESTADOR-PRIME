---
name: Backend Rules
globs: ["src/server/**/*.ts", "src/api/**/*.ts", "src/services/**/*.ts", 
        "src/controllers/**/*.ts", "src/repositories/**/*.ts"]
description: API, service, domain, and backend safety rules.
---

# Backend Rules

- Keep controller, service, repository, and domain responsibilities separated.
- Validate external input at boundaries.
- Prefer explicit error handling over silent failures.
- Keep business logic out of route handlers when it grows beyond trivial behavior.
- Do not weaken auth or authorization checks for convenience.
- Preserve backward compatibility for existing contracts unless the task explicitly changes them.
- Call out side effects, transactional concerns, and rollback needs.
- Prefer additive changes over risky rewrites when stabilizing an existing repo.