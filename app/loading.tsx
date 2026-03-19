import { AppShell } from "@/components/app-shell";
import { LoadingSkeletons } from "@/components/loading-skeletons";

export default function Loading() {
  return (
    <AppShell
      activePath="/"
      eyebrow="Initializing terminal"
      title="Loading market intelligence surfaces"
      subtitle="Hydrating the dashboard, reconnecting the live scan loop, and preparing market panels."
    >
      <LoadingSkeletons />
    </AppShell>
  );
}
