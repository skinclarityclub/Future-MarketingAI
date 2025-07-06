-- Fix Missing Database Functions and Tables (Version 2)
-- Run this script in Supabase SQL Editor to complete the usage tracking setup

-- ====================================================================
-- 1. Usage Quota Definitions Table
-- ====================================================================
CREATE TABLE IF NOT EXISTS usage_quota_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Quota Configuration
    quota_name VARCHAR(200) NOT NULL,
    billing_tier VARCHAR(50) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    
    -- Limits
    quota_limit BIGINT NOT NULL, -- -1 for unlimited
    quota_period VARCHAR(20) NOT NULL, -- 'hourly', 'daily', 'monthly', 'annual'
    soft_limit_threshold DECIMAL(5,2) DEFAULT 80.0, -- Percentage for warnings
    
    -- Overage Handling
    allow_overage BOOLEAN DEFAULT false,
    overage_rate DECIMAL(10,4), -- Cost per unit over quota
    max_overage_percentage DECIMAL(5,2) DEFAULT 20.0,
    
    -- Notifications
    enable_notifications BOOLEAN DEFAULT true,
    notification_thresholds DECIMAL(5,2)[] DEFAULT ARRAY[50.0, 75.0, 90.0, 100.0],
    
    -- System Fields
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Add unique constraint for conflict handling
    UNIQUE(quota_name, billing_tier, resource_type)
);

-- ====================================================================
-- 2. Tenant Current Usage Table
-- ====================================================================
CREATE TABLE IF NOT EXISTS tenant_current_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    
    -- Current Period Tracking
    billing_period_start TIMESTAMPTZ NOT NULL,
    billing_period_end TIMESTAMPTZ NOT NULL,
    
    -- Resource Usage
    api_calls_used BIGINT DEFAULT 0,
    api_calls_limit BIGINT DEFAULT -1, -- -1 for unlimited
    
    storage_used_mb BIGINT DEFAULT 0,
    storage_limit_mb BIGINT DEFAULT -1,
    
    bandwidth_used_mb BIGINT DEFAULT 0,
    bandwidth_limit_mb BIGINT DEFAULT -1,
    
    ai_tokens_used BIGINT DEFAULT 0,
    ai_tokens_limit BIGINT DEFAULT -1,
    
    content_generations_used INTEGER DEFAULT 0,
    content_generations_limit INTEGER DEFAULT -1,
    
    -- Financial Tracking
    current_bill_amount DECIMAL(10,2) DEFAULT 0.00,
    overage_charges DECIMAL(10,2) DEFAULT 0.00,
    
    -- Status Flags
    quota_warning_sent BOOLEAN DEFAULT false,
    quota_exceeded BOOLEAN DEFAULT false,
    is_suspended BOOLEAN DEFAULT false,
    
    -- System Fields
    last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(tenant_id, billing_period_start)
);

-- ====================================================================
-- 3. Usage Analytics Summaries Table
-- ====================================================================
CREATE TABLE IF NOT EXISTS usage_analytics_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Grouping
    tenant_id UUID,
    resource_type VARCHAR(100) NOT NULL,
    summary_period VARCHAR(20) NOT NULL, -- 'hourly', 'daily', 'weekly', 'monthly'
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    
    -- Aggregated Metrics
    total_usage BIGINT NOT NULL,
    peak_usage BIGINT,
    average_usage DECIMAL(15,2),
    unique_users INTEGER,
    unique_endpoints INTEGER,
    
    -- Performance Metrics
    avg_response_time_ms DECIMAL(10,2),
    success_rate DECIMAL(5,2),
    error_count INTEGER,
    
    -- Cost Metrics
    total_cost DECIMAL(10,2),
    cost_per_unit DECIMAL(10,4),
    
    -- System Fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(tenant_id, resource_type, summary_period, period_start)
);

-- ====================================================================
-- 4. Database Functions
-- ====================================================================

