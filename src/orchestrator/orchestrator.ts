// src/orchestrator/orchestrator.ts
import { resolve } from "path";
import { Agent, run } from "@openai/agents";
import { readRepo } from "../audit/repoReader.js";
import { buildAuditContext } from "../audit/auditContext.js";
import { buildAuditPrompt } from "../prompts/audit.js";
import { routeTask, buildBlueprintContext } from "../router/agentRouter.js";
import { buildPlanningPrompt } from "../prompts/planning.js";
import { buildRoutingPrompt } from "../prompts/routing.js";
import { buildBlueprintPrompt } from "../prompts/blueprint.js";
import { buildScaffoldPrompt } from "../prompts/scaffold.js";
import { writeScaffold } from "../scaffold/scaffoldWriter.js";
import { parseOutput } from "../output/parser.js";
import type { ScaffoldOutput } from "../output/schemas.js";
import { callProvider } from "../providers/providerRouter.js";
import { Tracer, printTrace } from "../observability/tracer.js";
import { logger } from "../observability/logger.js";
import { MODELS, CLAUDE_MODELS, isClaudeAvailable } from "../config.js";
import { allAgents } from "../agents/registry.js";
import { registrySummary } from "../agents/selector.js";
import {
  appendMemoryEntry,
  getMemoryPath,
  readMemoryStore,        // ← agregado
} from "../memory/memoryStore.js";
import { buildMemoryContext } from "../memory/memoryContext.js";
import type {
  OrchestratorMode,
  ParsedArgs,
  OrchestratorResult,
  MemoryEntry,
  MemoryEntryType,
} from "../types.js";

export type { OrchestratorMode };

const ORCHESTRATOR_SYSTEM = `
You are the central AI orchestrator for a multi-agent engineering system.
Available specialist agents:
${registrySummary()}
Process:
1. Analyze the task
2. Delegate to the most appropriate specialists based on domain and tags
3. Consolidate the results
4. Always respond with valid JSON following the structure provided in the prompt.
`.trim();

export function parseArgs(argv: string[]): ParsedArgs {
  let mode: OrchestratorMode = "plan";
  const taskParts: string[] = [];

  for (const arg of argv) {
    if (arg.startsWith("--mode=")) {
      const value = arg.split("=")[1];
      if (
        value === "plan"      ||
        value === "route"     ||
        value === "blueprint" ||
        value === "audit"     ||
        value === "scaffold"  ||
        value === "memory"
      ) {
        mode = value;
        continue;
      }
      logger.warn(`Unknown mode "${value}", defaulting to "plan"`);
      continue;
    }
    if (arg.startsWith("--repo=")) continue;
    if (arg.startsWith("--out="))  continue;
    taskParts.push(arg);
  }

  return { mode, task: taskParts.join(" ").trim() };
}

// Agente OpenAI — solo para plan y route (multi-turn con handoffs)
const openaiOrchestrator = new Agent({
  name:         "Project Orchestrator",
  model:        MODELS.synthesis,
  instructions: ORCHESTRATOR_SYSTEM,
  handoffs:     allAgents,
});

