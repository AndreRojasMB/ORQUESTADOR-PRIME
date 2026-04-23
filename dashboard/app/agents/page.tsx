import { agentRegistry } from "@/lib/agents";
import { Badge } from "@/components/Badge";

export default function AgentsPage() {
  const agents = Object.entries(agentRegistry);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Agents</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {agents.length} registered specialist agents.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {agents.map(([name, meta]) => (
          <div
            key={name}
            className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 space-y-3"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-sm font-bold text-zinc-100">{name}</h2>
              <Badge variant="tier">{meta.tier}</Badge>
            </div>

            {/* Domain */}
            <div>
              <Badge variant="domain">{meta.domain}</Badge>
            </div>

            {/* Description */}
            <p className="text-xs text-zinc-400 leading-relaxed">
              {meta.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {meta.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