-- Function to update current usage
CREATE OR REPLACE FUNCTION update_tenant_current_usage(
    p_tenant_id UUID,
    p_resource_type VARCHAR(100),
    p_quantity BIGINT,
    p_billing_tier VARCHAR(50) DEFAULT 'free'
) RETURNS void AS $$
DECLARE
    v_current_period_start TIMESTAMPTZ;
    v_current_period_end TIMESTAMPTZ;
BEGIN
    -- Calculate current billing period (monthly)
    v_current_period_start := DATE_TRUNC('month', NOW());
    v_current_period_end := DATE_TRUNC('month', NOW() + INTERVAL '1 month');
    
    -- Insert or update current usage
    INSERT INTO tenant_current_usage (
        tenant_id, billing_period_start, billing_period_end,
        api_calls_used, storage_used_mb, bandwidth_used_mb, 
        ai_tokens_used, content_generations_used
    ) VALUES (
        p_tenant_id, v_current_period_start, v_current_period_end,
        CASE WHEN p_resource_type = 'api_calls' THEN p_quantity ELSE 0 END,
        CASE WHEN p_resource_type = 'storage' THEN p_quantity ELSE 0 END,
        CASE WHEN p_resource_type = 'bandwidth' THEN p_quantity ELSE 0 END,
        CASE WHEN p_resource_type = 'ai_tokens' THEN p_quantity ELSE 0 END,
        CASE WHEN p_resource_type = 'content_generations' THEN p_quantity ELSE 0 END
    )
    ON CONFLICT (tenant_id, billing_period_start) DO UPDATE SET
        api_calls_used = tenant_current_usage.api_calls_used + 
            CASE WHEN p_resource_type = 'api_calls' THEN p_quantity ELSE 0 END,
        storage_used_mb = tenant_current_usage.storage_used_mb + 
            CASE WHEN p_resource_type = 'storage' THEN p_quantity ELSE 0 END,
        bandwidth_used_mb = tenant_current_usage.bandwidth_used_mb + 
            CASE WHEN p_resource_type = 'bandwidth' THEN p_quantity ELSE 0 END,
        ai_tokens_used = tenant_current_usage.ai_tokens_used + 
            CASE WHEN p_resource_type = 'ai_tokens' THEN p_quantity ELSE 0 END,
        content_generations_used = tenant_current_usage.content_generations_used + 
            CASE WHEN p_resource_type = 'content_generations' THEN p_quantity ELSE 0 END,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to check quota limits
CREATE OR REPLACE FUNCTION check_quota_limit(
    p_tenant_id UUID,
    p_resource_type VARCHAR(100),
    p_billing_tier VARCHAR(50) DEFAULT 'free'
) RETURNS JSONB AS $$
DECLARE
    v_current_usage BIGINT;
    v_quota_limit BIGINT;
    v_usage_percentage DECIMAL(5,2);
    v_result JSONB;
