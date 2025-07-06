// Content Optimization Engine
// AI-powered content optimization per platform

import {
  SocialPlatform,
  PostContent,
  MediaItem,
  PlatformLimits,
  getPlatformLimits,
} from "./index";

export interface OptimizationRule {
  id: string;
  platform: SocialPlatform;
  type: "text" | "media" | "hashtags" | "timing" | "format";
  priority: "high" | "medium" | "low";
  description: string;
  apply: (content: PostContent) => PostContent;
  validate: (content: PostContent) => boolean;
  suggestion?: string;
}

export interface OptimizationResult {
  originalContent: PostContent;
  optimizedContent: PostContent;
  appliedRules: string[];
  suggestions: string[];
  score: number; // 0-100 optimization score
  warnings: string[];
  platformSpecific: {
    textLength: { original: number; optimized: number; limit: number };
    hashtagCount: { original: number; optimized: number; limit: number };
    mediaCount: { original: number; optimized: number; limit: number };
  };
}

export interface MediaOptimization {
  resize: boolean;
  format: string;
  quality: number;
  dimensions: { width: number; height: number };
  crop?: { x: number; y: number; width: number; height: number };
}

export interface AIOptimizationSuggestion {
  type: "engagement" | "reach" | "conversion" | "tone" | "timing";
  suggestion: string;
  confidence: number;
  impact: "high" | "medium" | "low";
  reasoning: string;
}

export class ContentOptimizer {
  private rules: Map<string, OptimizationRule> = new Map();
  private platformPreferences: Map<SocialPlatform, any> = new Map();

  constructor() {
    this.initializeOptimizationRules();
    this.initializePlatformPreferences();
  }

  /**
   * Optimaliseer content voor specifiek platform
   */
  optimizeForPlatform(
    content: PostContent,
    platform: SocialPlatform
  ): OptimizationResult {
    const originalContent = { ...content };
    let optimizedContent = { ...content };
    const appliedRules: string[] = [];
    const suggestions: string[] = [];
    const warnings: string[] = [];

    const limits = getPlatformLimits(platform);

    // Pas platform-specifieke rules toe
    const platformRules = Array.from(this.rules.values())
      .filter(rule => rule.platform === platform)
      .sort(
        (a, b) =>
          this.getPriorityWeight(a.priority) -
          this.getPriorityWeight(b.priority)
      );

    for (const rule of platformRules) {
      if (rule.validate(optimizedContent)) {
        optimizedContent = rule.apply(optimizedContent);
        appliedRules.push(rule.id);

        if (rule.suggestion) {
          suggestions.push(rule.suggestion);
        }
      }
    }

    // Valideer limieten en voeg warnings toe
    if (
      optimizedContent.text &&
      optimizedContent.text.length > limits.textLength.max
    ) {
      warnings.push(
        `Text length (${optimizedContent.text.length}) exceeds platform limit (${limits.textLength.max})`
      );
    }

    if (
      optimizedContent.hashtags &&
      optimizedContent.hashtags.length > limits.hashtagLimits.max
    ) {
      warnings.push(
        `Hashtag count (${optimizedContent.hashtags.length}) exceeds platform limit (${limits.hashtagLimits.max})`
      );
    }

    // Bereken optimization score
    const score = this.calculateOptimizationScore(
      optimizedContent,
      platform,
      appliedRules
    );

    return {
      originalContent,
      optimizedContent,
      appliedRules,
      suggestions,
      score,
      warnings,
      platformSpecific: {
        textLength: {
          original: originalContent.text?.length || 0,
          optimized: optimizedContent.text?.length || 0,
          limit: limits.textLength.max,
        },
        hashtagCount: {
          original: originalContent.hashtags?.length || 0,
          optimized: optimizedContent.hashtags?.length || 0,
          limit: limits.hashtagLimits.max,
        },
        mediaCount: {
          original: originalContent.media?.length || 0,
          optimized: optimizedContent.media?.length || 0,
          limit: limits.mediaLimits.images.maxCount,
        },
      },
    };
  }

