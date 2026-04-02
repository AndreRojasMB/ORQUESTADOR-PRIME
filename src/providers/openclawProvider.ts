// src/providers/openclawProvider.ts
// Provider implementation for OpenClaw Gateway.
// Uses the OpenAI-compatible /v1/chat/completions endpoint.

import { chatCompletions } from "../openclaw/openclawClient.js";
import type { Provider, ProviderRequest, ProviderResponse } from "./types.js";

export const openclawProvider: Provider = {
  name: "openclaw",

  async call(request: ProviderRequest): Promise<ProviderResponse> {
    const response = await chatCompletions({
      model:       request.model,
      max_tokens:  request.maxTokens ?? 4096,
      temperature: request.temperature ?? 0.3,
      messages:    request.messages.map((m) => ({
        role:    m.role,
        content: m.content,
      })),
    });

    const choice = response.choices[0];
    const content = choice?.message?.content ?? "";

    return {
      provider: "openclaw",
      model:    request.model,
      content,
      ...(response.usage && {
        usage: {
          inputTokens:  response.usage.prompt_tokens,
          outputTokens: response.usage.completion_tokens,
        },
      }),
    };
  },
};
