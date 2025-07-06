"use client";

import React from "react";
import {
  DashboardLayout,
  DashboardSection,
} from "@/components/layout/dashboard-layout";
import { useLocale } from "@/lib/i18n/context";

export default function CalendarPage() {
  const { t } = useLocale();

  return (
    <DashboardLayout>
      <DashboardSection
        title={t("calendar.title")}
        description={t("calendar.description")}
      >
        <div className="text-center py-8 text-muted-foreground">
          {t("calendar.comingSoon")}
        </div>
      </DashboardSection>
    </DashboardLayout>
  );
}
