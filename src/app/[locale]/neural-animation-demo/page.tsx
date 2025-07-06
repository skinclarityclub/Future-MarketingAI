"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  neuralVariants,
  neuralStagger,
  neuralLayout,
} from "@/lib/animations/neural-animation-framework";
import {
  Brain,
  Zap,
  Sparkles,
  Cpu,
  Activity,
  Target,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Eye,
  MousePointer,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimationDemoPageProps {
  params: Promise<{ locale: string }>;
}

// Add more futuristic CSS classes at the top
const futuristicEffects = {
  neuralGlow:
    "shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)]",
  quantumGlow:
    "shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.6)]",
  holographicGlow:
    "shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]",
  cyberpunkBorder:
    "border-2 border-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-clip-border",
  matrixEffect: "animate-pulse",
  scanLineEffect:
    "relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent before:h-[2px] before:animate-scan-line",
};

export default function NeuralAnimationDemoPage({
  params,
}: AnimationDemoPageProps) {
  const [selectedDemo, setSelectedDemo] = useState<string>("fadeIn");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [particleCount, setParticleCount] = useState(20);
  const [animationSpeed, setAnimationSpeed] = useState(1);

  // Demo components
  const NeuralGlassCard = ({
    children,
    variant = "neural",
    className,
  }: {
    children: React.ReactNode;
    variant?: "neural" | "quantum" | "holographic";
    className?: string;
  }) => {
    const variantClasses = {
      neural:
        "bg-gradient-to-br from-blue-500/10 via-blue-600/5 to-blue-700/10 border-blue-500/20",
      quantum:
        "bg-gradient-to-br from-purple-500/10 via-purple-600/5 to-purple-700/10 border-purple-500/20",
      holographic:
        "bg-gradient-to-br from-cyan-500/10 via-cyan-600/5 to-cyan-700/10 border-cyan-500/20",
    };

    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={neuralVariants.neuralFadeIn}
        whileHover={{
          background: variantClasses[variant]
            .replace("/10", "/15")
            .replace("/5", "/8"),
          boxShadow:
            variant === "neural"
              ? "0 0 30px rgba(59, 130, 246, 0.3), inset 0 0 30px rgba(59, 130, 246, 0.1)"
              : variant === "quantum"
                ? "0 0 30px rgba(147, 51, 234, 0.3), inset 0 0 30px rgba(147, 51, 234, 0.1)"
                : "0 0 30px rgba(6, 182, 212, 0.3), inset 0 0 30px rgba(6, 182, 212, 0.1)",
          transition: { duration: 0.3 },
        }}
        className={cn(
          "relative overflow-hidden rounded-2xl border backdrop-blur-xl p-6 group",
          variantClasses[variant],
          className
        )}
      >
        {/* Advanced Neural Grid Pattern */}
        <div className="absolute inset-0 opacity-30">
          <svg width="100%" height="100%" className="absolute inset-0">
            <defs>
              <pattern
                id={`neural-grid-${variant}`}
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <circle
                  cx="20"
                  cy="20"
                  r="1.5"
                  fill="currentColor"
                  className={
                    variant === "neural"
                      ? "text-blue-400"
                      : variant === "quantum"
                        ? "text-purple-400"
                        : "text-cyan-400"
                  }
                >
                  <animate
                    attributeName="opacity"
                    values="0.3;1;0.3"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </circle>
                <line
                  x1="0"
                  y1="20"
                  x2="40"
                  y2="20"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  opacity="0.3"
                  className={
                    variant === "neural"
                      ? "text-blue-400"
                      : variant === "quantum"
                        ? "text-purple-400"
                        : "text-cyan-400"
                  }
                />
                <line
                  x1="20"
                  y1="0"
                  x2="20"
                  y2="40"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  opacity="0.3"
                  className={
                    variant === "neural"
                      ? "text-blue-400"
                      : variant === "quantum"
                        ? "text-purple-400"
                        : "text-cyan-400"
                  }
                />
              </pattern>
              <filter id={`glow-${variant}`}>
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill={`url(#neural-grid-${variant})`}
              filter={`url(#glow-${variant})`}
            />
          </svg>
        </div>

        {/* Holographic Corner Accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-white/30 group-hover:border-white/60 transition-colors duration-300" />
        <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-white/30 group-hover:border-white/60 transition-colors duration-300" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-white/30 group-hover:border-white/60 transition-colors duration-300" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-white/30 group-hover:border-white/60 transition-colors duration-300" />

        {/* Content */}
        <div className="relative z-10">{children}</div>

        {/* Enhanced Holographic Shimmer */}
        <motion.div
          className={cn(
            "absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent -skew-x-12",
            variant === "neural" && "via-blue-400/20",
            variant === "quantum" && "via-purple-400/20",
            variant === "holographic" && "via-cyan-400/20"
          )}
          animate={{
            x: ["-100%", "200%"],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </motion.div>
    );
  };

  const QuantumButton = ({
    children,
    variant = "primary",
    processing = false,
    onClick,
    className,
  }: {
    children: React.ReactNode;
    variant?: "primary" | "quantum" | "neural";
    processing?: boolean;
    onClick?: () => void;
    className?: string;
  }) => {
    const [isHovered, setIsHovered] = useState(false);

    const variantClasses = {
      primary:
        "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25",
      quantum:
        "bg-gradient-to-r from-purple-600 to-indigo-700 text-white shadow-lg shadow-purple-500/25",
      neural:
        "bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-lg shadow-cyan-500/25",
    };

    return (
      <motion.button
        initial="idle"
        animate={processing ? "processing" : "idle"}
        whileHover={{
          scale: 1.02,
          boxShadow:
            variant === "primary"
              ? "0 0 25px rgba(59, 130, 246, 0.6), inset 0 0 25px rgba(59, 130, 246, 0.1)"
              : variant === "quantum"
                ? "0 0 25px rgba(147, 51, 234, 0.6), inset 0 0 25px rgba(147, 51, 234, 0.1)"
                : "0 0 25px rgba(6, 182, 212, 0.6), inset 0 0 25px rgba(6, 182, 212, 0.1)",
          background:
            variant === "primary"
              ? "linear-gradient(135deg, #3b82f6, #1d4ed8)"
              : variant === "quantum"
                ? "linear-gradient(135deg, #9333ea, #6b21a8)"
                : "linear-gradient(135deg, #06b6d4, #0891b2)",
        }}
        whileTap={{ scale: 0.98 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={onClick}
        disabled={processing}
        className={cn(
          "relative overflow-hidden font-semibold rounded-xl px-6 py-3 transition-all duration-300 group border border-white/20",
          variantClasses[variant],
          processing && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        {/* Matrix-style digital rain effect */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 12 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute top-0 w-[1px] bg-white"
              style={{
                left: `${i * 8.33}%`,
                height: "2px",
              }}
              animate={{
                y: [-10, 100],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "linear",
              }}
            />
          ))}
        </div>

        {/* Cyberpunk corner brackets */}
        <div className="absolute top-1 left-1 w-3 h-3 border-l border-t border-white/40 group-hover:border-white/80 transition-colors" />
        <div className="absolute top-1 right-1 w-3 h-3 border-r border-t border-white/40 group-hover:border-white/80 transition-colors" />
        <div className="absolute bottom-1 left-1 w-3 h-3 border-l border-b border-white/40 group-hover:border-white/80 transition-colors" />
        <div className="absolute bottom-1 right-1 w-3 h-3 border-r border-b border-white/40 group-hover:border-white/80 transition-colors" />

        {/* Enhanced Particle System */}
        {(processing || isHovered) && (
          <div className="absolute inset-0">
            {Array.from({ length: 15 }, (_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  background:
                    variant === "primary"
                      ? "#60a5fa"
                      : variant === "quantum"
                        ? "#a855f7"
                        : "#22d3ee",
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: processing ? 1.5 : 3,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        )}

        {/* Holographic scan line */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent h-[1px]"
          animate={{
            y: ["-100%", "100%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Data stream effect */}
        <motion.div
          className={cn(
            "absolute inset-0 bg-gradient-to-r from-transparent to-transparent -skew-x-12",
            variant === "primary" && "via-blue-400/30",
            variant === "quantum" && "via-purple-400/30",
            variant === "neural" && "via-cyan-400/30"
          )}
          animate={{
            x: ["-100%", "200%"],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <span className="relative z-10 flex items-center justify-center">
          {processing && (
            <motion.div
              className="mr-2 w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          )}
          {children}
        </span>
      </motion.button>
    );
  };

  const NeuralTypewriter = ({
    text,
    className,
  }: {
    text: string;
    className?: string;
  }) => {
    return (
      <motion.div
        variants={neuralVariants.neuralTypewriter}
        initial="hidden"
        animate="visible"
        className={className}
      >
        {text.split("").map((char, index) => (
          <motion.span
            key={index}
            variants={neuralVariants.neuralChar}
            className="inline-block"
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </motion.div>
    );
  };

  const AIProcessing = ({ isActive }: { isActive: boolean }) => {
    return (
      <motion.div
        animate={isActive ? "processing" : "idle"}
        variants={neuralVariants.aiProcessing}
        className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center"
      >
        <Brain className="w-8 h-8 text-white" />
      </motion.div>
    );
  };

  const NeuralDataPoint = ({
    value,
    label,
  }: {
    value: string;
    label: string;
  }) => {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <div className="text-3xl font-bold text-white mb-1">{value}</div>
        <div className="text-sm text-gray-400">{label}</div>
      </motion.div>
    );
  };

  const HolographicNav = () => {
    const navItems = ["Dashboard", "Analytics", "AI Tools", "Settings"];

    return (
      <motion.nav
        variants={neuralStagger.navigation}
        initial="hidden"
        animate="visible"
        className="flex space-x-4"
      >
        {navItems.map((item, index) => (
          <motion.a
            key={item}
            variants={neuralVariants.holographicReveal}
            href="#"
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            {item}
          </motion.a>
        ))}
      </motion.nav>
    );
  };

  const QuantumModal = () => {
    return (
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              variants={neuralLayout.modal}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-gray-900/90 backdrop-blur-xl rounded-2xl p-8 border border-white/20 max-w-md w-full">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Neural Modal
                </h3>
                <p className="text-gray-300 mb-6">
                  Dit is een voorbeeld van een quantum modal met advanced
                  animations.
                </p>
                <QuantumButton
                  onClick={() => setShowModal(false)}
                  variant="quantum"
                  className="w-full"
                >
                  Sluiten
                </QuantumButton>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 text-white">
      {/* Page container with page transition */}
      <motion.div
        variants={neuralLayout.page}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-4 py-8"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <NeuralTypewriter
            text="Neural Animation Framework Demo"
            className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"
          />
          <p className="text-xl text-gray-300">
            Geavanceerde AI-geïnspireerde animaties voor enterprise applicaties
          </p>
        </div>

        {/* Three-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Column 1: Neural Glass Cards */}
          <motion.div
            variants={neuralStagger.cards}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold mb-4 text-blue-400">
              Neural Glass Cards
            </h2>

            <NeuralGlassCard variant="neural">
              <div className="flex items-center mb-4">
                <Brain className="w-8 h-8 text-blue-400 mr-3" />
                <h3 className="text-xl font-semibold">Neural Processing</h3>
              </div>
              <p className="text-gray-300 mb-4">
                AI-gedriven content analysis met real-time verwerking
              </p>
              <NeuralDataPoint value="94.7%" label="Accuracy Rate" />
            </NeuralGlassCard>

            <NeuralGlassCard variant="quantum">
              <div className="flex items-center mb-4">
                <Zap className="w-8 h-8 text-purple-400 mr-3" />
                <h3 className="text-xl font-semibold">Quantum Algorithms</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Geavanceerde quantum computing voor complexe berekeningen
              </p>
              <NeuralDataPoint value="∞" label="Possibilities" />
            </NeuralGlassCard>

            <NeuralGlassCard variant="holographic">
              <div className="flex items-center mb-4">
                <Sparkles className="w-8 h-8 text-cyan-400 mr-3" />
                <h3 className="text-xl font-semibold">Holographic Interface</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Immersive 3D data visualisatie met holographic effecten
              </p>
              <NeuralDataPoint value="4D" label="Dimensions" />
            </NeuralGlassCard>
          </motion.div>

          {/* Column 2: Interactive Controls */}
          <motion.div
            variants={neuralStagger.features}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold mb-4 text-purple-400">
              Interactive Controls
            </h2>

            <NeuralGlassCard variant="neural">
              <h3 className="text-xl font-semibold mb-4">AI Processing Demo</h3>
              <div className="flex flex-col items-center space-y-4">
                <AIProcessing isActive={isProcessing} />
                <QuantumButton
                  onClick={() => setIsProcessing(!isProcessing)}
                  processing={isProcessing}
                  variant="neural"
                >
                  {isProcessing ? "Processing..." : "Start AI"}
                </QuantumButton>
              </div>
            </NeuralGlassCard>

            <NeuralGlassCard variant="quantum">
              <h3 className="text-xl font-semibold mb-4">Button Variants</h3>
              <div className="space-y-3">
                <QuantumButton variant="primary" className="w-full">
                  Primary Button
                </QuantumButton>
                <QuantumButton variant="quantum" className="w-full">
                  Quantum Button
                </QuantumButton>
                <QuantumButton variant="neural" className="w-full">
                  Neural Button
                </QuantumButton>
              </div>
            </NeuralGlassCard>

            <NeuralGlassCard variant="holographic">
              <h3 className="text-xl font-semibold mb-4">Modal Demo</h3>
              <QuantumButton
                onClick={() => setShowModal(true)}
                variant="quantum"
                className="w-full"
              >
                Open Quantum Modal
              </QuantumButton>
            </NeuralGlassCard>

            <NeuralGlassCard variant="neural">
              <h3 className="text-xl font-semibold mb-4">Navigation</h3>
              <HolographicNav />
            </NeuralGlassCard>
          </motion.div>

          {/* Column 3: Data Visualization */}
          <motion.div
            variants={neuralStagger.container}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold mb-4 text-cyan-400">
              Data Visualization
            </h2>

            <NeuralGlassCard variant="holographic">
              <h3 className="text-xl font-semibold mb-4">Real-time Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                <NeuralDataPoint value="2.4M" label="Data Points" />
                <NeuralDataPoint value="99.9%" label="Uptime" />
                <NeuralDataPoint value="145ms" label="Response Time" />
                <NeuralDataPoint value="€2.8M" label="ROI Generated" />
              </div>
            </NeuralGlassCard>

            <NeuralGlassCard variant="quantum">
              <h3 className="text-xl font-semibold mb-4">
                Neural Network Activity
              </h3>
              <div className="space-y-4">
                {Array.from({ length: 5 }, (_, i) => {
                  const baseWidth = 30 + i * 15; // Different base widths for each layer
                  const maxWidth = baseWidth + 40;
                  return (
                    <motion.div
                      key={i}
                      className="flex items-center space-x-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.2 }}
                    >
                      <motion.div
                        animate={{
                          scale: [1, 1.4, 1],
                          backgroundColor: [
                            "rgb(59, 130, 246)", // blue-500
                            "rgb(147, 51, 234)", // purple-600
                            "rgb(59, 130, 246)",
                          ],
                        }}
                        transition={{
                          duration: 2 + i * 0.5,
                          repeat: Infinity,
                          delay: i * 0.4,
                        }}
                        className="w-4 h-4 rounded-full shadow-lg"
                        style={{
                          boxShadow: "0 0 10px rgba(59, 130, 246, 0.5)",
                        }}
                      />
                      <div className="flex-1 bg-gray-700/50 rounded-full h-3 border border-gray-600/30">
                        <motion.div
                          className="h-full rounded-full relative overflow-hidden"
                          style={{
                            background:
                              "linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4)",
                          }}
                          animate={{
                            width: [
                              `${baseWidth}%`,
                              `${maxWidth}%`,
                              `${baseWidth}%`,
                            ],
                          }}
                          transition={{
                            duration: 3 + i * 0.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.2,
                          }}
                        >
                          {/* Flowing effect inside bar */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            animate={{
                              x: ["-100%", "200%"],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "linear",
                              delay: i * 0.3,
                            }}
                          />
                        </motion.div>
                      </div>
                      <motion.span
                        className="text-sm font-mono min-w-[60px]"
                        animate={{
                          color: [
                            "rgb(156, 163, 175)", // gray-400
                            "rgb(59, 130, 246)", // blue-500
                            "rgb(156, 163, 175)",
                          ],
                        }}
                        transition={{
                          duration: 2.5 + i * 0.3,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      >
                        Layer {i + 1}
                      </motion.span>
                    </motion.div>
                  );
                })}
              </div>
            </NeuralGlassCard>

            <NeuralGlassCard variant="neural">
              <h3 className="text-xl font-semibold mb-4">
                Performance Monitor
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">CPU Usage</span>
                  <motion.span
                    className="text-green-400 font-mono"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    23.4%
                  </motion.span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Memory</span>
                  <motion.span
                    className="text-blue-400 font-mono"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  >
                    1.2GB
                  </motion.span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Network</span>
                  <motion.span
                    className="text-purple-400 font-mono"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  >
                    45.2 Mbps
                  </motion.span>
                </div>
              </div>
            </NeuralGlassCard>
          </motion.div>
        </div>

        {/* Footer with framework info */}
        <motion.footer
          variants={neuralVariants.neuralFadeIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 1 }}
          className="mt-16 text-center"
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <p className="text-gray-400 mb-2">
              Powered by Neural Animation Framework v2.0 - Enterprise Grade AI
              Animations
            </p>
            <p className="text-sm text-gray-500">
              Optimized for 60FPS • GPU Accelerated • WCAG 2.1 Compliant •
              Mobile Responsive
            </p>
          </div>
        </motion.footer>
      </motion.div>

      {/* Quantum Modal */}
      <QuantumModal />
    </div>
  );
}
