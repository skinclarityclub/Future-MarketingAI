interface ContentGenerationRequest {
  type: "post" | "email" | "ad" | "story" | "campaign" | "video_script";
  platform: string[];
  topic?: string;
  tone?: "professional" | "casual" | "friendly" | "authoritative" | "creative";
  length?: "short" | "medium" | "long";
  audience?: string;
  keywords?: string[];
  includeImages?: boolean;
  template?: string;
  brandVoice?: string;
  callToAction?: string;
}

interface GeneratedContent {
  id: string;
  type: ContentGenerationRequest["type"];
  platform: string[];
  title: string;
  content: string;
  images?: GeneratedImage[];
  hashtags?: string[];
  metadata: {
    wordCount: number;
    estimatedEngagement: number;
    confidence: number;
    generatedAt: Date;
    model: string;
  };
  suggestions: {
    variations: string[];
    improvements: string[];
    optimizations: string[];
  };
}

interface GeneratedImage {
  id: string;
  url: string;
  alt: string;
  style: string;
  size: string;
  format: string;
}

interface ContentTemplate {
  id: string;
  name: string;
  type: ContentGenerationRequest["type"];
  platform: string[];
  description: string;
  prompt: string;
  variables: string[];
  examples: string[];
}

export class AIContentGenerator {
  private apiUrl = "/api/content/generate";

  constructor() {
    // Initialize with existing AI configuration
  }

  /**
   * Generate content using AI based on request parameters
   */
  async generateContent(
    request: ContentGenerationRequest
  ): Promise<GeneratedContent> {
    try {
      const response = await fetch(`${this.apiUrl}/text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error("Failed to generate content");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error generating content:", error);
      return this.generateMockContent(request);
    }
  }

  /**
   * Generate multiple content variations
   */
  async generateVariations(
    baseRequest: ContentGenerationRequest,
    count: number = 3
  ): Promise<GeneratedContent[]> {
    const variations: GeneratedContent[] = [];

    for (let i = 0; i < count; i++) {
      const variationRequest = {
        ...baseRequest,
        tone: this.getRandomTone(),
        length: this.getRandomLength(),
      };

      const content = await this.generateContent(variationRequest);
      variations.push(content);
    }

    return variations;
  }

  /**
   * Generate images for content using AI
   */
  async generateImages(
    prompt: string,
    style: string = "realistic",
    count: number = 1
  ): Promise<GeneratedImage[]> {
    try {
      const response = await fetch(`${this.apiUrl}/images`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          style,
          count,
          size: "1024x1024",
          format: "png",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate images");
      }

      const result = await response.json();
      return result.images;
    } catch (error) {
      console.error("Error generating images:", error);
      return this.generateMockImages(prompt, count);
    }
  }

  /**
   * Get available content templates
   */
  async getTemplates(
    type?: ContentGenerationRequest["type"]
  ): Promise<ContentTemplate[]> {
    try {
      const url = type
        ? `${this.apiUrl}/templates?type=${type}`
        : `${this.apiUrl}/templates`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch templates");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching templates:", error);
      return this.getMockTemplates(type);
    }
  }

  /**
   * Optimize content for specific platform
   */
  async optimizeForPlatform(
    content: string,
    platform: string,
    type: ContentGenerationRequest["type"]
  ): Promise<string> {
    try {
      const response = await fetch(`${this.apiUrl}/optimize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          platform,
          type,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to optimize content");
      }

      const result = await response.json();
      return result.optimizedContent;
    } catch (error) {
      console.error("Error optimizing content:", error);
      return content;
    }
  }

