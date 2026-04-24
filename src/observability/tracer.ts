// src/observability/tracer.ts
// Genera un TraceRecord por ejecución del orchestrator.
// Registra timings por fase, provider usado, tokens, y parse result.
// V2 extension: exportar a OpenTelemetry o archivo JSON aquí.

import type { OrchestratorMode } from "../types.js";
import type { ProviderName }     from "../providers/types.js";

// ─── Tipos del trace ──────────────────────────────────────────────

export interface PhaseTrace {
  phase:      string;
  startedAt:  number;   // Date.now()
  durationMs: number;
}

export interface ProviderTrace {
  provider:     ProviderName;
  model:        string;
  inputTokens?: number;
  outputTokens?: number;
  durationMs:   number;
}

export interface TraceRecord {
  traceId:      string;
  mode:         OrchestratorMode;
  task:         string;
  startedAt:    string;   // ISO string
  totalMs:      number;
  phases:       PhaseTrace[];
  provider?:    ProviderTrace;
  parseSuccess: boolean;
  parseError?:  string;
  selectedAgents: string[];
  matchedKeywords: string[];
}

// ─── Tracer ───────────────────────────────────────────────────────

export class Tracer {
  private traceId:    string;
  private mode:       OrchestratorMode;
  private task:       string;
  private startedAt:  number;
  private phases:     PhaseTrace[]  = [];
  private provider?:  ProviderTrace;
  private selectedAgents:   string[] = [];
  private matchedKeywords:  string[] = [];

  constructor(mode: OrchestratorMode, task: string) {
    this.traceId   = generateTraceId();
    this.mode      = mode;
    this.task      = task;
    this.startedAt = Date.now();
  }

  // Registra el inicio y fin de una fase
  phase(name: string, fn: () => void): void {
    const start = Date.now();
    fn();
    this.phases.push({
      phase:      name,
      startedAt:  start,
      durationMs: Date.now() - start,
    });
  }

  // Registra una fase async
  async phaseAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start  = Date.now();
    const result = await fn();
    this.phases.push({
      phase:      name,
      startedAt:  start,
      durationMs: Date.now() - start,
    });
    return result;
  }

  setProvider(trace: ProviderTrace): void {
    this.provider = trace;
  }

  // Duration of the most recently recorded phase, or 0 if none.
  // Intended to be called immediately after a provider phaseAsync so that
  // setProvider can record the real wall-clock duration without re-timing.
  lastPhaseDurationMs(): number {
    const last = this.phases[this.phases.length - 1];
    return last ? last.durationMs : 0;
  }

  setRouter(selectedAgents: string[], matchedKeywords: string[]): void {
    this.selectedAgents  = selectedAgents;
    this.matchedKeywords = matchedKeywords;
  }

  // Finaliza el trace y retorna el record completo
  finish(parseSuccess: boolean, parseError?: string): TraceRecord {
    return {
      traceId:         this.traceId,
      mode:            this.mode,
      task:            this.task,
      startedAt:       new Date(this.startedAt).toISOString(),
      totalMs:         Date.now() - this.startedAt,
      phases:          this.phases,
      ...(this.provider && { provider: this.provider }),
      parseSuccess,
      ...(parseError && { parseError }),
      selectedAgents:  this.selectedAgents,
      matchedKeywords: this.matchedKeywords,
    };
  }

  get id(): string {
    return this.traceId;
  }
}

function generateTraceId(): string {
  const ts   = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 7);
  return `trace_${ts}_${rand}`;
}

// Imprime un resumen legible del trace en consola
export function printTrace(trace: TraceRecord): void {
  console.log(`\n${"═".repeat(55)}`);
  console.log(`  TRACE ${trace.traceId}`);
  console.log(`${"═".repeat(55)}`);
  console.log(`  Mode     : ${trace.mode.toUpperCase()}`);
  console.log(`  Total    : ${formatMs(trace.totalMs)}`);
  console.log(`  Parse    : ${trace.parseSuccess ? "✅ success" : "❌ failed"}`);

  if (trace.provider) {
    const p = trace.provider;
    const tokens = p.inputTokens != null
      ? `${p.inputTokens} in / ${p.outputTokens ?? 0} out`
      : "n/a";
    console.log(`  Provider : ${p.provider} (${p.model}) — ${tokens} — ${formatMs(p.durationMs)}`);
  }

  if (trace.selectedAgents.length > 0) {
    console.log(`  Agents   : ${trace.selectedAgents.join(", ")}`);
  }

  if (trace.matchedKeywords.length > 0) {
    console.log(`  Keywords : ${trace.matchedKeywords.join(", ")}`);
  }

  if (trace.phases.length > 0) {
    console.log(`\n  Phases:`);
    for (const phase of trace.phases) {
      console.log(`    ${phase.phase.padEnd(20)} ${formatMs(phase.durationMs)}`);
    }
  }

  if (trace.parseError) {
    console.log(`\n  Parse error:\n  ${trace.parseError}`);
  }

  console.log(`${"═".repeat(55)}\n`);
}

function formatMs(ms: number): string {
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms}ms`;
}