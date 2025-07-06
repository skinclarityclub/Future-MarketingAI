-- ====================================================================
-- Fix All Missing Columns for Enterprise Content Analytics
-- Task 65.1: Add all missing columns to existing content analytics tables
-- ====================================================================

-- Fix content_posts table
DO $$
BEGIN
    -- Add status column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_posts' AND column_name = 'status') THEN
        ALTER TABLE content_posts ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'draft' 
        CHECK (status IN ('draft', 'scheduled', 'publishing', 'published', 'failed', 'archived', 'review_pending', 'approved', 'rejected'));
        RAISE NOTICE '✓ Added status column to content_posts';
    END IF;
    
    -- Add campaign_id column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_posts' AND column_name = 'campaign_id') THEN
        ALTER TABLE content_posts ADD COLUMN campaign_id UUID;
        RAISE NOTICE '✓ Added campaign_id column to content_posts';
    END IF;
    
    -- Add other essential columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_posts' AND column_name = 'author_id') THEN
        ALTER TABLE content_posts ADD COLUMN author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
        RAISE NOTICE '✓ Added author_id column to content_posts';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_posts' AND column_name = 'content_type') THEN
        ALTER TABLE content_posts ADD COLUMN content_type VARCHAR(50) NOT NULL DEFAULT 'post' 
        CHECK (content_type IN ('post', 'story', 'video', 'carousel', 'reel', 'email', 'ad', 'article', 'blog', 'newsletter'));
        RAISE NOTICE '✓ Added content_type column to content_posts';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_posts' AND column_name = 'scheduled_date') THEN
        ALTER TABLE content_posts ADD COLUMN scheduled_date TIMESTAMPTZ;
        RAISE NOTICE '✓ Added scheduled_date column to content_posts';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_posts' AND column_name = 'published_at') THEN
        ALTER TABLE content_posts ADD COLUMN published_at TIMESTAMPTZ;
        RAISE NOTICE '✓ Added published_at column to content_posts';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_posts' AND column_name = 'target_platforms') THEN
        ALTER TABLE content_posts ADD COLUMN target_platforms JSONB DEFAULT '[]';
        RAISE NOTICE '✓ Added target_platforms column to content_posts';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_posts' AND column_name = 'performance_score') THEN
        ALTER TABLE content_posts ADD COLUMN performance_score DECIMAL(5,2);
        RAISE NOTICE '✓ Added performance_score column to content_posts';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_posts' AND column_name = 'total_engagement') THEN
        ALTER TABLE content_posts ADD COLUMN total_engagement INTEGER DEFAULT 0;
        RAISE NOTICE '✓ Added total_engagement column to content_posts';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_posts' AND column_name = 'organization_id') THEN
        ALTER TABLE content_posts ADD COLUMN organization_id UUID;
        RAISE NOTICE '✓ Added organization_id column to content_posts';
    END IF;
END $$;

-- Fix social_accounts table
DO $$
BEGIN
    -- Add status column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'social_accounts' AND column_name = 'status') THEN
        ALTER TABLE social_accounts ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'disconnected' 
        CHECK (status IN ('connected', 'disconnected', 'error', 'syncing', 'expired', 'pending_approval'));
        RAISE NOTICE '✓ Added status column to social_accounts';
    END IF;
    
    -- Add other essential columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'social_accounts' AND column_name = 'platform') THEN
        ALTER TABLE social_accounts ADD COLUMN platform VARCHAR(50) NOT NULL DEFAULT 'instagram' 
        CHECK (platform IN ('facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok', 'pinterest', 'snapchat'));
        RAISE NOTICE '✓ Added platform column to social_accounts';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'social_accounts' AND column_name = 'user_id') THEN
        ALTER TABLE social_accounts ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE '✓ Added user_id column to social_accounts';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'social_accounts' AND column_name = 'account_name') THEN
        ALTER TABLE social_accounts ADD COLUMN account_name VARCHAR(255) NOT NULL DEFAULT 'Default Account';
        RAISE NOTICE '✓ Added account_name column to social_accounts';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'social_accounts' AND column_name = 'followers_count') THEN
        ALTER TABLE social_accounts ADD COLUMN followers_count INTEGER DEFAULT 0;
        RAISE NOTICE '✓ Added followers_count column to social_accounts';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'social_accounts' AND column_name = 'engagement_rate') THEN
        ALTER TABLE social_accounts ADD COLUMN engagement_rate DECIMAL(5,2) DEFAULT 0;
        RAISE NOTICE '✓ Added engagement_rate column to social_accounts';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'social_accounts' AND column_name = 'organization_id') THEN
        ALTER TABLE social_accounts ADD COLUMN organization_id UUID;
        RAISE NOTICE '✓ Added organization_id column to social_accounts';
    END IF;
