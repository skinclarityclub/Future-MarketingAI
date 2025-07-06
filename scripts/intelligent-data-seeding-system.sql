-- ====================================================================
-- INTELLIGENT DATA SEEDING SYSTEM - Task 70
-- Seeds realistic data for existing tables that only have 1 sample row
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
RETURNS TIMESTAMP WITH TIME ZONE AS $$
BEGIN
    -- Random time between 9 AM and 6 PM on weekdays
    RETURN base_date + 
           INTERVAL '9 hours' + 
           (random() * INTERVAL '9 hours') + 
           (random() * INTERVAL '60 minutes');
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- 1. SEED CONTENT_POSTS (realistic social media content)
-- ====================================================================
INSERT INTO content_posts (
    title, content, platform, status, scheduled_for, published_at, 
    engagement_score, impressions, likes, shares, comments,
    hashtags, media_urls, created_at
) 
SELECT 
    titles.title,
    contents.content,
    platforms.platform,
    statuses.status,
    business_hours_timestamp(random_date_between('2024-01-01', '2024-06-22')),
    CASE WHEN statuses.status = 'published' 
         THEN business_hours_timestamp(random_date_between('2024-01-01', '2024-06-20'))
         ELSE NULL END,
    round((random() * 100)::numeric, 2), -- engagement_score 0-100
    (random() * 10000)::integer, -- impressions 0-10000
    (random() * 500)::integer, -- likes 0-500
    (random() * 50)::integer, -- shares 0-50
    (random() * 25)::integer, -- comments 0-25
    hashtags_array.hashtags,
    media_array.media_urls,
    business_hours_timestamp(random_date_between('2024-01-01', '2024-06-22'))
FROM 
    (VALUES 
        ('🚀 Boost Your Content Strategy with AI'),
        ('💡 The Future of Digital Marketing is Here'),
        ('🎯 Targeting Made Simple with Smart Analytics'),
        ('📊 Data-Driven Decisions for Better ROI'),
        ('🔥 Trending: Content That Actually Converts'),
        ('💼 B2B Marketing Secrets Revealed'),
        ('🎨 Creative Content Ideas That Work'),
        ('📈 Scale Your Business with Automation'),
        ('🌟 Customer Success Stories That Inspire'),
        ('⚡ Quick Tips for Social Media Growth'),
        ('🏆 Award-Winning Marketing Campaigns'),
        ('🔍 SEO Strategies That Actually Work'),
        ('📱 Mobile-First Content Strategy'),
        ('🎬 Video Content That Gets Results'),
        ('💰 ROI-Focused Marketing Tactics')
    ) AS titles(title)
CROSS JOIN (VALUES 
        ('Discover how AI can transform your content creation process. From ideation to optimization, smart tools are revolutionizing digital marketing. #ContentMarketing #AITools #DigitalTransformation'),
        ('The marketing landscape is evolving rapidly. Stay ahead with data-driven insights and automated workflows that deliver real results. #MarketingAutomation #DataDriven #Growth'),
        ('Understanding your audience is key to success. Learn how advanced analytics can help you create targeted campaigns that resonate. #Analytics #Targeting #CustomerInsights'),
        ('Making informed decisions has never been easier. Leverage the power of data to optimize your marketing spend and maximize ROI. #DataAnalytics #ROI #MarketingStrategy'),
        ('Content that converts follows proven patterns. Discover the elements that make content irresistible to your target audience. #ContentStrategy #Conversion #Engagement'),
        ('B2B marketing requires a different approach. Learn the strategies that top companies use to generate quality leads and close deals. #B2BMarketing #LeadGeneration #Sales'),
        ('Creativity meets strategy in successful campaigns. Explore fresh ideas that can breathe new life into your content calendar. #CreativeMarketing #ContentIdeas #Innovation'),
        ('Automation is not just about efficiency—it is about scaling smart. Build systems that grow your business while you focus on strategy. #MarketingAutomation #Scaling #Efficiency'),
        ('Real stories from real customers build trust and credibility. See how success stories can become your most powerful marketing tool. #CustomerSuccess #Testimonials #Trust'),
        ('Small changes can yield big results. Quick, actionable tips to improve your social media performance starting today. #SocialMediaTips #QuickWins #Growth'),
        ('Award-winning campaigns share common elements. Analyze what makes great marketing great and apply it to your strategy. #MarketingExcellence #CampaignStrategy #Success'),
        ('SEO is constantly evolving. Stay current with strategies that work in today''s search landscape and drive organic traffic. #SEO #SearchMarketing #OrganicTraffic'),
        ('Mobile users expect seamless experiences. Create content that looks great and performs well on every device. #MobileFirst #ResponsiveDesign #UserExperience'),
        ('Video content dominates engagement metrics. Learn how to create compelling videos that capture attention and drive action. #VideoMarketing #VideoContent #Engagement'),
        ('Every marketing dollar should contribute to growth. Focus on tactics with proven ROI and measurable impact on your bottom line. #ROI #MarketingROI #ProfitableMarketing')
    ) AS contents(content)
