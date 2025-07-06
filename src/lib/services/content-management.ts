interface ContentItem {
  id: string;
  title: string;
  type: "post" | "email" | "ad" | "story" | "video" | "campaign";
  platform: string[];
  scheduled_date: Date;
  scheduled_time: string;
  status:
    | "draft"
    | "scheduled"
    | "published"
    | "failed"
    | "approved"
    | "pending_approval";
  engagement_prediction?: number;
  author: string;
  content_preview: string;
  content_full: string;
  images?: string[];
  hashtags?: string[];
  target_audience?: string;
  campaign_id?: string;
  approval_status?: "pending" | "approved" | "rejected";
  approver?: string;
  notes?: string;
  duration?: number;
  audience_size?: number;
  budget?: number;
  objective?: string;
  // A/B Testing fields
  ab_test_id?: string;
  is_ab_test_variant?: boolean;
  ab_test_variant_id?: string;
  ab_test_traffic_percentage?: number;
}

interface Campaign {
  id: string;
  name: string;
  description: string;
  start_date: Date;
  end_date: Date;
  budget: number;
  status: "planning" | "active" | "paused" | "completed";
  content_items: string[];
}

interface ContentMetrics {
  total_content: number;
  scheduled_content: number;
  pending_approval: number;
  avg_engagement: number;
  platform_breakdown: Record<string, number>;
  type_breakdown: Record<string, number>;
}

class ContentManagementService {
  private apiUrl = "/api/content-management";

  async getContentItems(): Promise<ContentItem[]> {
    try {
      const response = await fetch(`${this.apiUrl}/items`);
      if (!response.ok) throw new Error("Failed to fetch content items");
      return await response.json();
    } catch (error) {
      console.error("Error fetching content items:", error);
      return this.getMockContentItems();
    }
  }

  async createContentItem(item: Omit<ContentItem, "id">): Promise<ContentItem> {
    try {
      const response = await fetch(`${this.apiUrl}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
      });
      if (!response.ok) throw new Error("Failed to create content item");
      return await response.json();
    } catch (error) {
      console.error("Error creating content item:", error);
      // Return mock created item
      return {
        ...item,
        id: `content-${Date.now()}`,
      } as ContentItem;
    }
  }

  async updateContentItem(
    id: string,
    updates: Partial<ContentItem>
  ): Promise<ContentItem> {
    try {
      const response = await fetch(`${this.apiUrl}/items/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update content item");
      return await response.json();
    } catch (error) {
      console.error("Error updating content item:", error);
      throw error;
    }
  }

  async deleteContentItem(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/items/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete content item");
    } catch (error) {
      console.error("Error deleting content item:", error);
      throw error;
    }
  }

  async duplicateContentItem(id: string): Promise<ContentItem> {
    try {
      const response = await fetch(`${this.apiUrl}/items/${id}/duplicate`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to duplicate content item");
      return await response.json();
    } catch (error) {
      console.error("Error duplicating content item:", error);
      throw error;
    }
  }

  async approveContent(id: string, approver: string): Promise<ContentItem> {
    return this.updateContentItem(id, {
      approval_status: "approved",
      status: "scheduled",
      approver,
    });
  }

  async rejectContent(id: string, reason?: string): Promise<ContentItem> {
    return this.updateContentItem(id, {
      approval_status: "rejected",
      status: "draft",
      notes: reason,
    });
  }

  async scheduleContent(
    id: string,
    date: Date,
    time: string
  ): Promise<ContentItem> {
    return this.updateContentItem(id, {
      scheduled_date: date,
      scheduled_time: time,
      status: "scheduled",
    });
  }

  async getContentMetrics(): Promise<ContentMetrics> {
    try {
      const response = await fetch(`${this.apiUrl}/metrics`);
      if (!response.ok) throw new Error("Failed to fetch content metrics");
      return await response.json();
    } catch (error) {
      console.error("Error fetching content metrics:", error);
      return this.getMockMetrics();
    }
  }

  async getCampaigns(): Promise<Campaign[]> {
    try {
      const response = await fetch(`${this.apiUrl}/campaigns`);
      if (!response.ok) throw new Error("Failed to fetch campaigns");
      return await response.json();
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      return [];
    }
  }

  async createCampaign(campaign: Omit<Campaign, "id">): Promise<Campaign> {
    try {
      const response = await fetch(`${this.apiUrl}/campaigns`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(campaign),
      });
      if (!response.ok) throw new Error("Failed to create campaign");
      return await response.json();
    } catch (error) {
      console.error("Error creating campaign:", error);
      throw error;
    }
  }

