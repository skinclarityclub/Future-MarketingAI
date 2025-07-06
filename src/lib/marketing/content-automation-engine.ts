/**
 * Content Automation Engine
 * Task 103.8: Advanced Automation Features for Content Optimization
 *
 * Features:
 * - Content curation and discovery
 * - Smart reposting with optimization
 * - Cross-platform content adaptation
 * - Hashtag optimization and trending analysis
 * - Content gap analysis and suggestions
 * - Performance-based automation rules
 * - AI-powered content enhancement
 */

import { createClient } from "@/lib/supabase/server";
import { EnterpriseAIContentGenerator } from "@/lib/ai/content-generator";

// Core interfaces
export interface AutomationRule {
  id: string;
  name: string;
  type:
    | "content_curation"
    | "smart_repost"
    | "hashtag_optimization"
    | "gap_analysis"
    | "performance_optimization";
  enabled: boolean;
  triggers: AutomationTrigger[];
  actions: AutomationAction[];
  conditions: AutomationCondition[];
  schedule?: AutomationSchedule;
  performance_metrics: {
    executions: number;
    success_rate: number;
    content_generated: number;
    engagement_improvement: number;
  };
}

export interface AutomationTrigger {
  type: "time_based" | "performance_based" | "content_based" | "trend_based";
  configuration: {
    schedule?: string; // cron format
    performance_threshold?: number;
    content_criteria?: string[];
    trend_keywords?: string[];
  };
}

export interface AutomationAction {
  type:
    | "curate_content"
    | "repost_content"
    | "optimize_hashtags"
    | "adapt_content"
    | "create_content";
  configuration: {
    target_platforms?: string[];
    optimization_level?: "basic" | "advanced" | "premium";
    content_filters?: string[];
    repost_strategy?: "time_delay" | "platform_specific" | "performance_based";
  };
}

export interface AutomationCondition {
  field: string;
  operator:
    | "equals"
    | "greater_than"
    | "less_than"
    | "contains"
    | "not_contains";
  value: any;
  logical_operator?: "AND" | "OR";
}

export interface AutomationSchedule {
  frequency: "hourly" | "daily" | "weekly" | "monthly";
  time_slots: string[];
  timezone: string;
  weekdays?: number[];
}

export interface ContentCurationResult {
  curated_content: CuratedContent[];
  sources: ContentSource[];
  relevance_scores: Record<string, number>;
  trending_topics: string[];
  engagement_predictions: Record<string, number>;
}

export interface CuratedContent {
  id: string;
  title: string;
  content: string;
  source_url?: string;
  source_type: "rss" | "social" | "news" | "blog" | "internal";
  relevance_score: number;
  engagement_prediction: number;
  suggested_platforms: string[];
  recommended_hashtags: string[];
  adaptation_suggestions: string[];
}

export interface ContentSource {
  id: string;
  name: string;
  type: "rss" | "social" | "news" | "blog" | "api";
  url: string;
  credibility_score: number;
  last_updated: Date;
  content_categories: string[];
}

export interface SmartRepostResult {
  original_content_id: string;
  reposted_versions: RepostedVersion[];
  optimization_applied: string[];
  performance_comparison: {
    original_metrics: ContentMetrics;
    repost_metrics: ContentMetrics;
    improvement_percentage: number;
  };
}

export interface RepostedVersion {
  id: string;
  platform: string;
  optimized_content: string;
  hashtags: string[];
  scheduled_time: Date;
  optimization_notes: string[];
  expected_performance: number;
}

export interface ContentMetrics {
  reach: number;
  engagement: number;
  clicks: number;
  shares: number;
  comments: number;
  likes: number;
  conversion_rate: number;
}

export interface CrossPlatformAdaptation {
  source_platform: string;
  target_platforms: string[];
  adaptations: PlatformAdaptation[];
  consistency_score: number;
  brand_alignment_score: number;
}

export interface PlatformAdaptation {
  platform: string;
  adapted_content: string;
  character_limit_compliance: boolean;
  platform_specific_features: string[];
  optimization_score: number;
  recommended_posting_time: Date;
}

export interface HashtagOptimizationResult {
  original_hashtags: string[];
  optimized_hashtags: string[];
  trending_hashtags: string[];
  performance_predictions: Record<string, number>;
  hashtag_analytics: HashtagAnalytics[];
  optimization_strategy: string;
}

