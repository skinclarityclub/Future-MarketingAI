// Scheduling Master Control Interface
// Hoofdinterface die alle scheduling componenten integreert

import {
  AISchedulingAlgorithm,
  SchedulingDataPoint,
  SchedulingContext,
  SchedulingRecommendation,
  createSchedulingAlgorithm,
} from "./scheduling-algorithm";
import {
  ContentCategorizer,
  ContentItem,
  ContentClassification,
  createContentCategorizer,
} from "./content-categorization";

export interface SchedulingRequest {
  content: ContentItem;
  preferredTimeframe?: {
    startDate: Date;
    endDate: Date;
  };
  constraints?: {
    excludeDays?: number[]; // 0-6 (zondag-zaterdag)
    excludeHours?: number[]; // 0-23
    minimumGapBetweenPosts?: number; // hours
    maxPostsPerDay?: number;
  };
  priority?: "low" | "medium" | "high" | "urgent";
  forceSchedule?: boolean;
}

export interface SchedulingResult {
  content: ContentItem;
  classification: ContentClassification;
  recommendation: SchedulingRecommendation;
  scheduledTime: Date;
  confidence: number;
  reasoning: string[];
  optimizationNotes: string[];
  conflicts?: {
    type: "time_conflict" | "platform_overload" | "content_overlap";
    description: string;
    suggestions: string[];
  }[];
}

export interface MasterControlConfig {
  defaultSchedulingContext: SchedulingContext;
  contentCategorizerConfig?: any;
  globalConstraints?: {
    businessHours?: { start: number; end: number };
    weekendPosting?: boolean;
    maxDailyPosts?: number;
    minimumPostGap?: number; // hours
  };
  platformLimits?: Record<
    string,
    {
      maxPerDay: number;
      maxPerHour: number;
      optimalTimes: number[];
    }
  >;
}

export class SchedulingMasterControl {
  private schedulingAlgorithm: AISchedulingAlgorithm;
  private contentCategorizer: ContentCategorizer;
  private config: MasterControlConfig;
  private scheduledPosts: Map<string, SchedulingResult> = new Map();

  constructor(config: MasterControlConfig) {
    this.config = config;
    this.schedulingAlgorithm = createSchedulingAlgorithm();
    this.contentCategorizer = createContentCategorizer();
  }

  /**
   * Hoofdfunctie: plannen van nieuwe content
   */
  async scheduleContent(request: SchedulingRequest): Promise<SchedulingResult> {
    try {
      // Stap 1: Classificeer content
      const classification = await this.contentCategorizer.classifyContent(
        request.content
      );

      // Stap 2: Bereken scheduling context
      const schedulingContext = this.buildSchedulingContext(
        request,
        classification
      );

      // Stap 3: Krijg AI recommendation
      const recommendation = await this.schedulingAlgorithm.getOptimalSchedule(
        [request.content],
        schedulingContext
      );

      if (recommendation.recommendations.length === 0) {
        throw new Error("Geen geschikte scheduling tijd gevonden");
      }

      const primaryRecommendation = recommendation.recommendations[0];

      // Stap 4: Valideer tegen constraints en conflicts
      const validationResult = await this.validateScheduling(
        request,
        primaryRecommendation
      );

      // Stap 5: Finaliseer scheduling
      const scheduledTime =
        validationResult.adjustedTime || primaryRecommendation.recommendedTime;

      const result: SchedulingResult = {
        content: request.content,
        classification,
        recommendation: primaryRecommendation,
        scheduledTime,
        confidence: this.calculateOverallConfidence(
          classification,
          primaryRecommendation,
          validationResult
        ),
        reasoning: this.generateSchedulingReasoning(
          classification,
          primaryRecommendation,
          validationResult
        ),
        optimizationNotes: this.generateOptimizationNotes(
          classification,
          primaryRecommendation
        ),
        conflicts: validationResult.conflicts,
      };

      // Stap 6: Registreer in planning
      this.scheduledPosts.set(request.content.id, result);

      return result;
    } catch (error) {
      throw new Error("Scheduling failed");
    }
  }

