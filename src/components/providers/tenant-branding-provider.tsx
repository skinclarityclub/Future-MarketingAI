"use client";

/**
 * Tenant Branding Provider
 * Task 36.4: Apply tenant branding throughout the application
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  TenantBrandingConfig,
  TenantBrandingService,
} from "@/lib/branding/tenant-branding-service";

interface BrandingContextType {
  branding: TenantBrandingConfig | null;
  isLoading: boolean;
  error: string | null;
  updateBranding: (config: Partial<TenantBrandingConfig>) => Promise<void>;
  applyThemePreset: (presetId: string) => Promise<void>;
  trackUsage: (
    pageViews?: number,
    assetLoads?: number,
    themeSwitches?: number
  ) => Promise<void>;
  generateCssVariables: () => string;
  refreshBranding: () => Promise<void>;
}

const BrandingContext = createContext<BrandingContextType | undefined>(
  undefined
);

interface TenantBrandingProviderProps {
  children: ReactNode;
  tenantId: string;
  initialBranding?: TenantBrandingConfig | null;
}

export function TenantBrandingProvider({
  children,
  tenantId,
  initialBranding,
}: TenantBrandingProviderProps) {
  const [branding, setBranding] = useState<TenantBrandingConfig | null>(
    initialBranding || null
  );
  const [isLoading, setIsLoading] = useState(!initialBranding);
  const [error, setError] = useState<string | null>(null);
  const [brandingService] = useState(() => new TenantBrandingService());

  // Load branding configuration
  const loadBranding = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const config = await brandingService.getTenantBrandingConfig(tenantId);

      if (config) {
        setBranding(config);
        applyCssVariables(config);
      } else {
        // Create default branding if none exists
        await brandingService.createDefaultBranding(tenantId);
        const defaultConfig =
          await brandingService.getTenantBrandingConfig(tenantId);
        if (defaultConfig) {
          setBranding(defaultConfig);
          applyCssVariables(defaultConfig);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load branding");
    } finally {
      setIsLoading(false);
    }
  };

  // Apply CSS variables to document
  const applyCssVariables = (config: TenantBrandingConfig) => {
    if (typeof document === "undefined") return;

    const cssVariables = brandingService.generateCssVariables(config);

    // Remove existing branding styles
    const existingStyle = document.getElementById("tenant-branding-styles");
    if (existingStyle) {
      existingStyle.remove();
    }

    // Add new branding styles
    const styleElement = document.createElement("style");
    styleElement.id = "tenant-branding-styles";
    styleElement.textContent = cssVariables;

    if (config.custom_css) {
      styleElement.textContent += "\n" + config.custom_css;
    }

    document.head.appendChild(styleElement);

    // Apply theme class to body
    document.body.className = document.body.className.replace(/theme-\w+/g, "");
    document.body.classList.add(`theme-${config.default_theme}`);

    // Apply layout classes
    document.body.classList.toggle("compact-mode", config.compact_mode);
    document.body.classList.toggle(
      "animations-disabled",
      !config.enable_animations
    );
    document.body.classList.add(`sidebar-${config.sidebar_style}`);
    document.body.classList.add(`header-${config.header_style}`);
    document.body.classList.add(`radius-${config.border_radius}`);
    document.body.classList.add(`shadow-${config.shadow_intensity}`);

    // Set favicon if provided
    if (config.favicon_url) {
      const favicon = document.querySelector(
        'link[rel="icon"]'
      ) as HTMLLinkElement;
      if (favicon) {
        favicon.href = config.favicon_url;
      }
    }

    // Set document title if company name is provided
    if (config.company_name && !document.title.includes(config.company_name)) {
      document.title = `${config.company_name} - ${document.title}`;
    }
  };

  // Update branding configuration
  const updateBranding = async (updates: Partial<TenantBrandingConfig>) => {
    if (!branding) return;

    try {
      setError(null);
      const updatedConfig = { ...branding, ...updates };

      const result =
        await brandingService.upsertTenantBrandingConfig(updatedConfig);

      if (result) {
        setBranding(updatedConfig);
        applyCssVariables(updatedConfig);
      } else {
        throw new Error("Failed to update branding configuration");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update branding"
      );
      throw err;
    }
  };

  // Apply theme preset
  const applyThemePreset = async (presetId: string) => {
    try {
      setError(null);
      const success = await brandingService.applyThemePreset(
        tenantId,
        presetId
      );

      if (success) {
        await loadBranding(); // Reload to get updated config
        await trackUsage(0, 0, 1); // Track theme switch
      } else {
        throw new Error("Failed to apply theme preset");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to apply theme preset"
      );
      throw err;
    }
  };

  // Track branding usage
  const trackUsage = async (
    pageViews = 1,
    assetLoads = 0,
    themeSwitches = 0
  ) => {
    try {
      await brandingService.trackBrandingUsage(
        tenantId,
        pageViews,
        assetLoads,
        themeSwitches
      );
    } catch (err) {
      console.warn("Failed to track branding usage:", err);
    }
  };

  // Generate CSS variables string
  const generateCssVariables = () => {
    if (!branding) return "";
    return brandingService.generateCssVariables(branding);
  };

  // Refresh branding configuration
  const refreshBranding = async () => {
    await loadBranding();
  };

  // Load branding on mount and when tenantId changes
  useEffect(() => {
    if (tenantId) {
      loadBranding();
    }
  }, [tenantId]);

  // Track page view when component mounts
  useEffect(() => {
    if (branding && !isLoading) {
      trackUsage(1, 0, 0);
    }
  }, [branding, isLoading]);

  // Execute custom JavaScript if provided
  useEffect(() => {
    if (branding?.custom_javascript && typeof window !== "undefined") {
      try {
        // Create a safe execution context
        const executeCustomJS = new Function(
          "branding",
          "tenantId",
          branding.custom_javascript
        );
        executeCustomJS(branding, tenantId);
      } catch (err) {
        console.warn("Failed to execute custom JavaScript:", err);
      }
    }
  }, [branding?.custom_javascript, tenantId]);

  const contextValue: BrandingContextType = {
    branding,
    isLoading,
    error,
    updateBranding,
    applyThemePreset,
    trackUsage,
    generateCssVariables,
    refreshBranding,
  };

  return (
    <BrandingContext.Provider value={contextValue}>
      {children}
    </BrandingContext.Provider>
  );
}

// Hook to use branding context
export function useTenantBranding() {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error(
      "useTenantBranding must be used within a TenantBrandingProvider"
    );
  }
  return context;
}

// Hook to get branding colors
export function useBrandingColors() {
  const { branding } = useTenantBranding();

  if (!branding) {
    return {
      primary: "#3B82F6",
      secondary: "#10B981",
      accent: "#F59E0B",
      background: "#FFFFFF",
      text: "#1F2937",
    };
  }

  return {
    primary: branding.primary_color,
    secondary: branding.secondary_color,
    accent: branding.accent_color,
    background: branding.background_color,
    text: branding.text_color,
  };
}

// Hook to get branding assets
export function useBrandingAssets() {
  const { branding } = useTenantBranding();

  if (!branding) {
    return {
      logoLight: null,
      logoDark: null,
      logoIcon: null,
      favicon: null,
      heroImage: null,
      backgroundPattern: null,
    };
  }

  return {
    logoLight: branding.logo_light_url,
    logoDark: branding.logo_dark_url,
    logoIcon: branding.logo_icon_url,
    favicon: branding.favicon_url,
    heroImage: branding.hero_image_url,
    backgroundPattern: branding.background_pattern_url,
  };
}

// Hook to get layout preferences
export function useLayoutPreferences() {
  const { branding } = useTenantBranding();

  if (!branding) {
    return {
      sidebarStyle: "modern",
      headerStyle: "floating",
      borderRadius: "medium",
      shadowIntensity: "medium",
      enableAnimations: true,
      compactMode: false,
    };
  }

  return {
    sidebarStyle: branding.sidebar_style,
    headerStyle: branding.header_style,
    borderRadius: branding.border_radius,
    shadowIntensity: branding.shadow_intensity,
    enableAnimations: branding.enable_animations,
    compactMode: branding.compact_mode,
  };
}

// Hook to check if white label is enabled
export function useWhiteLabel() {
  const { branding } = useTenantBranding();

  return {
    isWhiteLabel: branding?.is_white_label || false,
    hidePoweredBy: branding?.hide_powered_by || false,
    customDomain: branding?.custom_domain,
    showBrandWatermark: branding?.show_brand_watermark !== false,
  };
}

// Component to inject branding styles in head
export function BrandingStylesInjector() {
  const { branding, generateCssVariables } = useTenantBranding();

  useEffect(() => {
    if (branding) {
      const cssVariables = generateCssVariables();

      // Inject styles into head for server-side rendering
      const styleId = "tenant-branding-ssr";
      let styleElement = document.getElementById(styleId) as HTMLStyleElement;

      if (!styleElement) {
        styleElement = document.createElement("style");
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }

      styleElement.textContent = cssVariables;
    }
  }, [branding, generateCssVariables]);

  return null;
}
