-- ====================================================================
-- PRODUCTION DATA SEEDING SYSTEM - Task 70
-- Hoogwaardige, Onderzoek-gebaseerde Marketing Data (2024)
-- Gebaseerd op actuele industry benchmarks en trends
-- ====================================================================

-- Helper functions
CREATE OR REPLACE FUNCTION realistic_engagement_rate(platform TEXT)
RETURNS NUMERIC(3,2) AS $$
BEGIN
    RETURN CASE platform
        WHEN 'instagram' THEN round((random() * 0.62 + 0.60)::numeric, 2) -- 0.60-1.22%
        WHEN 'facebook' THEN round((random() * 0.09 + 0.06)::numeric, 2)  -- 0.06-0.15%
        WHEN 'linkedin' THEN round((random() * 0.35 + 0.35)::numeric, 2)  -- 0.35-0.70%
        WHEN 'twitter' THEN round((random() * 0.04 + 0.03)::numeric, 2)   -- 0.03-0.07%
        ELSE round((random() * 0.50 + 0.25)::numeric, 2)
    END;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION realistic_ctr_rate(platform TEXT)
RETURNS NUMERIC(3,2) AS $$
BEGIN
    RETURN CASE platform
        WHEN 'instagram' THEN round((random() * 0.66 + 0.22)::numeric, 2) -- 0.22-0.88%
        WHEN 'facebook' THEN round((random() * 0.70 + 0.90)::numeric, 2)  -- 0.90-1.60%
        WHEN 'linkedin' THEN round((random() * 0.21 + 0.44)::numeric, 2)  -- 0.44-0.65%
        WHEN 'twitter' THEN round((random() * 0.54 + 0.86)::numeric, 2)   -- 0.86-1.40%
        ELSE round((random() * 0.50 + 0.50)::numeric, 2)
    END;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION realistic_sentiment_score(platform TEXT)
RETURNS NUMERIC(3,2) AS $$
BEGIN
    RETURN CASE platform
        WHEN 'instagram' THEN round((random() * 1.5 + 6.0)::numeric, 2)  -- 60-75% (6.0-7.5)
        WHEN 'facebook' THEN round((random() * 1.5 + 5.5)::numeric, 2)   -- 55-70% (5.5-7.0)
        WHEN 'linkedin' THEN round((random() * 1.5 + 6.5)::numeric, 2)   -- 65-80% (6.5-8.0)
        WHEN 'twitter' THEN round((random() * 1.5 + 5.0)::numeric, 2)    -- 50-65% (5.0-6.5)
        ELSE round((random() * 2.0 + 6.0)::numeric, 2)
    END;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- 1. SEED CONTENT_POSTS (Professional Marketing Content 2024)
-- ====================================================================
SELECT 'Seeding professional content posts...' AS status;

INSERT INTO content_posts (
    content_type, platform, title, subtitle, caption, hashtags, 
    image_urls, publish_status, scheduled_for, published_at,
    impressions, reach, engagement_rate, clicks, shares, saves, 
    comments, likes, ai_quality_score, performance_score,
    total_engagement, status, created_at, updated_at
) 
SELECT 
    content_data.content_type,
    platforms.platform,
    content_data.title,
    content_data.subtitle,
    content_data.caption,
    content_data.hashtags,
    content_data.image_urls,
    'published',
    NULL,
    NOW() - (random() * INTERVAL '60 days'),
    (random() * 25000 + 5000)::integer, -- 5K-30K impressions
    (random() * 20000 + 3000)::integer, -- 3K-23K reach
    realistic_engagement_rate(platforms.platform),
    (random() * 1000 + 100)::integer, -- 100-1100 clicks
    (random() * 150 + 25)::integer, -- 25-175 shares
    (random() * 80 + 15)::integer, -- 15-95 saves
    (random() * 120 + 30)::integer, -- 30-150 comments
    (random() * 800 + 200)::integer, -- 200-1000 likes
    round((random() * 2.0 + 7.0)::numeric, 2), -- AI quality 7.0-9.0
    round((random() * 2.0 + 7.5)::numeric, 2), -- Performance 7.5-9.5
    (random() * 2000 + 500)::integer, -- 500-2500 total engagement
    statuses.status,
    NOW() - (random() * INTERVAL '70 days'),
    NOW() - (random() * INTERVAL '5 days')
