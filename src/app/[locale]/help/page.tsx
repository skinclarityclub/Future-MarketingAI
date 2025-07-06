"use client";

import React from "react";
import {
  DashboardLayout,
  DashboardSection,
} from "@/components/layout/dashboard-layout";
import { useLocale } from "@/lib/i18n/context";

export default function HelpPage() {
  const { t } = useLocale();

  return (
    <DashboardLayout>
      <DashboardSection
        title={t("help.title")}
        description={t("help.description")}
      >
        <div className="text-center py-8 text-muted-foreground">
          {t("help.comingSoon")}
        </div>
      </DashboardSection>
    </DashboardLayout>
  );
}
