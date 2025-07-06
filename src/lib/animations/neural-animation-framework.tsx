"use client";

import { Variants, MotionProps, Transition, Target } from "framer-motion";
import { ReactNode } from "react";

// ============================
// NEURAL ANIMATION FRAMEWORK
// ============================

// Core Animation Variants for AI-inspired interactions
export const neuralVariants = {
  // Neural fade-in with data flow effect
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
        ease: [0.22, 1, 0.36, 1], // Neural ease curve
        staggerChildren: 0.1,
      },
    },
  },

  // Quantum slide animation with particle trail
  quantumSlide: {
    hidden: {
      opacity: 0,
      x: -50,
      rotateY: -15,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      x: 0,
      rotateY: 0,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: "easeOut",
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  },

  // Holographic reveal with depth
  holographicReveal: {
    hidden: {
      opacity: 0,
      rotateX: 45,
      rotateY: 45,
      scale: 0.8,
      z: -100,
    },
    visible: {
      opacity: 1,
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      z: 0,
      transition: {
        duration: 1.2,
        ease: [0.25, 0.46, 0.45, 0.94],
        staggerChildren: 0.15,
      },
    },
  },

  // AI processing animation
  aiProcessing: {
    idle: {
      scale: 1,
      rotate: 0,
      opacity: 0.8,
    },
    processing: {
      scale: [1, 1.05, 1],
      rotate: [0, 180, 360],
      opacity: [0.8, 1, 0.8],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    complete: {
      scale: 1.1,
      rotate: 0,
      opacity: 1,
      background: "linear-gradient(45deg, #10b981, #3b82f6)",
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  },

  // Neural network pulse
  neuralPulse: {
    initial: {
      scale: 1,
      opacity: 1,
    },
    animate: {
      scale: [1, 1.2, 1],
      opacity: [1, 0.7, 1],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },

  // Data flow animation
  dataFlow: {
    hidden: {
      pathLength: 0,
      opacity: 0,
    },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: {
          duration: 2,
          ease: "easeInOut",
        },
        opacity: {
          duration: 0.5,
        },
      },
    },
  },

  // Quantum button states
  quantumButton: {
    idle: {
      scale: 1,
      boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
      background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
    },
    hover: {
      scale: 1.05,
      boxShadow: "0 8px 25px rgba(59, 130, 246, 0.6)",
      background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
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
    processing: {
      scale: [1, 1.02, 1],
      boxShadow: [
        "0 4px 15px rgba(59, 130, 246, 0.3)",
        "0 8px 25px rgba(59, 130, 246, 0.8)",
        "0 4px 15px rgba(59, 130, 246, 0.3)",
      ],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },

  // Card hover with neural enhancement
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

  // Text revealing with typewriter effect
  neuralTypewriter: {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  },

  // Individual character animation
  neuralChar: {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  },
} as const satisfies Record<string, Variants>;

// ============================
// NEURAL TRANSITION PRESETS
// ============================

export const neuralTransitions = {
  smooth: {
    duration: 0.6,
    ease: [0.22, 1, 0.36, 1],
  },
  snappy: {
    duration: 0.3,
    ease: [0.25, 0.46, 0.45, 0.94],
  },
  bounce: {
    duration: 0.8,
    type: "spring",
    stiffness: 120,
    damping: 10,
  },
  neural: {
    duration: 1.2,
    ease: [0.16, 1, 0.3, 1],
  },
  quantum: {
    duration: 0.9,
    ease: [0.25, 0.46, 0.45, 0.94],
    type: "spring",
    stiffness: 100,
    damping: 15,
  },
} as const satisfies Record<string, Transition>;

// ============================
// NEURAL STAGGER CONFIGURATIONS
// ============================

export const neuralStagger = {
  // Stagger for lists and grids
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  },

  // Stagger for navigation items
  navigation: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  },

  // Stagger for cards
  cards: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  },

  // Stagger for features
  features: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.4,
      },
    },
  },
} as const satisfies Record<string, Variants>;

// ============================
// AI-INSPIRED PARTICLE SYSTEM
// ============================

