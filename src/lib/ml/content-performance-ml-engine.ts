/**
 * Content Performance Machine Learning Engine
 * Specialized ML models for content pattern recognition, audience behavior analysis,
 * and performance predictions for content optimization
 */

import { createClient } from "@/lib/supabase/client";

export interface ContentElement {
  id: string;
  type: "text" | "image" | "video" | "hashtag" | "emoji" | "link";
  content: string;
  position: number;
  performance_impact: number;
  sentiment_score?: number;
  engagement_weight: number;
}

export interface ContentPattern {
  id: string;
  pattern_type:
    | "visual"
    | "textual"
    | "temporal"
    | "engagement"
    | "audience"
    | "hashtag_effectiveness";
  elements: ContentElement[];
  success_score: number;
  frequency: number;
  platforms: string[];
  audience_segments: string[];
  performance_metrics: {
    avg_engagement_rate: number;
    avg_conversion_rate: number;
    avg_roi: number;
    reach_amplification: number;
  };
}

export interface HashtagAnalysis {
  hashtag: string;
  effectiveness_score: number;
  reach_potential: number;
  engagement_boost: number;
  trending_status: "trending" | "stable" | "declining";
  competition_level: "low" | "medium" | "high";
  optimal_platforms: string[];
  audience_resonance: number;
  best_times_to_use: string[];
  related_hashtags: string[];
  performance_history: {
    date: string;
    engagement_rate: number;
    reach: number;
  }[];
}

export interface MLPrediction {
  predicted_engagement_rate: number;
  predicted_reach: number;
  predicted_impressions: number;
  predicted_shares: number;
  predicted_saves: number;
  viral_potential: number;
  optimal_posting_times: string[];
  recommended_hashtags: string[];
  audience_match_score: number;
  confidence_score: number;
  risk_factors: string[];
  optimization_suggestions: string[];
}

export class ContentPerformanceMLEngine {
  private patternDatabase: Map<string, ContentPattern> = new Map();
  private hashtagDatabase: Map<string, HashtagAnalysis> = new Map();
  private supabase = createClient();

  constructor() {
    this.initializeBaseModels();
    this.loadHashtagDatabase();
  }

  private initializeBaseModels(): void {
    // Initialize with base patterns for immediate functionality
    this.initializeBasePatterns();
  }

  private async loadHashtagDatabase(): Promise<void> {
    // Load hashtag performance data from database
    try {
      const { data: hashtagData } = await this.supabase
        .from("content_performance")
        .select("hashtags, engagement_rate, reach, platform, published_at")
        .not("hashtags", "is", null);

      if (hashtagData) {
        this.processHashtagPerformanceData(hashtagData);
      }
    } catch (error) {
      console.error("Error loading hashtag database:", error);
    }
  }

  private processHashtagPerformanceData(data: any[]): void {
    const hashtagStats = new Map<
      string,
      {
        total_engagement: number;
        total_reach: number;
        usage_count: number;
        platforms: Set<string>;
        recent_performance: Array<{
          date: string;
          engagement_rate: number;
          reach: number;
        }>;
      }
    >();

    data.forEach(item => {
      if (Array.isArray(item.hashtags)) {
        item.hashtags.forEach((hashtag: string) => {
          if (!hashtagStats.has(hashtag)) {
            hashtagStats.set(hashtag, {
              total_engagement: 0,
              total_reach: 0,
              usage_count: 0,
              platforms: new Set(),
              recent_performance: [],
            });
          }

          const stats = hashtagStats.get(hashtag)!;
          stats.total_engagement += item.engagement_rate || 0;
          stats.total_reach += item.reach || 0;
          stats.usage_count += 1;
          stats.platforms.add(item.platform);
          stats.recent_performance.push({
            date: item.published_at,
            engagement_rate: item.engagement_rate || 0,
            reach: item.reach || 0,
          });
        });
      }
    });

    // Convert to HashtagAnalysis format
    hashtagStats.forEach((stats, hashtag) => {
      const analysis: HashtagAnalysis = {
        hashtag,
        effectiveness_score: this.calculateHashtagEffectiveness(stats),
        reach_potential: stats.total_reach / stats.usage_count,
        engagement_boost: stats.total_engagement / stats.usage_count,
        trending_status: this.determineTrendingStatus(stats.recent_performance),
        competition_level: this.determineCompetitionLevel(stats.usage_count),
        optimal_platforms: Array.from(stats.platforms),
        audience_resonance: Math.min(
          (stats.total_engagement / stats.usage_count) * 10,
          1.0
        ),
        best_times_to_use: this.calculateOptimalHashtagTimes(
          stats.recent_performance
        ),
        related_hashtags: this.findRelatedHashtags(hashtag, hashtagStats),
        performance_history: stats.recent_performance.slice(-10), // Last 10 entries
      };

      this.hashtagDatabase.set(hashtag, analysis);
    });
  }

