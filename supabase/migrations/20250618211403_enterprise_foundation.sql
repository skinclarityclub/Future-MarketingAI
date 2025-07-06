-- ====================================================================
-- Enterprise Database Schema for Content Analytics
-- Task 65.1: Create Enterprise Database Schema Tables
-- ====================================================================
-- This migration creates the comprehensive database schema for enterprise content
-- management, analytics and performance tracking according to the detailed schema plan.

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ====================================================================
-- 1. Enhanced Content Posts Table
-- ====================================================================
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
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    campaign_id UUID, -- Link to marketing campaigns
    parent_post_id UUID REFERENCES content_posts(id) ON DELETE SET NULL, -- For A/B testing variants
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
    
    -- Authentication (encrypted in application layer)
    access_token TEXT,
    refresh_token TEXT,
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
    
    -- Enterprise Fields
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID, -- For multi-tenant support
    
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
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Analytics & Planning
    expected_engagement INTEGER,
    target_audience VARCHAR(100),
    content_theme VARCHAR(100),
    seasonal_tag VARCHAR(50),
    
    -- Notes & Metadata
    notes TEXT,
    tags JSONB DEFAULT '[]',
    attachments JSONB DEFAULT '[]',
    
    -- Enterprise Fields
    organization_id UUID, -- For multi-tenant support
    
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
    
    -- Enterprise Fields
    organization_id UUID, -- For multi-tenant support
    
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
    
    -- Enterprise Fields
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    organization_id UUID, -- For multi-tenant support
    
    -- System Fields
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
    is_active BOOLEAN DEFAULT true,
    deprecation_reason TEXT,
    last_applied TIMESTAMPTZ,
    
    -- Enterprise Fields
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    organization_id UUID, -- For multi-tenant support
    
    -- System Fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- PERFORMANCE INDEXES
-- ====================================================================