END $$;

-- Fix content_calendar table  
DO $$
BEGIN
    -- Add status column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_calendar' AND column_name = 'status') THEN
        ALTER TABLE content_calendar ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'planned' 
        CHECK (status IN ('planned', 'in_progress', 'ready', 'scheduled', 'published', 'cancelled', 'missed'));
        RAISE NOTICE '✓ Added status column to content_calendar';
    END IF;
    
    -- Add other essential columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_calendar' AND column_name = 'calendar_date') THEN
        ALTER TABLE content_calendar ADD COLUMN calendar_date DATE NOT NULL DEFAULT CURRENT_DATE;
        RAISE NOTICE '✓ Added calendar_date column to content_calendar';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_calendar' AND column_name = 'content_type') THEN
        ALTER TABLE content_calendar ADD COLUMN content_type VARCHAR(50) NOT NULL DEFAULT 'post' 
        CHECK (content_type IN ('post', 'story', 'video', 'live', 'campaign', 'email', 'ad', 'event', 'reminder'));
        RAISE NOTICE '✓ Added content_type column to content_calendar';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_calendar' AND column_name = 'target_platforms') THEN
        ALTER TABLE content_calendar ADD COLUMN target_platforms JSONB DEFAULT '[]';
        RAISE NOTICE '✓ Added target_platforms column to content_calendar';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_calendar' AND column_name = 'campaign_id') THEN
        ALTER TABLE content_calendar ADD COLUMN campaign_id UUID;
        RAISE NOTICE '✓ Added campaign_id column to content_calendar';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_calendar' AND column_name = 'assigned_to') THEN
        ALTER TABLE content_calendar ADD COLUMN assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL;
        RAISE NOTICE '✓ Added assigned_to column to content_calendar';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_calendar' AND column_name = 'organization_id') THEN
        ALTER TABLE content_calendar ADD COLUMN organization_id UUID;
        RAISE NOTICE '✓ Added organization_id column to content_calendar';
    END IF;
END $$;

-- Create essential indexes
CREATE INDEX IF NOT EXISTS idx_content_posts_status ON content_posts(status);
CREATE INDEX IF NOT EXISTS idx_content_posts_campaign_id ON content_posts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_content_posts_author_id ON content_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_content_posts_published_at ON content_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_content_posts_organization_id ON content_posts(organization_id);

CREATE INDEX IF NOT EXISTS idx_social_accounts_status ON social_accounts(status);
CREATE INDEX IF NOT EXISTS idx_social_accounts_platform ON social_accounts(platform);
CREATE INDEX IF NOT EXISTS idx_social_accounts_user_id ON social_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_organization_id ON social_accounts(organization_id);

CREATE INDEX IF NOT EXISTS idx_content_calendar_status ON content_calendar(status);
CREATE INDEX IF NOT EXISTS idx_content_calendar_date ON content_calendar(calendar_date);
CREATE INDEX IF NOT EXISTS idx_content_calendar_campaign_id ON content_calendar(campaign_id);
CREATE INDEX IF NOT EXISTS idx_content_calendar_assigned_to ON content_calendar(assigned_to);
CREATE INDEX IF NOT EXISTS idx_content_calendar_organization_id ON content_calendar(organization_id);

-- Verify all essential columns exist
DO $$
DECLARE
    missing_columns TEXT[] := '{}';
    check_table_name TEXT;
    check_column_name TEXT;
    tables_columns TEXT[][] := ARRAY[
        ['content_posts', 'status'],
        ['content_posts', 'campaign_id'],
        ['content_posts', 'author_id'],
        ['content_posts', 'content_type'],
        ['social_accounts', 'status'],
        ['social_accounts', 'platform'],
        ['social_accounts', 'user_id'],
        ['content_calendar', 'status'],
        ['content_calendar', 'calendar_date'],
        ['content_calendar', 'content_type']
    ];
    i INTEGER;
BEGIN
    RAISE NOTICE '=== VERIFICATION OF ESSENTIAL COLUMNS ===';
    
    FOR i IN 1..array_length(tables_columns, 1) LOOP
        check_table_name := tables_columns[i][1];
        check_column_name := tables_columns[i][2];
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = check_table_name AND column_name = check_column_name
        ) THEN
            missing_columns := array_append(missing_columns, check_table_name || '.' || check_column_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_columns, 1) > 0 THEN
        RAISE NOTICE '❌ Still missing columns: %', array_to_string(missing_columns, ', ');
    ELSE
        RAISE NOTICE '✅ All essential columns are present!';
    END IF;
    
    RAISE NOTICE '==========================================';
END $$; 