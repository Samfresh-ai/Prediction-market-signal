import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Prediction Signal",
  description: "Limitless Exchange Base prediction-market scanner for fair-value drift, scanner signals, reason codes, and fast trade triage.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
