"use client";

/**
 * Comprehensive Asset Optimization Service
 * Task 84.3: Image and Asset Optimization
 *
 * Orchestrates all optimization features:
 * - Advanced image optimization with WebP/AVIF
 * - Smart resource prefetching
 * - Performance monitoring
 * - Enterprise-grade caching
 */

import React from "react";
import {
  AdvancedImageOptimizer,
  type ImageOptimizationConfig,
} from "./advanced-image-optimizer";
import {
  ResourcePrefetcher,
  type PrefetchConfig,
  type ResourcePriority,
} from "./resource-prefetcher";

export interface AssetOptimizationConfig {
  imageOptimization: Partial<ImageOptimizationConfig>;
  prefetching: Partial<PrefetchConfig>;
  enablePerformanceTracking: boolean;
  enableAutomaticOptimization: boolean;
  criticalAssets: string[];
}

export interface OptimizationMetrics {
  totalAssetsOptimized: number;
  totalBytesSaved: number;
  avgLoadTime: number;
  formatDistribution: Record<string, number>;
  prefetchHitRate: number;
}

const DEFAULT_CONFIG: AssetOptimizationConfig = {
  imageOptimization: {
    preferredFormats: ["avif", "webp", "jpeg"],
    defaultQuality: 85,
    enablePrefetch: true,
  },
  prefetching: {
    enableIntersectionObserver: true,
    maxConcurrentPrefetches: 3,
  },
  enablePerformanceTracking: true,
  enableAutomaticOptimization: true,
  criticalAssets: [],
};

// Command Center and Landing Page selectors
const COMMAND_CENTER_SELECTORS = [
  ".command-center",
  ".dashboard-widget",
  ".ai-avatar-container",
  '[data-component="command-center"]',
];

const LANDING_PAGE_SELECTORS = [
  ".hero-section",
  ".feature-section",
  ".dashboard-preview",
  '[data-component="landing-page"]',
];

export class AssetOptimizationService {
  private static instance: AssetOptimizationService | null = null;
  private config: AssetOptimizationConfig;
  private imageOptimizer: AdvancedImageOptimizer;
  private resourcePrefetcher: ResourcePrefetcher;
  private metrics: OptimizationMetrics;
  private initialized = false;

  constructor(config: Partial<AssetOptimizationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Initialize optimizers
    this.imageOptimizer = new AdvancedImageOptimizer(
      this.config.imageOptimization
    );
    this.resourcePrefetcher = new ResourcePrefetcher(this.config.prefetching);

    // Initialize metrics
    this.metrics = {
      totalAssetsOptimized: 0,
      totalBytesSaved: 0,
      avgLoadTime: 0,
      formatDistribution: {},
      prefetchHitRate: 0,
    };
  }

  // Singleton pattern
  static getInstance(
    config?: Partial<AssetOptimizationConfig>
  ): AssetOptimizationService {
    if (!AssetOptimizationService.instance) {
      AssetOptimizationService.instance = new AssetOptimizationService(config);
    }
    return AssetOptimizationService.instance;
  }

  // ==================== INITIALIZATION ====================

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Prefetch critical assets
      if (this.config.criticalAssets.length > 0) {
        await this.prefetchCriticalAssets();
      }

      // Setup performance monitoring
      if (this.config.enablePerformanceTracking) {
        this.setupPerformanceMonitoring();
      }

      // Enable automatic optimization if configured
      if (this.config.enableAutomaticOptimization) {
        this.enableAutomaticOptimization();
      }

