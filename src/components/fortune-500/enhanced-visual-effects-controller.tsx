"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Eye,
  EyeOff,
  Cpu,
  Gauge,
  Settings,
  Sparkles,
  Zap,
  Monitor,
} from "lucide-react";

// Import existing visual effects components
import ParticleEffects from "./particle-effects";
// import MatrixBackground from './matrix-background'; // Removed heavy matrix background
import GlassmorphismPanel from "./glassmorphism-panel";
import HolographicDataVisualization from "./holographic-data-visualization";

// 🎨 NEW: Lightweight futuristic background component
const LightweightFuturisticBackground = ({
  intensity = "medium",
  color = "cyan",
  className = "",
}: {
  intensity?: "low" | "medium" | "high";
  color?: "cyan" | "purple" | "pink" | "multi";
  className?: string;
}) => {
  const getGridOpacity = () => {
    switch (intensity) {
      case "low":
        return "opacity-10";
      case "medium":
        return "opacity-20";
      case "high":
        return "opacity-30";
      default:
        return "opacity-20";
    }
  };

  const getColorScheme = () => {
    switch (color) {
      case "cyan":
        return "from-cyan-500/10 via-cyan-400/5 to-transparent";
      case "purple":
        return "from-purple-500/10 via-purple-400/5 to-transparent";
      case "pink":
        return "from-pink-500/10 via-pink-400/5 to-transparent";
      case "multi":
        return "from-cyan-500/8 via-purple-400/6 to-pink-500/8";
      default:
        return "from-cyan-500/10 via-cyan-400/5 to-transparent";
    }
  };

  return (
    <div className={`fixed inset-0 ${className}`}>
      {/* Lightweight gradient background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${getColorScheme()}`}
      />

      {/* CSS-only animated grid - much lighter than canvas */}
      <div
        className={`absolute inset-0 ${getGridOpacity()}`}
        style={{
          backgroundImage: `
            linear-gradient(rgba(6, 182, 212, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          animation: "gridPulse 4s ease-in-out infinite",
        }}
      />

      {/* Floating geometric shapes - CSS only */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 border border-cyan-400/30 rotate-45"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + Math.sin(i) * 20}%`,
              animation: `float ${8 + i * 2}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Scanning line effect - lightweight */}
      <div
        className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent"
        style={{
          animation: "scanLine 8s linear infinite",
        }}
      />

      {/* CSS Keyframes */}
      <style jsx>{`
        @keyframes gridPulse {
          0%,
          100% {
            opacity: 0.15;
          }
          50% {
            opacity: 0.25;
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(45deg);
          }
          50% {
            transform: translateY(-15px) rotate(225deg);
          }
        }

        @keyframes scanLine {
          0% {
            top: -2px;
          }
          100% {
            top: 100vh;
          }
        }
      `}</style>
    </div>
  );
};

interface PerformanceMetrics {
  fps: number;
  cpuUsage: number;
  memoryUsage: number;
  renderTime: number;
}

interface VisualEffectsConfig {
  particleEffects: {
    enabled: boolean;
    count: number;
    color: "cyan" | "purple" | "pink" | "green" | "white";
    speed: number;
    size: "sm" | "md" | "lg";
  };
  futuristicBackground: {
    enabled: boolean;
    intensity: "low" | "medium" | "high";
    color: "cyan" | "purple" | "pink" | "multi";
  };
  holographicEffects: {
    enabled: boolean;
    variant: "neural-network" | "data-sphere" | "matrix-grid";
  };
  performance: {
    mode: "high" | "medium" | "low";
    fpsLimit: number;
    adaptiveQuality: boolean;
  };
}

interface EnhancedVisualEffectsControllerProps {
  className?: string;
  onConfigChange?: (config: VisualEffectsConfig) => void;
  initialConfig?: Partial<VisualEffectsConfig>;
}

export default function EnhancedVisualEffectsController({
  className,
  onConfigChange,
  initialConfig = {},
}: EnhancedVisualEffectsControllerProps) {
  const [config, setConfig] = useState<VisualEffectsConfig>({
    particleEffects: {
      enabled: true,
      count: 15,
      color: "cyan",
      speed: 1,
      size: "sm",
    },
    futuristicBackground: {
      enabled: true,
      intensity: "medium",
      color: "cyan",
    },
    holographicEffects: {
      enabled: true,
      variant: "neural-network",
    },
    performance: {
      mode: "high",
      fpsLimit: 60,
      adaptiveQuality: true,
    },
    ...initialConfig,
  });

  const [isVisible, setIsVisible] = useState(true);
  const [performanceMetrics, setPerformanceMetrics] =
    useState<PerformanceMetrics>({
      fps: 60,
      cpuUsage: 15,
      memoryUsage: 45,
      renderTime: 16.7,
    });
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false);

  // Performance monitoring
  useEffect(() => {
    const monitorPerformance = () => {
      // Simulate performance monitoring
      const newMetrics: PerformanceMetrics = {
        fps: 58 + Math.random() * 4,
        cpuUsage: 10 + Math.random() * 20,
        memoryUsage: 40 + Math.random() * 10,
        renderTime: 14 + Math.random() * 5,
      };
      setPerformanceMetrics(newMetrics);

      // Adaptive quality adjustment
      if (config.performance.adaptiveQuality) {
        if (newMetrics.fps < 30 || newMetrics.cpuUsage > 80) {
          // Reduce quality
          if (config.performance.mode === "high") {
            updateConfig("performance", { mode: "medium" });
          } else if (config.performance.mode === "medium") {
            updateConfig("performance", { mode: "low" });
          }
        }
      }
    };

    const interval = setInterval(monitorPerformance, 1000);
    return () => clearInterval(interval);
  }, [config.performance]);

  const updateConfig = useCallback(
    (section: keyof VisualEffectsConfig, updates: any) => {
      setConfig(prev => {
        const newConfig = {
          ...prev,
          [section]: {
            ...prev[section],
            ...updates,
          },
        };
        onConfigChange?.(newConfig);
        return newConfig;
      });
    },
    [onConfigChange]
  );

  const getPerformanceColor = (value: number, type: "fps" | "usage") => {
    if (type === "fps") {
      if (value >= 55) return "text-green-400";
      if (value >= 30) return "text-yellow-400";
      return "text-red-400";
    } else {
      if (value <= 30) return "text-green-400";
      if (value <= 60) return "text-yellow-400";
      return "text-red-400";
    }
  };

  const cyberpunkWidgets = useMemo(
    () => [
      {
        id: "neural-metrics",
        title: "Neural Network Status",
        data: [
          {
            id: "1",
            label: "Nodes",
            value: 847,
            color: "#06b6d4",
            connections: ["2", "3"],
          },
          {
            id: "2",
            label: "Connections",
            value: 2430,
            color: "#8b5cf6",
            connections: ["1", "4"],
          },
          {
            id: "3",
            label: "Processing",
            value: 156,
            color: "#ec4899",
            connections: ["1"],
          },
          {
            id: "4",
            label: "Synapse Rate",
            value: 98,
            color: "#10b981",
            connections: ["2"],
          },
        ],
      },
      {
        id: "data-streams",
        title: "Data Stream Analysis",
        data: [
          { id: "a", label: "Bandwidth", value: 95, color: "#06b6d4" },
          { id: "b", label: "Latency", value: 12, color: "#f59e0b" },
          { id: "c", label: "Throughput", value: 87, color: "#10b981" },
          { id: "d", label: "Integrity", value: 99, color: "#8b5cf6" },
        ],
      },
    ],
    []
  );

  return (
    <div className={cn("relative", className)}>
      {/* Visual Effects Layers */}
      <AnimatePresence>
        {isVisible && (
          <>
            {/* Lightweight futuristic background - only when enabled */}
            {config.futuristicBackground.enabled && (
              <LightweightFuturisticBackground
                intensity={config.futuristicBackground.intensity}
                color={config.futuristicBackground.color}
                className="fixed inset-0 z-0"
              />
            )}

            {/* Particle Effects - reduced count for better performance */}
            {config.particleEffects.enabled && (
              <ParticleEffects
                count={Math.min(config.particleEffects.count, 20)} // Cap at 20 for performance
                color={config.particleEffects.color}
                speed={config.particleEffects.speed}
                size={config.particleEffects.size}
                className="fixed inset-0 z-10"
                isActive={true}
              />
            )}
          </>
        )}
      </AnimatePresence>

      {/* Glassmorphism Widget Overlays */}
      {config.holographicEffects.enabled && isVisible && (
        <div className="absolute top-4 right-4 z-20 space-y-4 max-w-sm">
          {cyberpunkWidgets.map((widget, index) => (
            <GlassmorphismPanel
              key={widget.id}
              title={widget.title}
              variant={index % 2 === 0 ? "primary" : "secondary"}
              isFloating={true}
              className="animate-in slide-in-from-right duration-500"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <HolographicDataVisualization
                data={widget.data}
                title=""
                variant={config.holographicEffects.variant}
                isActive={true}
                className="h-32"
              />
            </GlassmorphismPanel>
          ))}
        </div>
      )}

      {/* Control Panel */}
      <motion.div
        className="fixed bottom-4 left-4 z-30"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <Card className="bg-slate-950/95 backdrop-blur-xl border-cyan-500/30 shadow-2xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-cyan-400 text-sm">
                Visual Effects
              </CardTitle>
              <div className="flex items-center gap-2">
                <NormalButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsVisible(!isVisible)}
                  className="text-cyan-400 hover:text-cyan-300"
                >
                  {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                </NormalButton>
                <NormalButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsControlPanelOpen(!isControlPanelOpen)}
                  className="text-cyan-400 hover:text-cyan-300"
                >
                  <Settings size={16} />
                </NormalButton>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {/* Performance Metrics */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="text-center">
                <div
                  className={cn(
                    "text-xs font-mono",
                    getPerformanceColor(performanceMetrics.fps, "fps")
                  )}
                >
                  {performanceMetrics.fps.toFixed(1)} FPS
                </div>
                <div className="text-xs text-slate-400">Performance</div>
              </div>
              <div className="text-center">
                <div
                  className={cn(
                    "text-xs font-mono",
                    getPerformanceColor(performanceMetrics.cpuUsage, "usage")
                  )}
                >
                  {performanceMetrics.cpuUsage.toFixed(0)}%
                </div>
                <div className="text-xs text-slate-400">CPU Usage</div>
              </div>
            </div>

            {/* Quick Toggles */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">Background</span>
                <Switch
                  checked={config.futuristicBackground.enabled}
                  onCheckedChange={enabled =>
                    updateConfig("futuristicBackground", { enabled })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">Particles</span>
                <Switch
                  checked={config.particleEffects.enabled}
                  onCheckedChange={enabled =>
                    updateConfig("particleEffects", { enabled })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">Holograms</span>
                <Switch
                  checked={config.holographicEffects.enabled}
                  onCheckedChange={enabled =>
                    updateConfig("holographicEffects", { enabled })
                  }
                />
              </div>
            </div>

            {/* Performance Mode */}
            <div className="mt-3 pt-3 border-t border-slate-700">
              <div className="flex items-center gap-2">
                <Gauge size={12} className="text-purple-400" />
                <span className="text-xs text-slate-300">Performance</span>
                <Badge
                  variant="outline"
                  className="text-xs border-purple-500/30 text-purple-400"
                >
                  {config.performance.mode.toUpperCase()}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Advanced Control Panel */}
      <AnimatePresence>
        {isControlPanelOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsControlPanelOpen(false)}
          >
            <motion.div
              className="bg-slate-950/95 backdrop-blur-xl border border-cyan-500/30 rounded-lg p-6 max-w-2xl w-full mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-cyan-400 mb-4">
                Advanced Visual Effects Control
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Particle Effects Controls */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-purple-400">
                    Particle Effects
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-slate-300">
                        Count: {config.particleEffects.count}
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={config.particleEffects.count}
                        onChange={e =>
                          updateConfig("particleEffects", {
                            count: Number(e.target.value),
                          })
                        }
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-300">
                        Speed: {config.particleEffects.speed}x
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="3"
                        step="0.1"
                        value={config.particleEffects.speed}
                        onChange={e =>
                          updateConfig("particleEffects", {
                            speed: Number(e.target.value),
                          })
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Future Background Controls */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-cyan-400">
                    Future Background
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-slate-300">
                        Intensity
                      </label>
                      <select
                        value={config.futuristicBackground.intensity}
                        onChange={e =>
                          updateConfig("futuristicBackground", {
                            intensity: e.target.value,
                          })
                        }
                        className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-1 text-white"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-slate-300">Color</label>
                      <select
                        value={config.futuristicBackground.color}
                        onChange={e =>
                          updateConfig("futuristicBackground", {
                            color: e.target.value,
                          })
                        }
                        className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-1 text-white"
                      >
                        <option value="cyan">Cyan</option>
                        <option value="purple">Purple</option>
                        <option value="pink">Pink</option>
                        <option value="multi">Multi</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <NormalButton
                  variant="secondary"
                  onClick={() => setIsControlPanelOpen(false)}
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  Close
                </NormalButton>
                <NormalButton
                  onClick={() => {
                    // Reset to defaults
                    setConfig({
                      particleEffects: {
                        enabled: true,
                        count: 15,
                        color: "cyan",
                        speed: 1,
                        size: "sm",
                      },
                      futuristicBackground: {
                        enabled: true,
                        intensity: "medium",
                        color: "cyan",
                      },
                      holographicEffects: {
                        enabled: true,
                        variant: "neural-network",
                      },
                      performance: {
                        mode: "high",
                        fpsLimit: 60,
                        adaptiveQuality: true,
                      },
                    });
                  }}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                  Reset Defaults
                </NormalButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
