"use client";

import { Suspense } from "react";
import ContentPerformanceOverview from "@/components/dashboard/content-performance-overview";
import { LocaleProvider } from "@/lib/i18n/client-provider";
import { Skeleton } from "@/components/ui/skeleton";

export default function ContentPerformancePage() {
  return (
    <LocaleProvider>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Content Performance Dashboard
          </h1>
          <p className="text-muted-foreground">
            Track ROI, analyze performance metrics, and optimize your content
            strategy
          </p>
        </div>

        <Suspense fallback={<ContentPerformanceLoading />}>
          <ContentPerformanceOverview />
        </Suspense>
      </div>
    </LocaleProvider>
  );
}

function ContentPerformanceLoading() {
  return (
    <div className="space-y-6">
      {/* KPI Cards Loading */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>

      {/* Charts Loading */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>

      {/* Table Loading */}
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
