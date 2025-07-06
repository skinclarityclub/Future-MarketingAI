-- =====================================================================================
-- SIMPLE Performance Optimization Migration
-- File: 20250627_performance_simple.sql  
-- Purpose: Step-by-step performance optimizations to avoid syntax errors
-- =====================================================================================

-- STEP 1: Basic indexes for api_credentials table (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'api_credentials') THEN
        -- Index for provider lookups
        CREATE INDEX IF NOT EXISTS idx_api_credentials_provider 
        ON api_credentials(provider_id);
        
        -- Index for status filtering
        CREATE INDEX IF NOT EXISTS idx_api_credentials_status 
        ON api_credentials(status);
        
        RAISE NOTICE 'Added indexes for api_credentials table';
    ELSE
        RAISE NOTICE 'Table api_credentials does not exist, skipping indexes';
    END IF;
END $$;

-- STEP 2: Basic indexes for api_providers table (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'api_providers') THEN
        -- Index for active status
        CREATE INDEX IF NOT EXISTS idx_api_providers_active 
        ON api_providers(is_active);
        
        -- Index for priority  
        CREATE INDEX IF NOT EXISTS idx_api_providers_priority 
        ON api_providers(priority);
        
        RAISE NOTICE 'Added indexes for api_providers table';
    ELSE
        RAISE NOTICE 'Table api_providers does not exist, skipping indexes';
    END IF;
END $$;

-- STEP 3: Basic indexes for user_events table (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_events') THEN
        -- Index for session lookups
        CREATE INDEX IF NOT EXISTS idx_user_events_session 
        ON user_events(session_id);
        
        -- Index for timestamp queries
        CREATE INDEX IF NOT EXISTS idx_user_events_timestamp 
        ON user_events(timestamp DESC);
        
        -- Index for event type filtering
        CREATE INDEX IF NOT EXISTS idx_user_events_type 
        ON user_events(event_type);
        
        RAISE NOTICE 'Added indexes for user_events table';
    ELSE
        RAISE NOTICE 'Table user_events does not exist, skipping indexes';
    END IF;
END $$;

-- STEP 4: Simple performance monitoring table
CREATE TABLE IF NOT EXISTS query_performance_log (
    id SERIAL PRIMARY KEY,
    query_name TEXT NOT NULL,
    execution_time_ms INTEGER NOT NULL,
    table_name TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance monitoring
CREATE INDEX IF NOT EXISTS idx_query_performance_timestamp 
ON query_performance_log(timestamp DESC);

-- STEP 5: Show what indexes were created
SELECT 
    schemaname,
    tablename,
    indexname
FROM pg_indexes 
WHERE indexname LIKE 'idx_%'
  AND (
    tablename IN ('api_credentials', 'api_providers', 'user_events', 'query_performance_log')
  )
ORDER BY tablename, indexname;

-- Success message
SELECT 'Simple performance optimization completed successfully' as status; 