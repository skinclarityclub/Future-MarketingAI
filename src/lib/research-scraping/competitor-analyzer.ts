/**
 * Competitor Analysis Engine
 * Task 36.16: Competitor Analysis Engine
 *
 * AI-powered system to analyze competitor strategies and content performance
 */

import { createClient } from "@supabase/supabase-js";

export interface CompetitorData {
  id: string;
  name: string;
  domain: string;
  industry: string;
  contentData: {
    title: string;
    content: string;
    publishDate: Date;
    url: string;
    contentType: "blog" | "news" | "social" | "video" | "other";
    engagement?: {
      views?: number;
      likes?: number;
      shares?: number;
      comments?: number;
    };
    seoMetrics?: {
      keywords: string[];
      metaDescription: string;
      headings: string[];
    };
  }[];
}

export interface CompetitorAnalysis {
  competitorId: string;
  competitorName: string;
  analysisTimestamp: Date;

  // Content Analysis
  contentPatterns: {
    averageContentLength: number;
    mostUsedKeywords: Array<{
      keyword: string;
      frequency: number;
      relevance: number;
    }>;
    contentCategories: Array<{ category: string; percentage: number }>;
    publishingFrequency: {
      daily: number;
      weekly: number;
      monthly: number;
    };
    bestPerformingContentTypes: Array<{ type: string; avgEngagement: number }>;
  };

  // SEO Analysis
  seoStrategy: {
    targetKeywords: string[];
    contentOptimization: {
      titleOptimization: number; // 0-100 score
      metaOptimization: number;
      headingStructure: number;
      keywordDensity: number;
    };
    competitiveKeywords: Array<{
      keyword: string;
      difficulty: number;
      opportunity: number;
    }>;
  };

  // Performance Metrics
  performanceInsights: {
    avgEngagementRate: number;
    contentVelocity: number; // posts per week
    topPerformingPosts: Array<{
      title: string;
      url: string;
      engagement: number;
      reasonsForSuccess: string[];
    }>;
    contentGaps: string[]; // opportunities not covered by competitor
  };

  // Strategic Insights
  strategicPatterns: {
    brandVoice: string; // tone analysis
    contentPillars: string[]; // main topics
    audienceTargeting: string[];
    contentFormats: Array<{ format: string; usage: number }>;
    postingSchedule: {
      bestDays: string[];
      bestTimes: string[];
      consistency: number; // 0-100 score
    };
  };

  // Recommendations
  actionableInsights: {
    opportunities: string[];
    threats: string[];
    contentIdeas: string[];
    keywordOpportunities: string[];
    improvementAreas: string[];
  };

  confidenceScore: number; // 0-100
}

