"use client";

import { Activity, Database, Radar, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { cn, formatRelativeTime } from "@/lib/utils";

type LiveSummary = {
  stats: {
    monitoredMarkets: number;
    watchCount: number;
    signalCount: number;
    staleCount: number;
    averageConfidence: number;
    freshEvidenceToday: number;
    averageLatencyMs: number;
    liveMode: string;
    lastSyncAt: string | null;
  };
  pipeline: Array<{
    type: string;
    status: string;
    startedAt: string;
    completedAt: string | null;
  }>;
};

const fallbackSummary: LiveSummary = {
  stats: {
    monitoredMarkets: 0,
    watchCount: 0,
    signalCount: 0,
    staleCount: 0,
    averageConfidence: 0,
    freshEvidenceToday: 0,
    averageLatencyMs: 0,
    liveMode: "Interval scanning",
    lastSyncAt: null,
  },
  pipeline: [],
};

export function LiveStatusBar() {
  const [summary, setSummary] = useState<LiveSummary>(fallbackSummary);
  const [now, setNow] = useState(() => Date.now());
  const [degraded, setDegraded] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await fetch("/api/summary", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("summary_failed");
        }

        const payload = (await response.json()) as LiveSummary;
        if (!active) {
          return;
        }

        setSummary(payload);
        setDegraded(false);
      } catch {
        if (!active) {
          return;
        }

        setDegraded(true);
      }
    }

    void load();
    const summaryTimer = window.setInterval(() => {
      if (document.visibilityState !== "visible") {
        return;
      }
      void load();
    }, 30_000);
    const clockTimer = window.setInterval(() => {
      setNow(Date.now());
    }, 1_000);

    return () => {
      active = false;
      window.clearInterval(summaryTimer);
      window.clearInterval(clockTimer);
    };
  }, []);

  const pipelineSummary = useMemo(() => {
    const successful = summary.pipeline.filter((item) => item.status === "success").length;
    const errors = summary.pipeline.filter((item) => item.status === "error").length;
    const inProgress = summary.pipeline.filter((item) => item.status === "running").length;

    return {
      successful,
      errors,
      inProgress,
    };
  }, [summary.pipeline]);

  const syncLabel = summary.stats.lastSyncAt ? `${formatRelativeTime(summary.stats.lastSyncAt, now)} sync` : "No recent sync";

  const cards = [
    {
      icon: Activity,
      label: "Live scan",
      value: `${summary.stats.monitoredMarkets} markets`,
      meta: `${summary.stats.watchCount} watch • ${summary.stats.signalCount} signal`,
      progress:
        summary.stats.monitoredMarkets === 0
          ? 0
          : (summary.stats.watchCount + summary.stats.signalCount) / summary.stats.monitoredMarkets,
      accent: "from-cyan-400/80 to-sky-300/70",
    },
    {
      icon: Radar,
      label: "Pipeline",
      value: `${pipelineSummary.successful} stable stages`,
      meta: pipelineSummary.errors > 0 ? `${pipelineSummary.errors} degraded` : `${pipelineSummary.inProgress} running`,
      progress:
        summary.pipeline.length === 0
          ? 0
          : pipelineSummary.successful / summary.pipeline.length,
      accent: "from-emerald-400/80 to-teal-300/70",
    },
    {
      icon: Database,
      label: "Evidence cadence",
      value: `${summary.stats.freshEvidenceToday} fresh today`,
      meta: `${summary.stats.averageLatencyMs} ms avg latency`,
      progress: Math.min(summary.stats.freshEvidenceToday / 10, 1),
      accent: "from-amber-300/80 to-orange-300/70",
    },
    {
      icon: ShieldCheck,
      label: "Terminal state",
      value: degraded ? "Degraded" : "Operational",
      meta: `${summary.stats.staleCount} stale • ${Math.round(summary.stats.averageConfidence * 100)}% avg confidence`,
      progress: degraded ? 0.32 : Math.max(0.2, 1 - summary.stats.staleCount / Math.max(summary.stats.monitoredMarkets, 1)),
      accent: degraded ? "from-rose-400/80 to-orange-300/70" : "from-violet-400/80 to-cyan-300/70",
    },
  ];

  return (
    <div className="border-b border-[var(--border)] bg-[rgba(255,255,255,0.78)] px-8 py-4 backdrop-blur">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
        <div className="flex items-center gap-3">
          <span className={cn("inline-flex h-2.5 w-2.5 rounded-full", degraded ? "bg-amber-300" : "status-pulse bg-emerald-300")} />
          <span>{degraded ? "Using last known shell telemetry" : "Scanner telemetry live"}</span>
        </div>
        <span>{syncLabel}</span>
      </div>
      <div className="grid gap-3 xl:grid-cols-4">
        {cards.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="group rounded-[26px] border border-[var(--border)] bg-[var(--panel)] px-4 py-4 transition duration-300 hover:border-[rgba(17,32,51,0.14)] hover:bg-[rgba(255,255,255,0.94)]"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(17,120,242,0.08)] text-[#1178f2] shadow-[inset_0_0_0_1px_rgba(17,120,242,0.06)]">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">{item.label}</p>
                  <p className="mt-1 text-sm font-semibold text-white">{item.value}</p>
                </div>
              </div>
              <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">{item.meta}</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[rgba(17,32,51,0.08)]">
                <div
                  className={cn("h-full rounded-full bg-gradient-to-r transition-[width] duration-700", item.accent)}
                  style={{ width: `${Math.max(item.progress * 100, 8)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
