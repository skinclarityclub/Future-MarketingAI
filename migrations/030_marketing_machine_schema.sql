-- ====================================================================
-- Marketing Machine Platform Database Schema
-- Task 36.1: Marketing Machine Database Schema
-- ====================================================================
-- This migration creates the comprehensive database schema for the Marketing Machine platform
-- that automates content creation from idea to publication

-- ====================================================================
-- 1. Enhanced Content Posts Table
-- ====================================================================
-- Enhanced version of content_posts for Marketing Machine functionality
CREATE TABLE IF NOT EXISTS content_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    content_type VARCHAR(50) NOT NULL CHECK (
        content_type IN ('post', 'story', 'video', 'carousel', 'reel', 'email', 'ad', 'article', 'blog', 'newsletter')
    ),
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (
        status IN ('draft', 'scheduled', 'publishing', 'published', 'failed', 'archived', 'review_pending', 'approved', 'rejected')
    ),
    
    -- Content Metadata
    excerpt TEXT,
    featured_image_url TEXT,
    media_urls JSONB DEFAULT '[]', -- Array of media URLs
    hashtags JSONB DEFAULT '[]', -- Array of hashtags
    mentions JSONB DEFAULT '[]', -- Array of mentions
    
    -- Scheduling
    scheduled_date TIMESTAMPTZ,
    scheduled_time TIME,
    published_at TIMESTAMPTZ,
    
    -- Platform Targeting
    target_platforms JSONB NOT NULL DEFAULT '[]', -- Array of platform names
    platform_specific_content JSONB DEFAULT '{}', -- Platform-specific content variations
    
    -- AI & Analytics
    ai_generated BOOLEAN DEFAULT false,
    ai_prompt TEXT, -- Original AI prompt if generated
    engagement_prediction DECIMAL(5,2), -- Predicted engagement score (0-100)
    target_audience VARCHAR(100),
    content_category VARCHAR(50),
    tone VARCHAR(50) CHECK (tone IN ('professional', 'casual', 'humorous', 'educational', 'promotional', 'inspirational')),
    
    -- Workflow
    author_id UUID,
    approver_id UUID,
    campaign_id UUID, -- Link to marketing campaigns
    parent_post_id UUID, -- For A/B testing variants (constraint added later)
    is_ab_test BOOLEAN DEFAULT false,
    
    -- Performance Tracking
    total_engagement INTEGER DEFAULT 0,
    total_reach INTEGER DEFAULT 0,
    total_impressions INTEGER DEFAULT 0,
    performance_score DECIMAL(5,2), -- Calculated performance score
    
    -- System Fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    version INTEGER DEFAULT 1
);

-- ====================================================================
-- 2. Social Accounts Management Table
-- ====================================================================
CREATE TABLE IF NOT EXISTS social_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    account_name VARCHAR(255) NOT NULL,
    platform VARCHAR(50) NOT NULL CHECK (
        platform IN ('facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok', 'pinterest', 'snapchat')
    ),
    
    -- Account Details
    platform_account_id VARCHAR(255) NOT NULL, -- Platform's unique identifier
    username VARCHAR(255),
    display_name VARCHAR(255),
    profile_picture_url TEXT,
    bio TEXT,
    website_url TEXT,
    
    -- Connection Status
    status VARCHAR(50) NOT NULL DEFAULT 'disconnected' CHECK (
        status IN ('connected', 'disconnected', 'error', 'syncing', 'expired', 'pending_approval')
    ),
    connection_error TEXT,
    last_sync_at TIMESTAMPTZ,
    next_sync_at TIMESTAMPTZ,
    
    -- Authentication
    access_token TEXT, -- Encrypted in application layer
    refresh_token TEXT, -- Encrypted in application layer
    token_expires_at TIMESTAMPTZ,
    
    -- Account Metrics
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    average_likes INTEGER DEFAULT 0,
    average_comments INTEGER DEFAULT 0,
    average_shares INTEGER DEFAULT 0,
    
    -- Publishing Settings
    posting_enabled BOOLEAN DEFAULT true,
    auto_posting_enabled BOOLEAN DEFAULT false,
    posting_schedule JSONB DEFAULT '{}', -- Schedule configuration
    content_approval_required BOOLEAN DEFAULT true,
    
    -- Business Info
    account_type VARCHAR(50) CHECK (account_type IN ('personal', 'business', 'creator')),
    business_category VARCHAR(100),
    is_verified BOOLEAN DEFAULT false,
    country VARCHAR(50),
    timezone VARCHAR(50),
    
    -- System Fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(platform, platform_account_id)
);