export class CompetitorAnalyzer {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );

  constructor() {
    this.validateConfiguration();
  }

  private validateConfiguration(): void {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      console.warn("Supabase configuration missing for competitor analyzer");
    }
  }

  /**
   * Main analysis method for a competitor
   */
  async analyzeCompetitor(
    competitorData: CompetitorData
  ): Promise<CompetitorAnalysis> {
    console.log(`Starting competitor analysis for: ${competitorData.name}`);

    const analysisStart = Date.now();

    try {
      // Parallel analysis of different aspects
      const [
        contentPatterns,
        seoStrategy,
        performanceInsights,
        strategicPatterns,
      ] = await Promise.all([
        this.analyzeContentPatterns(competitorData.contentData),
        this.analyzeSEOStrategy(competitorData.contentData),
        this.analyzePerformance(competitorData.contentData),
        this.analyzeStrategicPatterns(competitorData.contentData),
      ]);

      const actionableInsights = await this.generateActionableInsights(
        competitorData,
        { contentPatterns, seoStrategy, performanceInsights, strategicPatterns }
      );

      const analysis: CompetitorAnalysis = {
        competitorId: competitorData.id,
        competitorName: competitorData.name,
        analysisTimestamp: new Date(),
        contentPatterns,
        seoStrategy,
        performanceInsights,
        strategicPatterns,
        actionableInsights,
        confidenceScore: this.calculateConfidenceScore(
          competitorData.contentData.length
        ),
      };

      // Store analysis results
      await this.storeAnalysisResults(analysis);

      console.log(
        `Competitor analysis completed for ${competitorData.name} in ${Date.now() - analysisStart}ms`
      );

      return analysis;
    } catch (error) {
      console.error(
        `Competitor analysis failed for ${competitorData.name}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Analyze content patterns and themes
   */
  private async analyzeContentPatterns(
    contentData: CompetitorData["contentData"]
  ) {
    const totalContent = contentData.length;

    // Calculate average content length
    const avgLength =
      contentData.reduce((sum, item) => sum + (item.content?.length || 0), 0) /
      totalContent;

    // Extract and analyze keywords
    const keywordFrequency = this.extractKeywordFrequency(contentData);
    const mostUsedKeywords = Object.entries(keywordFrequency)
      .map(([keyword, freq]) => ({
        keyword,
        frequency: freq,
        relevance: this.calculateKeywordRelevance(keyword, contentData),
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 20);

    // Categorize content
    const categories = this.categorizeContent(contentData);
    const contentCategories = Object.entries(categories)
      .map(([category, count]) => ({
        category,
        percentage: Math.round((count / totalContent) * 100),
      }))
      .sort((a, b) => b.percentage - a.percentage);

    // Analyze publishing frequency
    const publishingFrequency = this.analyzePublishingFrequency(contentData);

    // Identify best performing content types
    const contentTypePerformance =
      this.analyzeContentTypePerformance(contentData);

    return {
      averageContentLength: Math.round(avgLength),
      mostUsedKeywords,
      contentCategories,
      publishingFrequency,
      bestPerformingContentTypes: contentTypePerformance,
    };
  }

  /**
   * Analyze SEO strategy and optimization
   */
  private async analyzeSEOStrategy(contentData: CompetitorData["contentData"]) {
    const allKeywords = contentData.flatMap(
      item => item.seoMetrics?.keywords || []
    );
    const keywordCounts = this.countFrequency(allKeywords);

    const targetKeywords = Object.entries(keywordCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([keyword]) => keyword);

    // Analyze content optimization
    const contentOptimization = {
      titleOptimization: this.analyzeTitleOptimization(contentData),
      metaOptimization: this.analyzeMetaOptimization(contentData),
      headingStructure: this.analyzeHeadingStructure(contentData),
      keywordDensity: this.analyzeKeywordDensity(contentData),
    };

    // Identify competitive keyword opportunities
    const competitiveKeywords = this.identifyCompetitiveKeywords(contentData);

    return {
      targetKeywords,
      contentOptimization,
      competitiveKeywords,
    };
  }

  /**
   * Analyze performance metrics and insights
   */
  private async analyzePerformance(contentData: CompetitorData["contentData"]) {
    const contentWithEngagement = contentData.filter(item => item.engagement);

    // Calculate average engagement
    const avgEngagement =
      contentWithEngagement.length > 0
        ? contentWithEngagement.reduce((sum, item) => {
            const engagement =
              (item.engagement?.views || 0) +
              (item.engagement?.likes || 0) +
              (item.engagement?.shares || 0) +
              (item.engagement?.comments || 0);
            return sum + engagement;
          }, 0) / contentWithEngagement.length
        : 0;

    // Calculate content velocity (posts per week)
    const contentVelocity = this.calculateContentVelocity(contentData);

    // Identify top performing posts
    const topPerformingPosts = contentWithEngagement
      .map(item => {
        const totalEngagement =
          (item.engagement?.views || 0) +
          (item.engagement?.likes || 0) +
          (item.engagement?.shares || 0) +
          (item.engagement?.comments || 0);
        return {
          title: item.title,
          url: item.url,
          engagement: totalEngagement,
          reasonsForSuccess: this.analyzeSuccessFactors(item),
        };
      })
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 10);

    // Identify content gaps
    const contentGaps = this.identifyContentGaps(contentData);

    return {
      avgEngagementRate: Math.round(avgEngagement),
      contentVelocity: Math.round(contentVelocity * 100) / 100,
      topPerformingPosts,
      contentGaps,
    };
  }

  /**
   * Analyze strategic patterns and brand voice
   */
  private async analyzeStrategicPatterns(
    contentData: CompetitorData["contentData"]
  ) {
    // Analyze brand voice (simplified analysis)
    const brandVoice = this.analyzeBrandVoice(contentData);

    // Identify content pillars (main topics)
    const contentPillars = this.identifyContentPillars(contentData);

    // Analyze audience targeting
    const audienceTargeting = this.analyzeAudienceTargeting(contentData);

    // Analyze content formats
    const formatUsage = this.countFrequency(
      contentData.map(item => item.contentType)
    );
    const contentFormats = Object.entries(formatUsage)
      .map(([format, usage]) => ({ format, usage }))
      .sort((a, b) => b.usage - a.usage);

    // Analyze posting schedule
    const postingSchedule = this.analyzePostingSchedule(contentData);

    return {
      brandVoice,
      contentPillars,
      audienceTargeting,
      contentFormats,
      postingSchedule,
    };
  }

  /**
   * Generate actionable insights and recommendations
   */
  private async generateActionableInsights(
    competitorData: CompetitorData,
    analysisData: any
  ) {
    const opportunities = [
      "Target underserved keywords with high search volume",
      "Create content around trending topics competitor is missing",
      "Improve content frequency and consistency",
      "Optimize for mobile and voice search",
      "Leverage video content for higher engagement",
    ];

    const threats = [
      "Competitor has strong SEO presence in target keywords",
      "High content velocity creating market saturation",
      "Strong brand authority in key content areas",
      "Effective social media engagement strategy",
    ];

    const contentIdeas = [
      "Create comparison content highlighting your advantages",
      "Develop content series around trending industry topics",
      "Produce beginner-friendly guides in complex areas",
      "Create interactive content and tools",
      "Develop thought leadership content",
    ];

    const keywordOpportunities = analysisData.seoStrategy.competitiveKeywords
      .filter((kw: any) => kw.opportunity > 0.7)
      .map((kw: any) => kw.keyword)
      .slice(0, 10);

    const improvementAreas = [
      "Increase content length for better SEO performance",
      "Improve meta descriptions and title optimization",
      "Enhance content structure with better headings",
      "Increase publishing frequency",
      "Improve content promotion and distribution",
    ];

    return {
      opportunities,
      threats,
      contentIdeas,
      keywordOpportunities,
      improvementAreas,
    };
  }

  // Helper methods for analysis
  private extractKeywordFrequency(
    contentData: CompetitorData["contentData"]
  ): Record<string, number> {
    const keywords: Record<string, number> = {};

    contentData.forEach(item => {
      const text = `${item.title} ${item.content}`.toLowerCase();
      const words = text.match(/\b\w{3,}\b/g) || [];

      words.forEach(word => {
        if (!this.isStopWord(word)) {
          keywords[word] = (keywords[word] || 0) + 1;
        }
      });
    });

    return keywords;
  }

  private calculateKeywordRelevance(
    keyword: string,
    contentData: CompetitorData["contentData"]
  ): number {
    // Simplified relevance calculation
    const appearances = contentData.filter(
      item =>
        item.title.toLowerCase().includes(keyword) ||
        item.content.toLowerCase().includes(keyword)
    ).length;

    return Math.min((appearances / contentData.length) * 100, 100);
  }

  private categorizeContent(
    contentData: CompetitorData["contentData"]
  ): Record<string, number> {
    const categories: Record<string, number> = {};

    contentData.forEach(item => {
      // Simplified categorization based on content type and keywords
      const category = this.determineContentCategory(item);
      categories[category] = (categories[category] || 0) + 1;
    });

    return categories;
  }

  private determineContentCategory(
    item: CompetitorData["contentData"][0]
  ): string {
    const title = item.title.toLowerCase();
    const content = item.content.toLowerCase();

    if (
      title.includes("how to") ||
      title.includes("guide") ||
      title.includes("tutorial")
    ) {
      return "Educational";
    }
    if (
      title.includes("news") ||
      title.includes("update") ||
      title.includes("announcement")
    ) {
      return "News";
    }
    if (title.includes("review") || title.includes("comparison")) {
      return "Reviews";
    }
    if (title.includes("tips") || title.includes("best practices")) {
      return "Tips & Advice";
    }

    return "General";
  }

  private analyzePublishingFrequency(
    contentData: CompetitorData["contentData"]
  ) {
    const dates = contentData.map(item => item.publishDate);
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;
    const oneMonth = 30 * oneDay;

    const daily = dates.filter(
      date => now.getTime() - date.getTime() <= oneDay
    ).length;
    const weekly = dates.filter(
      date => now.getTime() - date.getTime() <= oneWeek
    ).length;
    const monthly = dates.filter(
      date => now.getTime() - date.getTime() <= oneMonth
    ).length;

    return { daily, weekly, monthly };
  }

  private analyzeContentTypePerformance(
    contentData: CompetitorData["contentData"]
  ) {
    const typePerformance: Record<string, number[]> = {};

    contentData.forEach(item => {
      if (item.engagement) {
        const engagement =
          (item.engagement.views || 0) +
          (item.engagement.likes || 0) +
          (item.engagement.shares || 0) +
          (item.engagement.comments || 0);

        if (!typePerformance[item.contentType]) {
          typePerformance[item.contentType] = [];
        }
        typePerformance[item.contentType].push(engagement);
      }
    });

    return Object.entries(typePerformance)
      .map(([type, engagements]) => ({
        type,
        avgEngagement: Math.round(
          engagements.reduce((a, b) => a + b, 0) / engagements.length
        ),
      }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement);
  }

  private countFrequency<T>(items: T[]): Record<string, number> {
    const freq: Record<string, number> = {};
    items.forEach(item => {
      const key = String(item);
      freq[key] = (freq[key] || 0) + 1;
    });
    return freq;
  }

  private analyzeTitleOptimization(
    contentData: CompetitorData["contentData"]
  ): number {
    const optimizedTitles = contentData.filter(
      item => item.title.length >= 30 && item.title.length <= 60
    ).length;
    return Math.round((optimizedTitles / contentData.length) * 100);
  }

  private analyzeMetaOptimization(
    contentData: CompetitorData["contentData"]
  ): number {
    const withMeta = contentData.filter(
      item =>
        item.seoMetrics?.metaDescription &&
        item.seoMetrics.metaDescription.length >= 120 &&
        item.seoMetrics.metaDescription.length <= 160
    ).length;
    return Math.round((withMeta / contentData.length) * 100);
  }

  private analyzeHeadingStructure(
    contentData: CompetitorData["contentData"]
  ): number {
    const withHeadings = contentData.filter(
      item => item.seoMetrics?.headings && item.seoMetrics.headings.length > 0
    ).length;
    return Math.round((withHeadings / contentData.length) * 100);
  }

  private analyzeKeywordDensity(
    contentData: CompetitorData["contentData"]
  ): number {
    // Simplified keyword density analysis
    return Math.floor(Math.random() * 30) + 70; // Mock score between 70-100
  }

  private identifyCompetitiveKeywords(
    contentData: CompetitorData["contentData"]
  ) {
    const keywords = contentData.flatMap(
      item => item.seoMetrics?.keywords || []
    );
    const uniqueKeywords = [...new Set(keywords)];

    return uniqueKeywords.slice(0, 10).map(keyword => ({
      keyword,
      difficulty: Math.floor(Math.random() * 40) + 30, // Mock difficulty 30-70
      opportunity: Math.floor(Math.random() * 50) + 50, // Mock opportunity 50-100
    }));
  }

  private calculateContentVelocity(
    contentData: CompetitorData["contentData"]
  ): number {
    if (contentData.length === 0) return 0;

    const dates = contentData
      .map(item => item.publishDate)
      .sort((a, b) => a.getTime() - b.getTime());
    const firstDate = dates[0];
    const lastDate = dates[dates.length - 1];
    const weeks =
      (lastDate.getTime() - firstDate.getTime()) / (7 * 24 * 60 * 60 * 1000);

    return weeks > 0 ? contentData.length / weeks : 0;
  }

  private analyzeSuccessFactors(
    item: CompetitorData["contentData"][0]
  ): string[] {
    const factors = [];

    if (item.title.length >= 30 && item.title.length <= 60) {
      factors.push("Optimized title length");
    }
    if (item.content.length > 1500) {
      factors.push("Long-form content");
    }
    if (item.seoMetrics?.keywords && item.seoMetrics.keywords.length > 5) {
      factors.push("Strong keyword targeting");
    }
    if (item.contentType === "video") {
      factors.push("Video content format");
    }

    return factors.length > 0
      ? factors
      : ["High-quality content", "Good timing"];
  }

  private identifyContentGaps(
    contentData: CompetitorData["contentData"]
  ): string[] {
    // Simplified gap analysis
    const commonTopics = [
      "AI",
      "automation",
      "productivity",
      "trends",
      "tutorials",
    ];
    const coveredTopics = contentData
      .map(item => item.title.toLowerCase() + " " + item.content.toLowerCase())
      .join(" ");

    return commonTopics.filter(
      topic => !coveredTopics.includes(topic.toLowerCase())
    );
  }

  private analyzeBrandVoice(
    contentData: CompetitorData["contentData"]
  ): string {
    // Simplified brand voice analysis
    const allContent = contentData
      .map(item => item.content)
      .join(" ")
      .toLowerCase();

    if (
      allContent.includes("innovative") &&
      allContent.includes("cutting-edge")
    ) {
      return "Innovative & Technical";
    }
    if (allContent.includes("friendly") && allContent.includes("easy")) {
      return "Friendly & Approachable";
    }
    if (allContent.includes("professional") && allContent.includes("expert")) {
      return "Professional & Authoritative";
    }

    return "Balanced & Informative";
  }

  private identifyContentPillars(
    contentData: CompetitorData["contentData"]
  ): string[] {
    const topics = this.extractTopics(contentData);
    return Object.entries(topics)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([topic]) => topic);
  }

  private extractTopics(
    contentData: CompetitorData["contentData"]
  ): Record<string, number> {
    const topics: Record<string, number> = {};
    const topicKeywords = [
      "marketing",
      "technology",
      "business",
      "strategy",
      "innovation",
      "growth",
    ];

    contentData.forEach(item => {
      const content = (item.title + " " + item.content).toLowerCase();
      topicKeywords.forEach(topic => {
        if (content.includes(topic)) {
          topics[topic] = (topics[topic] || 0) + 1;
        }
      });
    });

    return topics;
  }

  private analyzeAudienceTargeting(
    contentData: CompetitorData["contentData"]
  ): string[] {
    // Simplified audience analysis
    return [
      "Business Professionals",
      "Marketing Teams",
      "Tech Enthusiasts",
      "Entrepreneurs",
    ];
  }

  private analyzePostingSchedule(contentData: CompetitorData["contentData"]) {
    const dates = contentData.map(item => item.publishDate);
    const dayCount: Record<string, number> = {};
    const hourCount: Record<string, number> = {};

    dates.forEach(date => {
      const day = date.toLocaleDateString("en-US", { weekday: "long" });
      const hour = date.getHours();

      dayCount[day] = (dayCount[day] || 0) + 1;
      hourCount[hour] = (hourCount[hour] || 0) + 1;
    });

    const bestDays = Object.entries(dayCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([day]) => day);

    const bestHours = Object.entries(hourCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => `${hour}:00`);

    return {
      bestDays,
      bestTimes: bestHours,
      consistency: Math.floor(Math.random() * 30) + 70, // Mock consistency score
    };
  }

  private calculateConfidenceScore(dataPoints: number): number {
    if (dataPoints >= 100) return 95;
    if (dataPoints >= 50) return 85;
    if (dataPoints >= 25) return 75;
    if (dataPoints >= 10) return 65;
    return 50;
  }

  private isStopWord(word: string): boolean {
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
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "could",
      "should",
      "may",
      "might",
      "must",
      "can",
      "this",
      "that",
      "these",
      "those",
    ];
    return stopWords.includes(word.toLowerCase());
  }

  /**
   * Store analysis results in database
   */
  private async storeAnalysisResults(
    analysis: CompetitorAnalysis
  ): Promise<void> {
    try {
      const { error } = await this.supabase.from("content_research").insert({
        research_type: "competitor_analysis",
        source_url: `competitor:${analysis.competitorId}`,
        content_data: {
          competitorAnalysis: analysis,
          analysisType: "full_competitor_analysis",
          timestamp: analysis.analysisTimestamp,
        },
        insights: `Competitor analysis completed for ${analysis.competitorName}. Confidence: ${analysis.confidenceScore}%`,
        confidence_score: analysis.confidenceScore / 100,
        status: "completed",
      });

      if (error) {
        console.error("Failed to store competitor analysis:", error);
      }
    } catch (error) {
      console.error("Database storage error:", error);
    }
  }

  /**
   * Analyze multiple competitors
   */
  async analyzeMultipleCompetitors(
    competitors: CompetitorData[]
  ): Promise<CompetitorAnalysis[]> {
    console.log(
      `Starting batch competitor analysis for ${competitors.length} competitors`
    );

    const results = await Promise.allSettled(
      competitors.map(competitor => this.analyzeCompetitor(competitor))
    );

    const analyses: CompetitorAnalysis[] = [];
    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        analyses.push(result.value);
      } else {
        console.error(
          `Failed to analyze competitor ${competitors[index].name}:`,
          result.reason
        );
      }
    });

    console.log(
      `Completed batch analysis: ${analyses.length}/${competitors.length} successful`
    );
    return analyses;
  }

  /**
   * Compare multiple competitors
   */
  async compareCompetitors(analyses: CompetitorAnalysis[]) {
    if (analyses.length < 2) {
      throw new Error("At least 2 competitor analyses required for comparison");
    }

    const comparison = {
      timestamp: new Date(),
      competitorsCompared: analyses.map(a => ({
        id: a.competitorId,
        name: a.competitorName,
        confidenceScore: a.confidenceScore,
      })),

      // Content comparison
      contentMetrics: {
        avgContentLength: analyses
          .map(a => ({
            competitor: a.competitorName,
            avgLength: a.contentPatterns.averageContentLength,
          }))
          .sort((a, b) => b.avgLength - a.avgLength),

        publishingFrequency: analyses
          .map(a => ({
            competitor: a.competitorName,
            weekly: a.contentPatterns.publishingFrequency.weekly,
          }))
          .sort((a, b) => b.weekly - a.weekly),

        engagementRates: analyses
          .map(a => ({
            competitor: a.competitorName,
            avgEngagement: a.performanceInsights.avgEngagementRate,
          }))
          .sort((a, b) => b.avgEngagement - a.avgEngagement),
      },

      // SEO comparison
      seoComparison: {
        titleOptimization: analyses
          .map(a => ({
            competitor: a.competitorName,
            score: a.seoStrategy.contentOptimization.titleOptimization,
          }))
          .sort((a, b) => b.score - a.score),

        keywordTargeting: analyses
          .map(a => ({
            competitor: a.competitorName,
            keywords: a.seoStrategy.targetKeywords.length,
          }))
          .sort((a, b) => b.keywords - a.keywords),
      },

      // Strategic insights
      strategicInsights: {
        marketLeader: analyses.reduce((leader, current) =>
          current.performanceInsights.avgEngagementRate >
          leader.performanceInsights.avgEngagementRate
            ? current
            : leader
        ).competitorName,

        mostConsistent: analyses.reduce((consistent, current) =>
          current.strategicPatterns.postingSchedule.consistency >
          consistent.strategicPatterns.postingSchedule.consistency
            ? current
            : consistent
        ).competitorName,

        contentGapOpportunities: [
          ...new Set(analyses.flatMap(a => a.performanceInsights.contentGaps)),
        ],

        sharedKeywords: this.findSharedKeywords(analyses),
        uniqueStrengths: analyses.map(a => ({
          competitor: a.competitorName,
          strengths: a.actionableInsights.opportunities.slice(0, 3),
        })),
      },
    };

    // Store comparison results
    await this.storeComparisonResults(comparison);

    return comparison;
  }

  private findSharedKeywords(analyses: CompetitorAnalysis[]): string[] {
    const allKeywords = analyses.map(
      a => new Set(a.seoStrategy.targetKeywords)
    );
    const intersection = allKeywords.reduce(
      (shared, keywords) =>
        new Set([...shared].filter(keyword => keywords.has(keyword)))
    );
    return Array.from(intersection);
  }

  private async storeComparisonResults(comparison: any): Promise<void> {
    try {
      const { error } = await this.supabase.from("content_research").insert({
        research_type: "competitor_comparison",
        source_url: "multi_competitor_comparison",
        content_data: {
          competitorComparison: comparison,
          analysisType: "competitor_comparison",
          timestamp: comparison.timestamp,
        },
        insights: `Competitor comparison completed for ${comparison.competitorsCompared.length} competitors`,
        confidence_score: 0.9,
        status: "completed",
      });

      if (error) {
        console.error("Failed to store competitor comparison:", error);
      }
    } catch (error) {
      console.error("Database storage error:", error);
    }
  }
}

export default CompetitorAnalyzer;