CROSS JOIN (VALUES 
        ('facebook'), ('instagram'), ('twitter'), ('linkedin'), ('youtube')
    ) AS platforms(platform)
CROSS JOIN (VALUES 
        ('published'), ('scheduled'), ('draft'), ('published'), ('published')
    ) AS statuses(status)
CROSS JOIN (VALUES 
        ('{"#ContentMarketing", "#AI", "#Growth"}'),
        ('{"#DigitalMarketing", "#Automation", "#ROI"}'),
        ('{"#SocialMedia", "#Analytics", "#Strategy"}'),
        ('{"#B2B", "#LeadGen", "#Sales"}'),
        ('{"#SEO", "#Content", "#Traffic"}')
    ) AS hashtags_array(hashtags)
CROSS JOIN (VALUES 
        ('{"https://example.com/image1.jpg", "https://example.com/image2.jpg"}'),
        ('{"https://example.com/video1.mp4"}'),
        ('{}'),
        ('{"https://example.com/infographic.png"}'),
        ('{"https://example.com/carousel1.jpg", "https://example.com/carousel2.jpg", "https://example.com/carousel3.jpg"}')
    ) AS media_array(media_urls)
WHERE NOT EXISTS (SELECT 1 FROM content_posts WHERE title = titles.title)
LIMIT 50; -- Generate 50 realistic posts

-- ====================================================================
-- 2. SEED SOCIAL_ACCOUNTS (realistic social media accounts)
-- ====================================================================
INSERT INTO social_accounts (
    platform, username, display_name, follower_count, following_count,
    is_verified, status, access_token_expires_at, last_sync_at,
    profile_image_url, bio, website_url, created_at
)
SELECT 
    platform,
    username,
    display_name,
    (random() * 50000)::integer, -- followers 0-50k
    (random() * 2000)::integer, -- following 0-2k
    (random() < 0.3), -- 30% chance verified
    'active',
    NOW() + INTERVAL '30 days', -- token expires in 30 days
    NOW() - (random() * INTERVAL '24 hours'), -- last sync within 24h
    'https://example.com/avatar/' || username || '.jpg',
    bio,
    'https://' || username || '.com',
    business_hours_timestamp(random_date_between('2023-01-01', '2024-01-01'))
FROM (VALUES 
    ('instagram', 'contentcreator_pro', 'Content Creator Pro', '🎨 Creating amazing content daily | 📈 Marketing tips & tricks | 💡 Let''s grow together!'),
    ('facebook', 'marketingmasters_official', 'Marketing Masters', '🚀 Your go-to source for marketing insights | 📊 Data-driven strategies | Join 10K+ marketers!'),
    ('twitter', 'socialmedia_guru', 'Social Media Guru', '📱 Social media strategies that work | 🔥 Latest trends & updates | DM for collabs'),
    ('linkedin', 'business_growth_hub', 'Business Growth Hub', '💼 B2B growth strategies | 📈 Helping businesses scale | Connect for insights'),
    ('youtube', 'digitalmarketing_channel', 'Digital Marketing Channel', '🎬 Weekly marketing tutorials | 💡 Tips for entrepreneurs | Subscribe for more!'),
    ('instagram', 'ai_marketing_solutions', 'AI Marketing Solutions', '🤖 AI-powered marketing tools | 🚀 Automating success | Follow for AI tips'),
    ('facebook', 'ecommerce_experts', 'E-commerce Experts', '🛒 E-commerce growth hacks | 💰 Boost your online sales | Community of 5K+ sellers'),
    ('twitter', 'content_strategy_tips', 'Content Strategy Tips', '📝 Content that converts | 🎯 Strategy insights daily | Retweet for value'),
    ('linkedin', 'b2b_sales_mastery', 'B2B Sales Mastery', '💼 B2B sales strategies | 🤝 Building relationships | Network with sales pros'),
    ('youtube', 'startup_success_stories', 'Startup Success Stories', '🌟 Inspiring entrepreneur journeys | 💡 Lessons learned | New videos weekly')
) AS accounts(platform, username, display_name, bio)
WHERE NOT EXISTS (SELECT 1 FROM social_accounts WHERE username = accounts.username);

