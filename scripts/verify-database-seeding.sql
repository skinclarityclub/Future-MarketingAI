-- Database Seeding Verification Script voor Taak 70
-- Deze query's controleren of de data seeding succesvol is verlopen

-- Toon algemene database statistieken
SELECT 
    'DATABASE_OVERVIEW' as check_type,
    schemaname,
    relname as tablename,
    n_tup_ins as total_rows,
    n_tup_upd as updates,
    n_tup_del as deletes
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
    AND relname IN ('content_posts', 'content_analytics', 'social_accounts', 'campaigns', 'workflow_executions')
ORDER BY n_tup_ins DESC;

-- Controleer content_posts data
SELECT 
    'CONTENT_POSTS' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT platform) as unique_platforms,
    MIN(created_at) as earliest_post,
    MAX(created_at) as latest_post,
    AVG(CASE WHEN ai_quality_score IS NOT NULL THEN ai_quality_score END) as avg_ai_quality,
    STRING_AGG(DISTINCT platform, ', ') as platforms
FROM content_posts;

-- Controleer content_analytics data  
SELECT 
    'CONTENT_ANALYTICS' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT post_id) as unique_posts,
    AVG(impressions) as avg_impressions,
    AVG(engagement_rate) as avg_engagement,
    AVG(performance_score) as avg_performance,
    MIN(recorded_at) as earliest_analytics,
    MAX(recorded_at) as latest_analytics
FROM content_analytics;

-- Controleer social_accounts data
SELECT 
    'SOCIAL_ACCOUNTS' as table_name,
    COUNT(*) as total_accounts,
    STRING_AGG(DISTINCT platform, ', ') as platforms,
    SUM(follower_count) as total_followers,
    AVG(follower_count) as avg_followers,
    MAX(follower_count) as max_followers
FROM social_accounts;

-- Controleer campaigns data
SELECT 
    'CAMPAIGNS' as table_name,
    COUNT(*) as total_campaigns,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_campaigns,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_campaigns,
    SUM(budget) as total_budget,
    AVG(budget) as avg_budget,
    STRING_AGG(DISTINCT campaign_type, ', ') as campaign_types
FROM campaigns;

-- Controleer workflow_executions data
SELECT 
    'WORKFLOW_EXECUTIONS' as table_name,
    COUNT(*) as total_executions,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_executions,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_executions,
    AVG(duration_ms) as avg_duration_ms,
    STRING_AGG(DISTINCT workflow_name, ', ') as workflow_names
FROM workflow_executions;

-- Controleer data relaties en consistentie
SELECT 
    'DATA_RELATIONSHIPS' as check_type,
    'Posts with Analytics' as relationship,
    COUNT(DISTINCT cp.id) as posts_count,
    COUNT(ca.id) as analytics_count,
    ROUND(COUNT(ca.id)::numeric / COUNT(DISTINCT cp.id), 2) as analytics_per_post
FROM content_posts cp
LEFT JOIN content_analytics ca ON cp.id = ca.post_id;

-- Controleer data kwaliteit
SELECT 
    'DATA_QUALITY' as check_type,
    'AI Quality Scores' as metric,
    COUNT(CASE WHEN ai_quality_score BETWEEN 0 AND 10 THEN 1 END) as valid_scores,
    COUNT(CASE WHEN ai_quality_score IS NULL THEN 1 END) as null_scores,
    MIN(ai_quality_score) as min_score,
    MAX(ai_quality_score) as max_score
FROM content_posts;

-- Controleer recent data voor self-learning
SELECT 
    'SELF_LEARNING_READY' as check_type,
    platform,
    COUNT(*) as posts_count,
    AVG(ai_quality_score) as avg_quality,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as recent_posts
FROM content_posts 
GROUP BY platform
ORDER BY posts_count DESC;

-- Sample van de actual data om te zien hoe het eruit ziet
SELECT 
    'SAMPLE_DATA' as check_type,
    cp.title,
    cp.platform,
    cp.ai_quality_score,
    ca.impressions,
    ca.engagement_rate,
    ca.performance_score
FROM content_posts cp
LEFT JOIN content_analytics ca ON cp.id = ca.post_id
ORDER BY cp.created_at DESC
LIMIT 5; 