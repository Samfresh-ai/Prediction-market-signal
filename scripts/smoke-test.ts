import { getActivityView, getDashboardView, getMarketDetailView, getMarketsOverviewView, getSignalsView } from "@/server/intel";
import { GET as getSummary } from "@/app/api/summary/route";
import { GET as getMarkets } from "@/app/api/markets/route";
import { GET as getMarket } from "@/app/api/markets/[id]/route";
import { GET as getEvidence } from "@/app/api/markets/[id]/evidence/route";
import { GET as getSignal } from "@/app/api/markets/[id]/signal/route";

async function main() {
  const dashboard = await getDashboardView();
  if (!dashboard.markets.length) {
    throw new Error("No markets returned by dashboard view");
  }

  const marketWithMarkup = dashboard.markets.find((market) => /<\/?[a-z][^>]*>/i.test(market.description ?? ""));
  if (marketWithMarkup) {
    throw new Error(`Market description contains raw HTML: ${marketWithMarkup.id}`);
  }

  const marketId = dashboard.markets[0].id;
  const marketsOverview = await getMarketsOverviewView();
  const signalsView = await getSignalsView();
  const activityView = await getActivityView();
  const marketDetail = await getMarketDetailView(marketId);

  if (!marketDetail) {
    throw new Error(`Market detail missing for ${marketId}`);
  }

  const summaryRes = await getSummary();
  const marketsRes = await getMarkets();
  const marketRes = await getMarket(new Request(`http://localhost/api/markets/${marketId}`), {
    params: Promise.resolve({ id: marketId }),
  });
  const evidenceRes = await getEvidence(new Request(`http://localhost/api/markets/${marketId}/evidence`), {
    params: Promise.resolve({ id: marketId }),
  });
  const signalRes = await getSignal(new Request(`http://localhost/api/markets/${marketId}/signal`), {
    params: Promise.resolve({ id: marketId }),
  });

  const [summaryJson, marketsJson, marketJson, evidenceJson, signalJson] = await Promise.all([
    summaryRes.json(),
    marketsRes.json(),
    marketRes.json(),
    evidenceRes.json(),
    signalRes.json(),
  ]);

  const marketObservations = dashboard.stats.marketObservations;
  for (const [name, value] of Object.entries({
    allTime: marketObservations.allTime,
    last24Hours: marketObservations.last24Hours,
    successfulScans: marketObservations.successfulScans,
  })) {
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new Error(`Market observation metric ${name} must be a non-negative safe integer`);
    }
  }

  if (
    summaryJson.stats?.marketObservations?.allTime !== marketObservations.allTime ||
    summaryJson.stats?.marketObservations?.last24Hours !== marketObservations.last24Hours
  ) {
    throw new Error("Dashboard and summary market-observation metrics do not match");
  }

  if (
    marketObservations.latestObservedAt &&
    dashboard.stats.lastSyncAt?.getTime() !== marketObservations.latestObservedAt.getTime()
  ) {
    throw new Error("Last scan must match the latest successful market observation");
  }

  console.log(
    JSON.stringify(
      {
        dashboardMarkets: dashboard.markets.length,
        dashboardOpportunities: dashboard.opportunities.length,
        overviewMarkets: marketsOverview.markets.length,
        signalsListed: signalsView.signals.length,
        activityItems: activityView.activity.length,
        marketDetailState: marketDetail.market.scanState,
        summaryMarketCount: summaryJson.stats?.monitoredMarkets ?? null,
        marketObservationsAllTime: marketObservations.allTime,
        marketObservationsLast24Hours: marketObservations.last24Hours,
        successfulMarketScans: marketObservations.successfulScans,
        apiMarketsCount: Array.isArray(marketsJson.markets) ? marketsJson.markets.length : null,
        apiMarketId: marketJson.market?.id ?? null,
        apiEvidenceCount: Array.isArray(evidenceJson.evidence) ? evidenceJson.evidence.length : null,
        apiSignalStatus: signalJson.signal?.status ?? null,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
