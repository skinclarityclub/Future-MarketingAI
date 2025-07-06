// Marketing Control Center - Unified Data Architecture
// Task 80.2: Define standardized types and interfaces for all marketing modules

import { z } from "zod";

// ====================================================================
// 1. CORE CONTENT DATA ARCHITECTURE
// ====================================================================

export interface ContentPost {
  id: string;
  title: string;
  content: string;
  contentType:
    | "post"
    | "story"
    | "video"
    | "carousel"
    | "reel"
    | "email"
    | "blog"
    | "ad";
  status:
    | "draft"
    | "scheduled"
    | "publishing"
    | "published"
    | "failed"
    | "archived";

  // Content metadata
  excerpt?: string;
  mediaUrls: string[];
  hashtags: string[];
  mentions: string[];

  // Platform targeting
  targetPlatforms: Platform[];
  platformSpecificContent: Record<Platform, PlatformContent>;

  // AI & Analytics
  aiGenerated: boolean;
  aiPrompt?: string;
  engagementPrediction?: number;
  qualityScore?: number;

  // Scheduling
  scheduledDate?: Date;
  publishedAt?: Date;

  // Performance
  metrics: ContentMetrics;

  // Workflow
  authorId?: string;
  campaignId?: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface ContentMetrics {
  views: number;
  likes: number;
  shares: number;
  comments: number;
  saves: number;
  clicks: number;
  reach: number;
  impressions: number;
  engagementRate: number;
  clickThroughRate: number;
  conversionRate?: number;
  revenue?: number;
  roi?: number;
}

// ====================================================================
// 2. PLATFORM STANDARDIZATION
// ====================================================================

export type Platform =
  | "instagram"
  | "tiktok"
  | "linkedin"
  | "twitter"
  | "facebook"
  | "youtube"
  | "pinterest"
  | "email"
  | "blog";

export interface PlatformContent {
  text: string;
  hashtags: string[];
  mentions: string[];
  mediaUrls: string[];
  platformSpecificSettings: Record<string, any>;
}

export interface PlatformConfig {
  platform: Platform;
  accountId: string;
  isActive: boolean;
  characterLimit: number;
  hashtagLimit: number;
  mediaLimit: number;
  apiCredentials: PlatformCredentials;
  publishingRules: PublishingRule[];
}

export interface PlatformCredentials {
  apiKey?: string;
  accessToken?: string;
  refreshToken?: string;
  clientId?: string;
  clientSecret?: string;
  accountId?: string;
  pageId?: string;
  boardId?: string;
}

export interface PublishingRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  isActive: boolean;
}

// ====================================================================
// 3. WORKFLOW & AUTOMATION ARCHITECTURE
// ====================================================================

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  executionId: string;
  status: "running" | "success" | "failed" | "cancelled" | "waiting";
  startTime: Date;
  endTime?: Date;
  duration?: number;
  inputData: Record<string, any>;
  outputData?: Record<string, any>;
  errorMessage?: string;
  metadata: WorkflowMetadata;
}

export interface WorkflowMetadata {
  triggeredBy: "user" | "schedule" | "webhook" | "ai" | "automation";
  priority: "low" | "medium" | "high" | "urgent";
  tags: string[];
  campaignId?: string;
  userId?: string;
  retryCount: number;
  maxRetries: number;
}

// ====================================================================
// 4. CONTROL CENTER STATE MANAGEMENT
// ====================================================================

export interface ControlCenterState {
  // System status
  systemHealth: SystemHealth;

  // Active processes
  activeWorkflows: WorkflowExecution[];
  publishingQueue: QueueItem[];

  // Real-time metrics
  realTimeMetrics: RealTimeMetrics;

  // Platform status
  platformStatus: Record<Platform, PlatformStatus>;

  // Alerts & notifications
  activeAlerts: Alert[];
  recentNotifications: Notification[];

  // User interaction
  selectedModule?: string;
  activeFilters: FilterState;
  viewMode: "overview" | "detailed" | "modules";

  // Last updated
  lastUpdated: Date;
  autoRefresh: boolean;
  refreshInterval: number;
}

export interface SystemHealth {
  overall: "healthy" | "warning" | "critical";
  uptime: number;
  apiConnectivity: Record<string, boolean>;
  databaseHealth: "healthy" | "slow" | "down";
  queueHealth: number; // percentage
  errorRate: number; // percentage
}

