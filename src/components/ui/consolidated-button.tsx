"use client";

import React, { forwardRef, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import {
  uiVariants,
  animationClasses,
  applyGlassEffect,
} from "@/lib/ui/component-utilities";

// ====================================================================
// UNIFIED BUTTON INTERFACES
// ====================================================================

export interface ButtonVariantProps {
  variant?:
    | "primary"
    | "secondary"
    | "accent"
    | "ghost"
    | "outline"
    | "destructive"
    | "link";
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "icon";
  priority?: "primary" | "secondary" | "tertiary";
}

export interface ButtonStateProps {
  disabled?: boolean;
  loading?: boolean;
  processing?: boolean;
  error?: boolean;
  success?: boolean;
}

export interface ButtonStyleProps {
  gradient?: boolean;
  glow?: boolean;
  glass?: boolean;
  animate?: boolean;
  ripple?: boolean;
  rounded?: "sm" | "md" | "lg" | "xl" | "full";
}

export interface ButtonContentProps {
  children: React.ReactNode;
  icon?: LucideIcon | React.ReactNode;
  iconPosition?: "left" | "right";
  loadingText?: string;
}

export interface ConsolidatedButtonProps
  extends ButtonVariantProps,
    ButtonStateProps,
    ButtonStyleProps,
    ButtonContentProps,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "disabled"> {
  className?: string;
  asChild?: boolean;
}

// ====================================================================
// RIPPLE EFFECT HOOK
// ====================================================================

interface Ripple {
  id: number;
  x: number;
  y: number;
}

const useRipple = () => {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const rippleId = useRef(0);

  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const newRipple: Ripple = {
      id: rippleId.current++,
      x,
      y,
    };

    setRipples(prev => [...prev, newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
  };

  return { ripples, createRipple };
};

// ====================================================================
// STYLE BUILDERS
// ====================================================================

const getButtonStyles = (
  variant: ButtonVariantProps["variant"] = "primary",
  size: ButtonVariantProps["size"] = "md",
  priority: ButtonVariantProps["priority"] = "secondary",
  disabled: boolean = false,
  loading: boolean = false,
  gradient: boolean = true,
  glow: boolean = false,
  glass: boolean = false,
  animate: boolean = true,
  rounded: ButtonStyleProps["rounded"] = "lg"
) => {
  // Base styles
  const baseClasses = cn(
    "relative inline-flex items-center justify-center",
    "font-medium transition-all duration-300 ease-in-out",
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50",
    "overflow-hidden"
  );

  // Size classes
  const sizeMap = {
    xs: "h-6 px-2 text-xs",
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-base",
    lg: "h-12 px-6 text-lg",
    xl: "h-14 px-8 text-xl",
    icon: "h-10 w-10",
  };

  // Rounded classes
  const roundedMap = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    full: "rounded-full",
  };

  // Variant styles with gradient support
  const getVariantClasses = () => {
    const variants = {
      primary: gradient
        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 border-0"
        : "bg-blue-600 text-white hover:bg-blue-700 border-blue-600",
      secondary: gradient
        ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 border-0"
        : "bg-gray-600 text-white hover:bg-gray-700 border-gray-600",
      accent: gradient
        ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:from-cyan-500 hover:to-blue-600 border-0"
        : "bg-cyan-500 text-white hover:bg-cyan-600 border-cyan-500",
      ghost: glass
        ? applyGlassEffect(
            "text-white border border-white/20 hover:bg-white/20",
            "medium"
          )
        : "bg-transparent text-white border border-white/20 hover:bg-white/10",
      outline: "border border-current bg-transparent hover:bg-current/10",
      destructive: "bg-red-600 text-white hover:bg-red-700 border-red-600",
      link: "bg-transparent text-primary underline-offset-4 hover:underline border-0 h-auto p-0",
    };
    return variants[variant] || variants.primary;
  };

  // State classes
  const stateClasses = cn({
    "opacity-50 cursor-not-allowed pointer-events-none": disabled,
    "animate-pulse cursor-wait": loading,
    "border-red-500 bg-red-500/10": false, // error state
    "border-green-500 bg-green-500/10": false, // success state
  });

  // Animation classes
  const animationClasses = cn({
    "hover:scale-105 hover:-translate-y-0.5":
      animate && !disabled && variant !== "link",
    "active:scale-95": animate && !disabled,
    "shadow-lg hover:shadow-xl": glow && !disabled,
    "hover:shadow-2xl": glow && !disabled && priority === "primary",
  });

  return cn(
    baseClasses,
    sizeMap[size],
    roundedMap[rounded],
    getVariantClasses(),
    stateClasses,
    animationClasses
  );
};

// ====================================================================
// CONSOLIDATED BUTTON COMPONENT
// ====================================================================

export const ConsolidatedButton = forwardRef<
  HTMLButtonElement,
  ConsolidatedButtonProps
>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      priority = "secondary",
      disabled = false,
      loading = false,
      processing = false,
      gradient = true,
      glow = false,
      glass = false,
      animate = true,
      ripple = true,
      rounded = "lg",
      icon,
      iconPosition = "left",
      loadingText = "Loading...",
      className,
      onClick,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const { ripples, createRipple } = useRipple();
    const isDisabled = disabled || loading || processing;
    const isLoading = loading || processing;

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!isDisabled) {
        if (ripple) {
          createRipple(event);
        }
        onClick?.(event);
      }
    };

    const buttonClasses = getButtonStyles(
      variant,
      size,
      priority,
      isDisabled,
      isLoading,
      gradient,
      glow,
      glass,
      animate,
      rounded
    );

    const renderIcon = (
      iconElement: LucideIcon | React.ReactNode,
      position: "left" | "right"
    ) => {
      if (!iconElement) return null;

      const iconClasses = cn(
        "flex-shrink-0 transition-transform duration-200",
        {
          "mr-2": position === "left" && size !== "icon",
          "ml-2": position === "right" && size !== "icon",
        }
      );

      if (React.isValidElement(iconElement)) {
        return React.cloneElement(iconElement as React.ReactElement, {
          className: cn((iconElement as any).props?.className, iconClasses),
        });
      }

      // Handle Lucide icons
      const IconComponent = iconElement as LucideIcon;
      const iconSize =
        size === "xs"
          ? 14
          : size === "sm"
            ? 16
            : size === "lg"
              ? 20
              : size === "xl"
                ? 24
                : 18;

      return <IconComponent size={iconSize} className={iconClasses} />;
    };

    const renderContent = () => {
      if (isLoading) {
        return (
          <div className="flex items-center">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            {size !== "icon" && <span>{loadingText}</span>}
          </div>
        );
      }

      if (size === "icon") {
        return icon ? renderIcon(icon, "left") : children;
      }

      return (
        <>
          {icon && iconPosition === "left" && renderIcon(icon, "left")}
          <span className="flex-1">{children}</span>
          {icon && iconPosition === "right" && renderIcon(icon, "right")}
        </>
      );
    };

    if (asChild) {
      return (
        <span className={cn(buttonClasses, className)} {...props}>
          {children}
        </span>
      );
    }

    return (
      <button
        ref={ref}
        className={cn(buttonClasses, className)}
        disabled={isDisabled}
        onClick={handleClick}
        {...props}
      >
        {/* Content */}
        <span className="relative z-10 flex items-center justify-center">
          {renderContent()}
        </span>

        {/* Ripple Effects */}
        {ripple &&
          ripples.map(ripple => (
            <span
              key={ripple.id}
              className="absolute pointer-events-none bg-white/30 rounded-full animate-ping"
              style={{
                left: ripple.x - 10,
                top: ripple.y - 10,
                width: 20,
                height: 20,
              }}
            />
          ))}

        {/* Glass overlay effect */}
        {glass && (
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
        )}
      </button>
    );
  }
);

ConsolidatedButton.displayName = "ConsolidatedButton";

// ====================================================================
// CONVENIENCE EXPORTS
// ====================================================================

// Export as default for easy importing
export default ConsolidatedButton;

// Create named variants for common patterns
export const PrimaryButton = (
  props: Omit<ConsolidatedButtonProps, "variant">
) => <ConsolidatedButton variant="primary" {...props} />;

export const SecondaryButton = (
  props: Omit<ConsolidatedButtonProps, "variant">
) => <ConsolidatedButton variant="secondary" {...props} />;

export const GhostButton = (
  props: Omit<ConsolidatedButtonProps, "variant">
) => <ConsolidatedButton variant="ghost" {...props} />;

export const IconButton = (props: Omit<ConsolidatedButtonProps, "size">) => (
  <ConsolidatedButton size="icon" {...props} />
);

// Legacy compatibility - maps to consolidated button
export { ConsolidatedButton as Button };
export { ConsolidatedButton as PremiumButton };
