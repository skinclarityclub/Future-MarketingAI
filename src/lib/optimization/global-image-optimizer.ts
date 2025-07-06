/**
 * Global Image Optimizer Service
 * Task 84.3: Auto-integrate image optimization across the entire app
 */

import { AdvancedImageOptimizer } from './advanced-image-optimizer';
import { ResourcePrefetcher } from './resource-prefetcher';

export interface GlobalOptimizationConfig {
  commandCenter: {
    enableAutoOptimization: boolean;
    avatarQuality: number;
    dashboardIconQuality: number;
    prefetchCriticalAssets: boolean;
  };
  landingPage: {
    enableAutoOptimization: boolean;
    heroImageQuality: number;
    featureImageQuality: number;
    enableLazyLoading: boolean;
  };
  dashboard: {
    enableAutoOptimization: boolean;
    chartImageQuality: number;
    widgetImageQuality: number;
  };
}

const DEFAULT_CONFIG: GlobalOptimizationConfig = {
  commandCenter: {
    enableAutoOptimization: true,
    avatarQuality: 90,
    dashboardIconQuality: 85,
    prefetchCriticalAssets: true,
  },
  landingPage: {
    enableAutoOptimization: true,
    heroImageQuality: 85,
    featureImageQuality: 80,
    enableLazyLoading: true,
  },
  dashboard: {
    enableAutoOptimization: true,
    chartImageQuality: 85,
    widgetImageQuality: 80,
  },
};

class GlobalImageOptimizer {
  private static instance: GlobalImageOptimizer;
  private config: GlobalOptimizationConfig;
  private optimizer: AdvancedImageOptimizer;
  private prefetcher: ResourcePrefetcher;
  private isInitialized = false;

  private constructor(config: Partial<GlobalOptimizationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.optimizer = new AdvancedImageOptimizer();
    this.prefetcher = new ResourcePrefetcher();
  }

  static getInstance(config?: Partial<GlobalOptimizationConfig>): GlobalImageOptimizer {
    if (!GlobalImageOptimizer.instance) {
      GlobalImageOptimizer.instance = new GlobalImageOptimizer(config);
    }
    return GlobalImageOptimizer.instance;
  }

  public initialize(pageType?: 'command-center' | 'landing-page' | 'dashboard'): void {
    if (typeof window === 'undefined' || this.isInitialized) return;

    this.isInitialized = true;

    // Initialize based on page type
    switch (pageType) {
      case 'command-center':
        this.initializeCommandCenter();
        break;
      case 'landing-page':
        this.initializeLandingPage();
        break;
      case 'dashboard':
        this.initializeDashboard();
        break;
      default:
        this.initializeGeneral();
    }

    // Set up DOM mutation observer for dynamic content
    this.setupMutationObserver();
  }

  private initializeCommandCenter(): void {
    if (!this.config.commandCenter.enableAutoOptimization) return;

    // Optimize existing images
    this.optimizeCommandCenterImages();

    // Prefetch critical assets
    if (this.config.commandCenter.prefetchCriticalAssets) {
      this.prefetchCommandCenterAssets();
    }
  }

  private initializeLandingPage(): void {
    if (!this.config.landingPage.enableAutoOptimization) return;

    // Optimize hero and above-the-fold images first
    this.optimizeHeroImages();

    // Set up lazy loading for below-the-fold content
    if (this.config.landingPage.enableLazyLoading) {
      this.setupLandingPageLazyLoading();
    }
  }

  private initializeDashboard(): void {
    if (!this.config.dashboard.enableAutoOptimization) return;

    // Optimize dashboard-specific images
    this.optimizeDashboardImages();
  }

  private initializeGeneral(): void {
    // General optimization for all images
    this.optimizeAllImages();
  }

  private optimizeCommandCenterImages(): void {
    // Optimize avatars with high quality
    const avatars = document.querySelectorAll('.avatar img, [data-avatar] img');
    avatars.forEach(img => {
      if (img instanceof HTMLImageElement) {
        this.replaceWithOptimized(img, {
          quality: this.config.commandCenter.avatarQuality,
          priority: false,
        });
      }
    });

    // Optimize dashboard icons
    const icons = document.querySelectorAll('.dashboard-icon img, [data-icon] img');
    icons.forEach(img => {
      if (img instanceof HTMLImageElement) {
        this.replaceWithOptimized(img, {
          quality: this.config.commandCenter.dashboardIconQuality,
          priority: false,
        });
      }
    });

    // Optimize background images
    const backgroundElements = document.querySelectorAll('[style*="background-image"]');
    backgroundElements.forEach(element => {
      this.optimizeBackgroundImage(element as HTMLElement);
    });
  }

  private optimizeHeroImages(): void {
    // Optimize hero section images with high priority
    const heroImages = document.querySelectorAll('.hero img, .hero-section img, [data-hero] img');
    heroImages.forEach((img, index) => {
      if (img instanceof HTMLImageElement) {
        this.replaceWithOptimized(img, {
          quality: this.config.landingPage.heroImageQuality,
          priority: index < 2, // First 2 hero images get priority
        });
      }
    });

    // Optimize feature images
    const featureImages = document.querySelectorAll('.feature img, .features img, [data-feature] img');
    featureImages.forEach(img => {
      if (img instanceof HTMLImageElement) {
        this.replaceWithOptimized(img, {
          quality: this.config.landingPage.featureImageQuality,
          priority: false,
        });
      }
    });
  }