  async updateCampaign(
    id: string,
    updates: Partial<Campaign>
  ): Promise<Campaign> {
    try {
      const response = await fetch(`${this.apiUrl}/campaigns/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update campaign");
      return await response.json();
    } catch (error) {
      console.error("Error updating campaign:", error);
      throw error;
    }
  }

  // Content templates and suggestions
  async getContentSuggestions(
    type: string,
    platform: string[]
  ): Promise<string[]> {
    try {
      const response = await fetch(
        `${this.apiUrl}/suggestions?type=${type}&platforms=${platform.join(",")}`
      );
      if (!response.ok) throw new Error("Failed to fetch content suggestions");
      return await response.json();
    } catch (error) {
      console.error("Error fetching content suggestions:", error);
      return [
        "Share an update about your latest product features",
        "Create a behind-the-scenes post about your team",
        "Ask your audience a question to increase engagement",
        "Share customer testimonials or success stories",
        "Post about industry trends and your perspective",
      ];
    }
  }

  async predictEngagement(
    content: string,
    platform: string[]
  ): Promise<number> {
    try {
      const response = await fetch(`${this.apiUrl}/predict-engagement`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content, platforms: platform }),
      });
      if (!response.ok) throw new Error("Failed to predict engagement");
      const result = await response.json();
      return result.prediction;
    } catch (error) {
      console.error("Error predicting engagement:", error);
      // Return mock prediction
      return Math.floor(Math.random() * 30) + 70; // 70-100% range
    }
  }

  async getBestPostingTimes(platform: string): Promise<string[]> {
    try {
      const response = await fetch(`${this.apiUrl}/best-times/${platform}`);
      if (!response.ok) throw new Error("Failed to fetch best posting times");
      return await response.json();
    } catch (error) {
      console.error("Error fetching best posting times:", error);
      return ["09:00", "12:00", "15:00", "18:00"]; // Default times
    }
  }

  // AI-powered content creation methods
  async generateContentWithAI(request: {
    type: ContentItem["type"];
    platform: string[];
    topic?: string;
    tone?: string;
    audience?: string;
    keywords?: string[];
    includeImages?: boolean;
  }): Promise<Partial<ContentItem>> {
    try {
      const response = await fetch(`${this.apiUrl}/ai-generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) throw new Error("Failed to generate AI content");

      const generated = await response.json();

      return {
        title: generated.title,
        type: request.type,
        platform: request.platform,
        content_preview: generated.content.substring(0, 100) + "...",
        content_full: generated.content,
        hashtags: generated.hashtags,
        target_audience: request.audience,
        engagement_prediction: generated.estimatedEngagement,
        status: "draft",
        author: "AI Assistant",
        scheduled_date: new Date(),
        scheduled_time: "12:00",
      };
    } catch (error) {
      console.error("Error generating AI content:", error);
      return this.generateMockAIContent(request);
    }
  }

