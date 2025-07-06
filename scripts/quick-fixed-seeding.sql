-- Quick fix: Use likely correct status values
-- Based on defaults: status='draft', publish_status='draft'

INSERT INTO content_posts (
    content_type, platform, title, caption, hashtags, 
    publish_status, impressions, reach, engagement_rate, 
    clicks, shares, saves, comments, likes, 
    status, created_at, updated_at
) 
SELECT 
    'social_media_post',
    'instagram',
    '🚀 AI Content Strategy Tips',
    'Discover how AI transforms content creation. Smart tools revolutionize digital marketing. #ContentMarketing #AITools',
    '#ContentMarketing #AI #Growth',
    'published',
    5000, -- impressions
    4000, -- reach 
    4.5, -- engagement_rate
    150, -- clicks
    25, -- shares
    15, -- saves
    10, -- comments
    200, -- likes
    'draft', -- This is probably the correct status value
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM content_posts WHERE title = '🚀 AI Content Strategy Tips')

UNION ALL

SELECT 
    'social_media_post',
    'facebook', 
    '📊 Data-Driven Marketing',
    'Learn data-driven strategies for better ROI. Make informed decisions with analytics. #DataAnalytics #Marketing',
    '#DataAnalytics #Marketing #ROI',
    'draft',
    0, 0, 0, 0, 0, 0, 0, 0,
    'draft',
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM content_posts WHERE title = '📊 Data-Driven Marketing');

-- Check what we created
SELECT 'QUICK SEEDING RESULT' as info, COUNT(*) as new_posts FROM content_posts; 