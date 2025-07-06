"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/lib/i18n/context";

export default function ContentROICards() {
  const { t } = useLocale();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("analytics.totalROI")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">245%</p>
          <p className="text-sm text-muted-foreground">
            {t("analytics.portfolioAverage")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.revenue")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">$42,050</p>
          <p className="text-sm text-muted-foreground">
            {t("analytics.totalGenerated")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("analytics.topPerformers")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">3</p>
          <p className="text-sm text-muted-foreground">
            {t("analytics.gradeAContent")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.conversionRate")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">3.8%</p>
          <p className="text-sm text-muted-foreground">
            {t("analytics.overallAverage")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Named export for files expecting named import
export { default as ContentROICards } from "./content-roi-cards";