-- ====================================================================
-- 3. Content Calendar Table
-- ====================================================================
CREATE TABLE IF NOT EXISTS content_calendar (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Calendar Entry Details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    calendar_date DATE NOT NULL,
    time_slot TIME,
    duration_minutes INTEGER DEFAULT 0,
    
    -- Content Association
    content_post_id UUID REFERENCES content_posts(id) ON DELETE SET NULL,
    content_type VARCHAR(50) NOT NULL CHECK (
        content_type IN ('post', 'story', 'video', 'live', 'campaign', 'email', 'ad', 'event', 'reminder')
    ),
    
    -- Platform & Account Targeting
    target_platforms JSONB NOT NULL DEFAULT '[]',
    target_accounts JSONB DEFAULT '[]', -- Specific social account IDs
    
    -- Status & Workflow
    status VARCHAR(50) NOT NULL DEFAULT 'planned' CHECK (
        status IN ('planned', 'in_progress', 'ready', 'scheduled', 'published', 'cancelled', 'missed')
    ),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    -- AI & Automation
    auto_generated BOOLEAN DEFAULT false,
    ai_suggestions JSONB DEFAULT '{}', -- AI-powered content suggestions
    recurring_pattern JSONB DEFAULT '{}', -- For recurring content
    is_recurring BOOLEAN DEFAULT false,
    parent_calendar_id UUID REFERENCES content_calendar(id), -- For recurring entries
    
    -- Campaign Association
    campaign_id UUID,
    campaign_phase VARCHAR(50),
    
    -- Team & Responsibility
    assigned_to UUID, -- User ID
    creator_id UUID, -- User ID
    reviewer_id UUID, -- User ID
    
    -- Analytics & Planning
    expected_engagement INTEGER,
    target_audience VARCHAR(100),
    content_theme VARCHAR(100),
    seasonal_tag VARCHAR(50),
    
    -- Notes & Metadata
    notes TEXT,
    tags JSONB DEFAULT '[]',
    attachments JSONB DEFAULT '[]',
    
    -- System Fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 4. Content Analytics Table
-- ====================================================================
CREATE TABLE IF NOT EXISTS content_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Content Association
    content_post_id UUID NOT NULL REFERENCES content_posts(id) ON DELETE CASCADE,
    social_account_id UUID REFERENCES social_accounts(id) ON DELETE SET NULL,
    platform VARCHAR(50) NOT NULL,
    platform_post_id VARCHAR(255), -- Platform's unique post identifier
    
    -- Publishing Details
    published_at TIMESTAMPTZ NOT NULL,
    content_type VARCHAR(50) NOT NULL,
    content_category VARCHAR(100),
    hashtags_used JSONB DEFAULT '[]',
    
    -- Engagement Metrics
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    saves_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    video_views INTEGER DEFAULT 0,
    video_completion_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Reach & Impressions
    impressions INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    organic_reach INTEGER DEFAULT 0,
    paid_reach INTEGER DEFAULT 0,
    
    -- Engagement Rates
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    click_through_rate DECIMAL(5,2) DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Time-based Analytics
    peak_engagement_time TIMESTAMPTZ,
    engagement_by_hour JSONB DEFAULT '{}', -- Hourly engagement breakdown
    engagement_velocity DECIMAL(10,2) DEFAULT 0, -- Engagement per hour
    
    -- Audience Analytics
    audience_demographics JSONB DEFAULT '{}',
    audience_interests JSONB DEFAULT '{}',
    audience_location JSONB DEFAULT '{}',
    new_followers INTEGER DEFAULT 0,
    
    -- Performance Scoring
    performance_score DECIMAL(5,2) DEFAULT 0, -- 0-100 calculated score
    viral_potential DECIMAL(5,2) DEFAULT 0,
    quality_score DECIMAL(5,2) DEFAULT 0,
    
    -- Business Metrics
    website_clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    revenue_generated DECIMAL(10,2) DEFAULT 0,
    cost_per_engagement DECIMAL(10,2) DEFAULT 0,
    roi DECIMAL(10,2) DEFAULT 0,
    
    -- Competitive Analysis
    competitor_performance JSONB DEFAULT '{}',
    industry_benchmark JSONB DEFAULT '{}',
    ranking_position INTEGER,
    
    -- System Fields
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    data_source VARCHAR(50) NOT NULL DEFAULT 'api',
    is_final BOOLEAN DEFAULT false, -- False for real-time updates, true for final daily/weekly reports
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(content_post_id, platform, platform_post_id)
);

