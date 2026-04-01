// src/init/initContext.ts
// Convierte las respuestas del CLI init en un task string
// que el scaffold puede procesar directamente.

import type { InitAnswers } from "./questions.js";
import { resolve }          from "path";

export interface InitContext {
  task:      string;
  outputDir: string;
}

export function buildInitContext(answers: InitAnswers): InitContext {
  const featureList = answers.features.join(", ");

  const task = [
    `${answers.projectType} project called "${answers.projectName}"`,
    `using ${answers.stack}`,
    answers.features.length > 0
      ? `with features: ${featureList}`
      : "",
    answers.description
      ? `— ${answers.description}`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  const outputDir = resolve(answers.outputDir);

  return { task, outputDir };
}