  /**
   * Optimaliseer media voor platform
   */
  optimizeMedia(media: MediaItem, platform: SocialPlatform): MediaOptimization {
    const limits = getPlatformLimits(platform);
    const mediaLimits =
      media.type === "image"
        ? limits.mediaLimits.images
        : limits.mediaLimits.videos;

    const optimization: MediaOptimization = {
      resize: false,
      format: media.format || (media.type === "image" ? "jpg" : "mp4"),
      quality: 85,
      dimensions: media.dimensions || { width: 1080, height: 1080 },
    };

    // Check of resize nodig is
    if (media.dimensions) {
      const { width, height } = media.dimensions;
      const recommended = mediaLimits.dimensions.recommended;

      if (
        recommended &&
        (width !== recommended.width || height !== recommended.height)
      ) {
        optimization.resize = true;
        optimization.dimensions = recommended;
      } else if (
        width > mediaLimits.dimensions.max.width ||
        height > mediaLimits.dimensions.max.height
      ) {
        optimization.resize = true;

        // Behoud aspect ratio
        const aspectRatio = width / height;
        const maxWidth = mediaLimits.dimensions.max.width;
        const maxHeight = mediaLimits.dimensions.max.height;

        if (aspectRatio > 1) {
          // Landscape
          optimization.dimensions = {
            width: Math.min(width, maxWidth),
            height: Math.min(height, maxWidth / aspectRatio),
          };
        } else {
          // Portrait or square
          optimization.dimensions = {
            width: Math.min(width, maxHeight * aspectRatio),
            height: Math.min(height, maxHeight),
          };
        }
      }
    }

    // Platform-specifieke optimalisaties
    switch (platform) {
      case "instagram":
        // Instagram werkt het beste met square of 4:5 ratio
        if (media.type === "image") {
          optimization.dimensions = { width: 1080, height: 1080 };
          optimization.resize = true;
        }
        break;

      case "twitter":
        // Twitter prefers 16:9 for optimal display
        if (media.type === "image") {
          optimization.dimensions = { width: 1200, height: 675 };
          optimization.resize = true;
        }
        break;

      case "linkedin":
        // LinkedIn business focus - professional dimensions
        if (media.type === "image") {
          optimization.dimensions = { width: 1200, height: 627 };
          optimization.resize = true;
        }
        break;

      case "tiktok":
        // TikTok is vertical video platform
        if (media.type === "video") {
          optimization.dimensions = { width: 1080, height: 1920 };
          optimization.resize = true;
        }
        break;
    }

    return optimization;
  }

  /**
   * Genereer AI-powered optimization suggestions
   */
  generateAISuggestions(
    content: PostContent,
    platform: SocialPlatform
  ): AIOptimizationSuggestion[] {
    const suggestions: AIOptimizationSuggestion[] = [];

    // Engagement suggestions
    if (!content.hashtags || content.hashtags.length === 0) {
      suggestions.push({
        type: "engagement",
        suggestion:
          "Voeg relevante hashtags toe om de zichtbaarheid te vergroten",
        confidence: 0.9,
        impact: "high",
        reasoning:
          "Hashtags verhogen de discoverability met gemiddeld 12.6% meer engagement",
      });
    }

    // Platform-specific suggestions
    switch (platform) {
      case "linkedin":
        if (content.text && content.text.length < 100) {
          suggestions.push({
            type: "engagement",
            suggestion:
              "LinkedIn posts presteren beter met langere, meer uitgebreide content (100-300 woorden)",
            confidence: 0.8,
            impact: "medium",
            reasoning:
              "Langere LinkedIn posts krijgen gemiddeld 40% meer engagement",
          });
        }
        break;

      case "twitter":
        if (content.text && content.text.length > 240) {
          suggestions.push({
            type: "engagement",
            suggestion:
              "Kortere tweets (onder 240 karakters) krijgen meer engagement",
            confidence: 0.85,
            impact: "high",
            reasoning:
              "Tweets onder 240 karakters hebben 17% hogere engagement rate",
          });
        }
        break;

      case "instagram":
        if (!content.media || content.media.length === 0) {
          suggestions.push({
            type: "engagement",
            suggestion:
              "Instagram is een visueel platform - voeg afbeeldingen of videos toe",
            confidence: 0.95,
            impact: "high",
            reasoning:
              "Visual content krijgt 650% meer engagement dan text-only posts",
          });
        }
        break;
    }

    // Timing suggestions
    const currentHour = new Date().getHours();
    const optimalTimes = this.getOptimalPostingTimes(platform);

    if (!optimalTimes.includes(currentHour)) {
      suggestions.push({
        type: "timing",
        suggestion: `Optimale posting tijden voor ${platform}: ${optimalTimes.join(", ")}:00 uur`,
        confidence: 0.7,
        impact: "medium",
        reasoning:
          "Posts op optimale tijden krijgen gemiddeld 23% meer engagement",
      });
    }

    return suggestions;
  }

