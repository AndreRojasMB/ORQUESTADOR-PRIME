import { deriveProjectIdentity } from "../supervisor/projectIdentity.js";
import { GOLDEN_TASKS } from "./goldenTasks.js";
import { runRouterTests } from "./routerTests.js";
import { runPromptShapeTests } from "./promptShapeTests.js";
import { runBudgetSuite } from "./budgetGuard.js";
import { analyzeCompressionPolicy } from "./compressionPolicy.js";
import { buildRegressionReport } from "./regressionReport.js";
import type {
  BudgetEvaluationInput,
  EvalCheckResult,
  EvalRunnerOptions,
  EvalStatus,
} from "./types.js";

function statusFromTask(taskId: string, statuses: EvalStatus[]): EvalStatus {
  if (statuses.includes("fail")) return "fail";
  if (statuses.includes("warn")) return "warn";
  return taskId.includes("security") || taskId.includes("devops") ? "warn" : "pass";
}

function buildGoldenTaskResults(routerResults: ReturnType<typeof runRouterTests>): EvalCheckResult[] {
  return GOLDEN_TASKS.map((task) => {
    const router = routerResults.find((item) => item.taskId === task.id);
    const statuses = router ? [router.status] : ["fail" as EvalStatus];
    const status = statusFromTask(task.id, statuses);
    const reasonCodes = [
      ...(router?.reasonCodes ?? ["golden.router_missing"]),
      ...(task.riskLevel === "high" ? ["golden.high_risk_review_recommended"] : []),
    ];

    return {
      id: `golden.${task.id}`,
      title: task.title,
      status,
      reasonCodes: status === "pass" ? [] : reasonCodes,
      details: [
        `Category: ${task.category}.`,
        `Required capabilities: ${task.requiredCapabilities.join(", ") || "none"}.`,
        `Forbidden actions: ${task.forbiddenActions.join(", ") || "none"}.`,
      ],
    };
  });
}

function budgetInputs(): BudgetEvaluationInput[] {
  const goldenText = GOLDEN_TASKS.map((task) => task.input).join("\n");
  const largePrompt = `${goldenText}\n${"offline context ".repeat(900)}`;

  return [
    {
      id: "budget.golden_tasks",
      mode: "evaluation",
      text: goldenText,
      contextItemCount: GOLDEN_TASKS.length,
      memoryItemCount: 0,
    },
    {
      id: "budget.large_context_warn",
      mode: "plan",
      text: largePrompt,
      contextItemCount: 24,
      memoryItemCount: 10,
    },
    {
      id: "budget.route_context_warn",
      mode: "route",
      text: "oversized route input ".repeat(250),
      contextItemCount: 24,
      memoryItemCount: 10,
    },
  ];
}

export async function runEvalSuite(options: EvalRunnerOptions = {}) {
  const project = deriveProjectIdentity();
  const routerResults = runRouterTests();
  const promptShapeResults = runPromptShapeTests();
  const goldenTaskResults = buildGoldenTaskResults(routerResults);
  const budgetResults = runBudgetSuite(budgetInputs());
  const compressionPolicyResults = [
    analyzeCompressionPolicy({
      promptId: "compression.normal_context",
      text: GOLDEN_TASKS[0]?.input ?? "offline evaluation",
      contextItemCount: 4,
      memoryItemCount: 2,
      auditSectionCount: 1,
      docsContextCount: 2,
    }),
    analyzeCompressionPolicy({
      promptId: "compression.large_context",
      text: "large offline prompt context ".repeat(1_400),
      contextItemCount: 28,
      memoryItemCount: 12,
      auditSectionCount: 5,
      docsContextCount: 8,
    }),
  ];

  return buildRegressionReport({
    project,
    goldenTaskResults,
    routerResults,
    promptShapeResults,
    budgetResults,
    compressionPolicyResults,
    ...(options.baselinePath ? { baselinePath: options.baselinePath } : {}),
  });
}

export function formatEvalReport(report: Awaited<ReturnType<typeof runEvalSuite>>, pretty = false): string {
  return `${JSON.stringify(report, null, pretty ? 2 : 0)}\n`;
}
