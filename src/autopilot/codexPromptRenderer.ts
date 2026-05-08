import { autopilotSourceOnlyBoundaries } from "./riskBoundaries.js";
import type { CodexHandoffContract } from "./codexHandoff.js";
import type { AutopilotBoundarySet } from "./types.js";

export interface CodexPromptRenderResult {
  handoffId: string;
  phase: string;
  promptMarkdown: string;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noCodexInvocation: true;
  noExecution: true;
  boundaries: AutopilotBoundarySet;
}

const bulletList = (items: readonly string[]): string =>
  items.length > 0 ? items.map((item) => `- ${item}`).join("\n") : "- none";

const commandList = (commands: readonly string[]): string =>
  commands.length > 0 ? commands.map((command) => `- \`${command}\``).join("\n") : "- none";

export function renderCodexPromptFromHandoff(
  handoff: CodexHandoffContract,
): CodexPromptRenderResult {
  const promptMarkdown = [
    "Act as a senior safe integration agent for ORQUESTADOR-PRIME / Viernes.",
    "",
    "Project path:",
    handoff.projectPath,
    "",
    "Branch:",
    handoff.branch,
    "",
    "Task:",
    handoff.phase,
    "",
    "Mode:",
    handoff.mode,
    "",
    "Previous phase context:",
    handoff.previousPhaseContext,
    "",
    "Allowed files:",
    bulletList(handoff.allowedFiles),
    "",
    "Forbidden files:",
    bulletList(handoff.forbiddenFiles),
    "",
    "Verification plan:",
    commandList(handoff.verificationPlan.commands),
    "",
    "Smoke plan:",
    bulletList(handoff.smokePlan.checks),
    "",
    "Scope check:",
    commandList([
      handoff.scopeCheck.gitStatusCommand,
      handoff.scopeCheck.gitDiffCommand,
      handoff.scopeCheck.stagedFilesCommand,
    ]),
    "",
    "Expected changed files:",
    bulletList(handoff.scopeCheck.expectedChangedFiles),
    "",
    "Forbidden changed files:",
    bulletList(handoff.scopeCheck.forbiddenChangedFiles),
    "",
    "Forbidden grep:",
    bulletList(handoff.forbiddenGrep.patterns),
    "",
    "Forbidden grep paths:",
    bulletList(handoff.forbiddenGrep.paths),
    "",
    "Final report format:",
    bulletList(handoff.finalReportFormat.requiredSections),
    "",
    "Safety boundaries:",
    "- Do not execute Codex from this contract.",
    "- Do not call providers or external systems.",
    "- Do not send WhatsApp messages.",
    "- Do not run desktop or browser automation.",
    "- Do not mutate dashboard, memory, stores, database, deployment, package scripts, or workflows.",
    "- Do not read secrets or credentials.",
    "- Keep human approval before any implementation or execution-capable step.",
  ].join("\n");

  return {
    handoffId: handoff.handoffId,
    phase: handoff.phase,
    promptMarkdown,
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
    noCodexInvocation: true,
    noExecution: true,
    boundaries: autopilotSourceOnlyBoundaries,
  };
}
