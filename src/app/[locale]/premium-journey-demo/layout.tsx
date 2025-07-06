import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Complete Growth Platform Demo | Marketing Machine + BI Dashboard",
  description:
    "Interactive demo van onze Complete Growth Platform - Marketing Machine + BI Dashboard bundel voor €25k/maand met €5k besparing.",
  keywords:
    "Complete Growth Platform, Marketing Machine, BI Dashboard, bundel, €25k, scale-up, groei platform",
};

export default function PremiumJourneyDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
