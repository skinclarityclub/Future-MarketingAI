"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

interface PatternConfig {
  type: "geometric" | "organic" | "tech" | "neural";
  intensity: number;
  colorScheme: "cyan" | "blue" | "purple" | "rainbow";
  speed: number;
}

const GeometricPattern: React.FC<{ config: PatternConfig }> = ({ config }) => {
  const [shapes, setShapes] = useState<
    Array<{
      id: number;
      x: number;
      y: number;
      size: number;
      rotation: number;
      opacity: number;
      shape: "circle" | "square" | "triangle" | "hexagon";
    }>
  >([]);

  useEffect(() => {
    const generateShapes = () => {
      const newShapes = [];
      const shapeCount = Math.floor(config.intensity * 20);

      for (let i = 0; i < shapeCount; i++) {
        newShapes.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 40 + 10,
          rotation: Math.random() * 360,
          opacity: Math.random() * 0.3 + 0.1,
          shape: ["circle", "square", "triangle", "hexagon"][
            Math.floor(Math.random() * 4)
          ] as any,
        });
      }
      setShapes(newShapes);
    };

    generateShapes();
    const interval = setInterval(generateShapes, 10000);
    return () => clearInterval(interval);
  }, [config.intensity]);

  const getColorClass = (index: number) => {
    const colors = {
      cyan: ["border-cyan-400", "bg-cyan-400/10"],
      blue: ["border-blue-400", "bg-blue-400/10"],
      purple: ["border-purple-400", "bg-purple-400/10"],
      rainbow: [
        "border-cyan-400",
        "border-blue-400",
        "border-purple-400",
        "border-pink-400",
        "border-green-400",
      ][index % 5],
    };
    return config.colorScheme === "rainbow"
      ? colors.rainbow
      : colors[config.colorScheme];
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      {shapes.map((shape, index) => (
        <motion.div
          key={shape.id}
          className={`absolute ${getColorClass(index)} ${shape.shape === "circle" ? "rounded-full" : ""}`}
          style={{
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            width: `${shape.size}px`,
            height: `${shape.size}px`,
            opacity: shape.opacity,
            borderWidth: "1px",
          }}
          animate={{
            rotate: [shape.rotation, shape.rotation + 360],
            scale: [0.8, 1.2, 0.8],
            opacity: [shape.opacity * 0.5, shape.opacity, shape.opacity * 0.5],
          }}
          transition={{
            duration: 20 / config.speed,
            repeat: Infinity,
            ease: "linear",
            delay: index * 0.1,
          }}
        />
      ))}
    </div>
  );
};

const NeuralNetwork: React.FC<{ config: PatternConfig }> = ({ config }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<
    Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      connections: number[];
    }>
  >([]);

  useEffect(() => {
    const generateNodes = () => {
      const nodeCount = Math.floor(config.intensity * 30);
      const newNodes = [];

      for (let i = 0; i < nodeCount; i++) {
        newNodes.push({
          x: Math.random() * 100,
          y: Math.random() * 100,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          connections: [],
        });
      }

      // Generate connections
      newNodes.forEach((node, i) => {
        const connectionCount = Math.floor(Math.random() * 3) + 1;
        for (let j = 0; j < connectionCount; j++) {
          const targetIndex = Math.floor(Math.random() * newNodes.length);
          if (targetIndex !== i && !node.connections.includes(targetIndex)) {
            node.connections.push(targetIndex);
          }
        }
      });

      setNodes(newNodes);
    };

    generateNodes();
  }, [config.intensity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update node positions
      setNodes(prevNodes =>
        prevNodes.map(node => ({
          ...node,
          x: (node.x + node.vx + 100) % 100,
          y: (node.y + node.vy + 100) % 100,
        }))
      );

      // Draw connections
      ctx.strokeStyle =
        config.colorScheme === "cyan"
          ? "rgba(34, 211, 238, 0.3)"
          : config.colorScheme === "blue"
            ? "rgba(59, 130, 246, 0.3)"
            : config.colorScheme === "purple"
              ? "rgba(168, 85, 247, 0.3)"
              : "rgba(34, 211, 238, 0.3)";
      ctx.lineWidth = 1;

      nodes.forEach((node, i) => {
        node.connections.forEach(connectionIndex => {
          if (connectionIndex < nodes.length) {
            const target = nodes[connectionIndex];
            ctx.beginPath();
            ctx.moveTo(
              (node.x / 100) * canvas.width,
              (node.y / 100) * canvas.height
            );
            ctx.lineTo(
              (target.x / 100) * canvas.width,
              (target.y / 100) * canvas.height
            );
            ctx.stroke();
          }
        });
      });

      // Draw nodes
      ctx.fillStyle =
        config.colorScheme === "cyan"
          ? "rgba(34, 211, 238, 0.6)"
          : config.colorScheme === "blue"
            ? "rgba(59, 130, 246, 0.6)"
            : config.colorScheme === "purple"
              ? "rgba(168, 85, 247, 0.6)"
              : "rgba(34, 211, 238, 0.6)";

      nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(
          (node.x / 100) * canvas.width,
          (node.y / 100) * canvas.height,
          3,
          0,
          Math.PI * 2
        );
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();
  }, [nodes, config.colorScheme]);

  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-40"
      style={{ pointerEvents: "none" }}
    />
  );
};

