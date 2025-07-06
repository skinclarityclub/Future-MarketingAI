import { createClient } from "@supabase/supabase-js";
import {
  BlotatoIntegrationService,
  getBlotatoService,
} from "../apis/blotato-integration";
import { ClickUpContentData } from "./clickup-content-extraction";
import { logger } from "../logger";

// Timing optimization interfaces
export interface OptimalTiming {
  suggestedTime: string; // ISO string
  confidence: number; // 0-1
  reasoning: string;
  alternatives: Array<{
    time: string;
    confidence: number;
    reason: string;
  }>;
}

export interface SchedulingConflict {
  conflictType:
    | "platform_overlap"
    | "timing_clash"
    | "rate_limit"
    | "resource_conflict";
  description: string;
  affectedContent: string[];
  resolution: "reschedule" | "cancel" | "merge" | "prioritize";
  suggestedAction: string;
}

export interface SchedulingResult {
  success: boolean;
  scheduled_id?: string;
  scheduled_time?: string;
  platforms: string[];
  conflicts?: SchedulingConflict[];
  analytics_tracking_id?: string;
  error?: string;
}

export interface BulkSchedulingRequest {
  content_items: ClickUpContentData[];
  campaign_id?: string;
  scheduling_strategy:
    | "optimal_spacing"
    | "batch_publish"
    | "drip_campaign"
    | "custom";
  time_constraints?: {
    start_time?: string;
    end_time?: string;
    excluded_hours?: string[]; // ['22:00-06:00'] format
    preferred_days?: string[]; // ['monday', 'tuesday', ...]
  };
}

export interface EmergencySchedulingOptions {
  priority_level: "urgent" | "high" | "critical";
  max_delay_minutes: number;
  override_conflicts: boolean;
  notification_channels: string[];
  fallback_platforms?: string[];
}

/**
 * Advanced Blotato Scheduling Service
 * Handles intelligent timing, conflict resolution, and emergency prioritization
 */
