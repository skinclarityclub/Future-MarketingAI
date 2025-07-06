"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MatrixBackgroundProps {
  intensity?: "low" | "medium" | "high";
  color?: "green" | "cyan" | "purple" | "amber";
  speed?: number;
  className?: string;
  isActive?: boolean;
}

export default function MatrixBackground({
  intensity = "medium",
  color = "cyan",
  speed = 1,
  className,
  isActive = true,
}: MatrixBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isClient, setIsClient] = useState(false);

  // Characters for matrix effect - mix of Japanese katakana, numbers, and symbols
  const characters =
    "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+-=[]{}|;:,.<>?";

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Matrix configuration
    const fontSize =
      intensity === "low" ? 14 : intensity === "medium" ? 16 : 18;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    // Color configuration
    const getColor = (alpha: number = 1) => {
      switch (color) {
        case "green":
          return `rgba(0, 255, 0, ${alpha})`;
        case "cyan":
          return `rgba(0, 255, 255, ${alpha})`;
        case "purple":
          return `rgba(147, 51, 234, ${alpha})`;
        case "amber":
          return `rgba(245, 158, 11, ${alpha})`;
        default:
          return `rgba(0, 255, 255, ${alpha})`;
      }
    };

    let animationId: number;

    const draw = () => {
      // Black background with slight transparency for trail effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Matrix text
      ctx.fillStyle = getColor(1);
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        // Random character
        const text = characters[Math.floor(Math.random() * characters.length)];

        // Position
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Draw character with glow effect
        ctx.shadowColor = getColor(0.8);
        ctx.shadowBlur = 10;
        ctx.fillText(text, x, y);

        // Reset drop to top randomly or when it reaches bottom
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        // Move drop down
        drops[i] += speed;
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [isClient, isActive, intensity, color, speed, characters]);

  if (!isClient) {
    return null;
  }

  return (
    <motion.div
      className={cn("fixed inset-0 pointer-events-none z-0", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: isActive ? 0.6 : 0 }}
      transition={{ duration: 1 }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{
          filter: intensity === "high" ? "brightness(1.2)" : "brightness(1)",
        }}
      />

      {/* Additional overlay effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-950/10 to-slate-950/30" />

      {/* Scan line effect */}
      <motion.div
        className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"
        animate={{
          y: [0, window.innerHeight || 1000, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </motion.div>
  );
}
