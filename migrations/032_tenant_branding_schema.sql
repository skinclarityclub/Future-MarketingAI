-- ====================================================================
-- Tenant Branding and Customization Schema
-- Task 36.4: Allow tenants to personalize their dashboards with custom branding
-- ====================================================================

-- ====================================================================
-- 1. Tenant Branding Configurations Table
-- ====================================================================
CREATE TABLE IF NOT EXISTS tenant_branding_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL UNIQUE,
    
    -- Company Information
    company_name VARCHAR(255),
    company_tagline VARCHAR(500),
    company_description TEXT,
    company_website VARCHAR(500),
    
    -- Visual Branding
    primary_color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color
    secondary_color VARCHAR(7) DEFAULT '#10B981',
    accent_color VARCHAR(7) DEFAULT '#F59E0B',
    background_color VARCHAR(7) DEFAULT '#FFFFFF',
    text_color VARCHAR(7) DEFAULT '#1F2937',
    
    -- Advanced Color Palette
    color_palette JSONB DEFAULT '{
        "primary": {"50": "#eff6ff", "100": "#dbeafe", "500": "#3b82f6", "900": "#1e3a8a"},
        "secondary": {"50": "#f0fdf4", "100": "#dcfce7", "500": "#10b981", "900": "#064e3b"},
        "neutral": {"50": "#f9fafb", "100": "#f3f4f6", "500": "#6b7280", "900": "#111827"}
    }',
    
    -- Typography
    primary_font VARCHAR(100) DEFAULT 'Inter',
    secondary_font VARCHAR(100) DEFAULT 'Inter',
    font_size_scale DECIMAL(3,2) DEFAULT 1.00, -- Scale factor for font sizes
    
    -- Logos and Images
    logo_light_url VARCHAR(1000), -- Logo for light theme
    logo_dark_url VARCHAR(1000),  -- Logo for dark theme
    logo_icon_url VARCHAR(1000),  -- Small icon version
    favicon_url VARCHAR(1000),
    hero_image_url VARCHAR(1000),
    background_pattern_url VARCHAR(1000),
    
    -- Layout Preferences
    sidebar_style VARCHAR(50) DEFAULT 'modern', -- 'modern', 'classic', 'minimal'
    header_style VARCHAR(50) DEFAULT 'floating', -- 'floating', 'solid', 'transparent'
    border_radius VARCHAR(20) DEFAULT 'medium', -- 'none', 'small', 'medium', 'large'
    shadow_intensity VARCHAR(20) DEFAULT 'medium', -- 'none', 'light', 'medium', 'strong'
    
    -- Dashboard Customization
    default_theme VARCHAR(20) DEFAULT 'light', -- 'light', 'dark', 'auto'
    enable_animations BOOLEAN DEFAULT true,
    compact_mode BOOLEAN DEFAULT false,
    show_brand_watermark BOOLEAN DEFAULT true,
    
    -- Custom CSS
    custom_css TEXT, -- Advanced users can add custom CSS
    custom_javascript TEXT, -- Custom JS for advanced integrations
    
    -- Email Branding
    email_header_color VARCHAR(7) DEFAULT '#3B82F6',
    email_footer_text TEXT DEFAULT 'Powered by Marketing Machine',
    email_signature TEXT,
    
    -- White Label Options
    is_white_label BOOLEAN DEFAULT false,
    hide_powered_by BOOLEAN DEFAULT false,
    custom_domain VARCHAR(255), -- For white-label deployments
    
    -- Social Media Branding
    social_media_templates JSONB DEFAULT '{}', -- Custom templates per platform
    
    -- Advanced Features (Enterprise)
    enable_custom_domains BOOLEAN DEFAULT false,
    enable_api_branding BOOLEAN DEFAULT false,
    enable_mobile_app_branding BOOLEAN DEFAULT false,
    
    -- Status and Metadata
    is_active BOOLEAN DEFAULT true,
    last_updated_by UUID, -- User who made the last update
    approved_by UUID, -- For enterprise approval workflows
    approved_at TIMESTAMPTZ,
    
    -- System Fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 2. Branding Assets Storage Table
-- ====================================================================
CREATE TABLE IF NOT EXISTS tenant_branding_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenant_branding_configs(tenant_id),
    
    -- Asset Information
    asset_type VARCHAR(50) NOT NULL, -- 'logo', 'icon', 'background', 'pattern', 'email_header'
    asset_name VARCHAR(255) NOT NULL,
    asset_description TEXT,
    
    -- File Information
    file_url VARCHAR(1000) NOT NULL,
    file_size_bytes BIGINT,
    file_type VARCHAR(50), -- 'image/png', 'image/svg+xml', etc.
    dimensions VARCHAR(20), -- '1920x1080', '512x512', etc.
    
    -- Usage Context
    usage_context VARCHAR(100)[], -- ['dashboard', 'email', 'mobile', 'print']
    device_types VARCHAR(50)[], -- ['desktop', 'tablet', 'mobile']
    
    -- Optimization Variants
    variants JSONB DEFAULT '{}', -- Different sizes/formats of the same asset
    
    -- Version Control
    version INTEGER DEFAULT 1,
    is_current_version BOOLEAN DEFAULT true,
    replaces_asset_id UUID REFERENCES tenant_branding_assets(id),
    
    -- System Fields
    uploaded_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 3. Tenant Theme Presets Table