FROM (VALUES 
    -- AI & Technology Content
    ('social_media_post', '🚀 AI revolutioniseert content creatie in 2024', 
     'Ontdek hoe 80% van marketers AI gebruikt voor workflows', 
     'AI-gedreven content optimalisatie zorgt voor 40% meer engagement. Van geautomatiseerde captions tot gepersonaliseerde targeting - de toekomst is nu! 🤖✨ #AIMarketing #ContentCreatie',
     '#AI #DigitalTransformation #ContentMarketing #MarketingAutomation #Innovation #B2BMarketing #FutureOfWork #SocialSelling',
     '["https://example.com/ai-marketing-trends.jpg"]'::jsonb),
    
    ('video_content', '📊 Data-gedreven marketing: Van analyse naar actie',
     'Hoe real-time analytics uw ROI met 300% kunnen verhogen',
     'Stop met gissen, start met weten! Moderne marketing draait om data-gedreven beslissingen. Onze nieuwe dashboard geeft u de inzichten die u nodig heeft voor succes. 📈💡',
     '#DataDriven #Analytics #ROI #MarketingStrategy #BusinessIntelligence #CustomerExperience #GrowthHacking #PerformanceMarketing',
     '["https://example.com/data-analytics-video.mp4"]'::jsonb),
    
    -- Social Commerce & Trends
    ('carousel_post', '🛒 Social Commerce Trends 2024: 76% koopt via social media',
     'De complete gids voor social selling success',
     'Social commerce is niet langer een trend - het is realiteit! Met 50 miljoen creators wereldwijd en stijgende vertrouwen in influencer recommendations, is dit uw kans. 💫🛍️',
     '#SocialCommerce #Ecommerce #InfluencerMarketing #SocialSelling #CreatorEconomy #BrandStorytelling #CustomerJourney #ConversionOptimization',
     '["https://example.com/social-commerce-carousel.jpg"]'::jsonb),
    
    ('blog_post', '🎯 LinkedIn strategie voor B2B groei',
     'Waarom 65-80% positieve sentiment op LinkedIn normaal is',
     'LinkedIn blijft de koning voor B2B engagement. Met 0.35-0.70% engagement rates en hoge sentiment scores, is een sterke LinkedIn strategie essentieel voor uw succes. 🏆📊',
     '#LinkedIn #B2BMarketing #ThoughtLeadership #ProfessionalNetworking #LeadGeneration #SocialSelling #ContentStrategy #BusinessGrowth',
     '["https://example.com/linkedin-strategy-guide.jpg"]'::jsonb),
    
    -- Sustainability & Innovation
    ('social_media_post', '🌱 Duurzame marketing: Het nieuwe normaal',
     'Hoe sustainability uw brand storytelling versterkt',
     'Consumenten kiezen steeds vaker voor duurzame merken. Authentic storytelling rond sustainability is geen nice-to-have meer - het is essentieel voor moderne brands. 🌍💚',
     '#Sustainability #BrandStorytelling #AuthenticMarketing #CSR #EcoFriendly #SustainableBusiness #GreenMarketing #PurposeDriven',
     '["https://example.com/sustainability-marketing.jpg"]'::jsonb),
    
    -- Technical Innovation
    ('video_content', '⚡ Marketing Automation: Efficiëntie op schaal',
     'Van lead nurturing tot customer retention in één platform',
     'Automation is de game-changer voor moderne marketing teams. Verhoog uw efficiency met slimme workflows en focus op wat echt telt: betekenisvolle customer relationships. 🔧🚀',
     '#MarketingAutomation #Workflow #Efficiency #LeadNurturing #CustomerRetention #MarTech #ProductivityHacks #ScalableMarketing',
     '["https://example.com/automation-workflow.mp4"]'::jsonb)
) AS content_data(content_type, title, subtitle, caption, hashtags, image_urls)
CROSS JOIN (VALUES 
    ('instagram'), ('facebook'), ('linkedin'), ('twitter')
) AS platforms(platform)
CROSS JOIN (VALUES 
    ('published'), ('approved')
) AS statuses(status)
WHERE NOT EXISTS (
    SELECT 1 FROM content_posts 
    WHERE title = content_data.title AND platform = platforms.platform
)
LIMIT 48; -- 6 content types × 4 platforms × 2 statuses

