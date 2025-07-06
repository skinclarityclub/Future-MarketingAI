-- =====================================================================================
-- SUPABASE QUICK PERFORMANCE FIX
-- Copy and paste this directly into Supabase SQL Editor
-- =====================================================================================

-- Check existing tables first
SELECT 'Existing tables:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Add basic indexes for better performance
-- (These will only be created if the tables exist)

-- 1. Indexes for api_credentials table
CREATE INDEX IF NOT EXISTS idx_api_credentials_provider_id 
ON api_credentials(provider_id) 
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'api_credentials');

CREATE INDEX IF NOT EXISTS idx_api_credentials_status 
ON api_credentials(status)
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'api_credentials');

-- 2. Indexes for api_providers table  
CREATE INDEX IF NOT EXISTS idx_api_providers_is_active 
ON api_providers(is_active)
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'api_providers');

-- 3. Indexes for user_events table (for tracking performance)
CREATE INDEX IF NOT EXISTS idx_user_events_session_id 
ON user_events(session_id)
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_events');

CREATE INDEX IF NOT EXISTS idx_user_events_timestamp 
ON user_events(timestamp)
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_events');

-- 4. Create a simple performance monitoring table
CREATE TABLE IF NOT EXISTS performance_monitor (
    id SERIAL PRIMARY KEY,
    api_name TEXT NOT NULL,
    response_time_ms INTEGER NOT NULL,
    status TEXT DEFAULT 'success',
    created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Add index for performance monitoring
CREATE INDEX IF NOT EXISTS idx_performance_monitor_created_at 
ON performance_monitor(created_at DESC);

-- Show what indexes were created
SELECT 'Created indexes:' as info;
SELECT 
    tablename,
    indexname
FROM pg_indexes 
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Success message
SELECT '✅ Performance optimizations applied successfully!' as result; 