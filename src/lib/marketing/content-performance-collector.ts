/**
 * Content Performance Data Collector
 * Task 67.1: Real-time content performance data collection and analysis
 *
 * This service collects content performance data from multiple platforms,
 * analyzes content elements, and feeds data to the self-learning engine.
 */

import { createClient } from "@/lib/supabase/server";
import { ContentPerformanceData } from "./self-learning-analytics";

// Content Element Extraction Types
interface ContentElements {
  colors: string[];
  themes: string[];
  formats: string[];
  visual_elements: string[];
  text_elements: {
    readability_score: number;
    sentiment_score: number;
    emotional_tone: string[];
    key_topics: string[];
  };
}

interface PlatformMetrics {
  platform: string;
  metrics: {
    views: number;
    likes: number;
    shares: number;
    comments: number;
    click_through_rate: number;
    engagement_rate: number;
    conversion_rate: number;
    reach: number;
    impressions: number;
  };
  platform_specific: any;
}

export default class ContentPerformanceCollector {
  private static supabase = createClient();

  /**
   * Collect performance data for a specific piece of content
   */
  static async collectContentPerformance(
    contentId: string,
    platforms: string[] = ["linkedin", "facebook", "instagram", "twitter"],
    includeHistorical: boolean = true
  ): Promise<ContentPerformanceData | null> {
    try {
      console.log(
        `[ContentCollector] Collecting performance data for content: ${contentId}`
      );

      // Fetch content metadata
      const contentMetadata = await this.fetchContentMetadata(contentId);
      if (!contentMetadata) {
        console.warn(
          `[ContentCollector] Content metadata not found for: ${contentId}`
        );
        return null;
      }

      // Collect metrics from all platforms
      const platformMetrics = await Promise.all(
        platforms.map(platform =>
          this.collectPlatformMetrics(contentId, platform)
        )
      );

      // Filter out null results
      const validMetrics = platformMetrics.filter(
        metric => metric !== null
      ) as PlatformMetrics[];

      if (validMetrics.length === 0) {
        console.warn(
          `[ContentCollector] No valid metrics found for content: ${contentId}`
        );
        return null;
      }

      // Aggregate metrics across platforms
      const aggregatedMetrics = this.aggregateMetrics(validMetrics);

      // Extract content elements for analysis
      const contentElements =
        await this.extractContentElements(contentMetadata);

      // Analyze audience data
      const audienceData = await this.analyzeAudienceData(contentId, platforms);

      // Build performance data object
      const performanceData: ContentPerformanceData = {
        content_id: contentId,
        title: contentMetadata.title,
        content_type: contentMetadata.content_type,
        platform: validMetrics[0].platform, // Primary platform
        published_at: new Date(contentMetadata.published_at),
        metrics: aggregatedMetrics,
        content_features: {
          word_count: contentMetadata.word_count || 0,
          hashtag_count: this.countHashtags(contentMetadata.content),
          mention_count: this.countMentions(contentMetadata.content),
          media_count: contentMetadata.media_count || 0,
          sentiment_score: contentElements.text_elements.sentiment_score,
          readability_score: contentElements.text_elements.readability_score,
          emotional_tone: contentElements.text_elements.emotional_tone,
          topics: contentElements.text_elements.key_topics,
          posting_time: contentMetadata.posting_time,
          day_of_week: new Date(contentMetadata.published_at).getDay() + 1,
        },
        audience_data: audienceData,
      };

      // Store in database
      await this.storePerformanceData(performanceData, contentElements);

      // Store historical snapshots if requested
      if (includeHistorical) {
        await this.storeHistoricalSnapshot(contentId, aggregatedMetrics);
      }

      console.log(
        `[ContentCollector] Successfully collected performance data for: ${contentId}`
      );
      return performanceData;
    } catch (error) {
      console.error(
        `[ContentCollector] Error collecting performance data for ${contentId}:`,
        error
      );
      throw new Error(`Failed to collect content performance data: ${error}`);
    }
  }

