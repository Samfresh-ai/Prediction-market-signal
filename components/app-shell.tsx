import type { ReactNode } from "react";

import { LiveStatusBar } from "@/components/live-status-bar";
import { SidebarNav } from "@/components/sidebar-nav";
import { TopCommandBar } from "@/components/top-command-bar";

export function AppShell({
  activePath,
  title,
  eyebrow,
  subtitle,
  children,
  statusSlot,
}: {
  activePath: string;
  title: string;
  eyebrow: string;
  subtitle: string;
  children: ReactNode;
  statusSlot?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(17,120,242,0.1),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(15,159,110,0.1),transparent_26%)]" />
      <div className="relative grid min-h-screen grid-cols-[260px_1fr]">
        <SidebarNav activePath={activePath} />
        <main className="min-w-0 border-l border-[var(--border)]">
          <TopCommandBar />
          <div className="border-b border-[var(--border)] bg-[rgba(255,255,255,0.82)] px-8 py-7 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.26em] text-[var(--muted)]">{eyebrow}</p>
            <div className="mt-3 flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-4xl">
                <h1 className="text-4xl font-semibold tracking-[-0.04em] text-white">{title}</h1>
                <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--muted)]">{subtitle}</p>
              </div>
              {statusSlot}
            </div>
          </div>
          <LiveStatusBar />
          <div className="px-8 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
