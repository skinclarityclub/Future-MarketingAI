-- Rate Limit Tracking and Usage Schema
-- Fix for missing rate_limit_tracking table error

-- ====================================================================
-- 1. API Rate Limiting Rules Table
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
-- 2. Rate Limit Tracking Table (Real-time counters)
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
-- 3. Tenant Usage Tracking Table
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
-- Indexes for Performance
-- ====================================================================

-- Rate Limiting Indexes
CREATE INDEX IF NOT EXISTS idx_rate_limiting_rules_pattern 
    ON api_rate_limiting_rules(endpoint_pattern, billing_tier);

CREATE INDEX IF NOT EXISTS idx_rate_limit_tracking_identifier 
    ON rate_limit_tracking(identifier_key, window_start, window_end);

CREATE INDEX IF NOT EXISTS idx_rate_limit_tracking_tenant 
    ON rate_limit_tracking(tenant_id, rule_id);

-- Usage Tracking Indexes
CREATE INDEX IF NOT EXISTS idx_tenant_usage_tracking_tenant_period 
    ON tenant_usage_tracking(tenant_id, resource_type, period_start);

CREATE INDEX IF NOT EXISTS idx_tenant_usage_tracking_period_range 
    ON tenant_usage_tracking(period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_tenant_usage_tracking_endpoint 
    ON tenant_usage_tracking(endpoint_path, request_method);

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