  async createContentFromTemplate(
    templateId: string,
    variables: Record<string, string>
  ): Promise<Partial<ContentItem>> {
    try {
      const response = await fetch(`${this.apiUrl}/template-generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ templateId, variables }),
      });

      if (!response.ok)
        throw new Error("Failed to create content from template");

      const generated = await response.json();
      return generated;
    } catch (error) {
      console.error("Error creating content from template:", error);
      return this.generateMockTemplateContent(templateId, variables);
    }
  }

  async enhanceContentWithAI(
    content: string,
    enhancements: {
      improveEngagement?: boolean;
      addHashtags?: boolean;
      optimizeForPlatform?: string;
      adjustTone?: string;
    }
  ): Promise<{
    content: string;
    hashtags?: string[];
    suggestions: string[];
  }> {
    try {
      const response = await fetch(`${this.apiUrl}/ai-enhance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content, enhancements }),
      });

      if (!response.ok) throw new Error("Failed to enhance content with AI");

      return await response.json();
    } catch (error) {
      console.error("Error enhancing content with AI:", error);
      return {
        content: content,
        hashtags: ["#enhanced", "#ai", "#content"],
        suggestions: [
          "Add more engaging opening",
          "Include call to action",
          "Use more specific keywords",
        ],
      };
    }
  }

  async generateContentVariations(
    baseContent: string,
    platforms: string[],
    count: number = 3
  ): Promise<
    Array<{
      platform: string;
      content: string;
      hashtags: string[];
      estimatedEngagement: number;
    }>
  > {
    try {
      const response = await fetch(`${this.apiUrl}/ai-variations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ baseContent, platforms, count }),
      });

      if (!response.ok)
        throw new Error("Failed to generate content variations");

      return await response.json();
    } catch (error) {
      console.error("Error generating content variations:", error);
      return platforms.map(platform => ({
        platform,
        content: `${baseContent} - optimized for ${platform}`,
        hashtags: [`#${platform}`, "#ai", "#content"],
        estimatedEngagement: Math.random() * 100,
      }));
    }
  }

  async analyzeContentPerformance(contentId: string): Promise<{
    currentEngagement: number;
    predictedEngagement: number;
    suggestions: string[];
    bestPostingTime: string;
    audienceReach: number;
  }> {
    try {
      const response = await fetch(`${this.apiUrl}/analyze/${contentId}`);

      if (!response.ok)
        throw new Error("Failed to analyze content performance");

      return await response.json();
    } catch (error) {
      console.error("Error analyzing content performance:", error);
      return {
        currentEngagement: Math.random() * 100,
        predictedEngagement: Math.random() * 100,
        suggestions: [
          "Post at optimal time",
          "Add more visual content",
          "Use trending hashtags",
        ],
        bestPostingTime: "14:00",
        audienceReach: Math.floor(Math.random() * 10000),
      };
    }
  }

  // A/B Testing Integration Methods
  async createABTestFromContent(
    contentId: string,
    testConfig: {
      test_name: string;
      test_type:
        | "text"
        | "subject_line"
        | "image"
        | "cta"
        | "timing"
        | "audience";
      variants: Array<{
        name: string;
        content_modifications: Partial<ContentItem>;
        traffic_percentage: number;
        is_control: boolean;
      }>;
      duration_hours: number;
      sample_size: number;
      significance_threshold?: number;
    }
  ): Promise<{
    ab_test_id: string;
    variants: ContentItem[];
  }> {
    try {
      // Get original content
      const contentItems = await this.getContentItems();
      const originalContent = contentItems.find(item => item.id === contentId);

      if (!originalContent) {
        throw new Error("Original content not found");
      }

      const variants: ContentItem[] = [];

      for (const variantConfig of testConfig.variants) {
        const variantContent: ContentItem = {
          ...originalContent,
          id: `${contentId}-variant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: `${originalContent.title} - ${variantConfig.name}`,
          ...variantConfig.content_modifications,
          ab_test_id: `ab-test-${Date.now()}`,
          is_ab_test_variant: true,
          ab_test_variant_id: `variant-${Date.now()}-${variants.length}`,
          ab_test_traffic_percentage: variantConfig.traffic_percentage,
          status: "draft",
        };

        variants.push(variantContent);
      }

      // Create A/B test configuration
      const abTestConfig = {
        name: testConfig.test_name,
        test_type: testConfig.test_type,
        target_audience: originalContent.target_audience || "General audience",
        sample_size: testConfig.sample_size,
        duration_hours: testConfig.duration_hours,
        significance_threshold: testConfig.significance_threshold || 95,
        traffic_split_type: "weighted" as const,
        auto_declare_winner: true,
        platform: originalContent.platform,
        objectives: ["improve_engagement", "increase_conversions"],
        hypothesis: `Testing ${testConfig.test_type} variations to improve content performance`,
        variants: variants.map((variant, index) => ({
          name: variant.title.split(" - ")[1] || "Variant",
          traffic_percentage: variant.ab_test_traffic_percentage || 50,
          is_control: testConfig.variants[index]?.is_control || false,
          content: {
            text: variant.content_full,
            subject_line: variant.type === "email" ? variant.title : undefined,
            image_url: variant.images?.[0],
            cta_text: this.extractCTAFromContent(variant.content_full),
          },
        })),
      };

      // Call A/B testing service
      const response = await fetch("/api/content-ab-testing/tests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(abTestConfig),
      });

      if (!response.ok) {
        throw new Error("Failed to create A/B test");
      }

      const abTestResult = await response.json();

      return {
        ab_test_id: abTestResult.data.id,
        variants,
      };
    } catch (error) {
      console.error("Error creating A/B test from content:", error);
      throw error;
    }
  }

  async getABTestRecommendations(contentId: string): Promise<
    Array<{
      test_type: string;
      priority: "high" | "medium" | "low";
      reason: string;
      estimated_improvement: string;
      suggested_variants: string[];
    }>
  > {
    try {
      const contentItems = await this.getContentItems();
      const content = contentItems.find(item => item.id === contentId);

      if (!content) {
        throw new Error("Content not found");
      }

      const recommendations = [];

      // Subject line recommendations
      if (content.type === "email" || content.title) {
        recommendations.push({
          test_type: "subject_line",
          priority: "high" as const,
          reason: "Subject lines significantly impact open rates",
          estimated_improvement: "15-30%",
          suggested_variants: [
            "Add emojis for visual appeal",
            "Create urgency with time-sensitive language",
            "Personalize with recipient name",
            "Ask a compelling question",
          ],
        });
      }

      // CTA recommendations
      if (this.containsCTA(content.content_full)) {
        recommendations.push({
          test_type: "cta",
          priority: "high" as const,
          reason: "Call-to-action optimization drives conversions",
          estimated_improvement: "20-40%",
          suggested_variants: [
            "Use action-oriented language (Get, Start, Discover)",
            "Add urgency (Now, Today, Limited Time)",
            "Make it more specific to the offer",
            "Test button vs. text link format",
          ],
        });
      }

      // Content text recommendations
      recommendations.push({
        test_type: "text",
        priority: "medium" as const,
        reason: "Content messaging affects engagement",
        estimated_improvement: "10-25%",
        suggested_variants: [
          "Test shorter vs. longer content",
          "Add more emotional language",
          "Include social proof or testimonials",
          "Focus on benefits vs. features",
        ],
      });

      // Image recommendations
      if (content.images && content.images.length > 0) {
        recommendations.push({
          test_type: "image",
          priority: "medium" as const,
          reason: "Visual content impacts engagement",
          estimated_improvement: "15-35%",
          suggested_variants: [
            "Test bright vs. muted colors",
            "People vs. product-focused images",
            "Different angles or compositions",
            "With vs. without text overlay",
          ],
        });
      }

      // Timing recommendations
      if (content.scheduled_date) {
        recommendations.push({
          test_type: "timing",
          priority: "low" as const,
          reason: "Posting time affects reach and engagement",
          estimated_improvement: "5-15%",
          suggested_variants: [
            "Test morning vs. afternoon posting",
            "Weekday vs. weekend timing",
            "During vs. outside business hours",
            "Different time zones for global audience",
          ],
        });
      }

      return recommendations;
    } catch (error) {
      console.error("Error getting A/B test recommendations:", error);
      return [];
    }
  }

  private extractCTAFromContent(content: string): string | undefined {
    // Simple regex to find common CTA patterns
    const ctaPatterns = [
      /\b(click here|learn more|get started|sign up|subscribe|download|try now|buy now|shop now|read more)\b/i,
    ];

    for (const pattern of ctaPatterns) {
      const match = content.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return undefined;
  }

  private containsCTA(content: string): boolean {
    return this.extractCTAFromContent(content) !== undefined;
  }

  // Mock methods for AI content generation fallback
  private generateMockAIContent(request: any): Partial<ContentItem> {
    const mockContent = {
      post: `Exciting update about ${request.topic || "our latest developments"}! 🚀\n\nWe're thrilled to share this amazing news with our community. Stay tuned for more updates!\n\n#innovation #update #community`,
      email: `Subject: Important Update About ${request.topic || "Our Services"}\n\nDear Valued Customer,\n\nWe have some exciting news to share with you about ${request.topic || "our latest improvements"}...\n\nBest regards,\nThe Team`,
      ad: `Transform your business with ${request.topic || "our solution"}! 🎯\n\nGet 50% off this month only. Limited time offer!\n\nClick to learn more 👆`,
      story: `Behind the scenes: ${request.topic || "How we built something amazing"} 🎬\n\nSwipe up to see the full story!`,
      video: `New video: ${request.topic || "Product demonstration"} 📹\n\nWatch how we revolutionize your workflow in just 3 minutes!\n\nSubscribe for more content like this.`,
      campaign: `Join our ${request.topic || "exclusive"} campaign! 🌟\n\nBe part of something bigger and make a difference.\n\n#campaign #community #impact`,
    };

    return {
      title: `AI Generated: ${request.topic || "Content"}`,
      type: request.type,
      platform: request.platform,
      content_preview:
        mockContent[request.type]?.substring(0, 100) + "..." ||
        "AI generated content preview...",
      content_full:
        mockContent[request.type] ||
        "AI generated content based on your requirements.",
      hashtags: [
        "#ai",
        "#generated",
        "#content",
        ...(request.keywords || []).slice(0, 3),
      ],
      target_audience: request.audience || "General audience",
      engagement_prediction: 75 + Math.random() * 20,
      status: "draft",
      author: "AI Assistant",
      scheduled_date: new Date(),
      scheduled_time: "12:00",
    };
  }

  private generateMockTemplateContent(
    templateId: string,
    variables: Record<string, string>
  ): Partial<ContentItem> {
    return {
      title: `From Template: ${templateId}`,
      content_full: `Template-based content with variables: ${Object.entries(
        variables
      )
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ")}`,
      type: "post",
      platform: ["facebook", "instagram"],
      status: "draft",
      author: "Template Engine",
      scheduled_date: new Date(),
      scheduled_time: "12:00",
    };
  }

  // Mock data for development
  private getMockContentItems(): ContentItem[] {
    return [
      {
        id: "content-1",
        title: "Summer Sale Announcement",
        type: "post",
        platform: ["facebook", "instagram", "twitter"],
        scheduled_date: new Date(Date.now() + 2 * 60 * 60 * 1000),
        scheduled_time: "10:00",
        status: "scheduled",
        engagement_prediction: 85,
        author: "Marketing Team",
        content_preview:
          "🌞 Summer Sale is here! Get up to 50% off on all products...",
        content_full:
          "🌞 Summer Sale is here! Get up to 50% off on all products. Limited time offer, shop now! #SummerSale #Discount #ShopNow",
        hashtags: ["#SummerSale", "#Discount", "#ShopNow"],
        target_audience: "All customers",
        approval_status: "approved",
        approver: "Sarah Johnson",
      },
      {
        id: "content-2",
        title: "Product Demo Video",
        type: "video",
        platform: ["youtube", "linkedin"],
        scheduled_date: new Date(Date.now() + 24 * 60 * 60 * 1000),
        scheduled_time: "14:00",
        status: "draft",
        engagement_prediction: 92,
        author: "Product Team",
        content_preview: "New product demo showcasing our latest features...",
        content_full:
          "Check out our latest product demo! See how our new features can transform your workflow. Subscribe for more updates!",
        duration: 180,
        target_audience: "B2B customers",
        approval_status: "pending",
      },
    ];
  }

  private getMockMetrics(): ContentMetrics {
    return {
      total_content: 42,
      scheduled_content: 15,
      pending_approval: 3,
      avg_engagement: 78,
      platform_breakdown: {
        facebook: 12,
        instagram: 18,
        twitter: 8,
        linkedin: 4,
      },
      type_breakdown: {
        post: 25,
        video: 8,
        story: 6,
        email: 3,
      },
    };
  }
}

export const contentManagementService = new ContentManagementService();
export type { ContentItem, Campaign, ContentMetrics };
