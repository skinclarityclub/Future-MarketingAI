"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface QuantumBackgroundProps {
  intensity?: "low" | "medium" | "high";
  color?: "cyan" | "purple" | "multi";
  className?: string;
}

export default function QuantumBackground({
  intensity = "medium",
  color = "multi",
  className = "",
}: QuantumBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
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

    // Quantum particles
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
    }> = [];

    // Energy streams
    const streams: Array<{
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      progress: number;
      speed: number;
      color: string;
      intensity: number;
    }> = [];

    // Initialize particles
    const particleCount =
      intensity === "low" ? 50 : intensity === "medium" ? 100 : 200;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 100,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        vz: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1,
        life: Math.random() * 100,
        maxLife: 100,
        color: getRandomColor(),
        energy: Math.random(),
      });
    }

    // Initialize energy streams
    const streamCount =
      intensity === "low" ? 5 : intensity === "medium" ? 10 : 20;
    for (let i = 0; i < streamCount; i++) {
      streams.push({
        x1: Math.random() * canvas.width,
        y1: Math.random() * canvas.height,
        x2: Math.random() * canvas.width,
        y2: Math.random() * canvas.height,
        progress: 0,
        speed: Math.random() * 0.02 + 0.01,
        color: getRandomColor(),
        intensity: Math.random() * 0.8 + 0.2,
      });
    }

    function getRandomColor() {
      const colors =
        color === "multi"
          ? ["#06b6d4", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b"]
          : color === "cyan"
            ? ["#06b6d4", "#67e8f9", "#a5f3fc"]
            : ["#8b5cf6", "#c084fc", "#e879f9"];

      return colors[Math.floor(Math.random() * colors.length)];
    }

    function drawParticle(particle: (typeof particles)[0]) {
      const { x, y, z, size, life, maxLife, color, energy } = particle;

      // 3D perspective calculation
      const perspective = 300;
      const scale = perspective / (perspective + z);
      const screenX = x * scale;
      const screenY = y * scale;
      const screenSize = size * scale;

      // Opacity based on life and energy
      const opacity = (life / maxLife) * energy;

      // Glow effect
      ctx.save();
      ctx.globalAlpha = opacity * 0.8;
      ctx.shadowColor = color;
      ctx.shadowBlur = screenSize * 4;

      // Draw particle core
      ctx.beginPath();
      ctx.arc(screenX, screenY, screenSize, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Draw particle halo
      ctx.globalAlpha = opacity * 0.3;
      ctx.shadowBlur = screenSize * 8;
      ctx.beginPath();
      ctx.arc(screenX, screenY, screenSize * 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    function drawEnergyStream(stream: (typeof streams)[0]) {
      const { x1, y1, x2, y2, progress, color, intensity } = stream;

      // Calculate current position along the stream
      const currentX = x1 + (x2 - x1) * progress;
      const currentY = y1 + (y2 - y1) * progress;

      // Draw energy trail
      ctx.save();
      ctx.globalAlpha = intensity * 0.6;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;

      // Create gradient along the stream
      const gradient = ctx.createLinearGradient(x1, y1, currentX, currentY);
      gradient.addColorStop(0, "transparent");
      gradient.addColorStop(0.7, color + "80");
      gradient.addColorStop(1, color);

      ctx.strokeStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(currentX, currentY);
      ctx.stroke();

      // Draw energy head
      ctx.globalAlpha = intensity;
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(currentX, currentY, 3, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      ctx.restore();
    }

    function drawNeuralNetwork() {
      // Connect nearby particles with neural connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.save();
            ctx.globalAlpha = (1 - distance / 150) * 0.3;
            ctx.strokeStyle = getRandomColor();
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

    function animate() {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach((particle, index) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.z += particle.vz;

        // Update life
        particle.life -= 0.5;

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        if (particle.z < 0 || particle.z > 100) particle.vz *= -1;

        // Reset particle if dead
        if (particle.life <= 0) {
          particle.x = Math.random() * canvas.width;
          particle.y = Math.random() * canvas.height;
          particle.z = Math.random() * 100;
          particle.life = particle.maxLife;
          particle.color = getRandomColor();
        }

        drawParticle(particle);
      });

      // Update and draw energy streams
      streams.forEach(stream => {
        stream.progress += stream.speed;

        // Reset stream when complete
        if (stream.progress >= 1) {
          stream.x1 = Math.random() * canvas.width;
          stream.y1 = Math.random() * canvas.height;
          stream.x2 = Math.random() * canvas.width;
          stream.y2 = Math.random() * canvas.height;
          stream.progress = 0;
          stream.color = getRandomColor();
        }

        drawEnergyStream(stream);
      });

      // Draw neural network connections
      if (intensity !== "low") {
        drawNeuralNetwork();
      }

      animationRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [intensity, color]);

  return (
    <div className={`fixed inset-0 overflow-hidden ${className}`}>
      {/* Holographic overlay gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-500/3 to-transparent" />

      {/* Quantum field canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ mixBlendMode: "screen" }}
      />

      {/* Holographic scan lines */}
      <motion.div
        className="absolute inset-0 opacity-10"
        initial={{ backgroundPosition: "0 0" }}
        animate={{ backgroundPosition: "0 100vh" }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.2) 2px, rgba(0, 255, 255, 0.2) 4px)",
        }}
      />

      {/* Energy grid overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(6, 182, 212, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />
    </div>
  );
}
