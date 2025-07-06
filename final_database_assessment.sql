-- 🎯 FINAL SUPABASE DATABASE ASSESSMENT
-- Volledige controle van Marketing Machine & n8n readiness

WITH 
-- Check alle Marketing Machine tabellen
marketing_tables AS (
    SELECT 
        'MARKETING_MACHINE_TABLES' as section,
        t.table_name as item_name,
        CASE 
            WHEN pt.tablename IS NOT NULL THEN 'EXISTS ✅'
            ELSE 'MISSING ❌'
        END as status
    FROM (
        VALUES 
            ('automation_workflows'),
            ('campaigns'),
            ('campaign_performance'),
            ('content_analytics'),
            ('content_calendar'),
            ('content_posts'),
            ('content_research'),
            ('learning_patterns'),
            ('social_accounts'),
            ('user_profiles')
    ) AS t(table_name)
    LEFT JOIN pg_tables pt ON t.table_name = pt.tablename AND pt.schemaname = 'public'
),

-- Check RLS status
rls_status AS (
    SELECT 
        'RLS_POLICIES' as section,
        tablename as item_name,
        'RLS: ' || CASE WHEN rowsecurity THEN 'ENABLED ✅' ELSE 'DISABLED ❌' END as status
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN (
        'automation_workflows', 'campaigns', 'campaign_performance', 
        'content_analytics', 'content_calendar', 'content_posts', 
        'content_research', 'learning_patterns', 'social_accounts', 'user_profiles'
    )
),

-- Check essential indexes voor performance
index_check AS (
    SELECT 
        'PERFORMANCE_INDEXES' as section,
        'automation_workflows' as item_name,
        CASE WHEN COUNT(*) >= 4 THEN 'OPTIMIZED ✅' ELSE 'NEEDS WORK ❌' END as status
    FROM pg_indexes 
    WHERE schemaname = 'public' AND tablename = 'automation_workflows'
    
    UNION ALL
    
    SELECT 
        'PERFORMANCE_INDEXES' as section,
        'campaigns' as item_name,
        CASE WHEN COUNT(*) >= 4 THEN 'OPTIMIZED ✅' ELSE 'NEEDS WORK ❌' END as status
    FROM pg_indexes 
    WHERE schemaname = 'public' AND tablename = 'campaigns'
    
    UNION ALL
    
    SELECT 
        'PERFORMANCE_INDEXES' as section,
        'content_analytics' as item_name,
        CASE WHEN COUNT(*) >= 4 THEN 'OPTIMIZED ✅' ELSE 'NEEDS WORK ❌' END as status
    FROM pg_indexes 
    WHERE schemaname = 'public' AND tablename = 'content_analytics'
),

-- Check triggers voor automatic timestamps
trigger_check AS (
    SELECT 
        'TIMESTAMP_TRIGGERS' as section,
        trigger_name as item_name,
        'ACTIVE ✅' as status
    FROM information_schema.triggers 
    WHERE trigger_schema = 'public' 
    AND trigger_name LIKE '%updated_at%'
    ORDER BY trigger_name
),

-- Check foreign key relationships
fk_check AS (
    SELECT 
        'FOREIGN_KEYS' as section,
        constraint_name as item_name,
        'CONFIGURED ✅' as status
    FROM information_schema.table_constraints 
    WHERE constraint_type = 'FOREIGN KEY' 
    AND constraint_schema = 'public'
    AND table_name IN (
        'automation_workflows', 'campaigns', 'campaign_performance', 
        'content_analytics', 'learning_patterns'
    )
),

-- N8N Integration Readiness Check
n8n_readiness AS (
    SELECT 
        'N8N_INTEGRATION' as section,
        'automation_workflows_table' as item_name,
        CASE WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'automation_workflows' 
            AND column_name = 'n8n_workflow_id'
        ) THEN 'READY ✅' ELSE 'NOT_READY ❌' END as status
    
    UNION ALL
    
    SELECT 
        'N8N_INTEGRATION' as section,
        'webhook_support_columns' as item_name,
        CASE WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'automation_workflows' 
            AND column_name IN ('trigger_conditions', 'workflow_config')
        ) THEN 'READY ✅' ELSE 'NOT_READY ❌' END as status
),

-- Marketing Machine Readiness
marketing_readiness AS (
    SELECT 
        'MARKETING_MACHINE' as section,
        'content_pipeline' as item_name,
        CASE WHEN (
            SELECT COUNT(*) FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('content_calendar', 'content_posts', 'content_analytics')
        ) = 3 THEN 'READY ✅' ELSE 'NOT_READY ❌' END as status
    
    UNION ALL
    
    SELECT 
        'MARKETING_MACHINE' as section,
        'campaign_management' as item_name,
        CASE WHEN (
            SELECT COUNT(*) FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('campaigns', 'campaign_performance')
        ) = 2 THEN 'READY ✅' ELSE 'NOT_READY ❌' END as status
    
    UNION ALL
    
    SELECT 
        'MARKETING_MACHINE' as section,
        'ai_learning_system' as item_name,
        CASE WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'learning_patterns'
        ) THEN 'READY ✅' ELSE 'NOT_READY ❌' END as status
),

-- Database Security Check
security_check AS (
    SELECT 
        'DATABASE_SECURITY' as section,
        'rls_enabled_tables' as item_name,
        CASE WHEN COUNT(*) >= 10 THEN 'SECURE ✅' ELSE 'NEEDS_REVIEW ❌' END as status
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND rowsecurity = true
    AND tablename IN (
        'automation_workflows', 'campaigns', 'campaign_performance', 
        'content_analytics', 'content_calendar', 'content_posts', 
        'content_research', 'learning_patterns', 'social_accounts', 'user_profiles'
    )
    
    UNION ALL
    
    SELECT 
        'DATABASE_SECURITY' as section,
        'auth_integration' as item_name,
        CASE WHEN EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_schema = 'auth' 
            AND routine_name = 'uid'
        ) THEN 'CONFIGURED ✅' ELSE 'NOT_CONFIGURED ❌' END as status
),

-- Combineer alle resultaten met ordering
all_results AS (
    SELECT 
        section, 
        item_name, 
        status,
        CASE section
            WHEN 'MARKETING_MACHINE_TABLES' THEN 1
            WHEN 'RLS_POLICIES' THEN 2
            WHEN 'PERFORMANCE_INDEXES' THEN 3
            WHEN 'TIMESTAMP_TRIGGERS' THEN 4
            WHEN 'FOREIGN_KEYS' THEN 5
            WHEN 'N8N_INTEGRATION' THEN 6
            WHEN 'MARKETING_MACHINE' THEN 7
            WHEN 'DATABASE_SECURITY' THEN 8
        END as section_order
    FROM (
        SELECT section, item_name, status FROM marketing_tables
        UNION ALL
        SELECT section, item_name, status FROM rls_status
        UNION ALL
        SELECT section, item_name, status FROM index_check
        UNION ALL
        SELECT section, item_name, status FROM trigger_check
        UNION ALL
        SELECT section, item_name, status FROM fk_check
        UNION ALL
        SELECT section, item_name, status FROM n8n_readiness
        UNION ALL
        SELECT section, item_name, status FROM marketing_readiness
        UNION ALL
        SELECT section, item_name, status FROM security_check
    ) combined
)

SELECT section, item_name, status 
FROM all_results
ORDER BY section_order, item_name; 