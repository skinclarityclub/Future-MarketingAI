"use client";

import React, { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

// Button variants for compatibility with shadcn/ui pattern
export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

interface PremiumButtonProps {
  children: React.ReactNode;
  variant?:
    | "primary"
    | "secondary"
    | "tertiary"
    | "ghost"
    | "success"
    | "warning"
    | "error";
  size?: "sm" | "md" | "lg" | "xl";
  priority?: "primary" | "secondary" | "tertiary";
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  onClick?: () => void;
  animate?: boolean;
  glow?: boolean;
  ripple?: boolean;
}

const PremiumButton: React.FC<NormalButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  priority = "secondary",
  className = "",
  disabled = false,
  loading = false,
  icon,
  iconPosition = "left",
  onClick,
  animate = true,
  glow = false,
  ripple = true,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [ripples, setRipples] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleId = useRef(0);

  // Ripple effect handler
  const handleRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!ripple || disabled) return;

    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const newRipple = { id: rippleId.current++, x, y };
    setRipples(prev => [...prev, newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 1000);
  };

  // Variant styling
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          base: "bg-gradient-to-r from-primary-500 to-primary-600 text-white border-primary-400/30",
          hover:
            "from-primary-400 to-primary-500 shadow-glow-primary border-primary-300/50",
          active: "from-primary-600 to-primary-700",
          glow: "shadow-glow-primary",
        };
      case "secondary":
        return {
          base: "glass-secondary text-neutral-200 border-neutral-600/30",
          hover: "glass-luxury text-neutral-100 border-neutral-500/40",
          active: "glass-primary",
          glow: "shadow-elevated",
        };
      case "tertiary":
        return {
          base: "bg-neutral-800/20 text-neutral-300 border-neutral-700/30",
          hover: "bg-neutral-700/30 text-neutral-200 border-neutral-600/40",
          active: "bg-neutral-700/40",
          glow: "shadow-soft",
        };
      case "ghost":
        return {
          base: "bg-transparent text-neutral-300 border-transparent",
          hover: "glass-secondary text-neutral-200 border-neutral-600/30",
          active: "glass-primary",
          glow: "shadow-soft",
        };
      case "success":
        return {
          base: "bg-gradient-to-r from-success-500 to-success-600 text-white border-success-400/30",
          hover:
            "from-success-400 to-success-500 shadow-glow-success border-success-300/50",
          active: "from-success-600 to-success-700",
          glow: "shadow-glow-success",
        };
      case "warning":
        return {
          base: "bg-gradient-to-r from-warning-500 to-warning-600 text-white border-warning-400/30",
          hover:
            "from-warning-400 to-warning-500 shadow-glow-warning border-warning-300/50",
          active: "from-warning-600 to-warning-700",
          glow: "shadow-glow-warning",
        };
      case "error":
        return {
          base: "bg-gradient-to-r from-error-500 to-error-600 text-white border-error-400/30",
          hover:
            "from-error-400 to-error-500 shadow-glow-warning border-error-300/50",
          active: "from-error-600 to-error-700",
          glow: "shadow-glow-warning",
        };
      default:
        return {
          base: "glass-secondary text-neutral-200 border-neutral-600/30",
          hover: "glass-luxury text-neutral-100",
          active: "glass-primary",
          glow: "shadow-elevated",
        };
    }
  };

  // Size styling
  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return "px-3 py-1.5 text-sm gap-1.5";
      case "md":
        return "px-4 py-2 text-sm gap-2";
      case "lg":
        return "px-6 py-3 text-base gap-2.5";
      case "xl":
        return "px-8 py-4 text-lg gap-3";
      default:
        return "px-4 py-2 text-sm gap-2";
    }
  };

  // Priority-based animations
  const getPriorityAnimations = () => {
    switch (priority) {
      case "primary":
        return animate ? "animate-premium-fade-in" : "";
      case "secondary":
        return animate ? "animate-premium-fade-in-up" : "";
      case "tertiary":
        return animate ? "animate-premium-fade-in-scale" : "";
      default:
        return "";
    }
  };

  const styles = getVariantStyles();

  return (
    <button
      ref={buttonRef}
      className={cn(
        // Base styles
        "relative inline-flex items-center justify-center",
        "font-medium rounded-premium border transition-all",
        "focus:outline-none focus:ring-2 focus:ring-primary-400/50",
        "transform-gpu will-change-transform",

        // Size styles
        getSizeStyles(),

        // Variant styles
        styles.base,

        // State styles
        {
          [styles.hover]: isHovered && !disabled,
          [styles.active]: isPressed && !disabled,
          [styles.glow]: glow && !disabled,
          "opacity-50 cursor-not-allowed": disabled,
          "animate-pulse": loading,
        },

        // Animation styles
        {
          "duration-fast ease-premium": true,
          "hover:scale-105": !disabled && animate,
          "active:scale-95": !disabled && animate,
          "hover:shadow-glow-primary": !disabled && glow,
        },

        // Priority animations
        getPriorityAnimations(),

        className
      )}
      disabled={disabled || loading}
      onClick={e => {
        handleRipple(e);
        onClick?.();
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 rounded-premium overflow-hidden">
        <div
          className={cn(
            "absolute inset-0 bg-gradient-shimmer opacity-0",
            "transition-opacity duration-slow ease-premium",
            { "opacity-100 animate-shimmer-premium": isHovered && !disabled }
          )}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center">
        {icon && iconPosition === "left" && (
          <span
            className={cn("transition-transform duration-fast ease-premium", {
              "animate-micro-bounce": isPressed && animate,
            })}
          >
            {icon}
          </span>
        )}

        <span
          className={cn("transition-all duration-fast ease-premium", {
            "transform scale-105": isPressed && animate,
          })}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Loading...
            </div>
          ) : (
            children
          )}
        </span>

        {icon && iconPosition === "right" && (
          <span
            className={cn("transition-transform duration-fast ease-premium", {
              "animate-micro-bounce": isPressed && animate,
            })}
          >
            {icon}
          </span>
        )}
      </div>

      {/* Ripple effects */}
      {ripple &&
        ripples.map(ripple => (
          <span
            key={ripple.id}
            className="absolute pointer-events-none animate-ping rounded-full bg-white/20"
            style={{
              left: ripple.x - 10,
              top: ripple.y - 10,
              width: 20,
              height: 20,
            }}
          />
        ))}

      {/* Glow overlay */}
      {glow && (
        <div
          className={cn(
            "absolute inset-0 rounded-premium pointer-events-none",
            "bg-gradient-to-r from-primary-400/20 to-primary-600/20",
            "opacity-0 transition-opacity duration-normal ease-premium",
            { "opacity-100": isHovered && !disabled }
          )}
        />
      )}
    </button>
  );
};

export default PremiumButton;
