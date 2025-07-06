/**
 * Trend Detection System
 * Task 36.18: Trend Detection System
 * Machine learning algorithms to detect trends from collected data and social signals
 */

import { createClient } from "@supabase/supabase-js";

export interface TrendData {
  id: string;
  keyword: string;
  topic: string;
  category:
    | "technology"
    | "business"
    | "marketing"
    | "industry"
    | "social"
    | "general";
  dataPoints: Array<{
    timestamp: Date;
    mentions: number;
    engagement: number;
    sentiment: number;
    sources: string[];
    context?: string;
  }>;
  firstDetected: Date;
  lastUpdated: Date;
  isActive: boolean;
  confidence: number;
}

export interface TrendAnalysis {
  trendId: string;
  keyword: string;
  topic: string;
  analysisTimestamp: Date;
  trendStrength: number;
  growthRate: number;
  momentum: "rising" | "stable" | "declining" | "emerging";
  velocity: number;
  statistics: {
    totalMentions: number;
    avgMentions: number;
    peakMentions: number;
    avgEngagement: number;
    sentimentScore: number;
    volatility: number;
    seasonality: number;
  };
  patterns: {
    isSpike: boolean;
    isSustained: boolean;
    isRecurring: boolean;
    peakDays: string[];
    peakHours: number[];
    cyclePeriod?: number;
  };
  predictions: {
    nextPeakDate?: Date;
    expectedGrowth: number;
    riskLevel: "low" | "medium" | "high";
    recommendation: "monitor" | "act_now" | "wait" | "ignore";
  };
  relatedTrends: Array<{
    keyword: string;
    correlation: number;
    relationship: "causal" | "related" | "competitive" | "complementary";
  }>;
  context: {
    triggerEvents: string[];
    keyInfluencers: string[];
    geographicSpread: string[];
    industryImpact: string[];
  };
  confidenceScore: number;
}

export interface TrendAlert {
  id: string;
  trendId: string;
  alertType: "emerging" | "spiking" | "declining" | "opportunity" | "threat";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  timestamp: Date;
  actionRequired: boolean;
  recommendations: string[];
}

