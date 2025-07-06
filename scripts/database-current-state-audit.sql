-- ====================================================================
-- SIMPLE DATABASE AUDIT - GUARANTEED TO WORK
-- Run each section separately in Supabase SQL Editor
-- ====================================================================

-- 1. SHOW ALL CURRENT TABLES
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. COUNT ROWS IN EACH TABLE (run after seeing table list)
SELECT 
    'content_posts' as table_name,
    COUNT(*) as row_count
FROM content_posts
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'content_posts' AND table_schema = 'public');

-- 3. CHECK WHICH KEY TABLES EXIST
SELECT 
    'content_posts' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'content_posts' AND table_schema = 'public') 
         THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'social_accounts',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'social_accounts' AND table_schema = 'public') 
         THEN 'EXISTS' ELSE 'MISSING' END
UNION ALL
SELECT 
    'content_calendar',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'content_calendar' AND table_schema = 'public') 
         THEN 'EXISTS' ELSE 'MISSING' END
UNION ALL
SELECT 
    'content_analytics',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'content_analytics' AND table_schema = 'public') 
         THEN 'EXISTS' ELSE 'MISSING' END
UNION ALL
SELECT 
    'workflow_executions',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workflow_executions' AND table_schema = 'public') 
         THEN 'EXISTS' ELSE 'MISSING' END
UNION ALL
SELECT 
    'products',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products' AND table_schema = 'public') 
         THEN 'EXISTS' ELSE 'MISSING' END
ORDER BY status DESC, table_name;

-- 4. SHOW TABLE COLUMNS FOR EXISTING TABLES
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 5. CHECK FOR VIEWS
SELECT 
    table_name as view_name
FROM information_schema.views 
WHERE table_schema = 'public';

-- 6. CHECK FOR FUNCTIONS
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public';

-- 7. CHECK RLS STATUS
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public';

-- 8. CHECK DATABASE SIZE
SELECT pg_size_pretty(pg_database_size(current_database())) as database_size; 