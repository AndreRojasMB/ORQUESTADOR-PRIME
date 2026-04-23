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
import { buildExecutionPrompt } from "../prompts/execution.js";
import { writeScaffold } from "../scaffold/scaffoldWriter.js";
import { writeProposal } from "../execution/proposalWriter.js";
import { requestApproval } from "../execution/approvalGate.js";
import { createPullRequest, buildPRBody } from "../execution/githubClient.js";
import { parseOutput } from "../output/parser.js";
import type { ScaffoldOutput, ExecutionOutput } from "../output/schemas.js";
import { callProvider } from "../providers/providerRouter.js";
import { Tracer, printTrace } from "../observability/tracer.js";
import { logger } from "../observability/logger.js";
import {
  MODELS,
  CLAUDE_MODELS,
  isClaudeAvailable,
  isGitHubAvailable,
  isLightRAGAvailable,
} from "../config.js";
import { buildRAGContext } from "../lightrag/lightragContext.js";
import { allAgents } from "../agents/registry.js";
import { registrySummary } from "../agents/selector.js";
import {
  appendMemoryEntry,
  getMemoryPath,
  readMemoryStore,
} from "../memory/memoryStore.js";
import { readUserConfig } from "../config/userConfigStore.js";
import { AgentLimiter } from "../security/agentLimiter.js";
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
        value === "plan" ||
        value === "route" ||
        value === "blueprint" ||
        value === "audit" ||
        value === "scaffold" ||
        value === "memory" ||
        value === "init" ||
        value === "execute" ||
        value === "chat"
      ) {
        mode = value;
        continue;
      }
      logger.warn(`Unknown mode "${value}", defaulting to "plan"`);
      continue;
    }
    if (arg.startsWith("--repo=")) continue;
    if (arg.startsWith("--out=")) continue;
    taskParts.push(arg);
  }

  return { mode, task: taskParts.join(" ").trim() };
}

const openaiOrchestrator = new Agent({
  name: "Project Orchestrator",
  model: MODELS.synthesis,
  instructions: ORCHESTRATOR_SYSTEM,
  handoffs: allAgents,
});