-- ====================================================================
-- 3. SEED CAMPAIGNS (realistic marketing campaigns)
-- ====================================================================
INSERT INTO campaigns (
    name, type, status, budget, spent_amount, start_date, end_date,
    target_audience, objectives, kpis, platforms, created_at
)
SELECT 
    name,
    type,
    status,
    budget,
    (budget * random() * 0.8)::decimal(10,2), -- spent 0-80% of budget
    random_date_between('2024-01-01', '2024-03-01'),
    random_date_between('2024-04-01', '2024-06-30'),
    target_audience,
    objectives,
    kpis,
    platforms,
    business_hours_timestamp(random_date_between('2023-12-01', '2024-01-15'))
FROM (VALUES 
    ('Q1 Brand Awareness Campaign', 'brand_awareness', 'completed', 15000.00, 
     '{"age_range": "25-45", "interests": ["technology", "business"], "location": "United States"}',
     '["Increase brand recognition", "Drive website traffic", "Generate leads"]',
     '{"impressions": 500000, "ctr": 2.5, "conversions": 150}',
     '["facebook", "instagram", "google"]'),
    
    ('Spring Product Launch', 'product_launch', 'active', 25000.00,
     '{"age_range": "28-50", "job_titles": ["Marketing Manager", "CEO"], "company_size": "50-500"}',
     '["Product awareness", "Generate pre-orders", "Build email list"]',
     '{"reach": 100000, "engagement_rate": 4.2, "email_signups": 500}',
     '["linkedin", "twitter", "email"]'),
    
    ('Content Marketing Boost', 'content_marketing', 'active', 8000.00,
     '{"interests": ["content marketing", "digital marketing"], "behavior": "business_content_consumers"}',
     '["Increase content engagement", "Grow social following", "Drive blog traffic"]',
     '{"social_shares": 1000, "blog_visits": 5000, "new_followers": 200}',
     '["instagram", "linkedin", "blog"]'),
    
    ('Holiday Sales Promotion', 'promotional', 'completed', 30000.00,
     '{"purchase_behavior": "online_shoppers", "seasonal_interest": "holiday_shopping"}',
     '["Increase sales", "Clear inventory", "Acquire new customers"]',
     '{"revenue": 75000, "conversion_rate": 3.8, "new_customers": 300}',
     '["facebook", "instagram", "google", "email"]'),
    
    ('B2B Lead Generation', 'lead_generation', 'active', 12000.00,
     '{"job_function": "Marketing", "seniority": "Manager+", "industry": "Technology"}',
     '["Generate qualified leads", "Book demo calls", "Nurture prospects"]',
     '{"leads": 50, "demos_booked": 15, "sql_conversion": 25}',
     '["linkedin", "google", "email"]')
) AS campaigns_data(name, type, status, budget, target_audience, objectives, kpis, platforms)
WHERE NOT EXISTS (SELECT 1 FROM campaigns WHERE name = campaigns_data.name);

-- ====================================================================
-- 4. SEED CONTENT_ANALYTICS (realistic performance data)
-- ====================================================================
INSERT INTO content_analytics (
    content_id, platform, metric_name, metric_value, recorded_at, 
    metadata, created_at
)
SELECT 
    cp.id,
    cp.platform,
    metrics.metric_name,
    CASE metrics.metric_name
        WHEN 'impressions' THEN (random() * 10000)::integer
        WHEN 'reach' THEN (random() * 8000)::integer
        WHEN 'engagement_rate' THEN round((random() * 10)::numeric, 2)
        WHEN 'click_through_rate' THEN round((random() * 5)::numeric, 2)
        WHEN 'conversion_rate' THEN round((random() * 3)::numeric, 2)
        ELSE (random() * 1000)::integer
    END,
    business_hours_timestamp(random_date_between('2024-01-01', '2024-06-22')),
    '{"campaign_id": "' || (random() * 100)::integer || '", "audience_segment": "primary"}',
    business_hours_timestamp(random_date_between('2024-01-01', '2024-06-22'))
