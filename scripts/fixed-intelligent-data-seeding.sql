-- ====================================================================
-- FIXED INTELLIGENT DATA SEEDING SYSTEM - Task 70
-- Uses EXACT column names from your actual database schema
-- ====================================================================

-- Helper function for realistic random dates
CREATE OR REPLACE FUNCTION random_date_between(start_date DATE, end_date DATE)
RETURNS DATE AS $$
BEGIN
    RETURN start_date + (random() * (end_date - start_date))::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- Helper function for realistic timestamps in business hours
CREATE OR REPLACE FUNCTION business_hours_timestamp(base_date DATE DEFAULT CURRENT_DATE)
RETURNS TIMESTAMP WITHOUT TIME ZONE AS $$
BEGIN
    -- Random time between 9 AM and 6 PM on weekdays
    RETURN base_date + 
           INTERVAL '9 hours' + 
           (random() * INTERVAL '9 hours') + 
           (random() * INTERVAL '60 minutes');
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- 1. SEED CONTENT_POSTS (using actual column names)
-- ====================================================================
INSERT INTO content_posts (
    content_type, platform, title, subtitle, caption, hashtags, 
    image_urls, publish_status, scheduled_for, published_at,
    impressions, reach, engagement_rate, clicks, shares, saves, 
    comments, likes, ai_quality_score, performance_score,
    total_engagement, created_at, updated_at, status
) 
SELECT 
    content_types.content_type,
    platforms.platform,
    titles.title,
    subtitles.subtitle,
    captions.caption,
    hashtags.hashtags,
    media.image_urls,
    statuses.publish_status,
    business_hours_timestamp(random_date_between('2024-01-01', '2024-06-22')),
    CASE WHEN statuses.publish_status = 'published' 
         THEN business_hours_timestamp(random_date_between('2024-01-01', '2024-06-20'))
         ELSE NULL END,
    (random() * 10000)::integer, -- impressions 0-10000
    (random() * 8000)::integer, -- reach 0-8000
    round((random() * 10)::numeric, 2), -- engagement_rate 0-10%
    (random() * 500)::integer, -- clicks 0-500
    (random() * 50)::integer, -- shares 0-50
    (random() * 25)::integer, -- saves 0-25
    (random() * 30)::integer, -- comments 0-30
    (random() * 400)::integer, -- likes 0-400
    round((random() * 100)::numeric, 2), -- ai_quality_score 0-100
    round((random() * 100)::numeric, 2), -- performance_score 0-100
    (random() * 1000)::integer, -- total_engagement 0-1000
    business_hours_timestamp(random_date_between('2024-01-01', '2024-06-22')),
    business_hours_timestamp(random_date_between('2024-01-01', '2024-06-22')),
    'active'
FROM 
    (VALUES 
        ('social_media_post'),
        ('blog_post'),
        ('video_content'),
        ('carousel_post'),
        ('story_content')
    ) AS content_types(content_type)
CROSS JOIN (VALUES 
        ('instagram'), ('facebook'), ('twitter'), ('linkedin'), ('youtube')
    ) AS platforms(platform)
CROSS JOIN (VALUES 
        ('🚀 Boost Your Content Strategy with AI'),
        ('💡 The Future of Digital Marketing is Here'),
        ('🎯 Targeting Made Simple with Smart Analytics'),
        ('📊 Data-Driven Decisions for Better ROI'),
        ('🔥 Trending: Content That Actually Converts'),
        ('💼 B2B Marketing Secrets Revealed'),
        ('🎨 Creative Content Ideas That Work'),
        ('📈 Scale Your Business with Automation'),
        ('🌟 Customer Success Stories That Inspire'),
        ('⚡ Quick Tips for Social Media Growth')
    ) AS titles(title)
CROSS JOIN (VALUES 
        ('Transform your business today'),
        ('Proven strategies that work'),
        ('Expert insights revealed'),
        ('Step-by-step guide'),
        ('Industry best practices')
    ) AS subtitles(subtitle)
CROSS JOIN (VALUES 
        ('Discover how AI can transform your content creation process. From ideation to optimization, smart tools are revolutionizing digital marketing. #ContentMarketing #AITools #DigitalTransformation'),
        ('The marketing landscape is evolving rapidly. Stay ahead with data-driven insights and automated workflows that deliver real results. #MarketingAutomation #DataDriven #Growth'),
        ('Understanding your audience is key to success. Learn how advanced analytics can help you create targeted campaigns that resonate. #Analytics #Targeting #CustomerInsights'),
        ('Content that converts follows proven patterns. Discover the elements that make content irresistible to your target audience. #ContentStrategy #Conversion #Engagement'),
        ('B2B marketing requires a different approach. Learn the strategies that top companies use to generate quality leads and close deals. #B2BMarketing #LeadGeneration #Sales')
    ) AS captions(caption)
