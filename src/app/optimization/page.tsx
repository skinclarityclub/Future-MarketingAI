import { Suspense } from "react";
import { OptimizationRecommendations } from "@/components/dashboard/optimization-recommendations";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export default function OptimizationPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Content Optimization
          </h1>
          <p className="text-muted-foreground">
            AI-powered recommendations to maximize your content ROI and
            performance
          </p>
        </div>

        <ErrorBoundary
          componentName="OptimizationRecommendations"
          enableReporting={true}
        >
          <Suspense fallback={<OptimizationPageSkeleton />}>
            <OptimizationRecommendations />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}

function OptimizationPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Portfolio Health Score Skeleton */}
      <div className="rounded-lg border bg-white p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      </div>

      {/* Predictions Skeleton */}
      <div className="rounded-lg border bg-white p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="text-center space-y-2">
                <Skeleton className="h-8 w-32 mx-auto" />
                <Skeleton className="h-4 w-24 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-4">
        <div className="flex space-x-2">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-10 w-32" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-lg border bg-white p-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-4 w-4" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
