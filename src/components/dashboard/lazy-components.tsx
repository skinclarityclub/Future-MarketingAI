"use client";

import { lazy, Suspense } from "react";

// Lazy load heavy dashboard components
export const LazyRealTimeKPICards = lazy(() =>
  import("./real-time-kpi-cards").then(module => ({
    default: module.RealTimeKPICards,
  }))
);

// Chart component will be implemented later
export const LazyChartComponent = lazy(() =>
  Promise.resolve({ default: () => <div>Chart not available</div> })
);

// Loading components optimized for each section
export const KPICardsLoading = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="bg-card rounded-lg border p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 bg-muted rounded w-24"></div>
          <div className="h-8 w-8 bg-muted rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="h-8 bg-muted rounded w-32"></div>
          <div className="h-4 bg-muted rounded w-20"></div>
        </div>
      </div>
    ))}
  </div>
);

export const ChartLoading = () => (
  <div className="bg-card rounded-lg border p-6 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div>
        <div className="h-5 bg-muted rounded w-32 mb-2"></div>
        <div className="h-4 bg-muted rounded w-48"></div>
      </div>
    </div>
    <div className="h-64 bg-muted rounded-lg"></div>
  </div>
);

// Wrapper components with Suspense
export const LazyKPICardsWithSuspense = ({
  refetchInterval,
}: {
  refetchInterval?: number;
}) => (
  <Suspense fallback={<KPICardsLoading />}>
    <LazyRealTimeKPICards refetchInterval={refetchInterval} />
  </Suspense>
);

export const LazyChartWithSuspense = (props: any) => (
  <Suspense fallback={<ChartLoading />}>
    <LazyChartComponent {...props} />
  </Suspense>
);
