import { AppShell } from "@/components/app-shell";
import { ActivityFeed } from "@/components/activity-feed";
import { EmptyStatePanel } from "@/components/empty-state-panel";
import { LiveMonitor } from "@/components/live-monitor";
import { MarketTable } from "@/components/market-table";
import { OpportunityCard } from "@/components/opportunity-card";
import { RoadmapCard } from "@/components/roadmap-card";
import { SystemHealthPanel } from "@/components/system-health-panel";
import { getDashboardView } from "@/server/intel";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getDashboardView();

  return (
    <AppShell
      activePath="/"
      eyebrow="Market Intelligence Terminal"
      title="Live probability scanner for Base prediction markets"
      subtitle="Track monitored markets, inspect fair-value drift, trace evidence quality, and watch the signal pipeline move from monitoring to evidence to conviction."
      statusSlot={
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <HeroStat label="Markets monitored" value={String(data.stats.monitoredMarkets)} />
          <HeroStat label="Active opportunities" value={String(data.stats.watchCount + data.stats.signalCount)} />
          <HeroStat label="Last sync" value={formatDateTime(data.stats.lastSyncAt)} />
        </div>
      }
    >
      <div className="space-y-8">
        <LiveMonitor enableAutoRefresh enableAutoRun />

        <section className="grid gap-4 xl:grid-cols-6">
          <KpiCard label="Monitored markets" value={String(data.stats.monitoredMarkets)} />
          <KpiCard label="Watch candidates" value={String(data.stats.watchCount)} />
          <KpiCard label="Active signals" value={String(data.stats.signalCount)} />
          <KpiCard label="Average confidence" value={`${Math.round(data.stats.averageConfidence * 100)}%`} />
          <KpiCard label="Fresh evidence (24h)" value={String(data.stats.freshEvidenceToday)} />
          <KpiCard label="Latency" value={`${data.stats.averageLatencyMs} ms`} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.95fr_0.85fr]">
          <div className="space-y-6">
            <PanelTitle eyebrow="Scanner" title="Monitored markets" />
            {data.markets.length === 0 ? (
              <EmptyStatePanel
                title="No monitored markets yet"
                description="Run the pipeline once to populate the market scanner and lifecycle panels."
              />
            ) : (
              <MarketTable markets={data.markets} />
            )}
          </div>

          <div className="space-y-6">
            <PanelTitle eyebrow="Opportunities" title="High-attention candidates" />
            <div className="space-y-5">
              {data.opportunities.map((item) => (
                <OpportunityCard key={item.id} item={item} />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <SystemHealthPanel health={data.health} />
            <div className="rounded-[32px] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-[var(--panel-shadow)]">
              <PanelTitle eyebrow="Lifecycle" title="Signal progression" compact />
              <div className="mt-5 space-y-4">
                {data.lifecycleBreakdown.map((item) => (
                  <div key={item.state}>
                    <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                      <span>{item.state.replaceAll("_", " ")}</span>
                      <span>{item.count}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-[rgba(17,32,51,0.08)]">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,#2fa2ff,#2ad28a)] transition-[width] duration-700"
                        style={{ width: `${data.stats.monitoredMarkets === 0 ? 0 : (item.count / data.stats.monitoredMarkets) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <ActivityFeed items={data.activity} />
          <div className="space-y-6">
            <RoadmapCard
              title="Weather intelligence lane"
              subtitle="Ready placeholder for temperature, rainfall, and storm-driven markets once the second venue is connected."
              note="Reserved expansion surface"
            />
            <RoadmapCard
              title="Football market lane"
              subtitle="Ready placeholder for match outcome, tournament, and player prop intelligence on a future venue integration."
              note="Reserved expansion surface"
            />
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] px-5 py-4 shadow-[var(--panel-shadow)]">
      <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[28px] border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--panel-shadow)]">
      <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">{value}</p>
    </div>
  );
}

function PanelTitle({ eyebrow, title, compact = false }: { eyebrow: string; title: string; compact?: boolean }) {
  return (
    <div className={compact ? "" : "mb-4"}>
      <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
    </div>
  );
}
