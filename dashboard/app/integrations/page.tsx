import { getIntegrationStatuses } from "./checks";

export default async function IntegrationsPage() {
  const integrations = await getIntegrationStatuses();
  const configured = integrations.filter((i) => i.configured).length;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Integrations</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {configured} of {integrations.length} integrations configured.
        </p>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-xs text-zinc-500">
        Read-only status view. This page does not expose API keys or secrets.
        Configure integrations via .env or ~/.orquestador-prime/config.json.
      </div>

      <div className="space-y-3">
        {integrations.map((integration) => (
          <div
            key={integration.id}
            className="flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900 px-5 py-4"
          >
            {/* Status dot */}
            <span
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                integration.configured ? "bg-green-500" : "bg-zinc-600"
              }`}
            />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-zinc-100">
                  {integration.name}
                </span>
                <span
                  className={`text-xs ${
                    integration.configured ? "text-green-400" : "text-zinc-500"
                  }`}
                >
                  {integration.configured ? "Configured" : "Not Configured"}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-zinc-500">
                {integration.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