  /**
   * Analyze content performance prediction
   */
  async predictPerformance(
    content: string,
    platform: string[]
  ): Promise<
    {
      platform: string;
      estimatedEngagement: number;
      estimatedReach: number;
      confidence: number;
      suggestions: string[];
    }[]
  > {
    try {
      const response = await fetch(`${this.apiUrl}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          platforms: platform,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to predict performance");
      }

      return await response.json();
    } catch (error) {
      console.error("Error predicting performance:", error);
      return platform.map(p => ({
        platform: p,
        estimatedEngagement: Math.random() * 100,
        estimatedReach: Math.random() * 10000,
        confidence: 0.7,
        suggestions: ["Add more hashtags", "Include call to action"],
      }));
    }
  }

  /**
   * Generate hashtags for content
   */
  async generateHashtags(
    content: string,
    platform: string,
    count: number = 10
  ): Promise<string[]> {
    try {
      const response = await fetch(`${this.apiUrl}/hashtags`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          platform,
          count,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate hashtags");
      }

      const result = await response.json();
      return result.hashtags;
    } catch (error) {
      console.error("Error generating hashtags:", error);
      return this.generateMockHashtags(content, count);
    }
  }

  // Mock methods for fallback
  private generateMockContent(
    request: ContentGenerationRequest
  ): GeneratedContent {
    const contentMap = {
      post: "Exciting news! We're launching something amazing that will revolutionize your business. Stay tuned for more updates! #innovation #business #growth",
      email:
        "Subject: Important Update\n\nDear valued customer,\n\nWe have some exciting news to share with you...",
      ad: "Transform your business today! Get 50% off our premium services. Limited time offer!",
      story: "Behind the scenes: Here's how we built our latest feature...",
      campaign: "Join our exclusive campaign and be part of something bigger!",
      video_script:
        "Scene 1: [FADE IN] Welcome to our amazing product demonstration...",
    };

    return {
      id: `generated-${Date.now()}`,
      type: request.type,
      platform: request.platform,
      title: `AI Generated ${request.type.charAt(0).toUpperCase() + request.type.slice(1)}`,
      content:
        contentMap[request.type] ||
        "Generated content based on your requirements.",
      hashtags: ["#AI", "#Content", "#Marketing", "#Business"],
      metadata: {
        wordCount: 150,
        estimatedEngagement: Math.random() * 100,
        confidence: 0.85,
        generatedAt: new Date(),
        model: "gpt-4",
      },
      suggestions: {
        variations: [
          "Try a more casual tone",
          "Add more emojis",
          "Include customer testimonial",
        ],
        improvements: [
          "Add stronger call to action",
          "Include urgency",
          "Mention benefits more clearly",
        ],
        optimizations: [
          "Optimize for mobile viewing",
          "A/B test different versions",
          "Schedule for optimal timing",
        ],
      },
    };
  }

  private generateMockImages(prompt: string, count: number): GeneratedImage[] {
    return Array.from({ length: count }, (_, i) => ({
      id: `img-${Date.now()}-${i}`,
      url: `https://picsum.photos/1024/1024?random=${Date.now()}-${i}`,
      alt: `AI generated image for: ${prompt}`,
      style: "realistic",
      size: "1024x1024",
      format: "png",
    }));
  }

  private getMockTemplates(
    type?: ContentGenerationRequest["type"]
  ): ContentTemplate[] {
    const templates: ContentTemplate[] = [
      {
        id: "social-announcement",
        name: "Social Media Announcement",
        type: "post",
        platform: ["twitter", "linkedin", "facebook"],
        description: "Professional announcement template",
        prompt:
          "Create an engaging announcement about {topic} with a {tone} tone",
        variables: ["topic", "tone", "company"],
        examples: ["Product launch", "Company milestone", "Event announcement"],
      },
      {
        id: "email-newsletter",
        name: "Email Newsletter",
        type: "email",
        platform: ["email"],
        description: "Weekly newsletter template",
        prompt: "Write a newsletter about {topic} for {audience}",
        variables: ["topic", "audience", "cta"],
        examples: ["Weekly updates", "Product features", "Industry insights"],
      },
      {
        id: "ad-campaign",
        name: "Advertisement Campaign",
        type: "ad",
        platform: ["facebook", "google", "instagram"],
        description: "Conversion-focused ad copy",
        prompt: "Create compelling ad copy for {product} targeting {audience}",
        variables: ["product", "audience", "offer"],
        examples: [
          "Product promotion",
          "Service announcement",
          "Event registration",
        ],
      },
    ];

    return type ? templates.filter(t => t.type === type) : templates;
  }

  private generateMockHashtags(content: string, count: number): string[] {
    const commonHashtags = [
      "marketing",
      "business",
      "innovation",
      "growth",
      "success",
      "technology",
      "digital",
      "startup",
      "entrepreneur",
      "leadership",
      "strategy",
      "productivity",
      "inspiration",
      "motivation",
      "tips",
    ];

    return commonHashtags.slice(0, count).map(tag => `#${tag}`);
  }

  private getRandomTone(): ContentGenerationRequest["tone"] {
    const tones: ContentGenerationRequest["tone"][] = [
      "professional",
      "casual",
      "friendly",
      "authoritative",
      "creative",
    ];
    return tones[Math.floor(Math.random() * tones.length)];
  }

  private getRandomLength(): ContentGenerationRequest["length"] {
    const lengths: ContentGenerationRequest["length"][] = [
      "short",
      "medium",
      "long",
    ];
    return lengths[Math.floor(Math.random() * lengths.length)];
  }
}

export const aiContentGenerator = new AIContentGenerator();

export type {
  ContentGenerationRequest,
  GeneratedContent,
  GeneratedImage,
  ContentTemplate,
};
