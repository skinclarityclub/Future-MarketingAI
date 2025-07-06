"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { type Locale, defaultLocale, locales } from "./config";
import { getDictionary, type Dictionary } from "./dictionaries";

interface LocaleContextType {
  locale: Locale;
  dictionary: Dictionary | null;
  setLocale: (locale: Locale) => void;
  isLoading: boolean;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

interface LocaleProviderProps {
  children: React.ReactNode;
  initialLocale?: Locale;
}

export function LocaleProvider({
  children,
  initialLocale = defaultLocale,
}: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [dictionary, setDictionary] = useState<Dictionary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load dictionary when locale changes
  useEffect(() => {
    let isMounted = true;

    const loadDictionary = async () => {
      setIsLoading(true);
      try {
        const dict = await getDictionary(locale);
        if (isMounted) {
          setDictionary(dict);
        }
      } catch (error) {
        console.error("Failed to load dictionary:", error);
        // Fallback to default locale
        if (locale !== defaultLocale && isMounted) {
          const fallbackDict = await getDictionary(defaultLocale);
          setDictionary(fallbackDict);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDictionary();

    return () => {
      isMounted = false;
    };
  }, [locale]);

  // Persist locale preference
  const setLocale = (newLocale: Locale) => {
    if (locales.includes(newLocale)) {
      setLocaleState(newLocale);
      localStorage.setItem("preferred-locale", newLocale);
    }
  };

  // Load saved locale preference on mount
  useEffect(() => {
    const savedLocale = localStorage.getItem("preferred-locale") as Locale;
    if (savedLocale && locales.includes(savedLocale)) {
      setLocaleState(savedLocale);
    }
  }, []);

  const value: LocaleContextType = {
    locale,
    dictionary,
    setLocale,
    isLoading,
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

// Translation helper hook
export function useTranslation() {
  const { dictionary, locale, isLoading } = useLocale();

  const t = (path: string): string => {
    if (!dictionary || isLoading) return path;

    const keys = path.split(".");
    let value: any = dictionary;

    for (const key of keys) {
      if (value && typeof value === "object" && key in value) {
        value = value[key];
      } else {
        return path; // Return path if translation not found
      }
    }

    return typeof value === "string" ? value : path;
  };

  return { t, locale, isLoading };
}
