---
name: Security Rules
alwaysApply: true
description: Secure-by-default review rules applied to all work.
---

# Security Rules

- Never hardcode secrets, tokens, credentials, or private keys.
- Prefer environment variables and documented secret injection paths.
- Review authentication, authorization, and trust boundaries for any sensitive change.
- Treat file uploads, admin actions, payments, external callbacks, and public input as high-risk surfaces.
- Validate and sanitize untrusted input.
- Minimize privilege and scope for new integrations.
- Flag insecure defaults, missing checks, and dangerous assumptions explicitly.
- If a dependency or config change has security implications, state them clearly.
- Review JWT expiry, refresh token rotation, and session invalidation.
- Apply OWASP Top 10 as baseline checklist for any auth-related change.
- For OAuth/webhook integrations, verify signature validation and 
  replay protection.