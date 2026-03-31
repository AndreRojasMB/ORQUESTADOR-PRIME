// src/providers/anthropicProvider.ts

import Anthropic                           from "@anthropic-ai/sdk";
import { PROVIDERS }                       from "../config.js";
import type { Provider, ProviderRequest, ProviderResponse } from "./types.js";

// Cliente lazy — solo se inicializa si ANTHROPIC_API_KEY existe
let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    if (!PROVIDERS.anthropic.apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY is not set. Claude provider is unavailable."
      );
    }
    _client = new Anthropic({ apiKey: PROVIDERS.anthropic.apiKey });
  }
  return _client;
}

export const anthropicProvider: Provider = {
  name: "anthropic",

  async call(request: ProviderRequest): Promise<ProviderResponse> {
    const client = getClient();

    // Separar system message del resto
    const systemMessage = request.messages.find((m) => m.role === "system");
    const userMessages  = request.messages.filter((m) => m.role !== "system");

    const response = await client.messages.create({
      model:      request.model,
      max_tokens: request.maxTokens ?? 4096,
      ...(systemMessage?.content && { system: systemMessage.content }),
      messages:   userMessages.map((m) => ({
        role:    m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const block   = response.content[0];
    const content = block?.type === "text" ? block.text : "";

    return {
      provider: "anthropic",
      model:    request.model,
      content,
      usage: {
        inputTokens:  response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };
  },
};