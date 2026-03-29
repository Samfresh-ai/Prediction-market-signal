import { Bell, Search, SlidersHorizontal } from "lucide-react";

import { RunAnalysisButton } from "@/components/run-analysis-button";

export function TopCommandBar() {
  return (
    <div className="terminal-sheen sticky top-0 z-20 border-b border-[var(--border)] bg-[rgba(255,255,255,0.78)] px-8 py-4 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-[320px] flex-1 items-center gap-3 rounded-2xl border border-[var(--border)] bg-[rgba(17,32,51,0.04)] px-4 py-3 text-sm text-[var(--muted)]">
          <Search className="h-4 w-4" />
          Scan markets, signals, theses, invalidations, and reason codes
        </div>
        <div className="flex items-center gap-3">
          <button className="rounded-2xl border border-[var(--border)] bg-[rgba(17,32,51,0.04)] p-3 text-[var(--muted)] transition hover:text-[var(--foreground)]">
            <SlidersHorizontal className="h-4 w-4" />
          </button>
          <button className="rounded-2xl border border-[var(--border)] bg-[rgba(17,32,51,0.04)] p-3 text-[var(--muted)] transition hover:text-[var(--foreground)]">
            <Bell className="h-4 w-4" />
          </button>
          <RunAnalysisButton />
        </div>
      </div>
    </div>
  );
}
