// src/providers/types.ts
// Contrato compartido para todos los providers.
// Cada provider implementa esta interfaz — el resto del sistema
// no sabe si está hablando con OpenAI o Anthropic.
// V2 extension: agregar GeminiProvider implementando esta interfaz.

export type ProviderName = "openai" | "anthropic" | "openclaw" | "kimi";

export type ProviderRouteReason =
  | "model-prefix"
  | "default-openai";

export interface ProviderDetection {
  model: string;
  provider: ProviderName;
  reason: ProviderRouteReason;
  matchedPrefix?: string;
  defaultedToOpenAI: boolean;
}

export interface ProviderConfigurationDiagnostic {
  provider: ProviderName;
  configured: boolean;
  requiredEnv: string[];
  missingEnv: string[];
  notes: string[];
}

export interface ProviderModelDiagnostic {
  role: "planner" | "specialist" | "synthesis" | "claudeArchitect" | "claudeBlueprint" | "kimi" | "openclaw";
  model: string;
  detection: ProviderDetection;
}

export interface ProviderSetupDiagnostics {
  generatedAt: string;
  providers: ProviderConfigurationDiagnostic[];
  models: ProviderModelDiagnostic[];
  warnings: string[];
  networkValidation: "not-performed";
}

export interface ProviderMessage {
  role:    "user" | "assistant" | "system";
  content: string;
}

export interface ProviderRequest {
  model:       string;
  messages:    ProviderMessage[];
  maxTokens?:  number;
  temperature?: number;
}

export interface ProviderResponse {
  provider: ProviderName;
  model:    string;
  content:  string;
  usage?: {
    inputTokens:  number;
    outputTokens: number;
  };
}

export interface Provider {
  name:  ProviderName;
  call(request: ProviderRequest): Promise<ProviderResponse>;
}
