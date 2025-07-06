"use client";

import React from "react";
import { cn } from "@/lib/utils";

// Premium Color Palette
export const premiumColors = {
  primary: {
    50: "#f0f9ff",
    100: "#e0f2fe",
    200: "#bae6fd",
    300: "#7dd3fc",
    400: "#38bdf8",
    500: "#0ea5e9",
    600: "#0284c7",
    700: "#0369a1",
    800: "#075985",
    900: "#0c4a6e",
  },
  gradient: {
    primary: "from-purple-600 via-blue-600 to-indigo-600",
    secondary: "from-pink-500 via-purple-500 to-indigo-500",
    accent: "from-cyan-400 via-blue-500 to-purple-600",
    success: "from-green-400 via-emerald-500 to-teal-600",
    warning: "from-amber-400 via-orange-500 to-red-500",
    dark: "from-gray-900 via-slate-800 to-zinc-900",
  },
  glass: {
    light: "rgba(255, 255, 255, 0.1)",
    medium: "rgba(255, 255, 255, 0.15)",
    dark: "rgba(0, 0, 0, 0.1)",
  },
};

// Glassmorphism Container
interface GlassContainerProps {
  children: React.ReactNode;
  className?: string;
  intensity?: "light" | "medium" | "strong";
  gradient?: boolean;
  animated?: boolean;
}

export const GlassContainer: React.FC<GlassContainerProps> = ({
  children,
  className,
  intensity = "medium",
  gradient = false,
  animated = false,
}) => {
  const intensityClasses = {
    light: "bg-white/5 backdrop-blur-sm border-white/10",
    medium: "bg-white/10 backdrop-blur-md border-white/20",
    strong: "bg-white/20 backdrop-blur-lg border-white/30",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border shadow-xl",
        intensityClasses[intensity],
        gradient && "bg-gradient-to-br from-white/10 to-white/5",
        animated &&
          "transition-all duration-500 hover:bg-white/15 hover:shadow-2xl hover:scale-[1.02]",
        className
      )}
    >
      {children}
    </div>
  );
};

// Premium Button Component
interface PremiumButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "accent" | "ghost";
  size?: "sm" | "md" | "lg" | "xl";
  gradient?: boolean;
  glow?: boolean;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  gradient = true,
  glow = false,
  className,
  onClick,
  disabled = false,
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 transform";

  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
    xl: "px-10 py-5 text-xl",
  };

  const variantClasses = {
    primary: gradient
      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
      : "bg-blue-600 text-white hover:bg-blue-700",
    secondary: gradient
      ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700"
      : "bg-purple-600 text-white hover:bg-purple-700",
    accent: gradient
      ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:from-cyan-500 hover:to-blue-600"
      : "bg-cyan-500 text-white hover:bg-cyan-600",
    ghost:
      "bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-md",
  };

  const glowClasses = glow ? "shadow-lg hover:shadow-2xl" : "";
  const hoverClasses = "hover:scale-105 hover:-translate-y-1";
  const disabledClasses = disabled
    ? "opacity-50 cursor-not-allowed transform-none"
    : "";

  return (
    <button
      className={cn(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        glowClasses,
        !disabled && hoverClasses,
        disabledClasses,
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// Premium Card Component
interface PremiumCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  gradient?: boolean;
}

export const PremiumCard: React.FC<PremiumCardProps> = ({
  children,
  className,
  hover = true,
  glow = false,
  gradient = false,
}) => {
  return (
    <GlassContainer
      className={cn(
        "p-6",
        hover && "hover:scale-[1.02] cursor-pointer",
        glow && "shadow-xl hover:shadow-2xl",
        gradient && "bg-gradient-to-br from-white/10 to-white/5",
        className
      )}
      animated={hover}
    >
      {children}
    </GlassContainer>
  );
};

// Animated Gradient Background
interface AnimatedGradientProps {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "dark";
}

export const AnimatedGradient: React.FC<AnimatedGradientProps> = ({
  children,
  className,
  variant = "primary",
}) => {
  const gradientClasses = {
    primary: "bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900",
    secondary: "bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900",
    dark: "bg-gradient-to-br from-gray-900 via-slate-900 to-zinc-900",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        gradientClasses[variant],
        className
      )}
    >
      {/* Animated background shapes */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

// Premium Typography
interface PremiumHeadingProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  gradient?: boolean;
  glow?: boolean;
  className?: string;
}

export const PremiumHeading: React.FC<PremiumHeadingProps> = ({
  children,
  level = 1,
  gradient = true,
  glow = false,
  className,
}) => {
  const Component = `h${level}` as keyof React.JSX.IntrinsicElements;

  const sizeClasses = {
    1: "text-5xl md:text-6xl lg:text-7xl font-bold",
    2: "text-4xl md:text-5xl lg:text-6xl font-bold",
    3: "text-3xl md:text-4xl lg:text-5xl font-semibold",
    4: "text-2xl md:text-3xl lg:text-4xl font-semibold",
    5: "text-xl md:text-2xl lg:text-3xl font-medium",
    6: "text-lg md:text-xl lg:text-2xl font-medium",
  };

  const gradientClass = gradient
    ? "bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent"
    : "text-white";

  const glowClass = glow ? "drop-shadow-2xl" : "";

  return React.createElement(
    Component,
    {
      className: cn(
        sizeClasses[level],
        gradientClass,
        glowClass,
        "leading-tight tracking-tight",
        className
      ),
    },
    children
  );
};

// Premium Icon Container
interface PremiumIconProps {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "primary" | "secondary" | "accent";
  glow?: boolean;
  className?: string;
}

export const PremiumIcon: React.FC<PremiumIconProps> = ({
  children,
  size = "md",
  variant = "primary",
  glow = true,
  className,
}) => {
  const sizeClasses = {
    sm: "w-8 h-8 p-2",
    md: "w-12 h-12 p-3",
    lg: "w-16 h-16 p-4",
    xl: "w-20 h-20 p-5",
  };

  const variantClasses = {
    primary: "bg-gradient-to-br from-purple-500 to-blue-500",
    secondary: "bg-gradient-to-br from-pink-500 to-purple-500",
    accent: "bg-gradient-to-br from-cyan-400 to-blue-500",
  };

  return (
    <div
      className={cn(
        "rounded-xl flex items-center justify-center text-white",
        sizeClasses[size],
        variantClasses[variant],
        glow && "shadow-lg",
        className
      )}
    >
      {children}
    </div>
  );
};

// Animation utilities
export const premiumAnimations = {
  fadeInUp: "animate-[fadeInUp_0.6s_ease-out_forwards]",
  fadeInLeft: "animate-[fadeInLeft_0.6s_ease-out_forwards]",
  fadeInRight: "animate-[fadeInRight_0.6s_ease-out_forwards]",
  slideInUp: "animate-[slideInUp_0.8s_ease-out_forwards]",
  scaleIn: "animate-[scaleIn_0.5s_ease-out_forwards]",
  pulse: "animate-pulse",
  bounce: "animate-bounce",
  spin: "animate-spin",
};

// Export all components
export default {
  GlassContainer,
  PremiumButton,
  PremiumCard,
  AnimatedGradient,
  PremiumHeading,
  PremiumIcon,
  premiumColors,
  premiumAnimations,
};
