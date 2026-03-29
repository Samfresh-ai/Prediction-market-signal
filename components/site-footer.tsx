export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)] px-8 py-8">
      <div className="rounded-[28px] border border-[var(--border)] bg-[var(--panel)] px-6 py-5 shadow-[var(--panel-shadow)]">
        <p className="text-sm leading-7 text-[var(--foreground)]">
          Prediction Signal detects when market odds look mispriced relative to real-world data. Not financial advice.
        </p>
        <p className="mt-3 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
          Idea by Samfresh. Built by Lauki.
        </p>
      </div>
    </footer>
  );
}
