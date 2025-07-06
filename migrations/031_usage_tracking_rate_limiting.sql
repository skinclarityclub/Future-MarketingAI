-- ====================================================================
-- Usage Tracking and API Rate Limiting Schema
-- Task 36.3: Monitor and control resource consumption per tenant
-- ====================================================================

-- ====================================================================
-- 1. Tenant Usage Tracking Table
-- ====================================================================
CREATE TABLE IF NOT EXISTS tenant_usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    
    -- Resource Tracking
    resource_type VARCHAR(100) NOT NULL, -- 'api_calls', 'storage', 'bandwidth', 'ai_tokens', 'content_generations'
    resource_category VARCHAR(100), -- 'marketing_machine', 'bi_dashboard', 'analytics', 'ai_assistant'
    
    -- Usage Metrics
    quantity_used BIGINT NOT NULL DEFAULT 0,
    unit_type VARCHAR(50) NOT NULL, -- 'requests', 'mb', 'tokens', 'generations', 'executions'
    
    -- Temporal Data
    usage_period VARCHAR(20) NOT NULL, -- 'hourly', 'daily', 'monthly', 'real_time'
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    
    -- Metadata
    endpoint_path VARCHAR(500),
    request_method VARCHAR(10),
    response_status INTEGER,
    processing_time_ms INTEGER,
    
    -- Cost Tracking
    cost_per_unit DECIMAL(10,4),
    total_cost DECIMAL(10,2),
    billing_tier VARCHAR(50), -- 'free', 'basic', 'premium', 'enterprise'
    
    -- System Fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 2. API Rate Limiting Rules Table
-- ====================================================================
CREATE TABLE IF NOT EXISTS api_rate_limiting_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Rule Identification
    rule_name VARCHAR(200) NOT NULL UNIQUE,
    rule_description TEXT,
    
    -- Scope
    tenant_id UUID, -- NULL for global rules
    billing_tier VARCHAR(50), -- 'free', 'basic', 'premium', 'enterprise'
    endpoint_pattern VARCHAR(500) NOT NULL, -- Regex pattern for API endpoints
    http_methods VARCHAR(100)[], -- ['GET', 'POST', 'PUT', 'DELETE']
    
    -- Rate Limit Configuration
    max_requests INTEGER NOT NULL,
    time_window_seconds INTEGER NOT NULL,
    burst_allowance INTEGER DEFAULT 0, -- Extra requests allowed in burst
    
    -- Advanced Settings
    rate_limit_type VARCHAR(50) DEFAULT 'fixed', -- 'fixed', 'sliding', 'token_bucket'
    priority_level INTEGER DEFAULT 1, -- 1=highest, 10=lowest
    enable_queuing BOOLEAN DEFAULT false,
    queue_timeout_seconds INTEGER DEFAULT 30,
    
    -- Response Configuration
    block_action VARCHAR(50) DEFAULT 'reject', -- 'reject', 'queue', 'throttle'
    retry_after_seconds INTEGER DEFAULT 60,
    custom_error_message TEXT,
    
    -- Monitoring
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 3. Rate Limit Tracking Table (Real-time counters)
-- ====================================================================
CREATE TABLE IF NOT EXISTS rate_limit_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identification
    rule_id UUID REFERENCES api_rate_limiting_rules(id),
    tenant_id UUID,
    user_id UUID REFERENCES auth.users(id),
    client_ip INET,
    identifier_key VARCHAR(500) NOT NULL, -- Composite key for tracking
    
    -- Rate Limit State
    current_count INTEGER NOT NULL DEFAULT 0,
    window_start TIMESTAMPTZ NOT NULL,
    window_end TIMESTAMPTZ NOT NULL,
    burst_tokens_used INTEGER DEFAULT 0,
    
    -- Request Details
    last_request_at TIMESTAMPTZ DEFAULT NOW(),
    endpoint_path VARCHAR(500),
    request_method VARCHAR(10),
    
    -- Status
    is_blocked BOOLEAN DEFAULT false,
    blocked_until TIMESTAMPTZ,
    violation_count INTEGER DEFAULT 0,
    
    -- System Fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 4. Usage Quota Definitions Table
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
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 5. Tenant Current Usage Status (Materialized View)
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
-- 6. Usage Analytics Summaries (Pre-aggregated for performance)
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
-- Indexes for Performance
-- ====================================================================

