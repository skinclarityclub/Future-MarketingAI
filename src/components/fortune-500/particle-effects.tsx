"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ParticleEffectsProps {
  count?: number;
  color?: "cyan" | "purple" | "pink" | "green" | "white";
  speed?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  isActive?: boolean;
}

export default function ParticleEffects({
  count = 50,
  color = "cyan",
  speed = 1,
  size = "sm",
  className,
  isActive = true,
}: ParticleEffectsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const getColorClass = () => {
    switch (color) {
      case "cyan":
        return "bg-cyan-400";
      case "purple":
        return "bg-purple-400";
      case "pink":
        return "bg-pink-400";
      case "green":
        return "bg-green-400";
      case "white":
        return "bg-white";
      default:
        return "bg-cyan-400";
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case "sm":
        return "w-0.5 h-0.5";
      case "md":
        return "w-1 h-1";
      case "lg":
        return "w-1.5 h-1.5";
      default:
        return "w-0.5 h-0.5";
    }
  };

  if (!isActive) return null;

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute inset-0 pointer-events-none overflow-hidden",
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className={cn(
            "absolute rounded-full opacity-60",
            getColorClass(),
            getSizeClass()
          )}
          initial={{
            x:
              Math.random() *
              (typeof window !== "undefined" ? window.innerWidth : 1000),
            y:
              Math.random() *
              (typeof window !== "undefined" ? window.innerHeight : 1000),
            opacity: 0,
          }}
          animate={{
            x: [
              Math.random() *
                (typeof window !== "undefined" ? window.innerWidth : 1000),
              Math.random() *
                (typeof window !== "undefined" ? window.innerWidth : 1000),
              Math.random() *
                (typeof window !== "undefined" ? window.innerWidth : 1000),
            ],
            y: [
              Math.random() *
                (typeof window !== "undefined" ? window.innerHeight : 1000),
              Math.random() *
                (typeof window !== "undefined" ? window.innerHeight : 1000),
              Math.random() *
                (typeof window !== "undefined" ? window.innerHeight : 1000),
            ],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: (3 + Math.random() * 4) / speed,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "linear",
          }}
          style={{
            filter: `blur(${Math.random() * 2}px)`,
            boxShadow: `0 0 ${4 + Math.random() * 8}px currentColor`,
          }}
        />
      ))}

      {/* Additional floating orbs */}
      {Array.from({ length: Math.floor(count / 5) }).map((_, i) => (
        <motion.div
          key={`orb-${i}`}
          className={cn(
            "absolute rounded-full opacity-30 blur-sm",
            color === "cyan" && "bg-cyan-300",
            color === "purple" && "bg-purple-300",
            color === "pink" && "bg-pink-300",
            color === "green" && "bg-green-300",
            color === "white" && "bg-white",
            "w-2 h-2"
          )}
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: (8 + Math.random() * 4) / speed,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeInOut",
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            boxShadow: `0 0 20px currentColor`,
          }}
        />
      ))}
    </div>
  );
}
