"use client";

/**
 * Enhanced Next.js Image Component with Advanced Optimization
 * Task 84.3: Image and Asset Optimization
 *
 * Features:
 * - Automatic WebP/AVIF format selection
 * - Responsive srcset generation
 * - Progressive loading with placeholders
 * - Error handling and fallbacks
 * - Performance monitoring
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  AdvancedImageOptimizer,
  type ImageOptimizationConfig,
} from "@/lib/optimization/advanced-image-optimizer";
import { cn } from "@/lib/utils";

// ==================== TYPES ====================

export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  fill?: boolean;
  sizes?: string;
  loading?: "lazy" | "eager";
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  enableProgressive?: boolean;
  enablePrefetch?: boolean;
  fallbackSrc?: string;
  config?: Partial<ImageOptimizationConfig>;
}

export interface ImageLoadingState {
  isLoading: boolean;
  hasError: boolean;
  loadTime: number;
  format: string;
}

// ==================== OPTIMIZER INSTANCE ====================

const defaultOptimizer = new AdvancedImageOptimizer({
  preferredFormats: ["avif", "webp", "jpeg"],
  fallbackFormat: "jpeg",
  defaultQuality: 85,
  enablePrefetch: true,
  enableLazyLoading: true,
});

// ==================== MAIN COMPONENT ====================

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  quality = 85,
  fill = false,
  sizes,
  loading = "lazy",
  placeholder = "empty",
  blurDataURL,
  onLoad,
  onError,
  enableProgressive = true,
  enablePrefetch = false,
  fallbackSrc,
  config,
  ...props
}) => {
  // ==================== STATE ====================

  const [loadingState, setLoadingState] = useState<ImageLoadingState>({
    isLoading: true,
    hasError: false,
    loadTime: 0,
    format: "jpeg",
  });

  const [optimizedData, setOptimizedData] = useState<any>(null);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [progressiveStage, setProgressiveStage] = useState<
    "placeholder" | "low" | "full"
  >("placeholder");

  const optimizer = useRef(
    config ? new AdvancedImageOptimizer(config) : defaultOptimizer
  );
  const loadStartTime = useRef<number>(0);
  const imageRef = useRef<HTMLDivElement>(null);

  // ==================== OPTIMIZATION LOGIC ====================

  useEffect(() => {
    const optimizeImage = async () => {
      try {
        const optimized = await optimizer.current.optimizeImage(src, {
          width,
          height,
          quality,
        });

        setOptimizedData(optimized);
        setCurrentSrc(optimized.optimizedSrc);
        setLoadingState(prev => ({
          ...prev,
          format: optimized.format,
        }));

        // Prefetch if enabled
        if (enablePrefetch && !priority) {
          optimizer.current.prefetchImage(optimized.optimizedSrc);
        }
      } catch (error) {
        console.error("Image optimization failed:", error);
        handleError();
      }
    };

    optimizeImage();
  }, [src, width, height, quality, enablePrefetch, priority]);

  // ==================== PROGRESSIVE LOADING ====================

  useEffect(() => {
    if (!enableProgressive || !optimizedData) return;

    const loadProgressive = async () => {
      // Stage 1: Load low quality version
      setProgressiveStage("low");

      // Stage 2: Load full quality after delay
      setTimeout(() => {
        setProgressiveStage("full");
      }, 100);
    };

    loadProgressive();
  }, [optimizedData, enableProgressive]);

  // ==================== EVENT HANDLERS ====================

  const handleLoadStart = useCallback(() => {
    loadStartTime.current = performance.now();
    setLoadingState(prev => ({ ...prev, isLoading: true, hasError: false }));
  }, []);

  const handleLoad = useCallback(() => {
    const loadTime = performance.now() - loadStartTime.current;

    setLoadingState(prev => ({
      ...prev,
      isLoading: false,
      loadTime,
    }));

    // Track performance
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "image_load_performance", {
        event_category: "Performance",
        event_label: src,
        value: Math.round(loadTime),
        custom_format: loadingState.format,
      });
    }

    onLoad?.();
  }, [src, loadingState.format, onLoad]);

  const handleError = useCallback(() => {
    console.warn(`Failed to load optimized image: ${currentSrc}`);

    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setLoadingState(prev => ({ ...prev, hasError: false }));
    } else {
      setLoadingState(prev => ({ ...prev, isLoading: false, hasError: true }));
    }

    onError?.();
  }, [currentSrc, fallbackSrc, onError]);

  // ==================== RESPONSIVE SIZING ====================

  const getResponsiveSizes = useCallback(() => {
    if (sizes) return sizes;
    if (optimizedData?.sizes) return optimizedData.sizes;

    return "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw";
  }, [sizes, optimizedData]);

  // ==================== PLACEHOLDER GENERATION ====================

  const generatePlaceholder = useCallback(() => {
    if (blurDataURL) return blurDataURL;

    const placeholderSvg = `
      <svg width="${width || 400}" height="${height || 300}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#1e293b"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#64748b" font-size="14">
          Loading...
        </text>
      </svg>
    `;

    return `data:image/svg+xml;base64,${btoa(placeholderSvg)}`;
  }, [blurDataURL, width, height]);

  // ==================== ERROR FALLBACK ====================

  if (loadingState.hasError) {
    return (
      <div
        className={cn(
          "bg-gray-800/50 border border-gray-700/50 rounded-lg flex items-center justify-center",
          className
        )}
        style={fill ? {} : { width, height }}
      >
        <div className="text-center p-4">
          <svg
            className="w-8 h-8 text-gray-500 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm text-gray-400">Failed to load image</span>
        </div>
      </div>
    );
  }

  // ==================== PROGRESSIVE LOADING WRAPPER ====================

  if (enableProgressive && progressiveStage !== "full") {
    return (
      <div
        ref={imageRef}
        className={cn("relative overflow-hidden", className)}
        style={fill ? {} : { width, height }}
      >
        {/* Low quality placeholder */}
        <Image
          src={
            progressiveStage === "placeholder"
              ? generatePlaceholder()
              : currentSrc
          }
          alt={alt}
          width={width}
          height={height}
          fill={fill}
          className={cn(
            "transition-opacity duration-300",
            progressiveStage === "placeholder"
              ? "opacity-50 blur-sm"
              : "opacity-70 blur-[1px]"
          )}
          priority={priority}
          quality={progressiveStage === "placeholder" ? 20 : 40}
          onLoadingComplete={
            progressiveStage === "low" ? handleLoad : undefined
          }
        />

        {/* Loading indicator */}
        {loadingState.isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/20">
            <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-400 rounded-full animate-spin" />
          </div>
        )}
      </div>
    );
  }

  // ==================== MAIN IMAGE RENDER ====================

  return (
    <div
      ref={imageRef}
      className={cn("relative", className)}
      style={fill ? {} : { width, height }}
    >
      <Image
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        className={cn(
          "transition-opacity duration-300",
          loadingState.isLoading ? "opacity-0" : "opacity-100"
        )}
        sizes={getResponsiveSizes()}
        priority={priority}
        loading={loading}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={placeholder === "blur" ? generatePlaceholder() : undefined}
        onLoadStart={handleLoadStart}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />

      {/* Loading state overlay */}
      {loadingState.isLoading && (
        <div className="absolute inset-0 bg-gray-800/50 animate-pulse rounded" />
      )}

      {/* Performance badge (development only) */}
      {process.env.NODE_ENV === "development" &&
        !loadingState.isLoading &&
        loadingState.loadTime > 0 && (
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {loadingState.format.toUpperCase()} •{" "}
            {loadingState.loadTime.toFixed(0)}ms
          </div>
        )}
    </div>
  );
};

