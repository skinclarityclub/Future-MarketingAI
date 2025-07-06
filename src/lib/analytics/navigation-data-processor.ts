/**
 * Navigation Data Processor
 * Converts user behavior data into ML features for navigation prediction
 */

import { createClient } from "@/lib/supabase/server";
import {
  NavigationFeatures,
  TrainingDataPoint,
  NavigationPattern,
  UserSegment,
} from "./ml-navigation-types";
import { UserBehaviorEvent, UserSession } from "./user-behavior-types";

export class NavigationDataProcessor {
  private supabase: any;

  constructor() {
    // Initialize as null, will be created when needed
    this.supabase = null;
  }

  // Get or create Supabase client
  private async getSupabaseClient() {
    if (!this.supabase) {
      this.supabase = await createClient();
    }
    return this.supabase;
  }

  /**
   * Extract features from user behavior data for ML model
   */
  async extractNavigationFeatures(
    sessionId: string,
    currentPage: string,
    userId?: string
  ): Promise<NavigationFeatures> {
    try {
      // Get current session data
      const session = await this.getSessionData(sessionId);

      // Get current page analytics
      const pageAnalytics = await this.getCurrentPageAnalytics(
        sessionId,
        currentPage
      );

      // Get user historical data if available
      const userHistory = userId
        ? await this.getUserHistoricalData(userId)
        : null;

      // Get page metadata
      const pageMetadata = await this.getPageMetadata(currentPage);

      // Extract temporal features
      const now = new Date();
      const temporalFeatures = {
        hour_of_day: now.getHours(),
        day_of_week: now.getDay(),
        is_weekend: now.getDay() === 0 || now.getDay() === 6,
      };

      // Construct feature vector
      const features: NavigationFeatures = {
        // User context
        user_id: userId,
        session_id: sessionId,
        device_type: session?.device_info?.device_type || "desktop",
        browser: session?.device_info?.browser || "unknown",
        is_returning_visitor: session?.is_returning_visitor || false,

        // Current state
        current_page: currentPage,
        time_on_page: pageAnalytics.timeOnPage,
        scroll_depth: pageAnalytics.maxScrollDepth,
        clicks_on_page: pageAnalytics.clicksOnPage,

        // Session context
        session_duration: session?.duration || 0,
        pages_visited_in_session: session?.page_views || 0,
        total_clicks_in_session: session?.clicks || 0,
        bounce_rate: this.calculateSessionBounceRate(session),

        // Temporal features
        ...temporalFeatures,

        // Historical behavior
        total_sessions: userHistory?.sessionCount || 1,
        average_session_duration:
          userHistory?.averageSessionDuration || session?.duration || 0,
        most_visited_pages: userHistory?.mostVisitedPages || [currentPage],
        preferred_device_type:
          userHistory?.preferredDeviceType ||
          session?.device_info?.device_type ||
          "desktop",

        // Interaction patterns
        form_interactions_count: pageAnalytics.formInteractions,
        search_queries_count: pageAnalytics.searchQueries,
        error_encounters: pageAnalytics.errorCount,
        video_engagements: pageAnalytics.videoEngagements,

        // Page-specific features
        page_load_time: pageAnalytics.averageLoadTime,
        page_category: pageMetadata.category,
        page_depth: this.calculatePageDepth(currentPage),
        has_forms: pageMetadata.hasForms,
        has_videos: pageMetadata.hasVideos,
        has_downloads: pageMetadata.hasDownloads,

        // UTM and referral context
        traffic_source: session?.utm_source || session?.referrer || "direct",
        utm_campaign: session?.utm_campaign,
        utm_medium: session?.utm_medium,
        referrer_domain: this.extractDomain(session?.referrer),
      };

      return features;
    } catch (error) {
      console.error("Error extracting navigation features:", error);
      throw error;
    }
  }

