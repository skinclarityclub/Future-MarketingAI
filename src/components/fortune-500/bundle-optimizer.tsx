/**
 * ⚡ BUNDLE OPTIMIZER - Reduces Fortune 500 Command Center bundle size
 * Selective imports and code splitting for maximum performance
 */

// ⚡ PERFORMANCE: Individual lucide icon imports instead of full bundle
export { Monitor } from "lucide-react/dist/esm/icons/monitor";
export { Grid3X3 } from "lucide-react/dist/esm/icons/grid-3x3";
export { Maximize2 } from "lucide-react/dist/esm/icons/maximize-2";
export { Minimize2 } from "lucide-react/dist/esm/icons/minimize-2";
export { Settings } from "lucide-react/dist/esm/icons/settings";
export { Bot } from "lucide-react/dist/esm/icons/bot";
export { CheckCircle } from "lucide-react/dist/esm/icons/check-circle";
export { MousePointer } from "lucide-react/dist/esm/icons/mouse-pointer";
export { Layers } from "lucide-react/dist/esm/icons/layers";
export { TrendingUp } from "lucide-react/dist/esm/icons/trending-up";
export { DollarSign } from "lucide-react/dist/esm/icons/dollar-sign";
export { Users } from "lucide-react/dist/esm/icons/users";
export { Target } from "lucide-react/dist/esm/icons/target";

// ⚡ PERFORMANCE: Lightweight motion alternatives
export const OptimizedMotion = {
  div: ({ children, className, style, ...props }: any) => (
    <div
      className={`transition-all duration-500 ease-out ${className || ""}`}
      style={{
        ...style,
        animation: props.animate ? "fadeInUp 0.5s ease-out" : undefined,
      }}
      {...props}
    >
      {children}
    </div>
  ),

  h1: ({ children, className, style, ...props }: any) => (
    <h1
      className={`transition-all duration-300 ease-out ${className || ""}`}
      style={style}
      {...props}
    >
      {children}
    </h1>
  ),

  button: ({
    children,
    className,
    style,
    whileHover,
    whileTap,
    ...props
  }: any) => (
    <NormalButton
      className={`transition-all duration-200 ease-out hover:scale-105 active:scale-95 ${className || ""}`}
      style={style}
      {...props}
    >
      {children}
    </NormalButton>
  ),
};

// ⚡ PERFORMANCE: CSS Animations instead of JS
export const PerformanceAnimations = `
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.performance-fade-in {
  animation: fadeInUp 0.5s ease-out;
}

.performance-slide-in {
  animation: slideInRight 0.3s ease-out;
}

.performance-pulse {
  animation: pulse 2s infinite;
}

.performance-shimmer {
  background: linear-gradient(90deg, #f0f0f0 0px, #e0e0e0 40px, #f0f0f0 80px);
  background-size: 200px;
  animation: shimmer 1.5s infinite;
}
`;

// ⚡ PERFORMANCE: Optimized component registry
export const OptimizedComponents = {
  // Lightweight loading states
  SkeletonLoader: ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-slate-700/50 rounded ${className}`} />
  ),

  // Performance-focused status indicators
  StatusDot: ({
    status,
    size = "sm",
  }: {
    status: "online" | "offline" | "warning";
    size?: "sm" | "md";
  }) => {
    const colors = {
      online: "bg-green-400",
      offline: "bg-red-400",
      warning: "bg-yellow-400",
    };

    const sizes = {
      sm: "w-2 h-2",
      md: "w-3 h-3",
    };

    return (
      <div
        className={`rounded-full ${colors[status]} ${sizes[size]} performance-pulse`}
      />
    );
  },

  // Optimized metric display
  MetricCard: ({
    label,
    value,
    trend,
    className,
  }: {
    label: string;
    value: string | number;
    trend?: "up" | "down" | "stable";
    className?: string;
  }) => {
    const trendColors = {
      up: "text-green-400",
      down: "text-red-400",
      stable: "text-blue-400",
    };

    return (
      <div
        className={`p-3 rounded-lg bg-slate-800/50 backdrop-blur performance-fade-in ${className}`}
      >
        <div className="flex justify-between items-center">
          <span className="text-slate-300 text-sm">{label}</span>
          <div className="flex items-center gap-2">
            <span className="text-white font-mono">{value}</span>
            {trend && (
              <div className={`w-2 h-2 rounded-full ${trendColors[trend]}`} />
            )}
          </div>
        </div>
      </div>
    );
  },
};

// ⚡ PERFORMANCE: Bundle analysis helpers
export const BundleOptimizer = {
  // Lazy load components only when needed
  lazyLoad: (componentPath: string) => {
    return React.lazy(() => import(componentPath));
  },

  // Preload critical components
  preloadComponent: (componentPath: string) => {
    const link = document.createElement("link");
    link.rel = "modulepreload";
    link.href = componentPath;
    document.head.appendChild(link);
  },

  // Check if component is in viewport before loading
  loadOnViewport: (componentPath: string, threshold = 0.1) => {
    return React.lazy(
      () =>
        new Promise(resolve => {
          const observer = new IntersectionObserver(
            entries => {
              if (entries[0].isIntersecting) {
                resolve(import(componentPath));
                observer.disconnect();
              }
            },
            { threshold }
          );

          // Start observing a placeholder element
          const placeholder = document.createElement("div");
          observer.observe(placeholder);
        })
    );
  },
};

export default {
  OptimizedMotion,
  OptimizedComponents,
  BundleOptimizer,
  PerformanceAnimations,
};