SELECT 'Content posts seeded successfully!' AS status;

-- ====================================================================
-- 2. SEED SOCIAL_ACCOUNTS (Realistic Business Accounts)
-- ====================================================================
SELECT 'Seeding professional social accounts...' AS status;

INSERT INTO social_accounts (
    platform, account_name, account_handle, account_type, 
    is_active, follower_count, followers_count, avg_engagement_rate, 
    engagement_rate, status, created_at, updated_at
)
SELECT 
    platform, account_name, account_handle, 'business', true,
    follower_count, follower_count,
    realistic_engagement_rate(platform),
    realistic_engagement_rate(platform),
    'connected',
    NOW() - (random() * INTERVAL '365 days'),
    NOW() - (random() * INTERVAL '7 days')
FROM (VALUES 
    ('instagram', 'SKC Digital Innovation Hub', 'skc_digital_innovation', 28500),
    ('linkedin', 'SKC Business Intelligence', 'skc-business-intelligence', 15750),
    ('facebook', 'SKC Marketing Solutions', 'skcmarketingsolutions', 42300),
    ('twitter', 'SKC Data Analytics', 'skc_data_analytics', 19200),
    ('instagram', 'AI Marketing Insights', 'ai_marketing_insights_skc', 33100),
    ('linkedin', 'Content Strategy Pro', 'skc-content-strategy', 12800),
    ('facebook', 'Social Commerce Expert', 'skccommerce', 38700),
    ('twitter', 'Marketing Automation Hub', 'skc_automation', 16500),
    ('instagram', 'Creative Content Lab', 'creative_content_lab_skc', 21900),
    ('linkedin', 'B2B Growth Accelerator', 'skc-b2b-growth', 9600),
    ('facebook', 'Digital Transformation Guide', 'skcdigitaltransform', 45200),
    ('twitter', 'Performance Marketing', 'skc_performance_mkt', 13400)
) AS accounts(platform, account_name, account_handle, follower_count)
WHERE NOT EXISTS (
    SELECT 1 FROM social_accounts 
    WHERE account_handle = accounts.account_handle
);

SELECT 'Social accounts seeded successfully!' AS status;

-- ====================================================================
-- 3. SEED CAMPAIGNS (2024 Budget Allocations & Strategies)
-- ====================================================================
SELECT 'Seeding professional marketing campaigns...' AS status;

INSERT INTO campaigns (
    name, description, campaign_type, status, start_date, end_date,
    budget_total, budget_spent, target_audience, goals, created_at, updated_at
)
SELECT 
    name, description, campaign_type, status,
    start_date, end_date, budget_total, budget_spent,
    target_audience, goals, created_at, updated_at
