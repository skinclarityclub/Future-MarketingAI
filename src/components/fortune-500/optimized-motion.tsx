"use client";

import React, { ReactNode } from "react";

interface OptimizedMotionProps {
  children: ReactNode;
  initial?: {
    opacity?: number;
    scale?: number;
    y?: number;
    x?: number;
  };
  animate?: {
    opacity?: number;
    scale?: number;
    y?: number;
    x?: number;
  };
  transition?: {
    delay?: number;
    duration?: number;
  };
  className?: string;
  style?: React.CSSProperties;
}

export default function OptimizedMotion({
  children,
  initial = {},
  animate = {},
  transition = {},
  className = "",
  style = {},
}: OptimizedMotionProps) {
  // ⚡ PERFORMANCE: Convert Framer Motion props to CSS animations
  const cssStyle: React.CSSProperties = {
    ...style,
    animation: `fadeInUp ${transition.duration || 0.5}s ease-out ${transition.delay || 0}s both`,
  };

  return (
    <div className={className} style={cssStyle}>
      {children}

      {/* ⚡ CSS-only animation keyframes - much faster than Framer Motion */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: ${initial.opacity ?? 0};
            transform: translateY(${initial.y || 20}px)
              scale(${initial.scale || 0.9});
          }
          to {
            opacity: ${animate.opacity ?? 1};
            transform: translateY(${animate.y || 0}px)
              scale(${animate.scale || 1});
          }
        }

        @keyframes fadeIn {
          from {
            opacity: ${initial.opacity ?? 0};
          }
          to {
            opacity: ${animate.opacity ?? 1};
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: ${initial.opacity ?? 0};
            transform: translateX(${initial.x || -20}px);
          }
          to {
            opacity: ${animate.opacity ?? 1};
            transform: translateX(${animate.x || 0}px);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: ${initial.opacity ?? 0};
            transform: scale(${initial.scale || 0.9});
          }
          to {
            opacity: ${animate.opacity ?? 1};
            transform: scale(${animate.scale || 1});
          }
        }
      `}</style>
    </div>
  );
}

// ⚡ PERFORMANCE: Simple animated wrapper for widgets
export function OptimizedWidget({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      className={`animate-fade-in-up ${className}`}
      style={{
        animationDelay: `${delay}s`,
        animationFillMode: "both",
      }}
    >
      {children}
    </div>
  );
}
