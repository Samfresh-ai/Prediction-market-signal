import { AppShell } from "@/components/app-shell";
import { ActivityFeed } from "@/components/activity-feed";
import { LiveMonitor } from "@/components/live-monitor";
import { SystemHealthPanel } from "@/components/system-health-panel";
import { getActivityView } from "@/server/intel";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  const data = await getActivityView();

  return (
    <AppShell
      activePath="/activity"
      eyebrow="Activity"
      title="Live scan stream and system log"
      subtitle="Expose the full analysis loop so the product feels continuously active even when no final signal has fired."
    >
      <div className="space-y-8">
        <LiveMonitor />
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <ActivityFeed items={data.activity} />
          <SystemHealthPanel health={data.health} />
        </div>
      </div>
    </AppShell>
  );
}
