"use client";

import { useActionState } from "react";
import type { UserConfig } from "@/lib/types";
import { saveConfig } from "./actions";

interface ConfigFormProps {
  config: UserConfig;
}

const ALL_MODES = [
  "plan", "route", "blueprint", "audit", "scaffold", "memory",
] as const;

function mask(value: string): string {
  if (value.length <= 4) return value;
  return value.slice(0, 4) + "\u2022".repeat(Math.min(value.length - 4, 20));
}

type SaveState = { ok: boolean; error?: string } | null;

async function handleSave(
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  return saveConfig(formData);
}

export function ConfigForm({ config }: ConfigFormProps) {
  const [state, action, pending] = useActionState(handleSave, null);

  return (
    <form action={action} className="space-y-8">
      {/* Feedback */}
      {state && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            state.ok
              ? "border-green-800 bg-green-900/20 text-green-300"
              : "border-red-800 bg-red-900/20 text-red-300"
          }`}
        >
          {state.ok
            ? "Config saved successfully."
            : `Error saving config: ${state.error ?? "unknown error"}`}
        </div>
      )}

      {/* ── WhatsApp ───────────────────────────────────── */}
      <Section title="WhatsApp">
        {/* Enabled */}
        <Field label="Enabled">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="whatsapp.enabled"
              defaultChecked={config.whatsapp.enabled}
              className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 accent-blue-500"
            />
            <span className="text-sm text-zinc-300">
              Accept inbound WhatsApp messages
            </span>
          </label>
        </Field>

        {/* Hook Token */}
        <Field label="Hook Token" hint="Shared secret for webhook verification">
          <input
            type="password"
            name="whatsapp.hookToken"
            placeholder={mask(config.whatsapp.hookToken) || "not set"}
            autoComplete="new-password"
            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
          />
        </Field>

        {/* Allowed Phones */}
        <Field label="Allowed Phones" hint="One E.164 number per line">
          <textarea
            name="whatsapp.allowedPhones"
            defaultValue={config.whatsapp.allowedPhones.join("\n")}
            rows={3}
            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 font-mono text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
            placeholder="+51912996652"
          />
        </Field>

        {/* Safe Modes */}
        <Field label="Safe Modes" hint="Modes allowed via WhatsApp">
          <div className="flex flex-wrap gap-3">
            {ALL_MODES.map((mode) => (
              <label key={mode} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  value={mode}
                  defaultChecked={config.whatsapp.safeModes.includes(mode)}
                  onChange={(e) => {
                    // Sync hidden input with checked checkboxes
                    const form = e.target.form;
                    if (!form) return;
                    const boxes = form.querySelectorAll<HTMLInputElement>(
                      'input[type="checkbox"][value]',
                    );
                    const checked: string[] = [];
                    boxes.forEach((cb) => {
                      if (cb.checked && ALL_MODES.includes(cb.value as typeof ALL_MODES[number])) {
                        checked.push(cb.value);
                      }
                    });
                    const hidden = form.querySelector<HTMLInputElement>(
                      'input[name="whatsapp.safeModes"]',
                    );
                    if (hidden) hidden.value = checked.join(",");
                  }}
                  className="h-3.5 w-3.5 rounded border-zinc-600 bg-zinc-800 accent-blue-500"
                />
                <span className="text-xs text-zinc-300">{mode}</span>
              </label>
            ))}
          </div>
          <input
            type="hidden"
            name="whatsapp.safeModes"
            defaultValue={config.whatsapp.safeModes.join(",")}
          />
        </Field>

        {/* Max Messages */}
        <Field label="Max Messages / Hour">
          <input
            type="number"
            name="whatsapp.maxMessagesPerHour"
            defaultValue={config.whatsapp.maxMessagesPerHour}
            min={1}
            max={1000}
            className="w-32 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:border-zinc-500 focus:outline-none"
          />
        </Field>

        {/* n8n Webhook Path */}
        <Field label="n8n Webhook Path">
          <input
            type="text"
            name="whatsapp.n8nWebhookPath"
            defaultValue={config.whatsapp.n8nWebhookPath}
            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:border-zinc-500 focus:outline-none"
          />
        </Field>

        {/* Reply Via */}
        <Field label="Reply Via">
          <select
            name="whatsapp.replyVia"
            defaultValue={config.whatsapp.replyVia}
            className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:border-zinc-500 focus:outline-none"
          >
            <option value="n8n">n8n</option>
            <option value="direct">direct</option>
          </select>
        </Field>
      </Section>

      {/* ── Agents ─────────────────────────────────────── */}
      <Section title="Agents">
        <Field label="Disabled Agents" hint="One agent name per line (leave empty to enable all)">
          <textarea
            name="agents.disabled"
            defaultValue={config.agents.disabled.join("\n")}
            rows={3}
            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 font-mono text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
            placeholder="e.g. motionFx"
          />
        </Field>
      </Section>

      {/* ── Routing ────────────────────────────────────── */}
      <Section title="Routing">
        {config.routing.rules.length > 0 ? (
          <div className="space-y-2">
            {config.routing.rules.map((rule, i) => (
              <div key={i} className="rounded border border-zinc-800 bg-zinc-900 p-3 text-xs">
                <span className="text-zinc-500">Keywords: </span>
                <span className="text-zinc-300">{rule.keywords.join(", ")}</span>
                <span className="mx-2 text-zinc-600">→</span>
                <span className="text-zinc-300">{rule.agents.join(", ")}</span>
              </div>
            ))}
            <p className="text-xs text-zinc-600">
              Routing rules are preserved on save. Edit config.json directly for advanced changes.
            </p>
          </div>
        ) : (
          <p className="text-sm text-zinc-600">
            No custom routing rules configured. Default keyword routing is active.
          </p>
        )}
      </Section>

      {/* ── Providers ──────────────────────────────────── */}
      <Section title="Providers">
        {Object.keys(config.providers).length > 0 ? (
          <div className="space-y-1 text-sm">
            {Object.entries(config.providers).map(([mode, provider]) => (
              <div key={mode} className="flex gap-2">
                <span className="text-zinc-500">{mode}:</span>
                <span className="text-zinc-300">{provider}</span>
              </div>
            ))}
            <p className="mt-2 text-xs text-zinc-600">
              Provider overrides are preserved on save. Edit config.json directly for changes.
            </p>
          </div>
        ) : (
          <p className="text-sm text-zinc-600">
            No provider overrides. Using default provider routing.
          </p>
        )}
      </Section>

      {/* ── Allowed Domains ────────────────────────────── */}
      <Section title="Allowed Domains">
        <Field label="Domains" hint="One domain per line">
          <textarea
            name="allowedDomains"
            defaultValue={config.allowedDomains.join("\n")}
            rows={3}
            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 font-mono text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
            placeholder="api.openai.com"
          />
        </Field>
      </Section>

      {/* ── Save ───────────────────────────────────────── */}
      <div className="flex items-center gap-4 border-t border-zinc-800 pt-6">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? "Saving..." : "Save Config"}
        </button>
        <p className="text-xs text-zinc-600">
          Local config only — does not edit .env secrets
        </p>
      </div>
    </form>
  );
}

// ─── Layout helpers ─────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 space-y-4">
      <legend className="px-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-zinc-300">{label}</label>
      {hint && <p className="text-xs text-zinc-600">{hint}</p>}
      {children}
    </div>
  );
}