export async function runOrchestrator(
  task: string,
  mode: OrchestratorMode
): Promise<OrchestratorResult> {
  const tracer = new Tracer(mode, task);
  logger.section(`ORQUESTADOR-PRIME · ${mode.toUpperCase()}`);
  logger.info(`Task: ${task}`);

  // Cargar contexto de memoria antes de cualquier modo
  const memoryContext = await buildMemoryContext(task, [], mode);
  if (memoryContext.hasContext) {
    logger.debug(
      `Memory: ${memoryContext.recentRuns.length} recent, ${memoryContext.relatedRuns.length} related`
    );
  }

  let rawOutput = "";

  // ─── BLUEPRINT ────────────────────────────────────────────────
  if (mode === "blueprint") {
    const { router, context } = await tracer.phaseAsync("router", async () =>
      buildBlueprintContext(task)
    );
    tracer.setRouter(router.selectedAgents, router.matchedKeywords);
    logger.info(`Project type : ${context.projectType}`);
    logger.info(`Features     : ${context.detectedFeatures.join(", ") || "none"}`);
    logger.info(`Agents       : ${context.agentAssignments.map((a) => a.agent).join(", ")}`);

    const prompt = buildBlueprintPrompt(task, router, context, memoryContext);

    if (isClaudeAvailable()) {
      logger.info(`Provider: Claude (${CLAUDE_MODELS.blueprint})`);
      const response = await tracer.phaseAsync("provider:claude", async () =>
        callProvider(CLAUDE_MODELS.blueprint, ORCHESTRATOR_SYSTEM, prompt)
      );
      rawOutput = response.content;
      tracer.setProvider({
        provider: "anthropic",
        model: CLAUDE_MODELS.blueprint,
        durationMs: 0,
        ...(response.usage && {
          inputTokens:  response.usage.inputTokens,
          outputTokens: response.usage.outputTokens,
        }),
      });
    } else {
      logger.warn("Claude not configured — falling back to OpenAI direct call");
      const response = await tracer.phaseAsync("provider:openai", async () =>
        callProvider(MODELS.synthesis, ORCHESTRATOR_SYSTEM, prompt, 8192)
      );
      rawOutput = response.content;
      tracer.setProvider({ provider: "openai", model: MODELS.synthesis, durationMs: 0 });
    }

  // ─── AUDIT ────────────────────────────────────────────────────
  } else if (mode === "audit") {
    const repoArg  = process.argv.find((a) => a.startsWith("--repo="));
    const repoPath = repoArg ? resolve(repoArg.split("=")[1] ?? ".") : resolve(".");

    logger.info(`Auditing repo: ${repoPath}`);
    const repo = await tracer.phaseAsync("repo:read", async () => readRepo(repoPath));
    logger.info(`Files found: ${repo.totalFiles} — read: ${repo.keyFiles.length}`);

    const router = await tracer.phaseAsync("router", async () =>
      routeTask("audit security architecture backend frontend devops", false)
    );
    tracer.setRouter(router.selectedAgents, router.matchedKeywords);

    const auditCtx = buildAuditContext(repo);
    const prompt   = buildAuditPrompt(auditCtx, router);

    if (isClaudeAvailable()) {
      logger.info(`Provider: Claude (${CLAUDE_MODELS.architect})`);
      const response = await tracer.phaseAsync("provider:claude", async () =>
        callProvider(CLAUDE_MODELS.architect, ORCHESTRATOR_SYSTEM, prompt, 8192)
      );
      rawOutput = response.content;
      tracer.setProvider({
        provider: "anthropic",
        model: CLAUDE_MODELS.architect,
        durationMs: 0,
        ...(response.usage && {
          inputTokens:  response.usage.inputTokens,
          outputTokens: response.usage.outputTokens,
        }),
      });
    } else {
      logger.warn("Claude not configured — falling back to OpenAI direct call");
      const response = await tracer.phaseAsync("provider:openai", async () =>
        callProvider(MODELS.synthesis, ORCHESTRATOR_SYSTEM, prompt, 8192)
      );
      rawOutput = response.content;
      tracer.setProvider({ provider: "openai", model: MODELS.synthesis, durationMs: 0 });
    }

  // ─── SCAFFOLD ─────────────────────────────────────────────────
  } else if (mode === "scaffold") {
    const { router, context } = await tracer.phaseAsync("router", async () =>
      buildBlueprintContext(task)
    );
    tracer.setRouter(router.selectedAgents, router.matchedKeywords);
    logger.info(`Project type : ${context.projectType}`);
    logger.info(`Features     : ${context.detectedFeatures.join(", ") || "none"}`);

    const prompt = buildScaffoldPrompt(task, router, context);

    if (isClaudeAvailable()) {
      logger.info(`Provider: Claude (${CLAUDE_MODELS.blueprint})`);
      const response = await tracer.phaseAsync("provider:claude", async () =>
        callProvider(CLAUDE_MODELS.blueprint, ORCHESTRATOR_SYSTEM, prompt, 8192)
      );
      rawOutput = response.content;
      tracer.setProvider({
        provider: "anthropic",
        model: CLAUDE_MODELS.blueprint,
        durationMs: 0,
        ...(response.usage && {
          inputTokens:  response.usage.inputTokens,
          outputTokens: response.usage.outputTokens,
        }),
      });
    } else {
      logger.warn("Claude not configured — falling back to OpenAI direct call");
      const response = await tracer.phaseAsync("provider:openai", async () =>
        callProvider(MODELS.synthesis, ORCHESTRATOR_SYSTEM, prompt, 8192)
      );
      rawOutput = response.content;
      tracer.setProvider({ provider: "openai", model: MODELS.synthesis, durationMs: 0 });
    }

    const scaffoldParsed = await tracer.phaseAsync("scaffold:parse", async () =>
      parseOutput(rawOutput, "scaffold")
    );

    if (scaffoldParsed.success) {
      const scaffoldData = scaffoldParsed.data as ScaffoldOutput;
      const outArg       = process.argv.find((a) => a.startsWith("--out="));
      const outputDir    = outArg
        ? resolve(outArg.split("=")[1] ?? "./scaffold-output")
        : resolve("./scaffold-output");

      const writeResult = await tracer.phaseAsync("scaffold:write", async () =>
        writeScaffold(scaffoldData.files, outputDir)
      );

      logger.info(`Scaffold written : ${writeResult.filesWritten.length} files`);
      logger.info(`Output dir       : ${writeResult.outputDir}`);

      if (writeResult.filesSkipped.length > 0) {
        logger.warn(`Skipped ${writeResult.filesSkipped.length} existing files`);
      }
    } else {
      logger.warn("Scaffold parse failed, skipping file generation", {
        error: scaffoldParsed.error,
      });
    }

  // ─── MEMORY ───────────────────────────────────────────────────
  } else if (mode === "memory") {
    const store  = await readMemoryStore();
    const recent = store.entries.slice(-10).reverse();

    rawOutput = JSON.stringify({
      mode:    "memory",
      total:   store.entries.length,
      lastRun: store.lastRun ?? "never",
      recent,
    }, null, 2);

  // ─── PLAN / ROUTE ─────────────────────────────────────────────
  } else {
    const router = await tracer.phaseAsync("router", async () => routeTask(task));
    tracer.setRouter(router.selectedAgents, router.matchedKeywords);
    logger.info(`Agents: ${router.selectedAgents.join(", ")}`);
    logger.info(`Provider: OpenAI (${MODELS.synthesis})`);

    const prompt =
      mode === "route"
        ? buildRoutingPrompt(task, router)
        : buildPlanningPrompt(task, router, memoryContext);

    const result = await tracer.phaseAsync("provider:openai", async () =>
      run(openaiOrchestrator, prompt)
    );

    rawOutput = result.finalOutput ?? "";
    tracer.setProvider({ provider: "openai", model: MODELS.synthesis, durationMs: 0 });
  }

  // ─── PARSE FINAL (todos los modos) ────────────────────────────
  const parsed = await tracer.phaseAsync("parse", async () =>
    parseOutput(rawOutput, mode)
  );

  if (!parsed.success) {
    logger.warn("Structured parse failed", { error: parsed.error });
  }

  const trace = tracer.finish(
    parsed.success,
    parsed.success ? undefined : parsed.error
  );
  printTrace(trace);

  // Escribir memoria — solo para modos que generan trabajo real
  const MEMORY_MODES: OrchestratorMode[] = [
    "plan", "route", "blueprint", "audit", "scaffold"
  ];

  if (MEMORY_MODES.includes(mode)) {
    const blueprintData = parsed.success && mode === "blueprint"
      ? (parsed.data as { projectOverview?: { type?: string; scope?: string } })
      : null;

    const memoryEntry: MemoryEntry = {
      id:        trace.traceId,
      type:      mode as MemoryEntryType,
      task,
      timestamp: new Date().toISOString(),
      agents:    trace.selectedAgents,
      keywords:  trace.matchedKeywords,
      traceId:   trace.traceId,
      ...(blueprintData?.projectOverview?.type && {
        projectType: blueprintData.projectOverview.type,
      }),
      ...(blueprintData?.projectOverview?.scope && {
        summary: blueprintData.projectOverview.scope,
      }),
      ...(parsed.success && mode === "scaffold" && {
        outputDir:
          process.argv.find((a) => a.startsWith("--out="))?.split("=")[1] ??
          "./scaffold-output",
      }),
    };

    await appendMemoryEntry(memoryEntry);
    logger.debug(`Memory saved → ${getMemoryPath()}`);
  }

  return {
    mode,
    task,
    finalOutput: rawOutput,
    trace,
    ...(parsed.success  && { structured: parsed.data  }),
    ...(!parsed.success && { parseError: parsed.error }),
  };
}