"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { cn } from "@/lib/utils";
import { Maximize2, Minimize2, X, Settings } from "lucide-react";

interface GlassmorphismPanelProps {
  title: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "success";
  isFloating?: boolean;
  isExpandable?: boolean;
  className?: string;
  onClose?: () => void;
  neonAccent?: "cyan" | "purple" | "pink" | "green" | "amber";
}

export default function GlassmorphismPanel({
  title,
  children,
  variant = "primary",
  isFloating = false,
  isExpandable = true,
  className,
  onClose,
  neonAccent = "cyan",
}: GlassmorphismPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [glowIntensity, setGlowIntensity] = useState(0.3);

  // Cyberpunk glow animation
  useEffect(() => {
    const interval = setInterval(() => {
      setGlowIntensity(prev => (prev === 0.3 ? 0.6 : 0.3));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return "from-slate-900/40 to-blue-900/20 border-cyan-500/30";
      case "secondary":
        return "from-slate-900/40 to-purple-900/20 border-purple-500/30";
      case "danger":
        return "from-slate-900/40 to-red-900/20 border-red-500/30";
      case "success":
        return "from-slate-900/40 to-green-900/20 border-green-500/30";
      default:
        return "from-slate-900/40 to-blue-900/20 border-cyan-500/30";
    }
  };

  return (
    <motion.div
      className={cn("relative group", isFloating && "absolute z-50", className)}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Background glow effect */}
      <motion.div
        className="absolute inset-0 rounded-lg blur-xl shadow-cyan-500/50 border-cyan-500/50"
        animate={{
          opacity: isHovered ? glowIntensity + 0.3 : glowIntensity,
          scale: isHovered ? 1.02 : 1,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Main glassmorphism card */}
      <Card
        className={cn(
          "relative overflow-hidden backdrop-blur-xl shadow-2xl border-2",
          "bg-gradient-to-br",
          getVariantStyles(),
          isHovered && "border-opacity-80"
        )}
      >
        {/* Header */}
        <CardHeader className="relative z-10 flex flex-row items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
              <div className="absolute inset-0 w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
            </div>

            <motion.h3 className="font-bold text-lg font-mono tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">
              {title}
            </motion.h3>
          </div>

          <div className="flex items-center gap-2">
            {isExpandable && (
              <NormalButton
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </NormalButton>
            )}

            <NormalButton
              variant="ghost"
              size="sm"
              className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
            >
              <Settings size={16} />
            </NormalButton>

            {onClose && (
              <NormalButton
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <X size={16} />
              </NormalButton>
            )}
          </div>
        </CardHeader>

        {/* Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <CardContent className="relative z-10 p-4 pt-0">
                <div className="relative z-10">{children}</div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
