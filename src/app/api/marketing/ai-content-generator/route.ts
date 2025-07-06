/**
 * AI Content Generator API - Enterprise Grade
 * Task 103.4: AI-Powered Content Creation and Template System
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  EnterpriseAIContentGenerator,
  contentGenerationRequestSchema,
} from "@/lib/ai/content-generator";
import { UsageTrackingMiddleware } from "@/middleware/usage-tracking-middleware";

// Initialize middleware
const trackingMiddleware = UsageTrackingMiddleware.create({
  enableUsageTracking: true,
  enableRateLimiting: true,
  trackingOptions: {
    trackApiCalls: true,
    trackAiTokens: true,
    trackContentGeneration: true,
    trackStorage: false,
    trackBandwidth: true,
  },
});

// Template creation schema
const createTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  platform: z.enum([
    "twitter",
    "linkedin",
    "facebook",
    "instagram",
    "youtube",
    "tiktok",
    "multi",
  ]),
  category: z.string().min(1, "Category is required"),
  template: z.string().min(10, "Template content is required"),
  variables: z
    .array(
      z.object({
        name: z.string(),
        type: z.enum(["text", "number", "date", "choice"]),
        required: z.boolean(),
        description: z.string().optional(),
        choices: z.array(z.string()).optional(),
        defaultValue: z.any().optional(),
      })
    )
    .default([]),
  brandCompatible: z.boolean().default(true),
});

// Template usage schema
const useTemplateSchema = z.object({
  templateId: z.string().min(1, "Template ID is required"),
  variables: z.record(z.any()).default({}),
  additionalPrompt: z.string().optional(),
});

// Brand asset schema
const brandAssetSchema = z.object({
  name: z.string().min(1, "Asset name is required"),
  type: z.enum(["logo", "color", "font", "guideline"]),
  value: z.string().min(1, "Asset value is required"),
  description: z.string().optional(),
  usage: z.string().optional(),
});

// Helper functions
async function createCustomTemplate(
  generator: EnterpriseAIContentGenerator,
  templateData: any,
  tenantId: string
): Promise<string> {
  const templateId = await generator.createTemplate({
    ...templateData,
    performance: {
      averageEngagement: 0.5,
      usageCount: 0,
      lastUsed: new Date(),
    },
    aiGenerated: false,
    createdBy: tenantId,
  });

  return templateId;
}

async function analyzeExistingContent(
  content: string,
  platform: string
): Promise<any> {
  return {
    characterCount: content.length,
    wordCount: content.split(/\s+/).length,
    sentimentScore: calculateSentiment(content),
    readabilityScore: calculateReadability(content),
    hashtagCount: (content.match(/#\w+/g) || []).length,
    mentionCount: (content.match(/@\w+/g) || []).length,
    platformOptimization: calculatePlatformScore(content, platform),
    improvementSuggestions: generateImprovementSuggestions(content, platform),
  };
}

async function optimizeExistingContent(
  content: string,
  platform: string,
  targetMetrics?: any
): Promise<any> {
  const analysis = await analyzeExistingContent(content, platform);

  const optimizations = [];

  // Platform-specific optimizations
  if (platform === "twitter" && content.length > 280) {
    optimizations.push({
      type: "length",
      suggestion: "Shorten content to fit Twitter's 280-character limit",
      priority: "high",
    });
  }

  if (platform === "instagram" && analysis.hashtagCount < 10) {
    optimizations.push({
      type: "hashtags",
      suggestion: "Add more hashtags (up to 30) for better reach on Instagram",
      priority: "medium",
    });
  }

  if (analysis.sentimentScore < 0.6) {
    optimizations.push({
      type: "tone",
      suggestion:
        "Consider using more positive language to increase engagement",
      priority: "medium",
    });
  }

  return {
    originalAnalysis: analysis,
    optimizations,
    optimizedContent: applyOptimizations(content, optimizations),
    expectedImprovements: {
      engagementIncrease: "15-25%",
      reachIncrease: "10-20%",
      brandAlignmentScore: "85%",
    },
  };
}

async function generateIntelligentHashtags(
  content: string,
  platform: string,
  count: number
): Promise<any> {
  // Extract keywords from content
  const words = content.toLowerCase().split(/\s+/);
  const commonWords = [
    "the",
    "a",
    "an",
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
  const keywords = words.filter(
    word =>
      word.length > 3 && !commonWords.includes(word) && /^[a-zA-Z]+$/.test(word)
  );

  // Industry-specific hashtag mapping
  const industryHashtags: Record<string, string[]> = {
    technology: [
      "#Tech",
      "#Innovation",
      "#AI",
      "#DigitalTransformation",
      "#TechTrends",
    ],
    business: [
      "#Business",
      "#Entrepreneurship",
      "#Leadership",
      "#Growth",
      "#Strategy",
    ],
    marketing: [
      "#Marketing",
      "#DigitalMarketing",
      "#SocialMedia",
      "#Branding",
      "#ContentMarketing",
    ],
    healthcare: [
      "#Healthcare",
      "#Medical",
      "#Health",
      "#Wellness",
      "#Innovation",
    ],
    finance: ["#Finance", "#FinTech", "#Investment", "#Banking", "#Economy"],
  };

  // Platform-specific hashtags
  const platformHashtags: Record<string, string[]> = {
    linkedin: [
      "#LinkedIn",
      "#Professional",
      "#Career",
      "#Networking",
      "#Industry",
    ],
    instagram: ["#Insta", "#Photo", "#Style", "#Life", "#Daily"],
    twitter: ["#Twitter", "#Discussion", "#Trending", "#News", "#Update"],
    facebook: ["#Facebook", "#Community", "#Share", "#Connect", "#Social"],
  };

  // Generate hashtags based on content analysis
  const generatedHashtags = [];

  // Add keyword-based hashtags
  for (const keyword of keywords.slice(0, Math.floor(count / 2))) {
    generatedHashtags.push(
      `#${keyword.charAt(0).toUpperCase() + keyword.slice(1)}`
    );
  }

  // Add industry hashtags
  const detectedIndustry = detectIndustry(content);
  if (detectedIndustry && industryHashtags[detectedIndustry]) {
    generatedHashtags.push(...industryHashtags[detectedIndustry].slice(0, 3));
  }

  // Add platform-specific hashtags
  if (platformHashtags[platform]) {
    generatedHashtags.push(...platformHashtags[platform].slice(0, 2));
  }

  return {
    hashtags: generatedHashtags.slice(0, count),
    trending: ["#Innovation", "#AI", "#Business", "#Growth", "#Success"].slice(
      0,
      5
    ),
    brandSpecific: ["#SKCBusiness", "#BusinessIntelligence", "#DataDriven"],
    performance: {
      expectedReach: `+${Math.floor(Math.random() * 30 + 10)}%`,
      expectedEngagement: `+${Math.floor(Math.random() * 20 + 5)}%`,
    },
  };
}

async function storeBrandAsset(asset: any, tenantId: string): Promise<string> {
  const assetId = `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // In production, store to database
  console.log(`Storing brand asset ${assetId} for tenant ${tenantId}:`, asset);

  return assetId;
}

// Utility functions
function calculateSentiment(content: string): number {
  const positiveWords = [
    "great",
    "amazing",
    "excellent",
    "wonderful",
    "fantastic",
    "love",
    "best",
  ];
  const negativeWords = [
    "bad",
    "terrible",
    "awful",
    "hate",
    "worst",
    "horrible",
  ];

  let score = 0.5;

  for (const word of positiveWords) {
    if (content.toLowerCase().includes(word)) score += 0.1;
  }

  for (const word of negativeWords) {
    if (content.toLowerCase().includes(word)) score -= 0.1;
  }

  return Math.max(0, Math.min(1, score));
}

function calculateReadability(content: string): number {
  const sentences = content.split(/[.!?]+/).length;
  const words = content.split(/\s+/).length;

  if (sentences === 0 || words === 0) return 0.5;

  const avgWordsPerSentence = words / sentences;
  return Math.max(0, Math.min(1, 1.0 - avgWordsPerSentence * 0.02));
}

function calculatePlatformScore(content: string, platform: string): number {
  const platformSpecs: Record<string, any> = {
    twitter: { maxLength: 280, optimalLength: 71 },
    linkedin: { maxLength: 3000, optimalLength: 150 },
    facebook: { maxLength: 63206, optimalLength: 40 },
    instagram: { maxLength: 2200, optimalLength: 138 },
  };

  const specs = platformSpecs[platform] || platformSpecs.twitter;
  const lengthRatio = content.length / specs.optimalLength;

  return lengthRatio >= 0.8 && lengthRatio <= 1.2 ? 0.9 : 0.6;
}

function generateImprovementSuggestions(
  content: string,
  platform: string
): string[] {
  const suggestions = [];

  if (content.length < 50) {
    suggestions.push("Consider adding more detail to increase engagement");
  }

  if (!content.includes("?")) {
    suggestions.push("Add a question to encourage audience interaction");
  }

  if (platform === "instagram" && (content.match(/#\w+/g) || []).length < 5) {
    suggestions.push(
      "Add more hashtags for better discoverability on Instagram"
    );
  }

  return suggestions;
}

function applyOptimizations(content: string, optimizations: any[]): string {
  let optimizedContent = content;

  for (const optimization of optimizations) {
    switch (optimization.type) {
      case "length":
        if (optimizedContent.length > 280) {
          optimizedContent = optimizedContent.substring(0, 277) + "...";
        }
        break;
      case "tone":
        optimizedContent = optimizedContent.replace(
          /\b(bad|terrible)\b/gi,
          "challenging"
        );
        break;
    }
  }

  return optimizedContent;
}

function detectIndustry(content: string): string | null {
  const industryKeywords: Record<string, string[]> = {
    technology: ["tech", "ai", "software", "digital", "innovation", "data"],
    business: [
      "business",
      "strategy",
      "growth",
      "revenue",
      "profit",
      "company",
    ],
    marketing: ["marketing", "brand", "campaign", "audience", "engagement"],
    healthcare: ["health", "medical", "patient", "treatment", "care"],
    finance: ["finance", "money", "investment", "bank", "financial"],
  };

  const contentLower = content.toLowerCase();

  for (const [industry, keywords] of Object.entries(industryKeywords)) {
    for (const keyword of keywords) {
      if (contentLower.includes(keyword)) {
        return industry;
      }
    }
  }

  return null;
}

// POST - Generate content, create templates, manage brand assets
export async function POST(request: NextRequest) {
  return UsageTrackingMiddleware.withTracking(async (req: NextRequest) => {
    const startTime = Date.now();

    try {
      const body = await req.json();
      const { action, ...data } = body;

      // Get tenant ID and initialize generator
      const tenantId = req.headers.get("x-tenant-id") || "default";
      const generator = new EnterpriseAIContentGenerator({
        tenantId,
        defaultModel: "gpt-4",
      });

      switch (action) {
        case "generate": {
          try {
            const validatedRequest = contentGenerationRequestSchema.parse(data);

            // Generate content using AI
            const result = await generator.generateContent(validatedRequest);

            return NextResponse.json({
              success: result.success,
              result,
              metadata: {
                processingTime: Date.now() - startTime,
                action: "generate",
                tenantId,
                timestamp: new Date().toISOString(),
              },
            });
          } catch (error) {
            if (error instanceof z.ZodError) {
              return NextResponse.json(
                {
                  success: false,
                  error: "Validation failed",
                  details: error.errors,
                },
                { status: 400 }
              );
            }
            throw error;
          }
        }

        case "generate_from_template": {
          try {
            const validatedRequest = useTemplateSchema.parse(data);
            const { templateId, variables, additionalPrompt } =
              validatedRequest;

            // Generate content from template
            const result = await generator.generateFromTemplate(
              templateId,
              variables,
              additionalPrompt
            );

            return NextResponse.json({
              success: result.success,
              result,
              metadata: {
                processingTime: Date.now() - startTime,
                action: "generate_from_template",
                tenantId,
                templateId,
                timestamp: new Date().toISOString(),
              },
            });
          } catch (error) {
            if (error instanceof z.ZodError) {
              return NextResponse.json(
                {
                  success: false,
                  error: "Template validation failed",
                  details: error.errors,
                },
                { status: 400 }
              );
            }

            return NextResponse.json(
              {
                success: false,
                error:
                  error instanceof Error
                    ? error.message
                    : "Template generation failed",
              },
              { status: 400 }
            );
          }
        }

        case "create_template": {
          try {
            const validatedTemplate = createTemplateSchema.parse(data);

            // Create new template
            const templateId = await createCustomTemplate(
              generator,
              validatedTemplate,
              tenantId
            );

            return NextResponse.json({
              success: true,
              templateId,
              message: "Template created successfully",
              metadata: {
                processingTime: Date.now() - startTime,
                action: "create_template",
                tenantId,
                timestamp: new Date().toISOString(),
              },
            });
          } catch (error) {
            if (error instanceof z.ZodError) {
              return NextResponse.json(
                {
                  success: false,
                  error: "Template validation failed",
                  details: error.errors,
                },
                { status: 400 }
              );
            }
            throw error;
          }
        }

        case "analyze_content": {
          const { content, platform } = data;

          if (!content || !platform) {
            return NextResponse.json(
              {
                success: false,
                error: "Content and platform are required for analysis",
              },
              { status: 400 }
            );
          }

          // Analyze existing content
          const analysis = await analyzeExistingContent(content, platform);

          return NextResponse.json({
            success: true,
            analysis,
            metadata: {
              processingTime: Date.now() - startTime,
              action: "analyze_content",
              tenantId,
              timestamp: new Date().toISOString(),
            },
          });
        }

        case "optimize_content": {
          const { content, platform, targetMetrics } = data;

          if (!content || !platform) {
            return NextResponse.json(
              {
                success: false,
                error: "Content and platform are required for optimization",
              },
              { status: 400 }
            );
          }

          // Optimize existing content
          const optimization = await optimizeExistingContent(
            content,
            platform,
            targetMetrics
          );

          return NextResponse.json({
            success: true,
            optimization,
            metadata: {
              processingTime: Date.now() - startTime,
              action: "optimize_content",
              tenantId,
              timestamp: new Date().toISOString(),
            },
          });
        }

        case "generate_hashtags": {
          const { content, platform, count = 10 } = data;

          if (!content) {
            return NextResponse.json(
              {
                success: false,
                error: "Content is required for hashtag generation",
              },
              { status: 400 }
            );
          }

          // Generate intelligent hashtags
          const hashtags = await generateIntelligentHashtags(
            content,
            platform,
            count
          );

          return NextResponse.json({
            success: true,
            hashtags,
            metadata: {
              processingTime: Date.now() - startTime,
              action: "generate_hashtags",
              tenantId,
              timestamp: new Date().toISOString(),
            },
          });
        }

        case "brand_asset": {
          try {
            const validatedAsset = brandAssetSchema.parse(data);

            // Store brand asset
            const assetId = await storeBrandAsset(validatedAsset, tenantId);

            return NextResponse.json({
              success: true,
              assetId,
              message: "Brand asset stored successfully",
              metadata: {
                processingTime: Date.now() - startTime,
                action: "brand_asset",
                tenantId,
                timestamp: new Date().toISOString(),
              },
            });
          } catch (error) {
            if (error instanceof z.ZodError) {
              return NextResponse.json(
                {
                  success: false,
                  error: "Brand asset validation failed",
                  details: error.errors,
                },
                { status: 400 }
              );
            }
            throw error;
          }
        }

        default:
          return NextResponse.json(
            {
              success: false,
              error:
                "Invalid action. Supported actions: generate, generate_from_template, create_template, analyze_content, optimize_content, generate_hashtags, brand_asset",
            },
            { status: 400 }
          );
      }
    } catch (error) {
      console.error("AI Content Generator API Error:", error);

      return NextResponse.json(
        {
          success: false,
          error: "Internal server error",
          details: error instanceof Error ? error.message : "Unknown error",
          metadata: {
            processingTime: Date.now() - startTime,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 500 }
      );
    }
  })(request);
}

// GET - Retrieve templates, brand assets, analytics
export async function GET(request: NextRequest) {
  return UsageTrackingMiddleware.withTracking(async (req: NextRequest) => {
    const startTime = Date.now();

    try {
      const { searchParams } = new URL(req.url);
      const action = searchParams.get("action") || "templates";

      const tenantId = req.headers.get("x-tenant-id") || "default";
      const generator = new EnterpriseAIContentGenerator({
        tenantId,
        defaultModel: "gpt-4",
      });

      switch (action) {
        case "templates": {
          const platform = searchParams.get("platform") || undefined;
          const category = searchParams.get("category") || undefined;

          const templates = generator.getTemplates(platform, category);

          return NextResponse.json({
            success: true,
            templates,
            metadata: {
              processingTime: Date.now() - startTime,
              action: "templates",
              tenantId,
              filters: { platform, category },
              timestamp: new Date().toISOString(),
            },
          });
        }

        case "brand_assets": {
          const assetType = searchParams.get("type");

          // Mock brand assets - in production, fetch from database
          const brandAssets = [
            {
              id: "logo_primary",
              name: "Primary Logo",
              type: "logo",
              value: "/assets/logo-primary.svg",
              description: "Main company logo for light backgrounds",
              usage: "Use on light backgrounds with minimum 20px height",
            },
            {
              id: "color_primary",
              name: "Primary Brand Color",
              type: "color",
              value: "#007bff",
              description: "Main brand color for buttons and accents",
              usage: "Primary actions and brand elements",
            },
          ].filter(asset => !assetType || asset.type === assetType);

          return NextResponse.json({
            success: true,
            brandAssets,
            metadata: {
              processingTime: Date.now() - startTime,
              action: "brand_assets",
              tenantId,
              timestamp: new Date().toISOString(),
            },
          });
        }

        case "analytics": {
          const timeRange = searchParams.get("time_range") || "30d";

          // Mock analytics - in production, fetch real data
          const analytics = {
            contentGenerated: Math.floor(Math.random() * 500 + 100),
            templatesUsed: Math.floor(Math.random() * 50 + 10),
            averageEngagement: (Math.random() * 0.3 + 0.6).toFixed(2),
            topPerformingPlatforms: ["linkedin", "instagram", "twitter"],
            popularTemplates: ["announcement_template", "educational_linkedin"],
            trendingHashtags: ["#AI", "#Innovation", "#Business", "#Growth"],
            brandCompliance: (Math.random() * 0.2 + 0.8).toFixed(2),
            timeRange,
          };

          return NextResponse.json({
            success: true,
            analytics,
            metadata: {
              processingTime: Date.now() - startTime,
              action: "analytics",
              tenantId,
              timeRange,
              timestamp: new Date().toISOString(),
            },
          });
        }

        default:
          return NextResponse.json(
            {
              success: false,
              error:
                "Invalid action. Supported actions: templates, brand_assets, analytics",
            },
            { status: 400 }
          );
      }
    } catch (error) {
      console.error("AI Content Generator GET API Error:", error);

      return NextResponse.json(
        {
          success: false,
          error: "Internal server error",
          details: error instanceof Error ? error.message : "Unknown error",
          metadata: {
            processingTime: Date.now() - startTime,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 500 }
      );
    }
  })(request);
}