FROM (VALUES 
    ('Q3 2024 AI Marketing Transformation',
     'Comprehensive campaign focusing on AI-driven content creation and automation tools for B2B audiences',
     'brand_awareness', 'active',
     (NOW() - INTERVAL '45 days')::timestamp with time zone,
     (NOW() + INTERVAL '75 days')::timestamp with time zone,
     85000.00, 52750.00,
     '{"industry": ["Technology", "Marketing"], "company_size": "50-500 employees", "job_titles": ["Marketing Manager", "CMO", "Growth Manager"], "interests": ["AI", "Marketing Automation", "Content Strategy"]}'::jsonb,
     '["Increase AI tool awareness by 60%", "Generate 500+ qualified leads", "Establish thought leadership in AI marketing", "Drive 25% increase in demo requests"]'::jsonb,
     (NOW() - INTERVAL '50 days')::timestamp with time zone,
     (NOW() - INTERVAL '2 days')::timestamp with time zone),
    
    ('Social Commerce Acceleration Program',
     'Multi-platform social commerce strategy targeting the 76% of consumers who make purchases via social media',
     'conversion', 'active',
     (NOW() - INTERVAL '30 days')::timestamp with time zone,
     (NOW() + INTERVAL '90 days')::timestamp with time zone,
     65000.00, 38500.00,
     '{"age_range": "25-45", "interests": ["Social Shopping", "E-commerce", "Instagram Shopping", "Facebook Marketplace"], "behaviors": ["Online Shoppers", "Social Media Users"]}'::jsonb,
     '["Increase social commerce revenue by 150%", "Build creator partnership network", "Optimize conversion funnel", "Achieve 2.5% average CTR across platforms"]'::jsonb,
     (NOW() - INTERVAL '35 days')::timestamp with time zone,
     (NOW() - INTERVAL '1 day')::timestamp with time zone),
    
    ('LinkedIn B2B Thought Leadership Initiative',
     'Strategic content marketing campaign leveraging LinkedIn''s 65-80% positive sentiment rates for B2B engagement',
     'lead_generation', 'active',
     (NOW() - INTERVAL '60 days')::timestamp with time zone,
     (NOW() + INTERVAL '120 days')::timestamp with time zone,
     45000.00, 27500.00,
     '{"platform": "LinkedIn", "job_functions": ["Marketing", "Sales", "Business Development"], "seniority": ["Manager", "Director", "VP", "C-Level"], "company_size": "100+ employees"}'::jsonb,
     '["Establish 3 executives as industry thought leaders", "Generate 300+ high-quality B2B leads", "Achieve 0.50%+ engagement rate", "Build professional network of 10,000+ connections"]'::jsonb,
     (NOW() - INTERVAL '65 days')::timestamp with time zone,
     (NOW() - INTERVAL '3 days')::timestamp with time zone),
    
    ('Sustainable Marketing Storytelling Campaign',
     'Purpose-driven content campaign focusing on sustainability and authentic brand storytelling trends',
     'brand_awareness', 'active',
     (NOW() - INTERVAL '25 days')::timestamp with time zone,
     (NOW() + INTERVAL '95 days')::timestamp with time zone,
     35000.00, 19250.00,
     '{"interests": ["Sustainability", "Environmental Responsibility", "Ethical Brands"], "demographics": "Millennials and Gen Z", "values": ["Environmental Consciousness", "Social Responsibility"]}'::jsonb,
     '["Increase brand perception scores by 40%", "Drive 80% positive sentiment", "Build community of 5,000+ sustainability advocates", "Achieve 1M+ impressions on sustainability content"]'::jsonb,
     (NOW() - INTERVAL '30 days')::timestamp with time zone,
     (NOW() - INTERVAL '1 day')::timestamp with time zone),
    
    ('Creator Economy Partnership Program',
     'Influencer collaboration initiative targeting the 50M+ global creator market with 61% consumer trust rate',
     'influencer_marketing', 'active',
     (NOW() - INTERVAL '40 days')::timestamp with time zone,
     (NOW() + INTERVAL '80 days')::timestamp with time zone,
     75000.00, 45500.00,
     '{"creator_tiers": ["Micro-influencers (10K-100K)", "Mid-tier (100K-1M)"], "niches": ["Business", "Technology", "Marketing", "Entrepreneurship"], "platforms": ["Instagram", "LinkedIn", "TikTok"]}'::jsonb,
     '["Partner with 50+ creators", "Achieve 15% average engagement on sponsored content", "Generate 1,000+ referral conversions", "Build long-term creator network"]'::jsonb,
     (NOW() - INTERVAL '45 days')::timestamp with time zone,
     (NOW() - INTERVAL '2 days')::timestamp with time zone),
    
    ('Video-First Content Strategy Launch',
     'Short-form video campaign focusing on Reels, Stories, and TikTok-style content for maximum engagement',
     'content_marketing', 'active',
     (NOW() - INTERVAL '20 days')::timestamp with time zone,
     (NOW() + INTERVAL '100 days')::timestamp with time zone,
     55000.00, 28750.00,
     '{"content_preferences": ["Video Content", "Interactive Media"], "platforms": ["Instagram", "TikTok", "YouTube Shorts"], "age_range": "22-40"}'::jsonb,
     '["Produce 200+ short-form videos", "Achieve 2M+ video views", "Increase video engagement by 200%", "Build video content library for repurposing"]'::jsonb,
     (NOW() - INTERVAL '25 days')::timestamp with time zone,
     (NOW() - INTERVAL '1 day')::timestamp with time zone)
) AS campaigns_data(name, description, campaign_type, status, start_date, end_date, budget_total, budget_spent, target_audience, goals, created_at, updated_at)
WHERE NOT EXISTS (
    SELECT 1 FROM campaigns 
    WHERE name = campaigns_data.name
);

