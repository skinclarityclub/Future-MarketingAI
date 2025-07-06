-- Quick check for tables needed for Task 70 Data Seeding System
SELECT 
    'TABLE CHECK' as info,
    table_name,
    CASE 
        WHEN table_name IN (
            SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'
        ) THEN 'EXISTS ✅'
        ELSE 'MISSING ❌'
    END as status,
    CASE 
        WHEN table_name IN (
            SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'
        ) THEN (
            SELECT COUNT(*)::text || ' rows'
            FROM information_schema.tables t
            WHERE t.table_name = v.table_name
        )
        ELSE 'N/A'
    END as row_info
FROM (VALUES 
    ('content_posts'),
    ('social_accounts'), 
    ('products'),
    ('campaigns'),
    ('workflow_executions'),
    ('content_analytics'),
    ('ml_models')
) AS v(table_name)
ORDER BY status DESC, table_name; 