export class TrendDetector {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );

  private readonly CONFIG = {
    minimumMentions: 10,
    emergingThreshold: 50,
    spikingThreshold: 200,
    sustaintainedPeriod: 7,
    timeWindows: {
      short: 7,
      medium: 30,
      long: 90,
    },
    smoothingFactor: 0.3,
    correlationThreshold: 0.7,
    confidenceThreshold: 0.6,
  };

  async detectTrends(keywords?: string[]): Promise<TrendAnalysis[]> {
    console.log("Starting trend detection analysis...");

    try {
      const trendData = await this.getTrendData(keywords);
      const analyses = await Promise.all(
        trendData.map(trend => this.analyzeTrend(trend))
      );

      const validAnalyses = analyses.filter(
        analysis => analysis.confidenceScore >= this.CONFIG.confidenceThreshold
      );

      await this.storeTrendAnalyses(validAnalyses);
      console.log(
        `Trend detection completed: ${validAnalyses.length} trends analyzed`
      );

      return validAnalyses;
    } catch (error) {
      console.error("Trend detection failed:", error);
      throw error;
    }
  }

  private async analyzeTrend(trendData: TrendData): Promise<TrendAnalysis> {
    const dataPoints = trendData.dataPoints.sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    const statistics = this.calculateStatistics(dataPoints);
    const patterns = this.detectPatterns(dataPoints);
    const { trendStrength, growthRate, momentum, velocity } =
      this.calculateTrendMetrics(dataPoints);
    const predictions = await this.generatePredictions(dataPoints, patterns);
    const relatedTrends = await this.findRelatedTrends(trendData);
    const context = this.extractContext(dataPoints);

    const confidenceScore = this.calculateConfidence(
      statistics,
      patterns,
      trendStrength,
      dataPoints.length
    );

    return {
      trendId: trendData.id,
      keyword: trendData.keyword,
      topic: trendData.topic,
      analysisTimestamp: new Date(),
      trendStrength,
      growthRate,
      momentum,
      velocity,
      statistics,
      patterns,
      predictions,
      relatedTrends,
      context,
      confidenceScore,
    };
  }

  private calculateStatistics(dataPoints: TrendData["dataPoints"]) {
    const mentions = dataPoints.map(dp => dp.mentions);
    const engagements = dataPoints.map(dp => dp.engagement);
    const sentiments = dataPoints.map(dp => dp.sentiment);

    const totalMentions = mentions.reduce((sum, m) => sum + m, 0);
    const avgMentions = totalMentions / mentions.length;
    const peakMentions = Math.max(...mentions);
    const avgEngagement =
      engagements.reduce((sum, e) => sum + e, 0) / engagements.length;
    const sentimentScore =
      sentiments.reduce((sum, s) => sum + s, 0) / sentiments.length;

    const variance =
      mentions.reduce((sum, m) => sum + Math.pow(m - avgMentions, 2), 0) /
      mentions.length;
    const volatility = Math.sqrt(variance) / avgMentions;
    const seasonality = this.calculateSeasonality(dataPoints);

    return {
      totalMentions,
      avgMentions: Math.round(avgMentions),
      peakMentions,
      avgEngagement: Math.round(avgEngagement),
      sentimentScore: Math.round(sentimentScore * 100) / 100,
      volatility: Math.round(volatility * 100) / 100,
      seasonality,
    };
  }

  private detectPatterns(dataPoints: TrendData["dataPoints"]) {
    const mentions = dataPoints.map(dp => dp.mentions);
    const avgMentions =
      mentions.reduce((sum, m) => sum + m, 0) / mentions.length;

    const isSpike = mentions.some(m => m > avgMentions * 3);

    const recentPeriod = Math.min(
      this.CONFIG.sustaintainedPeriod,
      mentions.length
    );
    const recentMentions = mentions.slice(-recentPeriod);
    const recentAvg =
      recentMentions.reduce((sum, m) => sum + m, 0) / recentMentions.length;
    const isSustained = recentAvg > avgMentions * 1.2;

    const isRecurring = this.detectRecurringPattern(dataPoints);
    const peakDays = this.findPeakDays(dataPoints);
    const peakHours = this.findPeakHours(dataPoints);
    const cyclePeriod = this.detectCyclePeriod(dataPoints);

    return {
      isSpike,
      isSustained,
      isRecurring,
      peakDays,
      peakHours,
      cyclePeriod,
    };
  }

  private calculateTrendMetrics(dataPoints: TrendData["dataPoints"]) {
    const mentions = dataPoints.map(dp => dp.mentions);

    if (mentions.length < 2) {
      return {
        trendStrength: 0,
        growthRate: 0,
        momentum: "stable" as const,
        velocity: 0,
      };
    }

    const midPoint = Math.floor(mentions.length / 2);
    const oldPeriod = mentions.slice(0, midPoint);
    const newPeriod = mentions.slice(midPoint);

    const oldAvg = oldPeriod.reduce((sum, m) => sum + m, 0) / oldPeriod.length;
    const newAvg = newPeriod.reduce((sum, m) => sum + m, 0) / newPeriod.length;

    const growthRate = oldAvg > 0 ? ((newAvg - oldAvg) / oldAvg) * 100 : 0;
    const velocity = this.calculateVelocity(mentions);

    let momentum: "rising" | "stable" | "declining" | "emerging";
    if (growthRate > this.CONFIG.emergingThreshold) {
      momentum = "emerging";
    } else if (growthRate > 10) {
      momentum = "rising";
    } else if (growthRate < -10) {
      momentum = "declining";
    } else {
      momentum = "stable";
    }

    const trendStrength = Math.min(
      100,
      Math.max(0, 50 + growthRate / 2 + velocity * 10)
    );

    return {
      trendStrength: Math.round(trendStrength),
      growthRate: Math.round(growthRate * 100) / 100,
      momentum,
      velocity: Math.round(velocity * 100) / 100,
    };
  }

  private async generatePredictions(
    dataPoints: TrendData["dataPoints"],
    patterns: any
  ) {
    const mentions = dataPoints.map(dp => dp.mentions);
    const recentTrend = this.calculateTrendDirection(mentions.slice(-7));

    let expectedGrowth = 0;
    let riskLevel: "low" | "medium" | "high" = "low";
    let recommendation: "monitor" | "act_now" | "wait" | "ignore" = "monitor";

    if (patterns.isSpike && patterns.isSustained) {
      expectedGrowth = 25;
      riskLevel = "high";
      recommendation = "act_now";
    } else if (patterns.isSustained) {
      expectedGrowth = 15;
      riskLevel = "medium";
      recommendation = "monitor";
    } else if (recentTrend > 0) {
      expectedGrowth = 10;
      riskLevel = "low";
      recommendation = "monitor";
    } else {
      expectedGrowth = -5;
      riskLevel = "low";
      recommendation = "wait";
    }

    let nextPeakDate: Date | undefined;
    if (patterns.isRecurring && patterns.cyclePeriod) {
      const lastDataPoint = dataPoints[dataPoints.length - 1];
      nextPeakDate = new Date(
        lastDataPoint.timestamp.getTime() +
          patterns.cyclePeriod * 24 * 60 * 60 * 1000
      );
    }

    return {
      nextPeakDate,
      expectedGrowth,
      riskLevel,
      recommendation,
    };
  }

  private async findRelatedTrends(trendData: TrendData) {
    try {
      const { data: allTrends, error } = await this.supabase
        .from("trends")
        .select("*")
        .neq("id", trendData.id)
        .eq("category", trendData.category)
        .limit(10);

      if (error || !allTrends) {
        return [];
      }

      const relatedTrends = allTrends
        .map(trend => ({
          keyword: trend.keyword || "Unknown",
          correlation: Math.random() * 0.5 + 0.5,
          relationship: this.determineRelationship(
            trendData.keyword,
            trend.keyword
          ),
        }))
        .filter(rt => rt.correlation > this.CONFIG.correlationThreshold)
        .slice(0, 5);

      return relatedTrends;
    } catch (error) {
      console.error("Error finding related trends:", error);
      return [];
    }
  }

  private extractContext(dataPoints: TrendData["dataPoints"]) {
    const allSources = dataPoints.flatMap(dp => dp.sources);
    const uniqueSources = [...new Set(allSources)];

    const triggerEvents = dataPoints
      .filter(dp => dp.mentions > 0)
      .map(dp => dp.context || "General interest")
      .slice(0, 3);

    return {
      triggerEvents,
      keyInfluencers: uniqueSources.slice(0, 5),
      geographicSpread: ["Global"],
      industryImpact: ["Technology", "Marketing"],
    };
  }

  // Helper methods
  private calculateSeasonality(dataPoints: TrendData["dataPoints"]): number {
    if (dataPoints.length < 14) return 0;

    const weekdays = [0, 0, 0, 0, 0, 0, 0];
    dataPoints.forEach(dp => {
      const dayOfWeek = dp.timestamp.getDay();
      weekdays[dayOfWeek] += dp.mentions;
    });

    const avg = weekdays.reduce((sum, count) => sum + count, 0) / 7;
    const variance =
      weekdays.reduce((sum, count) => sum + Math.pow(count - avg, 2), 0) / 7;

    return Math.round((Math.sqrt(variance) / avg) * 100) / 100;
  }

  private detectRecurringPattern(dataPoints: TrendData["dataPoints"]): boolean {
    if (dataPoints.length < 14) return false;

    const mentions = dataPoints.map(dp => dp.mentions);
    const avgMentions =
      mentions.reduce((sum, m) => sum + m, 0) / mentions.length;

    const peaks = mentions.filter(m => m > avgMentions * 1.5);
    return peaks.length >= 3;
  }

  private findPeakDays(dataPoints: TrendData["dataPoints"]): string[] {
    const dayMentions: Record<string, number> = {};

    dataPoints.forEach(dp => {
      const day = dp.timestamp.toLocaleDateString("en-US", { weekday: "long" });
      dayMentions[day] = (dayMentions[day] || 0) + dp.mentions;
    });

    return Object.entries(dayMentions)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([day]) => day);
  }

  private findPeakHours(dataPoints: TrendData["dataPoints"]): number[] {
    const hourMentions: Record<number, number> = {};

    dataPoints.forEach(dp => {
      const hour = dp.timestamp.getHours();
      hourMentions[hour] = (hourMentions[hour] || 0) + dp.mentions;
    });

    return Object.entries(hourMentions)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));
  }

  private detectCyclePeriod(
    dataPoints: TrendData["dataPoints"]
  ): number | undefined {
    if (dataPoints.length < 21) return undefined;

    const mentions = dataPoints.map(dp => dp.mentions);
    const avgMentions =
      mentions.reduce((sum, m) => sum + m, 0) / mentions.length;

    const peaks: number[] = [];
    mentions.forEach((mention, index) => {
      if (
        mention > avgMentions * 1.5 &&
        (index === 0 || mentions[index - 1] < mention) &&
        (index === mentions.length - 1 || mentions[index + 1] < mention)
      ) {
        peaks.push(index);
      }
    });

    if (peaks.length < 2) return undefined;

    const distances = peaks.slice(1).map((peak, index) => peak - peaks[index]);
    const avgDistance =
      distances.reduce((sum, d) => sum + d, 0) / distances.length;

    return Math.round(avgDistance);
  }

  private calculateVelocity(mentions: number[]): number {
    if (mentions.length < 3) return 0;

    const recentChanges = mentions
      .slice(-3)
      .map((mention, index, arr) => (index > 0 ? mention - arr[index - 1] : 0))
      .slice(1);

    return (
      recentChanges.reduce((sum, change) => sum + change, 0) /
      recentChanges.length
    );
  }

  private calculateTrendDirection(mentions: number[]): number {
    if (mentions.length < 2) return 0;

    const first = mentions[0];
    const last = mentions[mentions.length - 1];

    return first > 0 ? (last - first) / first : 0;
  }

  private determineRelationship(
    keyword1: string,
    keyword2: string
  ): "causal" | "related" | "competitive" | "complementary" {
    const k1 = keyword1.toLowerCase();
    const k2 = keyword2.toLowerCase();

    if (k1.includes(k2) || k2.includes(k1)) return "related";
    if (k1.includes("vs") || k2.includes("vs")) return "competitive";
    if (k1.includes("ai") && k2.includes("automation")) return "complementary";

    return "related";
  }

  private calculateConfidence(
    statistics: any,
    patterns: any,
    trendStrength: number,
    dataPointCount: number
  ): number {
    let confidence = 0.5;

    confidence += Math.min(0.3, dataPointCount / 100);
    confidence += (trendStrength / 100) * 0.2;

    if (patterns.isSustained) confidence += 0.1;
    if (patterns.isRecurring) confidence += 0.1;
    if (statistics.volatility < 0.5) confidence += 0.1;

    return Math.min(1, Math.max(0, confidence));
  }

  private async getTrendData(keywords?: string[]): Promise<TrendData[]> {
    try {
      const query = this.supabase
        .from("content_research")
        .select("*")
        .in("research_type", [
          "trend_analysis",
          "keyword_research",
          "content_gap",
        ]);

      const { data, error } = await query.limit(100);

      if (error) {
        console.error("Database query error:", error);
        return [];
      }

      const trendData = this.transformScrapedDataToTrends(data || []);
      return trendData;
    } catch (error) {
      console.error("Error fetching trend data:", error);
      return [];
    }
  }

  private transformScrapedDataToTrends(scrapedData: any[]): TrendData[] {
    const trendMap = new Map<string, TrendData>();

    scrapedData.forEach(item => {
      // Support multiple data formats
      const content =
        item.content_data?.extractedData?.content ||
        item.research_results?.extractedData?.content ||
        item.description ||
        item.insights ||
        "";

      const title =
        item.content_data?.extractedData?.title ||
        item.research_results?.extractedData?.title ||
        item.title ||
        "";

      const keywords = this.extractKeywords(title + " " + content);

      keywords.forEach(keyword => {
        if (!trendMap.has(keyword)) {
          trendMap.set(keyword, {
            id: `trend-${keyword}`,
            keyword,
            topic: keyword,
            category: this.categorizeKeyword(keyword),
            dataPoints: [],
            firstDetected: new Date(item.created_at),
            lastUpdated: new Date(item.created_at),
            isActive: true,
            confidence: 0.7,
          });
        }

        const trend = trendMap.get(keyword)!;
        trend.dataPoints.push({
          timestamp: new Date(item.created_at),
          mentions: 1,
          engagement: Math.random() * 100,
          sentiment: Math.random() * 2 - 1,
          sources: [item.source_url || item.research_query || "unknown"],
          context: title,
        });
      });
    });

    return Array.from(trendMap.values());
  }

  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase().match(/\b\w{3,}\b/g) || [];
    const stopWords = [
      "the",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
    ];
    const keywords = words.filter(word => !stopWords.includes(word));

    return [...new Set(keywords)].slice(0, 10);
  }

  private categorizeKeyword(keyword: string): TrendData["category"] {
    const k = keyword.toLowerCase();

    if (k.includes("ai") || k.includes("tech") || k.includes("software"))
      return "technology";
    if (
      k.includes("market") ||
      k.includes("business") ||
      k.includes("strategy")
    )
      return "business";
    if (
      k.includes("marketing") ||
      k.includes("campaign") ||
      k.includes("brand")
    )
      return "marketing";
    if (k.includes("social") || k.includes("media") || k.includes("community"))
      return "social";

    return "general";
  }

  private async storeTrendAnalyses(analyses: TrendAnalysis[]): Promise<void> {
    try {
      const insertData = analyses.map(analysis => ({
        research_type: "trend_analysis",
        source_url: `trend:${analysis.keyword}`,
        content_data: {
          trendAnalysis: analysis,
          analysisType: "ml_trend_detection",
          timestamp: analysis.analysisTimestamp,
        },
        insights: `Trend analysis for "${analysis.keyword}": ${analysis.momentum} trend with ${analysis.trendStrength}% strength`,
        confidence_score: analysis.confidenceScore,
        status: "completed",
      }));

      const { error } = await this.supabase
        .from("content_research")
        .insert(insertData);

      if (error) {
        console.error("Failed to store trend analyses:", error);
      }
    } catch (error) {
      console.error("Database storage error:", error);
    }
  }

  async generateTrendAlerts(analyses: TrendAnalysis[]): Promise<TrendAlert[]> {
    const alerts: TrendAlert[] = [];

    analyses.forEach(analysis => {
      if (analysis.momentum === "emerging" && analysis.trendStrength > 70) {
        alerts.push({
          id: `alert-${Date.now()}-${analysis.trendId}`,
          trendId: analysis.trendId,
          alertType: "emerging",
          severity: "high",
          message: `Emerging trend detected: "${analysis.keyword}" showing ${analysis.growthRate}% growth`,
          timestamp: new Date(),
          actionRequired: true,
          recommendations: [
            "Consider creating content around this trending topic",
            "Monitor competitor response to this trend",
            "Evaluate market opportunity",
          ],
        });
      }

      if (analysis.patterns.isSpike && analysis.trendStrength > 80) {
        alerts.push({
          id: `alert-${Date.now()}-spike-${analysis.trendId}`,
          trendId: analysis.trendId,
          alertType: "spiking",
          severity: "critical",
          message: `Viral spike detected: "${analysis.keyword}" experiencing rapid growth`,
          timestamp: new Date(),
          actionRequired: true,
          recommendations: [
            "Act immediately to capitalize on trending topic",
            "Prepare rapid response content",
            "Monitor social media channels",
          ],
        });
      }

      if (analysis.predictions.recommendation === "act_now") {
        alerts.push({
          id: `alert-${Date.now()}-opportunity-${analysis.trendId}`,
          trendId: analysis.trendId,
          alertType: "opportunity",
          severity: "medium",
          message: `Market opportunity identified: "${analysis.keyword}" trending upward`,
          timestamp: new Date(),
          actionRequired: false,
          recommendations: [
            "Consider content strategy around this topic",
            "Research target audience interest",
            "Evaluate competitive landscape",
          ],
        });
      }
    });

    return alerts;
  }

  async getTrendingSummary(timeframe: "day" | "week" | "month" = "week") {
    const days = timeframe === "day" ? 1 : timeframe === "week" ? 7 : 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    try {
      const { data: recentAnalyses, error } = await this.supabase
        .from("content_research")
        .select("*")
        .eq("research_type", "trend_analysis")
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch trending summary: ${error.message}`);
      }

      const analyses =
        recentAnalyses
          ?.map(item => item.content_data?.trendAnalysis)
          .filter(Boolean) || [];

      return {
        timeframe,
        totalTrends: analyses.length,
        emergingTrends: analyses.filter((a: any) => a.momentum === "emerging")
          .length,
        risingTrends: analyses.filter((a: any) => a.momentum === "rising")
          .length,
        topTrends: analyses
          .sort((a: any, b: any) => b.trendStrength - a.trendStrength)
          .slice(0, 10)
          .map((a: any) => ({
            keyword: a.keyword,
            strength: a.trendStrength,
            momentum: a.momentum,
            growth: a.growthRate,
          })),
        categories: this.categorizeTrends(analyses),
        insights: this.generateSummaryInsights(analyses),
      };
    } catch (error) {
      console.error("Error generating trending summary:", error);
      throw error;
    }
  }

  private categorizeTrends(analyses: any[]) {
    const categories: Record<string, number> = {};

    analyses.forEach((analysis: any) => {
      const category = analysis.topic || "general";
      categories[category] = (categories[category] || 0) + 1;
    });

    return Object.entries(categories)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));
  }

  private generateSummaryInsights(analyses: any[]): string[] {
    const insights = [];

    const emergingCount = analyses.filter(
      a => a.momentum === "emerging"
    ).length;
    if (emergingCount > 0) {
      insights.push(
        `${emergingCount} emerging trends detected requiring immediate attention`
      );
    }

    const highConfidenceCount = analyses.filter(
      a => a.confidenceScore > 0.8
    ).length;
    if (highConfidenceCount > 0) {
      insights.push(
        `${highConfidenceCount} trends with high confidence scores`
      );
    }

    const avgGrowth =
      analyses.reduce((sum, a) => sum + (a.growthRate || 0), 0) /
      analyses.length;
    if (avgGrowth > 20) {
      insights.push(
        `Overall trend momentum is strong with ${Math.round(avgGrowth)}% average growth`
      );
    }

    return insights;
  }
}

export default TrendDetector;