-- ====================================================================
-- 5. Content Research Table
-- ====================================================================
CREATE TABLE IF NOT EXISTS content_research (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Research Details
    research_type VARCHAR(50) NOT NULL CHECK (
        research_type IN ('trend_analysis', 'competitor_analysis', 'keyword_research', 'audience_insights', 'hashtag_research', 'content_gap', 'viral_content', 'industry_news')
    ),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Research Data
    research_query TEXT NOT NULL,
    research_results JSONB NOT NULL DEFAULT '{}',
    confidence_score DECIMAL(5,2) DEFAULT 0, -- 0-100 confidence in results
    data_sources JSONB DEFAULT '[]', -- Array of data sources used
    
    -- Content Insights
    trending_topics JSONB DEFAULT '[]',
    recommended_hashtags JSONB DEFAULT '[]',
    optimal_posting_times JSONB DEFAULT '{}',
    content_suggestions JSONB DEFAULT '[]',
    
    -- Competitive Intelligence
    competitor_accounts JSONB DEFAULT '[]',
    competitor_performance JSONB DEFAULT '{}',
    market_gaps JSONB DEFAULT '[]',
    opportunity_score DECIMAL(5,2) DEFAULT 0,
    
    -- Target Audience
    target_platforms JSONB DEFAULT '[]',
    audience_segments JSONB DEFAULT '[]',
    demographic_insights JSONB DEFAULT '{}',
    behavioral_patterns JSONB DEFAULT '{}',
    
    -- Content Planning
    content_ideas JSONB DEFAULT '[]',
    content_calendar_suggestions JSONB DEFAULT '[]',
    campaign_recommendations JSONB DEFAULT '{}',
    
    -- Performance Prediction
    engagement_prediction JSONB DEFAULT '{}',
    reach_prediction JSONB DEFAULT '{}',
    success_probability DECIMAL(5,2) DEFAULT 0,
    
    -- Research Metadata
    research_period_start DATE,
    research_period_end DATE,
    geographic_scope JSONB DEFAULT '[]',
    language_scope JSONB DEFAULT '["en"]',
    industry_focus VARCHAR(100),
    
    -- AI & Automation
    ai_generated BOOLEAN DEFAULT false,
    ai_model_used VARCHAR(100),
    research_automation_level VARCHAR(50) CHECK (
        research_automation_level IN ('manual', 'semi_automated', 'fully_automated')
    ),
    
    -- Usage Tracking
    applied_to_content JSONB DEFAULT '[]', -- Content post IDs that used this research
    effectiveness_score DECIMAL(5,2), -- How effective the research was
    usage_count INTEGER DEFAULT 0,
    
    -- System Fields
    created_by UUID, -- User ID
    expires_at TIMESTAMPTZ, -- When research becomes stale
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 6. Learning Patterns Table (AI/ML)
-- ====================================================================
CREATE TABLE IF NOT EXISTS learning_patterns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Pattern Identification
    pattern_type VARCHAR(50) NOT NULL CHECK (
        pattern_type IN ('engagement_timing', 'content_performance', 'audience_behavior', 'hashtag_effectiveness', 'platform_optimization', 'seasonal_trends', 'viral_indicators', 'conversion_patterns')
    ),
    pattern_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Pattern Data
    pattern_data JSONB NOT NULL DEFAULT '{}',
    pattern_rules JSONB DEFAULT '{}', -- Business rules derived from the pattern
    confidence_level DECIMAL(5,2) NOT NULL DEFAULT 0, -- 0-100 confidence
    statistical_significance DECIMAL(5,2) DEFAULT 0,
    sample_size INTEGER DEFAULT 0,
    
    -- Context & Scope
    applicable_platforms JSONB DEFAULT '[]',
    applicable_content_types JSONB DEFAULT '[]',
    applicable_audiences JSONB DEFAULT '[]',
    geographic_scope JSONB DEFAULT '[]',
    temporal_scope JSONB DEFAULT '{}', -- Time periods when pattern applies
    
    -- Pattern Performance
    success_rate DECIMAL(5,2) DEFAULT 0,
    improvement_factor DECIMAL(10,2) DEFAULT 0, -- How much improvement this pattern provides
    implementation_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    
    -- Learning Metadata
    data_source VARCHAR(50) NOT NULL CHECK (
        data_source IN ('content_analytics', 'user_behavior', 'market_research', 'competitor_analysis', 'platform_api', 'manual_input')
    ),
    learning_algorithm VARCHAR(100), -- ML algorithm used to discover pattern
    training_period_start DATE,
    training_period_end DATE,
    last_validation_date DATE,
    
    -- Pattern Validation
    validation_status VARCHAR(50) DEFAULT 'pending' CHECK (
        validation_status IN ('pending', 'validated', 'rejected', 'needs_review', 'deprecated')
    ),
    validation_results JSONB DEFAULT '{}',
    a_b_test_results JSONB DEFAULT '{}',
    
    -- Business Impact
    impact_score DECIMAL(5,2) DEFAULT 0, -- Business impact score 0-100
    revenue_impact DECIMAL(10,2) DEFAULT 0,
    engagement_impact DECIMAL(10,2) DEFAULT 0,
    reach_impact DECIMAL(10,2) DEFAULT 0,
    efficiency_impact DECIMAL(5,2) DEFAULT 0,
    
    -- Recommendations
    recommended_actions JSONB DEFAULT '[]',
    implementation_guidelines TEXT,
    risk_factors JSONB DEFAULT '[]',
    success_metrics JSONB DEFAULT '[]',
    
    -- Pattern Evolution
    parent_pattern_id UUID REFERENCES learning_patterns(id), -- For evolved patterns
    version INTEGER DEFAULT 1,
    superseded_by UUID REFERENCES learning_patterns(id), -- If pattern is replaced
    
    -- System Fields
    discovered_by VARCHAR(50) DEFAULT 'ai', -- 'ai', 'analyst', 'automatic'
    created_by UUID, -- User ID if manually created
    last_applied TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(pattern_name, version)
);

