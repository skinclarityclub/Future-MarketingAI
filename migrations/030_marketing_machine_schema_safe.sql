-- ====================================================================
-- Marketing Machine Platform Database Schema - SAFE MIGRATION
-- Task 36.1: Marketing Machine Database Schema
-- ====================================================================
-- This migration safely adds columns and tables for the Marketing Machine platform
-- It checks existing structures and only adds what's missing

-- ====================================================================
-- SAFETY CHECK: Add missing columns to existing content_posts table
-- ====================================================================

-- Function to safely add columns if they don't exist
CREATE OR REPLACE FUNCTION add_column_if_not_exists(
    target_table text,
    target_column text,
    column_definition text
) RETURNS void AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = target_table 
        AND column_name = target_column
    ) THEN
        EXECUTE format('ALTER TABLE %I ADD COLUMN %I %s', target_table, target_column, column_definition);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Check if content_posts exists, if not create basic structure
CREATE TABLE IF NOT EXISTS content_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255),
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Now safely add all the missing columns for Marketing Machine
SELECT add_column_if_not_exists('content_posts', 'content_type', 'VARCHAR(50) DEFAULT ''post''');
SELECT add_column_if_not_exists('content_posts', 'status', 'VARCHAR(50) DEFAULT ''draft''');
SELECT add_column_if_not_exists('content_posts', 'excerpt', 'TEXT');
SELECT add_column_if_not_exists('content_posts', 'featured_image_url', 'TEXT');
SELECT add_column_if_not_exists('content_posts', 'media_urls', 'JSONB DEFAULT ''[]''');
SELECT add_column_if_not_exists('content_posts', 'hashtags', 'JSONB DEFAULT ''[]''');
SELECT add_column_if_not_exists('content_posts', 'mentions', 'JSONB DEFAULT ''[]''');
SELECT add_column_if_not_exists('content_posts', 'scheduled_date', 'TIMESTAMPTZ');
SELECT add_column_if_not_exists('content_posts', 'scheduled_time', 'TIME');
SELECT add_column_if_not_exists('content_posts', 'published_at', 'TIMESTAMPTZ');
SELECT add_column_if_not_exists('content_posts', 'target_platforms', 'JSONB DEFAULT ''[]''');
SELECT add_column_if_not_exists('content_posts', 'platform_specific_content', 'JSONB DEFAULT ''{}''');
SELECT add_column_if_not_exists('content_posts', 'ai_generated', 'BOOLEAN DEFAULT false');
SELECT add_column_if_not_exists('content_posts', 'ai_prompt', 'TEXT');
SELECT add_column_if_not_exists('content_posts', 'engagement_prediction', 'DECIMAL(5,2)');
SELECT add_column_if_not_exists('content_posts', 'target_audience', 'VARCHAR(100)');
SELECT add_column_if_not_exists('content_posts', 'content_category', 'VARCHAR(50)');
SELECT add_column_if_not_exists('content_posts', 'tone', 'VARCHAR(50)');
SELECT add_column_if_not_exists('content_posts', 'author_id', 'UUID');
SELECT add_column_if_not_exists('content_posts', 'approver_id', 'UUID');
SELECT add_column_if_not_exists('content_posts', 'campaign_id', 'UUID');
SELECT add_column_if_not_exists('content_posts', 'parent_post_id', 'UUID');
SELECT add_column_if_not_exists('content_posts', 'is_ab_test', 'BOOLEAN DEFAULT false');
SELECT add_column_if_not_exists('content_posts', 'total_engagement', 'INTEGER DEFAULT 0');
SELECT add_column_if_not_exists('content_posts', 'total_reach', 'INTEGER DEFAULT 0');
SELECT add_column_if_not_exists('content_posts', 'total_impressions', 'INTEGER DEFAULT 0');
SELECT add_column_if_not_exists('content_posts', 'performance_score', 'DECIMAL(5,2)');
SELECT add_column_if_not_exists('content_posts', 'version', 'INTEGER DEFAULT 1');

