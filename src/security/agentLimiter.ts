// src/security/agentLimiter.ts
// Enforces per-agent token budgets and logs all agent activations.

import { logger } from "../observability/logger.js";

export interface AgentBudget {
  maxTokens: number;
  used: number;
}

const DEFAULT_MAX_TOKENS = 8192;

export class AgentLimiter {
  private readonly budgets = new Map<string, AgentBudget>();
  private readonly defaultBudget: number;

  constructor(defaultBudget = DEFAULT_MAX_TOKENS) {
    this.defaultBudget = defaultBudget;
  }

  private getOrCreate(agent: string): AgentBudget {
    let budget = this.budgets.get(agent);
    if (!budget) {
      budget = { maxTokens: this.defaultBudget, used: 0 };
      this.budgets.set(agent, budget);
    }
    return budget;
  }

  /** Check if the agent can spend the given number of tokens. */
  canSpend(agent: string, tokens: number): boolean {
    const budget = this.getOrCreate(agent);
    return budget.used + tokens <= budget.maxTokens;
  }

  /** Record token usage for an agent. */
  spend(agent: string, tokens: number): void {
    const budget = this.getOrCreate(agent);
    budget.used += tokens;

    if (budget.used > budget.maxTokens) {
      logger.warn(`Agent "${agent}" exceeded token budget`, {
        used: budget.used,
        max: budget.maxTokens,
      });
    }
  }

  /** Log an agent activation with timestamp and task. */
  logActivation(agent: string, task: string): void {
    logger.info(`Agent activated: ${agent}`, {
      agent,
      task: task.slice(0, 100),
      timestamp: new Date().toISOString(),
    });
  }

  /** Return a summary of all budgets. */
  getSummary(): Record<string, AgentBudget> {
    const summary: Record<string, AgentBudget> = {};
    for (const [agent, budget] of this.budgets) {
      summary[agent] = { ...budget };
    }
    return summary;
  }
}
