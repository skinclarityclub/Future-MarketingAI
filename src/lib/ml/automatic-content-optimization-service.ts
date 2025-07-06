/**
 * Automatic Content Optimization Service
 * Central service that integrates all existing optimization systems
 * to provide automated content suggestions and optimization workflows
 */

import { ContentPerformanceMLEngine } from "./content-performance-ml-engine";
import { ContentOptimizationPipeline } from "@/lib/publishing/content-optimization";
import { OptimizationEngine } from "@/lib/analytics/optimization-engine";
import { ContentOptimizer } from "@/lib/social-platforms/content-optimizer";
import { ContentRecommendationsEngine } from "./content-recommendations-engine";
import { createClient } from "@/lib/supabase/client";

export interface AutomaticOptimizationConfig {
  enabled: boolean;
  auto_apply: boolean;
  confidence_threshold: number;
  platforms: string[];
  optimization_types: OptimizationType[];
  monitoring_interval: number; // minutes
  max_suggestions_per_day: number;
}

export interface OptimizationType {
  type:
    | "hashtags"
    | "timing"
    | "content"
    | "format"
    | "platform"
    | "engagement";
  priority: "high" | "medium" | "low";
  auto_apply: boolean;
}

export interface ContentToOptimize {
  id: string;
  content: string;
  platform: string;
  hashtags: string[];
  media_urls?: string[];
  scheduled_time?: Date;
  target_audience?: string;
  campaign_id?: string;
  performance_data?: {
    views: number;
    engagement: number;
    conversions: number;
    roi: number;
  };
}

export interface OptimizationSuggestion {
  id: string;
  content_id: string;
  type: OptimizationType["type"];
  priority: "critical" | "high" | "medium" | "low";
  suggestion: string;
  reasoning: string;
  confidence_score: number;
  estimated_impact: {
    engagement_increase: number;
    reach_increase: number;
    conversion_increase: number;
    roi_improvement: number;
  };
  implementation: {
    effort_required: "low" | "medium" | "high";
    time_estimate: number;
    auto_applicable: boolean;
    preview?: any;
  };
  validation: {
    success_probability: number;
    risk_factors: string[];
    rollback_plan?: string;
  };
  created_at: Date;
  expires_at: Date;
  applied_at?: Date;
  results?: {
    actual_impact: {
      engagement_change: number;
      reach_change: number;
      conversion_change: number;
      roi_change: number;
    };
    validation_score: number;
  };
}

export interface OptimizationReport {
  content_id: string;
  total_suggestions: number;
  applied_suggestions: number;
  pending_suggestions: number;
  performance_improvement: {
    engagement: number;
    reach: number;
    conversions: number;
    roi: number;
  };
  top_optimization_types: Array<{
    type: OptimizationType["type"];
    success_rate: number;
    average_impact: number;
  }>;
  recommendations: OptimizationSuggestion[];
  generated_at: Date;
}

export class AutomaticContentOptimizationService {
  private mlEngine: ContentPerformanceMLEngine;
  private contentPipeline: ContentOptimizationPipeline;
  private optimizationEngine: OptimizationEngine;
  private contentOptimizer: ContentOptimizer;
  private recommendationsEngine: ContentRecommendationsEngine;
  private supabase = createClient();

  constructor(config?: Partial<AutomaticOptimizationConfig>) {
    this.mlEngine = new ContentPerformanceMLEngine();
    this.contentPipeline = new ContentOptimizationPipeline();
    this.optimizationEngine = new OptimizationEngine();
    this.contentOptimizer = new ContentOptimizer();
    this.recommendationsEngine = new ContentRecommendationsEngine();
  }

