# Prediction Signal

Prediction Signal is a Limitless Exchange scanner for Base prediction markets. It ingests live market odds, pulls external price evidence, computes fair-value drift, and presents the result as a scanner-first product with signal, watch, and clear states.

## Product shape

- Brand and positioning: `Prediction Signal` and `Limitless Exchange · Base prediction-market scanner`
- Main surface: scanner homepage with headline stats, refresh control, status filters, category filters, and sort options
- Market cards: YES and NO price, fair value, edge, confidence, thesis, invalidation, reason-code tags, 24h volume, expiry, and trade link
- Supporting views: broader coverage table, signal board, activity stream, and market detail pages

## Current scope

- Venue: Limitless on Base
- Evidence source: Coinbase public spot and 24h stats APIs
- Detector: deterministic rule-based fair-value heuristic
- Runtime: Next.js App Router with Prisma and Postgres

The app is still crypto-first in the actual ingestion and evidence pipeline. The UI now exposes category lanes closer to the live shipped product, but stocks and commodities remain future lanes until new evidence connectors are added.

## Coverage model

This repo no longer behaves like a 5-asset demo. The scanner config now covers a broader crypto universe and can keep multiple matching markets per lane, with fallback selection for other structured price-threshold markets that parse cleanly.

Current configured scanner lanes include:

- BTC
- ETH
- SOL
- XRP
- DOGE
- ADA
- AVAX
- LINK
- LTC
- BCH
- UNI
- AAVE

If `LIMITLESS_MARKET_SLUG` is set, it still acts as a strong pin for a preferred BTC market, but the scanner otherwise works from broader keyword matching and structured market parsing.

## How it works

1. Poll active Limitless markets and normalize them into the local `Market` table.
2. Pick the best structured scanner candidates from the configured coverage universe.
3. Pull Coinbase spot and 24h stats for markets whose asset can be parsed.
4. Run the detector to estimate fair probability, edge, confidence, and reason codes.
5. Render the scanner UI from the stored market, evidence, and signal state.

## Local setup

1. Copy environment variables.
2. Install dependencies.
3. Start Postgres.
4. Generate Prisma client.
5. Apply migrations.
6. Seed or run the full pipeline.
7. Start the app.

```bash
cp .env.example .env
pnpm install
pnpm db:up
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Manual pipeline trigger:

```bash
curl -X POST http://localhost:3000/api/jobs/run-all
```

## Environment

Required:

- `DATABASE_URL`
- `DIRECT_URL`

Useful defaults from `.env.example`:

- `APP_URL=http://localhost:3000`
- `LIMITLESS_API_BASE_URL=https://api.limitless.exchange`
- `LIMITLESS_MARKETS_ENDPOINT=/markets/active`
- `LIMITLESS_MARKET_SLUG=`
- `MONITORED_MARKET_QUERY=btc`
- `COINBASE_API_BASE_URL=https://api.coinbase.com/v2`
- `COINBASE_EXCHANGE_API_BASE_URL=https://api.exchange.coinbase.com`
- `EVIDENCE_FRESHNESS_HOURS=12`
- `WATCH_EDGE_THRESHOLD=0.06`
- `SIGNAL_EDGE_THRESHOLD=0.12`
- `CONFIDENCE_THRESHOLD=0.65`
- `CRON_SECRET=`

For Neon or similar hosted Postgres:

- `DATABASE_URL` should be the pooled connection string
- `DIRECT_URL` should be the direct connection string for Prisma CLI operations

## API routes

Read routes:

- `GET /api/markets`
- `GET /api/markets/:id`
- `GET /api/markets/:id/evidence`
- `GET /api/markets/:id/signal`
- `GET /api/summary`

Job routes:

- `POST /api/jobs/poll-markets`
- `POST /api/jobs/pull-evidence`
- `POST /api/jobs/run-detector`
- `POST /api/jobs/run-all`

The job routes also accept `GET`, which makes them usable from cron.

## Deployment

### Vercel

1. Provision Postgres on Neon, Supabase, Railway, or Vercel Postgres.
2. Add the environment variables from `.env.example`.
3. Deploy the repo to Vercel.
4. Run:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

If you deploy through GitHub or Vercel CI, run migrations in CI or via a one-off shell in the target environment.

### Scheduled refresh

`vercel.json` includes a 30-minute schedule hitting `/api/jobs/run-all`.

If you need to protect scheduled requests, set `CRON_SECRET` and send it from your scheduler. If you use Vercel cron directly, leaving `CRON_SECRET` blank is the simplest path.

## Data model

Prisma models:

- `Market`
- `EvidenceItem`
- `Signal`
- `IngestionLog`

Migration SQL is checked in under `prisma/migrations`.

## Hackathon / Purch positioning

This repository is now shaped to present credibly as the shipped Prediction Signal product rather than a backend-demo terminal:

- scanner-first homepage instead of a generic operator dashboard
- clearer product branding and metadata
- broader monitored universe
- richer card fields that read like a prediction-market signal product
- explicit disclaimer and attribution copy

It is still an adapted MVP, not a full clone of the deployed build. The biggest remaining product gap is non-crypto evidence coverage for stocks and commodities.

## Validation note

This workspace may not have outbound registry or API access at execution time. If local dependency install or full pipeline execution is blocked, run the setup commands above in an environment with package registry access and a reachable Postgres instance.
