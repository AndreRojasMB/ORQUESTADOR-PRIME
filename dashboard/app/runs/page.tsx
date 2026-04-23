import { readMemoryStore } from "@/lib/data";
import { RunTable } from "@/components/RunTable";

export default async function RunsPage() {
  const store = await readMemoryStore();
  const entries = [...store.entries].reverse();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Runs</h1>
        <p className="mt-1 text-sm text-zinc-400">
          History of orchestrator executions ({entries.length} total).
        </p>
      </div>
      <RunTable entries={entries} />
    </div>
  );
}
