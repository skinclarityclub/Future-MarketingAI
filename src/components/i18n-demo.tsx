"use client";

import { useTranslation } from "@/lib/i18n/client-provider";
import { LocaleSwitcher } from "@/components/locale-switcher";
import NormalButton from "@/components/ui/normal-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency, formatDate, formatNumber } from "@/lib/i18n/utils";

export function I18nDemo() {
  const { t, locale, isLoading } = useTranslation();

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Loading translations...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const sampleData = {
    revenue: 125000,
    date: new Date(),
    customers: 1234,
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{t("dashboard.title")}</CardTitle>
          <CardDescription>{t("dashboard.subtitle")}</CardDescription>
        </div>
        <LocaleSwitcher />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Navigation Demo */}
        <div>
          <h3 className="text-lg font-semibold mb-3">
            {t("navigation.dashboard")}
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span>{t("navigation.reports")}:</span>
            <span>{t("navigation.analytics")}</span>
            <span>{t("navigation.settings")}:</span>
            <span>{t("navigation.profile")}</span>
          </div>
        </div>

        {/* Formatted Data Demo */}
        <div>
          <h3 className="text-lg font-semibold mb-3">
            Locale-specific Formatting
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>{t("dashboard.revenue")}:</span>
              <span className="font-mono">
                {formatCurrency(sampleData.revenue, locale)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{t("dashboard.customers")}:</span>
              <span className="font-mono">
                {formatNumber(sampleData.customers, locale)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span className="font-mono">
                {formatDate(sampleData.date, locale)}
              </span>
            </div>
          </div>
        </div>

        {/* Common Actions */}
        <div>
          <h3 className="text-lg font-semibold mb-3">{t("common.actions")}</h3>
          <div className="flex gap-2 flex-wrap">
            <NormalButton className="px-3 py-1 bg-blue-500 text-white rounded text-sm">
              {t("common.save")}
            </NormalButton>
            <NormalButton className="px-3 py-1 bg-gray-500 text-white rounded text-sm">
              {t("common.cancel")}
            </NormalButton>
            <NormalButton className="px-3 py-1 bg-green-500 text-white rounded text-sm">
              {t("common.export")}
            </NormalButton>
          </div>
        </div>

        {/* Current Locale Info */}
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Current locale: <span className="font-mono">{locale}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
