/**
 * Tenant Branding Service
 * Task 36.4: Allow tenants to personalize their dashboards with custom branding
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export interface TenantBrandingConfig {
  id?: string;
  tenant_id: string;
  company_name?: string;
  company_tagline?: string;
  company_description?: string;
  company_website?: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  color_palette?: any;
  primary_font: string;
  secondary_font: string;
  font_size_scale: number;
  logo_light_url?: string;
  logo_dark_url?: string;
  logo_icon_url?: string;
  favicon_url?: string;
  hero_image_url?: string;
  background_pattern_url?: string;
  sidebar_style: "modern" | "classic" | "minimal";
  header_style: "floating" | "solid" | "transparent";
  border_radius: "none" | "small" | "medium" | "large";
  shadow_intensity: "none" | "light" | "medium" | "strong";
  default_theme: "light" | "dark" | "auto";
  enable_animations: boolean;
  compact_mode: boolean;
  show_brand_watermark: boolean;
  custom_css?: string;
  custom_javascript?: string;
  email_header_color: string;
  email_footer_text: string;
  email_signature?: string;
  is_white_label: boolean;
  hide_powered_by: boolean;
  custom_domain?: string;
  social_media_templates?: any;
  enable_custom_domains: boolean;
  enable_api_branding: boolean;
  enable_mobile_app_branding: boolean;
  is_active: boolean;
  assets?: BrandingAsset[];
  components?: ComponentConfig[];
}

export interface BrandingAsset {
  id?: string;
  tenant_id: string;
  asset_type: "logo" | "icon" | "background" | "pattern" | "email_header";
  asset_name: string;
  asset_description?: string;
  file_url: string;
  file_size_bytes?: number;
  file_type?: string;
  dimensions?: string;
  usage_context?: string[];
  device_types?: string[];
  variants?: any;
  version: number;
  is_current_version: boolean;
  uploaded_by?: string;
}

export interface ThemePreset {
  id?: string;
  tenant_id?: string;
  preset_name: string;
  preset_description?: string;
  preset_category: "corporate" | "creative" | "minimal" | "bold";
  theme_config: any;
  is_default: boolean;
  is_public: boolean;
  usage_count: number;
  created_by?: string;
}

export interface ComponentConfig {
  id?: string;
  tenant_id: string;
  component_type: string;
  component_name?: string;
  component_location: string;
  config: any;
  custom_styles?: any;
  is_visible: boolean;
  display_order: number;
  responsive_config?: any;
}

export interface BrandingUsageAnalytics {
  tenant_id: string;
  date: string;
  page_views: number;
  unique_users: number;
  asset_loads: number;
  theme_switches: number;
  avg_load_time_ms?: number;
  total_bandwidth_mb?: number;
  customization_interactions: number;
  feedback_score?: number;
}

export class TenantBrandingService {
  private supabase;

  constructor() {
    this.supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookies().get(name)?.value;
          },
        },
      }
    );
  }

  /**
   * Get complete branding configuration for a tenant
   */
  async getTenantBrandingConfig(
    tenantId: string
  ): Promise<TenantBrandingConfig | null> {
    try {
      const { data, error } = await this.supabase.rpc(
        "get_tenant_branding_config",
        { p_tenant_id: tenantId }
      );

      if (error) {
        console.error("Error fetching tenant branding config:", error);
        return null;
      }

      return data as TenantBrandingConfig;
    } catch (error) {
      console.error("Tenant branding config service error:", error);
      return null;
    }
  }

  /**
   * Create or update tenant branding configuration
   */
  async upsertTenantBrandingConfig(
    config: TenantBrandingConfig
  ): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from("tenant_branding_configs")
        .upsert(
          {
            tenant_id: config.tenant_id,
            company_name: config.company_name,
            company_tagline: config.company_tagline,
            company_description: config.company_description,
            company_website: config.company_website,
            primary_color: config.primary_color,
            secondary_color: config.secondary_color,
            accent_color: config.accent_color,
            background_color: config.background_color,
            text_color: config.text_color,
            color_palette: config.color_palette,
            primary_font: config.primary_font,
            secondary_font: config.secondary_font,
            font_size_scale: config.font_size_scale,
            logo_light_url: config.logo_light_url,
            logo_dark_url: config.logo_dark_url,
            logo_icon_url: config.logo_icon_url,
            favicon_url: config.favicon_url,
            hero_image_url: config.hero_image_url,
            background_pattern_url: config.background_pattern_url,
            sidebar_style: config.sidebar_style,
            header_style: config.header_style,
            border_radius: config.border_radius,
            shadow_intensity: config.shadow_intensity,
            default_theme: config.default_theme,
            enable_animations: config.enable_animations,
            compact_mode: config.compact_mode,
            show_brand_watermark: config.show_brand_watermark,
            custom_css: config.custom_css,
            custom_javascript: config.custom_javascript,
            email_header_color: config.email_header_color,
            email_footer_text: config.email_footer_text,
            email_signature: config.email_signature,
            is_white_label: config.is_white_label,
            hide_powered_by: config.hide_powered_by,
            custom_domain: config.custom_domain,
            social_media_templates: config.social_media_templates,
            enable_custom_domains: config.enable_custom_domains,
            enable_api_branding: config.enable_api_branding,
            enable_mobile_app_branding: config.enable_mobile_app_branding,
            is_active: config.is_active,
          },
          {
            onConflict: "tenant_id",
          }
        )
        .select("id")
        .single();

      if (error) {
        console.error("Error upserting tenant branding config:", error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error("Upsert tenant branding config error:", error);
      return null;
    }
  }

  /**
   * Upload and manage branding assets
   */
  async uploadBrandingAsset(asset: BrandingAsset): Promise<string | null> {
    try {
      // First, mark any existing assets of the same type as non-current
      await this.supabase
        .from("tenant_branding_assets")
        .update({ is_current_version: false })
        .eq("tenant_id", asset.tenant_id)
        .eq("asset_type", asset.asset_type);

      // Insert the new asset
      const { data, error } = await this.supabase
        .from("tenant_branding_assets")
        .insert({
          tenant_id: asset.tenant_id,
          asset_type: asset.asset_type,
          asset_name: asset.asset_name,
          asset_description: asset.asset_description,
          file_url: asset.file_url,
          file_size_bytes: asset.file_size_bytes,
          file_type: asset.file_type,
          dimensions: asset.dimensions,
          usage_context: asset.usage_context,
          device_types: asset.device_types,
          variants: asset.variants,
          version: asset.version || 1,
          is_current_version: true,
          uploaded_by: asset.uploaded_by,
        })
        .select("id")
        .single();

      if (error) {
        console.error("Error uploading branding asset:", error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error("Upload branding asset error:", error);
      return null;
    }
  }

  /**
   * Get branding assets for a tenant
   */
  async getTenantBrandingAssets(
    tenantId: string,
    assetType?: string
  ): Promise<BrandingAsset[]> {
    try {
      let query = this.supabase
        .from("tenant_branding_assets")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("is_current_version", true)
        .order("created_at", { ascending: false });

      if (assetType) {
        query = query.eq("asset_type", assetType);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching tenant branding assets:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Get tenant branding assets error:", error);
      return [];
    }
  }

  /**
   * Create or update theme preset
   */
  async upsertThemePreset(preset: ThemePreset): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from("tenant_theme_presets")
        .upsert(
          {
            tenant_id: preset.tenant_id,
            preset_name: preset.preset_name,
            preset_description: preset.preset_description,
            preset_category: preset.preset_category,
            theme_config: preset.theme_config,
            is_default: preset.is_default,
            is_public: preset.is_public,
            created_by: preset.created_by,
          },
          {
            onConflict: "tenant_id,preset_name",
          }
        )
        .select("id")
        .single();

      if (error) {
        console.error("Error upserting theme preset:", error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error("Upsert theme preset error:", error);
      return null;
    }
  }

  /**
   * Get theme presets for a tenant (including public presets)
   */
  async getThemePresets(
    tenantId?: string,
    includePublic: boolean = true
  ): Promise<ThemePreset[]> {
    try {
      let query = this.supabase
        .from("tenant_theme_presets")
        .select("*")
        .order("usage_count", { ascending: false });

      if (tenantId && includePublic) {
        query = query.or(`tenant_id.eq.${tenantId},is_public.eq.true`);
      } else if (tenantId) {
        query = query.eq("tenant_id", tenantId);
      } else if (includePublic) {
        query = query.eq("is_public", true);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching theme presets:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Get theme presets error:", error);
      return [];
    }
  }

  /**
   * Apply theme preset to tenant
   */
  async applyThemePreset(tenantId: string, presetId: string): Promise<boolean> {
    try {
      // Get the preset
      const { data: preset, error: presetError } = await this.supabase
        .from("tenant_theme_presets")
        .select("*")
        .eq("id", presetId)
        .single();

      if (presetError || !preset) {
        console.error("Error fetching theme preset:", presetError);
        return false;
      }

      // Apply the theme configuration to the tenant
      const { error: updateError } = await this.supabase
        .from("tenant_branding_configs")
        .upsert(
          {
            tenant_id: tenantId,
            ...preset.theme_config,
          },
          {
            onConflict: "tenant_id",
          }
        );

      if (updateError) {
        console.error("Error applying theme preset:", updateError);
        return false;
      }

      // Increment usage count
      await this.supabase
        .from("tenant_theme_presets")
        .update({ usage_count: preset.usage_count + 1 })
        .eq("id", presetId);

      return true;
    } catch (error) {
      console.error("Apply theme preset error:", error);
      return false;
    }
  }

  /**
   * Manage component configurations
   */
  async upsertComponentConfig(config: ComponentConfig): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from("tenant_component_configs")
        .upsert(
          {
            tenant_id: config.tenant_id,
            component_type: config.component_type,
            component_name: config.component_name,
            component_location: config.component_location,
            config: config.config,
            custom_styles: config.custom_styles,
            is_visible: config.is_visible,
            display_order: config.display_order,
            responsive_config: config.responsive_config,
          },
          {
            onConflict: "tenant_id,component_type,component_location",
          }
        )
        .select("id")
        .single();

      if (error) {
        console.error("Error upserting component config:", error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error("Upsert component config error:", error);
      return null;
    }
  }

  /**
   * Get component configurations for a tenant
   */
  async getComponentConfigs(
    tenantId: string,
    componentType?: string,
    location?: string
  ): Promise<ComponentConfig[]> {
    try {
      let query = this.supabase
        .from("tenant_component_configs")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("display_order", { ascending: true });

      if (componentType) {
        query = query.eq("component_type", componentType);
      }

      if (location) {
        query = query.eq("component_location", location);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching component configs:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Get component configs error:", error);
      return [];
    }
  }

  /**
   * Track branding usage analytics
   */
  async trackBrandingUsage(
    tenantId: string,
    pageViews: number = 1,
    assetLoads: number = 0,
    themeSwitches: number = 0
  ): Promise<void> {
    try {
      await this.supabase.rpc("track_branding_usage", {
        p_tenant_id: tenantId,
        p_page_views: pageViews,
        p_asset_loads: assetLoads,
        p_theme_switches: themeSwitches,
      });
    } catch (error) {
      console.error("Track branding usage error:", error);
    }
  }

  /**
   * Get branding usage analytics
   */
  async getBrandingAnalytics(
    tenantId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<BrandingUsageAnalytics[]> {
    try {
      let query = this.supabase
        .from("branding_usage_analytics")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("date", { ascending: false });

      if (startDate) {
        query = query.gte("date", startDate.toISOString().split("T")[0]);
      }

      if (endDate) {
        query = query.lte("date", endDate.toISOString().split("T")[0]);
      }

      const { data, error } = await query.limit(30);

      if (error) {
        console.error("Error fetching branding analytics:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Get branding analytics error:", error);
      return [];
    }
  }

  /**
   * Generate CSS variables from branding config
   */
  generateCssVariables(config: TenantBrandingConfig): string {
    const cssVariables = [
      `--brand-primary: ${config.primary_color};`,
      `--brand-secondary: ${config.secondary_color};`,
      `--brand-accent: ${config.accent_color};`,
      `--brand-background: ${config.background_color};`,
      `--brand-text: ${config.text_color};`,
      `--brand-font-primary: ${config.primary_font};`,
      `--brand-font-secondary: ${config.secondary_font};`,
      `--brand-font-scale: ${config.font_size_scale};`,
      `--brand-border-radius: ${this.getBorderRadiusValue(config.border_radius)};`,
      `--brand-shadow: ${this.getShadowValue(config.shadow_intensity)};`,
    ];

    // Add color palette if available
    if (config.color_palette) {
      Object.entries(config.color_palette).forEach(
        ([colorName, colorShades]: [string, any]) => {
          Object.entries(colorShades).forEach(([shade, value]) => {
            cssVariables.push(`--brand-${colorName}-${shade}: ${value};`);
          });
        }
      );
    }

    return `:root {\n  ${cssVariables.join("\n  ")}\n}`;
  }

  /**
   * Get border radius CSS value from setting
   */
  private getBorderRadiusValue(setting: string): string {
    const values = {
      none: "0",
      small: "0.125rem",
      medium: "0.375rem",
      large: "0.75rem",
    };
    return values[setting as keyof typeof values] || values.medium;
  }

  /**
   * Get shadow CSS value from setting
   */
  private getShadowValue(setting: string): string {
    const values = {
      none: "none",
      light: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
      medium: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      strong: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    };
    return values[setting as keyof typeof values] || values.medium;
  }

  /**
   * Create default branding for new tenant
   */
  async createDefaultBranding(
    tenantId: string,
    companyName?: string
  ): Promise<string | null> {
    try {
      const { data, error } = await this.supabase.rpc(
        "create_default_tenant_branding",
        { p_tenant_id: tenantId }
      );

      if (error) {
        console.error("Error creating default branding:", error);
        return null;
      }

      // Update company name if provided
      if (companyName) {
        await this.supabase
          .from("tenant_branding_configs")
          .update({ company_name: companyName })
          .eq("tenant_id", tenantId);
      }

      return data;
    } catch (error) {
      console.error("Create default branding error:", error);
      return null;
    }
  }

  /**
   * Delete branding configuration
   */
  async deleteTenantBranding(tenantId: string): Promise<boolean> {
    try {
      // Delete in order due to foreign key constraints
      await this.supabase
        .from("branding_usage_analytics")
        .delete()
        .eq("tenant_id", tenantId);

      await this.supabase
        .from("tenant_component_configs")
        .delete()
        .eq("tenant_id", tenantId);

      await this.supabase
        .from("tenant_theme_presets")
        .delete()
        .eq("tenant_id", tenantId);

      await this.supabase
        .from("tenant_branding_assets")
        .delete()
        .eq("tenant_id", tenantId);

      const { error } = await this.supabase
        .from("tenant_branding_configs")
        .delete()
        .eq("tenant_id", tenantId);

      if (error) {
        console.error("Error deleting tenant branding:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Delete tenant branding error:", error);
      return false;
    }
  }
}