-- ====================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ====================================================================

-- Content Posts Indexes
CREATE INDEX IF NOT EXISTS idx_content_posts_status ON content_posts(status);
CREATE INDEX IF NOT EXISTS idx_content_posts_scheduled_date ON content_posts(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_content_posts_published_at ON content_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_content_posts_campaign_id ON content_posts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_content_posts_target_platforms ON content_posts USING gin(target_platforms);
CREATE INDEX IF NOT EXISTS idx_content_posts_hashtags ON content_posts USING gin(hashtags);
CREATE INDEX IF NOT EXISTS idx_content_posts_content_type ON content_posts(content_type);
CREATE INDEX IF NOT EXISTS idx_content_posts_performance_score ON content_posts(performance_score);

-- Social Accounts Indexes
CREATE INDEX IF NOT EXISTS idx_social_accounts_platform ON social_accounts(platform);
CREATE INDEX IF NOT EXISTS idx_social_accounts_status ON social_accounts(status);
CREATE INDEX IF NOT EXISTS idx_social_accounts_last_sync ON social_accounts(last_sync_at);
CREATE INDEX IF NOT EXISTS idx_social_accounts_engagement_rate ON social_accounts(engagement_rate);
CREATE INDEX IF NOT EXISTS idx_social_accounts_followers ON social_accounts(followers_count);

-- Content Calendar Indexes
CREATE INDEX IF NOT EXISTS idx_content_calendar_date ON content_calendar(calendar_date);
CREATE INDEX IF NOT EXISTS idx_content_calendar_status ON content_calendar(status);
CREATE INDEX IF NOT EXISTS idx_content_calendar_content_post_id ON content_calendar(content_post_id);
CREATE INDEX IF NOT EXISTS idx_content_calendar_target_platforms ON content_calendar USING gin(target_platforms);
CREATE INDEX IF NOT EXISTS idx_content_calendar_assigned_to ON content_calendar(assigned_to);
CREATE INDEX IF NOT EXISTS idx_content_calendar_campaign_id ON content_calendar(campaign_id);

-- Content Analytics Indexes
CREATE INDEX IF NOT EXISTS idx_content_analytics_content_post_id ON content_analytics(content_post_id);
CREATE INDEX IF NOT EXISTS idx_content_analytics_platform ON content_analytics(platform);
CREATE INDEX IF NOT EXISTS idx_content_analytics_published_at ON content_analytics(published_at);
CREATE INDEX IF NOT EXISTS idx_content_analytics_performance_score ON content_analytics(performance_score);
CREATE INDEX IF NOT EXISTS idx_content_analytics_engagement_rate ON content_analytics(engagement_rate);
CREATE INDEX IF NOT EXISTS idx_content_analytics_reach ON content_analytics(reach);
CREATE INDEX IF NOT EXISTS idx_content_analytics_social_account_id ON content_analytics(social_account_id);

-- Content Research Indexes
CREATE INDEX IF NOT EXISTS idx_content_research_type ON content_research(research_type);
CREATE INDEX IF NOT EXISTS idx_content_research_confidence ON content_research(confidence_score);
CREATE INDEX IF NOT EXISTS idx_content_research_created_at ON content_research(created_at);
CREATE INDEX IF NOT EXISTS idx_content_research_expires_at ON content_research(expires_at);
CREATE INDEX IF NOT EXISTS idx_content_research_target_platforms ON content_research USING gin(target_platforms);
CREATE INDEX IF NOT EXISTS idx_content_research_active ON content_research(is_active);

-- Learning Patterns Indexes
CREATE INDEX IF NOT EXISTS idx_learning_patterns_type ON learning_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_learning_patterns_confidence ON learning_patterns(confidence_level);
CREATE INDEX IF NOT EXISTS idx_learning_patterns_impact_score ON learning_patterns(impact_score);
CREATE INDEX IF NOT EXISTS idx_learning_patterns_validation_status ON learning_patterns(validation_status);
CREATE INDEX IF NOT EXISTS idx_learning_patterns_platforms ON learning_patterns USING gin(applicable_platforms);
CREATE INDEX IF NOT EXISTS idx_learning_patterns_active ON learning_patterns(is_active);
CREATE INDEX IF NOT EXISTS idx_learning_patterns_last_applied ON learning_patterns(last_applied);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- Enable RLS on all tables
ALTER TABLE content_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_patterns ENABLE ROW LEVEL SECURITY;

-- Content Posts Policies (Drop existing policies first if they exist)
DROP POLICY IF EXISTS "content_posts_select" ON content_posts;
DROP POLICY IF EXISTS "content_posts_insert" ON content_posts;
DROP POLICY IF EXISTS "content_posts_update" ON content_posts;
DROP POLICY IF EXISTS "content_posts_delete" ON content_posts;

CREATE POLICY "content_posts_select" ON content_posts FOR SELECT USING (true);
CREATE POLICY "content_posts_insert" ON content_posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "content_posts_update" ON content_posts FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "content_posts_delete" ON content_posts FOR DELETE USING (auth.role() = 'authenticated');

-- Social Accounts Policies
DROP POLICY IF EXISTS "social_accounts_select" ON social_accounts;
DROP POLICY IF EXISTS "social_accounts_insert" ON social_accounts;
DROP POLICY IF EXISTS "social_accounts_update" ON social_accounts;
DROP POLICY IF EXISTS "social_accounts_delete" ON social_accounts;

CREATE POLICY "social_accounts_select" ON social_accounts FOR SELECT USING (true);
CREATE POLICY "social_accounts_insert" ON social_accounts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "social_accounts_update" ON social_accounts FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "social_accounts_delete" ON social_accounts FOR DELETE USING (auth.role() = 'authenticated');

-- Content Calendar Policies
DROP POLICY IF EXISTS "content_calendar_select" ON content_calendar;
DROP POLICY IF EXISTS "content_calendar_insert" ON content_calendar;
DROP POLICY IF EXISTS "content_calendar_update" ON content_calendar;
DROP POLICY IF EXISTS "content_calendar_delete" ON content_calendar;

CREATE POLICY "content_calendar_select" ON content_calendar FOR SELECT USING (true);
CREATE POLICY "content_calendar_insert" ON content_calendar FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "content_calendar_update" ON content_calendar FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "content_calendar_delete" ON content_calendar FOR DELETE USING (auth.role() = 'authenticated');

-- Content Analytics Policies
DROP POLICY IF EXISTS "content_analytics_select" ON content_analytics;
DROP POLICY IF EXISTS "content_analytics_insert" ON content_analytics;
DROP POLICY IF EXISTS "content_analytics_update" ON content_analytics;
DROP POLICY IF EXISTS "content_analytics_delete" ON content_analytics;

CREATE POLICY "content_analytics_select" ON content_analytics FOR SELECT USING (true);
CREATE POLICY "content_analytics_insert" ON content_analytics FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "content_analytics_update" ON content_analytics FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "content_analytics_delete" ON content_analytics FOR DELETE USING (auth.role() = 'authenticated');

-- Content Research Policies
DROP POLICY IF EXISTS "content_research_select" ON content_research;
DROP POLICY IF EXISTS "content_research_insert" ON content_research;
DROP POLICY IF EXISTS "content_research_update" ON content_research;
DROP POLICY IF EXISTS "content_research_delete" ON content_research;

CREATE POLICY "content_research_select" ON content_research FOR SELECT USING (true);
CREATE POLICY "content_research_insert" ON content_research FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "content_research_update" ON content_research FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "content_research_delete" ON content_research FOR DELETE USING (auth.role() = 'authenticated');

-- Learning Patterns Policies
DROP POLICY IF EXISTS "learning_patterns_select" ON learning_patterns;
DROP POLICY IF EXISTS "learning_patterns_insert" ON learning_patterns;
DROP POLICY IF EXISTS "learning_patterns_update" ON learning_patterns;
DROP POLICY IF EXISTS "learning_patterns_delete" ON learning_patterns;

CREATE POLICY "learning_patterns_select" ON learning_patterns FOR SELECT USING (true);
CREATE POLICY "learning_patterns_insert" ON learning_patterns FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "learning_patterns_update" ON learning_patterns FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "learning_patterns_delete" ON learning_patterns FOR DELETE USING (auth.role() = 'authenticated');

-- ====================================================================
-- FOREIGN KEY CONSTRAINTS (ADDED AFTER TABLE CREATION)
-- ====================================================================

-- Add foreign key constraint for self-referencing parent_post_id in content_posts
-- Only add constraint if it doesn't already exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_content_posts_parent' 
        AND table_name = 'content_posts'
    ) THEN
        ALTER TABLE content_posts 
        ADD CONSTRAINT fk_content_posts_parent 
        FOREIGN KEY (parent_post_id) REFERENCES content_posts(id) 
        ON DELETE SET NULL;
    END IF;
