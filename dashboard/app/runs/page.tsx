import { readMemoryStore, getTrajectories } from "@/lib/data";
import { classifyForDistillation } from "@/lib/distillation";
import { RunTable } from "@/components/RunTable";
import type { Trajectory, DistillationTier } from "@/lib/types";

export default async function RunsPage() {
  const [store, trajectories] = await Promise.all([
    readMemoryStore(),
    getTrajectories(),
  ]);
  const entries = [...store.entries].reverse();

  const trajectoryMap = new Map<string, Trajectory>();
  const tierMap = new Map<string, DistillationTier>();
  for (const t of trajectories) {
    trajectoryMap.set(t.traceId, t);
    tierMap.set(t.traceId, classifyForDistillation(t).tier);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Runs</h1>
        <p className="mt-1 text-sm text-zinc-400">
          History of orchestrator executions ({entries.length} total).
        </p>
      </div>
      <RunTable entries={entries} trajectoryMap={trajectoryMap} tierMap={tierMap} />
    </div>
  );
}
