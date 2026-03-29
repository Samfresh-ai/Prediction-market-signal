import { AppShell } from "@/components/app-shell";
import { EmptyStatePanel } from "@/components/empty-state-panel";
import { LiveMonitor } from "@/components/live-monitor";
import { MarketTable } from "@/components/market-table";
import { OpportunityCard } from "@/components/opportunity-card";
import { getMarketsOverviewView } from "@/server/intel";

export const dynamic = "force-dynamic";

export default async function MarketsPage() {
  const data = await getMarketsOverviewView();

  return (
    <AppShell
      activePath="/markets"
      eyebrow="Coverage"
      title="Monitored market universe"
      subtitle="Review the broader scanner coverage set, compare YES pricing against fair value, and open any market for full thesis and invalidation context."
    >
      <div className="space-y-8">
        <LiveMonitor />
        {data.markets.length === 0 ? (
          <EmptyStatePanel title="No markets available" description="Run the scan pipeline to populate the monitored universe." />
        ) : (
          <>
            <MarketTable markets={data.markets} />
            <section>
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">Preview cards</p>
              <div className="mt-4 grid gap-5 xl:grid-cols-2">
                {data.markets.slice(0, 4).map((item) => (
                  <OpportunityCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}
