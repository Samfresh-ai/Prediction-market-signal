import type { Prisma } from "@prisma/client";

import { prisma, withPrismaReconnect } from "@/server/db/client";
import { toNumber } from "@/server/db/helpers";
import { clamp } from "@/lib/utils";

export type ScanState =
  | "monitoring"
  | "evidence_found"
  | "evaluating"
  | "watch"
  | "signal"
  | "contradicted"
  | "stale";

type ActivityTone = "critical" | "positive" | "warning" | "neutral";

type MarketWithRelations = Awaited<ReturnType<typeof loadMarkets>>[number];

const marketQuery = {
  include: {
    _count: {
      select: {
        evidenceItems: true,
        signals: true,
      },
    },
    evidenceItems: {
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 6,
    },
    signals: {
      orderBy: { createdAt: "desc" },
      take: 8,
    },
  },
  orderBy: { updatedAt: "desc" },
} satisfies Prisma.MarketFindManyArgs;

const recentLogsQuery = {
  orderBy: { startedAt: "desc" },
  take: 24,
} satisfies Prisma.IngestionLogFindManyArgs;

const recentEvidenceQuery = {
  include: { market: true },
  orderBy: { createdAt: "desc" },
  take: 16,
} satisfies Prisma.EvidenceItemFindManyArgs;

const recentSignalsQuery = {
  include: { market: true },
  orderBy: { createdAt: "desc" },
  take: 16,
} satisfies Prisma.SignalFindManyArgs;

function hoursSince(date: Date | null | undefined) {
  if (!date) {
    return Number.POSITIVE_INFINITY;
  }

  return (Date.now() - date.getTime()) / (1000 * 60 * 60);
}

function computeFreshnessScore(date: Date | null | undefined) {
  if (!date) {
    return 0;
  }

  return clamp(1 - hoursSince(date) / 6, 0, 1);
}

function deriveScanState(market: MarketWithRelations): ScanState {
  const latestSignal = market.signals[0];
  const latestEvidence = market.evidenceItems[0];
  const latestUpdatedAt = latestSignal?.createdAt ?? latestEvidence?.createdAt ?? market.lastPolledAt ?? market.updatedAt;
  const stale = hoursSince(latestUpdatedAt) > 3;

  if (stale) {
    return "stale";
  }

  if (latestSignal?.status === "signal") {
    return "signal";
  }

  if (latestSignal?.status === "watch") {
    return "watch";
  }

  const latestEdge = toNumber(latestSignal?.edge) ?? 0;

  if (latestEvidence && latestSignal && latestEdge < -0.03) {
    return "contradicted";
  }

  if (latestEvidence && latestSignal) {
    return "evaluating";
  }

  if (latestEvidence) {
    return "evidence_found";
  }

  return "monitoring";
}

function buildMarketRow(market: MarketWithRelations) {
  const latestSignal = market.signals[0] ?? null;
  const latestEvidence = market.evidenceItems[0] ?? null;
  const freshness = computeFreshnessScore(
    latestEvidence?.publishedAt ?? latestEvidence?.createdAt ?? latestSignal?.createdAt ?? market.lastPolledAt,
  );
  const evidenceQuality =
    market.evidenceItems.length === 0
      ? 0
      : market.evidenceItems.reduce(
          (sum, item) => sum + (toNumber(item.trustScore) ?? 0) * (toNumber(item.relevanceScore) ?? 0),
          0,
        ) / market.evidenceItems.length;

  return {
    id: market.id,
    externalId: market.externalId,
    title: market.title,
    description: market.description,
    venue: market.venue,
    category: market.category,
    marketUrl: market.marketUrl,
    resolutionDate: market.resolutionDate,
    currentProbability: toNumber(market.currentProbability) ?? 0,
    fairProbability: toNumber(latestSignal?.fairProbability) ?? toNumber(market.currentProbability) ?? 0,
    edge: toNumber(latestSignal?.edge) ?? 0,
    confidence: toNumber(latestSignal?.confidence) ?? 0,
    signalStatus: latestSignal?.status ?? "no_signal",
    scanState: deriveScanState(market),
    thesis:
      latestSignal?.thesis ??
      (latestEvidence
        ? "Fresh evidence has been mapped and is waiting for a stronger detector conviction."
        : "Monitoring this market for fresh evidence and pricing drift."),
    reasonCodes: normalizeReasonCodes(latestSignal?.reasonCodes),
    evidenceCount: market._count.evidenceItems,
    signalCount: market._count.signals,
    sourceQuality: clamp(evidenceQuality, 0, 1),
    freshness,
    updatedAt: market.updatedAt,
    lastPolledAt: market.lastPolledAt,
    latestEvidence: latestEvidence
      ? {
          id: latestEvidence.id,
          title: latestEvidence.title,
          sourceName: latestEvidence.sourceName,
          sourceType: latestEvidence.sourceType,
          summary: latestEvidence.summary,
          trustScore: toNumber(latestEvidence.trustScore) ?? 0,
          relevanceScore: toNumber(latestEvidence.relevanceScore) ?? 0,
          publishedAt: latestEvidence.publishedAt,
          createdAt: latestEvidence.createdAt,
          url: latestEvidence.url,
        }
      : null,
    probabilityHistory: [
      ...market.signals
        .slice()
        .reverse()
        .map((signal) => ({
          label: signal.createdAt.toISOString(),
          fairProbability: toNumber(signal.fairProbability) ?? 0,
          edge: toNumber(signal.edge) ?? 0,
        })),
      {
        label: market.updatedAt.toISOString(),
        fairProbability: toNumber(latestSignal?.fairProbability) ?? toNumber(market.currentProbability) ?? 0,
        edge: toNumber(latestSignal?.edge) ?? 0,
      },
    ].slice(-8),
  };
}

