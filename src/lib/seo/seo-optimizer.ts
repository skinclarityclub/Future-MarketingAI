/**
 * SEO Optimizer - Traditional + LLM SEO
 * Task 79.11: Optimize for Traditional SEO and LLM SEO
 *
 * Comprehensive SEO optimization system that handles both traditional search engines
 * and modern LLM/AI agent discovery and understanding
 */

import { Metadata } from "next";

// Traditional SEO Interfaces
export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  robots?: string;
  openGraph?: OpenGraphData;
  twitter?: TwitterCardData;
  jsonLd?: Record<string, any>;
}

export interface OpenGraphData {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "product";
  siteName?: string;
  locale?: string;
}

export interface TwitterCardData {
  card?: "summary" | "summary_large_image" | "app" | "player";
  site?: string;
  creator?: string;
  title?: string;
  description?: string;
  image?: string;
}

// LLM SEO Interfaces
export interface LLMSEOConfig {
  semanticContext: string;
  entityMentions: EntityMention[];
  contentStructure: ContentStructure;
  aiAgentHints: AIAgentHints;
  factualData: FactualData[];
}

export interface EntityMention {
  entity: string;
  type:
    | "person"
    | "organization"
    | "location"
    | "product"
    | "service"
    | "concept";
  context: string;
  relevanceScore: number;
}

export interface ContentStructure {
  mainTopic: string;
  subtopics: string[];
  contentType:
    | "informational"
    | "commercial"
    | "navigational"
    | "transactional";
  complexity: "beginner" | "intermediate" | "advanced";
  purpose: string;
}

export interface AIAgentHints {
  primaryIntent: string;
  secondaryIntents: string[];
  answerableQuestions: string[];
  keyInsights: string[];
  actionableItems: string[];
}

export interface FactualData {
  claim: string;
  source?: string;
  confidence: number;
  lastVerified: Date;
}

// Combined SEO Data
export interface ComprehensiveSEOData {
  traditional: SEOConfig;
  llm: LLMSEOConfig;
  performance: SEOPerformanceMetrics;
}

export interface SEOPerformanceMetrics {
  expectedCTR?: number;
  competitionLevel?: "low" | "medium" | "high";
  targetAudience?: string[];
  searchIntent?: string[];
}

/**
 * SEO Optimizer Class - Handles both Traditional and LLM SEO
 */
export class SEOOptimizer {
  private static instance: SEOOptimizer;
  private baseUrl: string;
  private siteName: string;
  private defaultImage: string;

  constructor(
    config: {
      baseUrl?: string;
      siteName?: string;
      defaultImage?: string;
    } = {}
  ) {
    this.baseUrl = config.baseUrl || "https://skc-bi-dashboard.com";
    this.siteName = config.siteName || "SKC BI Dashboard";
    this.defaultImage = config.defaultImage || "/og-default.jpg";
  }

  static getInstance(config?: any): SEOOptimizer {
    if (!SEOOptimizer.instance) {
      SEOOptimizer.instance = new SEOOptimizer(config);
    }
    return SEOOptimizer.instance;
  }

  /**
   * Generate comprehensive metadata for Next.js pages
   */
  generateMetadata(seoData: ComprehensiveSEOData, path?: string): Metadata {
    const { traditional, llm } = seoData;
    const fullUrl = path ? `${this.baseUrl}${path}` : this.baseUrl;

    const metadata: Metadata = {
      title: traditional.title,
      description: traditional.description,
      keywords: traditional.keywords,
      robots: traditional.robots || "index,follow",
      canonical: traditional.canonical || fullUrl,

      // Open Graph
      openGraph: {
        title: traditional.openGraph?.title || traditional.title,
        description:
          traditional.openGraph?.description || traditional.description,
        url: traditional.openGraph?.url || fullUrl,
        siteName: traditional.openGraph?.siteName || this.siteName,
        images: traditional.openGraph?.image
          ? [traditional.openGraph.image]
          : [this.defaultImage],
        locale: traditional.openGraph?.locale || "nl_NL",
        type: traditional.openGraph?.type || "website",
      },

      // Twitter Card
      twitter: {
        card: traditional.twitter?.card || "summary_large_image",
        site: traditional.twitter?.site,
        creator: traditional.twitter?.creator,
        title: traditional.twitter?.title || traditional.title,
        description:
          traditional.twitter?.description || traditional.description,
        images: traditional.twitter?.image
          ? [traditional.twitter.image]
          : [this.defaultImage],
      },

      // Additional metadata for LLM understanding
      other: {
        // Semantic context for AI agents
        "ai:semantic-context": llm.semanticContext,
        "ai:content-type": llm.contentStructure.contentType,
        "ai:complexity": llm.contentStructure.complexity,
        "ai:primary-intent": llm.aiAgentHints.primaryIntent,

        // Entity mentions for better understanding
        "ai:entities": llm.entityMentions.map(e => e.entity).join(","),

        // Key insights for AI summarization
        "ai:key-insights": llm.aiAgentHints.keyInsights.join(" | "),

        // Answerable questions for voice search/AI
        "ai:answerable-questions":
          llm.aiAgentHints.answerableQuestions.join(" | "),
      },
    };

    return metadata;
  }

