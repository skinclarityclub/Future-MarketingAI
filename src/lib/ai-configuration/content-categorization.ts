// Content Categorisatie en Prioritering Systeem
// Automatische content classificatie voor slimme scheduling

export interface ContentItem {
  id: string;
  title: string;
  content: string;
  platform:
    | "linkedin"
    | "twitter"
    | "facebook"
    | "instagram"
    | "blog"
    | "email";
  contentType?: "article" | "video" | "image" | "poll" | "story" | "newsletter";
  urgency?: "low" | "medium" | "high" | "urgent";
  businessGoal?:
    | "brand_awareness"
    | "lead_generation"
    | "engagement"
    | "conversion"
    | "retention";
  createdAt: Date;
  deadline?: Date;
}

export interface ContentCategory {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  priority: number;
  optimalPlatforms: string[];
  bestPostingTimes: number[];
  contentTypes: string[];
  businessAlignment: string[];
}

export interface ContentClassification {
  contentId: string;
  categories: Array<{
    category: ContentCategory;
    confidence: number;
    reasoning: string[];
  }>;
  suggestedTags: string[];
  detectedContentType: string;
  urgencyScore: number;
  priorityScore: number;
  businessGoalAlignment: {
    primary: string;
    confidence: number;
  };
  optimizationSuggestions: string[];
}

export class ContentCategorizer {
  private categories: Map<string, ContentCategory> = new Map();

  constructor() {
    this.initializeDefaultCategories();
  }

  async classifyContent(content: ContentItem): Promise<ContentClassification> {
    const categoryMatches = this.matchCategories(content);
    const detectedContentType = this.detectContentType(content);
    const urgencyScore = this.calculateUrgencyScore(content);
    const priorityScore = this.calculatePriorityScore(content);
    const businessGoalAlignment = this.detectBusinessGoalAlignment(content);

    return {
      contentId: content.id,
      categories: categoryMatches,
      suggestedTags: [detectedContentType, content.platform],
      detectedContentType,
      urgencyScore,
      priorityScore,
      businessGoalAlignment,
      optimizationSuggestions: [],
    };
  }

  async prioritizeContent(contentItems: ContentItem[]): Promise<
    Array<{
      content: ContentItem;
      classification: ContentClassification;
      finalPriority: number;
      reasoning: string[];
    }>
  > {
    const results = await Promise.all(
      contentItems.map(async content => {
        const classification = await this.classifyContent(content);
        const finalPriority = this.calculateFinalPriority(
          content,
          classification
        );
        const reasoning = this.generatePriorityReasoning(finalPriority);

        return {
          content,
          classification,
          finalPriority,
          reasoning,
        };
      })
    );

    return results.sort((a, b) => b.finalPriority - a.finalPriority);
  }

  private matchCategories(content: ContentItem): Array<{
    category: ContentCategory;
    confidence: number;
    reasoning: string[];
  }> {
    const matches: Array<{
      category: ContentCategory;
      confidence: number;
      reasoning: string[];
    }> = [];

    for (const category of this.categories.values()) {
      const match = this.calculateCategoryMatch(content, category);
      if (match.confidence > 30) {
        matches.push(match);
      }
    }

    return matches.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
  }

  private calculateCategoryMatch(
    content: ContentItem,
    category: ContentCategory
  ): {
    category: ContentCategory;
    confidence: number;
    reasoning: string[];
  } {
    let confidence = 0;
    const reasoning: string[] = [];

    const textToSearch = `${content.title}`.toLowerCase();
    const keywordMatches = category.keywords.filter(keyword =>
      textToSearch.includes(keyword.toLowerCase())
    );

    if (keywordMatches.length > 0) {
      const keywordScore =
        (keywordMatches.length / category.keywords.length) * 40;
      confidence += keywordScore;
      reasoning.push("Gevonden relevante keywords");
    }

    if (category.optimalPlatforms.includes(content.platform)) {
      confidence += 20;
      reasoning.push("Platform is optimaal voor deze categorie");
    }

    if (
      content.businessGoal &&
      category.businessAlignment.includes(content.businessGoal)
    ) {
      confidence += 25;
      reasoning.push("Business goal aligned met categorie");
    }

    return {
      category,
      confidence: Math.min(100, confidence),
      reasoning,
    };
  }

  private detectContentType(content: ContentItem): string {
    if (content.contentType) return content.contentType;

    const text = content.content.toLowerCase();

    if (text.includes("video") || text.includes("watch")) {
      return "video";
    }

    if (text.includes("image") || text.includes("photo")) {
      return "image";
    }

    if (text.includes("poll") || text.includes("vote")) {
      return "poll";
    }

    if (content.platform === "email") {
      return "newsletter";
    }

    if (content.content.length < 280 && content.platform === "instagram") {
      return "story";
    }

    return "article";
  }

