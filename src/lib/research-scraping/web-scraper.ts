/**
 * Web Scraping Engine Core Implementation
 * Task 36.14: Web Scraping Engine
 *
 * Main scraping engine for competitor and market data collection
 */

import {
  ScrapingTarget,
  ScrapingResult,
  SCRAPING_CONFIG,
} from "./scraper-config";
import { createClient } from "@supabase/supabase-js";

// Mock browser automation (in real implementation, would use Puppeteer/Playwright)
interface BrowserPage {
  goto: (url: string) => Promise<void>;
  waitForSelector: (selector: string) => Promise<void>;
  $eval: (selector: string, fn: (el: Element) => any) => Promise<any>;
  $$eval: (selector: string, fn: (els: Element[]) => any) => Promise<any>;
  content: () => Promise<string>;
  close: () => Promise<void>;
}

export class WebScraper {
  private isRunning = false;
  private currentScrapes = 0;
  private lastRequestTime = 0;
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
      console.warn("Supabase configuration missing for web scraper");
    }
  }

  /**
   * Main scraping method for a single target
   */
  async scrapeTarget(target: ScrapingTarget): Promise<ScrapingResult> {
    const startTime = Date.now();

    try {
      // Rate limiting
      await this.enforceRateLimit(target.scrapeConfig.rateLimit);

      // Check concurrent scrapes limit
      if (this.currentScrapes >= SCRAPING_CONFIG.maxConcurrentScrapes) {
        throw new Error("Maximum concurrent scrapes reached");
      }

      this.currentScrapes++;

      console.log(`Starting scrape for target: ${target.name} (${target.url})`);

      // Mock browser page (replace with real Puppeteer/Playwright implementation)
      const page = await this.createBrowserPage();

      // Navigate to target URL
      await page.goto(target.url);

      // Wait for content to load
      if (target.scrapeConfig.waitForSelector) {
        await page.waitForSelector(target.scrapeConfig.waitForSelector);
      }

      // Extract data based on selectors
      const extractedData = await this.extractDataFromPage(page, target);

      // Clean up
      await page.close();

      const result: ScrapingResult = {
        targetId: target.id,
        url: target.url,
        timestamp: new Date(),
        success: true,
        data: extractedData,
        responseTime: Date.now() - startTime,
        statusCode: 200,
      };

      // Store results in database
      await this.storeScrapingResult(result, target);

      console.log(
        `Scrape completed for ${target.name}: ${result.responseTime}ms`
      );

      return result;
    } catch (error) {
      const result: ScrapingResult = {
        targetId: target.id,
        url: target.url,
        timestamp: new Date(),
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        responseTime: Date.now() - startTime,
      };

      console.error(`Scrape failed for ${target.name}:`, error);
      await this.storeScrapingResult(result, target);

      return result;
    } finally {
      this.currentScrapes--;
    }
  }

  /**
   * Extract data from a web page using configured selectors
   */
  private async extractDataFromPage(page: BrowserPage, target: ScrapingTarget) {
    const { selectors } = target.scrapeConfig;
    const extractedData: any = {};

    try {
      // Extract title
      if (selectors.title) {
        extractedData.title = await page.$eval(selectors.title, el =>
          el.textContent?.trim()
        );
      }

      // Extract main content
      if (selectors.content) {
        extractedData.content = await page.$eval(selectors.content, el => {
          // Clean HTML and extract text
          const text = el.textContent?.trim();
          return text?.substring(
            0,
            SCRAPING_CONFIG.extraction.maxContentLength
          );
        });
      }

      // Extract metadata
      if (selectors.meta) {
        extractedData.meta = await page.$eval(selectors.meta, el => {
          if (el.tagName === "META") {
            return (el as HTMLMetaElement).content;
          }
          return el.textContent?.trim();
        });
      }

      // Extract dates
      if (selectors.dates) {
        extractedData.dates = await page.$$eval(selectors.dates, els =>
          els.map(el => el.textContent?.trim()).filter(Boolean)
        );
      }

      // Extract links
      if (selectors.links && SCRAPING_CONFIG.extraction.extractLinks) {
        extractedData.links = await page.$$eval(selectors.links, els =>
          els.map(el => (el as HTMLAnchorElement).href).filter(Boolean)
        );
      }

      // Extract images
      if (selectors.images && SCRAPING_CONFIG.extraction.extractImages) {
        extractedData.images = await page.$$eval(selectors.images, els =>
          els.map(el => (el as HTMLImageElement).src).filter(Boolean)
        );
      }

      return extractedData;
    } catch (error) {
      console.error("Data extraction error:", error);
      return extractedData;
    }
  }

  /**
   * Store scraping results in the database
   */
  private async storeScrapingResult(
    result: ScrapingResult,
    target: ScrapingTarget
  ): Promise<void> {
    try {
      // Store in content_research table (extending existing schema)
      const { error } = await this.supabase.from("content_research").insert({
        research_type: "web_scraping",
        source_url: result.url,
        content_data: {
          targetId: result.targetId,
          targetName: target.name,
          targetCategory: target.category,
          targetType: target.type,
          scrapingResult: result,
          extractedData: result.data,
        },
        insights: result.success
          ? "Scraping completed successfully"
          : `Scraping failed: ${result.error}`,
        confidence_score: result.success ? 0.8 : 0.1,
        status: result.success ? "completed" : "failed",
      });

      if (error) {
        console.error("Database storage error:", error);
      }

      // Update scraping target last_scrape_at timestamp
      await this.updateTargetTimestamp(target.id);
    } catch (error) {
      console.error("Failed to store scraping result:", error);
    }
  }

  /**
   * Update target's last scrape timestamp
   */
  private async updateTargetTimestamp(targetId: string): Promise<void> {
    // In a full implementation, this would update a scraping_targets table
    // For now, we'll log it
    console.log(`Updated last scrape timestamp for target: ${targetId}`);
  }

  /**
   * Enforce rate limiting between requests
   */
  private async enforceRateLimit(targetRateLimit: number): Promise<void> {
    const now = Date.now();
    const globalDelay = SCRAPING_CONFIG.globalRateLimit;
    const targetDelay = targetRateLimit;
    const requiredDelay = Math.max(globalDelay, targetDelay);

    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < requiredDelay) {
      const waitTime = requiredDelay - timeSinceLastRequest;
      console.log(`Rate limiting: waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Mock browser page creation (replace with real Puppeteer/Playwright)
   */
  private async createBrowserPage(): Promise<BrowserPage> {
    // This is a mock implementation
    // In a real implementation, this would use Puppeteer or Playwright
    return {
      goto: async (url: string) => {
        console.log(`[MOCK] Navigating to: ${url}`);
      },
      waitForSelector: async (selector: string) => {
        console.log(`[MOCK] Waiting for selector: ${selector}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      },
      $eval: async (selector: string, fn: (el: Element) => any) => {
        console.log(`[MOCK] Evaluating selector: ${selector}`);
        // Return mock data based on selector
        if (selector.includes("title") || selector.includes("h1")) {
          return "Mock Article Title - Latest Industry Trends";
        }
        if (selector.includes("content") || selector.includes("article")) {
          return "Mock article content about the latest industry trends and competitor analysis...";
        }
        if (selector.includes("meta")) {
          return "Mock meta description for SEO optimization";
        }
        return "Mock extracted data";
      },
      $$eval: async (selector: string, fn: (els: Element[]) => any) => {
        console.log(`[MOCK] Evaluating multiple selectors: ${selector}`);
        if (selector.includes("link") || selector.includes("a[href]")) {
          return ["https://example.com/link1", "https://example.com/link2"];
        }
        if (selector.includes("date") || selector.includes("time")) {
          return ["2024-01-15", "2024-01-14"];
        }
        return ["Mock data 1", "Mock data 2"];
      },
      content: async () => {
        return "<html><body>Mock HTML content</body></html>";
      },
      close: async () => {
        console.log("[MOCK] Closing browser page");
      },
    };
  }

  /**
   * Scrape multiple targets concurrently
   */
  async scrapeMultipleTargets(
    targets: ScrapingTarget[]
  ): Promise<ScrapingResult[]> {
    const results: ScrapingResult[] = [];
    const enabledTargets = targets.filter(target => target.enabled);

    console.log(
      `Starting scraping session for ${enabledTargets.length} targets`
    );

    // Process targets in batches to respect concurrency limits
    const batchSize = SCRAPING_CONFIG.maxConcurrentScrapes;

    for (let i = 0; i < enabledTargets.length; i += batchSize) {
      const batch = enabledTargets.slice(i, i + batchSize);
      const batchPromises = batch.map(target => this.scrapeTarget(target));

      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach((result, index) => {
        if (result.status === "fulfilled") {
          results.push(result.value);
        } else {
          console.error(
            `Batch scraping failed for ${batch[index].name}:`,
            result.reason
          );
          results.push({
            targetId: batch[index].id,
            url: batch[index].url,
            timestamp: new Date(),
            success: false,
            error: result.reason?.message || "Batch processing failed",
            responseTime: 0,
          });
        }
      });

      // Wait between batches
      if (i + batchSize < enabledTargets.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(
      `Scraping session completed. Success: ${results.filter(r => r.success).length}/${results.length}`
    );

    return results;
  }

  /**
   * Check if scraper is currently running
   */
  isScrapingActive(): boolean {
    return this.isRunning || this.currentScrapes > 0;
  }

  /**
   * Get scraping statistics
   */
  getScrapingStats() {
    return {
      isRunning: this.isRunning,
      currentScrapes: this.currentScrapes,
      maxConcurrentScrapes: SCRAPING_CONFIG.maxConcurrentScrapes,
      lastRequestTime: this.lastRequestTime,
    };
  }
}

export default WebScraper;
