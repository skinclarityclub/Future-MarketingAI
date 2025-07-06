"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Animation variants for neural effects
const neuralVariants = {
  neuralFadeIn: {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.95,
      filter: "blur(10px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.1,
      },
    },
  },
  quantumButton: {
    idle: {
      scale: 1,
      boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
    },
    hover: {
      scale: 1.05,
      boxShadow: "0 8px 25px rgba(59, 130, 246, 0.6)",
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    tap: {
      scale: 0.95,
      transition: {
        duration: 0.1,
      },
    },
  },
  neuralCard: {
    rest: {
      scale: 1,
      rotateY: 0,
      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
    },
    hover: {
      scale: 1.02,
      rotateY: 5,
      boxShadow: "0 15px 35px rgba(59, 130, 246, 0.2)",
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  },
};

// ============================
// NEURAL GLASS CARD
// ============================

interface NeuralGlassCardProps {
  children: ReactNode;
  variant?: "neural" | "quantum" | "holographic";
  className?: string;
  hoverable?: boolean;
}

export const NeuralGlassCard: React.FC<NeuralGlassCardProps> = ({
  children,
  variant = "neural",
  className,
  hoverable = true,
}) => {
  const variantClasses = {
    neural: "bg-gradient-to-br from-blue-500/10 via-blue-600/5 to-blue-700/10",
    quantum:
      "bg-gradient-to-br from-purple-500/10 via-purple-600/5 to-purple-700/10",
    holographic:
      "bg-gradient-to-br from-cyan-500/10 via-cyan-600/5 to-cyan-700/10",
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={neuralVariants.neuralFadeIn}
      whileHover={hoverable ? neuralVariants.neuralCard.hover : undefined}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/20 backdrop-blur-xl p-6",
        variantClasses[variant],
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
      <div className="relative z-10">{children}</div>

      {/* Holographic shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-100%] animate-shimmer-premium" />
    </motion.div>
  );
};

// ============================
// QUANTUM BUTTON
// ============================

interface QuantumButtonProps {
  children: ReactNode;
  variant?: "primary" | "quantum" | "neural";
  processing?: boolean;
  onClick?: () => void;
  className?: string;
}

export const QuantumButton: React.FC<QuantumButtonProps> = ({
  children,
  variant = "primary",
  processing = false,
  onClick,
  className,
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
      animate={isHovered ? "hover" : "idle"}
      variants={neuralVariants.quantumButton}
      whileTap={neuralVariants.quantumButton.tap}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      disabled={processing}
      className={cn(
        "relative overflow-hidden font-semibold rounded-xl px-6 py-3 transition-all duration-300",
        variantClasses[variant],
        processing && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {/* Particle effects */}
      {(processing || isHovered) && (
        <div className="absolute inset-0">
          {Array.from({ length: 8 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut",
              }}
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
    </motion.button>
  );
};

// ============================
// NEURAL TYPEWRITER
// ============================

interface NeuralTypewriterProps {
  text: string;
  className?: string;
  speed?: number;
}

export const NeuralTypewriter: React.FC<NeuralTypewriterProps> = ({
  text,
  className,
  speed = 50,
}) => {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("inline-block", className)}
    >
      {displayText}
      <motion.span
        className="inline-block w-0.5 h-6 bg-blue-400 ml-1"
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
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
        animate={
          state === "processing"
            ? {
                scale: [1, 1.2, 1],
                opacity: [1, 0.7, 1],
              }
            : {}
        }
        transition={{
          duration: 3,
          repeat: state === "processing" ? Infinity : 0,
          ease: "easeInOut",
        }}
      />
      {message && <span className="text-white/80 font-medium">{message}</span>}
    </motion.div>
  );
};

// ============================
// NEURAL DATA POINT
// ============================

interface NeuralDataPointProps {
  value: number;
  label: string;
  color?: string;
}

export const NeuralDataPoint: React.FC<NeuralDataPointProps> = ({
  value,
  label,
  color = "blue",
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
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
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <motion.div
        className={`text-4xl font-bold mb-2 text-${color}-400`}
        animate={{
          scale: [1, 1.1, 1],
          textShadow: [
            `0 0 10px rgba(59, 130, 246, 0.5)`,
            `0 0 20px rgba(59, 130, 246, 0.8)`,
            `0 0 10px rgba(59, 130, 246, 0.5)`,
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {displayValue.toLocaleString()}
      </motion.div>
      <div className="text-white/70 text-sm">{label}</div>
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
    active?: boolean;
  }>;
  onItemClick?: (id: string) => void;
  className?: string;
}

export const HolographicNav: React.FC<HolographicNavProps> = ({
  items,
  onItemClick,
  className,
}) => {
  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.05 }}
      className={cn("flex flex-col space-y-2", className)}
    >
      {items.map((item, index) => (
        <motion.button
          key={item.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{
            scale: 1.02,
            backgroundColor: "rgba(255, 255, 255, 0.1)",
          }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onItemClick?.(item.id)}
          className={cn(
            "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300",
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
      ))}
    </motion.nav>
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
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
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
                    variant="quantum"
                    onClick={onClose}
                    className="px-3 py-1 text-sm"
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

// All components are already exported individually above
