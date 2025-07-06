-- Check exact column structure of existing tables
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('content_posts', 'social_accounts', 'campaigns', 'content_analytics', 'workflow_executions')
ORDER BY table_name, ordinal_position; 