  /**
   * Generate comprehensive automatic optimization suggestions for content
   */
  async generateOptimizationSuggestions(
    content: ContentToOptimize,
    includeAutoApply = false
  ): Promise<OptimizationSuggestion[]> {
    const suggestions: OptimizationSuggestion[] = [];

    try {
      // 1. ML-based content analysis and recommendations
      const mlAnalysis = await this.mlEngine.analyzeContentElements({
        text: content.content,
        hashtags: content.hashtags,
        platform: content.platform,
        timestamp: new Date().toISOString(),
      });

      // Generate hashtag optimization suggestions
      if (
        mlAnalysis.hashtag_analysis &&
        mlAnalysis.hashtag_analysis.length > 0
      ) {
        const hashtagSuggestions = await this.generateHashtagOptimizations(
          content,
          mlAnalysis.hashtag_analysis
        );
        suggestions.push(...hashtagSuggestions);
      }

      // 2. Content format and structure optimization
      if (mlAnalysis.optimization_recommendations) {
        const contentOptimizations = await this.generateContentOptimizations(
          content,
          mlAnalysis.optimization_recommendations
        );
        suggestions.push(...contentOptimizations);
      }

      // 3. Platform-specific optimizations
      const platformOptimizations =
        await this.generatePlatformOptimizations(content);
      suggestions.push(...platformOptimizations);

      // 4. Timing optimizations
      const timingOptimizations =
        await this.generateTimingOptimizations(content);
      suggestions.push(...timingOptimizations);

      // 5. Engagement optimization suggestions
      const engagementOptimizations =
        await this.generateEngagementOptimizations(content, mlAnalysis);
      suggestions.push(...engagementOptimizations);

      // 6. Performance-based optimizations (if performance data available)
      if (content.performance_data) {
        const performanceOptimizations =
          await this.generatePerformanceBasedOptimizations(content);
        suggestions.push(...performanceOptimizations);
      }

      // Sort by priority and confidence
      suggestions.sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return b.confidence_score - a.confidence_score;
      });

      // Auto-apply high-confidence suggestions if enabled
      if (includeAutoApply) {
        await this.autoApplyOptimizations(content, suggestions);
      }

      // Store suggestions in database
      await this.storeSuggestions(suggestions);