const TechGrid: React.FC<{ config: PatternConfig }> = ({ config }) => {
  const getColorClass = () => {
    const colors = {
      cyan: "border-cyan-400/20",
      blue: "border-blue-400/20",
      purple: "border-purple-400/20",
      rainbow: "border-cyan-400/20",
    };
    return colors[config.colorScheme];
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className={`absolute inset-0 ${getColorClass()}`}
        style={{
          backgroundImage: `
            linear-gradient(${getColorClass().replace("/20", "/10")} 1px, transparent 1px),
            linear-gradient(90deg, ${getColorClass().replace("/20", "/10")} 1px, transparent 1px)
          `,
          backgroundSize: `${50 / config.intensity}px ${50 / config.intensity}px`,
        }}
        animate={{
          backgroundPosition: ["0px 0px", "50px 50px"],
        }}
        transition={{
          duration: 20 / config.speed,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Pulsing grid intersections */}
      {Array.from({ length: Math.floor(config.intensity * 10) }).map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-2 h-2 ${getColorClass().replace("border-", "bg-").replace("/20", "/40")} rounded-full`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            scale: [0.5, 1.5, 0.5],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 3 / config.speed,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
};

export const AIGeneratedBackground: React.FC<{
  pattern?: PatternConfig["type"];
  intensity?: number;
  colorScheme?: PatternConfig["colorScheme"];
  speed?: number;
  className?: string;
}> = ({
  pattern = "geometric",
  intensity = 0.5,
  colorScheme = "cyan",
  speed = 1,
  className = "",
}) => {
  const [currentPattern, setCurrentPattern] =
    useState<PatternConfig["type"]>(pattern);

  useEffect(() => {
    if (pattern === "neural") {
      // Auto-cycle through patterns for neural type
      const patterns: PatternConfig["type"][] = [
        "geometric",
        "tech",
        "organic",
      ];
      let currentIndex = 0;

      const interval = setInterval(() => {
        currentIndex = (currentIndex + 1) % patterns.length;
        setCurrentPattern(patterns[currentIndex]);
      }, 15000);

      return () => clearInterval(interval);
    }
  }, [pattern]);

  const config: PatternConfig = {
    type: currentPattern,
    intensity,
    colorScheme,
    speed,
  };

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />

      {/* Pattern overlay */}
      {config.type === "geometric" && <GeometricPattern config={config} />}
      {config.type === "neural" && <NeuralNetwork config={config} />}
      {config.type === "tech" && <TechGrid config={config} />}
      {config.type === "organic" && (
        <GeometricPattern config={{ ...config, type: "geometric" }} />
      )}

      {/* Color overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-r opacity-10 ${
          colorScheme === "cyan"
            ? "from-cyan-500/20 via-transparent to-cyan-500/20"
            : colorScheme === "blue"
              ? "from-blue-500/20 via-transparent to-blue-500/20"
              : colorScheme === "purple"
                ? "from-purple-500/20 via-transparent to-purple-500/20"
                : "from-cyan-500/20 via-blue-500/20 to-purple-500/20"
        }`}
      />
    </div>
  );
};
