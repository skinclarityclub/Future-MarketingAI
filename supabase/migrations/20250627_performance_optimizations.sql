-- =====================================================================================
-- Performance Optimization Migration
-- File: 20250627_performance_optimizations.sql
-- Purpose: Add indexes and optimizations for slow API endpoints
-- Created: 2025-06-27
-- =====================================================================================

-- =====================================================================================
-- API CREDENTIALS PERFORMANCE INDEXES
-- =====================================================================================

-- Composite index for provider + credential lookups (speeds up JOIN queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_credentials_provider_credential 
ON api_credentials(provider_id, credential_id);

-- Index for status filtering (commonly used in health checks)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_credentials_status_required 
ON api_credentials(status, is_required);

-- Composite index for provider status queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_providers_active_priority 
ON api_providers(is_active, priority);

-- =====================================================================================
-- TRACKING EVENTS PERFORMANCE INDEXES  
-- =====================================================================================

-- Composite index for session + timestamp queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_events_session_timestamp 
ON user_events(session_id, timestamp DESC);

-- Index for event type filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_events_type_timestamp 
ON user_events(event_type, timestamp DESC);

-- Partial index for active sessions only
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_events_active_sessions 
ON user_events(session_id, timestamp DESC) 
WHERE session_id IS NOT NULL;

-- =====================================================================================
-- MATERIALIZED VIEWS FOR COMMON QUERIES
-- =====================================================================================

-- Materialized view for credentials health summary
CREATE MATERIALIZED VIEW IF NOT EXISTS credentials_health_summary AS
SELECT 
    COUNT(*) as total_providers,
    COUNT(*) FILTER (WHERE is_active = true) as active_providers,
    COUNT(ac.provider_id) as total_credentials,
    COUNT(ac.provider_id) FILTER (WHERE ac.status = 'configured' AND ac.is_required = true) as configured_required,
    COUNT(ac.provider_id) FILTER (WHERE ac.status = 'missing' AND ac.is_required = true) as missing_required,
    ROUND(
        (COUNT(ac.provider_id) FILTER (WHERE ac.status = 'configured' AND ac.is_required = true)::float / 
         NULLIF(COUNT(ac.provider_id) FILTER (WHERE ac.is_required = true), 0)) * 100, 
        2
    ) as health_score_percent
FROM api_providers ap
LEFT JOIN api_credentials ac ON ap.id = ac.provider_id;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_credentials_health_summary_unique 
ON credentials_health_summary((1));

-- =====================================================================================
-- AUTOMATIC MATERIALIZED VIEW REFRESH
-- =====================================================================================

-- Function to refresh credentials health summary
CREATE OR REPLACE FUNCTION refresh_credentials_health_summary()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY credentials_health_summary;
END;
$$ LANGUAGE plpgsql;

-- Trigger to refresh when credentials are updated
CREATE OR REPLACE FUNCTION trigger_refresh_credentials_health()
RETURNS trigger AS $$
BEGIN
    -- Refresh in background to avoid blocking the main query
    PERFORM pg_notify('refresh_credentials_health', '');
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_refresh_credentials_on_update') THEN
        CREATE TRIGGER trigger_refresh_credentials_on_update
            AFTER INSERT OR UPDATE OR DELETE ON api_credentials
            FOR EACH STATEMENT
            EXECUTE FUNCTION trigger_refresh_credentials_health();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_refresh_providers_on_update') THEN
        CREATE TRIGGER trigger_refresh_providers_on_update
            AFTER INSERT OR UPDATE OR DELETE ON api_providers
            FOR EACH STATEMENT
            EXECUTE FUNCTION trigger_refresh_credentials_health();
    END IF;
END $$;

-- =====================================================================================
-- QUERY OPTIMIZATION FUNCTIONS
-- =====================================================================================

-- Optimized function to get provider with credentials in single query
CREATE OR REPLACE FUNCTION get_provider_with_credentials(p_provider_id TEXT)
RETURNS TABLE (
    provider_id TEXT,
    provider_name TEXT,
    provider_category TEXT,
    provider_description TEXT,
    is_active BOOLEAN,
    priority TEXT,
    credential_id TEXT,
    credential_name TEXT,
    credential_type TEXT,
    credential_status TEXT,
    is_required BOOLEAN,
    encrypted_value TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ap.id,
        ap.name,
        ap.category,
        ap.description,
        ap.is_active,
        ap.priority,
        ac.credential_id,
        ac.name,
        ac.credential_type,
        ac.status,
        ac.is_required,
        ac.encrypted_value
    FROM api_providers ap
    LEFT JOIN api_credentials ac ON ap.id = ac.provider_id
    WHERE ap.id = p_provider_id
    ORDER BY ac.credential_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================================
-- PERFORMANCE MONITORING
-- =====================================================================================

-- Table for tracking slow queries
CREATE TABLE IF NOT EXISTS query_performance_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_name TEXT NOT NULL,
    execution_time_ms INTEGER NOT NULL,
    table_name TEXT,
    parameters JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance monitoring
CREATE INDEX IF NOT EXISTS idx_query_performance_log_timestamp 
ON query_performance_log(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_query_performance_log_slow_queries 
ON query_performance_log(execution_time_ms DESC) 
WHERE execution_time_ms > 1000;

-- =====================================================================================
-- CLEANUP AND MAINTENANCE
-- =====================================================================================

-- Function to clean old performance logs
CREATE OR REPLACE FUNCTION cleanup_old_performance_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM query_performance_log 
    WHERE timestamp < NOW() - INTERVAL '7 days';
    
    DELETE FROM credential_usage_logs 
    WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- =====================================================================================
-- VERIFY OPTIMIZATIONS
-- =====================================================================================

SELECT 'Performance optimization migration completed successfully' as status;

-- Show created indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE indexname LIKE 'idx_%credentials%' 
   OR indexname LIKE 'idx_%events%'
ORDER BY tablename, indexname; 