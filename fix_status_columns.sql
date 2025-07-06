-- ====================================================================
-- Fix Missing Status Columns
-- Task 65.1: Add status columns to existing content analytics tables
-- ====================================================================

-- Add status column to content_posts if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'content_posts' AND column_name = 'status'
    ) THEN
        ALTER TABLE content_posts 
        ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'draft' 
        CHECK (status IN ('draft', 'scheduled', 'publishing', 'published', 'failed', 'archived', 'review_pending', 'approved', 'rejected'));
        
        RAISE NOTICE 'Added status column to content_posts table';
    ELSE
        RAISE NOTICE 'Status column already exists in content_posts table';
    END IF;
END $$;

-- Add status column to social_accounts if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'social_accounts' AND column_name = 'status'
    ) THEN
        ALTER TABLE social_accounts 
        ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'disconnected' 
        CHECK (status IN ('connected', 'disconnected', 'error', 'syncing', 'expired', 'pending_approval'));
        
        RAISE NOTICE 'Added status column to social_accounts table';
    ELSE
        RAISE NOTICE 'Status column already exists in social_accounts table';
    END IF;
END $$;

-- Add status column to content_calendar if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'content_calendar' AND column_name = 'status'
    ) THEN
        ALTER TABLE content_calendar 
        ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'planned' 
        CHECK (status IN ('planned', 'in_progress', 'ready', 'scheduled', 'published', 'cancelled', 'missed'));
        
        RAISE NOTICE 'Added status column to content_calendar table';
    ELSE
        RAISE NOTICE 'Status column already exists in content_calendar table';
    END IF;
END $$;

-- Create indexes for the status columns if they don't exist
CREATE INDEX IF NOT EXISTS idx_content_posts_status ON content_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_accounts_status ON social_accounts(status);
CREATE INDEX IF NOT EXISTS idx_content_calendar_status ON content_calendar(status);

-- Verify the columns were added
DO $$
DECLARE
    content_posts_has_status BOOLEAN;
    social_accounts_has_status BOOLEAN;
    content_calendar_has_status BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'content_posts' AND column_name = 'status'
    ) INTO content_posts_has_status;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'social_accounts' AND column_name = 'status'
    ) INTO social_accounts_has_status;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'content_calendar' AND column_name = 'status'
    ) INTO content_calendar_has_status;
    
    RAISE NOTICE '=== STATUS COLUMN VERIFICATION ===';
    RAISE NOTICE 'content_posts.status: %', CASE WHEN content_posts_has_status THEN '✓ EXISTS' ELSE '✗ MISSING' END;
    RAISE NOTICE 'social_accounts.status: %', CASE WHEN social_accounts_has_status THEN '✓ EXISTS' ELSE '✗ MISSING' END;
    RAISE NOTICE 'content_calendar.status: %', CASE WHEN content_calendar_has_status THEN '✓ EXISTS' ELSE '✗ MISSING' END;
    RAISE NOTICE '================================';
END $$; 