  private calculateUrgencyScore(content: ContentItem): number {
    let score = 0;

    if (content.urgency) {
      switch (content.urgency) {
        case "urgent":
          score += 40;
          break;
        case "high":
          score += 30;
          break;
        case "medium":
          score += 20;
          break;
        case "low":
          score += 10;
          break;
      }
    }

    if (content.deadline) {
      const now = new Date();
      const timeToDeadline = content.deadline.getTime() - now.getTime();
      const hoursToDeadline = timeToDeadline / (1000 * 60 * 60);

      if (hoursToDeadline < 24) score += 30;
      else if (hoursToDeadline < 72) score += 20;
      else if (hoursToDeadline < 168) score += 10;
    }

    return Math.min(100, score);
  }

  private calculatePriorityScore(content: ContentItem): number {
    let score = 0;

    if (content.businessGoal) {
      switch (content.businessGoal) {
        case "conversion":
          score += 30;
          break;
        case "lead_generation":
          score += 25;
          break;
        case "engagement":
          score += 20;
          break;
        case "brand_awareness":
          score += 15;
          break;
        case "retention":
          score += 20;
          break;
      }
    }

    switch (content.platform) {
      case "linkedin":
        score += 25;
        break;
      case "email":
        score += 30;
        break;
      case "blog":
        score += 20;
        break;
      case "facebook":
        score += 15;
        break;
      case "twitter":
        score += 15;
        break;
      case "instagram":
        score += 18;
        break;
    }

    return Math.min(100, score);
  }

  private detectBusinessGoalAlignment(content: ContentItem): {
    primary: string;
    confidence: number;
  } {
    if (content.businessGoal) {
      return {
        primary: content.businessGoal,
        confidence: 90,
      };
    }

    const text = `${content.title} ${content.content}`.toLowerCase();

    if (
      text.includes("buy") ||
      text.includes("purchase") ||
      text.includes("sale")
    ) {
      return { primary: "conversion", confidence: 75 };
    }

    if (
      text.includes("download") ||
      text.includes("subscribe") ||
      text.includes("register")
    ) {
      return { primary: "lead_generation", confidence: 70 };
    }

    if (
      text.includes("comment") ||
      text.includes("share") ||
      text.includes("like")
    ) {
      return { primary: "engagement", confidence: 65 };
    }

    return { primary: "brand_awareness", confidence: 50 };
  }

  private calculateFinalPriority(
    content: ContentItem,
    classification: ContentClassification
  ): number {
    return (
      classification.urgencyScore * 0.4 + classification.priorityScore * 0.6
    );
  }

  private generatePriorityReasoning(finalPriority: number): string[] {
    if (finalPriority > 80) {
      return ["Kritieke prioriteit - onmiddellijke scheduling aanbevolen"];
    } else if (finalPriority > 60) {
      return ["Hoge prioriteit - schedule binnen 24 uur"];
    } else if (finalPriority > 40) {
      return ["Gemiddelde prioriteit - schedule binnen 3 dagen"];
    } else {
      return ["Lage prioriteit - flexibele scheduling mogelijk"];
    }
  }

  private initializeDefaultCategories(): void {
    const defaultCategories: ContentCategory[] = [
      {
        id: "tech-innovation",
        name: "Tech & Innovatie",
        description: "Technologie trends en innovaties",
        keywords: [
          "technology",
          "innovation",
          "ai",
          "digital",
          "tech",
          "software",
        ],
        priority: 8,
        optimalPlatforms: ["linkedin", "twitter", "blog"],
        bestPostingTimes: [9, 14, 16],
        contentTypes: ["article", "video"],
        businessAlignment: ["brand_awareness", "lead_generation"],
      },
      {
        id: "business-strategy",
        name: "Business Strategie",
        description: "Zakelijke strategie en management",
        keywords: [
          "strategy",
          "business",
          "growth",
          "management",
          "leadership",
        ],
        priority: 9,
        optimalPlatforms: ["linkedin", "email", "blog"],
        bestPostingTimes: [8, 12, 15],
        contentTypes: ["article", "newsletter"],
        businessAlignment: ["conversion", "lead_generation"],
      },
      {
        id: "marketing-tips",
        name: "Marketing Tips",
        description: "Marketing strategieën en tips",
        keywords: ["marketing", "social media", "content", "branding"],
        priority: 7,
        optimalPlatforms: ["linkedin", "instagram", "facebook"],
        bestPostingTimes: [10, 14, 19],
        contentTypes: ["article", "image", "video"],
        businessAlignment: ["engagement", "brand_awareness"],
      },
    ];

    defaultCategories.forEach(category => {
      this.categories.set(category.id, category);
    });
  }

  getCategories(): ContentCategory[] {
    return Array.from(this.categories.values());
  }
}

export function createContentCategorizer(): ContentCategorizer {
  return new ContentCategorizer();
}