// ==================== RESPONSIVE IMAGE COMPONENT ====================

export interface ResponsiveImageProps extends OptimizedImageProps {
  aspectRatio?: "square" | "video" | "portrait" | "landscape" | string;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  aspectRatio = "video",
  objectFit = "cover",
  className = "",
  ...props
}) => {
  const aspectRatioClasses = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
    landscape: "aspect-[4/3]",
  };

  const aspectClass =
    typeof aspectRatio === "string" && aspectRatio in aspectRatioClasses
      ? aspectRatioClasses[aspectRatio as keyof typeof aspectRatioClasses]
      : aspectRatio.startsWith("aspect-")
        ? aspectRatio
        : `aspect-[${aspectRatio}]`;

  return (
    <div className={cn(aspectClass, "relative overflow-hidden", className)}>
      <OptimizedImage {...props} fill className={cn(`object-${objectFit}`)} />
    </div>
  );
};

// ==================== IMAGE GALLERY COMPONENT ====================

export interface ImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    width?: number;
    height?: number;
  }>;
  columns?: number;
  gap?: number;
  className?: string;
  enableLightbox?: boolean;
}

export const OptimizedImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  columns = 3,
  gap = 4,
  className = "",
  enableLightbox = false,
}) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  return (
    <>
      <div className={cn(`grid grid-cols-${columns} gap-${gap}`, className)}>
        {images.map((image, index) => (
          <div
            key={index}
            className={cn(
              "cursor-pointer transition-transform hover:scale-105",
              enableLightbox && "hover:shadow-lg"
            )}
            onClick={() => enableLightbox && setSelectedImage(index)}
          >
            <ResponsiveImage
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              aspectRatio="square"
              className="rounded-lg overflow-hidden"
              enableProgressive
            />
          </div>
        ))}
      </div>

      {/* Simple lightbox */}
      {enableLightbox && selectedImage !== null && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-full">
            <OptimizedImage
              src={images[selectedImage].src}
              alt={images[selectedImage].alt}
              width={1200}
              height={800}
              className="max-w-full max-h-full object-contain"
              priority
            />
          </div>
        </div>
      )}
    </>
  );
};

// ==================== EXPORT ====================

export default OptimizedImage;
