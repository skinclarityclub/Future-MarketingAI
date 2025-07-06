-- Test query to check if our research seeding tables exist
SELECT 
    tablename 
FROM 
    pg_tables 
WHERE 
    schemaname = 'public' 
    AND tablename LIKE '%research%' 
    OR tablename LIKE '%seeding%' 
    OR tablename LIKE '%ai_engine%'
ORDER BY tablename;

-- Check if the specific tables exist
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public'
    AND table_name IN (
        'research_ai_seeding_logs',
        'research_ai_seeding_status',
        'research_ai_data_sources',
        'research_ai_validation_results'
    )
ORDER BY 
    table_name, 
    ordinal_position; 