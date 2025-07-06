"use client";

import React, {
  Suspense,
  lazy,
  useEffect,
  useState,
  useCallback,
  memo,
  useMemo,
} from "react";
import { useInView } from "react-intersection-observer";
import { Loader2 } from "lucide-react";

// Loading Skeleton Component
const LoadingSkeleton = memo(() => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-300/20 rounded mb-4"></div>
    <div className="h-4 bg-gray-300/20 rounded mb-2"></div>
    <div className="h-4 bg-gray-300/20 rounded mb-2"></div>
    <div className="h-4 bg-gray-300/20 rounded w-3/4"></div>
  </div>
));

LoadingSkeleton.displayName = "LoadingSkeleton";

// Premium Loading Spinner
const PremiumLoader = memo(() => (
  <div className="flex items-center justify-center p-8">
    <div className="relative">
      <div className="w-12 h-12 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin"></div>
      <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-transparent border-r-cyan-500 animate-spin animation-delay-150"></div>
      <Loader2 className="absolute inset-0 w-6 h-6 m-auto text-white animate-pulse" />
    </div>
  </div>
));

PremiumLoader.displayName = "PremiumLoader";

// Lazy Loading Wrapper
interface LazyLoadWrapperProps {
  children: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  fallback?: React.ReactNode;
  className?: string;
}

export const LazyLoadWrapper = memo<LazyLoadWrapperProps>(
  ({
    children,
    threshold = 0.1,
    rootMargin = "50px",
    fallback = <LoadingSkeleton />,
    className = "",
  }) => {
    const { ref, inView } = useInView({
      threshold,
      rootMargin,
      triggerOnce: true,
    });

    return (
      <div ref={ref} className={className}>
        {inView ? children : fallback}
      </div>
    );
  }
);

LazyLoadWrapper.displayName = "LazyLoadWrapper";

// Image Optimization Component
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  loading?: "lazy" | "eager";
  placeholder?: string;
}

export const OptimizedImage = memo<OptimizedImageProps>(
  ({
    src,
    alt,
    width,
    height,
    className = "",
    priority = false,
    loading = "lazy",
    placeholder = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzMzMzMzMyIvPjwvc3ZnPg==",
  }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const handleLoad = useCallback(() => {
      setIsLoading(false);
    }, []);

    const handleError = useCallback(() => {
      setIsLoading(false);
      setHasError(true);
    }, []);

    if (hasError) {
      return (
        <div
          className={`bg-gray-800/50 flex items-center justify-center ${className}`}
        >
          <span className="text-gray-400 text-sm">Failed to load image</span>
        </div>
      );
    }

    return (
      <div className={`relative ${className}`}>
        {isLoading && (
          <div className="absolute inset-0 bg-gray-800/50 animate-pulse rounded"></div>
        )}
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          className={`transition-opacity duration-300 ${
            isLoading ? "opacity-0" : "opacity-100"
          } ${className}`}
          placeholder={placeholder}
        />
      </div>
    );
  }
);

OptimizedImage.displayName = "OptimizedImage";

// Mobile-First Responsive Container
interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: "none" | "sm" | "md" | "lg";
}

export const ResponsiveContainer = memo<ResponsiveContainerProps>(
  ({ children, className = "", maxWidth = "xl", padding = "md" }) => {
    const maxWidthClasses = {
      sm: "max-w-sm",
      md: "max-w-md",
      lg: "max-w-lg",
      xl: "max-w-xl",
      "2xl": "max-w-2xl",
      full: "max-w-full",
    };

    const paddingClasses = {
      none: "",
      sm: "px-4 py-2",
      md: "px-6 py-4",
      lg: "px-8 py-6",
    };

    return (
      <div
        className={`
        mx-auto w-full
        ${maxWidthClasses[maxWidth]} 
        ${paddingClasses[padding]}
        ${className}
      `}
      >
        {children}
      </div>
    );
  }
);

ResponsiveContainer.displayName = "ResponsiveContainer";

// Performance Monitoring Hook
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    lcp: 0,
    fid: 0,
    cls: 0,
    ttfb: 0,
  });

  useEffect(() => {
    // Web Vitals monitoring
    const observer = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === "largest-contentful-paint") {
          setMetrics(prev => ({ ...prev, lcp: entry.startTime }));
        }
        if (entry.entryType === "first-input") {
          setMetrics(prev => ({
            ...prev,
            fid: entry.processingStart - entry.startTime,
          }));
        }
        if (entry.entryType === "layout-shift") {
          if (!(entry as any).hadRecentInput) {
            setMetrics(prev => ({
              ...prev,
              cls: prev.cls + (entry as any).value,
            }));
          }
        }
      }
    });

    observer.observe({
      entryTypes: ["largest-contentful-paint", "first-input", "layout-shift"],
    });

    // TTFB
    const navigationEntry = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      setMetrics(prev => ({
        ...prev,
        ttfb: navigationEntry.responseStart - navigationEntry.requestStart,
      }));
    }

    return () => observer.disconnect();
  }, []);

  return metrics;
};

// Mobile Detection Hook
export const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);

    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  return { isMobile, isTablet, isDesktop: !isMobile && !isTablet };
};

// Touch Interaction Hook
export const useTouchInteraction = () => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(
    null
  );

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    setTouchEnd({
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    });
  }, []);

  const getSwipeDirection = useMemo(() => {
    if (!touchStart || !touchEnd) return null;

    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;
    const minSwipeDistance = 50;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > minSwipeDistance) {
        return deltaX > 0 ? "right" : "left";
      }
    } else {
      if (Math.abs(deltaY) > minSwipeDistance) {
        return deltaY > 0 ? "down" : "up";
      }
    }

    return null;
  }, [touchStart, touchEnd]);

  return {
    handleTouchStart,
    handleTouchEnd,
    swipeDirection: getSwipeDirection,
  };
};

// Code Splitting HOC
export const withCodeSplitting = <P extends object>(
  Component: React.ComponentType<P>,
  fallback: React.ReactNode = <PremiumLoader />
) => {
  const LazyComponent = lazy(() => Promise.resolve({ default: Component }));

  return memo((props: P) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  ));
};

// Export all performance utilities
export { LoadingSkeleton, PremiumLoader };
