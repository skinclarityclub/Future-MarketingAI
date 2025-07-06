-- ====================================================================
-- Enterprise Database Schema for Content Analytics
-- Task 65.1: Create Enterprise Database Schema Tables
-- Migration: 041_enterprise_content_analytics_schema.sql
-- ====================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ====================================================================
-- 1. Content Posts Table (with status column)
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
    excerpt TEXT,
    featured_image_url TEXT,
    media_urls JSONB DEFAULT '[]',
    hashtags JSONB DEFAULT '[]',
    mentions JSONB DEFAULT '[]',
    scheduled_date TIMESTAMPTZ,
    scheduled_time TIME,
    published_at TIMESTAMPTZ,
    target_platforms JSONB NOT NULL DEFAULT '[]',
    platform_specific_content JSONB DEFAULT '{}',
    ai_generated BOOLEAN DEFAULT false,
    ai_prompt TEXT,
    engagement_prediction DECIMAL(5,2),
    target_audience VARCHAR(100),
    content_category VARCHAR(50),
    tone VARCHAR(50) CHECK (tone IN ('professional', 'casual', 'humorous', 'educational', 'promotional', 'inspirational')),
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    campaign_id UUID,
    parent_post_id UUID REFERENCES content_posts(id) ON DELETE SET NULL,
    is_ab_test BOOLEAN DEFAULT false,
    total_engagement INTEGER DEFAULT 0,
    total_reach INTEGER DEFAULT 0,
    total_impressions INTEGER DEFAULT 0,
    performance_score DECIMAL(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    version INTEGER DEFAULT 1,
    organization_id UUID
);

-- ====================================================================
-- 2. Social Accounts Table (with status column)
-- ====================================================================
CREATE TABLE IF NOT EXISTS social_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    account_name VARCHAR(255) NOT NULL,
    platform VARCHAR(50) NOT NULL CHECK (
        platform IN ('facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok', 'pinterest', 'snapchat')
    ),
    platform_account_id VARCHAR(255) NOT NULL,
    username VARCHAR(255),
    display_name VARCHAR(255),
    profile_picture_url TEXT,
    bio TEXT,
    website_url TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'disconnected' CHECK (
        status IN ('connected', 'disconnected', 'error', 'syncing', 'expired', 'pending_approval')
    ),
    connection_error TEXT,
    last_sync_at TIMESTAMPTZ,
    next_sync_at TIMESTAMPTZ,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    average_likes INTEGER DEFAULT 0,
    average_comments INTEGER DEFAULT 0,
    average_shares INTEGER DEFAULT 0,
    posting_enabled BOOLEAN DEFAULT true,
    auto_posting_enabled BOOLEAN DEFAULT false,
    posting_schedule JSONB DEFAULT '{}',
    content_approval_required BOOLEAN DEFAULT true,
    account_type VARCHAR(50) CHECK (account_type IN ('personal', 'business', 'creator')),
    business_category VARCHAR(100),
    is_verified BOOLEAN DEFAULT false,
    country VARCHAR(50),
    timezone VARCHAR(50),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(platform, platform_account_id)
);

-- ====================================================================
-- 3. Content Calendar Table (with status column)
-- ====================================================================
CREATE TABLE IF NOT EXISTS content_calendar (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    calendar_date DATE NOT NULL,
    time_slot TIME,
    duration_minutes INTEGER DEFAULT 0,
    content_post_id UUID REFERENCES content_posts(id) ON DELETE SET NULL,
    content_type VARCHAR(50) NOT NULL CHECK (
        content_type IN ('post', 'story', 'video', 'live', 'campaign', 'email', 'ad', 'event', 'reminder')
    ),
    target_platforms JSONB NOT NULL DEFAULT '[]',
    target_accounts JSONB DEFAULT '[]',
    status VARCHAR(50) NOT NULL DEFAULT 'planned' CHECK (
        status IN ('planned', 'in_progress', 'ready', 'scheduled', 'published', 'cancelled', 'missed')
    ),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    auto_generated BOOLEAN DEFAULT false,
    ai_suggestions JSONB DEFAULT '{}',
    recurring_pattern JSONB DEFAULT '{}',
    is_recurring BOOLEAN DEFAULT false,
    parent_calendar_id UUID REFERENCES content_calendar(id),
    campaign_id UUID,
    campaign_phase VARCHAR(50),
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    expected_engagement INTEGER,
    target_audience VARCHAR(100),
    content_theme VARCHAR(100),
    seasonal_tag VARCHAR(50),
    notes TEXT,
    tags JSONB DEFAULT '[]',
    attachments JSONB DEFAULT '[]',
    organization_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 4. Content Analytics Table
-- ====================================================================
CREATE TABLE IF NOT EXISTS content_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_post_id UUID NOT NULL REFERENCES content_posts(id) ON DELETE CASCADE,
    social_account_id UUID NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    platform_post_id VARCHAR(255),
    post_url TEXT,
    published_at TIMESTAMPTZ NOT NULL,
    analytics_date DATE NOT NULL,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    total_engagement INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    unique_views INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    click_through_rate DECIMAL(5,2) DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    performance_score DECIMAL(5,2) DEFAULT 0,
    top_countries JSONB DEFAULT '[]',
    age_distribution JSONB DEFAULT '{}',
    gender_distribution JSONB DEFAULT '{}',
    platform_metrics JSONB DEFAULT '{}',
    sentiment_score DECIMAL(3,2),
    emotion_analysis JSONB DEFAULT '{}',
    ai_performance_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(content_post_id, social_account_id, analytics_date)
);