FROM content_posts cp
CROSS JOIN (VALUES 
    ('impressions'),
    ('reach'),
    ('engagement_rate'),
    ('click_through_rate'),
    ('conversion_rate'),
    ('saves'),
    ('shares')
) AS metrics(metric_name)
WHERE cp.status = 'published'
AND NOT EXISTS (
    SELECT 1 FROM content_analytics 
    WHERE content_id = cp.id AND metric_name = metrics.metric_name
)
LIMIT 200; -- Generate analytics for published content

-- ====================================================================
-- 5. SEED WORKFLOW_EXECUTIONS (realistic n8n workflow data)
-- ====================================================================
INSERT INTO workflow_executions (
    workflow_id, execution_id, status, started_at, finished_at,
    trigger_type, input_data, output_data, error_message,
    execution_time_ms, created_at
)
SELECT 
    workflow_data.workflow_id,
    gen_random_uuid()::text,
    statuses.status,
    execution_start,
    CASE WHEN statuses.status = 'success' 
         THEN execution_start + (random() * INTERVAL '5 minutes')
         WHEN statuses.status = 'error' 
         THEN execution_start + (random() * INTERVAL '30 seconds')
         ELSE NULL END,
    triggers.trigger_type,
    input_data,
    CASE WHEN statuses.status = 'success' THEN output_data ELSE NULL END,
    CASE WHEN statuses.status = 'error' THEN error_messages.error_message ELSE NULL END,
    CASE statuses.status
        WHEN 'success' THEN ((random() * 300000) + 1000)::integer -- 1-300 seconds
        WHEN 'error' THEN ((random() * 10000) + 500)::integer -- 0.5-10 seconds
        ELSE NULL
    END,
    execution_start
FROM (VALUES 
    ('fortune-500-ai-agent', '{"source": "webhook", "company": "TechCorp Inc", "action": "analyze_competitor"}'),
    ('marketing-manager-workflow', '{"task": "create_social_post", "platform": "instagram", "topic": "product_launch"}'),
    ('content-optimization-pipeline', '{"content_id": "post_123", "optimization_type": "engagement"}'),
    ('data-sync-scheduler', '{"sync_type": "social_accounts", "accounts": ["instagram", "facebook"]}'),
    ('lead-scoring-automation', '{"lead_source": "website_form", "score_threshold": 75}')
) AS workflow_data(workflow_id, input_data)
CROSS JOIN (VALUES 
    ('webhook'), ('schedule'), ('manual'), ('api_call')
) AS triggers(trigger_type)
CROSS JOIN (VALUES 
    ('success'), ('success'), ('success'), ('error'), ('running')
) AS statuses(status)
CROSS JOIN (VALUES 
    ('{"result": "success", "data_processed": 156, "recommendations": 12}'),
    ('{"posts_created": 3, "scheduled_count": 8, "engagement_predicted": 4.2}'),
    ('{"optimization_score": 8.5, "changes_applied": 5, "performance_boost": "12%"}'),
    ('{"accounts_synced": 4, "new_posts": 23, "updated_metrics": 47}'),
    ('{"leads_scored": 89, "high_priority": 15, "notifications_sent": 12}')
) AS output_data_options(output_data)
CROSS JOIN (VALUES 
    ('API rate limit exceeded'),
    ('Invalid authentication token'),
    ('Network timeout'),
    ('Data validation failed'),
    ('Service temporarily unavailable')
) AS error_messages(error_message)
CROSS JOIN LATERAL (
    SELECT business_hours_timestamp(random_date_between('2024-01-01', '2024-06-22')) as execution_start
) AS timing
WHERE NOT EXISTS (
    SELECT 1 FROM workflow_executions 
    WHERE workflow_id = workflow_data.workflow_id 
    AND input_data::text = workflow_data.input_data
)
LIMIT 100; -- Generate 100 workflow executions

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
    (SELECT COUNT(*) FROM workflow_executions) as workflows_count,
    (SELECT COUNT(*) FROM ml_models) as ml_models_count,
    (SELECT COUNT(*) FROM products) as products_count;

-- Clean up helper functions
DROP FUNCTION IF EXISTS random_date_between(DATE, DATE);
DROP FUNCTION IF EXISTS business_hours_timestamp(DATE); 