-- Content Posts Indexes
CREATE INDEX IF NOT EXISTS idx_content_posts_status ON content_posts(status);
CREATE INDEX IF NOT EXISTS idx_content_posts_scheduled_date ON content_posts(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_content_posts_published_at ON content_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_content_posts_campaign_id ON content_posts(campaign_id);
-- Fixed GIN indexes for JSONB columns only
CREATE INDEX IF NOT EXISTS idx_content_posts_target_platforms ON content_posts USING gin(target_platforms) WHERE target_platforms IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_content_posts_hashtags ON content_posts USING gin(hashtags) WHERE hashtags IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_content_posts_content_type ON content_posts(content_type);
CREATE INDEX IF NOT EXISTS idx_content_posts_performance_score ON content_posts(performance_score);
CREATE INDEX IF NOT EXISTS idx_content_posts_author_id ON content_posts(author_id);

-- Social Accounts Indexes
CREATE INDEX IF NOT EXISTS idx_social_accounts_platform ON social_accounts(platform);
CREATE INDEX IF NOT EXISTS idx_social_accounts_status ON social_accounts(status);
CREATE INDEX IF NOT EXISTS idx_social_accounts_last_sync ON social_accounts(last_sync_at);
CREATE INDEX IF NOT EXISTS idx_social_accounts_engagement_rate ON social_accounts(engagement_rate);
CREATE INDEX IF NOT EXISTS idx_social_accounts_followers ON social_accounts(followers_count);
CREATE INDEX IF NOT EXISTS idx_social_accounts_user_id ON social_accounts(user_id);

-- Content Calendar Indexes
CREATE INDEX IF NOT EXISTS idx_content_calendar_date ON content_calendar(calendar_date);
CREATE INDEX IF NOT EXISTS idx_content_calendar_status ON content_calendar(status);
CREATE INDEX IF NOT EXISTS idx_content_calendar_content_post_id ON content_calendar(content_post_id);
CREATE INDEX IF NOT EXISTS idx_content_calendar_target_platforms ON content_calendar USING gin(target_platforms) WHERE target_platforms IS NOT NULL;
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
CREATE INDEX IF NOT EXISTS idx_content_research_target_platforms ON content_research USING gin(target_platforms) WHERE target_platforms IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_content_research_active ON content_research(is_active);
CREATE INDEX IF NOT EXISTS idx_content_research_created_by ON content_research(created_by);

-- Learning Patterns Indexes
CREATE INDEX IF NOT EXISTS idx_learning_patterns_type ON learning_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_learning_patterns_confidence ON learning_patterns(confidence_level);
CREATE INDEX IF NOT EXISTS idx_learning_patterns_impact_score ON learning_patterns(impact_score);
CREATE INDEX IF NOT EXISTS idx_learning_patterns_validation_status ON learning_patterns(validation_status);
CREATE INDEX IF NOT EXISTS idx_learning_patterns_platforms ON learning_patterns USING gin(applicable_platforms) WHERE applicable_platforms IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_learning_patterns_active ON learning_patterns(is_active);
CREATE INDEX IF NOT EXISTS idx_learning_patterns_last_applied ON learning_patterns(last_applied);
CREATE INDEX IF NOT EXISTS idx_learning_patterns_created_by ON learning_patterns(created_by);

-- ====================================================================
-- TRIGGERS FOR AUTOMATED TIMESTAMPS
-- ====================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Content Posts Trigger
CREATE TRIGGER content_posts_updated_at
    BEFORE UPDATE ON content_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Social Accounts Trigger
CREATE TRIGGER social_accounts_updated_at
    BEFORE UPDATE ON social_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Content Calendar Trigger
CREATE TRIGGER content_calendar_updated_at
    BEFORE UPDATE ON content_calendar
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Content Research Trigger
CREATE TRIGGER content_research_updated_at
    BEFORE UPDATE ON content_research
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Learning Patterns Trigger
CREATE TRIGGER learning_patterns_updated_at
    BEFORE UPDATE ON learning_patterns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

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

-- Content Posts RLS Policies
CREATE POLICY "Users can view their own content posts" ON content_posts
    FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Users can insert their own content posts" ON content_posts
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own content posts" ON content_posts
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own content posts" ON content_posts
    FOR DELETE USING (auth.uid() = author_id);

-- Social Accounts RLS Policies
CREATE POLICY "Users can view their own social accounts" ON social_accounts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own social accounts" ON social_accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own social accounts" ON social_accounts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own social accounts" ON social_accounts
    FOR DELETE USING (auth.uid() = user_id);

-- Content Calendar RLS Policies
CREATE POLICY "Users can view assigned content calendar" ON content_calendar
    FOR SELECT USING (auth.uid() = assigned_to OR auth.uid() = creator_id);

CREATE POLICY "Users can insert content calendar" ON content_calendar
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update assigned content calendar" ON content_calendar
    FOR UPDATE USING (auth.uid() = assigned_to OR auth.uid() = creator_id);

CREATE POLICY "Users can delete their created content calendar" ON content_calendar
    FOR DELETE USING (auth.uid() = creator_id);

-- Content Analytics RLS Policies
CREATE POLICY "Users can view analytics for their content" ON content_analytics
    FOR SELECT USING (
        content_post_id IN (
            SELECT id FROM content_posts WHERE author_id = auth.uid()
        )
    );

CREATE POLICY "System can insert analytics data" ON content_analytics
    FOR INSERT WITH CHECK (true); -- System level inserts

-- Content Research RLS Policies
CREATE POLICY "Users can view their own research" ON content_research
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own research" ON content_research
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own research" ON content_research
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own research" ON content_research
    FOR DELETE USING (auth.uid() = created_by);

-- Learning Patterns RLS Policies
CREATE POLICY "Users can view learning patterns" ON learning_patterns
    FOR SELECT USING (true); -- Patterns are shared across organization

CREATE POLICY "Authenticated users can insert learning patterns" ON learning_patterns
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own learning patterns" ON learning_patterns
    FOR UPDATE USING (auth.uid() = created_by);

-- ====================================================================
-- REAL-TIME VIEWS FOR DASHBOARD QUERIES
-- ====================================================================

-- Content Performance Summary View
CREATE OR REPLACE VIEW content_performance_summary AS
SELECT 
    cp.id,
    cp.title,
    cp.content_type,
    cp.status,
    cp.published_at,
    cp.performance_score,
    ca.engagement_rate,
    ca.reach,
    ca.impressions,
    ca.likes_count + ca.comments_count + ca.shares_count AS total_engagement,
    sa.platform,
    sa.account_name
FROM content_posts cp
LEFT JOIN content_analytics ca ON cp.id = ca.content_post_id
LEFT JOIN social_accounts sa ON ca.social_account_id = sa.id
WHERE cp.status = 'published';

-- Content Calendar Dashboard View
CREATE OR REPLACE VIEW content_calendar_dashboard AS
SELECT 
    cc.id,
    cc.title,
    cc.calendar_date,
    cc.time_slot,
    cc.status,
    cc.priority,
    cp.title AS content_title,
    cp.content_type,
    cp.status AS content_status,
    cc.assigned_to
FROM content_calendar cc
LEFT JOIN content_posts cp ON cc.content_post_id = cp.id
WHERE cc.calendar_date >= CURRENT_DATE - INTERVAL '7 days'
  AND cc.calendar_date <= CURRENT_DATE + INTERVAL '30 days';

-- Social Account Performance View
CREATE OR REPLACE VIEW social_account_performance AS
SELECT 
    sa.id,
    sa.account_name,
    sa.platform,
    sa.status,
    sa.followers_count,
    sa.engagement_rate,
    COUNT(ca.id) AS posts_count,
    AVG(ca.engagement_rate) AS avg_post_engagement,
    SUM(ca.reach) AS total_reach
FROM social_accounts sa
LEFT JOIN content_analytics ca ON sa.id = ca.social_account_id
WHERE ca.published_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY sa.id, sa.account_name, sa.platform, sa.status, sa.followers_count, sa.engagement_rate;

-- ====================================================================
-- PERFORMANCE FUNCTIONS
-- ====================================================================

-- Function to calculate content performance score
CREATE OR REPLACE FUNCTION calculate_content_performance_score(
    p_content_post_id UUID
) RETURNS DECIMAL(5,2) AS $$
DECLARE
    v_score DECIMAL(5,2) := 0;
    v_engagement_rate DECIMAL(5,2);
    v_reach INTEGER;
    v_impressions INTEGER;
BEGIN
    SELECT 
        COALESCE(engagement_rate, 0),
        COALESCE(reach, 0),
        COALESCE(impressions, 0)
    INTO v_engagement_rate, v_reach, v_impressions
    FROM content_analytics 
    WHERE content_post_id = p_content_post_id
    ORDER BY published_at DESC
    LIMIT 1;
    
    -- Calculate weighted performance score
    v_score := (v_engagement_rate * 0.4) + 
               (LEAST(v_reach / 10000.0, 1) * 30) + 
               (LEAST(v_impressions / 100000.0, 1) * 30);
    
    RETURN LEAST(v_score, 100);
END;
$$ LANGUAGE plpgsql;

-- Function to update content performance scores
CREATE OR REPLACE FUNCTION update_content_performance_scores()
RETURNS void AS $$
BEGIN
    UPDATE content_posts 
    SET performance_score = calculate_content_performance_score(id)
    WHERE status = 'published' 
      AND published_at >= CURRENT_DATE - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- DATA VALIDATION CONSTRAINTS
-- ====================================================================

-- Add additional constraints for data integrity
ALTER TABLE content_posts ADD CONSTRAINT check_engagement_prediction 
    CHECK (engagement_prediction IS NULL OR (engagement_prediction >= 0 AND engagement_prediction <= 100));

ALTER TABLE content_posts ADD CONSTRAINT check_performance_score 
    CHECK (performance_score IS NULL OR (performance_score >= 0 AND performance_score <= 100));

ALTER TABLE content_analytics ADD CONSTRAINT check_engagement_rate 
    CHECK (engagement_rate >= 0 AND engagement_rate <= 100);

ALTER TABLE content_analytics ADD CONSTRAINT check_performance_score_analytics 
    CHECK (performance_score >= 0 AND performance_score <= 100);

ALTER TABLE content_research ADD CONSTRAINT check_confidence_score 
    CHECK (confidence_score >= 0 AND confidence_score <= 100);

ALTER TABLE learning_patterns ADD CONSTRAINT check_confidence_level 
    CHECK (confidence_level >= 0 AND confidence_level <= 100);

-- ====================================================================
-- COMMENTS FOR DOCUMENTATION
-- ====================================================================

COMMENT ON TABLE content_posts IS 'Main table for storing content posts with metadata, scheduling, and performance tracking';
COMMENT ON TABLE social_accounts IS 'Social media account management with authentication and metrics';
COMMENT ON TABLE content_calendar IS 'Content planning and scheduling calendar with team workflow';
COMMENT ON TABLE content_analytics IS 'Detailed analytics and performance metrics for published content';
COMMENT ON TABLE content_research IS 'Research data for trend analysis and content intelligence';
COMMENT ON TABLE learning_patterns IS 'AI/ML patterns for content optimization and automation';

COMMENT ON VIEW content_performance_summary IS 'Real-time view for dashboard showing content performance metrics';
COMMENT ON VIEW content_calendar_dashboard IS 'Dashboard view for content calendar with related post information';
COMMENT ON VIEW social_account_performance IS 'Performance metrics summary for social media accounts';