-- Add constraints that might be missing
DO $$
BEGIN
    -- Add content_type check constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints
        WHERE constraint_name = 'content_posts_content_type_check'
    ) THEN
        ALTER TABLE content_posts 
        ADD CONSTRAINT content_posts_content_type_check 
        CHECK (content_type IN ('post', 'story', 'video', 'carousel', 'reel', 'email', 'ad', 'article', 'blog', 'newsletter'));
    END IF;

    -- Add status check constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints
        WHERE constraint_name = 'content_posts_status_check'
    ) THEN
        ALTER TABLE content_posts 
        ADD CONSTRAINT content_posts_status_check 
        CHECK (status IN ('draft', 'scheduled', 'publishing', 'published', 'failed', 'archived', 'review_pending', 'approved', 'rejected'));
    END IF;

    -- Add tone check constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints
        WHERE constraint_name = 'content_posts_tone_check'
    ) THEN
        ALTER TABLE content_posts 
        ADD CONSTRAINT content_posts_tone_check 
        CHECK (tone IN ('professional', 'casual', 'humorous', 'educational', 'promotional', 'inspirational'));
    END IF;
END $$;

-- ====================================================================
-- 2. Social Accounts Management Table
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(platform, platform_account_id)
);

-- ====================================================================
-- 3. Content Calendar Table
-- ====================================================================
CREATE TABLE IF NOT EXISTS content_calendar (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    calendar_date DATE NOT NULL,
    time_slot TIME,
    duration_minutes INTEGER DEFAULT 0,
    content_post_id UUID,
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
    parent_calendar_id UUID,
    campaign_id UUID,
    campaign_phase VARCHAR(50),
    assigned_to UUID,
    creator_id UUID,
    reviewer_id UUID,
    expected_engagement INTEGER,
    target_audience VARCHAR(100),
    content_theme VARCHAR(100),
    seasonal_tag VARCHAR(50),
    notes TEXT,
    tags JSONB DEFAULT '[]',
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 4. Content Analytics Table
-- ====================================================================
CREATE TABLE IF NOT EXISTS content_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_post_id UUID NOT NULL,
    social_account_id UUID,
    platform VARCHAR(50) NOT NULL,
    platform_post_id VARCHAR(255),
    published_at TIMESTAMPTZ NOT NULL,
    content_type VARCHAR(50) NOT NULL,
    content_category VARCHAR(100),
    hashtags_used JSONB DEFAULT '[]',
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    saves_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    video_views INTEGER DEFAULT 0,
    video_completion_rate DECIMAL(5,2) DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    organic_reach INTEGER DEFAULT 0,
    paid_reach INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    click_through_rate DECIMAL(5,2) DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    peak_engagement_time TIMESTAMPTZ,
    engagement_by_hour JSONB DEFAULT '{}',
    engagement_velocity DECIMAL(10,2) DEFAULT 0,
    audience_demographics JSONB DEFAULT '{}',
    audience_interests JSONB DEFAULT '{}',
    audience_location JSONB DEFAULT '{}',
    new_followers INTEGER DEFAULT 0,
    performance_score DECIMAL(5,2) DEFAULT 0,
    viral_potential DECIMAL(5,2) DEFAULT 0,
    quality_score DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 5. Content Research Table
-- ====================================================================
CREATE TABLE IF NOT EXISTS content_research (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    research_type VARCHAR(50) NOT NULL CHECK (
        research_type IN ('trend_analysis', 'competitor_analysis', 'keyword_research', 'audience_insights', 'content_gaps', 'industry_news')
    ),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    research_data JSONB NOT NULL DEFAULT '{}',
    confidence_score DECIMAL(5,2) DEFAULT 0,
    target_platforms JSONB DEFAULT '[]',
    target_audience VARCHAR(100),
    content_themes JSONB DEFAULT '[]',
    insights JSONB DEFAULT '{}',
    recommendations JSONB DEFAULT '{}',
    sources JSONB DEFAULT '[]',
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 6. Learning Patterns Table
-- ====================================================================
CREATE TABLE IF NOT EXISTS learning_patterns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pattern_type VARCHAR(50) NOT NULL CHECK (
        pattern_type IN ('engagement_timing', 'content_performance', 'audience_behavior', 'hashtag_effectiveness', 'platform_optimization')
    ),
    pattern_name VARCHAR(255) NOT NULL,
    description TEXT,
    confidence_level DECIMAL(5,2) NOT NULL DEFAULT 0,
    pattern_data JSONB NOT NULL DEFAULT '{}',
    applicable_platforms JSONB DEFAULT '[]',
    target_audience VARCHAR(100),
    impact_score DECIMAL(5,2) DEFAULT 0,
    validation_status VARCHAR(50) DEFAULT 'pending' CHECK (
        validation_status IN ('pending', 'validated', 'rejected', 'needs_more_data')
    ),
    last_applied TIMESTAMPTZ,
    application_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- INDEXES FOR PERFORMANCE (NO GIN INDEXES TO AVOID OPERATOR CLASS ISSUES)
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_content_posts_status ON content_posts(status);
CREATE INDEX IF NOT EXISTS idx_content_posts_scheduled_date ON content_posts(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_content_posts_published_at ON content_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_content_posts_campaign_id ON content_posts(campaign_id);

CREATE INDEX IF NOT EXISTS idx_social_accounts_platform ON social_accounts(platform);
CREATE INDEX IF NOT EXISTS idx_social_accounts_status ON social_accounts(status);

CREATE INDEX IF NOT EXISTS idx_content_calendar_date ON content_calendar(calendar_date);
CREATE INDEX IF NOT EXISTS idx_content_calendar_status ON content_calendar(status);

CREATE INDEX IF NOT EXISTS idx_content_analytics_content_post_id ON content_analytics(content_post_id);
CREATE INDEX IF NOT EXISTS idx_content_analytics_platform ON content_analytics(platform);
CREATE INDEX IF NOT EXISTS idx_content_analytics_published_at ON content_analytics(published_at);

-- ====================================================================
-- FOREIGN KEY CONSTRAINTS (ADDED SAFELY)
-- ====================================================================
DO $$
BEGIN
    -- Add foreign key for content_calendar -> content_posts
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_content_calendar_content_post'
    ) THEN
        ALTER TABLE content_calendar 
        ADD CONSTRAINT fk_content_calendar_content_post 
        FOREIGN KEY (content_post_id) REFERENCES content_posts(id) 
        ON DELETE SET NULL;
    END IF;

    -- Add foreign key for content_analytics -> content_posts
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_content_analytics_content_post'
    ) THEN
        ALTER TABLE content_analytics 
        ADD CONSTRAINT fk_content_analytics_content_post 
        FOREIGN KEY (content_post_id) REFERENCES content_posts(id) 
        ON DELETE CASCADE;
    END IF;

    -- Add foreign key for content_analytics -> social_accounts
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_content_analytics_social_account'
    ) THEN
        ALTER TABLE content_analytics 
        ADD CONSTRAINT fk_content_analytics_social_account 
        FOREIGN KEY (social_account_id) REFERENCES social_accounts(id) 
        ON DELETE SET NULL;
    END IF;

    -- Add self-referencing foreign key for content_posts
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_content_posts_parent'
    ) THEN
        ALTER TABLE content_posts 
        ADD CONSTRAINT fk_content_posts_parent 
        FOREIGN KEY (parent_post_id) REFERENCES content_posts(id) 
        ON DELETE SET NULL;
    END IF;