export interface QueueItem {
  id: string;
  type: "publish" | "analyze" | "optimize" | "backup";
  contentId?: string;
  platform?: Platform;
  scheduledTime: Date;
  priority: "low" | "medium" | "high" | "urgent";
  status: "waiting" | "processing" | "completed" | "failed";
  retryCount: number;
  estimatedDuration: number;
}

export interface RealTimeMetrics {
  activeUsers: number;
  postsPublishedToday: number;
  totalEngagementToday: number;
  averageResponseTime: number;
  successRate: number;
  queueSize: number;
  aiRecommendationsGenerated: number;
  revenueToday: number;
}

export interface PlatformStatus {
  platform: Platform;
  isConnected: boolean;
  isActive: boolean;
  lastSync: Date;
  rateLimitRemaining: number;
  rateLimitResetTime?: Date;
  apiLatency: number;
  errorCount: number;
  queuedPosts: number;
}

export interface Alert {
  id: string;
  type: "error" | "warning" | "info" | "success";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  message: string;
  platform?: Platform;
  actionRequired: boolean;
  createdAt: Date;
  resolvedAt?: Date;
  actions?: AlertAction[];
}

export interface AlertAction {
  id: string;
  label: string;
  type: "button" | "link" | "api";
  action: string;
  confirmation?: boolean;
}

export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  createdAt: Date;
  readAt?: Date;
  actionUrl?: string;
}

// ====================================================================
// 5. UI & INTERACTION STANDARDIZATION
// ====================================================================

export interface ModuleState {
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  lastUpdated?: Date;
  data?: any;
}

export interface FilterState {
  platforms: Platform[];
  dateRange: {
    start: Date;
    end: Date;
  };
  status: string[];
  contentTypes: string[];
  campaigns: string[];
  sortBy: string;
  sortOrder: "asc" | "desc";
}

// ====================================================================
// 6. API STANDARDIZATION
// ====================================================================

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  metadata?: {
    timestamp: Date;
    requestId: string;
    duration: number;
    rateLimit?: {
      remaining: number;
      resetTime: Date;
    };
  };
}

// ====================================================================
// 7. CONSTANTS & DEFAULTS
// ====================================================================

export const SUPPORTED_PLATFORMS: Platform[] = [
  "instagram",
  "tiktok",
  "linkedin",
  "twitter",
  "facebook",
  "youtube",
  "pinterest",
  "email",
  "blog",
];

export const DEFAULT_PLATFORM_LIMITS = {
  instagram: { characters: 2200, hashtags: 30, media: 10 },
  tiktok: { characters: 2200, hashtags: 20, media: 1 },
  linkedin: { characters: 3000, hashtags: 10, media: 9 },
  twitter: { characters: 280, hashtags: 5, media: 4 },
  facebook: { characters: 63206, hashtags: 5, media: 10 },
  youtube: { characters: 5000, hashtags: 15, media: 1 },
  pinterest: { characters: 500, hashtags: 20, media: 1 },
  email: { characters: 50000, hashtags: 0, media: 10 },
  blog: { characters: 100000, hashtags: 20, media: 20 },
};

export const REFRESH_INTERVALS = {
  realTime: 5000, // 5 seconds
  fast: 30000, // 30 seconds
  normal: 60000, // 1 minute
  slow: 300000, // 5 minutes
  background: 900000, // 15 minutes
};

// ====================================================================
// 8. VALIDATION SCHEMAS
// ====================================================================

export const ContentPostSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  contentType: z.enum([
    "post",
    "story",
    "video",
    "carousel",
    "reel",
    "email",
    "blog",
    "ad",
  ]),
  status: z.enum([
    "draft",
    "scheduled",
    "publishing",
    "published",
    "failed",
    "archived",
  ]),
  targetPlatforms: z.array(z.string()),
  aiGenerated: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const WorkflowExecutionSchema = z.object({
  id: z.string(),
  workflowId: z.string(),
  status: z.enum(["running", "success", "failed", "cancelled", "waiting"]),
  startTime: z.date(),
  inputData: z.record(z.any()),
});

// ====================================================================
// EXPORT ALL TYPES
// ====================================================================

export type {
  // Core types
  ContentPost,
  ContentMetrics,
  Platform,
  PlatformContent,
  PlatformConfig,
  PlatformCredentials,
  PublishingRule,

  // Workflow types
  WorkflowExecution,
  WorkflowMetadata,

  // Control Center types
  ControlCenterState,
  SystemHealth,
  QueueItem,
  RealTimeMetrics,
  PlatformStatus,
  Alert,
  AlertAction,
  Notification,

  // UI types
  ModuleState,
  FilterState,

  // API types
  APIResponse,
};