END $$;

-- ====================================================================
-- TRIGGER FUNCTIONS FOR UPDATED_AT TIMESTAMPS
-- ====================================================================

-- Generic updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables (drop existing first if they exist)
DROP TRIGGER IF EXISTS content_posts_updated_at ON content_posts;
CREATE TRIGGER content_posts_updated_at
    BEFORE UPDATE ON content_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS social_accounts_updated_at ON social_accounts;
CREATE TRIGGER social_accounts_updated_at
    BEFORE UPDATE ON social_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS content_calendar_updated_at ON content_calendar;
CREATE TRIGGER content_calendar_updated_at
    BEFORE UPDATE ON content_calendar
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS content_research_updated_at ON content_research;
CREATE TRIGGER content_research_updated_at
    BEFORE UPDATE ON content_research
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS learning_patterns_updated_at ON learning_patterns;
CREATE TRIGGER learning_patterns_updated_at
    BEFORE UPDATE ON learning_patterns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- UTILITY FUNCTIONS
-- ====================================================================

-- Function to calculate content performance score
CREATE OR REPLACE FUNCTION calculate_content_performance_score(
    content_id UUID
) RETURNS DECIMAL(5,2) AS $$
DECLARE
    score DECIMAL(5,2) := 0;
    analytics_record RECORD;
