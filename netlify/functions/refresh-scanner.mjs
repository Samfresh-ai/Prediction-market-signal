async function refreshScanner() {
  const appUrl = process.env.APP_URL ?? process.env.URL;
  const cronSecret = process.env.CRON_SECRET;

  if (!appUrl || !cronSecret) {
    throw new Error("APP_URL and CRON_SECRET are required for the scheduled scanner refresh");
  }

  const response = await fetch(new URL("/api/jobs/run-all", appUrl), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cronSecret}`,
    },
    signal: AbortSignal.timeout(25_000),
  });

  if (!response.ok) {
    throw new Error(`Scheduled scanner refresh failed with ${response.status}`);
  }

  return new Response(null, { status: 204 });
}

export default refreshScanner;
