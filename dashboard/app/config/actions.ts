"use server";

import { readConfig, writeConfig } from "@/lib/data";
import type { UserConfig, OrchestratorMode } from "@/lib/types";

const VALID_MODES: OrchestratorMode[] = [
  "plan", "route", "blueprint", "audit", "scaffold",
  "memory", "init", "execute", "chat",
];

const VALID_REPLY_VIA = ["n8n", "direct"] as const;

export async function saveConfig(
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  try {
    // Read current config to preserve any fields we don't edit
    const current = await readConfig();

    // ─── WhatsApp ─────────────────────────────────────────
    const whatsappEnabled = formData.get("whatsapp.enabled") === "on";
    const hookToken = String(formData.get("whatsapp.hookToken") ?? "").trim();
    const maxMessagesRaw = formData.get("whatsapp.maxMessagesPerHour");
    const n8nWebhookPath = formData.get("whatsapp.n8nWebhookPath");
    const replyViaRaw = formData.get("whatsapp.replyVia");
    const allowedPhonesRaw = formData.get("whatsapp.allowedPhones");
    const safeModesRaw = formData.get("whatsapp.safeModes");

    const maxMessages = maxMessagesRaw
      ? Math.max(1, Math.min(1000, parseInt(String(maxMessagesRaw), 10) || 20))
      : current.whatsapp.maxMessagesPerHour;

    const replyVia = VALID_REPLY_VIA.includes(String(replyViaRaw) as typeof VALID_REPLY_VIA[number])
      ? (String(replyViaRaw) as "n8n" | "direct")
      : current.whatsapp.replyVia;

    const allowedPhones = allowedPhonesRaw
      ? String(allowedPhonesRaw)
          .split("\n")
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
      : current.whatsapp.allowedPhones;

    const safeModes = safeModesRaw
      ? String(safeModesRaw)
          .split(",")
          .map((s) => s.trim())
          .filter((s): s is OrchestratorMode =>
            VALID_MODES.includes(s as OrchestratorMode),
          )
      : current.whatsapp.safeModes;

    // ─── Agents ───────────────────────────────────────────
    const disabledAgentsRaw = formData.get("agents.disabled");
    const disabledAgents = disabledAgentsRaw
      ? String(disabledAgentsRaw)
          .split("\n")
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
      : current.agents.disabled;

    // ─── Allowed Domains ──────────────────────────────────
    const domainsRaw = formData.get("allowedDomains");
    const allowedDomains = domainsRaw
      ? String(domainsRaw)
          .split("\n")
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
      : current.allowedDomains;

    // ─── Build final config ───────────────────────────────
    const updated: UserConfig = {
      version: current.version,
      agents: { disabled: disabledAgents },
      routing: current.routing,
      providers: current.providers,
      n8n: current.n8n,
      allowedDomains,
      whatsapp: {
        enabled: whatsappEnabled,
        hookToken: hookToken ? hookToken : current.whatsapp.hookToken,
        allowedPhones,
        maxMessagesPerHour: maxMessages,
        safeModes,
        n8nWebhookPath: n8nWebhookPath != null
          ? String(n8nWebhookPath)
          : current.whatsapp.n8nWebhookPath,
        replyVia,
      },
    };

    return await writeConfig(updated);
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