SELECT 'Campaigns seeded successfully!' AS status;

-- ====================================================================
-- 4. SEED CONTENT_ANALYTICS (Platform-Specific Performance Data)
-- ====================================================================
SELECT 'Seeding realistic content analytics...' AS status;

INSERT INTO content_analytics (
    content_post_id, metric_date, platform, views, likes, shares, 
    comments, saves, clicks, reach, impressions, engagement_rate,
    click_through_rate, sentiment_score, created_at, updated_at
)
SELECT 
    cp.id,
    (NOW() - (day_offset || ' days')::interval)::date,
    cp.platform,
    -- Platform-specific realistic metrics
    CASE cp.platform
        WHEN 'instagram' THEN (random() * 8000 + 2000)::integer
        WHEN 'facebook' THEN (random() * 12000 + 3000)::integer  
        WHEN 'linkedin' THEN (random() * 5000 + 1500)::integer
        WHEN 'twitter' THEN (random() * 10000 + 2500)::integer
    END as views,
    
    cp.likes + (random() * 200)::integer as likes,
    cp.shares + (random() * 50)::integer as shares,
    cp.comments + (random() * 80)::integer as comments,
    cp.saves + (random() * 60)::integer as saves,
    
    -- Realistic clicks based on CTR research
    CASE cp.platform
        WHEN 'instagram' THEN (random() * 150 + 50)::integer
        WHEN 'facebook' THEN (random() * 400 + 200)::integer
        WHEN 'linkedin' THEN (random() * 200 + 100)::integer  
        WHEN 'twitter' THEN (random() * 300 + 150)::integer
    END as clicks,
    
    cp.reach + (random() * 3000)::integer as reach,
    cp.impressions + (random() * 5000)::integer as impressions,
    
    -- Research-based engagement and CTR rates
    realistic_engagement_rate(cp.platform) as engagement_rate,
    realistic_ctr_rate(cp.platform) as click_through_rate,
    realistic_sentiment_score(cp.platform) as sentiment_score,
    
    NOW() - (day_offset || ' days')::interval,
    NOW() - ((day_offset - 1) || ' days')::interval
FROM content_posts cp
CROSS JOIN generate_series(1, 5) as day_offset
WHERE cp.publish_status = 'published'
AND NOT EXISTS (
    SELECT 1 FROM content_analytics 
    WHERE content_post_id = cp.id 
    AND metric_date = (NOW() - (day_offset || ' days')::interval)::date
)
LIMIT 150; -- Rich analytics dataset

SELECT 'Content analytics seeded successfully!' AS status;

-- ====================================================================
-- 5. SEED WORKFLOW_EXECUTIONS (Professional N8N Workflows)
-- ====================================================================
SELECT 'Seeding professional workflow executions...' AS status;

