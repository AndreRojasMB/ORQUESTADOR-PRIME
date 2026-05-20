import { loopDashboardStaticData, type LoopBadge, type LoopDashboardCardData, type LoopStatusTone } from "./data";

const toneClasses: Record<LoopStatusTone, string> = {
  safe: "border-green-800/70 bg-green-950/40 text-green-300",
  review: "border-amber-800/70 bg-amber-950/40 text-amber-300",
  blocked: "border-red-800/70 bg-red-950/40 text-red-300",
  manual: "border-blue-800/70 bg-blue-950/40 text-blue-300",
  missing: "border-zinc-700 bg-zinc-900 text-zinc-300",
};

const riskClasses: Record<LoopDashboardCardData["riskLevel"], string> = {
  low: "text-zinc-400",
  medium: "text-blue-300",
  high: "text-amber-300",
  critical: "text-red-300",
};

function Badge({ badge }: { badge: LoopBadge }) {
  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${toneClasses[badge.tone]}`}>
      {badge.label}
    </span>
  );
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-base font-semibold text-zinc-100">{title}</h2>
      <p className="mt-1 text-sm text-zinc-400">{description}</p>
    </div>
  );
}

function StaticAction({ label, reason }: { label: string; reason: string }) {
  return (
    <div className="mt-4 border-t border-zinc-800 pt-4">
      <button
        type="button"
        disabled
        className="w-full cursor-not-allowed rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-left text-sm font-medium text-zinc-500"
      >
        {label}
      </button>
      <p className="mt-2 text-xs text-zinc-500">{reason}</p>
    </div>
  );
}

function LoopCard({ card }: { card: LoopDashboardCardData }) {
  return (
    <article className="flex h-full flex-col rounded-lg border border-zinc-800 bg-zinc-900/70 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{card.cardId}</p>
          <h3 className="mt-1 text-lg font-semibold text-zinc-100">{card.title}</h3>
          <p className="mt-2 text-sm text-zinc-400">{card.purpose}</p>
        </div>
        <p className={`shrink-0 text-xs font-semibold uppercase tracking-wider ${riskClasses[card.riskLevel]}`}>
          {card.riskLevel}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {card.badges.map((badge) => (
          <Badge key={`${card.cardId}:${badge.label}`} badge={badge} />
        ))}
      </div>

      <dl className="mt-4 grid gap-3 text-sm">
        {card.fields.map((field) => (
          <div key={`${card.cardId}:${field.label}`} className="grid gap-1 border-t border-zinc-800 pt-3 sm:grid-cols-[9rem_1fr] sm:gap-4">
            <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">{field.label}</dt>
            <dd className="text-zinc-200">{field.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Evidence</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {card.evidence.map((item) => (
            <span key={`${card.cardId}:${item}`} className="rounded border border-zinc-800 bg-zinc-950 px-2 py-1 font-mono text-xs text-zinc-300">
              {item}
            </span>
          ))}
        </div>
      </div>

      <p className="mt-4 text-xs text-zinc-500">{card.safetyNote}</p>
      <div className="mt-auto">
        <StaticAction label={card.disabledActionLabel} reason={card.disabledReason} />
      </div>
    </article>
  );
}

export default function AutopilotLoopPage() {
  const data = loopDashboardStaticData;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header className="space-y-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-blue-300">Autopilot loop</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-100">Loop Dashboard Static UI</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
            Read-only dashboard preview for the manual loop: prompt and handoff review, approvals,
            audit evidence, report return, validation, closeout, and next-action recommendation.
          </p>
        </div>

        <div className="rounded-lg border border-blue-900/70 bg-blue-950/30 px-4 py-3 text-sm text-blue-200">
          {data.statusBanner}
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Loop overview">
        {data.overviewMetrics.map((metric) => (
          <div key={metric.label} className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{metric.label}</p>
              <Badge badge={{ label: metric.tone, tone: metric.tone }} />
            </div>
            <p className="mt-3 text-xl font-semibold text-zinc-100">{metric.value}</p>
            <p className="mt-2 text-xs leading-5 text-zinc-500">{metric.helper}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-4">
          <SectionHeading
            title="Manual action checklist"
            description="All steps remain human-managed. This dashboard only displays evidence and status."
          />
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/70">
            {data.manualSteps.map((step) => (
              <div key={step.label} className="grid gap-3 border-b border-zinc-800 px-5 py-4 last:border-b-0 sm:grid-cols-[1fr_10rem_12rem] sm:items-center">
                <div>
                  <p className="text-sm font-medium text-zinc-100">{step.label}</p>
                  <p className="mt-1 font-mono text-xs text-zinc-500">{step.evidence}</p>
                </div>
                <Badge badge={{ label: step.status, tone: step.tone }} />
                <p className="text-xs text-zinc-500">Display-only status</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <SectionHeading
            title="Safety boundaries"
            description="Static route boundaries for this preview."
          />
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-5">
            <ul className="space-y-2 text-sm text-zinc-300">
              {data.safetyBoundaries.map((boundary) => (
                <li key={boundary} className="border-b border-zinc-800 pb-2 last:border-b-0 last:pb-0">
                  {boundary}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>

      <section className="space-y-4">
        <SectionHeading
          title="Read-only loop cards"
          description="Each card mirrors the planned static UI model and keeps controls disabled."
        />
        <div className="grid gap-4 lg:grid-cols-2">
          {data.cards.map((card) => (
            <LoopCard key={card.cardId} card={card} />
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-5">
          <h2 className="text-base font-semibold text-zinc-100">Blockers</h2>
          {data.blockers.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm text-red-300">
              {data.blockers.map((blocker) => (
                <li key={blocker}>{blocker}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-zinc-400">No blockers in the static fixture.</p>
          )}
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-5">
          <h2 className="text-base font-semibold text-zinc-100">Warnings</h2>
          <ul className="mt-3 space-y-2 text-sm text-amber-300">
            {data.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