BEGIN
    -- Get analytics for the content
    SELECT * INTO analytics_record 
    FROM content_analytics 
    WHERE content_post_id = content_id
    ORDER BY created_at DESC 
    LIMIT 1;
    
    IF FOUND THEN
        -- Calculate score based on engagement metrics (simplified)
        score := (
            COALESCE(analytics_record.engagement_rate, 0) * 0.3 +
            LEAST(COALESCE(analytics_record.reach, 0) / 1000.0, 100) * 0.3 +
            COALESCE(analytics_record.click_through_rate, 0) * 0.2 +
            COALESCE(analytics_record.conversion_rate, 0) * 0.2
        );
        
        -- Ensure score is between 0 and 100
        score := GREATEST(0, LEAST(100, score));
    END IF;
    
    RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Function to update content performance scores
CREATE OR REPLACE FUNCTION update_content_performance_scores()
RETURNS void AS $$
BEGIN
    -- Check if status column exists before using it
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'content_posts' 
        AND column_name = 'status'
    ) THEN
        UPDATE content_posts
        SET performance_score = calculate_content_performance_score(id)
        WHERE status = 'published' 
        AND published_at > NOW() - INTERVAL '30 days';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- SAMPLE DATA FOR TESTING (OPTIONAL)
-- ====================================================================

