-- Fix Function Overloading Issue
-- Run this script in Supabase SQL Editor to resolve the check_quota_limit function conflict

-- ====================================================================
-- Drop existing conflicting functions
-- ====================================================================
DROP FUNCTION IF EXISTS public.check_quota_limit(p_billing_tier character varying, p_resource_type character varying, p_tenant_id uuid);
DROP FUNCTION IF EXISTS public.check_quota_limit(p_tenant_id uuid, p_resource_type character varying, p_billing_tier character varying);
DROP FUNCTION IF EXISTS public.check_quota_limit(uuid, varchar, varchar);

-- ====================================================================
-- Create single, consistent function definition
-- ====================================================================
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
-- Verify function exists and works
-- ====================================================================
SELECT 'Function check_quota_limit created successfully' as status; 