  private optimizeDashboardImages(): void {
    // Optimize chart and graph images
    const chartImages = document.querySelectorAll('.chart img, .graph img, [data-chart] img');
    chartImages.forEach(img => {
      if (img instanceof HTMLImageElement) {
        this.replaceWithOptimized(img, {
          quality: this.config.dashboard.chartImageQuality,
          priority: false,
        });
      }
    });

    // Optimize widget images
    const widgetImages = document.querySelectorAll('.widget img, .card img, [data-widget] img');
    widgetImages.forEach(img => {
      if (img instanceof HTMLImageElement) {
        this.replaceWithOptimized(img, {
          quality: this.config.dashboard.widgetImageQuality,
          priority: false,
        });
      }
    });
  }

  private optimizeAllImages(): void {
    const allImages = document.querySelectorAll('img:not([data-optimized])');
    allImages.forEach(img => {
      if (img instanceof HTMLImageElement) {
        this.replaceWithOptimized(img, {
          quality: 85,
          priority: false,
        });
      }
    });
  }

  private replaceWithOptimized(img: HTMLImageElement, options: {
    quality: number;
    priority: boolean;
  }): void {
    if (img.dataset.optimized) return; // Already optimized

    const originalSrc = img.src;
    const format = this.optimizer.selectOptimalFormat(originalSrc);
    
    // Generate optimized URL
    const optimizedSrc = this.buildOptimizedUrl(originalSrc, {
      width: img.width || 800,
      height: img.height || 600,
      quality: options.quality,
      format,
    });

    // Replace with optimized version
    img.src = optimizedSrc;
    img.dataset.optimized = 'true';
    img.dataset.originalSrc = originalSrc;

    // Add loading strategy
    if (!options.priority) {
      img.loading = 'lazy';
    }

    // Generate and set srcset for responsive images
    const srcset = this.optimizer.generateSrcSet(originalSrc, format);
    if (srcset) {
      img.srcset = srcset;
      img.sizes = this.optimizer.generateSizes();
    }
  }

  private buildOptimizedUrl(src: string, options: {
    width: number;
    height: number;
    quality: number;
    format: string;
  }): string {
    const params = new URLSearchParams();
    params.set('url', src);
    params.set('w', options.width.toString());
    params.set('h', options.height.toString());
    params.set('q', options.quality.toString());
    params.set('fm', options.format);
    
    return `/_next/image?${params.toString()}`;
  }

  private optimizeBackgroundImage(element: HTMLElement): void {
    const style = element.style.backgroundImage;
    const matches = style.match(/url\(["']?([^"')]+)["']?\)/);
    
    if (matches && matches[1]) {
      const originalUrl = matches[1];
      const format = this.optimizer.selectOptimalFormat(originalUrl);
      const optimizedUrl = this.buildOptimizedUrl(originalUrl, {
        width: 1920,
        height: 1080,
        quality: 85,
        format,
      });
      
      element.style.backgroundImage = `url(${optimizedUrl})`;
      element.dataset.optimized = 'true';
    }
  }

  private setupLandingPageLazyLoading(): void {
    // Set up intersection observer for lazy loading
    const lazyImages = document.querySelectorAll('img[data-lazy], [data-lazy] img');
    
    if (lazyImages.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.target instanceof HTMLImageElement) {
          this.replaceWithOptimized(entry.target, {
            quality: this.config.landingPage.featureImageQuality,
            priority: false,
          });
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.1,
    });

    lazyImages.forEach(img => observer.observe(img));
  }

  private prefetchCommandCenterAssets(): void {
    const criticalAssets = [
      '/ai-avatar.svg',
      '/ai-avatar.png',
      '/company-logo.svg',
      '/favicon.ico',
    ];

    criticalAssets.forEach(asset => {
      this.prefetcher.prefetch(asset, {
        type: 'image',
        priority: 'high',
      });
    });
  }

  private setupMutationObserver(): void {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node instanceof HTMLElement) {
            // Check for new images
            const newImages = node.querySelectorAll('img:not([data-optimized])');
            newImages.forEach(img => {
              if (img instanceof HTMLImageElement) {
                this.replaceWithOptimized(img, {
                  quality: 85,
                  priority: false,
                });
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

  public destroy(): void {
    this.optimizer.destroy?.();
    this.prefetcher.destroy?.();
    this.isInitialized = false;
  }
}

// Export singleton instance
export const globalImageOptimizer = GlobalImageOptimizer.getInstance();

// Auto-initialize based on current page
export function autoInitializeImageOptimization(): void {
  if (typeof window === 'undefined') return;

  const pathname = window.location.pathname;
  let pageType: 'command-center' | 'landing-page' | 'dashboard' | undefined;

  if (pathname.includes('/command-center')) {
    pageType = 'command-center';
  } else if (pathname === '/' || pathname.includes('/en') || pathname.includes('/nl')) {
    pageType = 'landing-page';
  } else if (pathname.includes('dashboard') || pathname.includes('finance') || pathname.includes('marketing')) {
    pageType = 'dashboard';
  }

  globalImageOptimizer.initialize(pageType);
}

export default GlobalImageOptimizer; 