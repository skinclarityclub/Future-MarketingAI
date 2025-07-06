"use client";

import NormalButton from "@/components/ui/normal-button";
import { Globe, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

// Get locale from URL or use default
const useCurrentLocale = () => {
  const [locale, setLocale] = useState<"en" | "nl">("en");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const pathname = window.location.pathname;
      const localeFromPath = pathname.startsWith("/nl") ? "nl" : "en";
      setLocale(localeFromPath);
    }
  }, []);

  return locale;
};

const locales = ["en", "nl"] as const;
const localeLabels = {
  en: "English",
  nl: "Nederlands",
};

// Hardcoded translations
const translations = {
  en: {
    language: "Language",
    currentLanguage: "Current language",
  },
  nl: {
    language: "Taal",
    currentLanguage: "Huidige taal",
  },
};

export function LocaleSwitcher() {
  const currentLocale = useCurrentLocale();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const t = translations[currentLocale];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const changeLocale = (newLocale: "en" | "nl") => {
    let newPath;

    if (pathname.startsWith("/en") || pathname.startsWith("/nl")) {
      // Replace existing locale
      newPath = pathname.replace(/^\/(en|nl)/, `/${newLocale}`);
    } else {
      // Add locale prefix
      newPath = `/${newLocale}${pathname}`;
    }

    router.push(newPath);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <NormalButton
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 px-3 flex items-center gap-2"
        aria-label={`${t.currentLanguage}: ${localeLabels[currentLocale]}`}
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline text-sm">
          {localeLabels[currentLocale]}
        </span>
      </NormalButton>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-background border border-border rounded-lg shadow-lg py-2 z-50">
          <div className="px-3 py-1 text-xs text-muted-foreground border-b border-border mb-1">
            {t.language}
          </div>
          {locales.map(loc => (
            <NormalButton
              key={loc}
              onClick={() => {
                changeLocale(loc);
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 flex items-center justify-between cursor-pointer transition-colors"
            >
              <span>{localeLabels[loc]}</span>
              {currentLocale === loc && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </NormalButton>
          ))}
        </div>
      )}
    </div>
  );
}