-- ====================================================================
CREATE TABLE IF NOT EXISTS tenant_theme_presets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenant_branding_configs(tenant_id),
    
    -- Preset Information
    preset_name VARCHAR(100) NOT NULL,
    preset_description TEXT,
    preset_category VARCHAR(50), -- 'corporate', 'creative', 'minimal', 'bold'
    
    -- Theme Configuration
    theme_config JSONB NOT NULL, -- Complete theme configuration
    
    -- Preset Metadata
    is_default BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT false, -- Can other tenants see/use this preset
    usage_count INTEGER DEFAULT 0,
    
    -- System Fields
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(tenant_id, preset_name)
);

-- ====================================================================
-- 4. Custom Component Configurations Table
-- ====================================================================
CREATE TABLE IF NOT EXISTS tenant_component_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenant_branding_configs(tenant_id),
    
    -- Component Information
    component_type VARCHAR(100) NOT NULL, -- 'dashboard_card', 'chart', 'navigation', 'footer'
    component_name VARCHAR(100),
    component_location VARCHAR(100), -- Page or section where component appears
    
    -- Configuration
    config JSONB NOT NULL, -- Component-specific configuration
    
    -- Styling Override
    custom_styles JSONB DEFAULT '{}',
    
    -- Visibility and Behavior
    is_visible BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    responsive_config JSONB DEFAULT '{}', -- Different configs for different screen sizes
    
    -- System Fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(tenant_id, component_type, component_location)
);

-- ====================================================================
-- 5. Branding Usage Analytics Table
-- ====================================================================
CREATE TABLE IF NOT EXISTS branding_usage_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenant_branding_configs(tenant_id),
    
    -- Usage Tracking
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    page_views INTEGER DEFAULT 0,
    unique_users INTEGER DEFAULT 0,
    asset_loads INTEGER DEFAULT 0,
    theme_switches INTEGER DEFAULT 0,
    
    -- Performance Metrics
    avg_load_time_ms INTEGER,
    total_bandwidth_mb DECIMAL(10,2),
    
    -- User Engagement
    customization_interactions INTEGER DEFAULT 0,
    feedback_score DECIMAL(3,2), -- Average user satisfaction with branding
    
    -- System Fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(tenant_id, date)
);

-- ====================================================================
-- Indexes for Performance
-- ====================================================================

-- Branding Configs Indexes
CREATE INDEX IF NOT EXISTS idx_tenant_branding_configs_tenant 
    ON tenant_branding_configs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_branding_configs_active 
    ON tenant_branding_configs(is_active, tenant_id);

-- Assets Indexes
CREATE INDEX IF NOT EXISTS idx_tenant_branding_assets_tenant_type 
    ON tenant_branding_assets(tenant_id, asset_type);
CREATE INDEX IF NOT EXISTS idx_tenant_branding_assets_current 
    ON tenant_branding_assets(tenant_id, is_current_version);

-- Theme Presets Indexes
CREATE INDEX IF NOT EXISTS idx_tenant_theme_presets_tenant 
    ON tenant_theme_presets(tenant_id, is_default);
CREATE INDEX IF NOT EXISTS idx_tenant_theme_presets_public 
    ON tenant_theme_presets(is_public, preset_category);

-- Component Configs Indexes
CREATE INDEX IF NOT EXISTS idx_tenant_component_configs_tenant_type 
    ON tenant_component_configs(tenant_id, component_type);

-- Analytics Indexes
CREATE INDEX IF NOT EXISTS idx_branding_usage_analytics_tenant_date 
    ON branding_usage_analytics(tenant_id, date);

-- ====================================================================
-- Default Branding Presets
-- ====================================================================

-- Insert default theme presets that any tenant can use
INSERT INTO tenant_theme_presets (
    tenant_id, preset_name, preset_description, preset_category, theme_config, is_public
) VALUES
-- Corporate Blue Theme
(
    NULL, 
    'Corporate Blue', 
    'Professional blue theme perfect for corporate environments', 
    'corporate',
    '{
        "primary_color": "#1E40AF",
        "secondary_color": "#3B82F6",
        "accent_color": "#60A5FA",
        "background_color": "#F8FAFC",
        "text_color": "#1E293B",
        "sidebar_style": "modern",
        "header_style": "solid",
        "border_radius": "medium"
    }',
    true
),

-- Creative Green Theme
(
    NULL,
    'Creative Green',
    'Vibrant green theme for creative and innovative companies',
    'creative',
    '{
        "primary_color": "#059669",
        "secondary_color": "#10B981",
        "accent_color": "#34D399",
        "background_color": "#F0FDF4",
        "text_color": "#064E3B",
        "sidebar_style": "modern",
        "header_style": "floating",
        "border_radius": "large"
    }',
    true
),

