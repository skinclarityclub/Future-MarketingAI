/**
 * Content Ideation Engine
 * Task 36.19: Content Ideation Engine
 * AI system to generate content ideas based on trends and competitor analysis
 */

import { createClient } from "@supabase/supabase-js";
import TrendDetector, { TrendAnalysis } from "./trend-detector";
import CompetitorAnalyzer, { CompetitorAnalysis } from "./competitor-analyzer";

export interface ContentIdea {
  id: string;
  title: string;
  description: string;
  category:
    | "blog"
    | "social"
    | "video"
    | "infographic"
    | "podcast"
    | "webinar"
    | "ebook"
    | "case-study";
  targetAudience: string[];
  contentType:
    | "educational"
    | "promotional"
    | "entertaining"
    | "news"
    | "thought-leadership";
  format: string;
  estimatedLength: {
    words?: number;
    duration?: number;
  };
  keywords: string[];
  hashtags: string[];
  competitorGap: boolean;
  trendAlignment: {
    trendKeyword: string;
    trendStrength: number;
    timing: "immediate" | "soon" | "planned";
  };
  seoScore: number;
  viralPotential: number;
  engagementPrediction: {
    expectedViews: number;
    expectedShares: number;
    expectedComments: number;
  };
  difficulty: "easy" | "medium" | "hard";
  estimatedHours: number;
  requiredResources: string[];
  suggestedOutline: string[];
  bestPublishTime: {
    dayOfWeek: string;
    timeOfDay: string;
  };
  distributionChannels: string[];
  sourceInsights: string[];
  confidence: number;
  priority: "low" | "medium" | "high" | "critical";
  generatedAt: Date;
  expiresAt?: Date;
}

export interface ContentStrategy {
  timeframe: "week" | "month" | "quarter";
  totalIdeas: number;
  categories: Array<{
    category: string;
    count: number;
    priority: string;
  }>;
  contentMix: {
    educational: number;
    promotional: number;
    entertaining: number;
    news: number;
    thoughtLeadership: number;
  };
  keyThemes: string[];
  competitorGaps: string[];
  trendOpportunities: string[];
  timeline: Array<{
    week: number;
    suggestedContent: ContentIdea[];
  }>;
}

export interface IdeationRequest {
  targetAudience?: string[];
  contentTypes?: ContentIdea["category"][];
  keywords?: string[];
  competitorFocus?: string[];
  timeframe?: "immediate" | "short-term" | "long-term";
  quantity?: number;
  difficulty?: ContentIdea["difficulty"][];
  includeCompetitorGaps?: boolean;
  includeTrendingTopics?: boolean;
}