  async analyzeContentElements(content: {
    text: string;
    hashtags: string[];
    platform: string;
    timestamp: string;
  }) {
    try {
      // Extract content elements
      const elements = this.extractContentElements(content);

      // Analyze hashtags effectiveness
      const hashtagAnalysis = await this.analyzeHashtagEffectiveness(
        content.hashtags,
        content.platform
      );

      // Identify patterns
      const patterns = this.identifyContentPatterns(elements, content.platform);

      // Generate comprehensive performance prediction
      const prediction = await this.predictContentPerformance(
        elements,
        patterns,
        content.platform,
        hashtagAnalysis
      );

      return {
        extracted_elements: elements,
        hashtag_analysis: hashtagAnalysis,
        identified_patterns: patterns,
        performance_prediction: prediction,
        optimization_recommendations: this.generateOptimizationRecommendations(
          elements,
          hashtagAnalysis,
          patterns,
          content.platform
        ),
      };
    } catch (error) {
      console.error("Error analyzing content:", error);
      return {
        extracted_elements: [],
        hashtag_analysis: [],
        identified_patterns: [],
        performance_prediction: {},
        optimization_recommendations: [],
      };
    }
  }

  async analyzeHashtagEffectiveness(
    hashtags: string[],
    platform: string
  ): Promise<HashtagAnalysis[]> {
    const analyses: HashtagAnalysis[] = [];

    for (const hashtag of hashtags) {
      let analysis = this.hashtagDatabase.get(hashtag);

      if (!analysis) {
        // Generate analysis for new hashtags
        analysis = await this.generateHashtagAnalysis(hashtag, platform);
        this.hashtagDatabase.set(hashtag, analysis);
      }

      analyses.push(analysis);
    }

    return analyses;
  }

  private async generateHashtagAnalysis(
    hashtag: string,
    platform: string
  ): Promise<HashtagAnalysis> {
    // Enhanced hashtag analysis for new hashtags
    const baseEffectiveness = this.calculateBaseHashtagEffectiveness(hashtag);
    const platformOptimization = this.getPlatformOptimization(platform);

    return {
      hashtag,
      effectiveness_score: baseEffectiveness * platformOptimization,
      reach_potential: Math.floor(Math.random() * 10000) + 1000, // Mock for now
      engagement_boost: 0.1 + Math.random() * 0.3, // 10-40% engagement boost
      trending_status:
        Math.random() > 0.7
          ? "trending"
          : Math.random() > 0.3
            ? "stable"
            : "declining",
      competition_level:
        hashtag.length < 10 ? "high" : hashtag.length < 20 ? "medium" : "low",
      optimal_platforms: this.determineOptimalPlatforms(hashtag),
      audience_resonance: Math.random() * 0.8 + 0.2, // 20-100% resonance
      best_times_to_use: this.generateOptimalTimes(),
      related_hashtags: this.generateRelatedHashtags(hashtag),
      performance_history: [],
    };
  }

  async predictOptimalPostingTimes(
    contentType: string,
    platform: string,
    audienceSegment: string,
    hashtags: string[] = []
  ) {
    // Enhanced posting time predictions considering hashtag trending patterns
    const baseHours = platform === "linkedin" ? [8, 12, 17] : [9, 15, 21];
    const hashtagBoosts = await this.calculateHashtagTimeBoosts(
      hashtags,
      platform
    );

    return baseHours.map((hour, index) => ({
      timestamp: this.generateFutureTimestamp(hour, index + 1),
      expected_engagement_boost:
        (1.2 - index * 0.1) * (1 + hashtagBoosts[index] || 0),
      audience_active_percentage: 0.7 - index * 0.1,
      competition_level: index === 0 ? "low" : index === 1 ? "medium" : "high",
      confidence_score: 0.8 - index * 0.05,
      hashtag_trending_boost: hashtagBoosts[index] || 0,
    }));
  }

