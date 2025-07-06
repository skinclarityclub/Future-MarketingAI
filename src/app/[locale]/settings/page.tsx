import React from "react";
import SettingsPageClient from "./settings-client";

interface SettingsPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { locale } = await params;

  return <SettingsPageClient locale={locale} />;
}
