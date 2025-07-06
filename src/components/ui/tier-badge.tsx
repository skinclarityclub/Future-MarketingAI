"use client";

import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Crown, Zap, Star, Shield, Users, Sparkles } from "lucide-react";
import { SubscriptionTier } from "@/lib/rbac/access-tier-service";
import { cn } from "@/lib/utils";

export interface TierBadgeProps {
  tier: SubscriptionTier;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "gradient";
  showIcon?: boolean;
  showText?: boolean;
  animate?: boolean;
  className?: string;
}

const TIER_CONFIG = {
  free: {
    name: "Free",
    icon: Users,
    color: "from-gray-500 to-gray-600",
    bgColor: "bg-gray-500",
    textColor: "text-gray-700",
    borderColor: "border-gray-300",
  },
  starter: {
    name: "Starter",
    icon: Zap,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-500",
    textColor: "text-blue-700",
    borderColor: "border-blue-300",
  },
  professional: {
    name: "Professional",
    icon: Star,
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-500",
    textColor: "text-purple-700",
    borderColor: "border-purple-300",
  },
  enterprise: {
    name: "Enterprise",
    icon: Shield,
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-500",
    textColor: "text-orange-700",
    borderColor: "border-orange-300",
  },
  ultimate: {
    name: "Ultimate",
    icon: Crown,
    color: "from-gradient-start to-gradient-end",
    bgColor: "bg-gradient-to-r from-gradient-start to-gradient-end",
    textColor: "text-yellow-700",
    borderColor: "border-yellow-300",
  },
};

const SIZE_CONFIG = {
  sm: {
    padding: "px-2 py-1",
    text: "text-xs",
    icon: "h-3 w-3",
  },
  md: {
    padding: "px-3 py-1.5",
    text: "text-sm",
    icon: "h-4 w-4",
  },
  lg: {
    padding: "px-4 py-2",
    text: "text-base",
    icon: "h-5 w-5",
  },
};

export function TierBadge({
  tier,
  size = "md",
  variant = "default",
  showIcon = true,
  showText = true,
  animate = false,
  className,
}: TierBadgeProps) {
  const config = TIER_CONFIG[tier];
  const sizeConfig = SIZE_CONFIG[size];
  const Icon = config.icon;

  const badgeContent = (
    <>
      {showIcon && (
        <Icon className={cn(sizeConfig.icon, showText && "mr-1.5")} />
      )}
      {showText && <span className="font-medium">{config.name}</span>}
      {tier === "ultimate" && animate && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
          className="ml-1"
        >
          <Sparkles className="h-3 w-3" />
        </motion.div>
      )}
    </>
  );

  if (variant === "gradient") {
    return (
      <motion.div
        whileHover={animate ? { scale: 1.05 } : undefined}
        className={cn(
          "inline-flex items-center rounded-full text-white font-semibold",
          "bg-gradient-to-r shadow-lg",
          config.color,
          sizeConfig.padding,
          sizeConfig.text,
          className
        )}
      >
        {badgeContent}
      </motion.div>
    );
  }

  if (variant === "outline") {
    return (
      <motion.div
        whileHover={animate ? { scale: 1.05 } : undefined}
        className={cn(
          "inline-flex items-center rounded-full border-2 bg-white",
          "font-semibold",
          config.textColor,
          config.borderColor,
          sizeConfig.padding,
          sizeConfig.text,
          className
        )}
      >
        {badgeContent}
      </motion.div>
    );
  }

  // Default solid variant
  return (
    <motion.div
      whileHover={animate ? { scale: 1.05 } : undefined}
      className={cn(
        "inline-flex items-center rounded-full text-white font-semibold",
        config.bgColor,
        sizeConfig.padding,
        sizeConfig.text,
        className
      )}
    >
      {badgeContent}
    </motion.div>
  );
}

// Utility component for showing tier progression
export interface TierProgressProps {
  currentTier: SubscriptionTier;
  targetTier?: SubscriptionTier;
  className?: string;
}

export function TierProgress({
  currentTier,
  targetTier,
  className,
}: TierProgressProps) {
  const tiers: SubscriptionTier[] = [
    "free",
    "starter",
    "professional",
    "enterprise",
    "ultimate",
  ];
  const currentIndex = tiers.indexOf(currentTier);
  const targetIndex = targetTier ? tiers.indexOf(targetTier) : -1;

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {tiers.map((tier, index) => {
        const isActive = index <= currentIndex;
        const isTarget = index === targetIndex;
        const config = TIER_CONFIG[tier];
        const Icon = config.icon;

        return (
          <motion.div
            key={tier}
            className="flex flex-col items-center space-y-1"
            whileHover={{ scale: 1.1 }}
          >
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2",
                isActive
                  ? cn(
                      "bg-gradient-to-r text-white border-transparent",
                      config.color
                    )
                  : "bg-gray-100 text-gray-400 border-gray-300",
                isTarget && "ring-4 ring-blue-200"
              )}
            >
              <Icon className="h-5 w-5" />
            </div>

            <span
              className={cn(
                "text-xs font-medium",
                isActive ? "text-gray-900" : "text-gray-500"
              )}
            >
              {config.name}
            </span>

            {index < tiers.length - 1 && (
              <div
                className={cn(
                  "w-8 h-0.5 absolute translate-x-6",
                  index < currentIndex ? config.bgColor : "bg-gray-300"
                )}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

// Compact tier indicator for UI elements
export interface TierIndicatorProps {
  tier: SubscriptionTier;
  size?: "xs" | "sm" | "md";
  tooltip?: boolean;
  className?: string;
}

export function TierIndicator({
  tier,
  size = "sm",
  tooltip = false,
  className,
}: TierIndicatorProps) {
  const config = TIER_CONFIG[tier];
  const Icon = config.icon;

  const sizes = {
    xs: "w-4 h-4",
    sm: "w-5 h-5",
    md: "w-6 h-6",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full",
        "bg-gradient-to-r text-white shadow-sm",
        config.color,
        sizes[size],
        className
      )}
      title={tooltip ? `${config.name} Feature` : undefined}
    >
      <Icon
        className={cn(
          size === "xs" ? "h-2.5 w-2.5" : size === "sm" ? "h-3 w-3" : "h-4 w-4"
        )}
      />
    </div>
  );
}