-- Usage Tracking Indexes
CREATE INDEX IF NOT EXISTS idx_tenant_usage_tracking_tenant_period 
    ON tenant_usage_tracking(tenant_id, resource_type, period_start);
CREATE INDEX IF NOT EXISTS idx_tenant_usage_tracking_period_range 
    ON tenant_usage_tracking(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_tenant_usage_tracking_endpoint 
    ON tenant_usage_tracking(endpoint_path, request_method);

-- Rate Limiting Indexes
CREATE INDEX IF NOT EXISTS idx_rate_limiting_rules_pattern 
    ON api_rate_limiting_rules(endpoint_pattern, billing_tier);
CREATE INDEX IF NOT EXISTS idx_rate_limit_tracking_identifier 
    ON rate_limit_tracking(identifier_key, window_start, window_end);
CREATE INDEX IF NOT EXISTS idx_rate_limit_tracking_tenant 
    ON rate_limit_tracking(tenant_id, rule_id);

-- Current Usage Indexes
CREATE INDEX IF NOT EXISTS idx_tenant_current_usage_tenant_period 
    ON tenant_current_usage(tenant_id, billing_period_start);

-- Analytics Indexes
CREATE INDEX IF NOT EXISTS idx_usage_analytics_tenant_period 
    ON usage_analytics_summaries(tenant_id, resource_type, period_start);

-- ====================================================================
-- Default Rate Limiting Rules
-- ====================================================================

INSERT INTO api_rate_limiting_rules (
    rule_name, rule_description, billing_tier, endpoint_pattern, http_methods,
    max_requests, time_window_seconds, priority_level
) VALUES
-- Free Tier Limits
('free_tier_api_general', 'General API limits for free tier', 'free', '/api/.*', ARRAY['GET', 'POST', 'PUT', 'DELETE'], 100, 3600, 1),
('free_tier_ai_assistant', 'AI Assistant limits for free tier', 'free', '/api/assistant/.*', ARRAY['POST'], 10, 3600, 1),
('free_tier_content_generation', 'Content generation limits for free tier', 'free', '/api/content/.*', ARRAY['POST'], 5, 86400, 1),

-- Basic Tier Limits
('basic_tier_api_general', 'General API limits for basic tier', 'basic', '/api/.*', ARRAY['GET', 'POST', 'PUT', 'DELETE'], 1000, 3600, 1),
('basic_tier_ai_assistant', 'AI Assistant limits for basic tier', 'basic', '/api/assistant/.*', ARRAY['POST'], 50, 3600, 1),
('basic_tier_content_generation', 'Content generation limits for basic tier', 'basic', '/api/content/.*', ARRAY['POST'], 25, 86400, 1),

-- Premium Tier Limits
('premium_tier_api_general', 'General API limits for premium tier', 'premium', '/api/.*', ARRAY['GET', 'POST', 'PUT', 'DELETE'], 5000, 3600, 1),
('premium_tier_ai_assistant', 'AI Assistant limits for premium tier', 'premium', '/api/assistant/.*', ARRAY['POST'], 200, 3600, 1),
('premium_tier_content_generation', 'Content generation limits for premium tier', 'premium', '/api/content/.*', ARRAY['POST'], 100, 86400, 1),

-- Enterprise Tier Limits (Higher limits)
('enterprise_tier_api_general', 'General API limits for enterprise tier', 'enterprise', '/api/.*', ARRAY['GET', 'POST', 'PUT', 'DELETE'], 20000, 3600, 1),
('enterprise_tier_ai_assistant', 'AI Assistant limits for enterprise tier', 'enterprise', '/api/assistant/.*', ARRAY['POST'], 1000, 3600, 1),
('enterprise_tier_content_generation', 'Content generation limits for enterprise tier', 'enterprise', '/api/content/.*', ARRAY['POST'], 500, 86400, 1)

ON CONFLICT (rule_name) DO NOTHING;

-- ====================================================================
-- Default Usage Quota Definitions
-- ====================================================================

INSERT INTO usage_quota_definitions (
    quota_name, billing_tier, resource_type, quota_limit, quota_period,
    soft_limit_threshold, allow_overage, overage_rate
) VALUES
-- Free Tier Quotas
('free_api_calls_monthly', 'free', 'api_calls', 2000, 'monthly', 80.0, false, null),
('free_storage_monthly', 'free', 'storage', 100, 'monthly', 80.0, false, null), -- 100MB
('free_ai_tokens_monthly', 'free', 'ai_tokens', 10000, 'monthly', 80.0, false, null),
('free_content_generations_monthly', 'free', 'content_generations', 20, 'monthly', 80.0, false, null),

-- Basic Tier Quotas
('basic_api_calls_monthly', 'basic', 'api_calls', 20000, 'monthly', 80.0, true, 0.001),
('basic_storage_monthly', 'basic', 'storage', 1000, 'monthly', 80.0, true, 0.10), -- 1GB
('basic_ai_tokens_monthly', 'basic', 'ai_tokens', 100000, 'monthly', 80.0, true, 0.002),
('basic_content_generations_monthly', 'basic', 'content_generations', 200, 'monthly', 80.0, true, 0.50),

-- Premium Tier Quotas
('premium_api_calls_monthly', 'premium', 'api_calls', 100000, 'monthly', 80.0, true, 0.0005),
('premium_storage_monthly', 'premium', 'storage', 10000, 'monthly', 80.0, true, 0.08), -- 10GB
('premium_ai_tokens_monthly', 'premium', 'ai_tokens', 500000, 'monthly', 80.0, true, 0.0015),
('premium_content_generations_monthly', 'premium', 'content_generations', 1000, 'monthly', 80.0, true, 0.30),

-- Enterprise Tier Quotas (High limits)
('enterprise_api_calls_monthly', 'enterprise', 'api_calls', 1000000, 'monthly', 90.0, true, 0.0002),
('enterprise_storage_monthly', 'enterprise', 'storage', 100000, 'monthly', 90.0, true, 0.05), -- 100GB
('enterprise_ai_tokens_monthly', 'enterprise', 'ai_tokens', 5000000, 'monthly', 90.0, true, 0.001),
('enterprise_content_generations_monthly', 'enterprise', 'content_generations', 10000, 'monthly', 90.0, true, 0.20)

ON CONFLICT (quota_name, billing_tier, resource_type) DO NOTHING;

-- ====================================================================
-- Functions for Usage Tracking
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
-- Triggers for automatic tracking
-- ====================================================================

-- Trigger to update summaries when usage is tracked
CREATE OR REPLACE FUNCTION update_usage_analytics_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert or update daily summary
    INSERT INTO usage_analytics_summaries (
        tenant_id, resource_type, summary_period,
        period_start, period_end, total_usage, unique_users, total_cost
    ) VALUES (
        NEW.tenant_id, NEW.resource_type, 'daily',
        DATE_TRUNC('day', NEW.period_start),
        DATE_TRUNC('day', NEW.period_start) + INTERVAL '1 day',
        NEW.quantity_used, 1, COALESCE(NEW.total_cost, 0)
    )
    ON CONFLICT (tenant_id, resource_type, summary_period, period_start) DO UPDATE SET
        total_usage = usage_analytics_summaries.total_usage + NEW.quantity_used,
        total_cost = usage_analytics_summaries.total_cost + COALESCE(NEW.total_cost, 0);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_usage_analytics
    AFTER INSERT ON tenant_usage_tracking
    FOR EACH ROW
    EXECUTE FUNCTION update_usage_analytics_trigger(); 