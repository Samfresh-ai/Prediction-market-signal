# Base Signal MVP

Small serious MVP for monitoring a Base prediction market, ingesting trusted evidence, and surfacing stale-odds signals in a deployable web app.

## What it does

- Polls a Base prediction market source from Limitless.
- Normalizes market data into a lean Prisma/Postgres schema.
- Pulls evidence from official Coinbase APIs for the monitored asset.
- Runs a deterministic detector that estimates fair probability, edge, confidence, and reason codes.
- Displays the result in a Next.js dashboard with market detail, evidence links, and a one-click `Run Full Analysis` control.

## Milestone scope

- One venue: Limitless on Base.
- One evidence pipeline: Coinbase public APIs.
- One detector: rule-based pricing gap heuristic.
- One app: Next.js full-stack with Prisma/Postgres.

## Architecture

- Frontend and backend: Next.js App Router
- Database: PostgreSQL + Prisma
- Jobs: API-triggered pipeline routes, with optional Vercel cron
- Deployment target: Vercel + Supabase/Neon/Railway Postgres

## Demo market configuration

The app is intentionally configured around one demo-friendly market profile:

- venue: `Limitless`
- search query: `btc`
- optional exact pin: `LIMITLESS_MARKET_SLUG`

By default the poller requests active Limitless markets and picks the best matching BTC market. If you want a fixed demo market, set `LIMITLESS_MARKET_SLUG` in `.env`.

## Environment

Copy `.env.example` to `.env` and fill in the values.

```bash
cp .env.example .env
```

Minimum required value:

- `DATABASE_URL`
- `DIRECT_URL`

Recommended defaults already included:

- `LIMITLESS_API_BASE_URL=https://api.limitless.exchange`
- `LIMITLESS_MARKETS_ENDPOINT=/markets/active`
- `MONITORED_MARKET_QUERY=btc`
- `COINBASE_API_BASE_URL=https://api.coinbase.com/v2`
- `COINBASE_EXCHANGE_API_BASE_URL=https://api.exchange.coinbase.com`

For Neon:

- `DATABASE_URL` should use the pooled connection string, typically the hostname with `-pooler`
- `DIRECT_URL` should use the direct connection string for Prisma CLI and migrations

## Local setup

1. Install dependencies.
2. Start Postgres.
3. Generate Prisma client.
4. Apply migrations.
5. Run the seed pipeline.
6. Start the app.

```bash
pnpm install
pnpm db:up
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

If you prefer to seed manually after startup:

```bash
curl -X POST http://localhost:3000/api/jobs/run-all
```

## API endpoints

Read endpoints:

- `GET /api/markets`
- `GET /api/markets/:id`
- `GET /api/markets/:id/evidence`
- `GET /api/markets/:id/signal`

Job endpoints:

- `POST /api/jobs/poll-markets`
- `POST /api/jobs/pull-evidence`
- `POST /api/jobs/run-detector`
- `POST /api/jobs/run-all`

Each job route also accepts `GET` so it can be used from Vercel Cron.

## Detector logic

The detector is deterministic and explainable:

- parses the market for asset, target price, and direction
- pulls Coinbase spot plus 24h stats
- scores evidence by trust, relevance, and freshness
- estimates fair probability from price-vs-threshold distance, 24h momentum, and deadline proximity
- emits `no_signal`, `watch`, or `signal`

Thresholds are configurable in `.env`.

## Deployment

### Vercel

1. Create a Postgres database on Supabase, Neon, Railway, or Vercel Postgres.
2. Add environment variables from `.env.example`.
3. Deploy the repo to Vercel.
4. Run:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

If you deploy through Vercel CLI or GitHub, run migrations from a CI job or one-off shell in the deployed environment.

### Cron

`vercel.json` includes a 30-minute schedule hitting `/api/jobs/run-all`.

If you want to protect scheduled routes, set `CRON_SECRET` and call the route from an external scheduler that can send headers or query params. Vercel’s built-in cron is simplest when `CRON_SECRET` is left blank.

## Data model

Prisma models included:

- `Market`
- `EvidenceItem`
- `Signal`
- `IngestionLog`

Migration SQL is checked in under `prisma/migrations`.

## Important note for this workspace

The current environment blocked registry/DNS access during implementation, so I could not complete `pnpm install` or run the app end-to-end here. The codebase is structured for that flow, but you will need working package registry access plus a reachable Postgres instance to execute the setup commands above.
