# AI Orchestrator Prime

Production-grade multi-agent AI orchestration system built with **TypeScript** and the **OpenAI Agents SDK**.

This repository implements a modular AI engineering architecture capable of delegating complex software design and implementation tasks across specialized agents.

---

# Architecture Overview

![System Architecture](docs/architecture/orchestrator-architecture.png)

The system is built around a **central orchestrator agent** that coordinates multiple specialist agents.

Core capabilities include:

* architecture planning
* API design
* frontend and backend system design
* database modeling
* security analysis
* DevOps planning
* UX/UI architecture
* AI/ML pipeline design
* integration architecture

---

# System Layers

## Orchestrator

Central coordination layer:

```
src/orchestrator/orchestrator.ts
```

Responsibilities:

* analyze tasks
* route work to specialists
* synthesize final output
* manage delegation

---

## Specialist Agents

Located in:

```
src/agents
```

Agents included:

Core agents

* Architect
* Backend
* Frontend
* QA

Data agents

* Relational DB
* NoSQL

Platform agents

* Security
* DevOps

Design & Experience

* UX/UI
* Motion FX

Architecture & Integration

* API Designer
* Integration & Interop

AI Engineering

* AI/ML Agent

---

# Prompts

Located in:

```
src/prompts
```

Includes:

* planning prompt
* routing prompt

---

# Guardrails

Located in:

```
.continue/rules
```

Rules enforce engineering standards for:

* frontend
* backend
* security
* database
* DevOps
* integration
* UX
* motion
* AI/ML

---

# MCP Tooling

Located in:

```
.continue/mcpServers
```

Includes integrations for:

* Context7
* Playwright
* GitHub
* filesystem
* design tools

---

# Installation

Clone the repository

```
git clone https://github.com/AndreRojasMB/ORQUESTADOR-PRIME.git
```

Install dependencies

```
npm install
```

---

# Environment Variables

Create a `.env` file.

Example:

```
OPENAI_API_KEY=your_key_here

OPENAI_MODEL=gpt-5.4
PLANNER_MODEL=gpt-5.4
SPECIALIST_MODEL=gpt-5.4
SYNTHESIS_MODEL=gpt-5.4
```

---

# Usage

Run planning mode

```
npm run plan -- "design architecture for a multi-tenant SaaS platform"
```

Run routing mode

```
npm run route -- "who should design API versioning?"
```

Run development orchestration

```
npm run dev -- "design a production-ready backend architecture"
```

---

# Project Structure

```
src
 ├ agents
 │   architect.ts
 │   backend.ts
 │   frontend.ts
 │   qa.ts
 │   db.ts
 │   security.ts
 │   devops.ts
 │   apiDesigner.ts
 │   integration.ts
 │   uxui.ts
 │   motionFx.ts
 │   aiml.ts
 │
 ├ orchestrator
 │   orchestrator.ts
 │
 ├ prompts
 │   planning.ts
 │   routing.ts
 │
 ├ tools
 │   config.ts
 │
 └ index.ts
```

---

# Development Philosophy

This project follows several architectural principles:

* modular agent architecture
* separation of orchestration and specialization
* explicit architectural reasoning before implementation
* guardrails enforced through rule files
* scalable multi-agent delegation

---

# Roadmap

Future improvements may include:

* automatic PR generation agents
* repository auto-editing workflows
* integration with CI pipelines
* model evaluation framework
* memory systems for agents
* telemetry and agent tracing

---

# License

MIT