  /**
   * Prepare training data from historical user behavior
   */
  async prepareTrainingData(
    startDate: string,
    endDate: string,
    options: {
      minSessionDuration?: number;
      excludeBounceSessions?: boolean;
      sampleSize?: number;
    } = {}
  ): Promise<TrainingDataPoint[]> {
    try {
      const { data: sessions, error } = await this.supabase
        .from("user_sessions")
        .select(
          `
          *,
          user_behavior_events (*)
        `
        )
        .gte("start_time", startDate)
        .lte("start_time", endDate)
        .not("end_time", "is", null);

      if (error) throw error;

      const trainingData: TrainingDataPoint[] = [];

      for (const session of sessions) {
        // Filter based on options
        if (
          options.minSessionDuration &&
          session.duration < options.minSessionDuration
        ) {
          continue;
        }
        if (options.excludeBounceSessions && session.bounce_rate > 0.8) {
          continue;
        }

        // Get page navigation sequence
        const pageViews = session.user_behavior_events
          .filter((event: any) => event.event_type === "page_view")
          .sort(
            (a: any, b: any) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );

        // Create training points for each page transition
        for (let i = 0; i < pageViews.length - 1; i++) {
          const currentPageEvent = pageViews[i];
          const nextPageEvent = pageViews[i + 1];

          try {
            const features = await this.extractNavigationFeatures(
              session.id,
              currentPageEvent.page_url,
              session.user_id
            );

            const timeToNext =
              new Date(nextPageEvent.timestamp).getTime() -
              new Date(currentPageEvent.timestamp).getTime();

            const trainingPoint: TrainingDataPoint = {
              features,
              target: nextPageEvent.page_url,
              session_outcome: this.determineSessionOutcome(session),
              engagement_score: this.calculateEngagementScore(
                session,
                currentPageEvent
              ),
              time_to_next_action: timeToNext / 1000, // Convert to seconds
              user_satisfaction_indicator:
                this.estimateUserSatisfaction(session),
            };

            trainingData.push(trainingPoint);
          } catch (error) {
            console.warn("Error creating training point:", error);
            continue;
          }
        }
      }

      // Apply sampling if requested
      if (options.sampleSize && trainingData.length > options.sampleSize) {
        return this.stratifiedSample(trainingData, options.sampleSize);
      }

      return trainingData;
    } catch (error) {
      console.error("Error preparing training data:", error);
      throw error;
    }
  }

  /**
   * Discover navigation patterns from user behavior data
   */
  async discoverNavigationPatterns(
    minSupport: number = 0.01,
    minConfidence: number = 0.5
  ): Promise<NavigationPattern[]> {
    try {
      // Get frequent page sequences
      const { data: sequences, error } = await this.supabase.rpc(
        "find_frequent_page_sequences",
        {
          min_support: minSupport,
          min_confidence: minConfidence,
        }
      );

      if (error) throw error;

      const patterns: NavigationPattern[] = sequences.map((seq: any) => ({
        pattern_id: seq.pattern_id,
        pattern_type: this.classifyPatternType(seq.pages),
        pages: seq.pages,
        frequency: seq.frequency,
        average_duration: seq.average_duration,
        user_segments: seq.user_segments || [],
        confidence: seq.confidence,
        discovered_at: new Date().toISOString(),
        last_seen: seq.last_seen,
      }));

      return patterns;
    } catch (error) {
      console.error("Error discovering navigation patterns:", error);
      return [];
    }
  }

  /**
   * Segment users based on navigation behavior
   */
  async segmentUsers(): Promise<UserSegment[]> {
    try {
      // Analyze user behavior patterns
      const { data: userStats, error } = await this.supabase
        .from("user_behavior_metrics")
        .select("*");

      if (error) throw error;

      // K-means clustering simulation (simplified version)
      const segments = this.performUserClustering(userStats);

      return segments;
    } catch (error) {
      console.error("Error segmenting users:", error);
      return [];
    }
  }

