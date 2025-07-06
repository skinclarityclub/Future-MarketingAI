/**
 * Component Utilities - Modular utilities for consistent UI patterns
 */

import { cn } from "@/lib/utils";

// Style variants for consistent styling
export const uiVariants = {
  variant: {
    primary:
      "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700",
    secondary:
      "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700",
    accent:
      "bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:from-cyan-500 hover:to-blue-600",
    ghost:
      "bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-md",
    outline:
      "border border-white/30 text-white hover:bg-white/10 backdrop-blur-sm",
  },
  size: {
    xs: "px-2 py-1 text-xs",
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
    xl: "px-10 py-5 text-xl",
  },
  glass: {
    light: "bg-white/5 backdrop-blur-sm border-white/10",
    medium: "bg-white/10 backdrop-blur-md border-white/20",
    strong: "bg-white/20 backdrop-blur-lg border-white/30",
  },
};

// Glass morphism utility
export const createGlassStyles = (
  intensity: "light" | "medium" | "strong" = "medium"
) => {
  return uiVariants.glass[intensity];
};

// Animation utilities
export const animationClasses = {
  base: "transition-all duration-300 ease-in-out",
  hover: "hover:scale-105 hover:-translate-y-1",
  glow: "shadow-lg hover:shadow-2xl",
  bounce: "animate-bounce",
  pulse: "animate-pulse",
  spin: "animate-spin",
};

// Glass morphism helper function
export const applyGlassEffect = (
  className: string = "",
  intensity: "light" | "medium" | "strong" = "medium"
) => {
  return cn(createGlassStyles(intensity), className);
};

// Common button utilities
export const buttonUtilities = {
  getVariantClasses: (variant: keyof typeof uiVariants.variant = "primary") => {
    return uiVariants.variant[variant];
  },
  getSizeClasses: (size: keyof typeof uiVariants.size = "md") => {
    return uiVariants.size[size];
  },
  getBaseClasses: () => {
    return "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 transform";
  },
};

// Card utilities
export const cardUtilities = {
  getCardClasses: (glass: boolean = true, hover: boolean = true) => {
    return cn(
      "rounded-2xl border shadow-xl",
      glass && createGlassStyles("medium"),
      hover && "hover:scale-[1.02] hover:shadow-2xl transition-all duration-300"
    );
  },
};

// Icon utilities
export const iconUtilities = {
  getSizeMap: () => ({
    xs: 14,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28,
  }),
  getIconWrapperClasses: () => {
    return "inline-flex items-center justify-center";
  },
};

export default {
  uiVariants,
  createGlassStyles,
  animationClasses,
  applyGlassEffect,
  buttonUtilities,
  cardUtilities,
  iconUtilities,
};
