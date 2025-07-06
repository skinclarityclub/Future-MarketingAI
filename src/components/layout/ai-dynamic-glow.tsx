"use client";

import React from "react";
import { motion } from "framer-motion";

interface AIDynamicGlowProps {
  className?: string;
  intensity?: "low" | "medium" | "high";
  colors?: string[];
  size?: "sm" | "md" | "lg";
}

export const AIDynamicGlow: React.FC<AIDynamicGlowProps> = ({
  className = "",
  intensity = "medium",
  colors = ["blue", "purple", "green"],
  size = "md",
}) => {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const intensitySettings = {
    low: {
      duration: 8,
      opacity: [0.2, 0.4, 0.2],
      scale: [0.8, 1.1, 0.8],
    },
    medium: {
      duration: 5,
      opacity: [0.3, 0.6, 0.3],
      scale: [0.9, 1.2, 0.9],
    },
    high: {
      duration: 3,
      opacity: [0.4, 0.8, 0.4],
      scale: [1, 1.4, 1],
    },
  };

  const colorMap = {
    blue: "rgba(59, 130, 246, 0.6)",
    purple: "rgba(147, 51, 234, 0.6)",
    green: "rgba(34, 197, 94, 0.6)",
    cyan: "rgba(6, 182, 212, 0.6)",
    pink: "rgba(236, 72, 153, 0.6)",
  };

  const animationColors = colors
    .map(color => colorMap[color as keyof typeof colorMap])
    .filter(Boolean);

  return (
    <div className={`absolute pointer-events-none ${className}`}>
      {/* Central Glow Core */}
      <motion.div
        className={`relative ${sizeClasses[size]} rounded-full`}
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {/* Main Glow Effect */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            backgroundColor: animationColors,
            boxShadow: animationColors.map(color => `0 0 30px ${color}`),
            scale: intensitySettings[intensity].scale,
            opacity: intensitySettings[intensity].opacity,
          }}
          transition={{
            duration: intensitySettings[intensity].duration,
            repeat: Infinity,
            ease: [0.4, 0.0, 0.2, 1],
          }}
        />

        {/* Outer Ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2"
          animate={{
            borderColor: animationColors,
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: intensitySettings[intensity].duration + 1,
            repeat: Infinity,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        />

        {/* Inner Pulse */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
          animate={{
            backgroundColor: animationColors,
            scale: [0.5, 1.5, 0.5],
            boxShadow: animationColors.map(color => `0 0 15px ${color}`),
          }}
          transition={{
            duration: intensitySettings[intensity].duration - 1,
            repeat: Infinity,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        />
      </motion.div>
    </div>
  );
};