  /**
   * Batch optimization voor multiple platforms
   */
  optimizeForMultiplePlatforms(
    content: PostContent,
    platforms: SocialPlatform[]
  ): Map<SocialPlatform, OptimizationResult> {
    const results = new Map<SocialPlatform, OptimizationResult>();

    platforms.forEach(platform => {
      const result = this.optimizeForPlatform(content, platform);
      results.set(platform, result);
    });

    return results;
  }

  // Private helper methods

  private initializeOptimizationRules(): void {
    // LinkedIn optimization rules
    this.addOptimizationRule({
      id: "linkedin-text-optimization",
      platform: "linkedin",
      type: "text",
      priority: "high",
      description: "Optimaliseer text length voor LinkedIn",
      apply: content => {
        if (content.text && content.text.length > 3000) {
          return {
            ...content,
            text: content.text.substring(0, 2997) + "...",
          };
        }
        return content;
      },
      validate: content => !!(content.text && content.text.length > 3000),
      suggestion: "Text werd ingekort voor LinkedIn limieten",
    });

    // Twitter optimization rules
    this.addOptimizationRule({
      id: "twitter-text-optimization",
      platform: "twitter",
      type: "text",
      priority: "high",
      description: "Optimaliseer text length voor Twitter",
      apply: content => {
        if (content.text && content.text.length > 280) {
          return {
            ...content,
            text: content.text.substring(0, 277) + "...",
          };
        }
        return content;
      },
      validate: content => !!(content.text && content.text.length > 280),
      suggestion: "Text werd ingekort voor Twitter character limit",
    });
  }

  private initializePlatformPreferences(): void {
    this.platformPreferences.set("linkedin", {
      preferredHashtagCount: 5,
      optimalTextLength: 1300,
      bestPostingTimes: [8, 12, 17],
      tonePreference: "professional",
    });

    this.platformPreferences.set("twitter", {
      preferredHashtagCount: 3,
      optimalTextLength: 240,
      bestPostingTimes: [9, 15, 18],
      tonePreference: "conversational",
    });

    this.platformPreferences.set("instagram", {
      preferredHashtagCount: 10,
      optimalTextLength: 1000,
      bestPostingTimes: [11, 14, 17],
      tonePreference: "engaging",
    });
  }

  private calculateOptimizationScore(
    content: PostContent,
    platform: SocialPlatform,
    appliedRules: string[]
  ): number {
    let score = 100;
    const limits = getPlatformLimits(platform);

    // Penaliseer overschrijding van limieten
    if (content.text && content.text.length > limits.textLength.max) {
      score -= 30;
    }

    if (
      content.hashtags &&
      content.hashtags.length > limits.hashtagLimits.max
    ) {
      score -= 20;
    }

    // Bonus voor applied rules
    score += appliedRules.length * 5;

    return Math.max(0, Math.min(100, score));
  }

  private getPriorityWeight(priority: "high" | "medium" | "low"): number {
    switch (priority) {
      case "high":
        return 1;
      case "medium":
        return 2;
      case "low":
        return 3;
      default:
        return 2;
    }
  }

  private getOptimalPostingTimes(platform: SocialPlatform): number[] {
    const preferences = this.platformPreferences.get(platform);
    return preferences?.bestPostingTimes || [9, 12, 15];
  }

  addOptimizationRule(rule: OptimizationRule): void {
    this.rules.set(rule.id, rule);
  }
}

/**
 * Factory functions
 */
export function createContentOptimizer(): ContentOptimizer {
  return new ContentOptimizer();
}
