import { ActivityFeed } from "@/components/activity-feed";
import { AppShell } from "@/components/app-shell";
import { LiveMonitor } from "@/components/live-monitor";
import { ScannerSurface } from "@/components/scanner-surface";
import { formatCompactNumber, formatDateTime } from "@/lib/utils";
import { getDashboardView } from "@/server/intel";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getDashboardView();

  return (
    <AppShell
      activePath="/"
      eyebrow="Prediction Signal"
      title="Limitless Exchange · Base prediction-market scanner"
      subtitle="Focused scanner for mispriced YES/NO odds, fair-value drift, and fast thesis triage across the current monitored market universe."
      statusSlot={
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <HeroStat label="Markets" value={String(data.stats.monitoredMarkets)} />
          <HeroStat label="Signals" value={String(data.stats.signalCount)} />
          <HeroStat label="Watching" value={String(data.stats.watchCount)} />
          <HeroStat label="Volume (24h)" value={formatCompactNumber(data.stats.totalVolume24h)} />
          <HeroStat label="Last Scan" value={formatDateTime(data.stats.lastSyncAt)} />
        </div>
      }
    >
      <div className="space-y-8">
        <LiveMonitor enableAutoRefresh enableAutoRun />
        <ScannerSurface markets={data.markets} />

        <section className="rounded-[32px] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-[var(--panel-shadow)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">Recent activity</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Latest scanner events</h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-[var(--muted)]">
              Pipeline logs stay available here, but the main surface is centered on tradeable markets, not an operator dashboard.
            </p>
          </div>
          <div className="mt-6">
            <ActivityFeed items={data.activity} />
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