export const neuralParticles = {
  // Generate particle positions for neural network effect
  generateNeuralNetwork: (count: number = 20) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 2,
    }));
  },

  // Particle animation variants
  particle: {
    hidden: {
      opacity: 0,
      scale: 0,
    },
    visible: {
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },

  // Neural connection lines
  connection: {
    hidden: {
      pathLength: 0,
      opacity: 0,
    },
    visible: {
      pathLength: 1,
      opacity: [0, 0.5, 0],
      transition: {
        pathLength: {
          duration: 2,
          ease: "easeInOut",
        },
        opacity: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        },
      },
    },
  },
} as const;

// ============================
// NEURAL GESTURE ANIMATIONS
// ============================

export const neuralGestures = {
  // Magnetic hover effect
  magnetic: {
    rest: { x: 0, y: 0 },
    hover: (info: { x: number; y: number }) => ({
      x: info.x * 0.1,
      y: info.y * 0.1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    }),
  },

  // Neural tilt effect
  neuralTilt: {
    rest: { rotateX: 0, rotateY: 0 },
    hover: (info: { x: number; y: number }) => ({
      rotateX: info.y * 0.05,
      rotateY: info.x * 0.05,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    }),
  },
} as const;

// ============================
// PERFORMANCE OPTIMIZATION
// ============================

export const neuralPerformance = {
  // Optimize for 60fps
  optimized: {
    layout: false,
    size: false,
    position: false,
  },

  // GPU acceleration
  gpu: {
    transform: "translateZ(0)",
    willChange: "transform",
  },

  // Reduced motion for accessibility
  reducedMotion: {
    duration: 0.01,
    ease: "linear",
  },
} as const;

// ============================
// NEURAL LAYOUT ANIMATIONS
// ============================

export const neuralLayout = {
  // Shared layout transitions
  sharedCard: {
    layoutId: "neural-card",
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },

  // Modal animations
  modal: {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 50,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      transition: {
        duration: 0.3,
        ease: "easeIn",
      },
    },
  },

  // Page transitions
  page: {
    hidden: {
      opacity: 0,
      x: -20,
      filter: "blur(10px)",
    },
    visible: {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      },
    },
    exit: {
      opacity: 0,
      x: 20,
      filter: "blur(10px)",
      transition: {
        duration: 0.5,
        ease: "easeIn",
      },
    },
  },
} as const;

// ============================
// UTILITY FUNCTIONS
// ============================

export const neuralUtils = {
  // Create staggered delay
  createStaggerDelay: (index: number, baseDelay: number = 0.1) => ({
    delay: index * baseDelay,
  }),

  // Create viewport animation
  createViewportAnimation: (threshold: number = 0.1) => ({
    viewport: { once: true, amount: threshold },
  }),

  // Create hover animation with magnetic effect
  createMagneticHover: (strength: number = 0.1) => ({
    whileHover: (info: { x: number; y: number }) => ({
      x: info.x * strength,
      y: info.y * strength,
    }),
  }),

  // Create neural pulse effect
  createNeuralPulse: (duration: number = 3) => ({
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.8, 1, 0.8],
      transition: {
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  }),
} as const;

// ============================
// TYPE DEFINITIONS
// ============================

export interface NeuralAnimationProps extends MotionProps {
  variant?: keyof typeof neuralVariants;
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  stagger?: boolean;
}

export interface ParticleProps {
  count?: number;
  color?: string;
  size?: number;
  speed?: number;
}

export interface NeuralButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "quantum";
  size?: "sm" | "md" | "lg";
  processing?: boolean;
  className?: string;
}

// ============================
// EXPORTS
// ============================

export {
  neuralVariants as variants,
  neuralTransitions as transitions,
  neuralStagger as stagger,
  neuralParticles as particles,
  neuralGestures as gestures,
  neuralPerformance as performance,
  neuralLayout as layout,
  neuralUtils as utils,
};

// Default export for the main animation framework
export default {
  variants: neuralVariants,
  transitions: neuralTransitions,
  stagger: neuralStagger,
  particles: neuralParticles,
  gestures: neuralGestures,
  performance: neuralPerformance,
  layout: neuralLayout,
  utils: neuralUtils,
};