-- ====================================================================
-- 5. Content Research Table
-- ====================================================================
CREATE TABLE IF NOT EXISTS content_research (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    research_type VARCHAR(50) NOT NULL CHECK (
        research_type IN ('trend_analysis', 'competitor_analysis', 'hashtag_research', 'audience_insights', 'content_gap', 'keyword_research')
    ),
    description TEXT,
    findings JSONB NOT NULL DEFAULT '{}',
    data_sources JSONB DEFAULT '[]',
    confidence_score DECIMAL(3,2) DEFAULT 0,
    target_platforms JSONB DEFAULT '[]',
    target_audience VARCHAR(100),
    geographic_focus VARCHAR(100),
    industry_vertical VARCHAR(100),
    content_suggestions JSONB DEFAULT '[]',
    hashtag_recommendations JSONB DEFAULT '[]',
    posting_time_recommendations JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ,
    validation_status VARCHAR(50) DEFAULT 'pending' CHECK (
        validation_status IN ('pending', 'validated', 'outdated', 'needs_review')
    ),
    times_applied INTEGER DEFAULT 0,
    last_applied_at TIMESTAMPTZ,
    effectiveness_rating DECIMAL(3,2),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    organization_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 6. Learning Patterns Table
-- ====================================================================
CREATE TABLE IF NOT EXISTS learning_patterns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pattern_name VARCHAR(255) NOT NULL,
    pattern_type VARCHAR(50) NOT NULL CHECK (
        pattern_type IN ('content_timing', 'hashtag_performance', 'audience_behavior', 'content_format', 'engagement_optimization', 'reach_optimization')
    ),
    description TEXT,
    pattern_data JSONB NOT NULL DEFAULT '{}',
    supporting_evidence JSONB DEFAULT '[]',
    confidence_level DECIMAL(3,2) NOT NULL DEFAULT 0,
    applicable_platforms JSONB DEFAULT '[]',
    applicable_content_types JSONB DEFAULT '[]',
    target_audience_segments JSONB DEFAULT '[]',
    impact_score DECIMAL(5,2) DEFAULT 0,
    times_validated INTEGER DEFAULT 0,
    successful_applications INTEGER DEFAULT 0,
    failed_applications INTEGER DEFAULT 0,
    ml_model_confidence DECIMAL(3,2),
    statistical_significance DECIMAL(5,4),
    sample_size INTEGER,
    is_active BOOLEAN DEFAULT true,
    validation_status VARCHAR(50) DEFAULT 'hypothesis' CHECK (
        validation_status IN ('hypothesis', 'testing', 'validated', 'deprecated', 'needs_review')
    ),
    last_applied TIMESTAMPTZ,
    recommendation_frequency INTEGER DEFAULT 0,
    user_adoption_rate DECIMAL(3,2),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    organization_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- INDEXES
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_content_posts_status ON content_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_accounts_status ON social_accounts(status);
CREATE INDEX IF NOT EXISTS idx_content_calendar_status ON content_calendar(status);
CREATE INDEX IF NOT EXISTS idx_content_posts_published_at ON content_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_content_analytics_content_post_id ON content_analytics(content_post_id);
CREATE INDEX IF NOT EXISTS idx_content_analytics_platform ON content_analytics(platform);
CREATE INDEX IF NOT EXISTS idx_content_posts_campaign_id ON content_posts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_user_id ON social_accounts(user_id);

-- ====================================================================
-- TRIGGERS
-- ====================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER content_posts_updated_at
    BEFORE UPDATE ON content_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER social_accounts_updated_at
    BEFORE UPDATE ON social_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER content_calendar_updated_at
    BEFORE UPDATE ON content_calendar
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- COMPLETION
-- ====================================================================
DO $$
BEGIN
    RAISE NOTICE 'Enterprise Content Analytics Schema Migration (041) Completed Successfully';
    RAISE NOTICE 'Created tables with status columns: content_posts, social_accounts, content_calendar';
END $$;
