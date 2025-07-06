-- ====================================================================
-- COMPLETE DATABASE INSPECTION REPORT (FIXED)
-- This script shows your entire database structure and verifies completeness
-- ====================================================================

-- 1. Show all available schemas
SELECT '1. DATABASE SCHEMAS' as report_section, 
       schema_name as name, 
       'Schema' as type
FROM information_schema.schemata 
WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
ORDER BY schema_name;

-- 2. Show all tables 
SELECT '2. ALL TABLES' as report_section,
       table_name as name,
       'Table' as type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 3. Check for Enterprise Content Analytics Tables specifically
SELECT '3. ENTERPRISE CONTENT TABLES' as report_section,
       table_name as name,
       CASE 
           WHEN table_name IN ('content_posts', 'social_accounts', 'content_calendar', 
                              'content_analytics', 'content_research', 'learning_patterns') 
           THEN '✅ REQUIRED'
           ELSE '📋 OTHER'
       END as type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND (table_name LIKE '%content%' 
       OR table_name LIKE '%social%'
       OR table_name LIKE '%learning%')
ORDER BY 
    CASE 
        WHEN table_name IN ('content_posts', 'social_accounts', 'content_calendar', 
                           'content_analytics', 'content_research', 'learning_patterns') THEN 1
        ELSE 2
    END,
    table_name;

-- 4. Check essential columns in content_posts
SELECT '4. CONTENT_POSTS COLUMNS' as report_section,
       column_name as name,
       data_type || 
       CASE 
           WHEN column_name IN ('status', 'campaign_id', 'author_id', 'content_type', 
                               'scheduled_date', 'published_at', 'target_platforms', 
                               'performance_score', 'total_engagement', 'organization_id') 
           THEN ' ✅'
           ELSE ''
       END as type
FROM information_schema.columns 
WHERE table_name = 'content_posts' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Check essential columns in social_accounts
SELECT '5. SOCIAL_ACCOUNTS COLUMNS' as report_section,
       column_name as name,
       data_type || 
       CASE 
           WHEN column_name IN ('status', 'platform', 'user_id', 'account_name', 
                               'followers_count', 'engagement_rate', 'organization_id') 
           THEN ' ✅'
           ELSE ''
       END as type
FROM information_schema.columns 
WHERE table_name = 'social_accounts' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Check essential columns in content_calendar
SELECT '6. CONTENT_CALENDAR COLUMNS' as report_section,
       column_name as name,
       data_type || 
       CASE 
           WHEN column_name IN ('status', 'calendar_date', 'content_type', 'target_platforms', 
                               'campaign_id', 'assigned_to', 'organization_id') 
           THEN ' ✅'
           ELSE ''
       END as type
FROM information_schema.columns 
WHERE table_name = 'content_calendar' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. Show indexes for content tables
SELECT '7. CONTENT TABLE INDEXES' as report_section,
       indexname as name,
       tablename as type
FROM pg_indexes 
WHERE schemaname = 'public'
  AND (tablename LIKE '%content%' OR tablename LIKE '%social%' OR tablename LIKE '%learning%')
ORDER BY tablename, indexname;

-- 8. Show foreign key relationships
SELECT '8. FOREIGN KEY RELATIONSHIPS' as report_section,
       tc.table_name || '.' || kcu.column_name as name,
       'REFS ' || ccu.table_name || '.' || ccu.column_name as type
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
  AND (tc.table_name LIKE '%content%' OR tc.table_name LIKE '%social%' OR tc.table_name LIKE '%learning%')
ORDER BY tc.table_name, kcu.column_name;

-- 9. Show check constraints
SELECT '9. CHECK CONSTRAINTS' as report_section,
       tc.table_name as name,
       tc.constraint_name as type
FROM information_schema.table_constraints tc
WHERE tc.constraint_type = 'CHECK' 
  AND tc.table_schema = 'public'
  AND (tc.table_name LIKE '%content%' OR tc.table_name LIKE '%social%' OR tc.table_name LIKE '%learning%')
ORDER BY tc.table_name;

-- 10. Show all views
SELECT '10. DATABASE VIEWS' as report_section,
       table_name as name,
       'VIEW' as type
FROM information_schema.views 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 11. Show RLS status
SELECT '11. ROW LEVEL SECURITY' as report_section,
       tablename as name,
       CASE 
           WHEN rowsecurity THEN '✅ ENABLED'
           ELSE '❌ DISABLED'
       END as type
FROM pg_tables 
WHERE schemaname = 'public'
  AND (tablename LIKE '%content%' OR tablename LIKE '%social%' OR tablename LIKE '%learning%')
ORDER BY tablename;

-- 12. Verification Summary - Required Tables
SELECT '12. VERIFICATION - TABLES' as report_section,
       'Required Tables Present' as name,
       COUNT(*)::text || '/6' as type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('content_posts', 'social_accounts', 'content_calendar', 
                     'content_analytics', 'content_research', 'learning_patterns');

-- 13. Verification Summary - Essential Columns in content_posts
SELECT '13. VERIFICATION - CONTENT_POSTS' as report_section,
       'Essential Columns Present' as name,
       COUNT(*)::text || '/10' as type
FROM information_schema.columns 
WHERE table_name = 'content_posts' 
  AND table_schema = 'public'
  AND column_name IN ('status', 'campaign_id', 'author_id', 'content_type', 
                      'scheduled_date', 'published_at', 'target_platforms', 
                      'performance_score', 'total_engagement', 'organization_id');

-- 14. Verification Summary - Essential Columns in social_accounts
SELECT '14. VERIFICATION - SOCIAL_ACCOUNTS' as report_section,
       'Essential Columns Present' as name,
       COUNT(*)::text || '/7' as type
FROM information_schema.columns 
WHERE table_name = 'social_accounts' 
  AND table_schema = 'public'
  AND column_name IN ('status', 'platform', 'user_id', 'account_name', 
                      'followers_count', 'engagement_rate', 'organization_id');

-- 15. Verification Summary - Essential Columns in content_calendar
SELECT '15. VERIFICATION - CONTENT_CALENDAR' as report_section,
       'Essential Columns Present' as name,
       COUNT(*)::text || '/7' as type
FROM information_schema.columns 
WHERE table_name = 'content_calendar' 
  AND table_schema = 'public'
  AND column_name IN ('status', 'calendar_date', 'content_type', 'target_platforms', 
                      'campaign_id', 'assigned_to', 'organization_id');

-- 16. Final Status Check
SELECT '16. FINAL STATUS' as report_section,
       'Database Completeness' as name,
       CASE 
           WHEN EXISTS (
               SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' 
                 AND table_name = 'content_posts'
           ) AND EXISTS (
               SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'content_posts' 
                 AND table_schema = 'public'
                 AND column_name = 'status'
           )
           THEN '🎉 READY!'
           ELSE '⚠️ INCOMPLETE'
       END as type; 