      return suggestions;
    } catch (error) {
      console.error("Error generating optimization suggestions:", error);
      throw new Error("Failed to generate optimization suggestions");
    }
  }

  /**
   * Generate hashtag optimization suggestions using ML analysis
   */
  private async generateHashtagOptimizations(
    content: ContentToOptimize,
    hashtagAnalysis: any[]
  ): Promise<OptimizationSuggestion[]> {
    const suggestions: OptimizationSuggestion[] = [];

    // Find underperforming hashtags
    const poorHashtags = hashtagAnalysis.filter(
      h => h.effectiveness_score < 0.5
    );
    if (poorHashtags.length > 0) {
      suggestions.push({
        id: `hashtag_replace_${content.id}`,
        content_id: content.id,
        type: "hashtags",
        priority: "high",
        suggestion: `Replace underperforming hashtags: ${poorHashtags.map(h => h.hashtag).join(", ")}`,
        reasoning: `These hashtags have low effectiveness scores (${poorHashtags.map(h => `${h.hashtag}: ${(h.effectiveness_score * 100).toFixed(1)}%`).join(", ")})`,
        confidence_score: 0.85,
        estimated_impact: {
          engagement_increase: 25,
          reach_increase: 35,
          conversion_increase: 15,
          roi_improvement: 20,
        },
        implementation: {
          effort_required: "low",
          time_estimate: 5,
          auto_applicable: true,
          preview: this.generateHashtagReplacements(poorHashtags),
        },
        validation: {
          success_probability: 0.8,
          risk_factors: ["Might reduce brand consistency"],
          rollback_plan: "Revert to original hashtags if performance drops",
        },
        created_at: new Date(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });
    }

    // Suggest trending hashtags
    const trendingHashtags = hashtagAnalysis.filter(
      h => h.trending_status === "trending"
    );
    if (trendingHashtags.length > 0) {
      suggestions.push({
        id: `hashtag_trending_${content.id}`,
        content_id: content.id,
        type: "hashtags",
        priority: "medium",
        suggestion: `Add trending hashtags: ${trendingHashtags
          .slice(0, 3)
          .map(h => h.hashtag)
          .join(", ")}`,
        reasoning: `These hashtags are currently trending with high engagement potential`,
        confidence_score: 0.75,
        estimated_impact: {
          engagement_increase: 30,
          reach_increase: 45,
          conversion_increase: 20,
          roi_improvement: 25,
        },
        implementation: {
          effort_required: "low",
          time_estimate: 3,
          auto_applicable: true,
        },
        validation: {
          success_probability: 0.7,
          risk_factors: ["Trending hashtags may become saturated quickly"],
        },
        created_at: new Date(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });
    }

    return suggestions;
  }

  /**
   * Generate content structure and format optimization suggestions
   */
  private async generateContentOptimizations(
    content: ContentToOptimize,
    recommendations: string[]
  ): Promise<OptimizationSuggestion[]> {
    const suggestions: OptimizationSuggestion[] = [];

    for (const recommendation of recommendations) {
      if (recommendation.includes("positive language")) {
        suggestions.push({
          id: `content_sentiment_${content.id}`,
          content_id: content.id,
          type: "content",
          priority: "medium",
          suggestion: "Improve content sentiment and tone",
          reasoning: recommendation,
          confidence_score: 0.7,
          estimated_impact: {
            engagement_increase: 15,
            reach_increase: 10,
            conversion_increase: 12,
            roi_improvement: 15,
          },
          implementation: {
            effort_required: "medium",
            time_estimate: 15,
            auto_applicable: false,
          },
          validation: {
            success_probability: 0.65,
            risk_factors: ["May affect brand voice"],
          },
          created_at: new Date(),
          expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        });
      }

      if (recommendation.includes("emojis")) {
        suggestions.push({
          id: `content_emojis_${content.id}`,
          content_id: content.id,
          type: "format",
          priority: "low",
          suggestion: "Add relevant emojis to increase visual appeal",
          reasoning: recommendation,
          confidence_score: 0.6,
          estimated_impact: {
            engagement_increase: 12,
            reach_increase: 8,
            conversion_increase: 5,
            roi_improvement: 8,
          },
          implementation: {
            effort_required: "low",
            time_estimate: 5,
            auto_applicable: true,
            preview: this.suggestEmojis(content.content),
          },
          validation: {
            success_probability: 0.75,
            risk_factors: ["May not fit all brand personalities"],
          },
          created_at: new Date(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
      }
    }

    return suggestions;
  }

  /**
   * Generate platform-specific optimization suggestions
   */
  private async generatePlatformOptimizations(
    content: ContentToOptimize
  ): Promise<OptimizationSuggestion[]> {
    const suggestions: OptimizationSuggestion[] = [];

    try {
      const aiSuggestions = this.contentOptimizer.generateAISuggestions(
        {
          text: content.content,
          hashtags: content.hashtags,
          media: content.media_urls || [],
        },
        content.platform as any
      );

      for (const aiSuggestion of aiSuggestions) {
        suggestions.push({
          id: `platform_${content.platform}_${content.id}`,
          content_id: content.id,
          type: "platform",
          priority:
            aiSuggestion.impact === "high"
              ? "high"
              : aiSuggestion.impact === "medium"
                ? "medium"
                : "low",
          suggestion: aiSuggestion.suggestion,
          reasoning: aiSuggestion.reasoning,
          confidence_score: aiSuggestion.confidence,
          estimated_impact: this.mapImpactToNumbers(aiSuggestion.impact),
          implementation: {
            effort_required: "medium",
            time_estimate: 10,
            auto_applicable: false,
          },
          validation: {
            success_probability: aiSuggestion.confidence,
            risk_factors: ["Platform algorithm changes may affect results"],
          },
          created_at: new Date(),
          expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        });
      }
    } catch (error) {
      console.error("Error generating platform optimizations:", error);
    }

    return suggestions;
  }

  /**
   * Generate optimal timing suggestions
   */
  private async generateTimingOptimizations(
    content: ContentToOptimize
  ): Promise<OptimizationSuggestion[]> {
    const suggestions: OptimizationSuggestion[] = [];

    try {
      // Get optimal posting time from ML engine
      const optimalTime = await this.mlEngine.predictOptimalPostingTime(
        content.platform,
        content.target_audience || "general"
      );

      if (content.scheduled_time && optimalTime) {
        const currentTime = content.scheduled_time;
        const optimalDate = new Date(optimalTime.optimal_time);

        // If scheduled time is not optimal
        const timeDiff = Math.abs(
          currentTime.getHours() - optimalDate.getHours()
        );
        if (timeDiff > 2) {
          // More than 2 hours difference
          suggestions.push({
            id: `timing_optimal_${content.id}`,
            content_id: content.id,
            type: "timing",
            priority: "medium",
            suggestion: `Schedule for optimal time: ${optimalDate.toLocaleTimeString()}`,
            reasoning: `Current scheduling time has ${optimalTime.confidence * 100}% lower engagement potential`,
            confidence_score: optimalTime.confidence,
            estimated_impact: {
              engagement_increase: optimalTime.engagement_boost_percentage,
              reach_increase: optimalTime.reach_boost_percentage,
              conversion_increase:
                optimalTime.engagement_boost_percentage * 0.6,
              roi_improvement: optimalTime.engagement_boost_percentage * 0.8,
            },
            implementation: {
              effort_required: "low",
              time_estimate: 2,
              auto_applicable: true,
              preview: {
                current_time: currentTime.toLocaleString(),
                optimal_time: optimalDate.toLocaleString(),
                improvement: `${optimalTime.engagement_boost_percentage}% more engagement`,
              },
            },
            validation: {
              success_probability: optimalTime.confidence,
              risk_factors: ["Time zone differences may affect results"],
            },
            created_at: new Date(),
            expires_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          });
        }
      }
    } catch (error) {
      console.error("Error generating timing optimizations:", error);
    }

    return suggestions;
  }

  /**
   * Generate engagement optimization suggestions
   */
  private async generateEngagementOptimizations(
    content: ContentToOptimize,
    mlAnalysis: any
  ): Promise<OptimizationSuggestion[]> {
    const suggestions: OptimizationSuggestion[] = [];

    // Analyze content elements for engagement opportunities
    if (mlAnalysis.content_elements) {
      const hasCallToAction = mlAnalysis.content_elements.some(
        (el: any) =>
          el.content.toLowerCase().includes("comment") ||
          el.content.toLowerCase().includes("share") ||
          el.content.toLowerCase().includes("like")
      );

      if (!hasCallToAction) {
        suggestions.push({
          id: `engagement_cta_${content.id}`,
          content_id: content.id,
          type: "engagement",
          priority: "high",
          suggestion: "Add a clear call-to-action to encourage engagement",
          reasoning:
            "Posts with CTAs get 285% more engagement than those without",
          confidence_score: 0.9,
          estimated_impact: {
            engagement_increase: 285,
            reach_increase: 150,
            conversion_increase: 200,
            roi_improvement: 180,
          },
          implementation: {
            effort_required: "low",
            time_estimate: 5,
            auto_applicable: true,
            preview: this.suggestCTA(content.content, content.platform),
          },
          validation: {
            success_probability: 0.85,
            risk_factors: ["May seem too promotional if overdone"],
          },
          created_at: new Date(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
      }
    }

    return suggestions;
  }

  /**
   * Generate performance-based optimization suggestions
   */
  private async generatePerformanceBasedOptimizations(
    content: ContentToOptimize
  ): Promise<OptimizationSuggestion[]> {
    const suggestions: OptimizationSuggestion[] = [];

    if (!content.performance_data) return suggestions;

    const { views, engagement, conversions, roi } = content.performance_data;

    // Low engagement rate optimization
    const engagementRate = engagement / views;
    if (engagementRate < 0.02) {
      // Less than 2%
      suggestions.push({
        id: `performance_engagement_${content.id}`,
        content_id: content.id,
        type: "engagement",
        priority: "critical",
        suggestion:
          "Urgent: Engagement rate is critically low - content needs immediate optimization",
        reasoning: `Current engagement rate: ${(engagementRate * 100).toFixed(2)}% (industry average: 3-5%)`,
        confidence_score: 0.95,
        estimated_impact: {
          engagement_increase: 150,
          reach_increase: 100,
          conversion_increase: 120,
          roi_improvement: 130,
        },
        implementation: {
          effort_required: "high",
          time_estimate: 30,
          auto_applicable: false,
        },
        validation: {
          success_probability: 0.8,
          risk_factors: ["Requires significant content restructuring"],
          rollback_plan:
            "Monitor for 48 hours, revert if performance doesn't improve",
        },
        created_at: new Date(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours urgent
      });
    }

    // Low conversion rate optimization
    const conversionRate = conversions / views;
    if (conversionRate < 0.005) {
      // Less than 0.5%
      suggestions.push({
        id: `performance_conversion_${content.id}`,
        content_id: content.id,
        type: "content",
        priority: "high",
        suggestion:
          "Improve conversion elements: stronger CTA, value proposition, urgency",
        reasoning: `Current conversion rate: ${(conversionRate * 100).toFixed(3)}% needs improvement`,
        confidence_score: 0.8,
        estimated_impact: {
          engagement_increase: 20,
          reach_increase: 15,
          conversion_increase: 200,
          roi_improvement: 180,
        },
        implementation: {
          effort_required: "medium",
          time_estimate: 20,
          auto_applicable: false,
        },
        validation: {
          success_probability: 0.75,
          risk_factors: ["Changes may affect brand messaging"],
        },
        created_at: new Date(),
        expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      });
    }

    return suggestions;
  }

  /**
   * Automatically apply high-confidence, low-risk optimizations
   */
  private async autoApplyOptimizations(
    content: ContentToOptimize,
    suggestions: OptimizationSuggestion[]
  ): Promise<void> {
    const autoApplicable = suggestions.filter(
      s =>
        s.implementation.auto_applicable &&
        s.confidence_score > 0.8 &&
        s.validation.success_probability > 0.7
    );

    for (const suggestion of autoApplicable) {
      try {
        await this.applySuggestion(content, suggestion);
        suggestion.applied_at = new Date();
      } catch (error) {
        console.error(
          `Failed to auto-apply suggestion ${suggestion.id}:`,
          error
        );
      }
    }
  }

  /**
   * Apply a specific optimization suggestion
   */
  async applySuggestion(
    content: ContentToOptimize,
    suggestion: OptimizationSuggestion
  ): Promise<void> {
    // Implementation depends on suggestion type
    switch (suggestion.type) {
      case "hashtags":
        if (suggestion.implementation.preview) {
          // Apply hashtag changes
          console.log(`Applying hashtag optimization for ${content.id}`);
        }
        break;
      case "timing":
        if (suggestion.implementation.preview?.optimal_time) {
          // Update scheduled time
          console.log(`Updating timing for ${content.id}`);
        }
        break;
      case "format":
        if (suggestion.implementation.preview) {
          // Apply format changes
          console.log(`Applying format optimization for ${content.id}`);
        }
        break;
    }
  }

  /**
   * Generate comprehensive optimization report
   */
  async generateOptimizationReport(
    contentId: string
  ): Promise<OptimizationReport> {
    const suggestions = await this.getSuggestionsForContent(contentId);
    const appliedSuggestions = suggestions.filter(s => s.applied_at);

    return {
      content_id: contentId,
      total_suggestions: suggestions.length,
      applied_suggestions: appliedSuggestions.length,
      pending_suggestions: suggestions.length - appliedSuggestions.length,
      performance_improvement:
        this.calculatePerformanceImprovement(appliedSuggestions),
      top_optimization_types: this.getTopOptimizationTypes(suggestions),
      recommendations: suggestions.slice(0, 10), // Top 10
      generated_at: new Date(),
    };
  }

  // Helper methods
  private generateHashtagReplacements(poorHashtags: any[]): any {
    return {
      remove: poorHashtags.map(h => h.hashtag),
      suggested_replacements: poorHashtags.flatMap(
        h => h.related_hashtags || []
      ),
    };
  }

  private suggestEmojis(content: string): any {
    // Simple emoji suggestion based on content keywords
    const emojiMap: Record<string, string[]> = {
      great: ["🎉", "👍", "✨"],
      amazing: ["🤩", "🔥", "⭐"],
      love: ["❤️", "😍", "💖"],
      success: ["🎯", "📈", "🏆"],
    };

    const suggestions: string[] = [];
    Object.keys(emojiMap).forEach(keyword => {
      if (content.toLowerCase().includes(keyword)) {
        suggestions.push(...emojiMap[keyword]);
      }
    });

    return {
      suggested_emojis: [...new Set(suggestions)].slice(0, 3),
      positions: ["end"], // Where to place emojis
    };
  }

  private suggestCTA(content: string, platform: string): any {
    const platformCTAs: Record<string, string[]> = {
      instagram: [
        "Double tap if you agree! 💖",
        "Share your thoughts below! 👇",
        "Tag someone who needs this! 🏷️",
      ],
      linkedin: [
        "What are your thoughts on this?",
        "Share your experience in the comments",
        "Connect with me to discuss further",
      ],
      twitter: [
        "Retweet if you agree!",
        "What do you think? Reply below!",
        "Share your take 👇",
      ],
    };

    return {
      suggested_ctas: platformCTAs[platform] || platformCTAs.instagram,
      placement: "end",
    };
  }

  private mapImpactToNumbers(impact: string): {
    engagement_increase: number;
    reach_increase: number;
    conversion_increase: number;
    roi_improvement: number;
  } {
    const impactMap = {
      high: {
        engagement_increase: 40,
        reach_increase: 35,
        conversion_increase: 30,
        roi_improvement: 35,
      },
      medium: {
        engagement_increase: 25,
        reach_increase: 20,
        conversion_increase: 18,
        roi_improvement: 22,
      },
      low: {
        engagement_increase: 10,
        reach_increase: 8,
        conversion_increase: 6,
        roi_improvement: 9,
      },
    };
    return impactMap[impact as keyof typeof impactMap] || impactMap.medium;
  }

  private async storeSuggestions(
    suggestions: OptimizationSuggestion[]
  ): Promise<void> {
    try {
      // Store in Supabase
      for (const suggestion of suggestions) {
        await this.supabase.from("content_optimization_suggestions").insert({
          id: suggestion.id,
          content_id: suggestion.content_id,
          type: suggestion.type,
          priority: suggestion.priority,
          suggestion: suggestion.suggestion,
          reasoning: suggestion.reasoning,
          confidence_score: suggestion.confidence_score,
          estimated_impact: suggestion.estimated_impact,
          implementation: suggestion.implementation,
          validation: suggestion.validation,
          created_at: suggestion.created_at,
          expires_at: suggestion.expires_at,
        });
      }
    } catch (error) {
      console.error("Error storing suggestions:", error);
    }
  }

  private async getSuggestionsForContent(
    contentId: string
  ): Promise<OptimizationSuggestion[]> {
    try {
      const { data, error } = await this.supabase
        .from("content_optimization_suggestions")
        .select("*")
        .eq("content_id", contentId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      return [];
    }
  }

  private calculatePerformanceImprovement(
    appliedSuggestions: OptimizationSuggestion[]
  ): any {
    if (appliedSuggestions.length === 0) {
      return { engagement: 0, reach: 0, conversions: 0, roi: 0 };
    }

    const totalImprovements = appliedSuggestions.reduce(
      (acc, suggestion) => {
        if (suggestion.results?.actual_impact) {
          acc.engagement += suggestion.results.actual_impact.engagement_change;
          acc.reach += suggestion.results.actual_impact.reach_change;
          acc.conversions += suggestion.results.actual_impact.conversion_change;
          acc.roi += suggestion.results.actual_impact.roi_change;
        }
        return acc;
      },
      { engagement: 0, reach: 0, conversions: 0, roi: 0 }
    );

    return {
      engagement: totalImprovements.engagement / appliedSuggestions.length,
      reach: totalImprovements.reach / appliedSuggestions.length,
      conversions: totalImprovements.conversions / appliedSuggestions.length,
      roi: totalImprovements.roi / appliedSuggestions.length,
    };
  }

  private getTopOptimizationTypes(
    suggestions: OptimizationSuggestion[]
  ): any[] {
    const typeStats: Record<
      string,
      { count: number; totalImpact: number; successCount: number }
    > = {};

    suggestions.forEach(suggestion => {
      if (!typeStats[suggestion.type]) {
        typeStats[suggestion.type] = {
          count: 0,
          totalImpact: 0,
          successCount: 0,
        };
      }
      typeStats[suggestion.type].count++;
      typeStats[suggestion.type].totalImpact +=
        suggestion.estimated_impact.roi_improvement;

      if (
        suggestion.results?.validation_score &&
        suggestion.results.validation_score > 0.7
      ) {
        typeStats[suggestion.type].successCount++;
      }
    });

    return Object.entries(typeStats)
      .map(([type, stats]) => ({
        type,
        success_rate: stats.successCount / stats.count,
        average_impact: stats.totalImpact / stats.count,
      }))
      .sort((a, b) => b.success_rate - a.success_rate)
      .slice(0, 5);
  }
}
