"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DataPoint {
  id: string;
  label: string;
  value: number;
  color: string;
  connections?: string[];
}

interface HolographicDataVisualizationProps {
  data: DataPoint[];
  title: string;
  variant?: "neural-network" | "data-sphere" | "matrix-grid";
  className?: string;
  isActive?: boolean;
}

export default function HolographicDataVisualization({
  data,
  title,
  variant = "neural-network",
  className,
  isActive = true,
}: HolographicDataVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [animationPhase, setAnimationPhase] = useState(0);

  // Neural network animation effect
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, [isActive]);

  // 3D holographic rendering effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const renderHolographicEffect = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      // Create holographic glow effect
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        Math.min(width, height) / 2
      );

      gradient.addColorStop(0, "rgba(0, 255, 255, 0.8)");
      gradient.addColorStop(0.5, "rgba(128, 0, 255, 0.4)");
      gradient.addColorStop(1, "rgba(0, 255, 255, 0.1)");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw data connections (neural network style)
      if (variant === "neural-network") {
        data.forEach((point, index) => {
          const x = (index + 1) * (width / (data.length + 1));
          const y =
            height / 2 +
            Math.sin((animationPhase * Math.PI) / 180 + index) * 50;

          // Draw node
          ctx.beginPath();
          ctx.arc(x, y, 8, 0, 2 * Math.PI);
          ctx.fillStyle = point.color + "99";
          ctx.fill();

          // Draw connections
          point.connections?.forEach(connectionId => {
            const connectionIndex = data.findIndex(d => d.id === connectionId);
            if (connectionIndex !== -1) {
              const connX = (connectionIndex + 1) * (width / (data.length + 1));
              const connY =
                height / 2 +
                Math.sin((animationPhase * Math.PI) / 180 + connectionIndex) *
                  50;

              ctx.beginPath();
              ctx.moveTo(x, y);
              ctx.lineTo(connX, connY);
              ctx.strokeStyle = "rgba(0, 255, 255, 0.3)";
              ctx.lineWidth = 2;
              ctx.stroke();
            }
          });
        });
      }

      // Draw matrix grid pattern
      if (variant === "matrix-grid") {
        const gridSize = 20;
        ctx.strokeStyle = "rgba(0, 255, 0, 0.2)";
        ctx.lineWidth = 1;

        for (let i = 0; i < width; i += gridSize) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, height);
          ctx.stroke();
        }

        for (let i = 0; i < height; i += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, i);
          ctx.lineTo(width, i);
          ctx.stroke();
        }
      }
    };

    renderHolographicEffect();

    const animationFrame = requestAnimationFrame(renderHolographicEffect);
    return () => cancelAnimationFrame(animationFrame);
  }, [data, variant, animationPhase]);

  return (
    <motion.div
      ref={containerRef}
      className={cn("relative group", className)}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Glassmorphism Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900/40 to-blue-900/20 backdrop-blur-xl border border-cyan-500/30 shadow-2xl">
        {/* Holographic border glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-lg blur-sm animate-pulse" />

        {/* Inner content */}
        <div className="relative z-10 p-6">
          {/* Title with neon effect */}
          <motion.h3
            className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400"
            animate={{
              backgroundPosition: [`0% 50%`, `100% 50%`, `0% 50%`],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {title}
          </motion.h3>

          {/* 3D Holographic Canvas */}
          <div className="relative h-64 rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              width={400}
              height={256}
              className="absolute inset-0 w-full h-full"
            />

            {/* Overlay data points */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="grid grid-cols-2 gap-4 p-4">
                {data.slice(0, 4).map((point, index) => (
                  <motion.div
                    key={point.id}
                    className="flex flex-col items-center text-center"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div
                      className="w-12 h-12 rounded-full border-2 border-cyan-400/50 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-sm flex items-center justify-center mb-2"
                      style={{
                        boxShadow: `0 0 20px ${point.color}50`,
                        borderColor: point.color,
                      }}
                    >
                      <span className="text-white text-sm font-bold">
                        {point.value}
                      </span>
                    </div>
                    <span className="text-xs text-cyan-300 font-medium">
                      {point.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Particle effect overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                animate={{
                  x: [0, 100, 0],
                  y: [0, 50, 100],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 3 + i * 0.2,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </div>
        </div>
      </Card>

      {/* Cyberpunk accent lines */}
      <div className="absolute -top-1 -right-1 w-16 h-16">
        <div className="absolute top-0 right-0 w-16 h-1 bg-gradient-to-r from-transparent to-cyan-500 animate-pulse" />
        <div className="absolute top-0 right-0 w-1 h-16 bg-gradient-to-b from-cyan-500 to-transparent animate-pulse" />
      </div>

      <div className="absolute -bottom-1 -left-1 w-16 h-16">
        <div className="absolute bottom-0 left-0 w-16 h-1 bg-gradient-to-r from-cyan-500 to-transparent animate-pulse" />
        <div className="absolute bottom-0 left-0 w-1 h-16 bg-gradient-to-t from-cyan-500 to-transparent animate-pulse" />
      </div>
    </motion.div>
  );
}
