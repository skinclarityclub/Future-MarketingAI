"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Activity, TrendingUp, Layers, Settings } from "lucide-react";

interface EnhancedHolographicWidgetProps {
  title: string;
  data: Array<{
    id: string;
    value: number;
    label: string;
    trend: number;
    category: string;
  }>;
  variant?: "neural" | "quantum" | "holographic" | "cyberpunk";
  size?: "sm" | "md" | "lg" | "xl";
  interactionMode?: "hover" | "gesture" | "click" | "auto";
  realTimeUpdates?: boolean;
  className?: string;
  onDataPointClick?: (dataPoint: any) => void;
}

export default function EnhancedHolographicWidget({
  title,
  data,
  variant = "holographic",
  size = "md",
  interactionMode = "hover",
  realTimeUpdates = true,
  className,
  onDataPointClick,
}: EnhancedHolographicWidgetProps) {
  const [isActive, setIsActive] = useState(false);
  const [selectedDataPoint, setSelectedDataPoint] = useState<string | null>(
    null
  );
  const [hologramDepth, setHologramDepth] = useState(50);
  const [lightingIntensity, setLightingIntensity] = useState(0.6);
  const [particleCount, setParticleCount] = useState(20);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // Motion values for 3D transformations
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const scale = useMotionValue(1);

  // Spring animations for smooth interactions
  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 30 });
  const springScale = useSpring(scale, { stiffness: 400, damping: 25 });

  // Enhanced mouse tracking for holographic effects
  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const mouseX = event.clientX - centerX;
      const mouseY = event.clientY - centerY;

      // Calculate 3D rotation based on mouse position
      const rotationX = (mouseY / rect.height) * 20;
      const rotationY = (mouseX / rect.width) * 20;

      rotateX.set(-rotationX);
      rotateY.set(rotationY);
      scale.set(1.03);
    },
    [rotateX, rotateY, scale]
  );

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
    setIsActive(false);
  }, [rotateX, rotateY, scale]);

  const handleMouseEnter = useCallback(() => {
    setIsActive(true);
  }, []);

  // Advanced 3D holographic canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const updateCanvasSize = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    // Holographic particles system
    const particles: Array<{
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      size: number;
      life: number;
      maxLife: number;
      color: string;
      energy: number;
      dataPointId?: string;
    }> = [];

    // Initialize particles
    const initParticles = () => {
      particles.length = 0;
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          z: Math.random() * hologramDepth,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          vz: (Math.random() - 0.5) * 2,
          size: Math.random() * 3 + 1,
          life: Math.random() * 100,
          maxLife: 100,
          color: getVariantColor(),
          energy: Math.random() * 0.8 + 0.2,
          dataPointId: data[Math.floor(Math.random() * data.length)]?.id,
        });
      }
    };

    initParticles();

    function getVariantColor() {
      const colors = {
        neural: ["#60a5fa", "#3b82f6", "#1d4ed8"],
        quantum: ["#a855f7", "#9333ea", "#7c3aed"],
        holographic: ["#06b6d4", "#0891b2", "#0e7490"],
        cyberpunk: ["#ec4899", "#db2777", "#be185d"],
      };

      const variantColors = colors[variant] || colors.holographic;
      return variantColors[Math.floor(Math.random() * variantColors.length)];
    }

    // Advanced particle rendering with 3D effects
    function drawParticle(particle: (typeof particles)[0]) {
      const { x, y, z, size, life, maxLife, color, energy } = particle;

      // 3D perspective calculation
      const perspective = 400;
      const scale = perspective / (perspective + z);
      const screenX = x * scale + (canvas.width / 2) * (1 - scale);
      const screenY = y * scale + (canvas.height / 2) * (1 - scale);
      const screenSize = size * scale;

      // Enhanced opacity calculation
      const opacity = (life / maxLife) * energy * lightingIntensity;

      // Advanced lighting effects
      ctx.save();
      ctx.globalAlpha = opacity;

      // Dynamic shadow based on depth
      ctx.shadowColor = color;
      ctx.shadowBlur = screenSize * 4;

      // Particle core with gradient
      const gradient = ctx.createRadialGradient(
        screenX,
        screenY,
        0,
        screenX,
        screenY,
        screenSize * 2
      );
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.7, color + "80");
      gradient.addColorStop(1, "transparent");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(screenX, screenY, screenSize, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // Neural network connections between particles
    function drawConnections() {
      if (!isActive) return;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dz = p1.z - p2.z;
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (distance < 100) {
            ctx.save();
            ctx.globalAlpha = (1 - distance / 100) * 0.3 * lightingIntensity;
            ctx.strokeStyle = getVariantColor();
            ctx.lineWidth = 1;
            ctx.shadowColor = ctx.strokeStyle;
            ctx.shadowBlur = 5;

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            ctx.restore();
          }
        }
      }
    }

    // Data visualization overlay
    function drawDataVisualization() {
      if (!data || data.length === 0) return;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(canvas.width, canvas.height) * 0.3;

      data.forEach((dataPoint, index) => {
        const angle = (index / data.length) * Math.PI * 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        // 3D data points
        const z = Math.sin(Date.now() * 0.001 + index) * 20;
        const perspective = 400;
        const scale = perspective / (perspective + z);
        const screenX = x * scale + centerX * (1 - scale);
        const screenY = y * scale + centerY * (1 - scale);

        ctx.save();
        ctx.globalAlpha = lightingIntensity;
        ctx.fillStyle = getVariantColor();
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 10;

        // Data point
        ctx.beginPath();
        ctx.arc(screenX, screenY, 6 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Value indicator
        const valueHeight =
          (dataPoint.value / Math.max(...data.map(d => d.value))) * 50;
        ctx.fillRect(screenX - 2, screenY - valueHeight, 4, valueHeight);

        ctx.restore();
      });
    }

    // Main animation loop
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update particles
      particles.forEach((particle, index) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.z += particle.vz;

        // Update life
        particle.life -= realTimeUpdates ? 0.5 : 0.2;

        // Boundary conditions with wrap-around
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        if (particle.z < 0) particle.z = hologramDepth;
        if (particle.z > hologramDepth) particle.z = 0;

        // Reset particle if dead
        if (particle.life <= 0) {
          particle.x = Math.random() * canvas.width;
          particle.y = Math.random() * canvas.height;
          particle.z = Math.random() * hologramDepth;
          particle.life = particle.maxLife;
          particle.color = getVariantColor();
          particle.dataPointId =
            data[Math.floor(Math.random() * data.length)]?.id;
        }

        drawParticle(particle);
      });

      // Draw connections
      drawConnections();

      // Draw data visualization
      drawDataVisualization();

      animationRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [
    data,
    variant,
    hologramDepth,
    lightingIntensity,
    particleCount,
    selectedDataPoint,
    isActive,
    realTimeUpdates,
  ]);

  // Variant styling
  const getVariantClasses = () => {
    const variants = {
      neural: "from-blue-900/20 to-blue-700/10 border-blue-500/30",
      quantum: "from-purple-900/20 to-purple-700/10 border-purple-500/30",
      holographic: "from-cyan-900/20 to-cyan-700/10 border-cyan-500/30",
      cyberpunk: "from-pink-900/20 to-pink-700/10 border-pink-500/30",
    };
    return variants[variant] || variants.holographic;
  };

  const getSizeClasses = () => {
    const sizes = {
      sm: "h-64 w-full",
      md: "h-80 w-full",
      lg: "h-96 w-full",
      xl: "h-[32rem] w-full",
    };
    return sizes[size] || sizes.md;
  };

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        "relative group cursor-pointer",
        getSizeClasses(),
        className
      )}
      style={{
        perspective: "1000px",
        perspectiveOrigin: "50% 50%",
      }}
      onMouseMove={interactionMode === "hover" ? handleMouseMove : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => interactionMode === "click" && setIsActive(!isActive)}
    >
      {/* 3D Holographic Card */}
      <motion.div
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          scale: springScale,
          transformStyle: "preserve-3d",
        }}
        className="relative h-full w-full"
      >
        <Card
          className={cn(
            "relative h-full w-full overflow-hidden",
            "bg-gradient-to-br backdrop-blur-xl border-2",
            "shadow-2xl transition-all duration-300",
            getVariantClasses(),
            isActive && "shadow-3xl"
          )}
        >
          {/* Enhanced holographic overlay */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ transform: "skewX(-12deg)" }}
          />

          {/* Header */}
          <CardHeader className="relative z-20 p-4">
            <div className="flex items-center justify-between">
              <motion.h3
                className="font-bold text-lg font-mono tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                {title}
              </motion.h3>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-400 animate-ping" />
                </div>
                <Activity className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
          </CardHeader>

          {/* 3D Canvas Container */}
          <CardContent className="relative p-0 h-full">
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 10 }}
            />

            {/* Interactive Data Points Overlay */}
            <div className="absolute inset-4 z-20 pointer-events-none">
              {data.slice(0, 6).map((dataPoint, index) => (
                <motion.div
                  key={dataPoint.id}
                  className="absolute cursor-pointer pointer-events-auto"
                  style={{
                    left: `${15 + (index % 3) * 30}%`,
                    top: `${20 + Math.floor(index / 3) * 30}%`,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: 1,
                    scale: selectedDataPoint === dataPoint.id ? 1.2 : 1,
                  }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => {
                    setSelectedDataPoint(
                      selectedDataPoint === dataPoint.id ? null : dataPoint.id
                    );
                    onDataPointClick?.(dataPoint);
                  }}
                >
                  <div
                    className={cn(
                      "group/point relative p-3 rounded-lg backdrop-blur-sm",
                      "border border-white/20 hover:border-white/40",
                      "transition-all duration-200 hover:scale-110",
                      selectedDataPoint === dataPoint.id &&
                        "bg-white/10 border-cyan-400/60"
                    )}
                  >
                    <div className="text-xs text-gray-300 mb-1">
                      {dataPoint.label}
                    </div>
                    <div className="text-lg font-bold text-white">
                      {dataPoint.value}
                    </div>
                    <div
                      className={cn(
                        "text-xs flex items-center gap-1",
                        dataPoint.trend >= 0 ? "text-green-400" : "text-red-400"
                      )}
                    >
                      <TrendingUp className="w-3 h-3" />
                      {dataPoint.trend >= 0 ? "+" : ""}
                      {dataPoint.trend}%
                    </div>

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover/point:opacity-100 transition-opacity pointer-events-none">
                      <div className="bg-black/80 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                        {dataPoint.category}: {dataPoint.value}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Control Panel */}
            <AnimatePresence>
              {isActive && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-4 right-4 z-30"
                >
                  <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <Layers className="w-3 h-3" />
                      <span>Depth: {hologramDepth}</span>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        value={hologramDepth}
                        onChange={e => setHologramDepth(Number(e.target.value))}
                        className="w-16 h-1 bg-gray-600 rounded-lg appearance-none slider"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>

          {/* Cyberpunk corner accents */}
          <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-cyan-400/60 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-cyan-400/60 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-cyan-400/60 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-cyan-400/60 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Card>
      </motion.div>
    </motion.div>
  );
}
