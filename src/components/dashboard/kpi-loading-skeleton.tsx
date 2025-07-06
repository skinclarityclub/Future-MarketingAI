"use client";

import { Skeleton, CardSkeleton } from "@/components/ui/premium-loading";
import { TrendingUp, DollarSign, Users, Activity } from "lucide-react";

interface KPILoadingSkeletonProps {
  className?: string;
  variant?: "premium" | "luxury" | "enterprise";
  showIcons?: boolean;
}

export default function KPILoadingskeleton({
  className = "",
  variant = "luxury",
  showIcons = true,
}: KPILoadingSkeletonProps) {
  const kpiIcons = [TrendingUp, DollarSign, Users, Activity];

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}
    >
      {Array.from({ length: 4 }).map((_, index) => {
        const Icon = kpiIcons[index];
        const isPrimary = index < 2; // First two cards are primary

        return (
          <div
            key={index}
            className={`
              relative overflow-hidden rounded-xl
              transition-all duration-300 ease-premium
              ${
                isPrimary
                  ? "glass-primary shadow-enterprise border-primary-500/20"
                  : "glass-secondary shadow-luxury border-white/10"
              }
              ${variant === "enterprise" ? "card-loading-premium" : ""}
            `}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Premium Background Effect */}
            <div className="absolute inset-0 opacity-50">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent" />
            </div>

            <div className="relative p-6">
              {/* Header Section */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  {/* Title Skeleton */}
                  <Skeleton variant={variant} className="h-4 w-24 mb-2" />

                  {/* Status Skeleton */}
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success-400/30 rounded-full animate-pulse" />
                    <Skeleton variant={variant} className="h-3 w-16" />
                  </div>
                </div>

                {/* Icon Container */}
                {showIcons && (
                  <div
                    className={`
                    p-3 rounded-xl
                    ${
                      isPrimary
                        ? "bg-primary-500/20 shadow-glow-primary"
                        : "bg-white/10"
                    }
                  `}
                  >
                    <Icon
                      className={`
                      w-5 h-5 
                      ${isPrimary ? "text-primary-400" : "text-neutral-400"}
                      animate-pulse
                    `}
                    />
                  </div>
                )}
              </div>

              {/* Main Value Section */}
              <div className="mb-4">
                {/* Primary Value */}
                <Skeleton
                  variant={variant}
                  className={`
                    h-8 w-20 mb-2
                    ${isPrimary ? "bg-primary-400/20" : ""}
                  `}
                />

                {/* Secondary Value */}
                <Skeleton variant={variant} className="h-6 w-16" />
              </div>

              {/* Trend Section */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Trend Icon Skeleton */}
                  <div className="w-4 h-4 bg-success-400/30 rounded animate-pulse" />
                  <Skeleton variant={variant} className="h-4 w-12" />
                </div>

                {/* Period Skeleton */}
                <Skeleton variant={variant} className="h-3 w-16" />
              </div>

              {/* Progress Bar (for some cards) */}
              {(index === 1 || index === 3) && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <Skeleton variant={variant} className="h-3 w-16" />
                    <Skeleton variant={variant} className="h-3 w-8" />
                  </div>
                  <div className="progress-luxury" />
                </div>
              )}

              {/* Mini Chart Area (for primary cards) */}
              {isPrimary && (
                <div className="mt-4 h-12 relative overflow-hidden rounded-lg bg-white/5">
                  <svg className="w-full h-full opacity-30">
                    <path
                      d="M 0 8 Q 15 4 30 6 T 60 3 T 90 5 T 120 2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className={`
                        ${isPrimary ? "text-primary-400" : "text-neutral-400"}
                        animate-pulse
                      `}
                    />
                  </svg>

                  {/* Floating data points */}
                  <div className="absolute inset-0 flex items-center justify-around">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`
                          w-1.5 h-1.5 rounded-full 
                          ${isPrimary ? "bg-primary-400" : "bg-neutral-400"}
                          animate-pulse
                        `}
                        style={{
                          animationDelay: `${i * 200}ms`,
                          opacity: 0.6,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Shimmer Effect Overlay */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer-premium" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Specialized Chart Loading Component for Dashboard
export function DashboardChartSkeleton({
  className = "",
  variant = "luxury",
  type = "mixed",
}: {
  className?: string;
  variant?: "premium" | "luxury" | "enterprise";
  type?: "revenue" | "analytics" | "mixed";
}) {
  return (
    <div
      className={`glass-secondary rounded-xl p-6 shadow-luxury border border-white/10 ${className}`}
    >
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Skeleton variant={variant} className="h-6 w-32 mb-2" />
          <Skeleton variant={variant} className="h-4 w-48" />
        </div>

        <div className="flex items-center gap-2">
          <Skeleton variant={variant} className="h-8 w-20" />
          <Skeleton variant={variant} className="h-8 w-8 rounded-lg" />
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative h-64 mb-4">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-500/10 to-transparent rounded-lg" />

        {type === "revenue" && (
          <>
            {/* Revenue Line Chart */}
            <svg className="w-full h-full opacity-40">
              <path
                d="M 0 50 Q 50 30 100 35 T 200 25 T 300 30 T 400 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-primary-400 animate-pulse"
              />
              <path
                d="M 0 60 Q 50 45 100 50 T 200 40 T 300 45 T 400 35"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-success-400 animate-pulse"
                style={{ animationDelay: "0.5s" }}
              />
            </svg>
          </>
        )}

        {type === "analytics" && (
          <>
            {/* Analytics Bar Chart */}
            <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around h-40">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-primary-400/30 rounded-t animate-pulse"
                  style={{
                    width: "12%",
                    height: `${30 + Math.random() * 70}%`,
                    animationDelay: `${i * 100}ms`,
                  }}
                />
              ))}
            </div>
          </>
        )}

        {type === "mixed" && (
          <>
            {/* Mixed Chart */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32">
                <div className="relative">
                  {/* Donut Chart Skeleton */}
                  <div className="w-full h-full rounded-full border-8 border-primary-400/20 border-t-primary-400 animate-spin" />
                  <div className="absolute inset-3 rounded-full bg-slate-800/50" />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Chart Overlays */}
        <div className="absolute top-4 right-4 flex gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full bg-${i === 0 ? "primary" : i === 1 ? "success" : "warning"}-400/30 animate-pulse`}
              />
              <Skeleton variant={variant} className="h-3 w-12" />
            </div>
          ))}
        </div>
      </div>

      {/* Chart Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="flex items-center gap-4">
          <Skeleton variant={variant} className="h-4 w-24" />
          <Skeleton variant={variant} className="h-4 w-16" />
        </div>
        <Skeleton variant={variant} className="h-4 w-20" />
      </div>
    </div>
  );
}