export interface HashtagAnalytics {
  hashtag: string;
  usage_volume: number;
  engagement_rate: number;
  competition_level: "low" | "medium" | "high";
  trend_direction: "rising" | "stable" | "declining";
  recommended_usage: boolean;
}

export interface ContentGapAnalysis {
  identified_gaps: ContentGap[];
  content_opportunities: ContentOpportunity[];
  competitive_insights: CompetitiveInsight[];
  recommendations: GapRecommendation[];
  priority_score: number;
}

export interface ContentGap {
  category: string;
  gap_type: "topic" | "platform" | "format" | "timing" | "audience";
  description: string;
  impact_level: "high" | "medium" | "low";
  suggested_content_types: string[];
  estimated_opportunity: number;
}

export interface ContentOpportunity {
  title: string;
  description: string;
  content_type: string;
  target_platforms: string[];
  estimated_reach: number;
  effort_required: "low" | "medium" | "high";
  roi_prediction: number;
}

export interface CompetitiveInsight {
  competitor_name: string;
  successful_content_types: string[];
  trending_topics: string[];
  posting_frequency: number;
  engagement_strategies: string[];
  gaps_they_miss: string[];
}

export interface GapRecommendation {
  priority: number;
  action_type:
    | "create_content"
    | "increase_frequency"
    | "try_new_platform"
    | "adjust_timing";
  description: string;
  expected_impact: string;
  implementation_difficulty: "easy" | "medium" | "hard";
  timeline: string;
}

// Main Content Automation Engine Class
export class ContentAutomationEngine {
  private supabase = createClient();
  private aiGenerator: EnterpriseAIContentGenerator;
  private activeRules: Map<string, AutomationRule> = new Map();
  private executionHistory: Map<string, any[]> = new Map();

  constructor() {
    this.aiGenerator = new EnterpriseAIContentGenerator({
      model: "gpt-4",
      temperature: 0.7,
      maxTokens: 2000,
    });
  }

