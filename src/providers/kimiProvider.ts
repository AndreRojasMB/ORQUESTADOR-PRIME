// src/providers/kimiProvider.ts
// Kimi K2.6 provider via OpenAI-compatible API at api.moonshot.ai.
// Lazy client — only initialized if KIMI_API_KEY exists.
// Thinking mode disabled by default for deterministic structured output.

import OpenAI from "openai";
import { KIMI_CONFIG } from "../config.js";
import type { Provider, ProviderRequest, ProviderResponse } from "./types.js";

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    if (!KIMI_CONFIG.apiKey) {
      throw new Error(
        "KIMI_API_KEY is not set. Kimi provider is unavailable.",
      );
    }
    _client = new OpenAI({
      apiKey: KIMI_CONFIG.apiKey,
      baseURL: "https://api.moonshot.ai/v1",
    });
  }
  return _client;
}

export const kimiProvider: Provider = {
  name: "kimi",

  async call(request: ProviderRequest): Promise<ProviderResponse> {
    const client = getClient();

    const thinkingParam = KIMI_CONFIG.thinking
      ? { thinking: { type: "enabled" as const } }
      : { thinking: { type: "disabled" as const } };

    const response = await client.chat.completions.create({
      model: request.model,
      max_completion_tokens: request.maxTokens ?? 4096,
      temperature: request.temperature ?? 0.3,
      messages: request.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      ...thinkingParam,
    });

    const choice = response.choices[0];
    const content = choice?.message?.content ?? "";

    return {
      provider: "kimi",
      model: request.model,
      content,
      ...(response.usage && {
        usage: {
          inputTokens: response.usage.prompt_tokens,
          outputTokens: response.usage.completion_tokens,
        },
      }),
    };
  },
};
