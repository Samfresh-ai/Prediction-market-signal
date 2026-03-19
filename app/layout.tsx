import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Base Intel Odds Terminal",
  description: "Live market intelligence terminal for Base prediction markets, evidence pipelines, and stale-odds signal detection.",
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
