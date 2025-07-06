"use client";

import React from "react";
import JourneyOrchestrator from "@/components/demo/customer-journey/journey-orchestrator";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { BehaviorTrackingProvider } from "@/lib/analytics/behavior-tracking-provider";
import { EnhancedPersonalizationEngine } from "@/components/analytics/enhanced-personalization-engine";
import {
  AnimatedGradient,
  PremiumHeading,
  GlassContainer,
  PremiumCard,
} from "@/components/ui/premium-design-system";
import {
  LazyLoadWrapper,
  ResponsiveContainer,
  useMobileDetection,
  usePerformanceMonitor,
  useTouchInteraction,
  PremiumLoader,
} from "@/components/ui/performance-optimized-wrapper";
import {
  ContentManagementSystem,
  useContentManagement,
} from "@/components/ui/content-management-system";
import { Settings } from "lucide-react";

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default function CompleteGrowthPlatformDemoPage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const { isMobile, isTablet } = useMobileDetection();
  const metrics = usePerformanceMonitor();
  const touchInteraction = useTouchInteraction();
  const contentManager = useContentManagement();
  const [showAdmin, setShowAdmin] = React.useState(false);

  return (
    <BehaviorTrackingProvider
      config={{
        enabled: true,
        track_page_views: true,
        track_clicks: true,
        track_scrolls: true,
        track_forms: true,
        track_searches: true,
        track_errors: true,
        sample_rate: 1.0,
        batch_size: 20,
        flush_interval: 30000,
        endpoint_url: "/api/tracking/events",
        include_pii: false,
      }}
    >
      <EnhancedPersonalizationEngine>
        <AnimatedGradient className="min-h-screen" variant="primary">
          {/* Controls */}
          <div className="absolute top-6 right-6 z-50 flex gap-3">
            <GlassContainer className="p-2" intensity="light">
              <LocaleSwitcher />
            </GlassContainer>
            <GlassContainer className="p-2" intensity="light">
              <button
                onClick={() => setShowAdmin(!showAdmin)}
                className="text-white hover:text-purple-300 transition-colors"
                title="Content Management"
              >
                <Settings className="w-5 h-5" />
              </button>
            </GlassContainer>
          </div>

          {/* Journey Orchestrator Component */}
          <ResponsiveContainer maxWidth="full" padding={isMobile ? "sm" : "lg"}>
            <LazyLoadWrapper fallback={<PremiumLoader />}>
              <JourneyOrchestrator
                locale={resolvedParams.locale as "en" | "nl"}
              />
            </LazyLoadWrapper>
          </ResponsiveContainer>

          {/* Performance Insights */}
          <PremiumCard
            className="mt-12 text-xs text-gray-300"
            glow
            {...touchInteraction}
          >
            <PremiumHeading level={6} className="mb-2">
              Performance Insights {isMobile && "📱"} {isTablet && "📋"}
            </PremiumHeading>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p>
                  Device:{" "}
                  {isMobile ? "Mobile" : isTablet ? "Tablet" : "Desktop"}
                </p>
                <p>
                  Touch Interactions:{" "}
                  {touchInteraction.swipeDirection || "None"}
                </p>
                <p>
                  Content Pieces: {Object.keys(contentManager.content).length}
                </p>
              </div>
              <div>
                <p>LCP: {Math.round(metrics.lcp)}ms</p>
                <p>FID: {Math.round(metrics.fid)}ms</p>
                <p>CLS: {metrics.cls.toFixed(3)}</p>
                <p>TTFB: {Math.round(metrics.ttfb)}ms</p>
              </div>
            </div>
          </PremiumCard>

          {/* Floating Admin Panel */}
          {showAdmin && (
            <div className="fixed top-20 right-6 z-40 w-96 max-h-[70vh] overflow-y-auto">
              <ContentManagementSystem
                onContentUpdate={contentManager.updateContent}
              />
            </div>
          )}
        </AnimatedGradient>
      </EnhancedPersonalizationEngine>
    </BehaviorTrackingProvider>
  );
}
