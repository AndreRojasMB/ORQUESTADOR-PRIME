export default function LoadingAutopilotLoopPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-blue-300">Autopilot loop</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-100">Loop Dashboard Static UI</h1>
        <p className="mt-2 text-sm text-zinc-400">Waiting for local static metadata.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {["Current stage", "Approval", "Alert level", "Next action"].map((item) => (
          <div key={item} className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{item}</p>
            <div className="mt-4 h-5 w-2/3 rounded bg-zinc-800" />
            <div className="mt-3 h-3 w-full rounded bg-zinc-800/70" />
          </div>
        ))}
      </div>
    </div>
  );
}