END $$;

-- ====================================================================
-- UTILITY FUNCTIONS (SAFE VERSIONS)
-- ====================================================================
CREATE OR REPLACE FUNCTION calculate_content_performance_score(
    content_id UUID
) RETURNS DECIMAL(5,2) AS $$
DECLARE
    score DECIMAL(5,2) := 0;
    analytics_record RECORD;
BEGIN
    -- Only calculate if status column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'content_posts' 
        AND column_name = 'status'
    ) THEN
        SELECT * INTO analytics_record 
        FROM content_analytics 
        WHERE content_post_id = content_id
        ORDER BY created_at DESC 
        LIMIT 1;
        
        IF FOUND THEN
            score := (
                COALESCE(analytics_record.engagement_rate, 0) * 0.3 +
                LEAST(COALESCE(analytics_record.reach, 0) / 1000.0, 100) * 0.3 +
                COALESCE(analytics_record.click_through_rate, 0) * 0.2 +
                COALESCE(analytics_record.conversion_rate, 0) * 0.2
            );
            score := GREATEST(0, LEAST(100, score));
        END IF;
    END IF;
    
    RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Clean up helper function
DROP FUNCTION IF EXISTS add_column_if_not_exists(text, text, text);

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
-- Migration Complete - Safe Version
-- ==================================================================== 