import { AppShell } from "@/components/app-shell";
import { LoadingSkeletons } from "@/components/loading-skeletons";

export default function Loading() {
  return (
    <AppShell
      activePath="/"
      eyebrow="Prediction Signal"
      title="Loading scanner surfaces"
      subtitle="Hydrating market cards, reconnecting live scan telemetry, and preparing the current market queue."
    >
      <LoadingSkeletons />
    </AppShell>
  );
}
