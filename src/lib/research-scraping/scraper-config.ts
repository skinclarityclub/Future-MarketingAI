/**
 * Web Scraping Engine Configuration
 * Task 36.14: Web Scraping Engine
 *
 * Configuration for competitor data collection and market research scraping
 */

export interface ScrapingTarget {
  id: string;
  name: string;
  url: string;
  type: "website" | "social" | "news" | "blog";
  category: "competitor" | "market" | "trends" | "keywords";
  scrapeConfig: {
    selectors: {
      title?: string;
      content?: string;
      meta?: string;
      dates?: string;
      links?: string;
      images?: string;
    };
    waitForSelector?: string;
    rateLimit: number; // milliseconds between requests
    maxPages?: number;
    followPagination?: boolean;
  };
  headers?: Record<string, string>;
  enabled: boolean;
  lastScrapeAt?: Date;
  nextScrapeAt?: Date;
  scrapeFrequency: "hourly" | "daily" | "weekly" | "monthly";
}

export interface ScrapingResult {
  targetId: string;
  url: string;
  timestamp: Date;
  success: boolean;
  data?: {
    title?: string;
    content?: string;
    meta?: Record<string, any>;
    links?: string[];
    images?: string[];
    extractedData?: Record<string, any>;
  };
  error?: string;
  responseTime: number;
  statusCode?: number;
}

export const DEFAULT_SCRAPING_TARGETS: ScrapingTarget[] = [
  // Competitor Analysis Targets
  {
    id: "competitor-blog-1",
    name: "Competitor Blog Posts",
    url: "https://example-competitor.com/blog",
    type: "blog",
    category: "competitor",
    scrapeConfig: {
      selectors: {
        title: "h1, .post-title, .entry-title",
        content: ".post-content, .entry-content, article",
        meta: 'meta[name="description"]',
        dates: ".post-date, .published, time",
        links: "a[href]",
      },
      waitForSelector: "article, .post",
      rateLimit: 2000,
      maxPages: 50,
      followPagination: true,
    },
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    enabled: true,
    scrapeFrequency: "daily",
  },

  // Market Trends Targets
  {
    id: "industry-news-1",
    name: "Industry News Source",
    url: "https://example-industry-news.com",
    type: "news",
    category: "trends",
    scrapeConfig: {
      selectors: {
        title: "h1, .headline, .news-title",
        content: ".article-body, .news-content",
        meta: 'meta[name="keywords"]',
        dates: ".news-date, .timestamp",
      },
      waitForSelector: ".article, .news-item",
      rateLimit: 3000,
      maxPages: 20,
    },
    enabled: true,
    scrapeFrequency: "hourly",
  },

  // Social Media Targets (Meta/X/LinkedIn)
  {
    id: "social-trends-1",
    name: "Social Media Trends",
    url: "https://trends.example-social.com",
    type: "social",
    category: "trends",
    scrapeConfig: {
      selectors: {
        title: ".trend-title, .hashtag",
        content: ".trend-description, .post-content",
        meta: ".engagement-stats, .trend-stats",
      },
      waitForSelector: ".trend-item, .post",
      rateLimit: 5000, // Respect social platform limits
      maxPages: 10,
    },
    enabled: false, // Requires API access for real implementation
    scrapeFrequency: "daily",
  },
];

export const SCRAPING_CONFIG = {
  // Global rate limiting
  globalRateLimit: 1000, // milliseconds between any requests
  maxConcurrentScrapes: 3,
  requestTimeout: 30000, // 30 seconds
  retries: 3,
  retryDelay: 5000,

  // Browser configuration for Puppeteer/Playwright
  browserConfig: {
    headless: true,
    viewport: { width: 1920, height: 1080 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    timeout: 30000,
  },

  // Data extraction settings
  extraction: {
    maxContentLength: 50000,
    cleanHtml: true,
    extractImages: true,
    extractLinks: true,
    extractMetadata: true,
  },

  // Storage settings
  storage: {
    saveRawHtml: false,
    compressData: true,
    maxStorageAge: 90, // days
  },

  // Compliance & Ethics
  compliance: {
    respectRobotsTxt: true,
    respectCrawlDelay: true,
    maxRequestsPerDomain: 100,
    blacklistedDomains: [],
    requireUserConsent: true,
  },
} as const;

export type ScrapingConfigType = typeof SCRAPING_CONFIG;