-- Minimal Dark Theme
(
    NULL,
    'Minimal Dark',
    'Clean dark theme for modern, minimalist interfaces',
    'minimal',
    '{
        "primary_color": "#6366F1",
        "secondary_color": "#8B5CF6",
        "accent_color": "#A78BFA",
        "background_color": "#0F172A",
        "text_color": "#F1F5F9",
        "sidebar_style": "minimal",
        "header_style": "transparent",
        "border_radius": "small"
    }',
    true
),

-- Bold Orange Theme
(
    NULL,
    'Bold Orange',
    'Energetic orange theme for dynamic and bold brands',
    'bold',
    '{
        "primary_color": "#EA580C",
        "secondary_color": "#FB923C",
        "accent_color": "#FDBA74",
        "background_color": "#FFFBEB",
        "text_color": "#9A3412",
        "sidebar_style": "modern",
        "header_style": "solid",
        "border_radius": "medium"
    }',
    true
)

ON CONFLICT DO NOTHING;

-- ====================================================================
-- Functions for Branding Management
-- ====================================================================

-- Function to get complete branding configuration for a tenant
CREATE OR REPLACE FUNCTION get_tenant_branding_config(p_tenant_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_config JSONB;
    v_assets JSONB;
    v_components JSONB;
BEGIN
    -- Get main branding config
    SELECT to_jsonb(tbc.*) INTO v_config
    FROM tenant_branding_configs tbc
    WHERE tbc.tenant_id = p_tenant_id;
    
    -- Get assets
    SELECT COALESCE(json_agg(to_jsonb(tba.*)), '[]'::jsonb) INTO v_assets
    FROM tenant_branding_assets tba
    WHERE tba.tenant_id = p_tenant_id 
        AND tba.is_current_version = true;
    
    -- Get component configs
    SELECT COALESCE(json_agg(to_jsonb(tcc.*)), '[]'::jsonb) INTO v_components
    FROM tenant_component_configs tcc
    WHERE tcc.tenant_id = p_tenant_id
        AND tcc.is_visible = true;
    
    -- Combine all data
    IF v_config IS NULL THEN
        -- Return default configuration if none exists
        v_config := '{
            "company_name": "Marketing Machine",
            "primary_color": "#3B82F6",
            "secondary_color": "#10B981",
            "accent_color": "#F59E0B",
            "default_theme": "light"
        }'::jsonb;
    END IF;
    
    v_config := v_config || jsonb_build_object(
        'assets', v_assets,
        'components', v_components
    );
    
    RETURN v_config;
END;
$$ LANGUAGE plpgsql;

-- Function to create default branding config for new tenant
CREATE OR REPLACE FUNCTION create_default_tenant_branding(p_tenant_id UUID)
RETURNS UUID AS $$
DECLARE
    v_config_id UUID;
BEGIN
    -- Insert default branding configuration
    INSERT INTO tenant_branding_configs (
        tenant_id,
        company_name,
        primary_color,
        secondary_color,
        accent_color,
        background_color,
        text_color
    ) VALUES (
        p_tenant_id,
        'Marketing Machine',
        '#3B82F6',
        '#10B981', 
        '#F59E0B',
        '#FFFFFF',
        '#1F2937'
    )
    RETURNING id INTO v_config_id;
    
    RETURN v_config_id;
END;
$$ LANGUAGE plpgsql;

-- Function to track branding usage
CREATE OR REPLACE FUNCTION track_branding_usage(
    p_tenant_id UUID,
    p_page_views INTEGER DEFAULT 1,
    p_asset_loads INTEGER DEFAULT 0,
    p_theme_switches INTEGER DEFAULT 0
) RETURNS void AS $$
BEGIN
    INSERT INTO branding_usage_analytics (
        tenant_id, page_views, asset_loads, theme_switches
    ) VALUES (
        p_tenant_id, p_page_views, p_asset_loads, p_theme_switches
    )
    ON CONFLICT (tenant_id, date) DO UPDATE SET
        page_views = branding_usage_analytics.page_views + p_page_views,
        asset_loads = branding_usage_analytics.asset_loads + p_asset_loads,
        theme_switches = branding_usage_analytics.theme_switches + p_theme_switches,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- Triggers
-- ====================================================================

-- Update timestamp trigger for branding configs
CREATE OR REPLACE FUNCTION update_branding_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_branding_configs_timestamp
    BEFORE UPDATE ON tenant_branding_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_branding_timestamp();

CREATE TRIGGER trigger_update_branding_assets_timestamp
    BEFORE UPDATE ON tenant_branding_assets
    FOR EACH ROW
    EXECUTE FUNCTION update_branding_timestamp();

CREATE TRIGGER trigger_update_component_configs_timestamp
    BEFORE UPDATE ON tenant_component_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_branding_timestamp(); 