CROSS JOIN (VALUES 
        ('#ContentMarketing #AI #Growth #DigitalMarketing'),
        ('#MarketingAutomation #DataDriven #Analytics #ROI'),
        ('#SocialMedia #Strategy #Engagement #BusinessGrowth'),
        ('#B2B #LeadGeneration #Sales #Marketing'),
        ('#SEO #Content #Traffic #OnlineMarketing')
    ) AS hashtags(hashtags)
CROSS JOIN (VALUES 
        ('["https://example.com/image1.jpg", "https://example.com/image2.jpg"]'::jsonb),
        ('["https://example.com/video1.mp4"]'::jsonb),
        ('[]'::jsonb),
        ('["https://example.com/infographic.png"]'::jsonb),
        ('["https://example.com/carousel1.jpg", "https://example.com/carousel2.jpg"]'::jsonb)
    ) AS media(image_urls)
CROSS JOIN (VALUES 
        ('published'), ('scheduled'), ('draft'), ('published'), ('published')
    ) AS statuses(publish_status)
WHERE NOT EXISTS (SELECT 1 FROM content_posts WHERE title = titles.title)
LIMIT 25; -- Generate 25 realistic posts

-- ====================================================================
-- 2. SEED SOCIAL_ACCOUNTS (using actual column names)
-- ====================================================================
INSERT INTO social_accounts (
    platform, account_name, account_handle, account_type, is_primary,
    is_active, follower_count, followers_count, avg_engagement_rate, 
    engagement_rate, last_post_date, status, created_at, updated_at
)
SELECT 
    platform,
    account_name,
    account_handle,
    account_type,
    (random() < 0.2), -- 20% chance primary
    true, -- is_active
    follower_count,
    follower_count, -- same as follower_count (seems to be duplicate column)
    engagement_rate,
    engagement_rate, -- same value for both columns
    business_hours_timestamp(random_date_between('2024-01-01', '2024-06-20')),
    'connected',
    business_hours_timestamp(random_date_between('2023-01-01', '2024-01-01')),
    business_hours_timestamp(random_date_between('2024-01-01', '2024-06-22'))
FROM (VALUES 
    ('instagram', 'Content Creator Pro', 'contentcreator_pro', 'business', 15430, 4.2),
    ('facebook', 'Marketing Masters', 'marketingmasters_official', 'business', 28750, 3.8),
    ('twitter', 'Social Media Guru', 'socialmedia_guru', 'business', 12890, 5.1),
    ('linkedin', 'Business Growth Hub', 'business_growth_hub', 'business', 8650, 6.3),
    ('youtube', 'Digital Marketing Channel', 'digitalmarketing_channel', 'business', 45230, 7.2),
    ('instagram', 'AI Marketing Solutions', 'ai_marketing_solutions', 'business', 19870, 4.9),
    ('facebook', 'E-commerce Experts', 'ecommerce_experts', 'business', 33420, 3.5),
    ('twitter', 'Content Strategy Tips', 'content_strategy_tips', 'business', 11250, 4.7),
    ('linkedin', 'B2B Sales Mastery', 'b2b_sales_mastery', 'business', 6890, 5.8),
    ('youtube', 'Startup Success Stories', 'startup_success_stories', 'business', 52340, 6.9)
) AS accounts(platform, account_name, account_handle, account_type, follower_count, engagement_rate)
WHERE NOT EXISTS (SELECT 1 FROM social_accounts WHERE account_handle = accounts.account_handle);

-- ====================================================================
-- 3. SEED CAMPAIGNS (using actual column names)
-- ====================================================================
INSERT INTO campaigns (
    name, description, campaign_type, status, start_date, end_date,
    budget_total, budget_spent, target_audience, campaign_config, 
    goals, created_at, updated_at
)
SELECT 
    name,
    description,
    campaign_type,
    status,
    start_date::timestamp with time zone,
    end_date::timestamp with time zone,
    budget_total,
    budget_spent,
    target_audience,
    campaign_config,
    goals,
    business_hours_timestamp(random_date_between('2023-12-01', '2024-01-15'))::timestamp with time zone,
    business_hours_timestamp(random_date_between('2024-01-01', '2024-06-22'))::timestamp with time zone