export async function runOrchestrator(
  task: string,
  mode: OrchestratorMode
): Promise<OrchestratorResult> {
  const tracer = new Tracer(mode, task);
  logger.section(`ORQUESTADOR-PRIME · ${mode.toUpperCase()}`);
  logger.info(`Task: ${task}`);

  // User config — merge overrides (non-fatal)
  const userConfig = await readUserConfig();
  const disabledAgents = new Set(userConfig.agents.disabled);
  if (disabledAgents.size > 0) {
    logger.debug(`Disabled agents: ${[...disabledAgents].join(", ")}`);
  }

  // Security: agent token budget limiter
  const limiter = new AgentLimiter();

  // Helper: filter disabled agents from router results
  const filterRouter = (r: import("../types.js").RouterResult) => {
    if (disabledAgents.size === 0) return r;
    return {
      ...r,
      selectedAgents: r.selectedAgents.filter((a) => !disabledAgents.has(a)),
    };
  };

  const memoryContext = await buildMemoryContext(task, [], mode);
  if (memoryContext.hasContext) {
    logger.debug(
      `Memory: ${memoryContext.recentRuns.length} recent, ${memoryContext.relatedRuns.length} related`
    );
  }

  // RAG context — optional, non-fatal
  let ragPrefix = "";
  const RAG_MODES: OrchestratorMode[] = ["plan", "blueprint", "audit"];
  if (isLightRAGAvailable() && RAG_MODES.includes(mode)) {
    const ragCtx = await tracer.phaseAsync("lightrag:query", async () =>
      buildRAGContext(task, mode)
    );
    if (ragCtx.hasContext) {
      ragPrefix = ragCtx.ragSnippets + "\n\n";
      logger.debug(`LightRAG: ${ragCtx.ragSnippets.length} chars injected`);
    }
  }

  let rawOutput = "";

  if (mode === "blueprint") {
    const { router: rawRouter, context } = await tracer.phaseAsync("router", async () =>
      buildBlueprintContext(task)
    );
    const router = filterRouter(rawRouter);
    tracer.setRouter(router.selectedAgents, router.matchedKeywords);
    logger.info(`Project type : ${context.projectType}`);
    logger.info(`Features     : ${context.detectedFeatures.join(", ") || "none"}`);
    logger.info(`Agents       : ${context.agentAssignments.map((a) => a.agent).join(", ")}`);

    const prompt = ragPrefix + buildBlueprintPrompt(task, router, context, memoryContext);

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
          inputTokens: response.usage.inputTokens,
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

  } else if (mode === "audit") {
    const repoArg = process.argv.find((a) => a.startsWith("--repo="));
    const repoPath = repoArg ? resolve(repoArg.split("=")[1] ?? ".") : resolve(".");

    logger.info(`Auditing repo: ${repoPath}`);
    const repo = await tracer.phaseAsync("repo:read", async () => readRepo(repoPath));
    logger.info(`Files found: ${repo.totalFiles} — read: ${repo.keyFiles.length}`);

    const router = filterRouter(await tracer.phaseAsync("router", async () =>
      routeTask("audit security architecture backend frontend devops", false)
    ));
    tracer.setRouter(router.selectedAgents, router.matchedKeywords);

    const auditCtx = buildAuditContext(repo);
    const prompt = ragPrefix + buildAuditPrompt(auditCtx, router);

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
          inputTokens: response.usage.inputTokens,
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

  } else if (mode === "scaffold") {
    const { router: rawScaffoldRouter, context } = await tracer.phaseAsync("router", async () =>
      buildBlueprintContext(task)
    );
    const router = filterRouter(rawScaffoldRouter);
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
          inputTokens: response.usage.inputTokens,
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
      const outArg = process.argv.find((a) => a.startsWith("--out="));
      const outputDir = outArg
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

  } else if (mode === "memory") {
    const store = await readMemoryStore();
    const recent = store.entries.slice(-10).reverse();

    rawOutput = JSON.stringify(
      {
        mode: "memory",
        total: store.entries.length,
        lastRun: store.lastRun ?? "never",
        recent,
      },
      null,
      2
    );

  } else if (mode === "execute") {
    const repoArg = process.argv.find((a) => a.startsWith("--repo="));
    const repoPath = repoArg
      ? resolve(repoArg.split("=")[1] ?? ".")
      : resolve(".");

    logger.info(`Repo: ${repoPath}`);

    const router = filterRouter(await tracer.phaseAsync("router", async () => routeTask(task)));
    tracer.setRouter(router.selectedAgents, router.matchedKeywords);

    const prompt = buildExecutionPrompt(task, router);

    if (isClaudeAvailable()) {
      logger.info(`Provider: Claude (${CLAUDE_MODELS.architect})`);

      try {
        const response = await tracer.phaseAsync("provider:claude", async () =>
          callProvider(CLAUDE_MODELS.architect, ORCHESTRATOR_SYSTEM, prompt, 8192)
        );

        rawOutput = response.content;
        tracer.setProvider({
          provider: "anthropic",
          model: CLAUDE_MODELS.architect,
          durationMs: 0,
          ...(response.usage && {
            inputTokens: response.usage.inputTokens,
            outputTokens: response.usage.outputTokens,
          }),
        });
      } catch (error) {
        logger.warn("Claude failed — falling back to OpenAI", { error });

        const response = await tracer.phaseAsync("provider:openai", async () =>
          callProvider(MODELS.synthesis, ORCHESTRATOR_SYSTEM, prompt, 8192)
        );

        rawOutput = response.content;
        tracer.setProvider({
          provider: "openai",
          model: MODELS.synthesis,
          durationMs: 0,
          ...(response.usage && {
            inputTokens: response.usage.inputTokens,
            outputTokens: response.usage.outputTokens,
          }),
        });
      }
    } else {
      logger.warn("Claude not configured — falling back to OpenAI direct call");

      const response = await tracer.phaseAsync("provider:openai", async () =>
        callProvider(MODELS.synthesis, ORCHESTRATOR_SYSTEM, prompt, 8192)
      );

      rawOutput = response.content;
      tracer.setProvider({
        provider: "openai",
        model: MODELS.synthesis,
        durationMs: 0,
        ...(response.usage && {
          inputTokens: response.usage.inputTokens,
          outputTokens: response.usage.outputTokens,
        }),
      });
    }

    const execParsed = await tracer.phaseAsync("execution:parse", async () =>
      parseOutput(rawOutput, "execute")
    );

    if (!execParsed.success) {
      logger.warn("Execution parse failed — aborting", {
        error: execParsed.error,
      });
    } else {
      const proposal = execParsed.data as ExecutionOutput;

      const decision = await requestApproval({
        branchName: `agent/${task.slice(0, 30).replace(/\s+/g, "-")}`,
        title: proposal.title,
        description: proposal.description,
        files: proposal.files.map(f => ({ ...f, content: f.content ?? "" })),
        risks: proposal.risks,
        rollbackPlan: proposal.rollbackPlan,
      });

      if (decision === "approve") {
        const taskSlug = task.slice(0, 30).replace(/\s+/g, "-");
        const commitMsg = `feat(agent): ${proposal.title}\n\nGenerated by ORQUESTADOR-PRIME`;

        const writeResult = await tracer.phaseAsync("execution:write", async () =>
          writeProposal(proposal.files.map(f => ({ ...f, content: f.content ?? "" })), repoPath, taskSlug, commitMsg)
        );

        logger.info(`Files written: ${writeResult.filesWritten.length}`);
        logger.info(`Branch: ${writeResult.branchName}`);

        if (isGitHubAvailable()) {
          const { GitClient } = await import("../execution/gitClient.js");
          const git = new GitClient(repoPath);
          await git.pushBranch(writeResult.branchName);

          const prBody = buildPRBody(
            task,
            writeResult.branchName,
            proposal.files,
            proposal.risks,
            proposal.rollbackPlan,
            "pending-trace"
          );

          const pr = await tracer.phaseAsync("execution:pr", async () =>
            createPullRequest({
              title: proposal.title,
              body: prBody,
              head: writeResult.branchName,
              base: "dev",
              draft: true,
            })
          );

          logger.info(`PR opened: ${pr.url}`);
        } else {
          logger.warn("GitHub not configured — branch created locally only");
        }
      } else if (decision === "reject") {
        logger.info("Execution rejected by user — no changes made");
      } else {
        logger.info("Review requested — branch NOT created yet");
        logger.info("Re-run with the same task when ready to approve");
      }
    }

  } else {
    const router = filterRouter(await tracer.phaseAsync("router", async () => routeTask(task)));
    tracer.setRouter(router.selectedAgents, router.matchedKeywords);
    logger.info(`Agents: ${router.selectedAgents.join(", ")}`);
    logger.info(`Provider: OpenAI (${MODELS.synthesis})`);

    const basePrompt =
      mode === "route"
        ? buildRoutingPrompt(task, router)
        : buildPlanningPrompt(task, router, memoryContext);
    const prompt = ragPrefix + basePrompt;

    const result = await tracer.phaseAsync("provider:openai", async () =>
      run(openaiOrchestrator, prompt)
    );

    rawOutput = result.finalOutput ?? "";
    tracer.setProvider({ provider: "openai", model: MODELS.synthesis, durationMs: 0 });
  }

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

  // Log agent activations and track token usage
  for (const agent of trace.selectedAgents) {
    limiter.logActivation(agent, task);
  }
  if (trace.provider?.inputTokens || trace.provider?.outputTokens) {
    const totalTokens = (trace.provider.inputTokens ?? 0) + (trace.provider.outputTokens ?? 0);
    limiter.spend(trace.provider.model, totalTokens);
  }
  const budgetSummary = limiter.getSummary();
  if (Object.keys(budgetSummary).length > 0) {
    logger.debug("Agent token budgets", budgetSummary);
  }

  const MEMORY_MODES: OrchestratorMode[] = [
    "plan",
    "route",
    "blueprint",
    "audit",
    "scaffold",
  ];

  if (MEMORY_MODES.includes(mode)) {
    const blueprintData =
      parsed.success && mode === "blueprint"
        ? (parsed.data as { projectOverview?: { type?: string; scope?: string } })
        : null;

    const memoryEntry: MemoryEntry = {
      id: trace.traceId,
      type: mode as MemoryEntryType,
      task,
      timestamp: new Date().toISOString(),
      agents: trace.selectedAgents,
      keywords: trace.matchedKeywords,
      traceId: trace.traceId,
      trace,
      ...(blueprintData?.projectOverview?.type && {
        projectType: blueprintData.projectOverview.type,
      }),
      ...(blueprintData?.projectOverview?.scope && {
        summary: blueprintData.projectOverview.scope,
      }),
      ...(parsed.success &&
        mode === "scaffold" && {
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
    ...(parsed.success && { structured: parsed.data }),
    ...(!parsed.success && { parseError: parsed.error }),
  };
}