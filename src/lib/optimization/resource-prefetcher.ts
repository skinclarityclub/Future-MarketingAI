"use client";

/**
 * Smart Resource Prefetching System
 * Task 84.3: Image and Asset Optimization
 * 
 * Features:
 * - Intelligent asset prioritization
 * - Viewport-based prefetching
 * - Network-aware loading
 * - Critical path optimization
 */

export interface PrefetchConfig {
  enableIntersectionObserver: boolean;
  enableNetworkHints: boolean;
  priorityThreshold: number;
  viewportMargin: string;
  maxConcurrentPrefetches: number;
  delayBetweenPrefetches: number;
}

export interface ResourcePriority {
  src: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  type: 'image' | 'script' | 'style' | 'font' | 'fetch';
  conditions?: PrefetchCondition[];
}

export interface PrefetchCondition {
  type: 'viewport' | 'interaction' | 'time' | 'network';
  value?: any;
}

const DEFAULT_CONFIG: PrefetchConfig = {
  enableIntersectionObserver: true,
  enableNetworkHints: true,
  priorityThreshold: 0.1,
  viewportMargin: '50px',
  maxConcurrentPrefetches: 3,
  delayBetweenPrefetches: 100,
};

export class ResourcePrefetcher {
  private config: PrefetchConfig;
  private observer: IntersectionObserver | null = null;
  private prefetchQueue: Map<string, ResourcePriority> = new Map();
  private activePrefetches: Set<string> = new Set();
  private prefetchedResources: Set<string> = new Set();
  private networkInfo: any = null;

  constructor(config: Partial<PrefetchConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    if (typeof window !== 'undefined') {
      this.initializeObserver();
      this.detectNetworkConditions();
    }
  }

  // ==================== INITIALIZATION ====================

