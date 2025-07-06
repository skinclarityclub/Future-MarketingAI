"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { type Locale } from "./config";
import { getLocaleFromPathname, getLocalizedPathname } from "./utils";
import type { Dictionary } from "./dictionaries";

interface LocaleContextType {
  locale: Locale;
  dictionary: Dictionary | null;
  changeLocale: (newLocale: Locale) => void;
  t: (path: string) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

interface LocaleProviderProps {
  children: React.ReactNode;
  initialLocale: Locale;
  initialDictionary: Dictionary;
}

export function LocaleProvider({
  children,
  initialLocale,
  initialDictionary,
}: LocaleProviderProps) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [dictionary, setDictionary] = useState<Dictionary | null>(
    initialDictionary
  );
  const router = useRouter();
  const pathname = usePathname();

  // Initialize locale provider
  useEffect(() => {
    // Locale provider initialization complete
  }, []);

  // Update dictionary when locale changes
  useEffect(() => {
    if (locale !== initialLocale) {
      // In a real app, you'd fetch the new dictionary here
      // For now, we'll use the initial dictionary
      setDictionary(initialDictionary);
    }
  }, [locale, initialLocale, initialDictionary]);

  const changeLocale = (newLocale: Locale) => {
    if (newLocale === locale) return;

    // Get the new pathname with the new locale
    const newPathname = getLocalizedPathname(pathname, newLocale);

    // Navigate to the new locale
    router.push(newPathname);
  };

  // Helper function to get nested translation values
  const t = (path: string): string => {
    // Use current dictionary state, not the initial one
    const currentDict = dictionary || initialDictionary;

    if (!currentDict) {
      // Dictionary is null - falling back to key
      return path;
    }

    const keys = path.split(".");
    let value: any = currentDict;

    for (const key of keys) {
      if (value && typeof value === "object" && key in value) {
        value = value[key];
      } else {
        console.warn(
          `Translation key "${path}" not found in dictionary for locale "${locale}"`
        );
        return path;
      }
    }

    return typeof value === "string" ? value : path;
  };

  useEffect(() => {
    const currentLocale = getLocaleFromPathname(pathname);
    if (currentLocale !== locale) {
      setLocale(currentLocale);
    }
  }, [pathname, locale]);

  const value: LocaleContextType = {
    locale,
    dictionary,
    changeLocale,
    t,
  };

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}
