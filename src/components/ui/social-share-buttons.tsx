"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Share2,
  Twitter,
  Linkedin,
  Facebook,
  Link,
  MessageCircle,
} from "lucide-react";
import { useBehaviorTracking } from "@/lib/analytics/behavior-tracking-provider";

interface SocialShareButtonsProps {
  url?: string;
  title?: string;
  description?: string;
  className?: string;
  showLabels?: boolean;
  size?: "sm" | "md" | "lg";
}

export function SocialShareButtons({
  url = typeof window !== "undefined" ? window.location.href : "",
  title = "MarketingMachine - Turn Content Into Growth. On Autopilot.",
  description = "AI-powered marketing platform that generates 3x more leads with 80% less effort. Start your free trial today.",
  className = "",
  showLabels = true,
  size = "md",
}: SocialShareButtonsProps) {
  const { trackCustomEvent } = useBehaviorTracking();

  const shareData = {
    url: encodeURIComponent(url),
    title: encodeURIComponent(title),
    description: encodeURIComponent(description),
  };

  const handleShare = (platform: string, shareUrl: string) => {
    // Track social share event
    trackCustomEvent("social_share", {
      platform,
      url,
      title,
      timestamp: new Date().toISOString(),
    });

    // Open share window
    window.open(
      shareUrl,
      "share",
      "width=600,height=400,scrollbars=yes,resizable=yes"
    );
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      trackCustomEvent("link_copy", {
        url,
        timestamp: new Date().toISOString(),
      });
      // You could add a toast notification here
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  const shareButtons = [
    {
      platform: "twitter",
      icon: Twitter,
      label: "Twitter",
      color: "hover:bg-blue-500/20 hover:text-blue-400",
      url: `https://twitter.com/intent/tweet?text=${shareData.title}&url=${shareData.url}&hashtags=AI,Marketing,Automation`,
    },
    {
      platform: "linkedin",
      icon: Linkedin,
      label: "LinkedIn",
      color: "hover:bg-blue-600/20 hover:text-blue-500",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${shareData.url}&title=${shareData.title}&summary=${shareData.description}`,
    },
    {
      platform: "facebook",
      icon: Facebook,
      label: "Facebook",
      color: "hover:bg-blue-700/20 hover:text-blue-600",
      url: `https://www.facebook.com/sharer/sharer.php?u=${shareData.url}&quote=${shareData.title}`,
    },
    {
      platform: "whatsapp",
      icon: MessageCircle,
      label: "WhatsApp",
      color: "hover:bg-green-500/20 hover:text-green-400",
      url: `https://wa.me/?text=${shareData.title}%20${shareData.url}`,
    },
  ];

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "w-8 h-8 text-sm";
      case "lg":
        return "w-12 h-12 text-lg";
      default:
        return "w-10 h-10 text-base";
    }
  };

  const getIconSize = () => {
    switch (size) {
      case "sm":
        return "w-4 h-4";
      case "lg":
        return "w-6 h-6";
      default:
        return "w-5 h-5";
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showLabels && (
        <div className="flex items-center gap-2 text-slate-400">
          <Share2 className="w-4 h-4" />
          <span className="text-sm font-medium">Share:</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        {shareButtons.map((button, index) => (
          <motion.button
            key={button.platform}
            onClick={() => handleShare(button.platform, button.url)}
            className={`
              ${getSizeClasses()}
              rounded-lg border border-slate-700/50 bg-slate-800/50 backdrop-blur-sm
              flex items-center justify-center transition-all duration-200
              hover:border-slate-600/50 hover:scale-110 active:scale-95
              ${button.color}
            `}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ y: -2 }}
            title={`Share on ${button.label}`}
          >
            <button.icon className={getIconSize()} />
          </motion.button>
        ))}

        {/* Copy Link Button */}
        <motion.button
          onClick={handleCopyLink}
          className={`
            ${getSizeClasses()}
            rounded-lg border border-slate-700/50 bg-slate-800/50 backdrop-blur-sm
            flex items-center justify-center transition-all duration-200
            hover:border-slate-600/50 hover:scale-110 active:scale-95
            hover:bg-purple-500/20 hover:text-purple-400
          `}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: shareButtons.length * 0.1 }}
          whileHover={{ y: -2 }}
          title="Copy link"
        >
          <Link className={getIconSize()} />
        </motion.button>
      </div>
    </div>
  );
}

// Floating share widget for sticky positioning
export function FloatingSocialShare({
  className = "",
  position = "right",
}: {
  className?: string;
  position?: "left" | "right";
}) {
  return (
    <motion.div
      className={`
        fixed top-1/2 transform -translate-y-1/2 z-40
        ${position === "right" ? "right-6" : "left-6"}
        ${className}
      `}
      initial={{ opacity: 0, x: position === "right" ? 100 : -100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 1 }}
    >
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-xl p-3 shadow-2xl">
        <SocialShareButtons
          showLabels={false}
          size="sm"
          className="flex-col gap-3"
        />
      </div>
    </motion.div>
  );
}
