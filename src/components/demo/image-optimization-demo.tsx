"use client";

/**
 * Image Optimization Demo Component
 * Task 84.3: Image and Asset Optimization
 *
 * Demonstrates all implemented features:
 * - Advanced image optimization with WebP/AVIF
 * - Responsive images with srcset
 * - Progressive loading
 * - Resource prefetching
 * - Performance monitoring
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  OptimizedImage,
  ResponsiveImage,
  OptimizedImageGallery,
} from "@/components/ui/optimized-next-image";
import { AdvancedImageOptimizer } from "@/lib/optimization/advanced-image-optimizer";
import { ResourcePrefetcher } from "@/lib/optimization/resource-prefetcher";
import { cn } from "@/lib/utils";
import {
  Image as ImageIcon,
  Zap,
  Monitor,
  Smartphone,
  Tablet,
  CheckCircle,
  Clock,
  TrendingUp,
  Settings,
  BarChart3,
} from "lucide-react";

export default function ImageOptimizationDemo() {
  const [optimizer] = useState(() => new AdvancedImageOptimizer());
  const [prefetcher] = useState(() => new ResourcePrefetcher());
  const [browserSupport, setBrowserSupport] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [activeDemo, setActiveDemo] = useState("formats");

  // Demo images for testing
  const demoImages = [
    {
      src: "/ai-avatar.png",
      alt: "AI Avatar Demo",
      title: "AI Avatar",
    },
    {
      src: "/grid.svg",
      alt: "Grid Pattern Demo",
      title: "Grid Pattern",
    },
    {
      src: "/globe.svg",
      alt: "Globe Icon Demo",
      title: "Globe Icon",
    },
    {
      src: "/window.svg",
      alt: "Window Icon Demo",
      title: "Window Icon",
    },
    {
      src: "/vercel.svg",
      alt: "Vercel Logo Demo",
      title: "Vercel Logo",
    },
    {
      src: "/next.svg",
      alt: "Next.js Logo Demo",
      title: "Next.js Logo",
    },
  ];

  useEffect(() => {
    // Initialize browser support detection
    setBrowserSupport(AdvancedImageOptimizer.detectBrowserSupport());

    // Get initial metrics
    updateMetrics();

    // Update metrics periodically
    const interval = setInterval(updateMetrics, 2000);

    return () => clearInterval(interval);
  }, []);

  const updateMetrics = () => {
    const prefetchStats = prefetcher.getStats();
    setMetrics(prefetchStats);
  };

  const handlePrefetchDemo = () => {
    demoImages.forEach((image, index) => {
      prefetcher.addToPrefetchQueue({
        src: image.src,
        priority: index < 2 ? "high" : "medium",
        type: "image",
      });
    });
    updateMetrics();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <ImageIcon className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Image Optimization Demo
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Task 84.3: Advanced WebP/AVIF optimization, responsive images, and
            intelligent prefetching
          </p>

          {/* Status Badges */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Badge variant="secondary" className="bg-green-900 text-green-100">
              <CheckCircle className="w-4 h-4 mr-2" />
              WebP/AVIF Ready
            </Badge>
            <Badge variant="secondary" className="bg-blue-900 text-blue-100">
              <Zap className="w-4 h-4 mr-2" />
              Prefetch Active
            </Badge>
            <Badge
              variant="secondary"
              className="bg-purple-900 text-purple-100"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Performance Tracking
            </Badge>
          </div>
        </div>

        {/* Browser Support Info */}
        {browserSupport && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Browser Capabilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                  <span>WebP Support</span>
                  <Badge
                    variant={browserSupport.webp ? "default" : "secondary"}
                  >
                    {browserSupport.webp ? "✅ Yes" : "❌ No"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                  <span>AVIF Support</span>
                  <Badge
                    variant={browserSupport.avif ? "default" : "secondary"}
                  >
                    {browserSupport.avif ? "✅ Yes" : "❌ No"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                  <span>Srcset Support</span>
                  <Badge
                    variant={browserSupport.srcset ? "default" : "secondary"}
                  >
                    {browserSupport.srcset ? "✅ Yes" : "❌ No"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Performance Metrics */}
        {metrics && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Real-time Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-900 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">
                    {metrics.totalQueued}
                  </div>
                  <div className="text-sm text-gray-400">Assets Queued</div>
                </div>
                <div className="text-center p-4 bg-gray-900 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">
                    {metrics.totalPrefetched}
                  </div>
                  <div className="text-sm text-gray-400">Prefetched</div>
                </div>
                <div className="text-center p-4 bg-gray-900 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-400">
                    {metrics.activePrefetches}
                  </div>
                  <div className="text-sm text-gray-400">Active Loads</div>
                </div>
                <div className="text-center p-4 bg-gray-900 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">
                    {metrics.networkType}
                  </div>
                  <div className="text-sm text-gray-400">Network Type</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Demo Tabs */}
        <Tabs
          value={activeDemo}
          onValueChange={setActiveDemo}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-5 bg-gray-800">
            <TabsTrigger value="formats">Format Selection</TabsTrigger>
            <TabsTrigger value="responsive">Responsive Images</TabsTrigger>
            <TabsTrigger value="progressive">Progressive Loading</TabsTrigger>
            <TabsTrigger value="prefetch">Smart Prefetching</TabsTrigger>
            <TabsTrigger value="gallery">Image Gallery</TabsTrigger>
          </TabsList>

          {/* Format Selection Demo */}
          <TabsContent value="formats" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Automatic Format Selection</CardTitle>
                <p className="text-gray-400">
                  Images automatically use the best supported format (AVIF →
                  WebP → JPEG)
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {demoImages.slice(0, 3).map((image, index) => (
                    <div key={index} className="space-y-3">
                      <div className="relative bg-gray-900 rounded-lg overflow-hidden">
                        <OptimizedImage
                          src={image.src}
                          alt={image.alt}
                          width={300}
                          height={200}
                          quality={85}
                          className="w-full h-48 object-cover"
                          enableProgressive
                        />
                      </div>
                      <div className="text-center">
                        <h3 className="font-semibold">{image.title}</h3>
                        <p className="text-sm text-gray-400">
                          Auto-optimized format
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Responsive Images Demo */}
          <TabsContent value="responsive" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Responsive Image Breakpoints</CardTitle>
                <p className="text-gray-400">
                  Images adapt to different screen sizes with optimized srcsets
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-gray-900 rounded-lg">
                      <Smartphone className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                      <div className="font-semibold">Mobile</div>
                      <div className="text-sm text-gray-400">
                        480px - 75% quality
                      </div>
                    </div>
                    <div className="p-4 bg-gray-900 rounded-lg">
                      <Tablet className="w-8 h-8 mx-auto mb-2 text-green-400" />
                      <div className="font-semibold">Tablet</div>
                      <div className="text-sm text-gray-400">
                        768px - 80% quality
                      </div>
                    </div>
                    <div className="p-4 bg-gray-900 rounded-lg">
                      <Monitor className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                      <div className="font-semibold">Desktop</div>
                      <div className="text-sm text-gray-400">
                        1200px - 85% quality
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ResponsiveImage
                      src={demoImages[0].src}
                      alt={demoImages[0].alt}
                      aspectRatio="video"
                      className="rounded-lg"
                    />
                    <ResponsiveImage
                      src={demoImages[1].src}
                      alt={demoImages[1].alt}
                      aspectRatio="square"
                      className="rounded-lg"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Progressive Loading Demo */}
          <TabsContent value="progressive" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Progressive Loading</CardTitle>
                <p className="text-gray-400">
                  Images load in stages: placeholder → low quality → full
                  quality
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {demoImages.slice(0, 2).map((image, index) => (
                    <div key={index} className="space-y-3">
                      <OptimizedImage
                        src={image.src}
                        alt={image.alt}
                        width={400}
                        height={300}
                        className="w-full h-64 object-cover rounded-lg"
                        enableProgressive={true}
                        placeholder="blur"
                      />
                      <div className="text-center">
                        <h3 className="font-semibold">{image.title}</h3>
                        <p className="text-sm text-gray-400">
                          Progressive loading enabled
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Smart Prefetching Demo */}
          <TabsContent value="prefetch" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Smart Resource Prefetching</CardTitle>
                <p className="text-gray-400">
                  Intelligent prefetching based on viewport, priority, and
                  network conditions
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button onClick={handlePrefetchDemo} className="flex-1">
                    <Zap className="w-4 h-4 mr-2" />
                    Trigger Prefetch Demo
                  </Button>
                  <Button
                    variant="outline"
                    onClick={updateMetrics}
                    className="flex-1"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Refresh Metrics
                  </Button>
                </div>

                {metrics && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-gray-900 border-gray-600">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Queue Progress</span>
                            <span className="text-sm text-gray-400">
                              {metrics.totalPrefetched}/{metrics.totalQueued}
                            </span>
                          </div>
                          <Progress
                            value={
                              (metrics.totalPrefetched /
                                Math.max(metrics.totalQueued, 1)) *
                              100
                            }
                            className="mt-2"
                          />
                        </CardContent>
                      </Card>

                      <Card className="bg-gray-900 border-gray-600">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-400" />
                            <span className="text-sm">Active Prefetches</span>
                          </div>
                          <div className="text-2xl font-bold mt-1">
                            {metrics.activePrefetches}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gray-900 border-gray-600">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-400" />
                            <span className="text-sm">Network Type</span>
                          </div>
                          <div className="text-lg font-semibold mt-1 capitalize">
                            {metrics.networkType}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Image Gallery Demo */}
          <TabsContent value="gallery" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Optimized Image Gallery</CardTitle>
                <p className="text-gray-400">
                  Gallery with lazy loading, progressive enhancement, and
                  lightbox
                </p>
              </CardHeader>
              <CardContent>
                <OptimizedImageGallery
                  images={demoImages}
                  columns={3}
                  gap={4}
                  enableLightbox={true}
                  className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Technical Implementation Details */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Implementation Highlights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-400">
                  Advanced Features
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    WebP/AVIF automatic format selection
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Responsive srcset generation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Progressive loading with blur placeholders
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Intersection Observer for lazy loading
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Network-aware prefetching
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-purple-400">
                  Performance Benefits
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    Up to 50% smaller file sizes with AVIF
                  </li>
                  <li className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    Improved Core Web Vitals (LCP, CLS)
                  </li>
                  <li className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    Reduced bandwidth usage
                  </li>
                  <li className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    Faster perceived loading times
                  </li>
                  <li className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    Better user experience on slow networks
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
