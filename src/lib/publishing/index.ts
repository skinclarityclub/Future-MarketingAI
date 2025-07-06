// Publishing Module Main Export
// Centralized access to publishing queue engine and dashboard components

export {
  PublishingQueueEngine,
  publishingQueueEngine,
  type PublishingItem,
  type PublishingStatus,
  type PublishingPriority,
  type PlatformType,
  type QueueStatistics,
  type SchedulingConfig,
  type PlatformPublishResult,
} from "./queue-engine";

// Blotato Platform Manager
export {
  BlatatoPlatformManager,
  createBlatatoPlatformManager,
  type ContentItem,
  type PlatformContent,
  type MultiPlatformPostRequest,
  type PlatformPublishResult as BlatatoPlatformPublishResult,
  type MultiPlatformPublishResult,
} from "./blotato-platform-manager";

// Factory function voor publishing queue engine
export function createPublishingEngine(
  config?: Partial<{
    maxConcurrentPublishing: number;
    defaultRetryAttempts: number;
    retryDelayMs: number;
    processingIntervalMs: number;
  }>
): PublishingQueueEngine {
  const defaultConfig = {
    maxConcurrentPublishing: 5,
    defaultRetryAttempts: 3,
    retryDelayMs: 60000, // 1 minute
    processingIntervalMs: 10000, // 10 seconds
  };

  return new PublishingQueueEngine({
    ...defaultConfig,
    ...config,
  });
}

// Lazy loading factory voor components
export const createPublishing = () => {
  return {
    engine: () => import("./queue-engine").then(m => m.publishingQueueEngine),
    dashboard: () =>
      import("@/components/publishing/publishing-queue-dashboard").then(
        m => m.PublishingQueueDashboard
      ),
  };
};

// Default publishing configuration
export const defaultPublishingConfig = {
  platforms: {
    linkedin: { maxPerHour: 20, maxPerDay: 100 },
    twitter: { maxPerHour: 100, maxPerDay: 500 },
    facebook: { maxPerHour: 25, maxPerDay: 150 },
    instagram: { maxPerHour: 10, maxPerDay: 50 },
    email: { maxPerHour: 500, maxPerDay: 2000 },
    blog: { maxPerHour: 5, maxPerDay: 20 },
  },
  priorities: {
    urgent: { weight: 100, maxRetries: 5 },
    high: { weight: 75, maxRetries: 3 },
    medium: { weight: 50, maxRetries: 2 },
    low: { weight: 25, maxRetries: 1 },
  },
};
