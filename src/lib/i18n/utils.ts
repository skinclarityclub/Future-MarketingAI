import { type Locale, locales, defaultLocale, localeConfig } from "./config";

/**
 * Get the locale from pathname
 */
export function getLocaleFromPathname(pathname: string): Locale {
  const segments = pathname.split("/");
  const potentialLocale = segments[1];

  // Check if the first segment is a valid locale
  if (potentialLocale && Object.keys(localeConfig).includes(potentialLocale)) {
    return potentialLocale as Locale;
  }

  return "en"; // Default fallback
}

/**
 * Generate a localized pathname
 */
export function getLocalizedPathname(pathname: string, locale: Locale): string {
  const segments = pathname.split("/");
  const currentLocale = getLocaleFromPathname(pathname);

  if (currentLocale && segments[1] === currentLocale) {
    // Replace the current locale
    segments[1] = locale;
  } else {
    // Add locale as first segment
    segments.splice(1, 0, locale);
  }

  return segments.join("/");
}

/**
 * Format currency according to locale
 */
export function formatCurrency(
  amount: number,
  locale: Locale = "en",
  options?: Intl.NumberFormatOptions
): string {
  const config = localeConfig[locale];

  return new Intl.NumberFormat(config.numberFormat, {
    style: "currency",
    currency: config.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  }).format(amount);
}

/**
 * Format percentage according to locale
 */
export function formatPercentage(
  value: number,
  locale: Locale = "en",
  options?: Intl.NumberFormatOptions
): string {
  const config = localeConfig[locale];

  return new Intl.NumberFormat(config.numberFormat, {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
    ...options,
  }).format(value / 100);
}

/**
 * Format regular numbers according to locale
 */
export function formatNumber(
  value: number,
  locale: Locale = "en",
  options?: Intl.NumberFormatOptions
): string {
  const config = localeConfig[locale];

  return new Intl.NumberFormat(config.numberFormat, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  }).format(value);
}

/**
 * Format date according to locale
 */
export function formatDate(
  date: Date | string,
  locale: Locale = "en",
  options?: Intl.DateTimeFormatOptions
): string {
  const config = localeConfig[locale];
  const dateObj = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat(config.numberFormat, {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  }).format(dateObj);
}

/**
 * Format relative time according to locale
 */
export function formatRelativeTime(
  date: Date | string,
  locale: Locale = "en",
  options?: Intl.RelativeTimeFormatOptions
): string {
  const config = localeConfig[locale];
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = (dateObj.getTime() - now.getTime()) / 1000;

  const rtf = new Intl.RelativeTimeFormat(config.numberFormat, {
    numeric: "auto",
    ...options,
  });

  // Determine the appropriate unit
  const absDiff = Math.abs(diffInSeconds);

  if (absDiff < 60) {
    return rtf.format(Math.round(diffInSeconds), "second");
  } else if (absDiff < 3600) {
    return rtf.format(Math.round(diffInSeconds / 60), "minute");
  } else if (absDiff < 86400) {
    return rtf.format(Math.round(diffInSeconds / 3600), "hour");
  } else if (absDiff < 2592000) {
    return rtf.format(Math.round(diffInSeconds / 86400), "day");
  } else if (absDiff < 31536000) {
    return rtf.format(Math.round(diffInSeconds / 2592000), "month");
  } else {
    return rtf.format(Math.round(diffInSeconds / 31536000), "year");
  }
}

/**
 * Get currency symbol for locale
 */
export function getCurrencySymbol(locale: Locale = "en"): string {
  const config = localeConfig[locale];
  return config.currencySymbol;
}

// Remove locale from pathname
export function removeLocaleFromPathname(pathname: string): string {
  const segments = pathname.split("/");
  const potentialLocale = segments[1];

  if (locales.includes(potentialLocale as Locale)) {
    return "/" + segments.slice(2).join("/");
  }

  return pathname;
}

// Check if locale is valid
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}