  private initializeObserver(): void {
    if (!this.config.enableIntersectionObserver) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            const src = element.dataset.prefetchSrc;
            const priority = element.dataset.prefetchPriority as any;
            
            if (src) {
              this.addToPrefetchQueue({
                src,
                priority: priority || 'medium',
                type: this.detectResourceType(src),
              });
            }
          }
        });
      },
      {
        rootMargin: this.config.viewportMargin,
        threshold: this.config.priorityThreshold,
      }
    );
  }

  private detectNetworkConditions(): void {
    if ('connection' in navigator) {
      this.networkInfo = (navigator as any).connection;
    }
  }

  // ==================== RESOURCE MANAGEMENT ====================

  addToPrefetchQueue(resource: ResourcePriority): void {
    if (this.prefetchedResources.has(resource.src)) return;
    
    this.prefetchQueue.set(resource.src, resource);
    this.processPrefetchQueue();
  }

  private async processPrefetchQueue(): Promise<void> {
    if (this.activePrefetches.size >= this.config.maxConcurrentPrefetches) {
      return;
    }

    // Sort by priority
    const sortedResources = Array.from(this.prefetchQueue.values())
      .filter(resource => !this.activePrefetches.has(resource.src))
      .sort((a, b) => this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority));

    for (const resource of sortedResources) {
      if (this.activePrefetches.size >= this.config.maxConcurrentPrefetches) break;
      
      if (this.shouldPrefetchResource(resource)) {
        this.prefetchResource(resource);
        await this.delay(this.config.delayBetweenPrefetches);
      }
    }
  }

  private shouldPrefetchResource(resource: ResourcePriority): boolean {
    // Check network conditions
    if (this.config.enableNetworkHints && this.networkInfo) {
      if (this.networkInfo.saveData) return false;
      if (this.networkInfo.effectiveType === 'slow-2g') return resource.priority === 'critical';
      if (this.networkInfo.effectiveType === '2g') return ['critical', 'high'].includes(resource.priority);
    }

    // Check conditions
    if (resource.conditions) {
      return resource.conditions.every(condition => this.evaluateCondition(condition));
    }

    return true;
  }

  private evaluateCondition(condition: PrefetchCondition): boolean {
    switch (condition.type) {
      case 'network':
        return this.networkInfo?.effectiveType !== 'slow-2g';
      case 'time':
        return Date.now() > condition.value;
      default:
        return true;
    }
  }

  // ==================== PREFETCHING METHODS ====================

  private async prefetchResource(resource: ResourcePriority): Promise<void> {
    this.activePrefetches.add(resource.src);
    
    try {
      switch (resource.type) {
        case 'image':
          await this.prefetchImage(resource);
          break;
        case 'script':
          this.prefetchScript(resource);
          break;
        case 'style':
          this.prefetchStyle(resource);
          break;
        case 'font':
          this.prefetchFont(resource);
          break;
        case 'fetch':
          await this.prefetchData(resource);
          break;
      }
      
      this.prefetchedResources.add(resource.src);
      this.prefetchQueue.delete(resource.src);
      
    } catch (error) {
      console.warn(`Failed to prefetch ${resource.src}:`, error);
    } finally {
      this.activePrefetches.delete(resource.src);
      this.processPrefetchQueue(); // Continue with next resources
    }
  }

  private async prefetchImage(resource: ResourcePriority): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = resource.src;
      link.as = 'image';
      
      if (resource.priority === 'critical') {
        link.setAttribute('importance', 'high');
      }
      
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to prefetch image: ${resource.src}`));
      
      document.head.appendChild(link);
    });
  }

  private prefetchScript(resource: ResourcePriority): void {
    const link = document.createElement('link');
    link.rel = resource.priority === 'critical' ? 'preload' : 'prefetch';
    link.href = resource.src;
    link.as = 'script';
    
    if (resource.priority === 'critical') {
      link.crossOrigin = 'anonymous';
    }
    
    document.head.appendChild(link);
  }

  private prefetchStyle(resource: ResourcePriority): void {
    const link = document.createElement('link');
    link.rel = resource.priority === 'critical' ? 'preload' : 'prefetch';
    link.href = resource.src;
    link.as = 'style';
    
    document.head.appendChild(link);
  }

  private prefetchFont(resource: ResourcePriority): void {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.src;
    link.as = 'font';
    link.type = this.getFontMimeType(resource.src);
    link.crossOrigin = 'anonymous';
    
    document.head.appendChild(link);
  }

  private async prefetchData(resource: ResourcePriority): Promise<void> {
    try {
      await fetch(resource.src, {
        method: 'GET',
        mode: 'cors',
        cache: 'force-cache',
      });
    } catch (error) {
      throw new Error(`Failed to prefetch data: ${resource.src}`);
    }
  }

  // ==================== UTILITY METHODS ====================

  private detectResourceType(src: string): ResourcePriority['type'] {
    const extension = src.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'webp', 'avif', 'svg', 'gif'].includes(extension || '')) {
      return 'image';
    }
    
    if (['js', 'mjs'].includes(extension || '')) {
      return 'script';
    }
    
    if (['css'].includes(extension || '')) {
      return 'style';
    }
    
    if (['woff', 'woff2', 'ttf', 'otf'].includes(extension || '')) {
      return 'font';
    }
    
    return 'fetch';
  }

  private getFontMimeType(src: string): string {
    const extension = src.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'woff': return 'font/woff';
      case 'woff2': return 'font/woff2';
      case 'ttf': return 'font/ttf';
      case 'otf': return 'font/otf';
      default: return 'font/woff2';
    }
  }

  private getPriorityWeight(priority: ResourcePriority['priority']): number {
    switch (priority) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 1;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ==================== PUBLIC API ====================

  observeElement(element: HTMLElement, prefetchSrc: string, priority: ResourcePriority['priority'] = 'medium'): void {
    if (!this.observer) return;
    
    element.dataset.prefetchSrc = prefetchSrc;
    element.dataset.prefetchPriority = priority;
    this.observer.observe(element);
  }

  prefetchCriticalResources(resources: ResourcePriority[]): void {
    resources.forEach(resource => {
      if (resource.priority === 'critical') {
        this.addToPrefetchQueue(resource);
      }
    });
  }

  preloadAboveTheFold(images: string[]): void {
    images.forEach((src, index) => {
      this.addToPrefetchQueue({
        src,
        priority: index < 3 ? 'critical' : 'high',
        type: 'image',
      });
    });
  }

  getStats(): {
    totalQueued: number;
    totalPrefetched: number;
    activePrefetches: number;
    networkType: string;
  } {
    return {
      totalQueued: this.prefetchQueue.size,
      totalPrefetched: this.prefetchedResources.size,
      activePrefetches: this.activePrefetches.size,
      networkType: this.networkInfo?.effectiveType || 'unknown',
    };
  }

  // ==================== CLEANUP ====================

  destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    
    this.prefetchQueue.clear();
    this.activePrefetches.clear();
    this.prefetchedResources.clear();
  }
}

// ==================== REACT HOOK ====================

export function useResourcePrefetcher(config?: Partial<PrefetchConfig>) {
  const prefetcher = React.useRef<ResourcePrefetcher | null>(null);

  React.useEffect(() => {
    prefetcher.current = new ResourcePrefetcher(config);
    
    return () => {
      if (prefetcher.current) {
        prefetcher.current.destroy();
      }
    };
  }, []);

  const prefetchResource = React.useCallback((resource: ResourcePriority) => {
    prefetcher.current?.addToPrefetchQueue(resource);
  }, []);

  const observeElement = React.useCallback((element: HTMLElement, src: string, priority?: ResourcePriority['priority']) => {
    prefetcher.current?.observeElement(element, src, priority);
  }, []);

  return {
    prefetchResource,
    observeElement,
    prefetcher: prefetcher.current,
  };
}

// ==================== PERFORMANCE STRATEGIES ====================

export const PrefetchStrategies = {
  // Critical path optimization
  criticalPath: (resources: string[]) => {
    const prefetcher = new ResourcePrefetcher();
    resources.forEach((src, index) => {
      prefetcher.addToPrefetchQueue({
        src,
        priority: index < 2 ? 'critical' : 'high',
        type: 'image',
      });
    });
    return prefetcher;
  },

  // Lazy loading with smart prefetching
  lazyWithPrefetch: (images: string[], viewportMargin = '100px') => {
    return new ResourcePrefetcher({
      enableIntersectionObserver: true,
      viewportMargin,
      maxConcurrentPrefetches: 2,
    });
  },

  // Network-aware loading
  networkAware: () => {
    return new ResourcePrefetcher({
      enableNetworkHints: true,
      maxConcurrentPrefetches: 1,
    });
  },
};

export default ResourcePrefetcher; 