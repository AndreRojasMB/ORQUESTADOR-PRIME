import { readConfig } from "@/lib/data";
import { ConfigForm } from "./ConfigForm";

export default async function ConfigPage() {
  const config = await readConfig();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Config</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Edit ~/.orquestador-prime/config.json
        </p>
      </div>

      <ConfigForm config={config} />
    </div>
  );
}