export class ContentIdeationEngine {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );

  private trendDetector: TrendDetector;
  private competitorAnalyzer: CompetitorAnalyzer;

  private readonly CONFIG = {
    maxIdeasPerRequest: 50,
    defaultQuantity: 10,
    confidenceThreshold: 0.6,
    contentTemplates: {
      blog: {
        minWords: 800,
        maxWords: 3000,
        estimatedHours: 4,
        seoWeight: 0.8,
      },
      social: {
        minWords: 50,
        maxWords: 280,
        estimatedHours: 0.5,
        seoWeight: 0.3,
      },
      video: {
        minDuration: 5,
        maxDuration: 30,
        estimatedHours: 8,
        seoWeight: 0.7,
      },
      infographic: { estimatedHours: 6, seoWeight: 0.6 },
      podcast: {
        minDuration: 20,
        maxDuration: 60,
        estimatedHours: 10,
        seoWeight: 0.5,
      },
    },
  };

  constructor() {
    this.trendDetector = new TrendDetector();
    this.competitorAnalyzer = new CompetitorAnalyzer();
    this.validateConfiguration();
  }

  private validateConfiguration(): void {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      console.warn(
        "Supabase configuration missing for content ideation engine"
      );
    }
  }

  async generateContentIdeas(
    request: IdeationRequest = {}
  ): Promise<ContentIdea[]> {
    console.log("Starting content ideation process...");

    try {
      const quantity = Math.min(
        request.quantity || this.CONFIG.defaultQuantity,
        this.CONFIG.maxIdeasPerRequest
      );

      const [trendData, competitorData] = await Promise.all([
        this.gatherTrendInsights(request),
        this.gatherCompetitorInsights(request),
      ]);

      const ideas = await this.generateIdeasFromInsights(
        trendData,
        competitorData,
        request,
        quantity
      );
      const enhancedIdeas = await Promise.all(
        ideas.map(idea =>
          this.enhanceContentIdea(idea, trendData, competitorData)
        )
      );

      const validIdeas = enhancedIdeas
        .filter(idea => idea.confidence >= this.CONFIG.confidenceThreshold)
        .sort(
          (a, b) =>
            this.calculatePriorityScore(b) - this.calculatePriorityScore(a)
        )
        .slice(0, quantity);

      await this.storeContentIdeas(validIdeas);
      console.log(
        `Content ideation completed: ${validIdeas.length} ideas generated`
      );

      return validIdeas;
    } catch (error) {
      console.error("Content ideation failed:", error);
      throw error;
    }
  }

  async generateContentStrategy(
    timeframe: "week" | "month" | "quarter" = "month"
  ): Promise<ContentStrategy> {
    console.log(`Generating content strategy for ${timeframe}...`);

    const ideaCount =
      timeframe === "week" ? 10 : timeframe === "month" ? 30 : 90;
    const ideas = await this.generateContentIdeas({
      quantity: ideaCount,
      includeCompetitorGaps: true,
      includeTrendingTopics: true,
    });

    return {
      timeframe,
      totalIdeas: ideas.length,
      categories: this.categorizeIdeas(ideas),
      contentMix: this.analyzeContentMix(ideas),
      keyThemes: this.extractKeyThemes(ideas),
      competitorGaps: this.identifyCompetitorGaps(ideas),
      trendOpportunities: this.identifyTrendOpportunities(ideas),
      timeline: this.createContentTimeline(ideas, timeframe),
    };
  }

  private async gatherTrendInsights(
    request: IdeationRequest
  ): Promise<TrendAnalysis[]> {
    try {
      const trends = await this.trendDetector.detectTrends(request.keywords);
      let filteredTrends = trends;

      if (request.timeframe === "immediate") {
        filteredTrends = trends.filter(
          t => t.momentum === "emerging" || t.momentum === "rising"
        );
      }

      return filteredTrends.slice(0, 20);
    } catch (error) {
      console.error("Error gathering trend insights:", error);
      return [];
    }
  }

  private async gatherCompetitorInsights(
    request: IdeationRequest
  ): Promise<CompetitorAnalysis[]> {
    try {
      const { data: analyses, error } = await this.supabase
        .from("content_research")
        .select("*")
        .eq("research_type", "competitor_analysis")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error || !analyses) return [];

      return analyses
        .map(item => item.content_data?.competitorAnalysis)
        .filter(Boolean)
        .slice(0, 5);
    } catch (error) {
      console.error("Error gathering competitor insights:", error);
      return [];
    }
  }

  private async generateIdeasFromInsights(
    trends: TrendAnalysis[],
    competitors: CompetitorAnalysis[],
    request: IdeationRequest,
    quantity: number
  ): Promise<ContentIdea[]> {
    const ideas: ContentIdea[] = [];

    const trendIdeas = this.generateTrendBasedIdeas(trends, request);
    ideas.push(...trendIdeas);

    const gapIdeas = this.generateCompetitorGapIdeas(competitors, request);
    ideas.push(...gapIdeas);

    const evergreenIdeas = this.generateEvergreenIdeas(request);
    ideas.push(...evergreenIdeas);

    return ideas.slice(0, quantity * 2);
  }

  private generateTrendBasedIdeas(
    trends: TrendAnalysis[],
    request: IdeationRequest
  ): ContentIdea[] {
    const ideas: ContentIdea[] = [];

    trends.slice(0, 5).forEach((trend, index) => {
      const baseIdea: Partial<ContentIdea> = {
        id: `trend-idea-${Date.now()}-${index}`,
        keywords: [trend.keyword],
        trendAlignment: {
          trendKeyword: trend.keyword,
          trendStrength: trend.trendStrength,
          timing: trend.momentum === "emerging" ? "immediate" : "soon",
        },
        competitorGap: false,
        sourceInsights: [`Based on trending topic: ${trend.keyword}`],
        generatedAt: new Date(),
      };

      const contentVariations = [
        {
          ...baseIdea,
          title: `The Ultimate Guide to ${trend.keyword}`,
          description: `Comprehensive guide covering everything about ${trend.keyword}`,
          category: "blog" as const,
          contentType: "educational" as const,
          format: "Long-form guide",
          difficulty: "medium" as const,
        },
        {
          ...baseIdea,
          title: `${trend.keyword}: What You Need to Know Right Now`,
          description: `Quick insights about the trending ${trend.keyword}`,
          category: "social" as const,
          contentType: "news" as const,
          format: "Social media series",
          difficulty: "easy" as const,
        },
      ];

      ideas.push(
        ...contentVariations.map(variation =>
          this.completeContentIdea(variation)
        )
      );
    });

    return ideas;
  }

  private generateCompetitorGapIdeas(
    competitors: CompetitorAnalysis[],
    request: IdeationRequest
  ): ContentIdea[] {
    const ideas: ContentIdea[] = [];

    competitors.forEach((competitor, index) => {
      competitor.actionableInsights?.contentIdeas
        ?.slice(0, 2)
        .forEach((contentIdea, ideaIndex) => {
          const idea: Partial<ContentIdea> = {
            id: `gap-idea-${Date.now()}-${index}-${ideaIndex}`,
            title: contentIdea,
            description: `Content opportunity from competitor analysis of ${competitor.competitorName}`,
            category: "blog" as const,
            contentType: "educational" as const,
            competitorGap: true,
            keywords: competitor.seoStrategy?.targetKeywords?.slice(0, 3) || [],
            sourceInsights: [
              `Competitor gap from ${competitor.competitorName}`,
            ],
            generatedAt: new Date(),
          };

          ideas.push(this.completeContentIdea(idea));
        });
    });

    return ideas;
  }

  private generateEvergreenIdeas(request: IdeationRequest): ContentIdea[] {
    const evergreenTopics = [
      "How to improve productivity in remote work",
      "Best practices for digital marketing",
      "Essential tools for business growth",
    ];

    return evergreenTopics.map((topic, index) => {
      const idea: Partial<ContentIdea> = {
        id: `evergreen-idea-${Date.now()}-${index}`,
        title: topic,
        description: `Timeless advice for ${topic.toLowerCase()}`,
        category: "blog" as const,
        contentType: "educational" as const,
        competitorGap: false,
        keywords: topic.toLowerCase().split(" ").slice(0, 3),
        sourceInsights: ["Evergreen content based on best practices"],
        generatedAt: new Date(),
      };

      return this.completeContentIdea(idea);
    });
  }

  private completeContentIdea(partial: Partial<ContentIdea>): ContentIdea {
    const category = partial.category || "blog";
    const template =
      this.CONFIG.contentTemplates[
        category as keyof typeof this.CONFIG.contentTemplates
      ] || this.CONFIG.contentTemplates["blog"];

    return {
      id: partial.id || `idea-${Date.now()}`,
      title: partial.title || "Untitled Content Idea",
      description: partial.description || "Content idea description",
      category,
      targetAudience: partial.targetAudience || ["general-audience"],
      contentType: partial.contentType || "educational",
      format: partial.format || "Standard format",
      estimatedLength: {
        words: "minWords" in template ? template.minWords : 500,
        duration: "minDuration" in template ? template.minDuration : undefined,
      },
      keywords: partial.keywords || [],
      hashtags: this.generateHashtags(partial.keywords || []),
      competitorGap: partial.competitorGap || false,
      trendAlignment: partial.trendAlignment || {
        trendKeyword: "",
        trendStrength: 0,
        timing: "planned",
      },
      seoScore: 70,
      viralPotential: 50,
      engagementPrediction: {
        expectedViews: 1000,
        expectedShares: 50,
        expectedComments: 25,
      },
      difficulty: partial.difficulty || "medium",
      estimatedHours: template.estimatedHours || 4,
      requiredResources: ["Writer", "Designer", "SEO specialist"],
      suggestedOutline: this.generateOutline(
        partial.title || "",
        partial.contentType || "educational"
      ),
      bestPublishTime: {
        dayOfWeek: "Tuesday",
        timeOfDay: "10:00 AM",
      },
      distributionChannels: this.suggestDistributionChannels(category),
      sourceInsights: partial.sourceInsights || ["AI-generated content idea"],
      confidence: 0.7,
      priority: "medium",
      generatedAt: partial.generatedAt || new Date(),
      expiresAt: partial.expiresAt,
    };
  }

  private async enhanceContentIdea(
    idea: ContentIdea,
    trends: TrendAnalysis[],
    competitors: CompetitorAnalysis[]
  ): Promise<ContentIdea> {
    idea.seoScore = this.calculateSEOScore(idea, trends);
    idea.viralPotential = this.calculateViralPotential(idea, trends);
    idea.confidence = this.calculateIdeaConfidence(idea, trends, competitors);
    idea.priority = this.determinePriority(idea);
    return idea;
  }

  private calculateSEOScore(
    idea: ContentIdea,
    trends: TrendAnalysis[]
  ): number {
    let score = 50;
    const relevantTrends = trends.filter(t =>
      idea.keywords.some(k => t.keyword.toLowerCase().includes(k.toLowerCase()))
    );
    score += relevantTrends.length * 10;
    if (idea.category === "blog") score += 20;
    if (idea.contentType === "educational") score += 15;
    score += Math.min(idea.keywords.length * 5, 20);
    return Math.min(100, score);
  }

  private calculateViralPotential(
    idea: ContentIdea,
    trends: TrendAnalysis[]
  ): number {
    let potential = 30;
    if (idea.trendAlignment.timing === "immediate") potential += 30;
    if (idea.trendAlignment.trendStrength > 70) potential += 20;
    if (idea.category === "video") potential += 25;
    if (idea.competitorGap) potential += 15;
    return Math.min(100, potential);
  }

  private calculateIdeaConfidence(
    idea: ContentIdea,
    trends: TrendAnalysis[],
    competitors: CompetitorAnalysis[]
  ): number {
    let confidence = 0.5;
    if (idea.sourceInsights.length > 1) confidence += 0.1;
    if (idea.competitorGap) confidence += 0.15;
    if (idea.trendAlignment.trendStrength > 70) confidence += 0.2;
    if (idea.keywords.length >= 3) confidence += 0.1;
    return Math.min(1, confidence);
  }

  private determinePriority(idea: ContentIdea): ContentIdea["priority"] {
    const score = this.calculatePriorityScore(idea);
    if (score >= 80) return "critical";
    if (score >= 60) return "high";
    if (score >= 40) return "medium";
    return "low";
  }

  private calculatePriorityScore(idea: ContentIdea): number {
    let score = 0;
    score += idea.trendAlignment.trendStrength * 0.3;
    if (idea.trendAlignment.timing === "immediate") score += 20;
    score += idea.seoScore * 0.2;
    score += idea.viralPotential * 0.3;
    if (idea.competitorGap) score += 15;
    score += idea.confidence * 20;
    return Math.round(score);
  }

  private generateHashtags(keywords: string[]): string[] {
    return keywords
      .map(keyword => "#" + keyword.replace(/\s+/g, "").toLowerCase())
      .slice(0, 5);
  }

  private generateOutline(title: string, contentType: string): string[] {
    const baseOutlines: Record<string, string[]> = {
      educational: [
        "Introduction and Problem Statement",
        "Key Concepts and Definitions",
        "Step-by-Step Implementation",
        "Best Practices and Tips",
        "Conclusion and Next Steps",
      ],
      news: [
        "Breaking News Summary",
        "Background and Context",
        "Impact Analysis",
        "What This Means for You",
      ],
    };
    return baseOutlines[contentType] || baseOutlines["educational"];
  }

  private suggestDistributionChannels(
    category: ContentIdea["category"]
  ): string[] {
    const channelMap: Record<string, string[]> = {
      blog: ["Website", "LinkedIn", "Medium", "Email Newsletter"],
      social: ["Twitter", "LinkedIn", "Facebook", "Instagram"],
      video: ["YouTube", "LinkedIn", "TikTok", "Website"],
      infographic: ["Pinterest", "LinkedIn", "Website", "Social Media"],
      podcast: ["Spotify", "Apple Podcasts", "Website", "YouTube"],
      webinar: ["Zoom", "LinkedIn", "Website", "Email"],
      ebook: ["Website", "LinkedIn", "Email Newsletter", "Content Gates"],
      "case-study": ["Website", "LinkedIn", "Sales Materials", "Email"],
    };
    return channelMap[category] || channelMap["blog"];
  }

  private categorizeIdeas(ideas: ContentIdea[]) {
    const categories: Record<string, number> = {};
    ideas.forEach(idea => {
      categories[idea.category] = (categories[idea.category] || 0) + 1;
    });
    return Object.entries(categories)
      .map(([category, count]) => ({
        category,
        count,
        priority: count > ideas.length * 0.3 ? "high" : "low",
      }))
      .sort((a, b) => b.count - a.count);
  }

  private analyzeContentMix(ideas: ContentIdea[]) {
    const total = ideas.length;
    const types = {
      educational: 0,
      promotional: 0,
      entertaining: 0,
      news: 0,
      thoughtLeadership: 0,
    };

    ideas.forEach(idea => {
      if (idea.contentType === "thought-leadership") types.thoughtLeadership++;
      else types[idea.contentType]++;
    });

    return {
      educational: Math.round((types.educational / total) * 100),
      promotional: Math.round((types.promotional / total) * 100),
      entertaining: Math.round((types.entertaining / total) * 100),
      news: Math.round((types.news / total) * 100),
      thoughtLeadership: Math.round((types.thoughtLeadership / total) * 100),
    };
  }

  private extractKeyThemes(ideas: ContentIdea[]): string[] {
    const themes: Record<string, number> = {};
    ideas.forEach(idea => {
      idea.keywords.forEach(keyword => {
        themes[keyword] = (themes[keyword] || 0) + 1;
      });
    });
    return Object.entries(themes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([theme]) => theme);
  }

  private identifyCompetitorGaps(ideas: ContentIdea[]): string[] {
    return ideas
      .filter(idea => idea.competitorGap)
      .map(idea => idea.title)
      .slice(0, 5);
  }

  private identifyTrendOpportunities(ideas: ContentIdea[]): string[] {
    return ideas
      .filter(idea => idea.trendAlignment.timing === "immediate")
      .map(idea => idea.trendAlignment.trendKeyword)
      .slice(0, 5);
  }

  private createContentTimeline(
    ideas: ContentIdea[],
    timeframe: "week" | "month" | "quarter"
  ) {
    const weeks = timeframe === "week" ? 1 : timeframe === "month" ? 4 : 12;
    const timeline = [];

    for (let week = 1; week <= weeks; week++) {
      const weekIdeas = ideas
        .filter(idea => {
          if (idea.trendAlignment.timing === "immediate") return week <= 2;
          if (idea.priority === "critical") return week <= 3;
          return true;
        })
        .slice((week - 1) * 3, week * 3);

      timeline.push({ week, suggestedContent: weekIdeas });
    }
    return timeline;
  }

  private async storeContentIdeas(ideas: ContentIdea[]): Promise<void> {
    try {
      const insertData = ideas.map(idea => ({
        research_type: "keyword_research",
        title: idea.title,
        description: idea.description,
        research_query: `Content idea: ${idea.title}`,
        research_results: {
          contentIdea: idea,
          ideationType: "ai_generated",
          timestamp: idea.generatedAt,
        },
        // Support both old and new schema formats
        content_data: {
          contentIdea: idea,
          ideationType: "ai_generated",
          timestamp: idea.generatedAt,
        },
        source_url: `idea:${idea.id}`,
        insights: `Content idea: ${idea.title} (${idea.category}, ${idea.priority} priority)`,
        confidence_score: Math.round(idea.confidence * 100),
        ai_generated: true,
        ai_model_used: "content-ideation-engine",
        content_suggestions: [idea.title],
        target_platforms: idea.distributionChannels || [],
        status: "generated",
      }));

      const { error } = await this.supabase
        .from("content_research")
        .insert(insertData);

      if (error) {
        console.error("Failed to store content ideas:", error);
      }
    } catch (error) {
      console.error("Database storage error:", error);
    }
  }

  async getStoredContentIdeas(
    filters: {
      category?: string;
      priority?: string;
      limit?: number;
    } = {}
  ): Promise<ContentIdea[]> {
    try {
      let query = this.supabase
        .from("content_research")
        .select("*")
        .eq("research_type", "content_ideation")
        .order("created_at", { ascending: false });

      if (filters.limit) query = query.limit(filters.limit);

      const { data, error } = await query;
      if (error)
        throw new Error(`Failed to fetch content ideas: ${error.message}`);

      const ideas =
        data?.map(item => item.content_data?.contentIdea).filter(Boolean) || [];
      let filteredIdeas = ideas;

      if (filters.category) {
        filteredIdeas = filteredIdeas.filter(
          idea => idea.category === filters.category
        );
      }
      if (filters.priority) {
        filteredIdeas = filteredIdeas.filter(
          idea => idea.priority === filters.priority
        );
      }

      return filteredIdeas;
    } catch (error) {
      console.error("Error fetching stored content ideas:", error);
      return [];
    }
  }
}

export default ContentIdeationEngine;