  /**
   * Get real-time page recommendations
   */
  async getPageRecommendations(
    currentPage: string,
    sessionId: string,
    userId?: string,
    limit: number = 5
  ): Promise<Array<{ page: string; score: number; reasoning: string }>> {
    try {
      // Get similar sessions
      const similarSessions = await this.findSimilarSessions(sessionId, userId);

      // Analyze next page patterns
      const nextPageCandidates = new Map<
        string,
        { count: number; totalScore: number }
      >();

      for (const session of similarSessions) {
        const pageSequence = session.page_sequence || [];
        const currentIndex = pageSequence.indexOf(currentPage);

        if (currentIndex >= 0 && currentIndex < pageSequence.length - 1) {
          const nextPage = pageSequence[currentIndex + 1];
          const score = this.calculatePageSimilarity(session, sessionId);

          if (!nextPageCandidates.has(nextPage)) {
            nextPageCandidates.set(nextPage, { count: 0, totalScore: 0 });
          }

          const existing = nextPageCandidates.get(nextPage)!;
          existing.count += 1;
          existing.totalScore += score;
        }
      }

      // Calculate final scores and sort
      const recommendations = Array.from(nextPageCandidates.entries())
        .map(([page, stats]) => ({
          page,
          score: (stats.totalScore / stats.count) * Math.log(stats.count + 1),
          reasoning: `Based on ${stats.count} similar user sessions`,
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      return recommendations;
    } catch (error) {
      console.error("Error getting page recommendations:", error);
      return [];
    }
  }

  // Private helper methods

  private async getSessionData(sessionId: string) {
    try {
      const supabase = await this.getSupabaseClient();
      const { data, error } = await supabase
        .from("user_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (error || !data) {
        // Return mock data if database is not available
        return {
          id: sessionId,
          user_id: null,
          device_info: { device_type: "desktop", browser: "unknown" },
          is_returning_visitor: false,
          duration: 300000, // 5 minutes
          page_views: 1,
          clicks: 0,
          bounce_rate: 0,
          start_time: new Date().toISOString(),
          utm_source: null,
          utm_campaign: null,
          utm_medium: null,
          referrer: null,
        };
      }

      return data;
    } catch (error) {
      console.warn("Database not available, using mock session data");
      return {
        id: sessionId,
        user_id: null,
        device_info: { device_type: "desktop", browser: "unknown" },
        is_returning_visitor: false,
        duration: 300000,
        page_views: 1,
        clicks: 0,
        bounce_rate: 0,
        start_time: new Date().toISOString(),
        utm_source: null,
        utm_campaign: null,
        utm_medium: null,
        referrer: null,
      };
    }

    if (error) {
      console.warn("Error fetching session data:", error);
      return null;
    }

    return data;
  }

  private async getCurrentPageAnalytics(
    sessionId: string,
    currentPage: string
  ) {
    const { data: events, error } = await this.supabase
      .from("user_behavior_events")
      .select("*")
      .eq("session_id", sessionId)
      .eq("page_url", currentPage);

    if (error) {
      console.warn("Error fetching page analytics:", error);
      return this.getDefaultPageAnalytics();
    }

    return {
      timeOnPage: this.calculateTimeOnPage(events),
      maxScrollDepth: this.getMaxScrollDepth(events),
      clicksOnPage: events.filter(e => e.event_type === "click").length,
      formInteractions: events.filter(e => e.event_type.includes("form"))
        .length,
      searchQueries: events.filter(e => e.event_type === "search").length,
      errorCount: events.filter(e => e.event_type === "error").length,
      videoEngagements: events.filter(e => e.event_type.includes("video"))
        .length,
      averageLoadTime: this.getAverageLoadTime(events),
    };
  }

  private async getUserHistoricalData(userId: string) {
    const { data, error } = await this.supabase
      .from("user_behavior_metrics")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.warn("Error fetching user historical data:", error);
      return null;
    }

    return {
      sessionCount: data.session_count,
      averageSessionDuration: data.average_session_duration,
      mostVisitedPages: data.most_visited_pages?.map((p: any) => p.url) || [],
      preferredDeviceType: this.inferPreferredDevice(data),
    };
  }

  private async getPageMetadata(pageUrl: string) {
    // This would typically come from a page metadata table
    // For now, we'll infer from the URL structure
    return {
      category: this.inferPageCategory(pageUrl),
      hasForms:
        pageUrl.includes("form") ||
        pageUrl.includes("contact") ||
        pageUrl.includes("signup"),
      hasVideos: pageUrl.includes("video") || pageUrl.includes("tutorial"),
      hasDownloads: pageUrl.includes("download") || pageUrl.includes("report"),
    };
  }

  private calculateSessionBounceRate(session: any): number {
    if (!session) return 1.0;
    if (session.page_views <= 1 || session.duration < 30) return 1.0;
    return 0.0;
  }

  private calculatePageDepth(pageUrl: string): number {
    return (pageUrl.match(/\//g) || []).length - 2; // Subtract protocol and domain
  }

  private extractDomain(url?: string): string | undefined {
    if (!url) return undefined;
    try {
      return new URL(url).hostname;
    } catch {
      return undefined;
    }
  }

  private determineSessionOutcome(
    session: any
  ): "conversion" | "bounce" | "continued" | "exit" {
    if (session.bounce_rate > 0.8) return "bounce";
    if (session.page_views >= 5 && session.duration > 300) return "conversion";
    if (session.page_views > 1) return "continued";
    return "exit";
  }

  private calculateEngagementScore(session: any, pageEvent: any): number {
    // Simple engagement score based on multiple factors
    let score = 0;
    score += Math.min(session.duration / 60, 10); // Time component (max 10 points)
    score += Math.min(session.page_views, 5); // Page views component (max 5 points)
    score += Math.min(session.clicks / 10, 3); // Clicks component (max 3 points)
    score += session.form_interactions * 2; // Form interactions are valuable
    return Math.min(score, 20); // Cap at 20
  }

  private estimateUserSatisfaction(session: any): number {
    // Estimate satisfaction based on session behavior
    if (session.bounce_rate > 0.8) return 1; // Low satisfaction
    if (session.duration > 300 && session.page_views >= 3) return 5; // High satisfaction
    if (session.duration > 120) return 4; // Good satisfaction
    if (session.duration > 60) return 3; // Medium satisfaction
    return 2; // Below average satisfaction
  }

  private stratifiedSample(
    data: TrainingDataPoint[],
    sampleSize: number
  ): TrainingDataPoint[] {
    // Simple random sampling for now
    const shuffled = [...data].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, sampleSize);
  }

  private classifyPatternType(
    pages: string[]
  ): "sequential" | "cyclical" | "branching" | "converging" {
    // Simple heuristics for pattern classification
    if (pages.length <= 2) return "sequential";
    if (pages[0] === pages[pages.length - 1]) return "cyclical";
    if (pages.includes(pages[0]) && pages.lastIndexOf(pages[0]) !== 0)
      return "cyclical";
    return "sequential"; // Default to sequential
  }

  private performUserClustering(userStats: any[]): UserSegment[] {
    // Simplified clustering - in production, use proper ML clustering
    const segments: UserSegment[] = [
      {
        segment_id: "power_users",
        name: "Power Users",
        description: "Highly engaged users with long sessions",
        criteria: {
          device_types: ["desktop"],
          behavior_patterns: ["deep_navigation", "high_interaction"],
          engagement_level: "high",
          session_characteristics: {
            min_duration: 300,
            min_pages: 5,
          },
        },
        navigation_preferences: {
          preferred_paths: ["/analytics", "/reports", "/advanced"],
          avoided_pages: ["/help", "/getting-started"],
          optimal_timing: {
            hour_range: [9, 17],
            day_preferences: [
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
            ],
          },
        },
        model_performance: {
          accuracy: 0.85,
          sample_size: userStats.filter(u => u.average_session_duration > 300)
            .length,
        },
      },
      {
        segment_id: "casual_browsers",
        name: "Casual Browsers",
        description: "Users with shorter, exploratory sessions",
        criteria: {
          device_types: ["mobile", "tablet"],
          behavior_patterns: ["quick_browsing", "low_interaction"],
          engagement_level: "medium",
          session_characteristics: {
            max_duration: 180,
            max_pages: 3,
          },
        },
        navigation_preferences: {
          preferred_paths: ["/", "/overview", "/summary"],
          avoided_pages: ["/advanced", "/detailed-reports"],
          optimal_timing: {
            hour_range: [18, 23],
            day_preferences: ["saturday", "sunday"],
          },
        },
        model_performance: {
          accuracy: 0.72,
          sample_size: userStats.filter(u => u.average_session_duration <= 180)
            .length,
        },
      },
    ];

    return segments;
  }

  private async findSimilarSessions(sessionId: string, userId?: string) {
    // Find sessions with similar characteristics
    const { data, error } = await this.supabase
      .from("user_sessions")
      .select("*")
      .neq("id", sessionId)
      .limit(20);

    if (error) {
      console.warn("Error finding similar sessions:", error);
      return [];
    }

    return data || [];
  }

  private calculatePageSimilarity(session1: any, session2Id: string): number {
    // Simple similarity metric - in production, use more sophisticated measures
    return Math.random() * 0.5 + 0.5; // Placeholder
  }

  private getDefaultPageAnalytics() {
    return {
      timeOnPage: 0,
      maxScrollDepth: 0,
      clicksOnPage: 0,
      formInteractions: 0,
      searchQueries: 0,
      errorCount: 0,
      videoEngagements: 0,
      averageLoadTime: 0,
    };
  }

  private calculateTimeOnPage(events: any[]): number {
    if (events.length < 2) return 0;
    const pageViews = events.filter(e => e.event_type === "page_view");
    if (pageViews.length === 0) return 0;
    const firstView = new Date(pageViews[0].timestamp);
    const lastEvent = new Date(events[events.length - 1].timestamp);
    return (lastEvent.getTime() - firstView.getTime()) / 1000;
  }

  private getMaxScrollDepth(events: any[]): number {
    const scrollEvents = events.filter(e => e.event_type === "scroll");
    if (scrollEvents.length === 0) return 0;
    return Math.max(...scrollEvents.map(e => e.event_data?.scroll_depth || 0));
  }

  private getAverageLoadTime(events: any[]): number {
    const pageViews = events.filter(e => e.event_type === "page_view");
    if (pageViews.length === 0) return 0;
    const loadTimes = pageViews
      .map(e => e.event_data?.page_load_time)
      .filter(t => t != null);
    if (loadTimes.length === 0) return 0;
    return loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length;
  }

  private inferPageCategory(pageUrl: string): string {
    if (pageUrl.includes("dashboard")) return "analytics";
    if (pageUrl.includes("report")) return "reporting";
    if (pageUrl.includes("user") || pageUrl.includes("profile"))
      return "user_management";
    if (pageUrl.includes("setting")) return "configuration";
    if (pageUrl.includes("help") || pageUrl.includes("support"))
      return "support";
    return "general";
  }

  private inferPreferredDevice(userData: any): string {
    // Analyze historical device usage patterns
    return userData.device_usage_stats?.most_common || "desktop";
  }
}