      this.initialized = true;
      console.log("AssetOptimizationService initialized");
    } catch (error) {
      console.error("Failed to initialize AssetOptimizationService:", error);
    }
  }

  // ==================== IMAGE OPTIMIZATION ====================

  async optimizeImage(
    src: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      priority?: boolean;
    } = {}
  ) {
    const startTime = performance.now();

    try {
      const optimized = await this.imageOptimizer.optimizeImage(src, options);

      // Track metrics
      const loadTime = performance.now() - startTime;
      this.updateMetrics(optimized.format, loadTime);

      return optimized;
    } catch (error) {
      console.error("Image optimization failed:", error);
      throw error;
    }
  }

  private optimizeImageElement(
    img: HTMLImageElement,
    options: {
      quality?: number;
      priority?: boolean;
    } = {}
  ): void {
    if (img.dataset.optimized) return;

    const { quality = 85, priority = false } = options;

    // Mark as being optimized
    img.dataset.optimized = "true";

    // Apply optimization attributes
    if (priority) {
      img.setAttribute("loading", "eager");
      img.setAttribute("fetchpriority", "high");
    } else {
      img.setAttribute("loading", "lazy");
    }

    // Add decode attribute for better performance
    img.setAttribute("decoding", "async");
  }

  private setupLazyLoading(img: HTMLImageElement): void {
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const image = entry.target as HTMLImageElement;
              if (image.dataset.src) {
                image.src = image.dataset.src;
                image.removeAttribute("data-src");
              }
              observer.unobserve(image);
            }
          });
        },
        { rootMargin: "50px" }
      );

      observer.observe(img);
    }
  }

  // ==================== RESOURCE PREFETCHING ====================

  private async prefetchCriticalAssets(): Promise<void> {
    const criticalResources: ResourcePriority[] =
      this.config.criticalAssets.map((src, index) => ({
        src,
        priority: index < 3 ? "critical" : "high",
        type: this.detectAssetType(src),
      }));

    this.resourcePrefetcher.prefetchCriticalResources(criticalResources);
  }

  prefetchAsset(
    src: string,
    priority: ResourcePriority["priority"] = "medium"
  ): void {
    this.resourcePrefetcher.addToPrefetchQueue({
      src,
      priority,
      type: this.detectAssetType(src),
    });
  }

  private prefetchCriticalAssetsArray(assets: string[]): void {
    assets.forEach((asset, index) => {
      this.resourcePrefetcher.addToPrefetchQueue({
        src: asset,
        priority: index < 3 ? "critical" : "high",
        type: this.detectAssetType(asset),
      });
    });
  }

  observeElementForPrefetch(
    element: HTMLElement,
    src: string,
    priority?: ResourcePriority["priority"]
  ): void {
    this.resourcePrefetcher.observeElement(element, src, priority);
  }

  // ==================== PERFORMANCE MONITORING ====================

  private setupPerformanceMonitoring(): void {
    if (typeof window === "undefined") return;

    // Monitor Largest Contentful Paint
    const lcpObserver = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === "largest-contentful-paint") {
          this.trackLCP(entry.startTime);
        }
      }
    });

    lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });

    // Monitor First Input Delay
    const fidObserver = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === "first-input") {
          const fid = entry.startTime;
          this.trackFID(fid);
        }
      }
    });

    fidObserver.observe({ entryTypes: ["first-input"] });
  }

  private trackLCP(lcp: number): void {
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "lcp", {
        event_category: "Web Vitals",
        value: Math.round(lcp),
        metric_id: "lcp",
      });
    }
  }

  private trackFID(fid: number): void {
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "fid", {
        event_category: "Web Vitals",
        value: Math.round(fid),
        metric_id: "fid",
      });
    }
  }

  // ==================== METRICS TRACKING ====================

  private updateMetrics(format: string, loadTime: number): void {
    this.metrics.totalAssetsOptimized++;

    // Update format distribution
    this.metrics.formatDistribution[format] =
      (this.metrics.formatDistribution[format] || 0) + 1;

    // Update average load time
    const total =
      this.metrics.avgLoadTime * (this.metrics.totalAssetsOptimized - 1) +
      loadTime;
    this.metrics.avgLoadTime = total / this.metrics.totalAssetsOptimized;
  }

  // ==================== AUTOMATIC OPTIMIZATION ====================

  enableAutomaticOptimization(): void {
    if (!this.config.enableAutomaticOptimization) return;

    // Auto-optimize all images on the page
    this.optimizeExistingImages();

    // Setup mutation observer for new images
    this.setupImageMutationObserver();
  }

  private optimizeExistingImages(): void {
    const images = document.querySelectorAll("img[src]");

    images.forEach(img => {
      const src = (img as HTMLImageElement).src;

      if (src && !src.includes("/_next/image")) {
        this.observeElementForPrefetch(img as HTMLElement, src, "medium");
      }
    });
  }

  private setupImageMutationObserver(): void {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;

            // Check if it's an image
            if (element.tagName === "IMG") {
              const img = element as HTMLImageElement;
              if (img.src && !img.src.includes("/_next/image")) {
                this.observeElementForPrefetch(img, img.src, "medium");
              }
            }

            // Check for images within the added element
            const images = element.querySelectorAll("img[src]");
            images.forEach(img => {
              const src = (img as HTMLImageElement).src;
              if (src && !src.includes("/_next/image")) {
                this.observeElementForPrefetch(
                  img as HTMLElement,
                  src,
                  "medium"
                );
              }
            });
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  private detectAssetType(src: string): ResourcePriority["type"] {
    const ext = src.split(".").pop()?.toLowerCase();

    switch (ext) {
      case "jpg":
      case "jpeg":
      case "png":
      case "webp":
      case "avif":
      case "svg":
        return "image";
      case "css":
        return "style";
      case "js":
      case "ts":
        return "script";
      case "woff":
      case "woff2":
      case "ttf":
      case "otf":
        return "font";
      default:
        return "fetch";
    }
  }

  // ==================== PUBLIC API ====================

  getMetrics(): OptimizationMetrics {
    const prefetchStats = this.resourcePrefetcher.getStats();

    return {
      ...this.metrics,
      prefetchHitRate:
        prefetchStats.totalPrefetched / (prefetchStats.totalQueued || 1),
    };
  }

  updateConfig(newConfig: Partial<AssetOptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  async generateOptimizationReport(): Promise<{
    summary: string;
    recommendations: string[];
    metrics: OptimizationMetrics;
  }> {
    const metrics = this.getMetrics();

    const recommendations: string[] = [];

    // Analyze format distribution
    const avifUsage = metrics.formatDistribution["avif"] || 0;
    const webpUsage = metrics.formatDistribution["webp"] || 0;
    const jpegUsage = metrics.formatDistribution["jpeg"] || 0;

    if (jpegUsage > avifUsage + webpUsage) {
      recommendations.push(
        "Consider converting more images to AVIF/WebP for better compression"
      );
    }

    if (metrics.avgLoadTime > 200) {
      recommendations.push(
        "Average image load time is high. Consider reducing image sizes or improving compression"
      );
    }

    if (metrics.prefetchHitRate < 0.7) {
      recommendations.push(
        "Prefetch hit rate is low. Review prefetch strategy"
      );
    }

    return {
      summary: `Optimized ${metrics.totalAssetsOptimized} assets with ${metrics.totalBytesSaved}KB saved`,
      recommendations,
      metrics,
    };
  }

  // ==================== PAGE-SPECIFIC OPTIMIZATIONS ====================

  private optimizeCommandCenter(): void {
    // Optimize dashboard widget images
    COMMAND_CENTER_SELECTORS.forEach(selector => {
      const elements = document.querySelectorAll(`${selector} img`);
      elements.forEach(img =>
        this.optimizeImageElement(img as HTMLImageElement)
      );
    });

    // Optimize avatar images specifically
    const avatars = document.querySelectorAll(
      '[class*="avatar"] img, [role="img"]'
    );
    avatars.forEach(img => {
      if (img instanceof HTMLImageElement) {
        this.optimizeImageElement(img, { priority: false, quality: 90 });
      }
    });

    // Prefetch critical Command Center assets
    this.prefetchCriticalAssetsArray([
      "/ai-avatar.svg",
      "/ai-avatar.png",
      "/company-logo.svg",
    ]);
  }

  private optimizeLandingPage(): void {
    // Optimize hero and feature images with high priority
    LANDING_PAGE_SELECTORS.forEach(selector => {
      const elements = document.querySelectorAll(`${selector} img`);
      elements.forEach((img, index) => {
        if (img instanceof HTMLImageElement) {
          this.optimizeImageElement(img, {
            priority: index < 3, // First 3 images get priority
            quality: 85,
          });
        }
      });
    });

    // Lazy load below-the-fold images
    const belowFoldImages = document.querySelectorAll(
      '[data-optimize="lazy"] img'
    );
    belowFoldImages.forEach(img => {
      if (img instanceof HTMLImageElement) {
        this.setupLazyLoading(img);
      }
    });
  }

  // Command Center specific initialization
  private initializeCommandCenterOptimization(): void {
    this.initialize();

    // Optimize Command Center specific elements
    setTimeout(() => {
      // Avatar optimization
      const avatars = document.querySelectorAll(
        '.avatar img, [class*="avatar"] img'
      );
      avatars.forEach(img => {
        if (img instanceof HTMLImageElement && !img.dataset.optimized) {
          this.optimizeImageElement(img, { quality: 90, priority: false });
        }
      });

      // Dashboard icon optimization
      const icons = document.querySelectorAll(
        '[class*="icon"] img, .dashboard-icon img'
      );
      icons.forEach(img => {
        if (img instanceof HTMLImageElement && !img.dataset.optimized) {
          this.optimizeImageElement(img, { quality: 85, priority: false });
        }
      });

      // Prefetch critical Command Center assets
      this.prefetchAsset("/ai-avatar.svg", "high");
    }, 100);
  }

  private initializeLandingPageOptimization(): void {
    this.initialize();
    this.optimizeLandingPage();
  }

  private initializeDashboardOptimization(): void {
    this.initialize();

    // Dashboard-specific optimizations
    setTimeout(() => {
      const chartImages = document.querySelectorAll(
        '.chart img, [class*="chart"] img'
      );
      chartImages.forEach(img => {
        if (img instanceof HTMLImageElement && !img.dataset.optimized) {
          this.optimizeImageElement(img, { quality: 85, priority: false });
        }
      });
    }, 100);
  }

  // Auto-initialize based on current page
  private autoInitializeImageOptimization(): void {
    if (typeof window === "undefined") return;

    const pathname = window.location.pathname;
    let pageType: "command-center" | "landing-page" | "dashboard" | "general" =
      "general";

    if (pathname.includes("/command-center")) {
      pageType = "command-center";
    } else if (
      pathname === "/" ||
      pathname.includes("/en") ||
      pathname.includes("/nl")
    ) {
      pageType = "landing-page";
    } else if (
      pathname.includes("dashboard") ||
      pathname.includes("finance") ||
      pathname.includes("marketing")
    ) {
      pageType = "dashboard";
    }

    // Initialize based on page type
    switch (pageType) {
      case "command-center":
        this.initializeCommandCenterOptimization();
        break;
      case "landing-page":
        this.initializeLandingPageOptimization();
        break;
      case "dashboard":
        this.initializeDashboardOptimization();
        break;
      default:
        this.initialize();
    }
  }

  // ==================== CLEANUP ====================

  destroy(): void {
    this.resourcePrefetcher.destroy();
    AssetOptimizationService.instance = null;
  }
}

// ==================== REACT HOOK ====================

export function useAssetOptimization(
  config?: Partial<AssetOptimizationConfig>
) {
  const [metrics, setMetrics] = React.useState<OptimizationMetrics>({
    totalAssetsOptimized: 0,
    totalBytesSaved: 0,
    avgLoadTime: 0,
    formatDistribution: {},
    prefetchHitRate: 0,
  });

  const service = React.useMemo(
    () => AssetOptimizationService.getInstance(config),
    [config]
  );

  React.useEffect(() => {
    // Initialize service
    service.initialize();

    // Update metrics periodically
    const interval = setInterval(() => {
      setMetrics(service.getMetrics());
    }, 5000);

    return () => {
      clearInterval(interval);
      // Don't destroy service as it might be used elsewhere
    };
  }, [service]);

  const optimizeImage = React.useCallback(
    (src: string, options?: any) => service.optimizeImage(src, options),
    [service]
  );

  const prefetchAsset = React.useCallback(
    (src: string, priority?: ResourcePriority["priority"]) =>
      service.prefetchAsset(src, priority),
    [service]
  );

  return {
    service,
    metrics,
    optimizeImage,
    prefetchAsset,
  };
}

// ==================== SINGLETON INSTANCE ====================

let globalAssetOptimizer: AssetOptimizationService | null = null;

export function getGlobalAssetOptimizer(
  config?: Partial<AssetOptimizationConfig>
): AssetOptimizationService {
  if (!globalAssetOptimizer) {
    globalAssetOptimizer = new AssetOptimizationService(config);
    globalAssetOptimizer.initialize();
  }
  return globalAssetOptimizer;
}

// Auto-initialize function (exported for external use)
export function autoInitializeImageOptimization(): void {
  const service = AssetOptimizationService.getInstance();
  service["autoInitializeImageOptimization"]();
}

export default AssetOptimizationService;