  /**
   * Generate JSON-LD structured data
   */
  generateJSONLD(seoData: ComprehensiveSEOData, path?: string): string {
    const { traditional, llm } = seoData;
    const fullUrl = path ? `${this.baseUrl}${path}` : this.baseUrl;

    const baseStructuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: traditional.title,
      description: traditional.description,
      url: fullUrl,
      inLanguage: "nl-NL",
      isPartOf: {
        "@type": "WebSite",
        name: this.siteName,
        url: this.baseUrl,
      },

      // Enhanced for LLM understanding
      mainEntity: {
        "@type": "SoftwareApplication",
        name: "SKC BI Dashboard",
        description:
          "Enterprise Business Intelligence Dashboard met AI-powered analytics",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web Browser",
        offers: {
          "@type": "Offer",
          price: "15000",
          priceCurrency: "EUR",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: "15000",
            priceCurrency: "EUR",
            billingDuration: "P1M",
          },
        },
      },

      // Semantic annotations for AI agents
      about: llm.entityMentions.map(entity => ({
        "@type": "Thing",
        name: entity.entity,
        description: entity.context,
      })),

      // Key topics for content understanding
      keywords: traditional.keywords,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": fullUrl,
      },

      // Factual data for AI verification
      citation: llm.factualData.map(fact => ({
        "@type": "Claim",
        text: fact.claim,
        datePublished: fact.lastVerified.toISOString(),
      })),
    };

    return JSON.stringify(baseStructuredData, null, 2);
  }

  /**
   * Generate comprehensive SEO data for BI Dashboard pages
   */
  generateBIDashboardSEO(pageConfig: {
    title: string;
    description: string;
    path: string;
    pageType: "dashboard" | "demo" | "feature" | "landing";
    features?: string[];
    metrics?: string[];
  }): ComprehensiveSEOData {
    const {
      title,
      description,
      path,
      pageType,
      features = [],
      metrics = [],
    } = pageConfig;

    return {
      traditional: {
        title: `${title} | SKC BI Dashboard`,
        description,
        keywords: [
          "business intelligence",
          "dashboard",
          "analytics",
          "real-time data",
          "AI insights",
          "enterprise software",
          "data visualization",
          "KPI tracking",
          ...features,
          ...metrics,
        ],
        canonical: `${this.baseUrl}${path}`,
        robots: "index,follow",
        openGraph: {
          title: `${title} | SKC BI Dashboard`,
          description,
          type: pageType === "landing" ? "website" : "article",
          image: `/og-${pageType}.jpg`,
          siteName: this.siteName,
          locale: "nl_NL",
        },
        twitter: {
          card: "summary_large_image",
          title: `${title} | SKC BI Dashboard`,
          description,
          image: `/twitter-${pageType}.jpg`,
        },
      },
      llm: {
        semanticContext: `Enterprise business intelligence dashboard featuring ${title.toLowerCase()}. Provides real-time analytics, AI-powered insights, and comprehensive data visualization for business decision-making.`,
        entityMentions: [
          {
            entity: "SKC BI Dashboard",
            type: "product",
            context: "Enterprise business intelligence platform",
            relevanceScore: 1.0,
          },
          {
            entity: "Business Intelligence",
            type: "concept",
            context: "Data analysis and reporting for business insights",
            relevanceScore: 0.9,
          },
          {
            entity: "Real-time Analytics",
            type: "service",
            context: "Live data processing and visualization",
            relevanceScore: 0.8,
          },
        ],
        contentStructure: {
          mainTopic: title,
          subtopics: features,
          contentType: pageType === "demo" ? "informational" : "commercial",
          complexity: "intermediate",
          purpose: `Demonstrate ${title.toLowerCase()} capabilities for business users`,
        },
        aiAgentHints: {
          primaryIntent: `Learn about ${title.toLowerCase()} in business intelligence context`,
          secondaryIntents: [
            "Compare BI dashboard features",
            "Understand enterprise analytics",
            "Evaluate business intelligence tools",
          ],
          answerableQuestions: [
            `What is ${title.toLowerCase()}?`,
            "How does SKC BI Dashboard work?",
            "What are the key features?",
            "How much does it cost?",
            "Is it suitable for enterprise use?",
          ],
          keyInsights: [
            `${title} provides comprehensive business intelligence capabilities`,
            "Real-time data processing and visualization",
            "Enterprise-grade security and scalability",
            "AI-powered insights and recommendations",
          ],
          actionableItems: [
            "Request a demo",
            "Contact sales team",
            "Start free trial",
            "Download feature comparison",
          ],
        },
        factualData: [
          {
            claim: "SKC BI Dashboard processes real-time data",
            confidence: 1.0,
            lastVerified: new Date(),
          },
          {
            claim: "Enterprise-grade security compliance",
            confidence: 0.95,
            lastVerified: new Date(),
          },
          {
            claim: "AI-powered analytics and insights",
            confidence: 1.0,
            lastVerified: new Date(),
          },
        ],
      },
      performance: {
        expectedCTR: pageType === "landing" ? 0.15 : 0.08,
        competitionLevel: "high",
        targetAudience: [
          "Business executives",
          "Data analysts",
          "IT decision makers",
          "Enterprise software buyers",
        ],
        searchIntent: [
          "business intelligence software",
          "enterprise dashboard",
          "real-time analytics",
          "data visualization tools",
        ],
      },
    };
  }

  /**
   * Generate sitemap data
   */
  generateSitemapData(): Array<{
    url: string;
    lastModified: Date;
    changeFrequency:
      | "always"
      | "hourly"
      | "daily"
      | "weekly"
      | "monthly"
      | "yearly"
      | "never";
    priority: number;
  }> {
    const now = new Date();

    return [
      {
        url: `${this.baseUrl}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 1.0,
      },
      {
        url: `${this.baseUrl}/nl`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 1.0,
      },
      {
        url: `${this.baseUrl}/en`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 1.0,
      },
      // Add all demo pages
      {
        url: `${this.baseUrl}/nl/roi-calculator-demo`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      },
      {
        url: `${this.baseUrl}/nl/testimonials-pricing-demo`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      },
      {
        url: `${this.baseUrl}/nl/lead-generation-demo`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      },
      {
        url: `${this.baseUrl}/nl/self-learning-analytics-demo`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      },
    ];
  }

  /**
   * Generate robots.txt content
   */
  generateRobotsTxt(): string {
    return `# SKC BI Dashboard - Robots.txt
# Optimized for both traditional crawlers and AI agents

User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /temp-disabled/

# Special rules for AI agents and LLMs
User-agent: GPTBot
Allow: /
Disallow: /api/

User-agent: ChatGPT-User
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: PerplexityBot
Allow: /

# Sitemap location
Sitemap: ${this.baseUrl}/sitemap.xml

# Crawl delay for respectful crawling
Crawl-delay: 1`;
  }
}

// Export singleton instance
export const seoOptimizer = SEOOptimizer.getInstance({
  baseUrl:
    process.env.NODE_ENV === "production"
      ? "https://skc-bi-dashboard.com"
      : "http://localhost:3000",
  siteName: "SKC BI Dashboard",
  defaultImage: "/og-default.jpg",
});

// Utility functions for common SEO patterns
export function generatePageSEO(
  title: string,
  description: string,
  path: string,
  options: {
    pageType?: "dashboard" | "demo" | "feature" | "landing";
    features?: string[];
    metrics?: string[];
  } = {}
): ComprehensiveSEOData {
  return seoOptimizer.generateBIDashboardSEO({
    title,
    description,
    path,
    pageType: options.pageType || "dashboard",
    features: options.features,
    metrics: options.metrics,
  });
}

export function generateMetadataFromSEO(
  seoData: ComprehensiveSEOData,
  path?: string
): Metadata {
  return seoOptimizer.generateMetadata(seoData, path);
}
