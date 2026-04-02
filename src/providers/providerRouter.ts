// src/providers/providerRouter.ts
// Selecciona el provider correcto basado en el nombre del modelo.
// Claude models empiezan con "claude-".
// V2 extension: agregar "gemini-" → geminiProvider aquí.

import { openaiProvider }    from "./openaiProvider.js";
import { anthropicProvider } from "./anthropicProvider.js";
import { openclawProvider }  from "./openclawProvider.js";
import type { Provider }     from "./types.js";

export function getProvider(model: string): Provider {
  if (model.startsWith("claude-"))   return anthropicProvider;
  if (model.startsWith("openclaw-")) return openclawProvider;
  return openaiProvider;
}

// Llamada directa sin instanciar provider manualmente.
// Úsala desde el orchestrator para calls de alto razonamiento.
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