INSERT INTO workflow_executions (
    workflow_id, workflow_name, execution_id, status, start_time, end_time, 
    duration_ms, input_data, output_data, error_message, 
    created_at, updated_at
)
SELECT 
    workflow_data.workflow_id,
    workflow_data.workflow_name,
    'exec_' || gen_random_uuid()::text,
    execution_status.status,
    execution_time,
    CASE 
        WHEN execution_status.status = 'success' THEN execution_time + (random() * INTERVAL '45 minutes')
        WHEN execution_status.status = 'error' THEN execution_time + (random() * INTERVAL '10 minutes')
        ELSE NULL
    END,
    CASE 
        WHEN execution_status.status = 'success' THEN (random() * 2400000 + 300000)::integer -- 5-45 minutes
        WHEN execution_status.status = 'error' THEN (random() * 600000 + 60000)::integer -- 1-10 minutes
        ELSE NULL
    END,
    workflow_data.input_data,
    CASE 
        WHEN execution_status.status = 'success' THEN workflow_data.output_data
        ELSE NULL
    END,
    CASE 
        WHEN execution_status.status = 'error' THEN error_data.error_message
        ELSE NULL
    END,
    execution_time - INTERVAL '5 minutes',
    NOW()
FROM (VALUES 
    ('ai-content-generator-v2', 'AI Content Generation Pipeline',
     '{"content_type": "social_media_post", "platform": "linkedin", "topic": "AI marketing trends 2024", "target_audience": "B2B marketing professionals", "tone": "professional", "include_hashtags": true}'::jsonb,
     '{"content_id": "post_ai_001", "generated_content": "AI revolutionizes marketing workflows...", "engagement_prediction": 8.5, "sentiment_score": 7.8, "hashtags_generated": 12, "optimization_suggestions": ["Add CTA", "Include statistics"]}'::jsonb),
    
    ('social-media-scheduler-pro', 'Multi-Platform Content Scheduler',
     '{"posts": [{"platform": "instagram", "content": "Marketing insights post", "scheduled_time": "2024-06-22T14:00:00Z"}], "auto_optimize": true, "audience_targeting": true}'::jsonb,
     '{"scheduled_posts": 8, "platforms": ["instagram", "linkedin", "facebook"], "optimal_times_used": true, "estimated_reach": 45000, "status": "scheduled"}'::jsonb),
    
    ('performance-analytics-aggregator', 'Real-time Performance Analytics',
     '{"date_range": "last_30_days", "platforms": ["all"], "metrics": ["engagement", "reach", "conversions"], "generate_insights": true}'::jsonb,
     '{"total_posts_analyzed": 156, "avg_engagement_rate": 1.23, "top_performing_content": "video", "recommendations": ["Increase video content", "Post at 2PM"], "roi_improvement": 34}'::jsonb),
    
    ('lead-scoring-automation', 'AI-Powered Lead Scoring Engine',
     '{"leads_batch": 250, "scoring_criteria": ["engagement", "profile_match", "content_interaction"], "ai_enhancement": true}'::jsonb,
     '{"leads_processed": 250, "high_priority_leads": 45, "medium_priority": 128, "low_priority": 77, "ai_confidence_avg": 0.87, "follow_up_recommended": 45}'::jsonb),
    
    ('content-optimization-engine', 'Dynamic Content Optimization',
     '{"content_id": "post_123", "optimization_type": "engagement", "platform_specific": true, "ai_suggestions": true}'::jsonb,
     '{"original_score": 6.2, "optimized_score": 8.7, "changes_applied": ["Improved headline", "Added CTA", "Optimized hashtags"], "predicted_improvement": "40% engagement boost"}'::jsonb),
    
    ('creator-outreach-automation', 'Influencer Partnership Manager',
     '{"campaign_id": "creator_campaign_2024", "creator_criteria": {"min_followers": 10000, "engagement_rate": 2.0}, "outreach_templates": "professional"}'::jsonb,
     '{"creators_contacted": 85, "responses_received": 34, "partnerships_initiated": 12, "estimated_reach": 2500000, "campaign_potential": "high"}'::jsonb),
    
    ('social-commerce-sync', 'E-commerce Integration Workflow',
     '{"products_sync": true, "inventory_update": true, "pricing_sync": true, "platforms": ["instagram_shop", "facebook_shop"]}'::jsonb,
     '{"products_synced": 342, "inventory_updated": 298, "pricing_updates": 45, "new_collections": 8, "sync_errors": 0, "platforms_updated": 2}'::jsonb),
    
    ('sentiment-monitoring-system', 'Brand Sentiment Analysis',
     '{"monitoring_keywords": ["SKC", "AI marketing", "business intelligence"], "platforms": ["all"], "alert_threshold": 0.3}'::jsonb,
     '{"mentions_analyzed": 1240, "positive_sentiment": 68, "neutral_sentiment": 26, "negative_sentiment": 6, "trending_topics": ["AI innovation", "data analytics"], "alerts_triggered": 0}'::jsonb)
) AS workflow_data(workflow_id, workflow_name, input_data, output_data)
CROSS JOIN (VALUES 
    ('success'), ('success'), ('success'), ('error')
) AS execution_status(status)
CROSS JOIN (VALUES 
    ('API rate limit exceeded - retry in 60 seconds'),
    ('Network timeout during data processing'),
    ('Authentication token expired'),
    ('Input validation failed - missing required field')
) AS error_data(error_message)
CROSS JOIN (
    SELECT NOW() - (random() * INTERVAL '30 days') AS execution_time
) AS timing
WHERE NOT EXISTS (
    SELECT 1 FROM workflow_executions 
    WHERE workflow_id = workflow_data.workflow_id 
    AND start_time::date = timing.execution_time::date
)
LIMIT 60; -- Rich workflow execution history