  // Content Curation Engine
  async curateContent(criteria: {
    topics: string[];
    sources: string[];
    platforms: string[];
    content_types: string[];
    min_relevance_score?: number;
    max_results?: number;
  }): Promise<ContentCurationResult> {
    const startTime = Date.now();

    try {
      // 1. Fetch content from various sources
      const sourceContent = await this.fetchFromSources(
        criteria.sources,
        criteria.topics
      );

      // 2. Analyze and score content relevance
      const scoredContent = await this.scoreContentRelevance(
        sourceContent,
        criteria
      );

      // 3. Predict engagement potential
      const contentWithPredictions = await this.predictEngagement(
        scoredContent,
        criteria.platforms
      );

      // 4. Generate platform-specific suggestions
      const curatedContent = await this.generatePlatformSuggestions(
        contentWithPredictions,
        criteria
      );

      // 5. Identify trending topics
      const trendingTopics = await this.identifyTrendingTopics(criteria.topics);

      // 6. Filter based on minimum relevance score
      const minScore = criteria.min_relevance_score || 0.6;
      const filteredContent = curatedContent.filter(
        content => content.relevance_score >= minScore
      );

      // 7. Limit results
      const maxResults = criteria.max_results || 20;
      const finalContent = filteredContent.slice(0, maxResults);

      return {
        curated_content: finalContent,
        sources: await this.getContentSources(criteria.sources),
        relevance_scores: this.buildRelevanceMap(finalContent),
        trending_topics: trendingTopics,
        engagement_predictions: this.buildEngagementMap(finalContent),
      };
    } catch (error) {
      console.error("Content curation failed:", error);
      throw new Error(
        `Content curation failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  // Smart Reposting Engine
  async smartRepost(
    contentId: string,
    options: {
      target_platforms: string[];
      optimization_level: "basic" | "advanced" | "premium";
      repost_strategy: "time_delay" | "platform_specific" | "performance_based";
      custom_adaptations?: Record<string, string>;
    }
  ): Promise<SmartRepostResult> {
    try {
      // 1. Fetch original content and its performance
      const originalContent = await this.getContentById(contentId);
      const originalMetrics = await this.getContentMetrics(contentId);

      // 2. Analyze what made the original content successful
      const successFactors = await this.analyzeContentSuccess(
        originalContent,
        originalMetrics
      );

      // 3. Generate optimized versions for each platform
      const repostedVersions: RepostedVersion[] = [];

      for (const platform of options.target_platforms) {
        const optimizedVersion = await this.optimizeContentForPlatform(
          originalContent,
          platform,
          successFactors,
          options.optimization_level
        );

        const scheduledTime = await this.calculateOptimalRepostTime(
          platform,
          options.repost_strategy,
          originalContent.published_date
        );

        repostedVersions.push({
          id: `repost_${Date.now()}_${platform}`,
          platform,
          optimized_content: optimizedVersion.content,
          hashtags: optimizedVersion.hashtags,
          scheduled_time: scheduledTime,
          optimization_notes: optimizedVersion.optimization_notes,
          expected_performance: optimizedVersion.performance_prediction,
        });
      }

      // 4. Calculate expected performance improvements
      const performanceComparison = await this.calculatePerformanceImprovement(
        originalMetrics,
        repostedVersions
      );

      return {
        original_content_id: contentId,
        reposted_versions: repostedVersions,
        optimization_applied: successFactors.applied_optimizations,
        performance_comparison: performanceComparison,
      };
    } catch (error) {
      console.error("Smart repost failed:", error);
      throw new Error(
        `Smart repost failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  // Cross-Platform Content Adaptation
  async adaptContentAcrossPlatforms(
    contentId: string,
    targetPlatforms: string[]
  ): Promise<CrossPlatformAdaptation> {
    try {
      // 1. Get source content
      const sourceContent = await this.getContentById(contentId);

      // 2. Analyze brand voice and consistency requirements
      const brandGuidelines = await this.getBrandGuidelines();

      // 3. Generate platform-specific adaptations
      const adaptations: PlatformAdaptation[] = [];

      for (const platform of targetPlatforms) {
        const platformConfig = await this.getPlatformConfiguration(platform);

        const adaptedContent = await this.aiGenerator.generateContent({
          prompt: `Adapt this content for ${platform}: "${sourceContent.content}"`,
          platform: platform as any,
          contentType: sourceContent.type,
          additionalContext: {
            originalPlatform: sourceContent.platform,
            brandGuidelines: brandGuidelines,
            platformLimits: platformConfig,
          },
        });

        const adaptation: PlatformAdaptation = {
          platform,
          adapted_content: adaptedContent.content,
          character_limit_compliance: this.checkCharacterLimit(
            adaptedContent.content,
            platformConfig.maxCharacters
          ),
          platform_specific_features: this.extractPlatformFeatures(
            adaptedContent.content,
            platform
          ),
          optimization_score: await this.calculateOptimizationScore(
            adaptedContent.content,
            platform
          ),
          recommended_posting_time: await this.getOptimalPostingTime(platform),
        };

        adaptations.push(adaptation);
      }

      // 4. Calculate consistency and brand alignment scores
      const consistencyScore = this.calculateConsistencyScore(adaptations);
      const brandAlignmentScore = this.calculateBrandAlignmentScore(
        adaptations,
        brandGuidelines
      );

      return {
        source_platform: sourceContent.platform,
        target_platforms: targetPlatforms,
        adaptations,
        consistency_score: consistencyScore,
        brand_alignment_score: brandAlignmentScore,
      };
    } catch (error) {
      console.error("Cross-platform adaptation failed:", error);
      throw new Error(
        `Cross-platform adaptation failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  // Hashtag Optimization Engine
  async optimizeHashtags(
    content: string,
    platform: string,
    options: {
      max_hashtags?: number;
      include_trending?: boolean;
      brand_hashtags?: string[];
      exclude_hashtags?: string[];
    }
  ): Promise<HashtagOptimizationResult> {
    try {
      // 1. Extract current hashtags
      const currentHashtags = this.extractHashtags(content);

      // 2. Analyze content to suggest relevant hashtags
      const contentAnalysis = await this.analyzeContentForHashtags(content);

      // 3. Get trending hashtags for the platform
      const trendingHashtags = options.include_trending
        ? await this.getTrendingHashtags(platform)
        : [];

      // 4. Generate optimization suggestions
      const hashtagSuggestions = await this.generateHashtagSuggestions({
        content,
        platform,
        contentAnalysis,
        trendingHashtags,
        brandHashtags: options.brand_hashtags || [],
        excludeHashtags: options.exclude_hashtags || [],
        maxHashtags: options.max_hashtags || 10,
      });

      // 5. Analyze hashtag performance potential
      const hashtagAnalytics = await this.analyzeHashtagPerformance(
        hashtagSuggestions,
        platform
      );

      // 6. Calculate performance predictions
      const performancePredictions =
        this.calculateHashtagPerformance(hashtagAnalytics);

      // 7. Determine optimization strategy
      const optimizationStrategy = this.determineHashtagStrategy(
        hashtagAnalytics,
        currentHashtags
      );

      return {
        original_hashtags: currentHashtags,
        optimized_hashtags: hashtagSuggestions,
        trending_hashtags: trendingHashtags,
        performance_predictions: performancePredictions,
        hashtag_analytics: hashtagAnalytics,
        optimization_strategy: optimizationStrategy,
      };
    } catch (error) {
      console.error("Hashtag optimization failed:", error);
      throw new Error(
        `Hashtag optimization failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  // Content Gap Analysis Engine
  async analyzeContentGaps(criteria: {
    timeframe_days: number;
    target_platforms: string[];
    content_categories: string[];
    competitor_analysis?: boolean;
    industry_benchmarks?: boolean;
  }): Promise<ContentGapAnalysis> {
    try {
      // 1. Analyze current content performance and distribution
      const currentContentAnalysis = await this.analyzeCurrentContent(criteria);

      // 2. Identify gaps in content coverage
      const identifiedGaps = await this.identifyContentGaps(
        currentContentAnalysis,
        criteria
      );

      // 3. Discover content opportunities
      const contentOpportunities = await this.discoverContentOpportunities(
        identifiedGaps,
        criteria
      );

      // 4. Competitive analysis (if enabled)
      const competitiveInsights = criteria.competitor_analysis
        ? await this.analyzeCompetitorContent(criteria)
        : [];

      // 5. Generate recommendations based on gaps and opportunities
      const recommendations = await this.generateGapRecommendations(
        identifiedGaps,
        contentOpportunities,
        competitiveInsights
      );

      // 6. Calculate overall priority score
      const priorityScore = this.calculateGapPriorityScore(
        identifiedGaps,
        contentOpportunities
      );

      return {
        identified_gaps: identifiedGaps,
        content_opportunities: contentOpportunities,
        competitive_insights: competitiveInsights,
        recommendations: recommendations,
        priority_score: priorityScore,
      };
    } catch (error) {
      console.error("Content gap analysis failed:", error);
      throw new Error(
        `Content gap analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  // Automation Rule Management
  async createAutomationRule(
    rule: Omit<AutomationRule, "id" | "performance_metrics">
  ): Promise<string> {
    const ruleId = `automation_rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newRule: AutomationRule = {
      ...rule,
      id: ruleId,
      performance_metrics: {
        executions: 0,
        success_rate: 100,
        content_generated: 0,
        engagement_improvement: 0,
      },
    };

    this.activeRules.set(ruleId, newRule);

    // Store in database
    await this.supabase.from("automation_rules").insert({
      id: ruleId,
      rule_data: newRule,
      created_at: new Date().toISOString(),
    });

    return ruleId;
  }

  async executeAutomationRule(ruleId: string, context?: any): Promise<any> {
    const rule = this.activeRules.get(ruleId);
    if (!rule || !rule.enabled) {
      throw new Error(`Automation rule ${ruleId} not found or disabled`);
    }

    try {
      // Check if triggers are met
      const triggersActive = await this.checkTriggers(rule.triggers, context);
      if (!triggersActive) {
        return { executed: false, reason: "Triggers not met" };
      }

      // Check conditions
      const conditionsMet = await this.checkConditions(
        rule.conditions,
        context
      );
      if (!conditionsMet) {
        return { executed: false, reason: "Conditions not met" };
      }

      // Execute actions
      const results = [];
      for (const action of rule.actions) {
        const actionResult = await this.executeAction(action, context);
        results.push(actionResult);
      }

      // Update performance metrics
      await this.updateRuleMetrics(ruleId, results);

      // Log execution
      this.logExecution(ruleId, { context, results, timestamp: new Date() });

      return {
        executed: true,
        results,
        metrics: rule.performance_metrics,
      };
    } catch (error) {
      console.error(`Automation rule ${ruleId} execution failed:`, error);
      await this.updateRuleMetrics(ruleId, [], true);
      throw error;
    }
  }

  // Helper Methods
  private async fetchFromSources(
    sources: string[],
    topics: string[]
  ): Promise<any[]> {
    // Mock implementation - in production would fetch from RSS, APIs, etc.
    return [
      {
        title: "AI in Marketing: Latest Trends",
        content:
          "AI is revolutionizing marketing with personalized content and automated campaigns...",
        source: "MarketingTech News",
        url: "https://example.com/ai-marketing-trends",
        published_date: new Date(),
        topics: ["AI", "Marketing", "Automation"],
      },
      // More mock content...
    ];
  }

  private async scoreContentRelevance(
    content: any[],
    criteria: any
  ): Promise<any[]> {
    return content.map(item => ({
      ...item,
      relevance_score: Math.random() * 0.4 + 0.6, // Mock scoring 0.6-1.0
    }));
  }

  private async predictEngagement(
    content: any[],
    platforms: string[]
  ): Promise<any[]> {
    return content.map(item => ({
      ...item,
      engagement_prediction: Math.random() * 0.5 + 0.5, // Mock prediction 0.5-1.0
    }));
  }

  private async generatePlatformSuggestions(
    content: any[],
    criteria: any
  ): Promise<CuratedContent[]> {
    return content.map(item => ({
      id: `curated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: item.title,
      content: item.content,
      source_url: item.url,
      source_type: "news" as const,
      relevance_score: item.relevance_score,
      engagement_prediction: item.engagement_prediction,
      suggested_platforms: criteria.platforms.filter(() => Math.random() > 0.3),
      recommended_hashtags: this.generateHashtagsForContent(item.content),
      adaptation_suggestions: this.generateAdaptationSuggestions(
        item.content,
        criteria.platforms
      ),
    }));
  }

  private async identifyTrendingTopics(topics: string[]): Promise<string[]> {
    // Mock trending topics
    return [
      "AI Marketing",
      "Sustainable Business",
      "Remote Work",
      "Digital Transformation",
    ];
  }

  private async getContentSources(
    sourceIds: string[]
  ): Promise<ContentSource[]> {
    // Mock content sources
    return [
      {
        id: "source_1",
        name: "MarketingTech News",
        type: "news" as const,
        url: "https://example.com/feed",
        credibility_score: 0.9,
        last_updated: new Date(),
        content_categories: ["Marketing", "Technology", "AI"],
      },
    ];
  }

  private buildRelevanceMap(content: CuratedContent[]): Record<string, number> {
    return content.reduce(
      (map, item) => {
        map[item.id] = item.relevance_score;
        return map;
      },
      {} as Record<string, number>
    );
  }

  private buildEngagementMap(
    content: CuratedContent[]
  ): Record<string, number> {
    return content.reduce(
      (map, item) => {
        map[item.id] = item.engagement_prediction;
        return map;
      },
      {} as Record<string, number>
    );
  }

  private generateHashtagsForContent(content: string): string[] {
    // Simple hashtag generation based on keywords
    const words = content.toLowerCase().split(/\s+/);
    const keywords = words.filter(
      word => word.length > 5 && /^[a-zA-Z]+$/.test(word)
    );
    return keywords
      .slice(0, 5)
      .map(word => `#${word.charAt(0).toUpperCase() + word.slice(1)}`);
  }

  private generateAdaptationSuggestions(
    content: string,
    platforms: string[]
  ): string[] {
    const suggestions = [];
    if (platforms.includes("twitter")) {
      suggestions.push("Shorten for Twitter character limit");
    }
    if (platforms.includes("instagram")) {
      suggestions.push("Add visual storytelling elements");
    }
    if (platforms.includes("linkedin")) {
      suggestions.push("Emphasize professional insights");
    }
    return suggestions;
  }

  private async getContentById(contentId: string): Promise<any> {
    // Mock content retrieval
    return {
      id: contentId,
      content: "Sample content for automation testing...",
      platform: "linkedin",
      type: "post",
      published_date: new Date(),
    };
  }

  private async getContentMetrics(contentId: string): Promise<ContentMetrics> {
    // Mock metrics
    return {
      reach: 5000,
      engagement: 250,
      clicks: 50,
      shares: 15,
      comments: 8,
      likes: 180,
      conversion_rate: 0.05,
    };
  }

  private extractHashtags(content: string): string[] {
    const hashtagRegex = /#[\w]+/g;
    return content.match(hashtagRegex) || [];
  }

  private checkCharacterLimit(content: string, maxChars: number): boolean {
    return content.length <= maxChars;
  }

  private extractPlatformFeatures(content: string, platform: string): string[] {
    const features = [];
    if (content.includes("@")) features.push("mentions");
    if (content.includes("#")) features.push("hashtags");
    if (content.includes("http")) features.push("links");
    return features;
  }

  private async calculateOptimizationScore(
    content: string,
    platform: string
  ): Promise<number> {
    // Mock optimization score calculation
    return Math.random() * 0.3 + 0.7; // 0.7-1.0
  }

  private async getOptimalPostingTime(platform: string): Promise<Date> {
    // Mock optimal timing - in production would use analytics
    const now = new Date();
    const optimalHour =
      platform === "linkedin" ? 9 : platform === "instagram" ? 19 : 14;
    now.setHours(optimalHour, 0, 0, 0);
    if (now <= new Date()) {
      now.setDate(now.getDate() + 1);
    }
    return now;
  }

  private calculateConsistencyScore(adaptations: PlatformAdaptation[]): number {
    // Mock consistency scoring
    return Math.random() * 0.2 + 0.8; // 0.8-1.0
  }

  private calculateBrandAlignmentScore(
    adaptations: PlatformAdaptation[],
    brandGuidelines: any
  ): number {
    // Mock brand alignment scoring
    return Math.random() * 0.15 + 0.85; // 0.85-1.0
  }

  private async getBrandGuidelines(): Promise<any> {
    return {
      voice: "professional",
      tone: "friendly",
      keywords: ["innovation", "growth", "success"],
      avoid: ["jargon", "overly technical"],
    };
  }

  private async getPlatformConfiguration(platform: string): Promise<any> {
    const configs: Record<string, any> = {
      twitter: {
        maxCharacters: 280,
        features: ["hashtags", "mentions", "threads"],
      },
      linkedin: {
        maxCharacters: 3000,
        features: ["hashtags", "mentions", "articles"],
      },
      instagram: {
        maxCharacters: 2200,
        features: ["hashtags", "mentions", "stories"],
      },
      facebook: {
        maxCharacters: 63206,
        features: ["hashtags", "mentions", "events"],
      },
    };
    return configs[platform] || { maxCharacters: 1000, features: ["basic"] };
  }

  private async checkTriggers(
    triggers: AutomationTrigger[],
    context?: any
  ): Promise<boolean> {
    // Mock trigger checking - in production would check actual conditions
    return Math.random() > 0.3; // 70% chance triggers are active
  }

  private async checkConditions(
    conditions: AutomationCondition[],
    context?: any
  ): Promise<boolean> {
    // Mock condition checking
    return Math.random() > 0.2; // 80% chance conditions are met
  }

  private async executeAction(
    action: AutomationAction,
    context?: any
  ): Promise<any> {
    // Mock action execution
    return {
      action: action.type,
      result: "success",
      timestamp: new Date(),
      details: `Executed ${action.type} successfully`,
    };
  }

  private async updateRuleMetrics(
    ruleId: string,
    results: any[],
    failed: boolean = false
  ): Promise<void> {
    const rule = this.activeRules.get(ruleId);
    if (!rule) return;

    rule.performance_metrics.executions++;
    if (failed) {
      rule.performance_metrics.success_rate =
        (rule.performance_metrics.success_rate *
          (rule.performance_metrics.executions - 1)) /
        rule.performance_metrics.executions;
    }
    if (results.length > 0) {
      rule.performance_metrics.content_generated += results.length;
    }
  }

  private logExecution(ruleId: string, execution: any): void {
    if (!this.executionHistory.has(ruleId)) {
      this.executionHistory.set(ruleId, []);
    }
    const history = this.executionHistory.get(ruleId)!;
    history.push(execution);

    // Keep only last 100 executions
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
  }
}

// Export singleton instance
let automationEngine: ContentAutomationEngine | null = null;

export function getContentAutomationEngine(): ContentAutomationEngine {
  if (!automationEngine) {
    automationEngine = new ContentAutomationEngine();
  }
  return automationEngine;
}

export default ContentAutomationEngine;
