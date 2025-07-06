// Dictionary exports for i18n
export const getDictionary = async (locale: string) => {
  const dictionaries = {
    en: () => import("./en.json").then(module => module.default),
    nl: () => import("./nl.json").then(module => module.default),
  };

  return (
    dictionaries[locale as keyof typeof dictionaries]?.() || dictionaries.en()
  );
};

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;

export const supportedLocales = ["en", "nl"] as const;
export type SupportedLocale = (typeof supportedLocales)[number];