BEGIN
    -- Get current usage
    SELECT 
        CASE 
            WHEN p_resource_type = 'api_calls' THEN api_calls_used
            WHEN p_resource_type = 'storage' THEN storage_used_mb
            WHEN p_resource_type = 'bandwidth' THEN bandwidth_used_mb
            WHEN p_resource_type = 'ai_tokens' THEN ai_tokens_used
            WHEN p_resource_type = 'content_generations' THEN content_generations_used
            ELSE 0
        END
    INTO v_current_usage
    FROM tenant_current_usage
    WHERE tenant_id = p_tenant_id
        AND billing_period_start = DATE_TRUNC('month', NOW());
    
    -- Get quota limit
    SELECT quota_limit
    INTO v_quota_limit
    FROM usage_quota_definitions
    WHERE billing_tier = p_billing_tier
        AND resource_type = p_resource_type
        AND quota_period = 'monthly'
        AND is_active = true
    LIMIT 1;
    
    -- Calculate usage percentage
    IF v_quota_limit > 0 THEN
        v_usage_percentage := (v_current_usage::DECIMAL / v_quota_limit::DECIMAL) * 100;
    ELSE
        v_usage_percentage := 0;
    END IF;
    
    -- Build result
    v_result := jsonb_build_object(
        'current_usage', COALESCE(v_current_usage, 0),
        'quota_limit', COALESCE(v_quota_limit, -1),
        'usage_percentage', v_usage_percentage,
        'quota_exceeded', v_usage_percentage >= 100,
        'approaching_limit', v_usage_percentage >= 80
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- 5. Indexes
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_tenant_current_usage_tenant_period 
    ON tenant_current_usage(tenant_id, billing_period_start);

CREATE INDEX IF NOT EXISTS idx_usage_analytics_tenant_period 
    ON usage_analytics_summaries(tenant_id, resource_type, period_start);

CREATE INDEX IF NOT EXISTS idx_usage_quota_definitions_lookup
    ON usage_quota_definitions(billing_tier, resource_type, quota_period);

-- ====================================================================
-- 6. Insert Default Usage Quota Definitions (Using INSERT ... WHERE NOT EXISTS)
-- ====================================================================

-- Check and insert Free Tier Quotas
INSERT INTO usage_quota_definitions (
    quota_name, billing_tier, resource_type, quota_limit, quota_period,
    soft_limit_threshold, allow_overage, overage_rate
)
SELECT 'free_api_calls_monthly', 'free', 'api_calls', 2000, 'monthly', 80.0, false, null
WHERE NOT EXISTS (
    SELECT 1 FROM usage_quota_definitions 
    WHERE quota_name = 'free_api_calls_monthly' AND billing_tier = 'free' AND resource_type = 'api_calls'
);

INSERT INTO usage_quota_definitions (
    quota_name, billing_tier, resource_type, quota_limit, quota_period,
    soft_limit_threshold, allow_overage, overage_rate
)
SELECT 'free_storage_monthly', 'free', 'storage', 100, 'monthly', 80.0, false, null
WHERE NOT EXISTS (
    SELECT 1 FROM usage_quota_definitions 
    WHERE quota_name = 'free_storage_monthly' AND billing_tier = 'free' AND resource_type = 'storage'
);

INSERT INTO usage_quota_definitions (
    quota_name, billing_tier, resource_type, quota_limit, quota_period,
    soft_limit_threshold, allow_overage, overage_rate
)
SELECT 'free_ai_tokens_monthly', 'free', 'ai_tokens', 10000, 'monthly', 80.0, false, null
WHERE NOT EXISTS (
    SELECT 1 FROM usage_quota_definitions 
    WHERE quota_name = 'free_ai_tokens_monthly' AND billing_tier = 'free' AND resource_type = 'ai_tokens'
);

INSERT INTO usage_quota_definitions (
    quota_name, billing_tier, resource_type, quota_limit, quota_period,
    soft_limit_threshold, allow_overage, overage_rate
)
SELECT 'free_content_generations_monthly', 'free', 'content_generations', 20, 'monthly', 80.0, false, null
WHERE NOT EXISTS (
    SELECT 1 FROM usage_quota_definitions 
    WHERE quota_name = 'free_content_generations_monthly' AND billing_tier = 'free' AND resource_type = 'content_generations'
);

-- Check and insert Basic Tier Quotas
INSERT INTO usage_quota_definitions (
    quota_name, billing_tier, resource_type, quota_limit, quota_period,
    soft_limit_threshold, allow_overage, overage_rate
)
SELECT 'basic_api_calls_monthly', 'basic', 'api_calls', 20000, 'monthly', 80.0, true, 0.001
WHERE NOT EXISTS (
    SELECT 1 FROM usage_quota_definitions 
    WHERE quota_name = 'basic_api_calls_monthly' AND billing_tier = 'basic' AND resource_type = 'api_calls'
);

INSERT INTO usage_quota_definitions (
    quota_name, billing_tier, resource_type, quota_limit, quota_period,
    soft_limit_threshold, allow_overage, overage_rate
)
SELECT 'basic_storage_monthly', 'basic', 'storage', 1000, 'monthly', 80.0, true, 0.10
WHERE NOT EXISTS (
    SELECT 1 FROM usage_quota_definitions 
    WHERE quota_name = 'basic_storage_monthly' AND billing_tier = 'basic' AND resource_type = 'storage'
);

INSERT INTO usage_quota_definitions (
    quota_name, billing_tier, resource_type, quota_limit, quota_period,
    soft_limit_threshold, allow_overage, overage_rate
)
SELECT 'basic_ai_tokens_monthly', 'basic', 'ai_tokens', 100000, 'monthly', 80.0, true, 0.002
WHERE NOT EXISTS (
    SELECT 1 FROM usage_quota_definitions 
    WHERE quota_name = 'basic_ai_tokens_monthly' AND billing_tier = 'basic' AND resource_type = 'ai_tokens'
);

INSERT INTO usage_quota_definitions (
    quota_name, billing_tier, resource_type, quota_limit, quota_period,
    soft_limit_threshold, allow_overage, overage_rate
)
SELECT 'basic_content_generations_monthly', 'basic', 'content_generations', 200, 'monthly', 80.0, true, 0.50
WHERE NOT EXISTS (
    SELECT 1 FROM usage_quota_definitions 
    WHERE quota_name = 'basic_content_generations_monthly' AND billing_tier = 'basic' AND resource_type = 'content_generations'
);

-- Check and insert Premium Tier Quotas
INSERT INTO usage_quota_definitions (
    quota_name, billing_tier, resource_type, quota_limit, quota_period,
    soft_limit_threshold, allow_overage, overage_rate
)
SELECT 'premium_api_calls_monthly', 'premium', 'api_calls', 100000, 'monthly', 80.0, true, 0.0005
WHERE NOT EXISTS (
    SELECT 1 FROM usage_quota_definitions 
    WHERE quota_name = 'premium_api_calls_monthly' AND billing_tier = 'premium' AND resource_type = 'api_calls'
);

INSERT INTO usage_quota_definitions (
    quota_name, billing_tier, resource_type, quota_limit, quota_period,
    soft_limit_threshold, allow_overage, overage_rate
)
SELECT 'premium_storage_monthly', 'premium', 'storage', 10000, 'monthly', 80.0, true, 0.08
WHERE NOT EXISTS (
    SELECT 1 FROM usage_quota_definitions 
    WHERE quota_name = 'premium_storage_monthly' AND billing_tier = 'premium' AND resource_type = 'storage'
);

INSERT INTO usage_quota_definitions (
    quota_name, billing_tier, resource_type, quota_limit, quota_period,
    soft_limit_threshold, allow_overage, overage_rate
)
SELECT 'premium_ai_tokens_monthly', 'premium', 'ai_tokens', 500000, 'monthly', 80.0, true, 0.0015
WHERE NOT EXISTS (
    SELECT 1 FROM usage_quota_definitions 
    WHERE quota_name = 'premium_ai_tokens_monthly' AND billing_tier = 'premium' AND resource_type = 'ai_tokens'
);

INSERT INTO usage_quota_definitions (
    quota_name, billing_tier, resource_type, quota_limit, quota_period,
    soft_limit_threshold, allow_overage, overage_rate
)
SELECT 'premium_content_generations_monthly', 'premium', 'content_generations', 1000, 'monthly', 80.0, true, 0.30
WHERE NOT EXISTS (
    SELECT 1 FROM usage_quota_definitions 
    WHERE quota_name = 'premium_content_generations_monthly' AND billing_tier = 'premium' AND resource_type = 'content_generations'
); 