  async generateHashtagRecommendations(
    content: string,
    platform: string,
    targetAudience?: string,
    existingHashtags: string[] = []
  ): Promise<string[]> {
    // AI-powered hashtag recommendations based on content analysis
    const contentKeywords = this.extractKeywords(content);
    const platformOptimal = this.getPlatformOptimalHashtags(platform);
    const trendingHashtags = this.getTrendingHashtags(platform);

    // Combine and score hashtags
    const candidates = new Map<string, number>();

    // Add content-based hashtags
    contentKeywords.forEach(keyword => {
      const hashtag = `#${keyword.toLowerCase().replace(/\s+/g, "")}`;
      candidates.set(hashtag, 0.8);
    });

    // Add platform optimal hashtags
    platformOptimal.forEach(hashtag => {
      const currentScore = candidates.get(hashtag) || 0;
      candidates.set(hashtag, currentScore + 0.6);
    });

    // Add trending hashtags
    trendingHashtags.forEach(hashtag => {
      const currentScore = candidates.get(hashtag) || 0;
      candidates.set(hashtag, currentScore + 0.4);
    });

    // Filter out existing hashtags and sort by score
    const recommendations = Array.from(candidates.entries())
      .filter(([hashtag]) => !existingHashtags.includes(hashtag))
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([hashtag]) => hashtag);

