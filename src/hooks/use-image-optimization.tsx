"use client";

/**
 * Global Image Optimization Hook
 * Task 84.3: Auto-optimize images across all pages
 */

import { useEffect } from "react";
import { AssetOptimizationService } from "@/lib/optimization/asset-optimization-service";

export function useImageOptimization(
  pageType?: "command-center" | "landing-page" | "dashboard"
) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const service = AssetOptimizationService.getInstance();
    service.initialize();

    // Page-specific optimizations
    const optimizeByPageType = () => {
      const currentPath = window.location.pathname;

      if (
        pageType === "command-center" ||
        currentPath.includes("/command-center")
      ) {
        // Command Center optimizations
        setTimeout(() => {
          const avatars = document.querySelectorAll(
            '.avatar img, [class*="avatar"] img'
          );
          avatars.forEach(img => {
            if (img instanceof HTMLImageElement && !img.dataset.optimized) {
              img.dataset.optimized = "true";
              img.loading = "lazy";
              if (img.src) {
                const params = new URLSearchParams();
                params.set("url", img.src);
                params.set("w", "64");
                params.set("h", "64");
                params.set("q", "90");
                img.src = `/_next/image?${params.toString()}`;
              }
            }
          });
        }, 100);
      }

      if (
        pageType === "landing-page" ||
        currentPath === "/" ||
        currentPath.includes("/en") ||
        currentPath.includes("/nl")
      ) {
        // Landing Page optimizations
        setTimeout(() => {
          const heroImages = document.querySelectorAll(
            ".hero img, .hero-section img, [data-hero] img"
          );
          heroImages.forEach((img, index) => {
            if (img instanceof HTMLImageElement && !img.dataset.optimized) {
              img.dataset.optimized = "true";
              if (index < 2)
                img.loading = "eager"; // Priority loading for first 2 images
              else img.loading = "lazy";

              if (img.src) {
                const params = new URLSearchParams();
                params.set("url", img.src);
                params.set("w", "1200");
                params.set("h", "800");
                params.set("q", "85");
                img.src = `/_next/image?${params.toString()}`;
              }
            }
          });
        }, 100);
      }

      if (
        pageType === "dashboard" ||
        currentPath.includes("dashboard") ||
        currentPath.includes("finance") ||
        currentPath.includes("marketing")
      ) {
        // Dashboard optimizations
        setTimeout(() => {
          const widgetImages = document.querySelectorAll(
            ".widget img, .card img, [data-widget] img"
          );
          widgetImages.forEach(img => {
            if (img instanceof HTMLImageElement && !img.dataset.optimized) {
              img.dataset.optimized = "true";
              img.loading = "lazy";

              if (img.src) {
                const params = new URLSearchParams();
                params.set("url", img.src);
                params.set("w", "400");
                params.set("h", "300");
                params.set("q", "80");
                img.src = `/_next/image?${params.toString()}`;
              }
            }
          });
        }, 100);
      }

      // General optimization for all other images
      setTimeout(() => {
        const allImages = document.querySelectorAll(
          "img:not([data-optimized])"
        );
        allImages.forEach(img => {
          if (img instanceof HTMLImageElement) {
            img.dataset.optimized = "true";
            img.loading = "lazy";

            if (img.src && !img.src.includes("/_next/image")) {
              const params = new URLSearchParams();
              params.set("url", img.src);
              params.set("w", img.width?.toString() || "800");
              params.set("h", img.height?.toString() || "600");
              params.set("q", "85");
              img.src = `/_next/image?${params.toString()}`;
            }
          }
        });
      }, 200);
    };

    optimizeByPageType();

    // Re-optimize when new content is added
    const observer = new MutationObserver(() => {
      optimizeByPageType();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      service.destroy?.();
    };
  }, [pageType]);
}
