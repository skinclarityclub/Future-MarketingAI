-- Check actual status values in content_posts
SELECT DISTINCT status FROM content_posts;
SELECT DISTINCT publish_status FROM content_posts; 

-- Check the exact constraint definition
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'content_posts'::regclass
AND contype = 'c';

-- Also check what the current sample row looks like
SELECT status, publish_status, content_type, platform, title 
FROM content_posts 
LIMIT 3; 