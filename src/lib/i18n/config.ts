export const locales = ["en", "nl"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

// Locale labels for UI
export const localeLabels: Record<Locale, string> = {
  en: "English",
  nl: "Nederlands",
};

// Locale-specific formatting
export const localeConfig = {
  en: {
    currency: "USD",
    currencySymbol: "$",
    dateFormat: "MM/dd/yyyy",
    numberFormat: "en-US",
    rtl: false,
  },
  nl: {
    currency: "EUR",
    currencySymbol: "€",
    dateFormat: "dd/MM/yyyy",
    numberFormat: "nl-NL",
    rtl: false,
  },
} as const;

// Route mapping for locale-specific paths
export const routeMapping = {
  dashboard: {
    en: "/dashboard",
    nl: "/dashboard",
  },
  reports: {
    en: "/reports",
    nl: "/rapporten",
  },
  settings: {
    en: "/settings",
    nl: "/instellingen",
  },
} as const;