async function loadMarkets() {
  return prisma.market.findMany(marketQuery);
}

async function loadRecentActivity(logsOverride?: Awaited<ReturnType<typeof prisma.ingestionLog.findMany>>) {
  const logs = logsOverride?.slice(0, 20) ?? (await prisma.ingestionLog.findMany({ ...recentLogsQuery, take: 20 }));
  const [evidenceItems, signals] = await prisma.$transaction([
    prisma.evidenceItem.findMany(recentEvidenceQuery),
    prisma.signal.findMany(recentSignalsQuery),
  ]);

  const activity: Array<{
    id: string;
    kind: string;
    title: string;
    description: string;
    timestamp: Date;
    tone: ActivityTone;
  }> = [
    ...logs.map((log) => ({
      id: `log-${log.id}`,
      kind: "system",
      title: log.type.replaceAll("_", " "),
      description: `${log.status.toUpperCase()}${log.completedAt ? " • completed" : " • in progress"}`,
      timestamp: log.completedAt ?? log.startedAt,
      tone: (log.status === "error" ? "critical" : log.status === "success" ? "positive" : "neutral") as ActivityTone,
    })),
    ...evidenceItems.map((item) => ({
      id: `evidence-${item.id}`,
      kind: "evidence",
      title: `Evidence mapped to ${item.market.title}`,
      description: `${item.sourceName} • ${item.summary}`,
      timestamp: item.createdAt,
      tone: "neutral" as ActivityTone,
    })),
    ...signals.map((signal) => ({
      id: `signal-${signal.id}`,
      kind: "signal",
      title: `${signal.status.toUpperCase()} on ${signal.market.title}`,
      description: signal.thesis,
      timestamp: signal.createdAt,
      tone: (signal.status === "signal" ? "positive" : signal.status === "watch" ? "warning" : "neutral") as ActivityTone,
    })),
  ]
    .sort((left, right) => right.timestamp.getTime() - left.timestamp.getTime())
    .slice(0, 24);

  return activity;
}

function buildHealth(logs: Awaited<ReturnType<typeof prisma.ingestionLog.findMany>>) {
  const latestByType = new Map<string, (typeof logs)[number]>();
  for (const log of logs) {
    if (!latestByType.has(log.type)) {
      latestByType.set(log.type, log);
    }
  }

  const latencySamples = logs
    .filter((log) => log.completedAt)
    .map((log) => log.completedAt!.getTime() - log.startedAt.getTime());

  const averageLatencyMs =
    latencySamples.length > 0
      ? Math.round(latencySamples.reduce((sum, value) => sum + value, 0) / latencySamples.length)
      : 0;

  return {
    averageLatencyMs,
    byType: [...latestByType.entries()].map(([type, log]) => ({
      type,
      status: log.status,
      startedAt: log.startedAt,
      completedAt: log.completedAt,
    })),
  };
}

function buildDashboardStats(markets: ReturnType<typeof buildMarketRow>[], marketsRaw: Awaited<ReturnType<typeof loadMarkets>>, logsRaw: Awaited<ReturnType<typeof prisma.ingestionLog.findMany>>) {
  const watchCount = markets.filter((market) => market.scanState === "watch").length;
  const signalCount = markets.filter((market) => market.scanState === "signal").length;
  const staleCount = markets.filter((market) => market.scanState === "stale").length;
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const freshEvidenceToday = marketsRaw.reduce(
    (sum, market) => sum + market.evidenceItems.filter((item) => item.createdAt >= since).length,
    0,
  );
  const averageConfidence =
    markets.length > 0
      ? markets.reduce((sum, market) => sum + market.confidence, 0) / markets.length
      : 0;
  const health = buildHealth(logsRaw);

  return {
    monitoredMarkets: markets.length,
    watchCount,
    signalCount,
    staleCount,
    averageConfidence,
    freshEvidenceToday,
    averageLatencyMs: health.averageLatencyMs,
    liveMode: "Interval scanning",
    lastSyncAt: markets[0]?.updatedAt ?? logsRaw[0]?.completedAt ?? logsRaw[0]?.startedAt ?? new Date(),
  };
}