-- Only insert sample data if the tables are empty
DO $$
BEGIN
    -- Insert sample social accounts if the table is empty
    IF NOT EXISTS (SELECT 1 FROM social_accounts LIMIT 1) THEN
        INSERT INTO social_accounts (account_name, platform, platform_account_id, username, status, followers_count, engagement_rate)
        VALUES 
            ('SKC Business', 'facebook', 'fb_12345', 'skcbusiness', 'connected', 15420, 4.8),
            ('SKC Business', 'instagram', 'ig_67890', '@skcbusiness', 'connected', 8930, 6.2),
            ('SKC Company', 'linkedin', 'li_54321', 'skc-company', 'connected', 3450, 3.9),
            ('SKC Business', 'twitter', 'tw_98765', '@skcbusiness', 'connected', 6780, 2.1);
    END IF;

    -- Insert sample content posts if the table is empty
    IF NOT EXISTS (SELECT 1 FROM content_posts LIMIT 1) THEN
        INSERT INTO content_posts (title, content, content_type, status, target_platforms, hashtags, engagement_prediction)
        VALUES 
            ('Summer Sale Announcement', '🌞 Summer Sale is here! Get up to 50% off on all products...', 'post', 'published', '["facebook", "instagram", "twitter"]', '["#SummerSale", "#Discount", "#LimitedTime"]', 85.5),
            ('Product Demo Video', 'Check out our latest product demo showcasing innovative features...', 'video', 'scheduled', '["youtube", "linkedin"]', '["#ProductDemo", "#Innovation", "#Technology"]', 92.3),
            ('Weekly Newsletter Content', 'This week''s top insights and industry trends...', 'email', 'draft', '["email"]', '[]', 78.9);
    END IF;

    -- Insert sample learning patterns if the table is empty
    IF NOT EXISTS (SELECT 1 FROM learning_patterns LIMIT 1) THEN
        INSERT INTO learning_patterns (pattern_type, pattern_name, description, confidence_level, pattern_data, impact_score)
        VALUES 
            ('engagement_timing', 'Peak Instagram Engagement', 'Posts published between 6-9 PM on weekdays show 40% higher engagement', 87.5, '{"optimal_hours": [18, 19, 20, 21], "days": ["monday", "tuesday", "wednesday", "thursday", "friday"], "improvement": 0.40}', 85.0),
            ('hashtag_effectiveness', 'High-Performance Hashtag Combinations', 'Combining industry-specific hashtags with trending hashtags increases reach by 65%', 82.3, '{"strategy": "industry_plus_trending", "reach_improvement": 0.65, "optimal_count": 8}', 78.5),
            ('content_performance', 'Video Content Superiority', 'Video content generates 3x more engagement than static posts across all platforms', 94.1, '{"engagement_multiplier": 3.0, "platforms": ["instagram", "facebook", "linkedin"], "content_types": ["video", "reel"]}', 92.0);
    END IF;
END $$;

-- ====================================================================
-- COMMENTS FOR DOCUMENTATION
-- ====================================================================

COMMENT ON TABLE content_posts IS 'Enhanced content management for Marketing Machine platform with AI, scheduling, and multi-platform support';
COMMENT ON TABLE social_accounts IS 'Social media account management with authentication, metrics, and publishing configuration';
COMMENT ON TABLE content_calendar IS 'Content planning and scheduling with AI-powered automation and team collaboration';
COMMENT ON TABLE content_analytics IS 'Comprehensive analytics tracking for content performance across all platforms';
COMMENT ON TABLE content_research IS 'AI-powered content research, trend analysis, and competitive intelligence';
COMMENT ON TABLE learning_patterns IS 'Machine learning patterns and insights for content optimization and automation';

-- ====================================================================
-- Migration Complete
-- ==================================================================== 