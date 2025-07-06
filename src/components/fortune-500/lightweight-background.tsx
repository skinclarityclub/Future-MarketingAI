"use client";

import React from "react";

interface LightweightBackgroundProps {
  intensity?: "low" | "medium" | "high";
  color?: "cyan" | "purple" | "multi";
  className?: string;
}

export default function LightweightBackground({
  intensity = "medium",
  color = "multi",
  className = "",
}: LightweightBackgroundProps) {
  // ⚡ PERFORMANCE: CSS-only animations instead of canvas
  const getParticleCount = () => {
    switch (intensity) {
      case "low":
        return 10;
      case "medium":
        return 20;
      case "high":
        return 30;
      default:
        return 20;
    }
  };

  const getColorScheme = () => {
    switch (color) {
      case "cyan":
        return "from-cyan-500/20 via-cyan-400/10 to-cyan-600/20";
      case "purple":
        return "from-purple-500/20 via-purple-400/10 to-purple-600/20";
      case "multi":
        return "from-cyan-500/20 via-purple-400/10 to-pink-500/20";
      default:
        return "from-cyan-500/20 via-purple-400/10 to-pink-500/20";
    }
  };

  const particles = Array.from({ length: getParticleCount() }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 5,
    duration: Math.random() * 10 + 10,
  }));

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* ⚡ Static gradient background - no animation */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${getColorScheme()}`}
      />

      {/* ⚡ CSS-only animated particles - much faster than canvas */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-cyan-400/30"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animation: `float ${particle.duration}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`,
            filter: "blur(1px)",
          }}
        />
      ))}

      {/* ⚡ CSS-only grid overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* ⚡ CSS animation keyframes */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) scale(1.1);
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
}
