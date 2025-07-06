-- ====================================================================
-- WORKING DATA SEEDING SYSTEM - Task 70 (DIAGNOSTIC VERSION)
-- ALL numeric values under 9.99 to handle numeric(3,2) constraints
-- ====================================================================

-- Helper function for realistic random dates
CREATE OR REPLACE FUNCTION random_date_between(start_date DATE, end_date DATE)
RETURNS DATE AS $$
BEGIN
    RETURN start_date + (random() * (end_date - start_date))::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- 1. SEED CONTENT_POSTS (ALL VALUES UNDER 9.99)
-- ====================================================================
SELECT 'Starting content_posts insert...' AS status;

INSERT INTO content_posts (
    content_type, platform, title, subtitle, caption, hashtags, 
    image_urls, publish_status, scheduled_for, published_at,
    impressions, reach, engagement_rate, clicks, shares, saves, 
    comments, likes, ai_quality_score, performance_score,
    total_engagement, status, created_at, updated_at
) VALUES 
(
    'social_media_post',
    'instagram', 
    '🚀 Test Content Post',
    'Test subtitle',
    'Test caption for content seeding #test',
    '#test #content',
    '[]'::jsonb,
    'published',
    NULL,
    NOW() - INTERVAL '1 day',
    1000, -- impressions
    800, -- reach  
    1.50, -- engagement_rate
    50, -- clicks
    5, -- shares
    3, -- saves
    8, -- comments
    25, -- likes
    7.55, -- ai_quality_score (UNDER 9.99)
    8.25, -- performance_score (UNDER 9.99)
    100, -- total_engagement
    'published',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '1 hour'
);

SELECT 'content_posts insert completed!' AS status;

-- ====================================================================
-- 2. SEED SOCIAL_ACCOUNTS (ALL VALUES UNDER 9.99)
-- ====================================================================
SELECT 'Starting social_accounts insert...' AS status;

INSERT INTO social_accounts (
    platform, account_name, account_handle, account_type, 
    is_active, follower_count, followers_count, avg_engagement_rate, 
    engagement_rate, status, created_at, updated_at
) VALUES 
(
    'instagram',
    'Test Account',
    'test_account_handle',
    'business',
    true,
    5000,
    5000,
    2.50, -- avg_engagement_rate
    2.50, -- engagement_rate
    'connected',
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '1 day'
);

SELECT 'social_accounts insert completed!' AS status;

-- ====================================================================
-- 3. SEED CAMPAIGNS (ALL VALUES UNDER 9.99)
-- ====================================================================
SELECT 'Starting campaigns insert...' AS status;

INSERT INTO campaigns (
    name, description, campaign_type, status, start_date, end_date,
    budget_total, budget_spent, target_audience, goals, created_at, updated_at
) VALUES 
(
    'Test Campaign',
    'Test campaign for data seeding',
    'brand_awareness',
    'active',
    NOW() - INTERVAL '30 days',
    NOW() + INTERVAL '30 days',
    5000.00,
    2500.00,
    '{"test": "audience"}'::jsonb,
    '["test goal"]'::jsonb,
    NOW() - INTERVAL '35 days',
    NOW() - INTERVAL '1 day'
);

SELECT 'campaigns insert completed!' AS status;

-- ====================================================================
-- 4. SEED CONTENT_ANALYTICS (ALL VALUES UNDER 9.99)
-- ====================================================================
SELECT 'Starting content_analytics insert...' AS status;

INSERT INTO content_analytics (
    content_post_id, metric_date, platform, views, likes, shares, 
    comments, saves, clicks, reach, impressions, engagement_rate,
    click_through_rate, sentiment_score, created_at, updated_at
)
SELECT 
    cp.id,
    CURRENT_DATE - 1,
    cp.platform,
    1500, -- views
    30, -- likes
    5, -- shares
    8, -- comments
    3, -- saves
    20, -- clicks
    900, -- reach
    1200, -- impressions
    1.75, -- engagement_rate
    0.85, -- click_through_rate
    7.50, -- sentiment_score (UNDER 9.99)
    NOW() - INTERVAL '1 day',
    NOW()
FROM content_posts cp
WHERE cp.publish_status = 'published'
LIMIT 1; -- Just one record for testing

SELECT 'content_analytics insert completed!' AS status;

-- ====================================================================
-- 5. SEED WORKFLOW_EXECUTIONS (ALL VALUES UNDER 9.99)
-- ====================================================================
SELECT 'Starting workflow_executions insert...' AS status;

INSERT INTO workflow_executions (
    workflow_id, workflow_name, execution_id, status, start_time, end_time, 
    duration_ms, input_data, output_data, error_message, 
    created_at, updated_at
) VALUES 
(
    'workflow_001',
    'Test Workflow',
    'exec_' || gen_random_uuid()::text,
    'success',
    NOW() - INTERVAL '1 hour',
    NOW() - INTERVAL '30 minutes',
    1800000, -- 30 minutes in milliseconds
    '{"test": "input"}'::jsonb,
    '{"test": "output"}'::jsonb,
    NULL,
    NOW() - INTERVAL '1 hour',
    NOW()
);

SELECT 'workflow_executions insert completed!' AS status;

-- ====================================================================
-- VERIFICATION QUERIES
-- ====================================================================
SELECT 'Data Seeding Test Complete!' AS message;

SELECT 
    'content_posts' AS table_name, 
    COUNT(*) AS record_count,
    MAX(engagement_rate) AS max_engagement_rate,
    MAX(ai_quality_score) AS max_ai_quality_score,
    MAX(performance_score) AS max_performance_score
FROM content_posts
UNION ALL
SELECT 
    'social_accounts', 
    COUNT(*),
    MAX(engagement_rate),
    MAX(avg_engagement_rate),
    NULL
FROM social_accounts
UNION ALL
SELECT 
    'campaigns', 
    COUNT(*),
    NULL,
    NULL,
    NULL
FROM campaigns
UNION ALL
SELECT 
    'content_analytics', 
    COUNT(*),
    MAX(engagement_rate),
    MAX(click_through_rate),
    MAX(sentiment_score)
FROM content_analytics
UNION ALL
SELECT 
    'workflow_executions', 
    COUNT(*),
    NULL,
    NULL,
    NULL
FROM workflow_executions;

-- Clean up helper function
DROP FUNCTION IF EXISTS random_date_between(DATE, DATE); 