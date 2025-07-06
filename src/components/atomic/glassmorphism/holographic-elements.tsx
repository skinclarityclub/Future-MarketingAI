"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * HOLOGRAPHIC ELEMENTS LIBRARY
 * Advanced glassmorphism and holographic UI components
 * Building upon existing premium design system
 */

// ============================
// TYPES & INTERFACES
// ============================

export interface HolographicProps {
  className?: string;
  intensity?: "subtle" | "medium" | "strong" | "maximum" | "infinite";
  variant?: "neural" | "quantum" | "holographic" | "cybernetic";
  animated?: boolean;
  children?: React.ReactNode;
}

export interface HolographicGlassProps extends HolographicProps {
  blur?: "light" | "medium" | "heavy" | "extreme";
  opacity?: "low" | "medium" | "high" | "maximum";
  gradient?: boolean;
  particles?: boolean;
  dataFlow?: boolean;
}

// ============================
// ENHANCED GLASS MORPHISM SYSTEM
// ============================

export const HolographicGlass: React.FC<HolographicGlassProps> = ({
  children,
  className,
  intensity = "medium",
  variant = "neural",
  blur = "medium",
  opacity = "medium",
  gradient = true,
  particles = false,
  dataFlow = false,
  animated = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Intensity mappings
  const intensityStyles = {
    subtle: "bg-white/5 border-white/10 shadow-lg",
    medium: "bg-white/10 border-white/20 shadow-xl",
    strong: "bg-white/15 border-white/30 shadow-2xl",
    maximum: "bg-white/20 border-white/40 shadow-massive",
    infinite: "bg-white/25 border-white/50 shadow-ethereal",
  };

  const blurStyles = {
    light: "backdrop-blur-sm",
    medium: "backdrop-blur-md",
    heavy: "backdrop-blur-lg",
    extreme: "backdrop-blur-xl",
  };

  const variantStyles = {
    neural:
      "border-blue-400/30 bg-gradient-to-br from-blue-500/10 to-purple-500/5",
    quantum:
      "border-purple-400/30 bg-gradient-to-br from-purple-500/10 to-cyan-500/5",
    holographic:
      "border-cyan-400/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/5",
    cybernetic:
      "border-green-400/30 bg-gradient-to-br from-green-500/10 to-blue-500/5",
  };

  return (
    <motion.div
      className={cn(
        "relative rounded-2xl border transition-all duration-500",
        intensityStyles[intensity],
        blurStyles[blur],
        gradient && variantStyles[variant],
        animated && "hover:scale-[1.02] hover:shadow-holographic",
        className
      )}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={animated ? { y: -4 } : {}}
    >
      {/* Neural Network Pattern Overlay */}
      {particles && (
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <svg className="absolute inset-0 w-full h-full opacity-20">
            <defs>
              <pattern
                id={`neural-pattern-${variant}`}
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <circle
                  cx="20"
                  cy="20"
                  r="1"
                  fill="currentColor"
                  className={`text-${variant === "neural" ? "blue" : variant === "quantum" ? "purple" : "cyan"}-400`}
                />
                <circle
                  cx="0"
                  cy="0"
                  r="0.5"
                  fill="currentColor"
                  className={`text-${variant === "neural" ? "blue" : variant === "quantum" ? "purple" : "cyan"}-300`}
                />
                <circle
                  cx="40"
                  cy="40"
                  r="0.5"
                  fill="currentColor"
                  className={`text-${variant === "neural" ? "blue" : variant === "quantum" ? "purple" : "cyan"}-300`}
                />
              </pattern>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill={`url(#neural-pattern-${variant})`}
            />
          </svg>
        </div>
      )}

      {/* Data Flow Animation */}
      {dataFlow && (
        <motion.div
          className={cn(
            "absolute inset-0 rounded-2xl",
            "bg-gradient-to-r from-transparent via-white/10 to-transparent"
          )}
          animate={isHovered ? { x: ["-100%", "200%"] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* Holographic Corner Accents */}
      <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-white/40 rounded-tl-lg" />
      <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-white/40 rounded-tr-lg" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-white/40 rounded-bl-lg" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-white/40 rounded-br-lg" />

      {/* Content */}
      <div className="relative z-10 p-6">{children}</div>
    </motion.div>
  );
};

// ============================
// HOLOGRAPHIC BUTTON SYSTEM
// ============================

export interface HolographicButtonProps extends HolographicProps {
  size?: "nano" | "micro" | "small" | "medium" | "large" | "macro" | "mega";
  state?: "idle" | "processing" | "success" | "error" | "warning";
  onClick?: () => void;
  disabled?: boolean;
  rippleEffect?: boolean;
  neuralPulse?: boolean;
}

export const HolographicButton: React.FC<HolographicButtonProps> = ({
  children,
  className,
  variant = "neural",
  size = "medium",
  state = "idle",
  onClick,
  disabled = false,
  rippleEffect = true,
  neuralPulse = false,
  animated = true,
}) => {
  const [isClicked, setIsClicked] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const sizeStyles = {
    nano: "px-2 py-1 text-xs",
    micro: "px-3 py-1.5 text-sm",
    small: "px-4 py-2 text-sm",
    medium: "px-6 py-3 text-base",
    large: "px-8 py-4 text-lg",
    macro: "px-10 py-5 text-xl",
    mega: "px-12 py-6 text-2xl",
  };

  const variantStyles = {
    neural:
      "bg-gradient-to-r from-blue-600/80 to-purple-600/80 border-blue-400/50 text-white shadow-blue-500/30",
    quantum:
      "bg-gradient-to-r from-purple-600/80 to-cyan-600/80 border-purple-400/50 text-white shadow-purple-500/30",
    holographic:
      "bg-gradient-to-r from-cyan-600/80 to-blue-600/80 border-cyan-400/50 text-white shadow-cyan-500/30",
    cybernetic:
      "bg-gradient-to-r from-green-600/80 to-blue-600/80 border-green-400/50 text-white shadow-green-500/30",
  };

  const stateStyles = {
    idle: "",
    processing: "animate-pulse",
    success: "bg-green-600/80 border-green-400/50 shadow-green-500/30",
    error: "bg-red-600/80 border-red-400/50 shadow-red-500/30",
    warning: "bg-yellow-600/80 border-yellow-400/50 shadow-yellow-500/30",
  };

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return;

    if (rippleEffect && buttonRef.current) {
      setIsClicked(true);
      setTimeout(() => setIsClicked(false), 300);
    }

    onClick?.();
  };

  return (
    <motion.button
      ref={buttonRef}
      className={cn(
        "relative overflow-hidden rounded-xl border backdrop-blur-md font-semibold transition-all duration-300",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
        sizeStyles[size],
        state === "idle" ? variantStyles[variant] : stateStyles[state],
        disabled && "opacity-50 cursor-not-allowed",
        !disabled &&
          animated &&
          "hover:scale-105 hover:shadow-xl hover:-translate-y-1",
        className
      )}
      onClick={handleClick}
      disabled={disabled}
      whileHover={!disabled && animated ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
    >
      {/* Neural Pulse Animation */}
      {neuralPulse && (
        <motion.div
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* Ripple Effect */}
      {rippleEffect && isClicked && (
        <motion.div
          className="absolute inset-0 rounded-xl bg-white/30"
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Content */}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

// ============================
// HOLOGRAPHIC HUD OVERLAY
// ============================

export interface HolographicHUDProps extends HolographicProps {
  position?:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "center";
  overlay?: boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export const HolographicHUD: React.FC<HolographicHUDProps> = ({
  children,
  className,
  variant = "neural",
  position = "top-right",
  overlay = false,
  dismissible = false,
  onDismiss,
  animated = true,
}) => {
  const positionStyles = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
    center: "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
  };

  return (
    <>
      {overlay && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
      )}

      <motion.div
        className={cn(
          "fixed z-50 max-w-sm",
          positionStyles[position],
          className
        )}
        initial={animated ? { opacity: 0, scale: 0.8 } : {}}
        animate={animated ? { opacity: 1, scale: 1 } : {}}
        exit={animated ? { opacity: 0, scale: 0.8 } : {}}
      >
        <HolographicGlass
          variant={variant}
          intensity="strong"
          gradient
          particles
          dataFlow
          className="relative"
        >
          {dismissible && (
            <button
              onClick={onDismiss}
              className="absolute top-2 right-2 p-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              title="Close holographic panel"
              aria-label="Close holographic panel"
            >
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}

          {children}
        </HolographicGlass>
      </motion.div>
    </>
  );
};

// ============================
// EXPORTS
// ============================

export {
  HolographicGlass as Glass,
  HolographicButton as Button,
  HolographicHUD as HUD,
};
