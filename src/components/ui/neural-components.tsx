"use client";

import React, { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  variants,
  transitions,
  stagger,
  particles,
  utils,
} from "@/lib/animations/neural-animation-framework";

// ============================
// NEURAL GLASS CARD COMPONENT
// ============================

interface NeuralGlassCardProps {
  children: ReactNode;
  variant?: "neural" | "quantum" | "holographic";
  intensity?: "subtle" | "medium" | "strong" | "maximum";
  className?: string;
  hoverable?: boolean;
  animationDelay?: number;
}

export const NeuralGlassCard: React.FC<NeuralGlassCardProps> = ({
  children,
  variant = "neural",
  intensity = "medium",
  className,
  hoverable = true,
  animationDelay = 0,
}) => {
  const baseClasses =
    "relative overflow-hidden rounded-2xl border border-white/20 backdrop-blur-xl";

  const variantClasses = {
    neural: "bg-gradient-to-br from-blue-500/10 via-blue-600/5 to-blue-700/10",
    quantum:
      "bg-gradient-to-br from-purple-500/10 via-purple-600/5 to-purple-700/10",
    holographic:
      "bg-gradient-to-br from-cyan-500/10 via-cyan-600/5 to-cyan-700/10",
  };

  const intensityClasses = {
    subtle: "backdrop-blur-sm",
    medium: "backdrop-blur-md",
    strong: "backdrop-blur-lg",
    maximum: "backdrop-blur-xl",
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants.neuralFadeIn}
      transition={{ ...transitions.neural, delay: animationDelay }}
      whileHover={hoverable ? variants.neuralCard.hover : undefined}
      className={cn(
        baseClasses,
        variantClasses[variant],
        intensityClasses[intensity],
        className
      )}
    >
      {/* Neural pattern overlay */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <pattern
              id="neural-grid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="10"
                cy="10"
                r="1"
                fill="currentColor"
                className="text-blue-400"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#neural-grid)" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 p-6">{children}</div>

      {/* Holographic shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-100%] animate-shimmer-premium" />
    </motion.div>
  );
};

// ============================
// QUANTUM BUTTON COMPONENT
// ============================

interface QuantumButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "quantum" | "neural";
  size?: "sm" | "md" | "lg";
  processing?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export const QuantumButton: React.FC<QuantumButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  processing = false,
  disabled = false,
  onClick,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const baseClasses =
    "relative overflow-hidden font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50";

  const variantClasses = {
    primary:
      "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25",
    secondary:
      "bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg shadow-gray-500/25",
    quantum:
      "bg-gradient-to-r from-purple-600 to-indigo-700 text-white shadow-lg shadow-purple-500/25",
    neural:
      "bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-lg shadow-cyan-500/25",
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const currentVariant = processing
    ? "processing"
    : disabled
      ? "idle"
      : isHovered
        ? "hover"
        : "idle";

  return (
    <motion.button
      initial="idle"
      animate={currentVariant}
      variants={variants.quantumButton}
      whileTap={
        !disabled && !processing ? variants.quantumButton.tap : undefined
      }
      onHoverStart={() => !disabled && !processing && setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={!disabled && !processing ? onClick : undefined}
      disabled={disabled || processing}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {/* Particle effect overlay */}
      {(processing || isHovered) && (
        <div className="absolute inset-0">
          {particles.generateNeuralNetwork(8).map(particle => (
            <motion.div
              key={particle.id}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
              }}
              initial="hidden"
              animate="visible"
              variants={particles.particle}
              transition={{ delay: particle.delay }}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {processing && (
          <motion.div
            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}
        {children}
      </span>

      {/* Quantum shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:animate-shimmer-premium" />
    </motion.button>
  );
};

// ============================
// NEURAL TYPEWRITER COMPONENT
// ============================

interface NeuralTypewriterProps {
  text: string;
  className?: string;
  speed?: number;
  showCursor?: boolean;
}

export const NeuralTypewriter: React.FC<NeuralTypewriterProps> = ({
  text,
  className,
  speed = 50,
  showCursor = true,
}) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants.neuralTypewriter}
      className={cn("inline-block", className)}
    >
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          variants={variants.neuralChar}
          transition={{ delay: index * (speed / 1000) }}
          className="inline-block"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
      {showCursor && (
        <motion.span
          className="inline-block w-0.5 h-6 bg-blue-400 ml-1"
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
};

// ============================
// HOLOGRAPHIC NAVIGATION
// ============================

interface HolographicNavProps {
  items: Array<{
    id: string;
    label: string;
    icon?: ReactNode;
    href?: string;
    active?: boolean;
  }>;
  className?: string;
  onItemClick?: (id: string) => void;
}

export const HolographicNav: React.FC<HolographicNavProps> = ({
  items,
  className,
  onItemClick,
}) => {
  return (
    <motion.nav
      initial="hidden"
      animate="visible"
      variants={stagger.navigation}
      className={cn("flex flex-col space-y-2", className)}
    >
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          variants={variants.quantumSlide}
          transition={{ ...transitions.quantum, delay: index * 0.1 }}
          whileHover="hover"
          whileTap="tap"
          className="group"
        >
          <motion.button
            onClick={() => onItemClick?.(item.id)}
            variants={variants.neuralCard}
            className={cn(
              "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300",
              "bg-white/5 backdrop-blur-sm border border-white/10",
              "hover:bg-white/10 hover:border-white/20",
              item.active &&
                "bg-blue-500/20 border-blue-400/50 shadow-lg shadow-blue-500/20"
            )}
          >
            {item.icon && (
              <span className="text-white/70 group-hover:text-white transition-colors">
                {item.icon}
              </span>
            )}
            <span className="text-white/80 group-hover:text-white transition-colors font-medium">
              {item.label}
            </span>
          </motion.button>
        </motion.div>
      ))}
    </motion.nav>
  );
};

// ============================
// NEURAL DATA VISUALIZATION
// ============================

interface NeuralDataPointProps {
  value: number;
  label: string;
  color?: string;
  animated?: boolean;
}

export const NeuralDataPoint: React.FC<NeuralDataPointProps> = ({
  value,
  label,
  color = "blue",
  animated = true,
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  React.useEffect(() => {
    if (!animated) {
      setDisplayValue(value);
      return;
    }

    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, animated]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants.neuralFadeIn}
      className="text-center"
    >
      <motion.div
        className={`text-4xl font-bold mb-2 bg-gradient-to-r from-${color}-400 to-${color}-600 bg-clip-text text-transparent`}
        animate={animated ? utils.createNeuralPulse(3) : undefined}
      >
        {displayValue.toLocaleString()}
      </motion.div>
      <div className="text-white/70 text-sm">{label}</div>
    </motion.div>
  );
};

// ============================
// AI PROCESSING INDICATOR
// ============================

interface AIProcessingProps {
  state: "idle" | "processing" | "complete";
  message?: string;
  className?: string;
}

export const AIProcessing: React.FC<AIProcessingProps> = ({
  state,
  message,
  className,
}) => {
  return (
    <motion.div
      initial="idle"
      animate={state}
      variants={variants.aiProcessing}
      className={cn(
        "flex items-center space-x-3 p-4 rounded-xl backdrop-blur-sm border border-white/20",
        state === "processing" && "bg-blue-500/10",
        state === "complete" && "bg-green-500/10",
        className
      )}
    >
      <motion.div
        className={cn(
          "w-6 h-6 rounded-full",
          state === "idle" && "bg-gray-500",
          state === "processing" && "bg-blue-500",
          state === "complete" && "bg-green-500"
        )}
        variants={variants.neuralPulse}
      />
      {message && <span className="text-white/80 font-medium">{message}</span>}
    </motion.div>
  );
};

// ============================
// QUANTUM MODAL
// ============================

interface QuantumModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  className?: string;
}

export const QuantumModal: React.FC<QuantumModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  className,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants.modal}
            className={cn(
              "fixed inset-0 z-50 flex items-center justify-center p-4",
              className
            )}
          >
            <div className="bg-gray-900/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {title && (
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">{title}</h2>
                  <QuantumButton
                    variant="secondary"
                    size="sm"
                    onClick={onClose}
                    className="px-3 py-1"
                  >
                    ✕
                  </QuantumButton>
                </div>
              )}
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ============================
// EXPORTS
// ============================

// Components are exported inline above
// Only exporting what's needed for authentication modal
