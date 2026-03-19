import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { ConfidenceMeter } from "@/components/confidence-meter";
import { DetectorReasonList } from "@/components/detector-reason-list";
import { EdgeDeltaBadge } from "@/components/edge-delta-badge";
import { EvidenceTimeline } from "@/components/evidence-timeline";
import { LiveMonitor } from "@/components/live-monitor";
import { MiniSparkline } from "@/components/mini-sparkline";
import { OpportunityCard } from "@/components/opportunity-card";
import { ScanStateBadge } from "@/components/scan-state-badge";
import { getMarketDetailView } from "@/server/intel";
import { formatDateTime, percent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MarketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getMarketDetailView(id);

  if (!data) {
    notFound();
  }

  return (
    <AppShell
      activePath="/markets"
      eyebrow="Market detail"
      title={data.market.title}
      subtitle={data.market.description ?? "Detailed operator view of pricing, evidence, detector reasoning, and scan-stage progression."}
      statusSlot={<ScanStateBadge state={data.market.scanState} />}
    >
      <div className="space-y-8">
        <LiveMonitor />

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[32px] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-[var(--panel-shadow)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                  {data.market.venue} {data.market.category ? `• ${data.market.category}` : ""}
                </p>
                <h2 className="mt-2 text-3xl font-semibold text-white">Pricing overview</h2>
              </div>
              <EdgeDeltaBadge edge={data.market.edge} />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              <MetaItem label="Implied probability" value={percent(data.market.currentProbability)} />
              <MetaItem label="Fair probability" value={percent(data.market.fairProbability)} />
              <MetaItem label="Resolution" value={formatDateTime(data.market.resolutionDate)} />
              <MetaItem label="Last refresh" value={formatDateTime(data.market.updatedAt)} href={data.market.marketUrl} />
            </div>

            <div className="mt-6 rounded-3xl border border-[var(--border)] bg-[rgba(255,255,255,0.92)] p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Fair value drift</p>
              <MiniSparkline
                values={data.market.probabilityHistory.map((point) => point.fairProbability)}
                className="mt-5 h-36 w-full"
              />
            </div>
          </div>

          <OpportunityCard item={data.market} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-6">
            <div className="rounded-[32px] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-[var(--panel-shadow)]">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">Lifecycle</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Scan progression</h2>
              <div className="mt-6 space-y-4">
                {data.scanStages.map((stage) => (
                  <div key={stage.label} className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[rgba(255,255,255,0.92)] px-4 py-4">
                    <span
                      className={[
                        "h-3.5 w-3.5 rounded-full",
                        stage.state === "done"
                          ? "bg-emerald-400"
                          : stage.state === "active"
                            ? "status-pulse bg-cyan-400"
                            : "bg-zinc-600",
                      ].join(" ")}
                    />
                    <div>
                      <p className="font-medium text-white">{stage.label}</p>
                      <p className="text-sm text-[var(--muted)]">{stage.state}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-[var(--panel-shadow)]">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">Detector</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Reasoning and quality</h2>
              <div className="mt-5 space-y-4">
                <ConfidenceMeter value={data.market.confidence} />
                <ConfidenceMeter value={data.market.sourceQuality} />
                <ConfidenceMeter value={data.market.freshness} />
                <DetectorReasonList reasons={data.market.reasonCodes} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[32px] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-[var(--panel-shadow)]">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">Evidence</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Evidence timeline</h2>
              <div className="mt-5">
                <EvidenceTimeline items={data.evidenceTimeline} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function MetaItem({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[rgba(255,255,255,0.92)] p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">{label}</p>
      {href ? (
        <a href={href} target="_blank" rel="noreferrer" className="mt-3 block break-all text-base font-semibold text-white hover:text-cyan-300">
          {value}
        </a>
      ) : (
        <p className="mt-3 text-base font-semibold text-white">{value}</p>
      )}
    </div>
  );
}
