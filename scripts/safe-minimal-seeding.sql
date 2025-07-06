-- SAFE MINIMAL SEEDING - uses only default/known-good values
-- This should work without constraint violations

-- First add some basic content posts using defaults
INSERT INTO content_posts (content_type, title, caption) 
VALUES 
('social_media_post', '🚀 AI Marketing Revolution', 'Discover how AI transforms marketing strategies. #AIMarketing #Innovation'),
('social_media_post', '📊 Data Analytics Mastery', 'Master data-driven decision making for business growth. #DataAnalytics #Business'),
('social_media_post', '💡 Content Strategy 2024', 'Future-proof your content with these proven strategies. #ContentStrategy #Marketing')
ON CONFLICT DO NOTHING;

-- Add some social accounts using minimal required fields
INSERT INTO social_accounts (platform, account_name, account_handle)
VALUES 
('instagram', 'Marketing Pro', 'marketing_pro_2024'),
('facebook', 'Business Growth Hub', 'business_growth_hub'),  
('linkedin', 'Content Experts', 'content_experts_official')
ON CONFLICT DO NOTHING;

-- Add basic campaigns
INSERT INTO campaigns (name, campaign_type)
VALUES 
('Spring Content Campaign', 'content_marketing'),
('Q2 Brand Awareness', 'brand_awareness'),
('Lead Generation Drive', 'lead_generation')
ON CONFLICT DO NOTHING;

-- Check what we created
SELECT 
    'SAFE SEEDING RESULTS' as info,
    (SELECT COUNT(*) FROM content_posts) as posts,
    (SELECT COUNT(*) FROM social_accounts) as accounts,
    (SELECT COUNT(*) FROM campaigns) as campaigns; 