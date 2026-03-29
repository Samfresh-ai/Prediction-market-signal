import { AppShell } from "@/components/app-shell";
import { EmptyStatePanel } from "@/components/empty-state-panel";
import { LiveMonitor } from "@/components/live-monitor";
import { OpportunityCard } from "@/components/opportunity-card";
import { getSignalsView } from "@/server/intel";

const sections = [
  { key: "signal", title: "Active signals" },
  { key: "watch", title: "Watchlist candidates" },
  { key: "evaluating", title: "Evaluating now" },
  { key: "contradicted", title: "Rejected or contradicted" },
  { key: "stale", title: "Stale opportunities" },
] as const;

export const dynamic = "force-dynamic";

export default async function SignalsPage() {
  const data = await getSignalsView();

  return (
    <AppShell
      activePath="/signals"
      eyebrow="Signals"
      title="Signal and watchlist board"
      subtitle="Sort the scanner’s live signal queue by conviction, fair-value gap, and contradictory evidence rather than by backend pipeline stage alone."
    >
      <div className="space-y-8">
        <LiveMonitor />
        {data.signals.length === 0 ? (
          <EmptyStatePanel
            title="No opportunities yet"
            description="Once markets are monitored and evidence is mapped, candidate and signal states will populate here."
          />
        ) : (
          sections.map((section) => {
            const items = data.signals.filter((item) => item.scanState === section.key);
            if (items.length === 0) {
              return null;
            }

            return (
              <section key={section.key}>
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">{section.title}</p>
                <div className="mt-4 grid gap-5 xl:grid-cols-2">
                  {items.map((item) => (
                    <OpportunityCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>
    </AppShell>
  );
}
