# Prediction Signal demo plan

Target: an evidence-led 82-second product recording for Base ecosystem reviewers at 1440×900 or 1920×1080, 30 fps. Use a $0 tool path (screen recorder, voice-over, and desktop editor), and do not publish before final approval. No submission deadline was supplied. Record the public deployment with notifications and bookmarks hidden, and use only values visible during the recording.

## Claim ledger

- `C01` — The public product loads a monitored queue of Limitless prediction markets on Base.
- `C02` — A full refresh polls markets, pulls Coinbase spot and 24-hour evidence, and runs the detector.
- `C03` — The queue filters by state and category and sorts by edge, confidence, volume, or expiry.
- `C04` — Market detail compares implied probability with estimated fair probability and exposes edge and state.
- `C05` — The estimate is inspectable through Coinbase evidence, published timestamps, detector confidence, and reason codes.
- `C06` — Activity records polling, evidence, detector status, and timestamps.
- `C07` — Market observations count deduplicated Limitless snapshots evaluated within each scan; repeat snapshots across later scans are counted.

## Scene manifest

| Scene | Time | Product action | Observable consequence | Claims | Narration / on-screen text |
|---|---:|---|---|---|---|
| S01 | 0–8s | Open the public homepage with its address visible. | Brand, live market count, last scan, observation metric, and cards render. | C01, C07 | “Prediction Signal turns Limitless markets on Base into an evidence-backed triage queue.” |
| S02 | 8–24s | Click **Refresh Full Scan**. | The button enters a pending state, then reports the actual processed-market count; telemetry, last scan, and observations update. | C02, C07 | “A full scan polls Limitless, fetches Coinbase spot and 24-hour stats, then runs a deterministic detector.” Label a cut `Live production scan · wait shortened`, or a speed-up `2×`. |
| S03 | 24–34s | Select an actually populated state filter, then change the sort. | “Showing X of Y” and card order visibly change. | C03 | “I narrow the current queue by state and rank it by edge, confidence, volume, or expiry.” |
| S04 | 34–48s | Open one real candidate. | Detail shows the real title, state, implied probability, estimated fair probability, and edge. | C04 | “The venue price sits beside the heuristic estimate and the gap between them.” |
| S05 | 48–64s | Scroll to detector and evidence. | Reason tags, detector confidence, Coinbase source evidence, summary, and published time are readable. | C05 | “The conclusion stays inspectable through source evidence, timestamp, confidence, and reason codes.” |
| S06 | 64–77s | Open **Activity**. | `poll_markets`, `pull_evidence`, and `run_detector` from the refresh show their actual statuses and timestamps. | C02, C06 | “The activity stream records each pipeline stage and when it completed.” |
| S07 | 77–82s | Return to the evidence-complete detail or normal scanner state. | A normal product state closes the recording without an unsupported outcome claim. | C01, C05 | On-screen: `Evidence before conviction.` |

## Recording gate

Before recording, verify all of the following:

1. The public URL loads without login and matches the submitted commit.
2. A full refresh returns 200 and the activity view shows successful `poll_markets`, `pull_evidence`, and `run_detector` rows.
3. At least one structured crypto market has two fresh Coinbase evidence items and a readable detail page.
4. The displayed observation count matches `/api/summary` and remains labeled as repeatable observations, never users, visitors, trades, or unique markets. Any acceptance-test refresh is QA traffic, not organic use.
5. If every detector result is clear, describe it as evaluated or clear; never force or stage a signal.
6. Use a populated status filter. Add a category-filter claim only if the live dataset visibly contains more than one category.
7. Do not interact with decorative or unfinished controls (global search, slider/settings, or notification bell) in the recording.

Exclude claims about prediction accuracy, returns, users, traders, trade execution, non-crypto coverage, or “real time” when telemetry is stale.

## Optional resilience appendix

Record this as a separate 12–15 second controlled test only when recovery proof is requested. After one successful `/api/summary` load, block only that endpoint, capture the failed poll, unblock it, and capture recovery. Shorten the two 30-second waits in the edit, and keep `Controlled telemetry test · waits shortened` on-screen throughout. Never imply the injected failure happened organically.