  /**
   * Meerdere content items tegelijk plannen
   */
  async scheduleMultipleContent(
    requests: SchedulingRequest[]
  ): Promise<SchedulingResult[]> {
    // Sorteer op basis van prioriteit en urgency
    const sortedRequests = await this.prioritizeRequests(requests);

    const results: SchedulingResult[] = [];

    for (const request of sortedRequests) {
      try {
        const result = await this.scheduleContent(request);
        results.push(result);
      } catch (error) {
        console.error(
          `Failed to schedule content ${request.content.title}:`,
          error
        );
        // Continue met volgende items bij failure
      }
    }

    return results;
  }

  /**
   * Herplan bestaande content (bijv. bij wijzigingen)
   */
  async rescheduleContent(
    contentId: string,
    newRequest: SchedulingRequest
  ): Promise<SchedulingResult> {
    // Verwijder oude planning
    this.scheduledPosts.delete(contentId);

    // Plan opnieuw
    return this.scheduleContent(newRequest);
  }

  /**
   * Krijg overzicht van geplande content
   */
  getScheduledContent(filters?: {
    platform?: string;
    dateRange?: { start: Date; end: Date };
    status?: string;
  }): SchedulingResult[] {
    let results = Array.from(this.scheduledPosts.values());

    if (filters) {
      if (filters.platform) {
        results = results.filter(r => r.content.platform === filters.platform);
      }

      if (filters.dateRange) {
        results = results.filter(
          r =>
            r.scheduledTime >= filters.dateRange!.start &&
            r.scheduledTime <= filters.dateRange!.end
        );
      }
    }

    return results.sort(
      (a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime()
    );
  }

  /**
   * Detecteer scheduling conflicts
   */
  async detectConflicts(timeframe?: { start: Date; end: Date }): Promise<
    Array<{
      type: string;
      description: string;
      affectedContent: string[];
      suggestions: string[];
    }>
  > {
    const scheduled = this.getScheduledContent({ dateRange: timeframe });
    const conflicts: Array<{
      type: string;
      description: string;
      affectedContent: string[];
      suggestions: string[];
    }> = [];

    // Detecteer tijdconflicten (te veel posts in korte tijd)
    const timeGroups = this.groupByTimeWindow(scheduled, 1); // 1 hour windows

    for (const [timeWindow, posts] of timeGroups) {
      if (posts.length > 3) {
        // Max 3 posts per uur
        conflicts.push({
          type: "time_overload",
          description: `Te veel posts gepland in ${timeWindow}`,
          affectedContent: posts.map(p => p.content.id),
          suggestions: [
            "Spreidt posts over langere periode",
            "Verhoog prioriteit voor urgente content",
          ],
        });
      }
    }

    // Detecteer platform overload
    const platformGroups = this.groupByPlatformAndDay(scheduled);

    for (const [platformDay, posts] of platformGroups) {
      const [platform] = platformDay.split("-");
      const limit = this.config.platformLimits?.[platform]?.maxPerDay || 5;

      if (posts.length > limit) {
        conflicts.push({
          type: "platform_overload",
          description: `Te veel posts voor ${platform} op dezelfde dag`,
          affectedContent: posts.map(p => p.content.id),
          suggestions: [
            `Verplaats enkele posts naar andere dagen`,
            `Maximum: ${limit} posts per dag`,
          ],
        });
      }
    }

    return conflicts;
  }

  /**
   * Optimaliseer bestaande planning
   */
  async optimizeSchedule(criteria?: {
    prioritizeEngagement?: boolean;
    balancePlatforms?: boolean;
    respectBusinessHours?: boolean;
  }): Promise<{
    originalCount: number;
    optimizedCount: number;
    improvements: string[];
    newSchedule: SchedulingResult[];
  }> {
    const currentSchedule = Array.from(this.scheduledPosts.values());
    const originalCount = currentSchedule.length;

    // Extract content items voor herplanning
    const contentRequests: SchedulingRequest[] = currentSchedule.map(
      result => ({
        content: result.content,
        priority: this.determinePriorityFromClassification(
          result.classification
        ),
      })
    );

    // Clear huidige planning
    this.scheduledPosts.clear();

    // Herplan met optimalisatie criteria
    const optimizedSchedule =
      await this.scheduleMultipleContent(contentRequests);

    return {
      originalCount,
      optimizedCount: optimizedSchedule.length,
      improvements: this.calculateImprovements(
        currentSchedule,
        optimizedSchedule
      ),
      newSchedule: optimizedSchedule,
    };
  }

  /**
   * Get analytics van scheduling performance
   */
  getSchedulingAnalytics(period?: { start: Date; end: Date }): {
    totalScheduled: number;
    platformDistribution: Record<string, number>;
    timeDistribution: Record<string, number>;
    averageConfidence: number;
    conflictRate: number;
    optimizationOpportunities: string[];
  } {
    const scheduled = this.getScheduledContent({ dateRange: period });

    const platformDist: Record<string, number> = {};
    const timeDist: Record<string, number> = {};
    let totalConfidence = 0;
    let conflictCount = 0;

    for (const result of scheduled) {
      // Platform distribution
      platformDist[result.content.platform] =
        (platformDist[result.content.platform] || 0) + 1;

      // Time distribution (hour of day)
      const hour = result.scheduledTime.getHours();
      const timeSlot = `${hour}:00`;
      timeDist[timeSlot] = (timeDist[timeSlot] || 0) + 1;

      // Confidence
      totalConfidence += result.confidence;

      // Conflicts
      if (result.conflicts && result.conflicts.length > 0) {
        conflictCount++;
      }
    }

    return {
      totalScheduled: scheduled.length,
      platformDistribution: platformDist,
      timeDistribution: timeDist,
      averageConfidence:
        scheduled.length > 0 ? totalConfidence / scheduled.length : 0,
      conflictRate: scheduled.length > 0 ? conflictCount / scheduled.length : 0,
      optimizationOpportunities:
        this.identifyOptimizationOpportunities(scheduled),
    };
  }

  // Private helper methods

  private buildSchedulingContext(
    request: SchedulingRequest,
    classification: ContentClassification
  ): SchedulingContext {
    return {
      ...this.config.defaultSchedulingContext,
      // Override met request-specifieke settings
      contentStrategy: {
        ...this.config.defaultSchedulingContext.contentStrategy,
        // Pas aan op basis van classification
      },
    };
  }

  private async validateScheduling(
    request: SchedulingRequest,
    recommendation: SchedulingRecommendation
  ): Promise<{
    isValid: boolean;
    conflicts?: any[];
    adjustedTime?: Date;
  }> {
    const conflicts: any[] = [];

    // Check constraints
    if (request.constraints) {
      // Check excluded days
      if (
        request.constraints.excludeDays?.includes(
          recommendation.recommendedTime.getDay()
        )
      ) {
        conflicts.push({
          type: "excluded_day",
          description: "Geplande dag is uitgesloten",
          suggestions: ["Kies andere dag"],
        });
      }

      // Check excluded hours
      if (
        request.constraints.excludeHours?.includes(
          recommendation.recommendedTime.getHours()
        )
      ) {
        conflicts.push({
          type: "excluded_hour",
          description: "Geplande uur is uitgesloten",
          suggestions: ["Kies ander tijdstip"],
        });
      }
    }

    // Check existing posts voor minimum gap
    const existingPosts = this.getScheduledContent();
    const proposedTime = recommendation.recommendedTime;
    const minimumGap = request.constraints?.minimumGapBetweenPosts || 2; // hours

    for (const existing of existingPosts) {
      const timeDiff =
        Math.abs(proposedTime.getTime() - existing.scheduledTime.getTime()) /
        (1000 * 60 * 60);
      if (
        timeDiff < minimumGap &&
        existing.content.platform === request.content.platform
      ) {
        conflicts.push({
          type: "time_conflict",
          description: `Te dicht bij bestaande post (${timeDiff.toFixed(1)} uur)`,
          suggestions: [`Verschuif met ${minimumGap} uur`],
        });
      }
    }

    return {
      isValid: conflicts.length === 0,
      conflicts: conflicts.length > 0 ? conflicts : undefined,
    };
  }

  private calculateOverallConfidence(
    classification: ContentClassification,
    recommendation: SchedulingRecommendation,
    validation: any
  ): number {
    let confidence = recommendation.confidence;

    // Verminder confidence bij conflicts
    if (validation.conflicts && validation.conflicts.length > 0) {
      confidence *= 0.8;
    }

    // Verhoog confidence bij sterke content classification
    if (
      classification.categories.length > 0 &&
      classification.categories[0].confidence > 80
    ) {
      confidence *= 1.1;
    }

    return Math.min(100, Math.max(0, confidence));
  }

  private generateSchedulingReasoning(
    classification: ContentClassification,
    recommendation: SchedulingRecommendation,
    validation: any
  ): string[] {
    const reasoning: string[] = [];

    reasoning.push(`AI Scheduling confidence: ${recommendation.confidence}%`);

    if (classification.categories.length > 0) {
      reasoning.push(
        `Content categorie: ${classification.categories[0]} (${classification.confidence}% match)`
      );
    }

    reasoning.push(
      `Verwachte engagement: ${recommendation.expectedEngagement}%`
    );
    reasoning.push(`Verwacht bereik: ${recommendation.expectedReach} personen`);

    if (validation.conflicts && validation.conflicts.length > 0) {
      reasoning.push(
        `Let op: ${validation.conflicts.length} scheduling conflicts gedetecteerd`
      );
    }

    return reasoning;
  }

  private generateOptimizationNotes(
    classification: ContentClassification,
    recommendation: SchedulingRecommendation
  ): string[] {
    const notes: string[] = [];

    // Notes van content classification
    notes.push(...classification.optimizationSuggestions);

    // Notes van scheduling recommendation
    if (recommendation.alternativeTimes.length > 0) {
      notes.push(
        `${recommendation.alternativeTimes.length} alternatieve tijden beschikbaar`
      );
    }

    return notes;
  }

  private async prioritizeRequests(
    requests: SchedulingRequest[]
  ): Promise<SchedulingRequest[]> {
    const prioritized = await Promise.all(
      requests.map(async request => {
        const classification = await this.contentCategorizer.classifyContent(
          request.content
        );
        return {
          request,
          priority: this.calculateRequestPriority(request, classification),
        };
      })
    );

    return prioritized
      .sort((a, b) => b.priority - a.priority)
      .map(item => item.request);
  }

  private calculateRequestPriority(
    request: SchedulingRequest,
    classification: ContentClassification
  ): number {
    let priority = 0;

    // Explicit priority
    switch (request.priority) {
      case "urgent":
        priority += 40;
        break;
      case "high":
        priority += 30;
        break;
      case "medium":
        priority += 20;
        break;
      case "low":
        priority += 10;
        break;
    }

    // Classification priority
    priority += classification.priorityScore * 0.3;
    priority += classification.urgencyScore * 0.4;

    return priority;
  }

  private determinePriorityFromClassification(
    classification: ContentClassification
  ): "low" | "medium" | "high" | "urgent" {
    const totalScore =
      classification.priorityScore + classification.urgencyScore;

    if (totalScore > 150) return "urgent";
    if (totalScore > 120) return "high";
    if (totalScore > 80) return "medium";
    return "low";
  }

  private groupByTimeWindow(
    scheduled: SchedulingResult[],
    windowHours: number
  ): Map<string, SchedulingResult[]> {
    const groups = new Map<string, SchedulingResult[]>();

    for (const result of scheduled) {
      const windowStart = new Date(result.scheduledTime);
      windowStart.setMinutes(0, 0, 0);
      windowStart.setHours(
        Math.floor(windowStart.getHours() / windowHours) * windowHours
      );

      const key = windowStart.toISOString().slice(0, 13); // YYYY-MM-DDTHH

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(result);
    }

    return groups;
  }

  private groupByPlatformAndDay(
    scheduled: SchedulingResult[]
  ): Map<string, SchedulingResult[]> {
    const groups = new Map<string, SchedulingResult[]>();

    for (const result of scheduled) {
      const day = result.scheduledTime.toISOString().slice(0, 10); // YYYY-MM-DD
      const key = `${result.content.platform}-${day}`;

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(result);
    }

    return groups;
  }

  private calculateImprovements(
    original: SchedulingResult[],
    optimized: SchedulingResult[]
  ): string[] {
    const improvements: string[] = [];

    // Compare confidence
    const originalAvgConfidence =
      original.reduce((sum, r) => sum + r.confidence, 0) / original.length;
    const optimizedAvgConfidence =
      optimized.reduce((sum, r) => sum + r.confidence, 0) / optimized.length;

    if (optimizedAvgConfidence > originalAvgConfidence) {
      improvements.push(
        `Confidence verbeterd: ${originalAvgConfidence.toFixed(1)}% → ${optimizedAvgConfidence.toFixed(1)}%`
      );
    }

    // Compare conflicts
    const originalConflicts = original.filter(
      r => r.conflicts && r.conflicts.length > 0
    ).length;
    const optimizedConflicts = optimized.filter(
      r => r.conflicts && r.conflicts.length > 0
    ).length;

    if (optimizedConflicts < originalConflicts) {
      improvements.push(
        `Conflicts gereduceerd: ${originalConflicts} → ${optimizedConflicts}`
      );
    }

    return improvements;
  }

  private identifyOptimizationOpportunities(
    scheduled: SchedulingResult[]
  ): string[] {
    const opportunities: string[] = [];

    // Check voor ongebruikte optimale tijden
    const hourDistribution = scheduled.reduce(
      (acc, result) => {
        const hour = result.scheduledTime.getHours();
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>
    );

    const optimalHours = [9, 12, 15, 18]; // Peak engagement hours
    const underutilizedHours = optimalHours.filter(
      hour => (hourDistribution[hour] || 0) < 2
    );

    if (underutilizedHours.length > 0) {
      opportunities.push(
        `Onderbenutting van optimale tijden: ${underutilizedHours.join(", ")}:00`
      );
    }

    // Check platform balance
    const platformDist = scheduled.reduce(
      (acc, result) => {
        acc[result.content.platform] = (acc[result.content.platform] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const platforms = Object.keys(platformDist);
    if (platforms.length > 1) {
      const maxPosts = Math.max(...Object.values(platformDist));
      const minPosts = Math.min(...Object.values(platformDist));

      if (maxPosts > minPosts * 2) {
        opportunities.push(
          "Ongebalanceerde platform distributie - overweeg meer spreiding"
        );
      }
    }

    return opportunities;
  }

  /**
   * Update configuratie
   */
  updateConfig(newConfig: Partial<MasterControlConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Reset alle planning (voor testing/development)
   */
  clearAllSchedules(): void {
    this.scheduledPosts.clear();
  }

  /**
   * Export planning voor externe systemen
   */
  exportSchedule(format: "json" | "csv" = "json"): string {
    const scheduled = Array.from(this.scheduledPosts.values());

    if (format === "csv") {
      const headers = [
        "ID",
        "Title",
        "Platform",
        "Scheduled Time",
        "Confidence",
        "Category",
      ];
      const rows = scheduled.map(result => [
        result.content.id,
        result.content.title.replace(/,/g, ";"), // Escape commas
        result.content.platform,
        result.scheduledTime.toISOString(),
        result.confidence.toString(),
        result.classification.categories[0]?.category.name || "Unknown",
      ]);

      return [headers, ...rows].map(row => row.join(",")).join("\n");
    }

    return JSON.stringify(scheduled, null, 2);
  }
}

/**
 * Factory functie voor eenvoudige initialisatie
 */
export function createSchedulingMasterControl(
  config: MasterControlConfig
): SchedulingMasterControl {
  return new SchedulingMasterControl(config);
}

/**
 * Default configuratie helper
 */
export function createDefaultConfig(): MasterControlConfig {
  return {
    defaultSchedulingContext: {
      targetAudience: {
        primaryTimezone: "Europe/Amsterdam",
        workingHours: { start: 9, end: 17 },
        peakOnlineTimes: [9, 12, 15, 18],
        preferredDays: [1, 2, 3, 4, 5], // Maandag-Vrijdag
      },
      contentStrategy: {
        frequency: "daily",
        optimalGap: 4, // hours
        contentMix: {
          article: 0.4,
          image: 0.3,
          video: 0.2,
          poll: 0.1,
        },
      },
      businessGoals: {
        priority: "engagement",
        targetMetrics: {
          minEngagementRate: 3.0,
          targetReach: 1000,
          conversionGoal: 50,
        },
      },
    },
    globalConstraints: {
      businessHours: { start: 8, end: 20 },
      weekendPosting: true,
      maxDailyPosts: 8,
      minimumPostGap: 2,
    },
    platformLimits: {
      linkedin: { maxPerDay: 3, maxPerHour: 1, optimalTimes: [9, 12, 15] },
      twitter: { maxPerDay: 5, maxPerHour: 2, optimalTimes: [8, 12, 16, 19] },
      facebook: { maxPerDay: 2, maxPerHour: 1, optimalTimes: [10, 14, 18] },
      instagram: {
        maxPerDay: 4,
        maxPerHour: 1,
        optimalTimes: [11, 14, 17, 20],
      },
      email: { maxPerDay: 1, maxPerHour: 1, optimalTimes: [9, 14] },
      blog: { maxPerDay: 1, maxPerHour: 1, optimalTimes: [10, 14] },
    },
  };
}
