-- ====================================================================
-- COMPLETE DATABASE AUDIT - ONE SCRIPT TO RULE THEM ALL
-- Copy and paste this entire script into Supabase SQL Editor
-- ====================================================================

-- Show current database info
SELECT 'DATABASE INFO' as section, current_database() as database_name, pg_size_pretty(pg_database_size(current_database())) as size;

-- Show all tables with row counts
DO $$
DECLARE
    tbl record;
    sql_text text;
    row_count integer;
BEGIN
    RAISE NOTICE '=== ALL TABLES ===';
    FOR tbl IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
    LOOP
        BEGIN
            sql_text := format('SELECT COUNT(*) FROM %I', tbl.table_name);
            EXECUTE sql_text INTO row_count;
            RAISE NOTICE 'Table: % | Rows: %', tbl.table_name, row_count;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Table: % | Error counting rows: %', tbl.table_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- Check specific tables we need
SELECT 
    table_name,
    CASE 
        WHEN table_name IN (
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        ) THEN 'EXISTS ✅'
        ELSE 'MISSING ❌'
    END as status
FROM (
    VALUES 
        ('content_posts'),
        ('social_accounts'),
        ('content_calendar'),
        ('content_analytics'),
        ('content_research'),
        ('learning_patterns'),
        ('workflow_executions'),
        ('content_performance'),
        ('ml_models'),
        ('learning_insights'),
        ('optimization_recommendations'),
        ('audience_segments'),
        ('products'),
        ('ai_intelligence_sessions'),
        ('content_topics'),
        ('campaigns'),
        ('media_assets'),
        ('blog_posts'),
        ('automation_rules'),
        ('content_templates'),
        ('product_content_mapping'),
        ('campaign_performance'),
        ('webhook_endpoints'),
        ('data_sync_log'),
        ('n8n_workflow_status'),
        ('automated_trigger_rules')
) AS t(table_name)
ORDER BY status DESC, table_name;

-- Show table structures
SELECT 
    t.table_name,
    COUNT(c.column_name) as column_count,
    string_agg(c.column_name || ':' || c.data_type, ', ' ORDER BY c.ordinal_position) as columns
FROM information_schema.tables t
LEFT JOIN information_schema.columns c ON c.table_name = t.table_name AND c.table_schema = 'public'
WHERE t.table_schema = 'public' 
AND t.table_type = 'BASE TABLE'
GROUP BY t.table_name
ORDER BY t.table_name;

-- Show views
SELECT 'VIEWS' as type, table_name as name FROM information_schema.views WHERE table_schema = 'public'
UNION ALL
SELECT 'FUNCTIONS' as type, routine_name as name FROM information_schema.routines WHERE routine_schema = 'public'
ORDER BY type, name;

-- Show RLS status
SELECT 
    'RLS STATUS' as info,
    tablename as table_name,
    CASE WHEN rowsecurity THEN 'ENABLED 🔒' ELSE 'DISABLED 🔓' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY rls_status DESC, tablename;

-- Show foreign keys
SELECT 
    'FOREIGN KEYS' as info,
    tc.table_name as from_table,
    kcu.column_name as from_column,
    ccu.table_name as to_table,
    ccu.column_name as to_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- Show indexes
SELECT 
    'INDEXES' as info,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Show largest tables
SELECT 
    'TABLE SIZES' as info,
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Show extensions
SELECT 'EXTENSIONS' as info, extname as name, extversion as version 
FROM pg_extension 
ORDER BY extname;

-- Final summary
SELECT 
    'AUDIT SUMMARY' as section,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') as total_tables,
    (SELECT COUNT(*) FROM information_schema.views WHERE table_schema = 'public') as total_views,
    (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public') as total_functions,
    pg_size_pretty(pg_database_size(current_database())) as database_size; 