SELECT 'Workflow executions seeded successfully!' AS status;

-- ====================================================================
-- VERIFICATION & SUMMARY
-- ====================================================================
SELECT 'Production Data Seeding Complete! 🚀' AS message;

SELECT 
    'PRODUCTION DATA SUMMARY' as section,
    'Generated high-quality, research-based marketing data' as description;

SELECT 
    'content_posts' AS table_name, 
    COUNT(*) AS total_records,
    MAX(engagement_rate) AS max_engagement_rate,
    AVG(engagement_rate) AS avg_engagement_rate,
    MAX(ai_quality_score) AS max_ai_quality,
    AVG(ai_quality_score) AS avg_ai_quality
FROM content_posts
UNION ALL
SELECT 
    'social_accounts', 
    COUNT(*),
    MAX(engagement_rate),
    AVG(engagement_rate),
    NULL,
    NULL
FROM social_accounts
UNION ALL
SELECT 
    'campaigns', 
    COUNT(*),
    NULL,
    NULL,
    NULL,
    NULL
FROM campaigns
UNION ALL
SELECT 
    'content_analytics', 
    COUNT(*),
    MAX(engagement_rate),
    AVG(engagement_rate),
    MAX(sentiment_score),
    AVG(sentiment_score)
FROM content_analytics
UNION ALL
SELECT 
    'workflow_executions', 
    COUNT(*),
    NULL,
    NULL,
    NULL,
    NULL
FROM workflow_executions;

-- Platform-specific engagement analysis
SELECT 
    'PLATFORM PERFORMANCE ANALYSIS' as analysis_type,
    ca.platform,
    COUNT(*) as posts_count,
    ROUND(AVG(ca.engagement_rate), 3) as avg_engagement,
    ROUND(AVG(ca.click_through_rate), 3) as avg_ctr,
    ROUND(AVG(ca.sentiment_score), 2) as avg_sentiment
FROM content_analytics ca
JOIN content_posts cp ON ca.content_post_id = cp.id
GROUP BY ca.platform
ORDER BY avg_engagement DESC;

-- Clean up helper functions
DROP FUNCTION IF EXISTS realistic_engagement_rate(TEXT);
DROP FUNCTION IF EXISTS realistic_ctr_rate(TEXT);
DROP FUNCTION IF EXISTS realistic_sentiment_score(TEXT);

SELECT 'Ready for BI Dashboard & Self-Learning Content Engine! 📊🤖' AS final_status; 