FROM (VALUES 
    ('Q1 Brand Awareness Campaign', 
     'Comprehensive brand awareness campaign targeting technology professionals',
     'brand_awareness', 'completed', 
     '2024-01-01', '2024-03-31',
     15000.00, 12500.00,
     '{"age_range": "25-45", "interests": ["technology", "business"], "location": "United States"}'::jsonb,
     '{"platforms": ["facebook", "instagram", "google"], "bidding": "cpm", "frequency_cap": 3}'::jsonb,
     '["Increase brand recognition", "Drive website traffic", "Generate leads"]'::jsonb),
    
    ('Spring Product Launch', 
     'Product launch campaign for new AI-powered marketing tools',
     'product_launch', 'active',
     '2024-03-15', '2024-06-30', 
     25000.00, 18750.00,
     '{"age_range": "28-50", "job_titles": ["Marketing Manager", "CEO"], "company_size": "50-500"}'::jsonb,
     '{"platforms": ["linkedin", "twitter", "email"], "automation": true, "lead_scoring": true}'::jsonb,
     '["Product awareness", "Generate pre-orders", "Build email list"]'::jsonb),
    
    ('Content Marketing Boost', 
     'Organic content marketing campaign to increase engagement',
     'content_marketing', 'active',
     '2024-02-01', '2024-08-31',
     8000.00, 4200.00,
     '{"interests": ["content marketing", "digital marketing"], "behavior": "business_content_consumers"}'::jsonb,
     '{"content_types": ["blog", "social", "video"], "publishing_schedule": "daily", "seo_focus": true}'::jsonb,
     '["Increase content engagement", "Grow social following", "Drive blog traffic"]'::jsonb),
    
    ('Holiday Sales Promotion', 
     'Seasonal promotional campaign for holiday shopping period',
     'promotional', 'completed',
     '2023-11-01', '2024-01-15',
     30000.00, 28500.00,
     '{"purchase_behavior": "online_shoppers", "seasonal_interest": "holiday_shopping"}'::jsonb,
     '{"discount_strategy": "tiered", "urgency_tactics": true, "retargeting": true}'::jsonb,
     '["Increase sales", "Clear inventory", "Acquire new customers"]'::jsonb),
    
    ('B2B Lead Generation', 
     'Targeted lead generation campaign for enterprise clients',
     'lead_generation', 'active',
     '2024-04-01', '2024-09-30',
     12000.00, 7800.00,
     '{"job_function": "Marketing", "seniority": "Manager+", "industry": "Technology"}'::jsonb,
     '{"lead_magnets": ["whitepaper", "demo"], "nurture_sequence": 7, "sales_handoff": true}'::jsonb,
     '["Generate qualified leads", "Book demo calls", "Nurture prospects"]'::jsonb)
) AS campaigns_data(name, description, campaign_type, status, start_date, end_date, budget_total, budget_spent, target_audience, campaign_config, goals)
WHERE NOT EXISTS (SELECT 1 FROM campaigns WHERE name = campaigns_data.name);

-- ====================================================================
-- 4. SEED CONTENT_ANALYTICS (using actual column names)
-- ====================================================================
INSERT INTO content_analytics (
    content_post_id, metric_date, platform, views, likes, shares, 
    comments, saves, clicks, reach, impressions, engagement_rate,
    click_through_rate, sentiment_score, created_at, updated_at
)
SELECT 
    cp.id,
    random_date_between('2024-01-01', '2024-06-22'),
    cp.platform,
    (random() * 15000)::integer, -- views
    (random() * 500)::integer, -- likes
    (random() * 50)::integer, -- shares
    (random() * 30)::integer, -- comments
    (random() * 80)::integer, -- saves
    (random() * 200)::integer, -- clicks
    (random() * 12000)::integer, -- reach
    (random() * 18000)::integer, -- impressions
    round((random() * 8)::numeric, 2), -- engagement_rate
    round((random() * 3)::numeric, 2), -- click_through_rate
    round((random() * 100)::numeric, 2), -- sentiment_score 0-100
    business_hours_timestamp(random_date_between('2024-01-01', '2024-06-22')),
    business_hours_timestamp(random_date_between('2024-01-01', '2024-06-22'))
FROM content_posts cp
WHERE cp.publish_status = 'published'
AND NOT EXISTS (
    SELECT 1 FROM content_analytics 
    WHERE content_post_id = cp.id
)
LIMIT 50; -- Generate analytics for published content