  /**
   * Batch collect performance data for multiple contents
   */
  static async batchCollectPerformance(
    contentIds: string[],
    platforms: string[] = ["linkedin", "facebook", "instagram", "twitter"],
    batchSize: number = 10
  ): Promise<ContentPerformanceData[]> {
    try {
      console.log(
        `[ContentCollector] Starting batch collection for ${contentIds.length} contents`
      );

      const results: ContentPerformanceData[] = [];

      // Process in batches to avoid overwhelming APIs
      for (let i = 0; i < contentIds.length; i += batchSize) {
        const batch = contentIds.slice(i, i + batchSize);
        console.log(
          `[ContentCollector] Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(contentIds.length / batchSize)}`
        );

        const batchPromises = batch.map(contentId =>
          this.collectContentPerformance(contentId, platforms).catch(error => {
            console.error(
              `[ContentCollector] Failed to collect data for ${contentId}:`,
              error
            );
            return null;
          })
        );

        const batchResults = await Promise.all(batchPromises);
        const validResults = batchResults.filter(
          result => result !== null
        ) as ContentPerformanceData[];
        results.push(...validResults);

        // Add delay between batches to respect rate limits
        if (i + batchSize < contentIds.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      console.log(
        `[ContentCollector] Batch collection completed. Collected ${results.length}/${contentIds.length} successfully`
      );
      return results;
    } catch (error) {
      console.error(`[ContentCollector] Batch collection error:`, error);
      throw new Error(`Failed to batch collect performance data: ${error}`);
    }
  }

  /**
   * Real-time monitoring for active content
   */
  static async startRealTimeMonitoring(
    contentIds: string[],
    monitoringInterval: number = 300000 // 5 minutes
  ): Promise<void> {
    console.log(
      `[ContentCollector] Starting real-time monitoring for ${contentIds.length} contents`
    );

    const monitorContent = async () => {
      try {
        for (const contentId of contentIds) {
          const performanceData = await this.collectContentPerformance(
            contentId,
            undefined,
            true
          );

          if (performanceData) {
            // Check for performance anomalies
            await this.checkPerformanceAnomalies(performanceData);

            // Update real-time insights
            await this.updateRealTimeInsights(performanceData);
          }
        }
      } catch (error) {
        console.error(`[ContentCollector] Real-time monitoring error:`, error);
      }
    };

    // Initial collection
    await monitorContent();

    // Set up interval monitoring
    setInterval(monitorContent, monitoringInterval);
  }

  /**
   * Extract content elements for pattern analysis
   */
  private static async extractContentElements(
    contentMetadata: any
  ): Promise<ContentElements> {
    try {
      const elements: ContentElements = {
        colors: [],
        themes: [],
        formats: [],
        visual_elements: [],
        text_elements: {
          readability_score: 0,
          sentiment_score: 0,
          emotional_tone: [],
          key_topics: [],
        },
      };

      // Extract visual elements if content has media
      if (contentMetadata.media_urls && contentMetadata.media_urls.length > 0) {
        elements.colors = await this.extractColors(contentMetadata.media_urls);
        elements.visual_elements = await this.analyzeVisualElements(
          contentMetadata.media_urls
        );
      }

      // Analyze text content
      if (contentMetadata.content) {
        elements.text_elements = await this.analyzeTextContent(
          contentMetadata.content
        );
        elements.themes = await this.extractThemes(contentMetadata.content);
      }

      // Determine format
      elements.formats = this.determineContentFormats(contentMetadata);

      return elements;
    } catch (error) {
      console.error(
        `[ContentCollector] Error extracting content elements:`,
        error
      );
      return {
        colors: [],
        themes: [],
        formats: [],
        visual_elements: [],
        text_elements: {
          readability_score: 0,
          sentiment_score: 0,
          emotional_tone: [],
          key_topics: [],
        },
      };
    }
  }

  /**
   * Collect metrics from a specific platform
   */
  private static async collectPlatformMetrics(
    contentId: string,
    platform: string
  ): Promise<PlatformMetrics | null> {
    try {
      console.log(
        `[ContentCollector] Collecting ${platform} metrics for: ${contentId}`
      );

      // Implementation would vary based on platform APIs
      switch (platform.toLowerCase()) {
        case "linkedin":
          return await this.collectLinkedInMetrics(contentId);
        case "facebook":
          return await this.collectFacebookMetrics(contentId);
        case "instagram":
          return await this.collectInstagramMetrics(contentId);
        case "twitter":
          return await this.collectTwitterMetrics(contentId);
        default:
          console.warn(`[ContentCollector] Unsupported platform: ${platform}`);
          return null;
      }
    } catch (error) {
      console.error(
        `[ContentCollector] Error collecting ${platform} metrics:`,
        error
      );
      return null;
    }
  }

  /**
   * LinkedIn metrics collection
   */
  private static async collectLinkedInMetrics(
    contentId: string
  ): Promise<PlatformMetrics | null> {
    try {
      // Mock implementation - replace with actual LinkedIn API calls
      const mockMetrics = {
        platform: "linkedin",
        metrics: {
          views: Math.floor(Math.random() * 10000) + 500,
          likes: Math.floor(Math.random() * 500) + 50,
          shares: Math.floor(Math.random() * 100) + 10,
          comments: Math.floor(Math.random() * 50) + 5,
          click_through_rate: Math.random() * 0.1,
          engagement_rate: Math.random() * 0.15,
          conversion_rate: Math.random() * 0.05,
          reach: Math.floor(Math.random() * 8000) + 400,
          impressions: Math.floor(Math.random() * 12000) + 600,
        },
        platform_specific: {
          profile_visits: Math.floor(Math.random() * 100),
          follower_growth: Math.floor(Math.random() * 20),
        },
      };

      return mockMetrics;
    } catch (error) {
      console.error(`[ContentCollector] LinkedIn API error:`, error);
      return null;
    }
  }

  /**
   * Facebook metrics collection
   */
  private static async collectFacebookMetrics(
    contentId: string
  ): Promise<PlatformMetrics | null> {
    try {
      // Mock implementation - replace with actual Facebook API calls
      const mockMetrics = {
        platform: "facebook",
        metrics: {
          views: Math.floor(Math.random() * 8000) + 300,
          likes: Math.floor(Math.random() * 400) + 30,
          shares: Math.floor(Math.random() * 80) + 5,
          comments: Math.floor(Math.random() * 40) + 3,
          click_through_rate: Math.random() * 0.08,
          engagement_rate: Math.random() * 0.12,
          conversion_rate: Math.random() * 0.04,
          reach: Math.floor(Math.random() * 6000) + 250,
          impressions: Math.floor(Math.random() * 10000) + 400,
        },
        platform_specific: {
          reactions: {
            like: Math.floor(Math.random() * 300),
            love: Math.floor(Math.random() * 50),
            wow: Math.floor(Math.random() * 20),
          },
        },
      };

      return mockMetrics;
    } catch (error) {
      console.error(`[ContentCollector] Facebook API error:`, error);
      return null;
    }
  }

  /**
   * Instagram metrics collection
   */
  private static async collectInstagramMetrics(
    contentId: string
  ): Promise<PlatformMetrics | null> {
    try {
      // Mock implementation - replace with actual Instagram API calls
      const mockMetrics = {
        platform: "instagram",
        metrics: {
          views: Math.floor(Math.random() * 12000) + 600,
          likes: Math.floor(Math.random() * 600) + 80,
          shares: Math.floor(Math.random() * 120) + 15,
          comments: Math.floor(Math.random() * 60) + 8,
          click_through_rate: Math.random() * 0.12,
          engagement_rate: Math.random() * 0.18,
          conversion_rate: Math.random() * 0.06,
          reach: Math.floor(Math.random() * 9000) + 500,
          impressions: Math.floor(Math.random() * 15000) + 800,
        },
        platform_specific: {
          saves: Math.floor(Math.random() * 50),
          story_exits: Math.floor(Math.random() * 30),
        },
      };

      return mockMetrics;
    } catch (error) {
      console.error(`[ContentCollector] Instagram API error:`, error);
      return null;
    }
  }

  /**
   * Twitter metrics collection
   */
  private static async collectTwitterMetrics(
    contentId: string
  ): Promise<PlatformMetrics | null> {
    try {
      // Mock implementation - replace with actual Twitter API calls
      const mockMetrics = {
        platform: "twitter",
        metrics: {
          views: Math.floor(Math.random() * 5000) + 200,
          likes: Math.floor(Math.random() * 200) + 20,
          shares: Math.floor(Math.random() * 50) + 5,
          comments: Math.floor(Math.random() * 30) + 3,
          click_through_rate: Math.random() * 0.06,
          engagement_rate: Math.random() * 0.1,
          conversion_rate: Math.random() * 0.03,
          reach: Math.floor(Math.random() * 4000) + 150,
          impressions: Math.floor(Math.random() * 7000) + 300,
        },
        platform_specific: {
          retweets: Math.floor(Math.random() * 30),
          quote_tweets: Math.floor(Math.random() * 15),
        },
      };

      return mockMetrics;
    } catch (error) {
      console.error(`[ContentCollector] Twitter API error:`, error);
      return null;
    }
  }

  /**
   * Aggregate metrics from multiple platforms
   */
  private static aggregateMetrics(platformMetrics: PlatformMetrics[]): any {
    const aggregated = {
      views: 0,
      likes: 0,
      shares: 0,
      comments: 0,
      click_through_rate: 0,
      engagement_rate: 0,
      conversion_rate: 0,
      reach: 0,
      impressions: 0,
    };

    const platformCount = platformMetrics.length;

    platformMetrics.forEach(platform => {
      aggregated.views += platform.metrics.views;
      aggregated.likes += platform.metrics.likes;
      aggregated.shares += platform.metrics.shares;
      aggregated.comments += platform.metrics.comments;
      aggregated.click_through_rate += platform.metrics.click_through_rate;
      aggregated.engagement_rate += platform.metrics.engagement_rate;
      aggregated.conversion_rate += platform.metrics.conversion_rate;
      aggregated.reach += platform.metrics.reach;
      aggregated.impressions += platform.metrics.impressions;
    });

    // Average the rates
    aggregated.click_through_rate /= platformCount;
    aggregated.engagement_rate /= platformCount;
    aggregated.conversion_rate /= platformCount;

    return aggregated;
  }

  /**
   * Store performance data in database
   */
  private static async storePerformanceData(
    performanceData: ContentPerformanceData,
    contentElements: ContentElements
  ): Promise<void> {
    try {
      // Store main performance data
      const { error: performanceError } = await this.supabase
        .from("content_performance")
        .upsert(
          {
            content_id: performanceData.content_id,
            title: performanceData.title,
            content_type: performanceData.content_type,
            platform: performanceData.platform,
            published_at: performanceData.published_at.toISOString(),

            // Metrics
            views: performanceData.metrics.views,
            likes: performanceData.metrics.likes,
            shares: performanceData.metrics.shares,
            comments: performanceData.metrics.comments,
            click_through_rate: performanceData.metrics.click_through_rate,
            engagement_rate: performanceData.metrics.engagement_rate,
            conversion_rate: performanceData.metrics.conversion_rate,
            reach: performanceData.metrics.reach,
            impressions: performanceData.metrics.impressions,

            // Content features
            word_count: performanceData.content_features.word_count,
            hashtag_count: performanceData.content_features.hashtag_count,
            mention_count: performanceData.content_features.mention_count,
            media_count: performanceData.content_features.media_count,
            sentiment_score: performanceData.content_features.sentiment_score,
            readability_score:
              performanceData.content_features.readability_score,
            emotional_tone: performanceData.content_features.emotional_tone,
            topics: performanceData.content_features.topics,
            posting_time: performanceData.content_features.posting_time,
            day_of_week: performanceData.content_features.day_of_week,

            // Content elements
            content_elements: contentElements,
            hashtags: this.extractHashtags(
              performanceData.content_features.topics.join(" ")
            ),

            // Audience data
            audience_demographics: performanceData.audience_data.demographics,
            audience_interests: performanceData.audience_data.interests,
            engagement_patterns:
              performanceData.audience_data.engagement_patterns,

            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "content_id,platform",
          }
        );

      if (performanceError) {
        throw performanceError;
      }

      console.log(
        `[ContentCollector] Stored performance data for: ${performanceData.content_id}`
      );
    } catch (error) {
      console.error(
        `[ContentCollector] Error storing performance data:`,
        error
      );
      throw error;
    }
  }

  /**
   * Helper methods for content analysis
   */
  private static async fetchContentMetadata(contentId: string): Promise<any> {
    // Mock implementation - replace with actual content metadata fetching
    return {
      title: `Content ${contentId}`,
      content_type: "post",
      content: `Sample content for ${contentId} with #hashtags and @mentions`,
      published_at: new Date().toISOString(),
      posting_time: new Date().toTimeString().split(" ")[0],
      word_count: 150,
      media_count: 1,
      media_urls: ["https://example.com/image.jpg"],
    };
  }

  private static countHashtags(content: string): number {
    return (content.match(/#[\w]+/g) || []).length;
  }

  private static countMentions(content: string): number {
    return (content.match(/@[\w]+/g) || []).length;
  }

  private static extractHashtags(content: string): string[] {
    return (content.match(/#[\w]+/g) || []).map(tag => tag.substring(1));
  }

  private static async extractColors(mediaUrls: string[]): Promise<string[]> {
    // Mock implementation - replace with actual color extraction
    return ["#FF5733", "#33FF57", "#3357FF"];
  }

  private static async analyzeVisualElements(
    mediaUrls: string[]
  ): Promise<string[]> {
    // Mock implementation - replace with actual visual analysis
    return ["professional", "modern", "colorful"];
  }

  private static async analyzeTextContent(content: string): Promise<any> {
    // Mock implementation - replace with actual NLP analysis
    return {
      readability_score: 75 + Math.random() * 20,
      sentiment_score: 0.6 + Math.random() * 0.4,
      emotional_tone: ["positive", "engaging"],
      key_topics: ["business", "technology", "innovation"],
    };
  }

  private static async extractThemes(content: string): Promise<string[]> {
    // Mock implementation - replace with actual theme extraction
    return ["business", "technology", "growth"];
  }

  private static determineContentFormats(metadata: any): string[] {
    const formats = ["text"];
    if (metadata.media_count > 0) formats.push("visual");
    if (metadata.content_type === "video") formats.push("video");
    return formats;
  }

  private static async analyzeAudienceData(
    contentId: string,
    platforms: string[]
  ): Promise<any> {
    // Mock implementation - replace with actual audience analysis
    return {
      demographics: {
        age_groups: { "25-34": 40, "35-44": 30, "45-54": 20, "55+": 10 },
        locations: { Netherlands: 60, Germany: 20, Belgium: 10, Other: 10 },
      },
      interests: ["technology", "business", "innovation", "AI"],
      engagement_patterns: {
        peak_hours: ["09:00", "12:00", "18:00"],
        active_days: ["Monday", "Tuesday", "Wednesday"],
      },
    };
  }

  private static async storeHistoricalSnapshot(
    contentId: string,
    metrics: any
  ): Promise<void> {
    try {
      // Get content performance ID
      const { data: contentPerformance } = await this.supabase
        .from("content_performance")
        .select("id")
        .eq("content_id", contentId)
        .single();

      if (!contentPerformance) return;

      // Store historical snapshot
      const { error } = await this.supabase
        .from("content_performance_history")
        .insert({
          content_performance_id: contentPerformance.id,
          snapshot_time: new Date().toISOString(),
          metrics_snapshot: metrics,
          metrics_delta: {}, // Calculate delta in a real implementation
        });

      if (error) throw error;
    } catch (error) {
      console.error(
        `[ContentCollector] Error storing historical snapshot:`,
        error
      );
    }
  }

  private static async checkPerformanceAnomalies(
    performanceData: ContentPerformanceData
  ): Promise<void> {
    // Implementation for anomaly detection
    console.log(
      `[ContentCollector] Checking anomalies for: ${performanceData.content_id}`
    );
  }

  private static async updateRealTimeInsights(
    performanceData: ContentPerformanceData
  ): Promise<void> {
    // Implementation for real-time insights update
    console.log(
      `[ContentCollector] Updating real-time insights for: ${performanceData.content_id}`
    );
  }
}
