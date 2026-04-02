// src/providers/types.ts
// Contrato compartido para todos los providers.
// Cada provider implementa esta interfaz — el resto del sistema
// no sabe si está hablando con OpenAI o Anthropic.
// V2 extension: agregar GeminiProvider implementando esta interfaz.

export type ProviderName = "openai" | "anthropic" | "openclaw";

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