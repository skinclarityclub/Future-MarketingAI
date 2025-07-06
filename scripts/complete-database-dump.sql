-- COMPLETE DATABASE DUMP voor Database Seeding Verificatie (Taak 70)
-- Dit script toont ALLE data uit de core tabellen

-- ========================================
-- CONTENT_POSTS - ALLE DATA
-- ========================================
SELECT 'CONTENT_POSTS_ALL_DATA' as table_name, 
       row_number() OVER (ORDER BY id) as row_num,
       *
FROM content_posts
ORDER BY id;

-- ========================================
-- CONTENT_ANALYTICS - ALLE DATA  
-- ========================================
SELECT 'CONTENT_ANALYTICS_ALL_DATA' as table_name,
       row_number() OVER (ORDER BY id) as row_num,
       *
FROM content_analytics
ORDER BY id;

-- ========================================
-- SOCIAL_ACCOUNTS - ALLE DATA
-- ========================================
SELECT 'SOCIAL_ACCOUNTS_ALL_DATA' as table_name,
       row_number() OVER (ORDER BY id) as row_num,
       *
FROM social_accounts
ORDER BY id;

-- ========================================
-- CAMPAIGNS - ALLE DATA
-- ========================================
SELECT 'CAMPAIGNS_ALL_DATA' as table_name,
       row_number() OVER (ORDER BY id) as row_num,
       *
FROM campaigns
ORDER BY id;

-- ========================================
-- WORKFLOW_EXECUTIONS - ALLE DATA
-- ========================================
SELECT 'WORKFLOW_EXECUTIONS_ALL_DATA' as table_name,
       row_number() OVER (ORDER BY id) as row_num,
       *
FROM workflow_executions
ORDER BY id;

-- ========================================
-- SUMMARY STATISTIEKEN
-- ========================================
SELECT 'SUMMARY_STATS' as info_type,
       'content_posts' as table_name,
       COUNT(*) as total_rows,
       MIN(created_at) as earliest_record,
       MAX(created_at) as latest_record
FROM content_posts
UNION ALL
SELECT 'SUMMARY_STATS' as info_type,
       'content_analytics' as table_name,
       COUNT(*) as total_rows,
       MIN(created_at) as earliest_record,
       MAX(created_at) as latest_record
FROM content_analytics
UNION ALL
SELECT 'SUMMARY_STATS' as info_type,
       'social_accounts' as table_name,
       COUNT(*) as total_rows,
       MIN(created_at) as earliest_record,
       MAX(created_at) as latest_record
FROM social_accounts
UNION ALL
SELECT 'SUMMARY_STATS' as info_type,
       'campaigns' as table_name,
       COUNT(*) as total_rows,
       MIN(created_at) as earliest_record,
       MAX(created_at) as latest_record
FROM campaigns
UNION ALL
SELECT 'SUMMARY_STATS' as info_type,
       'workflow_executions' as table_name,
       COUNT(*) as total_rows,
       MIN(created_at) as earliest_record,
       MAX(created_at) as latest_record
FROM workflow_executions
ORDER BY table_name; 