export class BlotatoSchedulingService {
  private supabase;
  private blotatoService: BlotatoIntegrationService;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    this.blotatoService = getBlotatoService();
  }

  /**
   * Schedule content with intelligent timing optimization
   */
  async scheduleContent(
    contentData: ClickUpContentData,
    options: {
      platforms?: string[];
      preferred_time?: string;
      emergency_options?: EmergencySchedulingOptions;
      enable_optimization?: boolean;
    } = {}
  ): Promise<SchedulingResult> {
    try {
      logger.info(`Starting scheduling for content ${contentData.task_id}`, {
        platforms:
          options.platforms || contentData.scheduling_preferences.platforms,
        preferredTime: options.preferred_time,
        emergency: !!options.emergency_options,
      });

      // 1. Determine platforms
      const targetPlatforms = options.platforms ||
        contentData.scheduling_preferences.platforms || ["twitter", "linkedin"]; // fallback

      // 2. Get optimal timing
      const optimalTiming = await this.calculateOptimalTiming(
        contentData,
        targetPlatforms,
        options.preferred_time,
        options.enable_optimization !== false
      );

      // 3. Check for conflicts
      const conflicts = await this.detectSchedulingConflicts(
        contentData,
        targetPlatforms,
        optimalTiming.suggestedTime
      );

      // 4. Handle emergency prioritization
      if (options.emergency_options) {
        return this.handleEmergencyScheduling(
          contentData,
          targetPlatforms,
          options.emergency_options,
          conflicts
        );
      }

      // 5. Resolve conflicts if any
      if (conflicts.length > 0) {
        const resolution = await this.resolveSchedulingConflicts(
          contentData,
          conflicts,
          optimalTiming
        );

        if (!resolution.success) {
          return {
            success: false,
            platforms: targetPlatforms,
            conflicts,
            error: "Unable to resolve scheduling conflicts",
          };
        }
      }

      // 6. Execute scheduling via Blotato
      const schedulingResult = await this.executeBlototoScheduling(
        contentData,
        targetPlatforms,
        optimalTiming.suggestedTime
      );

      // 7. Store result and setup tracking
      await this.storeSchedulingResult(contentData.task_id, schedulingResult);

      // 8. Setup analytics tracking
      const analyticsId = await this.setupAnalyticsTracking(
        contentData,
        schedulingResult
      );

      logger.info(`Content scheduling completed for ${contentData.task_id}`, {
        success: schedulingResult.success,
        scheduledTime: optimalTiming.suggestedTime,
        analyticsId,
      });

      return {
        ...schedulingResult,
        scheduled_time: optimalTiming.suggestedTime,
        platforms: targetPlatforms,
        analytics_tracking_id: analyticsId,
        conflicts: conflicts.length > 0 ? conflicts : undefined,
      };
    } catch (error) {
      logger.error(
        `Scheduling failed for content ${contentData.task_id}:`,
        error
      );
      return {
        success: false,
        platforms: options.platforms || [],
        error:
          error instanceof Error ? error.message : "Unknown scheduling error",
      };
    }
  }

  /**
   * Calculate optimal timing based on platform analytics and user behavior
   */
  private async calculateOptimalTiming(
    contentData: ClickUpContentData,
    platforms: string[],
    preferredTime?: string,
    enableOptimization = true
  ): Promise<OptimalTiming> {
    if (preferredTime && !enableOptimization) {
      return {
        suggestedTime: preferredTime,
        confidence: 1.0,
        reasoning: "User-specified time used without optimization",
        alternatives: [],
      };
    }

    // Get platform-specific optimal times
    const platformOptimalTimes = await this.getPlatformOptimalTimes(platforms);

    // Get content type optimal times
    const contentTypeOptimal = this.getContentTypeOptimalTime(contentData);

    // Get historical performance data
    const historicalData = await this.getHistoricalPerformanceData(platforms);

    // Calculate weighted optimal time
    const baseTime =
      preferredTime || contentData.scheduling_preferences.preferred_time;
    const suggestedTime = this.calculateWeightedOptimalTime(
      baseTime,
      platformOptimalTimes,
      contentTypeOptimal,
      historicalData
    );

    // Generate alternatives
    const alternatives = this.generateTimeAlternatives(
      suggestedTime,
      platformOptimalTimes,
      contentTypeOptimal
    );

    return {
      suggestedTime,
      confidence: this.calculateTimingConfidence(suggestedTime, platforms),
      reasoning: this.generateTimingReasoning(
        suggestedTime,
        platforms,
        contentTypeOptimal
      ),
      alternatives,
    };
  }

  /**
   * Detect potential scheduling conflicts
   */
  private async detectSchedulingConflicts(
    contentData: ClickUpContentData,
    platforms: string[],
    scheduledTime: string
  ): Promise<SchedulingConflict[]> {
    const conflicts: SchedulingConflict[] = [];

    // Check platform overlap
    const platformOverlaps = await this.checkPlatformOverlaps(
      platforms,
      scheduledTime
    );
    if (platformOverlaps.length > 0) {
      conflicts.push({
        conflictType: "platform_overlap",
        description: `Multiple posts scheduled on same platforms within 30 minutes`,
        affectedContent: platformOverlaps,
        resolution: "reschedule",
        suggestedAction: "Spread posts across 45-minute intervals",
      });
    }

    // Check rate limits
    const rateLimitIssues = await this.checkRateLimits(
      platforms,
      scheduledTime
    );
    if (rateLimitIssues.length > 0) {
      conflicts.push({
        conflictType: "rate_limit",
        description: "Platform rate limits may be exceeded",
        affectedContent: rateLimitIssues,
        resolution: "reschedule",
        suggestedAction: "Delay posting by 1-2 hours to reset rate limits",
      });
    }

    // Check timing conflicts with campaigns
    const timingClashes =
      await this.checkCampaignTimingConflicts(scheduledTime);
    if (timingClashes.length > 0) {
      conflicts.push({
        conflictType: "timing_clash",
        description: "Conflicts with existing campaign schedules",
        affectedContent: timingClashes,
        resolution: "prioritize",
        suggestedAction:
          "Review campaign priorities and reschedule lower priority content",
      });
    }

    return conflicts;
  }

  /**
   * Handle emergency content scheduling
   */
  private async handleEmergencyScheduling(
    contentData: ClickUpContentData,
    platforms: string[],
    emergencyOptions: EmergencySchedulingOptions,
    conflicts: SchedulingConflict[]
  ): Promise<SchedulingResult> {
    logger.info(`Handling emergency scheduling for ${contentData.task_id}`, {
      priority: emergencyOptions.priority_level,
      maxDelay: emergencyOptions.max_delay_minutes,
    });

    // Calculate emergency timing (ASAP with minimal delay)
    const emergencyTime = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes from now

    // Override conflicts if specified
    if (emergencyOptions.override_conflicts) {
      logger.warn(
        `Overriding ${conflicts.length} conflicts for emergency content`
      );
      conflicts = [];
    }

    // Use fallback platforms if specified and conflicts exist
    let finalPlatforms = platforms;
    if (conflicts.length > 0 && emergencyOptions.fallback_platforms) {
      finalPlatforms = emergencyOptions.fallback_platforms;
      logger.info(
        `Using fallback platforms for emergency: ${finalPlatforms.join(", ")}`
      );
    }

    // Execute emergency scheduling
    const result = await this.executeBlototoScheduling(
      contentData,
      finalPlatforms,
      emergencyTime
    );

    // Send emergency notifications
    await this.sendEmergencyNotifications(
      contentData,
      emergencyOptions,
      result
    );

    return {
      ...result,
      scheduled_time: emergencyTime,
      platforms: finalPlatforms,
    };
  }

  /**
   * Execute bulk scheduling operations
   */
  async scheduleBulkContent(
    request: BulkSchedulingRequest
  ): Promise<SchedulingResult[]> {
    logger.info(
      `Starting bulk scheduling for ${request.content_items.length} items`,
      {
        strategy: request.scheduling_strategy,
        campaignId: request.campaign_id,
      }
    );

    const results: SchedulingResult[] = [];
    let currentTime = new Date();

    if (request.time_constraints?.start_time) {
      currentTime = new Date(request.time_constraints.start_time);
    }

    for (let i = 0; i < request.content_items.length; i++) {
      const contentData = request.content_items[i];

      // Calculate timing based on strategy
      const scheduledTime = this.calculateBulkTiming(
        currentTime,
        i,
        request.scheduling_strategy,
        request.time_constraints
      );

      // Schedule individual item
      const result = await this.scheduleContent(contentData, {
        preferred_time: scheduledTime.toISOString(),
        enable_optimization: request.scheduling_strategy === "optimal_spacing",
      });

      results.push(result);

      // Update current time for next item
      currentTime = scheduledTime;

      // Add spacing between items
      currentTime.setMinutes(
        currentTime.getMinutes() +
          this.getSpacingMinutes(request.scheduling_strategy)
      );
    }

    logger.info(
      `Bulk scheduling completed: ${results.filter(r => r.success).length}/${results.length} successful`
    );
    return results;
  }

  /**
   * Setup performance feedback loop
   */
  async setupPerformanceFeedback(
    contentId: string,
    scheduledTime: string,
    platforms: string[]
  ): Promise<void> {
    // Schedule performance checks at intervals
    const checkIntervals = [
      { hours: 1, type: "immediate" },
      { hours: 24, type: "daily" },
      { hours: 168, type: "weekly" }, // 7 days
    ];

    for (const interval of checkIntervals) {
      const checkTime = new Date(scheduledTime);
      checkTime.setHours(checkTime.getHours() + interval.hours);

      await this.supabase.from("performance_feedback_schedule").insert({
        content_id: contentId,
        check_time: checkTime.toISOString(),
        check_type: interval.type,
        platforms: platforms,
        status: "scheduled",
        created_at: new Date().toISOString(),
      });
    }
  }

  // Helper methods
  private async getPlatformOptimalTimes(
    platforms: string[]
  ): Promise<Record<string, string[]>> {
    // Mock implementation - would connect to analytics data
    const defaults: Record<string, string[]> = {
      twitter: ["09:00", "12:00", "17:00", "20:00"],
      linkedin: ["08:00", "12:00", "17:00"],
      instagram: ["11:00", "14:00", "19:00"],
      facebook: ["13:00", "15:00", "19:00"],
    };

    return platforms.reduce(
      (acc, platform) => {
        acc[platform] = defaults[platform] || ["12:00"];
        return acc;
      },
      {} as Record<string, string[]>
    );
  }

  private getContentTypeOptimalTime(contentData: ClickUpContentData): string {
    // Analyze content type and return optimal time
    if (contentData.media_urls.length > 0) {
      return "14:00"; // Visual content performs better in afternoon
    }
    return "09:00"; // Text content performs better in morning
  }

  private async getHistoricalPerformanceData(
    platforms: string[]
  ): Promise<any> {
    // Query historical performance data
    const { data } = await this.supabase
      .from("content_performance_history")
      .select("*")
      .in("platform", platforms)
      .gte(
        "published_at",
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      ) // Last 30 days
      .order("performance_score", { ascending: false })
      .limit(100);

    return data || [];
  }

  private calculateWeightedOptimalTime(
    baseTime?: string,
    platformTimes?: Record<string, string[]>,
    contentOptimal?: string,
    historical?: any[]
  ): string {
    // Sophisticated timing calculation
    if (baseTime) {
      return baseTime;
    }

    // Use content type optimal as fallback
    if (contentOptimal) {
      const today = new Date();
      const [hours, minutes] = contentOptimal.split(":").map(Number);
      today.setHours(hours, minutes, 0, 0);
      return today.toISOString();
    }

    // Default to next business hour
    const now = new Date();
    now.setHours(now.getHours() + 1, 0, 0, 0);
    return now.toISOString();
  }

  private generateTimeAlternatives(
    suggestedTime: string,
    platformTimes: Record<string, string[]>,
    contentOptimal: string
  ): Array<{ time: string; confidence: number; reason: string }> {
    const alternatives = [];
    const baseTime = new Date(suggestedTime);

    // Add 2-hour and 4-hour delays
    for (const hoursDelay of [2, 4]) {
      const altTime = new Date(baseTime);
      altTime.setHours(altTime.getHours() + hoursDelay);

      alternatives.push({
        time: altTime.toISOString(),
        confidence: Math.max(0.3, 1 - hoursDelay * 0.1),
        reason: `${hoursDelay}h delay to avoid peak traffic`,
      });
    }

    return alternatives;
  }

  private calculateTimingConfidence(
    suggestedTime: string,
    platforms: string[]
  ): number {
    // Mock confidence calculation
    const hour = new Date(suggestedTime).getHours();

    // Business hours have higher confidence
    if (hour >= 9 && hour <= 17) {
      return 0.8;
    }

    // Evening hours moderate confidence
    if (hour >= 18 && hour <= 21) {
      return 0.6;
    }

    // Other hours lower confidence
    return 0.4;
  }

  private generateTimingReasoning(
    suggestedTime: string,
    platforms: string[],
    contentOptimal: string
  ): string {
    const hour = new Date(suggestedTime).getHours();
    const timeDesc =
      hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

    return `Optimized for ${timeDesc} engagement on ${platforms.join(", ")} based on historical performance data`;
  }

  private async checkPlatformOverlaps(
    platforms: string[],
    scheduledTime: string
  ): Promise<string[]> {
    const timeWindow = 30 * 60 * 1000; // 30 minutes
    const startTime = new Date(new Date(scheduledTime).getTime() - timeWindow);
    const endTime = new Date(new Date(scheduledTime).getTime() + timeWindow);

    const { data } = await this.supabase
      .from("content_calendar_items")
      .select("content_id")
      .overlaps("platforms", platforms)
      .gte("scheduled_time", startTime.toISOString())
      .lte("scheduled_time", endTime.toISOString())
      .eq("status", "scheduled");

    return data?.map(item => item.content_id) || [];
  }

  private async checkRateLimits(
    platforms: string[],
    scheduledTime: string
  ): Promise<string[]> {
    // Mock rate limit checking
    return [];
  }

  private async checkCampaignTimingConflicts(
    scheduledTime: string
  ): Promise<string[]> {
    // Mock campaign conflict checking
    return [];
  }

  private async resolveSchedulingConflicts(
    contentData: ClickUpContentData,
    conflicts: SchedulingConflict[],
    optimalTiming: OptimalTiming
  ): Promise<{ success: boolean; newTime?: string }> {
    // Try alternatives first
    for (const alternative of optimalTiming.alternatives) {
      const newConflicts = await this.detectSchedulingConflicts(
        contentData,
        contentData.scheduling_preferences.platforms || [],
        alternative.time
      );

      if (newConflicts.length === 0) {
        return { success: true, newTime: alternative.time };
      }
    }

    return { success: false };
  }

  private async executeBlototoScheduling(
    contentData: ClickUpContentData,
    platforms: string[],
    scheduledTime: string
  ): Promise<SchedulingResult> {
    try {
      // Convert content to Blotato format
      const blotatoContent = {
        id: contentData.task_id,
        text: `${contentData.title}\n\n${contentData.description || ""}`,
        mediaUrls: contentData.media_urls,
        hashtags: [], // Extract from content if needed
        mentions: [],
      };

      // Schedule via Blotato service
      const result = await this.blotatoService.publishToMultiplePlatforms(
        blotatoContent,
        platforms,
        {
          scheduledTime,
          enableOptimization: true,
          failureHandling: "continue-on-failure",
        }
      );

      return {
        success: result.successfulPlatforms > 0,
        scheduled_id: `blotato_${Date.now()}`,
        platforms: platforms.filter(
          (_, index) => result.results[index].success
        ),
        error:
          result.failedPlatforms > 0
            ? `${result.failedPlatforms} platforms failed`
            : undefined,
      };
    } catch (error) {
      logger.error("Blotato scheduling execution failed:", error);
      return {
        success: false,
        platforms: platforms,
        error:
          error instanceof Error ? error.message : "Blotato execution failed",
      };
    }
  }

  private async storeSchedulingResult(
    taskId: string,
    result: SchedulingResult
  ): Promise<void> {
    await this.supabase.from("blotato_scheduling_results").upsert({
      clickup_task_id: taskId,
      blotato_schedule_id: result.scheduled_id,
      scheduling_status: result.success ? "scheduled" : "failed",
      scheduled_posts: result.platforms.map(platform => ({
        platform,
        status: "scheduled",
      })),
      scheduled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  private async setupAnalyticsTracking(
    contentData: ClickUpContentData,
    result: SchedulingResult
  ): Promise<string> {
    const analyticsId = `analytics_${contentData.task_id}_${Date.now()}`;

    // Setup tracking in analytics system
    await this.supabase.from("content_analytics_tracking").insert({
      tracking_id: analyticsId,
      content_id: contentData.task_id,
      platforms: result.platforms,
      scheduled_time: result.scheduled_time,
      status: "tracking_active",
      created_at: new Date().toISOString(),
    });

    return analyticsId;
  }

  private async sendEmergencyNotifications(
    contentData: ClickUpContentData,
    options: EmergencySchedulingOptions,
    result: SchedulingResult
  ): Promise<void> {
    // Mock notification sending
    logger.info(`Emergency notifications sent for ${contentData.task_id}`, {
      channels: options.notification_channels,
      success: result.success,
    });
  }

  private calculateBulkTiming(
    baseTime: Date,
    index: number,
    strategy: string,
    constraints?: BulkSchedulingRequest["time_constraints"]
  ): Date {
    const newTime = new Date(baseTime);

    switch (strategy) {
      case "optimal_spacing":
        newTime.setHours(newTime.getHours() + index * 2); // 2 hour spacing
        break;
      case "batch_publish":
        newTime.setMinutes(newTime.getMinutes() + index * 15); // 15 minute spacing
        break;
      case "drip_campaign":
        newTime.setDate(newTime.getDate() + index); // Daily spacing
        break;
      default:
        newTime.setHours(newTime.getHours() + index);
    }

    return newTime;
  }

  private getSpacingMinutes(strategy: string): number {
    switch (strategy) {
      case "optimal_spacing":
        return 120; // 2 hours
      case "batch_publish":
        return 15; // 15 minutes
      case "drip_campaign":
        return 1440; // 24 hours
      default:
        return 60; // 1 hour
    }
  }
}

// Export singleton instance
let globalSchedulingService: BlotatoSchedulingService | undefined;

export function getBlotatoSchedulingService(): BlotatoSchedulingService {
  if (!globalSchedulingService) {
    globalSchedulingService = new BlotatoSchedulingService();
  }
  return globalSchedulingService;
}