    return recommendations;
  }

  private extractContentElements(content: any): ContentElement[] {
    const elements: ContentElement[] = [];
    let position = 0;

    // Extract text elements with enhanced analysis
    if (content.text) {
      const sentences = content.text
        .split(/[.!?]+/)
        .filter((s: string) => s.trim());
      sentences.forEach((sentence: string) => {
        elements.push({
          id: `text_${position}`,
          type: "text",
          content: sentence.trim(),
          position: position++,
          performance_impact: this.calculateTextImpact(sentence),
          sentiment_score: this.analyzeSentiment(sentence),
          engagement_weight: this.calculateEngagementWeight(sentence),
        });
      });
    }

    // Extract hashtags with enhanced analysis
    content.hashtags?.forEach((hashtag: string) => {
      const hashtagAnalysis = this.hashtagDatabase.get(hashtag);
      elements.push({
        id: `hashtag_${position}`,
        type: "hashtag",
        content: hashtag,
        position: position++,
        performance_impact:
          hashtagAnalysis?.effectiveness_score ||
          this.calculateHashtagImpact(hashtag),
        engagement_weight: hashtagAnalysis?.engagement_boost || 1.2,
      });
    });

    // Extract other elements (emojis, links, etc.)
    this.extractEmojis(content.text, elements, position);
    this.extractLinks(content.text, elements, position);

    return elements;
  }

  private identifyContentPatterns(
    elements: ContentElement[],
    platform: string
  ): ContentPattern[] {
    const patterns: ContentPattern[] = [];

    // Pattern 1: High-performing hashtag combinations
    const hashtagElements = elements.filter(el => el.type === "hashtag");
    if (hashtagElements.length >= 2) {
      patterns.push({
        id: `hashtag_combo_${Date.now()}`,
        pattern_type: "hashtag_effectiveness",
        elements: hashtagElements,
        success_score:
          hashtagElements.reduce((sum, el) => sum + el.performance_impact, 0) /
          hashtagElements.length,
        frequency: 1,
        platforms: [platform],
        audience_segments: ["general"],
        performance_metrics: {
          avg_engagement_rate: 0.12,
          avg_conversion_rate: 0.03,
          avg_roi: 2.5,
          reach_amplification: 1.8,
        },
      });
    }

    // Pattern 2: Text sentiment patterns
    const textElements = elements.filter(el => el.type === "text");
    const avgSentiment =
      textElements.reduce((sum, el) => sum + (el.sentiment_score || 0.5), 0) /
      textElements.length;

    if (avgSentiment > 0.7) {
      patterns.push({
        id: `positive_sentiment_${Date.now()}`,
        pattern_type: "textual",
        elements: textElements,
        success_score: avgSentiment,
        frequency: 1,
        platforms: [platform],
        audience_segments: ["engaged"],
        performance_metrics: {
          avg_engagement_rate: 0.15,
          avg_conversion_rate: 0.05,
          avg_roi: 3.2,
          reach_amplification: 1.4,
        },
      });
    }

    return patterns;
  }

  private async predictContentPerformance(
    elements: ContentElement[],
    patterns: ContentPattern[],
    platform: string,
    hashtagAnalysis: HashtagAnalysis[]
  ): Promise<MLPrediction> {
    const baseScore =
      elements.reduce((sum, el) => sum + el.performance_impact, 0) /
        elements.length || 0.5;
    const platformMultiplier = this.getPlatformMultiplier(platform);
    const hashtagBoost =
      hashtagAnalysis.reduce((sum, h) => sum + h.engagement_boost, 0) /
        hashtagAnalysis.length || 0;
    const patternBoost =
      patterns.reduce((sum, p) => sum + p.success_score, 0) / patterns.length ||
      0;

    const finalScore = Math.min(
      (baseScore + hashtagBoost + patternBoost) * platformMultiplier,
      1.0
    );

    return {
      predicted_engagement_rate: finalScore,
      predicted_reach: Math.floor(finalScore * 5000 + Math.random() * 2000),
      predicted_impressions: Math.floor(
        finalScore * 10000 + Math.random() * 5000
      ),
      predicted_shares: Math.floor(finalScore * 50 + Math.random() * 25),
      predicted_saves: Math.floor(finalScore * 30 + Math.random() * 15),
      viral_potential: this.calculateViralPotential(elements, hashtagAnalysis),
      optimal_posting_times: await this.generateOptimalPostingTimes(platform),
      recommended_hashtags: await this.generateHashtagRecommendations(
        "",
        platform,
        undefined,
        hashtagAnalysis.map(h => h.hashtag)
      ),
      audience_match_score: finalScore * 0.9,
      confidence_score: Math.min(
        0.95,
        0.6 + hashtagAnalysis.length * 0.05 + patterns.length * 0.1
      ),
      risk_factors: this.identifyRiskFactors(
        elements,
        hashtagAnalysis,
        platform
      ),
      optimization_suggestions: this.generateOptimizationSuggestions(
        elements,
        hashtagAnalysis,
        patterns
      ),
    };
  }

  // Helper methods for new functionality
  private calculateHashtagEffectiveness(stats: any): number {
    const avgEngagement = stats.total_engagement / stats.usage_count;
    const usageFrequency = Math.min(stats.usage_count / 100, 1); // Normalize usage
    return avgEngagement * 0.7 + usageFrequency * 0.3;
  }

  private determineTrendingStatus(
    performanceHistory: any[]
  ): "trending" | "stable" | "declining" {
    if (performanceHistory.length < 3) return "stable";

    const recent = performanceHistory.slice(-3);
    const trend = recent[2].engagement_rate - recent[0].engagement_rate;

    return trend > 0.05 ? "trending" : trend < -0.05 ? "declining" : "stable";
  }

  private determineCompetitionLevel(
    usageCount: number
  ): "low" | "medium" | "high" {
    return usageCount > 1000 ? "high" : usageCount > 100 ? "medium" : "low";
  }

  private calculateOptimalHashtagTimes(performanceHistory: any[]): string[] {
    // Mock implementation - in real scenario, analyze time patterns
    return ["09:00", "15:00", "21:00"];
  }

  private findRelatedHashtags(
    hashtag: string,
    allStats: Map<string, any>
  ): string[] {
    // Mock implementation - in real scenario, use content similarity
    return Array.from(allStats.keys())
      .filter(
        h =>
          h !== hashtag &&
          h.toLowerCase().includes(hashtag.toLowerCase().slice(1, 4))
      )
      .slice(0, 5);
  }

  private calculateBaseHashtagEffectiveness(hashtag: string): number {
    const length = hashtag.length;
    if (length < 5) return 0.3;
    if (length > 25) return 0.4;
    return 0.7;
  }

  private getPlatformOptimization(platform: string): number {
    const multipliers = {
      instagram: 1.2,
      linkedin: 1.1,
      twitter: 1.0,
      facebook: 0.9,
      tiktok: 1.3,
    };
    return multipliers[platform as keyof typeof multipliers] || 1.0;
  }

  private determineOptimalPlatforms(hashtag: string): string[] {
    // Mock implementation based on hashtag characteristics
    if (hashtag.includes("business") || hashtag.includes("professional")) {
      return ["linkedin", "twitter"];
    }
    if (hashtag.includes("lifestyle") || hashtag.includes("photo")) {
      return ["instagram", "facebook"];
    }
    return ["instagram", "twitter", "facebook"];
  }

  private generateOptimalTimes(): string[] {
    return ["09:00", "13:00", "19:00"];
  }

  private generateRelatedHashtags(hashtag: string): string[] {
    // Mock implementation
    const base = hashtag.slice(1).toLowerCase();
    return [
      `#${base}tips`,
      `#${base}strategy`,
      `#${base}insights`,
      `#${base}success`,
      `#${base}guide`,
    ].slice(0, 3);
  }

  private async calculateHashtagTimeBoosts(
    hashtags: string[],
    platform: string
  ): Promise<number[]> {
    // Mock implementation
    return [0.1, 0.05, 0.03];
  }

  private extractKeywords(content: string): string[] {
    return content
      .toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 3 && word.length < 15)
      .slice(0, 5);
  }

  private getPlatformOptimalHashtags(platform: string): string[] {
    const hashtags = {
      instagram: ["#instagood", "#photooftheday", "#follow", "#instadaily"],
      linkedin: ["#professional", "#business", "#career", "#networking"],
      twitter: ["#trending", "#news", "#update", "#breaking"],
      facebook: ["#community", "#family", "#friends", "#local"],
    };
    return hashtags[platform as keyof typeof hashtags] || [];
  }

  private getTrendingHashtags(platform: string): string[] {
    // Mock trending hashtags - in real implementation, fetch from APIs
    return ["#trending2024", "#viral", "#popular", "#hot", "#new"];
  }

  private calculateEngagementWeight(text: string): number {
    const actionWords = [
      "click",
      "share",
      "comment",
      "like",
      "follow",
      "subscribe",
    ];
    const words = text.toLowerCase().split(" ");
    let weight = 1.0;

    actionWords.forEach(action => {
      if (words.includes(action)) weight += 0.1;
    });

    return Math.min(weight, 2.0);
  }

  private extractEmojis(
    text: string,
    elements: ContentElement[],
    startPosition: number
  ): void {
    const emojiRegex =
      /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    const emojis = text.match(emojiRegex) || [];

    emojis.forEach((emoji, index) => {
      elements.push({
        id: `emoji_${startPosition + index}`,
        type: "emoji",
        content: emoji,
        position: startPosition + index,
        performance_impact: 0.3,
        engagement_weight: 1.1,
      });
    });
  }

  private extractLinks(
    text: string,
    elements: ContentElement[],
    startPosition: number
  ): void {
    const urlRegex = /https?:\/\/[^\s]+/g;
    const links = text.match(urlRegex) || [];

    links.forEach((link, index) => {
      elements.push({
        id: `link_${startPosition + index}`,
        type: "link",
        content: link,
        position: startPosition + index,
        performance_impact: 0.4,
        engagement_weight: 0.9,
      });
    });
  }

  private getPlatformMultiplier(platform: string): number {
    const multipliers = {
      instagram: 1.2,
      linkedin: 1.1,
      twitter: 1.0,
      facebook: 0.95,
      tiktok: 1.3,
      youtube: 1.15,
    };
    return multipliers[platform as keyof typeof multipliers] || 1.0;
  }

  private calculateViralPotential(
    elements: ContentElement[],
    hashtagAnalysis: HashtagAnalysis[]
  ): number {
    const elementScore =
      elements.reduce((sum, el) => sum + el.performance_impact, 0) /
      elements.length;
    const hashtagScore = hashtagAnalysis.reduce(
      (sum, h) => sum + (h.trending_status === "trending" ? 0.3 : 0.1),
      0
    );
    const emojiBoost = elements.filter(el => el.type === "emoji").length * 0.05;

    return Math.min(elementScore + hashtagScore + emojiBoost, 1.0);
  }

  private async generateOptimalPostingTimes(
    platform: string
  ): Promise<string[]> {
    // Mock implementation
    const times = {
      instagram: ["09:00", "15:00", "21:00"],
      linkedin: ["08:00", "12:00", "17:00"],
      twitter: ["07:00", "12:00", "18:00"],
      facebook: ["09:00", "14:00", "20:00"],
    };
    return times[platform as keyof typeof times] || ["09:00", "15:00", "21:00"];
  }

  private identifyRiskFactors(
    elements: ContentElement[],
    hashtagAnalysis: HashtagAnalysis[],
    platform: string
  ): string[] {
    const risks: string[] = [];

    if (hashtagAnalysis.some(h => h.competition_level === "high")) {
      risks.push("High competition hashtags may limit organic reach");
    }

    if (elements.filter(el => el.type === "hashtag").length > 10) {
      risks.push("Too many hashtags may appear spammy");
    }

    if (hashtagAnalysis.some(h => h.trending_status === "declining")) {
      risks.push("Some hashtags are declining in popularity");
    }

    return risks;
  }

  private generateOptimizationSuggestions(
    elements: ContentElement[],
    hashtagAnalysis: HashtagAnalysis[],
    patterns: ContentPattern[]
  ): string[] {
    const suggestions: string[] = [];

    if (hashtagAnalysis.length < 5) {
      suggestions.push(
        "Consider adding more relevant hashtags to increase discoverability"
      );
    }

    if (!elements.some(el => el.type === "emoji")) {
      suggestions.push("Add emojis to increase visual appeal and engagement");
    }

    if (patterns.length === 0) {
      suggestions.push(
        "Optimize content structure based on successful patterns"
      );
    }

    const avgSentiment =
      elements.reduce((sum, el) => sum + (el.sentiment_score || 0.5), 0) /
      elements.length;
    if (avgSentiment < 0.6) {
      suggestions.push(
        "Consider using more positive language to improve engagement"
      );
    }

    return suggestions;
  }

  private generateOptimizationRecommendations(
    elements: ContentElement[],
    hashtagAnalysis: HashtagAnalysis[],
    patterns: ContentPattern[],
    platform: string
  ): string[] {
    const recommendations: string[] = [];

    // Hashtag recommendations
    const effectiveHashtags = hashtagAnalysis.filter(
      h => h.effectiveness_score > 0.7
    );
    if (effectiveHashtags.length > 0) {
      recommendations.push(
        `Your most effective hashtags: ${effectiveHashtags.map(h => h.hashtag).join(", ")}`
      );
    }

    // Pattern recommendations
    if (patterns.length > 0) {
      const bestPattern = patterns.reduce((best, current) =>
        current.success_score > best.success_score ? current : best
      );
      recommendations.push(
        `Best performing pattern: ${bestPattern.pattern_type} with ${(bestPattern.success_score * 100).toFixed(1)}% success rate`
      );
    }

    // Platform-specific recommendations
    if (platform === "instagram" && !elements.some(el => el.type === "emoji")) {
      recommendations.push(
        "Instagram posts with emojis get 47% more engagement"
      );
    }

    if (
      platform === "linkedin" &&
      elements.filter(el => el.type === "hashtag").length > 5
    ) {
      recommendations.push(
        "LinkedIn performs better with 3-5 targeted hashtags"
      );
    }

    return recommendations;
  }

  private initializeBasePatterns(): void {
    // Initialize with some proven patterns
    this.patternDatabase.set("high_engagement_combo", {
      id: "high_engagement_combo",
      pattern_type: "hashtag_effectiveness",
      elements: [],
      success_score: 0.85,
      frequency: 45,
      platforms: ["instagram", "facebook"],
      audience_segments: ["millennials", "gen-z"],
      performance_metrics: {
        avg_engagement_rate: 0.12,
        avg_conversion_rate: 0.03,
        avg_roi: 2.8,
        reach_amplification: 1.9,
      },
    });
  }

  private calculateTextImpact(text: string): number {
    const words = text.split(" ").length;
    const questions = (text.match(/\?/g) || []).length;
    const exclamations = (text.match(/!/g) || []).length;

    let impact = Math.min(words * 0.05, 0.8);
    impact += questions * 0.1;
    impact += exclamations * 0.05;

    return Math.min(impact, 1.0);
  }

  private analyzeSentiment(text: string): number {
    const positiveWords = [
      "great",
      "amazing",
      "excellent",
      "love",
      "best",
      "awesome",
      "fantastic",
      "wonderful",
      "perfect",
      "incredible",
    ];
    const negativeWords = [
      "bad",
      "terrible",
      "awful",
      "hate",
      "worst",
      "horrible",
      "disappointing",
    ];

    const words = text.toLowerCase().split(/\W+/);
    let score = 0.5;

    words.forEach(word => {
      if (positiveWords.includes(word)) score += 0.1;
      if (negativeWords.includes(word)) score -= 0.1;
    });

    return Math.max(0, Math.min(score, 1.0));
  }

  private calculateHashtagImpact(hashtag: string): number {
    const length = hashtag.length;
    if (length < 5) return 0.3;
    if (length > 25) return 0.2;

    // Bonus for common high-performing patterns
    if (hashtag.includes("tip") || hashtag.includes("guide")) return 0.8;
    if (hashtag.includes("success") || hashtag.includes("win")) return 0.7;

    return 0.6;
  }

  private generateFutureTimestamp(hour: number, dayOffset: number): string {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    date.setHours(hour, 0, 0, 0);
    return date.toISOString();
  }
}
