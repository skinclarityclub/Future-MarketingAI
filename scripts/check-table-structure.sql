-- Check Table Structures voor Database Seeding Verification
-- Dit script toont de exacte kolommen van elke tabel

-- Controleer content_posts tabel structuur
SELECT 
    'content_posts' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'content_posts' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Controleer content_analytics tabel structuur  
SELECT 
    'content_analytics' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'content_analytics' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Controleer social_accounts tabel structuur
SELECT 
    'social_accounts' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'social_accounts' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Controleer campaigns tabel structuur
SELECT 
    'campaigns' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'campaigns' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Controleer workflow_executions tabel structuur
SELECT 
    'workflow_executions' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'workflow_executions' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Eenvoudige row count check
SELECT 
    'content_posts' as table_name,
    COUNT(*) as row_count
FROM content_posts
UNION ALL
SELECT 
    'content_analytics' as table_name,
    COUNT(*) as row_count
FROM content_analytics
UNION ALL
SELECT 
    'social_accounts' as table_name,
    COUNT(*) as row_count
FROM social_accounts
UNION ALL
SELECT 
    'campaigns' as table_name,
    COUNT(*) as row_count
FROM campaigns
UNION ALL
SELECT 
    'workflow_executions' as table_name,
    COUNT(*) as row_count
FROM workflow_executions; 