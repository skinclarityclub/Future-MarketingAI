-- Ultra-Safe Data Verification voor Database Seeding (Taak 70)
-- Bekijk samples van de geseedde data met alleen zekere kolommen

-- Toon alle kolommen van elke tabel
SELECT 'content_posts_columns' as table_info, column_name 
FROM information_schema.columns 
WHERE table_name = 'content_posts' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'content_analytics_columns' as table_info, column_name 
FROM information_schema.columns 
WHERE table_name = 'content_analytics' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'social_accounts_columns' as table_info, column_name 
FROM information_schema.columns 
WHERE table_name = 'social_accounts' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'campaigns_columns' as table_info, column_name 
FROM information_schema.columns 
WHERE table_name = 'campaigns' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'workflow_executions_columns' as table_info, column_name 
FROM information_schema.columns 
WHERE table_name = 'workflow_executions' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Ultra-safe samples (alleen id en created_at)
SELECT 'content_posts_sample' as check_type, id, created_at
FROM content_posts ORDER BY created_at DESC LIMIT 3;

SELECT 'content_analytics_sample' as check_type, id, created_at
FROM content_analytics ORDER BY created_at DESC LIMIT 3;

SELECT 'social_accounts_sample' as check_type, id, created_at
FROM social_accounts ORDER BY created_at DESC LIMIT 3;

SELECT 'campaigns_sample' as check_type, id, created_at
FROM campaigns ORDER BY created_at DESC LIMIT 3;

SELECT 'workflow_executions_sample' as check_type, id, created_at
FROM workflow_executions ORDER BY created_at DESC LIMIT 3;

-- Engagement rate ranges
SELECT 
    'ENGAGEMENT_RANGES' as check_type,
    MIN(engagement_rate) as min_engagement,
    MAX(engagement_rate) as max_engagement,
    AVG(engagement_rate) as avg_engagement
FROM content_analytics;

-- Recent data check (voor self-learning)
SELECT 
    'RECENT_DATA_CHECK' as check_type,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as last_7_days,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as last_30_days,
    COUNT(*) as total_posts
FROM content_posts;

-- Basic stats check
SELECT 
    'BASIC_STATS' as check_type,
    'Total Records Seeded' as metric,
    (SELECT COUNT(*) FROM content_posts) + 
    (SELECT COUNT(*) FROM content_analytics) + 
    (SELECT COUNT(*) FROM social_accounts) + 
    (SELECT COUNT(*) FROM campaigns) + 
    (SELECT COUNT(*) FROM workflow_executions) as total_records; 