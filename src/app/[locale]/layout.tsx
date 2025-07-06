import type { Metadata, Viewport } from "next";
import "../globals.css";
import { BehaviorTrackingProvider } from "@/lib/analytics/behavior-tracking-provider";
import { LocaleProvider } from "@/lib/i18n/context";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { type Locale, locales } from "@/lib/i18n/config";
import { notFound } from "next/navigation";
import { ThemeProvider } from "@/components/ui/light-theme-provider";
import { DashboardModeProvider } from "@/lib/contexts/dashboard-mode-context";
import { AssetOptimizationInit } from "@/components/ui/asset-optimization-init";

export const metadata: Metadata = {
  title: "FutureMarketingAI - Transform Business Growth. Fortune 500 Powered.",
  description:
    "Enterprise-grade AI marketing automation for Fortune 500-level growth. Schedule a conversation to discover how our premium platform revolutionizes your marketing strategy at scale.",
  keywords: [
    "AI marketing",
    "Fortune 500 marketing",
    "enterprise automation",
    "business growth AI",
    "premium marketing platform",
    "content automation",
    "marketing analytics",
    "enterprise software",
    "business intelligence",
    "growth optimization",
  ],
  authors: [
    {
      name: "SKC Intelligence",
      url: "https://skc.nl",
    },
  ],
  creator: "SKC Intelligence",
  publisher: "FutureMarketingAI by SKC Intelligence",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://futuremarketingai.com"),
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/en",
      "nl-NL": "/nl",
    },
  },
  openGraph: {
    title:
      "FutureMarketingAI - Transform Business Growth. Fortune 500 Powered.",
    description:
      "Enterprise-grade AI marketing automation for Fortune 500-level growth. Schedule a conversation today.",
    url: "https://futuremarketingai.com",
    siteName: "FutureMarketingAI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FutureMarketingAI - Enterprise AI Marketing Platform",
      },
      {
        url: "/og-image-square.png",
        width: 1200,
        height: 1200,
        alt: "FutureMarketingAI Enterprise Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "FutureMarketingAI - Transform Business Growth. Fortune 500 Powered.",
    description:
      "Enterprise-grade AI marketing automation for Fortune 500-level growth.",
    creator: "@FutureMarketingAI",
    images: ["/twitter-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  other: {
    "msapplication-TileColor": "#0f172a",
    "theme-color": "#0f172a",
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
  category: "technology",
  referrer: "origin-when-cross-origin",
  bookmarks: ["https://futuremarketingai.com"],
  applicationName: "FutureMarketingAI",
  generator: "Next.js",
  abstract:
    "Enterprise AI marketing platform delivering Fortune 500-level automation and growth optimization.",
  classification: "Business Software",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FutureMarketingAI",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

// Generate static params for all locales
export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Await the params in Next.js 15
  const { locale: localeParam } = await params;

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(localeParam as Locale)) {
    notFound();
  }

  const locale = localeParam as Locale;
  const dictionary = await getDictionary(locale);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="skc-theme">
      <LocaleProvider initialLocale={locale} initialDictionary={dictionary}>
        <DashboardModeProvider>
          <BehaviorTrackingProvider
            config={{
              enabled: true, // Re-enabled with improved error handling
              endpoint_url: "/api/tracking/events",
              batch_size: 20,
              flush_interval: 30000,
              sample_rate: 1.0,
              storage_type: "sessionStorage",
              include_pii: false,
            }}
            enabled={true} // Re-enabled with improved error handling
          >
            <AssetOptimizationInit />
            {children}
          </BehaviorTrackingProvider>
        </DashboardModeProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}
