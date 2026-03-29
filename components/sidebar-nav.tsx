import Link from "next/link";
import { Activity, CandlestickChart, ChartColumn, LayoutDashboard, Radar } from "lucide-react";

const items = [
  { href: "/", label: "Scanner", icon: LayoutDashboard },
  { href: "/markets", label: "Coverage", icon: CandlestickChart },
  { href: "/signals", label: "Signals", icon: Radar },
  { href: "/activity", label: "Activity", icon: Activity },
];

export function SidebarNav({ activePath }: { activePath: string }) {
  return (
    <aside className="sticky top-0 flex h-screen flex-col justify-between bg-[rgba(255,255,255,0.78)] px-5 py-6 backdrop-blur">
      <div>
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--panel-strong)] p-5 shadow-[var(--panel-shadow)]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2fa2ff,#2ad28a)] text-black">
              <ChartColumn className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">Prediction Signal</p>
              <p className="text-lg font-semibold text-white">Scanner</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
            Limitless Exchange · Base prediction-market scanner for fair-value drift, conviction tags, and fast trade triage.
          </p>
        </div>

        <nav className="mt-8 space-y-2">
          {items.map((item) => {
            const active = activePath === item.href || (item.href !== "/" && activePath.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition",
                  active
                    ? "border-[rgba(17,120,242,0.24)] bg-[rgba(17,120,242,0.08)] text-[var(--foreground)] shadow-[0_0_0_1px_rgba(17,120,242,0.08)]"
                    : "border-transparent text-[var(--muted)] hover:border-[var(--border)] hover:bg-[rgba(17,32,51,0.04)] hover:text-[var(--foreground)]",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="rounded-3xl border border-[var(--border)] bg-[var(--panel-strong)] p-4 shadow-[var(--panel-shadow)]">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Coverage lanes</p>
        <div className="mt-4 space-y-3 text-sm text-[var(--muted)]">
          <div className="rounded-2xl border border-[var(--border)] bg-[rgba(255,255,255,0.92)] px-3 py-3 text-[var(--foreground)]">Crypto scanner live</div>
          <div className="rounded-2xl border border-dashed border-[var(--border)] px-3 py-3">Stocks lane planned</div>
          <div className="rounded-2xl border border-dashed border-[var(--border)] px-3 py-3">Commodities lane planned</div>
        </div>
      </div>
    </aside>
  );
}
