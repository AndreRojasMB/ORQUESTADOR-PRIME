// src/chat/chatMode.ts
// Interactive conversational loop for configuring the orchestrator.
// Uses @inquirer/prompts for menu-driven interaction.

import { select, checkbox, input, confirm } from "@inquirer/prompts";
import { agentRegistry, type AgentName } from "../agents/registry.js";
import { readUserConfig, writeUserConfig } from "../config/userConfigStore.js";
import { interpretConfigCommand } from "./configInterpreter.js";
import type { UserConfig } from "../config/userConfig.js";
import type { ProviderName } from "../providers/types.js";
import type { OrchestratorMode } from "../types.js";

const CONFIGURABLE_MODES: OrchestratorMode[] = [
  "plan", "route", "blueprint", "audit", "scaffold", "execute",
];

export async function runChat(): Promise<void> {
  console.log("\n\u{1F527} ORQUESTADOR-PRIME \u2014 Configuration\n");

  let running = true;
  while (running) {
    const action = await select({
      message: "What would you like to configure?",
      choices: [
        { name: "Enable/disable agents",     value: "agents"    },
        { name: "Set provider per mode",     value: "providers" },
        { name: "Define routing rules",      value: "routing"   },
        { name: "Set n8n webhook triggers",  value: "n8n"       },
        { name: "Natural language config",   value: "nl"        },
        { name: "View current config",       value: "view"      },
        { name: "Exit",                      value: "exit"      },
      ],
    });

    switch (action) {
      case "agents":
        await configureAgents();
        break;
      case "providers":
        await configureProviders();
        break;
      case "routing":
        await configureRouting();
        break;
      case "n8n":
        await configureN8n();
        break;
      case "nl":
        await naturalLanguageConfig();
        break;
      case "view":
        await viewConfig();
        break;
      case "exit":
        running = false;
        break;
    }
  }

  console.log("\nConfiguration saved. Goodbye!\n");
}

// ─── Agent toggling ────────────────────────────────────────────────

async function configureAgents(): Promise<void> {
  const config = await readUserConfig();
  const allNames = Object.keys(agentRegistry) as AgentName[];

  const enabled = await checkbox({
    message: "Select agents to ENABLE (unchecked = disabled):",
    choices: allNames.map((name) => ({
      name: `${name} \u2014 ${agentRegistry[name].meta.description}`,
      value: name,
      checked: !config.agents.disabled.includes(name),
    })),
  });

  config.agents.disabled = allNames.filter((n) => !enabled.includes(n));
  await writeUserConfig(config);
  console.log(`\u2705 ${enabled.length} agents enabled, ${config.agents.disabled.length} disabled.\n`);
}

// ─── Provider per mode ─────────────────────────────────────────────

async function configureProviders(): Promise<void> {
  const config = await readUserConfig();

  const mode = await select({
    message: "Which mode?",
    choices: CONFIGURABLE_MODES.map((m) => ({ name: m, value: m })),
  });

  const provider = await select({
    message: `Provider for "${mode}" mode:`,
    choices: [
      { name: "openai",   value: "openai"   },
      { name: "anthropic", value: "anthropic" },
      { name: "openclaw",  value: "openclaw"  },
      { name: "(default \u2014 remove override)", value: "__remove__" },
    ],
  });

  if (provider === "__remove__") {
    delete config.providers[mode];
  } else {
    config.providers[mode] = provider as ProviderName;
  }

  await writeUserConfig(config);
  console.log(`\u2705 Provider for "${mode}" set to ${provider === "__remove__" ? "default" : provider}.\n`);
}

// ─── Routing rules ─────────────────────────────────────────────────

async function configureRouting(): Promise<void> {
  const config = await readUserConfig();

  const addMore = await confirm({
    message: `You have ${config.routing.rules.length} custom rules. Add a new one?`,
    default: true,
  });

  if (!addMore) return;

  const keywords = await input({
    message: "Keywords (comma-separated):",
    validate: (v) => v.trim().length > 0 || "At least one keyword required",
  });

  const allNames = Object.keys(agentRegistry) as AgentName[];
  const agents = await checkbox({
    message: "Route to which agents?",
    choices: allNames.map((name) => ({ name, value: name })),
  });

  if (agents.length === 0) {
    console.log("\u26A0\uFE0F  No agents selected \u2014 rule not added.\n");
    return;
  }

  config.routing.rules.push({
    keywords: keywords.split(",").map((k) => k.trim().toLowerCase()),
    agents,
  });

  await writeUserConfig(config);
  console.log(`\u2705 Routing rule added: [${keywords}] \u2192 [${agents.join(", ")}]\n`);
}

// ─── n8n webhook triggers ──────────────────────────────────────────

async function configureN8n(): Promise<void> {
  const config = await readUserConfig();

  const mode = await select({
    message: "Trigger n8n webhook on which mode?",
    choices: CONFIGURABLE_MODES.map((m) => ({ name: m, value: m })),
  });

  const webhookPath = await input({
    message: `Webhook path for "${mode}" (e.g. "orquestador-plan"):`,
    default: config.n8n.triggers[mode] ?? "",
  });

  if (webhookPath.trim() === "") {
    delete config.n8n.triggers[mode];
    console.log(`\u2705 n8n trigger removed for "${mode}".\n`);
  } else {
    config.n8n.triggers[mode] = webhookPath.trim();
    console.log(`\u2705 n8n trigger for "${mode}" set to "${webhookPath.trim()}".\n`);
  }

  await writeUserConfig(config);
}

// ─── Natural language config ───────────────────────────────────────

async function naturalLanguageConfig(): Promise<void> {
  const command = await input({
    message: "Describe what you want to configure:",
  });

  if (!command.trim()) return;

  const config = await readUserConfig();
  const updated = await interpretConfigCommand(command, config);

  if (updated) {
    await writeUserConfig(updated);
    console.log("\u2705 Configuration updated.\n");
  } else {
    console.log("\u26A0\uFE0F  Could not interpret command. Try the menu options instead.\n");
  }
}

// ─── View current config ───────────────────────────────────────────

async function viewConfig(): Promise<void> {
  const config = await readUserConfig();
  console.log("\nCurrent configuration:");
  console.log(JSON.stringify(config, null, 2));
  console.log();
}
