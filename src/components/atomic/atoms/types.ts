/**
 * ATOMIC DESIGN TYPES
 * Type definitions for the futuristic atomic design system
 */

import { ReactNode, HTMLAttributes } from "react";

// Base Props for all Atomic Components
export interface AtomicProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
  className?: string;
}

// Neural Variants - AI/Tech inspired
export type NeuralVariant =
  | "neural"
  | "quantum"
  | "holographic"
  | "matrix"
  | "cybernetic"
  | "digital";

// Quantum Sizes - Precise sizing system
export type QuantumSize =
  | "nano"
  | "micro"
  | "small"
  | "medium"
  | "large"
  | "macro"
  | "mega";

// Holographic Intensity - Glass morphism levels
export type HolographicIntensity =
  | "subtle"
  | "medium"
  | "strong"
  | "maximum"
  | "infinite";

// Color Variants for Futuristic UI
export type FuturisticColor =
  | "primary"
  | "secondary"
  | "accent"
  | "success"
  | "warning"
  | "error"
  | "ghost"
  | "neural"
  | "quantum"
  | "holographic";

// Animation States
export type AnimationState =
  | "idle"
  | "processing"
  | "loading"
  | "success"
  | "error"
  | "complete";

// Data Flow Directions
export type DataFlowDirection =
  | "horizontal"
  | "vertical"
  | "radial"
  | "spiral"
  | "network";

// Common Interface Extensions
export interface NeuralProps extends AtomicProps {
  variant?: NeuralVariant;
  size?: QuantumSize;
  intensity?: HolographicIntensity;
  animated?: boolean;
  glowing?: boolean;
  pulsing?: boolean;
}

export interface InteractiveProps extends NeuralProps {
  disabled?: boolean;
  loading?: boolean;
  state?: AnimationState;
  onClick?: () => void;
  onHover?: () => void;
}

export interface VisualEffectProps extends AtomicProps {
  pattern?: "dots" | "grid" | "waves" | "particles" | "neural" | "quantum";
  flow?: DataFlowDirection;
  speed?: "slow" | "normal" | "fast" | "rapid";
  density?: "low" | "medium" | "high" | "maximum";
}

// Component-specific Props
export interface ButtonProps extends InteractiveProps {
  type?: "button" | "submit" | "reset";
  fullWidth?: boolean;
  icon?: ReactNode;
}

export interface InputProps extends InteractiveProps {
  type?: "text" | "email" | "password" | "number" | "search";
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export interface IconProps extends NeuralProps {
  name?: string;
  spinning?: boolean;
  bouncing?: boolean;
}

export interface TextProps extends NeuralProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  gradient?: boolean;
  typewriter?: boolean;
  speed?: number;
}
