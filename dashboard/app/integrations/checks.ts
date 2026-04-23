"use server";

import { readConfig } from "@/lib/data";

export interface IntegrationStatus {
  id: string;
  name: string;
  description: string;
  configured: boolean;
}

export async function getIntegrationStatuses(): Promise<IntegrationStatus[]> {
  const config = await readConfig();

  return [
    {
      id: "openai",
      name: "OpenAI",
      description: "Primary LLM provider for agent orchestration.",
      configured: !!process.env.OPENAI_API_KEY,
    },
    {
      id: "anthropic",
      name: "Claude / Anthropic",
      description: "Secondary LLM provider for blueprint and audit modes.",
      configured: !!process.env.ANTHROPIC_API_KEY,
    },
    {
      id: "n8n",
      name: "n8n",
      description: "Workflow automation and webhook triggers.",
      configured: !!process.env.N8N_API_KEY,
    },
    {
      id: "lightrag",
      name: "LightRAG",
      description: "RAG over codebase for context-aware planning.",
      configured: !!process.env.LIGHTRAG_API_KEY,
    },
    {
      id: "coolify",
      name: "Coolify",
      description: "Self-hosted deployment and application management.",
      configured: !!process.env.COOLIFY_API_TOKEN,
    },
    {
      id: "openclaw",
      name: "OpenClaw",
      description: "Controlled execution substrate for agent actions.",
      configured: !!process.env.OPENCLAW_GATEWAY_TOKEN,
    },
    {
      id: "github",
      name: "GitHub",
      description: "Repository access, PRs, and code execution layer.",
      configured:
        !!process.env.GITHUB_TOKEN &&
        !!process.env.GITHUB_OWNER &&
        !!process.env.GITHUB_REPO,
    },
    {
      id: "whatsapp",
      name: "WhatsApp",
      description: "Inbound messaging channel via n8n bridge.",
      configured: config.whatsapp.enabled,
    },
  ];
}
