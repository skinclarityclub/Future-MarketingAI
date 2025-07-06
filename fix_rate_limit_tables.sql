-- Fix Rate Limit Tracking Tables
-- Run this script directly in Supabase SQL Editor

-- ====================================================================
-- 1. API Rate Limiting Rules Table
-- ====================================================================
CREATE TABLE IF NOT EXISTS api_rate_limiting_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Rule Identification
    rule_name VARCHAR(200) NOT NULL UNIQUE,
    rule_description TEXT,
    
    -- Scope
    tenant_id UUID,
    billing_tier VARCHAR(50),
    endpoint_pattern VARCHAR(500) NOT NULL,
    http_methods VARCHAR(100)[],
    
    -- Rate Limit Configuration
    max_requests INTEGER NOT NULL,
    time_window_seconds INTEGER NOT NULL,
    burst_allowance INTEGER DEFAULT 0,
    
    -- Advanced Settings
    rate_limit_type VARCHAR(50) DEFAULT 'fixed',
    priority_level INTEGER DEFAULT 1,
    enable_queuing BOOLEAN DEFAULT false,
    queue_timeout_seconds INTEGER DEFAULT 30,
    
    -- Response Configuration
    block_action VARCHAR(50) DEFAULT 'reject',
    retry_after_seconds INTEGER DEFAULT 60,
    custom_error_message TEXT,
    
    -- Monitoring
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 2. Rate Limit Tracking Table
-- ====================================================================
CREATE TABLE IF NOT EXISTS rate_limit_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identification
    rule_id UUID REFERENCES api_rate_limiting_rules(id),
    tenant_id UUID,
    user_id UUID,
    client_ip INET,
    identifier_key VARCHAR(500) NOT NULL,
    
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
    user_id UUID,
    
    -- Resource Tracking
    resource_type VARCHAR(100) NOT NULL,
    resource_category VARCHAR(100),
    
    -- Usage Metrics
    quantity_used BIGINT NOT NULL DEFAULT 0,
    unit_type VARCHAR(50) NOT NULL,
    
    -- Temporal Data
    usage_period VARCHAR(20) NOT NULL,
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
    billing_tier VARCHAR(50),
    
    -- System Fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 4. Indexes
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_rate_limiting_rules_pattern 
    ON api_rate_limiting_rules(endpoint_pattern, billing_tier);

CREATE INDEX IF NOT EXISTS idx_rate_limit_tracking_identifier 
    ON rate_limit_tracking(identifier_key, window_start, window_end);

CREATE INDEX IF NOT EXISTS idx_rate_limit_tracking_tenant 
    ON rate_limit_tracking(tenant_id, rule_id);

CREATE INDEX IF NOT EXISTS idx_tenant_usage_tracking_tenant_period 
    ON tenant_usage_tracking(tenant_id, resource_type, period_start);

-- ====================================================================
-- 5. Default Rate Limiting Rules
-- ====================================================================
INSERT INTO api_rate_limiting_rules (
    rule_name, rule_description, billing_tier, endpoint_pattern, http_methods,
    max_requests, time_window_seconds, priority_level
) VALUES
('free_tier_api_general', 'General API limits for free tier', 'free', '/api/.*', ARRAY['GET', 'POST', 'PUT', 'DELETE'], 100, 3600, 1),
('basic_tier_api_general', 'General API limits for basic tier', 'basic', '/api/.*', ARRAY['GET', 'POST', 'PUT', 'DELETE'], 1000, 3600, 1),
('premium_tier_api_general', 'General API limits for premium tier', 'premium', '/api/.*', ARRAY['GET', 'POST', 'PUT', 'DELETE'], 5000, 3600, 1)
ON CONFLICT (rule_name) DO NOTHING; 