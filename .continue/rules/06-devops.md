---
name: DevOps Rules
globs: [".github/**", "**/Dockerfile*", "**/docker-compose*", "**/*.yml", "**/*.yaml", "**/Makefile", "**/package.json","**/Makefile", "scripts/**"]
description: Build, CI, environment, and release workflow rules.
---

# DevOps Rules

- Prefer minimal automation first; do not over-engineer CI/CD for an unstable repo.
- Separate build, test, and deploy concerns cleanly.
- Keep environment-specific values out of committed source files.
- Avoid publishing or deployment changes without an explicit human approval gate.
- When adding scripts, keep names obvious and scoped to one responsibility.
- Call out required secrets, environment variables, and permissions for new workflows.
- Prefer safe defaults, dry runs, and rollback visibility.