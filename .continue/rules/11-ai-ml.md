---
name: AI/ML Engineering Rules
globs: ["**/ml/**", "**/models/**", "**/embeddings/**", "**/pipelines/**", "**/*.py"]
description: Rules for ML pipelines, embeddings, RAG, and AI integrations.
---

# AI/ML Engineering Rules

- Never hardcode model names or versions in business logic; use configuration.
- Document context window limits, token costs, and latency expectations for every model call.
- Separate prompt templates from application code and treat them as versioned assets.
- RAG pipelines must define chunking strategy, embedding model, and retrieval threshold explicitly.
- Log model inputs and outputs only for debugging with proper redaction; never log sensitive user data.
- Prefer graceful degradation when AI calls fail; never let a model failure crash a user-facing flow.
- Evaluate model changes with a defined benchmark before deploying.