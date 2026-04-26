// src/providers/providerRouter.ts
// Selecciona el provider correcto basado en el nombre del modelo.
// Claude models empiezan con "claude-".
// V2 extension: agregar "gemini-" -> geminiProvider aqui.

import {
  CLAUDE_MODELS,
  KIMI_CONFIG,
  MODELS,
  OPENCLAW_CONFIG,
  PROVIDERS,
} from "../config.js";
import { openaiProvider }    from "./openaiProvider.js";
import { anthropicProvider } from "./anthropicProvider.js";
import { openclawProvider }  from "./openclawProvider.js";
import { kimiProvider }      from "./kimiProvider.js";
import type {
  Provider,
  ProviderConfigurationDiagnostic,
  ProviderDetection,
  ProviderModelDiagnostic,
  ProviderName,
  ProviderSetupDiagnostics,
} from "./types.js";

const MODEL_PREFIX_ROUTES: Array<{
  prefix: string;
  provider: ProviderName;
}> = [
  { prefix: "claude-", provider: "anthropic" },
  { prefix: "openclaw-", provider: "openclaw" },
  { prefix: "kimi-", provider: "kimi" },
];

export function getProvider(model: string): Provider {
  if (model.startsWith("claude-"))   return anthropicProvider;
  if (model.startsWith("openclaw-")) return openclawProvider;
  if (model.startsWith("kimi-"))     return kimiProvider;
  return openaiProvider;
}

export function detectProviderForModel(model: string): ProviderDetection {
  const route = MODEL_PREFIX_ROUTES.find((r) => model.startsWith(r.prefix));
  if (route) {
    return {
      model,
      provider: route.provider,
      reason: "model-prefix",
      matchedPrefix: route.prefix,
      defaultedToOpenAI: false,
    };
  }

  return {
    model,
    provider: "openai",
    reason: "default-openai",
    defaultedToOpenAI: true,
  };
}

export function isProviderConfigured(
  provider: ProviderName,
): ProviderConfigurationDiagnostic {
  switch (provider) {
    case "openai":
      return buildProviderDiagnostic("openai", ["OPENAI_API_KEY"], [
        PROVIDERS.openai.apiKey,
      ], [
        "OPENAI_API_KEY is currently required by src/config.ts at process startup.",
      ]);
    case "anthropic":
      return buildProviderDiagnostic("anthropic", ["ANTHROPIC_API_KEY"], [
        PROVIDERS.anthropic.apiKey,
      ], [
        "Claude routes are selected by claude-* model names.",
      ]);
    case "kimi":
      return buildProviderDiagnostic("kimi", ["KIMI_API_KEY"], [
        KIMI_CONFIG.apiKey,
      ], [
        "Kimi routes are selected by kimi-* model names.",
        "KIMI_MODEL and KIMI_THINKING are non-secret behavior settings.",
      ]);
    case "openclaw":
      return buildProviderDiagnostic("openclaw", ["OPENCLAW_GATEWAY_TOKEN"], [
        OPENCLAW_CONFIG.token,
      ], [
        "OpenClaw routes are selected by openclaw-* model names.",
        "OPENCLAW_GATEWAY_URL and OPENCLAW_MODEL are non-secret behavior settings.",
      ]);
  }
}

export function getProviderSetupDiagnostics(): ProviderSetupDiagnostics {
  const models: ProviderModelDiagnostic[] = [
    buildModelDiagnostic("planner", MODELS.planner),
    buildModelDiagnostic("specialist", MODELS.specialist),
    buildModelDiagnostic("synthesis", MODELS.synthesis),
    buildModelDiagnostic("claudeArchitect", CLAUDE_MODELS.architect),
    buildModelDiagnostic("claudeBlueprint", CLAUDE_MODELS.blueprint),
    buildModelDiagnostic("kimi", KIMI_CONFIG.model),
    buildModelDiagnostic("openclaw", OPENCLAW_CONFIG.model),
  ];

  const warnings = models
    .filter((m) => m.detection.defaultedToOpenAI)
    .map((m) =>
      `${m.role} model "${m.model}" uses the current default OpenAI route because no explicit provider prefix matched.`,
    );

  return {
    generatedAt: new Date().toISOString(),
    providers: [
      isProviderConfigured("openai"),
      isProviderConfigured("anthropic"),
      isProviderConfigured("kimi"),
      isProviderConfigured("openclaw"),
    ],
    models,
    warnings,
    networkValidation: "not-performed",
  };
}

function buildModelDiagnostic(
  role: ProviderModelDiagnostic["role"],
  model: string,
): ProviderModelDiagnostic {
  return {
    role,
    model,
    detection: detectProviderForModel(model),
  };
}

function buildProviderDiagnostic(
  provider: ProviderName,
  requiredEnv: string[],
  values: Array<string | undefined>,
  notes: string[],
): ProviderConfigurationDiagnostic {
  const missingEnv = requiredEnv.filter((_, index) => !values[index]);

  return {
    provider,
    configured: missingEnv.length === 0,
    requiredEnv,
    missingEnv,
    notes,
  };
}

// Llamada directa sin instanciar provider manualmente.
// Usala desde el orchestrator para calls de alto razonamiento.
export async function callProvider(
  model:   string,
  system:  string,
  prompt:  string,
  maxTokens = 4096
) {
  const provider = getProvider(model);

  return provider.call({
    model,
    maxTokens,
    messages: [
      { role: "system", content: system },
      { role: "user",   content: prompt },
    ],
  });
}
