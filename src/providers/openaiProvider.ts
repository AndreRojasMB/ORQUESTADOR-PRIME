// src/providers/openaiProvider.ts

import OpenAI                              from "openai";
import { PROVIDERS }                       from "../config.js";
import type { Provider, ProviderRequest, ProviderResponse } from "./types.js";

const client = new OpenAI({ apiKey: PROVIDERS.openai.apiKey });

export const openaiProvider: Provider = {
  name: "openai",

  async call(request: ProviderRequest): Promise<ProviderResponse> {
    const response = await client.chat.completions.create({
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
      provider: "openai",
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