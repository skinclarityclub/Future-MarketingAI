"use client";

/**
 * Advanced Image Optimization System
 * Task 84.3: Image and Asset Optimization
 */

export interface ImageOptimizationConfig {
  preferredFormats: ImageFormat[];
  fallbackFormat: ImageFormat;
  defaultQuality: number;
  breakpoints: ResponsiveBreakpoint[];
  enablePrefetch: boolean;
  enableLazyLoading: boolean;
  cacheTTL: number;
}

export interface ResponsiveBreakpoint {
  name: string;
  width: number;
  quality?: number;
  format?: ImageFormat;
}

export type ImageFormat = 'webp' | 'avif' | 'jpeg' | 'png' | 'svg';

export interface OptimizedImageData {
  originalSrc: string;
  optimizedSrc: string;
  srcSet: string;
  sizes: string;
  format: ImageFormat;
  width: number;
  height: number;
  quality: number;
}

const DEFAULT_CONFIG: ImageOptimizationConfig = {
  preferredFormats: ['avif', 'webp', 'jpeg'],
  fallbackFormat: 'jpeg',
  defaultQuality: 85,
  breakpoints: [
    { name: 'mobile', width: 480, quality: 75 },
    { name: 'tablet', width: 768, quality: 80 },
    { name: 'desktop', width: 1200, quality: 85 },
    { name: 'large', width: 1920, quality: 90 },
  ],
  enablePrefetch: true,
  enableLazyLoading: true,
  cacheTTL: 86400,
};

export class AdvancedImageOptimizer {
  private config: ImageOptimizationConfig;
  private cache: Map<string, OptimizedImageData>;

  constructor(config: Partial<ImageOptimizationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.cache = new Map();
  }

  static detectBrowserSupport() {
    if (typeof window === 'undefined') {
      return { webp: false, avif: false, srcset: false };
    }

    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;

    return {
      webp: canvas.toDataURL('image/webp').indexOf('image/webp') === 5,
      avif: canvas.toDataURL('image/avif').indexOf('image/avif') === 5,
      srcset: 'srcset' in document.createElement('img'),
    };
  }

  selectOptimalFormat(originalFormat: string): ImageFormat {
    const support = AdvancedImageOptimizer.detectBrowserSupport();
    
    for (const format of this.config.preferredFormats) {
      if (format === 'avif' && support.avif) return 'avif';
      if (format === 'webp' && support.webp) return 'webp';
      if (format === originalFormat) return originalFormat as ImageFormat;
    }
    
    return this.config.fallbackFormat;
  }

  generateSrcSet(baseSrc: string, format: ImageFormat): string {
    const srcSetEntries = this.config.breakpoints.map(breakpoint => {
      const optimizedSrc = this.buildOptimizedUrl(baseSrc, {
        width: breakpoint.width,
        quality: breakpoint.quality || this.config.defaultQuality,
        format,
      });
      return `${optimizedSrc} ${breakpoint.width}w`;
    });
    
    return srcSetEntries.join(', ');
  }

  private buildOptimizedUrl(src: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: ImageFormat;
  }): string {
    const params = new URLSearchParams();
    
    params.append('url', src);
    if (options.width) params.append('w', options.width.toString());
    if (options.height) params.append('h', options.height.toString());
    if (options.quality) params.append('q', options.quality.toString());
    if (options.format) params.append('f', options.format);
    
    return `/_next/image?${params.toString()}`;
  }

  async optimizeImage(src: string, options: {
    width?: number;
    height?: number;
    quality?: number;
  } = {}): Promise<OptimizedImageData> {
    const cacheKey = `${src}-${JSON.stringify(options)}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const originalFormat = this.getFileExtension(src);
    const optimalFormat = this.selectOptimalFormat(originalFormat);
    
    const optimizedData: OptimizedImageData = {
      originalSrc: src,
      optimizedSrc: this.buildOptimizedUrl(src, {
        ...options,
        format: optimalFormat,
        quality: options.quality || this.config.defaultQuality,
      }),
      srcSet: this.generateSrcSet(src, optimalFormat),
      sizes: this.generateSizes(),
      format: optimalFormat,
      width: options.width || 0,
      height: options.height || 0,
      quality: options.quality || this.config.defaultQuality,
    };

    this.cache.set(cacheKey, optimizedData);
    return optimizedData;
  }

  generateSizes(): string {
    const sizeEntries = this.config.breakpoints.map((breakpoint, index) => {
      if (index === this.config.breakpoints.length - 1) {
        return `${breakpoint.width}px`;
      }
      return `(max-width: ${breakpoint.width}px) ${breakpoint.width}px`;
    });
    
    return sizeEntries.join(', ');
  }

  private getFileExtension(src: string): string {
    const extension = src.split('.').pop()?.toLowerCase();
    return extension || 'jpeg';
  }

  prefetchImage(src: string): void {
    if (typeof window === 'undefined') return;
    
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = src;
    link.as = 'image';
    document.head.appendChild(link);
  }
}

export default AdvancedImageOptimizer;