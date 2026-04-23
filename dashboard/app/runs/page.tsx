import { readMemoryStore, getTrajectories } from "@/lib/data";
import { RunTable } from "@/components/RunTable";
import type { Trajectory } from "@/lib/types";

export default async function RunsPage() {
  const [store, trajectories] = await Promise.all([
    readMemoryStore(),
    getTrajectories(),
  ]);
  const entries = [...store.entries].reverse();

  const trajectoryMap = new Map<string, Trajectory>();
  for (const t of trajectories) {
    trajectoryMap.set(t.traceId, t);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Runs</h1>
        <p className="mt-1 text-sm text-zinc-400">
          History of orchestrator executions ({entries.length} total).
        </p>
      </div>
      <RunTable entries={entries} trajectoryMap={trajectoryMap} />
    </div>
  );
}
