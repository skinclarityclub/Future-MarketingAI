-- 🔍 SUPABASE DATABASE COMPREHENSIVE ASSESSMENT
-- Voer deze query uit in je Supabase SQL Editor voor volledige database status

WITH 
-- 1. Alle tabellen met basis informatie
tables_info AS (
    SELECT 
        'TABLES' as section,
        t.table_schema || '.' || t.table_name as item_name,
        'Schema: ' || t.table_schema || 
        ' | Columns: ' || COUNT(c.column_name)::text ||
        ' | RLS: ' || CASE WHEN pt.rowsecurity THEN 'ON' ELSE 'OFF' END as details
    FROM information_schema.tables t
    LEFT JOIN information_schema.columns c ON t.table_name = c.table_name AND t.table_schema = c.table_schema
    LEFT JOIN pg_tables pt ON t.table_name = pt.tablename AND t.table_schema = pt.schemaname
    WHERE t.table_schema NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
    GROUP BY t.table_schema, t.table_name, pt.rowsecurity
),

-- 2. Constraints (Primary Keys, Foreign Keys, etc.)
constraints_info AS (
    SELECT 
        'CONSTRAINTS' as section,
        tc.table_schema || '.' || tc.table_name || '.' || tc.constraint_name as item_name,
        tc.constraint_type || ' on ' || kcu.column_name || 
        CASE 
            WHEN tc.constraint_type = 'FOREIGN KEY' THEN 
                ' -> ' || ccu.table_name || '.' || ccu.column_name
            ELSE ''
        END as details
    FROM information_schema.table_constraints tc
    LEFT JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    LEFT JOIN information_schema.constraint_column_usage ccu 
        ON tc.constraint_name = ccu.constraint_name AND tc.table_schema = ccu.table_schema
    WHERE tc.table_schema NOT IN ('information_schema', 'pg_catalog')
),

-- 3. Indexen
indexes_info AS (
    SELECT 
        'INDEXES' as section,
        schemaname || '.' || tablename || '.' || indexname as item_name,
        'Table: ' || tablename || ' | Definition: ' || 
        SUBSTRING(indexdef FROM POSITION('(' IN indexdef)) as details
    FROM pg_indexes 
    WHERE schemaname NOT IN ('information_schema', 'pg_catalog')
),

-- 4. RLS Policies
policies_info AS (
    SELECT 
        'RLS_POLICIES' as section,
        schemaname || '.' || tablename || '.' || policyname as item_name,
        'Command: ' || cmd || ' | Roles: ' || COALESCE(array_to_string(roles, ','), 'ALL') ||
        ' | Permissive: ' || permissive::text as details
    FROM pg_policies
),

-- 5. Triggers
triggers_info AS (
    SELECT 
        'TRIGGERS' as section,
        trigger_schema || '.' || event_object_table || '.' || trigger_name as item_name,
        'Event: ' || event_manipulation || ' | Timing: ' || action_timing ||
        ' | Statement: ' || LEFT(action_statement, 100) || '...' as details
    FROM information_schema.triggers
    WHERE trigger_schema NOT IN ('information_schema', 'pg_catalog')
),

-- 6. Custom Functions
functions_info AS (
    SELECT 
        'FUNCTIONS' as section,
        routine_schema || '.' || routine_name as item_name,
        'Type: ' || routine_type || ' | Returns: ' || COALESCE(data_type, 'void') ||
        ' | Definition: ' || LEFT(COALESCE(routine_definition, 'N/A'), 100) || '...' as details
    FROM information_schema.routines
    WHERE routine_schema NOT IN ('information_schema', 'pg_catalog')
),

-- 7. Tabel groottes
table_sizes AS (
    SELECT 
        'TABLE_SIZES' as section,
        schemaname || '.' || tablename as item_name,
        'Total Size: ' || pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) ||
        ' | Data Size: ' || pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as details
    FROM pg_tables 
    WHERE schemaname NOT IN ('information_schema', 'pg_catalog')
),

-- 8. Supabase Core Tables Check
supabase_tables AS (
    SELECT 
        'SUPABASE_CORE' as section,
        table_check.table_name as item_name,
        CASE 
            WHEN table_check.exists THEN 'EXISTS ✅'
            ELSE 'MISSING ❌'
        END as details
    FROM (
        SELECT 'auth.users' as table_name, 
               EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') as exists
        UNION ALL
        SELECT 'auth.sessions', 
               EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'sessions')
        UNION ALL
        SELECT 'storage.buckets', 
               EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'buckets')
        UNION ALL
        SELECT 'storage.objects', 
               EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'objects')
        UNION ALL
        SELECT 'public.profiles', 
               EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles')
    ) table_check
),

-- 9. Database Configuration
db_config AS (
    SELECT 
        'DB_CONFIG' as section,
        name as item_name,
        'Value: ' || setting || 
        CASE WHEN unit IS NOT NULL THEN ' ' || unit ELSE '' END ||
        ' | ' || short_desc as details
    FROM pg_settings 
    WHERE name IN (
        'max_connections', 'shared_buffers', 'work_mem', 
        'maintenance_work_mem', 'wal_buffers', 'default_statistics_target'
    )
),

-- 10. Database Statistics
db_stats AS (
    SELECT 
        'DB_STATISTICS' as section,
        'Database Activity' as item_name,
        'Connections: ' || numbackends ||
        ' | Commits: ' || xact_commit ||
        ' | Rollbacks: ' || xact_rollback ||
        ' | Reads: ' || blks_read ||
        ' | Cache Hits: ' || blks_hit as details
    FROM pg_stat_database 
    WHERE datname = current_database()
)

-- Combineer alle resultaten
SELECT section, item_name, details
FROM (
    SELECT section, item_name, details, 1 as sort_order FROM supabase_tables
    UNION ALL
    SELECT section, item_name, details, 2 as sort_order FROM tables_info
    UNION ALL
    SELECT section, item_name, details, 3 as sort_order FROM constraints_info
    UNION ALL
    SELECT section, item_name, details, 4 as sort_order FROM indexes_info
    UNION ALL
    SELECT section, item_name, details, 5 as sort_order FROM policies_info
    UNION ALL
    SELECT section, item_name, details, 6 as sort_order FROM triggers_info
    UNION ALL
    SELECT section, item_name, details, 7 as sort_order FROM functions_info
    UNION ALL
    SELECT section, item_name, details, 8 as sort_order FROM table_sizes
    UNION ALL
    SELECT section, item_name, details, 9 as sort_order FROM db_config
    UNION ALL
    SELECT section, item_name, details, 10 as sort_order FROM db_stats
) combined_results
ORDER BY sort_order, section, item_name;

-- 🎯 MARKETING MACHINE SPECIFIC TABLES CHECK
-- Deze query controleert specifiek naar Marketing Machine tabellen
SELECT 
    '🎯 MARKETING_MACHINE_TABLES' as section,
    table_name as item_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = tables_to_check.table_name
        ) THEN 'EXISTS ✅' 
        ELSE 'MISSING ❌ - Needs Creation' 
    END as status
FROM (
    VALUES 
        ('content_posts'),
        ('social_accounts'),
        ('content_calendar'),
        ('content_analytics'),
        ('content_research'),
        ('learning_patterns'),
        ('campaigns'),
        ('campaign_performance'),
        ('user_profiles'),
        ('automation_workflows')
) AS tables_to_check(table_name)
ORDER BY table_name; 