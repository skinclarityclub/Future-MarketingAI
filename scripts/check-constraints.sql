-- Check constraints on content_posts table
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'content_posts'::regclass
AND contype = 'c';

-- Also check any enum types that might be used
SELECT 
    t.typname,
    e.enumlabel
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname LIKE '%status%' OR t.typname LIKE '%content%'
ORDER BY t.typname, e.enumsortorder; 