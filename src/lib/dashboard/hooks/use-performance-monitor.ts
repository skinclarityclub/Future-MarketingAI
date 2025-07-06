"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
  fps?: number;
  isSlowDevice: boolean;
}

interface UsePerformanceMonitorReturn {
  metrics: PerformanceMetrics;
  startTiming: (label: string) => void;
  endTiming: (label: string) => number;
  isLoading: boolean;
}

export function usePerformanceMonitor(): UsePerformanceMonitorReturn {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    isSlowDevice: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const timingsRef = useRef<Map<string, number>>(new Map());

  const startTiming = useCallback((label: string) => {
    timingsRef.current.set(label, performance.now());
  }, []);

  const endTiming = useCallback((label: string): number => {
    const startTime = timingsRef.current.get(label);
    if (!startTime) return 0;

    const duration = performance.now() - startTime;
    timingsRef.current.delete(label);
    return duration;
  }, []);

  const measureMemoryUsage = useCallback((): number => {
    if ("memory" in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
    }
    return 0;
  }, []);

  const detectSlowDevice = useCallback((): boolean => {
    // Check for various slow device indicators
    const connectionSpeed = (navigator as any).connection?.effectiveType;
    const hardwareConcurrency = navigator.hardwareConcurrency || 1;
    const deviceMemory = (navigator as any).deviceMemory || 1;

    return (
      connectionSpeed === "2g" ||
      connectionSpeed === "slow-2g" ||
      hardwareConcurrency < 4 ||
      deviceMemory < 4
    );
  }, []);

  const measureFPS = useCallback(() => {
    let frames = 0;
    let startTime = performance.now();

    const countFrame = () => {
      frames++;
      const currentTime = performance.now();

      if (currentTime - startTime >= 1000) {
        const fps = Math.round((frames * 1000) / (currentTime - startTime));
        setMetrics(prev => ({ ...prev, fps }));
        frames = 0;
        startTime = currentTime;
      }

      requestAnimationFrame(countFrame);
    };

    requestAnimationFrame(countFrame);
  }, []);

  useEffect(() => {
    let mounted = true;

    const measureInitialPerformance = async () => {
      // Start performance measurement
      startTiming("initial-load");

      // Wait for DOM to be ready
      await new Promise(resolve => {
        if (document.readyState === "complete") {
          resolve(void 0);
        } else {
          window.addEventListener("load", () => resolve(void 0), {
            once: true,
          });
        }
      });

      if (!mounted) return;

      const loadTime = endTiming("initial-load");
      const renderStartTime = performance.now();

      // Wait a frame to measure render time
      requestAnimationFrame(() => {
        if (!mounted) return;

        const renderTime = performance.now() - renderStartTime;
        const memoryUsage = measureMemoryUsage();
        const isSlowDevice = detectSlowDevice();

        setMetrics({
          loadTime,
          renderTime,
          memoryUsage,
          isSlowDevice,
        });

        setIsLoading(false);

        // Start FPS monitoring for slow devices
        if (isSlowDevice) {
          measureFPS();
        }
      });
    };

    measureInitialPerformance();

    return () => {
      mounted = false;
    };
  }, [
    startTiming,
    endTiming,
    measureMemoryUsage,
    detectSlowDevice,
    measureFPS,
  ]);

  // Log performance metrics in development
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && !isLoading) {
      console.group("📊 Dashboard Performance Metrics");
      console.log(`⚡ Load Time: ${metrics.loadTime.toFixed(2)}ms`);
      console.log(`🎨 Render Time: ${metrics.renderTime.toFixed(2)}ms`);
      if (metrics.memoryUsage) {
        console.log(`💾 Memory Usage: ${metrics.memoryUsage.toFixed(2)}MB`);
      }
      if (metrics.fps) {
        console.log(`🎯 FPS: ${metrics.fps}`);
      }
      console.log(`📱 Slow Device: ${metrics.isSlowDevice ? "Yes" : "No"}`);
      console.groupEnd();

      // Warn if performance is poor
      if (metrics.loadTime > 3000) {
        console.warn("⚠️  Dashboard load time exceeds 3 seconds target");
      }
      if (metrics.fps && metrics.fps < 30) {
        console.warn("⚠️  Low FPS detected, consider reducing animations");
      }
    }
  }, [metrics, isLoading]);

  return {
    metrics,
    startTiming,
    endTiming,
    isLoading,
  };
}
