"use client";

import { ReactNode, useEffect, useState } from "react";

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  variant?: "dashboard" | "page" | "section";
  mobileLayout?: "stack" | "grid" | "carousel";
  tabletLayout?: "grid-2" | "grid-3" | "sidebar";
  desktopLayout?: "grid-3" | "grid-4" | "sidebar-content";
}

interface BreakpointState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  width: number;
}

const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState<BreakpointState>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isLargeDesktop: false,
    width: 0,
  });

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      setBreakpoint({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024 && width < 1536,
        isLargeDesktop: width >= 1536,
        width,
      });
    };

    updateBreakpoint();
    window.addEventListener("resize", updateBreakpoint);
    return () => window.removeEventListener("resize", updateBreakpoint);
  }, []);

  return breakpoint;
};

export default function ResponsiveContainer({
  children,
  className = "",
  variant = "dashboard",
  mobileLayout = "stack",
  tabletLayout = "grid-2",
  desktopLayout = "grid-3",
}: ResponsiveContainerProps) {
  const { isMobile, isTablet, isDesktop, isLargeDesktop } = useBreakpoint();

  // Base container classes
  const baseClasses = "w-full mx-auto transition-all duration-300 ease-premium";

  // Variant-specific classes
  const variantClasses = {
    dashboard: "min-h-screen",
    page: "min-h-[calc(100vh-4rem)]",
    section: "min-h-0",
  };

  // Mobile layout classes
  const mobileLayoutClasses = {
    stack: "flex flex-col space-y-4",
    grid: "grid grid-cols-1 gap-4",
    carousel: "flex overflow-x-auto space-x-4 snap-x snap-mandatory",
  };

  // Tablet layout classes
  const tabletLayoutClasses = {
    "grid-2": "grid grid-cols-2 gap-6",
    "grid-3": "grid grid-cols-3 gap-6",
    sidebar: "flex gap-6",
  };

  // Desktop layout classes
  const desktopLayoutClasses = {
    "grid-3": "grid grid-cols-3 gap-8",
    "grid-4": "grid grid-cols-4 gap-8",
    "sidebar-content": "flex gap-8",
  };

  // Responsive padding classes
  const paddingClasses = () => {
    if (isMobile) return "px-4 py-4";
    if (isTablet) return "px-6 py-6";
    if (isDesktop) return "px-8 py-8";
    return "px-12 py-12"; // Large desktop
  };

  // Responsive max-width classes
  const maxWidthClasses = () => {
    if (variant === "dashboard") {
      if (isMobile) return "max-w-full";
      if (isTablet) return "max-w-5xl";
      if (isDesktop) return "max-w-7xl";
      return "max-w-[1920px]"; // Large desktop
    }
    if (variant === "page") {
      if (isMobile) return "max-w-full";
      if (isTablet) return "max-w-4xl";
      return "max-w-6xl";
    }
    return "max-w-full"; // Section
  };

  // Layout classes based on screen size
  const layoutClasses = () => {
    if (isMobile) return mobileLayoutClasses[mobileLayout];
    if (isTablet) return tabletLayoutClasses[tabletLayout];
    return desktopLayoutClasses[desktopLayout];
  };

  // Combine all classes
  const containerClasses = [
    baseClasses,
    variantClasses[variant],
    paddingClasses(),
    maxWidthClasses(),
    layoutClasses(),
    className,
  ].join(" ");

  return (
    <div className={containerClasses}>
      {/* Mobile bottom padding for navigation */}
      {isMobile && variant === "dashboard" && (
        <div className="pb-20">{children}</div>
      )}

      {/* Regular content for non-mobile */}
      {!isMobile && children}
    </div>
  );
}

// Responsive Grid Component
interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  cols?: {
    mobile?: 1 | 2;
    tablet?: 2 | 3 | 4;
    desktop?: 3 | 4 | 5 | 6;
  };
  gap?: {
    mobile?: "sm" | "md" | "lg";
    tablet?: "sm" | "md" | "lg" | "xl";
    desktop?: "md" | "lg" | "xl" | "2xl";
  };
}

export function ResponsiveGrid({
  children,
  className = "",
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = { mobile: "md", tablet: "lg", desktop: "xl" },
}: ResponsiveGridProps) {
  const { isMobile, isTablet } = useBreakpoint();

  // Gap classes mapping
  const gapMapping = {
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
    xl: "gap-8",
    "2xl": "gap-12",
  };

  // Columns classes mapping
  const colsMapping = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
  };

  // Determine current gap and columns
  const currentGap = isMobile
    ? gapMapping[gap.mobile || "md"]
    : isTablet
      ? gapMapping[gap.tablet || "lg"]
      : gapMapping[gap.desktop || "xl"];

  const currentCols = isMobile
    ? colsMapping[cols.mobile || 1]
    : isTablet
      ? colsMapping[cols.tablet || 2]
      : colsMapping[cols.desktop || 3];

  return (
    <div className={`grid ${currentCols} ${currentGap} ${className}`}>
      {children}
    </div>
  );
}

// Responsive Card Component
interface ResponsiveCardProps {
  children: ReactNode;
  className?: string;
  priority?: "primary" | "secondary" | "tertiary";
  mobileFullWidth?: boolean;
}

export function ResponsiveCard({
  children,
  className = "",
  priority = "secondary",
  mobileFullWidth = false,
}: ResponsiveCardProps) {
  const { isMobile } = useBreakpoint();

  // Priority-based styling
  const priorityClasses = {
    primary: "glass-primary shadow-enterprise border-primary-500/20",
    secondary: "glass-secondary shadow-luxury border-white/10",
    tertiary: "glass-tertiary shadow-premium border-white/5",
  };

  // Mobile-specific adjustments
  const mobileClasses = isMobile
    ? mobileFullWidth
      ? "card-mobile-luxury w-full"
      : "card-mobile-premium"
    : "";

  // Responsive padding
  const paddingClasses = isMobile ? "p-4" : "p-6 lg:p-8";

  return (
    <div
      className={`
        ${priorityClasses[priority]}
        ${mobileClasses}
        ${paddingClasses}
        rounded-xl backdrop-blur-md
        transition-all duration-300 ease-premium
        hover-lift hover-glow
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// Responsive Typography Component
interface ResponsiveTextProps {
  children: ReactNode;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  variant?: "display" | "heading" | "subheading" | "body" | "caption";
  className?: string;
  responsive?: boolean;
}

export function ResponsiveText({
  children,
  as: Component = "p",
  variant = "body",
  className = "",
  responsive = true,
}: ResponsiveTextProps) {
  const { isMobile } = useBreakpoint();

  // Base variant classes
  const variantClasses = {
    display: "font-bold text-white tracking-tight",
    heading: "font-semibold text-white",
    subheading: "font-medium text-neutral-200",
    body: "text-neutral-300",
    caption: "text-neutral-400",
  };

  // Responsive size classes
  const responsiveClasses =
    responsive && isMobile
      ? {
          display: "text-mobile-display",
          heading: "text-mobile-h1",
          subheading: "text-mobile-h2",
          body: "text-mobile-body",
          caption: "text-sm",
        }
      : {
          display: "text-4xl lg:text-6xl",
          heading: "text-2xl lg:text-4xl",
          subheading: "text-xl lg:text-2xl",
          body: "text-base lg:text-lg",
          caption: "text-sm lg:text-base",
        };

  return (
    <Component
      className={`
        ${variantClasses[variant]}
        ${responsiveClasses[variant]}
        ${className}
      `}
    >
      {children}
    </Component>
  );
}

// Export the hook for other components
export { useBreakpoint };