-- ====================================================================
-- 5. SEED WORKFLOW_EXECUTIONS (using actual column names)
-- ====================================================================
INSERT INTO workflow_executions (
    workflow_id, workflow_name, execution_id, status, start_time, end_time,
    duration_ms, input_data, output_data, error_message, created_at, updated_at
)
SELECT 
    workflow_data.workflow_id,
    workflow_data.workflow_name,
    gen_random_uuid()::text,
    statuses.status,
    execution_start,
    CASE WHEN statuses.status = 'success' 
         THEN execution_start + (random() * INTERVAL '5 minutes')
         WHEN statuses.status = 'error' 
         THEN execution_start + (random() * INTERVAL '30 seconds')
         ELSE NULL END,
    CASE statuses.status
        WHEN 'success' THEN ((random() * 300000) + 1000)::integer -- 1-300 seconds
        WHEN 'error' THEN ((random() * 10000) + 500)::integer -- 0.5-10 seconds
        ELSE NULL
    END,
    input_data,
    CASE WHEN statuses.status = 'success' THEN output_data ELSE NULL END,
    CASE WHEN statuses.status = 'error' THEN error_messages.error_message ELSE NULL END,
    execution_start,
    execution_start + INTERVAL '1 minute'
FROM (VALUES 
    ('fortune-500-ai-agent', 'Fortune 500 AI Agent', '{"source": "webhook", "company": "TechCorp Inc", "action": "analyze_competitor"}'::jsonb),
    ('marketing-manager-workflow', 'Marketing Manager', '{"task": "create_social_post", "platform": "instagram", "topic": "product_launch"}'::jsonb),
    ('content-optimization-pipeline', 'Content Optimization', '{"content_id": "post_123", "optimization_type": "engagement"}'::jsonb),
    ('data-sync-scheduler', 'Data Sync Scheduler', '{"sync_type": "social_accounts", "accounts": ["instagram", "facebook"]}'::jsonb),
    ('lead-scoring-automation', 'Lead Scoring Automation', '{"lead_source": "website_form", "score_threshold": 75}'::jsonb)
) AS workflow_data(workflow_id, workflow_name, input_data)
CROSS JOIN (VALUES 
    ('success'), ('success'), ('success'), ('error'), ('running')
) AS statuses(status)
CROSS JOIN (VALUES 
    ('{"result": "success", "data_processed": 156, "recommendations": 12}'::jsonb),
    ('{"posts_created": 3, "scheduled_count": 8, "engagement_predicted": 4.2}'::jsonb),
    ('{"optimization_score": 8.5, "changes_applied": 5, "performance_boost": "12%"}'::jsonb),
    ('{"accounts_synced": 4, "new_posts": 23, "updated_metrics": 47}'::jsonb),
    ('{"leads_scored": 89, "high_priority": 15, "notifications_sent": 12}'::jsonb)
) AS output_data_options(output_data)
CROSS JOIN (VALUES 
    ('API rate limit exceeded'),
    ('Invalid authentication token'),
    ('Network timeout'),
    ('Data validation failed'),
    ('Service temporarily unavailable')
) AS error_messages(error_message)
CROSS JOIN LATERAL (
    SELECT business_hours_timestamp(random_date_between('2024-01-01', '2024-06-22'))::timestamp with time zone as execution_start
) AS timing
WHERE NOT EXISTS (
    SELECT 1 FROM workflow_executions 
    WHERE workflow_id = workflow_data.workflow_id 
    AND input_data = workflow_data.input_data
)
LIMIT 20; -- Generate 20 workflow executions

-- ====================================================================
-- VERIFICATION QUERIES
-- ====================================================================

-- Check final counts
SELECT 
    'SEEDING COMPLETE!' as status,
    (SELECT COUNT(*) FROM content_posts) as content_posts_count,
    (SELECT COUNT(*) FROM social_accounts) as social_accounts_count,
    (SELECT COUNT(*) FROM campaigns) as campaigns_count,
    (SELECT COUNT(*) FROM content_analytics) as analytics_count,
    (SELECT COUNT(*) FROM workflow_executions) as workflows_count;

-- Show sample data from each table
SELECT 'CONTENT POSTS SAMPLE' as info, COUNT(*) as count FROM content_posts;
SELECT 'SOCIAL ACCOUNTS SAMPLE' as info, COUNT(*) as count FROM social_accounts;
SELECT 'CAMPAIGNS SAMPLE' as info, COUNT(*) as count FROM campaigns;
SELECT 'ANALYTICS SAMPLE' as info, COUNT(*) as count FROM content_analytics;
SELECT 'WORKFLOWS SAMPLE' as info, COUNT(*) as count FROM workflow_executions;

-- Clean up helper functions
DROP FUNCTION IF EXISTS random_date_between(DATE, DATE);
DROP FUNCTION IF EXISTS business_hours_timestamp(DATE); 