export async function getDashboardView() {
  return withPrismaReconnect(async () => {
    const marketsRaw = await loadMarkets();
    const logsRaw = await prisma.ingestionLog.findMany({ ...recentLogsQuery, take: 20 });
    const activity = await loadRecentActivity(logsRaw);

    const markets = marketsRaw.map(buildMarketRow);
    const stats = buildDashboardStats(markets, marketsRaw, logsRaw);
    const health = buildHealth(logsRaw);

    return {
      markets,
      opportunities: markets
        .filter((market) => ["watch", "signal", "contradicted", "evaluating"].includes(market.scanState))
        .sort((left, right) => Math.abs(right.edge) * right.confidence - Math.abs(left.edge) * left.confidence)
        .slice(0, 6),
      activity,
      health,
      stats,
      lifecycleBreakdown: [
        "monitoring",
        "evidence_found",
        "evaluating",
        "watch",
        "signal",
        "contradicted",
        "stale",
      ].map((state) => ({
        state,
        count: markets.filter((market) => market.scanState === state).length,
      })),
    };
  });
}

export async function getLiveSummary() {
  return withPrismaReconnect(async () => {
    const marketsRaw = await loadMarkets();
    const logsRaw = await prisma.ingestionLog.findMany({ ...recentLogsQuery, take: 18 });

    const markets = marketsRaw.map(buildMarketRow);
    const stats = buildDashboardStats(markets, marketsRaw, logsRaw);
    const health = buildHealth(logsRaw);

    return {
      stats,
      pipeline: health.byType,
    };
  });
}

export async function getMarketsOverviewView() {
  return withPrismaReconnect(async () => {
    const markets = (await loadMarkets()).map(buildMarketRow);
    return { markets };
  });
}

export async function getSignalsView() {
  return withPrismaReconnect(async () => {
    const markets = (await loadMarkets()).map(buildMarketRow);
    return {
      signals: markets.sort(
        (left, right) => Math.abs(right.edge) * (right.confidence || 0.1) - Math.abs(left.edge) * (left.confidence || 0.1),
      ),
    };
  });
}

export async function getActivityView() {
  return withPrismaReconnect(async () => {
    const logs = await prisma.ingestionLog.findMany(recentLogsQuery);
    const activity = await loadRecentActivity(logs);

    return {
      activity,
      health: buildHealth(logs),
    };
  });
}

export async function getMarketDetailView(id: string) {
  return withPrismaReconnect(async () => {
    const market = await prisma.market.findUnique({
      where: { id },
      include: {
        _count: {
          select: { evidenceItems: true, signals: true },
        },
        evidenceItems: {
          orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
          take: 20,
        },
        signals: {
          orderBy: { createdAt: "desc" },
          take: 12,
        },
      },
    });

    if (!market) {
      return null;
    }

    const marketRow = buildMarketRow(market as MarketWithRelations);
    const history = market.signals
      .slice()
      .reverse()
      .map((signal) => ({
        id: signal.id,
        createdAt: signal.createdAt,
        fairProbability: toNumber(signal.fairProbability) ?? 0,
        edge: toNumber(signal.edge) ?? 0,
        confidence: toNumber(signal.confidence) ?? 0,
        status: signal.status,
      }));

    const evidenceTimeline = market.evidenceItems.map((item) => ({
      id: item.id,
      title: item.title,
      summary: item.summary,
      sourceName: item.sourceName,
      sourceType: item.sourceType,
      trustScore: toNumber(item.trustScore) ?? 0,
      relevanceScore: toNumber(item.relevanceScore) ?? 0,
      publishedAt: item.publishedAt,
      createdAt: item.createdAt,
      url: item.url,
    }));

    return {
      market: marketRow,
      history,
      evidenceTimeline,
      scanStages: [
        { label: "Monitoring", state: marketRow.scanState === "monitoring" || marketRow.scanState === "stale" ? "active" : "done" },
        { label: "Evidence collected", state: ["evidence_found", "evaluating", "watch", "signal", "contradicted"].includes(marketRow.scanState) ? "done" : "pending" },
        { label: "Evaluating", state: ["evaluating", "watch", "signal", "contradicted"].includes(marketRow.scanState) ? "done" : "pending" },
        { label: "Watch", state: marketRow.scanState === "watch" ? "active" : ["signal", "contradicted"].includes(marketRow.scanState) ? "done" : "pending" },
        { label: "Signal", state: marketRow.scanState === "signal" ? "active" : "pending" },
      ],
    };
  });
}
function normalizeReasonCodes(reasonCodes: unknown): string[] {
  if (!Array.isArray(reasonCodes)) {
    return [];
  }

  return reasonCodes.filter((value): value is string => typeof value === "string");
}
